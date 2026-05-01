import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

let db;

function ensureDb() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "tabibapp.sqlite");
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        age INTEGER,
        sex TEXT,
        allergies TEXT,
        medical_condition TEXT,
        language TEXT,
        consent_marketing INTEGER DEFAULT 0,
        consent_disclaimer INTEGER DEFAULT 1,
        source TEXT DEFAULT 'web_form',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  return db;
}

export function insertPatientProfile(profile) {
  const database = ensureDb();
  const sql = `
    INSERT INTO patient_profiles (
      full_name,
      email,
      phone,
      age,
      sex,
      allergies,
      medical_condition,
      language,
      consent_marketing,
      consent_disclaimer,
      source
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    profile.fullName || null,
    profile.email || null,
    profile.phone || null,
    Number.isFinite(profile.age) ? profile.age : null,
    profile.sex || null,
    profile.allergies || null,
    profile.medicalCondition || null,
    profile.language || null,
    profile.consentMarketing ? 1 : 0,
    profile.consentDisclaimer ? 1 : 0,
    profile.source || "web_form"
  ];

  return new Promise((resolve, reject) => {
    database.run(sql, params, function onInsert(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

export function listPatientProfiles(limit = 100) {
  const database = ensureDb();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 1000));

  return new Promise((resolve, reject) => {
    database.all(
      `
        SELECT
          id,
          full_name AS fullName,
          email,
          phone,
          age,
          sex,
          allergies,
          medical_condition AS medicalCondition,
          language,
          consent_marketing AS consentMarketing,
          consent_disclaimer AS consentDisclaimer,
          source,
          created_at AS createdAt
        FROM patient_profiles
        ORDER BY id DESC
        LIMIT ?
      `,
      [safeLimit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

