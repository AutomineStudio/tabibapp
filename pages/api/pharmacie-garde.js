/**
 * Fetches pharmacie de garde data from med.ma for a given city.
 * Source: https://www.med.ma/pharmacie/garde-24-24/
 */
const MED_MA_BASE = "https://www.med.ma/pharmacie/garde-24-24";

/** Decode HTML entities first, then remove tags so output is plain text */
function stripHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove style and script blocks so we don't match CSS/JS that mentions list__label--name etc. */
function removeStyleAndScript(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
}

/** True if text looks like CSS or garbage, not a pharmacy name/address */
function looksLikeCssOrGarbage(text) {
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (t.length > 400) return true;
  if (/\{[^}]*\}/.test(t)) return true;
  if (/\.form-control|!important|padding:|margin:|font-size:|@media/.test(t)) return true;
  if (/^[.#\s{},:;]+$/.test(t)) return true;
  return false;
}

function normalizeCitySlug(input) {
  if (!input || typeof input !== "string") return null;
  const s = input.trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[àâ]/g, "a")
    .replace(/èéê/g, "e")
    .replace(/îï/g, "i")
    .replace(/ô/g, "o")
    .replace(/ùûü/g, "u")
    .replace(/[^a-z0-9-]/g, "");
  return s || null;
}

function parsePharmaciesFromHtml(html) {
  const pharmacies = [];
  const phoneRegex = /\+212[0-9.\s]{10,20}/g;
  const mapsRegex = /https:\/\/www\.google\.com\/maps\?[^"'\s<>]+/g;

  // Don't match inside <style> or <script> (CSS contains .list__label--name etc.)
  const body = removeStyleAndScript(html);

  // Med.ma uses list__label--name and list__label--adr; extract clean text from those
  const nameRegex = /list__label--name["\s>][^>]*>([\s\S]*?)<\/div>/gi;
  const adrRegex = /list__label--adr["\s>][^>]*>([\s\S]*?)<\/div>/gi;
  const names = [];
  const adrBlocks = [];
  let m;
  while ((m = nameRegex.exec(body)) !== null) {
    const name = stripHtml(m[1]);
    if (!looksLikeCssOrGarbage(name)) names.push(name);
  }
  while ((m = adrRegex.exec(body)) !== null) {
    const adr = stripHtml(m[1]);
    // Skip the block that is only "Garde 24/24" (type label) or looks like CSS
    if (adr && !/^Garde\s+(Jour|Nuit|24\/24)\s*$/i.test(adr) && !looksLikeCssOrGarbage(adr)) {
      adrBlocks.push(adr);
    }
  }

  const phones = body.match(phoneRegex) || [];
  const mapsUrls = body.match(mapsRegex) || [];

  // Build entries from list__label--name / list__label--adr (one name per pharmacy; address may be in adrBlocks)
  const count = Math.min(names.length, phones.length, mapsUrls.length);

  if (count > 0 && names.length > 0) {
    for (let i = 0; i < count; i++) {
      const name = (names[i] || "").trim();
      const address = (adrBlocks[i] != null ? adrBlocks[i] : names[i] || "").trim();
      pharmacies.push({
        name: name || address?.slice(0, 50) || "Pharmacie",
        address: address || name || "",
        phone: phones[i].trim().replace(/\s/g, "."),
        mapsUrl: mapsUrls[i],
        profileUrl: ""
      });
    }
    return pharmacies;
  }

  // Fallback: link-based extraction (strip HTML from link text)
  let linkMatches;
  const linkRegex = /<a\s+href="(https:\/\/www\.med\.ma\/pharmacie\/[^"]+|\/pharmacie\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const allLinks = [];
  while ((linkMatches = linkRegex.exec(body)) !== null) {
    const href = linkMatches[1];
    let text = linkMatches[2];
    if (/\/pharmacie-[^/]+--\d+/.test(href) && text.includes("Garde")) {
      text = stripHtml(text);
      const nameAddress = text.replace(/\s+Maroc\s+Garde\s+24\/24\s*$/, "").trim();
      allLinks.push({ href: href.startsWith("http") ? href : "https://www.med.ma" + href, nameAddress: stripHtml(nameAddress) });
    }
  }

  const fallbackCount = Math.min(allLinks.length, phones.length, mapsUrls.length);
  for (let i = 0; i < fallbackCount; i++) {
    const na = allLinks[i].nameAddress;
    pharmacies.push({
      name: na.split(/\s{2,}|  /)[0]?.trim() || na.slice(0, 50) || "Pharmacie",
      address: stripHtml(na),
      phone: phones[i].trim().replace(/\s/g, "."),
      mapsUrl: mapsUrls[i],
      profileUrl: allLinks[i].href
    });
  }

  return pharmacies;
}

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
};
const MAX_PAGES = 20;

/** Fetch one page; page 0 = first (no segment), page 1 = /1, page 2 = /2, ... */
async function fetchPage(citySlug, pageIndex) {
  const path = pageIndex === 0 ? `/${citySlug}` : `/${citySlug}/${pageIndex}`;
  const url = `${MED_MA_BASE}${path}`;
  const response = await fetch(url, { headers: FETCH_HEADERS });
  if (!response.ok) return { html: null, url };
  const html = await response.text();
  return { html, url };
}

/** Dedupe by normalized phone (keep first occurrence). */
function dedupePharmacies(pharmacies) {
  const seen = new Set();
  return pharmacies.filter((p) => {
    const key = (p.phone || "").replace(/\D/g, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cityParam = req.query.city;
  const citySlug = normalizeCitySlug(cityParam);
  if (!citySlug) {
    return res.status(400).json({
      error: "Missing or invalid city",
      hint: "Use query param: ?city=casablanca"
    });
  }

  try {
    const allPharmacies = [];
    let firstPageUrl = `${MED_MA_BASE}/${citySlug}`;

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
      const { html, url } = await fetchPage(citySlug, pageIndex);
      if (pageIndex === 0) firstPageUrl = url;
      if (!html) {
        if (pageIndex === 0) {
          return res.status(502).json({
            error: "Could not fetch data from source",
            status: 502,
            sourceUrl: url
          });
        }
        break;
      }
      const pagePharmacies = parsePharmaciesFromHtml(html);
      if (pagePharmacies.length === 0) break;
      allPharmacies.push(...pagePharmacies);
      if (pagePharmacies.length < 10) break;
    }

    const pharmacies = dedupePharmacies(allPharmacies);

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({
      city: citySlug,
      sourceUrl: firstPageUrl,
      sourceName: "med.ma",
      pharmacies
    });
  } catch (err) {
    console.error("pharmacie-garde API error:", err);
    return res.status(500).json({
      error: "Failed to fetch pharmacy data",
      message: err.message
    });
  }
}
