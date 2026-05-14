#!/usr/bin/env node
/**
 * Replace blog cover URLs that do not load (HTTP non-200) with curated pool images.
 * Run: node scripts/repair-blog-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "data", "blogArticles.json");

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505576633757-0ac1084af824?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
];

function pickFallbackImage(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return IMAGE_POOL[h % IMAGE_POOL.length];
}

async function imageStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

const articles = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let updated = 0;

for (const article of articles) {
  const status = await imageStatus(article.image);
  if (status === 200) continue;
  const next = pickFallbackImage(article.slug);
  console.log(`Fix ${article.slug}: ${status} -> ${next}`);
  article.image = next;
  updated++;
}

fs.writeFileSync(jsonPath, `${JSON.stringify(articles, null, 2)}\n`);
console.log(`Updated ${updated} article image(s).`);
