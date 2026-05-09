const ACTIVE_PATIENT_STORAGE_KEY = 'medical-portal-active-patient-id';
const PATIENT_CONTEXT_ALERT_ACK_KEY = 'medical-portal-patient-context-alert-ack';
const PATIENT_LAST_SEEN_STORAGE_KEY = 'medical-portal-patient-last-seen';
const PATIENT_CONTEXT_POLL_INTERVAL_MS = 60000;
const ALERT_MUTE_STORAGE_KEY = 'mediport-alert-mutes';

const PATIENT_CONTEXT_GROUPS = [
  { title: 'Renal', subtitle: 'Cr, BUN, eGFR', labs: [['Cr', 'Creatinine'], ['BUN', 'BUN'], ['eGFR', 'eGFR']] },
  { title: 'Electrolytes / Acid-Base', subtitle: 'Na, K, Cl, HCO3, Ca, Mg, Phosphate', labs: [['Na', 'Sodium'], ['K', 'Potassium'], ['Cl', 'Chloride'], ['HCO3', 'HCO3'], ['Ca', 'Calcium'], ['Mg', 'Magnesium'], ['Phos', 'Phosphate']] },
  { title: 'CBC / Infection', subtitle: 'WBC, ANC, Hgb, Plt, CRP, Ferritin, LDH', labs: [['WBC', 'WBC'], ['ANC', 'ANC'], ['ANCpct', 'ANC%'], ['Hgb', 'Hemoglobin'], ['Plt', 'Platelets'], ['CRP', 'CRP'], ['Ferritin', 'Ferritin'], ['LDH', 'LDH']] },
  { title: 'Coagulation', subtitle: 'INR, APTT, Fibrinogen', labs: [['INR', 'INR'], ['APTT', 'APTT'], ['Fibrinogen', 'Fibrinogen']] },
  { title: 'Liver', subtitle: 'AST, ALT, ALP, TBili, Alb', labs: [['AST', 'AST'], ['ALT', 'ALT'], ['ALP', 'ALP'], ['TBili', 'Total bilirubin'], ['Alb', 'Albumin']] },
  { title: 'Injury / Metabolic', subtitle: 'CK, Uric acid', labs: [['CK', 'CK'], ['UricAcid', 'Uric acid']] },
  { title: 'Thyroid', subtitle: 'TSH, Free T4', labs: [['TSH', 'TSH'], ['FT4', 'Free T4']] },
];

const IMPORTANT_EVENT_CATEGORIES = ['Imaging', 'Consult', 'Procedure', 'Medication Change', 'Clinical Note'];
const DRAWER_LAB_KEYS = [['Cr', 'Creatinine'], ['K', 'Potassium'], ['Na', 'Sodium'], ['WBC', 'WBC'], ['Plt', 'Platelets'], ['CRP', 'CRP']];
const LAB_DISPLAY_ORDER = ['Cr', 'BUN', 'eGFR', 'Na', 'K', 'Cl', 'HCO3', 'Ca', 'Mg', 'Phos', 'WBC', 'ANC', 'ANCpct', 'Hgb', 'Plt', 'CRP', 'Ferritin', 'LDH', 'INR', 'APTT', 'Fibrinogen', 'AST', 'ALT', 'ALP', 'TBili', 'Alb', 'CK', 'UricAcid', 'TSH', 'FT4'];
const HIGH_RISK_RENAL_MEDICATIONS = {
  ganciclovir: { label: 'Ganciclovir / valganciclovir', aliases: ['ganciclovir', 'valganciclovir'], threshold: 70, reason: 'Renally cleared antiviral exposure rises quickly as kidney function declines.' },
  meropenem: { label: 'Meropenem', aliases: ['meropenem'], threshold: 50, reason: 'Renal review is recommended once eGFR falls below standard dosing tiers.' },
  enoxaparin: { label: 'Enoxaparin', aliases: ['enoxaparin', 'lovenox'], threshold: 30, reason: 'Anti-Xa accumulation and bleeding risk rise when eGFR is severely reduced.' },
  'tmp-smx': { label: 'TMP-SMX', aliases: ['tmp-smx', 'trimethoprim-sulfamethoxazole', 'co-trimoxazole', 'bactrim', 'septra'], threshold: 30, reason: 'Renal clearance and potassium effects both need review in reduced kidney function.' },
  vancomycin: { label: 'Vancomycin', aliases: ['vancomycin'], threshold: 60, reason: 'Renal function changes alter vancomycin exposure and monitoring needs.' },
  metformin: { label: 'Metformin', aliases: ['metformin'], threshold: 45, reason: 'Metformin use should be reviewed as kidney function falls.' },
  cefepime: { label: 'Cefepime', aliases: ['cefepime'], threshold: 60, reason: 'Dose review helps reduce cefepime neurotoxicity risk in renal impairment.' },
  levofloxacin: { label: 'Levofloxacin', aliases: ['levofloxacin'], threshold: 50, reason: 'Fluoroquinolone dosing intervals often need adjustment in reduced eGFR.' },
  'piperacillin-tazobactam': { label: 'Piperacillin-tazobactam', aliases: ['piperacillin-tazobactam', 'piperacillin tazobactam', 'zosyn'], threshold: 40, reason: 'Extended-infusion beta-lactam dosing should be reviewed when eGFR drops.' },
  acyclovir: { label: 'Acyclovir / valacyclovir', aliases: ['acyclovir', 'valacyclovir'], threshold: 50, reason: 'Crystal nephropathy and neurotoxicity risk rise when renal dosing is not adjusted.' },
};

const FALLBACK_ANTIBIOTIC_KEYS = [
  'amoxicillin', 'amoxicillin-clavulanate', 'augmentin', 'amox-clav',
  'ampicillin-sulbactam', 'unasyn', 'piperacillin-tazobactam', 'pip-tazo', 'piptazo', 'tazocin',
  'cefazolin', 'cephalexin', 'cefuroxime', 'ceftriaxone', 'cefepime', 'ceftazidime', 'cefoxitin',
  'meropenem', 'ertapenem', 'imipenem', 'vancomycin', 'linezolid', 'daptomycin',
  'metronidazole', 'azithromycin', 'clarithromycin', 'doxycycline', 'minocycline',
  'levofloxacin', 'ciprofloxacin', 'moxifloxacin', 'gentamicin', 'amikacin',
  'tobramycin', 'clindamycin', 'tmp-smx', 'trimethoprim-sulfamethoxazole',
  'co-trimoxazole', 'bactrim', 'fosfomycin', 'nitrofurantoin', 'polymyxin',
  'colistin', 'rifampin', 'rifampicin',
];

const ANTIBIOTIC_CLASS_PATTERN = /(penicillin|cephalosporin|carbapenem|glycopeptide|oxazolidinone|lipopeptide|nitroimidazole|macrolide|tetracycline|fluoroquinolone|quinolone|aminoglycoside|lincosamide|sulfonamide|rifamycin|polymyxin|monobactam|fosfomycin|nitrofurantoin|antibacterial|antibiotic|β-lactam|beta-lactam)/i;

let activePatientId = localStorage.getItem(ACTIVE_PATIENT_STORAGE_KEY) || '';
let activePatientData = null;
let activePatientContext = null;
let latestPatientContextRequestId = 0;
let handoffOpenRequestSeq = 0;
let patientContextPollTimer = null;

const patientContextFetchCache = new Map();
const knownPatientModifiedMap = new Map();
const pendingHandoffOpenAcks = new Map();

function escPatientContextHtml(value) {
  if (typeof escHtml === 'function') return escHtml(value || '');
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parsePatientAgeSex(record) {
  const match = (record || '').match(/(?:\*\*Age\/Sex:\*\*\s*|^\*?)(\d+)\s*([MF])/im);
  if (!match) return { age: null, sex: null };
  return { age: parseInt(match[1], 10), sex: match[2].toUpperCase() };
}

function estimateEgfrFromLatestCr(cr, age, sex) {
  if (!cr || !age || !sex) return null;
  const k = sex === 'F' ? 0.7 : 0.9;
  const a = sex === 'F' ? -0.241 : -0.302;
  const mult = sex === 'F' ? 1.012 : 1.0;
  const gfr = 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.200) * Math.pow(0.9938, age) * mult;
  return Math.round(gfr * 10) / 10;
}

