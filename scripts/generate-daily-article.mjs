#!/usr/bin/env node
/**
 * Generates one FR/AR SEO-friendly health article per calendar day (Africa/Casablanca).
 * Appends to data/blogArticles.json (sorted newest-first by date).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-daily-article.mjs
 * Optional: OPENAI_MODEL=gpt-4o-mini (default)
 *
 * Intended for GitHub Actions cron + workflow_dispatch.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const jsonPath = path.join(root, "data", "blogArticles.json");

/** Must match images.unsplash.com pattern used by isValidImageUrl */
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

function todayCasablanca() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isValidSlug(s) {
  return typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 72;
}

function isValidImageUrl(url) {
  return (
    typeof url === "string" &&
    /^https:\/\/images\.unsplash\.com\/photo-\d/.test(url)
  );
}

function validateArticle(a, existingSlugs) {
  if (!isValidSlug(a.slug)) throw new Error("invalid slug format");
  if (existingSlugs.has(a.slug)) throw new Error(`slug already exists: ${a.slug}`);
  if (!isValidImageUrl(a.image)) throw new Error("image must be a images.unsplash.com URL");
  if (!a.title?.fr || !a.title?.ar) throw new Error("missing title.fr or title.ar");
  if (!a.excerpt?.fr || !a.excerpt?.ar) throw new Error("missing excerpt");
  if (!a.metaKeywords?.fr || !a.metaKeywords?.ar) throw new Error("missing metaKeywords");
  if (!Array.isArray(a.content?.fr) || a.content.fr.length !== 7)
    throw new Error("content.fr must be array of 7 strings");
  if (!Array.isArray(a.content?.ar) || a.content.ar.length !== 7)
    throw new Error("content.ar must be array of 7 strings");
  for (const p of [...a.content.fr, ...a.content.ar]) {
    if (typeof p !== "string" || p.trim().length < 40)
      throw new Error("each paragraph must be a substantial string");
  }
}

function pickFallbackImage(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return IMAGE_POOL[h % IMAGE_POOL.length];
}

async function generateWithOpenAI(openai, payload) {
  const { today, existingTitles, existingSlugsList, repairHint } = payload;

  const system = `You are a medical health education writer for Tabib.info (Morocco): bilingual French + Moroccan Arabic audience.
Rules:
- Topics: medicines, pharmacy literacy, prevention, chronic diseases, nutrition, vaccination, safe use of medication, polypharmacy, reading labels, generic vs brand when explained generally — vary angle each time.
- Tone: calm, practical, non-alarmist; align with mainstream public-health messaging.
- Always remind readers to consult a doctor or pharmacist for personal decisions; never give individualized dosing or diagnoses.
- Output JSON only (no markdown fences).
- metaKeywords: dense comma-separated phrases for SEO (15–25 tokens per language).
- content: exactly 7 paragraphs per language; paragraphs correspond loosely in meaning across FR and AR.
- French body may omit accents occasionally like existing site articles if natural.
- Arabic: clear standard Arabic suitable for health articles (Darija touches optional but keep clarity).`;

  const user = `Create ONE blog article object for publication date "${today}".

Existing French titles to avoid duplicating or overlapping closely:
${existingTitles.slice(-35).join("\n")}

Existing slugs (never reuse):
${existingSlugsList.join(", ")}

${repairHint ? `Fix validation error from previous attempt:\n${repairHint}\n` : ""}

Return a single JSON object with this shape:
{
  "slug": "ascii-kebab-case-topic-lowercase",
  "image": "https://images.unsplash.com/photo-DIGITS/STRING?auto=format&fit=crop&w=1200&q=80",
  "title": { "fr": "string", "ar": "string" },
  "excerpt": { "fr": "one sentence", "ar": "one sentence" },
  "metaKeywords": { "fr": "comma separated French SEO keywords", "ar": "Arabic keywords comma-separated" },
  "content": { "fr": ["p1","p2","p3","p4","p5","p6","p7"], "ar": ["p1",...,"p7"] }
}

Hard rules:
- slug unique, kebab-case, max 72 chars.
- image MUST be https://images.unsplash.com/photo-... with real parameters (use a plausible Unsplash medicine/wellness/pharmacy/lifestyle photo URL).
- Exactly 7 paragraphs in each language.
- metaKeywords rich for Google (include medicine/santé/Maroc style terms in FR).`;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await openai.chat.completions.create({
    model,
    temperature: 0.72,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("empty model response");
  return JSON.parse(raw);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing.");
    process.exit(1);
  }

  const articles = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const today = todayCasablanca();

  if (articles.some((a) => a.date === today)) {
    console.log(`Already have an article dated ${today}; skipping.`);
    process.exit(0);
  }

  const existingSlugs = new Set(articles.map((a) => a.slug));
  const existingTitles = articles.map((a) => a.title.fr);

  const openai = new OpenAI({ apiKey });

  let repairHint = "";
  let parsed = null;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      parsed = await generateWithOpenAI(openai, {
        today,
        existingTitles,
        existingSlugsList: [...existingSlugs],
        repairHint,
      });

      if (typeof parsed.slug === "string") {
        parsed.slug = parsed.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }

      parsed.date = today;

      if (!isValidImageUrl(parsed.image)) {
        parsed.image = pickFallbackImage(parsed.slug || "fallback");
      }

      validateArticle(parsed, existingSlugs);

      articles.push(parsed);
      articles.sort((a, b) => b.date.localeCompare(a.date));

      fs.writeFileSync(jsonPath, `${JSON.stringify(articles, null, 2)}\n`);
      console.log(`OK: added "${parsed.slug}" for ${today}`);
      process.exit(0);
    } catch (err) {
      repairHint = String(err?.message || err);
      console.warn(`Attempt ${attempt} failed:`, repairHint);
      if (attempt === 4) {
        console.error("Giving up after 4 attempts.");
        process.exit(1);
      }
    }
  }
}

main();
