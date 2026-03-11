// ---------------------------------------------------------------------------
// PHI Remover — drag & drop + file input
// ---------------------------------------------------------------------------
let currentResult = null;
let phiFilesVisible = false;

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('phi-file-input');

['dragenter', 'dragover'].forEach((evt) => {
  dropArea.addEventListener(evt, (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  dropArea.addEventListener(evt, (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
  });
});

dropArea.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) processFile(fileInput.files[0]);
});

async function processFile(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert('Only PDF files are accepted.');
    return;
  }

  document.getElementById('phi-upload-state').style.display = 'none';
  const procState = document.getElementById('phi-processing-state');
  procState.classList.add('active');
  document.getElementById('phi-proc-file').textContent = file.name;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('keep_dates', document.getElementById('phi-keep-dates').checked);

  try {
    const res = await fetch('/api/phi/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Processing failed');

    currentResult = data;
    showResults(data);
  } catch (err) {
    alert(`Error: ${err.message}`);
    resetPhi();
  }
}

function showResults(data) {
  document.getElementById('phi-processing-state').classList.remove('active');
  document.getElementById('phi-upload-state').style.display = 'none';
  document.getElementById('phi-results-state').classList.add('active');

  document.getElementById('result-meta').textContent =
    `${data.original_file} — ${data.total_redactions} items redacted${data.keep_dates ? ' (dates kept)' : ''}`;

  const summary = document.getElementById('result-summary');
  let html = '<h4>Redaction Summary</h4>';
  const counts = data.phi_counts || {};
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  for (const [type, count] of sorted) {
    const label = type.replace(/_/g, ' ');
    html += `<div class="phi-stat">
      <span class="phi-type">${label}</span>
      <span class="phi-count">${count}</span>
    </div>`;
  }

  html += `<div class="phi-total">
    <span>Total</span>
    <span class="count">${data.total_redactions}</span>
  </div>`;
  summary.innerHTML = html;

  fetch(data.download_url)
    .then((r) => r.text())
    .then((text) => {
      document.getElementById('result-preview').textContent = text;
    });
}

function downloadResult() {
  if (!currentResult) return;
  window.open(currentResult.download_url, '_blank');
}

function resetPhi() {
  currentResult = null;
  document.getElementById('phi-results-state').classList.remove('active');
  document.getElementById('phi-processing-state').classList.remove('active');
  document.getElementById('phi-upload-state').style.display = 'flex';
  document.getElementById('result-preview').textContent = '';
  document.getElementById('result-summary').innerHTML = '';
  fileInput.value = '';
}

// ---------------------------------------------------------------------------
// PHI file management
// ---------------------------------------------------------------------------
async function loadPhiFiles() {
  try {
    const res = await fetch('/api/phi/files');
    const files = await res.json();
    const countEl = document.getElementById('phi-files-count');
    const clearBtn = document.getElementById('phi-clear-all');

    countEl.textContent = files.length > 0 ? `(${files.length})` : '';
    clearBtn.style.display = files.length > 0 ? 'inline-block' : 'none';

    const list = document.getElementById('phi-file-list');
    if (files.length === 0) {
      list.innerHTML = '<div style="padding:0.5rem;font-size:0.65rem;color:var(--text-dim);text-align:center;">No saved files</div>';
      return;
    }

    list.innerHTML = files.map((f) => {
      const sizeKB = (f.size / 1024).toFixed(1);
      const date = new Date(f.created).toLocaleDateString();
      return `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0.5rem;font-size:0.62rem;border-bottom:1px solid var(--border);">
        <span style="flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${f.filename}">${f.filename}</span>
        <span style="color:var(--text-dim);flex-shrink:0;">${sizeKB}KB &middot; ${date}</span>
        <button class="btn-secondary" style="font-size:0.55rem;padding:0.15rem 0.4rem;" onclick="window.open('${f.download_url}','_blank')">&#8595;</button>
        <button class="btn-secondary" style="font-size:0.55rem;padding:0.15rem 0.4rem;color:var(--red);border-color:var(--red);" onclick="deletePhiFile('${f.filename}')">&#10005;</button>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('Failed to load PHI files:', e);
  }
}

function togglePhiFiles() {
  phiFilesVisible = !phiFilesVisible;
  document.getElementById('phi-file-manager').style.display = phiFilesVisible ? 'block' : 'none';
  if (phiFilesVisible) loadPhiFiles();
}

async function deletePhiFile(filename) {
  if (!confirm(`Delete ${filename}?`)) return;
  try {
    await fetch(`/api/phi/files/${filename}`, { method: 'DELETE' });
    loadPhiFiles();
  } catch (e) {
    alert('Failed to delete file.');
  }
}

async function clearAllPhiFiles() {
  if (!confirm('Delete ALL saved de-identified files? This cannot be undone.')) return;
  try {
    await fetch('/api/phi/files', { method: 'DELETE' });
    loadPhiFiles();
  } catch (e) {
    alert('Failed to clear files.');
  }
}

loadPhiFiles();
