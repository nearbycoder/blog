import { site } from "../data/site";

const normalize = (href: string) => href.replace(/\/$/, "") || "/";
const destinations = [...site.nav, ...site.explore];

export interface SectionLink {
  href: string;
  label: string;
  note: string;
}

export interface Section {
  id: string;
  number: string;
  label: string;
  title: string;
  blurb: string;
  home: string;
  links: SectionLink[];
}

export const sections: Section[] = site.sections.map((section) => ({
  ...section,
  links: section.links.map((link) => {
    const match = destinations.find(
      (item) => normalize(item.href) === normalize(link.href),
    );
    if (!match)
      throw new Error(`Section link ${link.href} is not in site navigation`);
    // Keep the exact href from the navigation lists so every surface agrees.
    return { href: match.href, label: match.label, note: link.note };
  }),
}));

const matches = (pathname: string, href: string) => {
  const target = normalize(href);
  return pathname === target || pathname.startsWith(`${target}/`);
};

/** The section and link that own a path, e.g. /projects/agfs-dev → Workshop › Projects. */
export function locate(path: string) {
  const pathname = normalize(path);
  if (pathname === "/") return undefined;
  for (const section of sections) {
    const link = section.links.find((item) => matches(pathname, item.href));
    if (link) return { section, link };
  }
  return undefined;
}
