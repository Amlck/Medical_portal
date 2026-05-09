// ---------------------------------------------------------------------------
// Intake / Output Tracking - deterministic fluid balance summaries
// Panel rendered inside the Patient Context Workspace.
// ---------------------------------------------------------------------------

let activeIoItems = [];
let activeIoPatientId = '';
let ioLoading = false;
let latestIoRequestId = 0;

const IO_CATEGORIES = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'IV' },
  { value: 'tube', label: 'Tube' },
  { value: 'urine', label: 'Urine' },
  { value: 'drain', label: 'Drain' },
  { value: 'stool', label: 'Stool' },
  { value: 'emesis', label: 'Emesis' },
  { value: 'other', label: 'Other' },
];

function ioEscHtml(value) {
  if (typeof escPatientContextHtml === 'function') return escPatientContextHtml(value || '');
  if (typeof escHtml === 'function') return escHtml(value || '');
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseIoTimestamp(timestamp) {
  if (!timestamp) return null;
  const dt = new Date(timestamp);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatIoTimestamp(timestamp) {
  const dt = parseIoTimestamp(timestamp);
  if (!dt) return String(timestamp || '');
  return dt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatIoAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';
  if (Number.isInteger(amount)) return String(amount);
  return String(Math.round(amount * 10) / 10);
}

function formatIoCategory(value) {
  const found = IO_CATEGORIES.find((item) => item.value === value);
  return found ? found.label : String(value || 'Other');
}

function getIoInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setIoStatus(message, tone) {
  const statusEl = document.getElementById('pc-io-status');
  if (!statusEl) return;
  if (!message) {
    statusEl.textContent = '';
    statusEl.className = 'pc-io-status';
    return;
  }
  statusEl.textContent = message;
  statusEl.className = `pc-io-status ${tone || 'info'}`;
}

function buildIoSummary(items, now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const last24Start = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const empty = () => ({ intake: 0, output: 0, balance: 0, count: 0 });
  const summary = { today: empty(), last24h: empty() };

  (Array.isArray(items) ? items : []).forEach((item) => {
    const ts = parseIoTimestamp(item.timestamp);
    if (!ts || ts > now) return;
    const amount = Number(item.amount_ml);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const bucket = item.kind === 'output' ? 'output' : 'intake';
    if (ts >= startOfToday) {
      summary.today[bucket] += amount;
      summary.today.count += 1;
    }
    if (ts >= last24Start) {
      summary.last24h[bucket] += amount;
      summary.last24h.count += 1;
    }
  });

  summary.today.balance = summary.today.intake - summary.today.output;
  summary.last24h.balance = summary.last24h.intake - summary.last24h.output;
  return summary;
}

function getIoBalanceClass(balance) {
  if (balance > 0) return 'positive';
  if (balance < 0) return 'negative';
  return 'even';
}

function renderIoSummaryCard(label, bucket) {
  const balanceClass = getIoBalanceClass(bucket.balance);
  const sign = bucket.balance > 0 ? '+' : '';
  return `<div class="pc-io-summary-card">
    <div class="pc-io-summary-label">${ioEscHtml(label)}</div>
    <div class="pc-io-summary-row"><span>In</span><strong>${formatIoAmount(bucket.intake)} mL</strong></div>
    <div class="pc-io-summary-row"><span>Out</span><strong>${formatIoAmount(bucket.output)} mL</strong></div>
    <div class="pc-io-balance ${balanceClass}">${sign}${formatIoAmount(bucket.balance)} mL</div>
  </div>`;
}

async function loadIoItems(pid) {
  const requestId = ++latestIoRequestId;
  if (!pid) {
    activeIoItems = [];
    activeIoPatientId = '';
    ioLoading = false;
    renderIoPanel();
    return;
  }
  activeIoPatientId = pid;
  try {
    ioLoading = true;
    activeIoItems = [];
    renderIoPanel();
    const res = await fetch(`/s/handoff/api/patients/${pid}/io`);
    if (!res.ok) throw new Error(`I/O fetch failed (${res.status})`);
    const data = await res.json();
    if (requestId !== latestIoRequestId) return;
    activeIoItems = data.items || [];
    activeIoPatientId = pid;
  } catch (e) {
    if (requestId !== latestIoRequestId) return;
    activeIoItems = [];
    console.warn('[io] loadIoItems error:', e.message);
  } finally {
    if (requestId !== latestIoRequestId) return;
    ioLoading = false;
    renderIoPanel();
  }
}

async function addIoEntry(pid, entry) {
  latestIoRequestId += 1;
  const res = await fetch(`/s/handoff/api/patients/${pid}/io`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add I/O entry');
  }
  const data = await res.json();
  activeIoItems = [data.entry, ...activeIoItems].sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')));
  renderIoPanel();
  return data.entry;
}

async function deleteIoEntry(pid, entryId) {
  latestIoRequestId += 1;
  const res = await fetch(`/s/handoff/api/patients/${pid}/io/${entryId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete I/O entry');
  activeIoItems = activeIoItems.filter((item) => item.id !== entryId);
  renderIoPanel();
}

function renderIoEntryForm(pid) {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const categoryOptions = IO_CATEGORIES.map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
  return `<div class="pc-io-form" id="pc-io-form">
    <div class="pc-io-form-row">
      <label>Time</label><input type="datetime-local" id="io-timestamp" value="${localTimestamp}">
      <label>Type</label><select id="io-kind"><option value="intake">Intake</option><option value="output">Output</option></select>
      <label>Category</label><select id="io-category">${categoryOptions}</select>
      <label>mL</label><input type="number" id="io-amount" min="0.01" max="100000" step="1" placeholder="250">
    </div>
    <div class="pc-io-form-row">
      <label>Note</label><input type="text" id="io-note" placeholder="Optional source or context">
      <button class="btn-primary" onclick="handleAddIoEntry('${ioEscHtml(pid || '')}')">Add</button>
    </div>
    <div class="pc-io-status" id="pc-io-status"></div>
  </div>`;
}

function renderIoTable(items) {
  if (!items.length) return ioLoading ? '<div class="pc-empty">Loading I/O...</div>' : '<div class="pc-empty">No I/O entries logged yet.</div>';
  const pid = (typeof activePatientId !== 'undefined') ? activePatientId : activeIoPatientId;
  const rows = items.slice(0, 12).map((item) => {
    const kind = item.kind === 'output' ? 'output' : 'intake';
    return `<tr>
      <td>${ioEscHtml(formatIoTimestamp(item.timestamp))}</td>
      <td><span class="pc-io-kind ${kind}">${ioEscHtml(kind)}</span></td>
      <td>${ioEscHtml(formatIoCategory(item.category))}</td>
      <td>${ioEscHtml(formatIoAmount(item.amount_ml))}</td>
      <td>${ioEscHtml(item.note || '-')}</td>
      <td><button class="pc-io-delete" onclick="deleteIoEntry('${ioEscHtml(pid)}', '${ioEscHtml(item.id)}')" title="Delete">x</button></td>
    </tr>`;
  }).join('');
  return `<table class="pc-io-table">
    <thead><tr><th>Time</th><th>Type</th><th>Cat</th><th>mL</th><th>Note</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderIoPanel() {
  const el = document.getElementById('pc-io-panel');
  if (!el) return;
  const summary = buildIoSummary(activeIoItems);
  el.innerHTML = `
    <div class="pc-io-summary-grid">
      ${renderIoSummaryCard('Today', summary.today)}
      ${renderIoSummaryCard('Last 24h', summary.last24h)}
    </div>
    ${renderIoTable(activeIoItems)}`;
  if (typeof renderDailyRoundingChecklistPanel === 'function') {
    renderDailyRoundingChecklistPanel();
  }
}

async function handleAddIoEntry(pid) {
  const amount = Number(getIoInputValue('io-amount'));
  const entry = {
    timestamp: getIoInputValue('io-timestamp') || undefined,
    kind: getIoInputValue('io-kind') || 'intake',
    category: getIoInputValue('io-category') || 'other',
    amount_ml: amount,
    note: getIoInputValue('io-note'),
  };

  if (!pid) {
    setIoStatus('Select a patient before adding I/O.', 'error');
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setIoStatus('Enter a positive mL amount.', 'error');
    return;
  }

  try {
    setIoStatus('Adding...', 'info');
    await addIoEntry(pid, entry);
    const amountEl = document.getElementById('io-amount');
    const noteEl = document.getElementById('io-note');
    if (amountEl) amountEl.value = '';
    if (noteEl) noteEl.value = '';
    setIoStatus('Added.', 'success');
  } catch (e) {
    setIoStatus(e.message, 'error');
  }
}

if (typeof window !== 'undefined') {
  window.__ioTestApi = {
    buildIoSummary,
    formatIoAmount,
    formatIoCategory,
    renderIoEntryForm,
    renderIoPanel,
    renderIoTable,
    loadIoItems,
    addIoEntry,
    deleteIoEntry,
    getIoBalanceClass,
  };
}

// --------------- Integration -------------------------------------------------
//
// Patient Context Workspace should include:
//   renderIoEntryForm(activePatientId)
//   <div id="pc-io-panel"></div>
// and call loadIoItems(activePatientId) after workspace HTML is mounted.
