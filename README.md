# Medical Portal

A unified web portal for clinical bedside tools — calculators, handoff notes, PHI removal, and more — running locally on your machine with zero cloud dependencies for patient data.

## Features

**Clinical Calculator** — 19 scoring tools across 7 categories:

| Category | Calculators |
|----------|-------------|
| General | BMI, GCS, MAP |
| Renal | CrCl (Cockcroft-Gault), eGFR (CKD-EPI 2021), FENa, Serum Osmolality |
| Cardiac | CHA₂DS₂-VASc, HAS-BLED, QTc (Bazett & Fridericia), Wells DVT |
| Pulmonary | A-a Gradient, CURB-65 |
| Hepatic | Child-Pugh, MELD-Na |
| Metabolic | Anion Gap (albumin-corrected + delta/delta), Corrected Calcium |
| ICU | NEWS2, SOFA |

**Handoff Tool** — Patient-centered document store with AI-generated clinical notes (SBAR, progress notes, discharge summaries). Supports batch generation and printable chart export.

**PHI Remover** — Upload a medical PDF, get a de-identified text file. Covers names, IDs, phone numbers, addresses, and other protected health information using HIPAA Safe Harbor patterns.

**Lab Paste Parser** — Paste lab results from your hospital's web system and auto-fill calculator fields. Parses both HTML table clipboard data and plain text. Lab name mappings are fully configurable.

**Admissions** — Pre-built patient admission form SPA.

## Quick Start

**Prerequisites:** Python 3.8+

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/medical-portal.git
cd medical-portal

# Install dependencies
pip install flask requests PyMuPDF python-dotenv

# Run
python portal/app.py
```

Then open [http://localhost:3000](http://localhost:3000).

**macOS shortcut:** Double-click `Portal.command` to launch everything and auto-open the browser.

## AI Features (Optional)

The handoff tool's note generation (SBAR, progress notes, discharge summaries) requires an API key from [OpenRouter](https://openrouter.ai/keys). Everything else works without one.

**Option A: Browser settings (recommended)**
Click the ⚙ Settings gear in the portal sidebar, paste your OpenRouter API key, and click Save. The key is stored in your browser's localStorage only.

**Option B: Environment file**
Create `Dr_claude/handoff-tool/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

If both are set, the browser key takes priority.

## Customizing Lab Mappings

The lab paste parser maps test names from your hospital's lab reports to calculator fields. To customize:

1. Copy `portal/lab-mappings.example.json` to `portal/lab-mappings.json`
2. Edit the mappings to match your institution's lab test names (supports any language)
3. Restart the portal

If no `lab-mappings.json` is found, a default set of common English lab names is used.

## Architecture

```
portal/app.py              ← Main Flask server (port 3000)
  ├── /                    ← Portal dashboard
  ├── /s/handoff/*         ← Reverse proxy → Handoff Tool (port 5050)
  ├── /s/admissions/*      ← Static file serve from Admissions/dist/
  ├── /api/phi/*           ← PHI Remover endpoints
  └── /lab-mappings.json   ← Custom lab config (if present)

Dr_claude/handoff-tool/    ← Handoff Tool backend + frontend
phi_remover.py             ← PHI de-identification module
Admissions/dist/           ← Admissions SPA (pre-built static)
```

All sub-services are reverse-proxied through the portal on a single origin (localhost:3000) so iframes work without cross-origin issues.

## Privacy

Patient data never leaves your machine. The only external network call is to the OpenRouter API for AI note generation, and even then:

- PHI is automatically scrubbed before any text is sent to the LLM
- The AI features are entirely optional
- All patient records are stored as local JSON files in `Dr_claude/handoff-tool/patients/`

## License

MIT — see [LICENSE](LICENSE).
