// ---------------------------------------------------------------------------
// Drug Reference Page
// ---------------------------------------------------------------------------
let drugsCat = 'all';
let drugsSub = 'all';

function inferDrugGroupFromClass(cls) {
  if (!cls) return 'other';
  const c = cls.toLowerCase();
  if (/cephalosporin|penicillin|carbapenem|lactam/.test(c)) return 'betalactam';
  if (/glycopeptide|oxazolidinone|lipopeptide/.test(c)) return 'grampos';
  if (/fluoroquinolone|quinolone/.test(c)) return 'quinolone';
  if (/antifungal|triazole|echinocandin|polyene/.test(c)) return 'antifungal';
  if (/antiviral/.test(c)) return 'antiviral';
  if (/insulin/.test(c)) return 'insulin';
  if (/anticoagulant|heparin|lmwh|low-molecular-weight heparin/.test(c)) return 'anticoagulant';
  if (/antiplatelet|p2y12|thienopyridine/.test(c)) return 'antiplatelet';
  if (/loop diuretic|mineralocorticoid receptor antagonist|aldosterone antagonist|angiotensin ii receptor blocker|arb|calcium channel blocker|hmg-coa|statin|beta.?blocker|antiarrhythmic|cardiac glycoside|nitrate|antianginal/.test(c)) return 'cardiovascular';
  if (/biguanide|sglt2|gliflozin|dpp-4|gliptin|sulfonylurea/.test(c)) return 'metabolic';
  if (/proton pump inhibitor|h2 receptor antagonist|h2 blocker|antiemetic|prokinetic/.test(c)) return 'gi';
  if (/bronchodilator|beta2|beta-2|beta agonist|beta-agonist|antimuscarinic|lama|respiratory|ics\/laba|inhaled corticosteroid|long-acting beta2 agonist/.test(c)) return 'respiratory';
  if (/corticosteroid|glucocorticoid|steroid/.test(c)) return 'steroid';
  if (/analgesic|antipyretic/.test(c)) return 'analgesic';
  if (/crystalloid|isotonic|hypotonic|glucose solution|glucose-saline|maintenance electrolyte/.test(c)) return 'fluid';
  if (/nsaid|cox-2|cox-1/.test(c)) return 'nsaid';
  if (/laxative|cathartic|stool softener|aperient|osmotic laxative|stimulant laxative|saline laxative|rectal laxative/.test(c)) return 'laxative';
  if (/hypnotic|z-drug|imidazopyridine|benzodiazepine|melatonin receptor|sedating antihistamine|sedating antidepressant|serotonin antagonist and reuptake inhibitor/.test(c)) return 'hypnotic';
  return 'other';
}

function normalizeDrugTaxonomyValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getDrugGroup(drugOrClass) {
  if (drugOrClass && typeof drugOrClass === 'object') {
    const category = normalizeDrugTaxonomyValue(drugOrClass.category);
    const subcategory = normalizeDrugTaxonomyValue(drugOrClass.subcategory);
    if (category === 'antimicrobial') return subcategory || inferDrugGroupFromClass(drugOrClass.class);
    if (category) return category;
    return inferDrugGroupFromClass(drugOrClass.class);
  }
  return inferDrugGroupFromClass(drugOrClass);
}

function getDrugTopCat(groupOrDrug) {
  if (groupOrDrug && typeof groupOrDrug === 'object') {
    const category = normalizeDrugTaxonomyValue(groupOrDrug.category);
    if (category) return category;
    return getDrugTopCat(getDrugGroup(groupOrDrug.class));
  }
  const group = groupOrDrug;
  return ['betalactam','grampos','quinolone','antifungal','antiviral','other'].includes(group) ? 'antimicrobial' : group;
}

function getDrugSubcategory(drug) {
  if (!drug || typeof drug !== 'object') return '';
  const topCategory = getDrugTopCat(drug);
  const subcategory = normalizeDrugTaxonomyValue(drug.subcategory);
  if (topCategory === 'antimicrobial') return subcategory || inferDrugGroupFromClass(drug.class);
  return subcategory;
}

const DRUG_NAV_CONFIG = [
  { id: 'all', label: 'All' },
  {
    id: 'antimicrobial',
    label: '🦠 Antimicrobials',
    subcategories: [
      { id: 'all', label: 'All Abx' },
      { id: 'betalactam', label: 'β-Lactams' },
      { id: 'grampos', label: 'Gram-Positive' },
      { id: 'quinolone', label: 'Quinolones' },
      { id: 'antifungal', label: 'Antifungals' },
      { id: 'antiviral', label: 'Antivirals' },
      { id: 'other', label: 'Other Abx' },
    ],
  },
  {
    id: 'cardiovascular',
    label: '❤️ Cardiovascular',
    subcategories: [
      { id: 'all', label: 'All CV' },
      { id: 'rate-rhythm', label: 'Rate / Rhythm' },
      { id: 'blood-pressure', label: 'BP / RAAS' },
      { id: 'diuretic', label: 'Diuretics' },
      { id: 'lipid', label: 'Lipids' },
      { id: 'antianginal', label: 'Antianginal' },
    ],
  },
  { id: 'anticoagulant', label: '🩸 Anticoagulants' },
  { id: 'antiplatelet', label: '🫀 Antiplatelets' },
  { id: 'metabolic', label: '🧪 Metabolic' },
  {
    id: 'gi',
    label: '🧯 GI / Acid',
    subcategories: [
      { id: 'all', label: 'All GI' },
      { id: 'acid', label: 'Acid Control' },
      { id: 'nausea', label: 'Nausea / Motility' },
    ],
  },
  {
    id: 'respiratory',
    label: '🫁 Respiratory',
    subcategories: [
      { id: 'all', label: 'All Resp' },
      { id: 'bronchodilator', label: 'Bronchodilators' },
      { id: 'controller', label: 'Controllers' },
    ],
  },
  { id: 'steroid', label: '🌤 Steroids' },
  { id: 'analgesic', label: '🩹 Analgesics' },
  { id: 'insulin', label: '💉 Insulins' },
  { id: 'fluid', label: '💧 IV Fluids' },
  { id: 'nsaid', label: '🔴 NSAIDs' },
  { id: 'laxative', label: '🌿 Laxatives' },
  { id: 'hypnotic', label: '💤 Hypnotics' },
];

