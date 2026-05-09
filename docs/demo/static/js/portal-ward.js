// ---------------------------------------------------------------------------
// Ward Board — all-patients risk-stratified overview
// Replaces Census Board at Alt+5 / view-id "ward"
// See FEATURES.md §Feature 3 for full spec.
// ---------------------------------------------------------------------------

// --------------- State -------------------------------------------------------

const wardState = {
  patients: [],          // raw list from /s/handoff/api/patients
  dataMap: {},           // { [pid]: { vitals, pending, meta, snapshot } }
  sortKey: 'risk',       // 'risk' | 'name' | 'days' | 'code'
  loading: false,
  lastLoaded: null,
};

// --------------- Utility -----------------------------------------------------

function wardEscHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseWardDate(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoMatch
    ? new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    : new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function wardIsSameLocalDate(left, right = new Date()) {
  const leftDate = parseWardDate(left);
  const rightDate = right instanceof Date ? right : parseWardDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getFullYear() === rightDate.getFullYear()
    && leftDate.getMonth() === rightDate.getMonth()
    && leftDate.getDate() === rightDate.getDate();
}

function wardDaysAdmitted(admittedStr) {
  const admitted = parseWardDate(admittedStr);
  if (!admitted) return null;
  const now = new Date(Date.now());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfAdmit = new Date(admitted.getFullYear(), admitted.getMonth(), admitted.getDate());
  const diffMs = startOfToday.getTime() - startOfAdmit.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function wardRiskScore(data) {
  const snapshot = data && data.snapshot ? data.snapshot : null;
  const pid = snapshot && snapshot.id ? snapshot.id : '';
  const latestLabTs = snapshot && snapshot.lastLabTimestamp ? snapshot.lastLabTimestamp : '';
  const vitals = Array.isArray(data && data.vitals) ? data.vitals : [];
  const pending = Array.isArray(data && data.pending) ? data.pending : [];
  const allInsights = Array.isArray(snapshot && snapshot.insights) ? snapshot.insights : [];
  const insights = typeof isAlertMuted === 'function'
    ? allInsights.filter((item) => !isAlertMuted(pid, item.title, latestLabTs))
    : allInsights;
  const dangerAlerts = insights.filter((item) => item.tone === 'danger').length;
  const warnAlerts = insights.filter((item) => item.tone === 'warn').length;
  const pendingCount = pending.filter((item) => item.status === 'pending').length;
  const latestVitals = vitals[0] || {};
  let vitalRisk = 0;
  if (latestVitals.spo2 != null && latestVitals.spo2 < 90) vitalRisk += 3;
  else if (latestVitals.spo2 != null && latestVitals.spo2 < 94) vitalRisk += 1;
  if (latestVitals.hr != null && (latestVitals.hr > 130 || latestVitals.hr < 45)) vitalRisk += 2;
  else if (latestVitals.hr != null && (latestVitals.hr > 120 || latestVitals.hr < 50)) vitalRisk += 1;
  if (latestVitals.bp_sys != null && latestVitals.bp_sys < 90) vitalRisk += 2;
  return (dangerAlerts * 4) + (warnAlerts * 2) + pendingCount + vitalRisk;
}

function wardSortPatients(patients, dataMap, sortKey) {
  const codeOrder = { unknown: 0, full: 1, dnr: 2, dnr_dni: 3, comfort: 4 };
  const sorted = [...patients];
  sorted.sort((left, right) => {
    const leftData = dataMap[left.id] || {};
    const rightData = dataMap[right.id] || {};
    if (sortKey === 'name') {
      return (left.name || '').localeCompare(right.name || '');
    }
    if (sortKey === 'days') {
      const dayDelta = (wardDaysAdmitted(right.admitted) ?? -1) - (wardDaysAdmitted(left.admitted) ?? -1);
      return dayDelta || (left.name || '').localeCompare(right.name || '');
    }
    if (sortKey === 'code') {
      const codeDelta = (codeOrder[leftData.meta && leftData.meta.code_status] ?? 0) - (codeOrder[rightData.meta && rightData.meta.code_status] ?? 0);
      return codeDelta || (left.name || '').localeCompare(right.name || '');
    }

    const riskDelta = wardRiskScore(rightData) - wardRiskScore(leftData);
    if (riskDelta) return riskDelta;
    const pendingDelta = (Array.isArray(rightData.pending) ? rightData.pending.filter((item) => item.status === 'pending').length : 0)
      - (Array.isArray(leftData.pending) ? leftData.pending.filter((item) => item.status === 'pending').length : 0);
    if (pendingDelta) return pendingDelta;
    return (left.name || '').localeCompare(right.name || '');
  });
  return sorted;
}

// --------------- Lab threshold & panel config --------------------------------

// [dangerLow, warnLow, warnHigh, dangerHigh]  — null = no threshold in that direction
const WARD_LAB_THRESHOLDS = {
  Na:    [125,  130,  150,  155],   // mEq/L
  K:     [3.0,  3.5,  5.0,  5.5],  // mEq/L
  Cr:    [null, null, 2.0,  3.0],  // mg/dL
  BUN:   [null, null, 20,   40],   // mg/dL
  Glu:   [50,   70,   200,  400],  // mg/dL
  HCO3:  [15,   18,   30,   null], // mEq/L
  Hgb:   [7.0,  8.0,  null, null], // g/dL
  Plt:   [50,   100,  null, null], // ×10³/µL
  WBC:   [2.0,  4.0,  15,   20],  // ×10³/µL
  ANC:   [0.5,  1.0,  null, null], // ×10³/µL
  CRP:   [null, null, 10,   30],   // mg/L
  PCT:   [null, null, 0.5,  2.0],  // ng/mL
  INR:   [null, null, 1.5,  2.5],  // ratio
  APTT:  [null, null, 45,   100],  // seconds
  ALT:   [null, null, 40,   120],  // U/L
  AST:   [null, null, 40,   120],  // U/L
  TBili: [null, null, 2.0,  5.0],  // mg/dL
  Alb:       [2.0,  2.5,  null, null], // g/dL
  Ferritin:  [null, null, 500,  2000], // µg/L
  LDH:       [null, null, 600,  1000], // U/L
  Fibrinogen:[100,  150,  null, null], // mg/dL — low is coagulopathy
  Ca:        [7.5,  8.5,  10.5, 12.0], // mg/dL
  Mg:        [1.2,  1.8,  2.4,  3.0], // mg/dL
  Phos:      [1.0,  1.5,  4.5,  6.0], // mg/dL
};

const WARD_PANEL_CONFIG = [
  { key: 'biochem', label: 'Biochem', keys: ['Na', 'K', 'Cr', 'BUN', 'Glu', 'HCO3', 'Ca', 'Mg', 'Phos'] },
  { key: 'cbc',     label: 'CBC',     keys: ['WBC', 'Hgb', 'Plt', 'ANC'] },
  { key: 'inflamm', label: 'Inflamm', keys: ['CRP', 'PCT', 'Ferritin', 'LDH'] },
  { key: 'coag',    label: 'Coag',    keys: ['INR', 'APTT', 'Fibrinogen'] },
  { key: 'lfts',    label: 'LFTs',    keys: ['ALT', 'AST', 'TBili', 'Alb'] },
];

function getLabTone(key, value) {
  if (value == null) return '';
  const spec = WARD_LAB_THRESHOLDS[key];
  if (!spec) return '';
  const [dLo, wLo, wHi, dHi] = spec;
  if ((dLo != null && value < dLo) || (dHi != null && value >= dHi)) return 'danger';
  if ((wLo != null && value < wLo) || (wHi != null && value >= wHi)) return 'warn';
  return '';
}

// --------------- Panel cell renderer -----------------------------------------

function renderWardPanelCell(snapshot, panel) {
  const labs    = snapshot && snapshot.latestLabs ? snapshot.latestLabs : {};
  const entries = panel.keys
    .filter(key => labs[key] != null)
    .map(key => ({ key, value: labs[key], tone: getLabTone(key, labs[key]) }));

  if (!entries.length) {
    return `<td class="ward-panel-cell"><span class="ward-dim">—</span></td>`;
  }

  const worst = entries.some(e => e.tone === 'danger') ? 'danger'
    : entries.some(e => e.tone === 'warn') ? 'warn' : '';

  const labObj = {};
  entries.forEach(({ key, value }) => { labObj[key] = value; });
  const dataAttr = `data-panel-labs="${wardEscHtml(JSON.stringify(labObj))}"`;

  return `<td class="ward-panel-cell" ${dataAttr} onmouseenter="showWardPanelTooltip(this)" onmouseleave="hideWardPanelTooltip()"><span class="ward-panel-dot${worst ? ` ${worst}` : ''}"></span></td>`;
}

// --------------- Panel tooltip (fixed-position, avoids overflow:hidden) ------

let _wardTooltipEl = null;

function getWardPanelTooltip() {
  if (!_wardTooltipEl && typeof document !== 'undefined' && typeof document.createElement === 'function') {
    _wardTooltipEl = document.createElement('div');
    _wardTooltipEl.className = 'ward-panel-tooltip';
    if (document.body) document.body.appendChild(_wardTooltipEl);
  }
  return _wardTooltipEl;
}

function showWardPanelTooltip(cell) {
  const raw = cell.getAttribute('data-panel-labs');
  if (!raw) return;
  let labObj;
  try { labObj = JSON.parse(raw); } catch (e) { return; }
  const keys = Object.keys(labObj);
  if (!keys.length) return;

  const rows = keys.map(key => {
    const tone = getLabTone(key, labObj[key]);
    return `<div class="ward-tt-row${tone ? ` ${tone}` : ''}">${wardEscHtml(key)}: <strong>${wardEscHtml(String(labObj[key]))}</strong></div>`;
  }).join('');

  const tt = getWardPanelTooltip();
  if (!tt) return;
  tt.innerHTML = rows;
  tt.style.display = 'block';

  const rect = cell.getBoundingClientRect();
  const ttW  = tt.offsetWidth;
  let   left = rect.left + rect.width / 2 - ttW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - ttW - 8));
  tt.style.left = `${left}px`;
  tt.style.top  = `${rect.bottom + 4}px`;
}

