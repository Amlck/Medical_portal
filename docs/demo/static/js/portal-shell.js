// ---------------------------------------------------------------------------
// Theme management
// ---------------------------------------------------------------------------
const THEME_KEY = 'medical-portal-theme';
const API_KEY_STORAGE = 'medical-portal-api-key';
const AI_MODEL_STORAGE = 'medical-portal-ai-model';
const DEFAULT_AI_MODEL = 'anthropic/claude-sonnet-4.6';
const AI_MODEL_OPTIONS = {
  'anthropic/claude-sonnet-4.6': 'Claude Sonnet 4.6',
  'anthropic/claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'openai/gpt-5.4': 'GPT-5.4',
  'google/gemini-3.1-pro-preview': 'Gemini 3.1 Pro',
};

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function normalizeAiModel(model) {
  return AI_MODEL_OPTIONS[model] ? model : DEFAULT_AI_MODEL;
}

function getStoredAiModel() {
  return normalizeAiModel(localStorage.getItem(AI_MODEL_STORAGE) || '');
}

function getAiModelLabel(model) {
  return AI_MODEL_OPTIONS[normalizeAiModel(model)] || AI_MODEL_OPTIONS[DEFAULT_AI_MODEL];
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon) icon.innerHTML = theme === 'dark' ? '&#9790;' : '&#9788;';
  if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

function broadcastTheme(theme) {
  document.querySelectorAll('iframe').forEach((iframe) => {
    try { iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*'); } catch (e) {}
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  broadcastTheme(next);
}

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'theme-request') {
    const theme = getStoredTheme();
    try { e.source.postMessage({ type: 'theme-change', theme }, '*'); } catch (err) {}
  }
});

applyTheme(getStoredTheme());

(function migrateApiKeyStorage() {
  try {
    const oldKey = localStorage.getItem('openrouterApiKey');
    if (oldKey) {
      // Copy to new key before removing, so existing users don't lose AI access.
      if (!localStorage.getItem(API_KEY_STORAGE)) {
        localStorage.setItem(API_KEY_STORAGE, oldKey);
      }
      localStorage.removeItem('openrouterApiKey');
    }
    const oldModel = localStorage.getItem('openrouterModel');
    if (oldModel) {
      if (!localStorage.getItem(AI_MODEL_STORAGE) && AI_MODEL_OPTIONS[oldModel]) {
        localStorage.setItem(AI_MODEL_STORAGE, oldModel);
      }
      localStorage.removeItem('openrouterModel');
    }
  } catch (err) {}
})();

// ---------------------------------------------------------------------------
// Settings — AI configuration
// ---------------------------------------------------------------------------
function openSettings() {
  const overlay = document.getElementById('settings-overlay');
  const input = document.getElementById('settings-api-key');
  const modelSelect = document.getElementById('settings-ai-model');
  overlay.classList.add('active');
  const saved = localStorage.getItem(API_KEY_STORAGE) || '';
  input.value = saved;
  if (modelSelect) modelSelect.value = getStoredAiModel();
  input.type = 'password';
  document.getElementById('settings-eye-btn').innerHTML = '&#128065;';
  const st = document.getElementById('settings-status');
  st.className = 'settings-status';
  st.style.display = 'none';
  checkAiStatus();
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('active');
}

function openShortcutHelp() {
  const overlay = document.getElementById('shortcut-help-overlay');
  if (overlay) overlay.classList.add('active');
}

function closeShortcutHelp() {
  const overlay = document.getElementById('shortcut-help-overlay');
  if (overlay) overlay.classList.remove('active');
}

function isTypingTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!target.isContentEditable;
}

function toggleKeyVisibility() {
  const input = document.getElementById('settings-api-key');
  const btn = document.getElementById('settings-eye-btn');
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '&#128064;';
  } else {
    input.type = 'password';
    btn.innerHTML = '&#128065;';
  }
}

function saveAiSettings() {
  const key = document.getElementById('settings-api-key').value.trim();
  const model = normalizeAiModel(document.getElementById('settings-ai-model')?.value || '');
  const st = document.getElementById('settings-status');
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
    st.textContent = `AI settings saved. Using ${getAiModelLabel(model)}.`;
    st.className = 'settings-status success';
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
    st.textContent = `API key removed. Model remains ${getAiModelLabel(model)}.`;
    st.className = 'settings-status info';
  }
  localStorage.setItem(AI_MODEL_STORAGE, model);
  updateApiKeyIndicator();
  broadcastAiConfigStatus();
}

