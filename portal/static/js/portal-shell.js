// ---------------------------------------------------------------------------
// Theme management
// ---------------------------------------------------------------------------
const THEME_KEY = 'medical-portal-theme';
const API_KEY_STORAGE = 'medical-portal-api-key';

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
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

// ---------------------------------------------------------------------------
// Settings — API Key management
// ---------------------------------------------------------------------------
function openSettings() {
  const overlay = document.getElementById('settings-overlay');
  const input = document.getElementById('settings-api-key');
  overlay.classList.add('active');
  const saved = localStorage.getItem(API_KEY_STORAGE) || '';
  input.value = saved;
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

function saveApiKey() {
  const key = document.getElementById('settings-api-key').value.trim();
  const st = document.getElementById('settings-status');
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
    localStorage.setItem('openrouterApiKey', key);
    st.textContent = 'API key saved to this browser.';
    st.className = 'settings-status success';
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem('openrouterApiKey');
    st.textContent = 'API key removed.';
    st.className = 'settings-status info';
  }
  updateApiKeyIndicator();
  broadcastApiKeyStatus();
}

function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem('openrouterApiKey');
  document.getElementById('settings-api-key').value = '';
  const st = document.getElementById('settings-status');
  st.textContent = 'API key removed from this browser.';
  st.className = 'settings-status info';
  updateApiKeyIndicator();
  broadcastApiKeyStatus();
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
      headers: { 'X-API-Key': key },
    });
    const data = await res.json();
    if (data.ai_available) {
      st.textContent = 'Connection OK — AI features will use this key.';
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
    const headers = key ? { 'X-API-Key': key } : {};
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

  if (data && data.ai_available) {
    const src = data.source === 'header' ? 'browser key' : 'server key';
    ind.className = 'api-key-indicator active';
    ind.innerHTML = `&#10003; AI enabled (${src})`;
    btn.classList.add('has-key');
  } else if (hasLocalKey) {
    ind.className = 'api-key-indicator active';
    ind.innerHTML = '&#10003; Browser key saved';
    btn.classList.add('has-key');
  } else {
    ind.className = 'api-key-indicator inactive';
    ind.innerHTML = '&#9888; No API key — AI features disabled';
    btn.classList.remove('has-key');
  }
}

function broadcastApiKeyStatus() {
  document.querySelectorAll('iframe').forEach((iframe) => {
    try {
      iframe.contentWindow.postMessage({ type: 'api-key-changed' }, '*');
    } catch (e) {}
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSettings();
});

setTimeout(checkAiStatus, 2000);

(function syncAdmissionsKey() {
  const k = localStorage.getItem(API_KEY_STORAGE);
  if (k) localStorage.setItem('openrouterApiKey', k);
})();

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

function switchView(name) {
  currentView = name;
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === `view-${name}`);
  });
}

// ---------------------------------------------------------------------------
// Status polling + iframe lifecycle
// ---------------------------------------------------------------------------
const cacheBust = Date.now();
const iframeServices = {
  handoff: { url: '/s/handoff/', loaded: false },
  admissions: { url: `/s/admissions/?v=${cacheBust}`, loaded: false },
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
    const res = await fetch('/api/status');
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
// Keyboard shortcuts: Alt+1–5 and Alt+8 to switch views
// ---------------------------------------------------------------------------
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.altKey) {
    switch (e.key) {
      case '1': e.preventDefault(); switchView('handoff'); break;
      case '2': e.preventDefault(); switchView('admissions'); break;
      case '3': e.preventDefault(); switchView('phi'); break;
      case '4': e.preventDefault(); switchView('calculator'); break;
      case '5': e.preventDefault(); switchView('census'); break;
      case '8': e.preventDefault(); switchView('casemaker'); break;
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === '[') {
    e.preventDefault();
    toggleSidebar();
  }
});
