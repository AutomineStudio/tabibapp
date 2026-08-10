import formidable from "formidable";
import fs from "fs/promises";
import OpenAI from "openai";

export const config = { api: { bodyParser: false } }; // use formidable

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const form = formidable({ multiples: false });
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, fls) => (err ? reject(err) : resolve({ fields, files: fls })));
    });

    const file = files?.file;
    if (!file) return res.status(400).json({ error: "No file" });

    const b64 = (await fs.readFile(file.filepath)).toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${b64}`;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: "Briefly describe this image." },
            { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
    });

    return res.status(200).json({ output: resp.output_text || "" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Upload failed" });
  }
}
