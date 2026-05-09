// ---------------------------------------------------------------------------
// Code Status & Goals of Care — per-patient structured metadata
// Panel rendered inside the Patient Context Workspace (top of right column).
// Also feeds the Ward Board code status column.
// See FEATURES.md §Feature 4 for full spec.
// ---------------------------------------------------------------------------

// --------------- State -------------------------------------------------------

let activePatientMeta = null;    // meta object for the current patient
let activePatientMetaPatientId = '';
let metaLoading = false;
let metaLoadRequestSeq = 0;

const CODE_STATUS_OPTIONS = [
  { value: 'full',     label: 'Full Code',  cls: 'code-full'    },
  { value: 'dnr',      label: 'DNR',        cls: 'code-dnr'     },
  { value: 'dnr_dni',  label: 'DNR-DNI',    cls: 'code-dnr-dni' },
  { value: 'comfort',  label: 'Comfort',    cls: 'code-comfort'  },
  { value: 'unknown',  label: 'Unknown',    cls: 'code-unknown'  },
];

const DEFAULT_META = {
  code_status: 'unknown',
  code_status_date: '',
  code_status_updated_by: '',
  dnr_date: null,
  surrogate_name: '',
  surrogate_contact: '',
  surrogate_relationship: '',
  goc_note: '',
  goc_last_discussed: '',
};

// --------------- Utility -----------------------------------------------------

function metaEscHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCodeStatusOption(value) {
  return CODE_STATUS_OPTIONS.find(o => o.value === value) || CODE_STATUS_OPTIONS.find(o => o.value === 'unknown');
}

// --------------- API helpers -------------------------------------------------

async function loadPatientMeta(pid) {
  // TODO: GET /s/handoff/api/patients/<pid>/meta
  // On success: set activePatientMeta = data.meta and call renderCodeStatusPanel()
  // If 404: set activePatientMeta = DEFAULT_META and render
  const requestSeq = ++metaLoadRequestSeq;
  if (!pid) { activePatientMeta = { ...DEFAULT_META }; activePatientMetaPatientId = ''; renderCodeStatusPanel(); return; }
  activePatientMetaPatientId = pid;
  try {
    metaLoading = true;
    const res = await fetch(`/s/handoff/api/patients/${pid}/meta`);
    if (requestSeq !== metaLoadRequestSeq) return;
    if (res.status === 404) {
      activePatientMeta = { ...DEFAULT_META };
      activePatientMetaPatientId = pid;
    } else if (!res.ok) {
      throw new Error(`Meta fetch failed (${res.status})`);
    } else {
      const data = await res.json();
      if (requestSeq !== metaLoadRequestSeq) return;
      activePatientMeta = { ...DEFAULT_META, ...(data.meta || {}) };
      activePatientMetaPatientId = pid;
    }
  } catch (e) {
    if (requestSeq !== metaLoadRequestSeq) return;
    activePatientMeta = { ...DEFAULT_META };
    activePatientMetaPatientId = pid;
    console.warn('[meta] loadPatientMeta error:', e.message);
  } finally {
    if (requestSeq !== metaLoadRequestSeq) return;
    metaLoading = false;
    renderCodeStatusPanel();
  }
}

async function savePatientMeta(pid, fields) {
  // TODO: PUT /s/handoff/api/patients/<pid>/meta
  // Merges fields into the existing meta — does NOT replace the full object.
  const res = await fetch(`/s/handoff/api/patients/${pid}/meta`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save code status');
  }
  const data = await res.json();
  activePatientMeta = { ...DEFAULT_META, ...(data.meta || {}) };
  activePatientMetaPatientId = pid;
  renderCodeStatusPanel();
  return activePatientMeta;
}

// --------------- Render ------------------------------------------------------

function renderCodeStatusBadgeLarge(status) {
  // TODO: return HTML for a prominent colored badge.
  const opt = getCodeStatusOption(status);
  return `<span class="pc-code-badge ${opt.cls}">${metaEscHtml(opt.label)}</span>`;
}