function hideWardPanelTooltip() {
  if (_wardTooltipEl) _wardTooltipEl.style.display = 'none';
}

// --------------- Fetch helpers -----------------------------------------------

function buildWardPatientData(patientBundle) {
  const patientData = patientBundle || null;
  const medicationData = patientData && patientData.medications ? { medications: patientData.medications } : null;
  const problemData = patientData && patientData.problems ? { problems: patientData.problems } : null;
  let snapshot = null;
  if (patientData && typeof getActivePatientClinicalSnapshot === 'function') {
    const activeSnapshot = getActivePatientClinicalSnapshot();
    if (activeSnapshot && activeSnapshot.id === patientData.id) snapshot = activeSnapshot;
  }
  if (!snapshot && patientData && typeof buildPatientContextPayload === 'function') {
    try {
      snapshot = buildPatientContextPayload({
        ...patientData,
        medications: medicationData ? medicationData.medications : { baseline: [], current: [], changes: [] },
        problems: problemData ? problemData.problems : { problems: [] },
      });
    } catch (err) {
      snapshot = null;
    }
  }

  return {
    vitals: Array.isArray(patientData && patientData.vitals) ? patientData.vitals : [],
    pending: Array.isArray(patientData && patientData.pending) ? patientData.pending : [],
    todos: Array.isArray(patientData && patientData.todos) ? patientData.todos : [],
    meta: patientData && patientData.meta ? patientData.meta : { code_status: 'unknown' },
    snapshot,
  };
}

