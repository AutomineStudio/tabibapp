/**
 * Fetches pharmacie de garde 24/24 from med.ma only.
 * Source: https://www.med.ma/pharmacie/garde-24-24
 * City: med.ma city page (GET). Geolocation: full city pool sorted nearest first.
 */
const MED_MA_BASE = "https://www.med.ma/pharmacie/garde-24-24";
const MED_MA_GARDE = "Garde 24/24";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

/** med.ma field_gouvernorat_pharma values (national filter form) */
const MED_MA_CITY_IDS = {
  agadir: "9731",
  "al-hoceima": "9710",
  "al-kelaa-des-sraghna": "9716",
  azilal: "9703",
  "beni-mellal": "9704",
  benslimane: "14030",
  boujdour: "9728",
  boulemane: "9711",
  casablanca: "9701",
  chefchaouen: "9738",
  chichaoua: "9715",
  dakhla: "9730",
  "el-jadida": "9705",
  errachidia: "9721",
  "es-semara": "9729",
  essaouirra: "9717",
  fes: "9708",
  figuig: "9725",
  guelmim: "9732",
  ifrane: "9722",
  kenitra: "9698",
  khemisset: "9699",
  khenifra: "9723",
  khouribga: "9706",
  laayoune: "9727",
  larache: "9739",
  marrakech: "9714",
  meknes: "9720",
  mohammedia: "9702",
  nador: "9726",
  ouarzazate: "9718",
  oujda: "9724",
  rabat: "9694",
  safi: "9719",
  sale: "9695",
  sefrou: "9709",
  settat: "9707",
  "sidi-kacem": "9700",
  "sidi-slimane": "9697",
  "tan-tan": "9733",
  tanger: "9737",
  taounate: "9712",
  taroudannt: "9734",
  tata: "9735",
  taza: "9713",
  temara: "9696",
  tetouan: "9740",
  tiznit: "9736",
};

/** Approximate centers to pick the med.ma city (governorate) for geolocation. */
const CITY_CENTERS = {
  agadir: { lat: 30.4278, lng: -9.5981 },
  "al-hoceima": { lat: 35.1682, lng: -3.9983 },
  "al-kelaa-des-sraghna": { lat: 32.0531, lng: -7.4083 },
  azilal: { lat: 31.9628, lng: -6.5711 },
  "beni-mellal": { lat: 32.3373, lng: -6.3498 },
  benslimane: { lat: 33.6188, lng: -7.1234 },
  boujdour: { lat: 26.1282, lng: -14.4926 },
  boulemane: { lat: 33.3628, lng: -4.7303 },
  casablanca: { lat: 33.5731, lng: -7.5898 },
  chefchaouen: { lat: 35.1688, lng: -5.2638 },
  chichaoua: { lat: 31.5383, lng: -8.7633 },
  dakhla: { lat: 23.6847, lng: -15.9579 },
  "el-jadida": { lat: 33.2316, lng: -8.5004 },
  errachidia: { lat: 31.9319, lng: -4.4248 },
  "es-semara": { lat: 26.7392, lng: -11.6741 },
  essaouirra: { lat: 31.5085, lng: -9.7595 },
  fes: { lat: 34.0181, lng: -5.0078 },
  figuig: { lat: 32.1099, lng: -1.2284 },
  guelmim: { lat: 28.9864, lng: -10.0563 },
  ifrane: { lat: 33.5228, lng: -5.1106 },
  kenitra: { lat: 34.261, lng: -6.5792 },
  khemisset: { lat: 33.8158, lng: -6.0663 },
  khenifra: { lat: 32.9388, lng: -5.6694 },
  khouribga: { lat: 32.8848, lng: -6.9013 },
  laayoune: { lat: 27.1253, lng: -13.1625 },
  larache: { lat: 35.1939, lng: -6.1557 },
  marrakech: { lat: 31.6295, lng: -7.9891 },
  meknes: { lat: 33.8935, lng: -5.5473 },
  mohammedia: { lat: 33.6874, lng: -7.3829 },
  nador: { lat: 35.1682, lng: -2.9333 },
  ouarzazate: { lat: 30.9333, lng: -6.9093 },
  oujda: { lat: 34.6867, lng: -1.9114 },
  rabat: { lat: 34.0209, lng: -6.8416 },
  safi: { lat: 32.2994, lng: -9.2372 },
  sale: { lat: 34.0531, lng: -6.7983 },
  sefrou: { lat: 33.8308, lng: -4.8353 },
  settat: { lat: 33.0015, lng: -7.6168 },
  "sidi-kacem": { lat: 34.2262, lng: -5.7125 },
  "sidi-slimane": { lat: 34.2648, lng: -5.926 },
  "tan-tan": { lat: 28.4381, lng: -11.1039 },
  tanger: { lat: 35.7595, lng: -5.834 },
  taounate: { lat: 34.4167, lng: -4.64 },
  taroudannt: { lat: 30.4703, lng: -8.877 },
  tata: { lat: 29.7422, lng: -7.9747 },
  taza: { lat: 34.2139, lng: -4.0086 },
  temara: { lat: 33.9284, lng: -6.9066 },
  tetouan: { lat: 35.5889, lng: -5.3626 },
  tiznit: { lat: 29.6974, lng: -9.7316 },
};