function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
  document.getElementById('settings-api-key').value = '';
  const st = document.getElementById('settings-status');
  st.textContent = `API key removed from this browser. Model stays ${getAiModelLabel(getStoredAiModel())}.`;
  st.className = 'settings-status info';
  updateApiKeyIndicator();
  broadcastAiConfigStatus();
}

async function testApiKey() {
  const key = document.getElementById('settings-api-key').value.trim();
  const st = document.getElementById('settings-status');
  if (!key) {
    st.textContent = 'Enter an API key first.';
    st.className = 'settings-status error';
    return;
  }
  st.textContent = 'Testing connection...';
  st.className = 'settings-status info';
  try {
    const res = await fetch('/s/handoff/api/ai-status', {
      headers: { 'X-API-Key': key, 'X-OpenRouter-Model': getStoredAiModel() },
    });
    const data = await res.json();
    if (data.ai_available) {
      st.textContent = `Connection OK — AI features will use ${getAiModelLabel(getStoredAiModel())}.`;
      st.className = 'settings-status success';
    } else {
      st.textContent = 'Key was sent but server reports no AI available.';
      st.className = 'settings-status error';
    }
  } catch (err) {
    st.textContent = 'Could not reach handoff service. Is the portal running?';
    st.className = 'settings-status error';
  }
}

async function checkAiStatus() {
  try {
    const key = localStorage.getItem(API_KEY_STORAGE) || '';
    const headers = key ? { 'X-API-Key': key, 'X-OpenRouter-Model': getStoredAiModel() } : { 'X-OpenRouter-Model': getStoredAiModel() };
    const res = await fetch('/s/handoff/api/ai-status', { headers });
    const data = await res.json();
    updateApiKeyIndicator(data);
  } catch (e) {
    updateApiKeyIndicator(null);
  }
}

function updateApiKeyIndicator(data) {
  const ind = document.getElementById('api-key-indicator');
  const btn = document.getElementById('settings-toggle');
  const hasLocalKey = !!localStorage.getItem(API_KEY_STORAGE);
  const modelLabel = getAiModelLabel(getStoredAiModel());

  if (data && data.ai_available) {
    const src = data.source === 'header' ? 'browser key' : 'server key';
    ind.className = 'api-key-indicator active';
    ind.innerHTML = `&#10003; AI enabled (${src}, ${modelLabel})`;
    btn.classList.add('has-key');
  } else if (hasLocalKey) {
    ind.className = 'api-key-indicator active';
    ind.innerHTML = `&#10003; Browser key saved (${modelLabel})`;
    btn.classList.add('has-key');
  } else {
    ind.className = 'api-key-indicator inactive';
    ind.innerHTML = `&#9888; No API key — AI features disabled (${modelLabel})`;
    btn.classList.remove('has-key');
  }
}

function broadcastAiConfigStatus() {
  document.querySelectorAll('iframe').forEach((iframe) => {
    try {
      iframe.contentWindow.postMessage({ type: 'ai-config-changed', model: getStoredAiModel() }, '*');
      iframe.contentWindow.postMessage({ type: 'api-key-changed' }, '*');
    } catch (e) {}
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeShortcutHelp();
    closeSettings();
  }
});

setTimeout(checkAiStatus, 2000);

// ---------------------------------------------------------------------------
// Sidebar toggle
// ---------------------------------------------------------------------------
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ---------------------------------------------------------------------------
// View switching
// ---------------------------------------------------------------------------
let currentView = 'handoff';
let lastNonPatientContextView = 'handoff';

function switchView(name) {
  if (name !== 'patient-context') lastNonPatientContextView = name;
  currentView = name;
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === `view-${name}`);
  });
  if (name === 'patient-context' && typeof renderPatientContextWorkspace === 'function') {
    renderPatientContextWorkspace();
  }
  if (name === 'ward' && typeof loadWardBoard === 'function') {
    loadWardBoard();
  }
  if (name === 'todos' && typeof initTodosPage === 'function') {
    initTodosPage();
  }
  if (name === 'import' && typeof initImport === 'function') {
    initImport();
  }
  if (name === 'rules' && typeof renderRulesCatalog === 'function') {
    renderRulesCatalog();
  }
}

function getPatientContextBackView() {
  return lastNonPatientContextView || 'handoff';
}