function formatPatientUpdatedTime(modified) {
  if (!modified) return '';
  const dt = new Date(modified);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function truncatePatientLabel(name) {
  if (!name) return 'Quick Context';
  return name.length > 18 ? `${name.slice(0, 17)}...` : name;
}

function getPatientContextCacheKey(pid, modified) {
  return `${pid || ''}::${modified || 'unknown'}`;
}

function getPatientContextAlertAckMap() {
  try {
    const stored = localStorage.getItem(PATIENT_CONTEXT_ALERT_ACK_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    return {};
  }
}

function savePatientContextAlertAckMap(map) {
  localStorage.setItem(PATIENT_CONTEXT_ALERT_ACK_KEY, JSON.stringify(map || {}));
}

function getPatientContextAlertAck(pid) {
  if (!pid) return '';
  const map = getPatientContextAlertAckMap();
  return typeof map[pid] === 'string' ? map[pid] : '';
}

function setPatientContextAlertAck(pid, modified) {
  if (!pid || !modified) return;
  const map = getPatientContextAlertAckMap();
  map[pid] = modified;
  savePatientContextAlertAckMap(map);
}

function getContextStaleness(modified) {
  if (!modified) return null;
  const dt = new Date(modified);
  if (Number.isNaN(dt.getTime())) return null;
  const hoursOld = (Date.now() - dt.getTime()) / (1000 * 60 * 60);
  if (hoursOld >= 24) return { tone: 'danger', text: 'Update stale' };
  if (hoursOld >= 12) return { tone: 'warn', text: 'Aging data' };
  return { tone: 'success', text: 'Fresh' };
}

function parseClinicalTimestamp(value) {
  if (!value) return null;
  const text = String(value).trim();
  const dt = new Date(text);
  if (!Number.isNaN(dt.getTime())) return dt;
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, yyyy, mm, dd, hh, min] = match;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isClinicalTimestampAfter(value, baseline) {
  const dt = parseClinicalTimestamp(value);
  const base = parseClinicalTimestamp(baseline);
  if (!dt || !base) return false;
  return dt.getTime() > base.getTime();
}

function getPatientLastSeenMap() {
  try {
    const stored = localStorage.getItem(PATIENT_LAST_SEEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    return {};
  }
}

function savePatientLastSeenMap(map) {
  try {
    localStorage.setItem(PATIENT_LAST_SEEN_STORAGE_KEY, JSON.stringify(map || {}));
  } catch (err) {
    // Local seen state is a convenience only; ignore storage failures.
  }
}

function getPatientLastSeenAt(pid) {
  if (!pid) return '';
  const map = getPatientLastSeenMap();
  return typeof map[pid] === 'string' ? map[pid] : '';
}

function setPatientLastSeenAt(pid, timestamp) {
  if (!pid) return '';
  const next = timestamp || new Date().toISOString();
  const map = getPatientLastSeenMap();
  map[pid] = next;
  savePatientLastSeenMap(map);
  return next;
}

function formatSinceLastReviewLabel(timestamp) {
  if (!timestamp) return '';
  return formatPatientUpdatedTime(timestamp) || String(timestamp);
}

function formatLabChangeLine(entry) {
  const labs = entry && entry.labs ? entry.labs : {};
  const preferred = ['Cr', 'K', 'Na', 'WBC', 'Hgb', 'Plt', 'CRP', 'eGFR'];
  const keys = preferred.filter((key) => labs[key] !== undefined).slice(0, 4);
  const displayKeys = keys.length ? keys : Object.keys(labs).slice(0, 4);
  return displayKeys.map((key) => `${key} ${labs[key]}`).join(', ');
}

function buildSinceLastReviewSnapshot(context, extras = {}) {
  const pid = (context && context.id) || extras.pid || '';
  const lastSeenAt = getPatientLastSeenAt(pid);
  const lastSeenLabel = formatSinceLastReviewLabel(lastSeenAt);
  if (!pid) {
    return { pid, lastSeenAt: '', lastSeenLabel: '', hasSeenMarker: false, hasChanges: false, items: [], counts: {}, summaryText: 'No active patient.' };
  }
  if (!lastSeenAt) {
    return {
      pid,
      lastSeenAt: '',
      lastSeenLabel: '',
      hasSeenMarker: false,
      hasChanges: false,
      items: [],
      counts: {},
      summaryText: 'No local seen marker yet.',
    };
  }

  const items = [];
  const counts = { labs: 0, events: 0, vitals: 0, pending: 0, medications: 0, chart: 0 };
  const timeline = Array.isArray(context && context.timeline) ? context.timeline : [];
  const newLabEntries = timeline.filter((entry) => isClinicalTimestampAfter(entry.timestamp, lastSeenAt));
  if (newLabEntries.length) {
    counts.labs = newLabEntries.length;
    const latest = newLabEntries[newLabEntries.length - 1];
    const labLine = formatLabChangeLine(latest);
    items.push({
      kind: 'labs',
      tone: 'info',
      timestamp: latest.timestamp,
      label: `${newLabEntries.length} new lab timepoint${newLabEntries.length === 1 ? '' : 's'}`,
      body: labLine ? `${latest.timestamp}: ${labLine}` : `${latest.timestamp}: labs updated`,
    });
  }

  const recentEntries = Array.isArray(context && context.recentEntries) ? context.recentEntries : [];
  const newEvents = recentEntries.filter((entry) => isClinicalTimestampAfter(entry.timestamp, lastSeenAt));
  counts.events = newEvents.length;
  newEvents.slice(0, 3).forEach((entry) => {
    items.push({
      kind: 'event',
      tone: 'info',
      timestamp: entry.timestamp,
      label: entry.category || 'New event',
      body: `${entry.timestamp}: ${entry.title || entry.excerpt || 'New chart event'}`,
    });
  });

  const vitals = Array.isArray(extras.vitals) ? extras.vitals : [];
  const newVitals = vitals.filter((item) => isClinicalTimestampAfter(item.timestamp, lastSeenAt));
  if (newVitals.length) {
    counts.vitals = newVitals.length;
    const latest = newVitals[0];
    const vitalParts = [
      latest.bp_sys && latest.bp_dia ? `BP ${latest.bp_sys}/${latest.bp_dia}` : '',
      latest.hr != null ? `HR ${latest.hr}` : '',
      latest.spo2 != null ? `SpO2 ${latest.spo2}%` : '',
      latest.temp != null ? `T ${latest.temp}` : '',
    ].filter(Boolean).join(', ');
    items.push({
      kind: 'vitals',
      tone: 'info',
      timestamp: latest.timestamp,
      label: `${newVitals.length} new vital set${newVitals.length === 1 ? '' : 's'}`,
      body: vitalParts ? `${latest.timestamp}: ${vitalParts}` : `${latest.timestamp}: vitals updated`,
    });
  }

  const pendingItems = Array.isArray(extras.pending) ? extras.pending : [];
  const newPending = pendingItems.filter((item) => isClinicalTimestampAfter(item.created_at, lastSeenAt));
  const resolvedPending = pendingItems.filter((item) => item.status !== 'pending' && isClinicalTimestampAfter(item.resolved_at, lastSeenAt));
  counts.pending = newPending.length + resolvedPending.length;
  if (newPending.length) {
    items.push({
      kind: 'pending',
      tone: 'warn',
      timestamp: newPending[0].created_at,
      label: `${newPending.length} new pending item${newPending.length === 1 ? '' : 's'}`,
      body: newPending.slice(0, 2).map((item) => `${item.category || 'Pending'}: ${item.description || 'follow-up item'}`).join('; '),
    });
  }
  if (resolvedPending.length) {
    items.push({
      kind: 'pending-result',
      tone: 'success',
      timestamp: resolvedPending[0].resolved_at,
      label: `${resolvedPending.length} pending item${resolvedPending.length === 1 ? '' : 's'} resulted/cancelled`,
      body: resolvedPending.slice(0, 2).map((item) => `${item.category || 'Pending'}: ${item.result_note || item.description || item.status}`).join('; '),
    });
  }

  const medChanges = context && context.medications && Array.isArray(context.medications.changes) ? context.medications.changes : [];
  const newMedChanges = medChanges.filter((item) => isClinicalTimestampAfter(item.timestamp, lastSeenAt));
  if (newMedChanges.length) {
    counts.medications = newMedChanges.length;
    const first = newMedChanges[0];
    items.push({
      kind: 'medication',
      tone: 'info',
      timestamp: first.timestamp,
      label: `${newMedChanges.length} medication change${newMedChanges.length === 1 ? '' : 's'}`,
      body: `${first.timestamp}: ${first.action || 'Medication updated'}${first.name ? ` - ${first.name}` : ''}`,
    });
  }

  const hasTimestampedChanges = items.length > 0;
  if (!hasTimestampedChanges && context && context.lastUpdated && isClinicalTimestampAfter(context.lastUpdated, lastSeenAt)) {
    counts.chart = 1;
    items.push({
      kind: 'chart',
      tone: 'info',
      timestamp: context.lastUpdated,
      label: 'Record updated',
      body: 'The record modified time is newer than your last seen marker, but no timestamped lab/event detail explained the change.',
    });
  }

  const sortedItems = items.sort((left, right) => {
    const leftDt = parseClinicalTimestamp(left.timestamp);
    const rightDt = parseClinicalTimestamp(right.timestamp);
    return (rightDt ? rightDt.getTime() : 0) - (leftDt ? leftDt.getTime() : 0);
  });
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    pid,
    lastSeenAt,
    lastSeenLabel,
    hasSeenMarker: true,
    hasChanges: sortedItems.length > 0,
    items: sortedItems,
    counts,
    total,
    summaryText: sortedItems.length
      ? `Since seen: ${sortedItems.slice(0, 3).map((item) => item.label).join(', ')}.`
      : 'No timestamped changes since marked seen.',
  };
}

function getPatientContextSummary(data) {
  return {
    id: data && data.id ? data.id : '',
    name: data && data.name ? data.name : 'Patient Context',
    admitted: data && data.admitted ? data.admitted : '-',
    dx: data && data.dx ? data.dx : '-',
    modified: data && data.modified ? data.modified : '',
  };
}

function getPatientContextAlertItems(context) {
  if (!context || !Array.isArray(context.insights)) return [];
  const patientId = context.id || '';
  const latestLabTimestamp = context.lastLabTimestamp || '';
  return context.insights.filter((insight) => {
    if (!insight || (insight.tone !== 'warn' && insight.tone !== 'danger')) return false;
    if (typeof isAlertMuted === 'function' && isAlertMuted(patientId, insight.title, latestLabTimestamp)) return false;
    return true;
  });
}

function getPatientContextAlertState(context, acknowledgedModified) {
  const items = getPatientContextAlertItems(context);
  const count = items.length;
  const modified = context && context.lastUpdated ? context.lastUpdated : '';
  return {
    items,
    count,
    modified,
    unseen: count > 0 && !!modified && modified !== (acknowledgedModified || ''),
  };
}

function formatStructuredMedicationSig(item) {
  return [item && item.dose, item && item.route, item && item.frequency].filter(Boolean).join(' ').trim();
}

function normalizeStructuredMedications(payload) {
  const source = payload && payload.medications ? payload.medications : payload;
  return {
    baseline: Array.isArray(source && source.baseline) ? source.baseline : [],
    current: Array.isArray(source && source.current) ? source.current : [],
    changes: Array.isArray(source && source.changes) ? source.changes : [],
  };
}

function normalizeStructuredProblems(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.problems)) return payload.problems;
  if (payload && payload.problems && Array.isArray(payload.problems.problems)) return payload.problems.problems;
  return [];
}

function getStructuredMedicationKey(item) {
  return ((item && (item.drug_key || item.name)) || '').trim().toLowerCase();
}

function buildStructuredMedicationDiff(medications) {
  const baseline = Array.isArray(medications && medications.baseline) ? medications.baseline : [];
  const current = Array.isArray(medications && medications.current) ? medications.current : [];
  const baselineMap = new Map(baseline.map((item) => [getStructuredMedicationKey(item), item]));
  const currentMap = new Map(current.map((item) => [getStructuredMedicationKey(item), item]));
  const added = current
    .filter((item) => !baselineMap.has(getStructuredMedicationKey(item)) || item.baseline_status === 'added_after_admission')
    .map((item) => `${item.name}${formatStructuredMedicationSig(item) ? ` — ${formatStructuredMedicationSig(item)}` : ''}`);
  const heldStopped = [];
  current.forEach((item) => {
    if (item.status === 'held' || item.status === 'stopped') {
      heldStopped.push(`${item.name} — ${item.status}${formatStructuredMedicationSig(item) ? ` (${formatStructuredMedicationSig(item)})` : ''}`);
    }
  });
  baseline.forEach((item) => {
    if (!currentMap.has(getStructuredMedicationKey(item))) {
      heldStopped.push(`${item.name} — removed from current list`);
    }
  });
  const doseChanged = current
    .filter((item) => {
      const baselineItem = baselineMap.get(getStructuredMedicationKey(item));
      const baselineSig = baselineItem && (baselineItem.baseline_sig || formatStructuredMedicationSig(baselineItem));
      return !!baselineItem && baselineSig !== formatStructuredMedicationSig(item);
    })
    .map((item) => {
      const baselineItem = baselineMap.get(getStructuredMedicationKey(item));
      const baselineSig = baselineItem && (baselineItem.baseline_sig || formatStructuredMedicationSig(baselineItem));
      return `${item.name} — ${baselineSig || '[none]'} → ${formatStructuredMedicationSig(item) || '[none]'}`;
    });
  return { added, heldStopped, doseChanged };
}

function matchHighRiskRenalMedication(item) {
  const drugKey = ((item && item.drug_key) || '').trim().toLowerCase();
  const name = ((item && item.name) || '').trim().toLowerCase();
  return Object.entries(HIGH_RISK_RENAL_MEDICATIONS).find(([, rule]) => {
    if (drugKey && drugKey === rule.label.toLowerCase()) return true;
    return rule.aliases.some((alias) => alias === drugKey || (name && name.includes(alias)));
  }) || null;
}

function buildRenalMedicationAlerts(medications, latestLabs, egfr) {
  const current = Array.isArray(medications && medications.current) ? medications.current : [];
  if (egfr == null) return [];
  const alerts = [];
  current.forEach((item) => {
    if (!item || item.status !== 'active') return;
    const match = matchHighRiskRenalMedication(item);
    if (!match) return;
    const [drugKey, rule] = match;
    if (egfr >= rule.threshold) return;
    alerts.push({
      tone: egfr < Math.max(20, rule.threshold / 2) ? 'danger' : 'warn',
      title: `Renal review: ${item.name || rule.label}`,
      body: `${rule.reason} Current eGFR is ${egfr} mL/min/1.73m2; review dosing for ${item.name || rule.label}.`,
      kind: 'renal_medication',
      medicationKey: drugKey,
      medicationName: item.name || rule.label,
      renalEstimate: egfr,
    });
  });
  return alerts;
}

function getAntibioticReferenceEntries() {
  const references = [];
  if (typeof DRUG_DATA !== 'undefined' && DRUG_DATA && typeof DRUG_DATA === 'object') {
    Object.entries(DRUG_DATA).forEach(([key, entry]) => {
      const classText = entry && entry.class ? String(entry.class) : '';
      if (!ANTIBIOTIC_CLASS_PATTERN.test(classText)) return;
      references.push({
        key: String(key || '').toLowerCase(),
        label: entry.name || key,
        aliases: [key, entry.name, ...(Array.isArray(entry.aliases) ? entry.aliases : [])]
          .filter(Boolean)
          .map((alias) => String(alias).toLowerCase()),
      });
    });
  }
  FALLBACK_ANTIBIOTIC_KEYS.forEach((key) => {
    references.push({ key, label: key, aliases: [key] });
  });
  return references;
}

function isAntibioticMedication(item) {
  const drugKey = ((item && item.drug_key) || '').trim().toLowerCase();
  const name = ((item && item.name) || '').trim().toLowerCase();
  if (!drugKey && !name) return false;
  return getAntibioticReferenceEntries().some((entry) => {
    if (drugKey && (drugKey === entry.key || entry.aliases.includes(drugKey))) return true;
    return entry.aliases.some((alias) => alias && name.includes(alias));
  });
}

function parseMedicationStartDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (match) {
    const [, yyyy, mm, dd, hh = '0', min = '0'] = match;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function calculateMedicationDay(startedAt, referenceDate = new Date()) {
  const started = parseMedicationStartDate(startedAt);
  const reference = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (!started || Number.isNaN(reference.getTime())) return null;
  const startDay = new Date(started.getFullYear(), started.getMonth(), started.getDate());
  const referenceDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const delta = Math.floor((referenceDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
  return delta < 0 ? null : delta + 1;
}

function formatMedicationStartDate(startedAt) {
  const started = parseMedicationStartDate(startedAt);
  if (!started) return '';
  const yyyy = started.getFullYear();
  const mm = String(started.getMonth() + 1).padStart(2, '0');
  const dd = String(started.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getAntibioticDayTone(day) {
  if (day == null) return 'unknown';
  if (day >= 14) return 'danger';
  if (day >= 7) return 'warn';
  return 'info';
}

function buildAntibioticDayCounters(medications, referenceDate = new Date()) {
  const current = Array.isArray(medications && medications.current) ? medications.current : [];
  return current
    .filter((item) => item && item.status === 'active' && isAntibioticMedication(item))
    .map((item) => {
      const day = calculateMedicationDay(item.started_at, referenceDate);
      return {
        id: item.id || item.drug_key || item.name || '',
        name: item.name || 'Unnamed antibiotic',
        drugKey: item.drug_key || '',
        sig: formatStructuredMedicationSig(item),
        startedAt: item.started_at || '',
        startDate: formatMedicationStartDate(item.started_at),
        day,
        dayLabel: day == null ? 'Start date missing' : `Day ${day}`,
        tone: getAntibioticDayTone(day),
      };
    })
    .sort((left, right) => {
      if (left.day == null && right.day != null) return 1;
      if (left.day != null && right.day == null) return -1;
      if (left.day !== right.day) return (right.day || 0) - (left.day || 0);
      return left.name.localeCompare(right.name);
    });
}

function getInsightToneScore(tone) {
  if (tone === 'danger') return 3;
  if (tone === 'warn') return 2;
  if (tone === 'success') return 1;
  return 0;
}

function parseLabTimeline(record) {
  const parts = (record || '').split(/(?=^## \d{4}-\d{2}-\d{2})/m);
  const timeline = [];

  for (const part of parts) {
    const tsMatch = part.match(/^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*[—-]\s*(.+)$/m);
    if (!tsMatch) continue;
    const fallbackTimestamp = `${tsMatch[1]} ${tsMatch[2]}`;
    const category = (tsMatch[3] || '').trim();
    const bodyLines = getCandidateLabLines(part);
    const firstContentLine = bodyLines[0] || '';
    const isExplicitLabSection = /\blabs?\b/i.test(category);
    const isStandaloneLabBlock = /(?:^|\s)labs?\s*\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\)\s*:?\s*$/i.test(firstContentLine);
    if (!isExplicitLabSection && !isStandaloneLabBlock) continue;
    const timestamp = extractLabSectionTimestamp(firstContentLine, fallbackTimestamp);
    const labs = {};

    const tableRowRe = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
    let match;
    while ((match = tableRowRe.exec(part)) !== null) {
      const name = match[1].trim();
      const val = match[2].trim();
      if (name === 'Test' || name.startsWith('-')) continue;
      if (/urine/i.test(name)) continue;
      const numeric = val.match(/^[<>]?\s*([\d.]+)/);
      if (!numeric) continue;
      const value = parseFloat(numeric[1]);
      if (/creatinine|^cre$|^cr$/i.test(name)) labs.Cr = value;
      else if (/^na$/i.test(name) || /sodium/i.test(name)) labs.Na = value;
      else if (/^k$/i.test(name) || /potassium/i.test(name)) labs.K = value;
      else if (/^cl$/i.test(name) || /chloride/i.test(name)) labs.Cl = value;
      else if (/hco3|^co2$|^tco2$/i.test(name)) labs.HCO3 = value;
      else if (/^bun/i.test(name) || /urea.*n/i.test(name)) labs.BUN = value;
      else if (/albumin|^alb$/i.test(name)) labs.Alb = value;
      else if (/bilirubin|t-bil|t\.bil/i.test(name)) labs.TBili = value;
      else if (/^inr$/i.test(name)) labs.INR = value;
      else if (/calcium|^ca$/i.test(name)) labs.Ca = value;
      else if (/glucose|^glu$/i.test(name)) labs.Glu = value;
      else if (/platelet|^plt$/i.test(name)) labs.Plt = value;
      else if (/hemoglobin|^hb$|^hgb$/i.test(name)) labs.Hgb = value;
      else if (/wbc|white.*blood|leukocyte/i.test(name)) labs.WBC = value;
      else if (/anc|absolute neutrophil/i.test(name)) labs.ANC = value;
      else if (/crp|c-reactive/i.test(name)) labs.CRP = value;
      else if (/procalcitonin/i.test(name)) labs.PCT = value;  // require full word — "PCT" alone collides with plateletcrit in CBC reports
      else if (/^ast$|got/i.test(name)) labs.AST = value;
      else if (/^alt$|gpt/i.test(name)) labs.ALT = value;
      else if (/alp|alkaline phosphatase/i.test(name)) labs.ALP = value;
      else if (/^aptt$|activated partial thromboplastin/i.test(name)) labs.APTT = value;
      else if (/ferritin/i.test(name)) labs.Ferritin = value;
      else if (/^ldh$|lactate dehydrogenase/i.test(name)) labs.LDH = value;
      else if (/^ck$|^cpk$|creatine kinase|creatine phosphokinase/i.test(name)) labs.CK = value;
      else if (/uric acid|urate/i.test(name)) labs.UricAcid = value;
      else if (/fibrinogen/i.test(name)) labs.Fibrinogen = value;
      else if (/^mg$|magnesium/i.test(name)) labs.Mg = value;
      else if (/^phos$|phosphate|phosphorus/i.test(name)) labs.Phos = value;
      else if (/^tsh$|thyroid.stimulat/i.test(name)) labs.TSH = value;
      else if (/^ft4$|^free\s*t4$|free.*thyroxine/i.test(name)) labs.FT4 = value;
    }

    const inlineLabLines = bodyLines;
    if (labs.Cr === undefined) labs.Cr = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Cr(?:eatinine)?|SCr)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Na === undefined) labs.Na = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Na|Sodium)\s*[:=]?\s*(\d+)(?=$|[\s,;()])/i);
    if (labs.K === undefined) labs.K = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:K|Potassium)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Cl === undefined) labs.Cl = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Cl|Chloride)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.HCO3 === undefined) labs.HCO3 = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:HCO3|CO2|TCO2)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.BUN === undefined) labs.BUN = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:BUN|Urea\s+nitrogen)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Hgb === undefined) labs.Hgb = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Hgb|Hb|Hemoglobin)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.WBC === undefined) labs.WBC = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:WBC|Leukocyte)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Plt === undefined) labs.Plt = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Plt|Platelet(?:s)?)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.ANC === undefined) labs.ANC = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:ANC|Absolute\s+Neutrophil(?:\s+Count)?)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.CRP === undefined) labs.CRP = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:CRP|C-reactive\s+protein)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.AST === undefined) labs.AST = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:AST|GOT)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.ALT === undefined) labs.ALT = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:ALT|GPT)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.ALP === undefined) labs.ALP = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:ALP|Alk(?:aline)?\s*Phos(?:phatase)?)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.TBili === undefined) labs.TBili = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Total\s*bilirubin|T\.?Bili)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Alb === undefined) labs.Alb = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Albumin|Alb)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.INR === undefined) labs.INR = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*INR\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.PCT === undefined) labs.PCT = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*Procalcitonin\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i); // no bare "PCT" — collides with plateletcrit
    if (labs.APTT === undefined) labs.APTT = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:APTT|aPTT)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Ferritin === undefined) labs.Ferritin = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*Ferritin\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.LDH === undefined) labs.LDH = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:LDH|Lactate\s+dehydrogenase)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.CK === undefined) labs.CK = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:CK|CPK|Creatine\s+kinase)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.UricAcid === undefined) labs.UricAcid = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Uric\s*acid|Urate)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Fibrinogen === undefined) labs.Fibrinogen = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*Fibrinogen\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Ca === undefined) labs.Ca = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Ca|Calcium)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Mg === undefined) labs.Mg = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Mg|Magnesium)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.Phos === undefined) labs.Phos = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:Phos(?:phate)?|Phosphorus)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.TSH === undefined) labs.TSH = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*TSH\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);
    if (labs.FT4 === undefined) labs.FT4 = extractInlineLabValue(inlineLabLines, /(?:^|[,;])\s*(?:FT4|Free\s*T4)\s*[:=]?\s*([\d.]+)(?=$|[\s,;()])/i);

    if (Object.keys(labs).length > 0) {
      timeline.push({ timestamp, labs });
    }
  }

  return timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function formatLabDelta(curr, prev, digits = 1) {
  if (curr === undefined || prev === undefined || prev === 0) return null;
  const delta = curr - prev;
  const pct = (delta / prev) * 100;
  const roundedDelta = Math.round(delta * (10 ** digits)) / (10 ** digits);
  const roundedPct = Math.round(pct);
  return `${roundedDelta > 0 ? '+' : ''}${roundedDelta} (${roundedPct > 0 ? '+' : ''}${roundedPct}%)`;
}