/** med.ma URL slugs (e.g. essaouirra on site, essaouira in our UI) */
const CITY_SLUG_ALIASES = {
  essaouira: "essaouirra",
};

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

function resolveMedMaCitySlug(citySlug) {
  return CITY_SLUG_ALIASES[citySlug] || citySlug;
}

function resolveMedMaCityId(citySlug) {
  return MED_MA_CITY_IDS[resolveMedMaCitySlug(citySlug)] || null;
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

/** Keep med.ma card order; drop duplicate links to the same profile in one page. */
function dedupePharmacies(pharmacies) {
  const seen = new Set();
  return pharmacies.filter((p) => {
    const key = p.profileUrl || `${(p.name || "").slice(0, 50)}|${(p.address || "").slice(0, 80)}`;
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

function enrichWithCoords(pharmacies) {
  return pharmacies.map((p) => {
    const coords = parseCoordsFromMapsUrl(p.mapsUrl);
    return coords ? { ...p, lat: coords.lat, lng: coords.lng } : p;
  });
}

function findNearestCitySlug(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const [slug, center] of Object.entries(CITY_CENTERS)) {
    const km = distanceKm(lat, lng, center.lat, center.lng);
    if (km < minDist) {
      minDist = km;
      nearest = slug;
    }
  }
  return nearest;
}

/** City listing page — same as https://www.med.ma/pharmacie/garde-24-24/{city} (GET, first page). */
async function fetchMedMaCityListingPage(citySlug, pageIndex = 0) {
  const slug = resolveMedMaCitySlug(citySlug);
  const path = pageIndex === 0 ? `/${slug}` : `/${slug}/${pageIndex}`;
  const sourceUrl = `${MED_MA_BASE}${path}`;
  const res = await fetch(sourceUrl, { headers: FETCH_HEADERS });
  if (!res.ok) return { html: null, sourceUrl };
  const html = await res.text();
  if (html.includes("Aucune pharmacie ne correspond")) {
    return { html: null, sourceUrl };
  }
  return { html, sourceUrl };
}

/** Paginated city POST — used only for geolocation (full city pool). */
async function fetchMedMaCityPageAt(citySlug, pageIndex) {
  const slug = resolveMedMaCitySlug(citySlug);
  const cityId = resolveMedMaCityId(citySlug);
  if (!cityId) return { html: null, sourceUrl: MED_MA_BASE };

  const path = pageIndex === 0 ? `/${slug}` : `/${slug}/${pageIndex}`;
  const sourceUrl = `${MED_MA_BASE}${path}`;
  const getRes = await fetch(sourceUrl, { headers: FETCH_HEADERS });
  if (!getRes.ok) return { html: null, sourceUrl };

  const getHtml = await getRes.text();
  const security = getHtml.match(/name="security"[^>]*value="([^"]+)"/i)?.[1];
  if (!security) return { html: null, sourceUrl };

  const form = new URLSearchParams({
    action: "searchhomepharma",
    formlang: "fr",
    security,
    garde: MED_MA_GARDE,
    pays_doc: "ma",
    field_keyword_pharma: "",
    field_delegation_pharma: "",
    field_gouvernorat_pharma: cityId,
  });

  const postRes = await fetch(sourceUrl, {
    method: "POST",
    headers: {
      ...FETCH_HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: sourceUrl,
    },
    body: form,
  });

  if (!postRes.ok) return { html: null, sourceUrl };
  const html = await postRes.text();
  if (html.includes("Aucune pharmacie ne correspond")) {
    return { html: null, sourceUrl };
  }
  return { html, sourceUrl };
}

/** All Garde 24/24 pharmacies for a city (med.ma paginated city POST). */
async function fetchAllCityPharmacies(citySlug, { maxPages = 15 } = {}) {
  const allPharmacies = [];
  let sourceUrl = `${MED_MA_BASE}/${resolveMedMaCitySlug(citySlug)}`;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
    const { html, sourceUrl: pageUrl } = await fetchMedMaCityPageAt(citySlug, pageIndex);
    if (pageIndex === 0 && pageUrl) sourceUrl = pageUrl;
    if (!html) break;
    const pagePharmacies = parsePharmaciesFromHtml(html);
    if (pagePharmacies.length === 0) break;
    allPharmacies.push(...pagePharmacies);
    if (pagePharmacies.length < 10) break;
  }

  return { pharmacies: enrichWithCoords(dedupePharmacies(allPharmacies)), sourceUrl };
}

async function fetchCityPharmacies(citySlug) {
  const { html, sourceUrl } = await fetchMedMaCityListingPage(citySlug, 0);
  if (!html) {
    return { pharmacies: [], sourceUrl, sourceName: "med.ma" };
  }
  const pharmacies = enrichWithCoords(dedupePharmacies(parsePharmaciesFromHtml(html)));
  return { pharmacies, sourceUrl, sourceName: "med.ma" };
}
async function fetchNearbyPharmacies(userLat, userLng) {
  const citySlug = findNearestCitySlug(userLat, userLng);
  if (!citySlug) {
    return { pharmacies: [], sourceUrl: MED_MA_BASE, citySlug: null };
  }

  const { pharmacies, sourceUrl } = await fetchAllCityPharmacies(citySlug);
  const withDistance = pharmacies.map((p) => ({
    ...p,
    distanceKm: p.lat != null && p.lng != null ? distanceKm(userLat, userLng, p.lat, p.lng) : null,
  }));

  withDistance.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return {
    pharmacies: withDistance.slice(0, 10),
    sourceUrl,
    citySlug,
  };
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
      const { pharmacies, sourceUrl, citySlug: nearbyCity } = await fetchNearbyPharmacies(userLat, userLng);
      if (pharmacies.length === 0) {
        return res.status(502).json({
          error: "Could not fetch nearby pharmacies from med.ma",
          sourceUrl,
          city: nearbyCity,
        });
      }
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json({
        mode: "nearby",
        userCoords: { lat: userLat, lng: userLng },
        city: nearbyCity,
        sourceUrl,
        sourceName: "med.ma",
        pharmacies,
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
    const { pharmacies: enriched, sourceUrl, sourceName } = await fetchCityPharmacies(citySlug);

    if (enriched.length === 0) {
      return res.status(502).json({
        error: "Could not fetch pharmacy data for this city",
        city: citySlug,
        sourceUrl,
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      mode: "city",
      city: citySlug,
      sourceUrl,
      sourceName,
      pharmacies: enriched,
    });
  } catch (err) {
    console.error("pharmacie-garde API error:", err);
    return res.status(500).json({
      error: "Failed to fetch pharmacy data",
      message: err.message
    });
  }
}
