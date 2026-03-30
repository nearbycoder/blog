# nearbycoder.com

Personal site for Josh Hamilton (`nearbycoder`) built with Astro. The app combines a portfolio, writing hub, layoff-era build log, and a `/uses` page into one static site.

## What the app includes

- Home page with a hero, latest articles, selected projects, recent layoff-log entries, and work history
- Article index and article detail pages powered by Astro content collections
- Project index and project detail pages with external links and stack metadata
- Layoff log index grouped by week plus detail pages for each shipped build update
- About and Uses pages driven by local data files
- Global command palette (`Cmd/Ctrl + K`) for pages, articles, projects, and theme switching
- Light, dark, and system theme support
- Generated Open Graph images and decorative article card art SVG routes

## Stack

- Astro 6
- Tailwind CSS 4 via Vite
- React 19
- `astro:content` collections for structured Markdown content
- `astro-opengraph-images` for generated OG assets

## Content model

Most of the site is driven by content files and a couple of local data modules:

- `src/content/articles`
  Article posts with `title`, `description`, `date`, optional `publishedAt`, `tags`, `readTime`, `featured`, `accent`, and `draft`.
- `src/content/projects`
  Portfolio entries with `title`, `summary`, `role`, `year`, `stack`, optional `impact`, `link`, `githubLink`, `featured`, `accent`, and `draft`.
- `src/content/layoff`
  Weekly build-log entries with `title`, `summary`, `date`, optional `week` or `day`, `status`, `stack`, `repoUrl`, `siteUrl`, `accent`, and `draft`.
- `src/data/site.ts`
  Site metadata, navigation, socials, hero copy, newsletter copy, and work timeline.
- `src/data/uses.ts`
  The `/uses` page data for workstation, development, productivity, and AI tooling.

## Publishing behavior

- `draft: true` hides articles, projects, and layoff entries from the built site.
- Articles can be scheduled. In production, an article is published only when its `publishedAt` value is in the past, or when `date` is in the past if `publishedAt` is not set.
- In local development, scheduled articles are still visible so they can be previewed before launch.

## Important routes

- `/`
- `/about`
- `/articles`
- `/articles/[slug]`
- `/projects`
- `/projects/[slug]`
- `/layoff`
- `/layoff/[slug]`
- `/uses`
- `/og/site.svg`
- `/og/[slug].svg`
- `/card-art/[slug].svg`

## Local development

```sh
npm install
npm run dev
```

The dev server runs on `0.0.0.0:4321`.

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Start the local Astro dev server |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Run Astro CLI commands |

## Project structure

```text
/
├── public/                 # static assets, images, resume, favicon
├── src/
│   ├── components/         # shared UI components
│   ├── content/            # markdown content collections
│   ├── data/               # site metadata and uses-page data
│   ├── layouts/            # shared page layout
│   ├── lib/                # article helpers and SVG renderers
│   ├── pages/              # routes, including dynamic content pages and SVG endpoints
│   └── styles/             # global styles
├── astro.config.mjs
└── package.json
```

## Notes

- `easyaccessqr-com` is currently pinned to the top of the projects listing.
- The articles page has its own client-side search input in addition to the global command palette.
- Site metadata and canonical URL settings are configured for `https://nearbycoder.com`.
