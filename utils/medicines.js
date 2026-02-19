import fs from 'fs';
import path from 'path';

let medicinesCache = null;

export async function loadMedicines() {
  if (medicinesCache) return medicinesCache;

  try {
    // Load from the pretty JSON file in tabib/data directory
    const filePath = path.join(process.cwd(), 'tabib', 'data', 'morocco_medicines_pretty.json');
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const medicines = JSON.parse(fileContent);

    medicinesCache = { medicines };
    console.log(`Loaded ${medicines.length} medicines from database`);
    return medicinesCache;
  } catch (error) {
    console.error('Error loading medicines database:', error);
    return { medicines: [] };
  }
}

/**
 * Advanced search function for medicines based on multiple criteria
 * Uses OR logic for composition and therapeutic class for better results
 * Now includes age/gender validation and shows all variants
 */
export async function searchMedicines({
  symptoms = '',
  condition = '',
  composition = '',
  therapeuticClass = '',
  patientAge = null,
  patientGender = null,
  maxPrice = null,
  limit = 20 // Increased to show more variants
}) {
  const { medicines } = await loadMedicines();

  // Normalize search terms and split into keywords
  const normalizeAndSplit = (text) => {
    return text.toLowerCase().trim().split(/[\s,;]+/).filter(t => t.length > 2);
  };

  const compositionKeywords = normalizeAndSplit(composition);
  const therapeuticKeywords = normalizeAndSplit(therapeuticClass);
  const symptomKeywords = normalizeAndSplit(symptoms || condition);

  console.log('Search keywords:', {
    composition: compositionKeywords,
    therapeutic: therapeuticKeywords,
    symptoms: symptomKeywords,
    age: patientAge,
    gender: patientGender
  });

  // Filter medicines based on criteria
  const results = medicines.filter(med => {
    // Only return commercialized medicines
    if (med.statut !== 'Commercialisé') {
      return false;
    }

    let matches = false;
    let hasSearchCriteria = false;

    const medComposition = (med.composition || '').toLowerCase();
    const medTherapeutic = (med.classe_therapeutique || '').toLowerCase();
    const medIndications = (med.indications || '').toLowerCase();

    // Search in composition OR therapeutic class (OR logic)
    if (compositionKeywords.length > 0 || therapeuticKeywords.length > 0) {
      hasSearchCriteria = true;

      // Check if ANY composition keyword matches
      const compositionMatch = compositionKeywords.some(keyword =>
        medComposition.includes(keyword)
      );

      // Check if ANY therapeutic class keyword matches
      const therapeuticMatch = therapeuticKeywords.some(keyword =>
        medTherapeutic.includes(keyword)
      );

      // OR logic: match if EITHER composition OR therapeutic class matches
      matches = compositionMatch || therapeuticMatch;
    }

    // Also search in indications if symptoms/conditions provided
    if (symptomKeywords.length > 0) {
      hasSearchCriteria = true;
      const indicationsMatch = symptomKeywords.some(keyword =>
        medIndications.includes(keyword)
      );

      // Combine with previous matches using OR
      matches = matches || indicationsMatch;
    }

    // Filter by price if specified
    if (maxPrice && med.ppv) {
      const price = parseFloat(med.ppv.replace(/[^\d.]/g, ''));
      if (price > maxPrice) {
        return false;
      }
    }

    // Validate age/gender appropriateness based on indications field
    if (matches && (patientAge !== null || patientGender !== null)) {
      const indicationsLower = medIndications.toLowerCase();

      // Age-based filtering
      if (patientAge !== null) {
        // Check for pediatric restrictions
        if (patientAge < 18) {
          // Look for age restrictions in indications
          if (indicationsLower.includes('adulte') &&
              !indicationsLower.includes('enfant') &&
              !indicationsLower.includes('adolescent')) {
            // Adult-only medicine, check if explicitly excludes children
            if (indicationsLower.includes('contre-indiqué') ||
                indicationsLower.includes('déconseillé')) {
              return false; // Skip this medicine for children
            }
          }

          // Check for minimum age requirements
          if (indicationsLower.includes('18 ans') && patientAge < 18) {
            return false;
          }
          if (indicationsLower.includes('12 ans') && patientAge < 12) {
            return false;
          }
          if (indicationsLower.includes('6 ans') && patientAge < 6) {
            return false;
          }
        }
      }

      // Gender-based considerations
      if (patientGender !== null) {
        const isFemale = patientGender === 'femme' || patientGender === 'fille';

        // Check for pregnancy/breastfeeding warnings (for adult females)
        if (isFemale && patientAge >= 18) {
          // Note: We don't filter out, but the AI will see these warnings
          // in the indications and can advise accordingly
        }
      }
    }

    // If no search criteria, don't return anything
    return hasSearchCriteria && matches;
  });

  // DON'T group here - we want ALL variants to appear
  // The grouping is just for display purposes in the logs and AI response
  // Keep all results as-is
  const resultsWithVariants = results;

  // Score and sort results by relevance
  const scoredResults = resultsWithVariants.map(med => {
    let score = 0;
    const medComposition = (med.composition || '').toLowerCase();
    const medTherapeutic = (med.classe_therapeutique || '').toLowerCase();
    const medIndications = (med.indications || '').toLowerCase();

    // Score for therapeutic class matches (highest priority)
    therapeuticKeywords.forEach(keyword => {
      if (medTherapeutic.includes(keyword)) {
        score += 10;
      }
    });

    // Score for composition matches (high priority)
    compositionKeywords.forEach(keyword => {
      if (medComposition.includes(keyword)) {
        score += 8;
      }
    });

    // Score for symptom/condition matches in indications
    symptomKeywords.forEach(keyword => {
      if (medIndications.includes(keyword)) {
        score += 5;
      }
    });

    // Bonus for medicines with hospital pricing (more reliable/available)
    if (med.prix_hospitalier) {
      score += 2;
    }

    // Bonus for lower price (more accessible)
    if (med.ppv) {
      const price = parseFloat(med.ppv.replace(/[^\d.]/g, ''));
      if (price < 50) score += 1; // Affordable
    }

    return { ...med, relevance_score: score };
  });

  // Sort by relevance and return limited results
  return scoredResults
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit);
}

