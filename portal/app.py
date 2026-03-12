"""
Medical Portal — Unified launcher and dashboard for clinical tools.

Manages sub-services (Handoff Tool, Admissions) as child processes and
provides a web UI wrapper for PHI Remover. Everything accessible from
a single browser tab at http://localhost:3000.

Sub-services are reverse-proxied through the portal so iframes are
same-origin — avoids all cross-port / cross-origin browser issues.
"""

import json
import os
import sys
import signal
import subprocess
import atexit
import time
import socket
import uuid
import datetime
from pathlib import Path

import requests as http_requests
from flask import Flask, render_template, request, jsonify, send_file, Response

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PORTAL_DIR = Path(__file__).parent.resolve()
MEDICAL_DIR = PORTAL_DIR.parent
HANDOFF_DIR = MEDICAL_DIR / "Handoff" / "handoff-tool"
ADMISSIONS_DIR = MEDICAL_DIR / "Admissions" / "dist"
UPLOAD_DIR = PORTAL_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MUSIC_DIR = PORTAL_DIR / "static" / "music"
MUSIC_DIR.mkdir(parents=True, exist_ok=True)
MUSIC_EXTENSIONS = {'.mp3', '.ogg', '.wav', '.flac', '.m4a', '.aac', '.opus', '.webm'}

# Import PHI Remover functions
sys.path.insert(0, str(MEDICAL_DIR))
from phi_remover import extract_text_from_pdf, clean_text, redact_phi, generate_summary_header

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB upload limit

DEFAULT_PORTAL_CONFIG = {
    "portal_title": "Medical Portal — Clinical Tools",
    "brand_name": "MEDICAL PORTAL",
    "brand_tagline": "Dr.Su's medportal, V1.0",
    "footer_note": "",
    "lab_paste_toggle_label": "Paste Lab Data",
    "lab_paste_placeholder": "Paste lab report here",
}

# ---------------------------------------------------------------------------
# Child process management
# ---------------------------------------------------------------------------
child_processes = {}

# Service definitions: name → internal port
SERVICES = {
    "handoff":    5050,   # Internal port (not exposed directly)
}


def is_port_in_use(port):
    """Check if a port is already bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def start_service(name, cmd, cwd, port, env=None):
    """Start a child service if its port isn't already in use."""
    if is_port_in_use(port):
        print(f"  [{name}] Port {port} already in use — assuming service is running")
        child_processes[name] = {"process": None, "port": port, "status": "external"}
        return True

    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)

    try:
        popen_kwargs = {
            "cwd": str(cwd),
            "env": merged_env,
            "stdout": subprocess.DEVNULL,
            "stderr": subprocess.DEVNULL,
        }
        if os.name == "nt":
            popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            popen_kwargs["preexec_fn"] = os.setsid
        proc = subprocess.Popen(
            cmd,
            **popen_kwargs,
        )
        child_processes[name] = {"process": proc, "port": port, "status": "started"}
        print(f"  [{name}] Started on internal port {port} (PID {proc.pid})")
        return True
    except Exception as e:
        print(f"  [{name}] Failed to start: {e}")
        child_processes[name] = {"process": None, "port": port, "status": "error"}
        return False


def stop_all_services():
    """Gracefully terminate all child processes."""
    for name, info in child_processes.items():
        proc = info.get("process")
        if proc and proc.poll() is None:
            try:
                if os.name == "nt":
                    proc.terminate()
                else:
                    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                proc.wait(timeout=5)
                print(f"  [{name}] Stopped")
            except Exception:
                try:
                    if os.name == "nt":
                        proc.kill()
                    else:
                        os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
                    print(f"  [{name}] Force-killed")
                except Exception:
                    pass


atexit.register(stop_all_services)


def signal_handler(signum, frame):
    print("\nShutting down portal...")
    stop_all_services()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


