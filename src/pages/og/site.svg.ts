import { renderOgSvg } from "../../lib/og";
import { site } from "../../data/site";

export const prerender = true;

export async function GET() {
  const svg = renderOgSvg({
    title: site.title,
    description: site.description,
    eyebrow: site.handle,
    footer: `${site.role} - ${site.location}`,
    accent: "cyan",
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
