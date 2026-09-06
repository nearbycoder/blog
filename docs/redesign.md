# Editorial redesign

## Audit and direction

The existing Astro site has articles, projects, a weekly layoff log, About, Uses, RSS, SVG artwork endpoints, automatic Open Graph images, theme selection, and keyboard search. Existing visuals use Instrument Serif, Space Grotesk, JetBrains Mono, cobalt on warm paper, thick rules, offset shadows, and registration marks. The old archive grid leaves gaps, detail-page headers reserve unused columns, search is unavailable by touch on small screens, and layoff search results are dropped by the grouping code.

The redesign preserves content, route slugs, navigation labels, the identity mark, publication filtering, analytics, RSS, and external destinations. It uses a contemporary editorial aesthetic built with Astro, native CSS, and existing Tailwind utilities. Design variance 7, motion intensity 4, visual density 3. Space Grotesk carries the display and body typography; JetBrains Mono identifies metadata. Cobalt remains the single interface accent, against cool paper and an equivalent charcoal dark theme. Motion provides entrance and interaction feedback and respects reduced-motion preferences.

The homepage prioritizes the latest article and selected projects. Article pages provide a reading column, heading navigation, sharing, and related reading. All page families share the same controls, spacing, typography, and focus treatment. Generated social images retain full post titles and are built as 1200 × 630 PNGs for crawler compatibility; legacy SVG routes remain available.

## Verification

- Production build: 59 HTML pages, including the new 404, with generated 1200 × 630 PNG social images.
- Browser coverage: every built page at 320, 390, 768, and 1440 px; no horizontal page overflow or JavaScript errors.
- All local links and image assets resolve, as do RSS and the social-image metadata URLs.
- Interaction checks cover combined article search and topic filters, empty states and reset, global search for layoff entries, keyboard navigation, Escape and focus restoration, mobile navigation, persistent themes, heading anchors, canonical link copying, and the custom 404.
- Axe checks cover 11 representative page families in both light and dark themes, plus the open mobile search dialog. The YouTube iframe's third-party contents are excluded; iframe titles are checked separately.
- Local mobile Lighthouse run: performance 100, accessibility 100, best practices 100, SEO 100. LCP 1.9 s, CLS 0, total blocking time 0 ms. These are local lab measurements, not production field metrics.

## Review gallery

- [Homepage, desktop](screenshots/home-desktop.png)
- [Homepage, mobile](screenshots/home-mobile.png)
- [Homepage, dark mode](screenshots/home-dark.png)
- [Article, dark mode](screenshots/article-dark.png)
- [Code blocks on mobile](screenshots/article-code-mobile.png)
- [Article archive](screenshots/articles.png)
- [Projects](screenshots/projects.png)
- [Uses](screenshots/uses.png)
- [Global search, dark mode](screenshots/search-dark.png)
- [Post social image](screenshots/social-post.png)

## Image maintenance

Original content images remain in `public/images`. The `images:optimize` script creates WebP versions in `public/images/optimized` before dev and production builds, so new local post images receive the same treatment. The original editorial illustration is `public/images/editorial-curiosity.webp`; it also supplies the social-card artwork. Page-specific social cards are rendered at build time by `src/lib/opengraph-renderer.js`. Existing `/og/*.svg` and `/card-art/*.svg` URLs remain available.

## Design review

All page families use shared light/dark tokens, one cobalt accent, a small corner-radius scale, the existing brand mark, and self-hosted fonts. New display copy uses the same sans-serif family, and authored Markdown remains intact. Decorative marquee, hard shadows, skewed panels, registration marks, and sparse archive gaps are removed. Focus styles, modal focus handling, reduced motion, mobile controls, empty states, and the 404 recovery path are covered. No route slugs or primary navigation labels changed.
