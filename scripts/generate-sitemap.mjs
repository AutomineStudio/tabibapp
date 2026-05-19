#!/usr/bin/env node
/**
 * Regenerate public/sitemap.xml from blogArticles.json + core pages.
 * Run: node scripts/generate-sitemap.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const articlesPath = path.join(root, "data", "blogArticles.json");
const outPath = path.join(root, "public", "sitemap.xml");

const SITE = "https://tabib.info";
const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  { loc: `${SITE}/`, changefreq: "weekly", priority: "1.0", lastmod: today },
  { loc: `${SITE}/blog`, changefreq: "weekly", priority: "0.9", lastmod: today },
  { loc: `${SITE}/chat`, changefreq: "weekly", priority: "0.8", lastmod: today },
  { loc: `${SITE}/about`, changefreq: "monthly", priority: "0.7", lastmod: today },
];

const articles = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
const blogPages = articles.map((a) => ({
  loc: `${SITE}/blog/${a.slug}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: a.date || today,
}));

const urls = [...staticPages, ...blogPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(outPath, xml);
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
