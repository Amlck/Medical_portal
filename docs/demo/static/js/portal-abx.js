// ---------------------------------------------------------------------------
// Antibiotic Empiric Guide
// ---------------------------------------------------------------------------

// ABX guide data loaded from external file

let abxActiveFilter = 'all';
let abxSevFilter = 'all';
const ABX_API_KEY_STORAGE = 'medical-portal-api-key';
// Model selection is owned by portal-shell.js — use getStoredAiModel() instead of local constants.
const abxDeescState = {
  aiAvailable: false,
  loading: false,
  patientId: '',
  snapshot: null,
  result: null,
};

// Helper: strip HTML tags from a string (for plain-text copy)
function abxStripHtml(s) { return (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
// Helper: HTML-encode for use inside data-* attributes
function abxEncAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// Helper: escape regex special characters
function abxEscRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function abxEscHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ---------------------------------------------------------------------------
// Drug Detail Database — click any drug name in the guide to open its panel
// ---------------------------------------------------------------------------
// Drug database loaded from external file

// Build drug link lookup (sorted longest first for single-pass replacement)
function buildDrugAliasIndex() {
  const entries = [];
  Object.entries(DRUG_DATA).forEach(([key, drug]) => {
    drug.aliases.forEach(alias => entries.push({ alias, key }));
  });
  entries.sort((a, b) => b.alias.length - a.alias.length);
  return entries;
}
const DRUG_ALIAS_INDEX = buildDrugAliasIndex();

function linkifyDrugNames(text) {
  if (!text) return text || '';
  const pattern = DRUG_ALIAS_INDEX.map(e => abxEscRe(e.alias)).join('|');
  if (!pattern) return text;
  const aliasMap = {};
  DRUG_ALIAS_INDEX.forEach(({ alias, key }) => { aliasMap[alias.toLowerCase()] = key; });
  const regex = new RegExp('(?<![\\w\\-])(' + pattern + ')(?![\\w\\-])', 'gi');
  return text.replace(regex, (match) => {
    const key = aliasMap[match.toLowerCase()];
    if (!key || !DRUG_DATA[key]) return match;
    return `<span class="drug-link" onclick="openDrugPanel('${key}')" title="${DRUG_DATA[key].name} — click for details">${match}</span>`;
  });
}

const BUG_DRUG_SITE_OPTIONS = [
  { value: 'generic', label: 'General' },
  { value: 'bacteremia', label: 'Bloodstream / Endovascular' },
  { value: 'pneumonia', label: 'Pneumonia' },
  { value: 'uti', label: 'Urinary' },
  { value: 'ssti', label: 'Skin / Soft Tissue' },
];

const BUG_DRUG_LOOKUP = [
  {
    id: 'mssa',
    label: 'MSSA',
    sites: {
      generic: {
        preferred: ['Cefazolin', 'Oxacillin / nafcillin if available'],
        alternatives: ['Amoxicillin-clavulanate or cephalexin for mild oral step-down when appropriate'],
        avoid: ['Do not default to vancomycin when a beta-lactam can be used for proven MSSA.'],
        pearls: ['Cefazolin is often preferred for tolerability. De-escalate once cultures confirm MSSA.'],
      },
      bacteremia: {
        preferred: ['Cefazolin'],
        alternatives: ['Antistaphylococcal penicillin if available and tolerated'],
        avoid: ['Avoid treating MSSA bacteremia with vancomycin alone when a beta-lactam is usable.'],
        pearls: ['Search for source control issues and metastatic seeding.'],
      },
    },
  },
  {
    id: 'mrsa',
    label: 'MRSA',
    sites: {
      generic: {
        preferred: ['Vancomycin', 'Linezolid', 'Daptomycin'],
        alternatives: ['TMP-SMX for mild susceptible SSTI', 'Ceftaroline in salvage settings'],
        avoid: ['Do not use daptomycin for pneumonia.', 'Do not keep empiric MRSA coverage longer than needed once cultures are back.'],
        pearls: ['Choose the drug by site: linezolid for lung, daptomycin for bloodstream, vancomycin when AUC-guided dosing is feasible.'],
      },
      pneumonia: {
        preferred: ['Linezolid', 'Vancomycin'],
        alternatives: ['Ceftaroline in selected salvage cases'],
        avoid: ['Avoid daptomycin because pulmonary surfactant inactivates it.'],
        pearls: ['Review concurrent serotonergic medications before linezolid.'],
      },
      bacteremia: {
        preferred: ['Vancomycin', 'Daptomycin'],
        alternatives: ['Ceftaroline salvage combination after ID review'],
        avoid: ['Do not rely on linezolid alone for persistent MRSA bacteremia.'],
        pearls: ['Repeat blood cultures and assess for endocarditis or hardware.'],
      },
      ssti: {
        preferred: ['TMP-SMX', 'Doxycycline', 'Clindamycin if susceptible', 'Vancomycin for severe infection'],
        alternatives: ['Linezolid when oral bioavailability matters'],
        avoid: ['Do not skip incision and drainage for a drainable abscess.'],
        pearls: ['For simple abscesses, source control may matter more than broader antibiotics.'],
      },
    },
  },
  {
    id: 'esbl',
    label: 'ESBL Enterobacterales',
    sites: {
      generic: {
        preferred: ['Ertapenem', 'Meropenem'],
        alternatives: ['Culture-directed narrower beta-lactam only when susceptibility and source support it'],
        avoid: ['Avoid piperacillin-tazobactam for confirmed ESBL bacteremia when a carbapenem is indicated.'],
        pearls: ['Ertapenem is useful when Pseudomonas coverage is not needed; meropenem is preferred for shock or ICU illness.'],
      },
      bacteremia: {
        preferred: ['Meropenem', 'Ertapenem if stable and source controlled'],
        alternatives: ['Step down only after cultures and clinical stability'],
        avoid: ['Avoid ceftriaxone or piperacillin-tazobactam for proven ESBL bloodstream infection unless there is a very specific susceptibility-based reason.'],
        pearls: ['Think about urinary or biliary source control and de-escalate once safe.'],
      },
      uti: {
        preferred: ['Ertapenem', 'Meropenem'],
        alternatives: ['Culture-directed oral step-down in carefully selected uncomplicated cases'],
        avoid: ['Do not assume every ESBL UTI needs prolonged IV therapy once source and susceptibilities are clear.'],
        pearls: ['Stable urinary sources are the easiest place to simplify therapy once the organism profile is known.'],
      },
    },
  },
  {
    id: 'cre-kpc',
    label: 'CRE / KPC',
    sites: {
      generic: {
        preferred: ['Ceftazidime-avibactam', 'Meropenem-vaborbactam for KPC if available'],
        alternatives: ['Combination therapy after ID review for refractory or limited-susceptibility cases'],
        avoid: ['Do not assume ceftazidime-avibactam covers metallo-beta-lactamases such as NDM, IMP, or VIM.'],
        pearls: ['Match the agent to the carbapenemase. KPC behaves differently from MBL producers.'],
      },
      bacteremia: {
        preferred: ['Ceftazidime-avibactam'],
        alternatives: ['Meropenem-vaborbactam when the phenotype is clearly KPC'],
        avoid: ['Avoid polymyxin monotherapy when a newer active beta-lactam exists.'],
        pearls: ['If MBL is suspected, think ceftazidime-avibactam plus aztreonam rather than ceftazidime-avibactam alone.'],
      },
    },
  },
  {
    id: 'pseudomonas',
    label: 'Pseudomonas aeruginosa',
    sites: {
      generic: {
        preferred: ['Piperacillin-tazobactam', 'Cefepime', 'Meropenem'],
        alternatives: ['Ceftolozane-tazobactam or ceftazidime-avibactam for MDR non-MBL isolates'],
        avoid: ['Avoid ertapenem and ceftriaxone because they do not cover Pseudomonas.'],
        pearls: ['Choose antipseudomonal therapy based on local susceptibility and source severity.'],
      },
      pneumonia: {
        preferred: ['Cefepime', 'Piperacillin-tazobactam', 'Meropenem'],
        alternatives: ['Ceftolozane-tazobactam for MDR non-MBL isolates'],
        avoid: ['Do not use ertapenem or rely on oral fluoroquinolone step-down unless susceptibility is solid and the patient is stable.'],
        pearls: ['Extended infusion beta-lactams can help when MICs are borderline.'],
      },
      uti: {
        preferred: ['Cefepime', 'Piperacillin-tazobactam'],
        alternatives: ['Ciprofloxacin or levofloxacin if susceptible and oral step-down is appropriate'],
        avoid: ['Do not assume fluoroquinolone susceptibility without checking the report.'],
        pearls: ['Urinary source plus known susceptibility is where oral step-down is most realistic.'],
      },
    },
  },
  {
    id: 'vre',
    label: 'VRE (E. faecium)',
    sites: {
      generic: {
        preferred: ['Linezolid', 'Daptomycin'],
        alternatives: ['Tigecycline in selected non-bacteremic tissue infections'],
        avoid: ['Avoid daptomycin for pneumonia.', 'Avoid tigecycline monotherapy for bloodstream infection.'],
        pearls: ['Linezolid is versatile for lung and tissue. Daptomycin is generally preferred for bloodstream infection.'],
      },
      bacteremia: {
        preferred: ['Daptomycin'],
        alternatives: ['Linezolid when daptomycin cannot be used'],
        avoid: ['Avoid low-dose daptomycin when serious enterococcal bacteremia is present.'],
        pearls: ['Higher daptomycin doses are often needed for VRE bloodstream infection.'],
      },
      pneumonia: {
        preferred: ['Linezolid'],
        alternatives: ['None strong outside specialist salvage decisions'],
        avoid: ['Avoid daptomycin for pulmonary infection.'],
        pearls: ['Check CBC if linezolid is going to run beyond a short course.'],
      },
    },
  },
  {
    id: 'steno',
    label: 'Stenotrophomonas maltophilia',
    sites: {
      generic: {
        preferred: ['TMP-SMX'],
        alternatives: ['Levofloxacin', 'Minocycline'],
        avoid: ['Avoid carbapenems because Stenotrophomonas is intrinsically resistant.'],
        pearls: ['Think of it in patients worsening while on broad carbapenem exposure.'],
      },
      pneumonia: {
        preferred: ['TMP-SMX', 'Levofloxacin'],
        alternatives: ['Minocycline'],
        avoid: ['Do not keep escalating carbapenems if cultures suggest Stenotrophomonas.'],
        pearls: ['This is often a breakthrough pathogen after heavy beta-lactam exposure.'],
      },
    },
  },
  {
    id: 'anaerobes',
    label: 'Anaerobes / B. fragilis group',
    sites: {
      generic: {
        preferred: ['Metronidazole', 'Ampicillin-sulbactam', 'Piperacillin-tazobactam', 'Meropenem'],
        alternatives: ['Amoxicillin-clavulanate for oral step-down when source allows'],
        avoid: ['Avoid ceftriaxone alone when reliable anaerobic coverage is needed.'],
        pearls: ['Coverage depends on source control: abdomen, aspiration, pelvic source, or oral space infection.'],
      },
      ssti: {
        preferred: ['Ampicillin-sulbactam', 'Piperacillin-tazobactam'],
        alternatives: ['Amoxicillin-clavulanate'],
        avoid: ['Do not forget source control in bite or oral-space infections.'],
        pearls: ['Mixed aerobic-anaerobic infections often need both drainage and antibiotics.'],
      },
    },
  },
];

function toneForPatientHookChip(label, value) {
  const text = `${label} ${value}`.toLowerCase();
  if (/cr|egfr|k/.test(text) && (/5\./.test(text) || / 1[3-4][0-9]\b/.test(text) || /< ?30/.test(text))) return 'danger';
  if (/cr|egfr|k/.test(text) && (/4\./.test(text) || /3\./.test(text) || / 3[0-5]\b/.test(text))) return 'warn';
  return 'info';
}

function renderAbxPatientHook(snapshot) {
  const hook = document.getElementById('abx-patient-hook');
  const nameEl = document.getElementById('abx-patient-name');
  const chipsEl = document.getElementById('abx-patient-chips');
  if (!hook || !nameEl || !chipsEl) return;

  if (!snapshot) {
    hook.style.display = 'none';
    return;
  }

  const chips = [];
  if (snapshot.egfr !== null && snapshot.egfr !== undefined) chips.push({ label: 'eGFR', value: `${snapshot.egfr}` });
  if (snapshot.latestLabs && snapshot.latestLabs.Cr !== undefined) chips.push({ label: 'Cr', value: `${snapshot.latestLabs.Cr}` });
  if (snapshot.latestLabs && snapshot.latestLabs.K !== undefined) chips.push({ label: 'K', value: `${snapshot.latestLabs.K}` });
  if (snapshot.latestLabs && snapshot.latestLabs.WBC !== undefined) chips.push({ label: 'WBC', value: `${snapshot.latestLabs.WBC}` });

  nameEl.textContent = snapshot.name;
  chipsEl.innerHTML = chips.map((chip) => `<span class="patient-hook-chip ${toneForPatientHookChip(chip.label, chip.value)}">${chip.label} ${chip.value}</span>`).join('');
  hook.style.display = 'flex';
}

function getAbxHeaders(extra) {
  const headers = { 'Content-Type': 'application/json', ...(extra || {}) };
  const key = localStorage.getItem(ABX_API_KEY_STORAGE);
  if (key) headers['X-API-Key'] = key;
  headers['X-OpenRouter-Model'] = (typeof getStoredAiModel === 'function') ? getStoredAiModel() : 'anthropic/claude-sonnet-4.6';
  return headers;
}

function getAbxDeescCard() {
  return document.getElementById('abx-deesc-card');
}

function getAbxDeescStatusEl() {
  return document.getElementById('abx-deesc-status');
}

function setAbxDeescStatus(message, tone) {
  const el = getAbxDeescStatusEl();
  if (!el) return;
  if (!message) {
    el.className = 'abx-deesc-status';
    el.textContent = '';
    return;
  }
  el.className = `abx-deesc-status ${tone || 'info'}`;
  el.textContent = message;
}

function getAbxActivePatientId() {
  if (typeof getActivePatientId === 'function') return getActivePatientId() || '';
  return abxDeescState.patientId || '';
}

function resetAbxDeescalationForm() {
  const currentEl = document.getElementById('abx-deesc-current');
  const daysEl = document.getElementById('abx-deesc-days');
  const trendEl = document.getElementById('abx-deesc-trend');
  const cultureEl = document.getElementById('abx-deesc-culture');
  const sourceEl = document.getElementById('abx-deesc-source');
  if (currentEl) currentEl.value = '';
  if (daysEl) daysEl.value = '';
  if (trendEl) trendEl.value = 'stable';
  if (cultureEl) cultureEl.value = '';
  if (sourceEl) sourceEl.checked = false;
  abxDeescState.result = null;
  renderDeescalationResult(null);
  setAbxDeescStatus('', '');
}

function buildAbxDeescalationContextSummary(snapshot) {
  if (!snapshot) return '';
  const lines = [];
  const latestLabs = snapshot.latestLabs || {};
  const insights = Array.isArray(snapshot.insights) ? snapshot.insights.slice(0, 4) : [];
  const recentEntries = Array.isArray(snapshot.recentEntries) ? snapshot.recentEntries.slice(0, 4) : [];
  // Name intentionally omitted — patient_id is sent separately; name is PHI and adds no clinical value.
  if (snapshot.dx) lines.push(`Admitting diagnosis: ${snapshot.dx}`);
  if (snapshot.admitted) lines.push(`Admitted: ${snapshot.admitted}`);
  if (snapshot.egfr !== null && snapshot.egfr !== undefined) lines.push(`Estimated GFR: ${snapshot.egfr}`);
  if (snapshot.lastLabTimestamp) lines.push(`Last lab timestamp: ${snapshot.lastLabTimestamp}`);
  const labPairs = ['Cr', 'K', 'WBC', 'CRP', 'Lactate']
    .filter((key) => latestLabs[key] !== undefined && latestLabs[key] !== null)
    .map((key) => `${key} ${latestLabs[key]}`);
  if (labPairs.length) lines.push(`Latest labs: ${labPairs.join('; ')}`);
  if (insights.length) {
    lines.push(`Rule-based alerts: ${insights.map((item) => `${item.title}${item.tone === 'danger' ? ' [danger]' : item.tone === 'warn' ? ' [warn]' : ''}`).join('; ')}`);
  }
  if (recentEntries.length) {
    lines.push(`Recent events: ${recentEntries.map((entry) => `${entry.timestamp} ${entry.category}: ${entry.title}`).join(' | ')}`);
  }
  return lines.join('\n');
}

function renderDeescalationRecommendation(rec) {
  const label = (rec || 'Continue').trim();
  const tone = label.toLowerCase().replace(/[^a-z]+/g, '-');
  return `<span class="abx-deesc-badge ${tone}">${abxEscHtml(label)}</span>`;
}

function renderDeescalationResult(result) {
  const el = document.getElementById('abx-deesc-output');
  const copyBtn = document.getElementById('abx-deesc-copy-btn');
  if (!el) return;
  if (!result) {
    el.innerHTML = '<div class="abx-deesc-empty">No de-escalation review yet.</div>';
    if (copyBtn) copyBtn.disabled = true;
    return;
  }

  const caveats = Array.isArray(result.caveats) ? result.caveats : [];
  el.innerHTML = `
    <div class="abx-deesc-result">
      <div class="abx-deesc-result-head">
        <div class="abx-deesc-result-title">Stewardship Review</div>
        ${renderDeescalationRecommendation(result.recommendation)}
      </div>
      <div class="abx-deesc-summary-grid">
        <div class="abx-deesc-metric">
          <div class="abx-deesc-metric-label">Suggested Regimen</div>
          <div class="abx-deesc-metric-value">${abxEscHtml(result.suggested_regimen || 'No regimen change suggested.')}</div>
        </div>
        <div class="abx-deesc-metric">
          <div class="abx-deesc-metric-label">IV to PO</div>
          <div class="abx-deesc-metric-value">${result.iv_to_po ? 'Yes, step-down may be appropriate.' : 'No clear IV to PO step-down recommendation.'}</div>
        </div>
        <div class="abx-deesc-metric">
          <div class="abx-deesc-metric-label">Stop Date Hint</div>
          <div class="abx-deesc-metric-value">${abxEscHtml(result.stop_date_hint || 'No stop date suggested.')}</div>
        </div>
      </div>
      <div>
        <div class="abx-deesc-metric-label">Rationale</div>
        <div class="abx-deesc-bodycopy">${abxEscHtml(result.rationale || 'No rationale returned.')}</div>
      </div>
      <div>
        <div class="abx-deesc-metric-label">Caveats</div>
        ${caveats.length
          ? `<ul class="abx-deesc-caveats">${caveats.map((item) => `<li>${abxEscHtml(item)}</li>`).join('')}</ul>`
          : '<div class="abx-deesc-bodycopy">No additional caveats returned.</div>'}
      </div>
    </div>`;
  if (copyBtn) copyBtn.disabled = false;
}

function buildDeescalationReviewText(result) {
  if (!result) return '';
  const lines = [
    `Recommendation: ${result.recommendation || 'Continue'}`,
    `Suggested regimen: ${result.suggested_regimen || 'No regimen change suggested.'}`,
    `IV to PO: ${result.iv_to_po ? 'Yes' : 'No'}`,
    `Stop date hint: ${result.stop_date_hint || 'None'}`,
    '',
    'Rationale:',
    result.rationale || 'No rationale returned.',
  ];
  if (Array.isArray(result.caveats) && result.caveats.length) {
    lines.push('', 'Caveats:');
    result.caveats.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push('', 'Decision support only; verify cultures, source control, and local susceptibility data.');
  return lines.join('\n');
}

function updateAbxDeescalationControls() {
  const runBtn = document.getElementById('abx-deesc-run-btn');
  const copyBtn = document.getElementById('abx-deesc-copy-btn');
  const aiBanner = document.getElementById('abx-deesc-ai-banner');
  const currentEl = document.getElementById('abx-deesc-current');
  const hasPatient = !!getAbxActivePatientId();
  const hasCurrent = !!(currentEl && currentEl.value.trim());
  if (runBtn) {
    runBtn.disabled = !abxDeescState.aiAvailable || !hasPatient || !hasCurrent || abxDeescState.loading;
    runBtn.textContent = abxDeescState.loading ? 'Running...' : 'Run De-escalation Check';
  }
  if (copyBtn) copyBtn.disabled = !abxDeescState.result;
  if (aiBanner) aiBanner.classList.toggle('active', !abxDeescState.aiAvailable);
}

function syncAbxDeescalationCard(snapshot) {
  const card = getAbxDeescCard();
  if (!card) return;
  const nextPid = snapshot && snapshot.id ? snapshot.id : getAbxActivePatientId();
  if (abxDeescState.patientId && abxDeescState.patientId !== nextPid) {
    resetAbxDeescalationForm();
  }
  abxDeescState.patientId = nextPid || '';
  abxDeescState.snapshot = snapshot || null;
  card.style.display = nextPid ? 'block' : 'none';
  updateAbxDeescalationControls();
}

function toggleAbxDeescalationCard() {
  const card = getAbxDeescCard();
  if (!card) return;
  card.classList.toggle('collapsed');
}

async function checkAbxAiStatus() {
  try {
    const res = await fetch('/s/handoff/api/ai-status', { headers: getAbxHeaders() });
    const data = await res.json();
    abxDeescState.aiAvailable = !!data.ai_available;
  } catch (err) {
    abxDeescState.aiAvailable = false;
  }
  updateAbxDeescalationControls();
}

async function runDeescalationCheck() {
  const pid = getAbxActivePatientId();
  const currentAntibiotics = (document.getElementById('abx-deesc-current')?.value || '').trim();
  const daysText = (document.getElementById('abx-deesc-days')?.value || '').trim();
  const clinicalTrend = document.getElementById('abx-deesc-trend')?.value || 'stable';
  const cultureResult = (document.getElementById('abx-deesc-culture')?.value || '').trim();
  const sourceControlled = !!document.getElementById('abx-deesc-source')?.checked;

  if (!pid) {
    setAbxDeescStatus('Select an active patient before running de-escalation.', 'error');
    return;
  }
  if (!currentAntibiotics) {
    setAbxDeescStatus('Current antibiotic(s) are required.', 'error');
    updateAbxDeescalationControls();
    return;
  }

  let daysOfTherapy = null;
  if (daysText) {
    daysOfTherapy = Number.parseInt(daysText, 10);
    if (Number.isNaN(daysOfTherapy) || daysOfTherapy < 0) {
      setAbxDeescStatus('Days of therapy must be a non-negative integer.', 'error');
      return;
    }
  }

  abxDeescState.loading = true;
  updateAbxDeescalationControls();
  setAbxDeescStatus('Running de-escalation review...', 'info');

  try {
    const res = await fetch('/s/handoff/api/consults/de-escalation', {
      method: 'POST',
      headers: getAbxHeaders(),
      body: JSON.stringify({
        patient_id: pid,
        current_antibiotics: currentAntibiotics,
        days_of_therapy: daysOfTherapy,
        culture_result: cultureResult,
        clinical_trend: clinicalTrend,
        source_controlled: sourceControlled,
        context_summary: buildAbxDeescalationContextSummary(abxDeescState.snapshot),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'De-escalation review failed');
    abxDeescState.result = data;
    renderDeescalationResult(data);
    setAbxDeescStatus('De-escalation review ready. Verify against microbiology and local susceptibility data.', 'success');
  } catch (err) {
    abxDeescState.result = null;
    renderDeescalationResult(null);
    setAbxDeescStatus(err.message, 'error');
  } finally {
    abxDeescState.loading = false;
    updateAbxDeescalationControls();
  }
}

async function copyDeescalationReview() {
  const text = buildDeescalationReviewText(abxDeescState.result);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setAbxDeescStatus('De-escalation review copied to clipboard.', 'success');
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setAbxDeescStatus('De-escalation review copied to clipboard.', 'success');
  }
}

function bindAbxDeescalationInputs() {
  ['abx-deesc-current', 'abx-deesc-days', 'abx-deesc-trend', 'abx-deesc-culture', 'abx-deesc-source'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.bound === 'true') return;
    const eventName = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      updateAbxDeescalationControls();
      if (getAbxDeescStatusEl()?.classList.contains('error')) setAbxDeescStatus('', '');
    });
    el.dataset.bound = 'true';
  });
}

function toggleBugLookup(btn) {
  const panel = document.getElementById('abx-lookup-panel');
  if (!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if (btn) btn.classList.toggle('active', !visible);
  if (!visible) renderBugLookup();
}

function initBugLookup() {
  const bugSelect = document.getElementById('abx-bug-select');
  const siteSelect = document.getElementById('abx-bug-site-select');
  if (!bugSelect || !siteSelect || bugSelect.options.length > 0) return;

  BUG_DRUG_LOOKUP.forEach((entry) => {
    const opt = document.createElement('option');
    opt.value = entry.id;
    opt.textContent = entry.label;
    bugSelect.appendChild(opt);
  });

  BUG_DRUG_SITE_OPTIONS.forEach((entry) => {
    const opt = document.createElement('option');
    opt.value = entry.value;
    opt.textContent = entry.label;
    siteSelect.appendChild(opt);
  });

  renderBugLookup();
}

function renderLookupColumn(title, cls, items) {
  if (!items || items.length === 0) {
    return `<div class="abx-lookup-card"><h3 class="${cls}">${title}</h3><div class="abx-lookup-item">—</div></div>`;
  }
  return `<div class="abx-lookup-card"><h3 class="${cls}">${title}</h3>${items.map((item) => `<div class="abx-lookup-item">${linkifyDrugNames(item)}</div>`).join('')}</div>`;
}

function renderBugLookup() {
  const bugSelect = document.getElementById('abx-bug-select');
  const siteSelect = document.getElementById('abx-bug-site-select');
  const result = document.getElementById('abx-lookup-result');
  if (!bugSelect || !siteSelect || !result) return;

  const entry = BUG_DRUG_LOOKUP.find((item) => item.id === bugSelect.value) || BUG_DRUG_LOOKUP[0];
  const siteKey = siteSelect.value || 'generic';
  const siteData = entry.sites[siteKey] || entry.sites.generic || {};

  if (!entry) {
    result.innerHTML = '<div class="abx-lookup-empty">No lookup data available.</div>';
    return;
  }

  result.innerHTML = `
    ${renderLookupColumn('Preferred', 'success', siteData.preferred)}
    ${renderLookupColumn('Alternatives', 'info', siteData.alternatives)}
    ${renderLookupColumn('Avoid / Traps', 'danger', siteData.avoid)}
    ${renderLookupColumn('Pearls', 'warn', siteData.pearls)}
  `;
}

function renderAbxGuide() {
  const body = document.getElementById('abx-body');
  const emptyEl = document.getElementById('abx-empty');
  body.innerHTML = '';
  body.appendChild(emptyEl); // keep empty message in DOM

  ABX_DATA.forEach(site => {
    const card = document.createElement('div');
    card.className = 'abx-site-card collapsed';
    card.dataset.abxId = site.id;
    const hasLocalNotes = (site.regimens || []).some(r => Array.isArray(r.localNotes) && r.localNotes.length);
    const regimenText = (site.regimens || []).map(r => {
      const publicNotes = Array.isArray(r.publicNotes) ? r.publicNotes : [];
      const localNotes = Array.isArray(r.localNotes) ? r.localNotes : [];
      const allNotesText = [...publicNotes, ...localNotes].map(n => n.txt || '').join(' ');
      return `${r.label || ''} ${r.first || ''} ${r.alt || ''} ${allNotesText}`;
    }).join(' ');
    card.dataset.hasLocalNotes = hasLocalNotes ? 'true' : 'false';
    card.dataset.keywords = (site.keywords + ' ' + site.site + ' ' + site.tags.join(' ') + ' ' + regimenText).toLowerCase();

    const tagHtml = site.tags.map(t => `<span class="abx-tag ${t}">${t.toUpperCase()}</span>`).join('');
    const hdrHtml = `
      <div class="abx-site-hdr" onclick="toggleAbxCard('${site.id}')">
        <span class="abx-site-icon">${site.icon}</span>
        <span class="abx-site-title">${site.site}</span>
        <div class="abx-site-tags">${tagHtml}</div>
        <span class="abx-chevron">&#9660;</span>
      </div>`;

    // ── PK/PD reference — custom 5-column table ─────────────────────────
    if (site.type === 'pkpd') {
      card.classList.add('abx-pkpd-card');
      card.dataset.noSevFilter = 'true';
      let pkHtml = `<div class="abx-site-body" style="padding:0"><table class="pkpd-table">
        <thead><tr>
          <th style="width:90px">Kill Type</th>
          <th style="width:28%">Drug Class</th>
          <th style="width:22%">Key Examples</th>
          <th style="width:20%">PK Target</th>
          <th>Dosing Strategy</th>
        </tr></thead><tbody>`;
      for (const r of site.regimens) {
        pkHtml += `<tr>
          <td><span class="pkpd-type-badge ${r.sev}">${r.label}</span></td>
          <td style="font-size:0.6rem">${r.first.replace(/\n/g,'<br>')}</td>
          <td>${linkifyDrugNames(r.alt || '')}</td>
          <td style="font-size:0.6rem">${r.notes[0] ? r.notes[0].txt.replace(/\n/g,'<br>') : ''}</td>
          <td style="font-size:0.6rem">${r.notes[1] ? r.notes[1].txt.replace(/\n/g,'<br>') : ''}</td>
        </tr>`;
      }
      pkHtml += '</tbody></table></div>';
      card.innerHTML = hdrHtml + pkHtml;
      body.appendChild(card);
      return; // forEach continue
    }

    // ── MDR card — standard table with tint + custom headers ────────────
    if (site.type === 'mdr') {
      card.classList.add('abx-mdr-card');
      card.dataset.noSevFilter = 'true';
    }

    // ── Standard regimen table (antibacterial + antifungal + MDR) ────────
    const hdrs = site.headers || ['Severity', 'First-line', 'Alternatives', 'Notes'];
    let regHtml = `<div class="abx-site-body"><table class="abx-regimen-table">
      <thead><tr>
        <th style="width:110px">${hdrs[0]}</th>
        <th style="width:35%">${hdrs[1]}</th>
        <th style="width:28%">${hdrs[2]}</th>
        <th>${hdrs[3]}</th>
      </tr></thead><tbody>`;

    for (const r of site.regimens) {
      const publicNotes = Array.isArray(r.publicNotes) ? r.publicNotes : [];
      const localNotes = Array.isArray(r.localNotes) ? r.localNotes : [];
      const publicNotesHtml = publicNotes.map(n =>
        `<div class="abx-note ${n.cls || ''}">${n.txt.replace(/\n/g,'<br>')}</div>`
      ).join('');
      const localNotesHtml = PORTAL_CONFIG.showLocalAbxNotes
        ? localNotes.map(n =>
            `<div class="abx-note ${n.cls || ''}">${n.txt.replace(/^🇹🇼\s*/, '').replace(/\n/g,'<br>')}</div>`
          ).join('')
        : '';
      const noteGroups = [];
      if (publicNotesHtml) {
        noteGroups.push(`
          <div class="abx-note-group">
            <div class="abx-note-group-title">General Notes</div>
            ${publicNotesHtml}
          </div>`);
      }
      if (localNotesHtml) {
        noteGroups.push(`
          <div class="abx-note-group">
            <div class="abx-note-group-title local">${PORTAL_CONFIG.localAbxNotesTitle}</div>
            ${localNotesHtml}
          </div>`);
      }
      const notesHtml = noteGroups.join('') || '<span style="color:var(--text-dim)">—</span>';
      const copyLines = [`${site.site} — ${r.label}`];
      if (r.first) copyLines.push('First-line: ' + abxStripHtml(r.first));
      if (r.alt)   copyLines.push('Alternative: ' + abxStripHtml(r.alt));
      publicNotes.forEach(n => { if (n.txt) copyLines.push(n.txt); });
      if (PORTAL_CONFIG.showLocalAbxNotes) {
        localNotes.forEach(n => { if (n.txt) copyLines.push(n.txt); });
      }
      const copyAttr = abxEncAttr(copyLines.join('\n'));
      const labelParts = r.label.split('—');

      regHtml += `<tr class="abx-regimen-row" data-sev="${r.sev}" data-copy="${copyAttr}">
        <td>
          <span class="abx-sev ${r.sev}">${labelParts[0].trim()}</span><br>
          <span style="font-size:0.58rem;color:var(--text-dim);">${labelParts.slice(1).join('—').trim()}</span>
          <button class="abx-copy-btn" onclick="copyAbxRegimen(this)" title="Copy regimen to clipboard">&#128203; Copy</button>
        </td>
        <td>${linkifyDrugNames(r.first.replace(/\n/g,'<br>'))}</td>
        <td>${linkifyDrugNames((r.alt||'').replace(/\n/g,'<br>'))}</td>
        <td>${notesHtml}</td>
      </tr>`;
    }
    regHtml += '</tbody></table></div>';
    card.innerHTML = hdrHtml + regHtml;
    body.appendChild(card);
  });
}

function toggleAbxCard(id) {
  const card = document.querySelector(`[data-abx-id="${id}"]`);
  if (card) card.classList.toggle('collapsed');
}

function copyAbxRegimen(btn) {
  const row = btn.closest('tr');
  const text = row ? row.dataset.copy : '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '&#128203; Copy';
      btn.classList.remove('copied');
    }, 1600);
  }).catch(() => {
    // Fallback: select a temp textarea
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied'; btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '&#128203; Copy'; btn.classList.remove('copied'); }, 1600);
  });
}

