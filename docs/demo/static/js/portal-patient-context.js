function getActivePatientClinicalSnapshot() {
  return activePatientContext;
}

function getActivePatientId() {
  return activePatientId;
}

function getActivePatientDisplayName() {
  return activePatientContext && activePatientContext.name ? activePatientContext.name : '';
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
  if (typeof resetPatientContextWorkspacePanels === 'function') {
    resetPatientContextWorkspacePanels();
  }
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

function openPatientContextCalculator() {
  if (!activePatientId) return;
  if (typeof switchView === 'function') switchView('calculator');
  if (typeof loadPatientIntoCalc === 'function') loadPatientIntoCalc(activePatientId);
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

function restoreActivePatientContext() {
  updatePatientContextToggle();
  return loadSidebarPatientList()
    .then(() => renderPatientContextWorkspace())
    .then(() => {
      if (!activePatientId) return;
      return fetchPatientContextRecord(activePatientId)
        .then((data) => applyActivePatientContext(data))
        .catch(() => clearActivePatientContext());
    });
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
  buildHandoffReportText,
  formatHandoffIoLine,
  getActiveHandoffReportExtras,
  buildWeeklySummaryPayload,
  formatWeeklySummaryText,
  buildStructuredMedicationDiff,
  isAntibioticMedication,
  calculateMedicationDay,
  buildAntibioticDayCounters,
  buildRenalMedicationAlerts,
  getInsightCriteriaText,
  getPatientContextAlertItems,
  getPatientContextAlertState,
  getContextStaleness,
  parseClinicalTimestamp,
  getPatientLastSeenAt,
  setPatientLastSeenAt,
  buildSinceLastReviewSnapshot,
  buildDailyRoundingChecklist,
  renderDailyRoundingChecklistItems,
  renderDailyRoundingChecklistPanel,
  isAlertMuted,
  muteAlert,
  muteAlertType,
  unmuteAlert,
  unmuteAlertType,
  buildPatientContextWorkspaceHtml,
  buildPatientContextWorkspaceBody,
  getPatientContextWorkspaceSection,
  setPatientContextWorkspaceSection,
  syncPatientContextWorkspacePanels,
  resetPatientContextWorkspacePanels,
  getActivePatientClinicalSnapshot,
  getActivePatientId,
  getActivePatientDisplayName,
  isPatientContextDrawerOpen,
  updatePatientContextAlertBadge,
  acknowledgeCurrentPatientContextAlerts,
  markActivePatientSeen,
  updatePatientContextToggle,
  syncActivePatientSelect,
  syncSidebarPatientSelect,
  updateSidebarPatientMeta,
  renderPatientContextDrawer,
  renderPatientContextWorkspace,
  renderSidebarPatientList,
  loadSidebarPatientList,
  fetchPatientContextRecord,
  invalidatePatientContextCache,
  openPatientContextById,
  openPatientContextWorkspaceById,
  refreshActivePatientContext,
  schedulePatientContextPolling,
  pollActivePatientContext,
  handleSidebarPatientSelect,
  openSidebarSelectedPatient,
  openPatientContextDrawer,
  closePatientContextDrawer,
  togglePatientContextDrawer,
  openPatientContextWorkspace,
  openPatientInHandoff,
  openPatientContextCalculator,
  copyHandoffReport,
  copyWeeklySummary,
  appendWeeklySummaryToRecord,
  restoreActivePatientContext,
  applyActivePatientContext,
  setActivePatientContext,
  clearActivePatientContext,
};

if (!window.__PATIENT_CONTEXT_DISABLE_BOOT__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreActivePatientContext);
  } else {
    restoreActivePatientContext();
  }
}
