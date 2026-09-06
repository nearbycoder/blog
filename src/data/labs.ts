export const labs = [
  {
    slug: "roomba",
    project: "roomba-wars",
    title: "Program a Roomba",
    description:
      "Queue a few commands. Navigate the room. Learn why a tiny robot still needs a good plan.",
    kind: "Logic & movement",
  },
  {
    slug: "poll",
    project: "qikpoll",
    title: "Cast a local vote",
    description:
      "Explore the vote-and-results loop behind QikPoll, with a poll that belongs just to this tab.",
    kind: "State & feedback",
  },
  {
    slug: "agent",
    project: "soloagent",
    title: "Inside an agent loop",
    description:
      "Step through context, a tool call, a failure, and a review. See where the harness earns its keep.",
    kind: "Tools & decisions",
  },
] as const;
