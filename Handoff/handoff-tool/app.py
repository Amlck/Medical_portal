"""
Clinical Handoff Note Generator — V2
Patient-centered document store with multi-output generation (SBAR, Progress, Discharge).
Uses OpenRouter API with Claude Sonnet.
"""

import os
import re
import sys
import glob
import datetime
from pathlib import Path
import requests as http_requests
from flask import Flask, render_template, request, jsonify
from prompts import PROMPTS

# Import PHI Remover for scrubbing patient data before LLM calls
MEDICAL_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, MEDICAL_DIR)
try:
    from phi_remover import redact_phi as _redact_phi
    PHI_SCRUB_AVAILABLE = True
except ImportError:
    PHI_SCRUB_AVAILABLE = False
    print("  [WARNING] phi_remover not found — PHI scrubbing disabled")

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True  # Always pick up template changes

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "anthropic/claude-sonnet-4.5"
MAX_TOKENS = 4096

PATIENTS_DIR = os.path.join(os.path.dirname(__file__), "patients")
TEMPLATE_PATH = os.path.join(PATIENTS_DIR, "_TEMPLATE.md")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def get_patient_files():
    """Return list of patient files (excluding template), sorted by modified time (newest first)."""
    files = glob.glob(os.path.join(PATIENTS_DIR, "*.md"))
    files = [f for f in files if not os.path.basename(f).startswith("_")]
    files.sort(key=os.path.getmtime, reverse=True)
    return files


def patient_id_from_filename(filepath):
    """Extract patient ID from filename (e.g., 'wang_oo_20260220.md' -> 'wang_oo_20260220')."""
    return os.path.splitext(os.path.basename(filepath))[0]


def parse_patient_header(content):
    """Extract patient name and basic info from the markdown header."""
    name_match = re.search(r"^# Patient:\s*(.+)$", content, re.MULTILINE)
    name = name_match.group(1).strip() if name_match else "Unknown"

    admit_match = re.search(r"\*\*Admitted:\*\*\s*(.+)$", content, re.MULTILINE)
    admitted = admit_match.group(1).strip() if admit_match else ""
    admitted = re.sub(r"\s*YYYY-MM-DD\s*$", "", admitted).strip()

    dx_match = re.search(r"\*\*Admitting Dx:\*\*\s*(.+)$", content, re.MULTILINE)
    dx = dx_match.group(1).strip() if dx_match else ""

    return {"name": name, "admitted": admitted, "dx": dx}


def get_patient_filepath(pid):
    return os.path.join(PATIENTS_DIR, f"{pid}.md")


def load_patient_record(pid):
    filepath = get_patient_filepath(pid)
    if not os.path.exists(filepath):
        return None, None, None
    content = Path(filepath).read_text(encoding="utf-8")
    return filepath, content, parse_patient_header(content)


def format_http_error(error):
    try:
        error_body = error.response.json() if error.response else {}
    except Exception:
        error_body = {}
    return error_body.get("error", {}).get("message", str(error))


def scrub_phi_for_llm(text):
    """Remove PHI from patient record text before sending to external LLM.

    Keeps dates (important for clinical context) but removes names, IDs,
    phone numbers, addresses, and other identifying information.
    Returns the scrubbed text and a count dict of what was removed.
    """
    if not PHI_SCRUB_AVAILABLE:
        raise RuntimeError("PHI scrubbing is unavailable; refusing outbound LLM request.")
    try:
        scrubbed, counts = _redact_phi(text, keep_dates=True)
        return scrubbed, counts
    except Exception as e:
        raise RuntimeError(f"PHI scrubbing failed; refusing outbound LLM request: {e}") from e


def get_api_key():
    """Get API key from the current request only."""
    return request.headers.get("X-API-Key", "").strip()


def call_llm(system_prompt, user_message, api_key=None):
    """Call OpenRouter API and return the response text."""
    key = api_key or get_api_key()
    if not key:
        raise ValueError("No API key configured. Enter your OpenRouter key in Settings.")

    response = http_requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Clinical Handoff Tool",
        },
        json={
            "model": MODEL,
            "max_tokens": MAX_TOKENS,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        },
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# Routes — AI Status
# ---------------------------------------------------------------------------
@app.route("/api/ai-status", methods=["GET"])
def ai_status():
    """Report whether a per-request browser API key is available."""
    has_header_key = bool(request.headers.get("X-API-Key", "").strip())
    return jsonify({
        "ai_available": has_header_key,
        "source": "header" if has_header_key else "none",
    })


