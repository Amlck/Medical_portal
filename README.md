# Mediport Public Demo

This repository contains the static GitHub Pages artifact for Mediport.

The demo is intentionally safe for public hosting:

- synthetic demo patients only
- no Flask backend
- no SQLite or patient database
- no real AI calls
- canned note-generation responses
- no PHI upload processing
- demo edits live only in browser memory and reset on refresh

Open the Pages entrypoint at `docs/index.html`, then launch the app under `docs/demo/`.

## Build Source

The public artifact is generated from the private sibling repo:

```bash
cd ../Medical
python3 scripts/build_public_demo.py
```

Only scrubbed static files are written here. Do not copy backend code, real patient records, `.env` files, local uploads, SQLite files, or private scratch material into this repository.
