const ACTIVE_PATIENT_STORAGE_KEY = 'medical-portal-active-patient-id';
const PATIENT_CONTEXT_ALERT_ACK_KEY = 'medical-portal-patient-context-alert-ack';
const PATIENT_CONTEXT_POLL_INTERVAL_MS = 60000;

const PATIENT_CONTEXT_GROUPS = [
  { title: 'Renal', subtitle: 'Cr, BUN, eGFR', labs: [['Cr', 'Creatinine'], ['BUN', 'BUN'], ['eGFR', 'eGFR']] },
  { title: 'Electrolytes / Acid-Base', subtitle: 'Na, K, Cl, HCO3', labs: [['Na', 'Sodium'], ['K', 'Potassium'], ['Cl', 'Chloride'], ['HCO3', 'HCO3']] },
  { title: 'CBC / Infection', subtitle: 'WBC, ANC, Hgb, Plt, CRP', labs: [['WBC', 'WBC'], ['ANC', 'ANC'], ['Hgb', 'Hemoglobin'], ['Plt', 'Platelets'], ['CRP', 'CRP']] },
  { title: 'Liver', subtitle: 'AST, ALT, ALP, TBili, Alb', labs: [['AST', 'AST'], ['ALT', 'ALT'], ['ALP', 'ALP'], ['TBili', 'Total bilirubin'], ['Alb', 'Albumin']] },
];

const IMPORTANT_EVENT_CATEGORIES = ['Imaging', 'Consult', 'Procedure', 'Medication Change', 'Clinical Note'];
const DRAWER_LAB_KEYS = [['Cr', 'Creatinine'], ['K', 'Potassium'], ['Na', 'Sodium'], ['WBC', 'WBC'], ['Plt', 'Platelets'], ['CRP', 'CRP']];
const LAB_DISPLAY_ORDER = ['Cr', 'BUN', 'eGFR', 'Na', 'K', 'Cl', 'HCO3', 'WBC', 'ANC', 'Hgb', 'Plt', 'CRP', 'AST', 'ALT', 'ALP', 'TBili', 'Alb'];

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
  return context.insights.filter((insight) => insight && (insight.tone === 'warn' || insight.tone === 'danger'));
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
    const isExplicitLabSection = /^labs$/i.test(category);
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
      if (/creatinine|^cre$/i.test(name)) labs.Cr = value;
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
      else if (/^ast$|got/i.test(name)) labs.AST = value;
      else if (/^alt$|gpt/i.test(name)) labs.ALT = value;
      else if (/alp|alkaline phosphatase/i.test(name)) labs.ALP = value;
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

  return insights.slice(0, 6);
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
  if (key === 'Plt' && previous !== undefined && latest <= previous * 0.5) return { tone: 'warn', text: 'Drop' };
  if (key === 'TBili' && latest >= 2) return { tone: 'warn', text: 'High' };
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
  const higherWorse = ['Cr', 'BUN', 'K', 'WBC', 'CRP', 'AST', 'ALT', 'ALP', 'TBili'];
  const lowerWorse = ['eGFR', 'Na', 'HCO3', 'ANC', 'Hgb', 'Plt', 'Alb'];
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

function buildPatientContextPayload(data) {
  const summary = getPatientContextSummary(data);
  const demographics = parsePatientAgeSex((data && data.content) || '');
  const timeline = buildTimelineWithEgfr(parseLabTimeline((data && data.content) || ''), demographics);
  const latestLabs = timeline.length ? { ...(timeline[timeline.length - 1].labs || {}) } : {};
  const previousLabs = timeline.length > 1 ? { ...(timeline[timeline.length - 2].labs || {}) } : {};
  const recentEntries = getImportantEvents(parseRecordEntries((data && data.content) || ''), 8);
  const insights = interpretLabTimeline(timeline);
  const lastUpdated = summary.modified || '';
  return {
    ...summary,
    age: demographics.age,
    sex: demographics.sex,
    timeline,
    latestLabs,
    previousLabs,
    egfr: latestLabs.eGFR !== undefined ? latestLabs.eGFR : null,
    insights,
    recentEntries,
    lastUpdated,
    lastUpdatedLabel: formatPatientUpdatedTime(lastUpdated) || '-',
    lastUpdatedStatus: getContextStaleness(lastUpdated),
    lastLabTimestamp: timeline.length ? timeline[timeline.length - 1].timestamp : '',
    timelineCount: timeline.length,
  };
}

function getActivePatientClinicalSnapshot() {
  return activePatientContext;
}

function getActivePatientId() {
  return activePatientId;
}

function getActivePatientDisplayName() {
  return activePatientContext && activePatientContext.name ? activePatientContext.name : '';
}

function isPatientContextDrawerOpen() {
  return !!document.getElementById('patient-context-panel')?.classList.contains('open');
}

function updatePatientContextAlertBadge() {
  const state = getPatientContextAlertState(activePatientContext, getPatientContextAlertAck(activePatientId));
  const label = state.count > 9 ? '9+' : String(state.count || '');
  const navBadge = document.getElementById('patient-context-nav-badge');
  const toggleBadge = document.getElementById('patient-context-toggle-badge');

  [navBadge, toggleBadge].forEach((badge) => {
    if (!badge) return;
    if (!state.unseen) {
      badge.style.display = 'none';
      badge.textContent = '';
      return;
    }
    badge.style.display = 'inline-flex';
    badge.textContent = label;
  });
}

