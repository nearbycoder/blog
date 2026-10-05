// Upload everything in media/ to the Cloudflare R2 bucket behind
// https://media.nerb.dev, keeping the same paths (media/videos/x.mp4 →
// /videos/x.mp4). Requires `npx wrangler login`. Pass file paths to upload
// only those, e.g. `npm run media:upload -- media/videos/games/jeste-trailer.mp4`.
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, join, relative } from "node:path";

const bucket = "nearbycoder-media";
const root = "media";
const types = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(root, { recursive: true })
      .map((file) => join(root, String(file)))
      .filter((file) => extname(file) in types);

for (const file of files) {
  const key = relative(root, file).split("\\").join("/");
  const type = types[extname(file)];
  if (!type) throw new Error(`Unsupported media type: ${file}`);
  console.log(`Uploading ${key}`);
  execFileSync(
    "npx",
    [
      "--yes",
      "wrangler",
      "r2",
      "object",
      "put",
      `${bucket}/${key}`,
      "--file",
      file,
      "--content-type",
      type,
      "--cache-control",
      "public, max-age=2592000",
      "--remote",
    ],
    { stdio: "inherit" },
  );
}
console.log(`Uploaded ${files.length} files to ${bucket}.`);
