// ---------------------------------------------------------------------------
// Vitals & Glucose Tracking — per-patient vitals log with sparkline charts
// Panels rendered inside the Patient Context Workspace (right column).
// See FEATURES.md §Feature 1 and §Feature 6 for full spec.
// ---------------------------------------------------------------------------

// --------------- State -------------------------------------------------------

let activeVitals = [];          // array of vitals entries for the current patient
let activeVitalsPatientId = '';
let vitalsLoading = false;
let latestVitalsRequestId = 0;

// --------------- Vital field config ------------------------------------------

const VITAL_FIELDS = [
  { key: 'bp',      label: 'BP',       unit: 'mmHg',     chartValue: e => e.bp_sys != null ? Number(e.bp_sys) : (e.bp_dia != null ? Number(e.bp_dia) : null), format: e => (e.bp_sys != null || e.bp_dia != null) ? `${e.bp_sys != null ? e.bp_sys : '—'}/${e.bp_dia != null ? e.bp_dia : '—'}` : null },
  { key: 'hr',      label: 'HR',       unit: 'bpm',      format: e => e.hr != null ? e.hr : null },
  { key: 'rr',      label: 'RR',       unit: '/min',     format: e => e.rr != null ? e.rr : null },
  { key: 'spo2',    label: 'SpO2',     unit: '%',        format: e => e.spo2 != null ? e.spo2 : null },
  { key: 'temp',    label: 'Temp',     unit: '°C',       format: e => e.temp != null ? e.temp : null },
  { key: 'gcs',     label: 'GCS',      unit: '',         format: e => e.gcs != null ? e.gcs : null },
  { key: 'urine',   label: 'UO',       unit: 'ml/h',     format: e => e.urine_out_ml != null ? e.urine_out_ml : null },
  { key: 'glucose', label: 'Glucose',  unit: 'mg/dL',    format: e => e.glucose != null ? e.glucose : null },
];

