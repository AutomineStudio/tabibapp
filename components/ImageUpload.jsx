import { useState } from "react";

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/assistant/analyze-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data?.output || data?.error || "No result");
    setUploading(false);
  }

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
      <input type="file" accept="image/*" onChange={handleFile} />
      {uploading && <p>Analyzing…</p>}
      {result && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{result}</pre>
      )}
    </div>
  );
}
