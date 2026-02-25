/**
 * Test script for pharmacie-garde API - run with: node scripts/test-pharmacie.mjs
 * Compares API output with expected data from lematin.ma
 */
const BASE = "http://localhost:3000";

async function test() {
  console.log("Testing pharmacie-garde API...\n");

  const tests = [
    { city: "casablanca", type: "24-24", expect: { centerVille: ["Pharmacie DE LA BOURSE"], oulfa: ["Pharmacie AHMED RAYAN", "Pharmacie EL WIFAK"] } },
  ];

  for (const { city, type, expect } of tests) {
    const url = `${BASE}/api/pharmacie-garde?city=${city}&type=${type}`;
    console.log(`GET ${url}`);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        console.log("  ERROR:", data.error || data);
        continue;
      }
      console.log("  city:", data.city, "| type:", data.type);
      console.log("  neighborhoods:", data.neighborhoods?.length ?? "N/A");
      if (data.neighborhoods) {
        for (const nb of data.neighborhoods) {
          console.log(`    - ${nb.label} (${nb.slug}): ${nb.pharmacies?.length ?? 0} pharmacies`);
          if (nb.pharmacies?.length) {
            for (const p of nb.pharmacies.slice(0, 3)) {
              console.log(`      * ${p.name} | ${p.address?.slice(0, 40) || "no address"}...`);
            }
          }
        }
      } else if (data.pharmacies) {
        console.log("  (flat list, no neighborhoods):", data.pharmacies.length);
      }

      const centerVille = data.neighborhoods?.find((n) => n.slug === "centre-ville");
      const oulfa = data.neighborhoods?.find((n) => n.slug === "oulfa");
      if (expect.centerVille && centerVille) {
        const names = centerVille.pharmacies?.map((p) => p.name) || [];
        const ok = expect.centerVille.every((n) => names.some((x) => x.includes(n.split(" ").pop())));
        console.log("  Centre Ville match:", ok ? "OK" : "MISMATCH", names);
      }
      if (expect.oulfa && oulfa) {
        const names = oulfa.pharmacies?.map((p) => p.name) || [];
        const ok = expect.oulfa.every((n) => names.some((x) => x.includes(n.split(" ").pop())));
        console.log("  Oulfa match:", ok ? "OK" : "MISMATCH", names);
      }
    } catch (e) {
      console.log("  FETCH ERROR:", e.message);
    }
    console.log("");
  }
}

test();
