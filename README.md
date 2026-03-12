# Medical Portal

A unified web portal for clinical bedside tools — handoff notes, admissions workflows, calculators, census tracking, and PHI removal — running locally on your machine with zero cloud dependencies for patient data.

## Quick Start

**Prerequisites:** Python 3.8+

```bash
git clone https://github.com/YOUR_USERNAME/medical-portal.git
cd medical-portal/portal
pip install -r requirements.txt
python app.py
```

Then open [http://localhost:3000](http://localhost:3000).

**macOS shortcut:** Double-click `Portal.command` to install dependencies, launch the portal, and open the browser automatically.

**Windows shortcut:** Double-click `Portal.bat` to install dependencies, launch the portal, and open the browser automatically.

---

## Features

### Clinical Calculator (Alt+4)

19 scoring tools across 7 categories, plus a Renal Drug Dosing module.

| Category | Calculators |
|----------|-------------|
| General | BMI, GCS, MAP |
| Renal | CrCl (Cockcroft-Gault), eGFR (CKD-EPI 2021), FENa, Serum Osmolality |
| Cardiac | CHA₂DS₂-VASc, HAS-BLED, QTc (Bazett & Fridericia), Wells DVT |
| Pulmonary | A-a Gradient, CURB-65 |
| Hepatic | Child-Pugh, MELD-Na |
| Metabolic | Anion Gap (albumin-corrected + delta/delta), Corrected Calcium |
| ICU | NEWS2, SOFA |

Each calculator has copy-to-clipboard output formatted for pasting into clinical notes. A patient selector auto-fills demographics and labs from Handoff records, and the `Full Context` action opens the shared patient context workspace for trend review.

### Handoff Tool (Alt+1)

Patient-centred document store with optional AI note generation (requires an OpenRouter API key). Stores records locally and generates structured clinical notes: SBAR handoff, daily progress notes, problem-oriented discharge summaries, and NTUH-style chronological discharge course output.

Recent workflow improvements:
- `Chart View` gives a scan-friendly latest-by-category summary plus a chronological timeline.
- `Full Record` supports inline editing with save/cancel controls.
- Handoff now syncs patient selection with the portal so Census, Calculator, PHI Remover, and Patient Context stay aligned.

### PHI Remover (Alt+3)

Upload a medical PDF and download a de-identified plain text file. Covers names, ID numbers, phone numbers, email addresses, dates of birth, and addresses using HIPAA Safe Harbor patterns.

Recent workflow improvements:
- Copy de-identified text directly to the clipboard.
- Send de-identified text straight into the active Handoff patient as queued `Add Data` content.
- PHI scrubbing is applied before any text is sent to an AI model, and if scrubbing fails the AI call is blocked.

### Admissions (Alt+2)

Pre-built admission note builder SPA.

### Census Board (Alt+5)

Quick inpatient list sourced from Handoff records, with refresh controls for bedside use. Each row can open the full patient context workspace or jump directly into calculator-driven review.

### Patient Context (Alt+9)

A shared patient context workspace plus a compact sidebar drawer for the active patient.

It provides:
- lab trend interpretation and timeline visualisation
- recent high-yield events pulled from the Handoff record
- tighter integration with Census, Calculator, and Handoff patient selection
- quick navigation between the compact drawer and full-page context view

### Keyboard Shortcuts

The portal includes built-in shortcut help via `Alt+0` or `?`.

Current defaults:
- `Alt+1` Handoff
- `Alt+2` Admissions
- `Alt+3` PHI Remover
- `Alt+4` Calculator
- `Alt+5` Census
- `Alt+9` Patient Context
- `Ctrl/Cmd+[` Toggle sidebar

### Lab Paste Parser

Paste lab results from your hospital's web system into the Calculator view to auto-fill fields. Supports HTML table clipboard data and plain text. Fully configurable — see [Customizing Lab Mappings](#customizing-lab-mappings) below.

---

## AI Features (Optional)

The handoff tool's note generation (SBAR, progress notes, discharge summaries) requires an [OpenRouter](https://openrouter.ai/keys) API key. Every other feature works without one.

**Browser settings**
Click the ⚙ Settings gear in the portal sidebar, paste your key, and save. Stored in your browser's localStorage only.

The public build does not use a server-side `.env` fallback for AI access.

---

## Customizing Lab Mappings

The lab paste parser maps test names from your hospital's reports to calculator fields. To adapt it to your institution:

1. Copy `portal/lab-mappings.example.json` to `portal/lab-mappings.json`
2. Edit the mappings to match your lab system's test names (any language supported)
3. Restart the portal

If no `lab-mappings.json` is present, a default set of common English lab names is used.

---

## Customizing Portal Text

Branding, footer text, and feature label copy are set in `portal/site_config.json` — no template editing needed:

```json
{
  "portal_title": "Medical Portal — Clinical Tools",
  "brand_name": "MEDICAL PORTAL",
  "brand_tagline": "Clinical Tools",
  "footer_note": "Local-first edition"
}
```

---

## Architecture

```
portal/app.py                  # Flask server (port 3000)
  ├── /                        # Portal dashboard
  ├── /s/handoff/*             # Reverse proxy → Handoff Tool (port 5050)
  ├── /s/admissions/*          # Static serve from Admissions/dist/
  └── /api/phi/*               # PHI Remover endpoints

portal/templates/
  ├── index.html               # Portal shell — CSS + JS
  └── partials/portal/
      ├── sidebar.html
      ├── main.html
      ├── settings_modal.html
      └── views/               # One file per view (handoff, admissions, calculator, census, phi, patient context, …)

Handoff/handoff-tool/          # Handoff backend (port 5050) + frontend
phi_remover.py                 # PHI de-identification module
Admissions/dist/               # Admissions SPA (pre-built static)
```

All sub-services are proxied through the portal at a single origin so iframes work without cross-origin issues.

---

## Privacy

Patient data never leaves your machine except for optional OpenRouter AI note generation, and only after PHI is scrubbed. All patient records are stored as local files in `Handoff/handoff-tool/patients/` (gitignored).

---

## License

MIT — see [LICENSE](LICENSE).
