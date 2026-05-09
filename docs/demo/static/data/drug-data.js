const DRUG_DATA = {
  ceftriaxone: {
    name: 'Ceftriaxone',
    class: 'Cephalosporin',
    aliases: ['ceftriaxone'],
    pkpd: 'Time-dependent beta-lactam activity.',
    mechanism: 'Inhibits bacterial cell-wall synthesis.',
    spectrum: 'Demo broad gram-negative and streptococcal coverage summary.',
    dose: { standard: 'Demo dosing placeholder. Verify with local references.', loading: '' },
    renalAdj: [{ crcl: 'All', regimen: 'Demo placeholder; verify renal/hepatic considerations.' }],
    sideEffects: ['Biliary sludging', 'Hypersensitivity'],
    monitoring: ['Clinical response', 'Allergy history'],
    publicNotes: ['Public demo content only; not a prescribing recommendation.'],
    localNotes: [],
    references: []
  },
  doxycycline: {
    name: 'Doxycycline',
    class: 'Tetracycline',
    aliases: ['doxycycline'],
    pkpd: 'AUC/MIC-associated activity.',
    mechanism: 'Inhibits bacterial protein synthesis.',
    spectrum: 'Demo atypical respiratory coverage summary.',
    dose: { standard: 'Demo dosing placeholder. Verify with local references.', loading: '' },
    renalAdj: [{ crcl: 'All', regimen: 'Demo placeholder.' }],
    sideEffects: ['Photosensitivity', 'GI irritation'],
    monitoring: ['Tolerance', 'Drug interactions'],
    publicNotes: ['Public demo content only.'],
    localNotes: [],
    references: []
  },
  metformin: {
    name: 'Metformin',
    class: 'Biguanide',
    aliases: ['metformin'],
    pkpd: 'Improves insulin sensitivity.',
    mechanism: 'Decreases hepatic glucose production.',
    spectrum: 'Non-antibiotic demo medication.',
    dose: { standard: 'Demo dosing placeholder.', loading: '' },
    renalAdj: [{ crcl: 'Reduced kidney function', regimen: 'Review appropriateness when kidney function declines.' }],
    sideEffects: ['GI intolerance', 'Lactic acidosis risk in severe illness'],
    monitoring: ['Renal function'],
    publicNotes: ['Shown to exercise renal medication alert UI.'],
    localNotes: [],
    references: []
  }
};
const DRUG_TAXONOMY = {
  ceftriaxone: { category: 'antimicrobial', subcategory: 'cephalosporin' },
  doxycycline: { category: 'antimicrobial', subcategory: 'tetracycline' },
  metformin: { category: 'metabolic', subcategory: 'diabetes' }
};
Object.entries(DRUG_DATA).forEach(([key, drug]) => {
  const taxonomy = DRUG_TAXONOMY[key] || {};
  if (!Array.isArray(drug.references)) drug.references = [];
  if (!Array.isArray(drug.publicNotes)) drug.publicNotes = [];
  if (!Array.isArray(drug.localNotes)) drug.localNotes = [];
  if (!drug.category && taxonomy.category) drug.category = taxonomy.category;
  if (!drug.subcategory && taxonomy.subcategory) drug.subcategory = taxonomy.subcategory;
});