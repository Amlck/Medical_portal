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

function getActiveSinceLastReviewExtras() {
  const pid = activePatientContext && activePatientContext.id ? activePatientContext.id : activePatientId;
  const vitalsMatch = typeof activeVitalsPatientId === 'undefined' || !activeVitalsPatientId || activeVitalsPatientId === pid;
  const pendingMatch = typeof activePendingPatientId === 'undefined' || !activePendingPatientId || activePendingPatientId === pid;
  const ioMatch = typeof activeIoPatientId === 'undefined' || !activeIoPatientId || activeIoPatientId === pid;
  return {
    vitals: vitalsMatch && typeof activeVitals !== 'undefined' && Array.isArray(activeVitals) ? activeVitals : [],
    pending: pendingMatch && typeof activePendingItems !== 'undefined' && Array.isArray(activePendingItems) ? activePendingItems : [],
    io: ioMatch && typeof activeIoItems !== 'undefined' && Array.isArray(activeIoItems) ? activeIoItems : [],
  };
}

function markActivePatientSeen() {
  if (!activePatientContext || !activePatientContext.id) return;
  setPatientLastSeenAt(activePatientContext.id, new Date().toISOString());
  renderPatientContextDrawer();
  renderPatientContextWorkspace();
  if (typeof renderWardBoard === 'function' && typeof wardState !== 'undefined' && wardState && Array.isArray(wardState.patients)) {
    renderWardBoard(wardState.patients, wardState.dataMap || {}, wardState.sortKey || 'risk');
  }
}

const PATIENT_CONTEXT_WORKSPACE_SECTION_STORAGE_KEY = 'medical-portal-patient-context-section';
const PATIENT_CONTEXT_WORKSPACE_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'course', label: 'Course' },
  { id: 'labs', label: 'Labs' },
  { id: 'tasks', label: 'Meds & Tasks' },
];

let patientContextWorkspaceSection = (() => {
  try {
    const stored = localStorage.getItem(PATIENT_CONTEXT_WORKSPACE_SECTION_STORAGE_KEY);
    return PATIENT_CONTEXT_WORKSPACE_SECTIONS.some((section) => section.id === stored) ? stored : 'overview';
  } catch (err) {
    return 'overview';
  }
})();

function getPatientContextWorkspaceSection(section) {
  const candidate = section || patientContextWorkspaceSection || 'overview';
  return PATIENT_CONTEXT_WORKSPACE_SECTIONS.some((item) => item.id === candidate) ? candidate : 'overview';
}

function setPatientContextWorkspaceSection(section) {
  patientContextWorkspaceSection = getPatientContextWorkspaceSection(section);
  try {
    localStorage.setItem(PATIENT_CONTEXT_WORKSPACE_SECTION_STORAGE_KEY, patientContextWorkspaceSection);
  } catch (err) {
    // Ignore storage failures; the current render still updates.
  }
  renderPatientContextWorkspace();
}

function renderPatientContextWorkspaceNav(activeSection) {
  const active = getPatientContextWorkspaceSection(activeSection);
  return `<div class="pc-workspace-tabs" role="tablist" aria-label="Patient context sections">
    ${PATIENT_CONTEXT_WORKSPACE_SECTIONS.map((section) => `
      <button
        class="pc-workspace-tab${section.id === active ? ' active' : ''}"
        role="tab"
        aria-selected="${section.id === active ? 'true' : 'false'}"
        onclick="setPatientContextWorkspaceSection('${section.id}')"
      >${escPatientContextHtml(section.label)}</button>
    `).join('')}
  </div>`;
}

// ---------------------------------------------------------------------------
// Alert mute menu — floating singleton dropdown attached to body
// ---------------------------------------------------------------------------

function _closeMuteMenu() {
  const menu = document.getElementById('pc-mute-menu');
  if (menu) menu.style.display = 'none';
}

function _applyMuteAndRefresh(fn) {
  fn();
  _closeMuteMenu();
  // Re-render the "What matters today" section without a full network fetch
  if (typeof renderPatientContextWorkspace === 'function') renderPatientContextWorkspace();
  if (typeof renderPatientContextDrawer === 'function') renderPatientContextDrawer();
}

function getInsightTooltipAttrs(insight) {
  const criteria = typeof getInsightCriteriaText === 'function' ? getInsightCriteriaText(insight) : '';
  if (!criteria) return '';
  return ` data-criteria="${escPatientContextHtml(criteria)}" onmouseenter="showInsightCriteria(this)" onmouseleave="hideInsightCriteria()"`;
}

function renderInsightBasisHtml(insight, compact = false) {
  if (!shouldShowInlineInsightBasis(insight)) return '';
  const criteria = typeof getInsightCriteriaText === 'function' ? getInsightCriteriaText(insight) : '';
  if (!criteria) return '';
  return `<details class="pc-insight-basis${compact ? ' compact' : ''}">
    <summary>Basis</summary>
    <div>${escPatientContextHtml(criteria)}</div>
  </details>`;
}

function renderMissingDataTodoButton(context, insight) {
  if (!context || !insight || insight.kind !== 'missing_monitoring_data') return '';
  return `<div class="pc-insight-actions">
    <button class="btn-secondary btn-sm pc-create-task-btn" type="button" data-pid="${escPatientContextHtml(context.id || '')}" data-alert-key="${escPatientContextHtml(insight.key || '')}" onclick="handleMissingDataTodoCreateFromButton(this)">Create task</button>
  </div>`;
}

function shouldShowInlineInsightBasis(insight) {
  if (!insight) return false;
  if (insight.basisVisibility === 'inline') return true;
  if (insight.kind === 'medication_lab_mismatch') return true;
  if (insight.kind === 'user_defined_lab_rule') return true;
  const title = String(insight.title || '');
  return /sepsis|septic|shock|disseminated intravascular|DIC|cholangitis|tumou?r lysis|haemophagocytic|HLH|microangiopathic|rhabdomyolysis|acute hepatocellular injury|hyperkalemia medication stack|AKI \+ nephrotoxin|bleeding risk stack|QT\/electrolyte|DKA|HHS|digoxin toxicity/i.test(title);
}

// ---------------------------------------------------------------------------
// Criteria hover tooltip — singleton fixed-position div (same pattern as ward panel tooltip)
// ---------------------------------------------------------------------------
function showInsightCriteria(el) {
  let tip = document.getElementById('pc-criteria-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'pc-criteria-tooltip';
    document.body.appendChild(tip);
  }
  tip.textContent = el.dataset.criteria || '';
  tip.style.display = 'block';

  const rect = el.getBoundingClientRect();
  const tipW = 280;
  const gap  = 6;

  // Prefer below the card; fall back to above if insufficient space
  let top = rect.bottom + gap + window.scrollY;
  if (rect.bottom + gap + 80 > window.innerHeight) {
    top = rect.top - gap - tip.offsetHeight + window.scrollY;
  }

  let left = rect.left + window.scrollX;
  if (left + tipW > window.innerWidth - 8) {
    left = window.innerWidth - tipW - 8;
  }

  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top  = `${top}px`;
}

function hideInsightCriteria() {
  const tip = document.getElementById('pc-criteria-tooltip');
  if (tip) tip.style.display = 'none';
}

