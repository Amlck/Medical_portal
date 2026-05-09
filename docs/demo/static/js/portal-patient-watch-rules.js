// ---------------------------------------------------------------------------
// Patient Watch Rules — per-patient lab-condition triggers
// Evaluates user-defined conditions against the active patient's current labs
// and persists them server-side via /api/patients/<pid>/watch-rules.
// Mirrors the structure of portal-pending.js.
// ---------------------------------------------------------------------------

let activeWatchRules = [];
let activeWatchPatientId = '';
let watchRulesLoading = false;
let watchRulesAddOpen = false;
let watchRulesLoadSeq = 0;

// ---------------------------------------------------------------------------
// Evaluation — reuses normalizeUserSafetyRule + compareUserRuleValue from
// portal-safety-rules.js, which is loaded before this file.
// ---------------------------------------------------------------------------

function evaluateWatchRule(rule) {
  if (!rule || !rule.enabled) return 'disabled';
  const ctx = typeof activePatientContext !== 'undefined' ? activePatientContext : null;
  const labs = ctx && (ctx.latestLabs || ctx.labs) ? (ctx.latestLabs || ctx.labs) : {};
  if (!Object.keys(labs).length) return 'no-labs';
  const normalized = typeof normalizeUserSafetyRule === 'function' ? normalizeUserSafetyRule(rule) : null;
  if (!normalized) return 'invalid';
  const results = normalized.conditions.map((cond) => {
    const value = typeof safetyLab === 'function'
      ? safetyLab(labs, cond.labKey)
      : (labs[cond.labKey] !== undefined && labs[cond.labKey] !== null && labs[cond.labKey] !== '' ? Number(labs[cond.labKey]) : null);
    if (value === null || !Number.isFinite(value)) return { matched: false, missing: true };
    return {
      matched: typeof compareUserRuleValue === 'function'
        ? compareUserRuleValue(value, cond.operator, cond.threshold)
        : false,
      missing: false,
    };
  });
  if (results.some((r) => r.missing)) return 'missing-labs';
  const fires = normalized.logic === 'or'
    ? results.some((r) => r.matched)
    : results.every((r) => r.matched);
  return fires ? 'fires' : 'clear';
}