async function fetchWardPatientData(pid) {
  const [vitalsRes, pendingRes, metaRes, patientRes, medicationRes, problemRes, todoRes] = await Promise.allSettled([
    fetch(`/s/handoff/api/patients/${pid}/vitals`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}/pending`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}/meta`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}/medications`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}/problems`).then(r => r.ok ? r.json() : null),
    fetch(`/s/handoff/api/patients/${pid}/todos`).then(r => r.ok ? r.json() : null),
  ]);

  const vitalsData   = vitalsRes.status   === 'fulfilled' ? vitalsRes.value   : null;
  const pendingData  = pendingRes.status  === 'fulfilled' ? pendingRes.value  : null;
  const metaData     = metaRes.status     === 'fulfilled' ? metaRes.value     : null;
  const patientData  = patientRes.status  === 'fulfilled' ? patientRes.value  : null;
  const medicationData = medicationRes.status === 'fulfilled' ? medicationRes.value : null;
  const problemData = problemRes.status === 'fulfilled' ? problemRes.value : null;
  const todoData = todoRes.status === 'fulfilled' ? todoRes.value : null;
  let snapshot = null;
  if (typeof getActivePatientClinicalSnapshot === 'function') {
    const activeSnapshot = getActivePatientClinicalSnapshot();
    if (activeSnapshot && activeSnapshot.id === pid) snapshot = activeSnapshot;
  }
  if (!snapshot && patientData && typeof buildPatientContextPayload === 'function') {
    try {
      snapshot = buildPatientContextPayload({
        ...patientData,
        medications: medicationData ? medicationData.medications : { baseline: [], current: [], changes: [] },
        problems: problemData ? problemData.problems : { problems: [] },
      });
    } catch (err) {
      snapshot = null;
    }
  }

  return {
    vitals:   vitalsData  ? vitalsData.vitals  : [],
    pending:  pendingData ? pendingData.items   : [],
    todos:    todoData    ? todoData.items      : [],
    meta:     metaData    ? metaData.meta       : { code_status: 'unknown' },
    snapshot,
  };
}

