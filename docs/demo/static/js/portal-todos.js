// ---------------------------------------------------------------------------
// Ward Todos — patient-tagged and ward-level task tracking
// ---------------------------------------------------------------------------

const TODO_PRIORITIES = ['high', 'normal', 'low'];
const TODO_STATUSES = ['open', 'done'];
const TODO_API_BASE = '/s/handoff/api';

let todoPageItems = [];
let todoPatients = [];
let activePatientTodos = [];
let activeTodoPatientId = '';
let todosPageInitialized = false;

function todoEscHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function todoPriorityRank(priority) {
  return priority === 'high' ? 0 : priority === 'normal' ? 1 : 2;
}

function todoPad2(value) {
  return String(value).padStart(2, '0');
}

function parseTodoDueInput(value) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  const compact = raw.match(/^(\d{4})(\d{2})(\d{2})(?:[ T]+(\d{1,2})(?::?(\d{2}))?)?$/);
  const separated = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T]+(\d{1,2})(?::?(\d{2}))?)?$/);
  const match = compact || separated;
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] == null ? null : Number(match[4]);
  const minute = match[5] == null ? (hour == null ? null : 0) : Number(match[5]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (hour != null && (!Number.isInteger(hour) || hour < 0 || hour > 23)) return null;
  if (minute != null && (!Number.isInteger(minute) || minute < 0 || minute > 59)) return null;

  const datePart = `${year}-${todoPad2(month)}-${todoPad2(day)}`;
  if (hour == null) return datePart;
  return `${datePart}T${todoPad2(hour)}:${todoPad2(minute)}`;
}

function todoDueDate(value) {
  const normalized = parseTodoDueInput(value);
  if (!normalized) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!match) return null;
  if (!match[4]) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}

function todoDateValue(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = todoDueDate(value);
  return date ? date.getTime() : Number.POSITIVE_INFINITY;
}

function sortTodos(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    if ((a.status || 'open') !== (b.status || 'open')) return (a.status || 'open') === 'open' ? -1 : 1;
    return todoPriorityRank(a.priority) - todoPriorityRank(b.priority)
      || todoDateValue(a.due_at) - todoDateValue(b.due_at)
      || String(a.created_at || '').localeCompare(String(b.created_at || ''));
  });
}

function patientVisibleTodos(items, pid) {
  return (Array.isArray(items) ? items : []).filter((item) => item.patient_id === pid && item.status !== 'done');
}

function todoPatientLabel(pid) {
  if (!pid) return 'Ward-level';
  const patient = todoPatients.find((item) => item.id === pid);
  return patient ? `${patient.name || pid}${patient.dx ? ` (${patient.dx})` : ''}` : pid;
}

function todoPriorityOptions(selected) {
  return TODO_PRIORITIES.map((priority) => `<option value="${priority}" ${priority === selected ? 'selected' : ''}>${priority[0].toUpperCase()}${priority.slice(1)}</option>`).join('');
}

function todoPatientOptions(selected, includeWardLevel) {
  const ward = includeWardLevel ? `<option value="" ${!selected ? 'selected' : ''}>Ward-level</option>` : '';
  return ward + todoPatients
    .filter((patient) => !String(patient.id || '').endsWith('_dc'))
    .map((patient) => `<option value="${todoEscHtml(patient.id)}" ${patient.id === selected ? 'selected' : ''}>${todoEscHtml(patient.name || patient.id)}</option>`)
    .join('');
}