function toggleInsightMuteMenu(btn) {
  // Read values from data attributes — avoids quote-collision in onclick strings
  const title = btn.dataset.title || '';
  const pid   = btn.dataset.pid   || '';
  const latestLabTs = btn.dataset.labts || '';

  let menu = document.getElementById('pc-mute-menu');
  // Toggle off if the same alert's button is clicked again
  if (menu && menu.style.display !== 'none' && menu.dataset.activeTitle === title && menu.dataset.activePid === pid) {
    _closeMuteMenu();
    return;
  }
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'pc-mute-menu';
    menu.className = 'pc-mute-menu';
    document.body.appendChild(menu);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#pc-mute-menu') && !e.target.closest('.pc-mute-btn')) _closeMuteMenu();
    }, true);
  }

  const isMuted    = typeof isAlertMuted === 'function' && isAlertMuted(pid, title, latestLabTs);
  const isTypeMuted = typeof isAlertMuted === 'function' && isAlertMuted('*', title, latestLabTs);

  // Menu items store their payload as data-* attributes too — no inline string escaping needed
  menu.innerHTML = `
    <div class="pc-mute-menu-section">This alert</div>
    ${isMuted
      ? `<button class="pc-mute-menu-item" data-action="unmute-instance" data-pid="${escPatientContextHtml(pid)}" data-title="${escPatientContextHtml(title)}">Unmute</button>`
      : `<button class="pc-mute-menu-item" data-action="mute-instance" data-mode="today"     data-pid="${escPatientContextHtml(pid)}" data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Mute today</button>
         <button class="pc-mute-menu-item" data-action="mute-instance" data-mode="next_labs" data-pid="${escPatientContextHtml(pid)}" data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Until next labs</button>
         <button class="pc-mute-menu-item" data-action="mute-instance" data-mode="always"    data-pid="${escPatientContextHtml(pid)}" data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Always</button>`
    }
    <div class="pc-mute-menu-sep"></div>
    <div class="pc-mute-menu-section">All patients</div>
    ${isTypeMuted
      ? `<button class="pc-mute-menu-item" data-action="unmute-type" data-title="${escPatientContextHtml(title)}">Unmute for all</button>`
      : `<button class="pc-mute-menu-item" data-action="mute-type" data-mode="today"     data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Mute type today</button>
         <button class="pc-mute-menu-item" data-action="mute-type" data-mode="next_labs" data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Until next labs</button>
         <button class="pc-mute-menu-item" data-action="mute-type" data-mode="always"    data-title="${escPatientContextHtml(title)}" data-labts="${escPatientContextHtml(latestLabTs)}">Always</button>`
    }
  `;
  menu.dataset.activeTitle = title;
  menu.dataset.activePid   = pid;

  // Delegate clicks inside the menu via a single listener on the menu element
  menu.onclick = (e) => {
    const item = e.target.closest('.pc-mute-menu-item');
    if (!item) return;
    const action  = item.dataset.action;
    const t       = item.dataset.title  || '';
    const p       = item.dataset.pid    || '';
    const mode    = item.dataset.mode   || '';
    const labts   = item.dataset.labts  || '';
    if (action === 'mute-instance'   && typeof muteAlert      === 'function') muteAlert(p, t, mode, labts);
    if (action === 'unmute-instance' && typeof unmuteAlert    === 'function') unmuteAlert(p, t);
    if (action === 'mute-type'       && typeof muteAlertType  === 'function') muteAlertType(t, mode, labts);
    if (action === 'unmute-type'     && typeof unmuteAlertType === 'function') unmuteAlertType(t);
    _applyMuteAndRefresh(() => {});   // storage already updated above; just re-render
  };

  const rect = btn.getBoundingClientRect();
  menu.style.display = 'block';
  menu.style.top  = `${rect.bottom + 6}px`;
  menu.style.left = `${Math.max(4, rect.right - 200)}px`;
}


function buildPatientContextClipboardSummary(context) {
  if (!context) return '';
  const latest = context.latestLabs || {};
  const labParts = ['Cr', 'eGFR', 'K', 'Na', 'Hgb', 'Plt', 'WBC', 'CRP']
    .filter((key) => latest[key] !== undefined)
    .map((key) => `${key} ${latest[key]}`);
  const insightLines = getPatientContextAlertItems(context).slice(0, 4).map((item) => `- ${item.title}: ${item.body}`);
  const eventLines = (context.recentEntries || []).slice(0, 3).map((entry) => `- ${entry.timestamp} ${entry.category}: ${entry.title}`);
  const medicationLines = (context.medications && context.medications.current ? context.medications.current : [])
    .slice(0, 5)
    .map((item) => `- ${item.name}${formatStructuredMedicationSig(item) ? ` ${formatStructuredMedicationSig(item)}` : ''}${item.status && item.status !== 'active' ? ` [${item.status}]` : ''}`);
  const problemLines = (context.problems || [])
    .slice(0, 5)
    .map((item, index) => `- P${index + 1} ${item.title} (${item.status || 'active'}): ${item.plan || item.assessment || '[not documented]'}`);

  return [
    `${context.name} (${context.id || '-'})`,
    `Diagnosis: ${context.dx || '-'}`,
    `Admitted: ${context.admitted || '-'}`,
    `Last Updated: ${context.lastUpdatedLabel || '-'}`,
    `Latest Labs: ${context.lastLabTimestamp || '-'}`,
    labParts.length ? `Key Labs: ${labParts.join(' · ')}` : 'Key Labs: none available',
    insightLines.length ? 'What Matters Today:' : 'What Matters Today: no active warn/danger rule-based alerts',
    insightLines.join('\n'),
    medicationLines.length ? 'Current Structured Medications:' : 'Current Structured Medications: none available',
    medicationLines.join('\n'),
    problemLines.length ? 'Active Problems:' : 'Active Problems: none available',
    problemLines.join('\n'),
    eventLines.length ? 'Recent Important Events:' : 'Recent Important Events: none available',
    eventLines.join('\n'),
  ].filter(Boolean).join('\n');
}

function getActiveHandoffReportExtras() {
  const pid = activePatientContext && activePatientContext.id ? activePatientContext.id : activePatientId;
  const vitalsMatch = typeof activeVitalsPatientId === 'undefined' || !activeVitalsPatientId || activeVitalsPatientId === pid;
  const pendingMatch = typeof activePendingPatientId === 'undefined' || !activePendingPatientId || activePendingPatientId === pid;
  const metaMatch = typeof activePatientMetaPatientId === 'undefined' || !activePatientMetaPatientId || activePatientMetaPatientId === pid;
  const ioMatch = typeof activeIoPatientId === 'undefined' || !activeIoPatientId || activeIoPatientId === pid;
  const todoMatch = typeof activeTodoPatientId === 'undefined' || !activeTodoPatientId || activeTodoPatientId === pid;
  return {
    vitals: vitalsMatch && typeof activeVitals !== 'undefined' && Array.isArray(activeVitals) ? activeVitals : [],
    pending: pendingMatch && typeof activePendingItems !== 'undefined' && Array.isArray(activePendingItems) ? activePendingItems : [],
    todos: todoMatch && typeof activePatientTodos !== 'undefined' && Array.isArray(activePatientTodos) ? activePatientTodos : [],
    meta: metaMatch && typeof activePatientMeta !== 'undefined' && activePatientMeta ? activePatientMeta : null,
    io: ioMatch && typeof activeIoItems !== 'undefined' && Array.isArray(activeIoItems) ? activeIoItems : [],
  };
}

function getHandoffCodeStatusLabel(status) {
  const labels = {
    full: 'Full Code',
    dnr: 'DNR',
    dnr_dni: 'DNR-DNI',
    comfort: 'Comfort',
    unknown: 'Unknown',
  };
  return labels[status || 'unknown'] || labels.unknown;
}

function formatHandoffVitalLine(entry) {
  if (!entry) return '';
  const parts = [
    entry.bp_sys != null || entry.bp_dia != null ? `BP ${entry.bp_sys != null ? entry.bp_sys : '-'}/${entry.bp_dia != null ? entry.bp_dia : '-'}` : '',
    entry.hr != null ? `HR ${entry.hr}` : '',
    entry.rr != null ? `RR ${entry.rr}` : '',
    entry.spo2 != null ? `SpO2 ${entry.spo2}%` : '',
    entry.temp != null ? `T ${entry.temp}` : '',
    entry.gcs != null ? `GCS ${entry.gcs}` : '',
    entry.urine_out_ml != null ? `UO ${entry.urine_out_ml} mL` : '',
    entry.glucose != null ? `Glu ${entry.glucose}` : '',
  ].filter(Boolean);
  const flags = [
    entry.spo2 != null && Number(entry.spo2) < 94 ? 'low SpO2' : '',
    entry.hr != null && (Number(entry.hr) > 120 || Number(entry.hr) < 50) ? 'HR watch' : '',
    entry.temp != null && Number(entry.temp) > 38.3 ? 'fever' : '',
    entry.gcs != null && Number(entry.gcs) < 13 ? 'low GCS' : '',
    entry.glucose != null && (Number(entry.glucose) < 70 || Number(entry.glucose) >= 180) ? 'glucose watch' : '',
  ].filter(Boolean);
  const prefix = entry.timestamp ? `${entry.timestamp}: ` : '';
  const suffix = flags.length ? ` [${flags.join(', ')}]` : '';
  const note = entry.note ? ` (${entry.note})` : '';
  return parts.length ? `${prefix}${parts.join(', ')}${suffix}${note}` : '';
}