const DRUG_NAV_BY_ID = Object.fromEntries(DRUG_NAV_CONFIG.map((item) => [item.id, item]));

function getDrugNavConfig() {
  return DRUG_NAV_CONFIG.map((item) => ({
    ...item,
    subcategories: Array.isArray(item.subcategories) ? item.subcategories.map((sub) => ({ ...sub })) : [],
  }));
}

function getDrugNavItem(category) {
  return DRUG_NAV_BY_ID[category] || null;
}

const DRUG_SAFETY_OVERRIDES = {
  vancomycin: {
    highlights: ['AKI risk', 'Nephrotoxin combo'],
    interactions: ['Other nephrotoxins can compound kidney injury.'],
  },
  linezolid: {
    highlights: ['Serotonergic', 'Myelosuppression'],
    interactions: ['SSRIs, SNRIs, MAO-active drugs, tramadol, and meperidine can precipitate serotonin toxicity.'],
  },
  daptomycin: {
    highlights: ['Myopathy', 'No pneumonia'],
    interactions: ['Concurrent statins increase myotoxicity risk.'],
  },
  azithromycin: {
    highlights: ['QT prolongation'],
    interactions: ['QT-prolonging drugs, warfarin, and digoxin need extra review.'],
  },
  doxycycline: {
    highlights: ['Pregnancy caution'],
    interactions: ['Iron, calcium, magnesium, and antacids reduce absorption.'],
    admin: ['Take with water and remain upright to reduce esophageal injury.'],
  },
  levofloxacin: {
    highlights: ['QT prolongation', 'Tendon toxicity'],
    interactions: ['Cations, QT-prolonging drugs, and steroids increase important risks.'],
  },
  ciprofloxacin: {
    highlights: ['QT prolongation'],
    interactions: ['Cations reduce absorption; warfarin and theophylline interactions matter.'],
  },
  tmpSmx: {
    highlights: ['Hyperkalemia', 'AKI risk'],
    interactions: ['ACEi/ARB, spironolactone, and warfarin are the highest-yield interaction checks.'],
  },
  'tmp-smx': {
    highlights: ['Hyperkalemia', 'AKI risk'],
    interactions: ['ACEi/ARB, spironolactone, and warfarin are the highest-yield interaction checks.'],
  },
  metronidazole: {
    highlights: ['Alcohol interaction'],
    interactions: ['Avoid alcohol during therapy and for 48 hours after; warfarin effect can rise.'],
  },
  hydroxyzine: {
    highlights: ['QT prolongation', 'Sedation'],
    interactions: ['Other QT-prolonging or sedating drugs increase risk.'],
  },
  triazolam: {
    highlights: ['CNS depression'],
    interactions: ['Azole antifungals and strong CYP3A4 inhibitors can cause severe oversedation.'],
  },
  zolpidem: {
    highlights: ['CNS depression'],
    interactions: ['Alcohol and other sedatives increase respiratory and fall risk.'],
  },
  lorazepam: {
    highlights: ['CNS depression'],
    interactions: ['Opioids and other sedatives increase respiratory suppression risk.'],
  },
  midazolam: {
    highlights: ['CNS depression'],
    interactions: ['Opioids and other sedatives increase respiratory suppression risk.'],
  },
  naproxen: {
    highlights: ['Bleeding risk', 'AKI risk'],
    interactions: ['Anticoagulants, antiplatelets, ACEi/ARB, and diuretics are the main combination checks.'],
  },
  celecoxib: {
    highlights: ['AKI risk'],
    interactions: ['Anticoagulants still raise bleeding risk, and ACEi/ARB plus diuretics worsen kidney risk.'],
  },
  diclofenac: {
    highlights: ['AKI risk'],
    interactions: ['Anticoagulants and other nephrotoxic or volume-depleting drugs increase risk.'],
  },
  indomethacin: {
    highlights: ['Bleeding risk', 'AKI risk'],
    interactions: ['Anticoagulants, ACEi/ARB, and diuretics are the highest-yield interaction review.'],
  },
  acetaminophen: {
    highlights: ['Hepatotoxicity'],
    interactions: ['Check for duplicate acetaminophen-containing products and regular alcohol use.'],
  },
  pantoprazole: {
    highlights: ['Long-term PPI'],
    interactions: ['Pantoprazole is usually preferred over omeprazole or esomeprazole when clopidogrel is on board.'],
    monitoring: ['Reassess indication and duration rather than leaving it on autopilot.'],
  },
  heparin: {
    highlights: ['Bleeding risk', 'HIT'],
    interactions: ['Antiplatelets, anticoagulants, fibrinolytics, and NSAIDs compound bleeding risk.'],
    monitoring: ['aPTT or anti-Xa plus platelet trend matter for therapeutic use.'],
  },
  apixaban: {
    highlights: ['Bleeding risk'],
    interactions: ['Strong dual P-gp and CYP3A4 inhibitors or inducers can materially change apixaban exposure.'],
  },
  warfarin: {
    highlights: ['Bleeding risk'],
    interactions: ['Antibiotics, azoles, amiodarone, rifampin, herbal products, and diet changes can shift INR quickly.'],
    monitoring: ['INR monitoring is essential.'],
  },
  aspirin: {
    highlights: ['Bleeding risk'],
    interactions: ['Other NSAIDs, anticoagulants, and alcohol increase GI or bleeding risk.'],
    admin: ['Chewable or non-enteric aspirin is preferred when a rapid ACS loading effect is needed.'],
  },
  clopidogrel: {
    highlights: ['Bleeding risk'],
    interactions: ['Avoid omeprazole or esomeprazole when possible; pantoprazole is usually the easiest PPI partner.'],
  },
  furosemide: {
    highlights: ['AKI risk', 'Hypokalemia'],
    interactions: ['NSAIDs blunt diuresis; lithium and aminoglycosides are especially high-yield interaction checks.'],
    monitoring: ['Trend volume status, electrolytes, and renal function rather than urine output alone.'],
  },
  spironolactone: {
    highlights: ['Hyperkalemia'],
    interactions: ['ACEi/ARB, potassium supplements, potassium salt substitutes, and NSAIDs materially raise risk.'],
    monitoring: ['Potassium and creatinine need an early recheck after initiation or titration.'],
  },
  losartan: {
    highlights: ['Hyperkalemia', 'AKI risk'],
    interactions: ['ACEi/aliskiren combinations, NSAIDs, and potassium-raising agents are the main interaction review.'],
  },
  amlodipine: {
    highlights: ['Edema'],
    interactions: ['Additive hypotension is the main routine interaction concern.'],
  },
  atorvastatin: {
    highlights: ['Myopathy'],
    interactions: ['Strong CYP3A4 inhibitors raise atorvastatin exposure and muscle toxicity risk.'],
    monitoring: ['Lipid response and muscle symptoms matter more than routine CK checks in asymptomatic patients.'],
  },
  empagliflozin: {
    highlights: ['Ketoacidosis', 'Volume depletion'],
    interactions: ['Insulin or insulin secretagogues raise hypoglycemia risk; loop diuretics increase volume depletion risk.'],
    admin: ['Hold for acute illness, prolonged fasting, or before surgery to reduce ketoacidosis risk.'],
  },
  omeprazole: {
    highlights: ['Long-term PPI'],
    interactions: ['Omeprazole can reduce clopidogrel activation; pantoprazole is usually the simpler alternative when both are needed.'],
    monitoring: ['Recheck indication and duration regularly.'],
  },
  famotidine: {
    highlights: ['AKI risk'],
    interactions: ['Renal impairment increases famotidine exposure and CNS adverse-effect risk.'],
  },
  prednisone: {
    highlights: ['Hyperglycemia', 'Immunosuppression'],
    interactions: ['NSAIDs increase ulcer risk, and insulin or other diabetes regimens often need adjustment during steroid bursts.'],
    monitoring: ['Glucose, infection symptoms, and taper plan need active review.'],
  },
  albuterol: {
    highlights: ['Tachycardia', 'Hypokalemia'],
    interactions: ['Other sympathomimetics and diuretics can amplify tachycardia or hypokalemia.'],
  },
  salbutamol: {
    highlights: ['Tachycardia', 'Hypokalemia'],
    interactions: ['Other sympathomimetics and diuretics can amplify tachycardia or hypokalemia.'],
  },
  tiotropium: {
    highlights: ['Anticholinergic'],
    interactions: ['Other anticholinergic drugs increase dry mouth, constipation, and urinary retention risk.'],
    admin: ['The inhalation capsules are inhaled, not swallowed.'],
  },
  ondansetron: {
    highlights: ['QT prolongation'],
    interactions: ['Other QT-prolonging drugs and electrolyte abnormalities raise arrhythmia risk.'],
  },
  metoclopramide: {
    highlights: ['Extrapyramidal', 'Sedation'],
    interactions: ['Antipsychotics and other dopamine-blocking or sedating drugs increase important toxicity risk.'],
    monitoring: ['Watch for akathisia, dystonia, parkinsonism, or tardive dyskinesia.'],
  },
  trazodone: {
    highlights: ['CNS depression', 'QT prolongation'],
    interactions: ['Other sedatives, alcohol, and serotonergic drugs can compound oversedation or toxicity.'],
  },
  'budesonide-formoterol': {
    highlights: ['Thrush'],
    interactions: ['Other sympathomimetics can add tremor or tachycardia; strong CYP3A4 inhibitors may increase steroid exposure.'],
    admin: ['Rinse the mouth after each use and do not use this inhaler as the only rescue plan for acute distress unless the regimen specifically calls for it.'],
  },
  amiodarone: {
    highlights: ['QT prolongation', 'Bradycardia'],
    interactions: ['Warfarin, digoxin, statins, and many QT-prolonging drugs need active review when amiodarone is started or stopped.'],
    monitoring: ['ECG, thyroid, liver, lung, and eye follow-up matter for ongoing therapy.'],
  },
  metoprolol: {
    highlights: ['Bradycardia'],
    interactions: ['Other AV-nodal blockers can compound bradycardia or hypotension.'],
  },
  digoxin: {
    highlights: ['Narrow therapeutic index', 'AKI risk'],
    interactions: ['Amiodarone, verapamil, macrolides, and worsening kidney function can quickly raise digoxin exposure.'],
    monitoring: ['Drug level, renal function, potassium, and heart rate matter together.'],
  },
  nitroglycerin: {
    highlights: ['Hypotension'],
    interactions: ['PDE-5 inhibitors and other vasodilators can cause dangerous hypotension.'],
    admin: ['For acute angina, use the prescribed sublingual form correctly and escalate if pain persists after emergency-threshold dosing.'],
  },
};