function formatTodoDue(value) {
  if (!value) return '';
  const normalized = parseTodoDueInput(value);
  const date = todoDueDate(value);
  if (!date) return value;
  const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  if (normalized && !normalized.includes('T')) return dateLabel;
  return `${dateLabel} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

function todoDueInputValue(value) {
  if (!value) return '';
  const normalized = parseTodoDueInput(value);
  const match = normalized && normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!match) return String(value);
  const compactDate = `${match[1]}${match[2]}${match[3]}`;
  return match[4] ? `${compactDate} ${match[4]}${match[5]}` : compactDate;
}

function defaultGeneratedTodoDueAt(now = new Date()) {
  return `${now.getFullYear()}-${todoPad2(now.getMonth() + 1)}-${todoPad2(now.getDate())}T17:00`;
}

function todoDueTone(value, status) {
  if (!value || status === 'done') return '';
  const date = todoDueDate(value);
  if (!date) return '';
  const now = new Date();
  if (date < now) return 'overdue';
  if (date.getTime() - now.getTime() < 24 * 3600000) return 'soon';
  return '';
}

function todoIsSameLocalDate(left, right = new Date()) {
  const leftDate = left instanceof Date ? left : new Date(left);
  const rightDate = right instanceof Date ? right : new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return false;
  return leftDate.getFullYear() === rightDate.getFullYear()
    && leftDate.getMonth() === rightDate.getMonth()
    && leftDate.getDate() === rightDate.getDate();
}

function summarizeTodoDueCounts(items, now = new Date()) {
  const openItems = (Array.isArray(items) ? items : []).filter((item) => (item.status || 'open') !== 'done');
  let overdue = 0;
  let dueToday = 0;
  let high = 0;
  openItems.forEach((item) => {
    if (item.priority === 'high') high += 1;
    if (!item.due_at) return;
    const due = todoDueDate(item.due_at);
    if (!due) return;
    if (due < now) overdue += 1;
    else if (todoIsSameLocalDate(due, now)) dueToday += 1;
  });
  return {
    open: openItems.length,
    high,
    overdue,
    dueToday,
    dueAttention: overdue + dueToday,
  };
}

function normalizeTodoDueField(inputEl) {
  if (!inputEl) return true;
  const normalized = parseTodoDueInput(inputEl.value);
  if (inputEl.classList && typeof inputEl.classList.toggle === 'function') {
    inputEl.classList.toggle('invalid', normalized === null);
  }
  if (normalized === null) return false;
  inputEl.value = todoDueInputValue(normalized);
  return true;
}

function readTodoDueInput(inputEl) {
  if (!inputEl) return { ok: true, value: '' };
  const normalized = parseTodoDueInput(inputEl.value);
  if (inputEl.classList && typeof inputEl.classList.toggle === 'function') {
    inputEl.classList.toggle('invalid', normalized === null);
  }
  return normalized === null
    ? { ok: false, value: '' }
    : { ok: true, value: normalized };
}

function todoQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString();
  return suffix ? `?${suffix}` : '';
}

async function todoFetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Todo request failed (${res.status})`);
  return data;
}

async function loadTodoPatients() {
  const res = await fetch(`${TODO_API_BASE}/patients`);
  if (!res.ok) throw new Error('Could not load patients');
  todoPatients = await res.json();
  renderTodoPatientSelectors();
  return todoPatients;
}

function renderTodoPatientSelectors() {
  const filter = document.getElementById('todos-patient-filter');
  const create = document.getElementById('todos-new-patient');
  if (filter) {
    const current = filter.value;
    filter.innerHTML = '<option value="">All patients + ward</option><option value="__untagged">Ward-level only</option>' + todoPatients
      .filter((patient) => !String(patient.id || '').endsWith('_dc'))
      .map((patient) => `<option value="${todoEscHtml(patient.id)}">${todoEscHtml(patient.name || patient.id)}</option>`)
      .join('');
    filter.value = current;
  }
  if (create) {
    const current = create.value;
    create.innerHTML = todoPatientOptions(current, true);
    create.value = current;
  }
}

async function createTodo(payload, patientId) {
  const url = patientId ? `${TODO_API_BASE}/patients/${encodeURIComponent(patientId)}/todos` : `${TODO_API_BASE}/todos`;
  const data = await todoFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.item;
}