function watchRuleConditionText(rule) {
  const conds = Array.isArray(rule.conditions) ? rule.conditions : [];
  return conds.map((c) => `${c.labKey} ${c.operator} ${c.threshold}`).join(` ${(rule.logic || 'AND').toUpperCase()} `);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function watchRulesEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderWatchRuleStatusChip(status, tone) {
  if (status === 'fires') return `<span class="pc-watch-status-chip fires ${watchRulesEsc(tone || 'warn')}">⚑ Fires</span>`;
  if (status === 'clear') return `<span class="pc-watch-status-chip clear">✓ Clear</span>`;
  if (status === 'disabled') return `<span class="pc-watch-status-chip off">Off</span>`;
  if (status === 'no-labs') return `<span class="pc-watch-status-chip unknown">No labs loaded</span>`;
  if (status === 'missing-labs') return `<span class="pc-watch-status-chip unknown">Lab not in record</span>`;
  return `<span class="pc-watch-status-chip unknown">—</span>`;
}

function watchRuleCurrentValueText(rule) {
  const ctx = typeof activePatientContext !== 'undefined' ? activePatientContext : null;
  const labs = ctx && (ctx.latestLabs || ctx.labs) ? (ctx.latestLabs || ctx.labs) : {};
  const conds = Array.isArray(rule && rule.conditions) ? rule.conditions : [];
  return conds
    .map((cond) => {
      const value = typeof safetyLab === 'function'
        ? safetyLab(labs, cond.labKey)
        : (labs[cond.labKey] !== undefined && labs[cond.labKey] !== null && labs[cond.labKey] !== '' ? Number(labs[cond.labKey]) : null);
      return `${cond.labKey}: ${value === null || !Number.isFinite(value) ? 'not available' : value}`;
    })
    .join(', ');
}

function buildWatchRuleTodoPayload(rule) {
  const title = `Review: ${rule && rule.title ? rule.title : 'watch condition'}`;
  const condition = watchRuleConditionText(rule);
  const values = watchRuleCurrentValueText(rule);
  return {
    title,
    priority: rule && rule.tone === 'danger' ? 'high' : 'normal',
    due_at: typeof defaultGeneratedTodoDueAt === 'function' ? defaultGeneratedTodoDueAt() : '',
    note: [
      'Created from Watch Rule.',
      condition ? `Condition: ${condition}.` : '',
      values ? `Current value(s): ${values}.` : '',
    ].filter(Boolean).join('\n'),
  };
}

async function handleWatchRuleTodoCreateFromButton(buttonEl) {
  const pid = buttonEl && buttonEl.dataset ? buttonEl.dataset.pid : '';
  const ruleId = buttonEl && buttonEl.dataset ? buttonEl.dataset.ruleId : '';
  const rule = activeWatchRules.find((item) => String(item.id || '') === ruleId);
  if (!rule) {
    if (typeof setGeneratedTodoButtonState === 'function') setGeneratedTodoButtonState(buttonEl, 'Rule gone', 'warn', 1800);
    return { status: 'missing-rule' };
  }
  if (typeof createGeneratedPatientTodo !== 'function') return { status: 'todo-unavailable' };
  return createGeneratedPatientTodo(pid, buildWatchRuleTodoPayload(rule), buttonEl);
}

function renderWatchRulesPanel() {
  const panel = document.getElementById('pc-watch-rules-panel');
  if (!panel) return;

  if (watchRulesLoading) {
    panel.innerHTML = '<div class="pc-empty">Loading watch conditions…</div>';
    return;
  }

  const pid = activeWatchPatientId;

  const formHtml = watchRulesAddOpen ? `
    <div class="pc-watch-add-form" id="pc-watch-add-form">
      <div class="pc-watch-add-row">
        <input id="wra-title" class="pc-watch-input" type="text" placeholder="Label (e.g. K rising)" maxlength="60" />
      </div>
      <div class="pc-watch-add-row pc-watch-cond-row">
        <input id="wra-lab" class="pc-watch-input pc-watch-lab" type="text"
          list="rules-lab-keys" placeholder="Lab key (e.g. K)" />
        <select id="wra-op" class="pc-watch-select">
          <option value=">=">&ge;</option>
          <option value=">">&gt;</option>
          <option value="<=" selected>&le;</option>
          <option value="<">&lt;</option>
          <option value="=">=</option>
        </select>
        <input id="wra-thresh" class="pc-watch-input pc-watch-thresh" type="number" step="any" placeholder="Value" />
        <select id="wra-tone" class="pc-watch-select">
          <option value="warn" selected>Warn</option>
          <option value="danger">Danger</option>
          <option value="info">Info</option>
        </select>
      </div>
      <div class="pc-watch-add-actions">
        <button class="btn-primary btn-sm" onclick="submitWatchRule('${watchRulesEsc(pid)}')">Save</button>
        <button class="btn-secondary btn-sm" onclick="closeWatchRuleForm()">Cancel</button>
      </div>
    </div>` : '';

  if (!activeWatchRules.length) {
    panel.innerHTML = `
      ${formHtml}
      ${!watchRulesAddOpen ? `<div class="pc-empty">No watch conditions yet.</div>` : ''}`;
    return;
  }

  const ruleCards = activeWatchRules.map((rule) => {
    const status = evaluateWatchRule(rule);
    const condText = watchRuleConditionText(rule);
    return `
      <div class="pc-watch-rule-card ${rule.enabled ? '' : 'disabled'}">
        <div class="pc-watch-rule-top">
          <div class="pc-watch-rule-title">${watchRulesEsc(rule.title)}</div>
          ${renderWatchRuleStatusChip(status, rule.tone)}
        </div>
        <div class="pc-watch-rule-cond">Fires when ${watchRulesEsc(condText)}</div>
        <div class="pc-watch-rule-actions">
          <label class="pc-watch-toggle" title="${rule.enabled ? 'Disable' : 'Enable'} watch condition">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''}
              onchange="toggleWatchRule('${watchRulesEsc(pid)}', '${watchRulesEsc(rule.id)}', this.checked)" />
            <span>${rule.enabled ? 'On' : 'Off'}</span>
          </label>
          ${status === 'fires' ? `<button class="btn-secondary btn-sm pc-create-task-btn" type="button" data-pid="${watchRulesEsc(pid)}" data-rule-id="${watchRulesEsc(rule.id)}" onclick="handleWatchRuleTodoCreateFromButton(this)">Create task</button>` : ''}
          <button class="pc-watch-delete" title="Delete watch condition"
            onclick="deleteWatchRule('${watchRulesEsc(pid)}', '${watchRulesEsc(rule.id)}')">✕</button>
        </div>
      </div>`;
  }).join('');

  panel.innerHTML = `${formHtml}${ruleCards}`;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function loadWatchRules(pid) {
  const seq = ++watchRulesLoadSeq;
  if (!pid) {
    activeWatchRules = [];
    activeWatchPatientId = '';
    watchRulesAddOpen = false;
    renderWatchRulesPanel();
    return;
  }
  activeWatchPatientId = pid;
  watchRulesLoading = true;
  renderWatchRulesPanel();
  try {
    const res = await fetch(`/api/patients/${pid}/watch-rules`);
    if (!res.ok) throw new Error(`Watch rules fetch failed (${res.status})`);
    const data = await res.json();
    if (seq !== watchRulesLoadSeq) return;
    activeWatchRules = data.rules || [];
    activeWatchPatientId = pid;
  } catch (e) {
    if (seq !== watchRulesLoadSeq) return;
    activeWatchRules = [];
  } finally {
    if (seq === watchRulesLoadSeq) {
      watchRulesLoading = false;
      renderWatchRulesPanel();
    }
  }
}

async function submitWatchRule(pid) {
  const title = (document.getElementById('wra-title') || {}).value || '';
  const labKey = (document.getElementById('wra-lab') || {}).value || '';
  const operator = (document.getElementById('wra-op') || {}).value || '<=';
  const threshold = (document.getElementById('wra-thresh') || {}).value;
  const tone = (document.getElementById('wra-tone') || {}).value || 'warn';

  if (!title.trim() || !labKey.trim() || threshold === '') {
    const titleEl = document.getElementById('wra-title');
    if (titleEl) titleEl.focus();
    return;
  }

  try {
    const res = await fetch(`/api/patients/${pid}/watch-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        conditions: [{ labKey: labKey.trim(), operator, threshold: Number(threshold) }],
        logic: 'and',
        tone,
        enabled: true,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save watch condition');
    }
    const data = await res.json();
    activeWatchRules = [data.rule, ...activeWatchRules];
    watchRulesAddOpen = false;
    renderWatchRulesPanel();
  } catch (e) {
    // Surface error inline without alerting
    const form = document.getElementById('pc-watch-add-form');
    if (form) {
      let errEl = form.querySelector('.pc-watch-error');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'pc-watch-error';
        form.appendChild(errEl);
      }
      errEl.textContent = e.message || 'Save failed';
    }
  }
}

async function deleteWatchRule(pid, ruleId) {
  if (!confirm('Remove this watch condition?')) return;
  try {
    const res = await fetch(`/api/patients/${pid}/watch-rules/${ruleId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    activeWatchRules = activeWatchRules.filter((r) => r.id !== ruleId);
    renderWatchRulesPanel();
  } catch (e) {
    // fail silently — reload will restore state
  }
}

async function toggleWatchRule(pid, ruleId, enabled) {
  const rule = activeWatchRules.find((r) => r.id === ruleId);
  if (rule) rule.enabled = enabled;
  renderWatchRulesPanel();
  try {
    await fetch(`/api/patients/${pid}/watch-rules/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  } catch (e) {
    // revert on failure
    if (rule) rule.enabled = !enabled;
    renderWatchRulesPanel();
  }
}

function openWatchRuleForm() {
  watchRulesAddOpen = true;
  renderWatchRulesPanel();
  requestAnimationFrame(() => {
    const el = document.getElementById('wra-title');
    if (el) el.focus();
  });
}

function closeWatchRuleForm() {
  watchRulesAddOpen = false;
  renderWatchRulesPanel();
}

if (typeof window !== 'undefined') {
  window.__watchRulesTestApi = {
    evaluateWatchRule,
    watchRuleConditionText,
    buildWatchRuleTodoPayload,
    renderWatchRuleStatusChip,
  };
}