function formatHandoffLabLine(entry) {
  const labs = entry && entry.labs ? entry.labs : {};
  const keys = ['Cr', 'eGFR', 'K', 'Na', 'HCO3', 'WBC', 'ANC', 'Hgb', 'Plt', 'CRP', 'INR', 'TBili'];
  const parts = keys.filter((key) => labs[key] !== undefined).map((key) => `${key} ${labs[key]}`);
  if (!parts.length) return '';
  return `${entry.timestamp || 'Latest labs'}: ${parts.join(', ')}`;
}

function formatHandoffIoLine(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const totals = { intake: 0, output: 0, count: 0 };
  list.forEach((item) => {
    const ts = item && item.timestamp ? new Date(item.timestamp) : null;
    if (!ts || Number.isNaN(ts.getTime()) || ts < startOfToday || ts > now) return;
    const amount = Number(item.amount_ml);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const bucket = item.kind === 'output' ? 'output' : 'intake';
    totals[bucket] += amount;
    totals.count += 1;
  });
  if (!totals.count) return '';
  const balance = totals.intake - totals.output;
  const sign = balance > 0 ? '+' : '';
  const fmt = (value) => Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
  return `today in ${fmt(totals.intake)} mL, out ${fmt(totals.output)} mL, balance ${sign}${fmt(balance)} mL`;
}

function formatHandoffMedicationLine(item) {
  const sig = formatStructuredMedicationSig(item);
  const status = item && item.status && item.status !== 'active' ? ` [${item.status}]` : '';
  const started = item && item.started_at ? ` start ${item.started_at}` : '';
  return `${item && item.name ? item.name : 'Unnamed medication'}${sig ? ` ${sig}` : ''}${status}${started}`;
}

function formatHandoffAntibioticLine(item) {
  if (!item) return '';
  const sig = item.sig ? ` ${item.sig}` : '';
  const started = item.startDate ? `, started ${item.startDate}` : '';
  return `${item.name}${sig} - ${item.dayLabel}${started}`;
}

function formatHandoffPendingLine(item) {
  const due = item && item.due_hint ? `; due ${item.due_hint}` : '';
  const created = item && item.created_at ? `; added ${item.created_at}` : '';
  return `${item && item.category ? item.category : 'Other'}: ${item && item.description ? item.description : 'pending item'}${due}${created}`;
}

function formatHandoffTodoLine(item) {
  if (!item) return '';
  const priority = item.priority && item.priority !== 'normal' ? `${item.priority} priority; ` : '';
  const due = item.due_at ? `; due ${item.due_at}` : '';
  const note = item.note ? `; note: ${item.note}` : '';
  return `${priority}${item.title || 'untitled task'}${due}${note}`;
}

function buildHandoffReportText(context, extras = {}) {
  if (!context) return '';
  const meta = extras.meta || {};
  const vitals = Array.isArray(extras.vitals) ? extras.vitals : [];
  const pendingItems = Array.isArray(extras.pending) ? extras.pending : [];
  const todoItems = Array.isArray(extras.todos) ? extras.todos : [];
  const ioItems = Array.isArray(extras.io) ? extras.io : [];
  const activePending = pendingItems.filter((item) => item.status === 'pending');
  const activeTodos = todoItems.filter((item) => item.patient_id === context.id && item.status !== 'done');
  const latestVitalsLine = formatHandoffVitalLine(vitals[0]);
  const ioLine = formatHandoffIoLine(ioItems);
  const latestLabLine = formatHandoffLabLine((context.timeline || [])[Math.max((context.timeline || []).length - 1, 0)]);
  const alertLines = getPatientContextAlertItems(context)
    .slice(0, 5)
    .map((item) => `- [${item.tone === 'danger' ? 'danger' : 'watch'}] ${item.title}: ${item.body}`);
  const problems = Array.isArray(context.problems) ? context.problems : [];
  const problemLines = problems.slice(0, 6).map((item, index) => {
    const plan = item.plan || item.assessment || '[no assessment/plan documented]';
    return `- P${index + 1} ${item.title || 'Untitled problem'} (${item.status || 'active'}): ${plan}`;
  });
  const meds = normalizeStructuredMedications(context.medications);
  const antibioticDays = Array.isArray(context.antibioticDays) ? context.antibioticDays : (typeof buildAntibioticDayCounters === 'function' ? buildAntibioticDayCounters(meds) : []);
  const activeMeds = meds.current.filter((item) => !item.status || item.status === 'active');
  const inactiveMeds = meds.current.filter((item) => item.status === 'held' || item.status === 'stopped');
  const medLines = activeMeds.slice(0, 8).map((item) => `- ${formatHandoffMedicationLine(item)}`);
  const antibioticLines = antibioticDays.slice(0, 6).map((item) => `- ${formatHandoffAntibioticLine(item)}`);
  const inactiveMedLines = inactiveMeds.slice(0, 4).map((item) => `- ${formatHandoffMedicationLine(item)}`);
  const pendingLines = activePending.slice(0, 6).map((item) => `- ${formatHandoffPendingLine(item)}`);
  const todoLines = (typeof sortTodos === 'function' ? sortTodos(activeTodos) : activeTodos)
    .slice(0, 6)
    .map((item) => `- ${formatHandoffTodoLine(item)}`);
  const recentEventLines = (context.recentEntries || []).slice(0, 4).map((entry) => `- ${entry.timestamp} ${entry.category}: ${entry.title}`);
  const medicationDiff = context.medicationDiff || {};
  const medicationChangeLines = [
    ...(medicationDiff.added || []).slice(0, 3).map((line) => `- Added: ${line}`),
    ...(medicationDiff.heldStopped || []).slice(0, 3).map((line) => `- Held/stopped: ${line}`),
    ...(medicationDiff.doseChanged || []).slice(0, 3).map((line) => `- Dose changed: ${line}`),
  ];

  return [
    `Handoff Report - ${context.name || 'Unknown patient'} (${context.id || '-'})`,
    `Dx: ${context.dx || '-'}`,
    `Admitted: ${context.admitted || '-'}${context.age ? ` | ${context.age}${context.sex || ''}` : ''}`,
    `Code Status: ${getHandoffCodeStatusLabel(meta.code_status)}${meta.code_status_date ? ` (confirmed ${meta.code_status_date})` : ''}`,
    `Last chart update: ${context.lastUpdatedLabel || '-'}`,
    '',
    'Situation',
    `- Latest labs: ${latestLabLine || 'none available'}`,
    `- Latest vitals: ${latestVitalsLine || 'none logged'}`,
    `- I/O: ${ioLine || 'none logged today'}`,
    '',
    alertLines.length ? 'Watch Items' : 'Watch Items: no active warn/danger rule-based alerts',
    alertLines.join('\n'),
    '',
    problemLines.length ? 'Active Problems' : 'Active Problems: none documented',
    problemLines.join('\n'),
    '',
    medLines.length ? 'Active Medications' : 'Active Medications: none documented',
    medLines.join('\n'),
    antibioticLines.length ? 'Antibiotic Days' : '',
    antibioticLines.join('\n'),
    inactiveMedLines.length ? 'Held / Stopped Medications' : '',
    inactiveMedLines.join('\n'),
    medicationChangeLines.length ? 'Recent Medication Changes' : '',
    medicationChangeLines.join('\n'),
    '',
    pendingLines.length ? `Pending Results (${activePending.length})` : 'Pending Results: none pending',
    pendingLines.join('\n'),
    '',
    todoLines.length ? `Patient Todos (${activeTodos.length})` : 'Patient Todos: none open',
    todoLines.join('\n'),
    '',
    recentEventLines.length ? 'Recent Events' : 'Recent Events: none found',
    recentEventLines.join('\n'),
    '',
    'Generated from structured fields and timestamped chart data only.',
  ].filter((line) => line !== '').join('\n');
}