// --------------- Main load ---------------------------------------------------

async function loadWardBoard() {
  const body    = document.getElementById('ward-board-body');
  const countEl = document.getElementById('ward-count');
  const statusEl = document.getElementById('ward-status');

  if (!body) return;

  wardState.loading = true;
  body.innerHTML = '<div class="ward-empty"><div class="ward-spinner"></div><div style="margin-top:0.6rem;">Loading ward data…</div></div>';
  if (countEl) countEl.textContent = '';

  try {
    const res = await fetch('/s/handoff/api/ward/summary');
    if (!res.ok) throw new Error('Handoff service unavailable');
    const payload = await res.json();
    const sourcePatients = Array.isArray(payload && payload.patients) ? payload.patients : [];
    const patients = sourcePatients.map((item) => ({
      id: item.id,
      name: item.name,
      admitted: item.admitted,
      dx: item.dx,
      modified: item.modified,
      age: item.age,
      sex: item.sex,
    }));

    wardState.patients = patients;
    wardState.lastLoaded = Date.now();
    wardState.dataMap = {};
    sourcePatients.forEach((patient) => {
      wardState.dataMap[patient.id] = buildWardPatientData(patient);
    });

    renderWardBoard(patients, wardState.dataMap, wardState.sortKey);

    const active = patients.filter(p => !p.id.endsWith('_dc'));
    if (countEl) countEl.textContent = `${active.length} active`;
    if (statusEl) statusEl.textContent = '';

  } catch (e) {
    body.innerHTML = `<div class="ward-empty"><div style="font-size:1.4rem;">&#9888;</div><div>Could not load ward data</div><div style="font-size:0.65rem;margin-top:0.3rem;color:var(--text-dim);">${wardEscHtml(e.message)}. Is Handoff Tool running?</div></div>`;
    if (countEl) countEl.textContent = 'Offline';
  } finally {
    wardState.loading = false;
  }
}

// --------------- Render ------------------------------------------------------

function renderCodeStatusBadge(status) {
  const labels = { full: 'Full', dnr: 'DNR', dnr_dni: 'DNR-DNI', comfort: 'Comfort', unknown: '?' };
  const label = labels[status] || '?';
  const cls = `ward-badge code-${(status || 'unknown').replace('_', '-')}`;
  return `<span class="${cls}">${wardEscHtml(label)}</span>`;
}

function wardVitalChip(text, tone = '') {
  const extra = tone ? ` ${tone}` : '';
  return `<span class="ward-vital${extra}">${wardEscHtml(String(text))}</span>`;
}

function renderWardVitalsCell(vitals) {
  if (!vitals || !vitals.length) return '<span class="ward-dim">—</span>';
  const latest = vitals[0]; // already sorted newest-first by API
  const bp = (latest.bp_sys && latest.bp_dia) ? `${latest.bp_sys}/${latest.bp_dia}` : '—';
  const hr = latest.hr != null ? latest.hr : '—';
  const spo2 = latest.spo2 != null ? `${latest.spo2}%` : '—';
  const bpTone = latest.bp_sys != null && latest.bp_sys < 90 ? 'danger' : '';
  const hrTone = latest.hr != null && (latest.hr > 130 || latest.hr < 45) ? 'danger'
    : latest.hr != null && (latest.hr > 120 || latest.hr < 50) ? 'warn' : '';
  const spo2Tone = latest.spo2 != null && latest.spo2 < 90 ? 'danger'
    : latest.spo2 != null && latest.spo2 < 94 ? 'warn' : '';
  return `${wardVitalChip(bp, bpTone)} <span class="ward-vital-sep">|</span> ${wardVitalChip(hr, hrTone)} <span class="ward-vital-sep">|</span> ${wardVitalChip(spo2, spo2Tone)}`;
}

