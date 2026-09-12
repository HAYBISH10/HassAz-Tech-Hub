import { readFileSync } from "fs";
import { PNG } from "pngjs";

const png = PNG.sync.read(readFileSync("public/brand/logo-wordmark.png"));
let transparent = 0;
let opaque = 0;
for (let i = 0; i < png.data.length; i += 4) {
  if (png.data[i + 3] === 0) transparent += 1;
  else opaque += 1;
}
console.log({
  width: png.width,
  height: png.height,
  transparent,
  opaque,
  corner: [...png.data.slice(0, 4)],
});
