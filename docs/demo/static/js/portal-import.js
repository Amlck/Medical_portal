// ---------------------------------------------------------------------------
// Import & Parse — paste raw EMR text, extract vitals/labs/meds, append to record
// ---------------------------------------------------------------------------

// --------------- Vital definitions -------------------------------------------

const IMPORT_VITALS_META = [
  { key: 'HR',     label: 'Heart Rate',   unit: 'bpm',  min: 30,  max: 250 },
  { key: 'SBP',    label: 'Systolic BP',  unit: 'mmHg', min: 50,  max: 260 },
  { key: 'DBP',    label: 'Diastolic BP', unit: 'mmHg', min: 20,  max: 180 },
  { key: 'SpO2',   label: 'SpO₂',         unit: '%',    min: 50,  max: 100 },
  { key: 'Temp',   label: 'Temperature',  unit: '°C',   min: 32,  max: 43  },
  { key: 'RR',     label: 'Resp. Rate',   unit: '/min', min: 4,   max: 60  },
  { key: 'GCS',    label: 'GCS',          unit: '/15',  min: 3,   max: 15  },
  { key: 'Weight', label: 'Weight',       unit: 'kg',   min: 1,   max: 300 },
  { key: 'Height', label: 'Height',       unit: 'cm',   min: 30,  max: 250 },
];

// --------------- State -------------------------------------------------------

let _importPatientListLoaded = false;
let _importLastParsed = { vitals: [], labs: [], meds: [] };
let _importPendingLabApproval = null;

// --------------- Helpers -----------------------------------------------------

function _escImport(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _importNum(s) {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/,/g, '.'));
  return isNaN(n) ? null : n;
}

function _importNormalizeTimestamp(value) {
  const match = String(value || '').match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const [, yyyy, mm, dd, hh, min] = match;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')} ${hh.padStart(2, '0')}:${min}`;
}

function _importNormalizeLabValue(value) {
  const match = String(value == null ? '' : value).replace(/,/g, '').match(/^[<>]?\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return '';
  const num = Number(match[1]);
  return Number.isFinite(num) ? String(num) : match[1];
}

function _importFlagged(key, value) {
  const meta = IMPORT_VITALS_META.find(m => m.key === key);
  if (!meta) return false;
  const n = _importNum(value);
  if (n === null) return false;
  return n < meta.min || n > meta.max;
}

// --------------- Vitals parser -----------------------------------------------

function parseVitalsFromText(text) {
  const found = {};

  // 1. NTUH compact format: T/P/R/BP 36.5/82/18/120/80  (5 values)
  //    Also: T/P/R/BP: 36.5/82/18/120-80 or 120/80
  const compactRe = /T\s*[\/]\s*P\s*[\/]\s*R\s*[\/]\s*BP\s*:?\s*([\d.]+)\s*[\/]\s*([\d.]+)\s*[\/]\s*([\d.]+)\s*[\/]\s*([\d.]+)\s*[\/\-]\s*([\d.]+)/i;
  const compactM = text.match(compactRe);
  if (compactM) {
    found['Temp'] = compactM[1];
    found['HR']   = compactM[2];
    found['RR']   = compactM[3];
    found['SBP']  = compactM[4];
    found['DBP']  = compactM[5];
  }

  // 2. Compact VS line: "VS: HR 82 BP 120/80 SpO2 98% T 37.2 RR 18"
  //    Or "VS HR 82 BP 120/80 ..."
  const vsLineRe = /(?:^|\n)\s*V[Ss]\.?:?\s*(.+)/;
  const vsLineM = text.match(vsLineRe);
  if (vsLineM) {
    _parseVSLine(vsLineM[1], found);
  }

  // 3. Individual key:value or key value patterns (scan whole text)
  _scanKeyValueVitals(text, found);

  // 4. BP-specific: "BP 120/80" or "blood pressure 120/80"
  if (!found['SBP'] || !found['DBP']) {
    const bpRe = /(?:BP|[Bb]lood\s+[Pp]ressure|血壓|血压)\s*:?\s*([\d.]+)\s*[\/\-]\s*([\d.]+)/;
    const bpM = text.match(bpRe);
    if (bpM) {
      found['SBP'] = bpM[1];
      found['DBP'] = bpM[2];
    }
  }

  // Build result array preserving META order
  const result = [];
  for (const meta of IMPORT_VITALS_META) {
    if (found[meta.key] !== undefined) {
      const val = found[meta.key];
      result.push({
        key:     meta.key,
        label:   meta.label,
        unit:    meta.unit,
        value:   val,
        flagged: _importFlagged(meta.key, val),
      });
    }
  }
  return result;
}

function _parseVSLine(line, found) {
  // HR 82 BP 120/80 SpO2 98% T 36.5 Temp 36.5 RR 18 GCS 15
  const patterns = [
    { re: /\bHR\s+([\d.]+)/i,                 key: 'HR' },
    { re: /\bP\s+([\d.]+)\s*(?:bpm)?(?=\s|$)/i, key: 'HR' },  // P for Pulse
    { re: /\bBP\s+([\d.]+)\s*[\/\-]\s*([\d.]+)/i, keys: ['SBP','DBP'] },
    { re: /\bSpO2?\s*([\d.]+)/i,              key: 'SpO2' },
    { re: /\bSaO2?\s*([\d.]+)/i,              key: 'SpO2' },
    { re: /\bO2\s*sat\s*([\d.]+)/i,           key: 'SpO2' },
    { re: /\b(?:Temp?|T)\s+([\d.]+)/i,        key: 'Temp' },
    { re: /\bRR\s+([\d.]+)/i,                 key: 'RR' },
    { re: /\bGCS\s+([\d.]+)/i,                key: 'GCS' },
    { re: /\bWt\.?\s+([\d.]+)/i,              key: 'Weight' },
    { re: /\bHt\.?\s+([\d.]+)/i,              key: 'Height' },
  ];
  for (const p of patterns) {
    if (p.keys) {
      const m = line.match(p.re);
      if (m && !found[p.keys[0]]) { found[p.keys[0]] = m[1]; found[p.keys[1]] = m[2]; }
    } else {
      const m = line.match(p.re);
      if (m && !found[p.key]) found[p.key] = m[1];
    }
  }
}

function _scanKeyValueVitals(text, found) {
  // Patterns: "Heart Rate: 82" or "HR: 82" or "心率: 82" etc.
  const patterns = [
    { re: /(?:Heart\s*Rate|HR|心率|脈搏)\s*:?\s*([\d.]+)\s*(?:bpm)?/i, key: 'HR' },
    { re: /(?:Systolic|SBP)\s*:?\s*([\d.]+)/i,                        key: 'SBP' },
    { re: /(?:Diastolic|DBP)\s*:?\s*([\d.]+)/i,                       key: 'DBP' },
    { re: /(?:SpO2|O2\s*Sat|SaO2|Spo2)\s*:?\s*([\d.]+)\s*%?/i,       key: 'SpO2' },
    { re: /(?:Temp(?:erature)?|T)\s*:\s*([\d.]+)\s*(?:°?[Cc])?/i,    key: 'Temp' },
    { re: /(?:Resp(?:iratory)?\s*Rate|RR)\s*:?\s*([\d.]+)/i,          key: 'RR' },
    { re: /(?:GCS|Glasgow)\s*:?\s*([\d.]+)/i,                         key: 'GCS' },
    { re: /(?:Weight|Wt\.?|體重)\s*:?\s*([\d.]+)\s*(?:kg)?/i,        key: 'Weight' },
    { re: /(?:Height|Ht\.?|身高)\s*:?\s*([\d.]+)\s*(?:cm)?/i,        key: 'Height' },
    // Chinese labels
    { re: /體溫\s*:?\s*([\d.]+)/,                                      key: 'Temp' },
    { re: /血氧\s*:?\s*([\d.]+)/,                                      key: 'SpO2' },
    { re: /呼吸\s*:?\s*([\d.]+)/,                                      key: 'RR' },
  ];
  for (const p of patterns) {
    if (!found[p.key]) {
      const m = text.match(p.re);
      if (m) found[p.key] = m[1];
    }
  }
}

// --------------- Labs parser -------------------------------------------------

// Known units for common lab names (used to validate/promote fuzzy matches)
const IMPORT_LAB_UNITS = {
  Na:   'mEq/L', K:    'mEq/L', Cl:   'mEq/L', CO2:  'mEq/L', HCO3: 'mEq/L',
  BUN:  'mg/dL', Cr:   'mg/dL', Glucose: 'mg/dL', Glu: 'mg/dL',
  Ca:   'mg/dL', Mg:   'mg/dL', Phos: 'mg/dL', Uric: 'mg/dL',
  ALT:  'U/L',   AST:  'U/L',   ALP:  'U/L',   GGT:  'U/L',
  Bili: 'mg/dL', TBili:'mg/dL', DBili:'mg/dL',
  TP:   'g/dL',  Alb:  'g/dL',  Albumin: 'g/dL',
  WBC:  'K/µL',  Hgb:  'g/dL',  Hct:  '%',      Plt:  'K/µL',
  MCV:  'fL',    MCH:  'pg',     MCHC: 'g/dL',   RDW:  '%',
  PT:   'sec',   INR:  '',       PTT:  'sec',     aPTT: 'sec',
  TSH:  'µIU/mL',T4:   'ng/dL', T3:   'pg/mL',
  CRP:  'mg/L',  ESR:  'mm/hr', Ferritin: 'ng/mL',
  Lactate: 'mmol/L', Lactic: 'mmol/L',
  pH:   '',      pCO2: 'mmHg',  pO2:  'mmHg',
  HbA1c:'%',     eGFR: 'mL/min/1.73m²',
  Trop:  'ng/L',  Troponin: 'ng/L', TnI: 'ng/L', TnT: 'ng/L',
  BNP:  'pg/mL', proBNP: 'pg/mL', NTproBNP: 'pg/mL',
  Lipase:'U/L',  Amylase:'U/L',
  Vanc: 'µg/mL', Vanco: 'µg/mL',
};

function _normalizeNtuhLabText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mu;/gi, 'μ')
    .replace(/&micro;/gi, 'µ')
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, '\t')
    .replace(/<\/tr\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .replace(/\t[ \t]+/g, '\t');
}

