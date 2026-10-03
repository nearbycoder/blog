---
title: "How Clank works: from a button click to a running app"
description: "A walk through Clank's internals: signals, typed actions, SQLite transactions, live queries, agent access, background jobs, and safe release activation."
date: "2026-10-03"
tags: ["clank", "typescript", "architecture", "opensource", "agents", "sqlite"]
readTime: "17 min read"
featured: false
accent: "lime"
draft: false
---

Clicking a checkbox is easy. Making that checkbox behave correctly across a browser, another open tab, an AI agent, and a server restart is where things get interesting.

That is a useful way to explain [Clank](https://clank.run), the TypeScript framework and application platform I am building. It brings the interface, server actions, authentication, database, live updates, and agent tools into one system. It also includes the machinery for packaging and running that application.

There is a lot behind that description. Rather than walk through a long list of features, I want to follow one small application: a private task list. We will load it, mark a task complete, watch another tab update, let an agent use the same action, and look at how a new version gets deployed.

You do not need to know Clank to follow along. I will explain the terminology as it comes up, and link to the implementation for the parts worth digging into.

## The pieces, before we follow a request

Clank has two broad responsibilities. The **framework** runs your application. The **deployment platform** manages where that application runs and which release is active.

Within the framework, a schema describes the data and accepted inputs. Queries read data; mutations change it. A browser client and an agent's tools can both call those functions. The interface has its own reactive runtime, and the server uses SQLite for application state.

The platform adds accounts, projects, release artifacts, secrets, persistent storage, and process or container supervision. An application user signing into a task list and a developer signing into the deployment console are interacting with separate authentication boundaries.

![A browser and an agent enter through their own authentication checks, call the same typed application action, commit a SQLite change, and deliver updated query results back to the browser.](/images/articles/clank-request-flow.svg)

_The common path through a Clank application. Agent access adds its own authorization checks before calling the application action._

The distinction helps when reading the repository: `backend.ts` is concerned with application data and functions; `platform.ts` is concerned with managing deployments. They solve different problems even though they ship in the same project.

## First, describe what a task actually is

The authenticated starter defines a task table like this:

```ts
export const schema = defineDatabase({
  todos: defineTable({
    title: s.string({ min: 1, max: 160 }),
    done: s.boolean(),
  })
    .owned()
    .index("by_done", ["done"]),
});
```

This is an excerpt from the [starter's backend](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/templates/auth-todo/src/backend.ts), where `defineDatabase`, `defineTable`, and `s` are imported from the framework.

The declaration does several jobs. TypeScript can infer the shape of a task. The server can validate a document at runtime. The database layer knows which index the application requested. The `.owned()` call asks Clank to scope those records to the authenticated user.

That last part is easy to underestimate. A task's owner is stored as framework metadata outside the application's JSON document. The normal scoped database API supplies and enforces ownership; the browser does not get to select an arbitrary owner by adding a field to its request.

This is a private-per-user model. A shared team board still needs an explicit membership and authorization design. Calling `.owned()` does not invent those product rules for you.

Clank stores validated documents as JSON in SQLite alongside metadata such as their IDs and versions. Declared fields can be indexed through SQLite expressions. The application gets a document-oriented API, while SQLite supplies transactions and persistence underneath it.

## A typed client still needs a skeptical server

The browser can create action references with:

```ts
import { createApi } from "@clank.run/framework";
import type { backend } from "./backend.ts";

const api = createApi<typeof backend>();
```

The `import type` disappears from the browser's JavaScript. It gives the editor enough information to check action names, arguments, and results without shipping the server implementation to the client or generating a separate client SDK.

For the task list, the editor can catch a misspelled action or an attempt to send a string where `done` expects a boolean. That is useful feedback during development.

It is not a security check. Anyone can construct an HTTP request without using that typed client. Clank therefore validates the incoming arguments again on the server and resolves the caller's identity before executing the function.

The same distinction applies to results. When an action declares a `returns` schema, Clank checks its result against that schema too. Even without one, results must be JSON-safe and fit the response-size limit. TypeScript helps during development; runtime checks inspect the value that actually came back.

## What happens when I mark a task complete

The starter's mutation is small enough to read in full as a definition inside its functions factory:

```ts
setDone: mutation({
  description: "Mark one todo complete or incomplete.",
  args: {
    id: s.id("todos"),
    done: s.boolean(),
    version: s.number({ integer: true, min: 1 }),
  },
  agent: { destructive: false, idempotent: true },
  handler: ({ db }, { id, done, version }) =>
    db.table("todos").patch(id, { done }, { ifVersion: version }),
}),
```

There are three details doing real work here.

First, the ID is associated with the `todos` table in the type contract; the database operation still has to find an accessible record. Second, the caller sends the desired state, such as `done: true`, rather than asking the server to blindly flip a boolean. Third, the caller includes the document version it saw.

Imagine two tabs both read version 7. The first saves a change and advances the document version. The second then submits its stale version-7 edit. The `ifVersion` condition lets the database reject that stale write instead of silently overwriting the newer record. The UI can refresh and let the person decide what to do next.

The `idempotent` annotation describes the action's intent to agent clients. It is not a universal duplicate-request ledger. In particular, repeating the exact request with an old version can produce a conflict. Metadata does not replace the mutation's actual concurrency behavior.

Underneath the handler, the database opens a `BEGIN IMMEDIATE` transaction. In plain language, SQLite claims the write transaction before the mutation starts changing records. Clank validates the changes and any declared output contract. When records change, it advances the persisted database revision and records the change journal inside that transaction. A write that changes nothing does not create a new revision.

Only then does it commit. If the handler throws—or returns something that violates its declared output schema—the database changes roll back. Readers should not receive a notification for a write that never became durable.

The handler is synchronous. That boundary matters: holding a SQLite write transaction open while waiting on an email API would make every other writer wait on that network call too. Longer work belongs outside this transaction, which is where jobs come in later.

## How the other tab finds out

Saving the row is half the work. The other open tab still has an old task list on its screen.

Clank's live queries keep track of the data they read. A query can depend on a document, a table, and an owner scope. When a committed change intersects those dependencies, the backend invalidates the affected cached result and evaluates the query again.

This dependency tracking is deliberately conservative. A query that reads a user's task table can be invalidated by a relevant change anywhere in that owned table; Clank is not promising a perfect subscription to every possible SQL predicate. Some extra query work is preferable to leaving a stale result on the screen.

The browser receives updated snapshots through **Server-Sent Events**, using the browser's `EventSource` API. That is a persistent connection carrying messages from the server to the browser. Regular mutations still travel to the server through the request API. The live-query path does not need a bidirectional WebSocket for every interaction.

Each snapshot has a revision. The initial server-rendered page can seed the browser with data and its revision, and subsequent live snapshots advance that view.

The journal is persisted in SQLite, so another process using the same database can catch up with committed changes. If it has fallen behind beyond the retained journal history, the safe response is broader invalidation and a fresh read. A missed piece of history should cost some extra work rather than silently break correctness.

There is an equally important identity boundary. Query caching is partitioned by authentication context, including the session, and owned reads retain their owner scope. Two people calling `todos.list` are not interchangeable cache users. Authentication changes also enter the revision system, allowing affected live streams to close and reconnect with current permissions.

The [backend implementation](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/backend.ts) is where these database, cache, identity, and subscription paths meet.

## How a changed result becomes a changed screen

Clank uses TSX, but its runtime is its own signal system and DOM renderer. A **signal** is a value that records which computations read it. A **computed value** derives something from other reactive values.

Here is a small local example:

```tsx
/* @clankImportSource @clank.run/framework */
import { computed, signal } from "@clank.run/framework";

export function CompletionButton() {
  const done = signal(false);
  const label = computed(() => (done.value ? "Done" : "Mark complete"));

  return (
    <button
      type="button"
      onClick={() => {
        done.value = !done.value;
      }}
    >
      {label.value}
    </button>
  );
}
```

This example only changes local state. The task application's real button calls the server mutation we just followed.

During compilation, Clank turns dynamic TSX expressions into reactive bindings. Reading `done.value` while calculating the label registers a dependency. Changing the signal invalidates that calculation; the binding updates the existing text node when it runs again.

There is no need to reconstruct the whole component tree for that text change. The static structure was mounted once. Text, attributes, and controlled regions have their own smaller update paths.

Lists need more bookkeeping. Clank's `For` uses stable keys to match rows across updates. Retained rows keep their DOM and reactive row bindings; removed rows are disposed; new rows mount; reordered rows move. A changed task title should not require rebuilding every neighboring input.

Cleanup has its own ownership tree. When a component unmounts, its effects, event handlers, nested mounts, and other owned resources can be disposed together. This matters in an app you leave open for hours: a view that disappeared should not leave its subscriptions working forever.

Async work has a different hazard. If an old search finishes after a new search, it must not overwrite the newer result. Clank's resources and route loaders combine cancellation with a run revision check. Even if the underlying promise ignores cancellation, its stale completion can be discarded.

Those mechanisms live in the [reactive core](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/core.ts) and [DOM renderer](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/dom.ts).

## The first page load and the component library

On the first request, the server resolves the session, reads the initial tasks, and renders HTML from the component tree. It also serializes the initial authentication and query state for the browser.

**Hydration** is the step that makes that server-produced HTML interactive. Clank emits markers around dynamic regions and keyed lists, then uses them to attach bindings to the existing nodes. A mismatch can trigger a warning and a controlled remount; preserving nodes is a behavior to verify, not a reason to ignore differing server and browser output.

The starter also applies a Content Security Policy using a per-response nonce: a fresh token that authorizes the scripts included in that response. It safely serializes its boot state and marks the personalized HTML as non-cacheable. Those details belong alongside rendering because a fast initial page is not useful if it exposes another person's state.

For more involved controls, Clank includes a headless UI library. “Headless” means it supplies behavior and DOM properties while the application supplies the visual styling. If deleting a task needs confirmation, a dialog controller coordinates opening, closing, labels, keyboard handling, and focus; the app decides its spacing and colors.

The [Design Studio](https://design.clank.run) makes those controls tangible. The cover image for this post shows that workshop. It is built with Clank's own primitives, so you can try the controls rather than infer their behavior from an API table.

## Where the agent enters

An agent usually needs a description of what the application can do, the arguments each operation accepts, and a way to call it. Clank exposes eligible application actions through **MCP**, the Model Context Protocol.

The task app already has `todos.list`, `todos.add`, and `todos.setDone`. Clank can derive tool definitions from their schemas and metadata, and publish portable tool names such as `todos_setDone`. It retains the original action path as metadata.

The agent reaches an app-specific endpoint, normally `/__clank/mcp`. For this authenticated task app, the app owns its OAuth issuer and authorization boundary. OAuth gives the client a delegated credential; PKCE binds the authorization exchange to the client that started it. Scopes and grants constrain what that credential can do. Queries require `agent:read`; mutations require `agent:write`. A read-only grant hides mutation tools and rejects attempts to call them.

Authentication is a configuration choice, not something inferred from exposing tools. A backend without an auth definition exposes public MCP by default. That distinction matters when turning a demo into a private application.

Discovering a tool does not grant permission to execute it. The MCP layer checks the caller and requested capability, then invokes the application's backend action with the corresponding authorization context. Runtime argument validation and owned data access still apply.

This is the part of the design I want to keep coherent: a person clicking “Complete” and an authorized agent calling `todos_setDone` should arrive at the same business operation. The transport and credentials differ, but the application should not need a second implementation of what completing a task means.

That does not make arbitrary application policy automatic. If completing a task requires team membership or a particular role, that policy needs to be expressed and enforced. Descriptions and annotations help clients understand an action; executable checks decide whether it may run.

The UI can also identify its action explicitly. In the starter, the complete button carries `agentAction={api.todos.setDone}` plus a stable semantic ID and label. That association gives inspection and contract checks a way to compare the visible control with the advertised backend capability. It does not mean an agent reads arbitrary button text and magically gains access.

Clank also computes a contract revision from tool-facing details such as names, schemas, descriptions, scopes, and annotations. Clients can detect a changed action catalog instead of continuing indefinitely with an old understanding of the app. The [MCP implementation](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/mcp.ts) and backend wiring show both sides of that boundary.

## Background work without losing the handoff

Suppose creating a task should start some background processing. Saving the task and separately publishing a queue message creates a familiar failure window: the database commit succeeds, the process crashes, and the message never gets sent.

Clank's job queue lives in the same application SQLite database. The starter's `add` mutation inserts a task and enqueues its creation job inside the same transaction. Both become durable together, or neither does. This is the **transactional outbox** pattern: the handoff is a database fact before a worker tries to act on it.

The starter's job only looks up the committed task and logs that it was processed. An application can use the same arrangement for useful work such as preparing a report or calling an external service.

A worker claims a job with a time-limited lease and renews it while working. A claim carries a token and worker identity. Completing or retrying the job must match that claim, which prevents an expired worker from declaring success after another worker has taken over.

This is not an exactly-once promise for the outside world. If an email is sent and the worker crashes before recording completion, a retry may send it again. External operations still need their own idempotency keys or duplicate protection. The queue protects the durable handoff and claim lifecycle; it cannot roll back an email provider.

Web requests, workers, and cron scheduling can run as separate operating-system processes. They share durable coordination through the application database rather than depending on one process's in-memory timers.

There is a related primitive for stateful operations: **durable objects**. A named object ID owns state and serialized operations. Calls for one ID enter a local queue and acquire a database lease; settlement checks the lease and revision before committing. It is useful when a room, counter, or other entity needs coordinated updates.

That coordination still belongs to the shared SQLite storage boundary. It is not a multi-region consensus system. The [jobs](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/jobs.ts) and [durable-object](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/durable-objects.ts) implementations make those tradeoffs visible.

## Where task attachments live

A task might also have a screenshot or PDF attached. Clank handles those bytes through managed buckets, while SQLite keeps the file catalog: owner, key, size, content type, and checksum.

The application declares which files are allowed and how much storage each bucket and user can consume. Pending uploads reserve capacity too, so simultaneous uploads cannot each spend the same remaining allowance. User-owned buckets resolve keys inside the caller's partition.

The browser receives a short-lived signed permission for a particular upload or private read. Large uploads can resume through chunks whose offsets are checked against stored progress. Underneath, the object store can write to a local directory or an S3-compatible service. Changing that storage adapter does not remove the ownership, validation, or quota checks; those belong to Clank's [managed file layer](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/buckets.ts).

## Building and shipping the application

Clank's build starts with its TSX compiler. It lowers element syntax and reactive expressions, then uses Node's TypeScript transformation API to remove TypeScript syntax. Local import suffixes become JavaScript paths, and the output includes source maps.

The normal framework build preserves module boundaries instead of bundling everything into one opaque file. The browser can load the resulting modules through ordinary module imports and the application's import map.

The framework package declares no npm dependencies, development dependencies, or peer dependencies. That is a scope statement about the package, not a claim that operating a product requires no tools. Tailwind styling, browser verification, TypeScript checking, and container hosting can introduce optional tooling. The source snapshot used here declares Node `>=22.16 <26` as its supported engine range.

Deployment adds another sequence around the build:

1. **Package:** normalize the deployment configuration, run the build, and collect the allowed files into a deterministic artifact with hashes.
2. **Verify:** the platform checks the upload and prepares a release directory. The artifact includes the framework version it needs.
3. **Prepare data:** take the appropriate backup and apply ordered, recorded migrations when the release requires them.
4. **Start a candidate:** launch the new release with its configured environment and persistent data access.
5. **Check health:** wait for the candidate to pass its readiness checks.
6. **Activate:** switch the active release only after those steps succeed.

The release's application files and its persistent data have separate lifecycles. Replacing a code directory should not replace the task database.

For supported code-only rolling updates, the previous web process can continue serving while its background processes stop taking new work and finish active work, and the candidate starts. A migration that needs exclusive access takes a maintenance path instead. “There is a rollback command” should not be confused with “every schema change is safe to deploy without interruption.”

On a failed migration or candidate activation, the platform follows recovery paths for the previous release and database snapshot. Successful recovery still depends on the storage and hosting arrangement, which is why backup and restore behavior deserves its own testing.

The [artifact code](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/deploy.ts) and [platform implementation](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/src/platform.ts) contain these mechanics.

## Hosting and App Studio have explicit boundaries

Running a trusted application as a child process on your own host is one deployment arrangement. Running mutually untrusted applications requires a stronger isolation boundary. Clank distinguishes those profiles. With `NODE_ENV=production`, its packaged setup defaults to an isolated runner configuration using containers.

Its provider interface separates the platform's deployment decisions from the work of starting processes and containers on a particular host. Each deployment operation carries a version and a time-limited claim. The provider checks those before accepting completion, so an old worker cannot overwrite the result of a newer deployment.

For application data, SQLite's placement constraint remains important. Several local processes can coordinate over the same supported durable volume. Copying a database onto several unrelated servers does not turn it into a distributed database. Stateful placement, backups, and recovery need to respect where that authoritative data lives.

The conversational App Studio builds on those application definitions. It can turn an application request into a structured proposal and generated project, including a schema, ownership rules, action definitions, and tests as well as visible screens. Custom business logic may still need implementation; generating files is not proof that an application is finished.

Its compose workflow makes approval specific. The approved proposal identifies the target project, generated plan, and hashes of the files before and after the change. A hash is a fingerprint of a file's contents. If the relevant files change after review, the old approval is stale and cannot authorize a different edit. You can inspect that mechanism in the [compose implementation](https://github.com/nearbycoder/clank.run/blob/d6baafca5016c66641baf3ecedcd5e59657242fa/scripts/cli-compose.mjs).

I think this is where readable contracts pay off twice. A developer can inspect them to understand the application. An agent can use them to propose or exercise capabilities with less guesswork. Neither replaces checking whether the resulting product implements the rules its users actually need.

## What I would evaluate before adopting it

Clank puts a substantial amount of application behavior in one repository. That makes the path from a button to a transaction to a tool call unusually inspectable. It also gives the framework a substantial maintenance responsibility: renderer behavior, authentication, storage, jobs, and deployment all need to remain correct together.

For a real application, I would start with concrete questions. Does per-user ownership fit the data model, or do I need shared tenancy? How much write contention will one SQLite placement see? Which external effects need idempotency? What happens when a session is revoked while a tab stays open? Can I restore the actual backup onto the environment I intend to use?

I would also test the small interaction we started with. Change a task in one tab. Observe another tab. Repeat through an authorized agent. Attempt a stale write. Restart the process. Those are different ways to test whether the contracts agree about the same record.

That agreement is the part of Clank I find most interesting. A complete button, a live query, a background job, and an MCP tool are connected pieces of one application. Understanding their boundaries makes the framework easier to reason about—and makes its limitations easier to see.

You can [browse the source](https://github.com/nearbycoder/clank.run), [read the guides](https://docs.clank.run), try the [Design Studio](https://design.clank.run), or start with the shorter [Clank project overview](/projects/clank-run).

_Implementation note: this walkthrough follows [commit d6baafc](https://github.com/nearbycoder/clank.run/tree/d6baafca5016c66641baf3ecedcd5e59657242fa), whose package version is 0.23.0, inspected on October 3, 2026. The code excerpts are drawn from or simplified from that snapshot. Clank is evolving, so check the documentation for the version you install._
