(function () {
  function applyLockdown() {
    document.body.classList.add('demo-handoff-demo');
    if (!document.querySelector('.demo-mode-banner')) {
      const banner = document.createElement('div');
      banner.className = 'demo-mode-banner';
      banner.textContent = 'Demo mode: synthetic patients only. New, delete, and discharge are disabled.';
      document.body.insertBefore(banner, document.body.firstChild);
    }
    document.querySelectorAll('.js-discharge-patient, .js-delete-patient').forEach((btn) => {
      btn.disabled = true;
      btn.style.display = 'none';
    });
    document.querySelectorAll('[onclick="openNewPatientModal()"]').forEach((btn) => {
      btn.disabled = true;
      btn.title = 'Demo mode uses preloaded synthetic patients';
      btn.textContent = 'Demo only';
    });
    const append = document.getElementById('append-input');
    if (append) append.placeholder = 'Demo-only in-memory note. Do not enter real patient information.';
  }

  window.openNewPatientModal = function () { alert('Demo mode uses preloaded synthetic patients only.'); };
  window.createPatient = function () { alert('Demo mode cannot add patients.'); };
  window.dischargePatient = function () { alert('Demo mode cannot discharge patients.'); };
  window.deletePatient = function () { alert('Demo mode cannot delete patients.'); };

  if (typeof window.loadPatients === 'function' && !window.loadPatients.__demoPatched) {
    const originalLoadPatients = window.loadPatients;
    window.loadPatients = async function () {
      const patients = await originalLoadPatients.apply(this, arguments);
      applyLockdown();
      return patients;
    };
    window.loadPatients.__demoPatched = true;
  }
  if (typeof window.checkAiAvailable === 'function') {
    const originalCheck = window.checkAiAvailable;
    window.checkAiAvailable = async function () {
      await originalCheck.apply(this, arguments);
      window.aiAvailable = true;
      if (typeof window.updateAiUI === 'function') window.updateAiUI();
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyLockdown);
  else applyLockdown();
})();