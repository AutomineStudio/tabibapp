/**
 * One-time migration: reads legacy data/blogArticles.js (JS array) and writes data/blogArticles.json
 * Run: node scripts/extract-blog-articles-to-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsPath = path.join(__dirname, "..", "data", "blogArticles.js");
const outPath = path.join(__dirname, "..", "data", "blogArticles.json");

const src = fs.readFileSync(jsPath, "utf8");
const marker = "export const blogArticles = ";
const startIdx = src.indexOf(marker);
if (startIdx === -1) throw new Error("export marker not found");

let i = startIdx + marker.length;
while (i < src.length && /\s/.test(src[i])) i++;
if (src[i] !== "[") throw new Error("expected opening [");

const bracketStart = i;
let depth = 0;
for (; i < src.length; i++) {
  const c = src[i];
  if (c === "[") depth++;
  else if (c === "]") {
    depth--;
    if (depth === 0) {
      const literal = src.slice(bracketStart, i + 1);
      const articles = new Function(`return ${literal}`)();
      fs.writeFileSync(outPath, `${JSON.stringify(articles, null, 2)}\n`);
      console.log(`Wrote ${articles.length} articles to ${outPath}`);
      process.exit(0);
    }
  }
}
throw new Error("unclosed array");
