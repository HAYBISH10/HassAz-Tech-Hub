import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

export function readJson(storePath, fallback) {
  if (!existsSync(storePath)) return fallback;
  try {
    return JSON.parse(readFileSync(storePath, "utf8") || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(storePath, value) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(value, null, 2));
}