function _parseNtuhReportMeta(line) {
  const text = String(line || '').trim();
  if (!/採檢|最後報告|登入/.test(text)) return null;
  const collected = text.match(/採檢\s*:\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\s+\d{1,2}:\d{2})/);
  const logged = text.match(/登入\s*:\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\s+\d{1,2}:\d{2})/);
  const reported = text.match(/最後報告\s*:\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\s+\d{1,2}:\d{2})/);
  const specimen = text.match(/\b(BLOOD|SERUM|PLASMA|URINE|CSF|STOOL|SPUTUM|BODY\s*FLUID|SWAB)\b/i);
  return {
    collectedAt: collected ? _importNormalizeTimestamp(collected[1]) : '',
    loggedAt: logged ? _importNormalizeTimestamp(logged[1]) : '',
    reportedAt: reported ? _importNormalizeTimestamp(reported[1]) : '',
    specimen: specimen ? specimen[1].replace(/\s+/g, ' ').toUpperCase() : '',
  };
}

function _importLabRangeStatus(value, reference) {
  const numeric = _importNum(_importNormalizeLabValue(value));
  if (numeric === null) return 'unknown';
  const range = String(reference || '').match(/(-?\d+(?:\.\d+)?)\s*[~\-]\s*(-?\d+(?:\.\d+)?)/);
  if (!range) return 'no-reference';
  const low = _importNum(range[1]);
  const high = _importNum(range[2]);
  if (low !== null && numeric < low) return 'low';
  if (high !== null && numeric > high) return 'high';
  return 'normal';
}

function _importLabReferenceFlag(value, reference) {
  const status = _importLabRangeStatus(value, reference);
  if (status === 'low') return 'L';
  if (status === 'high') return 'H';
  return '';
}

function _importLabRangeLabel(status) {
  if (status === 'low') return 'Low';
  if (status === 'high') return 'High';
  if (status === 'normal') return 'In range';
  if (status === 'no-reference') return 'No ref';
  return '';
}

