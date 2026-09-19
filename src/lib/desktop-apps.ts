/** Small launcher metadata only. App implementations are imported after launch. */
export const desktopApps = [
  {
    id: "notes",
    title: "Notes",
    description: "A local notebook",
    subtitle: "A place for your thoughts",
    keywords: "write text notebook scratchpad documents",
    icon: "journal",
  },
  {
    id: "calculator",
    title: "Calculator",
    description: "Work it out",
    subtitle: "A little room for numbers",
    keywords: "math arithmetic numbers calculate",
    icon: "calculator",
  },
  {
    id: "sketchpad",
    title: "Sketchpad",
    description: "Draw something",
    subtitle: "Make your mark",
    keywords: "draw paint sketch canvas art image",
    icon: "palette",
  },
  {
    id: "focus",
    title: "Focus",
    description: "Make a little time",
    subtitle: "One thing at a time",
    keywords: "timer pomodoro clock countdown break",
    icon: "timer",
  },
] as const;
export type DesktopAppId = (typeof desktopApps)[number]["id"];