function renderWardLabCell(snapshot, key) {
  if (!snapshot || !snapshot.latestLabs || snapshot.latestLabs[key] == null) {
    return '<span class="ward-dim">—</span>';
  }
  const value = snapshot.latestLabs[key];
  let tone = '';
  if (key === 'K') tone = value >= 5.5 || value < 3 ? 'danger' : value >= 5 || value < 3.5 ? 'warn' : '';
  if (key === 'Cr') tone = value >= 3 ? 'danger' : value >= 2 ? 'warn' : '';
  if (key === 'WBC') tone = value >= 20 || value < 2 ? 'danger' : value >= 15 || value < 4 ? 'warn' : '';
  if (key === 'CRP') tone = value >= 15 ? 'warn' : '';
  return tone
    ? `<span class="ward-lab-chip ${tone}">${wardEscHtml(String(value))}</span>`
    : `<span>${wardEscHtml(String(value))}</span>`;
}

function renderWardAlertCell(snapshot) {
  if (!snapshot || !snapshot.insights || !snapshot.insights.length) {
    return '<span class="ward-dim">0</span>';
  }
  const pid = snapshot.id || '';
  const latestLabTs = snapshot.lastLabTimestamp || '';
  const visible = typeof isAlertMuted === 'function'
    ? snapshot.insights.filter(i => !isAlertMuted(pid, i.title, latestLabTs))
    : snapshot.insights;
  const dangers = visible.filter(i => i.tone === 'danger').length;
  const warns   = visible.filter(i => i.tone === 'warn').length;
  let html = '';
  if (dangers) html += `<span class="ward-alert-chip danger">${dangers}</span> `;
  if (warns)   html += `<span class="ward-alert-chip warn">${warns}</span>`;
  return html || '<span class="ward-dim">0</span>';
}

function renderWardSinceLastSeenChip(patient, data) {
  if (typeof buildSinceLastReviewSnapshot !== 'function') return '';
  const lastSeenAt = typeof getPatientLastSeenAt === 'function' ? getPatientLastSeenAt(patient.id) : '';
  const seenToday = wardIsSameLocalDate(lastSeenAt, new Date());
  const state = buildSinceLastReviewSnapshot(data && data.snapshot ? data.snapshot : { id: patient.id }, {
    pid: patient.id,
    vitals: data && Array.isArray(data.vitals) ? data.vitals : [],
    pending: data && Array.isArray(data.pending) ? data.pending : [],
  });
  if (!state.hasSeenMarker || !seenToday) return '<span class="ward-seen-chip due">Not seen today</span>';
  if (!state.hasChanges) return '<span class="ward-seen-chip quiet">Seen today</span>';
  return `<span class="ward-seen-chip active">Seen today + ${wardEscHtml(String(state.total || state.items.length))} new</span>`;
}

function renderWardAntibioticDayChip(data) {
  const snapshotDays = data && data.snapshot && Array.isArray(data.snapshot.antibioticDays) ? data.snapshot.antibioticDays : [];
  const days = snapshotDays.length
    ? snapshotDays
    : (typeof buildAntibioticDayCounters === 'function' && data && data.snapshot && data.snapshot.medications ? buildAntibioticDayCounters(data.snapshot.medications) : []);
  if (!days.length) return '';
  const known = days.filter((item) => item.day != null);
  const primary = known.length ? known[0] : days[0];
  const extra = days.length > 1 ? ` +${days.length - 1}` : '';
  const tone = primary.tone || 'info';
  const label = primary.day != null ? `ABX D${primary.day}${extra}` : `ABX ?${extra}`;
  const title = `${primary.name}${primary.startDate ? ` started ${primary.startDate}` : ' start date missing'}`;
  return `<span class="ward-abx-chip ${wardEscHtml(tone)}" title="${wardEscHtml(title)}">${wardEscHtml(label)}</span>`;
}