function canonicalImportLabKey(name) {
  const value = String(name || '').trim();
  if (/creatinine|^cre$|^cr$/i.test(value)) return 'Cr';
  if (/^na$|sodium/i.test(value)) return 'Na';
  if (/^k$|potassium/i.test(value)) return 'K';
  if (/^cl$|chloride/i.test(value)) return 'Cl';
  if (/hco3|^co2$|^tco2$/i.test(value)) return 'HCO3';
  if (/^bun|urea.*n/i.test(value)) return 'BUN';
  if (/albumin|^alb$/i.test(value)) return 'Alb';
  if (/bilirubin|t-bil|t\.bil/i.test(value)) return 'TBili';
  if (/^inr$/i.test(value)) return 'INR';
  if (/calcium|^ca$/i.test(value)) return 'Ca';
  if (/glucose|^glu$/i.test(value)) return 'Glu';
  if (/platelet|^plt$/i.test(value)) return 'Plt';
  if (/hemoglobin|^hb$|^hgb$/i.test(value)) return 'Hgb';
  if (/^hct$|hematocrit/i.test(value)) return 'Hct';
  if (/wbc|white.*blood|leukocyte/i.test(value)) return 'WBC';
  if (/anc|absolute neutrophil/i.test(value)) return 'ANC';
  if (/crp|c-reactive/i.test(value)) return 'CRP';
  if (/procalcitonin/i.test(value)) return 'PCT';
  if (/^ast$|got/i.test(value)) return 'AST';
  if (/^alt$|gpt/i.test(value)) return 'ALT';
  if (/alp|alkaline phosphatase/i.test(value)) return 'ALP';
  if (/^aptt$|activated partial thromboplastin/i.test(value)) return 'APTT';
  if (/ferritin/i.test(value)) return 'Ferritin';
  if (/^ldh$|lactate dehydrogenase/i.test(value)) return 'LDH';
  if (/^ck$|^cpk$|creatine kinase|creatine phosphokinase/i.test(value)) return 'CK';
  if (/uric acid|urate/i.test(value)) return 'UricAcid';
  if (/fibrinogen/i.test(value)) return 'Fibrinogen';
  if (/^mg$|magnesium/i.test(value)) return 'Mg';
  if (/^phos$|phosphate|phosphorus/i.test(value)) return 'Phos';
  if (/^tsh$|thyroid.stimulat/i.test(value)) return 'TSH';
  if (/^ft4$|^free\s*t4$|free.*thyroxine/i.test(value)) return 'FT4';
  return value.toLowerCase().replace(/\s+/g, ' ');
}

function _importLabFingerprint(lab) {
  const timestamp = _importNormalizeTimestamp(lab && (lab.timestamp || lab.collectedAt));
  const key = canonicalImportLabKey(lab && lab.name);
  const value = _importNormalizeLabValue(lab && lab.value);
  if (!timestamp || !key || !value) return '';
  return `${timestamp}|${key}|${value}`;
}

function _importLabIdentity(lab) {
  const timestamp = _importNormalizeTimestamp(lab && (lab.timestamp || lab.collectedAt));
  const key = canonicalImportLabKey(lab && lab.name);
  if (!timestamp || !key) return '';
  return `${timestamp}|${key}`;
}