function filterAbx() {
  const q = (document.getElementById('abx-search').value || '').toLowerCase();
  const cards = document.querySelectorAll('.abx-site-card');
  const searchActive = q.length > 0;
  let visible = 0;
  cards.forEach(card => {
    const kw = card.dataset.keywords || '';
    const routeOk = abxActiveFilter === 'all'
      || (abxActiveFilter === 'tw'
        ? PORTAL_CONFIG.showLocalAbxNotes && card.dataset.hasLocalNotes === 'true'
        : kw.includes(abxActiveFilter));
    const searchOk = !q || kw.includes(q);
    if (!routeOk || !searchOk) {
      card.classList.add('hidden');
      return;
    }
    // Filter rows by severity
    let visibleRows = 0;
    const noSevFilter = card.dataset.noSevFilter === 'true';
    const rows = card.querySelectorAll('.abx-regimen-row');
    rows.forEach(row => {
      const sevOk = noSevFilter || abxSevFilter === 'all' || row.dataset.sev === abxSevFilter;
      row.classList.toggle('sev-hidden', !sevOk);
      if (sevOk) visibleRows++;
    });
    const show = rows.length === 0 ? true : visibleRows > 0;
    card.classList.toggle('hidden', !show);
    if (show) {
      visible++;
      // Auto-expand when search or severity filter is active
      if (searchActive || abxSevFilter !== 'all') {
        card.classList.remove('collapsed');
      }
    }
  });
  document.getElementById('abx-empty').style.display = visible === 0 ? 'block' : 'none';
}

