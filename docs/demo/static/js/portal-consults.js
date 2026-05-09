const CONSULTS_ACTIVE_PATIENT_KEY = 'medical-portal-active-patient-id';
const CONSULTS_API_KEY_STORAGE = 'medical-portal-api-key';
// Model selection is owned by portal-shell.js — use getStoredAiModel() instead of local constants.

const consultsState = {
  patientId: '',
  specialty: '',
  specialtyOther: '',
  note: '',
  opinion: '',
  patientSummary: null,
  aiAvailable: false,
  loadingNote: false,
  loadingOpinion: false,
};

function escConsultsHtml(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getConsultsHeaders(extra) {
  const headers = { 'Content-Type': 'application/json', ...(extra || {}) };
  const key = localStorage.getItem(CONSULTS_API_KEY_STORAGE);
  if (key) headers['X-API-Key'] = key;
  headers['X-OpenRouter-Model'] = (typeof getStoredAiModel === 'function') ? getStoredAiModel() : 'anthropic/claude-sonnet-4.6';
  return headers;
}

function consultsStatusEl() {
  return document.getElementById('consults-status');
}

function setConsultsStatus(message, tone) {
  const el = consultsStatusEl();
  if (!el) return;
  if (!message) {
    el.className = 'consults-status';
    el.textContent = '';
    return;
  }
  el.className = `consults-status ${tone || 'info'}`;
  el.textContent = message;
}

function renderConsultPatientSummary() {
  const el = document.getElementById('consults-patient-summary');
  if (!el) return;
  const summary = consultsState.patientSummary;
  if (!summary) {
    el.innerHTML = '<div class="consults-empty">No patient selected.</div>';
    return;
  }

  const rows = [
    ['Name', summary.name || 'Unknown'],
    ['Admitted', summary.admitted || '—'],
    ['Diagnosis', summary.dx || '—'],
    ['Age / Sex', `${summary.age || '—'}${summary.sex || ''}` || '—'],
    ['Patient ID', summary.id || '—'],
  ];

  el.innerHTML = rows.map(([label, value]) => `
    <div class="consults-summary-row">
      <span>${escConsultsHtml(label)}</span>
      <strong>${escConsultsHtml(value)}</strong>
    </div>
  `).join('');
}

function clearConsultOutputs() {
  consultsState.note = '';
  consultsState.opinion = '';
  const noteEl = document.getElementById('consults-note-output');
  const opinionEl = document.getElementById('consults-opinion-output');
  if (noteEl) noteEl.value = '';
  if (opinionEl) opinionEl.textContent = 'No specialist opinion yet.';
}

function updateConsultsButtons() {
  const patientOk = !!consultsState.patientId;
  const specialtyOk = !!consultsState.specialty && (consultsState.specialty !== 'other' || !!consultsState.specialtyOther.trim());
  const noteOk = !!(document.getElementById('consults-note-output')?.value || '').trim();

  const genBtn = document.getElementById('consults-generate-btn');
  const opinionBtn = document.getElementById('consults-opinion-btn');
  const copyBtn = document.getElementById('consults-copy-btn');
  const aiBanner = document.getElementById('consults-ai-banner');

  if (genBtn) {
    genBtn.disabled = !consultsState.aiAvailable || !patientOk || !specialtyOk || consultsState.loadingNote;
    genBtn.textContent = consultsState.loadingNote ? 'Generating...' : 'Generate Consult Note';
  }

  if (opinionBtn) {
    opinionBtn.disabled = !consultsState.aiAvailable || !patientOk || !specialtyOk || !noteOk || consultsState.loadingOpinion;
    opinionBtn.textContent = consultsState.loadingOpinion ? 'Consulting...' : 'Get Specialist Opinion';
  }

  if (copyBtn) {
    copyBtn.disabled = !noteOk;
  }

  if (aiBanner) {
    aiBanner.classList.toggle('active', !consultsState.aiAvailable);
  }
}

async function fetchConsultPatientSummary(pid) {
  const res = await fetch(`/s/handoff/api/patients/${pid}`);
  if (!res.ok) throw new Error('Patient not found');
  const data = await res.json();
  const match = (data.content || '').match(/\*\*Age\/Sex:\*\*\s*(\d+)\s*([MF])/i);
  return {
    id: data.id,
    name: data.name,
    admitted: data.admitted,
    dx: data.dx,
    age: match ? match[1] : '',
    sex: match ? match[2].toUpperCase() : '',
  };
}

async function setConsultPatient(pid, options = {}) {
  const nextId = pid || '';
  const changed = consultsState.patientId !== nextId;
  consultsState.patientId = nextId;

  const select = document.getElementById('consults-patient-select');
  if (select && select.value !== nextId) select.value = nextId;

  if (!nextId) {
    consultsState.patientSummary = null;
    clearConsultOutputs();
    renderConsultPatientSummary();
    updateConsultsButtons();
    return;
  }

  try {
    consultsState.patientSummary = await fetchConsultPatientSummary(nextId);
    renderConsultPatientSummary();
    if (changed) {
      clearConsultOutputs();
      setConsultsStatus('', '');
    }
    updateConsultsButtons();
    if (options.syncGlobal && typeof openPatientContextById === 'function') {
      openPatientContextById(nextId, { open: false }).catch(() => {});
    }
  } catch (err) {
    consultsState.patientSummary = null;
    renderConsultPatientSummary();
    clearConsultOutputs();
    setConsultsStatus(err.message, 'error');
  }
}

async function refreshConsultPatientList() {
  const select = document.getElementById('consults-patient-select');
  if (!select) return;

  select.innerHTML = '<option value="">Loading patients...</option>';
  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) throw new Error('Handoff service unavailable');
    const patients = await res.json();
    const activePatients = patients.filter((patient) => !patient.id.endsWith('_dc'));
    select.innerHTML = '<option value="">Select patient</option>';
    activePatients.forEach((patient) => {
      const option = document.createElement('option');
      option.value = patient.id;
      option.textContent = `${patient.name} (${patient.dx || 'no dx'})`;
      select.appendChild(option);
    });

    const preferredId = consultsState.patientId
      || localStorage.getItem(CONSULTS_ACTIVE_PATIENT_KEY)
      || '';

    if (preferredId && activePatients.some((patient) => patient.id === preferredId)) {
      await setConsultPatient(preferredId);
    } else if (!activePatients.length) {
      await setConsultPatient('');
      setConsultsStatus('No active patients available in Handoff.', 'info');
    } else {
      setConsultsStatus('', '');
      updateConsultsButtons();
    }
  } catch (err) {
    select.innerHTML = '<option value="">Patients unavailable</option>';
    await setConsultPatient('');
    setConsultsStatus(`${err.message}. Is Handoff Tool running?`, 'error');
  }
}