// ---------------------------------------------------------------------------
// Status polling + iframe lifecycle
// ---------------------------------------------------------------------------
const cacheBust = Date.now();
const iframeServices = {
  handoff: { url: 's/handoff/index.html', loaded: false },
  admissions: { url: `s/admissions/index.html?v=${cacheBust}`, loaded: false },
};

function updateServiceUI(name, alive) {
  const dot = document.getElementById(`dot-${name}`);
  const overlay = document.getElementById(`offline-${name}`);
  const iframe = document.getElementById(`iframe-${name}`);
  const svc = iframeServices[name];

  if (alive) {
    dot.classList.add('alive');
    dot.classList.remove('dead');

    if (!svc.loaded) {
      iframe.src = svc.url;
      svc.loaded = true;
      iframe.addEventListener('load', () => broadcastTheme(getStoredTheme()), { once: true });
    }
    overlay.style.display = 'none';
    iframe.style.display = 'block';
  } else {
    dot.classList.remove('alive');
    dot.classList.add('dead');
    overlay.style.display = 'flex';
    iframe.style.display = 'none';

    if (svc.loaded) {
      svc.loaded = false;
      overlay.innerHTML = `
        <span class="offline-icon">&#9888;</span>
        <span>Service stopped</span>
        <span style="font-size:0.6rem;">Will reconnect automatically when it comes back</span>
      `;
    }
  }
}

async function pollStatus() {
  try {
    const res = await fetch('api/status');
    const status = await res.json();

    for (const name of Object.keys(iframeServices)) {
      const alive = status[name] && status[name].alive;
      updateServiceUI(name, alive);
    }
  } catch (e) {}
}

let pollCount = 0;
function schedulePoll() {
  pollCount += 1;
  const interval = pollCount < 10 ? 1500 : 5000;
  setTimeout(() => { pollStatus().then(schedulePoll); }, interval);
}

setTimeout(() => { pollStatus().then(schedulePoll); }, 1000);

// ---------------------------------------------------------------------------
// Listen for messages from iframes
// ---------------------------------------------------------------------------
window.addEventListener('message', (e) => {
  if (!e.data || !e.data.type) return;

  if (e.data.type === 'handoff-refresh') {
    const iframe = document.getElementById('iframe-handoff');
    if (iframe && iframe.src) {
      iframe.contentWindow.location.reload();
    }
    if (typeof loadSidebarPatientList === 'function') {
      loadSidebarPatientList();
    }
    if (typeof invalidatePatientContextCache === 'function') {
      invalidatePatientContextCache(e.data.patientId || '');
    }
    if (e.data.patientId && typeof openPatientContextById === 'function') {
      openPatientContextById(e.data.patientId).catch(() => {});
    }
  }

  if (e.data.type === 'handoff-patient-selected' || e.data.type === 'handoff-patient-created') {
    if (e.data.patientId && typeof openPatientContextById === 'function') {
      openPatientContextById(e.data.patientId).catch(() => {});
    } else if (!e.data.patientId && typeof clearActivePatientContext === 'function') {
      clearActivePatientContext();
    }
    if (typeof loadSidebarPatientList === 'function') {
      loadSidebarPatientList();
    }
  }

  if (e.data.type === 'open-print-chart' && e.data.html) {
    const blob = new Blob([e.data.html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, '_blank', 'width=900,height=700');
    if (!printWin) {
      alert('Popup blocked. Please allow popups for this site and try again.');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
});

// ---------------------------------------------------------------------------
// Keyboard shortcuts: Alt+1–8 to switch views
// ---------------------------------------------------------------------------
document.addEventListener('keydown', (e) => {
  if (isTypingTarget(e.target)) return;
  if (e.altKey) {
    switch (e.key) {
      case '1': e.preventDefault(); switchView('handoff'); break;
      case '2': e.preventDefault(); switchView('admissions'); break;
      case '3': e.preventDefault(); switchView('phi'); break;
      case '4': e.preventDefault(); switchView('calculator'); break;
      case '5': e.preventDefault(); switchView('ward'); break;
      case '6': e.preventDefault(); switchView('abx'); break;
      case '7': e.preventDefault(); switchView('drugs'); break;
      case '8': e.preventDefault(); switchView('consults'); break;
      case '9': e.preventDefault(); if (typeof openPatientContextWorkspace === 'function') openPatientContextWorkspace(); break;
      case '0': e.preventDefault(); openShortcutHelp(); break;
    }
  }
  if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === '?') {
    e.preventDefault();
    openShortcutHelp();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === '[') {
    e.preventDefault();
    toggleSidebar();
  }
});