function parseNtuhLabsFromText(text) {
  const normalized = _normalizeNtuhLabText(text);
  const lines = normalized.split('\n');
  const labs = [];
  const seen = new Set();
  let currentMeta = {};
  let header = null;
  let inLabTable = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const meta = _parseNtuhReportMeta(line);
    if (meta) {
      currentMeta = { ...currentMeta, ...meta };
      inLabTable = false;
      header = null;
      continue;
    }

    if (/檢驗項目/.test(line) && /檢驗值/.test(line)) {
      const cells = line.split('\t').map(cell => cell.trim());
      header = {
        item: Math.max(cells.findIndex(cell => /檢驗項目/.test(cell)), 0),
        value: Math.max(cells.findIndex(cell => /檢驗值/.test(cell)), 1),
        unit: cells.findIndex(cell => /單位/.test(cell)),
        reference: cells.findIndex(cell => /參考值/.test(cell)),
        note: cells.findIndex(cell => /說明/.test(cell)),
      };
      inLabTable = true;
      continue;
    }

    if (!inLabTable || !header) continue;
    if (/^科室\s*:/.test(line) || /採檢\s*:/.test(line)) {
      const nextMeta = _parseNtuhReportMeta(line);
      if (nextMeta) currentMeta = { ...currentMeta, ...nextMeta };
      inLabTable = false;
      header = null;
      continue;
    }

    const cells = line.split('\t').map(cell => cell.trim());
    if (cells.length <= header.value) continue;
    const name = cells[header.item] || '';
    const value = cells[header.value] || '';
    if (!name || /^檢驗項目$/.test(name)) continue;
    if (!_importNormalizeLabValue(value)) continue;

    const unit = header.unit >= 0 ? (cells[header.unit] || '') : '';
    const reference = header.reference >= 0 ? (cells[header.reference] || '') : '';
    const note = header.note >= 0 ? (cells[header.note] || '') : '';
    const timestamp = currentMeta.collectedAt || currentMeta.reportedAt || '';
    const key = `${timestamp}|${name.toLowerCase()}|${_importNormalizeLabValue(value)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    labs.push({
      name,
      value,
      unit,
      reference,
      note,
      timestamp,
      collectedAt: currentMeta.collectedAt || '',
      reportedAt: currentMeta.reportedAt || '',
      specimen: currentMeta.specimen || '',
      flag: _importLabReferenceFlag(value, reference),
      rangeStatus: _importLabRangeStatus(value, reference),
      raw: line,
      source: 'NTUH',
    });
  }

  return labs;
}

function parseLabsFromText(text) {
  const ntuhLabs = parseNtuhLabsFromText(text);
  if (ntuhLabs.length) return ntuhLabs;

  const labs = [];
  const seen = new Set();

  function addLab(name, value, unit, raw) {
    const cleanName = name.trim();
    const key = cleanName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    // Use known unit if none parsed
    if (!unit) {
      for (const [k, u] of Object.entries(IMPORT_LAB_UNITS)) {
        if (k.toLowerCase() === key) { unit = u; break; }
      }
    }
    labs.push({ name: cleanName, value: value.trim(), unit: (unit || '').trim(), raw: raw || `${cleanName} ${value}` });
  }

  // 1. Pipe table rows: | Name | Value | Unit? | (any extra columns ignored)
  //    | Na  | 136 | mEq/L |  or  |Na|136|  or  | Na  | 136 mEq/L |
  const tableRowRe = /\|\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9\s\-\/\(\)]*?)\s*\|\s*([\d.]+(?:\s*(?:[<>≤≥]|H|L|HH|LL|↑|↓))?)\s*\|(?:\s*([A-Za-zÀ-ÿ\/µ%°^0-9.\-]+)\s*\|)?/g;
  let m;
  while ((m = tableRowRe.exec(text)) !== null) {
    const name = m[1].trim();
    if (/^[-=]+$/.test(name) || name.length < 1) continue; // skip separator rows
    addLab(name, m[2], m[3] || '', m[0]);
  }

  // 2. Inline "Name Value Unit" on own line (e.g. "Na 136 mEq/L" or "Na: 136")
  //    Must have a number as second token
  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('|')) continue; // skip table rows (already handled)
    // Pattern: LabName[: ] Number [Unit] [flag]
    const inlineRe = /^([A-Za-z][A-Za-z0-9\-\/\(\)]{0,20})\s*:?\s*([\d.]+)\s*([A-Za-z\/µ%°^0-9.\-]{1,15})?(?:\s*(?:[<>≤≥HL↑↓]|HH|LL))?$/;
    const inlineM = trimmed.match(inlineRe);
    if (inlineM) {
      const name  = inlineM[1].trim();
      const value = inlineM[2];
      const unit  = inlineM[3] || '';
      // Skip if looks like vitals, medication doses, or dates
      if (/^(?:HR|BP|RR|VS|IV|PO|QD|BID|TID|QID|PRN|q\d|mg|tab|cap)$/i.test(name)) continue;
      if (/^\d{1,2}[\/\-]\d{1,2}$/.test(value)) continue; // skip BP-style
      addLab(name, value, unit, trimmed);
    }
  }

  return labs;
}

// --------------- Medications parser ------------------------------------------

// Dose unit patterns that indicate a medication line
const MED_UNITS = /\b(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|mEq|mmol|IU|units?|ml|mL|mEq)\b/i;
const MED_ROUTES = /\b(PO|IV|IM|SC|SQ|SL|PR|TOP|INH|NGT|NJ|oral|intravenous|subcutaneous|intramuscular)\b/i;
const MED_FREQS  = /\b(QD|QID|BID|TID|Q\d{1,2}[Hh]|q\d{1,2}h|Q\d{1,2}hr|PRN|STAT|AC|PC|HS|QHS|weekly|daily|once|twice|three\s+times|four\s+times|continuous|cont\.?)\b/i;

function parseMedicationsFromText(text) {
  const meds = [];
  const seen = new Set();

  const lines = text.split(/\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Must contain a dose unit to qualify as a medication line
    const doseM = line.match(MED_UNITS);
    if (!doseM) continue;

    // Build parsed object
    const med = { name: '', dose: '', unit: '', route: '', freq: '', raw: line };

    // Extract dose + unit
    med.dose = doseM[1];
    med.unit = doseM[2];

    // Extract route
    const routeM = line.match(MED_ROUTES);
    if (routeM) med.route = routeM[1].toUpperCase();

    // Extract frequency
    const freqM = line.match(MED_FREQS);
    if (freqM) med.freq = freqM[1].toUpperCase();

    // Name = everything before the first dose number
    const beforeDose = line.substring(0, line.indexOf(doseM[0])).trim();
    // Strip leading bullet/dash/number
    med.name = beforeDose.replace(/^[\s\-•*\d.]+/, '').trim();
    if (!med.name) continue; // no name extracted
    if (med.name.length > 60) med.name = med.name.substring(0, 60); // cap length

    const key = med.name.toLowerCase() + med.dose + med.unit;
    if (seen.has(key)) continue;
    seen.add(key);

    meds.push(med);
  }
  return meds;
}

// --------------- Format block for append ------------------------------------

function formatImportBlock(vitals, labs, meds) {
  const parts = [];

  if (vitals.length) {
    const vParts = vitals.map(v => {
      const inputEl = document.getElementById(`import-v-${v.key}`);
      const val = inputEl ? inputEl.value.trim() : v.value;
      if (!val) return null;
      return `${v.label} ${val} ${v.unit}`;
    }).filter(Boolean);
    if (vParts.length) parts.push('**Vital Signs**\n' + vParts.join(' | '));
  }

  if (labs.length) {
    const groups = new Map();
    labs.forEach((lab, i) => {
      const inputIndex = lab.inputIndex == null ? i : lab.inputIndex;
      const valEl = document.getElementById(`import-l-val-${inputIndex}`);
      const unitEl = document.getElementById(`import-l-unit-${inputIndex}`);
      const nameEl = document.getElementById(`import-l-name-${inputIndex}`);
      const refEl = document.getElementById(`import-l-ref-${inputIndex}`);
      const name = nameEl ? nameEl.value.trim() : lab.name;
      const val  = valEl  ? valEl.value.trim()  : lab.value;
      const unit = unitEl ? unitEl.value.trim()  : lab.unit;
      const reference = refEl ? refEl.value.trim() : (lab.reference || '');
      if (!name || !val) return;
      const timestamp = _importNormalizeTimestamp(lab.timestamp || lab.collectedAt);
      const groupKey = timestamp || '';
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push({ name, val, unit, reference });
    });
    const lBlocks = [];
    groups.forEach((items, timestamp) => {
      if (!items.length) return;
      if (timestamp) lBlocks.push(`Labs (${timestamp}):`);
      else lBlocks.push('**Labs**');
      lBlocks.push('| Test | Value | Unit | Reference |');
      lBlocks.push('| --- | ---: | --- | --- |');
      items.forEach((item) => {
        lBlocks.push(`| ${item.name} | ${item.val} | ${item.unit || ''} | ${item.reference || ''} |`);
      });
    });
    if (lBlocks.length) parts.push(lBlocks.join('\n'));
  }

  if (meds.length) {
    const mLines = meds.map((med, i) => {
      const nameEl  = document.getElementById(`import-m-name-${i}`);
      const doseEl  = document.getElementById(`import-m-dose-${i}`);
      const routeEl = document.getElementById(`import-m-route-${i}`);
      const freqEl  = document.getElementById(`import-m-freq-${i}`);
      const name  = nameEl  ? nameEl.value.trim()  : med.name;
      const dose  = doseEl  ? doseEl.value.trim()  : (med.dose + med.unit);
      const route = routeEl ? routeEl.value.trim()  : med.route;
      const freq  = freqEl  ? freqEl.value.trim()  : med.freq;
      if (!name) return null;
      return `- ${name} ${dose}${route ? ' ' + route : ''}${freq ? ' ' + freq : ''}`.trim();
    }).filter(Boolean);
    if (mLines.length) parts.push('**Medications**\n' + mLines.join('\n'));
  }

  return parts.join('\n\n');
}

// --------------- Tab switching -----------------------------------------------

function switchImportTab(tab) {
  document.querySelectorAll('.import-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.import-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `import-tab-panel-${tab}`);
  });
}

// --------------- Render helpers ----------------------------------------------

function _importBadge(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = count > 0 ? String(count) : '';
}

function renderVitalsTable(vitals) {
  const el = document.getElementById('import-vitals-content');
  if (!el) return;
  if (!vitals.length) {
    el.innerHTML = '<div class="import-empty">No vital signs recognised.</div>';
    _importBadge('import-tab-count-vitals', 0);
    return;
  }
  _importBadge('import-tab-count-vitals', vitals.length);
  let html = '<table class="import-table"><thead><tr><th>Vital</th><th>Value</th><th>Unit</th></tr></thead><tbody>';
  for (const v of vitals) {
    const flagClass = v.flagged ? ' import-flag' : '';
    html += `<tr class="${flagClass}">
      <td>${_escImport(v.label)}</td>
      <td><input type="text" class="import-value-input${flagClass}" id="import-v-${_escImport(v.key)}" value="${_escImport(v.value)}" data-key="${_escImport(v.key)}"></td>
      <td>${_escImport(v.unit)}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  if (vitals.some(v => v.flagged)) {
    html += '<div class="import-flag-note">⚠ Flagged values are outside expected range — please verify.</div>';
  }
  el.innerHTML = html;
}