function handleConsultSpecialtyChange() {
  const specialtyEl = document.getElementById('consults-specialty-select');
  const otherEl = document.getElementById('consults-specialty-other');
  consultsState.specialty = specialtyEl ? specialtyEl.value : '';
  if (otherEl) {
    otherEl.disabled = consultsState.specialty !== 'other';
    if (consultsState.specialty !== 'other') {
      otherEl.value = '';
      consultsState.specialtyOther = '';
    }
  }
  clearConsultOutputs();
  setConsultsStatus('', '');
  updateConsultsButtons();
}

function syncConsultNoteState() {
  const noteEl = document.getElementById('consults-note-output');
  consultsState.note = noteEl ? noteEl.value : '';
  consultsState.opinion = '';
  const opinionEl = document.getElementById('consults-opinion-output');
  if (opinionEl) opinionEl.textContent = 'No specialist opinion yet.';
  updateConsultsButtons();
}

async function checkConsultsAiStatus() {
  try {
    const key = localStorage.getItem(CONSULTS_API_KEY_STORAGE);
    const headers = key ? { 'X-API-Key': key } : {};
    const res = await fetch('/s/handoff/api/ai-status', { headers });
    const data = await res.json();
    consultsState.aiAvailable = !!data.ai_available;
  } catch (err) {
    consultsState.aiAvailable = false;
  }
  updateConsultsButtons();
}

