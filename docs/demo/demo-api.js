(function () {
  const fixtures = window.MEDIPORT_DEMO_FIXTURES || { patients: [], wardTodos: [], cannedNotes: {}, consults: {} };
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const state = {
    patients: clone(fixtures.patients || []),
    wardTodos: clone(fixtures.wardTodos || []),
    nextId: 1000
  };

  function json(data, status) {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    }));
  }

  function text(data, status) {
    return Promise.resolve(new Response(String(data || ''), {
      status: status || 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    }));
  }

  function nextId(prefix) {
    state.nextId += 1;
    return `${prefix}-${state.nextId}`;
  }

  function pathFrom(input) {
    const raw = typeof input === 'string' ? input : (input && input.url) || '';
    const url = new URL(raw, window.location.href);
    let path = url.pathname;
    path = path.replace(/^.*\/s\/handoff\/api/, '/api');
    path = path.replace(/^.*\/demo\/api\//, '/api/');
    path = path.replace(/^.*\/api\//, '/api/');
    return { path, url };
  }

  async function bodyJson(init) {
    if (!init || init.body == null) return {};
    if (typeof init.body === 'string') {
      try { return JSON.parse(init.body); } catch (err) { return {}; }
    }
    return {};
  }

  function patientList() {
    return state.patients.map((p) => ({
      id: p.id,
      name: p.name,
      dx: p.dx,
      admitted: p.admitted,
      age: p.age,
      sex: p.sex,
      age_sex: p.age_sex,
      modified: p.modified
    }));
  }

  function findPatient(pid) {
    return state.patients.find((p) => p.id === decodeURIComponent(pid || ''));
  }

  function allTodos() {
    return [...state.wardTodos, ...state.patients.flatMap((p) => p.todos || [])];
  }

  function touch(patient) {
    patient.modified = new Date().toISOString();
  }

  function noteFor(type, patient) {
    const requested = type || 'sbar';
    const generated = fixtures.generatedNotes || {};
    if (patient && patient.generatedNotes && patient.generatedNotes[requested]) return patient.generatedNotes[requested];
    if (patient && generated[patient.id] && generated[patient.id][requested]) return generated[patient.id][requested];
    const notes = fixtures.cannedNotes || {};
    const base = notes[requested] || notes.sbar || 'Demo note unavailable.';
    return `${base}\n\n_Demo mode: generated from canned text for ${patient ? patient.name : 'synthetic patients'}._`;
  }

  function enrichWardPatient(patient) {
    return {
      ...clone(patient),
      content: patient.content,
      vitals: clone(patient.vitals || []),
      pending: clone(patient.pending || []),
      todos: clone(patient.todos || []),
      meta: clone(patient.meta || {}),
      medications: clone(patient.medications || { baseline: [], current: [], changes: [] }),
      problems: clone(patient.problems || { problems: [] })
    };
  }

  function blocked(message) {
    return json({ error: message || 'Demo mode: this action is disabled.' }, 403);
  }

  async function handlePatientSubroute(patient, parts, method, init) {
    const [sub, id, extra] = parts;
    if (!sub) {
      if (method === 'GET') return json({ ...clone(patient), content: patient.content });
      if (method === 'PUT') {
        const body = await bodyJson(init);
        patient.content = String(body.content || patient.content || '');
        touch(patient);
        return json({ ok: true, content: patient.content });
      }
      if (method === 'DELETE') return blocked('Demo mode keeps the synthetic patients fixed.');
    }
    if (sub === 'discharge') return blocked('Demo mode does not discharge synthetic patients.');
    if (sub === 'append' && method === 'POST') {
      const body = await bodyJson(init);
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const category = body.category || 'Clinical Note';
      const content = String(body.content || '').trim();
      if (content) patient.content += `\n\n## ${category} — ${stamp}\n${content}`;
      touch(patient);
      return json({ ok: true, timestamp: stamp, content: patient.content });
    }
    if (sub === 'medications') return handleMedicationRoute(patient, id, extra, method, init);
    if (sub === 'problems') return handleProblemRoute(patient, id, extra, method, init);
    if (sub === 'vitals') return handleListRoute(patient, 'vitals', 'vital', id, method, init, { vitals: true });
    if (sub === 'pending') return handleListRoute(patient, 'pending', 'pending', id, method, init, { items: true });
    if (sub === 'io') return handleListRoute(patient, 'io', 'io', id, method, init, { entries: true });
    if (sub === 'todos') return handlePatientTodoRoute(patient, id, method, init);
    if (sub === 'meta') {
      if (method === 'GET') return json({ meta: clone(patient.meta || {}) });
      if (method === 'PUT') {
        patient.meta = { ...(patient.meta || {}), ...(await bodyJson(init)).meta, ...(await bodyJson(init)) };
        touch(patient);
        return json({ meta: clone(patient.meta) });
      }
    }
    if (sub === 'watch-rules') return handleListRoute(patient, 'watchRules', 'watch', id, method, init, { rules: true });
    return null;
  }

  async function handleMedicationRoute(patient, id, extra, method, init) {
    patient.medications ||= { baseline: [], current: [], changes: [] };
    if (!id && method === 'GET') return json({ medications: clone(patient.medications) });
    if (id === 'baseline' && method === 'PUT') {
      const body = await bodyJson(init);
      patient.medications.baseline = Array.isArray(body.baseline) ? body.baseline : [];
      touch(patient);
      return json({ medications: clone(patient.medications) });
    }
    if (!id && method === 'POST') {
      const body = await bodyJson(init);
      patient.medications.current.push({ id: nextId('med'), status: 'active', ...body });
      patient.medications.changes.unshift({ id: nextId('med-change'), action: 'added', timestamp: new Date().toISOString(), to_sig: body.name || 'Medication', reason: body.reason || 'Demo edit' });
      touch(patient);
      return json({ medications: clone(patient.medications) });
    }
    const list = patient.medications.current;
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return json({ error: 'Medication not found' }, 404);
    if (method === 'PUT') {
      const body = await bodyJson(init);
      list[index] = { ...list[index], ...body };
      patient.medications.changes.unshift({ id: nextId('med-change'), action: 'updated', timestamp: new Date().toISOString(), to_sig: list[index].name || 'Medication', reason: body.reason || 'Demo edit' });
      touch(patient);
      return json({ medications: clone(patient.medications) });
    }
    if (method === 'DELETE') {
      list.splice(index, 1);
      touch(patient);
      return json({ medications: clone(patient.medications) });
    }
    return null;
  }

  async function handleProblemRoute(patient, id, extra, method, init) {
    patient.problems ||= { problems: [] };
    if (!id && method === 'GET') return json({ problems: clone(patient.problems) });
    if (!id && method === 'POST') {
      const body = await bodyJson(init);
      patient.problems.problems.push({ id: nextId('problem'), priority: patient.problems.problems.length + 1, status: 'active', updated_at: new Date().toISOString(), ...body });
      touch(patient);
      return json({ problems: clone(patient.problems) });
    }
    const list = patient.problems.problems;
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return json({ error: 'Problem not found' }, 404);
    if (method === 'PUT') {
      list[index] = { ...list[index], ...(await bodyJson(init)), updated_at: new Date().toISOString() };
      touch(patient);
      return json({ problems: clone(patient.problems) });
    }
    if (method === 'DELETE') {
      list.splice(index, 1);
      touch(patient);
      return json({ problems: clone(patient.problems) });
    }
    return null;
  }

  async function handleListRoute(patient, key, idPrefix, id, method, init, envelope) {
    patient[key] ||= [];
    const responseKey = envelope.vitals ? 'vitals' : envelope.items ? 'items' : envelope.entries ? 'entries' : envelope.rules ? 'rules' : key;
    if (!id && method === 'GET') return json({ [responseKey]: clone(patient[key]) });
    if (!id && method === 'POST') {
      const item = { id: nextId(idPrefix), ...(await bodyJson(init)) };
      patient[key].unshift(item);
      touch(patient);
      return json({ [responseKey]: clone(patient[key]), item });
    }
    const index = patient[key].findIndex((item) => item.id === id);
    if (index === -1) return json({ error: 'Item not found' }, 404);
    if (method === 'PUT' || method === 'PATCH') patient[key][index] = { ...patient[key][index], ...(await bodyJson(init)) };
    if (method === 'DELETE') patient[key].splice(index, 1);
    touch(patient);
    return json({ [responseKey]: clone(patient[key]), item: patient[key][index] || null });
  }

  async function handlePatientTodoRoute(patient, id, method, init) {
    patient.todos ||= [];
    if (!id && method === 'GET') return json({ items: clone(patient.todos) });
    if (!id && method === 'POST') {
      const body = await bodyJson(init);
      const item = { id: nextId('todo'), patient_id: patient.id, status: 'open', priority: 'normal', created_at: new Date().toISOString(), ...body };
      patient.todos.unshift(item);
      touch(patient);
      return json({ item });
    }
    return handleTodoById(id, method, init);
  }

  async function handleTodoById(id, method, init) {
    const lists = [state.wardTodos, ...state.patients.map((p) => p.todos || [])];
    for (const list of lists) {
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) continue;
      if (method === 'PUT' || method === 'PATCH') {
        list[index] = { ...list[index], ...(await bodyJson(init)) };
        return json({ item: clone(list[index]) });
      }
      if (method === 'DELETE') {
        list.splice(index, 1);
        return json({ ok: true });
      }
    }
    return json({ error: 'Todo not found' }, 404);
  }

  async function handle(input, init) {
    const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    const { path, url } = pathFrom(input);

    if (path === '/api/status') return json({ handoff: { alive: true }, admissions: { alive: true } });
    if (path === '/api/music') return json({ tracks: [] });
    if (path === '/api/ai-status') return json({ ai_available: true, source: 'demo', model: 'canned-demo' });
    if (path.startsWith('/api/phi/upload')) return blocked('Demo mode disables PHI upload. Use synthetic text only.');
    if (path === '/api/phi/files') return json([]);
    if (path.startsWith('/api/phi/files/')) return json({ ok: true });
    if (path === '/api/ward/summary') return json({ patients: state.patients.map(enrichWardPatient), generated_at: new Date().toISOString() });

    if (path === '/api/consults/note' && method === 'POST') return json({ note: fixtures.consults.note });
    if (path === '/api/consults/opinion' && method === 'POST') return json({ note: fixtures.consults.opinion, opinion: fixtures.consults.opinion });
    if (path === '/api/consults/de-escalation' && method === 'POST') return json({ note: fixtures.consults.deescalation, recommendation: fixtures.consults.deescalation });

    if (path === '/api/generate' && method === 'POST') {
      const body = await bodyJson(init);
      const patient = findPatient(body.patient_id) || state.patients[0];
      return json({ note: noteFor(body.type || 'sbar', patient), canned: true });
    }
    if (path === '/api/generate/batch-sbar' && method === 'POST') {
      return json(state.patients.filter((p) => !p.id.endsWith('_dc')).map((p) => ({ id: p.id, name: p.name, note: noteFor('sbar', p) })));
    }
    if (path === '/api/export/chart' && method === 'POST') {
      const body = await bodyJson(init);
      return json({
        generated: new Date().toISOString(),
        patients: state.patients.filter((p) => !p.id.endsWith('_dc')).map((p) => ({ id: p.id, name: p.name, dx: p.dx, admitted: p.admitted, note: noteFor(body.type || 'sbar', p) }))
      });
    }

    if (path === '/api/todos' && method === 'GET') {
      const patientId = url.searchParams.get('patient_id');
      const status = url.searchParams.get('status');
      let items = allTodos();
      if (patientId === '__untagged') items = items.filter((item) => !item.patient_id);
      else if (patientId) items = items.filter((item) => item.patient_id === patientId);
      if (status) items = items.filter((item) => (item.status || 'open') === status);
      return json({ items: clone(items) });
    }
    if (path === '/api/todos' && method === 'POST') {
      const body = await bodyJson(init);
      const item = { id: nextId('todo'), patient_id: body.patient_id || '', status: 'open', priority: 'normal', created_at: new Date().toISOString(), ...body };
      if (item.patient_id) {
        const patient = findPatient(item.patient_id);
        if (patient) patient.todos.unshift(item);
      } else {
        state.wardTodos.unshift(item);
      }
      return json({ item });
    }
    const todoMatch = path.match(/^\/api\/todos\/([^/]+)$/);
    if (todoMatch) return handleTodoById(decodeURIComponent(todoMatch[1]), method, init);

    if (path === '/api/patients') {
      if (method === 'GET') return json(patientList());
      if (method === 'POST') return blocked('Demo mode uses only preloaded synthetic patients.');
    }
    const patientMatch = path.match(/^\/api\/patients\/([^/]+)(?:\/(.*))?$/);
    if (patientMatch) {
      const patient = findPatient(patientMatch[1]);
      if (!patient) return json({ error: 'Patient not found' }, 404);
      const parts = patientMatch[2] ? patientMatch[2].split('/').map(decodeURIComponent) : [];
      const handled = await handlePatientSubroute(patient, parts, method, init);
      if (handled) return handled;
    }
    return null;
  }

  window.fetch = async function demoFetch(input, init) {
    try {
      const result = await handle(input, init || {});
      if (result) return result;
    } catch (err) {
      return json({ error: err.message || 'Demo API error' }, 500);
    }
    if (originalFetch) return originalFetch(input, init);
    return text('Not found', 404);
  };
})();