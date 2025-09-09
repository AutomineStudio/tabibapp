(async()=>{
  const m = require('./lib/medicaments.js');
  await m.ensureMedicamentsLoaded();
  const a = await m.findByName('ELOXATINE 5 MG/ML');
  console.log('ELOXATINE', a);
  const b = await m.findByName('VIVALAN');
  console.log('VIVALAN', b);
})();