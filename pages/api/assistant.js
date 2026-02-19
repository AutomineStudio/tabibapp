import { IncomingForm } from "formidable";
import fs from "fs/promises";
import { searchMedicines, formatMedicineForAI } from "../../utils/medicines.js";

export const config = { api: { bodyParser: false } };

// Define the medicine search tool for function calling
const medicineSearchTool = {
  type: "function",
  function: {
    name: "search_medicine_database",
    description: "Search the Moroccan medicines database. Use broad medical keywords for better results. The search uses OR logic across composition and therapeutic class fields. IMPORTANT: Always include patient age and gender for appropriate recommendations.",
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "string",
          description: "User symptoms in their own words (optional, for reference only)"
        },
        condition: {
          type: "string",
          description: "Medical condition name (optional, for reference only)"
        },
        composition: {
          type: "string",
          description: "IMPORTANT: Active ingredient names to search for. Use common drug names: 'paracetamol', 'ibuprofène', 'amoxicilline', 'metformine', 'atorvastatine', etc. Can provide multiple separated by spaces."
        },
        therapeuticClass: {
          type: "string",
          description: "IMPORTANT: Therapeutic class keywords. Use broad medical terms: 'analgésique', 'antipyrétique', 'anti-inflammatoire', 'antibiotique', 'antidiabétique', 'antihypertenseur', 'antirhumatismal', 'hypolipémiant', etc. Can provide multiple separated by spaces."
        },
        patientAge: {
          type: "number",
          description: "REQUIRED: Patient's age in years. Used to filter appropriate medicines (pediatric vs adult formulations)."
        },
        patientGender: {
          type: "string",
          enum: ["homme", "femme", "garçon", "fille"],
          description: "REQUIRED: Patient's gender. Used for gender-specific recommendations (e.g., pregnancy considerations)."
        },
        maxPrice: {
          type: "number",
          description: "Maximum price in Moroccan dirhams (optional)"
        }
      },
      required: ["patientAge", "patientGender"]
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return res.status(500).json({ result: "❌ خطأ: مفتاح API مفقود. يرجى التحقق من إعدادات البيئة." });
    }

    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => err ? reject(err) : resolve({ fields: flds, files: fls }));
    });

    const messages = JSON.parse(fields.messages || "[]");
    const previousResponseId = fields.previousResponseId?.[0] || null;

    console.log("\n" + "█".repeat(80));
    console.log("📨 NEW REQUEST RECEIVED");
    console.log("█".repeat(80));
    console.log(`📊 Conversation: ${messages.length} message(s) in history`);
    console.log(`🆔 Response ID: ${previousResponseId || 'null (new conversation)'}`);
    console.log(`🖼️  Image attached: ${files.image ? 'Yes' : 'No'}`);

    if (messages.length > 0) {
      console.log("\n💬 Conversation History:");
      messages.forEach((msg, i) => {
        const preview = msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '');
        console.log(`  ${i + 1}. [${msg.role}] ${preview}`);
      });
    }
    console.log("█".repeat(80) + "\n");

    // Prepare conversation messages for Responses API
    let conversationMessages = [];

    // Add conversation history
    if (messages.length > 0) {
      conversationMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    }

    // Handle image upload if present
    if (files.image) {
      try {
        const buffer = await fs.readFile(files.image[0].filepath);
        const base64Image = buffer.toString('base64');
        const mimeType = files.image[0].mimetype || 'image/jpeg';

        // Add image to the latest user message
        if (conversationMessages.length > 0 && conversationMessages[conversationMessages.length - 1].role === 'user') {
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          lastMessage.content = [
            { type: "text", text: lastMessage.content },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ];
        }

        // Clean up temp file
        await fs.unlink(files.image[0].filepath).catch(console.error);
      } catch (error) {
        console.error("Image processing error:", error);
        if (files.image?.[0]?.filepath) {
          await fs.unlink(files.image[0].filepath).catch(console.error);
        }
      }
    }

    // Create the system prompt for the medical assistant
    const systemPrompt = `Tu es un médecin virtuel marocain spécialisé dans les consultations médicales. Tu dois répondre dans la MÊME LANGUE que le patient utilise.

**TRÈS IMPORTANT - Détection de la langue:**
- Si le patient parle en FRANÇAIS → Réponds en FRANÇAIS
- Si le patient parle en ARABE (Darija) → Réponds en ARABE (Darija)
- Si le patient parle en ARABE STANDARD → Réponds en ARABE STANDARD
- ADAPTE-TOI TOUJOURS à la langue du patient

**Ta mission principale:**
1. Écouter attentivement les symptômes du patient
2. **TOUJOURS demander ces informations ESSENTIELLES avant de rechercher des médicaments:**
   - **ÂGE** (obligatoire - posologies pédiatriques vs adultes différentes)
   - **SEXE/GENRE** (obligatoire - grossesse, allaitement, hormones)
   - Allergies connues
   - Médicaments actuels (interactions)
   - Durée des symptômes
3. **Traduire les symptômes en termes médicaux** pour la recherche:
   - Mal de tête / Céphalée → composition: "paracétamol, ibuprofène" OU therapeuticClass: "analgésique, antipyrétique"
   - Fièvre → composition: "paracétamol" OU therapeuticClass: "antipyrétique"
   - Douleurs articulaires → composition: "ibuprofène" OU therapeuticClass: "anti-inflammatoire, antirhumatismal"
   - Diabète → composition: "metformine, glibenclamide" OU therapeuticClass: "antidiabétique, hypoglycémiant"
   - Hypertension → composition: "amlodipine, enalapril" OU therapeuticClass: "antihypertenseur"
   - Infection / Antibiotique → composition: "amoxicilline" OU therapeuticClass: "antibiotique, anti-infectieux"
   - Toux → composition: "dextrométhorphane" OU therapeuticClass: "antitussif, expectorant, mucolytique"
   - Allergie → composition: "cétirizine, loratadine" OU therapeuticClass: "antihistaminique, antiallergique"
   - Douleur / Analgésie → composition: "paracétamol, ibuprofène, tramadol" OU therapeuticClass: "analgésique, antalgique"
   - Infection urinaire → composition: "nitrofurantoïne" OU therapeuticClass: "antibiotique, quinolone, anti-infectieux urinaire"
   - Diarrhée → composition: "lopéramide" OU therapeuticClass: "antidiarrhéique"
   - Constipation → therapeuticClass: "laxatif"
   - Brûlures d'estomac → composition: "oméprazole" OU therapeuticClass: "antiacide, inhibiteur pompe protons"
   - Cholestérol → composition: "atorvastatine, simvastatine" OU therapeuticClass: "hypolipémiant, statine"
4. Rechercher dans la base de données avec des **mots-clés médicaux larges**
5. Fournir des conseils médicaux généraux et des instructions d'utilisation

**Règles importantes pour éviter les répétitions:**
- LIS ATTENTIVEMENT l'historique de la conversation
- NE REPOSE PAS une question si le patient a déjà répondu
- Si le patient a donné des informations, UTILISE-LES directement
- Ne demande QUE les informations essentielles manquantes
- **IMPORTANT: NE CHERCHE PAS de médicaments sans connaître l'âge ET le sexe du patient**
- Si tu as l'âge, le sexe, et les symptômes, PASSE DIRECTEMENT à la recherche

**DÉTECTION DE NOUVELLE DEMANDE DANS LA MÊME CONVERSATION:**
- Si le patient demande des médicaments pour UN NOUVEAU CAS/SYMPTÔME différent:
  * EXEMPLE: Après avoir discuté de douleurs articulaires, il demande "et pour le mal de tête?"
  * EXEMPLE: "Mon fils a de la fièvre" (nouveau patient = nouveau cas)
  * EXEMPLE: "Et si j'ai une infection urinaire?" (nouveau symptôme = nouveau cas)
- **ALORS:** VÉRIFIE l'historique pour l'âge et le sexe:
  * Si l'âge et le sexe ont déjà été fournis dans la conversation ET qu'il s'agit du même patient → UTILISE CES INFOS et RECHERCHE IMMÉDIATEMENT
  * Si c'est un NOUVEAU patient différent (ex: "mon fils", "ma fille", "mon père") → DEMANDE l'âge et sexe de cette nouvelle personne
  * Si l'âge/sexe n'ont jamais été donnés → DEMANDE-LES d'abord

**STRATÉGIE DE RECHERCHE INTELLIGENTE - TRÈS IMPORTANT:**

Quand tu reçois les résultats d'une recherche de médicaments:

1. **CROSS-EXAMINE** les résultats avec la demande du patient:
   - Les médicaments trouvés correspondent-ils VRAIMENT aux symptômes?
   - La classe thérapeutique est-elle appropriée?
   - Les indications mentionnent-elles les symptômes du patient?

2. **Si les résultats ne correspondent PAS bien** (0 résultats OU résultats non pertinents):
   - **NE DIS PAS "désolé"** ou "je ne trouve pas"
   - **CHERCHE AVEC D'AUTRES MOTS-CLÉS** (maximum 3 itérations)
   - Essaie des alternatives médicales:
     * Exemple: "mal de tête" → essaie "paracétamol", "ibuprofène", "analgésique", "céphalée", "migraine"
     * Exemple: "infection urinaire" → essaie "antibiotique", "cystite", "infection urinaire", "quinolone", "nitrofurantoïne"
     * Exemple: "toux" → essaie "antitussif", "expectorant", "mucolytique", "bronchodilatateur"
   - Élargis ou affine les termes de recherche
   - Essaie composition ET classe thérapeutique séparément

3. **ITÉRATION AUTOMATIQUE:**
   - Recherche 1: Termes spécifiques (composition précise + classe thérapeutique)
   - Recherche 2 (si échec): Termes plus larges (seulement classe thérapeutique élargie)
   - Recherche 3 (si échec): Synonymes médicaux et termes alternatifs
   - Après 3 tentatives: Explique que tu n'as pas trouvé dans la base marocaine et conseille consultation

4. **ATTITUDE PROFESSIONNELLE:**
   - Sois CONFIANT et PROACTIF
   - Ne t'excuse PAS excessivement
   - Montre ton expertise en cherchant intelligemment
   - Si le patient conteste tes résultats, AFFINE ta recherche au lieu de t'excuser

**Directives importantes:**
- Sois empathique et rassurant avec le patient
- **TOUJOURS inclure patientAge et patientGender dans search_medicine_database**
- Utilise la fonction search_medicine_database quand tu as l'âge et le sexe du patient
- **Présente TOUTES les variantes disponibles** (dosages, présentations, quantités différentes)
  Exemple: "PARACETAMOL est disponible en:
  - 500 mg boîte de 20 (15 dhs)
  - 1000 mg boîte de 8 (25 dhs)
  - 500 mg boîte de 50 (30 dhs)"
- Mentionne toujours: le nom commercial, TOUS les dosages disponibles, les prix, et le mode d'emploi
- Adapte les recommandations à l'âge (posologies pédiatriques différentes)
- Pour les femmes en âge de procréer, mentionne les précautions grossesse/allaitement si pertinent
- Avertis des effets secondaires possibles
- Dans les cas graves, conseille de consulter un médecin immédiatement

**Cas d'urgence (conseille d'appeler le 141 pour l'ambulance):**
- Douleur thoracique ou difficulté respiratoire
- Saignement sévère
- Perte de conscience
- Fièvre très élevée (plus de 40°C)
- Symptômes d'allergie sévère

**Informations importantes:**
- Cette consultation ne remplace pas un médecin
- Les médicaments marqués "Tableau A" nécessitent une ordonnance
- Mentionne toujours l'importance de consulter le pharmacien pour vérifier la disponibilité

**RAPPEL: Réponds TOUJOURS dans la langue utilisée par le patient!**`;

    // Prepare the Chat Completions API request with function calling
    const requestBody = {
      model: "gpt-4o", // Use GPT-4o for best results with function calling
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages
      ],
      tools: [medicineSearchTool],
      tool_choice: "auto", // Let the model decide when to call the function
      temperature: 0.7,
      max_tokens: 2000
    };

    // Note: Chat Completions API doesn't use previous_response_id
    // Conversation continuity is maintained through the messages array

    console.log("Calling Chat Completions API with", conversationMessages.length, "messages...");

    // Call OpenAI Chat Completions API with function calling
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Chat Completions API failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      if (response.status === 401) {
        throw new Error('مفتاح API غير صالح أو منتهي الصلاحية');
      } else if (response.status === 429) {
        throw new Error('تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً');
      } else if (response.status === 500) {
        throw new Error('خطأ في خادم OpenAI. يرجى المحاولة لاحقاً');
      } else {
        throw new Error(`فشل في الاتصال بالخدمة: ${response.status}`);
      }
    }

    const responseData = await response.json();
    const assistantMessage = responseData.choices[0].message;

    console.log("\n" + "🤖 AI RESPONSE RECEIVED");
    console.log(`⏱️  Finish reason: ${responseData.choices[0].finish_reason}`);
    console.log(`🔧 Tool calls requested: ${assistantMessage.tool_calls ? 'Yes' : 'No'}`);

    // Check if the model wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("Function call requested:", assistantMessage.tool_calls[0].function.name);

      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let functionResult = null;

      // Execute the medicine search function
      if (functionName === "search_medicine_database") {
        console.log("\n" + "=".repeat(80));
        console.log("🔍 MEDICINE SEARCH FUNCTION CALLED");
        console.log("=".repeat(80));
        console.log("📋 Search Parameters:");
        console.log(JSON.stringify(functionArgs, null, 2));
        console.log("-".repeat(80));

        try {
          const searchParams = {
            symptoms: functionArgs.symptoms || '',
            condition: functionArgs.condition || '',
            composition: functionArgs.composition || '',
            therapeuticClass: functionArgs.therapeuticClass || '',
            patientAge: functionArgs.patientAge || null,
            patientGender: functionArgs.patientGender || null,
            maxPrice: functionArgs.maxPrice || null,
            limit: 20 // Increased to show all variants
          };

          console.log(`👤 Patient info: ${searchParams.patientAge} ans, ${searchParams.patientGender}`);

          const medicines = await searchMedicines(searchParams);

          console.log(`\n✅ SEARCH RESULTS: Found ${medicines.length} medicine(s)\n`);

          if (medicines.length > 0) {
            console.log("📦 Results (including all variants):");

            // Group by base medicine name for display
            const grouped = {};
            medicines.forEach(med => {
              const baseName = (med.nom_commercial || '').split(/\d/)[0].trim();
              if (!grouped[baseName]) grouped[baseName] = [];
              grouped[baseName].push(med);
            });

            Object.entries(grouped).forEach(([baseName, variants]) => {
              console.log(`\n${baseName}: ${variants.length} variant(s)`);
              variants.forEach((med, i) => {
                console.log(`  ${i + 1}. ${med.nom_commercial}`);
                console.log(`     - Dosage: ${med.dosage}`);
                console.log(`     - Presentation: ${med.presentation}`);
                console.log(`     - Price: ${med.ppv}`);
                console.log(`     - Score: ${med.relevance_score}`);
              });
            });

            functionResult = medicines.map(med => formatMedicineForAI(med)).join('\n\n---\n\n');

            console.log(`\n📤 Formatted ${medicines.length} medicine(s) (all variants) for AI response`);
          } else {
            console.log("❌ No medicines found matching the criteria");
            functionResult = "لم يتم العثور على أدوية مطابقة في قاعدة البيانات. يرجى تجربة معايير بحث مختلفة أو استشارة الصيدلي.";
          }
        } catch (error) {
          console.error("\n❌ MEDICINE SEARCH ERROR:", error);
          functionResult = "حدث خطأ أثناء البحث في قاعدة البيانات. يرجى المحاولة مرة أخرى.";
        }

        console.log("=".repeat(80) + "\n");
      }

      // Make a second API call with the function result
      console.log("Sending function result back to API...");

      const secondRequest = {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages,
          assistantMessage, // Include the assistant's function call
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: functionResult
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      };

      const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(secondRequest)
      });

      if (!secondResponse.ok) {
        throw new Error('فشل في الحصول على الرد النهائي من الخدمة');
      }

      const finalResponseData = await secondResponse.json();
      const finalMessage = finalResponseData.choices[0].message;

      console.log("\n✅ FINAL AI RESPONSE (with medicine recommendations)");
      const responsePreview = finalMessage.content.substring(0, 100) + '...';
      console.log(`📝 Response preview: ${responsePreview}`);
      console.log(`🆔 Response ID: ${finalResponseData.id}`);
      console.log("█".repeat(80) + "\n");

      // Return the final response
      return res.status(200).json({
        result: finalMessage.content,
        responseId: finalResponseData.id,
        threadId: finalResponseData.id // For backward compatibility with frontend
      });
    }

    // No function call needed, return the direct response
    console.log("\n✅ DIRECT AI RESPONSE (no medicine search needed)");
    const responsePreview = assistantMessage.content.substring(0, 100) + '...';
    console.log(`📝 Response preview: ${responsePreview}`);
    console.log(`🆔 Response ID: ${responseData.id}`);
    console.log("█".repeat(80) + "\n");

    return res.status(200).json({
      result: assistantMessage.content,
      responseId: responseData.id,
      threadId: responseData.id // For backward compatibility with frontend
    });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ result: `❌ خطأ في الخادم الداخلي: ${err.message}` });
  }
}