function acknowledgeCurrentPatientContextAlerts() {
  if (!activePatientId || !activePatientContext || !activePatientContext.lastUpdated) return;
  setPatientContextAlertAck(activePatientId, activePatientContext.lastUpdated);
  updatePatientContextAlertBadge();
}

function buildPatientContextClipboardSummary(context) {
  if (!context) return '';
  const latest = context.latestLabs || {};
  const labParts = ['Cr', 'eGFR', 'K', 'Na', 'Hgb', 'Plt', 'WBC', 'CRP']
    .filter((key) => latest[key] !== undefined)
    .map((key) => `${key} ${latest[key]}`);
  const insightLines = getPatientContextAlertItems(context).slice(0, 4).map((item) => `- ${item.title}: ${item.body}`);
  const eventLines = (context.recentEntries || []).slice(0, 3).map((entry) => `- ${entry.timestamp} ${entry.category}: ${entry.title}`);

  return [
    `${context.name} (${context.id || '-'})`,
    `Diagnosis: ${context.dx || '-'}`,
    `Admitted: ${context.admitted || '-'}`,
    `Last Updated: ${context.lastUpdatedLabel || '-'}`,
    `Latest Labs: ${context.lastLabTimestamp || '-'}`,
    labParts.length ? `Key Labs: ${labParts.join(' · ')}` : 'Key Labs: none available',
    insightLines.length ? 'What Matters Today:' : 'What Matters Today: no active warn/danger rule-based alerts',
    insightLines.join('\n'),
    eventLines.length ? 'Recent Important Events:' : 'Recent Important Events: none available',
    eventLines.join('\n'),
  ].filter(Boolean).join('\n');
}

