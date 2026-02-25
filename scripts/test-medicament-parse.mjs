const BASE = "https://medicament.ma";
const html = await fetch(BASE + "/listing-des-medicaments/?lettre=D", {
  headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
}).then((r) => r.text());

// Method: find all hrefs containing /medicament/ then get text from same line or next tags
const allHrefs = [];
const re = /href\s*=\s*["'](https?:\/\/medicament\.ma\/medicament\/[^"']+)["']|href\s*=\s*["'](\/medicament\/[^"']+)["']/gi;
let n;
while ((n = re.exec(html)) !== null) {
  const url = (n[1] || n[2]).startsWith("http") ? n[1] || n[2] : BASE + (n[1] || n[2]);
  const after = html.slice(n.index + n[0].length, n.index + n[0].length + 800);
  const close = after.indexOf("</a>");
  const block = close >= 0 ? after.slice(0, close) : after;
  const text = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  if (text.length > 15 && !/Nouvelle recherche|Liste des produits|^[A-Z]\s*$/.test(text))
    allHrefs.push({ url: url.slice(0, 55), text: text.slice(0, 90) });
}
console.log("Matches:", allHrefs.length);
console.log("First 3:", JSON.stringify(allHrefs.slice(0, 3), null, 2));
