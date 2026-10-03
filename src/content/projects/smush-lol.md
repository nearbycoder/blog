---
title: "smush.lol"
summary: "An image workbench for resizing, converting, batch exporting, and editing images, with browser-only processing and an API for automation."
role: "Creator"
year: "2026"
createdAt: "2026-08-20"
stack: ["TypeScript", "Bun.Image", "Elysia", "WebAssembly", "Railway"]
link: "https://smush.lol"
githubLink: "https://github.com/nearbycoder/smush.lol"
image: "/images/projects/smush-lol.webp"
imageAlt: "The smush.lol editor showing its sample image converted to WebP, export settings, and the resulting file size."
imageCaption: "The live editor after converting its built-in sample image to WebP."
featured: false
accent: "lime"
draft: false
---

smush.lol is a no-account image workbench. Drop in a file, paste an image, use a public image URL, or start with the built-in sample, then resize, crop, rotate, and export it. The editor shows dimensions and file size alongside original, result, and comparison views, so you can see what an export changed before downloading it.

## From one image to a batch

Web, Email, and Lossless presets provide starting points for export settings. For more control, you can choose dimensions, adjust quality, set a target file size, and save named recipes in the browser. A batch queue supports multiple widths and formats from the same source, individual retries, configurable filenames, and ZIP downloads.

The workbench also includes background removal, watermarks, redaction, metadata inspection, and undo/redo. Additional tools create contact sheets, PDFs, favicon packs, social image sizes, tiles, and sprite sheets. Recipes retain settings without retaining the source images.

## Two processing paths

The server uses Bun.Image behind an Elysia API for image metadata, transformations, and JPEG, PNG, and WebP encoding. The browser interface is plain TypeScript and CSS. Uploaded images are processed in memory for the request, with no application storage of image files or metadata.

Browser-only mode keeps image bytes on the device. Local WebP and AVIF exports use WebAssembly codecs, while PNG and JPEG use browser encoders. Some editing tools also require local processing. This distinction matters because available controls differ between the server and browser paths; browser-only mode does not offer every server encoder option.

## Use it directly or automate it

The [live editor](https://smush.lol) is available alongside [API and MCP documentation](https://smush.lol/docs). Remote transformation URLs, upload endpoints, and MCP tools expose the conversion workflow to applications and agents. The repository includes the application, tests, container configuration, and deployment instructions.

The screenshot uses the app's own sample image and shows a completed conversion. Project details and the repository creation date come from [the public GitHub repository](https://github.com/nearbycoder/smush.lol).
