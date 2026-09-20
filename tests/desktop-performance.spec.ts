import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import ts from "typescript";
import { desktopApps } from "../src/lib/desktop-apps";

const output = "dist";
const appStyle = new RegExp(
  `\\.(?:${desktopApps.map((app) => app.id).join("|")})-app\\b`,
);
const deferredChunk = new RegExp(
  `^desktop-(?:apps|app-style|arcade|ghostty|doom|snake|pong|puzzle|game-host|classics|${desktopApps.map((app) => app.id).join("|")})\\.`,
);

function source(asset: string) {
  return readFileSync(join(output, asset), "utf8");
}

function pageAssets(route: string) {
  return Array.from(
    source(route).matchAll(
      /(?:src|href)=["'](\/_astro\/[^"'?#]+\.(?:js|css))(?:[?#][^"']*)?["']/g,
    ),
    (match) => match[1],
  );
}

// Follow static imports, including re-exports, without counting dynamic imports.
// This counts shared dependencies even when HTML has no modulepreload for them.
function eagerAssets(roots: string[]) {
  const assets = new Set<string>();
  const visit = (asset: string) => {
    if (assets.has(asset)) return;
    assets.add(asset);
    if (!asset.endsWith(".js")) return;
    const module = ts.createSourceFile(
      asset,
      source(asset),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    for (const statement of module.statements) {
      if (
        !ts.isImportDeclaration(statement) &&
        !ts.isExportDeclaration(statement)
      )
        continue;
      const dependency = statement.moduleSpecifier;
      if (!dependency || !ts.isStringLiteral(dependency)) continue;
      expect(dependency.text, `Build dependency of ${asset}`).toMatch(/^[./]/);
      visit(
        posix.resolve(posix.dirname(asset), dependency.text).split(/[?#]/)[0],
      );
    }
  };
  roots.forEach(visit);
  return [...assets];
}

function bytes(assets: string[]) {
  return assets.reduce(
    (total, asset) => total + statSync(join(output, asset)).size,
    0,
  );
}

// Before this expansion: 65,547 B homepage / 76,938 B article direct JS+CSS.
// The article also statically imports 2,339 B of reading/notes storage code.
// Keep those original ceilings: current builds leave 2,071 B of headroom.
// These are uncompressed build bytes, independent of network speed and caching.
for (const [route, budget] of [
  ["index.html", 65_547],
  ["articles/gettting-started-with-react-and-vitejs/index.html", 79_277],
] as const) {
  test(`${route} stays within its pre-expansion JS/CSS budget`, () => {
    const assets = eagerAssets(pageAssets(route));
    expect(assets.length).toBeGreaterThan(0);
    expect(bytes(assets), assets.join("\n")).toBeLessThanOrEqual(budget);
    // The all-route test checks HTML URLs; this also catches desktop styles or
    // code accidentally merged into an otherwise shared blog asset.
    for (const asset of assets) {
      expect(posix.basename(asset), route).not.toMatch(/^desktop/);
      expect(source(asset), asset).not.toMatch(appStyle);
      expect(source(asset), asset).not.toContain("data-desktop-app-style");
    }
  });
}

test("desktop boot and each app retain separate bounded build payloads", () => {
  const boot = eagerAssets(pageAssets("desktop/index.html"));
  // Expanded shell measured 145,297 B; reserve about 12% for shell evolution.
  expect(bytes(boot)).toBeLessThanOrEqual(160 * 1024);
  for (const asset of boot) {
    expect(posix.basename(asset)).not.toMatch(deferredChunk);
    expect(source(asset), asset).not.toMatch(appStyle);
    expect(source(asset), asset).not.toMatch(
      /\b(?:AudioContext|OfflineAudioContext|WebAssembly)\b/,
    );
  }

  const chunks = readdirSync(join(output, "_astro"));
  const chunkFor = (id: string) => {
    const matches = chunks.filter(
      (file) => file.startsWith(`desktop-${id}.`) && file.endsWith(".js"),
    );
    expect(matches, `One independent chunk for ${id}`).toHaveLength(1);
    return `/_astro/${matches[0]}`;
  };
  // The loader costs 6,858 B including its style helper, excluding cached boot.
  const loader = eagerAssets([chunkFor("apps")]).filter(
    (asset) => !boot.includes(asset),
  );
  expect(bytes(loader)).toBeLessThanOrEqual(8 * 1024);
  for (const app of desktopApps) {
    const assets = eagerAssets([chunkFor(app.id)]);
    // Largest app at introduction: World Clock, 18,821 B with its shared helper.
    // Count static dependencies too, so moving code into a vendor file cannot
    // conceal growth. Shared loader + one app must remain below 32 KiB total.
    expect(bytes(assets), app.title).toBeLessThanOrEqual(24 * 1024);
  }
});

test("opening the desktop launcher starts no audio, WASM, or media downloads", async ({
  page,
}) => {
  const mediaRequests: string[] = [];
  page.on("request", (request) => {
    if (
      request.resourceType() === "media" ||
      /\.(?:wasm|wav|mp3|ogg|m4a|flac)(?:[?#]|$)/i.test(request.url()) ||
      /(?:js-dos|ghostty)/i.test(request.url())
    )
      mediaRequests.push(request.url());
  });
  await page.addInitScript(() => {
    const counters = { audio: 0, wasm: 0 };
    const globals = window as unknown as Record<string, unknown>;
    globals.__desktopBootResources = counters;
    for (const name of [
      "AudioContext",
      "webkitAudioContext",
      "OfflineAudioContext",
      "Audio",
    ]) {
      const original = globals[name];
      if (typeof original !== "function") continue;
      globals[name] = new Proxy(original, {
        construct(target, args, newTarget) {
          counters.audio++;
          return Reflect.construct(target, args, newTarget);
        },
      });
    }
    for (const method of [
      "compile",
      "compileStreaming",
      "instantiate",
      "instantiateStreaming",
    ] as const) {
      const original = WebAssembly[method];
      if (typeof original !== "function") continue;
      Object.defineProperty(WebAssembly, method, {
        configurable: true,
        writable: true,
        value: new Proxy(original, {
          apply(target, receiver, args) {
            counters.wasm++;
            return Reflect.apply(target, receiver, args);
          },
        }),
      });
    }
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await expect(page.locator("#desktop-launcher")).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Search applications and files" })
    .fill("sound");
  await expect(
    page
      .locator("[data-launcher-results]")
      .getByRole("button", { name: /Soundscapes/ }),
  ).toBeVisible();
  expect(mediaRequests).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        (window as unknown as Record<string, unknown>).__desktopBootResources,
    ),
  ).toEqual({ audio: 0, wasm: 0 });
});