function setAbxFilter(filter, btn) {
  abxActiveFilter = filter;
  document.querySelectorAll('.abx-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterAbx();
}

function setAbxSevFilter(filter, btn) {
  abxSevFilter = filter;
  document.querySelectorAll('.abx-sev-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterAbx();
}

// ---------------------------------------------------------------------------
// Antibiotic Spectrum Matrix — shows reference image from senior's chart
// ---------------------------------------------------------------------------
function toggleAbxSpectrum(btn) {
  const panel = document.getElementById('abx-spectrum');
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : '';
  btn.classList.toggle('active', !visible);
  // Render image on first open
  if (!visible && !panel.querySelector('img')) {
    panel.innerHTML = `
      <div style="text-align:center; padding:0.5rem 0;">
        <img src="static/abx-spectrum.png" alt="Antibiotic Spectrum Chart"
          style="max-width:100%; height:auto; border-radius:6px; cursor:zoom-in;"
          onclick="this.style.maxWidth = this.style.maxWidth === '100%' ? 'none' : '100%'; this.style.cursor = this.style.maxWidth === '100%' ? 'zoom-in' : 'zoom-out';"
          onerror="this.parentElement.innerHTML='<div style=\\'padding:2rem;color:var(--text-dim);font-size:0.7rem;\\'>Image not found. Place <b>abx-spectrum.png</b> in <code>portal/static/</code> folder.</div>'">
      </div>`;
  }
}

function initAbxGuide() {
  initBugLookup();
  const snapshot = typeof getActivePatientClinicalSnapshot === 'function' ? getActivePatientClinicalSnapshot() : null;
  renderAbxPatientHook(snapshot);
  syncAbxDeescalationCard(snapshot);
  bindAbxDeescalationInputs();
  checkAbxAiStatus();
}

window.__abxTestApi = {
  buildAbxDeescalationContextSummary,
  renderDeescalationRecommendation,
  renderDeescalationResult,
  buildDeescalationReviewText,
  syncAbxDeescalationCard,
  updateAbxDeescalationControls,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAbxGuide);
} else {
  initAbxGuide();
}

window.addEventListener('patient-context-updated', (event) => {
  const snapshot = event.detail ? event.detail.snapshot : null;
  renderAbxPatientHook(snapshot);
  syncAbxDeescalationCard(snapshot);
});