function formatWeeklySummaryText(context) {
  const weekly = context && context.weeklySummary;
  if (!weekly) return '';
  const eventLines = (weekly.keyEvents || []).map((entry) => `- ${entry.timestamp} ${entry.category}: ${entry.title}`);
  const labLines = (weekly.labChanges || []).map((line) => `- ${line}`);
  const alertLines = (weekly.currentAlerts || []).map((item) => `- ${item.title}: ${item.body}`);
  const medLines = [
    ...(weekly.medicationDiff && weekly.medicationDiff.added ? weekly.medicationDiff.added.map((line) => `- Added: ${line}`) : []),
    ...(weekly.medicationDiff && weekly.medicationDiff.heldStopped ? weekly.medicationDiff.heldStopped.map((line) => `- Held/stopped: ${line}`) : []),
    ...(weekly.medicationDiff && weekly.medicationDiff.doseChanged ? weekly.medicationDiff.doseChanged.map((line) => `- Dose changed: ${line}`) : []),
    ...(weekly.renalMedicationAlerts || []).map((item) => `- Safety: ${item.title}`),
    ...(weekly.safetyMedicationAlerts || []).map((item) => `- Safety: ${item.title}`),
  ];
  const problemLines = (weekly.activeProblems || []).map((item, index) => `- P${index + 1} ${item.title}: ${item.plan || item.assessment || item.status || 'active'}`);

  return [
    `Weekly Summary (${weekly.rangeStart} to ${weekly.rangeEnd})`,
    `${context.name} (${context.id || '-'})`,
    `Diagnosis: ${context.dx || '-'}`,
    '',
    eventLines.length ? 'Major Events:' : 'Major Events: none documented in this week window',
    eventLines.join('\n'),
    labLines.length ? 'Lab Course:' : 'Lab Course: no timestamped lab sets in this week window',
    labLines.join('\n'),
    alertLines.length ? 'Current Watch Items:' : 'Current Watch Items: no active warning-level lab alerts',
    alertLines.join('\n'),
    medLines.length ? 'Medication Changes / Safety:' : 'Medication Changes / Safety: no structured changes documented',
    medLines.join('\n'),
    problemLines.length ? 'Active Problems:' : 'Active Problems: none documented',
    problemLines.join('\n'),
  ].filter((line) => line !== '').join('\n');
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

async function copyWeeklySummary() {
  const text = formatWeeklySummaryText(activePatientContext);
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

async function copyHandoffReport() {
  const text = buildHandoffReportText(activePatientContext, getActiveHandoffReportExtras());
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
  const status = document.getElementById('pc-handoff-report-status');
  if (status) {
    status.textContent = 'Copied handoff report.';
    status.className = 'consults-status success';
    setTimeout(() => {
      const current = document.getElementById('pc-handoff-report-status');
      if (current) current.textContent = '';
    }, 2200);
  }
}

async function appendWeeklySummaryToRecord() {
  if (!activePatientContext || !activePatientContext.id) return;
  const text = formatWeeklySummaryText(activePatientContext);
  if (!text.trim()) return;
  const status = document.getElementById('pc-weekly-summary-status');
  if (status) {
    status.textContent = 'Appending...';
    status.className = 'consults-status info';
  }
  try {
    const res = await fetch(`/s/handoff/api/patients/${encodeURIComponent(activePatientContext.id)}/append`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Weekly Summary', content: text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    if (status) {
      status.textContent = 'Appended weekly summary.';
      status.className = 'consults-status success';
    }
    invalidatePatientContextCache(activePatientContext.id);
    refreshActivePatientContext();
  } catch (err) {
    if (status) {
      status.textContent = `Failed: ${err.message}`;
      status.className = 'consults-status error';
    }
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
  const visibleAlerts = getPatientContextAlertItems(context);
  const sinceReview = buildSinceLastReviewSnapshot(context, getActiveSinceLastReviewExtras());
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
        <button class="btn-secondary pc-drawer-cta" onclick="markActivePatientSeen()">Mark Seen</button>
      </div>
    </div>
    <div class="pc-section">
      <div class="pc-section-hdr">Since Last Seen</div>
      <div class="pc-section-body">${renderSinceLastReviewCompact(sinceReview)}</div>
    </div>
    <div class="pc-section">
      <div class="pc-section-hdr">What Matters Today</div>
      <div class="pc-section-body">
        ${visibleAlerts.length
          ? `<div class="trend-insights">${visibleAlerts.slice(0, 3).map((insight) => `<div class="trend-insight ${insight.tone}"${getInsightTooltipAttrs(insight)}><strong>${escPatientContextHtml(insight.title)}</strong><div>${escPatientContextHtml(insight.body)}</div>${renderInsightBasisHtml(insight, true)}</div>`).join('')}</div>`
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

function renderSinceLastReviewItems(state, limit = 4) {
  if (!state || !state.hasSeenMarker) {
    return '<div class="pc-empty">Mark seen to start local change tracking on this device.</div>';
  }
  if (!state.items.length) {
    return '<div class="pc-empty">No timestamped changes since you marked this patient seen.</div>';
  }
  return `<div class="pc-since-list">${state.items.slice(0, limit).map((item) => `
    <div class="pc-since-item ${item.tone || 'info'}">
      <div class="pc-since-top"><strong>${escPatientContextHtml(item.label)}</strong><span>${escPatientContextHtml(formatSinceLastReviewLabel(item.timestamp) || item.timestamp || '')}</span></div>
      <div class="pc-since-body">${escPatientContextHtml(item.body || '')}</div>
    </div>
  `).join('')}</div>`;
}

function renderSinceLastReviewCompact(state) {
  const badge = !state || !state.hasSeenMarker
    ? '<span class="pc-badge info">Not started</span>'
    : state.hasChanges
      ? `<span class="pc-badge warn">${escPatientContextHtml(String(state.total || state.items.length))} new</span>`
      : '<span class="pc-badge success">No new changes</span>';
  return `
    <div class="pc-since-compact">
      <div class="pc-since-summary">
        ${badge}
        <span>${escPatientContextHtml(state && state.hasSeenMarker ? `Last seen ${state.lastSeenLabel}` : 'Local to this browser')}</span>
      </div>
      ${renderSinceLastReviewItems(state, 2)}
    </div>`;
}

function renderSinceLastReviewCard(context) {
  const state = buildSinceLastReviewSnapshot(context, getActiveSinceLastReviewExtras());
  const statusBadge = !state.hasSeenMarker
    ? '<span class="pc-badge info">Not started</span>'
    : state.hasChanges
      ? `<span class="pc-badge warn">${escPatientContextHtml(String(state.total || state.items.length))} new</span>`
      : '<span class="pc-badge success">Quiet</span>';
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Since last seen ${statusBadge}</div>
      <div class="pc-page-card-copy">${state.hasSeenMarker ? `Local marker: ${escPatientContextHtml(state.lastSeenLabel)}.` : 'Local-only marker for this browser. It updates only when you click Mark Seen.'}</div>
    </div>
    <div class="pc-page-card-body">
      <div class="pc-since-actions">
        <div class="pc-since-headline">${escPatientContextHtml(state.summaryText)}</div>
        <button class="btn-secondary" onclick="markActivePatientSeen()">Mark Seen</button>
      </div>
      ${renderSinceLastReviewItems(state, 5)}
    </div>
  </section>`;
}

function getActiveRoundingChecklistExtras() {
  const pid = activePatientContext && activePatientContext.id ? activePatientContext.id : activePatientId;
  const vitalsMatch = typeof activeVitalsPatientId === 'undefined' || !activeVitalsPatientId || activeVitalsPatientId === pid;
  const pendingMatch = typeof activePendingPatientId === 'undefined' || !activePendingPatientId || activePendingPatientId === pid;
  const metaMatch = typeof activePatientMetaPatientId === 'undefined' || !activePatientMetaPatientId || activePatientMetaPatientId === pid;
  const ioMatch = typeof activeIoPatientId === 'undefined' || !activeIoPatientId || activeIoPatientId === pid;
  return {
    vitals: vitalsMatch && typeof activeVitals !== 'undefined' && Array.isArray(activeVitals) ? activeVitals : [],
    pending: pendingMatch && typeof activePendingItems !== 'undefined' && Array.isArray(activePendingItems) ? activePendingItems : [],
    meta: metaMatch && typeof activePatientMeta !== 'undefined' && activePatientMeta ? activePatientMeta : null,
    io: ioMatch && typeof activeIoItems !== 'undefined' && Array.isArray(activeIoItems) ? activeIoItems : [],
  };
}

function getRoundingChecklistVitalsItem(vitals) {
  const latest = Array.isArray(vitals) && vitals.length ? vitals[0] : null;
  if (!latest) {
    return { key: 'vitals', tone: 'info', label: 'Vitals', body: 'No structured vitals logged yet.' };
  }
  const flags = [];
  if (latest.bp_sys != null && Number(latest.bp_sys) < 90) flags.push('SBP <90');
  if (latest.spo2 != null && Number(latest.spo2) < 94) flags.push(`SpO2 ${latest.spo2}%`);
  if (latest.hr != null && (Number(latest.hr) > 120 || Number(latest.hr) < 50)) flags.push(`HR ${latest.hr}`);
  if (latest.temp != null && Number(latest.temp) > 38.3) flags.push(`T ${latest.temp}`);
  const hasDanger = (latest.bp_sys != null && Number(latest.bp_sys) < 90)
    || (latest.spo2 != null && Number(latest.spo2) < 90)
    || (latest.hr != null && (Number(latest.hr) > 130 || Number(latest.hr) < 45));
  const tone = hasDanger ? 'danger' : flags.length ? 'warn' : 'success';
  const body = flags.length
    ? `${flags.join(', ')} on latest structured vitals.`
    : 'Latest structured vitals do not trigger watch thresholds.';
  return { key: 'vitals', tone, label: 'Vitals', body };
}

function getRoundingChecklistIoItem(ioItems) {
  const items = Array.isArray(ioItems) ? ioItems : [];
  if (!items.length) {
    return { key: 'io', tone: 'info', label: 'I/O', body: 'No structured I/O entries logged.' };
  }
  const summary = typeof buildIoSummary === 'function' ? buildIoSummary(items) : (() => {
    const now = new Date();
    const start = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const bucket = { intake: 0, output: 0, balance: 0, count: 0 };
    items.forEach((item) => {
      const ts = item && item.timestamp ? new Date(item.timestamp) : null;
      const amount = Number(item && item.amount_ml);
      if (!ts || Number.isNaN(ts.getTime()) || ts < start || ts > now || !Number.isFinite(amount) || amount <= 0) return;
      if (item.kind === 'output') bucket.output += amount;
      else bucket.intake += amount;
      bucket.count += 1;
    });
    bucket.balance = bucket.intake - bucket.output;
    return { last24h: bucket };
  })();
  const bucket = summary ? summary.last24h : null;
  if (!bucket || !bucket.count) {
    return { key: 'io', tone: 'info', label: 'I/O', body: 'I/O exists, but none is within the last 24 hours.' };
  }
  const balance = Math.round(bucket.balance);
  const tone = Math.abs(balance) >= 2000 ? 'warn' : 'success';
  const sign = balance > 0 ? '+' : '';
  return {
    key: 'io',
    tone,
    label: 'I/O',
    body: `Last 24h balance ${sign}${balance} mL (${Math.round(bucket.intake)} in / ${Math.round(bucket.output)} out).`,
  };
}

function buildDailyRoundingChecklist(context, extras = {}) {
  const meta = extras.meta || {};
  const pendingItems = Array.isArray(extras.pending) ? extras.pending : [];
  const activePending = pendingItems.filter((item) => item.status === 'pending');
  const antibioticDays = Array.isArray(context && context.antibioticDays) ? context.antibioticDays : [];
  const renalAlerts = Array.isArray(context && context.renalMedicationAlerts) ? context.renalMedicationAlerts : [];
  const safetyAlerts = Array.isArray(context && context.safetyMedicationAlerts) ? context.safetyMedicationAlerts : [];
  const pendingRisk = typeof summarizePendingFollowUpRisks === 'function' ? summarizePendingFollowUpRisks(activePending) : null;
  const checklist = [];

  const codeStatus = meta.code_status || 'unknown';
  checklist.push({
    key: 'code',
    tone: codeStatus === 'unknown' ? 'warn' : 'success',
    label: 'Code Status',
    body: codeStatus === 'unknown'
      ? 'Confirm code status and surrogate information.'
      : `${getHandoffCodeStatusLabel(codeStatus)}${meta.code_status_date ? ` confirmed ${meta.code_status_date}` : ''}.`,
  });

  checklist.push({
    key: 'pending',
    tone: pendingRisk && pendingRisk.worstTone ? pendingRisk.worstTone : (activePending.length ? 'info' : 'success'),
    label: 'Pending Results',
    body: pendingRisk && pendingRisk.summaryText
      ? pendingRisk.summaryText
      : activePending.length
      ? `${activePending.length} pending: ${activePending.slice(0, 2).map((item) => item.description || item.category || 'pending item').join('; ')}${activePending.length > 2 ? '...' : ''}`
      : 'No structured pending results.',
  });

  if (antibioticDays.length) {
    const primary = antibioticDays[0];
    const hasCultureRisk = pendingRisk && Array.isArray(pendingRisk.items) && pendingRisk.items.some((item) => /culture|blood|urine|sputum|wound/i.test(`${item.category || ''} ${item.description || ''}`));
    const timeoutDue = primary.day != null && primary.day >= 3;
    checklist.push({
      key: 'antibiotics',
      tone: primary.tone === 'danger' || (timeoutDue && hasCultureRisk) ? 'danger' : primary.tone === 'warn' || primary.day == null || timeoutDue ? 'warn' : 'success',
      label: 'Antibiotics',
      body: `${primary.name}: ${primary.dayLabel}${primary.startDate ? `, started ${primary.startDate}` : ''}${antibioticDays.length > 1 ? ` (+${antibioticDays.length - 1} more)` : ''}.${timeoutDue ? ' Day 3 timeout: cultures back, source controlled, narrow/IV-to-PO, duration set?' : ''}`,
    });
  } else {
    checklist.push({
      key: 'antibiotics',
      tone: 'info',
      label: 'Antibiotics',
      body: 'No active structured antibiotics recognized.',
    });
  }

  checklist.push(getRoundingChecklistVitalsItem(extras.vitals));
  checklist.push(getRoundingChecklistIoItem(extras.io));

  checklist.push({
    key: 'renal-meds',
    tone: renalAlerts.some((item) => item.tone === 'danger') ? 'danger' : renalAlerts.length ? 'warn' : 'success',
    label: 'Renal Dosing',
    body: renalAlerts.length
      ? `${renalAlerts.length} renal medication review item${renalAlerts.length === 1 ? '' : 's'}: ${renalAlerts.slice(0, 2).map((item) => item.medicationName || item.title).join(', ')}.`
      : 'No renal medication alerts from current labs.',
  });

  checklist.push({
    key: 'safety-rules',
    tone: safetyAlerts.some((item) => item.tone === 'danger') ? 'danger' : safetyAlerts.some((item) => item.tone === 'warn') ? 'warn' : safetyAlerts.length ? 'info' : 'success',
    label: 'Medication Safety',
    body: safetyAlerts.length
      ? `${safetyAlerts.length} deterministic safety rule${safetyAlerts.length === 1 ? '' : 's'}: ${safetyAlerts.slice(0, 2).map((item) => item.title).join('; ')}.`
      : 'No medication-lab safety mismatches detected.',
  });

  checklist.push({
    key: 'dispo',
    tone: activePending.length || renalAlerts.length || safetyAlerts.length || (antibioticDays.length && antibioticDays.some((item) => item.day == null)) ? 'info' : 'success',
    label: 'Dispo Scan',
    body: activePending.length
      ? 'Pending results may affect discharge or handoff plan.'
      : 'No structured discharge blockers detected from pending/results checklist.',
  });

  return checklist;
}

function renderDailyRoundingChecklistItems(context, extras = {}) {
  const items = buildDailyRoundingChecklist(context, extras);
  return `<div class="pc-rounding-grid">${items.map((item) => `
    <div class="pc-rounding-item ${escPatientContextHtml(item.tone || 'info')}">
      <div class="pc-rounding-top">
        <span class="pc-rounding-dot ${escPatientContextHtml(item.tone || 'info')}"></span>
        <strong>${escPatientContextHtml(item.label)}</strong>
      </div>
      <div class="pc-rounding-body">${escPatientContextHtml(item.body)}</div>
    </div>
  `).join('')}</div>`;
}

function renderDailyRoundingChecklistPanel() {
  const el = document.getElementById('pc-rounding-checklist-panel');
  if (!el || !activePatientContext) return;
  el.innerHTML = renderDailyRoundingChecklistItems(activePatientContext, getActiveRoundingChecklistExtras());
}

function renderDailyRoundingChecklistSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Daily Rounding Checklist</div>
      <div class="pc-page-card-copy">Deterministic scan of code status, pending items, ABX day, vitals, I/O, renal dosing, and discharge blockers.</div>
    </div>
    <div class="pc-page-card-body" id="pc-rounding-checklist-panel">
      ${renderDailyRoundingChecklistItems(context, getActiveRoundingChecklistExtras())}
    </div>
  </section>`;
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

function syncPatientContextWorkspacePanels(pid) {
  const targetPid = pid || null;
  if (typeof loadPatientMeta === 'function') {
    loadPatientMeta(targetPid);
  }
  if (typeof loadPendingItems === 'function') {
    loadPendingItems(targetPid);
  }
  if (typeof loadPatientTodos === 'function') {
    loadPatientTodos(targetPid);
  }
  if (typeof loadWatchRules === 'function') {
    loadWatchRules(targetPid);
  }
  if (typeof loadVitals === 'function') {
    loadVitals(targetPid);
  }
  if (typeof loadIoItems === 'function') {
    loadIoItems(targetPid);
  }
}

function resetPatientContextWorkspacePanels() {
  syncPatientContextWorkspacePanels(null);
}

function renderPatientContextMedicationSafety(context) {
  const currentMeds = context && context.medications && Array.isArray(context.medications.current) ? context.medications.current : [];
  const activeMeds = currentMeds.filter((item) => item.status === 'active');
  const heldStopped = currentMeds.filter((item) => item.status === 'held' || item.status === 'stopped');
  const antibioticDays = Array.isArray(context && context.antibioticDays)
    ? context.antibioticDays
    : (typeof buildAntibioticDayCounters === 'function' ? buildAntibioticDayCounters({ current: activeMeds }) : []);
  const alertLines = (context && context.renalMedicationAlerts ? context.renalMedicationAlerts : [])
    .map((alert) => `<div class="pc-insight-card ${alert.tone}"${getInsightTooltipAttrs(alert)}><strong>${escPatientContextHtml(alert.medicationName || alert.title)}</strong><p>${escPatientContextHtml(alert.body)}</p></div>`)
    .join('');
  const antibioticBlock = antibioticDays.length
    ? `<div class="pc-abx-day-list">${antibioticDays.slice(0, 6).map((item) => `
        <div class="pc-abx-day-card ${escPatientContextHtml(item.tone || 'info')}">
          <div class="pc-abx-day-top">
            <div>
              <div class="pc-abx-day-label">Antibiotic</div>
              <div class="pc-abx-day-name">${escPatientContextHtml(item.name)}</div>
            </div>
            <span class="pc-abx-day-badge ${escPatientContextHtml(item.tone || 'info')}">${escPatientContextHtml(item.dayLabel)}</span>
          </div>
          <div class="pc-abx-day-meta">${escPatientContextHtml([item.sig, item.startDate ? `started ${item.startDate}` : 'start date missing'].filter(Boolean).join(' · '))}</div>
        </div>
      `).join('')}</div>`
    : '<div class="pc-empty">No active structured antibiotics with recognizable names.</div>';
  const medList = activeMeds.length
    ? `<div class="pc-event-list">${activeMeds.slice(0, 6).map((item) => `
        <div class="pc-event-card">
          <div class="pc-event-top">
            <div>
              <div class="pc-event-cat">Medication</div>
              <div class="pc-event-title">${escPatientContextHtml(item.name || 'Unnamed medication')}</div>
            </div>
            <div class="pc-event-meta">${escPatientContextHtml(formatStructuredMedicationSig(item) || item.status || '')}</div>
          </div>
          <div class="pc-event-body">${escPatientContextHtml(item.indication || item.notes || 'No indication documented.')}</div>
        </div>
      `).join('')}</div>`
    : '<div class="pc-empty">No active structured medications documented yet.</div>';
  const heldSummary = heldStopped.length
    ? `<div class="pc-page-copy" style="margin-top:0.6rem;">Held / stopped: ${escPatientContextHtml(heldStopped.map((item) => `${item.name} (${item.status})`).join(' · '))}</div>`
    : '';
  return `
    ${alertLines ? `<div class="pc-what-matters">${alertLines}</div>` : '<div class="pc-empty">No renal-review medication alerts from the current structured list.</div>'}
    <div style="margin-top:0.8rem;">
      <div class="pc-page-label">Antibiotic Days</div>
      ${antibioticBlock}
    </div>
    <div style="margin-top:0.8rem;">${medList}</div>
    ${heldSummary}
    <div class="pc-actions" style="margin-top:0.75rem;">
      <button class="btn-secondary" onclick="openPatientInHandoff('structured')">Manage in Handoff</button>
    </div>`;
}

function renderPatientContextMedicationChanges(context) {
  const diff = context && context.medicationDiff ? context.medicationDiff : { added: [], heldStopped: [], doseChanged: [] };
  const changes = context && context.medications && Array.isArray(context.medications.changes) ? context.medications.changes : [];
  const renderList = (items) => items.length
    ? `<ul class="pc-bullet-list">${items.map((item) => `<li>${escPatientContextHtml(item)}</li>`).join('')}</ul>`
    : '<div class="pc-empty">None.</div>';
  return `
    <div class="pc-card-grid">
      <div class="pc-value-card">
        <div class="pc-value-card-top"><div class="pc-value-card-title">Added</div></div>
        <div class="pc-value-card-meta">${renderList(diff.added)}</div>
      </div>
      <div class="pc-value-card">
        <div class="pc-value-card-top"><div class="pc-value-card-title">Stopped / Held</div></div>
        <div class="pc-value-card-meta">${renderList(diff.heldStopped)}</div>
      </div>
      <div class="pc-value-card">
        <div class="pc-value-card-top"><div class="pc-value-card-title">Dose Changed</div></div>
        <div class="pc-value-card-meta">${renderList(diff.doseChanged)}</div>
      </div>
    </div>
    <div style="margin-top:0.8rem;">
      ${changes.length
        ? `<div class="pc-event-list">${changes.slice(0, 4).map((item) => `
            <div class="pc-event-card">
              <div class="pc-event-top">
                <div>
                  <div class="pc-event-cat">Medication change</div>
                  <div class="pc-event-title">${escPatientContextHtml(String(item.action || '').replace(/_/g, ' '))}</div>
                </div>
                <div class="pc-event-meta">${escPatientContextHtml(item.timestamp || '')}</div>
              </div>
              <div class="pc-event-body">${escPatientContextHtml(item.from_sig || '[none]')} -> ${escPatientContextHtml(item.to_sig || '[none]')}${item.reason ? `<br>${escPatientContextHtml(item.reason)}` : ''}</div>
            </div>
          `).join('')}</div>`
        : '<div class="pc-empty">No structured medication changes recorded yet.</div>'}
    </div>`;
}

function renderPatientContextProblems(context) {
  const problems = context && Array.isArray(context.problems) ? context.problems : [];
  if (!problems.length) {
    return `<div class="pc-empty">No active problems documented yet.</div>
      <div class="pc-actions" style="margin-top:0.75rem;">
        <button class="btn-secondary" onclick="openPatientInHandoff('structured')">Manage in Handoff</button>
      </div>`;
  }
  return `
    <div class="pc-event-list">${problems.map((item, index) => `
      <div class="pc-event-card">
        <div class="pc-event-top">
          <div>
            <div class="pc-event-cat">P${index + 1} • ${escPatientContextHtml(item.status || 'active')}</div>
            <div class="pc-event-title">${escPatientContextHtml(item.title || 'Untitled problem')}</div>
          </div>
          <div class="pc-event-meta">${escPatientContextHtml(item.owner || item.updated_at || '')}</div>
        </div>
        <div class="pc-event-body"><strong>Assessment:</strong> ${escPatientContextHtml(item.assessment || '[not documented]')}<br><strong>Plan:</strong> ${escPatientContextHtml(item.plan || '[not documented]')}</div>
      </div>
    `).join('')}</div>
    <div class="pc-actions" style="margin-top:0.75rem;">
      <button class="btn-secondary" onclick="openPatientInHandoff('structured')">Manage in Handoff</button>
    </div>`;
}

function renderWeeklySummaryCard(context) {
  const weekly = context && context.weeklySummary;
  if (!weekly) return '<div class="pc-empty">No weekly summary is available yet.</div>';
  const topEvents = weekly.keyEvents || [];
  const labChanges = weekly.labChanges || [];
  const watchItems = weekly.currentAlerts || [];
  const medicationChanges = [
    ...(weekly.medicationDiff && weekly.medicationDiff.added ? weekly.medicationDiff.added.map((line) => `Added: ${line}`) : []),
    ...(weekly.medicationDiff && weekly.medicationDiff.heldStopped ? weekly.medicationDiff.heldStopped.map((line) => `Held/stopped: ${line}`) : []),
    ...(weekly.medicationDiff && weekly.medicationDiff.doseChanged ? weekly.medicationDiff.doseChanged.map((line) => `Dose changed: ${line}`) : []),
    ...(weekly.renalMedicationAlerts || []).map((item) => `Safety: ${item.title}`),
  ];
  const list = (items, empty) => items && items.length
    ? `<ul class="pc-bullet-list">${items.slice(0, 5).map((item) => `<li>${escPatientContextHtml(item)}</li>`).join('')}</ul>`
    : `<div class="pc-empty">${escPatientContextHtml(empty)}</div>`;
  return `
    <div class="pc-weekly-summary">
      <div class="pc-card-grid">
        <div class="pc-value-card">
          <div class="pc-value-card-top"><div class="pc-value-card-title">Window</div></div>
          <div class="pc-value-card-value">${escPatientContextHtml(weekly.rangeStart)} to ${escPatientContextHtml(weekly.rangeEnd)}</div>
          <div class="pc-value-card-meta">${weekly.eventCount} event${weekly.eventCount === 1 ? '' : 's'} · ${weekly.labSetCount} lab set${weekly.labSetCount === 1 ? '' : 's'}</div>
        </div>
        <div class="pc-value-card">
          <div class="pc-value-card-top"><div class="pc-value-card-title">Watch Items</div></div>
          <div class="pc-value-card-value">${watchItems.length + (weekly.renalMedicationAlerts || []).length}</div>
          <div class="pc-value-card-meta">Current rule-based concerns</div>
        </div>
      </div>
      <div class="pc-weekly-grid">
        <div>
          <div class="pc-page-label">Major Events</div>
          ${topEvents.length
            ? `<ul class="pc-bullet-list">${topEvents.slice(0, 5).map((entry) => `<li>${escPatientContextHtml(entry.timestamp)} ${escPatientContextHtml(entry.category)}: ${escPatientContextHtml(entry.title)}</li>`).join('')}</ul>`
            : '<div class="pc-empty">No major events documented in this week window.</div>'}
        </div>
        <div>
          <div class="pc-page-label">Lab Course</div>
          ${list(labChanges, 'No timestamped labs in this week window.')}
        </div>
        <div>
          <div class="pc-page-label">Current Watch Items</div>
          ${watchItems.length
            ? `<ul class="pc-bullet-list">${watchItems.slice(0, 4).map((item) => `<li>${escPatientContextHtml(item.title)}: ${escPatientContextHtml(item.body)}</li>`).join('')}</ul>`
            : '<div class="pc-empty">No active warning-level lab alerts.</div>'}
        </div>
        <div>
          <div class="pc-page-label">Medication Changes / Safety</div>
          ${list(medicationChanges, 'No structured medication changes documented.')}
        </div>
      </div>
      <div class="pc-actions" style="margin-top:0.75rem;">
        <button class="btn-secondary" onclick="copyWeeklySummary()">Copy Weekly Summary</button>
        <button class="btn-secondary" onclick="appendWeeklySummaryToRecord()">Append to Record</button>
        <div class="consults-status" id="pc-weekly-summary-status"></div>
      </div>
    </div>`;
}

function renderWhatMattersCard(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">What matters today</div>
      <div class="pc-page-card-copy">Highest-priority rule-based changes from current and prior labs.</div>
    </div>
    <div class="pc-page-card-body">
      ${context.insights.length
        ? `<div class="pc-what-matters">${context.insights.map((insight) => {
            const muted = typeof isAlertMuted === 'function' && isAlertMuted(context.id, insight.tone !== 'success' ? insight.title : '__skip__', context.lastLabTimestamp || '');
            return `<div class="pc-insight-card ${insight.tone}${muted ? ' pc-insight-muted' : ''}"${getInsightTooltipAttrs(insight)}><div class="pc-insight-header"><strong>${escPatientContextHtml(insight.title)}</strong><button class="pc-mute-btn" title="${muted ? 'Unmute' : 'Mute alert'}" data-title="${escPatientContextHtml(insight.title)}" data-pid="${escPatientContextHtml(context.id || '')}" data-labts="${escPatientContextHtml(context.lastLabTimestamp || '')}" onclick="toggleInsightMuteMenu(this)">···</button></div><p>${escPatientContextHtml(insight.body)}${muted ? ' <em class="pc-muted-label">(muted — click ··· to unmute)</em>' : ''}</p>${!muted ? renderMissingDataTodoButton(context, insight) : ''}${renderInsightBasisHtml(insight)}</div>`;
          }).join('')}</div>`
        : '<div class="pc-empty">No rule-based clinical alerts triggered from the current lab timeline.</div>'}
    </div>
  </section>`;
}

function renderHandoffReportSection() {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Handoff Report</div>
      <div class="pc-page-card-copy">Current structured snapshot for sign-out.</div>
    </div>
    <div class="pc-page-card-body">
      <div class="pc-actions">
        <button class="btn-primary" onclick="copyHandoffReport()">Copy Handoff Report</button>
        <div class="consults-status" id="pc-handoff-report-status"></div>
      </div>
    </div>
  </section>`;
}

function renderWeeklySummarySection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Weekly Summary</div>
      <div class="pc-page-card-copy">Rule-based seven-day course summary from chart events, labs, structured meds, and problems.</div>
    </div>
    <div class="pc-page-card-body">${renderWeeklySummaryCard(context)}</div>
  </section>`;
}

function renderLatestLabsSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Latest labs</div>
      <div class="pc-page-card-copy">Exact values and timestamps for the most recent six lab sets.</div>
    </div>
    <div class="pc-page-card-body">${buildLatestLabsTable(context.timeline)}</div>
  </section>`;
}

function renderLabTrendlinesSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Lab trendlines</div>
      <div class="pc-page-card-copy">Charts render only when at least two timepoints exist. Single datapoints stay visible as exact-value cards.</div>
    </div>
    <div class="pc-page-card-body">
      ${context.timeline.length ? PATIENT_CONTEXT_GROUPS.map((group) => renderGroupSection(group, context)).join('<div style="height:0.7rem;"></div>') : '<div class="pc-empty">No timestamped lab sets found in this record.</div>'}
    </div>
  </section>`;
}

function renderEventDetailsSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Event details</div>
      <div class="pc-page-card-copy">Recent event entries stay on the same screen so the right-column summary can jump directly to the underlying note.</div>
    </div>
    <div class="pc-page-card-body">${renderEventDetails(context)}</div>
  </section>`;
}

function renderRecentEventsSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Recent important events</div>
      <div class="pc-page-card-copy">Short excerpts from recent Imaging, Consult, Procedure, Medication Change, and Clinical Note entries.</div>
    </div>
    <div class="pc-page-card-body">${renderRecentEvents(context)}</div>
  </section>`;
}

function renderCodeStatusSection() {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Code Status</div>
      <div class="pc-page-card-copy">Structured code status and goals of care for the active patient.</div>
    </div>
    <div class="pc-page-card-body">
      <div id="pc-code-status-panel" class="pc-empty">Loading code status...</div>
    </div>
  </section>`;
}

function renderVitalsSection(activePid) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Vitals</div>
      <div class="pc-page-card-copy">Entry form, trend lines, and the most recent vital signs. Charts appear once a field has at least two numeric points.</div>
    </div>
    <div class="pc-page-card-body pc-vitals-shell">
      ${typeof renderVitalsEntryForm === 'function' ? renderVitalsEntryForm(activePid || '') : ''}
      <div id="pc-vitals-panel" class="pc-empty">Loading vitals...</div>
    </div>
  </section>`;
}

function renderIoSection(activePid) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">I/O Balance</div>
      <div class="pc-page-card-copy">Timestamped intake and output entries with today and rolling 24-hour fluid balance.</div>
    </div>
    <div class="pc-page-card-body pc-io-shell">
      ${typeof renderIoEntryForm === 'function' ? renderIoEntryForm(activePid || '') : ''}
      <div id="pc-io-panel" class="pc-empty">Loading I/O...</div>
    </div>
  </section>`;
}

function renderMedicationSafetySection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Medication Safety</div>
      <div class="pc-page-card-copy">Structured current meds plus renal-review flags tied to the active patient’s kidney function.</div>
    </div>
    <div class="pc-page-card-body">${renderPatientContextMedicationSafety(context)}</div>
  </section>`;
}

function renderMedicationChangesSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Medication Changes</div>
      <div class="pc-page-card-copy">Today-versus-admission medication diff plus the most recent structured changes.</div>
    </div>
    <div class="pc-page-card-body">${renderPatientContextMedicationChanges(context)}</div>
  </section>`;
}

function renderProblemsSection(context) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Active Problems</div>
      <div class="pc-page-card-copy">Ordered problem list with concise assessment and plan, maintained from Handoff Structured.</div>
    </div>
    <div class="pc-page-card-body">${renderPatientContextProblems(context)}</div>
  </section>`;
}

function renderWatchRulesSection() {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Watch Conditions</div>
      <div class="pc-page-card-copy">Lab-condition triggers for this patient. Fire when the active labs match — no patient identifiers stored in the rule.</div>
    </div>
    <div class="pc-page-card-body">
      <div id="pc-watch-rules-panel" class="pc-empty">Loading watch conditions…</div>
      <div class="pc-actions" style="margin-top:0.6rem;">
        <button class="btn-secondary" onclick="openWatchRuleForm()">+ Add Watch Condition</button>
      </div>
    </div>
  </section>`;
}

