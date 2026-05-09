// ---------------------------------------------------------------------------
// Rules Catalog + Local User Rules
// ---------------------------------------------------------------------------

const RULE_DOMAINS = [
  'Medication Safety',
  'Renal / Electrolytes / Acid-Base',
  'Infection / Inflammation',
  'Hematology / Coagulation',
  'Liver / Biliary',
  'Endocrine / Metabolic',
  'General Lab Patterns',
];

let activeRulesDomain = 'all';

// ── Editor state ─────────────────────────────────────────────────────────────

let _editorConditions = [{ labKey: '', operator: '<', threshold: '' }];
let _editorLogic = 'and';

// ── Utilities ─────────────────────────────────────────────────────────────────

function rulesEscHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getRulesSearchTerm() {
  const input = document.getElementById('rules-search');
  return input ? input.value.trim().toLowerCase() : '';
}

// ── Domain classification ─────────────────────────────────────────────────────

function getRuleDomain(rule) {
  // User rules store their domain explicitly — trust it directly
  if (rule.domain && RULE_DOMAINS.includes(rule.domain)) return rule.domain;
  // Built-in rules: keyword classification from title + category
  const title = `${rule.title || ''} ${rule.category || ''}`.toLowerCase();
  if (/aki|renal|nephro|creatinine|egfr|hyperkalemia|hypokalemia|sodium|hyponatremia|hypernatremia|anion|acidosis|refeeding|rhabdo|tumou?r lysis/.test(title)) return 'Renal / Electrolytes / Acid-Base';
  if (/medication|drug|bleeding|anticoag|antiplatelet|qt|digoxin|steroid|diabetes|sick-day|hyperglycemia/.test(title)) return 'Medication Safety';
  if (/wbc|crp|ferritin|sepsis|septic|cholangitis|neutropenia|infection|leukocytosis/.test(title)) return 'Infection / Inflammation';
  if (/hgb|platelet|plt|pancytopenia|dic|coagulopathy|microangiopathic|haemolytic|hemolytic|cytopenia|inr|aptt|fibrinogen/.test(title)) return 'Hematology / Coagulation';
  if (/hepatic|liver|bilirubin|transaminase|cholestatic|alp|alt|ast|meld|cholangitis|decompensation/.test(title)) return 'Liver / Biliary';
  if (/thyroid|adrenal|endocrine|glucose|diabetes|dka|hhs/.test(title)) return 'Endocrine / Metabolic';
  return 'General Lab Patterns';
}

function groupRulesByDomain(rules) {
  return rules.reduce((groups, rule) => {
    const domain = getRuleDomain(rule);
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(rule);
    return groups;
  }, {});
}

function getRuleDomainOrder(groups) {
  const preferred = [
    'Medication Safety',
    'Renal / Electrolytes / Acid-Base',
    'Infection / Inflammation',
    'Hematology / Coagulation',
    'Liver / Biliary',
    'Endocrine / Metabolic',
    'General Lab Patterns',
  ];
  return preferred.filter((domain) => groups[domain] && groups[domain].length)
    .concat(Object.keys(groups).filter((domain) => !preferred.includes(domain)).sort());
}

// ── Data sources ──────────────────────────────────────────────────────────────

function getBuiltInRulesForCatalog() {
  const safety = typeof getSafetyRuleCatalog === 'function' ? getSafetyRuleCatalog() : [];
  const missing = typeof getMissingDataRuleCatalog === 'function' ? getMissingDataRuleCatalog() : [];
  const labRules = typeof getPatientContextLabRuleCatalog === 'function' ? getPatientContextLabRuleCatalog() : [];
  return [...safety, ...missing, ...labRules].sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.title.localeCompare(b.title));
}

function formatUserRuleCriteria(rule) {
  if (!rule.conditions || !rule.conditions.length) return '';
  const condText = rule.conditions
    .map((c) => `${c.labKey} ${c.operator} ${c.threshold}`)
    .join(` ${(rule.logic || 'and').toUpperCase()} `);
  return `Fires when ${condText}.`;
}

