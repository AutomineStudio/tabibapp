import fs from 'fs';
import path from 'path';
import readline from 'readline';

let medicinesCache = null;

export async function loadMedicines() {
  if (medicinesCache) return medicinesCache;

  try {
    // Use the JSONL file for better memory efficiency
    const filePath = path.join(process.cwd(), 'data', 'morocco_medicines.jsonl');
    const medicines = [];
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (line.trim()) {
        medicines.push(JSON.parse(line));
      }
    }

    medicinesCache = { medicines };
    return medicinesCache;
  } catch (error) {
    console.error('Error loading medicines database:', error);
    return { medicines: [] };
  }
}

export async function searchMedicines(query) {
  const { medicines } = await loadMedicines();
  const searchTerm = query.toLowerCase();

  return medicines.filter(med => 
    med.name?.toLowerCase().includes(searchTerm) ||
    med.active_ingredient?.toLowerCase().includes(searchTerm) ||
    med.category?.toLowerCase().includes(searchTerm)
  );
}

export async function getMedicineByName(name) {
  const { medicines } = await loadMedicines();
  return medicines.find(med => 
    med.name?.toLowerCase() === name.toLowerCase()
  );
}

export async function getMedicinesByCategory(category) {
  const { medicines } = await loadMedicines();
  return medicines.filter(med => 
    med.category?.toLowerCase() === category.toLowerCase()
  );
}

export function formatMedicineInfo(medicine) {
  if (!medicine) return null;
  
  const prescriptionStatus = medicine.prescription_required ? 
    "يحتاج لوصفة طبية" : 
    "متوفر بدون وصفة طبية";

  const price = typeof medicine.price === 'number' ? 
    `${medicine.price.toFixed(2)} درهم` :
    medicine.price?.toString() || 'غير متوفر';

  return `${medicine.name} (${medicine.active_ingredient || ''})
• الشكل: ${medicine.form || 'غير محدد'}
• التركيز: ${medicine.strength || 'غير محدد'}
• السعر: ${price}
• ${prescriptionStatus}
• العلبة تحتوي على: ${medicine.pack_size || 'غير محدد'} ${typeof medicine.pack_size === 'number' ? 'وحدة' : ''}
• الشركة المصنعة: ${medicine.manufacturer || 'غير محدد'}`;
} 