function normalizeDrugText(drug) {
  return [
    drug.name,
    drug.class,
    drug.pkpd,
    drug.mechanism,
    drug.spectrum,
    ...(drug.sideEffects || []),
    ...(drug.monitoring || []),
    ...(drug.publicNotes || []),
    ...(drug.localNotes || []),
  ].join(' ').toLowerCase();
}

function pushUnique(bucket, item) {
  if (item && !bucket.includes(item)) bucket.push(item);
}

function deriveDrugSafetyProfile(key, drug) {
  const text = normalizeDrugText(drug);
  const profile = { highlights: [], interactions: [], admin: [], monitoring: [] };

  const rules = [
    { test: /qt prolong|qtc/, target: 'highlights', value: 'QT prolongation' },
    { test: /serotonin|serotonergic/, target: 'highlights', value: 'Serotonergic' },
    { test: /hyperkal/, target: 'highlights', value: 'Hyperkalemia' },
    { test: /nephrotox|aki|renal failure|renal impairment/, target: 'highlights', value: 'AKI risk' },
    { test: /bleeding|platelet dysfunction|thrombocytopenia/, target: 'highlights', value: 'Bleeding risk' },
    { test: /pregnan|teratogen|children <8/, target: 'highlights', value: 'Pregnancy caution' },
    { test: /g6pd/, target: 'highlights', value: 'G6PD caution' },
    { test: /do not crush|enteric-coated|upright/, target: 'admin', value: 'Administration caution applies.' },
    { test: /dialysis|hemodialysis|haemodialysis|post-hd/, target: 'admin', value: 'Dialysis-specific dosing is required.' },
    { test: /statin/, target: 'interactions', value: 'Review concurrent statin use.' },
    { test: /warfarin|inr/, target: 'interactions', value: 'Check warfarin or INR interaction risk.' },
    { test: /antacid|milk|cation|iron|magnesium|calcium/, target: 'interactions', value: 'Cations or antacids may impair absorption.' },
    { test: /alcohol|disulfiram/, target: 'interactions', value: 'Alcohol interaction warning applies.' },
    { test: /myopathy|ck weekly|rhabdomyolysis/, target: 'monitoring', value: 'CK monitoring is important.' },
    { test: /cbc weekly|myelosuppression|thrombocytopenia|bone marrow/, target: 'monitoring', value: 'CBC monitoring is important.' },
    { test: /respiratory depression|sedation|cns depression/, target: 'highlights', value: 'CNS/respiratory depression' },
  ];

  rules.forEach((rule) => {
    if (rule.test.test(text)) pushUnique(profile[rule.target], rule.value);
  });

  const override = DRUG_SAFETY_OVERRIDES[key] || {};
  ['highlights', 'interactions', 'admin', 'monitoring'].forEach((bucket) => {
    (override[bucket] || []).forEach((item) => pushUnique(profile[bucket], item));
  });

  return profile;
}