# ---------------------------------------------------------------------------
# Routes — Pages
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# Routes — Patient API
# ---------------------------------------------------------------------------
@app.route("/api/patients", methods=["GET"])
def list_patients():
    """List all patients with basic info."""
    patients = []
    for fpath in get_patient_files():
        pid = patient_id_from_filename(fpath)
        content = Path(fpath).read_text(encoding="utf-8")
        info = parse_patient_header(content)
        patients.append({
            "id": pid,
            "name": info["name"],
            "admitted": info["admitted"],
            "dx": info["dx"],
            "modified": datetime.datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat(),
        })
    return jsonify(patients)


@app.route("/api/patients", methods=["POST"])
def create_patient():
    """Create a new patient file from header info."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Patient name is required."}), 400

    # Build filename: sanitized name + admit date
    admit_date = (data.get("admitted", "") or datetime.date.today().isoformat()).strip()
    safe_name = re.sub(r"[^\w\u4e00-\u9fff]", "_", name).strip("_").lower()
    filename = f"{safe_name}_{admit_date.replace('-', '')}.md"
    filepath = os.path.join(PATIENTS_DIR, filename)

    if os.path.exists(filepath):
        return jsonify({"error": "Patient file already exists."}), 409

    # Read template and fill in header
    template = Path(TEMPLATE_PATH).read_text(encoding="utf-8")
    content = template.replace("[Name]", name)

    header_values = {
        "Age/Sex": data.get("age_sex", "").strip(),
        "MRN": data.get("mrn", "").strip(),
        "Admitted": admit_date,
        "Admitting Dx": data.get("dx", "").strip(),
        "PMH": data.get("pmh", "").strip(),
        "Allergies": data.get("allergies", "").strip(),
        "Code Status": data.get("code_status", "").strip(),
        "Primary Team": data.get("team", "").strip(),
    }
    for field, val in header_values.items():
        if not val:
            continue
        content = re.sub(
            rf"(^- \*\*{re.escape(field)}:\*\*).*$",
            rf"\1 {val}",
            content,
            flags=re.MULTILINE,
        )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return jsonify({"id": patient_id_from_filename(filepath), "filename": filename}), 201


@app.route("/api/patients/<pid>", methods=["GET"])
def get_patient(pid):
    """Get full patient record."""
    _, content, info = load_patient_record(pid)
    if content is None:
        return jsonify({"error": "Patient not found."}), 404
    return jsonify({"id": pid, "content": content, **info})


@app.route("/api/patients/<pid>", methods=["PUT"])
def update_patient(pid):
    """Overwrite a patient's full record with new content."""
    filepath = get_patient_filepath(pid)
    if not os.path.exists(filepath):
        return jsonify({"error": "Patient not found."}), 404

    data = request.get_json(silent=True) or {}
    content = data.get("content", None)
    if content is None:
        return jsonify({"error": "Missing 'content' field."}), 400

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return jsonify({"status": "saved", "id": pid})


@app.route("/api/patients/<pid>/append", methods=["POST"])
def append_to_patient(pid):
    """Append new clinical data to a patient's record."""
    filepath = get_patient_filepath(pid)
    if not os.path.exists(filepath):
        return jsonify({"error": "Patient not found."}), 404

    data = request.get_json(silent=True) or {}
    new_data = data.get("content", "").strip()
    category = data.get("category", "Clinical Note")
    if not new_data:
        return jsonify({"error": "No content to append."}), 400

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    entry = f"\n\n## {now} — {category}\n\n{new_data}\n"

    with open(filepath, "a", encoding="utf-8") as f:
        f.write(entry)

    return jsonify({"status": "ok", "timestamp": now})


@app.route("/api/patients/<pid>/discharge", methods=["POST"])
def discharge_patient(pid):
    """Mark a patient as discharged by renaming the file with a _dc suffix."""
    filepath = get_patient_filepath(pid)
    if not os.path.exists(filepath):
        return jsonify({"error": "Patient not found."}), 404

    new_path = os.path.join(PATIENTS_DIR, f"{pid}_dc.md")
    os.rename(filepath, new_path)
    return jsonify({"status": "discharged", "id": f"{pid}_dc"})


@app.route("/api/patients/<pid>", methods=["DELETE"])
def delete_patient(pid):
    """Permanently delete a patient file."""
    filepath = get_patient_filepath(pid)
    if not os.path.exists(filepath):
        return jsonify({"error": "Patient not found."}), 404

    os.remove(filepath)
    return jsonify({"status": "deleted", "id": pid})


