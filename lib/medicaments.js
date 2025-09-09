import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CSV_PATH = path.join(DATA_DIR, 'Medicaments.csv');

let cache = null; // { byName: Map<string, Record>, rows: Record[] }

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

// Minimal CSV parser with quoted-field support
function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field.trim()); field = ''; i++; continue; }
      if (ch === '\n') { row.push(field.trim()); rows.push(row); row = []; field = ''; i++; continue; }
      if (ch === '\r') { i++; continue; }
      field += ch; i++; continue;
    }
  }
  row.push(field.trim());
  rows.push(row);
  return rows;
}

function pickHeaderIndex(headers, candidates) {
  const hnorm = headers.map(normalize);
  for (const cands of candidates) {
    for (const h of hnorm) {
      if (cands.some(c => h === c || h.includes(c))) {
        const idx = hnorm.indexOf(h);
        if (idx !== -1) return idx;
      }
    }
  }
  return -1;
}

async function loadCSV() {
  const buf = await fs.readFile(CSV_PATH);
  const text = buf.toString('utf8');
  const rows = parseCSV(text).filter(r => r.length && r.some(c => c && c.length));
  if (rows.length < 2) return { byName: new Map(), rows: [] };

  const headers = rows[0];
  const data = rows.slice(1);
  const nameIdx = pickHeaderIndex(headers, [["name"], ["medicament"], ["drug"], ["product"], ["nom"]]);
  const classIdx = pickHeaderIndex(headers, [["therapeutic_class"], ["class"], ["classe"], ["therapeutique"], ["category"], ["famille"]]);
  // Price comes from the PPV column in our dataset
  const priceIdx = pickHeaderIndex(
    headers,
    [["ppv"], ["price_mad"], ["price"], ["prix"], ["retail"], ["mad"], ["dh"]]
  );

  const byName = new Map();
  const out = [];
  const toNumber = (val) => {
    const s = String(val ?? '')
      .replace(/[\u00A0\s]/g, '') // remove spaces and NBSP
      .replace(/\u202F/g, '') // narrow NBSP
      .replace(/,/g, ''); // drop thousands separators
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };
  for (const row of data) {
    const name = row[nameIdx] || '';
    if (!name) continue;
    const rec = {
      name: String(name).trim(),
      therapeutic_class: classIdx >= 0 ? String(row[classIdx] || '').trim() : '',
      price_mad: priceIdx >= 0 && row[priceIdx] !== undefined && row[priceIdx] !== ''
        ? toNumber(row[priceIdx])
        : null,
    };
    out.push(rec);
    const key = normalize(rec.name);
    if (!byName.has(key)) byName.set(key, rec);
  }
  return { byName, rows: out };
}

export async function ensureMedicamentsLoaded() {
  if (cache) return true;
  try {
    cache = await loadCSV();
    return true;
  } catch (e) {
    console.error('[medicaments] Failed to load CSV:', e.message);
    return false;
  }
}

export async function findByName(name) {
  if (!name) return null;
  const ok = await ensureMedicamentsLoaded();
  if (!ok || !cache) return null;
  return cache.byName.get(normalize(name)) || null;
}

export async function searchLoose(query, limit = 10) {
  const ok = await ensureMedicamentsLoaded();
  if (!ok || !cache) return [];
  const q = normalize(query);
  const res = [];
  for (const rec of cache.rows) {
    if (normalize(rec.name).includes(q)) res.push(rec);
    if (res.length >= limit) break;
  }
  return res;
}

export function extractMedicineCandidates(text) {
  if (!text) return [];
  const tokens = String(text)
    .split(/[^A-Za-z0-9\-]+/)
    .filter(t => /[A-Za-z]/.test(t) && t.length >= 3);
  // Deduplicate preserve order
  const seen = new Set();
  const out = [];
  for (const t of tokens) {
    const key = normalize(t);
    if (!seen.has(key)) { seen.add(key); out.push(t); }
  }
  return out;
}