function getAllRulesForCatalog() {
  const builtins = getBuiltInRulesForCatalog();
  const userRules = (typeof getUserSafetyRules === 'function' ? getUserSafetyRules() : [])
    .map((r) => (typeof normalizeUserSafetyRule === 'function' ? normalizeUserSafetyRule(r) : r))
    .filter(Boolean)
    .map((r) => ({
      key: `user-${r.id}`,
      title: r.title,
      category: r.domain || 'General Lab Patterns',
      domain: r.domain || 'General Lab Patterns',
      defaultTone: r.tone,
      criteria: formatUserRuleCriteria(r),
      sourceLabel: r.sourceLabel,
      enabled: r.enabled,
      builtIn: false,
      userDefined: true,
      _rawId: r.id,
    }));
  return [...builtins, ...userRules];
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderRulesTabs(groups, activeDomain) {
  const order = getRuleDomainOrder(groups);
  const total = order.reduce((sum, domain) => sum + groups[domain].length, 0);
  return `<button class="rules-cat-btn ${activeDomain === 'all' ? 'active' : ''}" onclick="switchRulesDomain('all')">All<span class="cat-count">(${total})</span></button>`
    + order.map((domain) => `<button class="rules-cat-btn ${activeDomain === domain ? 'active' : ''}" onclick="switchRulesDomain('${rulesEscHtml(domain)}')">${rulesEscHtml(domain)}<span class="cat-count">(${groups[domain].length})</span></button>`).join('');
}

function switchRulesDomain(domain) {
  activeRulesDomain = domain || 'all';
  renderRulesCatalog();
}

function renderRuleGroup(domain, rules) {
  return `<section class="rules-domain-section active" data-domain="${rulesEscHtml(domain)}">
    <div class="rules-domain-title-row">
      <div class="calc-cat-title">${rulesEscHtml(domain)}</div>
      <span class="rules-chip">${rules.length} rules</span>
    </div>
    <div class="rules-domain-body">${rules.map((rule) => renderRuleCard(rule)).join('')}</div>
  </section>`;
}

function renderRuleCard(rule) {
  const source = rule.sourceUrl
    ? `<a href="${rulesEscHtml(rule.sourceUrl)}" target="_blank" rel="noopener">${rulesEscHtml(rule.sourceLabel || 'Source')}</a>`
    : rulesEscHtml(rule.sourceLabel || 'Local deterministic rule');
  const userActions = rule.userDefined ? `
    <div class="rules-card-actions">
      <button class="rules-mini-btn" onclick="editUserRule('${rulesEscHtml(rule._rawId)}')">Edit</button>
      <button class="rules-mini-btn danger" onclick="deleteUserRule('${rulesEscHtml(rule._rawId)}')">Delete</button>
    </div>` : '';
  const badges = [
    rule.userDefined ? '<span class="rules-chip user-chip">Custom</span>' : '',
    rule.enabled === false ? '<span class="rules-chip muted">Off</span>' : '',
  ].filter(Boolean).join('');
  return `<article class="rules-card ${rulesEscHtml(rule.defaultTone || rule.tone || 'info')}${rule.userDefined ? ' user-defined' : ''}">
    <div class="rules-card-top">
      <div>
        <div class="rules-card-title">${rulesEscHtml(rule.title)}</div>
        <div class="rules-card-meta">${rulesEscHtml(rule.category || rule.kind || 'Rule')} · ${rulesEscHtml(rule.defaultTone || rule.tone || 'varies')}</div>
      </div>
      ${badges ? `<div style="display:flex;gap:0.3rem;align-items:center;flex-shrink:0">${badges}</div>` : ''}
    </div>
    <div class="rules-card-criteria">${rulesEscHtml(rule.criteria || rule.body || '')}</div>
    <div class="rules-card-source">${source}</div>
    ${userActions}
  </article>`;
}

function renderRulesCatalog() {
  const builtinsEl = document.getElementById('rules-builtins');
  if (!builtinsEl) return;

  const term = getRulesSearchTerm();
  const allRules = getAllRulesForCatalog().filter((rule) => {
    if (!term) return true;
    const haystack = `${rule.title} ${rule.category} ${rule.criteria || ''} ${rule.sourceLabel || ''}`.toLowerCase();
    return haystack.includes(term);
  });

  const groups = groupRulesByDomain(allRules);
  const order = getRuleDomainOrder(groups);
  const effectiveDomain = activeRulesDomain === 'all' || order.includes(activeRulesDomain) ? activeRulesDomain : 'all';
  if (effectiveDomain !== activeRulesDomain) activeRulesDomain = effectiveDomain;
  const tabsEl = document.getElementById('rules-cats');
  if (tabsEl) tabsEl.innerHTML = renderRulesTabs(groups, effectiveDomain);
  const visibleDomains = effectiveDomain === 'all' ? order : order.filter((domain) => domain === effectiveDomain);
  builtinsEl.innerHTML = allRules.length
    ? (visibleDomains.length ? visibleDomains.map((domain) => renderRuleGroup(domain, groups[domain])).join('') : '<div class="rules-empty">No rules match the selected category.</div>')
    : '<div class="rules-empty">No rules match the search.</div>';

  // Sync user count badge in the page header
  const userCount = (typeof getUserSafetyRules === 'function' ? getUserSafetyRules() : []).length;
  const countEl = document.getElementById('rules-user-count');
  if (countEl) countEl.textContent = userCount ? `${userCount} custom` : '';
  countEl?.classList.toggle('hidden', !userCount);

  // Init editor condition rows if not yet rendered
  const condContainer = document.getElementById('rule-conditions');
  if (condContainer && !condContainer.hasChildNodes()) {
    renderConditionRows();
    renderLogicToggle();
  }
}

// ── Condition builder ─────────────────────────────────────────────────────────

function renderConditionRows() {
  const container = document.getElementById('rule-conditions');
  if (!container) return;
  container.innerHTML = _editorConditions.map((cond, idx) => {
    const label = idx === 0 ? 'IF' : rulesEscHtml(_editorLogic.toUpperCase());
    const removeBtn = _editorConditions.length > 1
      ? `<button type="button" class="rules-mini-btn danger rules-cond-remove" onclick="removeCondition(${idx})">✕</button>`
      : '<span class="rules-cond-remove-placeholder"></span>';
    return `<div class="rules-condition-row">
      <span class="rules-cond-label">${label}</span>
      <input type="text" class="rules-cond-field" list="rules-lab-keys" value="${rulesEscHtml(cond.labKey)}" placeholder="Lab (e.g. K, Cr)" oninput="updateConditionField(${idx},'labKey',this.value)">
      <select class="rules-cond-op" onchange="updateConditionField(${idx},'operator',this.value)">
        ${['<', '<=', '>', '>=', '='].map((op) => `<option value="${op}"${cond.operator === op ? ' selected' : ''}>${op}</option>`).join('')}
      </select>
      <input type="number" class="rules-cond-field rules-cond-num" value="${rulesEscHtml(String(cond.threshold !== '' ? cond.threshold : ''))}" step="0.01" placeholder="Value" oninput="updateConditionField(${idx},'threshold',this.value)">
      ${removeBtn}
    </div>`;
  }).join('');
}

function renderLogicToggle() {
  const el = document.getElementById('rule-logic-row');
  if (!el) return;
  const show = _editorConditions.length > 1;
  el.style.display = show ? 'flex' : 'none';
  if (!show) { el.innerHTML = ''; return; }
  const hint = _editorLogic === 'and' ? 'All conditions must match' : 'Any single condition triggers';
  el.innerHTML = `
    <span class="rules-cond-label" style="visibility:hidden">IF</span>
    <span class="rules-logic-label">Logic</span>
    <button type="button" class="rules-logic-btn${_editorLogic === 'and' ? ' active' : ''}" onclick="setEditorLogic('and')">AND</button>
    <button type="button" class="rules-logic-btn${_editorLogic === 'or' ? ' active' : ''}" onclick="setEditorLogic('or')">OR</button>
    <span class="rules-logic-hint">${hint}</span>`;
}

function updateConditionField(idx, field, value) {
  if (_editorConditions[idx]) _editorConditions[idx][field] = value;
}

function addCondition() {
  _editorConditions.push({ labKey: '', operator: '<', threshold: '' });
  renderConditionRows();
  renderLogicToggle();
}

function removeCondition(idx) {
  _editorConditions.splice(idx, 1);
  if (_editorConditions.length === 0) _editorConditions = [{ labKey: '', operator: '<', threshold: '' }];
  renderConditionRows();
  renderLogicToggle();
}

function setEditorLogic(logic) {
  _editorLogic = logic === 'or' ? 'or' : 'and';
  renderConditionRows();
  renderLogicToggle();
}

// ── Editor open / close ───────────────────────────────────────────────────────

function openRuleEditor() {
  const layout = document.querySelector('.rules-layout');
  if (layout) layout.classList.add('editor-open');
  setTimeout(() => document.getElementById('rule-title')?.focus(), 50);
}

function closeRuleEditor() {
  const layout = document.querySelector('.rules-layout');
  if (layout) layout.classList.remove('editor-open');
}

// ── Editor read / write ───────────────────────────────────────────────────────

function resetRuleEditor() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('rule-id', '');
  set('rule-title', '');
  set('rule-domain', 'General Lab Patterns');
  set('rule-tone', 'warn');
  set('rule-body', '');
  set('rule-source', '');
  const enabled = document.getElementById('rule-enabled');
  if (enabled) enabled.checked = true;
  const status = document.getElementById('rules-status');
  if (status) status.textContent = '';
  _editorConditions = [{ labKey: '', operator: '<', threshold: '' }];
  _editorLogic = 'and';
  renderConditionRows();
  renderLogicToggle();
}