function buildDrugSearchKey(drug, cardName, safetyProfile) {
  return (
    drug.name + ' ' +
    cardName + ' ' +
    drug.class + ' ' +
    (drug.category || '') + ' ' +
    (drug.subcategory || '') + ' ' +
    ((drug.aliases || []).join(' ')) + ' ' +
    safetyProfile.highlights.join(' ') + ' ' +
    safetyProfile.interactions.join(' ')
  ).toLowerCase();
}

function buildDrugCardMeta(key, drug) {
  const group = getDrugGroup(drug);
  const topCategory = getDrugTopCat(drug);
  const subcategory = getDrugSubcategory(drug);
  const cardName = drug.shortName || drug.name;
  const safetyProfile = deriveDrugSafetyProfile(key, drug);
  return {
    key,
    drug,
    group,
    topCategory,
    subcategory,
    cardName,
    safetyProfile,
    searchKey: buildDrugSearchKey(drug, cardName, safetyProfile),
  };
}

const DRUG_REFERENCE_INDEX = Object.entries(DRUG_DATA).map(([key, drug]) => buildDrugCardMeta(key, drug));

function getVisibleDrugEntries(options = {}) {
  const query = String(options.query || '').toLowerCase().trim();
  const category = options.category || 'all';
  const subcategory = options.subcategory || 'all';

  return DRUG_REFERENCE_INDEX.filter((meta) => {
    let categoryOk;
    if (category === 'all') {
      categoryOk = true;
    } else if (category === 'antimicrobial') {
      categoryOk = meta.topCategory === 'antimicrobial' && (subcategory === 'all' || meta.subcategory === subcategory || meta.group === subcategory);
    } else {
      categoryOk = meta.topCategory === category && (subcategory === 'all' || meta.subcategory === subcategory);
    }
    const searchOk = !query || meta.searchKey.includes(query);
    return categoryOk && searchOk;
  });
}

function renderFlagChip(text, tone, className = 'dp-flag-chip') {
  return `<span class="${className} ${tone}">${text}</span>`;
}

