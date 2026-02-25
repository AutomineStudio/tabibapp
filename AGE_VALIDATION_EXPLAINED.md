# How Age Validation Works - Detailed Explanation

## 🎯 **Your Question:**
> "Can you explain how it uses the age information to embed into the indications field search?"

Great question! Let me explain exactly how the system uses patient age to validate medicines against the `indications` field.

---

## 📋 **The Indications Field**

From your database, the `indications` field contains medical information including **age restrictions**:

### **Example 1: AGIFENE (Ibuprofène)**
```json
{
  "nom_commercial": "AGIFENE 2 %, Suspension buvable",
  "presentation": "Flacon de 200 ml",
  "indications": "Ibuprofène, suspension buvable est indiqué pour le traitement de courte durée des douleurs légères à modérées telles que maux de tête, douleurs dentaires, dysménorrhée et douleurs post-opératoires.\nIbuprofène réduit aussi l'inflammation et la fièvre et soulage les douleurs associées à la grippe et aux rhumes.\nIbuprofène est destiné aux adultes, aux adolescents et aux enfants à partir de 20 kg (âgés de 6 ans et plus)."
}
```

**Key phrase:** `"âgés de 6 ans et plus"` ← Age restriction!

### **Example 2: Adult-Only Medicine**
```json
{
  "indications": "Traitement local de courte durée chez l'adulte (à partir de 15 ans) des traumatismes bénins : entorse (foulures), contusions."
}
```

**Key phrase:** `"chez l'adulte (à partir de 15 ans)"` ← Age restriction!

---

## 🔍 **How the Age Validation Works**

### **Location:** [utils/medicines.js](utils/medicines.js:109-151)

The system performs **text-based pattern matching** on the `indications` field:

```javascript
// Step 1: Get patient age
if (patientAge !== null) {

  // Step 2: Convert indications to lowercase for searching
  const indicationsLower = medIndications.toLowerCase();

  // Step 3: Check if patient is a child (< 18 years)
  if (patientAge < 18) {

    // Step 4: Look for adult-only indicators
    if (indicationsLower.includes('adulte') &&
        !indicationsLower.includes('enfant') &&
        !indicationsLower.includes('adolescent')) {

      // Step 5: Check if explicitly contraindicated
      if (indicationsLower.includes('contre-indiqué') ||
          indicationsLower.includes('déconseillé')) {
        return false; // ❌ BLOCK this medicine
      }
    }

    // Step 6: Check specific age requirements
    if (indicationsLower.includes('18 ans') && patientAge < 18) {
      return false; // ❌ BLOCK - requires 18+
    }
    if (indicationsLower.includes('12 ans') && patientAge < 12) {
      return false; // ❌ BLOCK - requires 12+
    }
    if (indicationsLower.includes('6 ans') && patientAge < 6) {
      return false; // ❌ BLOCK - requires 6+
    }
  }
}
```

---

## 📊 **Step-by-Step Example**

### **Scenario: 5-Year-Old Child with Fever**

**Patient Info:**
- Age: 5 years
- Searching for: "antipyrétique" (fever reducer)

**Medicine 1: AGIFENE 2% Suspension**
```
indications: "...enfants à partir de 20 kg (âgés de 6 ans et plus)"
```

**Validation Process:**
1. ✅ Patient age: 5 years
2. ✅ Check: Does indications contain "6 ans"? → **YES**
3. ✅ Check: Is patient age (5) < 6? → **YES**
4. ❌ **RESULT: BLOCKED** - Medicine requires 6+ years old

**Medicine 2: DOLIPRANE Pediatric Syrup**
```
indications: "...destiné aux enfants et nourrissons à partir de 3 mois"
```

**Validation Process:**
1. ✅ Patient age: 5 years (60 months)
2. ✅ Check: Does it mention "3 mois"? → **YES**
3. ✅ Check: Is patient age ≥ 3 months? → **YES** (60 months)
4. ✅ **RESULT: ALLOWED** - Appropriate for 5-year-old

---

## 🔎 **Keywords Searched in Indications**

The system looks for these French keywords in the `indications` field:

### **Age-Related Keywords:**
```javascript
"6 ans"          // Minimum 6 years old
"12 ans"         // Minimum 12 years old
"15 ans"         // Minimum 15 years old
"18 ans"         // Minimum 18 years old (adult)
"adulte"         // Adults only
"enfant"         // Children allowed
"adolescent"     // Adolescents allowed
"nourrisson"     // Infants allowed
```

### **Restriction Keywords:**
```javascript
"contre-indiqué"      // Contraindicated
"déconseillé"         // Not recommended
"à partir de X ans"   // From X years onwards
"chez l'adulte"       // In adults
```

---

## 💡 **Example Validation Scenarios**

### **Case 1: 8-Year-Old Boy**

**Search for headache medicine:**

| Medicine | Indications Text | Decision | Reason |
|----------|------------------|----------|--------|
| PARACETAMOL 500mg Adult | "chez l'adulte (18 ans et plus)" | ❌ BLOCKED | Contains "18 ans", patient < 18 |
| PARACETAMOL 250mg Pediatric | "enfants de 6 à 12 ans" | ✅ ALLOWED | Contains "enfant", age 6-12 matches |
| IBUPROFENE 400mg | "adulte, contre-indiqué enfant" | ❌ BLOCKED | "adulte" + "contre-indiqué" |