function readRuleFromEditor() {
  // Snapshot current values from DOM into _editorConditions before reading
  document.querySelectorAll('.rules-condition-row').forEach((row, idx) => {
    if (!_editorConditions[idx]) return;
    const labInput = row.querySelector('.rules-cond-field:not(.rules-cond-num)');
    const opSelect = row.querySelector('.rules-cond-op');
    const numInput = row.querySelector('.rules-cond-num');
    if (labInput) _editorConditions[idx].labKey = labInput.value.trim();
    if (opSelect) _editorConditions[idx].operator = opSelect.value;
    if (numInput) _editorConditions[idx].threshold = numInput.value;
  });
  return {
    id: document.getElementById('rule-id')?.value || `rule-${Date.now()}`,
    title: document.getElementById('rule-title')?.value || '',
    domain: document.getElementById('rule-domain')?.value || 'General Lab Patterns',
    logic: _editorLogic,
    conditions: _editorConditions.map((c) => ({ ...c })),
    tone: document.getElementById('rule-tone')?.value || 'warn',
    body: document.getElementById('rule-body')?.value || '',
    sourceLabel: document.getElementById('rule-source')?.value || 'User-defined local rule',
    enabled: document.getElementById('rule-enabled')?.checked !== false,
  };
}

function saveRuleFromEditor(event) {
  if (event) event.preventDefault();
  const normalized = typeof normalizeUserSafetyRule === 'function' ? normalizeUserSafetyRule(readRuleFromEditor()) : null;
  const status = document.getElementById('rules-status');
  if (!normalized) {
    if (status) status.textContent = 'Rule needs a title and at least one complete condition (lab key + threshold).';
    return;
  }
  const rules = typeof getUserSafetyRules === 'function' ? getUserSafetyRules() : [];
  const next = rules.filter((r) => r.id !== normalized.id);
  next.push(normalized);
  if (typeof saveUserSafetyRules === 'function') saveUserSafetyRules(next);
  if (status) { status.textContent = 'Saved.'; setTimeout(() => { if (status) status.textContent = ''; }, 2000); }
  resetRuleEditor();
  closeRuleEditor();
  renderRulesCatalog();
}