function buildDrugPanelPatientWarnings(key) {
  if (typeof getActivePatientClinicalSnapshot !== 'function') return '';
  const snapshot = getActivePatientClinicalSnapshot();
  if (!snapshot) return '';

  const latest = snapshot.latestLabs || {};
  const previous = snapshot.previousLabs || {};
  const warnings = [];
  const add = (tone, text) => warnings.push({ tone, text });

  if (snapshot.egfr !== null && snapshot.egfr < 45) {
    add(snapshot.egfr < 30 ? 'danger' : 'warn', `Active patient eGFR is ${snapshot.egfr}. Review the renal adjustment table against this current value.`);
  }
  if (latest.Cr !== undefined && previous.Cr !== undefined && latest.Cr > previous.Cr + 0.2) {
    add('warn', `Creatinine is rising (${previous.Cr} → ${latest.Cr}). Static renal tables may understate risk when kidney function is changing quickly.`);
  }

  if (key === 'tmp-smx') {
    if (latest.K !== undefined && latest.K >= 5.0) add(latest.K >= 5.5 ? 'danger' : 'warn', `Potassium is ${latest.K}. TMP-SMX can worsen hyperkalemia.`);
  }
  if (key === 'vancomycin' && snapshot.egfr !== null && snapshot.egfr < 30) {
    add('danger', 'Vancomycin is in a high-risk renal dosing range. Level-guided dosing is likely required.');
  }
  if (key === 'nitrofurantoin' && snapshot.egfr !== null && snapshot.egfr < 30) {
    add('danger', 'Current renal function is below the usual nitrofurantoin threshold.');
  }
  if (key === 'ganciclovir') {
    if (latest.ANC !== undefined && latest.ANC < 1000) add(latest.ANC < 500 ? 'danger' : 'warn', `ANC is ${latest.ANC}. Ganciclovir can worsen neutropenia.`);
    if (latest.Plt !== undefined && latest.Plt < 100) add('warn', `Platelets are ${latest.Plt}. Ganciclovir can worsen cytopenias.`);
  }
  if (key === 'enoxaparin') {
    if (latest.Plt !== undefined && latest.Plt < 100) add('warn', `Platelets are ${latest.Plt}. Recheck bleeding and HIT context before ongoing enoxaparin dosing.`);
    if (snapshot.egfr !== null && snapshot.egfr < 30) add('warn', 'Renal impairment increases enoxaparin accumulation and bleeding risk.');
  }
  if (key === 'metformin') {
    if (latest.HCO3 !== undefined && latest.HCO3 < 20) add('warn', `HCO3 is ${latest.HCO3}. Active acidosis or sepsis makes metformin a poor fit even before the chronic renal threshold.`);
    if (snapshot.egfr !== null && snapshot.egfr < 30) add('danger', 'Current renal function is below the usual metformin stop threshold.');
  }

  if (warnings.length === 0) return '';

  const chips = [];
  if (snapshot.egfr !== null) chips.push(`eGFR ${snapshot.egfr}`);
  if (latest.Cr !== undefined) chips.push(`Cr ${latest.Cr}`);
  if (latest.K !== undefined) chips.push(`K ${latest.K}`);
  if (latest.ANC !== undefined) chips.push(`ANC ${latest.ANC}`);
  if (latest.Plt !== undefined) chips.push(`Plt ${latest.Plt}`);

  return `
      <div class="dp-section" id="dp-sec-patient-context">
        <div class="dp-section-hdr">
          <span>🧍 Active Patient Warnings</span>
        </div>
        <div class="dp-section-body">
          <div class="dp-flag-block">
            <div class="dp-flag-block-title">${escHtml(snapshot.name)}</div>
            <div class="dp-flag-block-body">${escHtml(snapshot.dx || '—')}${chips.length ? ` · ${escHtml(chips.join(' · '))}` : ''}</div>
          </div>
          <div class="dp-flag-list">
            ${warnings.map((warning) => `
              <div class="dp-flag-block">
                <div class="dp-flag-block-title" style="color:${warning.tone === 'danger' ? 'var(--red)' : warning.tone === 'warn' ? 'var(--warn)' : 'var(--accent)'};">${warning.tone === 'danger' ? 'High Risk' : warning.tone === 'warn' ? 'Review Needed' : 'Context'}</div>
                <div class="dp-flag-block-body">${escHtml(warning.text)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
}

function renderDrugsPatientHook(snapshot) {
  const hook = document.getElementById('drugs-patient-hook');
  const nameEl = document.getElementById('drugs-patient-name');
  const chipsEl = document.getElementById('drugs-patient-chips');
  if (!hook || !nameEl || !chipsEl) return;

  if (!snapshot) {
    hook.style.display = 'none';
    return;
  }

  const chips = [];
  if (snapshot.egfr !== null && snapshot.egfr !== undefined) chips.push({ label: 'eGFR', value: `${snapshot.egfr}`, tone: snapshot.egfr < 30 ? 'danger' : snapshot.egfr < 45 ? 'warn' : 'info' });
  if (snapshot.latestLabs && snapshot.latestLabs.Cr !== undefined) chips.push({ label: 'Cr', value: `${snapshot.latestLabs.Cr}`, tone: snapshot.latestLabs.Cr >= 2 ? 'warn' : 'info' });
  if (snapshot.latestLabs && snapshot.latestLabs.K !== undefined) chips.push({ label: 'K', value: `${snapshot.latestLabs.K}`, tone: snapshot.latestLabs.K >= 5.5 || snapshot.latestLabs.K < 3 ? 'danger' : snapshot.latestLabs.K >= 5 || snapshot.latestLabs.K < 3.5 ? 'warn' : 'info' });
  if (snapshot.latestLabs && snapshot.latestLabs.ANC !== undefined) chips.push({ label: 'ANC', value: `${snapshot.latestLabs.ANC}`, tone: snapshot.latestLabs.ANC < 500 ? 'danger' : snapshot.latestLabs.ANC < 1000 ? 'warn' : 'info' });

  nameEl.textContent = snapshot.name;
  chipsEl.innerHTML = chips.map((chip) => `<span class="patient-hook-chip ${chip.tone}">${chip.label} ${chip.value}</span>`).join('');
  hook.style.display = 'flex';
}

function parseRenalAdjustmentBounds(label) {
  const text = String(label || '').trim();
  if (!text || !/\d/.test(text)) return null;

  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      inclusiveMin: true,
      inclusiveMax: true,
    };
  }

  const comparatorMatch = text.match(/^(≥|<=|≤|>=|>|<)\s*(\d+(?:\.\d+)?)/);
  if (comparatorMatch) {
    const value = parseFloat(comparatorMatch[2]);
    switch (comparatorMatch[1]) {
      case '≥':
      case '>=':
        return { min: value, max: Infinity, inclusiveMin: true, inclusiveMax: true };
      case '>':
        return { min: value, max: Infinity, inclusiveMin: false, inclusiveMax: true };
      case '≤':
      case '<=':
        return { min: -Infinity, max: value, inclusiveMin: true, inclusiveMax: true };
      case '<':
        return { min: -Infinity, max: value, inclusiveMin: true, inclusiveMax: false };
    }
  }

  return null;
}

