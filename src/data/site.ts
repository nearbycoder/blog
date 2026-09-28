export const site = {
  name: "Josh Hamilton",
  handle: "nearbycoder",
  title: "Josh Hamilton · Nearbycoder",
  description:
    "Member of Technical Staff @ Augment Code focused on resilient systems, pragmatic leadership, and building tools that keep teams shipping.",
  location: "Tulsa, Oklahoma",
  role: "Member of Technical Staff @ Augment Code",
  socials: [
    { label: "X", url: "https://twitter.com/nearbycoder" },
    { label: "GitHub", url: "https://github.com/nearbycoder" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/joshuahamilton1/" },
    { label: "Instagram", url: "https://www.instagram.com/nearbycoder/" },
  ],
  nav: [
    { label: "Start here", href: "/start-here" },
    { label: "About", href: "/about" },
    { label: "Articles", href: "/articles" },
    { label: "Projects", href: "/projects" },
    { label: "Layoff Log", href: "/layoff" },
    { label: "Uses", href: "/uses" },
  ],
  explore: [
    { label: "Desktop (experimental)", href: "/desktop" },
    { label: "Feeds", href: "/feeds/" },
    { label: "Technologies", href: "/technologies/" },
    { label: "Glossary", href: "/glossary/" },
    { label: "Search writing", href: "/search/" },
    { label: "Discover", href: "/discover/" },
    { label: "Archive", href: "/archive/" },
    { label: "Topics", href: "/topics/" },
    { label: "Follow along", href: "/subscribe" },
    { label: "Reading list", href: "/reading-list" },
    { label: "Lab", href: "/lab" },
    { label: "Now", href: "/now" },
    { label: "Postmortems", href: "/postmortems" },
  ],
  /**
   * The site's information architecture: three sections that group every
   * destination in `nav` and `explore`. Hrefs must match those lists exactly;
   * `src/lib/sections.ts` resolves labels from them and fails the build if a
   * link goes missing.
   */
  sections: [
    {
      id: "read",
      number: "01",
      label: "Read",
      title: "The notebook",
      blurb:
        "Essays on engineering, building with AI, and the human side of shipping software.",
      home: "/articles",
      links: [
        { href: "/start-here", note: "Curated paths for first-time readers" },
        { href: "/articles", note: "Every published story, newest first" },
        { href: "/topics/", note: "Writing grouped by subject" },
        { href: "/archive/", note: "The whole back catalogue by year" },
        { href: "/discover/", note: "Let the site pick your next read" },
        { href: "/search/", note: "Full-text search across posts" },
        { href: "/reading-list", note: "Stories you saved for later" },
        { href: "/glossary/", note: "Terms that come up a lot" },
      ],
    },
    {
      id: "workshop",
      number: "02",
      label: "Workshop",
      title: "The workshop",
      blurb:
        "Things I’ve built, the week-by-week log of building them, and honest notes on how they went.",
      home: "/projects",
      links: [
        { href: "/projects", note: "Shipped products and side projects" },
        { href: "/layoff", note: "A build a week after a layoff" },
        { href: "/lab", note: "Small experiments you can play with" },
        { href: "/postmortems", note: "What worked, what didn’t" },
        { href: "/technologies/", note: "Projects grouped by stack" },
      ],
    },
    {
      id: "about",
      number: "03",
      label: "About",
      title: "Off the page",
      blurb:
        "Who’s writing, what I’m up to lately, the tools on my desk, and how to follow along.",
      home: "/about",
      links: [
        { href: "/about", note: "Background and work history" },
        { href: "/now", note: "What I’m focused on lately" },
        { href: "/uses", note: "Hardware, software, and AI tools" },
        { href: "/subscribe", note: "New posts by email" },
        { href: "/feeds/", note: "RSS, JSON Feed, and OPML" },
      ],
    },
  ],
  hero: {
    title:
      "Member of Technical Staff @ Augment Code, loving husband, father of two girls.",
    subtitle:
      "I build resilient systems, write about the messy parts of shipping, and try to keep teams calm when things get noisy.",
    ctaPrimary: { label: "Read the latest", href: "/articles" },
    ctaSecondary: { label: "View projects", href: "/projects" },
  },
  newsletter: {
    title: "Stay in the loop",
    description:
      "Occasional notes on engineering leadership, reliability, and the craft of shipping thoughtful software.",
  },
  work: [
    {
      company: "Augment Code",
      role: "Member of Technical Staff",
      range: "2026 - current",
      accent: "cyan",
    },
    {
      company: "Token Terminal",
      role: "Staff Software Engineer",
      range: "2024 - 2026",
      accent: "cyan",
    },
    {
      company: "FireHydrant",
      role: "Staff Engineer",
      range: "2021 - 2024",
      accent: "amber",
    },
    {
      company: "Kodable",
      role: "Senior Engineer",
      range: "2020 - 2021",
      accent: "amber",
    },
    {
      company: "Tempest",
      role: "Lead Engineer",
      range: "2019 - 2020",
      accent: "rose",
    },
    {
      company: "Kazoo HR",
      role: "Lead Engineer",
      range: "2018 - 2019",
      accent: "mist",
    },
    {
      company: "Made By Munsters",
      role: "Full Stack Developer",
      range: "2016 - 2018",
      accent: "cyan",
    },
    {
      company: "Fabricut",
      role: "Web Developer",
      range: "2015 - 2016",
      accent: "amber",
    },
    {
      company: "Hostek",
      role: "Software Developer",
      range: "2013 - 2015",
      accent: "rose",
    },
  ],
};
