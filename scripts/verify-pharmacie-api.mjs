/**
 * Verify pharmacie-garde API returns data matching med.ma source.
 * Run: node scripts/verify-pharmacie-api.mjs
 */
const API_BASE = "http://localhost:3000";

async function main() {
  console.log("Fetching from med.ma (source)...");
  const medRes = await fetch("https://www.med.ma/pharmacie/garde-24-24/casablanca", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  const medHtml = await medRes.text();
  const fromSource = [];
  const linkRe = /<a\s+href="https:\/\/www\.med\.ma\/pharmacie\/casablanca\/(pharmacie-[^"]+--\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(medHtml)) !== null) {
    const name = (m[2] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (name.length > 10 && /Pharmacie\s+/i.test(name)) fromSource.push(name.split(/\s+Maroc\s+/i)[0].trim());
  }
  const sourceNames = [...new Set(fromSource)].slice(0, 15);
  console.log("First 15 pharmacy names on med.ma:", sourceNames.length);
  sourceNames.forEach((n, i) => console.log("  ", i + 1, n.slice(0, 55)));

  console.log("\nFetching from API...");
  let apiData;
  try {
    const apiRes = await fetch(`${API_BASE}/api/pharmacie-garde?city=casablanca`);
    apiData = await apiRes.json();
  } catch (e) {
    console.log("API error (is dev server running on 3000?):", e.message);
    return;
  }
  if (apiData.error) {
    console.log("API error:", apiData.error);
    return;
  }
  const apiNames = (apiData.pharmacies || []).map((p) => p.name);
  console.log("API returned", apiNames.length, "pharmacies. First 15:");
  apiNames.slice(0, 15).forEach((n, i) => console.log("  ", i + 1, (n || "").slice(0, 55)));

  const matchFirst = sourceNames[0] && apiNames.some((a) => a && a.includes("Bourse"));
  const matchSecond = apiNames.some((a) => a && (a.includes("Fourkane") || a.includes("Aba Chouaïb")));
  console.log("\nMatch check: De La Bourse in API?", matchFirst ? "OK" : "MISSING");
  console.log("Match check: Another early pharmacy in API?", matchSecond ? "OK" : "CHECK");
}

main().catch(console.error);