function renalBoundsContainValue(bounds, value) {
  if (!bounds || value === null || value === undefined || Number.isNaN(value)) return false;
  const aboveMin = bounds.inclusiveMin ? value >= bounds.min : value > bounds.min;
  const belowMax = bounds.inclusiveMax ? value <= bounds.max : value < bounds.max;
  return aboveMin && belowMax;
}

function matchRenalAdjustmentRow(rows, renalEstimate) {
  if (!Array.isArray(rows) || renalEstimate === null || renalEstimate === undefined || Number.isNaN(renalEstimate)) {
    return { index: -1, message: '', tone: 'info' };
  }

  let sawSpecialRow = false;
  for (let index = 0; index < rows.length; index += 1) {
    const parsed = parseRenalAdjustmentBounds(rows[index].crcl);
    if (!parsed) {
      sawSpecialRow = true;
      continue;
    }
    if (renalBoundsContainValue(parsed, renalEstimate)) {
      return {
        index,
        tone: renalEstimate < 30 ? 'warn' : 'info',
        message: `Active patient eGFR ${renalEstimate} maps to the ${rows[index].crcl} row.`,
      };
    }
  }

  return {
    index: -1,
    tone: sawSpecialRow ? 'warn' : 'info',
    message: sawSpecialRow
      ? `Active patient eGFR ${renalEstimate} is available, but dialysis/special renal rows are not auto-matched.`
      : `Active patient eGFR ${renalEstimate} did not map cleanly to a renal-adjustment row.`,
  };
}

function getDrugSearchQuery() {
  const searchEl = document.getElementById('drugs-search');
  return searchEl ? searchEl.value || '' : '';
}

function createDrugToolbarButton(className, id, label, isActive, onClick) {
  const button = document.createElement('button');
  button.className = className + (isActive ? ' active' : '');
  button.dataset[className === 'drugs-cat-btn' ? 'cat' : 'sub'] = id;
  button.textContent = label;
  button.onclick = onClick;
  return button;
}

function renderDrugToolbar() {
  const catList = document.getElementById('drugs-cat-list');
  const subrow = document.getElementById('drugs-subrow');
  const subList = document.getElementById('drugs-sub-list');
  if (!catList || !subrow || !subList) return;

  catList.innerHTML = '';
  DRUG_NAV_CONFIG.forEach((item) => {
    catList.appendChild(createDrugToolbarButton('drugs-cat-btn', item.id, item.label, drugsCat === item.id, () => setDrugCat(item.id)));
  });

  const navItem = getDrugNavItem(drugsCat);
  const subcategories = navItem && Array.isArray(navItem.subcategories) ? navItem.subcategories : [];
  if (subcategories.length === 0) {
    subrow.style.display = 'none';
    subList.innerHTML = '';
    return;
  }

  subrow.style.display = 'flex';
  subList.innerHTML = '';
  subcategories.forEach((item) => {
    subList.appendChild(createDrugToolbarButton('drugs-sub-btn', item.id, item.label, drugsSub === item.id, () => setDrugSub(item.id)));
  });
}

function createDrugCard(meta) {
  const { key, drug, group, topCategory, subcategory, cardName, safetyProfile, searchKey } = meta;
  const pkpdType = /time-dep/i.test(drug.pkpd) ? 'time'
                 : /conc-dep|concentration/i.test(drug.pkpd) ? 'conc' : 'auc';
  const badgeLabel = drug.badge || (pkpdType === 'time' ? 'Time-dep' : pkpdType === 'conc' ? 'Conc-dep' : 'AUC/MIC');
  const badgeClass = drug.badge ? 'route' : pkpdType;
  const alertChips = safetyProfile.highlights.slice(0, 2).map((item) => {
    const tone = /qt|hyperkal|aki|bleeding|cns/i.test(item) ? 'danger' : /pregnancy|g6pd|serotonergic/i.test(item) ? 'warn' : 'info';
    return renderFlagChip(item, tone, 'drug-alert-chip');
  }).join('');
  const spectrumShort = (drug.spectrum || '')
    .replace(/\(.*?\)/g, '').replace(/,\s*/g, ' · ').trim().substring(0, 90);

  const card = document.createElement('div');
  card.className = `drug-card drug-group-${group}`;
  card.dataset.group = group;
  card.dataset.topCategory = topCategory;
  card.dataset.subcategory = subcategory;
  card.dataset.searchkey = searchKey;
  card.innerHTML = `
      <div class="drug-card-name">${cardName}</div>
      <div class="drug-card-class">${drug.class}</div>
      ${drug.composition
        ? `<div class="drug-card-composition">${drug.composition}</div>`
        : `<div class="drug-card-spectrum">${spectrumShort}</div>`}
      ${alertChips ? `<div class="drug-card-alerts">${alertChips}</div>` : ''}
      <div class="drug-card-footer">
        <span class="pkpd-type-badge ${badgeClass}" style="font-size:0.52rem;padding:2px 6px">${badgeLabel}</span>
      </div>`;
  card.onclick = () => openDrugPanel(key);
  return card;
}