function renderPendingSection(pendingAddForm) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header">
      <div class="pc-page-card-title">Pending Results <span class="pc-pending-count-badge" id="pc-pending-count-badge">0 pending</span></div>
      <div class="pc-page-card-copy">Outstanding cultures, imaging, consult replies, and follow-up tasks still on the team radar.</div>
    </div>
    <div class="pc-page-card-body">
      ${pendingAddForm}
      <div id="pc-pending-panel" class="pc-empty" style="margin-top:${pendingAddForm ? '0.65rem' : '0'};">Loading pending items...</div>
    </div>
  </section>`;
}

function buildPatientContextWorkspaceBody(context, section, activePid, pendingAddForm) {
  const active = getPatientContextWorkspaceSection(section);
  const todoSection = typeof renderTodosSection === 'function' ? renderTodosSection(activePid || '') : '';
  if (active === 'course') {
    return `<div class="pc-page-main single">${renderEventDetailsSection(context)}</div>`;
  }
  if (active === 'labs') {
    return `<div class="pc-page-main single">${renderLabTrendlinesSection(context)}${renderLatestLabsSection(context)}</div>`;
  }
  if (active === 'tasks') {
    return `<div class="pc-page-main">
      <div class="pc-page-column">
        ${renderMedicationSafetySection(context)}
        ${renderMedicationChangesSection(context)}
      </div>
      <div class="pc-page-column">
        ${todoSection}
        ${renderProblemsSection(context)}
        ${renderWatchRulesSection()}
      </div>
    </div>`;
  }
  return `<div class="pc-page-main">
    <div class="pc-page-column">
      ${renderSinceLastReviewCard(context)}
      ${renderWhatMattersCard(context)}
      ${renderDailyRoundingChecklistSection(context)}
      ${renderRecentEventsSection(context)}
      ${renderWeeklySummarySection(context)}
    </div>
    <div class="pc-page-column">
      ${renderCodeStatusSection()}
      ${renderHandoffReportSection()}
      ${todoSection}
      ${renderPendingSection(pendingAddForm)}
      ${renderLatestLabsSection(context)}
      ${renderVitalsSection(activePid)}
      ${renderIoSection(activePid)}
    </div>
  </div>`;
}

function buildPatientContextWorkspaceHtml(context, section) {
  if (!context) return '';
  const activePid = context && context.id ? context.id : activePatientId;
  const activeSection = getPatientContextWorkspaceSection(section);
  const pendingAddForm = typeof renderPendingAddForm === 'function'
    ? renderPendingAddForm(activePid || '')
    : '';

  return `
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
      </div>
      <div class="pc-header-actions">
        <button class="btn-secondary" onclick="returnFromPatientContext()">Back</button>
        <button class="btn-secondary" onclick="copyHandoffReport()">Copy Handoff</button>
        <button class="btn-secondary" onclick="copyPatientContextSummary()">Copy Summary</button>
        <button class="btn-secondary" onclick="refreshActivePatientContext()">Refresh</button>
        <button class="btn-primary" onclick="openPatientInHandoff('record')">Open in Handoff</button>
      </div>
      <div class="pc-page-actions">
        <button class="btn-secondary" onclick="openPatientInHandoff('append')">Add Data</button>
        <button class="btn-secondary" onclick="openPatientInHandoff('record')">Full Record</button>
        <button class="btn-secondary" onclick="openPatientInHandoff('generate')">Generate Note</button>
        <button class="btn-secondary" onclick="openPatientContextCalculator()">Calculator</button>
      </div>
      ${renderPatientContextWorkspaceNav(activeSection)}
      ${buildPatientContextWorkspaceBody(context, activeSection, activePid, pendingAddForm)}
    </div>`;
}

function renderPatientContextWorkspace() {
  const root = document.getElementById('patient-context-workspace');
  if (!root) return;
  if (!activePatientContext) {
    root.innerHTML = `<div class="pc-page-empty">
      <div class="pc-page-empty-icon">&#129658;</div>
      <h2>Patient Context</h2>
      <p>Select a patient from the sidebar, Ward Board, Calculator, or Handoff to review trendlines and recent events.</p>
      <div class="pc-page-empty-actions">
        <button class="btn-primary" onclick="switchView('ward')">Open Ward Board</button>
        <button class="btn-secondary" onclick="switchView('handoff')">Open Handoff</button>
    </div>
  </div>`;
    return;
  }

  const context = activePatientContext;
  root.innerHTML = buildPatientContextWorkspaceHtml(context);
  syncPatientContextWorkspacePanels(context.id || activePatientId);
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
  resetPatientContextWorkspacePanels();
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