async function copyPatientContextSummary() {
  const text = buildPatientContextClipboardSummary(activePatientContext);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function updatePatientContextToggle() {
  const btn = document.getElementById('patient-context-toggle');
  if (!btn) return;
  const label = document.getElementById('patient-context-toggle-label');
  const drawerOpen = !!document.getElementById('patient-context-panel')?.classList.contains('open');
  btn.classList.toggle('active', drawerOpen);
  if (activePatientContext) {
    btn.classList.add('has-patient');
    btn.title = drawerOpen
      ? `Close quick patient context for ${activePatientContext.name}`
      : `${activePatientContext.name} — Quick patient context`;
    if (label) label.textContent = truncatePatientLabel(activePatientContext.name);
  } else {
    btn.classList.remove('has-patient');
    btn.title = drawerOpen ? 'Close quick patient context' : 'Quick patient context';
    if (label) label.textContent = 'Quick Context';
  }
  updatePatientContextAlertBadge();
}

function syncActivePatientSelect() {
  const sel = document.getElementById('calc-patient-select');
  if (sel) sel.value = activePatientId || '';
}

function syncSidebarPatientSelect() {
  const sel = document.getElementById('sidebar-patient-select');
  if (!sel) return;
  sel.value = activePatientId || '';
  updateSidebarPatientMeta();
}

function updateSidebarPatientMeta() {
  const meta = document.getElementById('sidebar-patient-meta');
  const sel = document.getElementById('sidebar-patient-select');
  if (!meta || !sel) return;
  const selected = sel.selectedOptions && sel.selectedOptions.length ? sel.selectedOptions[0] : null;
  if (!selected || !selected.value) {
    meta.textContent = 'No patient selected.';
    return;
  }
  const name = activePatientContext && activePatientContext.id === selected.value
    ? activePatientContext.name
    : (selected.dataset.name || selected.textContent.split(' (')[0] || 'Selected patient');
  const admitted = activePatientContext && activePatientContext.id === selected.value
    ? activePatientContext.admitted
    : (selected.dataset.admitted || '-');
  const updated = activePatientContext && activePatientContext.id === selected.value
    ? activePatientContext.lastUpdatedLabel
    : (selected.dataset.updated || '-');
  meta.innerHTML = `<strong>${escPatientContextHtml(name)}</strong><br>Admitted ${escPatientContextHtml(admitted)} · Updated ${escPatientContextHtml(updated)}`;
}

function isPatientContextViewActive() {
  return typeof currentView !== 'undefined' && currentView === 'patient-context';
}

function buildDrawerLabChips(context) {
  if (!context || !context.timeline.length) return '<div class="pc-empty">No timestamped lab sets found in this record.</div>';
  const latest = context.latestLabs || {};
  const previous = context.previousLabs || {};
  const chips = DRAWER_LAB_KEYS
    .filter(([key]) => latest[key] !== undefined)
    .slice(0, 6)
    .map(([key, label]) => {
      const arrow = getTrendArrowSymbol(latest[key], previous[key]);
      const badge = getLabBadge(key, latest[key], previous[key]);
      return `<div class="pc-lab-chip">
        <div class="pc-lab-chip-label">${escPatientContextHtml(label)}</div>
        <div class="pc-lab-chip-value">${escPatientContextHtml(String(latest[key]))}</div>
        <div class="pc-lab-chip-trend"><span class="pc-trend-arrow ${arrow.cls}">${arrow.text}</span> ${escPatientContextHtml(formatLabDelta(latest[key], previous[key]) || 'First available')}</div>
        ${badge ? `<div style="margin-top:0.25rem;"><span class="pc-badge ${badge.tone}">${escPatientContextHtml(badge.text)}</span></div>` : ''}
      </div>`;
    });
  return chips.length ? `<div class="pc-latest-grid">${chips.join('')}</div>` : '<div class="pc-empty">No high-yield latest labs recognized yet.</div>';
}

function buildDrawerEvents(context) {
  if (!context || !context.recentEntries.length) return '<div class="pc-empty">No recent Imaging, Consult, Procedure, Medication Change, or Clinical Note entries yet.</div>';
  return `<div class="pc-drawer-events">${context.recentEntries.slice(0, 3).map((entry) => `
    <div class="pc-mini-event">
      <div class="pc-event-top">
        <div>
          <div class="pc-event-cat">${escPatientContextHtml(entry.category)}</div>
          <div class="pc-event-title">${escPatientContextHtml(entry.title)}</div>
        </div>
        <div class="pc-event-meta">${escPatientContextHtml(entry.timestamp)}</div>
      </div>
      <div class="pc-event-body">${escPatientContextHtml(entry.excerpt || 'No excerpt available.')}</div>
    </div>
  `).join('')}</div>`;
}

function renderPatientContextDrawer() {
  const titleEl = document.getElementById('patient-context-title');
  const subtitleEl = document.getElementById('patient-context-subtitle');
  const bodyEl = document.getElementById('patient-context-body');
  if (!titleEl || !subtitleEl || !bodyEl) return;

  if (!activePatientContext) {
    titleEl.textContent = 'Quick Context';
    subtitleEl.textContent = 'Compact preview for the active patient.';
    bodyEl.innerHTML = '<div class="pc-empty">No active patient selected.</div>';
    updatePatientContextToggle();
    return;
  }

  const context = activePatientContext;
  titleEl.textContent = context.name;
  subtitleEl.textContent = `${context.dx} • Admitted ${context.admitted}`;
  bodyEl.innerHTML = `
    <div class="pc-summary">
      <div class="pc-actions" style="justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:0.68rem;font-weight:700;color:var(--text);">${escPatientContextHtml(context.name)}</div>
          <div style="font-size:0.58rem;color:var(--text-dim);margin-top:0.15rem;">Updated ${escPatientContextHtml(context.lastUpdatedLabel)}</div>
        </div>
        <button class="census-inline-btn" onclick="refreshActivePatientContext()">Refresh</button>
      </div>
      <div class="pc-summary-grid">
        <div class="pc-summary-item"><span>Patient ID</span><strong>${escPatientContextHtml(context.id || '-')}</strong></div>
        <div class="pc-summary-item"><span>Last Labs</span><strong>${escPatientContextHtml(context.lastLabTimestamp || '-')}</strong></div>
      </div>
      <div class="pc-actions" style="margin-top:0.65rem;">
        <button class="btn-primary pc-drawer-cta" onclick="openPatientContextWorkspace()">Open Full Page</button>
      </div>
    </div>
    <div class="pc-section">
      <div class="pc-section-hdr">What Matters Today</div>
      <div class="pc-section-body">
        ${context.insights.length
          ? `<div class="trend-insights">${context.insights.slice(0, 3).map((insight) => `<div class="trend-insight ${insight.tone}"><strong>${escPatientContextHtml(insight.title)}</strong><div>${escPatientContextHtml(insight.body)}</div></div>`).join('')}</div>`
          : '<div class="pc-empty">No rule-based alerts from current labs.</div>'}
      </div>
    </div>
    <div class="pc-section">
      <div class="pc-section-hdr">Latest Labs</div>
      <div class="pc-section-body">${buildDrawerLabChips(context)}</div>
    </div>
    <div class="pc-section">
      <div class="pc-section-hdr">Recent Important Events</div>
      <div class="pc-section-body">${buildDrawerEvents(context)}</div>
    </div>`;

  updatePatientContextToggle();
  syncActivePatientSelect();
  syncSidebarPatientSelect();
}

function renderTrendCard(label, key, series, context) {
  const latest = series[series.length - 1];
  const previous = series.length > 1 ? series[series.length - 2] : null;
  const deltaText = previous ? (formatLabDelta(latest.value, previous.value, key === 'eGFR' ? 0 : 1) || 'Stable') : 'First available';
  const deltaClass = previous ? getTrendDirectionClass(key, latest.value, previous.value) : 'pc-delta-flat';
  const badge = getLabBadge(key, latest.value, previous ? previous.value : undefined);
  const badgeHtml = badge ? `<span class="pc-badge ${badge.tone}">${escPatientContextHtml(badge.text)}</span>` : '';
  const tooltip = series.length > 1
    ? `<div class="pc-chart-tooltip${badge ? ' has-badge' : ''}" aria-hidden="true"><div class="pc-chart-tooltip-time">${escPatientContextHtml(series[0].timestamp)}</div><div class="pc-chart-tooltip-value">${escPatientContextHtml(String(series[0].value))}</div></div>`
    : '';
  const axis = series.length > 1
    ? `<div class="pc-chart-axis"><span>${escPatientContextHtml(series[0].timestamp)}</span><span>${escPatientContextHtml(latest.timestamp)}</span></div>`
    : '';
  return `<div class="${series.length > 1 ? 'pc-chart-card' : 'pc-value-card'}">
    <div class="${series.length > 1 ? 'pc-chart-top' : 'pc-value-card-top'}">
      <div>
        <div class="pc-chart-kicker">${escPatientContextHtml(key)}</div>
        <div class="${series.length > 1 ? 'pc-chart-title' : 'pc-value-card-title'}">${escPatientContextHtml(label)}</div>
      </div>
      ${series.length > 1
        ? `<div class="pc-chart-side">${badgeHtml}</div>`
        : badgeHtml}
    </div>
    <div class="${series.length > 1 ? 'pc-chart-value' : 'pc-value-card-value'}">${escPatientContextHtml(String(latest.value))}</div>
    <div class="${series.length > 1 ? 'pc-chart-meta' : 'pc-value-card-meta'}"><span class="${deltaClass}">${escPatientContextHtml(deltaText)}</span> vs prior</div>
    ${series.length > 1 ? `${tooltip}${buildSparklineSvg(series)}${axis}` : `<div class="pc-value-card-meta">Only one timepoint available (${escPatientContextHtml(latest.timestamp)}).</div>`}
  </div>`;
}

function renderGroupSection(group, context) {
  const groupId = getPatientContextGroupId(group);
  const chartCards = [];
  const singleCards = [];
  group.labs.forEach(([key, label]) => {
    const series = buildLabSeries(context.timeline, key);
    if (!series.length) return;
    if (series.length > 1) chartCards.push(renderTrendCard(label, key, series, context));
    else singleCards.push(renderTrendCard(label, key, series, context));
  });
  const body = chartCards.length || singleCards.length
    ? `${chartCards.length ? `<div class="pc-chart-grid">${chartCards.join('')}</div>` : ''}${singleCards.length ? `<div class="pc-card-grid" style="margin-top:${chartCards.length ? '0.6rem' : '0'};">${singleCards.join('')}</div>` : ''}`
    : '<div class="pc-empty">No recognized labs from this group yet.</div>';
  return `<div class="pc-group" id="${groupId}">
    <div class="pc-group-header">
      <div>
        <div class="pc-group-title">${escPatientContextHtml(group.title)}</div>
        <div class="pc-group-subtitle">${escPatientContextHtml(group.subtitle)}</div>
      </div>
      <div class="pc-page-label">${(chartCards.length + singleCards.length).toString()} metric${chartCards.length + singleCards.length === 1 ? '' : 's'}</div>
    </div>
    <div class="pc-group-body">${body}</div>
  </div>`;
}

function renderRecentEvents(context) {
  if (!context.recentEntries.length) {
    return '<div class="pc-empty">No recent Imaging, Consult, Procedure, Medication Change, or Clinical Note entries found.</div>';
  }
  return `<div class="pc-event-list">${context.recentEntries.map((entry) => `
    <div class="pc-event-card" onclick="scrollPatientContextToEvent('${escPatientContextHtml(entry.id)}')">
      <div class="pc-event-top">
        <div>
          <div class="pc-event-cat">${escPatientContextHtml(entry.category)}</div>
          <div class="pc-event-title">${escPatientContextHtml(entry.title)}</div>
        </div>
        <div class="pc-event-meta">${escPatientContextHtml(entry.timestamp)}</div>
      </div>
      <div class="pc-event-body">${escPatientContextHtml(entry.excerpt || 'No excerpt available.')}</div>
      <div class="pc-event-links">
        <button class="pc-event-link" onclick="event.stopPropagation(); scrollPatientContextToEvent('${escPatientContextHtml(entry.id)}')">Open ${escPatientContextHtml(entry.category)}</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderEventDetails(context) {
  if (!context.recentEntries.length) {
    return '<div class="pc-empty">No recent event details available.</div>';
  }
  return `<div class="pc-event-list">${context.recentEntries.map((entry) => `
    <div class="pc-event-card" id="${escPatientContextHtml(entry.id)}">
      <div class="pc-event-top">
        <div>
          <div class="pc-event-cat">${escPatientContextHtml(entry.category)}</div>
          <div class="pc-event-title">${escPatientContextHtml(entry.title)}</div>
        </div>
        <div class="pc-event-meta">${escPatientContextHtml(entry.timestamp)}</div>
      </div>
      <div class="pc-event-body">${formatPatientContextMultiline(entry.body || entry.excerpt || 'No entry text available.')}</div>
      <div class="pc-event-links">
        <button class="pc-event-link" onclick="openPatientInHandoff('record')">Open in Handoff</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderPatientContextWorkspace() {
  const root = document.getElementById('patient-context-workspace');
  if (!root) return;
  if (!activePatientContext) {
    root.innerHTML = `<div class="pc-page-empty">
      <div class="pc-page-empty-icon">&#129658;</div>
      <h2>Patient Context</h2>
      <p>Select a patient from the sidebar, Census, Calculator, or Handoff to review trendlines and recent events.</p>
      <div class="pc-page-empty-actions">
        <button class="btn-primary" onclick="switchView('census')">Open Census</button>
        <button class="btn-secondary" onclick="switchView('handoff')">Open Handoff</button>
      </div>
    </div>`;
    return;
  }

  const context = activePatientContext;
  root.innerHTML = `
    <div class="pc-page-shell">
      <div class="pc-page-header">
        <div style="flex:1;min-width:0;">
          <div class="pc-page-label">Patient Context Workspace</div>
          <div class="pc-page-title">${escPatientContextHtml(context.name)}</div>
          <div class="pc-page-subtitle">${escPatientContextHtml(context.dx)} • Admitted ${escPatientContextHtml(context.admitted)}${context.age ? ` • ${escPatientContextHtml(String(context.age))}${escPatientContextHtml(context.sex || '')}` : ''}</div>
          <div class="pc-page-meta">
            <div class="pc-meta-card"><span class="pc-meta-label">Patient ID</span><div class="pc-meta-value">${escPatientContextHtml(context.id || '-')}</div></div>
            <div class="pc-meta-card"><span class="pc-meta-label">Last Updated</span><div class="pc-meta-value">${escPatientContextHtml(context.lastUpdatedLabel)}${context.lastUpdatedStatus ? ` <span class="pc-badge ${context.lastUpdatedStatus.tone}" style="margin-left:0.3rem;">${escPatientContextHtml(context.lastUpdatedStatus.text)}</span>` : ''}</div></div>
            <div class="pc-meta-card"><span class="pc-meta-label">Latest Labs</span><div class="pc-meta-value">${escPatientContextHtml(context.lastLabTimestamp || '-')}</div></div>
          <div class="pc-meta-card"><span class="pc-meta-label">eGFR Estimate</span><div class="pc-meta-value">${context.egfr !== null ? `${escPatientContextHtml(String(context.egfr))} mL/min/1.73m2` : '-'}</div></div>
        </div>
      </div>
      <div class="pc-header-actions">
        <button class="btn-secondary" onclick="returnFromPatientContext()">Back</button>
        <button class="btn-secondary" onclick="copyPatientContextSummary()">Copy Summary</button>
        <button class="btn-secondary" onclick="refreshActivePatientContext()">Refresh</button>
        <button class="btn-primary" onclick="openPatientInHandoff('record')">Open in Handoff</button>
      </div>
      </div>
      <div class="pc-page-actions">
        <button class="btn-secondary" onclick="openPatientInHandoff('append')">Add Data</button>
        <button class="btn-secondary" onclick="openPatientInHandoff('record')">Full Record</button>
        <button class="btn-secondary" onclick="openPatientInHandoff('generate')">Generate Note</button>
        <button class="btn-secondary" onclick="openPatientContextCalculator()">Calculator</button>
      </div>
      <div class="pc-page-main">
        <div class="pc-page-column">
          <section class="pc-page-card">
            <div class="pc-page-card-header">
              <div class="pc-page-card-title">What matters today</div>
              <div class="pc-page-card-copy">Highest-priority rule-based changes from current and prior labs.</div>
            </div>
            <div class="pc-page-card-body">
              ${context.insights.length
                ? `<div class="pc-what-matters">${context.insights.map((insight) => `<div class="pc-insight-card ${insight.tone}"><strong>${escPatientContextHtml(insight.title)}</strong><p>${escPatientContextHtml(insight.body)}</p></div>`).join('')}</div>`
                : '<div class="pc-empty">No rule-based clinical alerts triggered from the current lab timeline.</div>'}
            </div>
          </section>
          <section class="pc-page-card">
            <div class="pc-page-card-header">
              <div class="pc-page-card-title">Lab trendlines</div>
              <div class="pc-page-card-copy">Charts render only when at least two timepoints exist. Single datapoints stay visible as exact-value cards.</div>
            </div>
            <div class="pc-page-card-body">
              ${context.timeline.length ? PATIENT_CONTEXT_GROUPS.map((group) => renderGroupSection(group, context)).join('<div style="height:0.7rem;"></div>') : '<div class="pc-empty">No timestamped lab sets found in this record.</div>'}
            </div>
          </section>
          <section class="pc-page-card">
            <div class="pc-page-card-header">
              <div class="pc-page-card-title">Event details</div>
              <div class="pc-page-card-copy">Recent event entries stay on the same screen so the right-column summary can jump directly to the underlying note.</div>
            </div>
            <div class="pc-page-card-body">${renderEventDetails(context)}</div>
          </section>
          <section class="pc-page-card">
            <div class="pc-page-card-header">
              <div class="pc-page-card-title">Latest labs</div>
              <div class="pc-page-card-copy">Exact values and timestamps for the most recent six lab sets.</div>
            </div>
            <div class="pc-page-card-body">${buildLatestLabsTable(context.timeline)}</div>
          </section>
        </div>
        <div class="pc-page-column">
          <section class="pc-page-card">
            <div class="pc-page-card-header">
              <div class="pc-page-card-title">Recent important events</div>
              <div class="pc-page-card-copy">Short excerpts from recent Imaging, Consult, Procedure, Medication Change, and Clinical Note entries.</div>
            </div>
            <div class="pc-page-card-body">${renderRecentEvents(context)}</div>
          </section>
        </div>
      </div>
    </div>`;
  bindPatientContextChartTooltips(root);
}

function broadcastPatientContextUpdate() {
  window.dispatchEvent(new CustomEvent('patient-context-updated', {
    detail: {
      patientId: activePatientId,
      patient: activePatientData,
      snapshot: activePatientContext,
      context: activePatientContext,
    },
  }));
}

function applyActivePatientContext(data, options = {}) {
  if (!data || !data.id) return;
  activePatientId = data.id;
  activePatientData = data;
  activePatientContext = buildPatientContextPayload(data);
  localStorage.setItem(ACTIVE_PATIENT_STORAGE_KEY, data.id);
  renderPatientContextDrawer();
  renderPatientContextWorkspace();
  updatePatientContextToggle();
  syncActivePatientSelect();
  syncSidebarPatientSelect();
  broadcastPatientContextUpdate();
  updatePatientContextAlertBadge();
  schedulePatientContextPolling();
  if (isPatientContextDrawerOpen() || isPatientContextViewActive()) {
    acknowledgeCurrentPatientContextAlerts();
  }
  if (options.open) openPatientContextDrawer();
  if (options.view) openPatientContextWorkspace();
}

function setActivePatientContext(data, options = {}) {
  applyActivePatientContext(data, options);
}

function clearActivePatientContext() {
  activePatientId = '';
  activePatientData = null;
  activePatientContext = null;
  localStorage.removeItem(ACTIVE_PATIENT_STORAGE_KEY);
  renderPatientContextDrawer();
  renderPatientContextWorkspace();
  updatePatientContextToggle();
  syncActivePatientSelect();
  syncSidebarPatientSelect();
  broadcastPatientContextUpdate();
  updatePatientContextAlertBadge();
  schedulePatientContextPolling();
}

function closePatientContextDrawer() {
  const panel = document.getElementById('patient-context-panel');
  if (panel) panel.classList.remove('open');
  updatePatientContextToggle();
}

function openPatientContextDrawer() {
  const panel = document.getElementById('patient-context-panel');
  if (!panel) return;
  if (typeof closeDrugPanel === 'function') closeDrugPanel();
  renderPatientContextDrawer();
  panel.classList.add('open');
  acknowledgeCurrentPatientContextAlerts();
  updatePatientContextToggle();
}

function togglePatientContextDrawer() {
  const panel = document.getElementById('patient-context-panel');
  if (!panel) return;
  if (panel.classList.contains('open')) {
    closePatientContextDrawer();
    return;
  }
  openPatientContextDrawer();
}

function openPatientContextWorkspace() {
  closePatientContextDrawer();
  if (typeof switchView === 'function') switchView('patient-context');
  renderPatientContextWorkspace();
  acknowledgeCurrentPatientContextAlerts();
}

function movePatientContextChartTooltip(event, tooltip, chartCard) {
  if (!tooltip || !chartCard) return;
}

function bindPatientContextChartTooltips(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('.pc-chart-card').forEach((card) => {
    const tooltip = card.querySelector('.pc-chart-tooltip');
    const svg = card.querySelector('.pc-chart-svg');
    const hoverZone = card.querySelector('.pc-chart-hover-zone');
    const crosshair = card.querySelector('.pc-chart-crosshair');
    const activePoint = card.querySelector('.pc-chart-active-point');
    if (!tooltip || !svg || !hoverZone || !crosshair || !activePoint) return;
    const points = Array.from(card.querySelectorAll('.pc-chart-point')).map((point) => ({
      x: parseFloat(point.getAttribute('cx') || '0'),
      y: parseFloat(point.getAttribute('cy') || '0'),
      label: point.dataset.pointLabel || '',
    }));
    if (!points.length) return;
    const viewBox = (svg.getAttribute('viewBox') || '0 0 320 92').split(/\s+/).map((value) => parseFloat(value));
    const viewBoxWidth = viewBox[2] || 320;
    const plotLeft = parseFloat(svg.dataset.plotLeft || '0');
    const plotRight = parseFloat(svg.dataset.plotRight || String(viewBoxWidth));
    const setActivePoint = (point, event) => {
      if (!point) return;
      crosshair.setAttribute('x1', String(point.x));
      crosshair.setAttribute('x2', String(point.x));
      crosshair.setAttribute('visibility', 'visible');
      activePoint.setAttribute('cx', String(point.x));
      activePoint.setAttribute('cy', String(point.y));
      activePoint.setAttribute('visibility', 'visible');
      const [timeLabel, valueLabel] = point.label.split(': ');
      const timeEl = tooltip.querySelector('.pc-chart-tooltip-time');
      const valueEl = tooltip.querySelector('.pc-chart-tooltip-value');
      if (timeEl) timeEl.textContent = timeLabel || point.label;
      if (valueEl) valueEl.textContent = valueLabel || point.label;
      tooltip.classList.add('visible');
      tooltip.setAttribute('aria-hidden', 'false');
    };
    const hideTooltip = () => {
      tooltip.classList.remove('visible');
      tooltip.setAttribute('aria-hidden', 'true');
      crosshair.setAttribute('visibility', 'hidden');
      activePoint.setAttribute('visibility', 'hidden');
    };
    const handleMove = (event) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const ratioX = (event.clientX - rect.left) / rect.width;
      const svgX = Math.max(plotLeft, Math.min(plotRight, ratioX * viewBoxWidth));
      let nearestPoint = points[0];
      let nearestDistance = Math.abs(nearestPoint.x - svgX);
      for (let index = 1; index < points.length; index += 1) {
        const distance = Math.abs(points[index].x - svgX);
        if (distance < nearestDistance) {
          nearestPoint = points[index];
          nearestDistance = distance;
        }
      }
      setActivePoint(nearestPoint, event);
    };
    hoverZone.addEventListener('mouseenter', handleMove);
    hoverZone.addEventListener('mousemove', handleMove);
    hoverZone.addEventListener('mouseleave', hideTooltip);
    svg.addEventListener('mouseleave', hideTooltip);
  });
}

function scrollPatientContextToElement(el) {
  if (!el) return;
  const workspace = document.getElementById('patient-context-workspace');
  const stickyHeader = workspace ? workspace.querySelector('.pc-page-header') : null;
  if (!workspace) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const workspaceRect = workspace.getBoundingClientRect();
  const targetRect = el.getBoundingClientRect();
  const stickyOffset = (stickyHeader ? stickyHeader.getBoundingClientRect().height : 0) + 18;
  const nextTop = workspace.scrollTop + (targetRect.top - workspaceRect.top) - stickyOffset;
  workspace.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
}

function scrollPatientContextToGroup(groupId) {
  if (!groupId) return;
  if (typeof switchView === 'function' && currentView !== 'patient-context') {
    switchView('patient-context');
  }
  const el = document.getElementById(groupId);
  if (el) {
    scrollPatientContextToElement(el);
  }
}

function scrollPatientContextToEvent(eventId, attempt = 0) {
  if (!eventId) return;
  if (typeof switchView === 'function' && currentView !== 'patient-context') {
    switchView('patient-context');
  }
  const el = document.getElementById(eventId);
  if (!el) {
    if (attempt < 4) {
      setTimeout(() => scrollPatientContextToEvent(eventId, attempt + 1), 80);
    }
    return;
  }
  scrollPatientContextToElement(el);
  el.classList.add('pc-event-card-target');
  setTimeout(() => el.classList.remove('pc-event-card-target'), 1600);
}

function returnFromPatientContext() {
  if (typeof getPatientContextBackView === 'function') {
    switchView(getPatientContextBackView());
    return;
  }
  if (typeof switchView === 'function') switchView('handoff');
}

function renderSidebarPatientList(patients) {
  const sel = document.getElementById('sidebar-patient-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select patient</option>';
  patients.filter((patient) => !patient.id.endsWith('_dc')).forEach((patient) => {
    knownPatientModifiedMap.set(patient.id, patient.modified || '');
    const opt = document.createElement('option');
    opt.value = patient.id;
    opt.dataset.name = patient.name || '';
    opt.dataset.admitted = patient.admitted || '-';
    opt.dataset.updated = formatPatientUpdatedTime(patient.modified) || '-';
    opt.textContent = `${patient.name} (${patient.dx || 'no dx'})`;
    sel.appendChild(opt);
  });
  syncSidebarPatientSelect();
}

async function loadSidebarPatientList() {
  const sel = document.getElementById('sidebar-patient-select');
  if (!sel) return;
  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) throw new Error('Patient list unavailable');
    const patients = await res.json();
    renderSidebarPatientList(patients);
  } catch (err) {
    sel.innerHTML = '<option value="">Patients unavailable</option>';
  }
}

async function fetchPatientContextRecord(pid) {
  if (!pid) throw new Error('Patient not found');
  const knownModified = knownPatientModifiedMap.get(pid) || '';
  const cacheKey = getPatientContextCacheKey(pid, knownModified);
  if (patientContextFetchCache.has(cacheKey)) {
    return patientContextFetchCache.get(cacheKey);
  }
  const requestPromise = fetch(`/s/handoff/api/patients/${pid}`)
    .then((res) => {
      if (!res.ok) throw new Error('Patient not found');
      return res.json().then((data) => {
        const resolvedKey = getPatientContextCacheKey(pid, data && data.modified ? data.modified : knownModified);
        if (resolvedKey !== cacheKey) {
          patientContextFetchCache.set(resolvedKey, Promise.resolve(data));
          patientContextFetchCache.delete(cacheKey);
        }
        return data;
      });
    })
    .catch((err) => {
      patientContextFetchCache.delete(cacheKey);
      throw err;
    });
  patientContextFetchCache.set(cacheKey, requestPromise);
  return requestPromise;
}

function invalidatePatientContextCache(pid) {
  if (!pid) {
    patientContextFetchCache.clear();
    return;
  }
  Array.from(patientContextFetchCache.keys())
    .filter((key) => key.startsWith(`${pid}::`))
    .forEach((key) => patientContextFetchCache.delete(key));
}

async function openPatientContextById(pid, options = {}) {
  if (!pid) {
    if (options.view) openPatientContextWorkspace();
    else if (options.open) openPatientContextDrawer();
    return;
  }
  const requestId = ++latestPatientContextRequestId;
  const data = await fetchPatientContextRecord(pid);
  if (requestId !== latestPatientContextRequestId) return;
  applyActivePatientContext(data, { open: !!options.open, view: !!options.view });
}

async function openPatientContextWorkspaceById(pid) {
  return openPatientContextById(pid, { view: true });
}

async function refreshActivePatientContext(options = {}) {
  if (!activePatientId) return;
  try {
    invalidatePatientContextCache(activePatientId);
    const data = await fetchPatientContextRecord(activePatientId);
    applyActivePatientContext(data, { open: options.open === true, view: options.view === true || isPatientContextViewActive() });
    if (options.acknowledge !== false || isPatientContextViewActive() || isPatientContextDrawerOpen()) {
      acknowledgeCurrentPatientContextAlerts();
    }
  } catch (err) {
    const bodyEl = document.getElementById('patient-context-body');
    if (bodyEl) bodyEl.innerHTML = `<div class="pc-empty">Could not refresh patient context: ${escPatientContextHtml(err.message)}</div>`;
    const root = document.getElementById('patient-context-workspace');
    if (root && isPatientContextViewActive()) {
      root.innerHTML = `<div class="pc-page-empty"><div class="pc-page-empty-icon">&#9888;</div><h2>Patient Context Unavailable</h2><p>${escPatientContextHtml(err.message)}</p></div>`;
    }
  }
}

function schedulePatientContextPolling() {
  if (patientContextPollTimer) {
    clearTimeout(patientContextPollTimer);
    patientContextPollTimer = null;
  }
  if (!activePatientId) return;
  patientContextPollTimer = setTimeout(() => {
    pollActivePatientContext().catch(() => {
      schedulePatientContextPolling();
    });
  }, PATIENT_CONTEXT_POLL_INTERVAL_MS);
}

async function pollActivePatientContext() {
  if (!activePatientId) {
    schedulePatientContextPolling();
    return;
  }
  if (document.visibilityState && document.visibilityState === 'hidden') {
    schedulePatientContextPolling();
    return;
  }

  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) throw new Error('Patient list unavailable');
    const patients = await res.json();
    renderSidebarPatientList(patients);
    const match = patients.find((patient) => patient.id === activePatientId);
    if (match && match.modified) {
      knownPatientModifiedMap.set(match.id, match.modified);
      const currentModified = activePatientData && activePatientData.modified ? activePatientData.modified : '';
      if (match.modified !== currentModified) {
        await refreshActivePatientContext({
          acknowledge: false,
          open: isPatientContextDrawerOpen(),
          view: isPatientContextViewActive(),
        });
      }
    }
  } catch (err) {
    // Ignore transient polling failures and try again later.
  } finally {
    schedulePatientContextPolling();
  }
}

