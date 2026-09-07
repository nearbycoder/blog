# Article artwork and compact footer

The footer groups all destinations into Browse, Build & learn, Personal, and Elsewhere. Desktop shows four short navigation columns beside a smaller introduction; phones use two columns. Keyboard help shares the bottom utility row. Links remain visible and accessible without a nested scroll area or an extra disclosure step.

Every current article has its own cover in `src/data/article-artwork.json`. Sixteen original editorial illustrations replace the shared placeholder; eleven real product screenshots or photos remain. Generated scenes are illustrations, not documentary images of the author. Article cards, headers, and Open Graph images use the same registry. Header images have descriptive alternative text; linked-card images stay decorative to avoid repeating their adjacent titles.

Generated website assets are saved under `public/images/articles/` as optimized 1440-pixel WebP files. The complete prompts and output paths are recorded in `docs/article-artwork-prompts.json`. Generation used the built-in image-generation tool, with no external image service or runtime API calls. Full-resolution source PNGs remain in the original generated-image directory; deployed assets are checked into this repository.

For a new article, choose a unique cover and add its source and alt text to the registry. Keep product screenshots in the article body when they document the work. Tests reject repeated cover files, verify that cards and headers agree, and compare the image panel of article social previews. The existing route suite also verifies the resulting 1200×630 social images and local asset links.