function escapeVitalsHtml(value) {
  if (typeof escPatientContextHtml === 'function') return escPatientContextHtml(value || '');
  if (typeof escHtml === 'function') return escHtml(value || '');
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatVitalsTimestamp(timestamp) {
  if (!timestamp) return '';
  const dt = new Date(timestamp);
  if (Number.isNaN(dt.getTime())) return String(timestamp);
  return dt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getVitalsFieldConfig(fieldKey) {
  return VITAL_FIELDS.find((field) => field.key === fieldKey) || null;
}

function getVitalsFieldValue(field, entry) {
  if (!field || !entry) return null;
  if (typeof field.chartValue === 'function') {
    const value = field.chartValue(entry);
    return Number.isFinite(Number(value)) ? Number(value) : null;
  }
  const formatted = typeof field.format === 'function' ? field.format(entry) : null;
  const value = formatted !== null && formatted !== undefined ? Number(formatted) : null;
  return Number.isFinite(value) ? value : null;
}

function getVitalsFieldDisplay(field, entry) {
  if (!field || !entry) return '';
  const formatted = typeof field.format === 'function' ? field.format(entry) : null;
  if (formatted !== null && formatted !== undefined) return String(formatted);
  const value = getVitalsFieldValue(field, entry);
  return value !== null ? String(value) : '';
}

function getVitalsTrendClass(key, current, previous) {
  if (current === undefined || previous === undefined || previous === 0) return 'pc-delta-flat';
  const percent = Math.abs(((current - previous) / previous) * 100);
  if (percent < 3) return 'pc-delta-flat';
  if (key === 'spo2' || key === 'gcs') return current < previous ? 'pc-delta-bad' : 'pc-delta-good';
  if (key === 'glucose') return current < previous ? 'pc-delta-good' : 'pc-delta-bad';
  return current > previous ? 'pc-delta-bad' : 'pc-delta-good';
}

function getVitalBadgeText(key, value) {
  const tone = getVitalTone(key, value);
  if (!tone) return '';
  return tone === 'danger' ? 'Alert' : 'Watch';
}

function buildVitalsSeries(fieldKey, entries) {
  const field = getVitalsFieldConfig(fieldKey);
  if (!field || !Array.isArray(entries)) return [];
  return entries
    .map((entry, index) => {
      const value = getVitalsFieldValue(field, entry);
      if (value === null) return null;
      return {
        index,
        timestamp: entry.timestamp || '',
        value,
        display: getVitalsFieldDisplay(field, entry),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const at = new Date(a.timestamp).getTime();
      const bt = new Date(b.timestamp).getTime();
      if (!Number.isNaN(at) && !Number.isNaN(bt) && at !== bt) return at - bt;
      if (Number.isNaN(at) && !Number.isNaN(bt)) return -1;
      if (!Number.isNaN(at) && Number.isNaN(bt)) return 1;
      return a.index - b.index;
    });
}

function getVitalTone(key, value) {
  // TODO: return 'danger', 'warn', or '' based on clinical thresholds.
  if (value == null) return '';
  if (key === 'spo2'    && value < 94)  return value < 90  ? 'danger' : 'warn';
  if (key === 'hr'      && value > 120) return 'warn';
  if (key === 'hr'      && value < 50)  return 'warn';
  if (key === 'temp'    && value > 38.3) return value > 39 ? 'danger' : 'warn';
  if (key === 'gcs'     && value < 13)  return value < 9   ? 'danger' : 'warn';
  if (key === 'glucose' && value > 250) return 'danger';
  if (key === 'glucose' && value >= 180) return 'warn';
  if (key === 'glucose' && value < 70)  return 'danger';
  return '';
}

function setVitalsStatus(message, tone) {
  const statusEl = document.getElementById('pc-vitals-status');
  if (!statusEl) return;
  if (!message) {
    statusEl.textContent = '';
    statusEl.className = 'pc-vitals-status';
    return;
  }
  statusEl.textContent = message;
  statusEl.className = `pc-vitals-status ${tone || 'info'}`;
}

function parseVitalsNumber(value) {
  if (value === '' || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getVitalsInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function validateVitalsEntry(entry) {
  const numericFields = [
    ['bp_sys', { min: 50, max: 300, label: 'BP sys' }],
    ['bp_dia', { min: 30, max: 200, label: 'BP dia' }],
    ['hr', { min: 20, max: 300, label: 'HR' }],
    ['rr', { min: 4, max: 60, label: 'RR' }],
    ['spo2', { min: 50, max: 100, label: 'SpO2' }],
    ['temp', { min: 30, max: 42, label: 'Temp' }],
    ['gcs', { min: 3, max: 15, label: 'GCS' }],
    ['urine_out_ml', { min: 0, max: 2000, label: 'UO' }],
    ['glucose', { min: 20, max: 800, label: 'Glucose' }],
  ];

  const presentNumericFields = numericFields.filter(([key]) => entry[key] != null);
  if (!presentNumericFields.length) {
    return 'Enter at least one numeric vital before logging.';
  }

  for (const [key, rule] of numericFields) {
    const value = entry[key];
    if (value == null) continue;
    if (!Number.isFinite(value)) {
      return `${rule.label} must be a number.`;
    }
    if (value < rule.min || value > rule.max) {
      return `${rule.label} must be between ${rule.min} and ${rule.max}.`;
    }
  }

  if (entry.bp_sys != null && entry.bp_dia != null && entry.bp_sys <= entry.bp_dia) {
    return 'Systolic BP must be greater than diastolic BP.';
  }

  return '';
}

// --------------- API helpers -------------------------------------------------

async function loadVitals(pid) {
  // TODO: GET /s/handoff/api/patients/<pid>/vitals
  // On success: set activeVitals = data.vitals and call renderVitalsPanel()
  const requestId = ++latestVitalsRequestId;
  if (!pid) {
    activeVitals = [];
    activeVitalsPatientId = '';
    vitalsLoading = false;
    renderVitalsPanel();
    return;
  }
  activeVitalsPatientId = pid;
  try {
    vitalsLoading = true;
    activeVitals = [];
    renderVitalsPanel();
    const res = await fetch(`/s/handoff/api/patients/${pid}/vitals`);
    if (!res.ok) throw new Error(`Vitals fetch failed (${res.status})`);
    const data = await res.json();
    if (requestId !== latestVitalsRequestId) return;
    activeVitals = data.vitals || [];
    activeVitalsPatientId = pid;
  } catch (e) {
    if (requestId !== latestVitalsRequestId) return;
    activeVitals = [];
    console.warn('[vitals] loadVitals error:', e.message);
  } finally {
    if (requestId !== latestVitalsRequestId) return;
    vitalsLoading = false;
    renderVitalsPanel();
  }
}

async function logVitals(pid, entry) {
  // TODO: POST /s/handoff/api/patients/<pid>/vitals
  // entry: object with any subset of vital fields
  // On success: prepend returned entry to activeVitals and re-render
  latestVitalsRequestId += 1;
  const res = await fetch(`/s/handoff/api/patients/${pid}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log vitals');
  }
  const data = await res.json();
  activeVitals = [data.entry, ...activeVitals];
  renderVitalsPanel();
  return data.entry;
}

async function deleteVitalsEntry(pid, entryId) {
  // TODO: DELETE /s/handoff/api/patients/<pid>/vitals/<entryId>
  latestVitalsRequestId += 1;
  const res = await fetch(`/s/handoff/api/patients/${pid}/vitals/${entryId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete vitals entry');
  activeVitals = activeVitals.filter(e => e.id !== entryId);
  renderVitalsPanel();
}

// --------------- Chart helpers -----------------------------------------------

function buildVitalsSparkline(fieldKey, entries) {
  // TODO: build an SVG sparkline for the given field using the same pattern as
  // the existing lab charts in portal-patient-context.js (pc-chart-svg, pc-chart-point, etc.)
  // Returns an HTML string or '' if fewer than 2 datapoints exist.
  const field = getVitalsFieldConfig(fieldKey);
  const series = buildVitalsSeries(fieldKey, entries);
  if (!field || series.length < 2) return '';

  const values = series.map((point) => point.value);
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
  const pointData = series.map((point, index) => {
    const x = axisLeft + (plotWidth * index) / Math.max(series.length - 1, 1);
    const y = height - axisBottom - (((point.value - min) / spread) * plotHeight);
    return {
      x,
      y,
      label: `${point.timestamp}: ${point.display}`,
    };
  });
  const points = pointData.map((point) => `${point.x},${point.y}`).join(' ');
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const badgeText = getVitalBadgeText(fieldKey, latest.value);
  const badgeTone = getVitalTone(fieldKey, latest.value);
  const deltaText = previous
    ? `${latest.value >= previous.value ? '+' : ''}${Math.round((latest.value - previous.value) * 10) / 10}`
    : 'First available';
  const deltaClass = getVitalsTrendClass(fieldKey, latest.value, previous ? previous.value : undefined);
  const tooltip = `<div class="pc-chart-tooltip${badgeText ? ' has-badge' : ''}" aria-hidden="true"><div class="pc-chart-tooltip-time">${escapeVitalsHtml(series[0].timestamp)}</div><div class="pc-chart-tooltip-value">${escapeVitalsHtml(series[0].display)}</div></div>`;
  const axis = `<div class="pc-chart-axis"><span>${escapeVitalsHtml(series[0].timestamp)}</span><span>${escapeVitalsHtml(latest.timestamp)}</span></div>`;

  return `<div class="pc-chart-card pc-vitals-chart-card">
    <div class="pc-chart-top">
      <div>
        <div class="pc-chart-kicker">Vitals</div>
        <div class="pc-chart-title">${escapeVitalsHtml(field.label)}</div>
      </div>
      <div class="pc-chart-side">${badgeText ? `<span class="pc-badge ${badgeTone}">${escapeVitalsHtml(badgeText)}</span>` : ''}</div>
    </div>
    <div class="pc-chart-value">${escapeVitalsHtml(latest.display)}</div>
    <div class="pc-chart-meta"><span class="${deltaClass}">${escapeVitalsHtml(deltaText)}</span> vs prior</div>
    ${tooltip}
    <svg class="pc-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeVitalsHtml(`${field.label} trendline`)}" data-plot-left="${axisLeft}" data-plot-right="${width - axisRight}" data-plot-top="${axisTop}" data-plot-bottom="${height - axisBottom}">
      ${tickValues.map((tickValue) => {
        const y = height - axisBottom - (((tickValue - min) / spread) * plotHeight);
        return `<g>
          <line x1="${axisLeft}" y1="${y}" x2="${width - axisRight}" y2="${y}" stroke="rgba(100,116,139,0.12)" stroke-width="1"></line>
          <text x="${axisLeft - 6}" y="${y + 3}" text-anchor="end" fill="var(--text-dim)" font-size="8">${escapeVitalsHtml(formatTick(tickValue))}</text>
        </g>`;
      }).join('')}
      <line x1="${axisLeft}" y1="${axisTop}" x2="${axisLeft}" y2="${height - axisBottom}" stroke="rgba(100,116,139,0.22)" stroke-width="1"></line>
      <line x1="${axisLeft}" y1="${height - axisBottom}" x2="${width - axisRight}" y2="${height - axisBottom}" stroke="rgba(100,116,139,0.22)" stroke-width="1"></line>
      <line class="pc-chart-crosshair" x1="${pointData[0].x}" y1="${axisTop}" x2="${pointData[0].x}" y2="${height - axisBottom}" visibility="hidden"></line>
      <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${pointData.map((point, index) => `
        <circle class="pc-chart-point" data-point-index="${index}" data-point-label="${escapeVitalsHtml(point.label)}" cx="${point.x}" cy="${point.y}" r="3" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"></circle>
      `).join('')}
      <circle class="pc-chart-active-point" cx="${pointData[0].x}" cy="${pointData[0].y}" r="5" visibility="hidden"></circle>
      <rect class="pc-chart-hover-zone" x="${axisLeft}" y="${axisTop}" width="${plotWidth}" height="${plotHeight}" rx="8" ry="8" fill="transparent" stroke="none" pointer-events="all"></rect>
    </svg>
    ${axis}
  </div>`;
}

// --------------- Render ------------------------------------------------------

function renderVitalsTables(vitals) {
  // TODO: render a compact table of recent vitals (last 10 entries).
  // Columns: Timestamp | BP | HR | RR | SpO2 | Temp | GCS | UO | Glucose | Note
  // Apply color coding per getVitalTone().
  if (!vitals.length) return vitalsLoading ? '<div class="pc-empty">Loading vitals…</div>' : '<div class="pc-empty">No vitals logged yet.</div>';

  const rows = vitals.slice(0, 10).map(e => {
    const ts = formatVitalsTimestamp(e.timestamp) || '—';
    const bp = (e.bp_sys != null || e.bp_dia != null) ? `${e.bp_sys != null ? e.bp_sys : '—'}/${e.bp_dia != null ? e.bp_dia : '—'}` : '—';
    const toneClass = (key, value) => {
      const tone = getVitalTone(key, value);
      return tone ? `pc-badge ${tone}` : '';
    };
    return `<tr>
      <td style="font-size:0.65rem;color:var(--text-dim);">${escapeVitalsHtml(ts)}</td>
      <td>${escapeVitalsHtml(bp)}</td>
      <td>${e.hr != null ? `<span class="${toneClass('hr', e.hr)}">${escapeVitalsHtml(String(e.hr))}</span>` : '—'}</td>
      <td>${e.rr != null ? escapeVitalsHtml(String(e.rr)) : '—'}</td>
      <td>${e.spo2 != null ? `<span class="${toneClass('spo2', e.spo2)}">${escapeVitalsHtml(String(e.spo2))}%</span>` : '—'}</td>
      <td>${e.temp != null ? `<span class="${toneClass('temp', e.temp)}">${escapeVitalsHtml(String(e.temp))}</span>` : '—'}</td>
      <td>${e.gcs != null ? `<span class="${toneClass('gcs', e.gcs)}">${escapeVitalsHtml(String(e.gcs))}</span>` : '—'}</td>
      <td>${e.urine_out_ml != null ? escapeVitalsHtml(String(e.urine_out_ml)) : '—'}</td>
      <td>${e.glucose != null ? `<span class="${toneClass('glucose', e.glucose)}">${escapeVitalsHtml(String(e.glucose))}</span>` : '—'}</td>
      <td style="text-align:left;color:var(--text-dim);">${escapeVitalsHtml(e.note || '—')}</td>
    </tr>`;
  }).join('');

  return `<table class="pc-vitals-table">
    <thead><tr><th>Time</th><th>BP</th><th>HR</th><th>RR</th><th>SpO2</th><th>Temp</th><th>GCS</th><th>UO</th><th>Gluc</th><th>Note</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderVitalsEntryForm(pid) {
  // TODO: render a compact entry form with inputs for each vital field,
  // a datetime input defaulting to now, a note field, and a "Log" button.
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `
    <div class="pc-vitals-form" id="pc-vitals-form">
      <div class="pc-vitals-form-row">
        <label>BP sys</label><input type="number" id="v-bp-sys" placeholder="120" min="50" max="300">
        <label>BP dia</label><input type="number" id="v-bp-dia" placeholder="80" min="30" max="200">
        <label>HR</label><input type="number" id="v-hr" placeholder="80" min="20" max="300">
        <label>RR</label><input type="number" id="v-rr" placeholder="16" min="4" max="60">
        <label>SpO2%</label><input type="number" id="v-spo2" placeholder="98" min="50" max="100">
      </div>
      <div class="pc-vitals-form-row">
        <label>Temp°C</label><input type="number" id="v-temp" placeholder="37.0" step="0.1" min="30" max="42">
        <label>GCS</label><input type="number" id="v-gcs" placeholder="15" min="3" max="15">
        <label>UO ml/h</label><input type="number" id="v-uo" placeholder="50" min="0">
        <label>Glucose</label><input type="number" id="v-glucose" placeholder="100" min="20" max="800">
      </div>
      <div class="pc-vitals-form-row">
        <label>Time</label><input type="datetime-local" id="v-timestamp" value="${localTimestamp}">
        <label>Note</label><input type="text" id="v-note" placeholder="Optional note" style="flex:2">
        <button class="btn-primary" onclick="handleLogVitals('${pid}')">Log</button>
      </div>
      <div class="pc-vitals-status" id="pc-vitals-status"></div>
    </div>`;
}

function renderVitalsPanel() {
  // TODO: update #pc-vitals-panel in the DOM.
  // This is called after load, log, or delete.
  const el = document.getElementById('pc-vitals-panel');
  if (!el) return;

  const chartCards = VITAL_FIELDS.map((f) => buildVitalsSparkline(f.key, activeVitals)).filter(Boolean);
  const chartBlock = chartCards.length ? `<div class="pc-vitals-charts">${chartCards.join('')}</div>` : '';
  const trendNotice = !chartCards.length && activeVitals.length ? '<div class="pc-empty">No two-point vital trends yet. Add a second measurement to see charts.</div>' : '';
  el.innerHTML = `
    ${chartBlock}
    ${trendNotice}
    ${renderVitalsTables(activeVitals)}`;

  if (typeof bindPatientContextChartTooltips === 'function') {
    bindPatientContextChartTooltips(el);
  }
  if (typeof renderDailyRoundingChecklistPanel === 'function') {
    renderDailyRoundingChecklistPanel();
  }
}

// --------------- Event handler -----------------------------------------------

async function handleLogVitals(pid) {
  const entry = {};
  const get = (id) => getVitalsInputValue(id);

  const bpSys = parseVitalsNumber(get('v-bp-sys'));
  const bpDia = parseVitalsNumber(get('v-bp-dia'));
  if (bpSys != null) entry.bp_sys = bpSys;
  if (bpDia != null) entry.bp_dia = bpDia;
  const hr  = parseVitalsNumber(get('v-hr'));  if (hr != null)  entry.hr  = hr;
  const rr  = parseVitalsNumber(get('v-rr'));  if (rr != null)  entry.rr  = rr;
  const spo2 = parseVitalsNumber(get('v-spo2')); if (spo2 != null) entry.spo2 = spo2;
  const temp = parseVitalsNumber(get('v-temp')); if (temp != null) entry.temp = temp;
  const gcs  = parseVitalsNumber(get('v-gcs'));  if (gcs != null)  entry.gcs  = gcs;
  const uo   = parseVitalsNumber(get('v-uo'));   if (uo != null)   entry.urine_out_ml = uo;
  const gluc = parseVitalsNumber(get('v-glucose')); if (gluc != null) entry.glucose = gluc;
  const ts   = get('v-timestamp'); if (ts) entry.timestamp = ts;
  const note = get('v-note');      if (note) entry.note = note;

  const validationError = validateVitalsEntry(entry);
  if (validationError) {
    setVitalsStatus(validationError, 'error');
    return;
  }

  try {
    setVitalsStatus('Logging...', 'info');
    await logVitals(pid, entry);
    setVitalsStatus('Logged.', 'success');
    // clear form inputs
    ['v-bp-sys','v-bp-dia','v-hr','v-rr','v-spo2','v-temp','v-gcs','v-uo','v-glucose','v-note'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  } catch (e) {
    setVitalsStatus(e.message, 'error');
  }
}

if (typeof window !== 'undefined') {
  window.__vitalsTestApi = {
    buildVitalsSparkline,
    buildVitalsSeries,
    renderVitalsPanel,
    renderVitalsTables,
    renderVitalsEntryForm,
    loadVitals,
    getVitalTone,
  };
}

// --------------- Integration -------------------------------------------------
//
// In portal-patient-context.js, renderPatientContextWorkspace() should:
// 1. Include a <section class="pc-page-card"> in the right column with:
//      <div class="pc-page-card-title">Vitals</div>
//      <div id="pc-vitals-panel">...</div>  (entry form top, table below)
// 2. After setting innerHTML, call loadVitals(activePatientId).
//
// The entry form is injected separately above the panel via renderVitalsEntryForm().