function renderVisibleDrugCards() {
  const grid = document.getElementById('drug-grid');
  if (!grid) return;

  const visibleEntries = getVisibleDrugEntries({
    query: getDrugSearchQuery(),
    category: drugsCat,
    subcategory: drugsSub,
  });

  grid.innerHTML = '';
  if (visibleEntries.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'drugs-empty';
    emptyEl.id = 'drugs-empty';
    emptyEl.textContent = 'No drugs found.';
    grid.appendChild(emptyEl);
    return;
  }

  visibleEntries.forEach((meta) => {
    grid.appendChild(createDrugCard(meta));
  });
}

function renderDrugPage() {
  renderDrugToolbar();
  renderVisibleDrugCards();
}

function filterDrugs() {
  renderVisibleDrugCards();
}

function setDrugCat(cat) {
  drugsCat = cat;
  drugsSub = 'all';
  renderDrugToolbar();
  renderVisibleDrugCards();
}

function setDrugSub(sub) {
  drugsSub = sub;
  renderDrugToolbar();
  renderVisibleDrugCards();
}

// Load data when views become active
const origSwitchView = switchView;
switchView = function(name) {
  origSwitchView(name);
  if (name === 'census') loadCensus();
  if (name === 'calculator') loadCalcPatientList();
  if (name === 'abx' && !document.querySelector('.abx-site-card')) renderAbxGuide();
  if (name === 'drugs') renderDrugPage();
  if (name === 'abx') renderAbxPatientHook(typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null);
  if (name === 'drugs') renderDrugsPatientHook(typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null);
};