function handleSidebarPatientSelect(pid) {
  if (!pid) {
    clearActivePatientContext();
    closePatientContextDrawer();
    return;
  }
  openPatientContextById(pid).catch(() => {});
}

function openSidebarSelectedPatient() {
  const sel = document.getElementById('sidebar-patient-select');
  const pid = sel ? sel.value : '';
  if (pid) openPatientContextWorkspaceById(pid).catch(() => openPatientContextWorkspace());
  else openPatientContextWorkspace();
}

function postMessageToHandoff(payload) {
  const iframe = document.getElementById('iframe-handoff');
  if (!iframe || !iframe.contentWindow) return false;
  try {
    iframe.contentWindow.postMessage(payload, '*');
    return true;
  } catch (err) {
    return false;
  }
}

function resolveHandoffOpenAck(requestId) {
  const pending = pendingHandoffOpenAcks.get(requestId);
  if (!pending) return;
  clearTimeout(pending.timeoutId);
  pendingHandoffOpenAcks.delete(requestId);
}

function sendHandoffOpenRequest(requestId, patientId, tab, attempt, options = {}) {
  const payload = {
    type: 'portal-handoff-open',
    requestId,
    patientId,
    tab,
    seedAppendText: options.seedAppendText || '',
    seedAppendCategory: options.seedAppendCategory || '',
  };
  const sent = postMessageToHandoff(payload);
  if (!sent) {
    if (attempt < 4) {
      const timeoutId = setTimeout(() => sendHandoffOpenRequest(requestId, patientId, tab, attempt + 1, options), 300);
      pendingHandoffOpenAcks.set(requestId, { timeoutId });
    }
    return;
  }
  const timeoutId = setTimeout(() => {
    if (!pendingHandoffOpenAcks.has(requestId)) return;
    if (attempt >= 4) {
      resolveHandoffOpenAck(requestId);
      return;
    }
    sendHandoffOpenRequest(requestId, patientId, tab, attempt + 1, options);
  }, attempt === 0 ? 250 : 450);
  pendingHandoffOpenAcks.set(requestId, { timeoutId });
}

