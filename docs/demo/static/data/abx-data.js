const ABX_DATA = [
  {
    "id": "cap",
    "site": "Community-Acquired Pneumonia (CAP)",
    "icon": "🫁",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "pneumonia lung respiratory cough fever streptococcus atypical mycoplasma",
    "regimens": [
      {
        "sev": "mild",
        "label": "Mild — Outpatient",
        "first": "Amoxicillin 500 mg PO TID × 5–7d",
        "alt": "Doxycycline 100 mg PO BID × 5–7d",
        "notes": [
          {
            "cls": "warn",
            "txt": "Azithromycin: macrolide resistance ~30–40% in regional — use only if Mycoplasma strongly suspected and susceptibility likely."
          },
          {
            "cls": "",
            "txt": "Add doxycycline if atypical organisms suspected (younger patient, dry cough, extrapulmonary features)."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Azithromycin: macrolide resistance ~30–40% in regional — use only if Mycoplasma strongly suspected and susceptibility likely."
          },
          {
            "cls": "",
            "txt": "Add doxycycline if atypical organisms suspected (younger patient, dry cough, extrapulmonary features)."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Moderate — Inpatient (ward)",
        "first": "Ceftriaxone 1–2 g IV q24h ± doxycycline 100 mg BID (if atypical suspected)",
        "alt": "Ampicillin-sulbactam 3 g IV q6h  |  Levofloxacin 750 mg IV/PO q24h (respiratory FQ, monotherapy)",
        "notes": [
          {
            "cls": "",
            "txt": "PSI/PORT score guides admission decision. Add atypical coverage if age <65, no significant comorbidities, or clinical features suggest Mycoplasma/Legionella."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "PSI/PORT score guides admission decision. Add atypical coverage if age <65, no significant comorbidities, or clinical features suggest Mycoplasma/Legionella."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Severe — ICU / Aspiration Risk",
        "first": "Pip-tazo 4.5 g IV q8h (extended infusion) + Azithromycin 500 mg IV q24h",
        "alt": "Ceftriaxone 2 g IV q24h + Levofloxacin 750 mg IV q24h  |  Add vancomycin 25–30 mg/kg/day if MRSA-CAP risk",
        "notes": [
          {
            "cls": "",
            "txt": "Suspect Pseudomonas if structural lung disease, prolonged steroids, or prior Pseudomonas isolation → pip-tazo or cefepime."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Suspect Pseudomonas if structural lung disease, prolonged steroids, or prior Pseudomonas isolation → pip-tazo or cefepime."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "hap",
    "site": "Hospital-Acquired / Ventilator-Associated Pneumonia (HAP/VAP)",
    "icon": "🏥",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "hospital pneumonia VAP HAP ventilator pseudomonas acinetobacter MDR",
    "regimens": [
      {
        "sev": "moderate",
        "label": "HAP — No MDR Risk Factors",
        "first": "Pip-tazo 4.5 g IV q8h (extended infusion 4h)\nOR Ceftriaxone 2 g IV q24h",
        "alt": "Levofloxacin 750 mg IV q24h",
        "notes": [
          {
            "cls": "",
            "txt": "MDR risk: prior IV antibiotics ≤90d, septic shock, ARDS, ≥5 days hospitalisation, CRRT. If none present, narrow-spectrum acceptable."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "MDR risk: prior IV antibiotics ≤90d, septic shock, ARDS, ≥5 days hospitalisation, CRRT. If none present, narrow-spectrum acceptable."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "HAP/VAP — MDR Risk Factors Present",
        "first": "Meropenem 1–2 g IV q8h (2 g if Pseudomonas suspected, extended infusion 3h)",
        "alt": "Cefepime 2 g IV q8h  |  Imipenem 500 mg IV q6h",
        "notes": [
          {
            "cls": "warn",
            "txt": "Add vancomycin or linezolid 600 mg IV/PO BID if MRSA-VAP risk. De-escalate at 48–72h based on cultures."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Add vancomycin or linezolid 600 mg IV/PO BID if MRSA-VAP risk. De-escalate at 48–72h based on cultures."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "uti",
    "site": "Urinary Tract Infection (UTI)",
    "icon": "🔬",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "UTI urinary bladder kidney pyelonephritis dysuria ESBL E coli catheter urosepsis",
    "regimens": [
      {
        "sev": "mild",
        "label": "Uncomplicated Lower UTI — Women",
        "first": "Nitrofurantoin 100 mg MR PO BID × 5d (if CrCl ≥45)\nOR TMP-SMX DS PO BID × 3d (if local resistance <20%)",
        "alt": "Fosfomycin 3 g PO single dose  |  Pivmecillinam 400 mg TID × 5d",
        "notes": [
          {
            "cls": "warn",
            "txt": "Avoid fluoroquinolones for uncomplicated UTI — preserve for systemic use. regional E. coli FQ resistance ~20–30%."
          },
          {
            "cls": "",
            "txt": "Nitrofurantoin contraindicated if CrCl <30 or upper UTI."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Avoid fluoroquinolones for uncomplicated UTI — preserve for systemic use. regional E. coli FQ resistance ~20–30%."
          },
          {
            "cls": "",
            "txt": "Nitrofurantoin contraindicated if CrCl <30 or upper UTI."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Complicated UTI / Pyelonephritis",
        "first": "Ceftriaxone 1–2 g IV q24h → oral step-down per culture\nOR Cefazolin 2 g IV q8h (if ESBL unlikely)",
        "alt": "Ertapenem 1 g IV q24h (if ESBL E. coli likely)",
        "notes": [
          {
            "cls": "",
            "txt": "Total course: 7–14 days. Remove/replace urinary catheter. Blood cultures if febrile or systemically unwell."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Total course: 7–14 days. Remove/replace urinary catheter. Blood cultures if febrile or systemically unwell."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Urosepsis",
        "first": "Meropenem 1 g IV q8h\nOR Ertapenem 1 g IV q24h (if no Pseudomonas risk)",
        "alt": "Add vancomycin if enterococcal bacteremia suspected (prosthetic valve, immunocompromised)",
        "notes": [
          {
            "cls": "",
            "txt": "Source control critical — replace catheter. Send urine C&S and 2 sets blood cultures before antibiotics. Duration: 7 days with good response; 14 days for bacteremia."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Source control critical — replace catheter. Send urine C&S and 2 sets blood cultures before antibiotics. Duration: 7 days with good response; 14 days for bacteremia."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "bacteremia",
    "site": "Bloodstream Infection / Bacteremia",
    "icon": "🩸",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "bacteremia sepsis blood culture MRSA staph strep candida fungemia gram positive negative",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Gram-Positive — MRSA / Staph suspected",
        "first": "Vancomycin 25–30 mg/kg/day IV (AUC/MIC guided, target AUC 400–600 mg·h/L)",
        "alt": "Daptomycin 6–10 mg/kg IV q24h (not for pulmonary source)  |  Linezolid 600 mg IV/PO BID (bacteriostatic — 2nd line)",
        "notes": [
          {
            "cls": "",
            "txt": "S. aureus bacteremia: obtain echocardiogram. Minimum 14 days uncomplicated; 28–42 days for endocarditis or hardware infection."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "S. aureus bacteremia: obtain echocardiogram. Minimum 14 days uncomplicated; 28–42 days for endocarditis or hardware infection."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Gram-Negative — ESBL / XDR suspected",
        "first": "Meropenem 1 g IV q8h",
        "alt": "Pip-tazo 4.5 g IV q8h extended (if no ESBL)  |  Ceftazidime-avibactam 2.5 g IV q8h (KPC/OXA-48 producers)",
        "notes": [
          {
            "cls": "",
            "txt": "Source control critical. Duration: 7–14 days uncomplicated. Repeat blood cultures at 48–72h to confirm clearance."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Source control critical. Duration: 7–14 days uncomplicated. Repeat blood cultures at 48–72h to confirm clearance."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Candidemia / Fungemia",
        "first": "Micafungin 100 mg IV q24h\nOR Anidulafungin 200 mg IV load → 100 mg q24h",
        "alt": "Fluconazole 800 mg IV load → 400 mg q24h (ONLY if C. albicans likely, stable, no prior azole exposure)",
        "notes": [
          {
            "cls": "",
            "txt": "Remove CVCs where feasible. Fundoscopy and echocardiogram indicated. Minimum 14 days after last positive blood culture."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Remove CVCs where feasible. Fundoscopy and echocardiogram indicated. Minimum 14 days after last positive blood culture."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "iai",
    "site": "Intra-Abdominal Infection",
    "icon": "🫀",
    "tags": [
      "iv"
    ],
    "keywords": "abdominal appendicitis peritonitis cholangitis biliary abscess bowel perforation intraabdominal",
    "regimens": [
      {
        "sev": "mild",
        "label": "Community-Acquired, Mild–Moderate",
        "first": "Ertapenem 1 g IV q24h\nOR Cefoxitin 2 g IV q6h\nOR Amp-sulbactam 3 g IV q6h",
        "alt": "Ciprofloxacin 400 mg IV q12h + Metronidazole 500 mg IV q8h",
        "notes": [
          {
            "cls": "",
            "txt": "Adequate source control (surgery or percutaneous drainage) is mandatory. Duration: 4–7 days after source control."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Adequate source control (surgery or percutaneous drainage) is mandatory. Duration: 4–7 days after source control."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Hospital-Acquired / Severe / Peritonitis",
        "first": "Meropenem 1 g IV q8h\nOR Pip-tazo 4.5 g IV q8h extended infusion",
        "alt": "Add fluconazole 400 mg IV q24h if Candida isolated, peritonitis with risk factors (TPN, post-op, immunocompromised)",
        "notes": [
          {
            "cls": "",
            "txt": "Always involve surgery. Duration determined by adequacy of source control; do not extend beyond 7 days if control achieved."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Always involve surgery. Duration determined by adequacy of source control; do not extend beyond 7 days if control achieved."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "ssti",
    "site": "Skin & Soft Tissue Infection (SSTI)",
    "icon": "🩹",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "skin cellulitis abscess necrotizing fasciitis wound MRSA soft tissue erysipelas",
    "regimens": [
      {
        "sev": "mild",
        "label": "Non-Purulent Cellulitis",
        "first": "Cephalexin 500 mg PO QID × 5–7d\nOR Amox-clavulanate 875/125 mg PO BID × 5–7d",
        "alt": "Clindamycin 300–450 mg PO TID (⚠️ C. diff risk)",
        "notes": [
          {
            "cls": "",
            "txt": "Elevate affected limb. Mark borders. Admit if systemic signs, facial/orbital involvement, or failure to improve at 48–72h on oral therapy."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Elevate affected limb. Mark borders. Admit if systemic signs, facial/orbital involvement, or failure to improve at 48–72h on oral therapy."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Purulent / Abscess / CA-MRSA Risk",
        "first": "I&D (primary treatment for abscess)\nTMP-SMX DS PO BID × 5–7d (adjunct post-I&D or non-fluctuant purulent cellulitis)",
        "alt": "Doxycycline 100 mg PO BID × 5–7d  |  Clindamycin 300–450 mg PO TID",
        "notes": [
          {
            "cls": "",
            "txt": "Incision and drainage is the main treatment for a drainable abscess. Add antibiotics when there is surrounding cellulitis, systemic illness, immunocompromise, or failure to improve after source control."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Incision and drainage is the main treatment for a drainable abscess. Add antibiotics when there is surrounding cellulitis, systemic illness, immunocompromise, or failure to improve after source control."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Necrotising Fasciitis / Severe SSTI",
        "first": "Meropenem 1 g IV q8h + Clindamycin 900 mg IV q8h + Vancomycin 25–30 mg/kg/day",
        "alt": "Pip-tazo 4.5 g IV q8h + Clindamycin + Vancomycin",
        "notes": [
          {
            "cls": "danger",
            "txt": "🚨 SURGICAL EMERGENCY — immediate operative debridement. Do not delay surgery for imaging."
          },
          {
            "cls": "",
            "txt": "Clindamycin added for anti-toxin effect (protein synthesis inhibition). IVIg consider for streptococcal toxic shock. Aggressive fluid resuscitation."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "🚨 SURGICAL EMERGENCY — immediate operative debridement. Do not delay surgery for imaging."
          },
          {
            "cls": "",
            "txt": "Clindamycin added for anti-toxin effect (protein synthesis inhibition). IVIg consider for streptococcal toxic shock. Aggressive fluid resuscitation."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "cns",
    "site": "CNS Infection / Meningitis",
    "icon": "🧠",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "meningitis encephalitis CNS brain CSF lumbar puncture cryptococcus listeria pneumococcal bacterial",
    "regimens": [
      {
        "sev": "severe",
        "label": "Bacterial Meningitis — Community-Acquired",
        "first": "Ceftriaxone 2 g IV q12h\n+ Vancomycin 25–30 mg/kg/day IV\n+ Dexamethasone 0.15 mg/kg IV q6h × 4 days (start before or with 1st antibiotic)",
        "alt": "Add Ampicillin 2 g IV q4h if age >50, immunocompromised, or Listeria suspected",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Do NOT delay antibiotics for LP or CT imaging. Blood cultures first, then immediate empiric treatment."
          },
          {
            "cls": "",
            "txt": "Dexamethasone proven to reduce mortality and morbidity in pneumococcal meningitis. De-escalate once CSF cultures and sensitivities known."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Do NOT delay antibiotics for LP or CT imaging. Blood cultures first, then immediate empiric treatment."
          },
          {
            "cls": "",
            "txt": "Dexamethasone proven to reduce mortality and morbidity in pneumococcal meningitis. De-escalate once CSF cultures and sensitivities known."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Healthcare-Associated / Post-Neurosurgical",
        "first": "Meropenem 2 g IV q8h + Vancomycin 25–30 mg/kg/day IV",
        "alt": "Cefepime 2 g IV q8h + Vancomycin  |  Colistin IT + IV for XDR Acinetobacter",
        "notes": [
          {
            "cls": "",
            "txt": "Neurosurgery consult for external ventricular drain / hardware assessment. Duration typically 21 days."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Neurosurgery consult for external ventricular drain / hardware assessment. Duration typically 21 days."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Cryptococcal Meningitis (HIV / Immunocompromised)",
        "first": "Amphotericin B deox. 0.7–1 mg/kg/day IV + Flucytosine 25 mg/kg PO QID × 2 weeks (induction)\n→ Fluconazole 400 mg q24h × 8 weeks (consolidation)\n→ Fluconazole 200 mg q24h (maintenance)",
        "alt": "Liposomal AmB 3–4 mg/kg/day IV if renal insufficiency",
        "notes": [
          {
            "cls": "warn",
            "txt": "Check opening pressure on LP — if >25 cmH2O, perform serial therapeutic LPs. Do not use corticosteroids or mannitol routinely."
          },
          {
            "cls": "",
            "txt": "ID consult mandatory. Monitor CSF India ink and serum/CSF cryptococcal antigen. IRIS management may require steroids."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Check opening pressure on LP — if >25 cmH2O, perform serial therapeutic LPs. Do not use corticosteroids or mannitol routinely."
          },
          {
            "cls": "",
            "txt": "ID consult mandatory. Monitor CSF India ink and serum/CSF cryptococcal antigen. IRIS management may require steroids."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "fn",
    "site": "Febrile Neutropenia",
    "icon": "🌡️",
    "tags": [
      "iv",
      "oral",
      "icu"
    ],
    "keywords": "neutropenia febrile oncology chemotherapy haematology fever ANC immunocompromised",
    "regimens": [
      {
        "sev": "mild",
        "label": "Low-Risk — MASCC ≥21",
        "first": "Ciprofloxacin 500 mg PO BID + Amoxicillin-clavulanate 875/125 mg PO BID",
        "alt": "Levofloxacin 750 mg PO q24h",
        "notes": [
          {
            "cls": "",
            "txt": "Low risk: stable vitals, solid tumour, no comorbidities, reliable follow-up. Reassess clinically at 48h — admit and switch to IV if worsening or not improving."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Low risk: stable vitals, solid tumour, no comorbidities, reliable follow-up. Reassess clinically at 48h — admit and switch to IV if worsening or not improving."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "High-Risk — MASCC <21 (Admit)",
        "first": "Pip-tazo 4.5 g IV q8h\nOR Cefepime 2 g IV q8h\nOR Meropenem 1 g IV q8h (if prior MDR organism, septic shock, or haematological malignancy)",
        "alt": "Add vancomycin if: haemodynamic instability, SSTI, catheter-site infection, or MRSA colonisation\nAdd micafungin 100 mg q24h if: fever persists >4–7 days on antibacterials",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Admit immediately. Antibiotics within 1 hour of presentation. Blood cultures × 2 sets + all line cultures before starting antibiotics."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Admit immediately. Antibiotics within 1 hour of presentation. Blood cultures × 2 sets + all line cultures before starting antibiotics."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "liver-abscess",
    "site": "Pyogenic Liver Abscess",
    "icon": "🫘",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "liver abscess klebsiella K1 K2 hepatic pyogenic diabetes KLA invasive metastatic endophthalmitis",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Stable — Single Abscess, No Shock",
        "first": "Ceftriaxone 2 g IV q12h\nOR Ampicillin-sulbactam 3 g IV q6h",
        "alt": "Pip-tazo 4.5 g IV q8h\nOR Ertapenem 1 g IV q24h (if ESBL risk)",
        "notes": [
          {
            "cls": "",
            "txt": "Percutaneous catheter drainage indicated for abscess >5 cm. Send aspirate C&S. Duration: 4–6 weeks total (IV → PO step-down when improving + tolerating orals)."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Percutaneous catheter drainage indicated for abscess >5 cm. Send aspirate C&S. Duration: 4–6 weeks total (IV → PO step-down when improving + tolerating orals)."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Septic / Multiloculated / Metastatic KLA",
        "first": "Meropenem 1 g IV q8h (preferred for severe illness)",
        "alt": "Imipenem 500 mg IV q6h  |  Cefepime 2 g IV q8h + metronidazole 500 mg IV q8h (mixed flora)",
        "notes": [
          {
            "cls": "danger",
            "txt": "🚨 K. pneumoniae K1/K2: high risk of metastatic seeding — order ophthalmology consult (endophthalmitis), echocardiography, and brain imaging if neurological symptoms."
          },
          {
            "cls": "",
            "txt": "Duration: 6–8 weeks for multiloculated or metastatic disease. Repeat imaging at 4–6 weeks to confirm resolution."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "🚨 K. pneumoniae K1/K2: high risk of metastatic seeding — order ophthalmology consult (endophthalmitis), echocardiography, and brain imaging if neurological symptoms."
          },
          {
            "cls": "",
            "txt": "Duration: 6–8 weeks for multiloculated or metastatic disease. Repeat imaging at 4–6 weeks to confirm resolution."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "ie",
    "site": "Infective Endocarditis (IE)",
    "icon": "❤️‍🩹",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "endocarditis valve prosthetic native bacteremia IE vegetation emboli streptococcus enterococcus staph HACEK",
    "regimens": [
      {
        "sev": "severe",
        "label": "Native Valve — Empiric (pre-culture)",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Gentamicin 3 mg/kg/day IV q24h",
        "alt": "Daptomycin 8–10 mg/kg IV q24h + Ceftriaxone 2 g IV q12h (if vancomycin intolerant)",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Obtain 3 sets blood cultures from separate sites BEFORE antibiotics. Do NOT delay >2 h if acutely ill."
          },
          {
            "cls": "",
            "txt": "Duration: 4–6 weeks, organism-dependent. Echocardiography (TEE preferred) for all suspected IE. ID + cardiothoracic surgery consult early."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Obtain 3 sets blood cultures from separate sites BEFORE antibiotics. Do NOT delay >2 h if acutely ill."
          },
          {
            "cls": "",
            "txt": "Duration: 4–6 weeks, organism-dependent. Echocardiography (TEE preferred) for all suspected IE. ID + cardiothoracic surgery consult early."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Prosthetic Valve IE (<12 mo post-op)",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Gentamicin 3 mg/kg/day IV + Rifampicin 300 mg PO/IV q8h",
        "alt": "Daptomycin 8–10 mg/kg IV q24h + Rifampicin (if vancomycin-intolerant)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Rifampicin only AFTER blood cultures show clearance — adding early can promote resistance. Strong CYP3A4 inducer — check drug interactions."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Rifampicin only AFTER blood cultures show clearance — adding early can promote resistance. Strong CYP3A4 inducer — check drug interactions."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "bone",
    "site": "Bone & Joint Infection (Osteomyelitis / Septic Arthritis)",
    "icon": "🦴",
    "tags": [
      "iv"
    ],
    "keywords": "osteomyelitis septic arthritis joint bone MRSA staph prosthetic hardware implant",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Septic Arthritis (Native Joint)",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Ceftriaxone 2 g IV q24h",
        "alt": "Daptomycin 6–8 mg/kg IV q24h (if vancomycin intolerant; NOT for pulmonary source)",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Urgent joint aspiration/drainage BEFORE antibiotics. Send synovial fluid for cell count, Gram stain, culture, crystal analysis."
          },
          {
            "cls": "",
            "txt": "Duration: 3–4 weeks minimum (6 weeks if adjacent osteomyelitis). De-escalate to cefazolin if MSSA confirmed."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Urgent joint aspiration/drainage BEFORE antibiotics. Send synovial fluid for cell count, Gram stain, culture, crystal analysis."
          },
          {
            "cls": "",
            "txt": "Duration: 3–4 weeks minimum (6 weeks if adjacent osteomyelitis). De-escalate to cefazolin if MSSA confirmed."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Acute Haematogenous Osteomyelitis",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Cefepime 2 g IV q8h\n(broad-spectrum cover pending cultures)",
        "alt": "Linezolid 600 mg IV/PO BID (if vancomycin-intolerant, bone penetration advantage)",
        "notes": [
          {
            "cls": "",
            "txt": "Duration: 4–6 weeks (6–8 weeks for MRSA). IV for initial 2–3 weeks, then PO step-down if culture-directed and clinically improving (CRP trending ↓)."
          },
          {
            "cls": "warn",
            "txt": "MRI is imaging of choice for diagnosis. Biopsy for culture before antibiotics when feasible. ESR/CRP for monitoring."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Duration: 4–6 weeks (6–8 weeks for MRSA). IV for initial 2–3 weeks, then PO step-down if culture-directed and clinically improving (CRP trending ↓)."
          },
          {
            "cls": "warn",
            "txt": "MRI is imaging of choice for diagnosis. Biopsy for culture before antibiotics when feasible. ESR/CRP for monitoring."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Prosthetic Joint Infection (PJI)",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Cefepime 2 g IV q8h",
        "alt": "Add Rifampicin 300 mg PO BID after cultures clear (for staphylococcal PJI with retained implant)",
        "notes": [
          {
            "cls": "",
            "txt": "6 weeks parenteral therapy minimum. Requires ortho-ID joint decision: DAIR, one-stage, or two-stage revision. Rifampicin + fluoroquinolone for biofilm coverage if implant retained."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "6 weeks parenteral therapy minimum. Requires ortho-ID joint decision: DAIR, one-stage, or two-stage revision. Rifampicin + fluoroquinolone for biofilm coverage if implant retained."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "cdi",
    "site": "Clostridioides difficile Infection (CDI)",
    "icon": "🦠",
    "tags": [
      "oral"
    ],
    "keywords": "C difficile CDI colitis pseudomembranous diarrhea fidaxomicin vancomycin oral antibiotic-associated",
    "regimens": [
      {
        "sev": "mild",
        "label": "Non-Severe CDI (WBC <15, Cr <1.5× baseline)",
        "first": "Fidaxomicin 200 mg PO BID × 10 days",
        "alt": "Vancomycin 125 mg PO QID × 10 days (if fidaxomicin unavailable)",
        "notes": [
          {
            "cls": "",
            "txt": "Fidaxomicin preferred: similar cure rates to vancomycin but significantly lower recurrence (~13 % vs ~27 %). Discontinue offending antibiotic if possible."
          },
          {
            "cls": "warn",
            "txt": "Do NOT use metronidazole — no longer first-line per IDSA 2021 guidelines due to inferior efficacy."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Fidaxomicin preferred: similar cure rates to vancomycin but significantly lower recurrence (~13 % vs ~27 %). Discontinue offending antibiotic if possible."
          },
          {
            "cls": "warn",
            "txt": "Do NOT use metronidazole — no longer first-line per IDSA 2021 guidelines due to inferior efficacy."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Severe CDI (WBC ≥15, Cr ≥1.5× baseline)",
        "first": "Fidaxomicin 200 mg PO BID × 10 days",
        "alt": "Vancomycin 125 mg PO QID × 10 days",
        "notes": [
          {
            "cls": "",
            "txt": "Monitor for progression to fulminant disease (ileus, toxic megacolon, hypotension). Surgical consult if not improving at 48–72 h."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Monitor for progression to fulminant disease (ileus, toxic megacolon, hypotension). Surgical consult if not improving at 48–72 h."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Fulminant CDI (Ileus / Toxic Megacolon / Shock)",
        "first": "Vancomycin 500 mg PO or NG q6h + Metronidazole 500 mg IV q8h\n± Vancomycin 500 mg in 100 mL NS per rectum q6h (if ileus)",
        "alt": "FMT consideration for recurrent refractory disease",
        "notes": [
          {
            "cls": "danger",
            "txt": "🚨 Surgical consult immediately — subtotal colectomy may be life-saving. ICU admission."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "🚨 Surgical consult immediately — subtotal colectomy may be life-saving. ICU admission."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "tb",
    "site": "Pulmonary Tuberculosis",
    "icon": "🫁",
    "tags": [
      "oral"
    ],
    "keywords": "tuberculosis TB mycobacterium AFB acid-fast sputum DOT directly observed RIPE isoniazid rifampin MDR XDR",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Drug-Susceptible TB — Intensive Phase (2 months)",
        "first": "Isoniazid (INH) 5 mg/kg/day PO (max 300 mg)\n+ Rifampicin (RIF) 10 mg/kg/day PO (max 600 mg)\n+ Pyrazinamide (PZA) 15–25 mg/kg/day PO (max 2 g)\n+ Ethambutol (EMB) 15–25 mg/kg/day PO",
        "alt": "If PZA contraindicated: INH + RIF + EMB × 2 months, then extend continuation to 7 months",
        "notes": [
          {
            "cls": "warn",
            "txt": "Monitor LFTs monthly (INH/RIF/PZA hepatotoxicity). Visual acuity for EMB. Add pyridoxine 25–50 mg daily with INH."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Monitor LFTs monthly (INH/RIF/PZA hepatotoxicity). Visual acuity for EMB. Add pyridoxine 25–50 mg daily with INH."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "mild",
        "label": "Continuation Phase (4 months — after susceptibility confirmed)",
        "first": "INH 5 mg/kg/day + RIF 10 mg/kg/day × 4 months (total 6 months)",
        "alt": "INH + EMB (if RIF intolerant) × 10 months (total 12 months)",
        "notes": [
          {
            "cls": "",
            "txt": "Total 6 months for drug-susceptible TB. Extend to 9 months if cavitary disease + sputum culture positive at 2 months. Submit sputum cultures monthly until negative."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Total 6 months for drug-susceptible TB. Extend to 9 months if cavitary disease + sputum culture positive at 2 months. Submit sputum cultures monthly until negative."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "MDR-TB (INH + RIF Resistant)",
        "first": "Individualized regimen — ID/TB specialist mandatory\nTypically: Bedaquiline + Linezolid + Fluoroquinolone (Levofloxacin/Moxifloxacin) + one additional agent",
        "alt": "Delamanid, Clofazimine, Cycloserine — per DST results",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Mandatory ID consult and regional CDC notification (法定傳染病). Treatment duration: 18–20 months minimum. Monitor QTc (bedaquiline), CBC (linezolid myelosuppression)."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Mandatory ID consult and regional CDC notification (法定傳染病). Treatment duration: 18–20 months minimum. Monitor QTc (bedaquiline), CBC (linezolid myelosuppression)."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "dfi",
    "site": "Diabetic Foot Infection (DFI)",
    "icon": "🦶",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "diabetic foot DM ulcer osteomyelitis cellulitis amputation wagner gangrene wound ESBL",
    "regimens": [
      {
        "sev": "mild",
        "label": "Mild — Superficial Ulcer, ≤2 cm Cellulitis",
        "first": "Amoxicillin-clavulanate 875/125 mg PO BID × 7–10 days\nOR Cephalexin 500 mg PO QID × 7–10 days",
        "alt": "TMP-SMX DS PO BID (if MRSA suspected)\nOR Clindamycin 300 mg PO TID",
        "notes": [
          {
            "cls": "",
            "txt": "Wound care paramount: debridement, off-loading, glycaemic control. Culture only if moderate–severe. Do NOT culture superficial swabs from chronic ulcers (colonisation vs infection)."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Wound care paramount: debridement, off-loading, glycaemic control. Culture only if moderate–severe. Do NOT culture superficial swabs from chronic ulcers (colonisation vs infection)."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Moderate — Cellulitis >2 cm, Deep Tissue",
        "first": "Pip-tazo 4.5 g IV q8h (extended infusion)\nOR Amp-sulbactam 3 g IV q6h",
        "alt": "Ertapenem 1 g IV q24h (if ESBL risk or prior broad-spectrum antibiotics)",
        "notes": [
          {
            "cls": "",
            "txt": "Deep tissue or bone culture is gold standard — obtain during debridement. MRI for suspected osteomyelitis. Duration: 2–4 weeks for soft tissue; 6 weeks if osteomyelitis."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Deep tissue or bone culture is gold standard — obtain during debridement. MRI for suspected osteomyelitis. Duration: 2–4 weeks for soft tissue; 6 weeks if osteomyelitis."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Severe — Life/Limb-Threatening, Gangrene",
        "first": "Meropenem 1 g IV q8h + Vancomycin 15–20 mg/kg/day IV (MRSA + GNR + anaerobe coverage)",
        "alt": "Pip-tazo 4.5 g IV q6h + Vancomycin\nOR Cefepime 2 g IV q8h + Metronidazole 500 mg IV q8h + Vancomycin",
        "notes": [
          {
            "cls": "danger",
            "txt": "🚨 Urgent surgical debridement — do NOT delay for imaging. Assess for gas gangrene, necrotising fasciitis, or wet gangrene requiring amputation."
          },
          {
            "cls": "",
            "txt": "Vascular assessment mandatory (ABI, CTA). Revascularisation may be needed before healing can occur. HbA1c target <8 % during acute treatment."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "🚨 Urgent surgical debridement — do NOT delay for imaging. Assess for gas gangrene, necrotising fasciitis, or wet gangrene requiring amputation."
          },
          {
            "cls": "",
            "txt": "Vascular assessment mandatory (ABI, CTA). Revascularisation may be needed before healing can occur. HbA1c target <8 % during acute treatment."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "cholangitis",
    "site": "Acute Cholangitis / Biliary Infection",
    "icon": "🟡",
    "tags": [
      "iv"
    ],
    "keywords": "cholangitis biliary gallstone choledocholithiasis ERCP bile duct cholecystitis ascending",
    "regimens": [
      {
        "sev": "mild",
        "label": "Grade I — Mild (responds to initial medical therapy)",
        "first": "Amp-sulbactam 3 g IV q6h\nOR Cefazolin 2 g IV q8h + Metronidazole 500 mg IV q8h",
        "alt": "Ciprofloxacin 400 mg IV q12h + Metronidazole 500 mg IV q8h",
        "notes": [
          {
            "cls": "",
            "txt": "Per Tokyo Guidelines 2018 (TG18). Biliary drainage within 24–48 h (ERCP preferred). Antibiotics are adjunctive. Duration: 2–3 days post-drainage if source controlled."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Per Tokyo Guidelines 2018 (TG18). Biliary drainage within 24–48 h (ERCP preferred). Antibiotics are adjunctive. Duration: 2–3 days post-drainage if source controlled."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Grade II — Moderate (no organ dysfunction, but does not respond to initial therapy)",
        "first": "Pip-tazo 4.5 g IV q8h\nOR Ceftriaxone 2 g IV q24h + Metronidazole 500 mg IV q8h",
        "alt": "Ertapenem 1 g IV q24h (if ESBL risk)",
        "notes": [
          {
            "cls": "",
            "txt": "Urgent ERCP/biliary drainage within 24 h. Add metronidazole if bilioenteric anastomosis or post-ERCP sphincterotomy (anaerobe risk). Duration: 5–7 days."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Urgent ERCP/biliary drainage within 24 h. Add metronidazole if bilioenteric anastomosis or post-ERCP sphincterotomy (anaerobe risk). Duration: 5–7 days."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Grade III — Severe (organ dysfunction / septic shock)",
        "first": "Meropenem 1 g IV q8h\nOR Imipenem 500 mg IV q6h",
        "alt": "Pip-tazo 4.5 g IV q6h + Add vancomycin if enterococcal bacteremia suspected",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Emergency biliary drainage (ERCP or PTBD). ICU admission. Vasopressors and fluid resuscitation per Surviving Sepsis Campaign."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Emergency biliary drainage (ERCP or PTBD). ICU admission. Vasopressors and fluid resuscitation per Surviving Sepsis Campaign."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "gi",
    "site": "Infective Diarrhea / Enteric Fever",
    "icon": "💧",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "diarrhea gastroenteritis typhoid salmonella campylobacter shigella traveler dysentery enteric fever food poisoning",
    "regimens": [
      {
        "sev": "mild",
        "label": "Acute Bacterial Gastroenteritis — Empiric",
        "first": "Azithromycin 500 mg PO daily × 3 days (preferred empiric)\nOR Ciprofloxacin 500 mg PO BID × 3–5 days",
        "alt": "Levofloxacin 500 mg PO daily × 3–5 days",
        "notes": [
          {
            "cls": "warn",
            "txt": "Most acute diarrhea is viral and self-limited — antibiotics only for: fever ≥38.5 °C, bloody/mucoid stools, severe cramping, immunocompromised, or high-risk elderly."
          },
          {
            "cls": "",
            "txt": "Stool C&S + ova/parasites before treating. Azithromycin preferred empirically due to rising fluoroquinolone resistance in Campylobacter and Salmonella."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Most acute diarrhea is viral and self-limited — antibiotics only for: fever ≥38.5 °C, bloody/mucoid stools, severe cramping, immunocompromised, or high-risk elderly."
          },
          {
            "cls": "",
            "txt": "Stool C&S + ova/parasites before treating. Azithromycin preferred empirically due to rising fluoroquinolone resistance in Campylobacter and Salmonella."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Enteric (Typhoid) Fever — Empiric",
        "first": "Ceftriaxone 2 g IV q24h × 10–14 days",
        "alt": "Azithromycin 1 g PO day 1, then 500 mg PO daily × 5–7 days (if susceptible, mild illness)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Do NOT use FQs empirically for suspected typhoid — XDR S. Typhi (ceftriaxone-susceptible only) circulating in Pakistan/Iraq. Azithromycin ± ceftriaxone for XDR."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Do NOT use FQs empirically for suspected typhoid — XDR S. Typhi (ceftriaxone-susceptible only) circulating in Pakistan/Iraq. Azithromycin ± ceftriaxone for XDR."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "mild",
        "label": "Nontyphoidal Salmonella — When to Treat",
        "first": "Usually NO antibiotics (self-limited in immunocompetent adults)",
        "alt": "If high-risk (age <3 mo, age >50 + atherosclerosis, immunocompromised, prosthetic implant): Azithromycin 500 mg PO daily × 5–7 days",
        "notes": [
          {
            "cls": "",
            "txt": "Antibiotic treatment may prolong carrier state in uncomplicated NTS gastroenteritis. Treat only bacteraemia, extra-intestinal infection, or high-risk patients."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Antibiotic treatment may prolong carrier state in uncomplicated NTS gastroenteritis. Treat only bacteraemia, extra-intestinal infection, or high-risk patients."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "crbsi",
    "site": "Catheter-Related Bloodstream Infection (CRBSI)",
    "icon": "💉",
    "tags": [
      "iv",
      "icu"
    ],
    "keywords": "CRBSI catheter CVC PICC line bloodstream infection coagulase-negative staph port central line CLABSI",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Empiric — Haemodynamically Stable",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h (CoNS + MRSA coverage)",
        "alt": "Daptomycin 6–8 mg/kg IV q24h (if vancomycin intolerant)",
        "notes": [
          {
            "cls": "",
            "txt": "Obtain paired blood cultures (one from catheter, one peripheral) BEFORE antibiotics. Differential time-to-positivity ≥2 h suggests catheter source."
          },
          {
            "cls": "",
            "txt": "Remove catheter if: S. aureus, Candida, Pseudomonas, mycobacteria, tunnel/port-pocket infection, septic thrombophlebitis, or no response at 72 h."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Obtain paired blood cultures (one from catheter, one peripheral) BEFORE antibiotics. Differential time-to-positivity ≥2 h suggests catheter source."
          },
          {
            "cls": "",
            "txt": "Remove catheter if: S. aureus, Candida, Pseudomonas, mycobacteria, tunnel/port-pocket infection, septic thrombophlebitis, or no response at 72 h."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Empiric — Septic / High-Risk (ICU, Neutropenic, TPN)",
        "first": "Vancomycin 15–20 mg/kg IV q8–12h + Cefepime 2 g IV q8h (anti-pseudomonal cover)",
        "alt": "Vancomycin + Pip-tazo 4.5 g IV q8h  |  Add micafungin 100 mg IV q24h if Candida risk (TPN, prolonged ABx, prior colonisation)",
        "notes": [
          {
            "cls": "danger",
            "txt": "⚠️ Catheter REMOVAL is primary treatment for complicated CRBSI. Do NOT salvage the line if S. aureus, Candida, or Pseudomonas is identified."
          },
          {
            "cls": "",
            "txt": "Duration: CoNS 5–7 d post-line removal; S. aureus 14 d minimum (echo mandatory); Candida 14 d after last positive culture + line removal. ID consult for S. aureus / Candida CRBSI."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⚠️ Catheter REMOVAL is primary treatment for complicated CRBSI. Do NOT salvage the line if S. aureus, Candida, or Pseudomonas is identified."
          },
          {
            "cls": "",
            "txt": "Duration: CoNS 5–7 d post-line removal; S. aureus 14 d minimum (echo mandatory); Candida 14 d after last positive culture + line removal. ID consult for S. aureus / Candida CRBSI."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "candidemia",
    "site": "Invasive Candidiasis / Candidemia",
    "icon": "🍄",
    "tags": [
      "iv",
      "icu",
      "fungal"
    ],
    "keywords": "candida candidemia fungal invasive yeast echinocandin fluconazole antifungal bloodstream candidiasis caspofungin micafungin",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Non-neutropenic — Stable Patient",
        "first": "Caspofungin 70 mg IV loading, then 50 mg IV q24h\n(echinocandin — preferred first-line)",
        "alt": "Fluconazole 800 mg IV loading, then 400 mg IV/PO q24h — ONLY if: stable, no recent azole, C. albicans/tropicalis suspected",
        "notes": [
          {
            "cls": "",
            "txt": "Mandatory: ophthalmology funduscopy consult within 1 week (endophthalmitis ~15%). Echocardiography if prolonged fungemia. Remove/replace ALL central lines promptly."
          },
          {
            "cls": "warn",
            "txt": "Step down to fluconazole 400 mg q24h after ≥5 days clinical improvement + confirmed susceptible species. Duration: 14 days from first negative blood culture + clinical resolution."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Mandatory: ophthalmology funduscopy consult within 1 week (endophthalmitis ~15%). Echocardiography if prolonged fungemia. Remove/replace ALL central lines promptly."
          },
          {
            "cls": "warn",
            "txt": "Step down to fluconazole 400 mg q24h after ≥5 days clinical improvement + confirmed susceptible species. Duration: 14 days from first negative blood culture + clinical resolution."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Neutropenic / ICU / Azole-Refractory",
        "first": "Caspofungin 70 mg IV loading, then 50 mg IV q24h\nOR Micafungin 100 mg IV q24h",
        "alt": "Liposomal amphotericin B 3–5 mg/kg IV q24h (C. krusei, refractory, or rare species)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Candida endophthalmitis: early vitreoretinal surgery consultation. Candida endocarditis: surgical valve replacement often required. ID consult for all candidemia."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Candida endophthalmitis: early vitreoretinal surgery consultation. Candida endocarditis: surgical valve replacement often required. ID consult for all candidemia."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "aspergillosis",
    "site": "Invasive Pulmonary Aspergillosis (IPA)",
    "icon": "🌿",
    "tags": [
      "iv",
      "icu",
      "fungal"
    ],
    "keywords": "aspergillus aspergillosis invasive pulmonary mold voriconazole echinocandin galactomannan immunocompromised hematology stem cell transplant",
    "regimens": [
      {
        "sev": "severe",
        "label": "Proven / Probable IPA — Primary Therapy",
        "first": "Voriconazole 6 mg/kg IV q12h ×2 doses (loading), then 4 mg/kg IV q12h\n→ Switch to PO 200–300 mg BID when tolerating (bioequivalent)",
        "alt": "Isavuconazole 372 mg IV/PO q8h ×6 doses (loading), then 372 mg q24h — preferred if QTc prolonged, renal failure, or voriconazole toxicity",
        "notes": [
          {
            "cls": "warn",
            "txt": "Voriconazole TDM: target trough 1–5.5 mg/L. Nonlinear PK — CYP2C19 poor metabolizers (Asian ~15–25%) have 4× higher levels. IV form: avoid if CrCl <50 (SBECD vehicle accumulates)."
          },
          {
            "cls": "",
            "txt": "Minimum duration: 6–12 weeks; continue until: lesions resolved, immune reconstitution achieved, completion of underlying treatment."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Voriconazole TDM: target trough 1–5.5 mg/L. Nonlinear PK — CYP2C19 poor metabolizers (Asian ~15–25%) have 4× higher levels. IV form: avoid if CrCl <50 (SBECD vehicle accumulates)."
          },
          {
            "cls": "",
            "txt": "Minimum duration: 6–12 weeks; continue until: lesions resolved, immune reconstitution achieved, completion of underlying treatment."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Salvage / Azole-Refractory IPA",
        "first": "Liposomal amphotericin B 3–5 mg/kg IV q24h\nOR Caspofungin 70 mg loading, then 50 mg q24h (salvage monotherapy)",
        "alt": "Posaconazole 300 mg IV/PO q24h (after 300 mg BID ×2d loading)\nVoriconazole + anidulafungin combination (IDSA 2A)",
        "notes": [
          {
            "cls": "danger",
            "txt": "⛔ Distinguish from mucormycosis (CT: ribbon hyphae, >10 lesions, reverse halo sign, sinus involvement). Voriconazole NOT effective for Mucorales — switch to liposomal AmB immediately if suspected."
          },
          {
            "cls": "",
            "txt": "Surgical resection: consider for single lesion near major vessels, haemoptysis risk, or chest wall invasion. Prophylactic: posaconazole 300 mg q24h for prolonged neutropenia (AML induction, HSCT)."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⛔ Distinguish from mucormycosis (CT: ribbon hyphae, >10 lesions, reverse halo sign, sinus involvement). Voriconazole NOT effective for Mucorales — switch to liposomal AmB immediately if suspected."
          },
          {
            "cls": "",
            "txt": "Surgical resection: consider for single lesion near major vessels, haemoptysis risk, or chest wall invasion. Prophylactic: posaconazole 300 mg q24h for prolonged neutropenia (AML induction, HSCT)."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "crypto-meningitis",
    "site": "Cryptococcal Meningitis",
    "icon": "🧠",
    "tags": [
      "iv",
      "icu",
      "fungal"
    ],
    "keywords": "cryptococcus meningitis cryptococcal HIV AIDS immunocompromised amphotericin flucytosine fluconazole CSF opening pressure IRIS",
    "regimens": [
      {
        "sev": "severe",
        "label": "Induction — 2 Weeks (HIV-associated)",
        "first": "Liposomal amphotericin B 3–4 mg/kg IV q24h\n+ Flucytosine (5-FC) 25 mg/kg PO QID",
        "alt": "AmB deoxycholate 0.7–1 mg/kg IV q24h + 5-FC (only if liposomal unavailable — higher nephrotoxicity)\nFor non-HIV: same regimen, ID consult for duration",
        "notes": [
          {
            "cls": "warn",
            "txt": "ICP management critical: LP at diagnosis. If opening pressure >25 cmH₂O → serial therapeutic LPs daily until <20 cmH₂O. Lumbar drain if refractory. Acetazolamide NOT effective."
          },
          {
            "cls": "",
            "txt": "5-FC: dose-adjust for renal failure (CrCl <50). Monitor 5-FC level (peak target 40–60 mg/L). CBC biweekly — bone marrow suppression."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "ICP management critical: LP at diagnosis. If opening pressure >25 cmH₂O → serial therapeutic LPs daily until <20 cmH₂O. Lumbar drain if refractory. Acetazolamide NOT effective."
          },
          {
            "cls": "",
            "txt": "5-FC: dose-adjust for renal failure (CrCl <50). Monitor 5-FC level (peak target 40–60 mg/L). CBC biweekly — bone marrow suppression."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Consolidation — 8 Weeks",
        "first": "Fluconazole 400 mg PO/IV q24h × 8 weeks",
        "alt": "Itraconazole 200 mg BID (inferior — use fluconazole when possible)",
        "notes": [
          {
            "cls": "",
            "txt": "Confirm CSF culture negativity before consolidation phase. IRIS risk with ART initiation in HIV: delay ART 4–6 weeks after antifungal start (COAT trial — reduces IRIS mortality)."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Confirm CSF culture negativity before consolidation phase. IRIS risk with ART initiation in HIV: delay ART 4–6 weeks after antifungal start (COAT trial — reduces IRIS mortality)."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "mild",
        "label": "Maintenance (HIV — until ART controls CD4)",
        "first": "Fluconazole 200 mg PO q24h (until CD4 >200 cells/μL × 3 months on ART)",
        "alt": "Itraconazole 200 mg BID (if fluconazole intolerant)",
        "notes": [
          {
            "cls": "",
            "txt": "Non-HIV: maintenance duration individualised (typically 6–12 months). Transplant recipients: reduce immunosuppression where possible. ID consult mandatory."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Non-HIV: maintenance duration individualised (typically 6–12 months). Transplant recipients: reduce immunosuppression where possible. ID consult mandatory."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "pjp",
    "site": "Pneumocystis jirovecii Pneumonia (PJP / PCP)",
    "icon": "💨",
    "tags": [
      "iv",
      "oral",
      "fungal"
    ],
    "keywords": "pneumocystis PJP PCP jirovecii HIV AIDS immunocompromised TMP-SMX trimethoprim prophylaxis pentamidine dapsone atovaquone steroid adjunctive",
    "regimens": [
      {
        "sev": "mild",
        "label": "Mild–Moderate (PaO₂ >70 mmHg, A-a <35)",
        "first": "TMP-SMX: 15–20 mg/kg/day TMP component PO in 3 divided doses × 21 days\n(e.g., DS 2 tabs PO TID for 70 kg patient)",
        "alt": "Atovaquone 750 mg PO BID × 21d (with high-fat meal — bioavailability highly food-dependent)\nDapsone 100 mg PO q24h + TMP 5 mg/kg TID",
        "notes": [
          {
            "cls": "",
            "txt": "LDH elevation correlates with disease severity (normal LDH makes PJP less likely). Monitor PaO₂ or SpO₂ closely — may deteriorate on day 3–5 (inflammatory response to dying organisms)."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "LDH elevation correlates with disease severity (normal LDH makes PJP less likely). Monitor PaO₂ or SpO₂ closely — may deteriorate on day 3–5 (inflammatory response to dying organisms)."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "severe",
        "label": "Severe (PaO₂ <70 mmHg or A-a >35)",
        "first": "TMP-SMX 15–20 mg/kg/day IV in 3–4 divided doses × 21 days\n+ Adjunctive prednisone: 40 mg PO BID ×5d → 40 mg q24h ×5d → 20 mg q24h ×11d",
        "alt": "IV pentamidine 4 mg/kg IV q24h (severe toxicity: hypoglycaemia, pancreatitis, QT prolongation — reserve for TMP-SMX failure/allergy)\nPrimaquine 30 mg PO q24h + clindamycin 900 mg IV q8h (salvage)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Adjunctive steroids MUST start within 24–72h of antifungal therapy if PaO₂ <70 or A-a >35 — reduces mortality ~50% (NEJM 1990). Recommended even in HIV-negative patients."
          },
          {
            "cls": "",
            "txt": "Mechanical ventilation mortality ~60%. CPAP/NIV may bridge. Early ID + pulmonology consult. HIV test mandatory in all suspected PJP without prior diagnosis."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Adjunctive steroids MUST start within 24–72h of antifungal therapy if PaO₂ <70 or A-a >35 — reduces mortality ~50% (NEJM 1990). Recommended even in HIV-negative patients."
          },
          {
            "cls": "",
            "txt": "Mechanical ventilation mortality ~60%. CPAP/NIV may bridge. Early ID + pulmonology consult. HIV test mandatory in all suspected PJP without prior diagnosis."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "mucormycosis",
    "site": "Mucormycosis (Zygomycosis)",
    "icon": "🔴",
    "tags": [
      "iv",
      "icu",
      "fungal"
    ],
    "keywords": "mucormycosis zygomycosis rhizopus mucor amphotericin isavuconazole posaconazole diabetes DKA immunocompromised surgical debridement rhinosinusal",
    "regimens": [
      {
        "sev": "severe",
        "label": "Primary Treatment (All Forms) — URGENT",
        "first": "Liposomal amphotericin B 5–10 mg/kg IV q24h\n+ URGENT surgical debridement (rhinosinusal, cutaneous, pulmonary)",
        "alt": "AmB lipid complex (ABLC) 5 mg/kg q24h if AmBisome unavailable\nPosaconazole/isavuconazole for step-down only (NOT primary if unstable)",
        "notes": [
          {
            "cls": "danger",
            "txt": "⛔ CRITICAL: Voriconazole and fluconazole have NO activity vs. Mucorales. If on voriconazole prophylaxis and new lesions develop — switch immediately to liposomal amphotericin B. Delay = fatal."
          },
          {
            "cls": "warn",
            "txt": "Surgical debridement is mandatory and must be aggressive/repeated. Orbital exenteration may be necessary for rhino-orbital-cerebral disease. Do NOT delay surgery for antifungal \"trial\"."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "⛔ CRITICAL: Voriconazole and fluconazole have NO activity vs. Mucorales. If on voriconazole prophylaxis and new lesions develop — switch immediately to liposomal amphotericin B. Delay = fatal."
          },
          {
            "cls": "warn",
            "txt": "Surgical debridement is mandatory and must be aggressive/repeated. Orbital exenteration may be necessary for rhino-orbital-cerebral disease. Do NOT delay surgery for antifungal \"trial\"."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "moderate",
        "label": "Step-Down After Stabilisation",
        "first": "Isavuconazole 372 mg IV/PO q8h ×6 doses (loading), then 372 mg PO q24h\nOR Posaconazole 300 mg IV/PO q24h (after 300 mg BID ×2d loading)",
        "alt": "Continue liposomal amphotericin B if oral step-down not feasible",
        "notes": [
          {
            "cls": "",
            "txt": "Duration: minimum 12 weeks — continue until: lesions radiographically stable, immune reconstitution, and sustained clinical remission. ID consult mandatory for all cases."
          },
          {
            "cls": "",
            "txt": "Monitor: SCr, K⁺, Mg²⁺ daily on amphotericin B. Pre-hydration with 500 mL NS before each AmB dose reduces nephrotoxicity. Electrolyte replacement essential."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Duration: minimum 12 weeks — continue until: lesions radiographically stable, immune reconstitution, and sustained clinical remission. ID consult mandatory for all cases."
          },
          {
            "cls": "",
            "txt": "Monitor: SCr, K⁺, Mg²⁺ daily on amphotericin B. Pre-hydration with 500 mL NS before each AmB dose reduces nephrotoxicity. Electrolyte replacement essential."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "mdr-qref",
    "type": "mdr",
    "site": "MDR Organisms — Drug Quick Reference",
    "icon": "⚠️",
    "tags": [
      "iv",
      "icu",
      "tw"
    ],
    "headers": [
      "Organism",
      "Drug(s) of Choice",
      "Alternatives",
      "regional / Resistance Notes"
    ],
    "keywords": "MDR MRSA ESBL CRE KPC MBL VRE acinetobacter pseudomonas resistant XDR stenotrophomonas carbapenem colistin polymyxin",
    "regimens": [
      {
        "sev": "organism",
        "label": "MRSA",
        "first": "Vancomycin (AUC-guided, target AUC/MIC 400–600)\nDaptomycin 6–10 mg/kg IV q24h (bacteremia / endocarditis)\nLinezolid 600 mg IV/PO BID (pneumonia, SSTI)",
        "alt": "Ceftaroline 600 mg IV q8h (bacteremia salvage — ID consult)\nTMP-SMX DS 1–2 tabs BID (CA-MRSA SSTI, if susceptible)\nCeftazidime-avibactam (NOT for MRSA — incorrect)",
        "notes": [
          {
            "cls": "",
            "txt": "Empiric MRSA coverage should be guided by infection severity, site, and healthcare exposure, then narrowed once cultures and susceptibilities are available."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Empiric MRSA coverage should be guided by infection severity, site, and healthcare exposure, then narrowed once cultures and susceptibilities are available."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "ESBL Enterobacteriaceae",
        "first": "Ertapenem 1 g IV q24h (stable, community-onset — stewardship preferred)\nMeropenem 1–2 g IV q8h (ICU / septic shock)",
        "alt": "Temocillin (limited availability in regional)\nCeftazidime-avibactam (only if KPC co-resistance)\nPiperacillin-tazobactam (avoid for bacteremia — MERINO trial: inferior vs. meropenem)",
        "notes": [
          {
            "cls": "",
            "txt": "Carbapenems remain the most reliable option for severe ESBL infections, especially bacteremia. De-escalate when cultures and susceptibilities support a narrower regimen."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Carbapenems remain the most reliable option for severe ESBL infections, especially bacteremia. De-escalate when cultures and susceptibilities support a narrower regimen."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "CRE / KPC-Producing Enterobacteriaceae",
        "first": "Ceftazidime-avibactam 2.5 g IV q8h (3h infusion) — active vs. KPC, OXA-48\nMeropenem-vaborbactam (KPC-producing only)",
        "alt": "Colistin / Polymyxin B (nephrotoxic — last resort, combination preferred)\nHigh-dose meropenem 2 g q8h extended infusion + colistin (if MIC ≤8)\nCeftolozane-tazobactam (PDR Pseudomonas ONLY — NOT Enterobacteriaceae)",
        "notes": [
          {
            "cls": "warn",
            "txt": "MBL-producing (NDM, IMP, VIM): ceftazidime-avibactam NOT effective. Use ceftazidime-avibactam + aztreonam combination for MBL+KPC co-producers."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "MBL-producing (NDM, IMP, VIM): ceftazidime-avibactam NOT effective. Use ceftazidime-avibactam + aztreonam combination for MBL+KPC co-producers."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "VRE (E. faecium)",
        "first": "Linezolid 600 mg IV/PO BID (drug of choice for most sites)\nDaptomycin 6–10 mg/kg IV q24h (bacteremia)",
        "alt": "Tigecycline 100 mg loading, then 50 mg q12h (bacteriostatic — NOT for bacteremia/UTI alone)\nOritavancin / dalbavancin (once-weekly; ID consult)",
        "notes": [
          {
            "cls": "",
            "txt": "Choose the agent by site: linezolid is useful for pneumonia and soft tissue infection, while daptomycin is preferred for bloodstream infection but should not be used for pneumonia because pulmonary surfactant inactivates it."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Choose the agent by site: linezolid is useful for pneumonia and soft tissue infection, while daptomycin is preferred for bloodstream infection but should not be used for pneumonia because pulmonary surfactant inactivates it."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "XDR Acinetobacter baumannii (MDRAB)",
        "first": "High-dose ampicillin-sulbactam 9–18 g/day IV (sulbactam intrinsic activity vs. PBP2)\n± Polymyxin B 1.25–2.5 mg/kg/day IV in 2 divided doses",
        "alt": "Tigecycline 100 mg loading, then 50 mg q12h (bacteriostatic — combine with sulbactam/colistin)\nMinocycline 200 mg q12h IV/PO\nCefiderocol (compassionate use — ID consult)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Polymyxin nephrotoxicity: monitor SCr daily. Combination therapy (not monotherapy) reduces resistance emergence and improves outcomes for XDR Acinetobacter."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Polymyxin nephrotoxicity: monitor SCr daily. Combination therapy (not monotherapy) reduces resistance emergence and improves outcomes for XDR Acinetobacter."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "MDR Pseudomonas aeruginosa",
        "first": "Ceftolozane-tazobactam 3 g IV q8h (3h infusion) — MDR PsA, non-MBL-producing\nCeftazidime-avibactam 2.5 g IV q8h (3h infusion) — non-MBL-producing",
        "alt": "Cefiderocol (XDR, MBL-producing PsA)\nHigh-dose meropenem 2 g q8h extended + aminoglycoside (MIC ≤4, synergy)\nColistin / Polymyxin B (last resort)",
        "notes": [
          {
            "cls": "warn",
            "txt": "PDR PsA (pan-drug resistant): phage therapy clinical trials emerging. High-dose aminoglycoside combination (amikacin 25–30 mg/kg q24h — AUC-guided) may provide residual activity."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "PDR PsA (pan-drug resistant): phage therapy clinical trials emerging. High-dose aminoglycoside combination (amikacin 25–30 mg/kg q24h — AUC-guided) may provide residual activity."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "organism",
        "label": "Stenotrophomonas maltophilia",
        "first": "TMP-SMX 15 mg/kg/day TMP IV/PO in 3 doses (drug of choice)\nLevofloxacin 750 mg IV/PO q24h (alternative first-line)",
        "alt": "Minocycline 200 mg q12h IV/PO\nCefiderocol (limited data)\nTicarcillin-clavulanate (if available)",
        "notes": [
          {
            "cls": "warn",
            "txt": "Stenotrophomonas: intrinsically resistant to carbapenems (metallo-β-lactamase L1) and many β-lactams. TMP-SMX remains standard of care."
          }
        ],
        "publicNotes": [
          {
            "cls": "warn",
            "txt": "Stenotrophomonas: intrinsically resistant to carbapenems (metallo-β-lactamase L1) and many β-lactams. TMP-SMX remains standard of care."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "aspiration",
    "site": "Aspiration Syndromes",
    "icon": "🫁",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "aspiration pneumonitis pneumonia anaerobe lung chemical aspiration",
    "regimens": [
      {
        "sev": "review",
        "label": "Aspiration pneumonitis vs pneumonia",
        "first": "Pneumonitis: witnessed aspiration with rapid symptoms and improvement within 24–48 h may not need antibiotics.\nPneumonia: persistent fever, leukocytosis, infiltrate, or clinical decline supports treatment.",
        "alt": "If treating community aspiration pneumonia: ampicillin-sulbactam IV or amoxicillin-clavulanate PO when appropriate.\nHospital-acquired risk: choose HAP-aligned regimen.",
        "notes": [
          {
            "cls": "",
            "txt": "Duration chip: 5–7 days if clinical response and no abscess/empyema."
          },
          {
            "cls": "warn",
            "txt": "Source-control check: evaluate airway protection, dysphagia, abscess, and empyema rather than reflexively extending anaerobic coverage."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Duration chip: 5–7 days if clinical response and no abscess/empyema."
          },
          {
            "cls": "warn",
            "txt": "Source-control check: evaluate airway protection, dysphagia, abscess, and empyema rather than reflexively extending anaerobic coverage."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "copd-exacerbation",
    "site": "COPD Exacerbation",
    "icon": "🫁",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "copd exacerbation aecopd sputum purulence dyspnea bronchitis",
    "regimens": [
      {
        "sev": "moderate",
        "label": "Antibiotics when cardinal symptoms or ventilation need",
        "first": "Treat when increased dyspnea + sputum volume + sputum purulence, or purulence plus one other cardinal symptom, or ventilatory support need.",
        "alt": "Common options: amoxicillin-clavulanate, doxycycline, azithromycin, or respiratory fluoroquinolone depending on severity and local resistance.",
        "notes": [
          {
            "cls": "",
            "txt": "Duration chip: usually 5 days when antibiotics are indicated and response is adequate."
          },
          {
            "cls": "warn",
            "txt": "Avoid antibiotics for wheeze-only exacerbations without bacterial features."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Duration chip: usually 5 days when antibiotics are indicated and response is adequate."
          },
          {
            "cls": "warn",
            "txt": "Avoid antibiotics for wheeze-only exacerbations without bacterial features."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "pleural-infection",
    "site": "Pleural Infection / Empyema",
    "icon": "🫁",
    "tags": [
      "iv"
    ],
    "keywords": "empyema pleural infection complicated parapneumonic effusion chest tube source control",
    "regimens": [
      {
        "sev": "severe",
        "label": "Empyema / complicated parapneumonic effusion",
        "first": "Cover streptococci, anaerobes, and hospital pathogens based on acquisition context; drainage/source control is central.",
        "alt": "Community: ceftriaxone + metronidazole or ampicillin-sulbactam.\nHospital: anti-pseudomonal beta-lactam plus MRSA coverage when risk factors.",
        "notes": [
          {
            "cls": "danger",
            "txt": "Source-control checklist: diagnostic tap, pH/glucose/LDH, Gram stain/culture, chest tube if pus/positive Gram stain/low pH, surgical review if loculated or failing drainage."
          },
          {
            "cls": "",
            "txt": "Duration chip: commonly 2–6 weeks depending on drainage and clinical response; set a stop/review date."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "Source-control checklist: diagnostic tap, pH/glucose/LDH, Gram stain/culture, chest tube if pus/positive Gram stain/low pH, surgical review if loculated or failing drainage."
          },
          {
            "cls": "",
            "txt": "Duration chip: commonly 2–6 weeks depending on drainage and clinical response; set a stop/review date."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "sbp",
    "site": "Spontaneous Bacterial Peritonitis",
    "icon": "🧫",
    "tags": [
      "iv",
      "oral"
    ],
    "keywords": "sbp cirrhosis ascites paracentesis albumin prophylaxis",
    "regimens": [
      {
        "sev": "standard",
        "label": "Suspected / confirmed SBP",
        "first": "Diagnostic paracentesis before antibiotics when feasible. Empiric ceftriaxone/cefotaxime-class therapy is typical for community SBP.",
        "alt": "Healthcare-associated or resistant-risk SBP: broaden based on local resistance and prior cultures.",
        "notes": [
          {
            "cls": "",
            "txt": "Duration chip: often 5 days if clinical response; repeat paracentesis if poor response."
          },
          {
            "cls": "warn",
            "txt": "Checklist: albumin eligibility, renal function, blood cultures, secondary prophylaxis plan, and exclude secondary peritonitis when polymicrobial or not improving."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Duration chip: often 5 days if clinical response; repeat paracentesis if poor response."
          },
          {
            "cls": "warn",
            "txt": "Checklist: albumin eligibility, renal function, blood cultures, secondary prophylaxis plan, and exclude secondary peritonitis when polymicrobial or not improving."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "nsti",
    "site": "Necrotizing Soft Tissue Infection",
    "icon": "🧬",
    "tags": [
      "iv"
    ],
    "keywords": "necrotizing fasciitis nsti gas gangrene clostridium toxic shock source control",
    "regimens": [
      {
        "sev": "critical",
        "label": "High-risk SSTI / NSTI",
        "first": "Immediate surgical consultation and broad empiric therapy. Antibiotics do not replace debridement.",
        "alt": "Common empiric frame: vancomycin + piperacillin-tazobactam or carbapenem, plus clindamycin when toxin-mediated streptococcal/clostridial disease is possible.",
        "notes": [
          {
            "cls": "danger",
            "txt": "Source-control checklist: early OR, repeat debridement plan, cultures from tissue, hemodynamic support, and toxin-suppression review."
          },
          {
            "cls": "",
            "txt": "Duration chip: reassess after source control; continue until no further debridement needed and systemic signs improved."
          }
        ],
        "publicNotes": [
          {
            "cls": "danger",
            "txt": "Source-control checklist: early OR, repeat debridement plan, cultures from tissue, hemodynamic support, and toxin-suppression review."
          },
          {
            "cls": "",
            "txt": "Duration chip: reassess after source control; continue until no further debridement needed and systemic signs improved."
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "pkpd-ref",
    "type": "pkpd",
    "site": "PK/PD Reference — Antibiotic Dosing Principles",
    "icon": "📈",
    "tags": [
      "iv",
      "oral"
    ],
    "keywords": "pharmacokinetics pharmacodynamics PK PD time concentration AUC MIC dosing extended infusion aminoglycoside vancomycin beta-lactam killing",
    "regimens": [
      {
        "sev": "time",
        "label": "Time-Dep.",
        "first": "β-Lactams: penicillins, cephalosporins, carbapenems, aztreonam\nKilling maximized by time spent above MIC (%T>MIC)",
        "alt": "Meropenem, Piperacillin-tazobactam, Ceftriaxone, Cefepime, Ertapenem, Cefazolin",
        "notes": [
          {
            "cls": "",
            "txt": "%T>MIC target: ≥40% (bacteriostatic) → ≥70% (bactericidal)\nExtended infusion (3–4h) or continuous infusion maximizes T>MIC for elevated-MIC organisms."
          },
          {
            "cls": "",
            "txt": "Extended infusion: keep same total daily dose, extend each infusion\nIdeal for Pseudomonas or ESBL organisms with MIC near breakpoint\nCheck drug stability at room temp (pip-tazo stable 12h; meropenem 3–4h)"
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "%T>MIC target: ≥40% (bacteriostatic) → ≥70% (bactericidal)\nExtended infusion (3–4h) or continuous infusion maximizes T>MIC for elevated-MIC organisms."
          },
          {
            "cls": "",
            "txt": "Extended infusion: keep same total daily dose, extend each infusion\nIdeal for Pseudomonas or ESBL organisms with MIC near breakpoint\nCheck drug stability at room temp (pip-tazo stable 12h; meropenem 3–4h)"
          }
        ],
        "localNotes": []
      },
      {
        "sev": "conc",
        "label": "Conc-Dep.",
        "first": "Aminoglycosides, Daptomycin, Polymyxins, Metronidazole\nKilling maximized by peak concentration relative to MIC (Cmax/MIC)",
        "alt": "Gentamicin, Amikacin, Daptomycin",
        "notes": [
          {
            "cls": "",
            "txt": "Cmax/MIC target ≥8–10× (aminoglycosides)\nOnce-daily high-dose aminoglycosides maximizes Cmax and exploits post-antibiotic effect (PAE)\nPAE = continued bacterial suppression after drug falls below MIC (3–8h for aminoglycosides vs. GNRs)"
          },
          {
            "cls": "",
            "txt": "Aminoglycosides: extended-interval dosing (once-daily)\nMinimizes nephrotoxicity and ototoxicity (less cortical accumulation)\nHartford nomogram or AUC-based monitoring preferred\nAmikacin 25–30 mg/kg q24h for MDR/synergy"
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Cmax/MIC target ≥8–10× (aminoglycosides)\nOnce-daily high-dose aminoglycosides maximizes Cmax and exploits post-antibiotic effect (PAE)\nPAE = continued bacterial suppression after drug falls below MIC (3–8h for aminoglycosides vs. GNRs)"
          },
          {
            "cls": "",
            "txt": "Aminoglycosides: extended-interval dosing (once-daily)\nMinimizes nephrotoxicity and ototoxicity (less cortical accumulation)\nHartford nomogram or AUC-based monitoring preferred\nAmikacin 25–30 mg/kg q24h for MDR/synergy"
          }
        ],
        "localNotes": []
      },
      {
        "sev": "auc",
        "label": "AUC-Dep.",
        "first": "Vancomycin, Fluoroquinolones, Azithromycin, Linezolid\nKilling maximized by total drug exposure (AUC/MIC)",
        "alt": "Vancomycin, Levofloxacin, Ciprofloxacin, Azithromycin, Linezolid",
        "notes": [
          {
            "cls": "",
            "txt": "AUC₂₄/MIC targets:\n• Vancomycin: 400–600 mg·h/L (ASHP/IDSA/SIDP 2020 — replaces trough-only monitoring)\n• Levofloxacin vs. S. pneumoniae: ≥125; vs. GNRs: ≥87–125"
          },
          {
            "cls": "",
            "txt": "FQ: high-dose once-daily dosing preferred (levofloxacin 750 mg) — maximizes AUC/MIC\nVancomycin AUC-based TDM: local institution pharmacy PK consult service available\nLinezolid AUC monitoring emerging for salvage serious infections"
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "AUC₂₄/MIC targets:\n• Vancomycin: 400–600 mg·h/L (ASHP/IDSA/SIDP 2020 — replaces trough-only monitoring)\n• Levofloxacin vs. S. pneumoniae: ≥125; vs. GNRs: ≥87–125"
          },
          {
            "cls": "",
            "txt": "FQ: high-dose once-daily dosing preferred (levofloxacin 750 mg) — maximizes AUC/MIC\nVancomycin AUC-based TDM: local institution pharmacy PK consult service available\nLinezolid AUC monitoring emerging for salvage serious infections"
          }
        ],
        "localNotes": []
      }
    ]
  },
  {
    "id": "abx-stewardship",
    "site": "Antibiotic Stewardship Reminders",
    "icon": "📋",
    "tags": [
      "oral",
      "iv"
    ],
    "keywords": "stewardship de-escalation allergy penicillin culture duration procalcitonin antibiogram resistance prevention",
    "regimens": [
      {
        "sev": "mild",
        "label": "De-escalation & Duration Principles",
        "first": "Narrow spectrum at 48–72 h based on culture & sensitivity results.\nUse the shortest effective duration (review evidence for each site).",
        "alt": "Procalcitonin-guided discontinuation for respiratory infections. Daily antibiotic \"time-out\" review.",
        "notes": [
          {
            "cls": "",
            "txt": "Key evidence-based short courses: CAP 5 d, uncomplicated UTI 3–5 d, uncomplicated IAI 4 d post-source-control, uncomplicated bacteremia 7 d, CDI 10 d."
          },
          {
            "cls": "warn",
            "txt": "Penicillin allergy: >90 % of reported \"penicillin allergy\" patients tolerate penicillins. Take a detailed allergy history — true IgE-mediated anaphylaxis is rare. Skin testing if uncertain."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "Key evidence-based short courses: CAP 5 d, uncomplicated UTI 3–5 d, uncomplicated IAI 4 d post-source-control, uncomplicated bacteremia 7 d, CDI 10 d."
          },
          {
            "cls": "warn",
            "txt": "Penicillin allergy: >90 % of reported \"penicillin allergy\" patients tolerate penicillins. Take a detailed allergy history — true IgE-mediated anaphylaxis is rare. Skin testing if uncertain."
          }
        ],
        "localNotes": []
      },
      {
        "sev": "mild",
        "label": "regional-Specific Resistance Patterns (General)",
        "first": "Check your hospital antibiogram annually.\nESBL E. coli / K. pneumoniae: 10–25 % (higher in ICU)\nMRSA: community ~15–25 %, hospital ~50–60 %\nXDR A. baumannii: endemic in ICUs",
        "alt": "Carbapenem-resistant Enterobacteriaceae (CRE): emerging, ~2–5 % — reserve ceftazidime-avibactam, colistin",
        "notes": [
          {
            "cls": "",
            "txt": "FQ resistance in E. coli ~20–30 %. Macrolide resistance in S. pneumoniae ~30–40 %. These affect empiric choices for UTI and CAP respectively."
          }
        ],
        "publicNotes": [
          {
            "cls": "",
            "txt": "FQ resistance in E. coli ~20–30 %. Macrolide resistance in S. pneumoniae ~30–40 %. These affect empiric choices for UTI and CAP respectively."
          }
        ],
        "localNotes": []
      }
    ]
  }
];

ABX_DATA.forEach((site) => {
  (site.regimens || []).forEach((regimen) => {
    if (!Array.isArray(regimen.publicNotes)) regimen.publicNotes = [];
    if (!Array.isArray(regimen.localNotes)) regimen.localNotes = [];
  });
});