async function generateConsultNote() {
  const specialtyOtherEl = document.getElementById('consults-specialty-other');
  consultsState.specialtyOther = specialtyOtherEl ? specialtyOtherEl.value.trim() : '';
  updateConsultsButtons();

  consultsState.loadingNote = true;
  updateConsultsButtons();
  setConsultsStatus('Generating consult note...', 'info');

  try {
    const res = await fetch('/s/handoff/api/consults/note', {
      method: 'POST',
      headers: getConsultsHeaders(),
      body: JSON.stringify({
        patient_id: consultsState.patientId,
        specialty: consultsState.specialty,
        specialty_other: consultsState.specialtyOther,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Consult note generation failed');

    consultsState.note = data.note || '';
    consultsState.opinion = '';
    if (data.patient_summary) {
      consultsState.patientSummary = data.patient_summary;
      renderConsultPatientSummary();
    }

    const noteEl = document.getElementById('consults-note-output');
    const opinionEl = document.getElementById('consults-opinion-output');
    if (noteEl) noteEl.value = consultsState.note;
    if (opinionEl) opinionEl.textContent = 'No specialist opinion yet.';
    setConsultsStatus(`Consult note generated for ${data.specialty_label}.`, 'success');
  } catch (err) {
    setConsultsStatus(err.message, 'error');
  } finally {
    consultsState.loadingNote = false;
    updateConsultsButtons();
  }
}

async function getConsultOpinion() {
  const noteEl = document.getElementById('consults-note-output');
  const consultNote = noteEl ? noteEl.value.trim() : '';
  consultsState.specialtyOther = (document.getElementById('consults-specialty-other')?.value || '').trim();
  consultsState.loadingOpinion = true;
  updateConsultsButtons();
  setConsultsStatus('Requesting specialist opinion...', 'info');

  try {
    const res = await fetch('/s/handoff/api/consults/opinion', {
      method: 'POST',
      headers: getConsultsHeaders(),
      body: JSON.stringify({
        patient_id: consultsState.patientId,
        specialty: consultsState.specialty,
        specialty_other: consultsState.specialtyOther,
        consult_note: consultNote,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Specialist opinion failed');

    consultsState.opinion = data.opinion || '';
    const opinionEl = document.getElementById('consults-opinion-output');
    if (opinionEl) opinionEl.textContent = consultsState.opinion || 'No specialist opinion yet.';
    setConsultsStatus(`Specialist opinion received from ${data.specialty_label}.`, 'success');
  } catch (err) {
    setConsultsStatus(err.message, 'error');
  } finally {
    consultsState.loadingOpinion = false;
    updateConsultsButtons();
  }
}

async function copyConsultNote() {
  const noteEl = document.getElementById('consults-note-output');
  const text = noteEl ? noteEl.value.trim() : '';
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    setConsultsStatus('Consult note copied.', 'success');
  } catch (err) {
    if (noteEl) {
      noteEl.focus();
      noteEl.select();
    }
    document.execCommand('copy');
    setConsultsStatus('Consult note copied.', 'success');
  }
}

function initConsults() {
  const patientEl = document.getElementById('consults-patient-select');
  const specialtyEl = document.getElementById('consults-specialty-select');
  const specialtyOtherEl = document.getElementById('consults-specialty-other');
  const noteEl = document.getElementById('consults-note-output');

  if (!patientEl || !specialtyEl || !specialtyOtherEl || !noteEl) return;

  patientEl.addEventListener('change', () => setConsultPatient(patientEl.value, { syncGlobal: true }));
  specialtyEl.addEventListener('change', handleConsultSpecialtyChange);
  specialtyOtherEl.addEventListener('input', () => {
    consultsState.specialtyOther = specialtyOtherEl.value.trim();
    clearConsultOutputs();
    setConsultsStatus('', '');
    updateConsultsButtons();
  });
  noteEl.addEventListener('input', syncConsultNoteState);

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'api-key-changed') {
      checkConsultsAiStatus();
    }
  });

  window.addEventListener('patient-context-updated', (event) => {
    const patientId = event.detail && event.detail.patientId ? event.detail.patientId : '';
    setConsultPatient(patientId);
  });

  checkConsultsAiStatus();
  refreshConsultPatientList();
  updateConsultsButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConsults);
} else {
  initConsults();
}