# ---------------------------------------------------------------------------
# Reverse proxy — serve sub-services through the portal (same origin)
# ---------------------------------------------------------------------------
PROXY_HOP_HEADERS = {
    'connection', 'keep-alive', 'transfer-encoding',
    'te', 'trailer', 'upgrade', 'proxy-authorization',
    'proxy-authenticate', 'content-encoding', 'content-length',
}


def proxy_request(target_port, path, prefix=None):
    """Forward current Flask request to a backend service.

    For HTML responses from the root page, rewrites absolute API paths
    (e.g. '/api/') so they route back through the proxy instead of
    hitting the portal's own routes.
    """
    url = f"http://127.0.0.1:{target_port}/{path}"
    if request.query_string:
        url += f"?{request.query_string.decode()}"

    try:
        resp = http_requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() not in ('host',)},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=120,
        )
    except http_requests.ConnectionError:
        return Response("Service not available", status=502)

    # Filter hop-by-hop headers
    headers = {
        k: v for k, v in resp.raw.headers.items()
        if k.lower() not in PROXY_HOP_HEADERS
    }

    content_type = resp.headers.get('content-type', '')

    # Rewrite absolute paths in HTML so API calls route through the proxy
    if prefix and 'text/html' in content_type:
        body = resp.content.decode('utf-8', errors='replace')
        # Rewrite fetch('/api/...') and fetch(`/api/...`) style calls
        body = body.replace("'/api/", f"'{prefix}/api/")
        body = body.replace('"/api/', f'"{prefix}/api/')
        body = body.replace('`/api/', f'`{prefix}/api/')
        return Response(body, status=resp.status_code, headers=headers,
                        content_type=content_type)

    return Response(
        resp.content,
        status=resp.status_code,
        headers=headers,
    )