// ---------------------------------------------------------------------------
// INSIGHT_CRITERIA — hover tooltip text for each alert title.
// Describes the exact rule, threshold, or formula that triggers the alert.
// ---------------------------------------------------------------------------
const INSIGHT_CRITERIA = {
  // ---- Renal ----
  'AKI rise':
    'Fires when: Cr rises ≥0.3 mg/dL OR ≥1.5× the previous value (KDIGO AKI stage 1 criteria).',
  'Renal function improving':
    'Fires when: Cr improves by ≥0.2 mg/dL OR decreases to ≤80% of the previous value.',

  // ---- Potassium ----
  'Hyperkalemia':           'Threshold: K ≥ 5.5 mEq/L.',
  'Borderline hyperkalemia':'Threshold: K 5.0–5.4 mEq/L.',
  'Severe hypokalemia':     'Threshold: K < 3.0 mEq/L.',
  'Hypokalemia':            'Threshold: K 3.0–3.4 mEq/L.',

  // ---- Sodium ----
  'Severe hyponatremia':    'Threshold: Na < 125 mEq/L.',
  'Hyponatremia':           'Threshold: Na 125–129 mEq/L.',
  'Severe hypernatremia':   'Threshold: Na ≥ 150 mEq/L.',
  'Hypernatremia':          'Threshold: Na 145–149 mEq/L.',

  // ---- Acid-Base ----
  'Anion-gap metabolic acidosis pattern':
    'Formula: Corrected AG = Na − Cl − HCO₃ + 2.5×(4 − Alb). Fires when corrected AG ≥ 16 and HCO₃ < 22. If Alb is unavailable, normal albumin (4 g/dL) is assumed.',

  // ---- Neutrophils ----
  'Severe neutropenia': 'Threshold: ANC < 500 /µL.',
  'Neutropenia':        'Threshold: ANC 500–999 /µL.',

  // ---- Inflammation trend ----
  'CRP rising':
    'Fires when: CRP increases ≥25% AND rises by ≥1 mg/L from the previous value.',
  'CRP falling':
    'Fires when: CRP decreases to ≤80% of the previous value (≥20% reduction).',
  'WBC rising':
    'Fires when CRP is unavailable: WBC increases ≥25% from the previous value.',
  'WBC falling':
    'Fires when CRP is unavailable: WBC decreases to ≤80% of the previous value.',

  // ---- Liver pattern (R ratio) ----
  'Hepatocellular pattern':
    'R ratio = (ALT ÷ 40) ÷ (ALP ÷ 120). Hepatocellular pattern when R ≥ 5.',
  'Cholestatic pattern':
    'R ratio = (ALT ÷ 40) ÷ (ALP ÷ 120). Cholestatic pattern when R ≤ 2.',
  'Mixed liver pattern':
    'R ratio = (ALT ÷ 40) ÷ (ALP ÷ 120). Mixed pattern when R is 2–5.',
  'Hyperbilirubinemia':
    'Fires alongside R-ratio pattern when TBili ≥ 2.0 mg/dL.',

  // ---- Platelet trend ----
  'Platelet drop':
    'Fires when: Plt drops to ≤50% of the previous value.',

  // ---- CBC absolute ----
  'Severe anaemia':         'Threshold: Hgb < 7.0 g/dL.',
  'Anaemia':                'Threshold: Hgb 7.0–7.9 g/dL.',
  'Marked leukocytosis':    'Threshold: WBC ≥ 20 ×10³/µL.',
  'Leukocytosis':           'Threshold: WBC 15–19.9 ×10³/µL.',
  'Severe leukopenia':      'Threshold: WBC < 2.0 ×10³/µL.',
  'Leukopenia':             'Threshold: WBC 2.0–3.9 ×10³/µL.',
  'Severe thrombocytopenia':'Threshold: Plt < 50 ×10³/µL.',
  'Thrombocytopenia':       'Threshold: Plt 50–99 ×10³/µL.',

  // ---- Coagulation ----
  'Significantly elevated INR': 'Threshold: INR ≥ 2.5.',
  'Elevated INR':               'Threshold: INR 1.5–2.4.',
  'Markedly prolonged APTT':    'Threshold: APTT ≥ 100 s.',
  'Prolonged APTT':             'Threshold: APTT 45–99 s.',
  'Critically low fibrinogen':  'Threshold: Fibrinogen < 100 mg/dL.',
  'Low fibrinogen':             'Threshold: Fibrinogen 100–149 mg/dL.',

  // ---- CRP standalone ----
  'Markedly elevated CRP':
    'Fires when no previous CRP is available. Threshold: CRP ≥ 200 mg/L.',
  'Elevated CRP':
    'Fires when no previous CRP is available. Threshold: CRP elevated (no prior value for trend).',

  // ---- Bilirubin standalone ----
  'Severe hyperbilirubinemia': 'Threshold: TBili ≥ 10.0 mg/dL (standalone, outside R-ratio context).',

  // ---- Albumin ----
  'Severe hypoalbuminaemia': 'Threshold: Alb < 2.0 g/dL.',
  'Hypoalbuminaemia':        'Threshold: Alb 2.0–2.4 g/dL.',

  // ---- BUN ----
  'Elevated BUN': 'Threshold: BUN ≥ 40 mg/dL.',

  // ---- Ferritin ----
  'Markedly elevated ferritin': 'Threshold: Ferritin ≥ 2000 µg/L.',
  'Elevated ferritin':          'Threshold: Ferritin 500–1999 µg/L.',

  // ---- LDH ----
  'Markedly elevated LDH': 'Threshold: LDH ≥ 1000 U/L.',
  'Elevated LDH':          'Threshold: LDH 600–999 U/L.',

  // ---- CK ----
  'Severe CK elevation': 'Threshold: CK ≥ 10 000 U/L.',
  'Elevated CK':         'Threshold: CK 1000–9999 U/L.',

  // ---- Uric acid ----
  'Severe hyperuricaemia': 'Threshold: Uric acid ≥ 10 mg/dL.',
  'Hyperuricaemia':        'Threshold: Uric acid 8.0–9.9 mg/dL.',

  // ---- Calcium ----
  'Severe hypocalcaemia':  'Threshold: Ca < 7.5 mg/dL.',
  'Hypocalcaemia':         'Threshold: Ca 7.5–8.4 mg/dL.',
  'Severe hypercalcaemia': 'Threshold: Ca > 12.0 mg/dL.',
  'Hypercalcaemia':        'Threshold: Ca 10.5–12.0 mg/dL.',

  // ---- Magnesium ----
  'Severe hypomagnesaemia':  'Threshold: Mg < 1.2 mg/dL.',
  'Hypomagnesaemia':         'Threshold: Mg 1.2–1.7 mg/dL.',
  'Severe hypermagnesaemia': 'Threshold: Mg > 3.0 mg/dL.',
  'Hypermagnesaemia':        'Threshold: Mg 2.5–3.0 mg/dL.',

  // ---- Phosphate ----
  'Severe hypophosphataemia':  'Threshold: Phos < 1.0 mg/dL.',
  'Hypophosphataemia':         'Threshold: Phos 1.0–1.4 mg/dL.',
  'Severe hyperphosphataemia': 'Threshold: Phos > 6.0 mg/dL.',
  'Hyperphosphataemia':        'Threshold: Phos 4.5–6.0 mg/dL.',

  // ---- Thyroid ----
  'Overt hypothyroidism':      'Threshold: TSH > 10 mIU/L.',
  'Elevated TSH':              'Threshold: TSH 6.0–10 mIU/L.',
  'Markedly suppressed TSH':   'Threshold: TSH < 0.05 mIU/L.',
  'Suppressed TSH':            'Threshold: TSH 0.05–0.29 mIU/L.',
  'Very low Free T4':          'Threshold: FT4 < 0.5 ng/dL.',
  'Low Free T4':               'Threshold: FT4 0.5–0.69 ng/dL.',
  'Markedly elevated Free T4': 'Threshold: FT4 > 3.0 ng/dL.',
  'Elevated Free T4':          'Threshold: FT4 2.0–3.0 ng/dL.',

  // ---- Glucose ----
  'Diabetic ketoacidosis':
    'Fires when: Glu > 400 mg/dL AND HCO₃ < 18 mEq/L.',
  'Hyperosmolar hyperglycaemic state':
    'Fires when: Glu > 600 mg/dL without low HCO₃ (HCO₃ ≥ 18 or not measured).',
  'Severe hyperglycaemia':
    'Fires when: Glu 400–600 mg/dL without HCO₃ < 18 (DKA criteria not met).',

  // ---- Diagnostic patterns ----
  'HELLP syndrome':
    'Fires when ALL three met: Plt < 100 AND (ALT or AST ≥ 80) AND haemolysis proxy (Hgb < 9, or Hgb drop ≥ 2 g/dL, or LDH > 600).',
  'Partial HELLP syndrome criteria':
    'Fires when: Plt < 100 AND (ALT or AST ≥ 80), but haemolysis proxy is absent.',

  'Haemophagocytic lymphohistiocytosis':
    'Fires when: Ferritin ≥ 2000 µg/L AND ≥ 2 cytopenias (Hgb < 9.5, Plt < 100, or ANC < 1000).',
  'Haemophagocytic lymphohistiocytosis risk features':
    'Fires when: Ferritin ≥ 500 µg/L AND ≥ 1 cytopenia AND (ALT or AST > 80).',

  'Disseminated intravascular coagulation':
    'Fires when ≥ 3 of: Plt < 100; INR ≥ 1.5; APTT ≥ 45 s; Fibrinogen < 150 mg/dL.',
  'Possible disseminated intravascular coagulation':
    'Fires when exactly 2 criteria met, including Plt < 100, plus one of: INR ≥ 1.5 or APTT ≥ 45 s.',

  'Rhabdomyolysis with acute kidney injury':
    'Fires when: CK ≥ 10 000 U/L AND (Cr ≥ 2.0 mg/dL OR Cr rises ≥ 0.3 mg/dL / ≥ 1.5× previous).',

  'Tumour lysis syndrome':
    'Fires when: Uric acid ≥ 8 mg/dL AND ≥ 2 of: K ≥ 6.0 mEq/L; LDH > 600 U/L; Cr ≥ 1.5 mg/dL.',

  'Microangiopathic haemolytic anaemia':
    'Fires when: Plt < 50 AND haemolysis (LDH > 600 or Hgb drop ≥ 1.5 g/dL) AND coagulation normal (INR < 1.5 and APTT < 45 s). Normal coagulation distinguishes TTP/HUS from DIC.',

  'Pancytopenia — trilineage suppression':
    'Fires when ALL three simultaneously: WBC < 2.0, Hgb < 8.0 g/dL, Plt < 50.',

  'Hepatocellular pattern favouring alcoholic aetiology':
    'Fires when: AST > 40 AND ALT > 40 AND AST ÷ ALT ≥ 2:1.',

  'Hepatic decompensation — multiple organ dysfunction':
    'Fires when ≥ 2 of: INR ≥ 1.5; TBili ≥ 2.0 mg/dL; Cr ≥ 1.5 mg/dL or rising (KDIGO criteria).',

  'Refeeding syndrome risk':
    'Fires when ≥ 2 of: Phos < 1.5 mg/dL; Mg < 1.8 mg/dL; K < 3.5 mEq/L.',

  'MELD-Na score — severe hepatic dysfunction':
    'Formula: MELD = 3.78×ln(TBili) + 11.2×ln(INR) + 9.57×ln(Cr) + 6.43 (Cr clamped 1–4). MELD-Na = MELD + 1.32×(137−Na) − 0.024×MELD×(137−Na) (Na clamped 125–137). Fires when score ≥ 25.',
  'MELD-Na score — significant hepatic dysfunction':
    'Same formula as above. Fires when MELD-Na 15–24 (threshold at which transplant benefit typically outweighs risk).',

  'Adrenal insufficiency — electrolyte pattern':
    'Fires when: Na < 130 mEq/L AND K ≥ 5.0 mEq/L AND Cr < 2.5 mg/dL (renal failure excluded as cause).',

  'Acute hepatocellular injury with coagulopathy':
    'Fires when: (ALT or AST > 400) AND INR ≥ 1.5. Upper limit of normal assumed as ALT/AST 40 U/L.',
  'Massive transaminase elevation':
    'Fires when: ALT or AST > 400 U/L WITHOUT INR ≥ 1.5 (coagulopathy absent or not measured).',

  'Possible acute cholangitis — cholestatic obstruction with systemic inflammation':
    'Fires when: ALP ≥ 200 AND TBili ≥ 2.0 AND cholestatic-dominant R ratio (ALP/ULN ÷ ALT/ULN ≥ 1) AND systemic inflammation (CRP ≥ 30 mg/L or WBC ≥ 12 ×10³/µL).',
};

function getInsightCriteriaText(insight) {
  if (!insight) return '';
  if (insight.criteria) return insight.criteria;
  if (insight.title && INSIGHT_CRITERIA[insight.title]) return INSIGHT_CRITERIA[insight.title];
  if (insight.kind === 'renal_medication') {
    const rule = insight.medicationKey ? HIGH_RISK_RENAL_MEDICATIONS[insight.medicationKey] : null;
    if (rule) {
      return `Fires when: ${rule.label} is active and eGFR falls below ${rule.threshold} mL/min/1.73m2. ${rule.reason}`;
    }
  }
  return 'Rule-based alert generated from current and prior labs; explicit criteria text is not defined for this alert title yet.';
}

