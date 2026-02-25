/**
 * Medicament search from local morocco_medicines_pretty.json.
 * Query: name (search by nom_commercial), limit (default 50).
 */
import fs from "fs";
import path from "path";

let medicinesCache = null;

function getDataPath() {
  const root = process.cwd();
  const inData = path.join(root, "data", "morocco_medicines_pretty.json");
  const inTabib = path.join(root, "tabib", "data", "morocco_medicines_pretty.json");
  try {
    if (fs.existsSync(inData)) return inData;
    if (fs.existsSync(inTabib)) return inTabib;
  } catch (_) {}
  return inData;
}

async function loadMedicines() {
  if (medicinesCache) return medicinesCache;
  const filePath = getDataPath();
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const medicines = JSON.parse(raw);
    medicinesCache = Array.isArray(medicines) ? medicines : [];
    return medicinesCache;
  } catch (err) {
    console.error("medicament API load error:", err);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, limit: limitParam } = req.query;
  const limit = Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200);

  try {
    const medicines = await loadMedicines();
    let results = medicines;

    if (name && typeof name === "string" && name.trim()) {
      const q = name.trim().toLowerCase();
      const terms = q.split(/\s+/).filter((t) => t.length > 0);
      results = medicines.filter((med) => {
        const nom = (med.nom_commercial || "").toLowerCase();
        const comp = (med.composition || "").toLowerCase();
        const lab = (med.distributeur || "").toLowerCase();
        const text = `${nom} ${comp} ${lab}`;
        return terms.every((term) => text.includes(term));
      });
    }

    // Only commercialized
    results = results.filter((m) => (m.statut || "") === "Commercialisé");

    const list = results.slice(0, limit).map((m) => ({
      nom_commercial: m.nom_commercial,
      presentation: m.presentation,
      dosage: m.dosage,
      composition: m.composition,
      classe_therapeutique: m.classe_therapeutique,
      distributeur: m.distributeur,
      ppv: m.ppv,
      prix_hospitalier: m.prix_hospitalier,
      tableau: m.tableau,
    }));

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({
      medicaments: list,
      total: results.length,
      source: "morocco_medicines_pretty.json",
    });
  } catch (err) {
    console.error("medicament API error:", err);
    return res.status(500).json({
      error: err.message || "Server error",
      medicaments: [],
      total: 0,
    });
  }
}