function getWardPendingSummary(items) {
  const active = (Array.isArray(items) ? items : []).filter((item) => item.status === 'pending');
  if (!active.length) return { count: 0, tone: 'neutral', label: '0', title: 'No pending results' };
  if (typeof summarizePendingFollowUpRisks === 'function') {
    const risk = summarizePendingFollowUpRisks(active);
    return {
      count: active.length,
      tone: risk.worstTone === 'success' ? 'info' : risk.worstTone,
      label: String(active.length),
      title: risk.summaryText || `${active.length} pending item${active.length === 1 ? '' : 's'}`,
    };
  }
  return { count: active.length, tone: 'info', label: String(active.length), title: `${active.length} pending item${active.length === 1 ? '' : 's'}` };
}

function getWardTodoSummary(items) {
  const active = (Array.isArray(items) ? items : []).filter((item) => item.status !== 'done');
  if (!active.length) return { count: 0, tone: 'neutral', label: '0', title: 'No open todos' };
  const counts = typeof summarizeTodoDueCounts === 'function'
    ? summarizeTodoDueCounts(active)
    : { high: active.filter((item) => item.priority === 'high').length, overdue: 0, dueToday: 0 };
  const tone = counts.overdue ? 'danger' : (counts.dueToday || counts.high ? 'warn' : 'info');
  const detail = [
    counts.high ? `${counts.high} high` : '',
    counts.overdue ? `${counts.overdue} overdue` : '',
    counts.dueToday ? `${counts.dueToday} due today` : '',
  ].filter(Boolean).join(', ');
  return {
    count: active.length,
    tone,
    label: String(active.length),
    title: detail || `${active.length} open todo${active.length === 1 ? '' : 's'}`,
  };
}

function renderWardRow(patient, data) {
  const dc = patient.id.endsWith('_dc');
  const days = wardDaysAdmitted(patient.admitted);
  const daysLabel = days !== null ? `${days}d` : '—';
  const pending = getWardPendingSummary(data.pending);
  const todos = getWardTodoSummary(data.todos);

  const rowTone = (() => {
    // Primary: use snapshot insights when available (filtered for muted alerts)
    if (data.snapshot && Array.isArray(data.snapshot.insights) && data.snapshot.insights.length) {
      const snPid = (data.snapshot.id || patient.id) || '';
      const snTs = data.snapshot.lastLabTimestamp || '';
      const visibleInsights = typeof isAlertMuted === 'function'
        ? data.snapshot.insights.filter(i => !isAlertMuted(snPid, i.title, snTs))
        : data.snapshot.insights;
      if (visibleInsights.some(i => i.tone === 'danger')) return 'ward-row-danger';
      if (visibleInsights.some(i => i.tone === 'warn'))   return 'ward-row-warn';
    }
    // Fallback: derive from raw lab/vital values when insights are absent
    const labs       = data.snapshot && data.snapshot.latestLabs ? data.snapshot.latestLabs : {};
    const latest     = Array.isArray(data.vitals) && data.vitals.length ? data.vitals[0] : {};
    const allLabKeys = WARD_PANEL_CONFIG.flatMap(p => p.keys);
    const hasDangerLab   = allLabKeys.some(key => getLabTone(key, labs[key]) === 'danger');
    const hasWarnLab     = allLabKeys.some(key => getLabTone(key, labs[key]) === 'warn');
    const hasDangerVital =
      (latest.spo2   != null && latest.spo2   < 90) ||
      (latest.bp_sys != null && latest.bp_sys < 90) ||
      (latest.hr     != null && (latest.hr > 130 || latest.hr < 45));
    const hasWarnVital =
      (latest.spo2 != null && latest.spo2 < 94) ||
      (latest.hr   != null && (latest.hr > 120 || latest.hr < 50));
    if (hasDangerLab || hasDangerVital) return 'ward-row-danger';
    if (hasWarnLab || hasWarnVital)     return 'ward-row-warn';
    return '';
  })();

  return `<tr class="ward-row ${rowTone}${dc ? ' ward-row-dc' : ''}"
    tabindex="0" role="button"
    onclick="openPatientContextById('${wardEscHtml(patient.id)}', { view: true })"
    onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPatientContextById('${wardEscHtml(patient.id)}', { view: true }); }">
    <td class="ward-name">${wardEscHtml(patient.name)}${dc ? ' <span class="ward-dc-tag">DC</span>' : ''} ${renderWardSinceLastSeenChip(patient, data)}${renderWardAntibioticDayChip(data)}<div class="ward-dx">${wardEscHtml(patient.dx || '')}</div></td>
    <td class="ward-days">${wardEscHtml(daysLabel)}</td>
    <td class="ward-code">${renderCodeStatusBadge(data.meta ? data.meta.code_status : 'unknown')}</td>
    <td class="ward-vitals">${renderWardVitalsCell(data.vitals)}</td>
    ${WARD_PANEL_CONFIG.map(panel => renderWardPanelCell(data.snapshot, panel)).join('')}
    <td class="ward-alerts">${renderWardAlertCell(data.snapshot)}</td>
    <td class="ward-pending">${pending.count > 0 ? `<span class="ward-pending-chip ${wardEscHtml(pending.tone)}" title="${wardEscHtml(pending.title)}">${wardEscHtml(pending.label)}</span>` : '<span class="ward-dim">0</span>'}</td>
    <td class="ward-todos">${todos.count > 0 ? `<span class="ward-todo-chip ${wardEscHtml(todos.tone)}" title="${wardEscHtml(todos.title)}">${wardEscHtml(todos.label)}</span>` : '<span class="ward-dim">0</span>'}</td>
    <td class="ward-actions" onclick="event.stopPropagation()">
      <div class="ward-actions-inner">
        <button class="ward-action-btn" onclick="openPatientContextById('${wardEscHtml(patient.id)}', { view: true })">Context</button>
        <button class="ward-action-btn" onclick="switchView('consults'); if (typeof setConsultPatient === 'function') setConsultPatient('${wardEscHtml(patient.id)}', { syncGlobal: true }).catch(() => {});">Consult</button>
      </div>
    </td>
  </tr>`;
}