function renderLabsTable(labs) {
  const el = document.getElementById('import-labs-content');
  if (!el) return;
  if (!labs.length) {
    el.innerHTML = '<div class="import-empty">No lab values recognised.</div>';
    _importBadge('import-tab-count-labs', 0);
    return;
  }
  _importBadge('import-tab-count-labs', labs.length);
  const hasTimestamp = labs.some(lab => lab.timestamp || lab.collectedAt);
  const hasReference = labs.some(lab => lab.reference);
  const hasRangeStatus = labs.some(lab => lab.rangeStatus);
  let html = '<table class="import-table"><thead><tr>';
  if (hasTimestamp) html += '<th>Time</th>';
  html += '<th>Test</th><th>Value</th><th>Unit</th>';
  if (hasReference) html += '<th>Ref</th>';
  if (hasRangeStatus) html += '<th>Range</th>';
  html += '</tr></thead><tbody>';
  labs.forEach((lab, i) => {
    const status = lab.rangeStatus || (lab.flag === 'L' ? 'low' : lab.flag === 'H' ? 'high' : '');
    const rowClass = status ? ` import-range-${_escImport(status)}` : '';
    const valueClass = (status === 'low' || status === 'high') ? ` import-range-${_escImport(status)}` : '';
    html += `<tr class="${rowClass}">
      ${hasTimestamp ? `<td>${_escImport(lab.timestamp || lab.collectedAt || '')}</td>` : ''}
      <td><input type="text" class="import-value-input" id="import-l-name-${i}" value="${_escImport(lab.name)}"></td>
      <td><input type="text" class="import-value-input${valueClass}" id="import-l-val-${i}"  value="${_escImport(lab.value)}"></td>
      <td><input type="text" class="import-value-input import-unit-input" id="import-l-unit-${i}" value="${_escImport(lab.unit)}"></td>
      ${hasReference ? `<td><input type="text" class="import-value-input import-unit-input" id="import-l-ref-${i}" value="${_escImport(lab.reference || '')}"></td>` : ''}
      ${hasRangeStatus ? `<td><span class="import-range-pill import-range-${_escImport(status || 'unknown')}">${_escImport(_importLabRangeLabel(status))}</span></td>` : ''}
    </tr>`;
  });
  html += '</tbody></table>';
  if (labs.some(lab => lab.source === 'NTUH')) {
    html += '<div class="import-flag-note">NTUH lab paste detected. Duplicate charted values are skipped during append.</div>';
  }
  el.innerHTML = html;
}