/**
 * Quick search by name or composition
 */
export async function quickSearch(query, limit = 5) {
  const { medicines } = await loadMedicines();
  const searchTerm = query.toLowerCase().trim();

  const results = medicines.filter(med =>
    (med.nom_commercial || '').toLowerCase().includes(searchTerm) ||
    (med.composition || '').toLowerCase().includes(searchTerm) ||
    (med.classe_therapeutique || '').toLowerCase().includes(searchTerm)
  );

  return results.slice(0, limit);
}

/**
 * Get medicine by exact commercial name
 */
export async function getMedicineByName(name) {
  const { medicines } = await loadMedicines();
  return medicines.find(med =>
    (med.nom_commercial || '').toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get medicines by therapeutic class
 */
export async function getMedicinesByTherapeuticClass(therapeuticClass, limit = 10) {
  const { medicines } = await loadMedicines();
  const searchTerm = therapeuticClass.toLowerCase();

  return medicines
    .filter(med =>
      (med.classe_therapeutique || '').toLowerCase().includes(searchTerm) &&
      med.statut === 'Commercialisé'
    )
    .slice(0, limit);
}

/**
 * Format medicine information for display in Arabic
 */
export function formatMedicineInfo(medicine) {
  if (!medicine) return null;

  const presentation = medicine.presentation || 'غير محدد';
  const dosage = medicine.dosage || 'غير محدد';
  const composition = medicine.composition || 'غير محدد';
  const therapeuticClass = medicine.classe_therapeutique || 'غير محدد';
  const price = medicine.ppv || 'غير متوفر';
  const hospitalPrice = medicine.prix_hospitalier || 'غير متوفر';
  const distributor = medicine.distributeur || 'غير محدد';
  const tableau = medicine.tableau || 'غير محدد';

  // Extract clean indications (remove website footer)
  let indications = medicine.indications || 'غير محدد';
  if (indications.includes('Ajouté le:')) {
    indications = indications.split('Ajouté le:')[0].trim();
  }

  // Truncate long indications
  if (indications.length > 500) {
    indications = indications.substring(0, 500) + '...';
  }

  return {
    nom_commercial: medicine.nom_commercial,
    composition,
    classe_therapeutique: therapeuticClass,
    dosage,
    presentation,
    ppv: price,
    prix_hospitalier: hospitalPrice,
    distributeur: distributor,
    tableau,
    indications,
    statut: medicine.statut
  };
}

/**
 * Format medicine for AI response (concise format)
 * IMPORTANT: Includes presentation field to show different forms
 */
export function formatMedicineForAI(medicine) {
  if (!medicine) return null;

  // Extract clean indications
  let indications = medicine.indications || '';
  if (indications.includes('Ajouté le:')) {
    indications = indications.split('Ajouté le:')[0].trim();
  }

  return `**${medicine.nom_commercial}**
- Composition: ${medicine.composition}
- Classe thérapeutique: ${medicine.classe_therapeutique}
- Dosage: ${medicine.dosage}
- Présentation: ${medicine.presentation || 'Non spécifié'}
- Prix public: ${medicine.ppv}
- Prix hospitalier: ${medicine.prix_hospitalier || 'N/A'}
- Tableau: ${medicine.tableau}${medicine.tableau === 'A' ? ' (nécessite ordonnance)' : ''}
- Indications: ${indications.substring(0, 300)}${indications.length > 300 ? '...' : ''}`;
} 