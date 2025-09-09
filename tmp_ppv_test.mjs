import { ensureMedicamentsLoaded, findByName } from './lib/medicaments.js';

await ensureMedicamentsLoaded();
const a = await findByName('ELOXATINE 5 MG/ML');
const b = await findByName('VIVALAN');
console.log('ELOXATINE price_mad:', a?.price_mad);
console.log('VIVALAN price_mad:', b?.price_mad);