# ---------------------------------------------------------------------------
# Routes — Note Generation
# ---------------------------------------------------------------------------
@app.route("/api/generate", methods=["POST"])
def generate():
    """Generate a clinical note from a patient's record."""
    data = request.get_json(silent=True) or {}
    pid = data.get("patient_id", "").strip()
    note_type = data.get("type", "sbar")

    if note_type not in PROMPTS:
        return jsonify({"error": f"Unknown note type: {note_type}. Use: sbar, progress, discharge, discharge_ntuh"}), 400

    _, patient_record, _ = load_patient_record(pid)
    if patient_record is None:
        return jsonify({"error": "Patient not found."}), 404
    today = datetime.date.today().isoformat()

    try:
        # Scrub PHI before sending to external LLM
        scrubbed_record, phi_counts = scrub_phi_for_llm(patient_record)
        prompt_pair = PROMPTS[note_type]
        system_prompt = prompt_pair["system"].replace("{today}", today)
        user_message = prompt_pair["user"].format(patient_record=scrubbed_record)
        result_text = call_llm(system_prompt, user_message)
        return jsonify({"note": result_text, "type": note_type, "phi_scrubbed": sum(phi_counts.values())})
    except http_requests.exceptions.HTTPError as e:
        return jsonify({"error": f"OpenRouter API error: {format_http_error(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Routes — Batch SBAR (all active patients)
# ---------------------------------------------------------------------------
@app.route("/api/generate/batch-sbar", methods=["POST"])
def batch_sbar():
    """Generate SBAR handoff notes for ALL active (non-discharged) patients."""
    today = datetime.date.today().isoformat()
    results = []

    for fpath in get_patient_files():
        pid = patient_id_from_filename(fpath)
        if pid.endswith("_dc"):
            continue  # skip discharged

        patient_record = Path(fpath).read_text(encoding="utf-8")
        info = parse_patient_header(patient_record)

        try:
            # Scrub PHI before sending to external LLM
            scrubbed_record, _ = scrub_phi_for_llm(patient_record)
            prompt_pair = PROMPTS["sbar"]
            system_prompt = prompt_pair["system"].replace("{today}", today)
            user_message = prompt_pair["user"].format(patient_record=scrubbed_record)
            note = call_llm(system_prompt, user_message)
            results.append({"id": pid, "name": info["name"], "note": note, "error": None})
        except Exception as e:
            results.append({"id": pid, "name": info["name"], "note": None, "error": str(e)})

    return jsonify(results)


@app.route("/api/export/chart", methods=["POST"])
def export_chart():
    """Generate a combined chart of all active patients' SBAR notes.

    Returns HTML suitable for printing — one section per patient,
    laid out in a table format with headers and page breaks.
    """
    data = request.get_json(silent=True) or {}
    note_type = data.get("type", "sbar")
    today = datetime.date.today().isoformat()
    patients = []

    for fpath in get_patient_files():
        pid = patient_id_from_filename(fpath)
        if pid.endswith("_dc"):
            continue  # skip discharged

        patient_record = Path(fpath).read_text(encoding="utf-8")
        info = parse_patient_header(patient_record)

        if note_type in PROMPTS:
            try:
                # Scrub PHI before sending to external LLM
                scrubbed_record, _ = scrub_phi_for_llm(patient_record)
                prompt_pair = PROMPTS[note_type]
                system_prompt = prompt_pair["system"].replace("{today}", today)
                user_message = prompt_pair["user"].format(patient_record=scrubbed_record)
                note = call_llm(system_prompt, user_message)
            except Exception as e:
                note = f"Error generating note: {str(e)}"
        else:
            note = patient_record

        patients.append({
            "id": pid,
            "name": info["name"],
            "admitted": info["admitted"],
            "dx": info["dx"],
            "note": note,
        })

    return jsonify({"patients": patients, "generated": today, "type": note_type})


if __name__ == "__main__":
    os.makedirs(PATIENTS_DIR, exist_ok=True)
    port = int(os.environ.get("PORT", 5000))
    print(f"\n  Clinical Handoff Tool v2 running at http://localhost:{port}")
    print(f"  Model: {MODEL} via OpenRouter")
    print(f"  Patient files: {PATIENTS_DIR}\n")
    app.run(debug=True, port=port)
