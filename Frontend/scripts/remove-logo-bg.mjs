import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PNG } from "pngjs";

const dir = "public/brand";

function isBlackBg(r, g, b) {
  if (b >= 35 && b > r + 8) return false;
  if (r >= 70 && g >= 45) return false;
  return r < 28 && g < 28 && b < 28;
}

function makeTransparent(name) {
  const src = join(dir, name);
  const backup = join(dir, name.replace(".png", "-black.png"));
  if (!existsSync(backup)) copyFileSync(src, backup);

  const png = PNG.sync.read(readFileSync(src));
  const { data, width, height } = png;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBlackBg(r, g, b)) {
      data[i + 3] = 0;
    } else {
      const brightness = (r + g + b) / 3;
      if (brightness < 36 && b < 40 && r < 40) {
        data[i + 3] = Math.max(0, Math.min(255, Math.round((brightness - 8) * 12)));
      }
    }
  }

  writeFileSync(src, PNG.sync.write(png));
  console.log(name, width, height);
}

makeTransparent("logo-wordmark.png");
makeTransparent("logo-mark.png");
console.log("done");
