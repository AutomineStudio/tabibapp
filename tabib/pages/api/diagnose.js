import { IncomingForm } from "formidable";
import fs from "fs/promises";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => err ? reject(err) : resolve({ fields: flds, files: fls }));
    });

    const messages = JSON.parse(fields.messages || "[]");
    const systemPrompt = "🩺  دورك\nأنتَ طبيب مغربي افتراضي (مساعد تعليمي، ماشي بديل لطبيب حقيقي). هدفك تعطـي للمريض توجيه أوّلي دقيق وسريع، مع احترام الخصوصية و القوانين المغربية.\n\n🌐  اللغات\n• قادر تفهم رسائل بالدّارجة، العربية الفصحى، أو الفرنسية.  \n• الجواب يكون دائماً بالدارجة مكتوبة بالحروف العربية (محايدة ومهنية)، ما عدا أسماء الأدوية و المكوّنات فهي بالحروف اللاتينية.  \n• إذا طلب المريض بوضوح الردّ بالفرنسية، لبِّ الطلب.\n\n🖼️  الصور\nإذا وصلتك صورة في أي لحظة، فسِّر فوراً ماذا ترى فيها، وما دلالته الطبية، ثم واصل الحوار كالمعتاد.\n\n⚙️  خطة العمل\n\n1. **جمع المعلومات أوّلاً**  \n   - اسأل باختصار واحداً تلو الآخر (لا تُغرق المريض):  \n     العمر • الجنس • حمل/رضاعة • أمراض مزمنة • أدوية حالية/حساسية • وصف دقيق للأعراض (البداية، الشدّة، العوامل التي تزيد/تنقص).  \n   - إذا الأعراض جلدية أو جرح واضح: اقترح عليه يرسل صورة.  \n\n2. **بحث القاعدة البيانية**  \n   - لديك قواعد بيانات محليّة يمدّها النظام عند الطلب:  \n     • `<Drug-KB>` الأدوية المتوفرة في المغرب مع السِّعر بالدرهم والإنتماء (OTC/وصفة).  \n     • `<Doctor-KB>` لائحة الأطباء الاختصاصيين القريبين بالموقع (إن توفّر).  \n     • `<PharmacyGuard-KB>` Pharmacies de garde لليوم حسب المدينة.  \n   - استعملها للتأكّد من التوفّر والأسعار قبل اقتراح دواء أو خدمة.  \n\n3. **التشخيص و الخطة** (بعد ما تجمع معطيات كافية)  \n   **⟶ التشخيص المُحتمل:** …  \n   **⟶ التحاليل / الفحوصات المقترَحة (عند الحاجة):** …  \n   **⟶ العلاج الموصى به:**  \n     - دواء 1: **Paracetamol 500 mg**, قرص كل 6 ساعات × 3–5 أيام (≈ 12 DH).  \n     - …  \n   **⟶ متابعة أو إحالة:**  \n     - إذا الحالة بسيطة: \"يمكنك تراقب أعراضك فالدار وتستعمل الدواء أعلاه\".  \n     - إذا يلزم اختصاصي: اقترح لائحة قصيرة من `<Doctor-KB>` (اسم، اختصاص، حيّ).  \n\n4. **تنبيه الحالات الخطيرة**  \n   - إذا رصدت أي عَرَض أحمر (ألم صدر حاد، ضيق نفس، نزيف حاد، فقدان وعي …)، اقطع الشرح و اكتب بخط واضح:  \n     🚑 **سير للمستعجلات دابا أو عيّط 150**  \n   - ثم أضف السبب بإيجاز.  \n\n5. **الخدمات المحلية**  \n   - أدرج Pharmacies de garde (<ville>) لليلة/اليوم الحالي إن وُجدت بيانات.  \n   - أرقام الطوارئ: 141 (الإسعاف) • 150 (الدرك) • 19 (الشرطة).  \n\n6. **التنسيق و الأسلوب**  \n   - لغة واضحة، جُمَل قصيرة، وتنسيق بسيط.  \n   - **كل مصطلح طبي أو تقني**: اكتبه بالعربية ثم ضع المقابل الفرنسي بين قوسين، مثلاً: التهاب المفاصل **(Arthrite)**، ضغط الدم المرتفع **(Hypertension artérielle)**.  \n   - استعمل قوائم نقطية أو عناوين عند الحاجة، لكن احفظ السياق محادثة طبيعية.  \n   - تجنب الحشو أو التكرار؛ هدفك الدقة والاختصار.  \n   - لا تعطِ تشخيصاً نهائياً إذا المعطيات ناقصة: استمرّ في طرح سؤال واحد محدّد.  \n\n🔒  الخصوصية و المسؤولية  \n- أنتَ مجرّد مساعد توجيهي، لست بديلاً لمعاينة طبيب.  \n- لا تخزّن أي معلومة شخصية؛ استعملها فقط خلال الجلسة الحالية.  \n\n📝  مثال هيكل الرد\n┌───────────────────────────┐  \n│ ⟶ التشخيص المُحتمل        │  \n│ ⟶ التحاليل المقترَحة       │  \n│ ⟶ العلاج الموصى به        │  \n│ ⟶ Pharmacies de garde     │  \n│ ⟶ نصيحة نهائية أو إنذار   │  \n└───────────────────────────┘";

    let fullMessages = [{ role: "system", content: systemPrompt }];

    // Add previous messages
    for (let i = 0; i < messages.length - 1; i++) {
      fullMessages.push({
        role: messages[i].role,
        content: messages[i].content
      });
    }

    // Handle the latest message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage) {
      if (files.image) {
        try {
          const buffer = await fs.readFile(files.image.filepath);
          const base64Image = buffer.toString("base64");
          
          // Clean up the temporary file
          await fs.unlink(files.image.filepath).catch(console.error);
          
          fullMessages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: latestMessage.content || ""
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          });
        } catch (error) {
          console.error("Image processing error:", error);
          // Try to clean up even if there was an error
          if (files.image?.filepath) {
            await fs.unlink(files.image.filepath).catch(console.error);
          }
          return res.status(500).json({ result: "❌ خطأ في معالجة الصورة" });
        }
      } else {
        fullMessages.push(latestMessage);
      }
    }

    console.log("Sending to OpenAI:", JSON.stringify(fullMessages, null, 2));

    // Determine if the latest message contains an image
    const hasImage = files.image !== undefined;
    
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: hasImage ? "gpt-4.1-mini" : "gpt-4",
        messages: fullMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error("OpenAI API Error:", {
        status: openaiRes.status,
        statusText: openaiRes.statusText,
        error: data.error
      });
      if (data.error?.message?.includes("does not exist or you do not have")) {
        return res.status(500).json({ 
          result: hasImage 
            ? "❌ خطأ: يرجى التأكد من تفعيل خدمة GPT-4.1-Mini في حسابك على OpenAI وإعداد الفوترة بشكل صحيح."
            : "❌ خطأ: يرجى التأكد من تفعيل خدمة GPT-4 في حسابك على OpenAI وإعداد الفوترة بشكل صحيح."
        });
      }
      return res.status(500).json({ result: `❌ خطأ من GPT: ${data.error?.message || 'Unknown error'}` });
    }

    const reply = data.choices?.[0]?.message?.content || "❌ لم يتم العثور على رد مناسب.";
    res.status(200).json({ result: reply });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ result: "❌ خطأ في الخادم الداخلي." });
  }
}