function renderWardBoard(patients, dataMap, sortKey) {
  const body    = document.getElementById('ward-board-body');
  const legend  = document.getElementById('ward-legend');
  if (!body) return;

  if (!patients.length) {
    body.innerHTML = '<div class="ward-empty">No patients in system. Add patients via Handoff Tool or Admissions.</div>';
    return;
  }

  const sorted = wardSortPatients(patients, dataMap, sortKey);

  const rows = sorted.map(p => renderWardRow(p, dataMap[p.id] || { vitals: [], pending: [], todos: [], meta: { code_status: 'unknown' }, snapshot: null })).join('');

  body.innerHTML = `
    <table class="ward-table">
      <thead>
        <tr>
          <th>Patient / Dx</th>
          <th>Days</th>
          <th>Code</th>
          <th>BP / HR / SpO₂</th>
          ${WARD_PANEL_CONFIG.map(p => `<th class="ward-panel-th">${p.label}</th>`).join('')}
          <th>Alerts</th>
          <th>Pending</th>
          <th>Todos</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  if (legend) legend.style.display = 'flex';
}

// --------------- Controls ----------------------------------------------------

function handleWardSortChange(value) {
  wardState.sortKey = value;
  if (wardState.patients.length) {
    renderWardBoard(wardState.patients, wardState.dataMap, wardState.sortKey);
  }
}

// --------------- Init --------------------------------------------------------

function initWardBoard() {
  const select = document.getElementById('ward-sort-select');
  if (select) select.value = wardState.sortKey;
}

window.__wardBoardTestApi = {
  parseWardDate,
  wardIsSameLocalDate,
  wardDaysAdmitted,
  wardRiskScore,
  wardSortPatients,
  buildWardPatientData,
  loadWardBoard,
  renderWardVitalsCell,
  renderWardLabCell,
  renderWardAlertCell,
  renderWardPanelCell,
  renderWardAntibioticDayChip,
  getWardTodoSummary,
  renderWardRow,
  fetchWardPatientData,
  getLabTone,
  WARD_LAB_THRESHOLDS,
  WARD_PANEL_CONFIG,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWardBoard);
} else {
  initWardBoard();
}
