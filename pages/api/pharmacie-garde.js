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

  // Don't match inside <style> or <script>
  const body = removeStyleAndScript(html);

  // Split by pharmacy card: each card starts with <a href="...pharmacie/.../pharmacie-xxx--id"
  // so we extract blocks in source order and parse name/address/phone/maps from each block only
  const cardStartRegex = /<a\s+href="(https:\/\/www\.med\.ma\/pharmacie\/[^"]+|\/pharmacie\/[^/]+\/pharmacie-[^"]+--\d+)"[^>]*>/gi;
  const cardStarts = [];
  let m;
  while ((m = cardStartRegex.exec(body)) !== null) {
    if (!/pharmacie-[^/]*--\d+/.test(m[1])) continue;
    cardStarts.push({ index: m.index, href: m[1] });
  }
  // Dedupe consecutive same href (same card can have main link + "Voir fiche" link)
  const dedupedStarts = [];
  for (let i = 0; i < cardStarts.length; i++) {
    const curr = cardStarts[i];
    const prev = dedupedStarts[dedupedStarts.length - 1];
    if (prev && prev.href === curr.href && curr.index - prev.index < 1500) continue;
    dedupedStarts.push(curr);
  }
  const cardStartsFinal = dedupedStarts;
  for (let i = 0; i < cardStartsFinal.length; i++) {
    const linkStart = cardStartsFinal[i].index;
    const href = cardStartsFinal[i].href;
    const blockEnd = i + 1 < cardStartsFinal.length ? cardStartsFinal[i + 1].index : body.length;
    const block = body.slice(linkStart, blockEnd);
    // Link content is between <a...> and </a>; phone and maps appear after </a> in the same card
    const linkEnd = block.indexOf("</a>");
    const linkContent = linkEnd >= 0 ? block.slice(0, linkEnd) : block;
    const afterLink = linkEnd >= 0 ? block.slice(linkEnd + 4) : "";
    const nameRegex = /list__label--name[^>]*>([\s\S]*?)<\/div>/i;
    const adrRegex = /list__label--adr[^>]*>([\s\S]*?)<\/div>/gi;
    const nameMatch = nameRegex.exec(linkContent);
    let name = nameMatch ? stripHtml(nameMatch[1]).trim() : "";
    if (!name && linkContent) {
      const raw = stripHtml(linkContent).replace(/\s+Maroc\s+Garde\s+(24\/24|Jour|Nuit)\s*$/i, "").trim();
      if (raw && !looksLikeCssOrGarbage(raw)) name = raw.slice(0, 120);
    }
    const adrMatches = [];
    let adrM;
    while ((adrM = adrRegex.exec(linkContent)) !== null) {
      let adr = stripHtml(adrM[1]).replace(/\s*Garde\s+(24\/24|Jour|Nuit)\s*$/i, "").trim();
      if (adr && !/^Garde\s+(Jour|Nuit|24\/24)\s*$/i.test(adr) && !looksLikeCssOrGarbage(adr)) adrMatches.push(adr);
    }
    const address = adrMatches[0] || "";
    // Phone and maps appear after the closing </a> of this card
    const phoneInBlock = afterLink.match(phoneRegex);
    const mapsInBlock = afterLink.match(mapsRegex);
    const phone = phoneInBlock ? phoneInBlock[0].trim().replace(/\s/g, ".") : "";
    const mapsUrl = mapsInBlock ? mapsInBlock[0] : "";
    const profileUrl = href.startsWith("http") ? href : "https://www.med.ma" + href;
    // Only add if we got a name (from list__label--name or link text) or at least address/phone
    if (name || address || phone) {
      pharmacies.push({
        name: name || (address ? address.slice(0, 50) : "Pharmacie"),
        address: address || "",
        phone,
        mapsUrl: mapsUrl || "",
        profileUrl
      });
    }
  }

  if (pharmacies.length > 0) return pharmacies;

  // Legacy: Med.ma list__label--name and list__label--adr (when card split fails)
  const nameRegex = /list__label--name[^>]*>([\s\S]*?)<\/div>/gi;
  const adrRegex = /list__label--adr[^>]*>([\s\S]*?)<\/div>/gi;
  const names = [];
  const adrBlocks = [];
  let m2;
  while ((m2 = nameRegex.exec(body)) !== null) {
    const name = stripHtml(m2[1]);
    if (!looksLikeCssOrGarbage(name)) names.push(name);
  }
  while ((m2 = adrRegex.exec(body)) !== null) {
    let adr = stripHtml(m2[1]);
    adr = adr.replace(/\s*Garde\s+(24\/24|Jour|Nuit)\s*$/i, "").trim();
    if (adr && !/^Garde\s+(Jour|Nuit|24\/24)\s*$/i.test(adr) && !looksLikeCssOrGarbage(adr)) adrBlocks.push(adr);
  }
  const phones = body.match(phoneRegex) || [];
  const mapsUrls = body.match(mapsRegex) || [];
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
  // Med.ma URLs: /pharmacie/casablanca/pharmacie-de-la-bourse--43618
  let linkMatches;
  const linkRegex = /<a\s+href="(https:\/\/www\.med\.ma\/pharmacie\/[^"]+|\/pharmacie\/[^/]+\/pharmacie-[^"]+--\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const allLinks = [];
  while ((linkMatches = linkRegex.exec(body)) !== null) {
    const href = linkMatches[1];
    let text = linkMatches[2];
    if (/pharmacie-[^/]*--\d+/.test(href) && (text.includes("Garde") || /Pharmacie\s+/i.test(text))) {
      text = stripHtml(text);
      const nameAddress = text.replace(/\s+Maroc\s+Garde\s+(24\/24|Jour|Nuit)\s*$/i, "").trim();
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
const MAX_PAGES = 100;

/** Fetch one page; page 0 = first (no segment), page 1 = /1, page 2 = /2, ... */
async function fetchPage(citySlug, pageIndex) {
  const path = pageIndex === 0 ? `/${citySlug}` : `/${citySlug}/${pageIndex}`;
  const url = `${MED_MA_BASE}${path}`;
  const response = await fetch(url, { headers: FETCH_HEADERS });
  if (!response.ok) return { html: null, url };
  const html = await response.text();
  return { html, url };
}

/** Dedupe by phone (keep first); if no phone use profileUrl or name+address so we don't drop all pharmacies without phone */
function dedupePharmacies(pharmacies) {
  const seen = new Set();
  return pharmacies.filter((p) => {
    const phoneKey = (p.phone || "").replace(/\D/g, "");
    const key = phoneKey || p.profileUrl || `${(p.name || "").slice(0, 50)}|${(p.address || "").slice(0, 80)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Parse lat/lng from a Google Maps URL when possible.
 * Supports: q=lat,lng | /@lat,lng | 3d=lat&4d=lng | !3d...!4d... in hash or path
 * @returns {{ lat: number, lng: number } | null}
 */
function parseCoordsFromMapsUrl(mapsUrl) {
  if (!mapsUrl || typeof mapsUrl !== "string") return null;
  try {
    const url = new URL(mapsUrl);
    const q = url.searchParams.get("q");
    if (q) {
      const parts = q.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        const lat = parts[0];
        const lng = parts[1];
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
      }
    }
    // med.ma "Itinéraire" links: ?saddr=&daddr=lat,lng
    const daddr = url.searchParams.get("daddr");
    if (daddr) {
      const parts = daddr.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        const lat = parts[0];
        const lng = parts[1];
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
      }
    }
    const d3 = url.searchParams.get("3d");
    const d4 = url.searchParams.get("4d");
    if (d3 != null && d4 != null) {
      const lat = parseFloat(d3);
      const lng = parseFloat(d4);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
        return { lat, lng };
    }
    // Path: /@lat,lng or /place/.../@lat,lng,zoom
    const pathMatch = url.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (pathMatch) {
      const lat = parseFloat(pathMatch[1]);
      const lng = parseFloat(pathMatch[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
        return { lat, lng };
    }
    // Hash or full URL: !3d33.573109!4d-7.589843 (common in shared Google Maps links)
    const fullUrl = url.href;
    const hashMatch = fullUrl.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (hashMatch) {
      const lat = parseFloat(hashMatch[1]);
      const lng = parseFloat(hashMatch[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
        return { lat, lng };
    }
  } catch (_) {}
  return null;
}

/** Geocode address in Morocco via Nominatim (rate-limited). Returns { lat, lng } or null. */
async function geocodeAddress(address, citySlug) {
  if (!address || typeof address !== "string") return null;
  const query = `${address.trim().slice(0, 100)}, Morocco`;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "ma");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "TabibApp/1.0 (pharmacie de garde)" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch (_) {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CITY_CENTERS = [
  { slug: "casablanca", lat: 33.5731, lng: -7.5898 },
  { slug: "rabat", lat: 34.0209, lng: -6.8416 },
  { slug: "marrakech", lat: 31.6295, lng: -7.9891 },
  { slug: "fes", lat: 34.0181, lng: -5.0078 },
  { slug: "agadir", lat: 30.4278, lng: -9.5981 },
  { slug: "tanger", lat: 35.7595, lng: -5.834 },
  { slug: "meknes", lat: 33.8935, lng: -5.5473 },
  { slug: "sale", lat: 34.0531, lng: -6.7983 },
  { slug: "kenitra", lat: 34.261, lng: -6.5792 },
  { slug: "oujda", lat: 34.6867, lng: -1.9114 },
  { slug: "nador", lat: 35.1682, lng: -2.9333 },
  { slug: "tetouan", lat: 35.5889, lng: -5.3626 },
  { slug: "el-jadida", lat: 33.2316, lng: -8.5004 },
  { slug: "safi", lat: 32.2994, lng: -9.2372 },
  { slug: "khouribga", lat: 32.8848, lng: -6.9013 },
  { slug: "settat", lat: 33.0015, lng: -7.6168 },
  { slug: "mohammedia", lat: 33.6874, lng: -7.3829 }
];

async function fetchCityPharmacies(citySlug) {
  const allPharmacies = [];
  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    const { html } = await fetchPage(citySlug, pageIndex);
    if (!html) break;
    const pagePharmacies = parsePharmaciesFromHtml(html);
    if (pagePharmacies.length === 0) break;
    allPharmacies.push(...pagePharmacies);
    if (pagePharmacies.length < 10) break;
  }
  const deduped = dedupePharmacies(allPharmacies);
  let enriched = deduped.map((p) => {
    const coords = parseCoordsFromMapsUrl(p.mapsUrl);
    return coords ? { ...p, lat: coords.lat, lng: coords.lng } : p;
  });
  const toGeocode = enriched
    .filter(
      (p) =>
        (p.lat == null || p.lng == null) &&
        (p.address || p.name) &&
        (p.address || p.name).trim().length > 8
    )
    .slice(0, 5);
  for (let i = 0; i < toGeocode.length; i++) {
    const p = toGeocode[i];
    const coords = await geocodeAddress(p.address || p.name, citySlug);
    if (coords) {
      enriched = enriched.map((ph) => (ph === p ? { ...ph, lat: coords.lat, lng: coords.lng } : ph));
    }
    await sleep(1200);
  }
  return enriched;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const latParam = req.query.lat;
  const lngParam = req.query.lng;
  const userLat = latParam != null ? parseFloat(latParam) : NaN;
  const userLng = lngParam != null ? parseFloat(lngParam) : NaN;
  const hasUserLocation =
    !Number.isNaN(userLat) &&
    !Number.isNaN(userLng) &&
    userLat >= -90 &&
    userLat <= 90 &&
    userLng >= -180 &&
    userLng <= 180;

  const cityParam = req.query.city;
  const citySlug = normalizeCitySlug(cityParam);

  if (hasUserLocation) {
    try {
      const withDist = CITY_CENTERS.map((c) => ({
        ...c,
        dist: distanceKm(userLat, userLng, c.lat, c.lng)
      }));
      withDist.sort((a, b) => a.dist - b.dist);
      const nearestSlugs = withDist.slice(0, 3).map((c) => c.slug);
      const seen = new Set();
      const merged = [];
      for (const slug of nearestSlugs) {
        const list = await fetchCityPharmacies(slug);
        for (const p of list) {
          const key = (p.phone || "").replace(/\D/g, "") || `${(p.name || "").slice(0, 40)}|${(p.address || "").slice(0, 40)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(p);
        }
      }
      const withDistanceKm = merged.map((p) => {
        const km = p.lat != null && p.lng != null ? distanceKm(userLat, userLng, p.lat, p.lng) : null;
        return { ...p, distanceKm: km };
      });
      withDistanceKm.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
      const top10 = withDistanceKm.slice(0, 10);
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
      return res.status(200).json({
        mode: "nearby",
        userCoords: { lat: userLat, lng: userLng },
        pharmacies: top10
      });
    } catch (err) {
      console.error("pharmacie-garde nearby error:", err);
      return res.status(500).json({
        error: "Failed to fetch nearby pharmacies",
        message: err.message
      });
    }
  }

  if (!citySlug) {
    return res.status(400).json({
      error: "Missing city or location",
      hint: "Use ?city=casablanca or ?lat=33.57&lng=-7.59"
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

    // Enrich with lat/lng when mapsUrl contains coordinates
    let enriched = pharmacies.map((p) => {
      const coords = parseCoordsFromMapsUrl(p.mapsUrl);
      return coords ? { ...p, lat: coords.lat, lng: coords.lng } : p;
    });

    // Geocode up to 10 pharmacies that still have no coords (Nominatim: 1 req/s, be gentle)
    const toGeocode = enriched
      .filter((p) => (p.lat == null || p.lng == null) && (p.address || p.name) && (p.address || p.name).trim().length > 8)
      .slice(0, 10);
    for (let i = 0; i < toGeocode.length; i++) {
      const p = toGeocode[i];
      const coords = await geocodeAddress(p.address || p.name, citySlug);
      if (coords) {
        enriched = enriched.map((ph) =>
          ph === p ? { ...ph, lat: coords.lat, lng: coords.lng } : ph
        );
      }
      await sleep(1200);
    }

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({
      city: citySlug,
      sourceUrl: firstPageUrl,
      sourceName: "med.ma",
      pharmacies: enriched
    });
  } catch (err) {
    console.error("pharmacie-garde API error:", err);
    return res.status(500).json({
      error: "Failed to fetch pharmacy data",
      message: err.message
    });
  }
}
