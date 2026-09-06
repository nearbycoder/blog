import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, statSync } from "node:fs";

const directory = "public/images";
mkdirSync(`${directory}/optimized`, { recursive: true });
for (const file of readdirSync(directory).filter((file) =>
  /\.(png|jpg|jpeg)$/.test(file),
)) {
  const source = `${directory}/${file}`;
  const output = `${directory}/optimized/${file.replace(/\.[^.]+$/, "")}.webp`;
  if (
    existsSync(output) &&
    statSync(output).mtimeMs >= statSync(source).mtimeMs
  )
    continue;
  await sharp(source)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
}
const portrait = `${directory}/portrait.webp`;
if (!existsSync(portrait)) {
  await sharp(`${directory}/0289d46e-a3de-4f6f-b593-d81393ec931e.png`)
    .resize(200, 200, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(portrait);
}