function renderMedsList(meds) {
  const el = document.getElementById('import-meds-content');
  if (!el) return;
  if (!meds.length) {
    el.innerHTML = '<div class="import-empty">No medications recognised.<br><span style="font-size:0.6rem;color:var(--text-dim)">Tip: lines need a dose unit (mg, mcg, g, IU, mL) to be recognised.</span></div>';
    _importBadge('import-tab-count-meds', 0);
    return;
  }
  _importBadge('import-tab-count-meds', meds.length);
  let html = '<div class="import-meds-list">';
  meds.forEach((med, i) => {
    html += `<div class="import-med-row">
      <input type="text" class="import-value-input import-med-name"  id="import-m-name-${i}"  value="${_escImport(med.name)}"  placeholder="Drug name">
      <input type="text" class="import-value-input import-med-dose"  id="import-m-dose-${i}"  value="${_escImport(med.dose + med.unit)}" placeholder="Dose">
      <input type="text" class="import-value-input import-med-route" id="import-m-route-${i}" value="${_escImport(med.route)}" placeholder="Route">
      <input type="text" class="import-value-input import-med-freq"  id="import-m-freq-${i}"  value="${_escImport(med.freq)}"  placeholder="Freq">
    </div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

// --------------- Main parse entry --------------------------------------------

function parseImportText(text) {
  const vitals = parseVitalsFromText(text);
  const labs = parseLabsFromText(text);
  const meds = labs.some(lab => lab.source === 'NTUH') ? [] : parseMedicationsFromText(text);
  return { vitals, labs, meds };
}

function runImportParse() {
  const textarea = document.getElementById('import-raw-input');
  if (!textarea) return;
  const text = textarea.value;
  if (!text.trim()) {
    _importSetStatus('Paste some text first.', false);
    return;
  }

  _clearImportDuplicateReview();
  const { vitals, labs, meds } = parseImportText(text);

  _importLastParsed = { vitals, labs, meds };

  renderVitalsTable(vitals);
  renderLabsTable(labs);
  renderMedsList(meds);

  // Switch to whichever tab has data (priority: vitals > labs > meds)
  if (vitals.length)      switchImportTab('vitals');
  else if (labs.length)   switchImportTab('labs');
  else if (meds.length)   switchImportTab('meds');

  const total = vitals.length + labs.length + meds.length;
  const ntuhDetected = /檢驗項目|採檢\s*:|LabDetailedSheetControl|時間範圍內查無檢驗報告|檢驗清單/.test(text);
  _importSetStatus(
    total ? `Parsed ${vitals.length} vital${vitals.length !== 1 ? 's' : ''}, ${labs.length} lab${labs.length !== 1 ? 's' : ''}, ${meds.length} med${meds.length !== 1 ? 's' : ''}.` : (ntuhDetected ? 'NTUH lab page detected, but no result rows were found in this paste.' : 'Nothing recognised — try adding more context.'),
    total > 0
  );

  // Enable append button if there's data and a patient selected
  _updateImportAppendBtn();
}

function _getReviewedImportLabs(labs) {
  return (labs || []).map((lab, i) => {
    const valEl = document.getElementById(`import-l-val-${i}`);
    const unitEl = document.getElementById(`import-l-unit-${i}`);
    const nameEl = document.getElementById(`import-l-name-${i}`);
    const refEl = document.getElementById(`import-l-ref-${i}`);
    return {
      ...lab,
      inputIndex: i,
      name: nameEl ? nameEl.value.trim() : lab.name,
      value: valEl ? valEl.value.trim() : lab.value,
      unit: unitEl ? unitEl.value.trim() : lab.unit,
      reference: refEl ? refEl.value.trim() : (lab.reference || ''),
    };
  }).filter(lab => lab.name && lab.value);
}

function _getExistingImportLabIndexMaps(record) {
  const exact = new Map();
  const identity = new Map();
  const add = (timestamp, name, value, details = {}) => {
    const fp = _importLabFingerprint({ timestamp, name, value });
    const id = _importLabIdentity({ timestamp, name });
    if (!fp || !id) return;
    const detail = {
      labTimestamp: _importNormalizeTimestamp(timestamp),
      name: String(name || '').trim(),
      value: _importNormalizeLabValue(value),
      unit: details.unit || '',
      reference: details.reference || '',
      entryTimestamp: details.entryTimestamp || '',
      category: details.category || '',
    };
    if (!exact.has(fp)) exact.set(fp, []);
    exact.get(fp).push(detail);
    if (!identity.has(id)) identity.set(id, []);
    identity.get(id).push(detail);
  };

  const sections = String(record || '').split(/(?=^## \d{4}-\d{2}-\d{2})/m);
  sections.forEach((section) => {
    const header = section.match(/^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*[—-]\s*(.+)$/m);
    if (!header) return;
    const category = header[3] || '';
    if (!/\blabs?\b/i.test(category) && !/\bLabs?\s*\(/i.test(section)) return;
    const entryTimestamp = `${header[1]} ${header[2]}`;
    const explicit = section.match(/\bLabs?\s*\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\)/i);
    const timestamp = explicit ? `${explicit[1]} ${explicit[2]}` : entryTimestamp;
    const rowRe = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
    let match;
    while ((match = rowRe.exec(section)) !== null) {
      const cells = match[0].split('|').slice(1, -1).map(cell => cell.trim());
      const name = cells[0] || match[1].trim();
      const value = cells[1] || match[2].trim();
      if (/^(?:Test|-+)$/.test(name) || !/[0-9]/.test(value)) continue;
      add(timestamp, name, value, {
        unit: cells[2] || '',
        reference: cells[3] || '',
        entryTimestamp,
        category,
      });
    }
  });

  if (exact.size === 0 && typeof parseLabTimeline === 'function') {
    try {
      parseLabTimeline(record).forEach((entry) => {
        Object.entries(entry.labs || {}).forEach(([key, value]) => {
          add(entry.timestamp, key, value, { entryTimestamp: entry.timestamp, category: 'Labs' });
        });
      });
    } catch (e) {
      // Leave the index empty if the patient-context parser is unavailable.
    }
  }

  return { exact, identity };
}

function _getExistingImportLabIndex(record) {
  return _getExistingImportLabIndexMaps(record).exact;
}

function _getExistingImportLabFingerprints(record) {
  return new Set(_getExistingImportLabIndex(record).keys());
}

function _formatImportDuplicateReason(lab, match) {
  const labTime = (match && match.labTimestamp) || _importNormalizeTimestamp(lab && (lab.timestamp || lab.collectedAt));
  const entryTime = match && match.entryTimestamp ? match.entryTimestamp : '';
  const category = match && match.category ? ` — ${match.category}` : '';
  const source = entryTime ? `record entry ${entryTime}${category}` : 'the existing chart';
  return `Duplicate of ${labTime || 'the same collection time'}, already charted in ${source}.`;
}

function _formatImportConflictReason(lab, match) {
  const labTime = (match && match.labTimestamp) || _importNormalizeTimestamp(lab && (lab.timestamp || lab.collectedAt));
  const entryTime = match && match.entryTimestamp ? match.entryTimestamp : '';
  const category = match && match.category ? ` — ${match.category}` : '';
  const source = entryTime ? `record entry ${entryTime}${category}` : 'the existing chart';
  const existingValue = match && match.value ? `Existing value is ${match.value}. ` : '';
  return `${existingValue}Same test and collection time (${labTime || 'unknown time'}) already exists in ${source}.`;
}

function filterImportDuplicateLabs(labs, record) {
  const existing = _getExistingImportLabIndexMaps(record);
  const kept = [];
  const skipped = [];
  const conflicts = [];
  (labs || []).forEach((lab) => {
    const fp = _importLabFingerprint(lab);
    const id = _importLabIdentity(lab);
    const matches = fp ? (existing.exact.get(fp) || []) : [];
    if (matches.length) {
      skipped.push({
        ...lab,
        duplicateMatches: matches,
        duplicateReason: _formatImportDuplicateReason(lab, matches[0]),
      });
    }
    else if (id && existing.identity.has(id)) {
      const conflictMatches = existing.identity.get(id) || [];
      conflicts.push({
        ...lab,
        conflictMatches,
        conflictReason: _formatImportConflictReason(lab, conflictMatches[0]),
      });
    }
    else kept.push(lab);
  });
  return { kept, skipped, conflicts };
}

function _replaceImportConflictRows(record, replacementLabs) {
  const replacements = new Map();
  (replacementLabs || []).forEach((lab) => {
    const id = _importLabIdentity(lab);
    if (id) replacements.set(id, lab);
  });
  if (!replacements.size) return { content: String(record || ''), replacedCount: 0 };

  let replacedCount = 0;
  const sections = String(record || '').split(/(?=^## \d{4}-\d{2}-\d{2})/m);
  const content = sections.map((section) => {
    const header = section.match(/^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*[—-]\s*(.+)$/m);
    if (!header) return section;
    const category = header[3] || '';
    if (!/\blabs?\b/i.test(category) && !/\bLabs?\s*\(/i.test(section)) return section;
    const entryTimestamp = `${header[1]} ${header[2]}`;
    const explicit = section.match(/\bLabs?\s*\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\)/i);
    const timestamp = explicit ? `${explicit[1]} ${explicit[2]}` : entryTimestamp;
    const lines = section.split('\n');
    return lines.map((line) => {
      if (!/^\s*\|/.test(line)) return line;
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length < 2) return line;
      const name = cells[0] || '';
      const value = cells[1] || '';
      if (/^(?:Test|-+)$/.test(name) || /^-+$/.test(value) || !/[0-9]/.test(value)) return line;
      const lab = replacements.get(_importLabIdentity({ timestamp, name }));
      if (!lab || _importNormalizeLabValue(lab.value) === _importNormalizeLabValue(value)) return line;
      const nextCells = cells.slice();
      nextCells[0] = lab.name || name;
      nextCells[1] = lab.value || value;
      if (nextCells.length >= 3) nextCells[2] = lab.unit || '';
      if (nextCells.length >= 4) nextCells[3] = lab.reference || '';
      replacedCount += 1;
      return `| ${nextCells.join(' | ')} |`;
    }).join('\n');
  }).join('');

  return { content, replacedCount };
}

function _chooseImportAppendCategory(selected, vitals, labs, meds) {
  if (selected && selected !== 'Vitals & Labs') return selected;
  if (labs.length && !vitals.length && !meds.length) return 'Labs';
  if (vitals.length && !labs.length && !meds.length) return 'Vital Signs';
  if (meds.length && !vitals.length && !labs.length) return 'Medications';
  return selected || 'Vitals & Labs';
}

function _clearImportDuplicateReview() {
  _importPendingLabApproval = null;
  const panel = document.getElementById('import-review-panel');
  if (panel) {
    panel.hidden = true;
    panel.innerHTML = '';
  }
}

function _showImportDuplicateReview(draft) {
  const panel = document.getElementById('import-review-panel');
  if (!panel) return false;
  const duplicates = draft.duplicateLabs || [];
  const conflicts = draft.conflictLabs || [];
  _importPendingLabApproval = {
    ...draft,
    duplicateLabs: duplicates.map((lab, index) => ({ ...lab, duplicateReviewId: index })),
    conflictLabs: conflicts.map((lab, index) => ({ ...lab, conflictReviewId: index })),
  };

  const duplicateRows = _importPendingLabApproval.duplicateLabs.map((lab, index) => {
    const time = _importNormalizeTimestamp(lab.timestamp || lab.collectedAt) || '-';
    const unit = lab.unit ? ` ${lab.unit}` : '';
    return `<tr>
      <td><input type="checkbox" id="import-dup-${index}" class="import-review-checkbox"></td>
      <td>${_escImport(time)}</td>
      <td>${_escImport(lab.name)}</td>
      <td>${_escImport(lab.value)}${_escImport(unit)}</td>
      <td>${_escImport(lab.duplicateReason || 'Already charted.')}</td>
    </tr>`;
  }).join('');

  const conflictRows = _importPendingLabApproval.conflictLabs.map((lab, index) => {
    const time = _importNormalizeTimestamp(lab.timestamp || lab.collectedAt) || '-';
    const unit = lab.unit ? ` ${lab.unit}` : '';
    return `<tr>
      <td>
        <select id="import-conflict-${index}" class="import-review-select">
          <option value="skip">Skip</option>
          <option value="append">Append anyway</option>
          <option value="replace">Replace existing</option>
        </select>
      </td>
      <td>${_escImport(time)}</td>
      <td>${_escImport(lab.name)}</td>
      <td>${_escImport(lab.value)}${_escImport(unit)}</td>
      <td>${_escImport(lab.conflictReason || 'Different value already charted for this collection time.')}</td>
    </tr>`;
  }).join('');

  const duplicateTable = duplicateRows ? `
    <div class="import-review-subtitle">Exact duplicates</div>
    <table class="import-review-table">
      <thead><tr><th>Append</th><th>Time</th><th>Test</th><th>Value</th><th>Reason</th></tr></thead>
      <tbody>${duplicateRows}</tbody>
    </table>` : '';
  const conflictTable = conflictRows ? `
    <div class="import-review-subtitle">Same-time conflicts</div>
    <table class="import-review-table">
      <thead><tr><th>Action</th><th>Time</th><th>Test</th><th>New value</th><th>Reason</th></tr></thead>
      <tbody>${conflictRows}</tbody>
    </table>` : '';

  panel.innerHTML = `
    <div class="import-review-title">Lab import review</div>
    <div class="import-review-note">Review values already present in the chart. Duplicates default to skip; same-time conflicts can be skipped, appended, or used to replace the existing row.</div>
    ${duplicateTable}
    ${conflictTable}
    <div class="import-review-actions">
      <button class="btn-primary" onclick="confirmImportDuplicateReview('review')">Apply Review</button>
      <button class="btn-secondary" onclick="cancelImportDuplicateReview()">Cancel</button>
    </div>`;
  panel.hidden = false;
  switchImportTab('labs');
  _importSetStatus('Review duplicate or conflicting lab values before appending.', 'info');
  return true;
}

async function _postImportAppendDraft(draft, review) {
  const approvedDuplicateLabs = Array.isArray(review) ? review : ((review && review.duplicateLabs) || []);
  const conflictActions = !Array.isArray(review) && review && review.conflicts ? review.conflicts : {};
  const duplicateLabs = Array.isArray(approvedDuplicateLabs) ? approvedDuplicateLabs : [];
  const appendConflictLabs = (draft.conflictLabs || []).filter((_, index) => conflictActions[index] === 'append');
  const replaceConflictLabs = (draft.conflictLabs || []).filter((_, index) => conflictActions[index] === 'replace');
  const labsToAppend = [...(draft.labsToAppend || []), ...duplicateLabs, ...appendConflictLabs];
  const skippedDuplicateCount = Math.max(0, (draft.duplicateLabs || []).length - duplicateLabs.length);
  const skippedConflictCount = Math.max(0, (draft.conflictLabs || []).length - appendConflictLabs.length - replaceConflictLabs.length);
  const category = _chooseImportAppendCategory(draft.selectedCategory, draft.vitals || [], labsToAppend, draft.meds || []);
  const content = formatImportBlock(draft.vitals || [], labsToAppend, draft.meds || []);
  let replacedCount = 0;

  if (replaceConflictLabs.length) {
    const replaced = _replaceImportConflictRows(draft.existingRecord || '', replaceConflictLabs);
    replacedCount = replaced.replacedCount;
    if (replacedCount) {
      const replaceRes = await fetch(`/s/handoff/api/patients/${encodeURIComponent(draft.pid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replaced.content }),
      });
      if (!replaceRes.ok) {
        const err = await replaceRes.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${replaceRes.status}`);
      }
    }
  }

  if (!content.trim()) {
    _clearImportDuplicateReview();
    const parts = [
      replacedCount ? `Replaced ${replacedCount} existing lab value${replacedCount !== 1 ? 's' : ''}.` : '',
      skippedDuplicateCount ? `Skipped ${skippedDuplicateCount} duplicate lab value${skippedDuplicateCount !== 1 ? 's' : ''}.` : '',
      skippedConflictCount ? `Skipped ${skippedConflictCount} conflicting lab value${skippedConflictCount !== 1 ? 's' : ''}.` : '',
    ].filter(Boolean);
    _importSetStatus(parts.length ? parts.join(' ') : 'Nothing to append — review the parsed values.', parts.length ? 'info' : false);
    return;
  }

  const res = await fetch(`/s/handoff/api/patients/${encodeURIComponent(draft.pid)}/append`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, category }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  _clearImportDuplicateReview();
  const appendedDuplicates = duplicateLabs.length;
  const appendedConflicts = appendConflictLabs.length;
  const suffix = [
    replacedCount ? `Replaced ${replacedCount} existing lab value${replacedCount !== 1 ? 's' : ''}.` : '',
    skippedDuplicateCount ? `Skipped ${skippedDuplicateCount} duplicate lab value${skippedDuplicateCount !== 1 ? 's' : ''}.` : '',
    skippedConflictCount ? `Skipped ${skippedConflictCount} conflicting lab value${skippedConflictCount !== 1 ? 's' : ''}.` : '',
    appendedDuplicates ? `Appended ${appendedDuplicates} duplicate lab value${appendedDuplicates !== 1 ? 's' : ''} by approval.` : '',
    appendedConflicts ? `Appended ${appendedConflicts} conflicting lab value${appendedConflicts !== 1 ? 's' : ''} by approval.` : '',
  ].filter(Boolean).join(' ');
  _importSetStatus(`✓ Appended to record.${suffix ? ` ${suffix}` : ''}`, true);
}

async function confirmImportDuplicateReview(mode) {
  if (!_importPendingLabApproval) return;
  const draft = _importPendingLabApproval;
  const btn = document.getElementById('import-append-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Appending…'; }
  try {
    const approved = (draft.duplicateLabs || []).filter((_, index) => {
      const checkbox = document.getElementById(`import-dup-${index}`);
      return checkbox && checkbox.checked;
    });
    const conflicts = {};
    (draft.conflictLabs || []).forEach((_, index) => {
      const select = document.getElementById(`import-conflict-${index}`);
      conflicts[index] = select && select.value ? select.value : 'skip';
    });
    await _postImportAppendDraft(draft, { duplicateLabs: approved, conflicts });
  } catch (e) {
    _importSetStatus(`Failed: ${e.message}`, false);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Append to Record'; }
    _updateImportAppendBtn();
  }
}

function cancelImportDuplicateReview() {
  _clearImportDuplicateReview();
  _importSetStatus('Duplicate review cancelled.', 'info');
  _updateImportAppendBtn();
}

function clearImportInput() {
  const textarea = document.getElementById('import-raw-input');
  if (textarea) textarea.value = '';
  ['vitals','labs','meds'].forEach(tab => {
    const el = document.getElementById(`import-${tab}-content`);
    if (el) el.innerHTML = '<div class="import-empty">Parse some data to see results.</div>';
    _importBadge(`import-tab-count-${tab}`, 0);
  });
  _importLastParsed = { vitals: [], labs: [], meds: [] };
  _clearImportDuplicateReview();
  _importSetStatus('', false);
  _updateImportAppendBtn();
}

// --------------- Patient list ------------------------------------------------

async function loadImportPatientList() {
  const sel = document.getElementById('import-patient-select');
  if (!sel) return;
  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const patients = data.patients || data || [];
    sel.innerHTML = '<option value="">Select patient…</option>';
    patients.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.patient_id || p.id || '';
      opt.textContent = p.name || p.patient_name || p.patient_id || opt.value;
      sel.appendChild(opt);
    });
    // Pre-select if sidebar has a patient chosen
    const sidebarSel = document.getElementById('sidebar-patient-select');
    if (sidebarSel && sidebarSel.value) sel.value = sidebarSel.value;
    _importPatientListLoaded = true;
  } catch (e) {
    sel.innerHTML = '<option value="">Failed to load patients</option>';
  }
  _updateImportAppendBtn();
}

function _updateImportAppendBtn() {
  const btn = document.getElementById('import-append-btn');
  if (!btn) return;
  const sel = document.getElementById('import-patient-select');
  const hasPid = sel && sel.value;
  const hasData = _importLastParsed.vitals.length || _importLastParsed.labs.length || _importLastParsed.meds.length;
  btn.disabled = !(hasPid && hasData);
}

// --------------- Append to record --------------------------------------------

async function appendImportToRecord() {
  const pidSel  = document.getElementById('import-patient-select');
  const catSel  = document.getElementById('import-category-select');
  if (!pidSel || !pidSel.value) {
    _importSetStatus('Please select a patient first.', false);
    return;
  }

  const pid      = pidSel.value;
  const selectedCategory = catSel ? catSel.value : 'Vitals & Labs';

  const btn = document.getElementById('import-append-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Appending…'; }

  try {
    let labsToAppend = _getReviewedImportLabs(_importLastParsed.labs);
    let duplicateLabs = [];
    let conflictLabs = [];
    let existingRecord = '';
    if (labsToAppend.length) {
      const recordRes = await fetch(`/s/handoff/api/patients/${encodeURIComponent(pid)}`);
      if (recordRes.ok) {
        const patient = await recordRes.json();
        existingRecord = patient.content || '';
        const filtered = filterImportDuplicateLabs(labsToAppend, existingRecord);
        labsToAppend = filtered.kept;
        duplicateLabs = filtered.skipped;
        conflictLabs = filtered.conflicts || [];
      }
    }

    const draft = {
      pid,
      selectedCategory,
      vitals: _importLastParsed.vitals,
      labsToAppend,
      duplicateLabs,
      conflictLabs,
      existingRecord,
      meds: _importLastParsed.meds,
    };

    if ((duplicateLabs.length || conflictLabs.length) && _showImportDuplicateReview(draft)) {
      return;
    }

    await _postImportAppendDraft(draft, []);
  } catch (e) {
    _importSetStatus(`Failed: ${e.message}`, false);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Append to Record'; }
    _updateImportAppendBtn();
  }
}

// --------------- Status helper -----------------------------------------------

function _importSetStatus(msg, ok) {
  const el = document.getElementById('import-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'consults-status ' + (ok === 'info' ? 'info' : ok ? 'success' : msg ? 'error' : '');
}

// --------------- Init --------------------------------------------------------

function initImport() {
  if (!_importPatientListLoaded) loadImportPatientList();

  // Wire patient select change → update append button
  const sel = document.getElementById('import-patient-select');
  if (sel && !sel.dataset.importWired) {
    sel.dataset.importWired = '1';
    sel.addEventListener('change', () => {
      _clearImportDuplicateReview();
      _updateImportAppendBtn();
    });
  }
}

if (typeof window !== 'undefined') {
  window.__importParseTestApi = {
    parseLabsFromText,
    parseNtuhLabsFromText,
    parseImportText,
    canonicalImportLabKey,
    filterImportDuplicateLabs,
    formatImportBlock,
    _importLabFingerprint,
    _importLabIdentity,
    _replaceImportConflictRows,
  };
}
