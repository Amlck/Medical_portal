(function () {
  function addBanner() {
    if (document.querySelector('.demo-mode-banner')) return;
    document.body.classList.add('demo-mode');
    const banner = document.createElement('div');
    banner.className = 'demo-mode-banner';
    banner.textContent = 'Demo mode: synthetic data, in-memory edits, canned AI responses. Do not enter real patient information.';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function disableSettingsInputs() {
    ['settings-api-key', 'settings-ai-model'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
    const input = document.getElementById('settings-api-key');
    if (input) input.placeholder = 'Demo uses canned responses; no API key accepted.';
    const status = document.getElementById('settings-status');
    if (status) {
      status.style.display = 'block';
      status.className = 'settings-status info';
      status.textContent = 'Static demo mode uses canned AI output and never sends AI requests.';
    }
  }

  function lockdownPhi() {
    const drop = document.getElementById('drop-area');
    if (drop) {
      drop.classList.add('demo-disabled');
      drop.onclick = null;
      drop.querySelector('.drop-text').textContent = 'PHI upload disabled in public demo';
      drop.querySelector('.drop-hint').textContent = 'Use only the synthetic demo patients.';
    }
    const input = document.getElementById('phi-file-input');
    if (input) input.disabled = true;
    window.processFile = function () {
      alert('Demo mode disables PHI upload. Use synthetic data only.');
    };
  }

  function patchSettings() {
    if (typeof window.openSettings === 'function' && !window.openSettings.__demoPatched) {
      const original = window.openSettings;
      window.openSettings = function () {
        original.apply(this, arguments);
        disableSettingsInputs();
      };
      window.openSettings.__demoPatched = true;
    }
    window.saveAiSettings = function () { disableSettingsInputs(); };
    window.testApiKey = function () { disableSettingsInputs(); };
    window.clearApiKey = function () { disableSettingsInputs(); };
  }

  function init() {
    addBanner();
    disableSettingsInputs();
    lockdownPhi();
    patchSettings();
    try { localStorage.removeItem('medical-portal-api-key'); } catch (err) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();