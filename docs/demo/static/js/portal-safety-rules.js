// ---------------------------------------------------------------------------
// Deterministic General IM Safety Rules
// Local rule evaluator only. No model calls, no remote dependencies.
// ---------------------------------------------------------------------------

const SAFETY_RULE_MED_GROUPS = {
  aceArb: ['lisinopril', 'enalapril', 'captopril', 'losartan', 'valsartan', 'irbesartan', 'candesartan', 'olmesartan', 'telmisartan', 'sacubitril', 'entresto'],
  potassiumRaisers: ['lisinopril', 'enalapril', 'losartan', 'valsartan', 'sacubitril', 'spironolactone', 'eplerenone', 'trimethoprim', 'tmp-smx', 'bactrim', 'potassium chloride', 'kcl', 'nsaid', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'celecoxib', 'heparin', 'enoxaparin'],
  nsaids: ['nsaid', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'celecoxib', 'mefenamic'],
  nephrotoxins: ['vancomycin', 'gentamicin', 'amikacin', 'tobramycin', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'celecoxib', 'lisinopril', 'enalapril', 'losartan', 'valsartan', 'sacubitril', 'furosemide', 'bumetanide', 'torsemide', 'hydrochlorothiazide', 'spironolactone', 'dapagliflozin', 'empagliflozin', 'canagliflozin', 'metformin'],
  anticoagulants: ['heparin', 'enoxaparin', 'warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'fondaparinux'],
  antiplatelets: ['aspirin', 'clopidogrel', 'ticagrelor', 'prasugrel', 'dipyridamole'],
  p2y12: ['clopidogrel', 'ticagrelor', 'prasugrel'],
  qtRisk: ['amiodarone', 'levofloxacin', 'moxifloxacin', 'ciprofloxacin', 'fluconazole', 'voriconazole', 'posaconazole', 'ondansetron', 'haloperidol', 'quetiapine', 'metoclopramide', 'azithromycin', 'clarithromycin', 'erythromycin'],
  sglt2: ['dapagliflozin', 'empagliflozin', 'canagliflozin', 'ertugliflozin'],
  metformin: ['metformin'],
  steroids: ['prednisolone', 'prednisone', 'methylprednisolone', 'hydrocortisone', 'dexamethasone', 'betamethasone'],
  digoxin: ['digoxin'],
  digoxinInteractions: ['amiodarone', 'verapamil', 'diltiazem', 'clarithromycin', 'erythromycin', 'azithromycin'],
};

const USER_SAFETY_RULES_STORAGE_KEY = 'mediport-user-safety-rules-v1';

const SAFETY_RULE_CATALOG = [
  {
    key: 'hyperkalemia-med-stack',
    title: 'Hyperkalemia medication stack',
    kind: 'medication_lab_mismatch',
    category: 'Medication-lab mismatch',
    defaultTone: 'warn/danger',
    criteria: 'Fires when K >= 5.0 mEq/L plus ACEi/ARB/ARNI, spironolactone, TMP-SMX, potassium supplement, NSAID, or heparin-class medication; danger when K >= 5.5.',
    sourceLabel: 'Local deterministic rule; medication classes anchored to common internal medicine safety review.',
  },
  {
    key: 'aki-nephrotoxin-stack',
    title: 'AKI + nephrotoxin stack',
    kind: 'medication_lab_mismatch',
    category: 'Renal safety',
    defaultTone: 'warn/danger',
    criteria: 'Fires when Cr rises >= 0.3 mg/dL or >= 1.5x previous plus NSAID, vancomycin, aminoglycoside, ACEi/ARB/ARNI, diuretic, SGLT2 inhibitor, metformin, or recent contrast keyword.',
    sourceLabel: 'KDIGO-style AKI creatinine rise threshold plus local medication safety stack.',
    sourceUrl: 'https://kdigo.org/kdigo-announces-publication-of-2024-ckd-guideline/',
  },
  {
    key: 'bleeding-risk-stack',
    title: 'Bleeding risk stack',
    kind: 'medication_lab_mismatch',
    category: 'Antithrombotic safety',
    defaultTone: 'warn/danger',
    criteria: 'Fires when anticoagulant/antiplatelet/NSAID combinations occur with Plt < 50, INR >= 2.5, eGFR < 30, meaningful Hgb drop, or anticoagulant + aspirin + P2Y12 triple therapy.',
    sourceLabel: 'Local deterministic antithrombotic safety rule; AF antithrombotic context aligns with ACC/AHA risk-review framing.',
    sourceUrl: 'https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2023/11/27/19/46/2023-acc-guideline-for-af-gl-af',
  },
  {
    key: 'qt-electrolyte-stack',
    title: 'QT/electrolyte stack',
    kind: 'medication_lab_mismatch',
    category: 'Arrhythmia safety',
    defaultTone: 'warn/danger',
    criteria: 'Fires when QT-risk medication is active with K < 3.5, Mg < 1.8, or QTc >= 500 ms; QTc >= 500 is danger.',
    sourceLabel: 'Local deterministic QT-risk medication/electrolyte safety rule.',
  },
  {
    key: 'diabetes-sick-day-stack',
    title: 'Diabetes sick-day stack',
    kind: 'medication_lab_mismatch',
    category: 'Diabetes safety',
    defaultTone: 'warn/danger',
    criteria: 'Fires when metformin or SGLT2 inhibitor is active during AKI, HCO3 < 20, glucose >= 300, or DKA/HHS-like pattern.',
    sourceLabel: 'Local deterministic sick-day medication safety rule; diabetes context anchored to ADA Standards of Care.',
    sourceUrl: 'https://professional.diabetes.org/standards-of-care',
  },
  {
    key: 'steroid-hyperglycemia',
    title: 'Steroid hyperglycemia',
    kind: 'medication_lab_mismatch',
    category: 'Diabetes safety',
    defaultTone: 'warn/danger',
    criteria: 'Fires when systemic steroid is active and glucose >= 200 mg/dL; danger when glucose >= 400 or DKA/HHS-like pattern is present.',
    sourceLabel: 'Local deterministic steroid/glucose monitoring rule; diabetes context anchored to ADA Standards of Care.',
    sourceUrl: 'https://professional.diabetes.org/standards-of-care',
  },
  {
    key: 'digoxin-toxicity-risk',
    title: 'Digoxin toxicity risk',
    kind: 'medication_lab_mismatch',
    category: 'Medication toxicity',
    defaultTone: 'warn/danger',
    criteria: 'Fires when digoxin is active with renal decline/eGFR < 60, hypokalemia, or amiodarone/verapamil/macrolide interaction; danger for eGFR < 30, K < 3.0, or interaction.',
    sourceLabel: 'Local deterministic toxicity risk rule based on renal handling, potassium, and known interaction patterns.',
  },
];

function safetyToNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function safetyLab(labs, key) {
  if (!labs || labs[key] === undefined || labs[key] === null || labs[key] === '') return null;
  return safetyToNumber(labs[key]);
}

function safetyNormalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/[()_,/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safetyMedicationText(med) {
  if (!med) return '';
  return safetyNormalizeText([
    med.name, med.drug, med.drug_name, med.generic, med.drug_key, med.key,
    med.class, med.category, med.dose, med.route, med.frequency, med.note,
  ].filter(Boolean).join(' '));
}

function safetyMedicationName(med) {
  return med && (med.name || med.drug || med.drug_name || med.generic || med.drug_key || med.key || 'Medication');
}

function safetyActiveMedications(medications) {
  let items = [];
  if (Array.isArray(medications)) items = medications;
  else if (medications && Array.isArray(medications.current)) items = medications.current;
  else if (medications && Array.isArray(medications.meds)) items = medications.meds;
  return items.filter((med) => {
    const status = safetyNormalizeText(med && med.status);
    return !['stopped', 'discontinued', 'cancelled', 'resolved'].includes(status);
  });
}

function safetyTermMatches(text, term) {
  const normalized = safetyNormalizeText(term);
  if (!normalized) return false;
  const spaced = normalized.replace(/-/g, ' ');
  const dashed = normalized.replace(/\s+/g, '-');
  return text.includes(normalized) || text.includes(spaced) || text.includes(dashed);
}

function safetyFindMeds(medications, terms) {
  const list = safetyActiveMedications(medications);
  return list.filter((med) => {
    const text = safetyMedicationText(med);
    return terms.some((term) => safetyTermMatches(text, term));
  });
}

function safetyHasAki(labs, previousLabs) {
  const cr = safetyLab(labs, 'Cr');
  const prevCr = safetyLab(previousLabs, 'Cr');
  if (cr == null || prevCr == null || prevCr <= 0) return false;
  return cr - prevCr >= 0.3 || cr >= prevCr * 1.5;
}

function safetyRecentText(timeline, recentEntries) {
  const entryText = Array.isArray(recentEntries)
    ? recentEntries.map((entry) => [entry.timestamp, entry.category, entry.title, entry.body, entry.text].filter(Boolean).join(' ')).join(' ')
    : '';
  const timelineText = Array.isArray(timeline)
    ? timeline.slice(-6).map((entry) => [entry.timestamp, entry.category, entry.title, entry.text].filter(Boolean).join(' ')).join(' ')
    : '';
  return safetyNormalizeText(`${entryText} ${timelineText}`);
}

function safetyAlert(key, kind, tone, title, body, criteria, extra = {}) {
  return {
    key,
    kind,
    tone,
    title,
    body,
    criteria,
    actions: extra.actions || [],
    medicationKeys: extra.medicationKeys || [],
    labKeys: extra.labKeys || [],
  };
}

function getSafetyRuleCatalog() {
  return SAFETY_RULE_CATALOG.map((rule) => ({ ...rule, builtIn: true }));
}

function getUserSafetyRules() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_SAFETY_RULES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUserSafetyRules(rules) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(USER_SAFETY_RULES_STORAGE_KEY, JSON.stringify(Array.isArray(rules) ? rules : []));
}

function normalizeUserSafetyRule(rule) {
  const title = String(rule && rule.title || '').trim();
  if (!title) return null;

  // Support both new multi-condition format and legacy single-condition format
  let conditions;
  if (Array.isArray(rule.conditions) && rule.conditions.length) {
    conditions = rule.conditions.map((c) => {
      const labKey = String(c.labKey || '').trim();
      const operator = ['>=', '>', '<=', '<', '='].includes(c.operator) ? c.operator : '<';
      const threshold = safetyToNumber(c.threshold);
      if (!labKey || threshold == null) return null;
      return { labKey, operator, threshold };
    }).filter(Boolean);
  } else {
    // Legacy: single labKey/operator/threshold on the rule itself
    const labKey = String(rule && rule.labKey || '').trim();
    const operator = ['>=', '>', '<=', '<', '='].includes(rule && rule.operator) ? rule.operator : '<';
    const threshold = safetyToNumber(rule && rule.threshold);
    conditions = (labKey && threshold != null) ? [{ labKey, operator, threshold }] : [];
  }

  if (!conditions.length) return null;

  const logic = rule.logic === 'or' ? 'or' : 'and';
  return {
    id: String(rule.id || `user-rule-${Date.now()}`),
    title,
    domain: String(rule.domain || 'General Lab Patterns'),
    logic,
    conditions,
    tone: ['info', 'warn', 'danger'].includes(rule.tone) ? rule.tone : 'warn',
    body: String(rule.body || conditions.map((c) => `${c.labKey} ${c.operator} ${c.threshold}`).join(` ${logic.toUpperCase()} `)).trim(),
    enabled: rule.enabled !== false,
    sourceLabel: String(rule.sourceLabel || 'User-defined local rule').trim(),
  };
}

function compareUserRuleValue(value, operator, threshold) {
  if (operator === '>=') return value >= threshold;
  if (operator === '>') return value > threshold;
  if (operator === '<=') return value <= threshold;
  if (operator === '<') return value < threshold;
  return value === threshold;
}

function evaluateUserSafetyRules(input = {}) {
  const labs = input.labs || {};
  return getUserSafetyRules()
    .map(normalizeUserSafetyRule)
    .filter((rule) => rule && rule.enabled)
    .map((rule) => {
      const condResults = rule.conditions.map((cond) => {
        const value = safetyLab(labs, cond.labKey);
        return { cond, value, matched: value != null && compareUserRuleValue(value, cond.operator, cond.threshold) };
      });
      const fires = rule.logic === 'or'
        ? condResults.some((r) => r.matched)
        : condResults.every((r) => r.matched);
      if (!fires) return null;
      const condText = rule.conditions
        .map((c) => `${c.labKey} ${c.operator} ${c.threshold}`)
        .join(` ${rule.logic.toUpperCase()} `);
      const matchedSummary = condResults
        .filter((r) => r.matched && r.value != null)
        .map((r) => `${r.cond.labKey}: ${r.value}`)
        .join(', ');
      return safetyAlert(
        `user-${rule.id}`,
        'user_defined_lab_rule',
        rule.tone,
        rule.title,
        `${rule.body}${matchedSummary ? ` (${matchedSummary})` : ''}.`,
        `User-defined rule. Fires when ${condText}.`,
        { labKeys: rule.conditions.map((c) => c.labKey), actions: rule.sourceLabel ? [rule.sourceLabel] : [] }
      );
    })
    .filter(Boolean);
}

function safetyMedicationNames(meds) {
  return meds.map(safetyMedicationName).filter(Boolean).slice(0, 4).join(', ');
}

// ---------------------------------------------------------------------------
// Missing Monitoring Data Alerts
// Fires when an active medication requires a specific lab and it has not been
// documented within the expected window according to recognised monitoring standards.
// ---------------------------------------------------------------------------

const MISSING_DATA_RULE_CATALOG = [
  {
    key: 'missing-cr-vancomycin',
    title: 'Vancomycin: SCr monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['vancomycin'],
    labKey: 'Cr',
    hours: 72,
    criteria: 'Fires when vancomycin is active and SCr has not been documented in the last 72 hours.',
    sourceLabel: 'ASHP/IDSA/SIDP 2020 vancomycin guidelines (AUC-guided; SCr q48–72h).',
    sourceUrl: 'https://www.ashp.org/-/media/assets/policy-guidelines/docs/guidelines/vancomycin-monitoring-guidelines-2020.pdf',
  },
  {
    key: 'missing-cr-aminoglycoside',
    title: 'Aminoglycoside: SCr monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['gentamicin', 'amikacin', 'tobramycin'],
    labKey: 'Cr',
    hours: 72,
    criteria: 'Fires when an aminoglycoside (gentamicin, amikacin, tobramycin) is active and SCr has not been documented in the last 72 hours.',
    sourceLabel: 'Local nephrotoxicity monitoring standard for aminoglycoside therapy.',
  },
  {
    key: 'missing-inr-warfarin',
    title: 'Warfarin: INR monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['warfarin'],
    labKey: 'INR',
    hours: 168,
    criteria: 'Fires when warfarin is active and INR has not been documented in the last 7 days.',
    sourceLabel: 'Standard warfarin anticoagulation monitoring: INR at least weekly during stable dosing.',
  },
  {
    key: 'missing-plt-linezolid',
    title: 'Linezolid: CBC (platelets) overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['linezolid'],
    labKey: 'Plt',
    hours: 168,
    criteria: 'Fires when linezolid is active and platelets have not been documented in the last 7 days (myelosuppression risk).',
    sourceLabel: 'Linezolid CBC monitoring: weekly platelets due to myelosuppression risk.',
  },
  {
    key: 'missing-k-k-sparing',
    title: 'Potassium-sparing diuretic: K+ monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['spironolactone', 'eplerenone'],
    labKey: 'K',
    hours: 72,
    criteria: 'Fires when spironolactone or eplerenone is active and K+ has not been documented in the last 72 hours.',
    sourceLabel: 'Local hyperkalemia monitoring standard for potassium-sparing diuretic therapy.',
  },
  {
    key: 'missing-cr-digoxin',
    title: 'Digoxin: renal function monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'warn',
    drugTerms: ['digoxin'],
    labKey: 'Cr',
    hours: 168,
    criteria: 'Fires when digoxin is active and creatinine has not been documented in the last 7 days.',
    sourceLabel: 'Local digoxin safety monitoring standard (renal elimination; toxicity risk with declining function).',
  },
  {
    key: 'missing-qtc-qt-risk',
    title: 'QT-risk medication: QTc monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'info',
    drugTerms: ['amiodarone', 'levofloxacin', 'moxifloxacin', 'ciprofloxacin', 'fluconazole', 'voriconazole', 'posaconazole', 'ondansetron', 'haloperidol', 'quetiapine', 'metoclopramide', 'azithromycin', 'clarithromycin', 'erythromycin'],
    labKey: 'QTc',
    hours: 168,
    criteria: 'Fires when a QT-prolonging medication is active and QTc has not been documented in the last 7 days.',
    sourceLabel: 'Local QTc surveillance standard for QT-risk medications.',
  },
  {
    key: 'missing-egfr-sglt2',
    title: 'SGLT2 inhibitor: eGFR monitoring overdue',
    kind: 'missing_monitoring_data',
    category: 'Missing monitoring data',
    defaultTone: 'info',
    drugTerms: ['dapagliflozin', 'empagliflozin', 'canagliflozin', 'ertugliflozin'],
    labKey: 'eGFR',
    hours: 336,
    criteria: 'Fires when an SGLT2 inhibitor is active and eGFR has not been documented in the last 14 days.',
    sourceLabel: 'ADA Standards of Care: periodic renal function monitoring with SGLT2 inhibitor therapy.',
    sourceUrl: 'https://professional.diabetes.org/standards-of-care',
  },
];

/**
 * Returns the most recent Date at which `key` appears in a timeline entry's labs.
 * Iterates in reverse (newest-first). Returns null if not found.
 * @param {Array<{timestamp: string, labs: Object}>} timeline
 * @param {string} key
 * @returns {Date|null}
 */
function safetyLabLastSeen(timeline, key) {
  if (!Array.isArray(timeline)) return null;
  for (let i = timeline.length - 1; i >= 0; i--) {
    const entry = timeline[i];
    if (!entry || !entry.labs) continue;
    if (entry.labs[key] === undefined || entry.labs[key] === null || entry.labs[key] === '') continue;
    const match = String(entry.timestamp || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!match) continue;
    const [, yyyy, mm, dd, hh = '00', min = '00'] = match;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

/**
 * Returns true if `key` was last seen in the timeline within `hours` hours of `now`.
 * @param {Array} timeline
 * @param {string} key
 * @param {number} hours
 * @param {number} [now] - epoch ms; defaults to Date.now() (overridable for testing)
 * @returns {boolean}
 */
function safetyLabWithinHours(timeline, key, hours, now = Date.now()) {
  const lastSeen = safetyLabLastSeen(timeline, key);
  if (!lastSeen) return false;
  const elapsedHours = (now - lastSeen.getTime()) / (1000 * 60 * 60);
  return elapsedHours <= hours;
}

function formatMissingDataWindow(hours) {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${hours}h`;
}

function getMissingDataRuleCatalog() {
  return MISSING_DATA_RULE_CATALOG.map((rule) => ({ ...rule, builtIn: true }));
}

/**
 * Evaluates missing monitoring data alerts for active medications.
 * @param {Object} input - same input object as evaluatePatientSafetyRules
 * @param {number} [now] - epoch ms reference point (defaults to Date.now(); pass a fixed value in tests)
 */
function evaluateMissingDataAlerts(input = {}, now = Date.now()) {
  const medications = input.medications || [];
  const timeline = input.timeline || [];
  const alerts = [];

  for (const rule of MISSING_DATA_RULE_CATALOG) {
    const matchedMeds = safetyFindMeds(medications, rule.drugTerms);
    if (!matchedMeds.length) continue;
    if (safetyLabWithinHours(timeline, rule.labKey, rule.hours, now)) continue;
    const medNames = safetyMedicationNames(matchedMeds);
    const windowLabel = formatMissingDataWindow(rule.hours);
    alerts.push(safetyAlert(
      rule.key,
      'missing_monitoring_data',
      rule.defaultTone,
      rule.title,
      `${rule.labKey} not documented in the last ${windowLabel} for ${medNames}. Verify the lab has been drawn and charted.`,
      rule.criteria,
      { medicationKeys: matchedMeds.map(safetyMedicationName), labKeys: [rule.labKey], actions: rule.sourceLabel ? [rule.sourceLabel] : [] }
    ));
  }

  return alerts;
}

function evaluatePatientSafetyRules(input = {}) {
  const labs = input.labs || {};
  const previousLabs = input.previousLabs || {};
  const medications = input.medications || [];
  const timeline = input.timeline || [];
  const recentEntries = input.recentEntries || [];
  const alerts = [];

  const k = safetyLab(labs, 'K');
  const mg = safetyLab(labs, 'Mg');
  const hco3 = safetyLab(labs, 'HCO3');
  const glucose = safetyLab(labs, 'Glu') ?? safetyLab(labs, 'Glucose');
  const plt = safetyLab(labs, 'Plt');
  const inr = safetyLab(labs, 'INR');
  const egfr = safetyLab(labs, 'eGFR');
  const hgb = safetyLab(labs, 'Hgb');
  const prevHgb = safetyLab(previousLabs, 'Hgb');
  const qtc = safetyLab(labs, 'QTc') ?? safetyToNumber(input.meta && (input.meta.qtc || input.meta.QTc));
  const aki = safetyHasAki(labs, previousLabs);
  const recentText = safetyRecentText(timeline, recentEntries);

  const potassiumMeds = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.potassiumRaisers);
  if (k != null && k >= 5.0 && potassiumMeds.length) {
    alerts.push(safetyAlert(
      'hyperkalemia-med-stack',
      'medication_lab_mismatch',
      k >= 5.5 ? 'danger' : 'warn',
      'Hyperkalemia medication stack',
      `K ${k} with potassium-raising medication(s): ${safetyMedicationNames(potassiumMeds)}. Review holds, renal trend, and repeat/ECG context.`,
      'Fires when K >= 5.0 mEq/L plus ACEi/ARB/ARNI, spironolactone, TMP-SMX, potassium supplement, NSAID, or heparin-class medication; danger when K >= 5.5.',
      { medicationKeys: potassiumMeds.map(safetyMedicationName), labKeys: ['K'] }
    ));
  }

  const nephrotoxins = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.nephrotoxins);
  const contrastMention = /\bcontrast\b|顯影|造影/.test(recentText);
  if (aki && (nephrotoxins.length || contrastMention)) {
    alerts.push(safetyAlert(
      'aki-nephrotoxin-stack',
      'medication_lab_mismatch',
      nephrotoxins.some((med) => safetyFindMeds([med], ['vancomycin', 'gentamicin', 'amikacin', 'tobramycin']).length) || contrastMention ? 'danger' : 'warn',
      'AKI + nephrotoxin stack',
      `Creatinine meets KDIGO-style rise criteria${nephrotoxins.length ? ` with nephrotoxin/renal-risk medication(s): ${safetyMedicationNames(nephrotoxins)}` : ''}${contrastMention ? ' and recent contrast mention' : ''}.`,
      'Fires when Cr rises >= 0.3 mg/dL or >= 1.5x previous plus NSAID, vancomycin, aminoglycoside, ACEi/ARB/ARNI, diuretic, SGLT2 inhibitor, metformin, or recent contrast keyword.',
      { medicationKeys: nephrotoxins.map(safetyMedicationName), labKeys: ['Cr'] }
    ));
  }

  const anticoags = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.anticoagulants);
  const antiplatelets = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.antiplatelets);
  const p2y12 = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.p2y12);
  const nsaids = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.nsaids);
  const hgbDrop = hgb != null && prevHgb != null ? prevHgb - hgb : 0;
  const tripleTherapy = anticoags.length && safetyFindMeds(medications, ['aspirin']).length && p2y12.length;
  const bleedingLabRisk = (plt != null && plt < 50) || (inr != null && inr >= 2.5) || (egfr != null && egfr < 30) || hgbDrop >= 1.5;
  if (tripleTherapy || (anticoags.length && (antiplatelets.length || nsaids.length || bleedingLabRisk))) {
    const stack = [...anticoags, ...antiplatelets, ...nsaids];
    alerts.push(safetyAlert(
      'bleeding-risk-stack',
      'medication_lab_mismatch',
      tripleTherapy || (plt != null && plt < 50) || hgbDrop >= 2 ? 'danger' : 'warn',
      'Bleeding risk stack',
      `${tripleTherapy ? 'Triple therapy pattern' : 'Antithrombotic risk pattern'}${stack.length ? `: ${safetyMedicationNames(stack)}` : ''}${bleedingLabRisk ? ` with lab risk${plt != null ? `, Plt ${plt}` : ''}${inr != null ? `, INR ${inr}` : ''}${hgbDrop >= 1.5 ? `, Hgb drop ${Math.round(hgbDrop * 10) / 10}` : ''}` : ''}.`,
      'Fires when anticoagulant/antiplatelet/NSAID combinations occur with Plt < 50, INR >= 2.5, eGFR < 30, meaningful Hgb drop, or anticoagulant + aspirin + P2Y12 triple therapy.',
      { medicationKeys: stack.map(safetyMedicationName), labKeys: ['Plt', 'INR', 'Hgb', 'eGFR'] }
    ));
  }

  const qtMeds = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.qtRisk);
  if (qtMeds.length && ((k != null && k < 3.5) || (mg != null && mg < 1.8) || (qtc != null && qtc >= 500))) {
    alerts.push(safetyAlert(
      'qt-electrolyte-stack',
      'medication_lab_mismatch',
      qtc != null && qtc >= 500 ? 'danger' : 'warn',
      'QT/electrolyte stack',
      `QT-risk medication(s): ${safetyMedicationNames(qtMeds)}${k != null ? `, K ${k}` : ''}${mg != null ? `, Mg ${mg}` : ''}${qtc != null ? `, QTc ${qtc}` : ''}.`,
      'Fires when QT-risk medication is active with K < 3.5, Mg < 1.8, or QTc >= 500 ms; QTc >= 500 is danger.',
      { medicationKeys: qtMeds.map(safetyMedicationName), labKeys: ['K', 'Mg', 'QTc'] }
    ));
  }

  const metformin = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.metformin);
  const sglt2 = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.sglt2);
  const dkaPattern = glucose != null && glucose >= 250 && hco3 != null && hco3 < 18;
  if ((metformin.length || sglt2.length) && (aki || (hco3 != null && hco3 < 20) || (glucose != null && glucose >= 300) || dkaPattern)) {
    const stack = [...metformin, ...sglt2];
    alerts.push(safetyAlert(
      'diabetes-sick-day-stack',
      'medication_lab_mismatch',
      aki || dkaPattern ? 'danger' : 'warn',
      'Diabetes sick-day stack',
      `${safetyMedicationNames(stack)} with ${aki ? 'AKI' : ''}${hco3 != null ? ` HCO3 ${hco3}` : ''}${glucose != null ? ` glucose ${glucose}` : ''}. Review sick-day holds and DKA/HHS context.`,
      'Fires when metformin or SGLT2 inhibitor is active during AKI, HCO3 < 20, glucose >= 300, or DKA/HHS-like pattern.',
      { medicationKeys: stack.map(safetyMedicationName), labKeys: ['Cr', 'HCO3', 'Glu'] }
    ));
  }

  const steroids = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.steroids);
  if (steroids.length && glucose != null && glucose >= 200) {
    alerts.push(safetyAlert(
      'steroid-hyperglycemia',
      'medication_lab_mismatch',
      glucose >= 400 || dkaPattern ? 'danger' : 'warn',
      'Steroid hyperglycemia',
      `${safetyMedicationNames(steroids)} with glucose ${glucose}. Check monitoring/insulin plan and screen for DKA/HHS pattern if clinically compatible.`,
      'Fires when systemic steroid is active and glucose >= 200 mg/dL; danger when glucose >= 400 or DKA/HHS-like pattern is present.',
      { medicationKeys: steroids.map(safetyMedicationName), labKeys: ['Glu', 'HCO3'] }
    ));
  }

  const digoxin = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.digoxin);
  const digoxinInteractions = safetyFindMeds(medications, SAFETY_RULE_MED_GROUPS.digoxinInteractions);
  if (digoxin.length && ((egfr != null && egfr < 60) || (k != null && k < 3.5) || digoxinInteractions.length)) {
    alerts.push(safetyAlert(
      'digoxin-toxicity-risk',
      'medication_lab_mismatch',
      (egfr != null && egfr < 30) || (k != null && k < 3.0) || digoxinInteractions.length ? 'danger' : 'warn',
      'Digoxin toxicity risk',
      `Digoxin with${egfr != null ? ` eGFR ${egfr}` : ''}${k != null ? `, K ${k}` : ''}${digoxinInteractions.length ? `, interacting medication(s): ${safetyMedicationNames(digoxinInteractions)}` : ''}.`,
      'Fires when digoxin is active with renal decline/eGFR < 60, hypokalemia, or amiodarone/verapamil/macrolide interaction; danger for eGFR < 30, K < 3.0, or interaction.',
      { medicationKeys: [...digoxin, ...digoxinInteractions].map(safetyMedicationName), labKeys: ['eGFR', 'K'] }
    ));
  }

  alerts.push(...evaluateMissingDataAlerts(input));
  alerts.push(...evaluateUserSafetyRules(input));

  const toneRank = { danger: 0, warn: 1, info: 2, success: 3 };
  return alerts.sort((a, b) => (toneRank[a.tone] ?? 9) - (toneRank[b.tone] ?? 9) || a.title.localeCompare(b.title));
}

if (typeof window !== 'undefined') {
  window.evaluatePatientSafetyRules = evaluatePatientSafetyRules;
  window.getSafetyRuleCatalog = getSafetyRuleCatalog;
  window.getMissingDataRuleCatalog = getMissingDataRuleCatalog;
  window.getUserSafetyRules = getUserSafetyRules;
  window.saveUserSafetyRules = saveUserSafetyRules;
  window.normalizeUserSafetyRule = normalizeUserSafetyRule;
  window.evaluateUserSafetyRules = evaluateUserSafetyRules;
  window.evaluateMissingDataAlerts = evaluateMissingDataAlerts;
  window.__safetyRulesTestApi = {
    evaluatePatientSafetyRules,
    evaluateUserSafetyRules,
    evaluateMissingDataAlerts,
    getSafetyRuleCatalog,
    getMissingDataRuleCatalog,
    getUserSafetyRules,
    saveUserSafetyRules,
    normalizeUserSafetyRule,
    safetyHasAki,
    safetyFindMeds,
    safetyLabLastSeen,
    safetyLabWithinHours,
  };
}