function editUserRule(id) {
  const raw = (typeof getUserSafetyRules === 'function' ? getUserSafetyRules() : []).find((r) => r.id === id);
  if (!raw) return;
  const rule = typeof normalizeUserSafetyRule === 'function' ? normalizeUserSafetyRule(raw) : raw;
  if (!rule) return;
  const set = (fid, val) => { const el = document.getElementById(fid); if (el) el.value = val || ''; };
  set('rule-id', rule.id);
  set('rule-title', rule.title);
  set('rule-domain', rule.domain || 'General Lab Patterns');
  set('rule-tone', rule.tone || 'warn');
  set('rule-body', rule.body);
  set('rule-source', rule.sourceLabel);
  const enabled = document.getElementById('rule-enabled');
  if (enabled) enabled.checked = rule.enabled !== false;
  const status = document.getElementById('rules-status');
  if (status) status.textContent = '';
  _editorConditions = rule.conditions.map((c) => ({ ...c }));
  _editorLogic = rule.logic || 'and';
  renderConditionRows();
  renderLogicToggle();
  openRuleEditor();
}

function deleteUserRule(id) {
  if (!confirm('Delete this custom rule?')) return;
  const rules = (typeof getUserSafetyRules === 'function' ? getUserSafetyRules() : []).filter((r) => r.id !== id);
  if (typeof saveUserSafetyRules === 'function') saveUserSafetyRules(rules);
  renderRulesCatalog();
}

if (typeof window !== 'undefined') {
  window.renderRulesCatalog = renderRulesCatalog;
  window.resetRuleEditor = resetRuleEditor;
  window.saveRuleFromEditor = saveRuleFromEditor;
  window.editUserRule = editUserRule;
  window.deleteUserRule = deleteUserRule;
  window.switchRulesDomain = switchRulesDomain;
  window.openRuleEditor = openRuleEditor;
  window.closeRuleEditor = closeRuleEditor;
  window.updateConditionField = updateConditionField;
  window.addCondition = addCondition;
  window.removeCondition = removeCondition;
  window.setEditorLogic = setEditorLogic;
  window.__rulesTestApi = {
    renderRuleCard,
    renderRuleGroup,
    renderRulesTabs,
    switchRulesDomain,
    groupRulesByDomain,
    getRuleDomain,
    getBuiltInRulesForCatalog,
    getAllRulesForCatalog,
    formatUserRuleCriteria,
    readRuleFromEditor,
  };
}