function renderCodeStatusPanel() {
  const el = document.getElementById('pc-code-status-panel');
  if (!el) return;

  const meta = activePatientMeta || DEFAULT_META;
  const opt  = getCodeStatusOption(meta.code_status);
  const dateStr = meta.code_status_date ? `Confirmed ${metaEscHtml(meta.code_status_date)}` : 'Date not recorded';

  el.innerHTML = `
    <div class="pc-code-status-row">
      ${renderCodeStatusBadgeLarge(meta.code_status)}
      <span class="pc-code-date">${dateStr}</span>
      <button class="btn-secondary pc-code-edit-btn" onclick="openCodeStatusEditForm()">Edit</button>
    </div>
    <details class="pc-goc-details" ${meta.surrogate_name || meta.goc_note ? 'open' : ''}>
      <summary class="pc-goc-summary">Goals of Care</summary>
      <div class="pc-goc-body">
        ${meta.surrogate_name ? `<div class="pc-goc-row"><span class="pc-goc-label">Surrogate</span><span>${metaEscHtml(meta.surrogate_name)}${meta.surrogate_relationship ? ` (${metaEscHtml(meta.surrogate_relationship)})` : ''}</span></div>` : ''}
        ${meta.surrogate_contact ? `<div class="pc-goc-row"><span class="pc-goc-label">Contact</span><span>${metaEscHtml(meta.surrogate_contact)}</span></div>` : ''}
        ${meta.goc_last_discussed ? `<div class="pc-goc-row"><span class="pc-goc-label">Last discussed</span><span>${metaEscHtml(meta.goc_last_discussed)}</span></div>` : ''}
        ${meta.goc_note ? `<div class="pc-goc-note">${metaEscHtml(meta.goc_note)}</div>` : '<div class="pc-empty">No goals of care note recorded.</div>'}
    </div>
  </details>`;
  if (typeof renderDailyRoundingChecklistPanel === 'function') {
    renderDailyRoundingChecklistPanel();
  }
}

function openCodeStatusEditForm() {
  // TODO: replace #pc-code-status-panel content with an edit form,
  // then on Save call savePatientMeta(activePatientId, fields).
  const el = document.getElementById('pc-code-status-panel');
  if (!el) return;
  const meta = activePatientMeta || DEFAULT_META;
  const pid  = (typeof activePatientId !== 'undefined') ? activePatientId : '';

  const opts = CODE_STATUS_OPTIONS.map(o =>
    `<option value="${o.value}" ${meta.code_status === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');

  el.innerHTML = `
    <div class="pc-code-edit-form">
      <div class="pc-vitals-form-row">
        <label>Code status</label>
        <select id="edit-code-status">${opts}</select>
        <label>Date confirmed</label>
        <input type="date" id="edit-code-date" value="${metaEscHtml(meta.code_status_date)}">
      </div>
      <div class="pc-vitals-form-row">
        <label>Surrogate</label>
        <input type="text" id="edit-surrogate-name" value="${metaEscHtml(meta.surrogate_name)}" placeholder="Name">
        <input type="text" id="edit-surrogate-rel"  value="${metaEscHtml(meta.surrogate_relationship)}" placeholder="Relationship" style="width:8rem;">
        <input type="text" id="edit-surrogate-tel"  value="${metaEscHtml(meta.surrogate_contact)}" placeholder="Contact / phone" style="flex:2;">
      </div>
      <div class="pc-vitals-form-row">
        <label>GoC discussed</label>
        <input type="date" id="edit-goc-date" value="${metaEscHtml(meta.goc_last_discussed)}" style="width:10rem;">
        <label>GoC note</label>
        <textarea id="edit-goc-note" rows="2" style="flex:3;font-size:0.72rem;">${metaEscHtml(meta.goc_note)}</textarea>
      </div>
      <div style="display:flex;gap:0.4rem;margin-top:0.5rem;">
        <button class="btn-primary" onclick="handleSaveCodeStatus('${metaEscHtml(pid)}')">Save</button>
        <button class="btn-secondary" onclick="renderCodeStatusPanel()">Cancel</button>
      </div>
      <div class="pc-vitals-status" id="pc-code-status-edit-status"></div>
    </div>`;
}

async function handleSaveCodeStatus(pid) {
  const fields = {
    code_status:             document.getElementById('edit-code-status')?.value || 'unknown',
    code_status_date:        document.getElementById('edit-code-date')?.value   || '',
    surrogate_name:          document.getElementById('edit-surrogate-name')?.value.trim() || '',
    surrogate_relationship:  document.getElementById('edit-surrogate-rel')?.value.trim()  || '',
    surrogate_contact:       document.getElementById('edit-surrogate-tel')?.value.trim()  || '',
    goc_last_discussed:      document.getElementById('edit-goc-date')?.value   || '',
    goc_note:                document.getElementById('edit-goc-note')?.value.trim()        || '',
  };
  const statusEl = document.getElementById('pc-code-status-edit-status');
  try {
    await savePatientMeta(pid, fields);
    // renderCodeStatusPanel() is called by savePatientMeta on success
  } catch (e) {
    if (statusEl) { statusEl.textContent = e.message; statusEl.className = 'pc-vitals-status error'; }
  }
}

// --------------- Integration -------------------------------------------------
//
// In portal-patient-context.js, renderPatientContextWorkspace() should:
// 1. Include a <section class="pc-page-card"> at the TOP of the right column:
//      <div class="pc-page-card-title">Code Status</div>
//      <div id="pc-code-status-panel">Loading...</div>
// 2. After setting innerHTML, call loadPatientMeta(activePatientId).
//
// Ward Board integration:
// - fetchWardPatientData() already reads meta.code_status from /api/patients/<pid>/meta
// - renderWardRow() calls renderCodeStatusBadge() from portal-ward.js
//   (keep a simple version there; portal-meta.js has the full version with edit support)
