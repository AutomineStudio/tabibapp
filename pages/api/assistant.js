import { IncomingForm } from "formidable";
import fs from "fs/promises";
import { ensureMedicamentsLoaded, findByName, extractMedicineCandidates } from "../../lib/medicaments";

export const config = { api: { bodyParser: false } };

// Fast response flow using Chat Completions; no threads/polling
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ result: 'خطأ في الإعداد: مفتاح OpenAI غير موجود.' });
    }

    const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
    });

    const messages = JSON.parse(fields.messages || '[]');
    const selectedLang = (fields.lang === 'fr') ? 'fr' : 'ar';

    // Assistant prompt (provided by product): drives language, tone, flow, and constraints
    const systemPrompt = `
LANGUAGE & TONE

Speak ONLY in Moroccan Darija Arabic (العربية الدارجة المغربية) if the user writes in Darija.

Speak ONLY in French if the user writes in French.

Use a friendly, supportive, and caring tone, like a Moroccan doctor talking to a patient.

Medicine names must always be written in Latin letters (e.g., “Doliprane”, “Amoxicilline”).

Any complex medical term must be followed by the French equivalent in parentheses. Example: التهاب المفاصل (arthrite).

In Darija: Write clearly with proper right-to-left structure.

In French: Write clearly with proper left-to-right structure.

When including a Latin medicine name inside an Arabic sentence, do it in a way that does not break the sentence flow. Keep the integrity of Arabic structure.

👤 GENDER-BASED PRONOUN RULE
By default, assume the user is male in how you refer to them.
As part of the triage, ask explicitly about the user's gender:

In Darija: “واش راجل ولا مرا؟”

In French: “Vous êtes un homme ou une femme ?”
Once the user shares their gender, immediately switch to using the correct pronoun and grammatical structure appropriate for a male (راجل / homme) or female (مرا / femme). Continue using that gender-specific form for the rest of the conversation.

📚 DATA SOURCE (MANDATORY)
All medicine information must be fetched from:
“medicaments_ma last version - Supabase Snippet Medicaments Table.pdf”.
This includes:

Medicine name

Therapeutic class

Retail price in MAD (Moroccan Dirham)

⚠️ If a medicine is not found in the file, clearly say it’s not available in Morocco.
✅ However, it’s allowed to give a short, general description of the medicine’s typical usage (e.g., "هاد الدواء كيستعمل باش يخفف الألم"), but do not guess the price or confirm its availability in Morocco.

🩺 SCOPE & LIMITATIONS
You are not a replacement for in-person medical care. Always include this disclaimer:
“أنا مجرد مساعد افتراضي، ماشي طبيب حقيقي؛ إلا كانت الأعراض خطيرة سير لأقرب طبيب أو مستشفى.”
If the user reports emergency symptoms (e.g., chest pain, severe bleeding, loss of consciousness), advise them immediately to visit the emergency room, and do not attempt remote diagnosis.

🔄 INTERACTION FLOW
Greeting:

In Darija: “السلام عليكم، آش خبارك؟”

In French: “Bonjour, comment allez-vous ?”

Triage – Ask 3–5 Targeted Questions:
🔸 Symptoms: What, when, severity.
🔸 Medical history: Any chronic conditions?
🔸 Current medication: Taking anything?
🔸 Allergies: Known allergies to meds or foods?
🔸 Demographics: Gender + Age.
🔸 If an image is uploaded, describe it first, then ask follow-up questions related to it.

Assessment
Give a simple explanation of the possible cause.

In Darija: Medical terms should always be followed by the French equivalent (in parentheses).

In French: Use only French terms.

Advice & Medication
If suitable, suggest an over-the-counter medicine. Include:
✅ Medicine name (in Latin)
✅ Dosage
✅ Frequency
✅ Side effects
✅ Price in MAD (e.g., "ثمنه تقريبا 12 درهم")

⚠️ If the medicine isn’t found in the PDF, say clearly it’s unavailable in Morocco and provide a brief general description only — never guess the price.

Closing:

If male: “نتمنى ليك الشفاء العاجل!”

If female: “نتمنى ليكِ الشفاء العاجل!”

🔖 STYLE EXAMPLES
Example Question (Darija):
“عفاك قول ليا شحال فاش بديتي تحس بالحمى؟ شحال وصلات الحرارة؟ شنو جنسك؟ واش راجل ولا مرا؟ وشحال فعمرك؟ واش خديتي شي دواء بحال Doliprane؟ وعندك شي حساسية؟”

Example Advice (Darija):
“يقدر يكون عندك نزلة برد بسيطة. تقدر تاخذ Doliprane 500 mg، قرص واحد كل 6 ساعات (ما تفوتش 4 أقراص فالنهار). ثمنه تقريبا 12 درهم. ولكن أنا مجرد مساعد افتراضي، ماشي طبيب حقيقي؛ إلا بقات الحرارة فوق 39° أو كان عندك ضيق فالتنفس، ضروري تمشي عند الطبيب. نتمنى ليك الشفاء العاجل!”`;

    // Build messages for Chat Completions
    const fullMessages = [{ role: 'system', content: systemPrompt }];
    // Explicit override: ensure prices come from CSV, not PDF
    const csvOverride = (
      'DATA SOURCE OVERRIDE\n' +
      'Use ONLY the CSV at data/Medicaments.csv for price amounts in MAD. ' +
      'Ignore any prior instruction to use PDFs for pricing. ' +
      'If a medicine is not present in the CSV, do NOT guess a price; say the price is unavailable.'
    );
    fullMessages.push({ role: 'system', content: csvOverride });
    // Explicit language override: always use the top-bar language
    const langOverride = selectedLang === 'fr'
      ? (
        'LANGUAGE OVERRIDE\n' +
        "Réponds UNIQUEMENT en français. Ignore toute instruction précédente qui te demande d\'utiliser la langue de l\'utilisateur ou de changer de langue. Toutes tes réponses doivent être en français."
      ) : (
        'LANGUAGE OVERRIDE\n' +
        "جاوب غير بالدّارجة المغربية. نْسَى أي تعليمات قبل من هادي كتقول تجاوب بلغة المستخدم ولا تبدّل اللغة. جميع الأجوبة خاصها تكون بالدّارجة."
      );
    fullMessages.push({ role: 'system', content: langOverride });
    // Enforce answer language based on UI selection
    const langGuard = selectedLang === 'fr'
      ? "IMPORTANT: Réponds uniquement en français. N'utilise pas l'arabe."
      : "مهم: جاوب غير بالدارجة المغربية (العربية الدارجة المغربية). متستعملش الفرنسية إلا غير للمصطلح الطبي بين قوسين.";
    fullMessages.unshift({ role: 'system', content: langGuard });

    for (let i = 0; i < messages.length - 1; i++) {
      const m = messages[i];
      if (!m) continue;
      fullMessages.push({ role: m.role, content: m.content });
    }

    const latestMessage = messages[messages.length - 1];
    if (latestMessage) {
      if (files.image) {
        try {
          const buffer = await fs.readFile(files.image.filepath);
          const base64Image = buffer.toString('base64');
          await fs.unlink(files.image.filepath).catch(() => {});
          fullMessages.push({
            role: 'user',
            content: [
              { type: 'text', text: latestMessage.content || '' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          });
        } catch (error) {
          console.error('Image processing error:', error);
          if (files.image?.filepath) {
            await fs.unlink(files.image.filepath).catch(() => {});
          }
          return res.status(500).json({ result: 'حدث خطأ أثناء معالجة الصورة' });
        }
      } else {
        fullMessages.push(latestMessage);
      }
    }

    // Inject verified medicine info into context if present
    if (latestMessage?.content) {
      try {
        await ensureMedicamentsLoaded();
        const candidates = extractMedicineCandidates(latestMessage.content).slice(0, 5);
        const found = [];
        for (const c of candidates) {
          const rec = await findByName(c);
          if (rec) found.push(rec);
        }
        if (found.length > 0) {
          const lines = [
            'بيانات موثوقة لأدوية في المغرب (للاستعمال كمصدر فقط):',
            ...found.map(r => `- ${r.name}: ${r.therapeutic_class || '—'}${r.price_mad != null ? ` — السعر التقريبي: ${r.price_mad} درهم` : ''}`)
          ];
          fullMessages.push({ role: 'system', content: lines.join('\n') });
        }
      } catch (e) {
        // Fail silently; assistant can proceed without enrichment
      }
    }

    // Configurable, faster defaults
    const hasImage = !!files.image;
    const defaultModel = hasImage ? 'gpt-4.1-mini' : 'gpt-4.1-mini';
    const model = process.env.OPENAI_MODEL || defaultModel;
    const max_tokens = Number(process.env.OPENAI_MAX_TOKENS || 700);
    const temperature = Number(process.env.OPENAI_TEMPERATURE || 0.5);
    const top_p = Number(process.env.OPENAI_TOP_P || 0.9);
    const frequency_penalty = Number(process.env.OPENAI_FREQUENCY_PENALTY || 0.1);
    const presence_penalty = Number(process.env.OPENAI_PRESENCE_PENALTY || 0.0);

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
      body: JSON.stringify({ model, messages: fullMessages, max_tokens, temperature, top_p, frequency_penalty, presence_penalty }),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error('OpenAI API Error:', { status: openaiRes.status, statusText: openaiRes.statusText, error: data?.error });
      return res.status(500).json({ result: `خطأ من المزود: ${data?.error?.message || 'Unknown error'}` });
    }

    let reply = data?.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من توليد رد في الوقت الحالي.';

    // Postprocess: if the assistant mentioned medicines, append verified price info from CSV
    try {
      await ensureMedicamentsLoaded();
      // Extract candidates from the reply itself (assistant's suggestions)
      const mentioned = extractMedicineCandidates(reply).slice(0, 6);
      const found = [];
      for (const m of mentioned) {
        const rec = await findByName(m);
        if (rec) found.push(rec);
      }
      if (found.length > 0) {
        // Force postprocessed snippet language to match UI selection
        const isArabic = selectedLang === 'ar';
        const title = isArabic ? 'معلومات موثوقة (المغرب):' : 'Infos vérifiées (Maroc):';
        const lines = found.map(r => {
          const price = r.price_mad != null ? (isArabic ? `الثمن التقريبي: ${r.price_mad} درهم` : `prix env.: ${r.price_mad} MAD`) : (isArabic ? 'الثمن غير متوفر' : 'prix indisponible');
          const klass = r.therapeutic_class ? (isArabic ? `— الصنف: ${r.therapeutic_class}` : `— classe: ${r.therapeutic_class}`) : '';
          return `- ${r.name} — ${price} ${klass}`.trim();
        });
        reply += `\n\n${title}\n${lines.join('\n')}`;
      }
    } catch (e) {
      // silent fail, keep original reply
    }

    // Normalize any source mention to CSV, but do NOT append a source line
    try {
      reply = reply
        .replace(/medicaments?_ma[^\n]*pdf/gi, 'data/Medicaments.csv')
        .replace(/PDF database/gi, 'CSV dataset');
    } catch {}

    return res.status(200).json({ result: reply });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ result: 'حدث خطأ غير متوقع في الخادم.' });
  }
}
