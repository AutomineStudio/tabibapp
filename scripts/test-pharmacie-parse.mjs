/**
 * Standalone test - fetches lematin.ma directly and tests parsing logic.
 * Run: node scripts/test-pharmacie-parse.mjs
 */
const LEMATIN_BASE = "https://lematin.ma";
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "text/html,application/xhtml+xml"
};

function parseNeighborhoodsWithLabels(html, citySlug, typePath) {
  const items = [];
  const regex = new RegExp(
    `href="(?:https://lematin\\.ma)?/pharmacie-garde/${citySlug}/${typePath}/([^"/]+)"[^>]*>([^<]+)</a>`,
    "gi"
  );
  const seen = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    const slug = m[1].toLowerCase();
    const label = (m[2] || "").trim();
    if (seen.has(slug) || !label || /^(garde24|jour|nuit)$/i.test(slug)) continue;
    if (label.length < 2 || label.length > 50) continue;
    seen.add(slug);
    items.push({ slug, label });
  }
  return items;
}

function parsePharmaciesFromPage(html, citySlug, neighborhoodSlug) {
  const body = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");

  const pharmacyRegex = new RegExp(
    `<a\\s+href="(?:https://lematin\\.ma)?/pharmacie/${citySlug}/${neighborhoodSlug}/([^"]+)"[^>]*>([^<]+)</a>`,
    "gi"
  );
  const pharmacies = [];
  let m;
  const matches = [];
  while ((m = pharmacyRegex.exec(body)) !== null) {
    const name = (m[2] || "").trim();
    if (!name || name.toLowerCase().includes("pharmacies de garde") || name.length < 3) continue;
    matches.push({ index: m.index, slug: m[1], name, len: m[0].length });
  }

  function extractAddress(block) {
    const stripped = block.replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ");
    const lines = stripped.split(/\n/).map((s) => s.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length < 8) continue;
      if (/^[A-Za-z\s]+$/.test(line) && line.length < 25) continue;
      if (/\d|,|°|n°|N°|bd|rue|av\.|hay|lot|résid|imm/i.test(line)) {
        return line.replace(/\s+/g, " ");
      }
    }
    return "";
  }

  for (let i = 0; i < matches.length; i++) {
    const { slug, name } = matches[i];
    const start = matches[i].index + matches[i].len;
    const end = i + 1 < matches.length ? matches[i + 1].index : start + 400;
    const block = body.slice(start, end);
    const address = extractAddress(block);
    pharmacies.push({ name, address });
  }
  return pharmacies;
}

async function main() {
  console.log("Fetching lematin.ma pharmacie-garde/casablanca/garde24...\n");
  const url = `${LEMATIN_BASE}/pharmacie-garde/casablanca/garde24`;
  const res = await fetch(url, { headers: FETCH_HEADERS });
  const html = await res.text();
  if (!res.ok) {
    console.log("Fetch failed:", res.status);
    return;
  }

  const neighborhoods = parseNeighborhoodsWithLabels(html, "casablanca", "garde24");
  console.log("Neighborhoods found:", neighborhoods.length);
  neighborhoods.slice(0, 5).forEach((n) => console.log("  -", n.label, "(" + n.slug + ")"));

  const centreVille = neighborhoods.find((n) => n.slug === "centre-ville");
  const oulfa = neighborhoods.find((n) => n.slug === "oulfa");

  if (centreVille) {
    console.log("\n--- Centre Ville ---");
    const cvUrl = `${LEMATIN_BASE}/pharmacie-garde/casablanca/garde24/centre-ville`;
    const cvHtml = await fetch(cvUrl, { headers: FETCH_HEADERS }).then((r) => r.text());
    const phs = parsePharmaciesFromPage(cvHtml, "casablanca", "centre-ville");
    console.log("Pharmacies:", phs.length);
    phs.forEach((p) => console.log("  *", p.name, "|", p.address || "(no address)"));
    const expected = ["Pharmacie DE LA BOURSE"];
    const ok = phs.some((p) => p.name.includes("BOURSE"));
    console.log("Match expected (DE LA BOURSE):", ok ? "OK" : "FAIL");
  }

  if (oulfa) {
    console.log("\n--- Oulfa ---");
    const olUrl = `${LEMATIN_BASE}/pharmacie-garde/casablanca/garde24/oulfa`;
    const olHtml = await fetch(olUrl, { headers: FETCH_HEADERS }).then((r) => r.text());
    const phs = parsePharmaciesFromPage(olHtml, "casablanca", "oulfa");
    console.log("Pharmacies:", phs.length);
    phs.forEach((p) => console.log("  *", p.name, "|", p.address || "(no address)"));
    const ok1 = phs.some((p) => p.name.includes("AHMED RAYAN"));
    const ok2 = phs.some((p) => p.name.includes("EL WIFAK"));
    console.log("Match expected (AHMED RAYAN, EL WIFAK):", ok1 && ok2 ? "OK" : "FAIL");
  }
}

main().catch(console.error);
