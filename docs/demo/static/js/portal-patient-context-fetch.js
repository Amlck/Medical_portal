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
  const requestPromise = Promise.all([
      fetch(`/s/handoff/api/patients/${pid}`),
      fetch(`/s/handoff/api/patients/${pid}/medications`).catch(() => null),
      fetch(`/s/handoff/api/patients/${pid}/problems`).catch(() => null),
    ])
    .then(async ([patientRes, medsRes, problemsRes]) => {
      if (!patientRes || !patientRes.ok) throw new Error('Patient not found');
      const data = await patientRes.json();
      const medications = medsRes && medsRes.ok ? await medsRes.json() : { medications: { baseline: [], current: [], changes: [] } };
      const problems = problemsRes && problemsRes.ok ? await problemsRes.json() : { problems: { problems: [] } };
      const enriched = {
        ...data,
        modified: data && data.modified ? data.modified : knownModified,
        medications: medications && medications.medications ? medications.medications : { baseline: [], current: [], changes: [] },
        problems: problems && problems.problems ? problems.problems : { problems: [] },
      };
      const resolvedKey = getPatientContextCacheKey(pid, enriched.modified || knownModified);
      if (resolvedKey !== cacheKey) {
        patientContextFetchCache.set(resolvedKey, Promise.resolve(enriched));
        patientContextFetchCache.delete(cacheKey);
      }
      return enriched;
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
