// ---------------------------------------------------------------------------
// Pending Results / Follow-up Tracker — per-patient checklist
// Panel rendered inside the Patient Context Workspace (right column).
// Also feeds the Ward Board pending count column.
// See FEATURES.md §Feature 2 for full spec.
// ---------------------------------------------------------------------------

// --------------- State -------------------------------------------------------

let activePendingItems = [];     // array of pending items for the current patient
let activePendingPatientId = '';
let pendingLoading = false;
let pendingLoadRequestSeq = 0;

const PENDING_CATEGORIES = ['Culture', 'Imaging', 'Consult', 'Lab', 'Procedure', 'Other'];

// --------------- Utility -----------------------------------------------------

function pendingEscHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pendingCategoryIcon(category) {
  const icons = {
    Culture: '🧫', Imaging: '🩻', Consult: '💬', Lab: '🔬', Procedure: '🔧', Other: '📌',
  };
  return icons[category] || '📌';
}

function parsePendingDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePendingDueDate(item, createdAt, now = new Date()) {
  const hint = String((item && item.due_hint) || '').trim().toLowerCase();
  if (!hint) return null;
  const absolute = hint.match(/\b(20\d{2})[/-](\d{1,2})[/-](\d{1,2})\b/);
  if (absolute) {
    const date = new Date(Number(absolute[1]), Number(absolute[2]) - 1, Number(absolute[3]), 23, 59, 59, 999);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const monthDay = hint.match(/\b(\d{1,2})[/-](\d{1,2})\b/);
  if (monthDay) {
    const date = new Date(now.getFullYear(), Number(monthDay[1]) - 1, Number(monthDay[2]), 23, 59, 59, 999);
    if (date < new Date(now.getTime() - 30 * 86400000)) date.setFullYear(date.getFullYear() + 1);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (createdAt) {
    const hours = hint.match(/\b(\d{1,3})\s*(h|hr|hrs|hour|hours)\b/);
    if (hours) return new Date(createdAt.getTime() + Number(hours[1]) * 3600000);
    const days = hint.match(/\b(\d{1,2})\s*(d|day|days)\b/);
    if (days) return new Date(createdAt.getTime() + Number(days[1]) * 86400000);
  }
  if (hint.includes('today')) {
    const date = new Date(now.getTime());
    date.setHours(23, 59, 59, 999);
    return date;
  }
  if (hint.includes('tomorrow')) {
    const date = new Date(now.getTime());
    date.setDate(date.getDate() + 1);
    date.setHours(23, 59, 59, 999);
    return date;
  }
  return null;
}

function pendingThresholdHours(item) {
  const text = `${item && item.category ? item.category : ''} ${item && item.description ? item.description : ''}`.toLowerCase();
  if (/culture|blood cx|urine cx|sputum|wound/.test(text)) return { stale: 48, urgent: 72, label: 'culture' };
  if (/consult|會診/.test(text)) return { stale: 24, urgent: 48, label: 'consult' };
  if (/imaging|ct|mri|xray|x-ray|ultrasound|echo|procedure|pathology|biopsy/.test(text)) return { stale: 72, urgent: 120, label: 'test' };
  return { stale: 72, urgent: 120, label: 'pending' };
}

function getPendingDueState(item, now = new Date()) {
  if (!item || item.status !== 'pending') return { tone: 'success', label: 'resolved', rank: 0, stale: false, urgent: false };
  const created = parsePendingDate(item.created_at || item.created || item.timestamp);
  const dueDate = parsePendingDueDate(item, created, now);
  const threshold = pendingThresholdHours(item);
  const ageHours = created ? (now.getTime() - created.getTime()) / 3600000 : null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);

  if (dueDate && dueDate < startOfToday) {
    return { tone: 'warn', label: 'overdue', rank: 2, stale: true, urgent: false, dueDate, ageHours, category: item.category, description: item.description };
  }
  if (dueDate && dueDate <= endOfToday) {
    return { tone: 'info', label: 'due today', rank: 1, stale: false, urgent: false, dueDate, ageHours, category: item.category, description: item.description };
  }
  if (ageHours != null && ageHours >= threshold.urgent) {
    return { tone: 'danger', label: `urgent stale ${threshold.label}`, rank: 3, stale: true, urgent: true, dueDate, ageHours, category: item.category, description: item.description };
  }
  if (ageHours != null && ageHours >= threshold.stale) {
    return { tone: 'warn', label: `stale ${threshold.label}`, rank: 2, stale: true, urgent: false, dueDate, ageHours, category: item.category, description: item.description };
  }
  return { tone: 'info', label: 'pending', rank: 0, stale: false, urgent: false, dueDate, ageHours, category: item.category, description: item.description };
}

function summarizePendingFollowUpRisks(items, now = new Date()) {
  const active = (Array.isArray(items) ? items : []).filter((item) => item.status === 'pending');
  const assessed = active
    .map((item) => ({ ...getPendingDueState(item, now), item }))
    .filter((state) => state.rank > 0)
    .sort((a, b) => b.rank - a.rank || (b.ageHours || 0) - (a.ageHours || 0));
  const worstTone = assessed.some((state) => state.tone === 'danger') || assessed.length >= 3 ? 'danger'
    : assessed.some((state) => state.tone === 'warn') ? 'warn'
    : assessed.some((state) => state.tone === 'info') ? 'info'
    : active.length ? 'info' : 'success';
  const summaryText = assessed.length
    ? `${assessed.length} follow-up risk${assessed.length === 1 ? '' : 's'}: ${assessed.slice(0, 2).map((state) => `${state.label} - ${state.item.description || state.item.category || 'pending item'}`).join('; ')}${assessed.length > 2 ? '...' : ''}`
    : active.length ? `${active.length} pending item${active.length === 1 ? '' : 's'}, none overdue/stale.` : 'No structured pending results.';
  return {
    activeCount: active.length,
    items: assessed,
    worstTone,
    summaryText,
  };
}

function renderPendingAgingBadge(item) {
  const state = getPendingDueState(item);
  if (!state || state.rank <= 0) return '';
  const title = state.ageHours != null ? `${Math.round(state.ageHours)} hours old` : 'Due-date based pending risk';
  return `<span class="pc-pending-aging-badge ${pendingEscHtml(state.tone)}" title="${pendingEscHtml(title)}">${pendingEscHtml(state.label)}</span>`;
}

function updatePendingCountBadge() {
  const badge = document.getElementById('pc-pending-count-badge');
  if (!badge) return;
  const pendingCount = activePendingItems.filter((item) => item.status === 'pending').length;
  const risk = summarizePendingFollowUpRisks(activePendingItems);
  badge.className = `pc-pending-count-badge ${risk.worstTone || 'info'}`;
  badge.textContent = risk.items.length ? `${pendingCount} pending · ${risk.items.length} follow-up` : `${pendingCount} pending`;
}

// --------------- API helpers -------------------------------------------------

async function loadPendingItems(pid) {
  // TODO: GET /s/handoff/api/patients/<pid>/pending
  // On success: set activePendingItems = data.items and call renderPendingPanel()
  const requestSeq = ++pendingLoadRequestSeq;
  if (!pid) { activePendingItems = []; activePendingPatientId = ''; renderPendingPanel(); return; }
  activePendingPatientId = pid;
  try {
    pendingLoading = true;
    const res = await fetch(`/s/handoff/api/patients/${pid}/pending`);
    if (!res.ok) throw new Error(`Pending fetch failed (${res.status})`);
    const data = await res.json();
    if (requestSeq !== pendingLoadRequestSeq) return;
    activePendingItems = data.items || [];
    activePendingPatientId = pid;
  } catch (e) {
    if (requestSeq !== pendingLoadRequestSeq) return;
    activePendingItems = [];
    console.warn('[pending] loadPendingItems error:', e.message);
  } finally {
    if (requestSeq !== pendingLoadRequestSeq) return;
    pendingLoading = false;
    renderPendingPanel();
  }
}

async function addPendingItem(pid, item) {
  // TODO: POST /s/handoff/api/patients/<pid>/pending
  // item: { category, description, due_hint? }
  const res = await fetch(`/s/handoff/api/patients/${pid}/pending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add pending item');
  }
  const data = await res.json();
  activePendingItems = [data.item, ...activePendingItems];
  renderPendingPanel();
  return data.item;
}

async function resolvePendingItem(pid, itemId, resultNote) {
  // TODO: PUT /s/handoff/api/patients/<pid>/pending/<itemId>
  // body: { status: 'resulted', result_note: resultNote }
  const res = await fetch(`/s/handoff/api/patients/${pid}/pending/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'resulted', result_note: resultNote || '' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to resolve item');
  }
  const data = await res.json();
  const idx = activePendingItems.findIndex(i => i.id === itemId);
  if (idx >= 0) activePendingItems[idx] = data.item;
  renderPendingPanel();
}

async function dismissPendingItem(pid, itemId) {
  // TODO: PUT /s/handoff/api/patients/<pid>/pending/<itemId>
  // body: { status: 'cancelled' }
  const res = await fetch(`/s/handoff/api/patients/${pid}/pending/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!res.ok) throw new Error('Failed to dismiss item');
  activePendingItems = activePendingItems.filter(i => i.id !== itemId);
  renderPendingPanel();
}

// --------------- Render ------------------------------------------------------

function renderPendingItem(item, pid) {
  // TODO: render one pending item row with action buttons.
  const ts = item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
  const icon = pendingCategoryIcon(item.category);
  const isPending = item.status === 'pending';

  return `
    <div class="pc-pending-item${isPending ? '' : ' pc-pending-resolved'}" data-id="${pendingEscHtml(item.id)}">
      <div class="pc-pending-item-main">
        <span class="pc-pending-cat-icon" title="${pendingEscHtml(item.category)}">${icon}</span>
        <span class="pc-pending-cat">${pendingEscHtml(item.category)}</span>
        <span class="pc-pending-desc">${pendingEscHtml(item.description)}</span>
        ${item.due_hint ? `<span class="pc-pending-due">${pendingEscHtml(item.due_hint)}</span>` : ''}
        ${isPending ? renderPendingAgingBadge(item) : ''}
        ${ts ? `<span class="pc-pending-ts">${ts}</span>` : ''}
      </div>
      ${item.result_note ? `<div class="pc-pending-result">&#10003; ${pendingEscHtml(item.result_note)}</div>` : ''}
      ${isPending ? `
        <div class="pc-pending-actions">
          <button class="btn-secondary pc-pending-btn" onclick="openPendingResolveForm('${pendingEscHtml(item.id)}', '${pendingEscHtml(pid)}')">Resulted</button>
          <button class="pc-pending-dismiss" onclick="dismissPendingItem('${pendingEscHtml(pid)}', '${pendingEscHtml(item.id)}')" title="Dismiss">&#10005;</button>
        </div>` : ''}
    </div>`;
}

function openPendingResolveForm(itemId, pid) {
  // TODO: show an inline input below the item for entering the result note,
  // with "Save" and "Cancel" buttons.
  // On Save: call resolvePendingItem(pid, itemId, resultNote)
  const el = document.querySelector(`.pc-pending-item[data-id="${itemId}"] .pc-pending-actions`);
  if (!el || el.querySelector('.pc-pending-resolve-form')) return;

  const form = document.createElement('div');
  form.className = 'pc-pending-resolve-form';
  form.innerHTML = `
    <input type="text" class="pc-pending-result-input" placeholder="Brief result (e.g. No growth at 5 days)" autofocus>
    <button class="btn-primary" style="font-size:0.65rem;padding:0.2rem 0.6rem;">Save</button>
    <button class="btn-secondary" style="font-size:0.65rem;padding:0.2rem 0.6rem;">Cancel</button>`;

  form.querySelector('.btn-primary').onclick = async () => {
    const note = form.querySelector('input').value.trim();
    try { await resolvePendingItem(pid, itemId, note); }
    catch (e) { console.error(e); }
  };
  form.querySelector('.btn-secondary').onclick = () => form.remove();
  el.appendChild(form);
  form.querySelector('input').focus();
}

function renderPendingPanel() {
  const el = document.getElementById('pc-pending-panel');
  updatePendingCountBadge();
  if (!el) return;

  const pending  = activePendingItems.filter(i => i.status === 'pending');
  const resolved = activePendingItems.filter(i => i.status !== 'pending');

  // Get active patient id from the global in portal-patient-context.js
  const pid = (typeof activePatientId !== 'undefined') ? activePatientId : '';

  const pendingHtml = pending.length
    ? pending.map(i => renderPendingItem(i, pid)).join('')
    : '<div class="pc-empty">No pending items.</div>';
  const risk = summarizePendingFollowUpRisks(activePendingItems);
  const riskHtml = risk.items.length ? `
    <div class="pc-pending-risk-strip ${pendingEscHtml(risk.worstTone)}">
      <div class="pc-pending-risk-title">Pending Follow-up Risks</div>
      ${risk.items.slice(0, 4).map((state) => `
        <div class="pc-pending-risk-item">
          <span class="pc-pending-aging-badge ${pendingEscHtml(state.tone)}">${pendingEscHtml(state.label)}</span>
          <span>${pendingEscHtml(state.item.description || state.item.category || 'pending item')}</span>
        </div>
      `).join('')}
    </div>` : '';

  const resolvedSection = resolved.length ? `
    <details class="pc-pending-resolved-section">
      <summary class="pc-pending-resolved-summary">Resolved (${resolved.length})</summary>
      ${resolved.slice(0, 20).map(i => renderPendingItem(i, pid)).join('')}
    </details>` : '';

  el.innerHTML = riskHtml + pendingHtml + resolvedSection;
  if (typeof renderDailyRoundingChecklistPanel === 'function') {
    renderDailyRoundingChecklistPanel();
  }
}

function renderPendingAddForm(pid) {
  // TODO: render the quick-add form for new pending items.
  // Returns HTML string to be inserted above #pc-pending-panel.
  const catOptions = PENDING_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  return `
    <div class="pc-pending-add-form" id="pc-pending-add-form">
      <select id="pending-cat-select" style="font-size:0.7rem;">${catOptions}</select>
      <input type="text" id="pending-desc-input" placeholder="Description (e.g. Blood cx ×2 drawn 08:10)" style="flex:2;font-size:0.7rem;">
      <input type="text" id="pending-due-input" placeholder="Due hint (e.g. 48h)" style="width:5rem;font-size:0.7rem;">
      <button class="btn-primary" style="font-size:0.65rem;padding:0.25rem 0.7rem;" onclick="handleAddPendingItem('${pendingEscHtml(pid)}')">Add</button>
      <div class="pc-pending-add-status" id="pc-pending-add-status"></div>
    </div>`;
}

async function handleAddPendingItem(pid) {
  const cat  = document.getElementById('pending-cat-select')?.value || 'Other';
  const desc = (document.getElementById('pending-desc-input')?.value || '').trim();
  const due  = (document.getElementById('pending-due-input')?.value  || '').trim();
  const statusEl = document.getElementById('pc-pending-add-status');

  if (!desc) {
    if (statusEl) { statusEl.textContent = 'Description required.'; statusEl.className = 'pc-pending-add-status error'; }
    return;
  }

  try {
    await addPendingItem(pid, { category: cat, description: desc, due_hint: due || null });
    document.getElementById('pending-desc-input').value = '';
    document.getElementById('pending-due-input').value  = '';
    if (statusEl) { statusEl.textContent = 'Added.'; statusEl.className = 'pc-pending-add-status success'; setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000); }
  } catch (e) {
    if (statusEl) { statusEl.textContent = e.message; statusEl.className = 'pc-pending-add-status error'; }
  }
}

// --------------- Integration -------------------------------------------------
//
// In portal-patient-context.js, renderPatientContextWorkspace() should:
// 1. Include a <section class="pc-page-card"> in the right column with:
//      <div class="pc-page-card-title">Pending Results <span id="pc-pending-count-badge"></span></div>
//      <!-- entry form: renderPendingAddForm(activePatientId) -->
//      <div id="pc-pending-panel"></div>
// 2. After setting innerHTML, call loadPendingItems(activePatientId).
//
// Badge count update: after renderPendingPanel(), update #pc-pending-count-badge
// to show the count of items where status === 'pending'.

if (typeof window !== 'undefined') {
  window.getPendingDueState = getPendingDueState;
  window.summarizePendingFollowUpRisks = summarizePendingFollowUpRisks;
  window.__pendingTestApi = {
    getPendingDueState,
    summarizePendingFollowUpRisks,
  };
}