function getPatientContextLabRuleCatalog() {
  return Object.entries(INSIGHT_CRITERIA).map(([title, criteria]) => ({
    key: `lab-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    title,
    kind: 'lab_timeline_rule',
    category: 'Lab timeline rule',
    defaultTone: 'varies',
    criteria,
    sourceLabel: 'Local deterministic lab timeline rule.',
    builtIn: true,
  }));
}

function interpretLabTimeline(timeline) {
  if (!timeline || timeline.length === 0) return [];
  const latest = timeline[timeline.length - 1].labs || {};
  const previous = timeline.length > 1 ? (timeline[timeline.length - 2].labs || {}) : {};
  const insights = [];
  const addInsight = (tone, title, body) => insights.push({ tone, title, body });

  if (latest.Cr !== undefined) {
    if (previous.Cr !== undefined && (latest.Cr - previous.Cr >= 0.3 || latest.Cr >= previous.Cr * 1.5)) {
      addInsight('danger', 'AKI rise', `Creatinine increased from ${previous.Cr} to ${latest.Cr} mg/dL. Reassess volume, obstruction, nephrotoxins, and renally cleared medications.`);
    } else if (previous.Cr !== undefined && (previous.Cr - latest.Cr >= 0.2 || latest.Cr <= previous.Cr * 0.8)) {
      addInsight('success', 'Renal function improving', `Creatinine improved from ${previous.Cr} to ${latest.Cr} mg/dL (${formatLabDelta(latest.Cr, previous.Cr)}).`);
    }
  }

  if (latest.K !== undefined) {
    if (latest.K >= 5.5) addInsight('danger', 'Hyperkalemia', `Potassium is ${latest.K} mEq/L. Review ECG risk, renal function, and potassium-raising medications urgently.`);
    else if (latest.K >= 5.0) addInsight('warn', 'Borderline hyperkalemia', `Potassium is ${latest.K} mEq/L. Recheck the trend and current medication list.`);
    else if (latest.K < 3.0) addInsight('danger', 'Severe hypokalemia', `Potassium is ${latest.K} mEq/L. This is arrhythmogenic and usually needs prompt replacement.`);
    else if (latest.K < 3.5) addInsight('warn', 'Hypokalemia', `Potassium is ${latest.K} mEq/L. Review losses, diuretics, insulin shifts, and magnesium status.`);
  }

  if (latest.Na !== undefined) {
    if (latest.Na < 125) addInsight('danger', 'Severe hyponatremia', `Sodium is ${latest.Na} mEq/L. Confirm symptoms, chronicity, and volume status before correcting.`);
    else if (latest.Na < 130) addInsight('warn', 'Hyponatremia', `Sodium is ${latest.Na} mEq/L. Consider volume status, SIADH triggers, and glucose correction.`);
    else if (latest.Na >= 150) addInsight('danger', 'Severe hypernatremia', `Sodium is ${latest.Na} mEq/L. Review free-water deficit and ongoing losses.`);
    else if (latest.Na >= 145) addInsight('warn', 'Hypernatremia', `Sodium is ${latest.Na} mEq/L. Consider osmotic and insensible free-water losses.`);
  }

  if (latest.Na !== undefined && latest.Cl !== undefined && latest.HCO3 !== undefined) {
    const alb = latest.Alb !== undefined ? latest.Alb : 4;
    const correctedAg = latest.Na - latest.Cl - latest.HCO3 + 2.5 * (4 - alb);
    if (correctedAg >= 16 && latest.HCO3 < 22) {
      addInsight('warn', 'Anion-gap metabolic acidosis pattern', `Corrected anion gap is about ${Math.round(correctedAg * 10) / 10} with HCO3 ${latest.HCO3}.`);
    }
  }

  if (latest.ANC !== undefined) {
    if (latest.ANC < 500) addInsight('danger', 'Severe neutropenia', `ANC is ${latest.ANC}. If febrile, treat this as high-risk neutropenic fever.`);
    else if (latest.ANC < 1000) addInsight('warn', 'Neutropenia', `ANC is ${latest.ANC}. Infection risk is meaningfully elevated.`);
  }

  if (latest.CRP !== undefined && previous.CRP !== undefined) {
    if (latest.CRP >= previous.CRP * 1.25 && latest.CRP - previous.CRP >= 1) {
      addInsight('warn', 'CRP rising', `CRP increased from ${previous.CRP} to ${latest.CRP}. Correlate with symptoms, source control, and antibiotic timing.`);
    } else if (latest.CRP <= previous.CRP * 0.8) {
      addInsight('success', 'CRP falling', `CRP decreased from ${previous.CRP} to ${latest.CRP}.`);
    }
  } else if (latest.WBC !== undefined && previous.WBC !== undefined) {
    if (latest.WBC >= previous.WBC * 1.25) {
      addInsight('warn', 'WBC rising', `WBC increased from ${previous.WBC} to ${latest.WBC}.`);
    } else if (latest.WBC <= previous.WBC * 0.8) {
      addInsight('success', 'WBC falling', `WBC decreased from ${previous.WBC} to ${latest.WBC}.`);
    }
  }

  if (latest.ALT !== undefined && latest.ALP !== undefined) {
    const rRatio = (latest.ALT / 40) / Math.max(latest.ALP / 120, 0.1);
    if (rRatio >= 5) addInsight('warn', 'Hepatocellular pattern', `ALT ${latest.ALT} and ALP ${latest.ALP} suggest a hepatocellular-predominant liver pattern.`);
    else if (rRatio <= 2) addInsight('warn', 'Cholestatic pattern', `ALT ${latest.ALT} and ALP ${latest.ALP} suggest a cholestatic-predominant liver pattern.`);
    else addInsight('info', 'Mixed liver pattern', `ALT ${latest.ALT} and ALP ${latest.ALP} suggest a mixed liver pattern.`);
    if (latest.TBili !== undefined && latest.TBili >= 2) {
      addInsight('warn', 'Hyperbilirubinemia', `Total bilirubin is ${latest.TBili}. Interpret with the AST, ALT, and ALP trend.`);
    }
  }

  if (latest.Plt !== undefined && previous.Plt !== undefined && latest.Plt <= previous.Plt * 0.5) {
    addInsight('warn', 'Platelet drop', `Platelets dropped from ${previous.Plt} to ${latest.Plt}. Review sepsis, drug effect, dilution, and HIT risk if exposed.`);
  }

  // ---- CBC absolute-level rules ----
  if (latest.Hgb !== undefined) {
    if (latest.Hgb < 7.0) addInsight('danger', 'Severe anaemia', `Haemoglobin is ${latest.Hgb} g/dL. Assess for active bleeding, haemolysis, and transfusion threshold.`);
    else if (latest.Hgb < 8.0) addInsight('warn', 'Anaemia', `Haemoglobin is ${latest.Hgb} g/dL. Review trend and symptoms.`);
  }

  if (latest.WBC !== undefined) {
    if (latest.WBC >= 20) addInsight('danger', 'Marked leukocytosis', `WBC is ${latest.WBC}. Consider severe infection, haematologic cause, or steroid effect.`);
    else if (latest.WBC >= 15) addInsight('warn', 'Leukocytosis', `WBC is ${latest.WBC}. Correlate with clinical picture and infection markers.`);
    else if (latest.WBC < 2.0) addInsight('danger', 'Severe leukopenia', `WBC is ${latest.WBC}. High risk for opportunistic infection.`);
    else if (latest.WBC < 4.0) addInsight('warn', 'Leukopenia', `WBC is ${latest.WBC}. Monitor and investigate cause.`);
  }

  if (latest.Plt !== undefined) {
    if (latest.Plt < 50) addInsight('danger', 'Severe thrombocytopenia', `Platelets are ${latest.Plt}. Bleeding risk is high. Review sepsis, HIT, drugs, and DIC.`);
    else if (latest.Plt < 100) addInsight('warn', 'Thrombocytopenia', `Platelets are ${latest.Plt}. Monitor trend and review causes.`);
  }

  // ---- Coagulation ----
  if (latest.INR !== undefined) {
    if (latest.INR >= 2.5) addInsight('danger', 'Significantly elevated INR', `INR is ${latest.INR}. Assess coagulopathy cause and bleeding risk.`);
    else if (latest.INR >= 1.5) addInsight('warn', 'Elevated INR', `INR is ${latest.INR}. Consider liver function, vitamin K, and anticoagulant effect.`);
  }

  if (latest.APTT !== undefined) {
    if (latest.APTT >= 100) addInsight('danger', 'Markedly prolonged APTT', `APTT is ${latest.APTT}s. Assess heparin effect, factor deficiency, or inhibitor.`);
    else if (latest.APTT >= 45) addInsight('warn', 'Prolonged APTT', `APTT is ${latest.APTT}s. Review anticoagulation and coagulation factor status.`);
  }

  // ---- Inflammation (absolute level, complements trend rule) ----
  if (latest.CRP !== undefined && latest.CRP >= 30) {
    addInsight('danger', 'Markedly elevated CRP', `CRP is ${latest.CRP} mg/L. Suggests significant systemic inflammation or infection.`);
  } else if (latest.CRP !== undefined && latest.CRP >= 10 && previous.CRP === undefined) {
    // Only add absolute warn if there is no previous value (otherwise trend rule handled it)
    addInsight('warn', 'Elevated CRP', `CRP is ${latest.CRP} mg/L. No prior value for trend comparison.`);
  }

  // ---- LFTs standalone (supplement ratio rule) ----
  if (latest.TBili !== undefined && latest.TBili >= 5.0 && !(latest.ALT !== undefined && latest.ALP !== undefined)) {
    addInsight('danger', 'Severe hyperbilirubinemia', `Total bilirubin is ${latest.TBili}. Warrants urgent hepatic and biliary assessment.`);
  } else if (latest.TBili !== undefined && latest.TBili >= 2.0 && !(latest.ALT !== undefined && latest.ALP !== undefined)) {
    addInsight('warn', 'Hyperbilirubinemia', `Total bilirubin is ${latest.TBili}. Investigate hepatic and obstructive causes.`);
  }

  if (latest.Alb !== undefined) {
    if (latest.Alb < 2.0) addInsight('danger', 'Severe hypoalbuminaemia', `Albumin is ${latest.Alb} g/dL. Impacts drug binding, oncotic pressure, and wound healing.`);
    else if (latest.Alb < 2.5) addInsight('warn', 'Hypoalbuminaemia', `Albumin is ${latest.Alb} g/dL. Consider nutrition, liver synthesis, and protein losses.`);
  }

  // ---- Renal (BUN as standalone uremia/GI bleed marker) ----
  if (latest.BUN !== undefined) {
    if (latest.BUN >= 40) addInsight('warn', 'Elevated BUN', `BUN is ${latest.BUN} mg/dL. Consider pre-renal uraemia, GI bleed, or high-protein catabolism alongside Cr trend.`);
  }

  // ---- New standalone lab rules ----
  if (latest.Ferritin !== undefined) {
    if (latest.Ferritin >= 2000) addInsight('danger', 'Markedly elevated ferritin', `Ferritin is ${latest.Ferritin} µg/L. At this level, consider HLH, severe sepsis, or haematologic malignancy.`);
    else if (latest.Ferritin >= 500) addInsight('warn', 'Elevated ferritin', `Ferritin is ${latest.Ferritin} µg/L. Evaluate for active infection, inflammation, or haemophagocytic process.`);
  }

  if (latest.LDH !== undefined) {
    if (latest.LDH >= 1000) addInsight('danger', 'Markedly elevated LDH', `LDH is ${latest.LDH} U/L. Suggests haemolysis, tissue breakdown, or haematologic emergency.`);
    else if (latest.LDH >= 600) addInsight('warn', 'Elevated LDH', `LDH is ${latest.LDH} U/L. Consider haemolysis, rhabdomyolysis, hepatic injury, or haematologic disease.`);
  }

  if (latest.CK !== undefined) {
    if (latest.CK >= 10000) addInsight('danger', 'Severe CK elevation', `CK is ${latest.CK} U/L. Consistent with severe rhabdomyolysis — aggressive fluid resuscitation and renal monitoring are urgent.`);
    else if (latest.CK >= 1000) addInsight('warn', 'Elevated CK', `CK is ${latest.CK} U/L. Evaluate for rhabdomyolysis, myocardial injury, or inflammatory myopathy.`);
  }

  if (latest.UricAcid !== undefined) {
    if (latest.UricAcid >= 10) addInsight('danger', 'Severe hyperuricaemia', `Uric acid is ${latest.UricAcid} mg/dL. Risk of urate nephropathy; evaluate for tumour lysis syndrome or gout crisis.`);
    else if (latest.UricAcid >= 8) addInsight('warn', 'Hyperuricaemia', `Uric acid is ${latest.UricAcid} mg/dL. Consider TLS risk, diet, diuretics, and renal excretion.`);
  }

  if (latest.Fibrinogen !== undefined) {
    if (latest.Fibrinogen < 100) addInsight('danger', 'Critically low fibrinogen', `Fibrinogen is ${latest.Fibrinogen} mg/dL. Severe coagulopathy — consider DIC, massive transfusion, or fibrinolysis.`);
    else if (latest.Fibrinogen < 150) addInsight('warn', 'Low fibrinogen', `Fibrinogen is ${latest.Fibrinogen} mg/dL. Review for consumptive coagulopathy, liver failure, or DIC risk.`);
  }

  // ---- Calcium standalone rules ----
  if (latest.Ca !== undefined) {
    if (latest.Ca < 7.5) addInsight('danger', 'Severe hypocalcaemia', `Calcium is ${latest.Ca} mg/dL. Risk of tetany, laryngospasm, and arrhythmia — urgent calcium replacement and ECG review.`);
    else if (latest.Ca < 8.5) addInsight('warn', 'Hypocalcaemia', `Calcium is ${latest.Ca} mg/dL. Review for hypoparathyroidism, vitamin D deficiency, magnesium depletion, or renal losses.`);
    else if (latest.Ca > 12.0) addInsight('danger', 'Severe hypercalcaemia', `Calcium is ${latest.Ca} mg/dL. Hypercalcaemic crisis risk — aggressive hydration, consider bisphosphonates, and investigate malignancy or hyperparathyroidism urgently.`);
    else if (latest.Ca > 10.5) addInsight('warn', 'Hypercalcaemia', `Calcium is ${latest.Ca} mg/dL. Investigate for malignancy, primary hyperparathyroidism, or thiazide diuretics.`);
  }

  // ---- New standalone rules: Mg, Phosphate, TSH, FT4 ----
  if (latest.Mg !== undefined) {
    if (latest.Mg < 1.2) addInsight('danger', 'Severe hypomagnesaemia', `Magnesium is ${latest.Mg} mg/dL. At this level, refractory hypokalaemia and hypocalcaemia are common; arrhythmia risk is elevated.`);
    else if (latest.Mg < 1.8) addInsight('warn', 'Hypomagnesaemia', `Magnesium is ${latest.Mg} mg/dL. Check for GI losses, diuretics, and concomitant hypokalaemia.`);
    else if (latest.Mg > 3.0) addInsight('danger', 'Severe hypermagnesaemia', `Magnesium is ${latest.Mg} mg/dL. Neuromuscular blockade and cardiac conduction risk — usually iatrogenic; stop Mg supplementation and review.`);
    else if (latest.Mg > 2.4) addInsight('warn', 'Hypermagnesaemia', `Magnesium is ${latest.Mg} mg/dL. Review supplements and renal function.`);
  }

  if (latest.Phos !== undefined) {
    if (latest.Phos < 1.0) addInsight('danger', 'Severe hypophosphataemia', `Phosphate is ${latest.Phos} mg/dL. Risk of respiratory muscle weakness, haemolysis, and arrhythmia — prompt replacement required.`);
    else if (latest.Phos < 1.5) addInsight('warn', 'Hypophosphataemia', `Phosphate is ${latest.Phos} mg/dL. Investigate for refeeding, malabsorption, or hyperparathyroidism.`);
    else if (latest.Phos > 6.0) addInsight('danger', 'Severe hyperphosphataemia', `Phosphate is ${latest.Phos} mg/dL. Associated with ectopic calcification and worsened renal failure — review phosphate binders and diet.`);
    else if (latest.Phos > 4.5) addInsight('warn', 'Hyperphosphataemia', `Phosphate is ${latest.Phos} mg/dL. Common in renal failure; dietary and medication review indicated.`);
  }

  if (latest.TSH !== undefined) {
    if (latest.TSH > 10) addInsight('danger', 'Overt hypothyroidism', `TSH is ${latest.TSH} mIU/L. Myxoedema risk in the right clinical context; correlate with Free T4 and symptoms.`);
    else if (latest.TSH > 6) addInsight('warn', 'Elevated TSH', `TSH is ${latest.TSH} mIU/L. Subclinical or overt hypothyroidism — check Free T4 and consider thyroid replacement.`);
    else if (latest.TSH < 0.05) addInsight('danger', 'Markedly suppressed TSH', `TSH is ${latest.TSH} mIU/L. Possible thyroid storm in a sick patient; correlate with Free T4, T3, and clinical status urgently.`);
    else if (latest.TSH < 0.3) addInsight('warn', 'Suppressed TSH', `TSH is ${latest.TSH} mIU/L. Consistent with hyperthyroidism — check Free T4 and review thyroid medications.`);
  }

  if (latest.FT4 !== undefined) {
    if (latest.FT4 < 0.5) addInsight('danger', 'Very low Free T4', `Free T4 is ${latest.FT4} ng/dL. Severe thyroid hormone deficiency — review in context of TSH and clinical picture.`);
    else if (latest.FT4 < 0.7) addInsight('warn', 'Low Free T4', `Free T4 is ${latest.FT4} ng/dL. Possible hypothyroidism; correlate with TSH.`);
    else if (latest.FT4 > 3.0) addInsight('danger', 'Markedly elevated Free T4', `Free T4 is ${latest.FT4} ng/dL. Consistent with overt hyperthyroidism; thyroid storm risk in an acutely ill patient.`);
    else if (latest.FT4 > 2.0) addInsight('warn', 'Elevated Free T4', `Free T4 is ${latest.FT4} ng/dL. Consistent with hyperthyroidism — review with TSH.`);
  }

  // ---- Diagnostic patterns ----

  // HELLP syndrome: thrombocytopenia + elevated hepatic enzymes + haemolysis proxy
  {
    const hasThrombocytopenia = latest.Plt !== undefined && latest.Plt < 100;
    const hasElevatedLFTs = (latest.ALT !== undefined && latest.ALT >= 80) || (latest.AST !== undefined && latest.AST >= 80);
    const haemolysisProxy = (latest.Hgb !== undefined && latest.Hgb < 9)
      || (previous.Hgb !== undefined && latest.Hgb !== undefined && previous.Hgb - latest.Hgb >= 2)
      || (latest.LDH !== undefined && latest.LDH > 600);
    if (hasThrombocytopenia && hasElevatedLFTs && haemolysisProxy) {
      addInsight('danger', 'HELLP syndrome', `Plt ${latest.Plt}${latest.ALT !== undefined ? ', ALT ' + latest.ALT : latest.AST !== undefined ? ', AST ' + latest.AST : ''}${latest.LDH !== undefined ? ', LDH ' + latest.LDH : ''}. All three HELLP criteria met — thrombocytopenia, elevated transaminases, and haemolysis proxy. Urgent obstetric and haematology review.`);
    } else if (hasThrombocytopenia && hasElevatedLFTs) {
      addInsight('warn', 'Partial HELLP syndrome criteria', `Plt ${latest.Plt} and elevated hepatic enzymes without confirmed haemolysis. Monitor closely and review clinical context.`);
    }
  }

  // Haemophagocytic lymphohistiocytosis: hyperferritinaemia + cytopenias + elevated LFTs
  {
    const ferritin = latest.Ferritin;
    if (ferritin !== undefined && ferritin >= 500) {
      const cytopenias = [
        latest.Hgb !== undefined && latest.Hgb < 9.5,
        latest.Plt !== undefined && latest.Plt < 100,
        latest.ANC !== undefined && latest.ANC < 1000,
      ].filter(Boolean).length;
      const elevatedLFTs = (latest.ALT !== undefined && latest.ALT > 80) || (latest.AST !== undefined && latest.AST > 80);
      if (ferritin >= 2000 && cytopenias >= 2) {
        addInsight('danger', 'Haemophagocytic lymphohistiocytosis', `Ferritin ${ferritin} µg/L with ${cytopenias} cytopenia(s)${elevatedLFTs ? ' and elevated LFTs' : ''}. High suspicion — consider H-score and haematology urgently.`);
      } else if (cytopenias >= 1 && elevatedLFTs) {
        addInsight('warn', 'Haemophagocytic lymphohistiocytosis risk features', `Ferritin ${ferritin} µg/L with cytopenia(s) and elevated LFTs. Review for triggers: sepsis, malignancy, autoimmune disease.`);
      }
    }
  }

  // Disseminated intravascular coagulation: thrombocytopenia + coagulopathy ± low fibrinogen
  {
    const dicCriteria = [
      latest.Plt !== undefined && latest.Plt < 100,
      latest.INR !== undefined && latest.INR >= 1.5,
      latest.APTT !== undefined && latest.APTT >= 45,
      latest.Fibrinogen !== undefined && latest.Fibrinogen < 150,
    ];
    const dicScore = dicCriteria.filter(Boolean).length;
    if (dicScore >= 3) {
      const parts = [];
      if (latest.Plt !== undefined) parts.push(`Plt ${latest.Plt}`);
      if (latest.INR !== undefined) parts.push(`INR ${latest.INR}`);
      if (latest.APTT !== undefined) parts.push(`APTT ${latest.APTT}`);
      if (latest.Fibrinogen !== undefined) parts.push(`Fibrinogen ${latest.Fibrinogen}`);
      addInsight('danger', 'Disseminated intravascular coagulation', `${parts.join(', ')}. Multiple criteria met — thrombocytopenia, coagulopathy${latest.Fibrinogen !== undefined && latest.Fibrinogen < 150 ? ', and low fibrinogen' : ''}. Treat underlying cause and involve haematology.`);
    } else if (dicScore === 2 && latest.Plt !== undefined && latest.Plt < 100) {
      addInsight('warn', 'Possible disseminated intravascular coagulation', `Thrombocytopenia with coagulopathy. Monitor fibrinogen and reassess for progression.`);
    }
  }

  // Rhabdomyolysis: CK elevation ± acute kidney injury
  {
    if (latest.CK !== undefined && latest.CK >= 1000) {
      const akiContext = (latest.Cr !== undefined && latest.Cr >= 2.0)
        || (previous.Cr !== undefined && latest.Cr !== undefined && (latest.Cr - previous.Cr >= 0.3 || latest.Cr >= previous.Cr * 1.5));
      if (latest.CK >= 10000 && akiContext) {
        addInsight('danger', 'Rhabdomyolysis with acute kidney injury', `CK ${latest.CK} U/L with Cr ${latest.Cr} mg/dL. Severe rhabdomyolysis complicated by renal injury — high-volume fluid resuscitation and close monitoring essential.`);
      }
      // Note: standalone CK alerts already covered above
    }
  }

  // Tumour lysis syndrome: hyperuricaemia + electrolyte shift + LDH elevation
  {
    if (latest.UricAcid !== undefined && latest.UricAcid >= 8) {
      const tlsCriteria = [
        latest.K !== undefined && latest.K >= 6.0,
        latest.LDH !== undefined && latest.LDH > 600,
        latest.Cr !== undefined && latest.Cr >= 1.5,
      ].filter(Boolean).length;
      if (tlsCriteria >= 2) {
        const parts = [`Uric acid ${latest.UricAcid}`];
        if (latest.K !== undefined && latest.K >= 6.0) parts.push(`K ${latest.K}`);
        if (latest.LDH !== undefined && latest.LDH > 600) parts.push(`LDH ${latest.LDH}`);
        if (latest.Cr !== undefined && latest.Cr >= 1.5) parts.push(`Cr ${latest.Cr}`);
        addInsight('danger', 'Tumour lysis syndrome', `${parts.join(', ')}. Multiple criteria met — hydration, rasburicase, and cardiac monitoring warranted urgently.`);
      }
    }
  }

  // Microangiopathic haemolytic anaemia (TTP/HUS-like): thrombocytopenia + haemolysis + normal coagulation
  {
    const hasThrombocytopenia = latest.Plt !== undefined && latest.Plt < 50;
    const haemolysis = (latest.LDH !== undefined && latest.LDH > 600)
      || (previous.Hgb !== undefined && latest.Hgb !== undefined && previous.Hgb - latest.Hgb >= 1.5);
    // Normal coagulation distinguishes MAHA from DIC
    const coagulationNormal = (latest.INR === undefined || latest.INR < 1.5)
      && (latest.APTT === undefined || latest.APTT < 45);
    if (hasThrombocytopenia && haemolysis && coagulationNormal) {
      const parts = [`Plt ${latest.Plt}`];
      if (latest.LDH !== undefined && latest.LDH > 600) parts.push(`LDH ${latest.LDH}`);
      if (latest.Hgb !== undefined) parts.push(`Hgb ${latest.Hgb}`);
      addInsight('danger', 'Microangiopathic haemolytic anaemia', `${parts.join(', ')} with normal coagulation. Consistent with thrombotic microangiopathy (thrombotic thrombocytopenic purpura / haemolytic uraemic syndrome) rather than disseminated intravascular coagulation — urgent haematology review and ADAMTS13 consideration.`);
    }
  }

  // Pancytopenia: all three cell lines suppressed
  {
    const allThree = latest.WBC !== undefined && latest.WBC < 2.0
      && latest.Hgb !== undefined && latest.Hgb < 8.0
      && latest.Plt !== undefined && latest.Plt < 50;
    if (allThree) {
      addInsight('danger', 'Pancytopenia — trilineage suppression', `WBC ${latest.WBC}, Hgb ${latest.Hgb}, Plt ${latest.Plt}. All three cell lines suppressed simultaneously. Consider bone marrow failure, infiltration, aplastic anaemia, or severe haematotoxicity — haematology review warranted.`);
    }
  }

  // Hepatocellular pattern favouring alcoholic aetiology: AST:ALT > 2:1 with both elevated
  {
    if (latest.AST !== undefined && latest.ALT !== undefined && latest.ALT > 0 && latest.AST > 40 && latest.ALT > 40) {
      const ratio = latest.AST / latest.ALT;
      if (ratio >= 2) {
        const parts = [`AST ${latest.AST}`, `ALT ${latest.ALT}`, `ratio ${Math.round(ratio * 10) / 10}:1`];
        if (latest.TBili !== undefined && latest.TBili >= 2) parts.push(`TBili ${latest.TBili}`);
        addInsight('warn', 'Hepatocellular pattern favouring alcoholic aetiology', `${parts.join(', ')}. AST:ALT ratio ≥2:1 with both elevated is characteristic of alcoholic hepatitis or hepatic steatosis, as opposed to viral or toxic hepatocellular injury where ALT typically predominates.`);
      }
    }
  }

  // Hepatic decompensation (acute-on-chronic liver failure criteria): multi-organ failure in liver context
  {
    const liverFailure = latest.INR !== undefined && latest.INR >= 1.5;
    const bilirubinFailure = latest.TBili !== undefined && latest.TBili >= 2.0;
    const renalFailure = (latest.Cr !== undefined && latest.Cr >= 1.5)
      || (previous.Cr !== undefined && latest.Cr !== undefined && (latest.Cr - previous.Cr >= 0.3 || latest.Cr >= previous.Cr * 1.5));
    const organFailures = [liverFailure, bilirubinFailure, renalFailure].filter(Boolean).length;
    if (organFailures >= 2) {
      const parts = [];
      if (liverFailure) parts.push(`INR ${latest.INR}`);
      if (bilirubinFailure) parts.push(`TBili ${latest.TBili}`);
      if (latest.Cr !== undefined && renalFailure) parts.push(`Cr ${latest.Cr}`);
      if (latest.Alb !== undefined && latest.Alb < 2.5) parts.push(`Alb ${latest.Alb}`);
      addInsight('danger', 'Hepatic decompensation — multiple organ dysfunction', `${parts.join(', ')}. Pattern consistent with acute-on-chronic liver failure criteria: ≥2 organ failures in a hepatic context. Hepatology review, intensive monitoring, and transplant assessment warranted.`);
    }
  }

  // Diabetic ketoacidosis / hyperosmolar hyperglycaemic state
  {
    if (latest.Glu !== undefined && latest.Glu > 400) {
      if (latest.HCO3 !== undefined && latest.HCO3 < 18) {
        addInsight('danger', 'Diabetic ketoacidosis', `Glucose ${latest.Glu} mg/dL with HCO3 ${latest.HCO3} mEq/L. Hyperglycaemia with metabolic acidosis is consistent with diabetic ketoacidosis — insulin infusion, fluid resuscitation, and electrolyte monitoring urgently.`);
      } else if (latest.Glu > 600) {
        addInsight('danger', 'Hyperosmolar hyperglycaemic state', `Glucose ${latest.Glu} mg/dL${latest.HCO3 !== undefined ? ' with HCO3 ' + latest.HCO3 : ''}. Severe hyperglycaemia consistent with hyperosmolar hyperglycaemic state — calculate osmolality, start cautious rehydration, and monitor closely for cerebral oedema risk.`);
      } else {
        addInsight('warn', 'Severe hyperglycaemia', `Glucose is ${latest.Glu} mg/dL. Review for diabetic ketoacidosis (check HCO3 and anion gap) or hyperosmolar state.`);
      }
    }
  }

  // Refeeding syndrome risk: hypophosphataemia + hypomagnesaemia + hypokalaemia (≥2 of 3)
  {
    const refeedingCriteria = [
      latest.Phos !== undefined && latest.Phos < 1.5,
      latest.Mg !== undefined && latest.Mg < 1.8,
      latest.K !== undefined && latest.K < 3.5,
    ];
    const refeedingScore = refeedingCriteria.filter(Boolean).length;
    if (refeedingScore >= 2) {
      const parts = [];
      if (latest.Phos !== undefined && latest.Phos < 1.5) parts.push(`Phos ${latest.Phos}`);
      if (latest.Mg !== undefined && latest.Mg < 1.8) parts.push(`Mg ${latest.Mg}`);
      if (latest.K !== undefined && latest.K < 3.5) parts.push(`K ${latest.K}`);
      addInsight(refeedingScore === 3 ? 'danger' : 'warn', 'Refeeding syndrome risk', `${parts.join(', ')}. Multiple electrolyte depletions in a nutritional context. If the patient has recently resumed feeding after starvation, this is consistent with refeeding syndrome — slow the feeding rate and replace electrolytes carefully.`);
    }
  }

  // MELD-Na score: requires TBili, INR, Cr (Na optional for -Na adjustment)
  {
    if (latest.TBili !== undefined && latest.INR !== undefined && latest.Cr !== undefined) {
      const tbili = Math.max(latest.TBili, 1.0);
      const inr   = Math.max(latest.INR, 1.0);
      const cr    = Math.min(Math.max(latest.Cr, 1.0), 4.0);
      const meld  = Math.round(3.78 * Math.log(tbili) + 11.2 * Math.log(inr) + 9.57 * Math.log(cr) + 6.43);
      let score = meld;
      let label = `MELD ${meld}`;
      if (latest.Na !== undefined) {
        const na = Math.min(Math.max(latest.Na, 125), 137);
        score = Math.round(meld + 1.32 * (137 - na) - 0.024 * meld * (137 - na));
        label = `MELD-Na ${score} (MELD ${meld})`;
      }
      if (score >= 25) {
        addInsight('danger', 'MELD-Na score — severe hepatic dysfunction', `${label}. Estimated 3-month mortality without transplant is approximately 50–80%. Hepatology review, transplant evaluation, and intensive monitoring are indicated.`);
      } else if (score >= 15) {
        addInsight('warn', 'MELD-Na score — significant hepatic dysfunction', `${label}. MELD-Na ≥15 is the threshold at which transplant benefit typically outweighs surgical risk. Hepatology review recommended.`);
      }
    }
  }

  // Adrenal insufficiency — hyponatraemia with hyperkalaemia (without renal failure explanation)
  {
    if (latest.Na !== undefined && latest.Na < 130 && latest.K !== undefined && latest.K >= 5.0) {
      const renalFailureExplains = latest.Cr !== undefined && latest.Cr >= 2.5;
      if (!renalFailureExplains) {
        addInsight('warn', 'Adrenal insufficiency — electrolyte pattern', `Na ${latest.Na} mEq/L with K ${latest.K} mEq/L. Hyponatraemia with hyperkalaemia in the absence of severe renal failure is the classic adrenal insufficiency electrolyte signature. Consider cortisol, short Synacthen test, and review for other Addisonian features.`);
      }
    }
  }

  // Acute hepatocellular injury: massive transaminase elevation (>10× upper limit of normal) ± coagulopathy
  {
    const altMassive = latest.ALT !== undefined && latest.ALT > 400;
    const astMassive = latest.AST !== undefined && latest.AST > 400;
    if (altMassive || astMassive) {
      const peak = Math.max(latest.ALT || 0, latest.AST || 0);
      const parts = [];
      if (latest.ALT !== undefined) parts.push(`ALT ${latest.ALT}`);
      if (latest.AST !== undefined) parts.push(`AST ${latest.AST}`);
      const coagulopathy = latest.INR !== undefined && latest.INR >= 1.5;
      if (coagulopathy) {
        parts.push(`INR ${latest.INR}`);
        addInsight('danger', 'Acute hepatocellular injury with coagulopathy', `${parts.join(', ')} (${Math.round(peak / 40)}× upper limit of normal). Massive transaminase elevation with coagulopathy is consistent with acute liver failure. Establish aetiology urgently — paracetamol toxicity, ischaemic hepatitis, acute viral hepatitis, autoimmune — and consider N-acetylcysteine and transplant evaluation.`);
      } else {
        addInsight('warn', 'Massive transaminase elevation', `${parts.join(', ')} (${Math.round(peak / 40)}× upper limit of normal). Evaluate urgently for paracetamol toxicity, ischaemic hepatitis, acute viral hepatitis, or drug-induced liver injury. Monitor INR closely for early coagulopathy.`);
      }
    }
  }

  // Possible acute cholangitis: cholestatic-dominant pattern + systemic inflammation
  {
    const cholestatic = latest.ALP !== undefined && latest.ALP >= 200
      && latest.TBili !== undefined && latest.TBili >= 2.0
      && (latest.ALT === undefined || (latest.ALP / 120) / Math.max(latest.ALT / 40, 0.1) >= 1.0);
    const systemicInflam = (latest.CRP !== undefined && latest.CRP >= 30)
      || (latest.WBC !== undefined && latest.WBC >= 12);
    if (cholestatic && systemicInflam) {
      const parts = [`ALP ${latest.ALP}`, `TBili ${latest.TBili}`];
      if (latest.CRP !== undefined && latest.CRP >= 30) parts.push(`CRP ${latest.CRP}`);
      if (latest.WBC !== undefined && latest.WBC >= 12) parts.push(`WBC ${latest.WBC}`);
      addInsight('warn', 'Possible acute cholangitis — cholestatic obstruction with systemic inflammation', `${parts.join(', ')}. Elevated ALP and bilirubin with a systemic inflammatory response is consistent with biliary obstruction complicated by infection (Charcot's triad equivalent). Urgent biliary imaging and gastroenterology or surgical review indicated.`);
    }
  }

  return insights.slice(0, 18);
}

function parseRecordEntries(record) {
  const parts = (record || '').split(/(?=^## \d{4}-\d{2}-\d{2})/m);
  const entries = [];
  parts.forEach((part, index) => {
    const heading = part.match(/^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*[—-]\s*(.+)$/m);
    if (!heading) return;
    const timestamp = `${heading[1]} ${heading[2]}`;
    const category = (heading[3] || '').trim();
    const body = part.replace(/^##.*$/m, '').trim();
    const firstLine = body.split('\n').find((line) => line.trim()) || '';
    const excerpt = body.replace(/\s+/g, ' ').trim().slice(0, 240);
    entries.push({
      id: getRecentEventId({ category, timestamp }, index),
      timestamp,
      category,
      title: firstLine.replace(/[*#:-]+/g, ' ').replace(/\s+/g, ' ').trim() || category,
      body,
      excerpt: excerpt.length >= 240 ? `${excerpt}...` : excerpt,
    });
  });
  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function getImportantEvents(entries, limit = 8) {
  return (entries || [])
    .filter((entry) => IMPORTANT_EVENT_CATEGORIES.includes(entry.category))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

function getPatientContextGroupId(group) {
  return `pc-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function getRecentEventId(entry, index) {
  const base = `${entry && entry.category ? entry.category : 'event'}-${entry && entry.timestamp ? entry.timestamp : index || 0}`;
  return `pc-event-${base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function extractLabSectionTimestamp(firstContentLine, fallbackTimestamp) {
  const explicitMatch = (firstContentLine || '').match(/\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\)/);
  if (explicitMatch) return `${explicitMatch[1]} ${explicitMatch[2]}`;
  return fallbackTimestamp;
}

function getCandidateLabLines(part) {
  return (part || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && line.length <= 220)
    .filter((line) => !/^##\s/.test(line))
    .filter((line) => !/time\/item|laboratory report|wbc classification|general biochemistry|arterial blood|stool stool/i.test(line));
}

function extractInlineLabValue(lines, pattern) {
  for (const line of lines) {
    const match = line.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  return undefined;
}

function formatPatientContextMultiline(text) {
  return escPatientContextHtml(text || '').replace(/\n/g, '<br>');
}

function getLabBadge(key, latest, previous) {
  if (latest === undefined) return null;
  if (key === 'Cr' && previous !== undefined && (latest - previous >= 0.3 || latest >= previous * 1.5)) return { tone: 'danger', text: 'AKI rise' };
  if (key === 'K' && latest >= 5.5) return { tone: 'danger', text: 'Alert high' };
  if (key === 'K' && latest >= 5.0) return { tone: 'warn', text: 'High' };
  if (key === 'K' && latest < 3.0) return { tone: 'danger', text: 'Alert low' };
  if (key === 'K' && latest < 3.5) return { tone: 'warn', text: 'Low' };
  if (key === 'Na' && latest < 125) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Na' && latest < 130) return { tone: 'warn', text: 'Low' };
  if (key === 'Na' && latest >= 150) return { tone: 'danger', text: 'Severe high' };
  if (key === 'Na' && latest >= 145) return { tone: 'warn', text: 'High' };
  if (key === 'ANC' && latest < 500) return { tone: 'danger', text: 'Severe low' };
  if (key === 'ANC' && latest < 1000) return { tone: 'warn', text: 'Low' };
  if (key === 'ANCpct' && latest < 10) return { tone: 'danger', text: 'Severe low' };
  if (key === 'ANCpct' && latest < 20) return { tone: 'warn', text: 'Low' };
  if (key === 'Hgb' && latest < 7.0) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Hgb' && latest < 8.0) return { tone: 'warn', text: 'Low' };
  if (key === 'Plt' && latest < 50) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Plt' && latest < 100) return { tone: 'warn', text: 'Low' };
  if (key === 'Plt' && previous !== undefined && latest <= previous * 0.5) return { tone: 'warn', text: 'Drop' };
  if (key === 'WBC' && latest >= 20) return { tone: 'danger', text: 'Marked high' };
  if (key === 'WBC' && latest >= 15) return { tone: 'warn', text: 'High' };
  if (key === 'WBC' && latest < 2.0) return { tone: 'danger', text: 'Severe low' };
  if (key === 'WBC' && latest < 4.0) return { tone: 'warn', text: 'Low' };
  if (key === 'INR' && latest >= 2.5) return { tone: 'danger', text: 'High' };
  if (key === 'INR' && latest >= 1.5) return { tone: 'warn', text: 'Elevated' };
  if (key === 'APTT' && latest >= 100) return { tone: 'danger', text: 'Markedly prolonged' };
  if (key === 'APTT' && latest >= 45) return { tone: 'warn', text: 'Prolonged' };
  if (key === 'TBili' && latest >= 5.0) return { tone: 'danger', text: 'High' };
  if (key === 'TBili' && latest >= 2.0) return { tone: 'warn', text: 'Elevated' };
  if (key === 'Alb' && latest < 2.0) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Alb' && latest < 2.5) return { tone: 'warn', text: 'Low' };
  if (key === 'CRP' && latest >= 30) return { tone: 'danger', text: 'Markedly high' };
  if (key === 'CRP' && latest >= 10) return { tone: 'warn', text: 'Elevated' };
  if (key === 'Ferritin' && latest >= 2000) return { tone: 'danger', text: 'Very high' };
  if (key === 'Ferritin' && latest >= 500) return { tone: 'warn', text: 'Elevated' };
  if (key === 'LDH' && latest >= 1000) return { tone: 'danger', text: 'Very high' };
  if (key === 'LDH' && latest >= 600) return { tone: 'warn', text: 'Elevated' };
  if (key === 'CK' && latest >= 10000) return { tone: 'danger', text: 'Markedly high' };
  if (key === 'CK' && latest >= 1000) return { tone: 'warn', text: 'Elevated' };
  if (key === 'UricAcid' && latest >= 10) return { tone: 'danger', text: 'Very high' };
  if (key === 'UricAcid' && latest >= 8) return { tone: 'warn', text: 'Elevated' };
  if (key === 'Fibrinogen' && latest < 100) return { tone: 'danger', text: 'Very low' };
  if (key === 'Fibrinogen' && latest < 150) return { tone: 'warn', text: 'Low' };
  if (key === 'Ca' && latest < 7.5) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Ca' && latest < 8.5) return { tone: 'warn', text: 'Low' };
  if (key === 'Ca' && latest > 12.0) return { tone: 'danger', text: 'High' };
  if (key === 'Ca' && latest > 10.5) return { tone: 'warn', text: 'Elevated' };
  if (key === 'Mg' && latest < 1.2) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Mg' && latest < 1.8) return { tone: 'warn', text: 'Low' };
  if (key === 'Mg' && latest > 3.0) return { tone: 'danger', text: 'High' };
  if (key === 'Mg' && latest > 2.4) return { tone: 'warn', text: 'Elevated' };
  if (key === 'Phos' && latest < 1.0) return { tone: 'danger', text: 'Severe low' };
  if (key === 'Phos' && latest < 1.5) return { tone: 'warn', text: 'Low' };
  if (key === 'Phos' && latest > 6.0) return { tone: 'danger', text: 'High' };
  if (key === 'Phos' && latest > 4.5) return { tone: 'warn', text: 'Elevated' };
  if (key === 'TSH' && latest > 10) return { tone: 'danger', text: 'Very high' };
  if (key === 'TSH' && latest > 6) return { tone: 'warn', text: 'Elevated' };
  if (key === 'TSH' && latest < 0.05) return { tone: 'danger', text: 'Suppressed' };
  if (key === 'TSH' && latest < 0.3) return { tone: 'warn', text: 'Low' };
  if (key === 'FT4' && latest < 0.5) return { tone: 'danger', text: 'Very low' };
  if (key === 'FT4' && latest < 0.7) return { tone: 'warn', text: 'Low' };
  if (key === 'FT4' && latest > 3.0) return { tone: 'danger', text: 'Very high' };
  if (key === 'FT4' && latest > 2.0) return { tone: 'warn', text: 'Elevated' };
  return null;
}

function getTrendArrowSymbol(curr, prev) {
  if (curr === undefined || prev === undefined || prev === 0) return { cls: 'flat', text: '-' };
  const pct = Math.abs(((curr - prev) / prev) * 100);
  if (pct < 3) return { cls: 'flat', text: '->' };
  return curr > prev ? { cls: 'up', text: '↑' } : { cls: 'down', text: '↓' };
}

function getTrendDirectionClass(key, curr, prev) {
  if (curr === undefined || prev === undefined || prev === 0) return 'pc-delta-flat';
  const diff = curr - prev;
  if (Math.abs((diff / prev) * 100) < 3) return 'pc-delta-flat';
  const higherWorse = ['Cr', 'BUN', 'K', 'WBC', 'CRP', 'AST', 'ALT', 'ALP', 'TBili', 'INR', 'APTT', 'Ferritin', 'LDH', 'CK', 'UricAcid', 'Phos', 'TSH'];
  const lowerWorse = ['eGFR', 'Na', 'HCO3', 'ANC', 'ANCpct', 'Hgb', 'Plt', 'Alb', 'Fibrinogen', 'Mg', 'FT4'];
  if (higherWorse.includes(key)) return diff > 0 ? 'pc-delta-bad' : 'pc-delta-good';
  if (lowerWorse.includes(key)) return diff < 0 ? 'pc-delta-bad' : 'pc-delta-good';
  return diff > 0 ? 'pc-delta-bad' : 'pc-delta-good';
}

function buildLabSeries(timeline, key) {
  return timeline
    .map((entry) => ({
      timestamp: entry.timestamp,
      value: entry.labs && entry.labs[key] !== undefined ? entry.labs[key] : undefined,
    }))
    .filter((entry) => entry.value !== undefined);
}

function buildSparklineSvg(series) {
  if (!series || series.length < 2) return '';
  const values = series.map((entry) => entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 320;
  const height = 92;
  const axisLeft = 34;
  const axisRight = 12;
  const axisTop = 10;
  const axisBottom = 16;
  const spread = max - min || 1;
  const plotWidth = width - axisLeft - axisRight;
  const plotHeight = height - axisTop - axisBottom;
  const tickValues = [max, min + (spread / 2), min];
  const formatTick = (value) => {
    if (Math.abs(value) >= 100 || Number.isInteger(value)) return Math.round(value).toString();
    return (Math.round(value * 10) / 10).toString();
  };
  const pointData = values.map((value, index) => {
    const x = axisLeft + (plotWidth * index) / Math.max(values.length - 1, 1);
    const y = height - axisBottom - (((value - min) / spread) * plotHeight);
    return {
      x,
      y,
      label: `${series[index].timestamp}: ${value}`,
    };
  });
  const points = pointData.map((point) => `${point.x},${point.y}`).join(' ');
  return `<svg class="pc-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Trendline" data-plot-left="${axisLeft}" data-plot-right="${width - axisRight}" data-plot-top="${axisTop}" data-plot-bottom="${height - axisBottom}">
    ${tickValues.map((tickValue) => {
      const y = height - axisBottom - (((tickValue - min) / spread) * plotHeight);
      return `<g>
        <line x1="${axisLeft}" y1="${y}" x2="${width - axisRight}" y2="${y}" stroke="rgba(100,116,139,0.12)" stroke-width="1"></line>
        <text x="${axisLeft - 6}" y="${y + 3}" text-anchor="end" fill="var(--text-dim)" font-size="8">${escPatientContextHtml(formatTick(tickValue))}</text>
      </g>`;
    }).join('')}
    <line x1="${axisLeft}" y1="${axisTop}" x2="${axisLeft}" y2="${height - axisBottom}" stroke="rgba(100,116,139,0.22)" stroke-width="1"></line>
    <line x1="${axisLeft}" y1="${height - axisBottom}" x2="${width - axisRight}" y2="${height - axisBottom}" stroke="rgba(100,116,139,0.22)" stroke-width="1"></line>
    <line class="pc-chart-crosshair" x1="${pointData[0].x}" y1="${axisTop}" x2="${pointData[0].x}" y2="${height - axisBottom}" visibility="hidden"></line>
    <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${pointData.map((point, index) => `
      <circle class="pc-chart-point" data-point-index="${index}" data-point-label="${escPatientContextHtml(point.label)}" cx="${point.x}" cy="${point.y}" r="3" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"></circle>
    `).join('')}
    <circle class="pc-chart-active-point" cx="${pointData[0].x}" cy="${pointData[0].y}" r="5" visibility="hidden"></circle>
    <rect class="pc-chart-hover-zone" x="${axisLeft}" y="${axisTop}" width="${plotWidth}" height="${plotHeight}" rx="8" ry="8" fill="transparent" stroke="none" pointer-events="all"></rect>
  </svg>`;
}

function buildTimelineWithEgfr(rawTimeline, demographics) {
  return rawTimeline.map((entry) => {
    const labs = { ...(entry.labs || {}) };
    if (labs.Cr !== undefined) {
      const egfr = estimateEgfrFromLatestCr(labs.Cr, demographics.age, demographics.sex);
      if (egfr !== null) labs.eGFR = egfr;
    }
    if (labs.ANC !== undefined && labs.WBC !== undefined && labs.WBC > 0) {
      labs.ANCpct = Math.round((labs.ANC / labs.WBC) * 100);
    }
    return { ...entry, labs };
  });
}

function buildLatestLabsTable(timeline) {
  if (!timeline.length) return '<div class="pc-empty">No timestamped lab data found in this record.</div>';
  const shown = timeline.slice(-6);
  let html = '<div class="pc-table-wrap"><table class="pc-table"><thead><tr><th>Test</th>';
  shown.forEach((entry) => {
    html += `<th>${escPatientContextHtml(entry.timestamp)}</th>`;
  });
  html += '</tr></thead><tbody>';

  LAB_DISPLAY_ORDER.forEach((key) => {
    if (!shown.some((entry) => entry.labs && entry.labs[key] !== undefined)) return;
    html += `<tr><td>${escPatientContextHtml(key)}</td>`;
    shown.forEach((entry) => {
      const value = entry.labs && entry.labs[key] !== undefined ? entry.labs[key] : '-';
      html += `<td>${escPatientContextHtml(String(value))}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

function parsePatientContextTimestamp(value) {
  const match = String(value || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!match) return null;
  const [, yyyy, mm, dd, hh = '00', min = '00'] = match;
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatPatientContextDate(dt) {
  if (!dt || Number.isNaN(dt.getTime())) return '-';
  const yyyy = String(dt.getFullYear());
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getWeeklySummaryAnchor(summary, timeline, entries) {
  const candidates = [
    timeline && timeline.length ? parsePatientContextTimestamp(timeline[timeline.length - 1].timestamp) : null,
    entries && entries.length ? parsePatientContextTimestamp(entries[0].timestamp) : null,
    parsePatientContextTimestamp(summary && summary.modified),
  ].filter(Boolean).sort((a, b) => b.getTime() - a.getTime());
  return candidates[0] || new Date();
}

function buildWeeklyLabChange(timeline, key, label, digits = 1) {
  const points = (timeline || [])
    .filter((entry) => entry && entry.labs && entry.labs[key] !== undefined)
    .map((entry) => ({ timestamp: entry.timestamp, value: entry.labs[key] }));
  if (!points.length) return null;
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length === 1) return `${label} ${last.value} (${last.timestamp})`;
  const delta = last.value - first.value;
  const roundedDelta = Math.round(delta * (10 ** digits)) / (10 ** digits);
  const direction = roundedDelta > 0 ? '+' : '';
  return `${label} ${first.value} -> ${last.value} (${direction}${roundedDelta})`;
}

function buildWeeklySummaryPayload(data) {
  const content = (data && data.content) || '';
  const summary = getPatientContextSummary(data);
  const demographics = parsePatientAgeSex(content);
  const timeline = buildTimelineWithEgfr(parseLabTimeline(content), demographics);
  const allEntries = parseRecordEntries(content);
  const importantEntries = getImportantEvents(allEntries, 20);
  const anchor = getWeeklySummaryAnchor(summary, timeline, importantEntries);
  const start = new Date(anchor.getTime());
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const end = new Date(anchor.getTime());
  end.setHours(23, 59, 59, 999);

  const inRange = (timestamp) => {
    const dt = parsePatientContextTimestamp(timestamp);
    return !!dt && dt >= start && dt <= end;
  };
  const weekTimeline = timeline.filter((entry) => inRange(entry.timestamp));
  const weekEntries = importantEntries.filter((entry) => inRange(entry.timestamp));
  const latestLabs = weekTimeline.length ? { ...(weekTimeline[weekTimeline.length - 1].labs || {}) } : {};
  const labInsights = interpretLabTimeline(timeline).filter((insight) => insight.tone !== 'success').slice(0, 5);
  const labChanges = [
    buildWeeklyLabChange(weekTimeline, 'Cr', 'Cr'),
    buildWeeklyLabChange(weekTimeline, 'eGFR', 'eGFR'),
    buildWeeklyLabChange(weekTimeline, 'WBC', 'WBC'),
    buildWeeklyLabChange(weekTimeline, 'Hgb', 'Hgb'),
    buildWeeklyLabChange(weekTimeline, 'Plt', 'Plt', 0),
    buildWeeklyLabChange(weekTimeline, 'CRP', 'CRP'),
    buildWeeklyLabChange(weekTimeline, 'K', 'K'),
    buildWeeklyLabChange(weekTimeline, 'Na', 'Na', 0),
  ].filter(Boolean);

  const medications = normalizeStructuredMedications(data && data.medications);
  const medicationDiff = buildStructuredMedicationDiff(medications);
  const antibioticDays = buildAntibioticDayCounters(medications);
  const problems = normalizeStructuredProblems(data && data.problems);
  const activeProblems = problems.filter((item) => !item.status || item.status === 'active').slice(0, 5);
  const renalMedicationAlerts = buildRenalMedicationAlerts(medications, latestLabs, latestLabs.eGFR !== undefined ? latestLabs.eGFR : null);
  const safetyMedicationAlerts = typeof evaluatePatientSafetyRules === 'function'
    ? evaluatePatientSafetyRules({
      labs: latestLabs,
      previousLabs: weekTimeline.length > 1 ? { ...(weekTimeline[weekTimeline.length - 2].labs || {}) } : {},
      medications,
      timeline,
      recentEntries: importantEntries,
    })
    : [];

  return {
    rangeStart: formatPatientContextDate(start),
    rangeEnd: formatPatientContextDate(end),
    anchor: formatPatientContextDate(anchor),
    patient: summary,
    eventCount: weekEntries.length,
    labSetCount: weekTimeline.length,
    keyEvents: weekEntries.slice(0, 6),
    labChanges,
    currentAlerts: labInsights,
    medicationDiff,
    antibioticDays,
    renalMedicationAlerts,
    safetyMedicationAlerts,
    activeProblems,
  };
}

function buildPatientContextPayload(data) {
  const summary = getPatientContextSummary(data);
  const demographics = parsePatientAgeSex((data && data.content) || '');
  const timeline = buildTimelineWithEgfr(parseLabTimeline((data && data.content) || ''), demographics);
  const latestLabs = timeline.length ? { ...(timeline[timeline.length - 1].labs || {}) } : {};
  const previousLabs = timeline.length > 1 ? { ...(timeline[timeline.length - 2].labs || {}) } : {};
  const recentEntries = getImportantEvents(parseRecordEntries((data && data.content) || ''), 8);
  const medications = normalizeStructuredMedications(data && data.medications);
  const problems = normalizeStructuredProblems(data && data.problems);
  const medicationDiff = buildStructuredMedicationDiff(medications);
  const antibioticDays = buildAntibioticDayCounters(medications);
  const labInsights = interpretLabTimeline(timeline);
  const renalMedicationAlerts = buildRenalMedicationAlerts(medications, latestLabs, latestLabs.eGFR !== undefined ? latestLabs.eGFR : null);
  const safetyMedicationAlerts = typeof evaluatePatientSafetyRules === 'function'
    ? evaluatePatientSafetyRules({
      labs: latestLabs,
      previousLabs,
      medications,
      timeline,
      recentEntries,
    })
    : [];
  const insights = [...labInsights, ...renalMedicationAlerts, ...safetyMedicationAlerts]
    .sort((left, right) => getInsightToneScore(right.tone) - getInsightToneScore(left.tone));
  const lastUpdated = summary.modified || '';
  const weeklySummary = buildWeeklySummaryPayload(data || {});
  return {
    ...summary,
    age: demographics.age,
    sex: demographics.sex,
    timeline,
    latestLabs,
    previousLabs,
    egfr: latestLabs.eGFR !== undefined ? latestLabs.eGFR : null,
    insights,
    labInsights,
    renalMedicationAlerts,
    safetyMedicationAlerts,
    patientSafetyRules: safetyMedicationAlerts,
    medications,
    medicationDiff,
    antibioticDays,
    problems,
    recentEntries,
    lastUpdated,
    lastUpdatedLabel: formatPatientUpdatedTime(lastUpdated) || '-',
    lastUpdatedStatus: getContextStaleness(lastUpdated),
    lastLabTimestamp: timeline.length ? timeline[timeline.length - 1].timestamp : '',
    timelineCount: timeline.length,
    weeklySummary,
  };
}

// ---------------------------------------------------------------------------
// Alert muting — per-instance (pid||title) and per-type (*||title)
// Modes: 'today' (expires midnight), 'next_labs' (expires on new labs),
//        'always' (permanent until manually unmuted)
// ---------------------------------------------------------------------------

function _getMuteMap() {
  try {
    const stored = localStorage.getItem(ALERT_MUTE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) { return {}; }
}

function _saveMuteMap(map) {
  try { localStorage.setItem(ALERT_MUTE_STORAGE_KEY, JSON.stringify(map)); } catch (e) { /* noop */ }
}

function _muteUntilEndOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function isAlertMuted(patientId, title, latestLabTimestamp) {
  const map = _getMuteMap();
  const now = new Date().toISOString();
  for (const key of [`${patientId}||${title}`, `*||${title}`]) {
    const entry = map[key];
    if (!entry) continue;
    if (entry.mode === 'always') return true;
    if (entry.mode === 'today' && entry.until && now <= entry.until) return true;
    if (entry.mode === 'next_labs' && entry.labTimestamp && latestLabTimestamp && latestLabTimestamp <= entry.labTimestamp) return true;
  }
  return false;
}

function muteAlert(patientId, title, mode, latestLabTimestamp) {
  const map = _getMuteMap();
  map[`${patientId}||${title}`] = {
    mode,
    until: mode === 'today' ? _muteUntilEndOfDay() : null,
    labTimestamp: mode === 'next_labs' ? (latestLabTimestamp || '') : null,
    mutedAt: new Date().toISOString(),
  };
  _saveMuteMap(map);
}

function muteAlertType(title, mode, latestLabTimestamp) {
  muteAlert('*', title, mode, latestLabTimestamp);
}

function unmuteAlert(patientId, title) {
  const map = _getMuteMap();
  delete map[`${patientId}||${title}`];
  _saveMuteMap(map);
}

function unmuteAlertType(title) {
  unmuteAlert('*', title);
}