@app.route('/s/handoff/', defaults={'path': ''})
@app.route('/s/handoff/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_handoff(path):
    return proxy_request(SERVICES["handoff"], path, prefix='/s/handoff')


ADMISSIONS_HANDOFF_INJECTION = """
<!-- Injected by portal: Send to Handoff button + logic -->
<style>
#sendToHandoffBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
#sendToHandoffBtn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.3); }
#sendToHandoffBtn:active { transform: translateY(0); }
#sendToHandoffBtn.success { background: linear-gradient(135deg, #059669, #047857); }
#sendToHandoffBtn.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
html[data-theme="dark"] #sendToHandoffBtn { box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
</style>
<script>
(function() {
  // Wait for DOM
  function init() {
    // Create the button
    var btn = document.createElement('button');
    btn.id = 'sendToHandoffBtn';
    btn.innerHTML = '&#9883; Send to Handoff';
    btn.title = 'Create a new patient in Handoff Tool from current admission data';
    document.body.appendChild(btn);

    btn.addEventListener('click', function() {
      sendToHandoff(btn);
    });
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function sendToHandoff(btn) {
    // Extract data from Admissions form fields
    var ageSex = getVal('plan_age_sex');  // e.g. "*49M"
    var cc = getVal('ccpi');
    var pmh = getVal('hist_pmh');
    var allergies = getVal('hist_med_allergy_details');
    var diagActive = getVal('diagnosis_active') || getVal('plan_assessment_active');
    var diagUnderlying = getVal('diagnosis_underlying') || getVal('plan_assessment_underlying');
    var narrative = getVal('patientHistoryNarrative');
    var meds = getVal('hist_current_med_other');
    var surgHx = getVal('hist_surgical_history_detailed');
    var vitalsT = getVal('vitals_t'), vitalsP = getVal('vitals_p');
    var vitalsR = getVal('vitals_r'), vitalsBP = getVal('vitals_bp');
    var pe = getVal('pe_details');
    var soapPlan = getVal('plan_plan');
    var labData = getVal('plan_lab_data');

    // Build name from narrative or prompt
    var name = '';
    if (narrative) {
      // Try to extract age/sex pattern to construct a placeholder name
      var m = ageSex.match(/\\*(\\d+)([MF])/i);
      if (m) name = m[1] + m[2].toUpperCase();
    }
    if (!name) {
      name = prompt('Patient name for Handoff record:', '');
      if (!name) return;
    }

    // Build diagnosis string
    var dx = '';
    if (cc) dx = cc;
    else if (diagActive) dx = diagActive.split('\\n')[0].replace(/^#\\.\\s*/, '');

    var today = new Date().toISOString().slice(0, 10);

    btn.disabled = true;
    btn.innerHTML = '&#8987; Sending...';

    // POST to Handoff API (same origin through portal proxy)
    fetch('/s/handoff/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        age_sex: ageSex.replace(/^\\*/, ''),
        admitted: today,
        dx: dx,
        pmh: pmh,
        allergies: allergies || 'NKDA',
        code_status: 'Full code',
        team: '',
      })
    })
    .then(function(res) { return res.json().then(function(data) { return {ok: res.ok, data: data}; }); })
    .then(function(result) {
      if (!result.ok) throw new Error(result.data.error || 'Failed to create patient');

      var pid = result.data.id;

      // Now append the initial clinical data as the first entry
      var entryParts = [];
      if (narrative) entryParts.push('**History:** ' + narrative);
      if (surgHx) entryParts.push('**Surgical Hx:** ' + surgHx);
      if (meds) entryParts.push('**Current Medications:** ' + meds);
      if (vitalsT || vitalsBP) {
        var vStr = [];
        if (vitalsT) vStr.push('T ' + vitalsT);
        if (vitalsP) vStr.push('P ' + vitalsP);
        if (vitalsR) vStr.push('R ' + vitalsR);
        if (vitalsBP) vStr.push('BP ' + vitalsBP);
        entryParts.push('**Vitals:** ' + vStr.join(', '));
      }
      if (pe) entryParts.push('**PE:** ' + pe);
      if (labData) entryParts.push('**Labs:** ' + labData);
      if (diagActive) entryParts.push('**Active Dx:** ' + diagActive);
      if (diagUnderlying) entryParts.push('**Underlying:** ' + diagUnderlying);
      if (soapPlan) entryParts.push('**Plan:** ' + soapPlan);

      if (entryParts.length === 0) {
        btn.innerHTML = '&#10003; Created in Handoff';
        btn.className = 'success';
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'handoff-refresh', patientId: pid }, '*');
          window.parent.postMessage({ type: 'handoff-patient-created', patientId: pid }, '*');
        }
        setTimeout(function() { btn.innerHTML = '&#9883; Send to Handoff'; btn.className = ''; btn.disabled = false; }, 3000);
        return;
      }

      return fetch('/s/handoff/api/patients/' + pid + '/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entryParts.join('\\n\\n'),
          category: 'Clinical Note'
        })
      }).then(function() {
        btn.innerHTML = '&#10003; Created in Handoff';
        btn.className = 'success';
        // Notify parent portal to refresh handoff iframe
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'handoff-refresh', patientId: pid }, '*');
          window.parent.postMessage({ type: 'handoff-patient-created', patientId: pid }, '*');
        }
        setTimeout(function() { btn.innerHTML = '&#9883; Send to Handoff'; btn.className = ''; btn.disabled = false; }, 3000);
      });
    })
    .catch(function(err) {
      btn.innerHTML = '&#10007; ' + err.message;
      btn.className = 'error';
      setTimeout(function() { btn.innerHTML = '&#9883; Send to Handoff'; btn.className = ''; btn.disabled = false; }, 4000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
"""

ADMISSIONS_THEME_INJECTION = """
<!-- Injected by portal: dark mode support + theme sync -->
<style>
html[data-theme="dark"] {
  --primary: #22d3ee;
  --primary-dark: #06b6d4;
  --primary-light: #67e8f9;
  --accent: #22d3ee;
  --accent-dark: #06b6d4;
  --ai-accent: #2dd4bf;
  --ai-accent-dark: #14b8a6;
  --ai-accent-light: #5eead4;
  --secondary: #94a3b8;
  --secondary-dark: #cbd5e1;
  --success: #10b981;
  --success-light: #064e3b;
  --warning: #fbbf24;
  --warning-light: #78350f;
  --danger: #f87171;
  --danger-dark: #ef4444;
  --danger-light: #7f1d1d;
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --bg-elevated: rgba(30, 41, 59, 0.95);
  --bg-subtle: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-color: #f1f5f9;
  --header-color: #e2e8f0;
  --border: #475569;
  --border-light: #334155;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 6px 12px -2px rgba(0, 0, 0, 0.35), 0 3px 6px -3px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 10px 20px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -4px rgba(0, 0, 0, 0.3);
  --card: #1e293b;
  --complete-green: #10b981;
  --ready-purple: #a78bfa;
  --toast-bg: #10b981;
}
html[data-theme="dark"] body {
  background-image: none;
}
html[data-theme="dark"] #aiPanel {
  background: linear-gradient(135deg, rgba(45, 212, 191, 0.08), rgba(34, 211, 238, 0.08));
  border-color: rgba(45, 212, 191, 0.2);
}
html[data-theme="dark"] .block:not(.completed):not(.ai-filled) {
  background: var(--bg-card);
  border-color: var(--border);
}
html[data-theme="dark"] .block:not(.completed):not(.ai-filled):hover {
  border-color: var(--primary);
}
html[data-theme="dark"] #modalContent {
  background: var(--bg-page);
}
html[data-theme="dark"] #modalBody section {
  background: var(--bg-card);
  border-color: var(--border);
}
html[data-theme="dark"] #controls {
  background: var(--bg-card);
  border-color: var(--border);
}
html[data-theme="dark"] #noteOutputContainer {
  background: var(--bg-subtle);
  border-color: var(--border);
}
html[data-theme="dark"] .output-section h3 {
  color: var(--primary);
}
html[data-theme="dark"] .output-section {
  border-bottom-color: var(--border);
}
html[data-theme="dark"] details {
  background: var(--bg-subtle);
  border-color: var(--border);
}
html[data-theme="dark"] #apiKeySetup {
  background: rgba(251, 146, 60, 0.08);
  border-color: rgba(251, 146, 60, 0.2);
}
html[data-theme="dark"] #settings-menu {
  background: var(--bg-card);
  border-color: var(--border);
}
html[data-theme="dark"] #settings-menu button {
  background: var(--bg-subtle);
  color: var(--text-primary);
  border-color: var(--border);
}
html[data-theme="dark"] .copy-section-btn {
  background: var(--bg-card);
  border-color: var(--border);
  color: var(--text-secondary);
}
html[data-theme="dark"] .app-header {
  background: var(--bg-card);
  border-bottom-color: var(--border);
}
</style>
<script>
(function() {
  var THEME_KEY = 'medical-portal-theme';
  function apply(t) { document.documentElement.setAttribute('data-theme', t); }
  apply(localStorage.getItem(THEME_KEY) || 'light');
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'theme-change') {
      apply(e.data.theme);
      try { localStorage.setItem(THEME_KEY, e.data.theme); } catch(err) {}
    }
  });
  if (window.parent !== window) {
    try { window.parent.postMessage({ type: 'theme-request' }, '*'); } catch(err) {}
  }
})();
</script>
"""


@app.route('/s/admissions/', defaults={'path': ''})
@app.route('/s/admissions/<path:path>')
def serve_admissions(path):
    """Serve Admissions SPA directly — no proxy needed for static files."""
    if not path:
        path = 'index.html'
    file_path = ADMISSIONS_DIR / path
    if not file_path.exists() or not file_path.is_file():
        return Response("Not found", status=404)
    if not file_path.resolve().is_relative_to(ADMISSIONS_DIR.resolve()):
        return Response("Forbidden", status=403)

    # For the main HTML, inject theme support and serve with proper headers
    if path == 'index.html':
        content = file_path.read_text(encoding='utf-8')
        # Align the Admissions bundle with the portal's shared localStorage key.
        content = content.replace('"openrouterApiKey"', '"medical-portal-api-key"')
        # Inject dark-mode CSS + theme listener before </head>
        content = content.replace('</head>', ADMISSIONS_THEME_INJECTION + ADMISSIONS_HANDOFF_INJECTION + '</head>', 1)
        return Response(
            content,
            status=200,
            content_type='text/html; charset=utf-8',
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        )

    return send_file(str(file_path))


# ---------------------------------------------------------------------------
# Portal routes
# ---------------------------------------------------------------------------

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static assets from portal/static/. conditional=True enables audio seeking."""
    static_dir = PORTAL_DIR / 'static'
    file_path = static_dir / filename
    if not file_path.exists() or not file_path.is_file():
        return 'Not found', 404
    if not file_path.resolve().is_relative_to(static_dir.resolve()):
        return 'Forbidden', 403
    return send_file(str(file_path), conditional=True)


@app.route('/api/music')
def list_music():
    """Return sorted list of audio filenames in static/music/."""
    files = sorted(
        f.name for f in MUSIC_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in MUSIC_EXTENSIONS
    )
    return jsonify(files)

@app.route('/')
def index():
    config = DEFAULT_PORTAL_CONFIG.copy()
    config_path = PORTAL_DIR / 'site_config.json'
    if config_path.exists():
        try:
            config.update(json.loads(config_path.read_text(encoding='utf-8')))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"  [portal] Failed to load site_config.json: {exc}")
    asset_versions = {}
    for key, rel_path in {
        "portal_shell_js": "static/js/portal-shell.js",
        "portal_phi_js": "static/js/portal-phi.js",
        "portal_calculators_js": "static/js/portal-calculators.js",
        "portal_patient_context_js": "static/js/portal-patient-context.js",
        "portal_music_js": "static/js/portal-music.js",
        "portal_nav_js": "static/js/portal-nav.js",
    }.items():
        path = PORTAL_DIR / rel_path
        asset_versions[key] = int(path.stat().st_mtime) if path.exists() else 0
    return render_template('index.html', portal_config=config, asset_versions=asset_versions)


@app.route('/lab-mappings.json')
def lab_mappings():
    """Serve the lab mappings config file (customizable per institution)."""
    config_path = PORTAL_DIR / 'lab-mappings.json'
    if config_path.exists():
        return send_file(str(config_path), mimetype='application/json')
    return Response('', status=404)


@app.route('/api/status')
def api_status():
    """Return running status of each managed service."""
    status = {}
    for name, port in SERVICES.items():
        info = child_processes.get(name, {"process": None, "port": port, "status": "stopped"})
        proc = info.get("process")

        if info["status"] == "external":
            alive = is_port_in_use(port)
        elif proc:
            alive = proc.poll() is None and is_port_in_use(port)
        else:
            alive = False

        status[name] = {
            "port": port,
            "alive": alive,
        }

    status["admissions"] = {"alive": ADMISSIONS_DIR.exists()}
    status["phi_remover"] = {"alive": True}
    return jsonify(status)


@app.route('/api/phi/upload', methods=['POST'])
def phi_upload():
    """Accept a PDF, run PHI Remover, return results."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are accepted"}), 400

    keep_dates = request.form.get('keep_dates', 'false').lower() == 'true'

    job_id = uuid.uuid4().hex[:8]
    safe_name = Path(file.filename).stem
    input_filename = f"{job_id}_{safe_name}.pdf"
    input_path = UPLOAD_DIR / input_filename
    file.save(str(input_path))

    try:
        raw_text = extract_text_from_pdf(str(input_path))
        if not raw_text:
            return jsonify({"error": "Failed to extract text from PDF. The file may be image-only or corrupted."}), 422

        cleaned_text = clean_text(raw_text)
        replacement_map = {}
        deidentified_text, phi_counts = redact_phi(cleaned_text, keep_dates, replacement_map)
        header = generate_summary_header(str(input_path), phi_counts, keep_dates)

        output_filename = f"{job_id}_{safe_name}_deidentified.txt"
        output_path = UPLOAD_DIR / output_filename
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(header)
            f.write(deidentified_text)

        total_redactions = sum(phi_counts.values())
        return jsonify({
            "success": True,
            "job_id": job_id,
            "original_file": file.filename,
            "output_file": output_filename,
            "download_url": f"/api/phi/download/{output_filename}",
            "total_redactions": total_redactions,
            "phi_counts": phi_counts,
            "keep_dates": keep_dates,
        })

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500
    finally:
        try:
            input_path.unlink(missing_ok=True)
        except Exception:
            pass


