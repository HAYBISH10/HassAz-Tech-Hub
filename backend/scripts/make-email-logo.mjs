import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(root, "Frontend/public/brand/logo-mark.png");
const outBackend = join(root, "backend/assets/logo-email.png");
const outPublic = join(root, "Frontend/public/brand/logo-email.png");

if (!existsSync(src)) {
  throw new Error(`Missing ${src}`);
}

const buffer = await sharp(src)
  .resize(96, 96, { fit: "contain", background: { r: 244, g: 239, b: 228, alpha: 1 } })
  .flatten({ background: { r: 244, g: 239, b: 228 } })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

const { mkdir, writeFile } = await import("fs/promises");
await mkdir(dirname(outBackend), { recursive: true });
await writeFile(outBackend, buffer);
await writeFile(outPublic, buffer);
console.log("bytes", buffer.length);