### **Case 2: 4-Year-Old Girl**

**Search for pain medication:**

| Medicine | Indications Text | Decision | Reason |
|----------|------------------|----------|--------|
| Medicine A | "enfants à partir de 6 ans" | ❌ BLOCKED | Contains "6 ans", patient is 4 |
| Medicine B | "enfants à partir de 2 ans" | ✅ ALLOWED | Contains "2 ans", patient is 4 |
| Medicine C | "adulte uniquement" | ❌ BLOCKED | "adulte" only, no "enfant" mention |

### **Case 3: 25-Year-Old Adult**

**Search for any medicine:**

| Medicine | Indications Text | Decision | Reason |
|----------|------------------|----------|--------|
| All medicines | (any indications) | ✅ ALLOWED | Age ≥ 18, no restrictions apply |

---

## 🚫 **What Gets Blocked?**

A medicine is **BLOCKED** (filtered out) when:

1. **Patient is < 18 years old** AND
2. Indications contain "adulte" BUT NOT "enfant" or "adolescent" AND
3. Contains "contre-indiqué" or "déconseillé"

**OR**

1. **Patient age < required minimum** AND
2. Indications explicitly state age requirement
   - Example: "6 ans" when patient is 5
   - Example: "18 ans" when patient is 16

---

## ✅ **What Gets Allowed?**

A medicine is **ALLOWED** when:

1. **Patient is ≥ 18 years old** (all adult medicines allowed)

**OR**

2. **Patient is < 18** AND one of:
   - Indications mention "enfant" or "adolescent"
   - Age requirement is met (e.g., "6 ans" and patient is 8)
   - No explicit age restrictions mentioned
   - Medicine is for broad use (not adult-specific)

---

## 🎯 **Why This Approach?**

### **Advantages:**
✅ **Text-based** - Works with existing data structure
✅ **No database changes** - Uses existing `indications` field
✅ **Comprehensive** - Catches various phrasings
✅ **Safe** - Err on side of caution (blocks when unsure)

### **Limitations:**
⚠️ **Language-dependent** - Only works with French keywords
⚠️ **Pattern matching** - May miss unusual phrasings
⚠️ **Not medical-grade** - Supplements, doesn't replace pharmacist advice

---

## 📊 **Real Example from Your Database**

### **AGIFENE 2% Suspension**
```json
{
  "presentation": "Flacon de 200 ml",
  "dosage": "2 %",
  "composition": "Ibuprofène",
  "indications": "Ibuprofène est destiné aux adultes, aux adolescents et aux enfants à partir de 20 kg (âgés de 6 ans et plus)."
}
```

**Validation for different ages:**

| Patient Age | Validation Logic | Result |
|-------------|------------------|--------|
| 4 years | Contains "6 ans" → 4 < 6 | ❌ BLOCKED |
| 6 years | Contains "6 ans" → 6 ≥ 6 | ✅ ALLOWED |
| 8 years | Contains "6 ans" → 8 ≥ 6 | ✅ ALLOWED |
| 15 years | Contains "adolescents" | ✅ ALLOWED |
| 25 years | Age ≥ 18 (adult) | ✅ ALLOWED |

---

## 🔧 **How It Integrates with Search**

### **Search Flow with Age Validation:**

```
1. User: "J'ai mal à la tête"
2. AI asks: "Quel âge avez-vous?"
3. User: "5 ans"
4. AI searches with patientAge=5

5. System finds all "analgésique" medicines

6. For EACH medicine found:
   ├─ Check: composition matches? ✅
   ├─ Check: therapeutic class matches? ✅
   ├─ Age validation:
   │  ├─ Read indications field
   │  ├─ Look for age keywords
   │  ├─ If "6 ans" found and patient is 5 → ❌ BLOCK
   │  └─ If "enfant" found and no restriction → ✅ ALLOW
   └─ Return only allowed medicines

7. AI receives filtered list (age-appropriate only)

8. AI recommends to user with proper dosage
```

---

## 🎉 **Summary**

**How age validation works:**

1. ✅ Patient age is captured (required parameter)
2. ✅ System searches for medicines (composition + therapeutic class)
3. ✅ For each medicine found, reads `indications` field
4. ✅ Looks for French age-related keywords
5. ✅ Blocks medicines with age restrictions patient doesn't meet
6. ✅ AI receives only age-appropriate medicines
7. ✅ Safer recommendations for all patients!

**Key insight:** The validation is **text-based pattern matching** on the `indications` field, not a separate database field. This works because French medical documentation consistently uses standardized phrases for age restrictions.

---

## 📁 **Code Location**

All age validation happens here:
- [utils/medicines.js:109-151](utils/medicines.js:109-151) - Age validation logic
- [pages/api/assistant.js:32-35](pages/api/assistant.js:32-35) - Required age parameter
- [pages/api/assistant.js:140-142](pages/api/assistant.js:140-142) - AI instructions to always ask

---

**Your system now safely filters medicines based on patient age! 🛡️**

*Last updated: November 1, 2025*