@app.route('/api/phi/download/<filename>')
def phi_download(filename):
    """Download a de-identified output file."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        return jsonify({"error": "File not found"}), 404
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        return jsonify({"error": "Invalid path"}), 403

    return send_file(
        str(file_path),
        mimetype='text/plain',
        as_attachment=True,
        download_name=filename,
    )


@app.route('/api/phi/files', methods=['GET'])
def phi_list_files():
    """List all de-identified output files in the uploads directory."""
    files = []
    for f in sorted(UPLOAD_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if f.is_file() and f.suffix == '.txt':
            stat = f.stat()
            files.append({
                "filename": f.name,
                "size": stat.st_size,
                "created": datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "download_url": f"/api/phi/download/{f.name}",
            })
    return jsonify(files)


@app.route('/api/phi/files/<filename>', methods=['DELETE'])
def phi_delete_file(filename):
    """Delete a single de-identified output file."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        return jsonify({"error": "File not found"}), 404
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        return jsonify({"error": "Invalid path"}), 403
    file_path.unlink()
    return jsonify({"status": "deleted", "filename": filename})


@app.route('/api/phi/files', methods=['DELETE'])
def phi_clear_all():
    """Delete all files in the uploads directory."""
    count = 0
    for f in UPLOAD_DIR.iterdir():
        if f.is_file():
            f.unlink()
            count += 1
    return jsonify({"status": "cleared", "deleted": count})


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
def launch_services():
    """Start managed sub-services on internal ports."""
    print("\n  Starting managed services...")
    print("  " + "-" * 40)

    # 1. Handoff Tool
    if HANDOFF_DIR.exists() and (HANDOFF_DIR / "app.py").exists():
        port = SERVICES["handoff"]
        start_service(
            name="handoff",
            cmd=[
                sys.executable, "-c",
                f"import app; app.app.run(host='127.0.0.1', port={port}, debug=False)"
            ],
            cwd=HANDOFF_DIR,
            port=port,
        )
    else:
        print("  [handoff] Directory not found — skipping")

    # 2. Admissions — served directly by Flask (no subprocess needed)
    if ADMISSIONS_DIR.exists():
        print(f"  [admissions] Serving static files from {ADMISSIONS_DIR}")
    else:
        print("  [admissions] dist/ not found — run 'npm run build' in Admissions/")

    time.sleep(1)
    print("  " + "-" * 40)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORTAL_PORT", 3000))

    print("=" * 50)
    print("  Medical Portal")
    print("=" * 50)

    launch_services()

    print(f"\n  Portal running at http://localhost:{port}")
    print(f"  Handoff:    /s/handoff/    (proxied from :{SERVICES['handoff']})")
    print(f"  Admissions: /s/admissions/ (static, served by portal)")
    print("  Press Ctrl+C to stop all services.\n")

    app.run(host='0.0.0.0', port=port, debug=False)