async function updateTodo(todoId, payload) {
  const data = await todoFetchJson(`${TODO_API_BASE}/todos/${encodeURIComponent(todoId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.item;
}

async function deleteTodo(todoId) {
  await todoFetchJson(`${TODO_API_BASE}/todos/${encodeURIComponent(todoId)}`, { method: 'DELETE' });
}

async function fetchTodos(params) {
  const data = await todoFetchJson(`${TODO_API_BASE}/todos${todoQuery(params)}`);
  return data.items || [];
}

async function fetchPatientTodos(pid, status = 'open') {
  if (!pid) return [];
  const data = await todoFetchJson(`${TODO_API_BASE}/patients/${encodeURIComponent(pid)}/todos${todoQuery({ status })}`);
  return data.items || [];
}

async function findOpenPatientTodoByTitle(pid, title) {
  const normalizedTitle = String(title || '').trim().toLowerCase();
  if (!pid || !normalizedTitle) return null;
  let items = [];
  try {
    items = patientVisibleTodos(await fetchPatientTodos(pid, 'open'), pid);
  } catch (err) {
    items = activeTodoPatientId === pid ? activePatientTodos : [];
  }
  return items.find((item) => String(item.title || '').trim().toLowerCase() === normalizedTitle) || null;
}

function setGeneratedTodoButtonState(buttonEl, label, tone, resetAfterMs) {
  if (!buttonEl) return;
  if (!buttonEl.dataset.defaultLabel) buttonEl.dataset.defaultLabel = buttonEl.textContent || 'Create task';
  buttonEl.textContent = label || buttonEl.dataset.defaultLabel;
  buttonEl.classList.remove('success', 'error', 'warn');
  if (tone) buttonEl.classList.add(tone);
  if (resetAfterMs && typeof setTimeout === 'function') {
    setTimeout(() => {
      buttonEl.textContent = buttonEl.dataset.defaultLabel || 'Create task';
      buttonEl.classList.remove('success', 'error', 'warn');
      buttonEl.disabled = false;
    }, resetAfterMs);
  }
}

async function createGeneratedPatientTodo(pid, payload, buttonEl) {
  const safePayload = {
    title: String(payload && payload.title || '').trim(),
    priority: TODO_PRIORITIES.includes(payload && payload.priority) ? payload.priority : 'normal',
    due_at: (payload && payload.due_at) || defaultGeneratedTodoDueAt(),
    note: String(payload && payload.note || '').trim(),
  };
  if (!pid || !safePayload.title) return { status: 'invalid' };

  const defaultDisabled = buttonEl ? buttonEl.disabled : false;
  if (buttonEl) {
    buttonEl.disabled = true;
    setGeneratedTodoButtonState(buttonEl, 'Checking...', '', 0);
  }

  try {
    const existing = await findOpenPatientTodoByTitle(pid, safePayload.title);
    if (existing) {
      setGeneratedTodoButtonState(buttonEl, 'Already open', 'warn', 1800);
      return { status: 'duplicate', item: existing };
    }
    setGeneratedTodoButtonState(buttonEl, 'Adding...', '', 0);
    const item = await createTodo(safePayload, pid);
    await refreshTodoSurfaces(pid);
    setGeneratedTodoButtonState(buttonEl, 'Task added', 'success', 1800);
    return { status: 'created', item };
  } catch (err) {
    setGeneratedTodoButtonState(buttonEl, 'Failed', 'error', 2200);
    return { status: 'error', error: err };
  } finally {
    if (buttonEl && (!buttonEl.classList || (!buttonEl.classList.contains('success') && !buttonEl.classList.contains('warn') && !buttonEl.classList.contains('error')))) {
      buttonEl.disabled = defaultDisabled;
    }
  }
}

function todoLabActionLabel(labKey) {
  const key = String(labKey || '').trim();
  if (key === 'Cr') return 'Order/check Cr';
  if (key === 'INR') return 'Order/check INR';
  if (key === 'Plt') return 'Order/check platelets';
  if (key === 'K') return 'Order/check K';
  if (key === 'QTc') return 'Check QTc';
  if (key === 'eGFR') return 'Check renal function';
  return key ? `Order/check ${key}` : 'Check missing monitoring data';
}

function buildMissingDataTodoPayload(alert) {
  const labKey = Array.isArray(alert && alert.labKeys) && alert.labKeys.length ? alert.labKeys[0] : '';
  const meds = Array.isArray(alert && alert.medicationKeys) && alert.medicationKeys.length
    ? `Medication trigger: ${alert.medicationKeys.join(', ')}.`
    : '';
  return {
    title: todoLabActionLabel(labKey),
    priority: alert && (alert.tone === 'danger' || alert.tone === 'warn') ? 'high' : 'normal',
    due_at: defaultGeneratedTodoDueAt(),
    note: [
      'Created from Missing Data alert.',
      alert && alert.title ? `Alert: ${alert.title}.` : '',
      alert && alert.body ? alert.body : '',
      meds,
    ].filter(Boolean).join('\n'),
  };
}

async function handleMissingDataTodoCreateFromButton(buttonEl) {
  const pid = buttonEl && buttonEl.dataset ? buttonEl.dataset.pid : '';
  const key = buttonEl && buttonEl.dataset ? buttonEl.dataset.alertKey : '';
  const context = typeof activePatientContext !== 'undefined' ? activePatientContext : null;
  const alerts = context && Array.isArray(context.insights) ? context.insights : [];
  const alert = alerts.find((item) => item && item.kind === 'missing_monitoring_data' && String(item.key || '') === key);
  if (!alert) {
    setGeneratedTodoButtonState(buttonEl, 'Alert gone', 'warn', 1800);
    return { status: 'missing-alert' };
  }
  return createGeneratedPatientTodo(pid, buildMissingDataTodoPayload(alert), buttonEl);
}

async function updateTodosNavBadge(items) {
  const badge = document.getElementById('todos-nav-badge');
  if (!badge) return;
  try {
    const source = Array.isArray(items) ? items : await fetchTodos({ status: 'open' });
    const counts = summarizeTodoDueCounts(source);
    if (!counts.dueAttention) {
      badge.style.display = 'none';
      badge.textContent = '0';
      badge.className = 'nav-badge';
      badge.title = '';
      return;
    }
    badge.style.display = '';
    badge.textContent = String(counts.dueAttention);
    badge.className = `nav-badge ${counts.overdue ? 'danger' : 'warn'}`;
    badge.title = counts.overdue
      ? `${counts.overdue} overdue, ${counts.dueToday} due today`
      : `${counts.dueToday} due today`;
  } catch (err) {
    badge.style.display = 'none';
  }
}

function renderTodoRow(item, context) {
  const isPage = context === 'page';
  const dueTone = todoDueTone(item.due_at, item.status);
  return `<div class="todo-row ${todoEscHtml(item.priority || 'normal')} ${item.status === 'done' ? 'done' : ''}" data-todo-id="${todoEscHtml(item.id)}">
    <div class="todo-row-top">
      <label class="todo-check">
        <input type="checkbox" ${item.status === 'done' ? 'checked' : ''} onchange="handleTodoToggle('${todoEscHtml(item.id)}', this.checked)">
      </label>
      <input class="todo-title-input" value="${todoEscHtml(item.title)}" placeholder="Task">
      <select class="todo-priority-select">${todoPriorityOptions(item.priority || 'normal')}</select>
      ${isPage ? `<select class="todo-patient-select">${todoPatientOptions(item.patient_id || '', true)}</select>` : `<span class="todo-patient-chip">${todoEscHtml(todoPatientLabel(item.patient_id))}</span>`}
      <input class="todo-due-input" type="text" inputmode="numeric" value="${todoEscHtml(todoDueInputValue(item.due_at))}" placeholder="20260505 1745" title="Due date/time, e.g. 20260505 1745" onblur="normalizeTodoDueField(this)">
      <button class="btn-secondary todo-save-btn" onclick="handleTodoSave('${todoEscHtml(item.id)}')">Save</button>
      <button class="todo-delete-btn" onclick="handleTodoDelete('${todoEscHtml(item.id)}')" title="Delete">&#10005;</button>
    </div>
    <textarea class="todo-note-input" placeholder="Optional note">${todoEscHtml(item.note || '')}</textarea>
    <div class="todo-row-meta">
      <span class="todo-priority-pill ${todoEscHtml(item.priority || 'normal')}">${todoEscHtml(item.priority || 'normal')}</span>
      ${item.due_at ? `<span class="todo-due-pill ${todoEscHtml(dueTone)}">${todoEscHtml(formatTodoDue(item.due_at))}</span>` : '<span>No due date</span>'}
      ${item.status === 'done' ? `<span>Done ${todoEscHtml(formatTodoDue(item.completed_at) || '')}</span>` : '<span>Open</span>'}
    </div>
  </div>`;
}

function renderPatientTodoRow(item) {
  const note = (item.note || '').trim();
  const noteAttr = note ? ` title="${todoEscHtml(note)}" data-note="${todoEscHtml(note)}"` : '';
  return `<div class="pc-todo-row ${todoEscHtml(item.priority || 'normal')}" data-todo-id="${todoEscHtml(item.id)}">
    <label class="pc-todo-check">
      <input type="checkbox" onchange="handleTodoToggle('${todoEscHtml(item.id)}', this.checked)">
    </label>
    <span class="pc-todo-title"${noteAttr}>${todoEscHtml(item.title || 'Untitled task')}</span>
  </div>`;
}

function renderTodosList(items, containerId, context) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sorted = sortTodos(items);
  const open = sorted.filter((item) => item.status !== 'done');
  const done = sorted.filter((item) => item.status === 'done');
  if (!sorted.length) {
    el.innerHTML = '<div class="todos-empty">No todos match this view.</div>';
    return;
  }
  if (context === 'patient') {
    el.innerHTML = open.length ? open.map((item) => renderPatientTodoRow(item)).join('') : '<div class="todos-empty">No open patient todos.</div>';
    return;
  }
  const statusFilter = document.getElementById('todos-status-filter')?.value || 'open';
  const openHtml = open.map((item) => renderTodoRow(item, 'page')).join('');
  const doneHtml = done.map((item) => renderTodoRow(item, 'page')).join('');
  if (statusFilter === 'open') {
    el.innerHTML = (openHtml || '<div class="todos-empty">No open todos.</div>') + (done.length ? `
      <details class="todos-done-section">
        <summary>Completed (${done.length})</summary>
        ${doneHtml}
      </details>` : '');
    return;
  }
  el.innerHTML = sorted.map((item) => renderTodoRow(item, 'page')).join('');
}

function setTodosPageStatus(message, tone) {
  const el = document.getElementById('todos-page-status');
  if (!el) return;
  el.textContent = message || '';
  el.className = `todos-status ${tone || ''}`;
}

async function loadTodosPage() {
  const list = document.getElementById('todos-list');
  if (list) list.innerHTML = '<div class="todos-empty">Loading todos...</div>';
  try {
    if (!todoPatients.length) await loadTodoPatients();
    const statusFilter = document.getElementById('todos-status-filter')?.value || 'open';
    const patientFilter = document.getElementById('todos-patient-filter')?.value || '';
    const priorityFilter = document.getElementById('todos-priority-filter')?.value || '';
    const queryStatus = statusFilter === 'open' ? 'all' : statusFilter;
    const params = { status: queryStatus, priority: priorityFilter };
    if (patientFilter === '__untagged') params.untagged = 'true';
    else if (patientFilter) params.patient_id = patientFilter;
    todoPageItems = await fetchTodos(params);
    if (statusFilter === 'done') todoPageItems = todoPageItems.filter((item) => item.status === 'done');
    renderTodosList(todoPageItems, 'todos-list', 'page');
    updateTodosNavBadge();
    const openCount = todoPageItems.filter((item) => item.status !== 'done').length;
    const countEl = document.getElementById('todos-count');
    if (countEl) countEl.textContent = `${openCount} open · ${todoPageItems.length} total`;
    setTodosPageStatus('', '');
  } catch (err) {
    if (list) list.innerHTML = `<div class="todos-empty error">${todoEscHtml(err.message)}</div>`;
  }
}

async function initTodosPage() {
  if (!todosPageInitialized) {
    todosPageInitialized = true;
    await loadTodoPatients();
  }
  return loadTodosPage();
}

async function handleTodosPageCreate() {
  const titleEl = document.getElementById('todos-new-title');
  const due = readTodoDueInput(document.getElementById('todos-new-due'));
  if (!due.ok) {
    setTodosPageStatus('Use YYYYMMDD HHMM or YYYY/MM/DD HH:MM for due time.', 'error');
    return;
  }
  const payload = {
    title: (titleEl?.value || '').trim(),
    priority: document.getElementById('todos-new-priority')?.value || 'normal',
    patient_id: document.getElementById('todos-new-patient')?.value || null,
    due_at: due.value,
    note: (document.getElementById('todos-new-note')?.value || '').trim(),
  };
  if (!payload.title) {
    setTodosPageStatus('Title required.', 'error');
    return;
  }
  try {
    await createTodo(payload);
    if (titleEl) titleEl.value = '';
    const noteEl = document.getElementById('todos-new-note');
    const dueEl = document.getElementById('todos-new-due');
    if (noteEl) noteEl.value = '';
    if (dueEl) dueEl.value = '';
    await refreshTodoSurfaces(payload.patient_id);
    setTodosPageStatus('Added.', 'success');
  } catch (err) {
    setTodosPageStatus(err.message, 'error');
  }
}

function readTodoRow(todoId) {
  const row = document.querySelector(`[data-todo-id="${todoEscHtml(todoId)}"]`);
  if (!row) return null;
  const due = readTodoDueInput(row.querySelector('.todo-due-input'));
  if (!due.ok) return { error: 'Use YYYYMMDD HHMM or YYYY/MM/DD HH:MM for due time.' };
  return {
    title: row.querySelector('.todo-title-input')?.value.trim() || '',
    priority: row.querySelector('.todo-priority-select')?.value || 'normal',
    patient_id: row.querySelector('.todo-patient-select') ? (row.querySelector('.todo-patient-select').value || null) : undefined,
    due_at: due.value,
    note: row.querySelector('.todo-note-input')?.value.trim() || '',
  };
}

async function handleTodoSave(todoId) {
  const payload = readTodoRow(todoId);
  if (payload && payload.error) {
    setTodosPageStatus(payload.error, 'error');
    return;
  }
  if (!payload || !payload.title) return;
  try {
    const item = await updateTodo(todoId, payload);
    await refreshTodoSurfaces(item && item.patient_id);
  } catch (err) {
    setTodosPageStatus(err.message, 'error');
  }
}

async function handleTodoToggle(todoId, checked) {
  try {
    const item = await updateTodo(todoId, { status: checked ? 'done' : 'open' });
    await refreshTodoSurfaces(item && item.patient_id);
  } catch (err) {
    setTodosPageStatus(err.message, 'error');
  }
}

async function handleTodoDelete(todoId) {
  const existing = [...todoPageItems, ...activePatientTodos].find((item) => item.id === todoId);
  try {
    await deleteTodo(todoId);
    await refreshTodoSurfaces(existing && existing.patient_id);
  } catch (err) {
    setTodosPageStatus(err.message, 'error');
  }
}

async function refreshTodoSurfaces(patientId) {
  const activePid = activeTodoPatientId || patientId || (typeof activePatientId !== 'undefined' ? activePatientId : '');
  const tasks = [];
  if (document.getElementById('todos-list')) tasks.push(loadTodosPage());
  if (activePid) tasks.push(loadPatientTodos(activePid));
  tasks.push(updateTodosNavBadge());
  await Promise.all(tasks);
}

function renderPatientTodoAddForm(pid) {
  return `<div class="todos-form pc-todos-form" id="pc-todos-add-form" style="display:none;">
    <input id="pc-todos-new-title" type="text" placeholder="Task for this patient">
    <select id="pc-todos-new-priority">${todoPriorityOptions('normal')}</select>
    <input id="pc-todos-new-due" type="text" inputmode="numeric" placeholder="20260505 1745" title="Due date/time, e.g. 20260505 1745" onblur="normalizeTodoDueField(this)">
    <button class="btn-primary" onclick="handlePatientTodoCreate('${todoEscHtml(pid)}')">Add</button>
    <textarea id="pc-todos-new-note" class="todos-note-input" placeholder="Optional note"></textarea>
    <div class="todos-status" id="pc-todos-status"></div>
  </div>`;
}

function setPatientTodoAddFormOpen(open) {
  const form = document.getElementById('pc-todos-add-form');
  const btn = document.getElementById('pc-todos-add-toggle');
  if (form) form.style.display = open ? '' : 'none';
  if (btn) {
    btn.textContent = open ? 'Cancel' : 'Add';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (open) document.getElementById('pc-todos-new-title')?.focus();
}

function togglePatientTodoAddForm() {
  const form = document.getElementById('pc-todos-add-form');
  setPatientTodoAddFormOpen(!form || form.style.display === 'none');
}

function renderTodosSection(pid) {
  return `<section class="pc-page-card">
    <div class="pc-page-card-header pc-todos-header">
      <div>
        <div class="pc-page-card-title">Patient Todos <span class="pc-pending-count-badge" id="pc-todos-count-badge">0 open</span></div>
        <div class="pc-page-card-copy">Action items tagged to this patient.</div>
      </div>
      <button class="btn-secondary pc-todos-add-toggle" id="pc-todos-add-toggle" type="button" aria-expanded="false" onclick="togglePatientTodoAddForm()">Add</button>
    </div>
    <div class="pc-page-card-body">
      ${renderPatientTodoAddForm(pid || '')}
      <div id="pc-todos-panel" class="todos-list patient">Loading todos...</div>
    </div>
  </section>`;
}

async function loadPatientTodos(pid) {
  activeTodoPatientId = pid || '';
  if (!pid) {
    activePatientTodos = [];
    renderPatientTodosPanel();
    return;
  }
  try {
    if (!todoPatients.length) await loadTodoPatients();
    activePatientTodos = patientVisibleTodos(await fetchPatientTodos(pid, 'open'), pid);
  } catch (err) {
    activePatientTodos = [];
    const el = document.getElementById('pc-todos-panel');
    if (el) el.innerHTML = `<div class="todos-empty error">${todoEscHtml(err.message)}</div>`;
    return;
  }
  renderPatientTodosPanel();
}

function renderPatientTodosPanel() {
  const badge = document.getElementById('pc-todos-count-badge');
  if (badge) {
    const high = activePatientTodos.filter((item) => item.priority === 'high').length;
    badge.textContent = high ? `${activePatientTodos.length} open · ${high} high` : `${activePatientTodos.length} open`;
    badge.className = `pc-pending-count-badge ${high ? 'warn' : 'info'}`;
  }
  renderTodosList(activePatientTodos, 'pc-todos-panel', 'patient');
}

async function handlePatientTodoCreate(pid) {
  const titleEl = document.getElementById('pc-todos-new-title');
  const statusEl = document.getElementById('pc-todos-status');
  const due = readTodoDueInput(document.getElementById('pc-todos-new-due'));
  if (!due.ok) {
    if (statusEl) { statusEl.textContent = 'Use YYYYMMDD HHMM or YYYY/MM/DD HH:MM for due time.'; statusEl.className = 'todos-status error'; }
    return;
  }
  const payload = {
    title: (titleEl?.value || '').trim(),
    priority: document.getElementById('pc-todos-new-priority')?.value || 'normal',
    due_at: due.value,
    note: (document.getElementById('pc-todos-new-note')?.value || '').trim(),
  };
  if (!payload.title) {
    if (statusEl) { statusEl.textContent = 'Title required.'; statusEl.className = 'todos-status error'; }
    return;
  }
  try {
    await createTodo(payload, pid);
    if (titleEl) titleEl.value = '';
    const dueEl = document.getElementById('pc-todos-new-due');
    const noteEl = document.getElementById('pc-todos-new-note');
    if (dueEl) dueEl.value = '';
    if (noteEl) noteEl.value = '';
    await refreshTodoSurfaces(pid);
    setPatientTodoAddFormOpen(false);
    if (statusEl) { statusEl.textContent = 'Added.'; statusEl.className = 'todos-status success'; }
  } catch (err) {
    if (statusEl) { statusEl.textContent = err.message; statusEl.className = 'todos-status error'; }
  }
}

if (typeof window !== 'undefined') {
  window.__todosTestApi = {
    sortTodos,
    patientVisibleTodos,
    todoPriorityRank,
    todoDueTone,
    parseTodoDueInput,
    todoDueInputValue,
    defaultGeneratedTodoDueAt,
    summarizeTodoDueCounts,
    updateTodosNavBadge,
    findOpenPatientTodoByTitle,
    createGeneratedPatientTodo,
    buildMissingDataTodoPayload,
    handleMissingDataTodoCreateFromButton,
    handlePatientTodoCreate,
    renderTodoRow,
    renderPatientTodoRow,
    renderTodosList,
    renderTodosSection,
  };
}

if (typeof document !== 'undefined') {
  const bootTodosNavBadge = () => updateTodosNavBadge();
  if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', bootTodosNavBadge);
  } else {
    bootTodosNavBadge();
  }
}