function openPatientInHandoff(tab, options = {}) {
  if (typeof switchView === 'function') switchView('handoff');
  const requestId = `handoff-open-${Date.now()}-${handoffOpenRequestSeq += 1}`;
  sendHandoffOpenRequest(requestId, activePatientId, tab || 'record', 0, options);
}

function openPatientContextCalculator() {
  if (!activePatientId) return;
  if (typeof switchView === 'function') switchView('calculator');
  if (typeof loadPatientIntoCalc === 'function') loadPatientIntoCalc(activePatientId);
}

async function restoreActivePatientContext() {
  updatePatientContextToggle();
  await loadSidebarPatientList();
  renderPatientContextWorkspace();
  if (!activePatientId) return;
  try {
    const data = await fetchPatientContextRecord(activePatientId);
    applyActivePatientContext(data);
  } catch (err) {
    clearActivePatientContext();
  }
}

window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'handoff-open-ack') return;
  if (event.data.requestId) {
    resolveHandoffOpenAck(event.data.requestId);
  }
});

window.__patientContextTestApi = {
  parsePatientAgeSex,
  estimateEgfrFromLatestCr,
  getPatientContextCacheKey,
  getImportantEvents,
  getPatientContextGroupId,
  getRecentEventId,
  parseLabTimeline,
  formatLabDelta,
  interpretLabTimeline,
  parseRecordEntries,
  buildTimelineWithEgfr,
  buildPatientContextPayload,
  buildPatientContextClipboardSummary,
  getPatientContextAlertItems,
  getPatientContextAlertState,
  getContextStaleness,
};

if (!window.__PATIENT_CONTEXT_DISABLE_BOOT__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreActivePatientContext);
  } else {
    restoreActivePatientContext();
  }
}
