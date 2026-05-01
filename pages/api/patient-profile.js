import { insertPatientProfile, listPatientProfiles } from "../../utils/patientProfilesDb";

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const fullName = normalizeString(body.fullName);
      const email = normalizeString(body.email).toLowerCase();
      const phone = normalizeString(body.phone);
      const ageRaw = String(body.age ?? "").trim();
      const sex = normalizeString(body.sex);
      const allergies = normalizeString(body.allergies);
      const medicalCondition = normalizeString(body.medicalCondition);
      const language = normalizeString(body.language) || "ar";
      const consentDisclaimer = Boolean(body.consentDisclaimer);
      const consentMarketing = Boolean(body.consentMarketing);

      if (!consentDisclaimer) {
        return res.status(400).json({ error: "Consent is required" });
      }

      if (!ageRaw || !sex) {
        return res.status(400).json({ error: "Age and sex are required" });
      }

      const age = Number(ageRaw);
      if (!Number.isFinite(age) || age < 1 || age > 120) {
        return res.status(400).json({ error: "Invalid age" });
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email" });
      }

      if (phone) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 9) {
          return res.status(400).json({ error: "Invalid phone" });
        }
      }

      const result = await insertPatientProfile({
        fullName,
        email,
        phone,
        age,
        sex,
        allergies,
        medicalCondition,
        language,
        consentMarketing,
        consentDisclaimer,
        source: "chat_form"
      });

      return res.status(200).json({ ok: true, id: result.id });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to save profile" });
    }
  }

  if (req.method === "GET") {
    // Protect export endpoint with admin key if configured
    const configuredKey = process.env.ADMIN_API_KEY;
    if (configuredKey) {
      const provided = req.headers["x-admin-key"];
      if (provided !== configuredKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    try {
      const limit = req.query.limit || 100;
      const profiles = await listPatientProfiles(limit);
      return res.status(200).json({ ok: true, count: profiles.length, profiles });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to list profiles" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