// ---------------------------------------------------------------------------
// Drug Detail Side Panel
// ---------------------------------------------------------------------------
function openDrugPanel(key) {
  const drug = DRUG_DATA[key];
  if (!drug) return;
  if (typeof closePatientContextDrawer === 'function') closePatientContextDrawer();
  const panel = document.getElementById('drug-panel');
  panel.dataset.drugKey = key;
  const savedNotes = localStorage.getItem('drug-notes-' + key) || '';
  const safetyProfile = deriveDrugSafetyProfile(key, drug);
  const patientWarningSection = buildDrugPanelPatientWarnings(key);
  const snapshot = typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null;
  const renalMatch = matchRenalAdjustmentRow(drug.renalAdj || [], snapshot && snapshot.egfr !== null ? snapshot.egfr : null);

  const pkpdType = /time-dep/i.test(drug.pkpd) ? 'time' : /conc-dep|concentration/i.test(drug.pkpd) ? 'conc' : 'auc';
  const pkpdLabel = drug.badge || (pkpdType === 'time' ? 'Time-dependent' : pkpdType === 'conc' ? 'Conc-dependent' : 'AUC/MIC');
  const pkpdClass = drug.badge ? 'route' : pkpdType;

  const renalRows = drug.renalAdj.map((r, index) =>
    `<tr class="${index === renalMatch.index ? 'dp-renal-match' : ''}"><td class="dp-crcl">${r.crcl}</td><td>${r.regimen}</td></tr>`
  ).join('');
  const renalMatchNote = renalMatch.message
    ? `<div class="dp-flag-chip ${renalMatch.tone}" style="margin-top:0.4rem;">${escHtml(renalMatch.message)}</div>`
    : '';

  const seItems  = drug.sideEffects.map(s => `<div class="dp-list-item warn"><span>${s}</span></div>`).join('');
  const monItems = drug.monitoring.map(m => `<div class="dp-list-item mon"><span>${m}</span></div>`).join('');
  const publicNotes = Array.isArray(drug.publicNotes) ? drug.publicNotes : [];
  const localNotes = Array.isArray(drug.localNotes) ? drug.localNotes : (Array.isArray(drug.twNotes) ? drug.twNotes : []);
  const publicItems = publicNotes.map(t =>
    `<div class="dp-list-item"><span>${t}</span></div>`
  ).join('');
  const localItems  = localNotes.map(t =>
    `<div class="dp-list-item tw"><span>${t.replace(/^🇹🇼\s*/,'')}</span></div>`
  ).join('');
  const publicNotesSection = publicItems ? `
      <div class="dp-section collapsed" id="dp-sec-public-notes">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-public-notes')">
          <span>🌐 General Notes</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">${publicItems}</div>
      </div>` : '';
  const localNotesSection = PORTAL_CONFIG.showLocalDrugNotes && localItems ? `
      <div class="dp-section collapsed" id="dp-sec-local-notes">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-local-notes')" style="color:var(--accent)">
          <span>🇹🇼 ${PORTAL_CONFIG.localDrugNotesTitle}</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">${localItems}</div>
      </div>` : '';
  const references = Array.isArray(drug.references) ? drug.references : [];
  const refItems = references.map(r =>
    r.url
      ? `<div class="dp-ref-item"><a href="${r.url}" target="_blank" rel="noopener">${r.text}</a></div>`
      : `<div class="dp-ref-item"><span>${r.text}</span></div>`
  ).join('');
  const referencesSection = refItems ? `
      <div class="dp-section collapsed" id="dp-sec-refs">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-refs')">
          <span>📚 References</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">${refItems}</div>
      </div>` : '';
  const safetyHighlights = safetyProfile.highlights.map((item) =>
    renderFlagChip(item, /qt|hyperkal|aki|bleeding|cns/i.test(item) ? 'danger' : /pregnancy|g6pd|serotonergic/i.test(item) ? 'warn' : 'info')
  ).join('');
  const safetyBlocks = [
    safetyProfile.interactions.length ? {
      title: 'Interaction Checks',
      body: safetyProfile.interactions.join(' ')
    } : null,
    safetyProfile.admin.length ? {
      title: 'Administration / Practical',
      body: safetyProfile.admin.join(' ')
    } : null,
    safetyProfile.monitoring.length ? {
      title: 'Monitoring Focus',
      body: safetyProfile.monitoring.join(' ')
    } : null,
  ].filter(Boolean).map((block) => `
      <div class="dp-flag-block">
        <div class="dp-flag-block-title">${block.title}</div>
        <div class="dp-flag-block-body">${block.body}</div>
      </div>`).join('');
  const safetySection = (safetyHighlights || safetyBlocks) ? `
      <div class="dp-section collapsed" id="dp-sec-safety">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-safety')">
          <span>🛡 Safety Overlay</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">
          ${safetyHighlights ? `<div class="dp-flag-grid">${safetyHighlights}</div>` : ''}
          ${safetyBlocks ? `<div class="dp-flag-list">${safetyBlocks}</div>` : ''}
        </div>
      </div>` : '';
  const fluidInfoRows = [
    drug.composition ? { label: 'Composition', value: drug.composition } : null,
    drug.sizes ? { label: 'Bag Sizes', value: Array.isArray(drug.sizes) ? drug.sizes.join(' · ') : drug.sizes } : null,
    drug.osmolarity ? { label: 'Osmolarity', value: drug.osmolarity } : null,
    drug.calories ? { label: 'Calories', value: drug.calories } : null,
  ].filter(Boolean).map(item =>
    `<div style="margin-top:5px;font-size:0.62rem"><b>${item.label}:</b> ${item.value}</div>`
  ).join('');
  const fluidInfoSection = fluidInfoRows ? `
      <div class="dp-section collapsed" id="dp-sec-fluid">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-fluid')">
          <span>💧 IV Fluid Details</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">${fluidInfoRows}</div>
      </div>` : '';

  panel.innerHTML = `
    <div class="dp-header">
      <div class="dp-header-info">
        <div class="dp-name">${drug.name}</div>
        <div class="dp-class">${drug.class}</div>
      </div>
      <button class="dp-close" onclick="closeDrugPanel()">✕</button>
    </div>
    <div class="dp-body">
      <div class="dp-section" id="dp-sec-dose">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-dose')">
          <span>💊 Dosing &amp; Renal Adjustment</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">
          <div style="font-size:0.65rem;font-weight:600;margin-bottom:4px;color:var(--text)">${drug.dose.standard}</div>
          ${drug.dose.loading ? `<div style="font-size:0.6rem;color:var(--warn);margin-bottom:6px">⚡ Loading: ${drug.dose.loading}</div>` : ''}
          ${renalMatchNote}
          <table class="dp-renal-table">
            <thead><tr><th>CrCl (mL/min)</th><th>Regimen</th></tr></thead>
            <tbody>${renalRows}</tbody>
          </table>
        </div>
      </div>
      ${patientWarningSection}
      <div class="dp-section collapsed" id="dp-sec-pkpd">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-pkpd')">
          <span>📈 PK/PD &amp; Mechanism</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">
          <span class="dp-tag ${pkpdClass}">${pkpdLabel}</span>
          <div style="margin-top:6px;font-size:0.62rem"><b>PK/PD:</b> ${drug.pkpd}</div>
          <div style="margin-top:5px;font-size:0.62rem"><b>Mechanism:</b> ${drug.mechanism}</div>
          <div style="margin-top:5px;font-size:0.62rem"><b>Spectrum:</b> ${drug.spectrum}</div>
        </div>
      </div>
      ${safetySection}
      ${fluidInfoSection}
      <div class="dp-section collapsed" id="dp-sec-se">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-se')">
          <span>⚠️ Side Effects &amp; Monitoring</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">
          <div style="font-size:0.56rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin-bottom:5px">Adverse Effects</div>
          ${seItems}
          <div style="font-size:0.56rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin:8px 0 5px">Monitoring</div>
          ${monItems}
        </div>
      </div>
      ${publicNotesSection}
      ${localNotesSection}
      ${referencesSection}
      <div class="dp-section" id="dp-sec-notes">
        <div class="dp-section-hdr" onclick="toggleDpSection('dp-sec-notes')">
          <span>📝 My Notes</span>
          <span class="dp-section-chevron">▼</span>
        </div>
        <div class="dp-section-body">
          <textarea class="dp-notes-area" id="dp-notes-ta-${key}"
            placeholder="Add your own clinical notes, pearls, or local protocol details…">${savedNotes}</textarea>
          <button class="btn-secondary dp-save-btn" onclick="saveDrugNote('${key}')">Save Note</button>
        </div>
      </div>
    </div>`;

  panel.classList.add('open');
}

function closeDrugPanel() {
  document.getElementById('drug-panel').classList.remove('open');
}

function toggleDpSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('collapsed');
}

function saveDrugNote(key) {
  const ta = document.getElementById('dp-notes-ta-' + key);
  if (!ta) return;
  localStorage.setItem('drug-notes-' + key, ta.value);
  const btn = ta.nextElementSibling;
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Saved';
    btn.classList.add('saved');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('saved'); }, 1500);
  }
}

window.__drugReferenceTestApi = {
  getDrugNavConfig,
  getDrugGroup,
  getDrugTopCat,
  getDrugSubcategory,
  getVisibleDrugEntries,
  deriveDrugSafetyProfile,
  buildDrugPanelPatientWarnings,
  parseRenalAdjustmentBounds,
  matchRenalAdjustmentRow,
};

if (!window.__DRUG_REFERENCE_DISABLE_BOOT__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderDrugsPatientHook(typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null);
    });
  } else {
    renderDrugsPatientHook(typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null);
  }
}

window.addEventListener('patient-context-updated', (event) => {
  renderDrugsPatientHook(event.detail ? event.detail.snapshot : null);
  const panel = document.getElementById('drug-panel');
  if (panel && panel.classList.contains('open') && panel.dataset.drugKey) {
    openDrugPanel(panel.dataset.drugKey);
  }
});
