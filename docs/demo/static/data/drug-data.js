const DRUG_DATA = {
  "amoxicillin": {
    "name": "Amoxicillin",
    "class": "Aminopenicillin",
    "aliases": [
      "amoxicillin"
    ],
    "pkpd": "Time-dependent killing. %T>MIC target ≥40%. Oral bioavailability ~90% — PO preferred when possible.",
    "mechanism": "Inhibits PBPs (transpeptidases) → disrupts peptidoglycan cross-linking → bactericidal for susceptible organisms.",
    "spectrum": "S. pneumoniae, H. influenzae (non-BLNAR), E. faecalis, oral streptococci, Listeria. NOT Staphylococcus, ESBL-GNRs, Pseudomonas, anaerobes.",
    "dose": {
      "standard": "500 mg PO TID × 5–7 d (or 875 mg PO BID)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard dose"
      },
      {
        "crcl": "10–29",
        "regimen": "250–500 mg q12h"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "250–500 mg q24h; dose after dialysis"
      }
    ],
    "sideEffects": [
      "Maculopapular rash (especially if concurrent EBV mononucleosis — up to 90%)",
      "GI: nausea, diarrhoea (common)",
      "Drug fever",
      "C. difficile (rare)"
    ],
    "monitoring": [
      "Clinical response",
      "Rash surveillance"
    ],
    "publicNotes": [
      "Prefer oral dosing when feasible because bioavailability is high",
      "Avoid empiric UTI use when local E. coli resistance is high; check your local antibiogram",
      "High-dose amoxicillin may still cover intermediate penicillin-resistant pneumococcus, but high-level resistance needs an alternative"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amoxicillin"
      },
      {
        "text": "IDSA/ATS CAP Guidelines — Mandell et al., CID 2007",
        "url": "https://doi.org/10.1086/511159"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "amoxicillin-clavulanate": {
    "name": "Amoxicillin-Clavulanate (Augmentin)",
    "class": "Aminopenicillin + β-Lactamase Inhibitor",
    "aliases": [
      "amoxicillin-clavulanate",
      "augmentin",
      "amoxicillin/clavulanate",
      "amox-clav"
    ],
    "pkpd": "Time-dependent (amoxicillin component). %T>MIC ≥40%. Clavulanate enhances spectrum by inhibiting class A β-lactamases.",
    "mechanism": "Amoxicillin inhibits PBPs; clavulanate irreversibly inhibits class A β-lactamases (TEM, SHV — NOT AmpC, MBL, ESBL).",
    "spectrum": "MSSA, MRSA (NO), H. influenzae, oral anaerobes, E. coli (susceptible). NOT ESBL producers, Pseudomonas, Enterococcus (most).",
    "dose": {
      "standard": "875/125 mg PO BID × 5–7 d",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "875/125 mg q12h"
      },
      {
        "crcl": "10–29",
        "regimen": "500/125 mg q12h"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "250/125 mg q12–24h; dose after dialysis"
      }
    ],
    "sideEffects": [
      "GI: diarrhoea (clavulanate-mediated — most common)",
      "Hepatotoxicity: cholestatic or hepatocellular (rare, watch with prolonged use)",
      "Rash",
      "C. difficile"
    ],
    "monitoring": [
      "LFTs if course >14 days or prior liver disease",
      "Clinical response"
    ],
    "publicNotes": [
      "Useful oral step-down option for mild to moderate SSTI, dental infections, and community sinusitis",
      "Take with food to reduce GI side effects"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amoxicillin+clavulanate"
      },
      {
        "text": "IDSA SSTI Guidelines — Stevens et al., CID 2014",
        "url": "https://doi.org/10.1093/cid/ciu296"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "ampicillin-sulbactam": {
    "name": "Ampicillin-Sulbactam (Unasyn)",
    "class": "β-Lactam + β-Lactamase Inhibitor",
    "aliases": [
      "ampicillin-sulbactam",
      "unasyn",
      "amp-sul",
      "ampicillin/sulbactam"
    ],
    "pkpd": "Time-dependent killing. %T>MIC ≥40%. Sulbactam has intrinsic antibacterial activity vs. Acinetobacter (binds PBP2 directly).",
    "mechanism": "Ampicillin inhibits PBPs; sulbactam inhibits class A/C β-lactamases + directly targets PBP2 of A. baumannii.",
    "spectrum": "MSSA, streptococci, oral anaerobes, H. influenzae, Acinetobacter baumannii (sulbactam). NOT MRSA, ESBL producers, Pseudomonas, Enterococcus (most).",
    "dose": {
      "standard": "3 g IV q6h (2 g ampicillin + 1 g sulbactam)",
      "loading": "High-dose sulbactam: 9–18 g/day (sulbactam component) for XDR Acinetobacter"
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "3 g q6h"
      },
      {
        "crcl": "15–29",
        "regimen": "1.5–3 g q12h"
      },
      {
        "crcl": "5–14",
        "regimen": "1.5–3 g q24h"
      },
      {
        "crcl": "HD",
        "regimen": "1.5 g q24h; dose after dialysis"
      }
    ],
    "sideEffects": [
      "Rash (~3%)",
      "Diarrhoea",
      "Elevated LFTs (transient)",
      "Injection site reactions"
    ],
    "monitoring": [
      "Renal function",
      "Clinical response"
    ],
    "publicNotes": [
      "Ampicillin-sulbactam can be useful for mixed oral-anaerobic infections and some Acinetobacter isolates",
      "High-dose sulbactam strategies are specialized and usually need ID or pharmacy support"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ampicillin+sulbactam"
      },
      {
        "text": "IDSA/ATS HAP/VAP Guidelines — Kalil et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw353"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "piperacillin-tazobactam": {
    "name": "Piperacillin-Tazobactam (Pip-Tazo)",
    "class": "Antipseudomonal β-Lactam / β-Lactamase Inhibitor",
    "aliases": [
      "piperacillin-tazobactam",
      "pip-tazo",
      "pip/tazo",
      "piptazo",
      "tazocin"
    ],
    "pkpd": "Time-dependent killing. Extended infusion (3–4h) or continuous infusion optimizes %T>MIC — critical for resistant organisms.",
    "mechanism": "Piperacillin inhibits PBPs (broadest penicillin spectrum); tazobactam inhibits class A/C β-lactamases (NOT ESBL reliably).",
    "spectrum": "Broad: Pseudomonas aeruginosa, Enterobacteriaceae, anaerobes, streptococci, MSSA. NOT MRSA, CRE, ESBL (controversial), MDRAB.",
    "dose": {
      "standard": "3.375 g IV q6h; nosocomial pneumonia: 4.5 g IV q6h. Extended-infusion protocols may use equivalent q8h schedules",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": ">40",
        "regimen": "3.375 g q6h; nosocomial pneumonia: 4.5 g q6h"
      },
      {
        "crcl": "20–40",
        "regimen": "2.25 g q6h; nosocomial pneumonia: 3.375 g q6h"
      },
      {
        "crcl": "<20",
        "regimen": "2.25 g q8h; nosocomial pneumonia: 2.25 g q6h"
      },
      {
        "crcl": "HD / CAPD",
        "regimen": "HD: 2.25 g q12h; nosocomial pneumonia: 2.25 g q8h; give 0.75 g after each HD session. CAPD: 2.25 g q12h; nosocomial pneumonia: 2.25 g q8h"
      },
      {
        "crcl": "CRRT",
        "regimen": "Not covered by the official label; use institution/pharmacy dosing based on effluent flow and infusion strategy"
      }
    ],
    "sideEffects": [
      "Hypokalemia (prolonged use — potassium wasting)",
      "Thrombocytopenia / platelet dysfunction",
      "Elevated LFTs (transient)",
      "Neurotoxicity (high doses + renal failure: myoclonus, encephalopathy)",
      "Rash"
    ],
    "monitoring": [
      "K⁺ (hypokalemia risk — supplement proactively)",
      "Platelets (prolonged courses)",
      "Renal function (dose-adjust!)",
      "LFTs"
    ],
    "publicNotes": [
      "Extended or continuous infusion can improve PK/PD target attainment for higher-MIC organisms",
      "Do not rely on piperacillin-tazobactam for confirmed ESBL bacteremia when a carbapenem is indicated"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=piperacillin+tazobactam"
      },
      {
        "text": "MERINO Trial — Harris et al., JAMA 2018",
        "url": "https://doi.org/10.1001/jama.2018.12918"
      },
      {
        "text": "IDSA/ATS HAP/VAP Guidelines — Kalil et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw353"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "cefazolin": {
    "name": "Cefazolin",
    "class": "1st-Generation Cephalosporin",
    "aliases": [
      "cefazolin"
    ],
    "pkpd": "Time-dependent killing. %T>MIC ≥40%. Short half-life (1.8h) → q8h dosing required for serious infections.",
    "mechanism": "Inhibits PBPs → bactericidal. Narrower gram-negative coverage vs. later-generation cephalosporins.",
    "spectrum": "MSSA, streptococci, E. coli (susceptible), Klebsiella (susceptible), Proteus mirabilis. NOT MRSA, Pseudomonas, Enterococcus, anaerobes.",
    "dose": {
      "standard": "1–2 g IV q8h; surgical prophylaxis: 2 g IV × 1 (30 min before incision)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥55",
        "regimen": "1–2 g q8h"
      },
      {
        "crcl": "35–54",
        "regimen": "1 g q8h"
      },
      {
        "crcl": "11–34",
        "regimen": "500 mg–1 g q12h"
      },
      {
        "crcl": "≤10",
        "regimen": "500 mg q18–24h"
      },
      {
        "crcl": "HD",
        "regimen": "500 mg–1 g after each dialysis session"
      }
    ],
    "sideEffects": [
      "Rash (cross-reactivity with penicillin <1%)",
      "Injection site pain/phlebitis",
      "Diarrhoea",
      "Elevated LFTs (rare)"
    ],
    "monitoring": [
      "Renal function (dose-adjust)"
    ],
    "publicNotes": [
      "Cefazolin is often preferred over antistaphylococcal penicillins for MSSA because of better tolerability",
      "It remains a standard surgical prophylaxis agent for many routine procedures"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=cefazolin"
      },
      {
        "text": "ASHP/IDSA/SIS Surgical Prophylaxis Consensus — AJHP 2023",
        "url": "https://doi.org/10.1093/ajhp/zxad004"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "ceftriaxone": {
    "name": "Ceftriaxone",
    "class": "3rd-Generation Cephalosporin",
    "aliases": [
      "ceftriaxone"
    ],
    "pkpd": "Time-dependent killing. Long half-life (~8h) → once-daily dosing. Biliary + renal elimination — no dose adjustment for renal failure alone.",
    "mechanism": "Inhibits PBPs (high affinity for PBP2). High CNS penetration (use 2 g q12h for meningitis).",
    "spectrum": "S. pneumoniae, N. meningitidis, H. influenzae, most Enterobacteriaceae (not ESBL). NOT Pseudomonas, Enterococcus, MRSA, anaerobes, Listeria.",
    "dose": {
      "standard": "1–2 g IV/IM q24h",
      "loading": "Meningitis: 2 g IV q12h"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (biliary + renal elimination)"
      },
      {
        "crcl": "HD + liver disease",
        "regimen": "Max 2 g/day (avoid accumulation if dual organ impairment)"
      }
    ],
    "sideEffects": [
      "Biliary sludge / pseudolithiasis (especially prolonged courses — RUQ pain)",
      "Hypersensitivity/rash",
      "Diarrhoea",
      "Elevated LFTs",
      "Ceftriaxone-Ca²⁺ precipitates (do NOT co-infuse with calcium solutions)"
    ],
    "monitoring": [
      "LFTs with prolonged use (>10 days)",
      "Biliary US if RUQ pain develops"
    ],
    "publicNotes": [
      "Once-daily dosing and no renal-only dose adjustment make ceftriaxone useful when renal function is fluctuating",
      "Escalate to a carbapenem for confirmed ESBL-producing organisms"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ceftriaxone"
      },
      {
        "text": "IDSA/ATS CAP Guidelines — Mandell et al., CID 2007",
        "url": "https://doi.org/10.1086/511159"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "cefepime": {
    "name": "Cefepime",
    "class": "4th-Generation Cephalosporin",
    "aliases": [
      "cefepime"
    ],
    "pkpd": "Time-dependent killing. Better outer membrane penetration (zwitterionic structure). Adequate CNS penetration. %T>MIC ≥60–70%.",
    "mechanism": "Inhibits PBPs. Stable to AmpC β-lactamases (vs. Enterobacter, Serratia). Zwitterionic structure improves GNR penetration.",
    "spectrum": "Pseudomonas aeruginosa, AmpC-producing Enterobacteriaceae, streptococci, some Gram+. NOT MRSA, ESBL producers, Enterococcus, anaerobes.",
    "dose": {
      "standard": "2 g IV q8h (febrile neutropenia, antipseudomonal)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "2 g q8h"
      },
      {
        "crcl": "30–59",
        "regimen": "2 g q12h"
      },
      {
        "crcl": "11–29",
        "regimen": "2 g q24h"
      },
      {
        "crcl": "≤10",
        "regimen": "1 g q24h"
      },
      {
        "crcl": "HD",
        "regimen": "1 g on day 1, then 500 mg q24h; febrile neutropenia: 1 g q24h. Administer after HD"
      }
    ],
    "sideEffects": [
      "Neurotoxicity: non-convulsive status epilepticus, encephalopathy, myoclonus (especially in renal failure — most important ADR)",
      "Rash",
      "Fever",
      "Positive direct Coombs (rare haemolytic anaemia)"
    ],
    "monitoring": [
      "Renal function — STRICT dose adjustment mandatory!",
      "Mental status changes / EEG if encephalopathy develops in renal failure",
      "CBC"
    ],
    "publicNotes": [
      "Cefepime neurotoxicity is a major risk in renal impairment, so aggressive dose adjustment matters",
      "It is a reasonable option when antipseudomonal coverage is needed and cefepime susceptibility is confirmed or likely"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=cefepime"
      },
      {
        "text": "IDSA/ATS HAP/VAP Guidelines — Kalil et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw353"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "meropenem": {
    "name": "Meropenem",
    "class": "Carbapenem",
    "aliases": [
      "meropenem"
    ],
    "pkpd": "Time-dependent killing. Extended infusion (2–3h) optimizes %T>MIC for elevated-MIC organisms. NOT inactivated by renal dehydropeptidase (unlike imipenem).",
    "mechanism": "Inhibits PBPs 1a, 1b, 2 — ultra-broad bactericidal activity. Stable to most β-lactamases (NOT carbapenemases: KPC, MBL, OXA-48).",
    "spectrum": "Broadest β-lactam spectrum: most GNRs (incl. ESBL, Pseudomonas, AmpC), most Gram+, anaerobes. NOT MRSA, VRE, CRE, Stenotrophomonas.",
    "dose": {
      "standard": "1 g IV q8h (2h extended infusion)",
      "loading": "Severe / Pseudomonas / high-MIC: 2 g IV q8h extended 3h infusion"
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "1–2 g q8h"
      },
      {
        "crcl": "26–49",
        "regimen": "1 g q12h"
      },
      {
        "crcl": "10–25",
        "regimen": "500 mg q12h"
      },
      {
        "crcl": "<10",
        "regimen": "500 mg q24h"
      },
      {
        "crcl": "HD / PD",
        "regimen": "Not specified in the official label; use institution/pharmacy guidance for HD or peritoneal dialysis"
      },
      {
        "crcl": "CRRT",
        "regimen": "Not covered by the official label; use institution/pharmacy guidance based on effluent flow and infusion strategy"
      }
    ],
    "sideEffects": [
      "Seizures (lower risk than imipenem — not inactivated by renal DHP-I)",
      "GI: nausea, diarrhoea",
      "Elevated LFTs (transient)",
      "C. difficile risk",
      "Rash"
    ],
    "monitoring": [
      "Renal function (dose-adjust!)",
      "LFTs",
      "Neurological status (high doses in renal failure)"
    ],
    "publicNotes": [
      "Use extended infusion for severe infection or elevated MICs when feasible",
      "Reserve meropenem for documented or strongly suspected resistant gram-negative infections and de-escalate once cultures return"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=meropenem"
      },
      {
        "text": "IDSA/ATS HAP/VAP Guidelines — Kalil et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw353"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "ertapenem": {
    "name": "Ertapenem",
    "class": "Carbapenem (Narrow-Spectrum)",
    "aliases": [
      "ertapenem"
    ],
    "pkpd": "Time-dependent killing. Once-daily dosing (long half-life ~4h). 95% protein-bound. NOT active vs. Pseudomonas or Acinetobacter — stewardship advantage.",
    "mechanism": "Inhibits PBPs → bactericidal. Similar to meropenem but narrower Gram-negative spectrum — lacks antipseudomonal activity.",
    "spectrum": "ESBL Enterobacteriaceae, MSSA, streptococci, anaerobes. NOT Pseudomonas, Acinetobacter, Enterococcus, MRSA, Stenotrophomonas.",
    "dose": {
      "standard": "1 g IV/IM q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "1 g q24h (standard)"
      },
      {
        "crcl": "<30",
        "regimen": "500 mg q24h"
      },
      {
        "crcl": "HD",
        "regimen": "500 mg q24h; supplement 150 mg after HD on dialysis days"
      }
    ],
    "sideEffects": [
      "GI: diarrhoea, nausea (most common)",
      "Headache",
      "Seizures (lowest risk among carbapenems)",
      "Rash",
      "Phlebitis (IV site)"
    ],
    "monitoring": [
      "Renal function",
      "Clinical response"
    ],
    "publicNotes": [
      "Ertapenem is useful when ESBL coverage is needed but Pseudomonas coverage is not",
      "Its once-daily dosing makes it a practical outpatient parenteral option"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ertapenem"
      },
      {
        "text": "IDSA Intra-Abdominal Infection Guidelines — Solomkin et al., CID 2010",
        "url": "https://doi.org/10.1086/649554"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "vancomycin": {
    "name": "Vancomycin",
    "class": "Glycopeptide",
    "aliases": [
      "vancomycin"
    ],
    "pkpd": "Time-dependent (AUC/MIC). Target AUC₂₄/MIC 400–600 mg·h/L (ASHP/IDSA/SIDP 2020). Replaced trough-only monitoring. Renal elimination → strict dose-adjust.",
    "mechanism": "Binds D-Ala-D-Ala terminus of peptidoglycan precursors → inhibits transglycosylation + transpeptidation. Bactericidal for staphylococci.",
    "spectrum": "MRSA, MRSE, Enterococcus (not VRE), penicillin-resistant S. pneumoniae, C. difficile (PO only). NOT Gram-negative organisms.",
    "dose": {
      "standard": "15–20 mg/kg IV q8–12h (AUC-guided dosing)",
      "loading": "25–30 mg/kg IV loading dose for severe/life-threatening infections (meningitis, endocarditis, septic shock)"
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "15–20 mg/kg q8–12h (AUC-guided)"
      },
      {
        "crcl": "30–49",
        "regimen": "15–20 mg/kg q12–24h"
      },
      {
        "crcl": "10–29",
        "regimen": "15–20 mg/kg q24–48h (level-guided)"
      },
      {
        "crcl": "<10",
        "regimen": "Load 25 mg/kg; redose when AUC/level indicates (q48–72h)"
      },
      {
        "crcl": "HD",
        "regimen": "Load 25 mg/kg; redose when pre-HD level <15–20 mg/L"
      },
      {
        "crcl": "CRRT",
        "regimen": "15 mg/kg q24–48h (monitor levels closely)"
      }
    ],
    "sideEffects": [
      "Nephrotoxicity (dose-dependent; synergistic with aminoglycosides, NSAIDs, diuretics, contrast)",
      "Red man syndrome (rate-related histamine release — infuse over ≥60 min; NOT a true IgE allergy)",
      "Ototoxicity (rare with AUC-based dosing)",
      "Thrombocytopenia",
      "Linear IgA bullous dermatosis (rare — drug reaction)"
    ],
    "monitoring": [
      "AUC₂₄/MIC (target 400–600) — pharmacy PK service at local institution",
      "SCr and urine output q48–72h",
      "CBC weekly for prolonged courses",
      "Infusion rate: max 10 mg/min (15 mg/min for loading)"
    ],
    "publicNotes": [
      "Prefer AUC-guided monitoring over trough-only monitoring where operationally possible",
      "Use a loading dose for severe MRSA infection to reach target exposure sooner",
      "Infuse slowly to prevent rate-related red man syndrome"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=vancomycin"
      },
      {
        "text": "ASHP/IDSA/SIDP Vancomycin Monitoring Consensus — AJHP 2020",
        "url": "https://doi.org/10.1093/ajhp/zxaa036"
      },
      {
        "text": "IDSA MRSA Guidelines — Liu et al., CID 2011",
        "url": "https://doi.org/10.1093/cid/ciq146"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "grampos",
    "localNotes": []
  },
  "linezolid": {
    "name": "Linezolid",
    "class": "Oxazolidinone",
    "aliases": [
      "linezolid"
    ],
    "pkpd": "AUC/MIC-dependent. 100% oral bioavailability — switch to PO at first opportunity. No renal dose adjustment (hepatic metabolism).",
    "mechanism": "Inhibits 23S rRNA of 50S ribosomal subunit → blocks initiation complex formation (unique mechanism). Bacteriostatic for most; bactericidal for Streptococcus.",
    "spectrum": "MRSA, VRE (E. faecium + E. faecalis), MRSE. Excellent lung penetration for MRSA pneumonia. NOT Gram-negative organisms.",
    "dose": {
      "standard": "600 mg IV/PO BID (bioequivalent — switch to PO early)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (hepatic metabolism)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; administer AFTER dialysis if pre-HD (linezolid and metabolites partially removed by HD)"
      }
    ],
    "sideEffects": [
      "Myelosuppression: thrombocytopenia (most common >2 weeks), anaemia, leukopenia — dose-limiting!",
      "Serotonin syndrome (with SSRIs, SNRIs, MAOIs, meperidine, tramadol — check all medications)",
      "Peripheral neuropathy (prolonged >28 days — potentially irreversible)",
      "Optic neuropathy (prolonged >28 days — visual acuity monitoring)",
      "Lactic acidosis (rare, prolonged — mitochondrial toxicity)"
    ],
    "monitoring": [
      "CBC weekly — stop if platelets <100K or ≥50% drop",
      "Review ALL serotonergic medications before prescribing (SSRIs very common!)",
      "Visual acuity and colour vision monthly for courses >28 days",
      "LFTs"
    ],
    "publicNotes": [
      "Linezolid can be switched from IV to PO without dose change because oral bioavailability is effectively complete",
      "Always review serotonergic medications before prescribing because serotonin toxicity is a real interaction risk"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=linezolid"
      },
      {
        "text": "IDSA MRSA Guidelines — Liu et al., CID 2011",
        "url": "https://doi.org/10.1093/cid/ciq146"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "grampos",
    "localNotes": []
  },
  "daptomycin": {
    "name": "Daptomycin",
    "class": "Lipopeptide",
    "aliases": [
      "daptomycin"
    ],
    "pkpd": "Concentration-dependent (Cmax/MIC). Once-daily dosing essential. NOT for pneumonia — inactivated by pulmonary surfactant (critical failure mode).",
    "mechanism": "Inserts Ca²⁺-dependent into bacterial membrane → channel formation → rapid membrane depolarisation → bactericidal.",
    "spectrum": "MRSA, VRE, Enterococcus, S. pneumoniae. Excellent bactericidal activity vs. Gram+. NOT Gram-negative organisms. NOT for lung infections.",
    "dose": {
      "standard": "BSI/Endocarditis: 6–10 mg/kg IV q24h; Skin/SSTI: 4–6 mg/kg q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard dose q24h"
      },
      {
        "crcl": "<30",
        "regimen": "6 mg/kg q48h"
      },
      {
        "crcl": "HD / CAPD",
        "regimen": "6 mg/kg q48h; when possible administer after completion of HD on dialysis days"
      }
    ],
    "sideEffects": [
      "Myopathy / rhabdomyolysis (CK elevation — dose-dependent; most important ADR)",
      "Peripheral neuropathy (prolonged courses)",
      "Eosinophilic pneumonitis (rare — fever + new pulmonary infiltrates on daptomycin)",
      "Elevated LFTs",
      "GI: nausea, constipation"
    ],
    "monitoring": [
      "CK weekly — stop if >5× ULN with symptoms or >10× ULN regardless",
      "Hold or discontinue statins (HMG-CoA reductase inhibitors) during therapy — synergistic myotoxicity",
      "Renal function (dose-adjust for CrCl <30)"
    ],
    "publicNotes": [
      "Daptomycin should not be used for pneumonia because surfactant inactivates it",
      "Weekly CK monitoring and statin review are important because myotoxicity is a major toxicity"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=daptomycin"
      },
      {
        "text": "IDSA Infective Endocarditis Guidelines — Baddour et al., Circulation 2015",
        "url": "https://doi.org/10.1161/CIR.0000000000000296"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "grampos",
    "localNotes": []
  },
  "metronidazole": {
    "name": "Metronidazole",
    "class": "Nitroimidazole",
    "aliases": [
      "metronidazole",
      "flagyl"
    ],
    "pkpd": "Concentration-dependent (MBC/MIC). Excellent tissue penetration including CNS, abscesses, and intracellular. PO bioavailability ~100%.",
    "mechanism": "Reduced to toxic intermediates by anaerobic/microaerophilic organisms → DNA strand breakage. Active ONLY under anaerobic/microaerophilic conditions.",
    "spectrum": "Obligate anaerobes: B. fragilis, Peptostreptococcus, Fusobacterium, Prevotella, Clostridium (incl. C. difficile). Protozoa: Giardia, Trichomonas, E. histolytica.",
    "dose": {
      "standard": "500 mg PO/IV TID or 1 g IV q12h; C. difficile: 500 mg PO TID × 10d (non-severe only)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No adjustment needed (hepatic metabolism)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; metabolites may accumulate — monitor for neurotoxicity in ESRD"
      }
    ],
    "sideEffects": [
      "Disulfiram-like reaction with alcohol (avoid alcohol during + 48h after course)",
      "Metallic taste (very common — patient counselling)",
      "Nausea, abdominal discomfort",
      "Peripheral neuropathy (prolonged >4 weeks — potentially irreversible)",
      "CNS toxicity: encephalopathy, ataxia, cerebellar dysfunction (MRI: T2 signal in dentate nucleus — rare)"
    ],
    "monitoring": [
      "Duration: avoid continuous courses >4 weeks (peripheral neuropathy)",
      "Neurological symptoms in hepatic impairment (reduced clearance)",
      "Alcohol counselling mandatory"
    ],
    "publicNotes": [
      "Switch from IV to PO promptly when the patient can take enteral medication because bioavailability is excellent",
      "Avoid alcohol during therapy and for 48 hours afterward because of the disulfiram-like reaction risk"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=metronidazole"
      },
      {
        "text": "IDSA/SHEA C. difficile Guidelines — McDonald et al., CID 2018",
        "url": "https://doi.org/10.1093/cid/cix1085"
      },
      {
        "text": "IDSA Intra-Abdominal Infection Guidelines — Solomkin et al., CID 2010",
        "url": "https://doi.org/10.1086/649554"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "azithromycin": {
    "name": "Azithromycin",
    "class": "Macrolide (Azalide)",
    "aliases": [
      "azithromycin",
      "zithromax"
    ],
    "pkpd": "AUC/MIC-dependent. Long half-life ~68h → 5-day courses effective. High tissue concentration; low serum levels. Immunomodulatory effects (DAD inhibition).",
    "mechanism": "Binds 23S rRNA of 50S ribosomal subunit → inhibits translocation. Bacteriostatic. Additional anti-inflammatory/immunomodulatory effects.",
    "spectrum": "Atypicals: Mycoplasma, Chlamydia, Legionella (add to β-lactam for Legionella). Campylobacter (rising resistance). CAP pathogens: some S. pneumoniae (resistance ~30–40% regional). NOT Staph, most Gram-negatives.",
    "dose": {
      "standard": "PO: 500 mg day 1, then 250 mg days 2–5; IV: 500 mg q24h × 2–5d",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (biliary excretion)"
      }
    ],
    "sideEffects": [
      "QT prolongation (significant — check baseline QTc; AVOID with other QT-prolonging drugs)",
      "GI: nausea, diarrhoea, abdominal pain (common)",
      "Hearing loss (high doses or prolonged use)",
      "Drug interactions: warfarin (INR ↑), digoxin, CYP3A4 substrates"
    ],
    "monitoring": [
      "QTc before therapy (especially with cardiac disease, other QT drugs)",
      "Drug interactions review",
      "Hearing (prolonged courses)"
    ],
    "publicNotes": [
      "Azithromycin is usually best used for atypical coverage rather than broad monotherapy in serious CAP",
      "Check baseline QT risk and interacting medications before use"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=azithromycin"
      },
      {
        "text": "IDSA/ATS CAP Guidelines — Mandell et al., CID 2007",
        "url": "https://doi.org/10.1086/511159"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "doxycycline": {
    "name": "Doxycycline",
    "class": "Tetracycline",
    "aliases": [
      "doxycycline"
    ],
    "pkpd": "AUC/MIC-dependent. PO bioavailability ~93% — excellent oral option. Penetrates intracellularly and into most tissue compartments.",
    "mechanism": "Binds 30S ribosomal subunit → inhibits aminoacyl-tRNA binding → bacteriostatic.",
    "spectrum": "Atypicals: Mycoplasma, Chlamydia, Rickettsia, Leptospira, Borrelia. CA-MRSA SSTI (alternative). Some Acinetobacter (combination). NOT reliable GNRs, Streptococcus (in regional — resistance).",
    "dose": {
      "standard": "100 mg PO/IV BID (loading: 200 mg PO day 1)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No adjustment needed (fecal/biliary elimination)"
      }
    ],
    "sideEffects": [
      "Photosensitivity (sunscreen mandatory — burn risk even through cloud cover)",
      "Oesophageal ulceration (take with full glass of water; remain upright 30 min — counselling essential)",
      "GI: nausea, vomiting",
      "Teratogenicity / tooth discoloration (contraindicated in pregnancy and children <8 years)"
    ],
    "monitoring": [
      "Photosensitivity precautions",
      "Ensure patient remains upright 30 min after taking (prevent oesophageal damage)"
    ],
    "publicNotes": [
      "Doxycycline is a strong oral option for atypical pathogens and several tick-borne or zoonotic infections",
      "Take with water and stay upright afterward to reduce esophageal injury risk"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=doxycycline"
      },
      {
        "text": "IDSA SSTI Guidelines — Stevens et al., CID 2014",
        "url": "https://doi.org/10.1093/cid/ciu296"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "levofloxacin": {
    "name": "Levofloxacin",
    "class": "Fluoroquinolone (Respiratory)",
    "aliases": [
      "levofloxacin"
    ],
    "pkpd": "Concentration-dependent (AUC/MIC + Cmax/MIC). PO bioavailability ~99% → IV/PO bioequivalent (switch early). AUC/MIC target ≥125 for S. pneumoniae.",
    "mechanism": "Inhibits DNA gyrase (GyrA/B) and topoisomerase IV (ParC/E) → DNA strand breaks. Bactericidal.",
    "spectrum": "\"Respiratory FQ\": S. pneumoniae (resistant strains), H. influenzae, Legionella, Mycoplasma, Chlamydia, E. coli (susceptible). NOT reliable MRSA or Pseudomonas at standard doses.",
    "dose": {
      "standard": "750 mg PO/IV q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "750 mg q24h"
      },
      {
        "crcl": "20–49",
        "regimen": "750 mg q48h"
      },
      {
        "crcl": "10–19",
        "regimen": "750 mg ×1, then 500 mg q48h"
      },
      {
        "crcl": "HD / CAPD",
        "regimen": "750 mg ×1, then 500 mg q48h; give after HD on dialysis days"
      }
    ],
    "sideEffects": [
      "QT prolongation (baseline ECG; avoid with other QT-prolongers — list is long)",
      "Tendinopathy/tendon rupture (Achilles most common; elderly + steroids + CKD: high risk — STOP immediately if tendon pain)",
      "CNS: seizures, headache, dizziness (lower seizure threshold — caution in epilepsy)",
      "Peripheral neuropathy (prolonged courses — potentially permanent)",
      "Dysglycemia (hypo or hyperglycemia — especially in diabetics)"
    ],
    "monitoring": [
      "QTc before and during therapy",
      "Tendon pain assessment at each visit",
      "Blood glucose (diabetics)",
      "Neurological symptoms"
    ],
    "publicNotes": [
      "Levofloxacin is best reserved for situations where its broad spectrum and oral bioavailability meaningfully change management",
      "Fluoroquinolone tendon, QT, CNS, and dysglycemia risks should be reviewed before prescribing"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=levofloxacin"
      },
      {
        "text": "IDSA/ATS CAP Guidelines — Mandell et al., CID 2007",
        "url": "https://doi.org/10.1086/511159"
      },
      {
        "text": "FDA Fluoroquinolone Safety Communication (2016)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-updates-warnings-fluoroquinolone-antibiotics"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "quinolone",
    "localNotes": []
  },
  "ciprofloxacin": {
    "name": "Ciprofloxacin",
    "class": "Fluoroquinolone (Antipseudomonal)",
    "aliases": [
      "ciprofloxacin",
      "cipro"
    ],
    "pkpd": "Concentration-dependent (AUC/MIC). Best GNR FQ activity. PO bioavailability ~70–80% (reasonable for oral antipseudomonal therapy).",
    "mechanism": "Inhibits DNA gyrase and topoisomerase IV → bactericidal. Best among FQs for Gram-negative organisms.",
    "spectrum": "GNRs: Pseudomonas aeruginosa (oral option), E. coli, Salmonella, Shigella, Campylobacter, Haemophilus. Weak S. pneumoniae coverage (NOT for respiratory infections).",
    "dose": {
      "standard": "500–750 mg PO BID or 400 mg IV q8–12h (Pseudomonas: 750 mg PO BID or 400 mg IV q8h)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard dose"
      },
      {
        "crcl": "<30",
        "regimen": "250–500 mg PO q18–24h or 200–400 mg IV q18–24h"
      },
      {
        "crcl": "HD",
        "regimen": "250–500 mg q24h; administer after dialysis"
      }
    ],
    "sideEffects": [
      "QT prolongation",
      "Tendinopathy / Achilles rupture",
      "CNS: seizures, encephalopathy (less than levofloxacin)",
      "C. difficile",
      "Drug interactions: warfarin (INR ↑), theophylline, divalent cations reduce oral absorption"
    ],
    "monitoring": [
      "QTc",
      "Take on empty stomach (divalent cations — Ca²⁺, Mg²⁺, Fe²⁺, Al³⁺ — reduce absorption; separate antacids/milk/supplements by 2h)",
      "Drug interactions"
    ],
    "publicNotes": [
      "Ciprofloxacin is mainly useful for gram-negative and antipseudomonal coverage, not for pneumococcal respiratory infection",
      "Separate oral dosing from polyvalent cations because they markedly reduce absorption"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ciprofloxacin"
      },
      {
        "text": "IDSA UTI Guidelines — Gupta et al., CID 2011",
        "url": "https://doi.org/10.1093/cid/ciq257"
      },
      {
        "text": "FDA Fluoroquinolone Safety Communication (2016)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-updates-warnings-fluoroquinolone-antibiotics"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "quinolone",
    "localNotes": []
  },
  "tmp-smx": {
    "name": "TMP-SMX (Co-trimoxazole / Bactrim)",
    "class": "Dihydrofolate Reductase + DHPS Inhibitor",
    "aliases": [
      "tmp-smx",
      "trimethoprim-sulfamethoxazole",
      "co-trimoxazole",
      "bactrim",
      "septrin"
    ],
    "pkpd": "AUC/MIC-dependent. Synergistic sequential folate pathway blockade. Excellent oral bioavailability (~90%).",
    "mechanism": "Sulfamethoxazole inhibits DHPS; trimethoprim inhibits DHFR → sequential double-blockade of folate synthesis → bactericidal synergy.",
    "spectrum": "CA-MRSA SSTI, PJP (high-dose), Stenotrophomonas maltophilia (drug of choice), Nocardia, Toxoplasma (prophylaxis/treatment), Listeria. Susceptible Enterobacteriaceae for UTI (if MIC confirms).",
    "dose": {
      "standard": "DS tablet (160/800 mg TMP/SMX) PO BID for UTI/SSTI; PJP treatment: 15–20 mg/kg TMP/day IV/PO in 3–4 divided doses × 21d",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard dose"
      },
      {
        "crcl": "15–29",
        "regimen": "50% of standard dose"
      },
      {
        "crcl": "<15",
        "regimen": "Use not recommended by the official label; if essential (for example severe PJP), use individualized specialist/pharmacy dosing with close monitoring"
      },
      {
        "crcl": "HD",
        "regimen": "Label does not support routine standard dosing; use individualized post-HD dosing with close monitoring if therapy is essential"
      }
    ],
    "sideEffects": [
      "Hyperkalemia (TMP inhibits distal tubular K⁺ secretion — significant with ACEi/ARB/K⁺-sparing diuretics, CKD, elderly)",
      "Pseudo-nephrotoxicity: SCr rises without true GFR change (TMP blocks creatinine secretion — check cystatin C if uncertain)",
      "Bone marrow suppression (folate-depleted patients — leucovorin supplement for high-dose PJP)",
      "SJS/TEN (sulfonamide component — rare but life-threatening; discontinue immediately if rash)",
      "G6PD haemolysis (sulfonamide — check G6PD status)"
    ],
    "monitoring": [
      "K⁺ especially with ACEi/ARB, CKD, or elderly patients",
      "SCr (may rise without true renal damage)",
      "CBC (prolonged courses or folate-deficient patients)",
      "G6PD status before initiation"
    ],
    "publicNotes": [
      "TMP-SMX is an important option for PJP and Stenotrophomonas and can also cover susceptible CA-MRSA SSTI",
      "Watch for hyperkalemia and creatinine rise, especially in CKD or with RAAS blockers"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=trimethoprim+sulfamethoxazole"
      },
      {
        "text": "IDSA UTI Guidelines — Gupta et al., CID 2011",
        "url": "https://doi.org/10.1093/cid/ciq257"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "ganciclovir": {
    "name": "Ganciclovir",
    "class": "Antiviral — Anti-CMV",
    "aliases": [
      "ganciclovir",
      "cymevene"
    ],
    "pkpd": "Time-dependent intracellular antiviral effect after phosphorylation. Predominantly renal clearance. Exposure rises quickly as renal function worsens, so dose adjustment matters early.",
    "mechanism": "Guanylate analogue phosphorylated by CMV UL97 kinase, then inhibits viral DNA polymerase UL54 and terminates viral DNA elongation.",
    "spectrum": "CMV treatment and prophylaxis. Active against HSV and VZV with less routine use than acyclovir-family agents. No bacterial coverage.",
    "dose": {
      "standard": "Induction: 5 mg/kg IV q12h; maintenance: 5 mg/kg IV q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥70",
        "regimen": "5 mg/kg q12h induction; 5 mg/kg q24h maintenance"
      },
      {
        "crcl": "50–69",
        "regimen": "2.5 mg/kg q12h induction; 2.5 mg/kg q24h maintenance"
      },
      {
        "crcl": "25–49",
        "regimen": "2.5 mg/kg q24h induction; 1.25 mg/kg q24h maintenance"
      },
      {
        "crcl": "10–24",
        "regimen": "1.25 mg/kg q24h induction; 0.625 mg/kg q24h maintenance"
      },
      {
        "crcl": "HD",
        "regimen": "Specialist/pharmacy-guided post-HD dosing only"
      }
    ],
    "sideEffects": [
      "Neutropenia and leukopenia (dose-limiting, common)",
      "Thrombocytopenia and anaemia",
      "AKI if overdosed in renal impairment",
      "GI upset, fever, rash",
      "CNS effects: headache, confusion, seizures (uncommon)"
    ],
    "monitoring": [
      "CBC with differential at least twice weekly during induction",
      "Renal function and urine output",
      "Review concurrent marrow-suppressive drugs (mycophenolate, TMP-SMX, valganciclovir, chemotherapy)"
    ],
    "publicNotes": [
      "Renal adjustment is essential because toxicity increases rapidly when kidney function declines",
      "ANC and platelet trends are often the deciding factor in whether therapy can continue"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ganciclovir"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antiviral",
    "localNotes": []
  },
  "enoxaparin": {
    "name": "Enoxaparin (Lovenox)",
    "class": "Anticoagulant — LMWH",
    "aliases": [
      "enoxaparin",
      "lovenox",
      "clexane"
    ],
    "pkpd": "Anti-factor Xa predominant activity with more predictable SC absorption than unfractionated heparin. Renally cleared, so accumulation occurs in advanced CKD.",
    "mechanism": "Low-molecular-weight heparin potentiates antithrombin, predominantly inhibiting factor Xa with less thrombin inhibition than unfractionated heparin.",
    "spectrum": "Treatment and prophylaxis of venous thromboembolism, ACS adjunct anticoagulation, bridging anticoagulation in selected patients.",
    "dose": {
      "standard": "Treatment: 1 mg/kg SC q12h or 1.5 mg/kg SC q24h; prophylaxis: 40 mg SC q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Treatment: 1 mg/kg q12h; prophylaxis: 40 mg q24h"
      },
      {
        "crcl": "<30",
        "regimen": "Treatment: 1 mg/kg q24h; prophylaxis: 20–30 mg q24h per local protocol"
      },
      {
        "crcl": "HD",
        "regimen": "Generally avoid routine therapeutic use without specialist guidance; consider UFH instead"
      }
    ],
    "sideEffects": [
      "Bleeding",
      "Injection site hematoma",
      "HIT (less common than UFH but still possible)",
      "Drug accumulation in renal impairment with supratherapeutic anti-Xa levels",
      "Hyperkalemia (rare, hypoaldosteronism effect)"
    ],
    "monitoring": [
      "CBC and platelet trend",
      "Bleeding assessment",
      "Renal function",
      "Anti-Xa level in severe renal impairment, obesity, pregnancy, or prolonged therapy when clinically needed"
    ],
    "publicNotes": [
      "Renal impairment and thrombocytopenia are the two highest-yield safety checks before continuing enoxaparin",
      "If HIT is a concern, do not rely on platelet count alone; review timing and thrombosis pattern"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=enoxaparin"
      }
    ],
    "category": "anticoagulant",
    "localNotes": []
  },
  "metformin": {
    "name": "Metformin",
    "class": "Biguanide",
    "aliases": [
      "metformin",
      "glucophage"
    ],
    "pkpd": "Primarily renal elimination unchanged. No hypoglycemia by itself, but exposure rises in CKD and acute illness. Tissue accumulation matters more than serum peak effect.",
    "mechanism": "Reduces hepatic gluconeogenesis, improves peripheral insulin sensitivity, and modestly reduces intestinal glucose absorption. Activates AMPK-related metabolic pathways.",
    "spectrum": "First-line glucose-lowering therapy for type 2 diabetes when kidney function and acute illness context permit.",
    "dose": {
      "standard": "500–1000 mg PO BID with meals (typical max 2000 mg/day)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥45",
        "regimen": "Standard dosing generally acceptable"
      },
      {
        "crcl": "30–44",
        "regimen": "Reduce total daily dose and reassess risk-benefit frequently; avoid new starts"
      },
      {
        "crcl": "<30",
        "regimen": "Contraindicated"
      },
      {
        "crcl": "Acute sepsis / hypoxia / acidosis / contrast exposure",
        "regimen": "Temporarily hold regardless of chronic baseline eGFR until the acute trigger resolves"
      }
    ],
    "sideEffects": [
      "GI upset and diarrhea",
      "Vitamin B12 deficiency with long-term use",
      "Lactic acidosis risk in severe renal dysfunction or major acute illness (rare but high-stakes)",
      "Weight-neutral to modest weight loss"
    ],
    "monitoring": [
      "Renal function",
      "Acid-base status during acute illness",
      "Vitamin B12 periodically in long-term therapy",
      "Review for sepsis, hypoxia, shock, liver failure, or contrast exposure before restarting"
    ],
    "publicNotes": [
      "The important metformin question in the hospital is often not the chronic eGFR threshold but whether the patient is acutely septic, hypoxic, or acidotic",
      "Temporary holds around contrast and major acute illness are common"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=metformin"
      }
    ],
    "category": "metabolic",
    "localNotes": []
  },
  "fluconazole": {
    "name": "Fluconazole",
    "class": "Triazole Antifungal",
    "aliases": [
      "fluconazole",
      "diflucan"
    ],
    "pkpd": "AUC/MIC-dependent. Oral bioavailability >90% (bioequivalent IV/PO). Long half-life ~30h → once-daily dosing. Good CNS, urine, peritoneal penetration.",
    "mechanism": "Inhibits CYP51 (lanosterol 14α-demethylase) → blocks ergosterol synthesis → cell membrane disruption → fungistatic.",
    "spectrum": "Candida albicans, C. tropicalis, C. parapsilosis. NOT C. krusei (intrinsic resistance), C. glabrata (variable/resistant), Aspergillus, Mucorales.",
    "dose": {
      "standard": "Candidemia: 800 mg IV/PO loading, then 400 mg q24h; Mucosal: 100–200 mg q24h × 7–14d",
      "loading": "800 mg loading dose for invasive candidiasis"
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "Standard dose"
      },
      {
        "crcl": "<50",
        "regimen": "50% of standard dose (single dose for vaginal candidiasis: no adjustment)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose after each dialysis session (dialysable)"
      }
    ],
    "sideEffects": [
      "QT prolongation (avoid with other QT-prolonging drugs)",
      "Drug interactions: major CYP2C9/CYP3A4 inhibitor — warfarin (INR ↑↑), calcineurin inhibitors (tacrolimus ×2–3, cyclosporin), statins, many others",
      "GI: nausea, abdominal discomfort",
      "Hepatotoxicity (rare, transient LFT elevation)",
      "Rash (cross-reaction with other azoles — uncommon)"
    ],
    "monitoring": [
      "Drug interactions — CRITICAL in transplant patients (tacrolimus levels)",
      "QTc baseline",
      "LFTs (prolonged courses)",
      "Confirm species ID and susceptibility before initiating (C. glabrata/krusei → use echinocandin)"
    ],
    "publicNotes": [
      "Fluconazole is a good IV-to-PO step-down agent when the Candida species is confirmed susceptible",
      "Renal dose adjustment and interaction review are both essential for longer courses"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=fluconazole"
      },
      {
        "text": "IDSA Candida Guidelines — Pappas et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/civ933"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antifungal",
    "localNotes": []
  },
  "voriconazole": {
    "name": "Voriconazole",
    "class": "Second-Generation Triazole Antifungal",
    "aliases": [
      "voriconazole",
      "vfend"
    ],
    "pkpd": "AUC/MIC-dependent. Nonlinear (saturable) PK — small dose changes → large level changes. TDM mandatory for serious infections. Target trough 1–5.5 mg/L.",
    "mechanism": "Inhibits CYP51 (ergosterol synthesis) — broader spectrum vs. fluconazole via higher affinity for fungal CYP51.",
    "spectrum": "Drug of choice for invasive aspergillosis. Most Candida species (incl. C. krusei, C. glabrata). NOT Mucorales (critical — voriconazole failure risk in mucormycosis).",
    "dose": {
      "standard": "IV: 6 mg/kg q12h ×2 (loading), then 4 mg/kg q12h; PO: 400 mg BID loading, then 200–300 mg BID",
      "loading": "6 mg/kg IV q12h ×2 doses (loading)"
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "IV or PO — standard dose"
      },
      {
        "crcl": "<50",
        "regimen": "PO preferred; avoid IV unless benefit outweighs risk because SBECD accumulates in renal impairment"
      },
      {
        "crcl": "HD",
        "regimen": "PO preferred. Voriconazole and SBECD are hemodialyzed, but a routine dose adjustment is not required; administer using specialist/pharmacy guidance"
      }
    ],
    "sideEffects": [
      "Visual disturbances (~30%): photopsia (flashing lights), altered colour perception, blurred vision — usually reversible, warn patient",
      "Hepatotoxicity (LFT elevation — monitor weekly)",
      "Photosensitivity → squamous cell carcinoma risk (prolonged use)",
      "Encephalopathy / hallucinations (check trough — toxicity if >5.5 mg/L)",
      "QT prolongation",
      "Major drug interactions: CYP2C19/2C9/3A4 inhibitor (tacrolimus — reduce dose 66%; sirolimus — CONTRAINDICATED; warfarin; statins; many others)"
    ],
    "monitoring": [
      "Trough levels (target 1–5.5 mg/L; toxicity >5.5) — via pharmacy PK service at local institution",
      "LFTs weekly initially",
      "Visual acuity and colour vision (patient to report any changes immediately)",
      "Drug interactions: reduce tacrolimus dose 66%; sirolimus CONTRAINDICATED (hold before starting)",
      "CYP2C19 genotype ideally (poor metabolizers common in Asians ~15–25% — 4× higher levels)"
    ],
    "publicNotes": [
      "Voriconazole is first-line for invasive aspergillosis but should not be relied on for mucormycosis",
      "Therapeutic drug monitoring and interaction review are central to safe use"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=voriconazole"
      },
      {
        "text": "IDSA Aspergillosis Guidelines — Patterson et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw326"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antifungal",
    "localNotes": []
  },
  "caspofungin": {
    "name": "Caspofungin",
    "class": "Echinocandin Antifungal",
    "aliases": [
      "caspofungin",
      "cancidas"
    ],
    "pkpd": "Concentration-dependent. AUC/MIC target. Highly protein-bound (97%). Poor CNS penetration and urinary tract distribution — not for cryptococcal meningitis or urinary candidiasis.",
    "mechanism": "Non-competitive inhibitor of β-(1,3)-D-glucan synthase → disrupts fungal cell wall synthesis. Fungicidal vs. Candida; fungistatic vs. Aspergillus.",
    "spectrum": "All Candida species (incl. C. krusei, C. glabrata — inherently echinocandin-susceptible). Aspergillus (salvage/combination). NOT Cryptococcus, Mucorales, Fusarium, Trichosporon.",
    "dose": {
      "standard": "70 mg IV day 1 (loading), then 50 mg IV q24h; Hepatic impairment (Child-Pugh B): 35 mg q24h",
      "loading": "70 mg IV loading dose"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not significantly cleared by dialysis"
      }
    ],
    "sideEffects": [
      "Elevated LFTs (mild, transient — usually clinically insignificant)",
      "Histamine-related infusion reactions (rare: flushing, facial swelling)",
      "Hypokalemia",
      "GI: nausea, vomiting",
      "Rash",
      "Drug interactions: rifampin/phenytoin/carbamazepine → increase caspofungin to 70 mg maintenance; tacrolimus level may drop slightly"
    ],
    "monitoring": [
      "LFTs weekly",
      "K⁺",
      "Drug interactions (immunosuppressants, enzyme inducers)"
    ],
    "publicNotes": [
      "Caspofungin is a strong first-line option for candidemia and other invasive candidiasis",
      "Once the organism is identified and susceptible, step-down to fluconazole may be appropriate"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=caspofungin"
      },
      {
        "text": "IDSA Candida Guidelines — Pappas et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/civ933"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antifungal",
    "localNotes": []
  },
  "amphotericin-b": {
    "name": "Amphotericin B (Liposomal)",
    "class": "Polyene Antifungal",
    "aliases": [
      "amphotericin b",
      "amphotericin",
      "ambisome",
      "liposomal amphotericin",
      "amphotericin-b"
    ],
    "pkpd": "Concentration-dependent. Rapid post-antifungal effect. Tissue distribution highly variable. Liposomal: preferentially accumulated in RES (liver, spleen) with reduced kidney deposition.",
    "mechanism": "Binds ergosterol in fungal membrane → forms ion channels → membrane depolarization and leakage → fungicidal.",
    "spectrum": "Broadest antifungal spectrum: ALL Candida species, Aspergillus, Cryptococcus (drug of choice + 5-FC for meningitis), Mucorales (drug of choice for mucormycosis), Histoplasma, Coccidioides.",
    "dose": {
      "standard": "Liposomal (AmBisome): 3–5 mg/kg IV q24h; Mucormycosis: 5–10 mg/kg q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Liposomal: standard dose with close monitoring"
      },
      {
        "crcl": "<30",
        "regimen": "Liposomal preferred (much less nephrotoxic than conventional). Reduce dose if SCr rising significantly."
      },
      {
        "crcl": "HD",
        "regimen": "Liposomal: standard dose (not cleared by dialysis). Electrolyte replacement critical."
      }
    ],
    "sideEffects": [
      "Nephrotoxicity (liposomal << conventional; dose-dependent; hydrate with 500 mL NS before each dose)",
      "Infusion reactions: fever, rigors, hypotension (premedicate: paracetamol 650 mg + hydrocortisone 50 mg ± diphenhydramine 25 mg 30 min before)",
      "Hypokalemia and hypomagnesemia (aggressive daily supplementation essential)",
      "Anaemia (erythropoietin suppression — transfusion may be needed)",
      "Hepatotoxicity (rare)"
    ],
    "monitoring": [
      "SCr and urine output daily during initiation (can plateau with liposomal)",
      "K⁺ and Mg²⁺ daily — replace aggressively (K⁺ 40–80 mEq/day supplementation often needed)",
      "CBC weekly",
      "Pre-hydration with 500 mL NS before each dose — reduces nephrotoxicity with conventional form"
    ],
    "publicNotes": [
      "Liposomal amphotericin is preferred over conventional formulations when nephrotoxicity is a concern",
      "Electrolyte replacement and renal monitoring need to be planned from the start of therapy"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amphotericin+b"
      },
      {
        "text": "IDSA Candida Guidelines — Pappas et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/civ933"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antifungal",
    "localNotes": []
  },
  "ampicillin": {
    "name": "Ampicillin",
    "class": "Aminopenicillin (IV)",
    "aliases": [
      "ampicillin"
    ],
    "pkpd": "Time-dependent killing. %T>MIC ≥40%. Short half-life (1–1.5h) → q4–6h dosing. Biliary and renal elimination.",
    "mechanism": "Inhibits PBPs → disrupts peptidoglycan cross-linking → bactericidal for susceptible organisms.",
    "spectrum": "Enterococcus faecalis (not E. faecium), Listeria monocytogenes, streptococci, some oral anaerobes, susceptible Enterobacteriaceae. NOT Staphylococcus, ESBL producers, Klebsiella, Pseudomonas.",
    "dose": {
      "standard": "1–2 g IV q4–6h; Listeria/enterococcal endocarditis: 2 g IV q4h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard dose"
      },
      {
        "crcl": "10–29",
        "regimen": "q8–12h"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "q12h; supplement after dialysis"
      }
    ],
    "sideEffects": [
      "Rash (especially with concurrent EBV — up to 90%)",
      "Diarrhoea",
      "Drug fever",
      "C. difficile",
      "Elevated LFTs (transient)"
    ],
    "monitoring": [
      "Clinical response",
      "Rash surveillance"
    ],
    "publicNotes": [
      "Ampicillin remains a key IV agent for susceptible Enterococcus and Listeria infections",
      "Remember that cephalosporins do not cover Listeria, so ampicillin matters when that diagnosis is on the table"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ampicillin"
      },
      {
        "text": "IDSA Infective Endocarditis Guidelines — Baddour et al., Circulation 2015",
        "url": "https://doi.org/10.1161/CIR.0000000000000296"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "ceftazidime": {
    "name": "Ceftazidime",
    "class": "3rd-Generation Cephalosporin (Antipseudomonal)",
    "aliases": [
      "ceftazidime",
      "fortum"
    ],
    "pkpd": "Time-dependent killing. %T>MIC ≥50–70%. Antipseudomonal activity distinguishes it from ceftriaxone. Minimal protein binding → good CNS penetration.",
    "mechanism": "Inhibits PBPs (high affinity for PBP3 of Pseudomonas). Stable to many β-lactamases but NOT AmpC inducers or ESBL.",
    "spectrum": "Pseudomonas aeruginosa, most Enterobacteriaceae (not ESBL/AmpC-inducible). Weak Gram+ activity. NOT MRSA, Enterococcus, anaerobes.",
    "dose": {
      "standard": "2 g IV q8h; meningitis/life-threatening: 2 g IV q8h (same dose)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "2 g q8h"
      },
      {
        "crcl": "31–50",
        "regimen": "2 g q12h"
      },
      {
        "crcl": "16–30",
        "regimen": "2 g q24h"
      },
      {
        "crcl": "6–15",
        "regimen": "1 g q24h"
      },
      {
        "crcl": "≤5 / HD",
        "regimen": "500 mg q24h; supplement after HD"
      }
    ],
    "sideEffects": [
      "Rash (low cross-reactivity with penicillin)",
      "Diarrhoea",
      "Elevated LFTs (transient)",
      "Injection site reactions",
      "Seizures (very high doses in renal failure)"
    ],
    "monitoring": [
      "Renal function (strict dose adjustment)",
      "Clinical response"
    ],
    "publicNotes": [
      "Ceftazidime remains useful when CNS-penetrating antipseudomonal coverage is needed",
      "Avoid overusing it for AmpC-prone organisms when cefepime or a carbapenem is a better fit"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ceftazidime"
      },
      {
        "text": "IDSA/ATS HAP/VAP Guidelines — Kalil et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/ciw353"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "ceftazidime-avibactam": {
    "name": "Ceftazidime-Avibactam (Avycaz)",
    "class": "Antipseudomonal Cephalosporin + β-Lactamase Inhibitor",
    "aliases": [
      "ceftazidime-avibactam",
      "avycaz",
      "caz-avi"
    ],
    "pkpd": "Time-dependent (ceftazidime component). Avibactam restores activity by inhibiting KPC, OXA-48, AmpC, ESBL (NOT MBL/NDM). Target %T>MIC ≥50%.",
    "mechanism": "Ceftazidime inhibits PBPs; avibactam covalently (reversibly) inhibits class A, C, and some D β-lactamases — key advantage over older BL/BLI combinations.",
    "spectrum": "KPC-producing CRE, ESBL Enterobacteriaceae, AmpC inducers, Pseudomonas aeruginosa (including some MDR). NOT MBL-producing organisms (NDM, VIM, IMP).",
    "dose": {
      "standard": "2.5 g (ceftazidime 2g + avibactam 0.5g) IV q8h (2h infusion)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥51",
        "regimen": "2.5 g q8h (2h infusion)"
      },
      {
        "crcl": "31–50",
        "regimen": "1.25 g q8h"
      },
      {
        "crcl": "16–30",
        "regimen": "0.94 g q12h"
      },
      {
        "crcl": "6–15",
        "regimen": "0.94 g q24h"
      },
      {
        "crcl": "≤5 / HD",
        "regimen": "0.94 g q48h; dose after HD"
      }
    ],
    "sideEffects": [
      "GI: nausea, vomiting, diarrhoea",
      "Elevated LFTs",
      "Rash",
      "C. difficile",
      "Neurotoxicity (high doses/renal failure — similar to cefepime)"
    ],
    "monitoring": [
      "Renal function — CRITICAL (strict dose adjustment to prevent neurotoxicity)",
      "Culture susceptibility (KPC vs. MBL — caz-avi NOT effective for MBL/NDM!)",
      "LFTs"
    ],
    "publicNotes": [
      "Ceftazidime-avibactam is useful for KPC and some OXA-48 producers but not metallo-beta-lactamases like NDM",
      "Carbapenemase typing matters before use"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ceftazidime+avibactam"
      },
      {
        "text": "IDSA Guidance on Resistant Gram-Negatives — Tamma et al., CID 2023",
        "url": "https://doi.org/10.1093/cid/ciad428"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "cefuroxime": {
    "name": "Cefuroxime",
    "class": "2nd-Generation Cephalosporin",
    "aliases": [
      "cefuroxime",
      "zinnat",
      "zinacef"
    ],
    "pkpd": "Time-dependent killing. %T>MIC ≥40%. Oral form (axetil prodrug) ~52% bioavailability — take with food to improve absorption. IV form widely available.",
    "mechanism": "Inhibits PBPs → bactericidal. Broader Gram-negative coverage than 1st-generation; some β-lactamase stability.",
    "spectrum": "MSSA, streptococci, H. influenzae (incl. β-lactamase producers), M. catarrhalis, community Enterobacteriaceae. NOT MRSA, Pseudomonas, Enterococcus, anaerobes, ESBL.",
    "dose": {
      "standard": "PO: 500 mg BID × 5–10d (with food); IV: 750 mg–1.5 g q8h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥20",
        "regimen": "Standard dose"
      },
      {
        "crcl": "10–19",
        "regimen": "750 mg IV q12h; PO 250 mg BID"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "750 mg IV q24h; dose after dialysis"
      }
    ],
    "sideEffects": [
      "GI: diarrhoea, nausea (axetil prodrug has bitter taste)",
      "Rash",
      "Elevated LFTs (transient)",
      "C. difficile (low risk)"
    ],
    "monitoring": [
      "Clinical response",
      "Take oral form with food (significantly improves absorption)"
    ],
    "publicNotes": [
      "Oral cefuroxime should be taken with food to improve absorption",
      "It can be a reasonable oral step-down agent when H. influenzae coverage is needed"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=cefuroxime"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "betalactam",
    "localNotes": []
  },
  "gentamicin": {
    "name": "Gentamicin",
    "class": "Aminoglycoside",
    "aliases": [
      "gentamicin",
      "gentamycin"
    ],
    "pkpd": "Concentration-dependent (Cmax/MIC target ≥8–10×MIC) + prolonged post-antibiotic effect. Once-daily extended-interval dosing preferred (maximizes Cmax, exploits PAE, reduces nephrotoxicity).",
    "mechanism": "Binds 30S ribosomal subunit → mistranslation + bactericidal (irreversible membrane damage). Requires aerobic conditions — NOT active vs. anaerobes or in acidic/anaerobic abscesses.",
    "spectrum": "Most Gram-negative rods (Enterobacteriaceae, Pseudomonas). Synergy with cell-wall-active agents (ampicillin + gentamicin for enterococcal endocarditis). NOT reliable alone for Streptococcus or Staphylococcus.",
    "dose": {
      "standard": "Extended-interval: 5–7 mg/kg IV q24h (Hartford nomogram); Synergy: 1 mg/kg IV q8h",
      "loading": "5–7 mg/kg IV (single loading dose for extended-interval)"
    },
    "renalAdj": [
      {
        "crcl": "Normal or mildly reduced renal function",
        "regimen": "Use institutional extended-interval or traditional dosing protocol with serum-level monitoring rather than a fixed one-line schedule"
      },
      {
        "crcl": "Moderate-to-severe renal impairment",
        "regimen": "Individualize dose and interval with pharmacy/TDM guidance; official labeling uses reduced-dose or prolonged-interval approaches based on renal function"
      },
      {
        "crcl": "HD / CRRT",
        "regimen": "Modality-specific, post-dialysis or level-guided dosing only; do not rely on a single empiric regimen across dialysis strategies"
      }
    ],
    "sideEffects": [
      "Nephrotoxicity (dose- and duration-dependent; potentiated by vancomycin, NSAIDs, contrast — avoid combinations)",
      "Ototoxicity: cochlear (irreversible high-frequency hearing loss) + vestibular (ataxia, oscillopsia)",
      "Neuromuscular blockade (rare — myasthenia gravis patients: use with caution)"
    ],
    "monitoring": [
      "Extended-interval: 6–14h post-dose random level (Hartford nomogram) or peak/trough per protocol",
      "Renal function (SCr, urine output) every 48–72h",
      "Audiogram for prolonged courses (>5 days)",
      "Signs of vestibular toxicity (gait, nausea)"
    ],
    "publicNotes": [
      "Extended-interval dosing is usually preferred for gentamicin when clinically appropriate",
      "Use level-guided dosing and watch renal and vestibular toxicity closely"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=gentamicin"
      },
      {
        "text": "Aminoglycoside TDM — Nicolau et al., Antimicrob Agents Chemother 1995",
        "url": "https://doi.org/10.1128/AAC.39.3.650"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "amikacin": {
    "name": "Amikacin",
    "class": "Aminoglycoside (Broad-Spectrum)",
    "aliases": [
      "amikacin"
    ],
    "pkpd": "Concentration-dependent (Cmax/MIC). More stable to aminoglycoside-modifying enzymes than gentamicin → active against many gentamicin-resistant GNRs. Once-daily preferred.",
    "mechanism": "Binds 30S ribosomal subunit → bactericidal. Chemical modifications protect from most aminoglycoside-inactivating enzymes (acetyltransferases, nucleotidyltransferases).",
    "spectrum": "Broad GNR coverage including many MDR strains: Pseudomonas, Acinetobacter, gentamicin-resistant Enterobacteriaceae. Used in combination for XDR organisms. NOT anaerobes.",
    "dose": {
      "standard": "15–20 mg/kg IV q24h (once-daily extended-interval); peak target 56–64 mg/L",
      "loading": "20 mg/kg IV single loading dose"
    },
    "renalAdj": [
      {
        "crcl": "Normal or mildly reduced renal function",
        "regimen": "Use institutional dosing with peak/trough monitoring; official labeling uses 15 mg/kg/day in divided doses unless a local extended-interval protocol is adopted"
      },
      {
        "crcl": "Moderate-to-severe renal impairment",
        "regimen": "Adjust dose and/or interval with serum-level monitoring; official labeling allows prolonged-interval or reduced-dose strategies based on creatinine clearance"
      },
      {
        "crcl": "HD / CRRT",
        "regimen": "Do not use the standard renal tables during dialysis; use pharmacist-guided, modality-specific dosing and level monitoring"
      }
    ],
    "sideEffects": [
      "Nephrotoxicity (similar to gentamicin)",
      "Ototoxicity (cochlear + vestibular — potentially irreversible)",
      "Neuromuscular blockade (rare)"
    ],
    "monitoring": [
      "Trough <5 mg/L (extended-interval) or peak 20–30 mg/L / trough <5 mg/L (traditional BID dosing)",
      "SCr and urine output q48–72h",
      "Audiogram for prolonged courses"
    ],
    "publicNotes": [
      "Amikacin is often reserved for gentamicin-resistant gram-negative organisms",
      "Like other aminoglycosides, it needs therapeutic drug monitoring and renal surveillance"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amikacin"
      },
      {
        "text": "IDSA Guidance on Resistant Gram-Negatives — Tamma et al., CID 2023",
        "url": "https://doi.org/10.1093/cid/ciad428"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "tigecycline": {
    "name": "Tigecycline",
    "class": "Glycylcycline (Tetracycline Derivative)",
    "aliases": [
      "tigecycline",
      "tygacil"
    ],
    "pkpd": "AUC/MIC-dependent. Bacteriostatic. Extensive tissue distribution (Vd ~500–700 L) → low serum levels — NOT reliable for bacteremia or UTI. Biliary excretion.",
    "mechanism": "Binds 30S ribosomal subunit with ~5× higher affinity than tetracyclines → overcomes tetracycline-specific efflux pumps (TetM/O).",
    "spectrum": "Very broad: MRSA, VRE, ESBL/KPC-producing Enterobacteriaceae, Acinetobacter baumannii (MDR/XDR), anaerobes. NOT Pseudomonas (intrinsic efflux resistance), Proteus, Morganella.",
    "dose": {
      "standard": "100 mg IV loading, then 50 mg IV q12h (or 100 mg q12h for XDR infections — off-label high-dose)",
      "loading": "100 mg IV loading dose"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (biliary excretion)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not significantly dialysed"
      }
    ],
    "sideEffects": [
      "Nausea/vomiting (very common — ~30%; most dose-limiting; prophylactic antiemetics recommended)",
      "Diarrhoea",
      "Elevated LFTs",
      "Hypofibrinogenaemia / coagulopathy (prolonged courses — monitor PT/APTT and fibrinogen)",
      "Black box: increased all-cause mortality in clinical trials vs. comparators — use only when other options inadequate"
    ],
    "monitoring": [
      "Nausea (premedicate with metoclopramide or ondansetron)",
      "PT/APTT and fibrinogen (prolonged courses)",
      "LFTs",
      "Clinical response — bacteriostatic agent; failure in bacteremia common"
    ],
    "publicNotes": [
      "Tigecycline is generally a tissue-focused salvage agent, not a good bacteremia or urinary drug",
      "Expect nausea and vomiting unless you pre-empt them"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=tigecycline"
      },
      {
        "text": "FDA Safety Communication — Increased Mortality Risk (2013)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-increased-risk-death-intravenous-tigecycline-tygacil"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "colistin": {
    "name": "Colistin (Polymyxin E)",
    "class": "Polymyxin",
    "aliases": [
      "colistin",
      "polymyxin e",
      "colistimethate",
      "colomycin"
    ],
    "pkpd": "Concentration-dependent (AUC/MIC + Cmax/MIC). Colistimethate sodium (CMS) is prodrug → converted to colistin in vivo. PK highly variable — loading dose critical to achieve therapeutic levels quickly.",
    "mechanism": "Disrupts outer membrane of Gram-negative bacteria by displacing Mg²⁺/Ca²⁺ from lipopolysaccharide (LPS) → membrane permeabilization → rapid bactericidal activity.",
    "spectrum": "MDR/XDR Gram-negative bacteria only: Pseudomonas aeruginosa, Acinetobacter baumannii, Klebsiella pneumoniae (KPC/MBL CRE). NOT Gram-positive, Proteus, Burkholderia (intrinsic resistance).",
    "dose": {
      "standard": "Specialist/pharmacy protocol only. Verify whether local dosing is expressed as colistin base activity (CBA) or million units (MU); systemic therapy usually requires a loading dose and ongoing PK-guided maintenance",
      "loading": "Loading dose is generally required for serious systemic infection, but the exact expression (CBA vs MU) must be verified before ordering"
    },
    "renalAdj": [
      {
        "crcl": "Any renal function",
        "regimen": "Do not rely on a fixed one-line dose. Use pharmacist/ID protocol with explicit unit verification (CBA vs MU) and close renal monitoring"
      },
      {
        "crcl": "HD / CRRT",
        "regimen": "Highly individualized PK-guided dosing only; dialysis modality and effluent flow materially change exposure"
      }
    ],
    "sideEffects": [
      "Nephrotoxicity (major dose-limiting toxicity; up to 60% — monitor SCr q48h, avoid concurrent nephrotoxins)",
      "Neurotoxicity: peripheral neuropathy, perioral paraesthesia, ataxia (may indicate toxicity — reduce dose or stop)",
      "Bronchospasm (inhaled colistin)",
      "Injection site pain"
    ],
    "monitoring": [
      "SCr and urine output q48h — minimize nephrotoxic co-medications",
      "Colistin plasma levels (target steady-state average 2–4 mg/L) — local institution pharmacy PK service",
      "Neurological symptoms",
      "Fluid status (avoid dehydration — worsens nephrotoxicity)"
    ],
    "publicNotes": [
      "Colistin is generally a last-resort polymyxin for MDR gram-negative infections",
      "It is usually paired with another active agent and requires close renal monitoring"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=colistimethate"
      },
      {
        "text": "IDSA Guidance on Resistant Gram-Negatives — Tamma et al., CID 2023",
        "url": "https://doi.org/10.1093/cid/ciad428"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "clindamycin": {
    "name": "Clindamycin",
    "class": "Lincosamide",
    "aliases": [
      "clindamycin",
      "dalacin"
    ],
    "pkpd": "AUC/MIC-dependent. Bacteriostatic (bactericidal at high concentrations vs. some Streptococcus). Excellent oral bioavailability (~90%). Superior bone, abscess, and soft tissue penetration.",
    "mechanism": "Binds 23S rRNA of 50S ribosomal subunit → inhibits translocation. Same binding site as macrolides and linezolid → cross-resistance (MLSb phenotype).",
    "spectrum": "Anaerobes (B. fragilis, Peptostreptococcus, Fusobacterium), Streptococcus pyogenes, MSSA/MRSA (CA-MRSA strains if susceptible), Toxoplasma (+ pyrimethamine). NOT Gram-negative rods, Enterococcus.",
    "dose": {
      "standard": "600–900 mg IV q8h or 300–450 mg PO q6–8h; SSTI: 300–450 mg PO TID",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (hepatic metabolism)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not significantly cleared by dialysis"
      }
    ],
    "sideEffects": [
      "C. difficile colitis (HIGHEST risk among antibiotics — black box warning; discontinue immediately if diarrhoea develops)",
      "GI: nausea, diarrhoea, metallic taste",
      "Hepatotoxicity (LFT elevation — transient)",
      "Rash (cross-reactivity with lincomycin)"
    ],
    "monitoring": [
      "Diarrhoea monitoring (C. difficile risk — counsel patient at initiation)",
      "LFTs for prolonged courses",
      "D-zone test for inducible MLSb resistance in MRSA — report clindamycin as S only if negative"
    ],
    "publicNotes": [
      "Clindamycin should only be relied on for MRSA when inducible resistance testing is negative",
      "Its C. difficile risk is high enough that patients should be counseled to report diarrhea early"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=clindamycin"
      },
      {
        "text": "IDSA SSTI Guidelines — Stevens et al., CID 2014",
        "url": "https://doi.org/10.1093/cid/ciu296"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "rifampicin": {
    "name": "Rifampicin (Rifampin)",
    "class": "Rifamycin",
    "aliases": [
      "rifampicin",
      "rifampin",
      "rifadin"
    ],
    "pkpd": "Concentration-dependent (AUC/MIC). Bactericidal — uniquely kills slow-growing/stationary-phase organisms and biofilm-embedded bacteria. Rapid resistance develops with monotherapy → ALWAYS use in combination.",
    "mechanism": "Inhibits DNA-dependent RNA polymerase (β-subunit) → blocks mRNA synthesis. Resistance via rpoB mutations — emerges rapidly (1/10⁷–10⁸ organisms) if used alone.",
    "spectrum": "Staphylococcus (MSSA and MRSA — biofilm activity), Mycobacterium tuberculosis (cornerstone of TB therapy), Neisseria meningitidis (prophylaxis), Legionella (combination). NOT used alone for non-TB indications.",
    "dose": {
      "standard": "Biofilm/foreign body: 300–450 mg PO BID in combination; TB: 10 mg/kg (max 600 mg) PO q24h; Meningococcal prophylaxis: 600 mg PO BID × 2d",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (hepatic metabolism, biliary excretion)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not significantly cleared by dialysis"
      }
    ],
    "sideEffects": [
      "Orange-red discolouration of body fluids (urine, tears, sweat, saliva — harmless but MUST counsel patient; stains contact lenses permanently)",
      "Hepatotoxicity (significant — monitor LFTs; avoid with other hepatotoxic drugs)",
      "Flu-like syndrome (intermittent dosing — switch to daily dosing)",
      "Drug interactions: MAJOR CYP3A4/2C9 inducer — dramatically reduces levels of many drugs: warfarin, calcineurin inhibitors, antiretrovirals, antifungals, oral contraceptives, many others"
    ],
    "monitoring": [
      "LFTs (baseline + monthly during TB therapy)",
      "Drug interactions — CRITICAL: check every co-medication (warfarin INR↓↓; tacrolimus levels → may need 3–5× dose increase)",
      "Clinical response",
      "CBC"
    ],
    "publicNotes": [
      "Rifampicin should not be used as monotherapy outside specific TB regimens because resistance emerges rapidly",
      "Its interaction burden is so large that medication reconciliation is mandatory"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=rifampin"
      },
      {
        "text": "WHO Treatment of Tuberculosis Guidelines (2022)",
        "url": "https://www.who.int/publications/i/item/9789240048126"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "fosfomycin": {
    "name": "Fosfomycin",
    "class": "Phosphonic Acid Antibiotic",
    "aliases": [
      "fosfomycin",
      "monurol",
      "phosphomycin"
    ],
    "pkpd": "Concentration-dependent (Cmax/MIC). Oral sachet: single-dose 3g achieves very high urinary concentrations (persistent >24–48h). IV form available for systemic infections (less commonly used in regional).",
    "mechanism": "Inhibits MurA enzyme → blocks UDP-N-acetylmuramic acid synthesis → disrupts early peptidoglycan synthesis. Unique mechanism → no cross-resistance with other antibiotic classes.",
    "spectrum": "Uncomplicated UTI pathogens: E. coli (incl. ESBL), Enterococcus faecalis. Activity vs. MRSA (IV form, in combination). NOT Pseudomonas (variable), Klebsiella (often resistant), Proteus.",
    "dose": {
      "standard": "Uncomplicated UTI (female): 3 g PO sachet × 1 dose; Complicated UTI/systemic (IV): 8–24 g/day in divided doses (q6–8h)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "3g PO × 1 (standard)"
      },
      {
        "crcl": "10–49",
        "regimen": "Oral: consider longer course (single dose may be insufficient); IV: reduce dose"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "Avoid oral form for systemic coverage; HD removes fosfomycin — supplement post-dialysis if IV used"
      }
    ],
    "sideEffects": [
      "GI: diarrhoea, nausea, headache (oral single dose — usually mild)",
      "Hypernatraemia (IV form — high sodium load, 1g IV = ~14 mEq Na⁺; caution in CHF/CKD)",
      "Elevated LFTs (rare)"
    ],
    "monitoring": [
      "Urine culture susceptibility (ESBL E. coli: oral fosfomycin active for lower UTI — NOT for systemic ESBL infections)",
      "Serum sodium (IV form)",
      "Renal function"
    ],
    "publicNotes": [
      "Single-dose oral fosfomycin is mainly for uncomplicated lower UTI, not systemic infection",
      "The IV formulation has a sodium load worth watching in fluid-sensitive patients"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=fosfomycin"
      },
      {
        "text": "IDSA UTI Guidelines — Gupta et al., CID 2011",
        "url": "https://doi.org/10.1093/cid/ciq257"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "micafungin": {
    "name": "Micafungin",
    "class": "Echinocandin Antifungal",
    "aliases": [
      "micafungin",
      "mycamine"
    ],
    "pkpd": "Concentration-dependent (AUC/MIC). Once-daily dosing. Highly protein-bound (>99%). Poor CNS, urinary tract, and eye penetration — similar to caspofungin.",
    "mechanism": "Non-competitive inhibitor of β-(1,3)-D-glucan synthase → disrupts fungal cell wall. Fungicidal vs. Candida; fungistatic vs. Aspergillus.",
    "spectrum": "All Candida species (incl. C. krusei, C. glabrata, fluconazole-resistant strains). Aspergillus (combination/salvage). NOT Cryptococcus, Mucorales, Fusarium.",
    "dose": {
      "standard": "Candidemia: 100 mg IV q24h; Oesophageal candidiasis: 150 mg IV q24h; Prophylaxis (HSCT): 50 mg IV q24h",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not cleared by dialysis"
      }
    ],
    "sideEffects": [
      "Elevated LFTs (mild, transient)",
      "Histamine-related infusion reactions (rare)",
      "Hypokalemia",
      "GI: nausea",
      "Rash"
    ],
    "monitoring": [
      "LFTs weekly",
      "K⁺",
      "Drug interactions (fewer than azoles — major advantage)"
    ],
    "publicNotes": [
      "Micafungin is another practical first-line echinocandin for invasive candidiasis",
      "Its interaction burden is lower than that of azoles, which is often clinically useful"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=micafungin"
      },
      {
        "text": "IDSA Candida Guidelines — Pappas et al., CID 2016",
        "url": "https://doi.org/10.1093/cid/civ933"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "antifungal",
    "localNotes": []
  },
  "minocycline": {
    "name": "Minocycline",
    "class": "Tetracycline (2nd Generation)",
    "aliases": [
      "minocycline",
      "minocin"
    ],
    "pkpd": "AUC/MIC-dependent. Bacteriostatic. Best CNS penetration among tetracyclines (lipophilicity). PO bioavailability ~100% — take without food for best absorption. No significant renal elimination.",
    "mechanism": "Binds 30S ribosomal subunit → bacteriostatic. More lipophilic than doxycycline → better intracellular and biofilm penetration. Overcomes some tetracycline-specific efflux mechanisms.",
    "spectrum": "MDR Acinetobacter baumannii (key indication), CA-MRSA SSTI, atypicals (Mycoplasma, Chlamydia, Rickettsia), MRSA (alternative). NOT reliable GNRs, Streptococcus (resistance), Pseudomonas.",
    "dose": {
      "standard": "200 mg PO/IV loading, then 100 mg PO/IV q12h",
      "loading": "200 mg loading dose"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment needed (hepatic/faecal elimination)"
      },
      {
        "crcl": "HD",
        "regimen": "Standard dose; not significantly cleared by dialysis"
      }
    ],
    "sideEffects": [
      "Vestibular toxicity: dizziness, vertigo, ataxia (most important ADR — dose-dependent, usually reversible on stopping)",
      "Photosensitivity (less than doxycycline — but sunscreen still required)",
      "Oesophageal ulceration (take upright with water — same as doxycycline)",
      "GI: nausea, vomiting",
      "Drug-induced lupus (prolonged use)",
      "Tooth/bone discolouration (children <8 years — contraindicated; pregnancy)",
      "Skin/mucosal pigmentation (prolonged use)"
    ],
    "monitoring": [
      "Vestibular symptoms (dizziness, nausea, tinnitus — reduce dose or switch if persistent)",
      "Avoid driving if vestibular symptoms present",
      "LFTs (prolonged use)"
    ],
    "publicNotes": [
      "Minocycline can be useful for selected MDR Acinetobacter isolates and as an alternative tetracycline-class agent",
      "Vestibular side effects are common enough that patients should be warned up front"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=minocycline"
      },
      {
        "text": "IDSA Guidance on Resistant Gram-Negatives — Tamma et al., CID 2023",
        "url": "https://doi.org/10.1093/cid/ciad428"
      }
    ],
    "category": "antimicrobial",
    "subcategory": "other",
    "localNotes": []
  },
  "insulin-regular": {
    "name": "Regular Insulin (RI / Actrapid)",
    "class": "Short-Acting Insulin",
    "badge": "IV / SC",
    "aliases": [
      "regular insulin",
      "actrapid",
      "humulin r",
      "RI",
      "insulin R"
    ],
    "pkpd": "IV: immediate onset, controlled by infusion rate. SC: onset 30–60 min, peak 2–4h, duration 6–8h. 100 u/mL — confirm correct vial before IV use.",
    "mechanism": "Binds insulin receptor → GLUT4 translocation → cellular glucose uptake. Inhibits hepatic gluconeogenesis and glycogenolysis. Drives K⁺ intracellularly via Na/K-ATPase (useful in hyperkalemia).",
    "spectrum": "DKA/HHS (IV infusion), perioperative glucose control (IV), hyperkalemia with glucose (Dextrose 50% + 10 u RI IV), prandial corrective bolus (SC), NPO patients on TPN.",
    "dose": {
      "standard": "DKA/HHS IV drip: 0.1 u/kg/h; corrective SC bolus: 0.1 u/kg per protocol; hyperkalemia: 10 u RI IV + D50 50 mL IV push",
      "loading": "DKA loading: 0.1 u/kg IV bolus optional (omit if initiating infusion directly)"
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No fixed label-based percentage adjustment. Renal impairment increases hypoglycemia risk; use more frequent glucose monitoring and individualized dose titration"
      },
      {
        "crcl": "IV infusion / DKA protocols",
        "regimen": "Follow institution-specific protocol with hourly glucose and close potassium monitoring; renal impairment often lowers insulin requirements"
      },
      {
        "crcl": "HD / ESRD",
        "regimen": "No routine post-dialysis supplement rule. Use individualized dose reduction and frequent glucose monitoring around dialysis sessions"
      }
    ],
    "sideEffects": [
      "Hypoglycemia (have D50W at bedside; Q1h glucose on drip)",
      "Hypokalemia (insulin drives K⁺ into cells — CHECK K⁺ before starting DKA drip; do NOT start if K⁺ <3.5 mEq/L)",
      "Hypophosphatemia (DKA treatment)",
      "Subcutaneous lipodystrophy (rotate injection sites)"
    ],
    "monitoring": [
      "Bedside glucose: Q1h on IV infusion, Q4–6h on SC regimen",
      "K⁺ before and during DKA insulin drip (target K⁺ 3.5–5.0 mEq/L)",
      "Anion gap (DKA resolution)",
      "Fluid balance"
    ],
    "publicNotes": [
      "Regular insulin is the standard IV insulin for DKA, HHS, and hyperkalemia protocols",
      "Do not start a DKA insulin infusion until potassium is safe enough to tolerate intracellular shift"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=regular+insulin"
      },
      {
        "text": "ADA Standards of Medical Care in Diabetes (2024)",
        "url": "https://doi.org/10.2337/dc24-S005"
      }
    ],
    "category": "insulin",
    "localNotes": []
  },
  "insulin-rapid": {
    "name": "Rapid-Acting Insulin (NovoRapid / Humalog)",
    "class": "Rapid-Acting Insulin Analogue",
    "badge": "SC primarily",
    "aliases": [
      "novorapid",
      "aspart",
      "humalog",
      "lispro",
      "apidra",
      "glulisine",
      "rapid insulin"
    ],
    "pkpd": "SC onset: 10–20 min. Peak: 1–3h. Duration: 3–5h. Inject immediately before meals (within 15 min of eating). Faster and shorter vs. regular insulin → less interprandial hypoglycemia.",
    "mechanism": "Amino acid modifications reduce self-association → faster SC absorption. Same receptor and mechanism as regular insulin. Primarily used SC for mealtime coverage; some rapid-acting products have IV labeling, but routine inpatient IV insulin protocols usually use regular insulin.",
    "spectrum": "Mealtime insulin in basal-bolus regimen (T1DM, intensive T2DM), corrective (supplemental) doses, insulin pumps (CSII). Superior to regular insulin for post-prandial glucose control.",
    "dose": {
      "standard": "Mealtime: 0.05–0.1 u/kg SC with meals; correction: per ISF (insulin sensitivity factor = 1800/TDD); titrate doses based on carbohydrate intake and glucose trends",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No fixed label-based percentage adjustment. Renal impairment increases hypoglycemia risk; individualize prandial dosing with more frequent glucose monitoring"
      },
      {
        "crcl": "Advanced CKD / ESRD",
        "regimen": "Dose reduction is often needed, but the amount is patient-specific; monitor closely for delayed hypoglycemia, especially when appetite is variable"
      },
      {
        "crcl": "HD",
        "regimen": "No standard supplemental dose. Reassess mealtime needs around dialysis and use individualized dosing with frequent glucose checks"
      }
    ],
    "sideEffects": [
      "Hypoglycemia (must eat immediately after injection — have fast-acting carbohydrate available)",
      "Injection site reactions",
      "Hypokalemia (high doses)",
      "Weight gain (chronic)"
    ],
    "monitoring": [
      "Pre- and 2h post-meal glucose",
      "Total daily dose (TDD) review",
      "Injection site rotation (abdomen, thighs, arms)"
    ],
    "publicNotes": [
      "Rapid-acting analogues are primarily mealtime insulins; routine inpatient IV insulin protocols usually use regular insulin instead",
      "Hold prandial dosing when a patient is not eating, while continuing appropriate correction or basal strategy"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=insulin+lispro"
      },
      {
        "text": "ADA Standards of Medical Care in Diabetes (2024)",
        "url": "https://doi.org/10.2337/dc24-S005"
      }
    ],
    "category": "insulin",
    "localNotes": []
  },
  "insulin-long": {
    "name": "Long-Acting Insulin (Lantus / Tresiba)",
    "class": "Long-Acting Insulin Analogue",
    "badge": "SC once daily",
    "aliases": [
      "lantus",
      "glargine",
      "levemir",
      "detemir",
      "tresiba",
      "degludec",
      "basaglar",
      "long-acting insulin",
      "basal insulin"
    ],
    "pkpd": "Glargine (Lantus): onset 2–4h, no peak, duration ~24h. Degludec (Tresiba): onset 1h, duration >42h (ultra-long, flexible timing). Detemir (Levemir): onset 1–2h, duration 12–24h (may need BID).",
    "mechanism": "Glargine: microprecipitates at neutral SC pH → slow dissolution depot. Degludec: forms multi-hexamer chains → ultra-prolonged absorption. Detemir: albumin binding → buffered release.",
    "spectrum": "Basal insulin: T1DM (mandatory) and T2DM (basal-only or basal-bolus). Controls fasting glucose. NOT for IV use (never). Targets overnight and interprandial glucose stability.",
    "dose": {
      "standard": "Starting dose (insulin-naive): 0.1–0.2 u/kg SC once daily at bedtime (or any consistent time for degludec); titrate by 2 u every 3 days until fasting glucose 80–130 mg/dL; typical doses 0.2–0.5 u/kg/day",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No fixed label-based percentage adjustment. Use lower and more cautious titration when renal function declines, with frequent fasting glucose review"
      },
      {
        "crcl": "Advanced CKD / ESRD",
        "regimen": "Basal requirements often fall, but dose changes must be individualized under glucose monitoring rather than by a fixed percentage"
      },
      {
        "crcl": "HD",
        "regimen": "No routine post-dialysis supplement rule. Adjust basal dosing based on fasting trends and dialysis-day hypoglycemia risk"
      }
    ],
    "sideEffects": [
      "Hypoglycemia (less nocturnal hypo vs. NPH — but still monitor fasting glucose during titration)",
      "Injection site lipohypertrophy (rotate sites rigorously)",
      "Weight gain (1–4 kg)",
      "Peripheral oedema (insulin initiation — sodium retention)"
    ],
    "monitoring": [
      "Daily fasting glucose (titration)",
      "HbA1c Q3 months",
      "Injection site assessment",
      "Weight"
    ],
    "publicNotes": [
      "Long-acting insulin provides basal coverage and should not be mixed with most other insulins unless the product specifically allows it",
      "Titrate against fasting glucose rather than chasing every post-meal excursion"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=insulin+glargine"
      },
      {
        "text": "ADA Standards of Medical Care in Diabetes (2024)",
        "url": "https://doi.org/10.2337/dc24-S005"
      }
    ],
    "category": "insulin",
    "localNotes": []
  },
  "insulin-nph": {
    "name": "NPH Insulin (Humulin N / Insulatard)",
    "class": "Intermediate-Acting Insulin",
    "badge": "SC",
    "aliases": [
      "NPH",
      "humulin n",
      "insulatard",
      "isophane",
      "neutral protamine hagedorn",
      "humulin 70/30"
    ],
    "pkpd": "Onset: SC 1–4h. Peak: 6–10h (significant peak → nocturnal hypoglycemia risk). Duration: 12–18h. Cloudy suspension — resuspend by rolling gently 10× before use.",
    "mechanism": "Regular insulin complexed with protamine → delayed SC absorption. Pronounced action peak at 6–10h — timing matters for meal and bedtime planning. CAN be mixed with regular insulin.",
    "spectrum": "Basal insulin in T1DM and T2DM (increasingly replaced by long-acting analogues). Premixed formulations (NPH/RI 70/30) for BID dosing. Used in TPN insulin protocols.",
    "dose": {
      "standard": "0.2–0.3 u/kg SC BID (morning + bedtime); or 0.1–0.2 u/kg SC at bedtime only (basal-only start); Humulin 70/30 (premix): 0.2–0.3 u/kg BID with meals",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No fixed label-based percentage adjustment. Renal impairment increases hypoglycemia risk and may require more frequent dose adjustment and glucose monitoring"
      },
      {
        "crcl": "Advanced CKD / ESRD",
        "regimen": "NPH action becomes less predictable; use cautious individualized titration with overnight hypoglycemia surveillance"
      },
      {
        "crcl": "HD",
        "regimen": "No standard post-dialysis supplement. Reassess dosing around dialysis days and consider individualized alternatives if nocturnal hypoglycemia is frequent"
      }
    ],
    "sideEffects": [
      "Nocturnal hypoglycemia (peak 6–10h — highest risk with bedtime dose; set alarm check at 2–3 AM during initiation)",
      "Injection site lipohypertrophy",
      "Weight gain",
      "Protamine allergy (rare — may cross-react with fish allergy or prior protamine exposure)"
    ],
    "monitoring": [
      "Fasting glucose (morning)",
      "2–3 AM glucose during initiation (nocturnal hypo surveillance)",
      "Injection site rotation",
      "Pre-meal glucose"
    ],
    "publicNotes": [
      "NPH should be resuspended before use and carries a more pronounced peak than long-acting analogues",
      "Night-time hypoglycemia surveillance matters when starting or escalating bedtime NPH"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=NPH+insulin"
      },
      {
        "text": "ADA Standards of Medical Care in Diabetes (2024)",
        "url": "https://doi.org/10.2337/dc24-S005"
      }
    ],
    "category": "insulin",
    "localNotes": []
  },
  "normal-saline": {
    "name": "Normal Saline 0.9%",
    "class": "Isotonic Crystalloid",
    "shortName": "NS 0.9%",
    "badge": "IV Infusion",
    "composition": "Na⁺ 154 · Cl⁻ 154 mEq/L · Osmolarity 308 mOsm/L · pH 4.5–7.0",
    "sizes": [
      "100 mL bag",
      "250 mL bag",
      "500 mL bag",
      "1000 mL bag"
    ],
    "osmolarity": "308 mOsm/L",
    "calories": "0 kcal/L",
    "aliases": [
      "normal saline",
      "NS",
      "0.9% NaCl",
      "N/S",
      "saline",
      "norm-saline",
      "諾沙林"
    ],
    "pkpd": "Isotonic (308 mOsm/L). Distributes throughout ECF. ~25% remains intravascular at 1h post-infusion. Contains Na⁺ 154 + Cl⁻ 154 mEq/L — supraphysiological chloride.",
    "mechanism": "Expands extracellular fluid volume. High Cl⁻ load → hyperchloraemic metabolic acidosis (normal anion gap, NAGMA) with large volumes (>2–3 L). No potassium, calcium, or glucose.",
    "spectrum": "Volume resuscitation (sepsis, haemorrhage), drug diluent (broadest compatibility), hyponatraemia correction (slow), vomiting-induced hypochloraemic alkalosis, pre/post-contrast hydration, blood transfusion line flush.",
    "dose": {
      "standard": "Resuscitation bolus: 500 mL–1 L IV over 15–30 min (reassess after each); Maintenance: 1–2 mL/kg/h; Hyponatraemia correction: target ≤0.5–1 mEq/L/h, MAX 8–10 mEq/L per 24h (osmotic demyelination risk)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard; reassess fluid balance after each bolus"
      },
      {
        "crcl": "30–59",
        "regimen": "Use cautiously — reduced Na⁺/water excretion; monitor for volume overload"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Restrict volume; 250 mL boluses; discuss fluid strategy with nephrology"
      }
    ],
    "sideEffects": [
      "Hyperchloraemic metabolic acidosis (NAGMA with large volumes — pH ↓, HCO₃⁻ ↓, Cl⁻ ↑, AG normal; prefer LR/balanced crystalloid for >2 L resuscitation)",
      "Volume overload (pulmonary oedema, CHF exacerbation, peripheral oedema)",
      "Hypernatraemia (excessive NS in euvolaemic patients)",
      "Dilutional coagulopathy (massive volumes without blood products)"
    ],
    "monitoring": [
      "Fluid balance (ins/outs — Q1–4h in ICU)",
      "Serum Na⁺ and Cl⁻",
      "Acid-base (pH, HCO₃⁻ with large volumes)",
      "Lung auscultation (pulmonary oedema)",
      "BUN/Cr"
    ],
    "publicNotes": [
      "Normal saline remains the preferred fluid for blood product lines",
      "Use caution with large-volume resuscitation because chloride load can worsen hyperchloremic acidosis",
      "Balanced crystalloids are often preferred over NS when repeated large boluses are expected"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=sodium+chloride+0.9%25+injection"
      },
      {
        "text": "SMART Trial — Semler et al., NEJM 2018",
        "url": "https://doi.org/10.1056/NEJMoa1801769"
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "lactated-ringers": {
    "name": "Hartmann's / Lactated Ringer's",
    "class": "Balanced Isotonic Crystalloid",
    "shortName": "Hartmann / LR",
    "badge": "IV Infusion",
    "composition": "Na⁺ 130 · K⁺ 4 · Ca²⁺ 3 · Cl⁻ 109 · Lactate 28 mEq/L · Osmolarity 273 mOsm/L",
    "sizes": [
      "500 mL bag"
    ],
    "osmolarity": "273 mOsm/L",
    "calories": "0 kcal/L",
    "aliases": [
      "lactated ringer's",
      "LR",
      "ringer's lactate",
      "hartmann's solution",
      "hartmann's injection",
      "福多命安",
      "LRS"
    ],
    "pkpd": "Near-isotonic (273 mOsm/L). Composition: Na⁺ 130, K⁺ 4, Ca²⁺ 3, Cl⁻ 109, lactate 28 mEq/L. Lactate metabolised → bicarbonate in liver (mild buffering). Closer to plasma composition than NS.",
    "mechanism": "Balanced crystalloid expands ECF with less hyperchloraemic acidosis than NS. Ca²⁺ content → incompatible with blood products and certain IV medications (check before co-infusion).",
    "spectrum": "First-line resuscitation fluid (sepsis, trauma, surgical), perioperative fluid replacement, burns (Parkland formula — 4 mL/kg/% TBSA in 24h), DKA (after initial NS phase, once glucose <250 mg/dL), general maintenance.",
    "dose": {
      "standard": "Resuscitation bolus: 500 mL–1 L IV over 15–30 min; Maintenance: 1–2 mL/kg/h; Burns (Parkland): 4 mL/kg × %TBSA burned in 24h (half in first 8h, half in next 16h)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard; monitor fluid balance"
      },
      {
        "crcl": "30–59",
        "regimen": "Monitor K⁺ (LR contains 4 mEq/L K⁺); withhold if hyperkalaemic"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "CAUTION with K⁺ — 4 mEq/L can worsen hyperkalaemia in ESRD; switch to NS if K⁺ elevated"
      }
    ],
    "sideEffects": [
      "Hyperkalaemia (4 mEq/L K⁺ per litre — clinically relevant in ESRD/AKI; minimal risk in normal renal function)",
      "Volume overload (same risks as NS in CHF, cirrhosis, ESRD)",
      "Mild lactate elevation (LR infusion mildly elevates serum lactate — interpret lactate cautiously in first few hours of resuscitation)"
    ],
    "monitoring": [
      "Fluid balance",
      "Serum K⁺ (especially CKD/ESRD)",
      "Lactate (note that LR may transiently ↑ serum lactate 0.5–1 mmol/L)",
      "Serum Ca²⁺ if large volumes"
    ],
    "publicNotes": [
      "Often preferred over normal saline for large-volume resuscitation because it causes less hyperchloremic acidosis",
      "Do not run LR through the same line as blood products without confirming compatibility",
      "Check medication compatibility before co-infusing because calcium content matters"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=lactated+ringer"
      },
      {
        "text": "SMART Trial — Semler et al., NEJM 2018",
        "url": "https://doi.org/10.1056/NEJMoa1801769"
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "d5w": {
    "name": "Dextrose 5% in Water (D5W)",
    "class": "Hypotonic Glucose Solution",
    "shortName": "D5W",
    "badge": "IV Infusion",
    "composition": "Glucose 50 g/L · No Na⁺ / K⁺ / Ca²⁺ · Osmolarity 252 mOsm/L in bag",
    "sizes": [
      "250 mL bag",
      "500 mL bag"
    ],
    "osmolarity": "252 mOsm/L",
    "calories": "170 kcal/L",
    "aliases": [
      "D5W",
      "5% dextrose",
      "5% glucose",
      "dextrose 5%",
      "葡萄糖"
    ],
    "pkpd": "Hypotonic (isotonic in bag, but after glucose metabolism → effective free water). Distributes throughout TBW (2/3 ICF, 1/3 ECF). NOT a volume expander. Provides 170 kcal/L (glucose 50g/L).",
    "mechanism": "After glucose metabolism provides free water + calories. No lasting intravascular volume expansion. Useful to prevent hypoglycaemia during insulin infusion or supply free water in hypernatraemia.",
    "spectrum": "Hypernatraemia treatment (free water replacement), prevent hypoglycaemia in DKA when glucose <250 mg/dL (co-infuse with NS or as D5-0.45% NS), drug diluent (amiodarone, potassium infusions, vasopressors), parenteral caloric support (hypoglycaemic states).",
    "dose": {
      "standard": "Hypernatraemia: free water deficit = 0.6 × weight × (Na/140 – 1); correct at ≤0.5–1 mEq/L/h Na (max 10–12 mEq/L per 24h); DKA transition: start when glucose <250 mg/dL — infuse D5-0.45% NS alongside insulin drip",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "Monitor glucose Q4–6h; fluid balance; Na⁺"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia (especially DM, sepsis, critical illness — Q4–6h glucose monitoring)",
      "Hyponatraemia (dilutional — avoid as standard maintenance; risk ↑ in SIADH, post-operative, paediatrics)",
      "Volume overload (less than isotonic fluids but possible with large volumes)"
    ],
    "monitoring": [
      "Glucose (Q4–6h)",
      "Serum Na⁺ (rate and direction of correction in hypernatraemia)",
      "Fluid balance"
    ],
    "publicNotes": [
      "D5W is not a resuscitation fluid because it provides no sustained intravascular expansion",
      "Add dextrose during DKA management once glucose falls to avoid hypoglycemia while insulin continues",
      "Use D5W for free-water replacement and for drugs that are specifically incompatible with saline"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=dextrose+5%25+injection"
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "half-normal-saline": {
    "name": "2.5% Dextrose + 0.45% NaCl",
    "class": "Hypotonic Maintenance Solution",
    "shortName": "D2.5-1/2NS",
    "badge": "IV Infusion",
    "composition": "Na⁺ 77 · Cl⁻ 77 mEq/L · Glucose 25 g/L · Effective osmolarity ~154 mOsm/L after glucose metabolism",
    "sizes": [
      "500 mL bag"
    ],
    "osmolarity": "280 mOsm/L",
    "calories": "85 kcal/L",
    "aliases": [
      "2.5% dextrose + 0.45% NaCl",
      "2.5% dextrose in half normal saline",
      "D2.5-half NS",
      "dext-saline 2.5:0.45",
      "滴沙林 2.5:0.45"
    ],
    "pkpd": "Hypotonic (~154 mOsm effective after glucose metabolism). Na⁺ 77, Cl⁻ 77 mEq/L + glucose 25g/L (2.5%). Distributes across ECF and ICF. Provides modest electrolytes and calories.",
    "mechanism": "Maintenance fluid designed to replace insensible losses and provide some sodium + glucose. Not for resuscitation. Glucose content prevents ketosis in NPO patients.",
    "spectrum": "Maintenance hydration (NPO, post-op), individualized pediatric maintenance planning, mild hypernatraemia, uncomplicated post-operative maintenance without major electrolyte disturbance.",
    "dose": {
      "standard": "Adult maintenance: 1–1.5 mL/kg/h; pediatric maintenance must be individualized carefully; do not assume potassium should be added to the bag unless current labs, urine output, and the clinical plan support supplementation",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard maintenance rate; monitor electrolytes Q24h"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate; monitor Na⁺ and K⁺"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Avoid without close monitoring — free water causes dilutional hyponatraemia; restricted fluid balance"
      }
    ],
    "sideEffects": [
      "Hospital-acquired hyponatraemia (hypotonic maintenance → dilutional hyponatraemia especially in SIADH, post-operative, paediatrics — major safety concern)",
      "Hyperglycaemia (glucose content — monitor in DM)",
      "Volume overload (less risk than isotonic)"
    ],
    "monitoring": [
      "Serum Na⁺ (Q24h during maintenance — watch for downward trend)",
      "Glucose",
      "Fluid balance",
      "Urine output"
    ],
    "publicNotes": [
      "Hypotonic maintenance fluids can cause hospital-acquired hyponatremia, especially post-operatively or in SIADH-prone patients",
      "This entry is for the dextrose-containing product, not plain 0.45% sodium chloride",
      "Use it for maintenance, not for resuscitation"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b825c9c4-f2fb-4a4a-9d8c-fb020ad07e93"
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "d5ns": {
    "name": "Dextrose 5% + 0.9% NaCl (D5NS)",
    "class": "Hypertonic Glucose-Saline Solution",
    "shortName": "D5NS",
    "badge": "IV Infusion",
    "composition": "Na⁺ 154 · Cl⁻ 154 mEq/L · Glucose 50 g/L",
    "sizes": [
      "500 mL bag",
      "1000 mL bag"
    ],
    "osmolarity": "560 mOsm/L",
    "calories": "170 kcal/L",
    "aliases": [
      "D5NS",
      "D5 normal saline",
      "dextrose saline",
      "5% glucose in normal saline",
      "D5 0.9% NaCl",
      "Dext-Saline 5:0.9"
    ],
    "pkpd": "Hypertonic in the bag (560 mOsm/L). Supplies isotonic saline plus dextrose calories; after glucose metabolism, the remaining effective tonicity is that of normal saline.",
    "mechanism": "Provides sodium/chloride replacement together with dextrose calories. Unlike Taita No. 5, this generic bag does not contain potassium, magnesium, phosphate, or acetate.",
    "spectrum": "Maintenance or replacement fluid when both saline and dextrose are desired, peri-procedural background fluids, and selected inpatient maintenance plans where a plain saline-dextrose bag is preferred.",
    "dose": {
      "standard": "Maintenance: individualize to sodium and glucose goals; common adult background rates are 75–125 mL/h, but it is not a preferred rapid resuscitation bolus fluid",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Monitor glucose and sodium/chloride daily"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate if fluid-sensitive; monitor Na⁺ and glucose closely"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Use cautiously because sodium/water overload can occur; reassess need frequently"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia",
      "Hypernatremia or hyperchloremia if sodium delivery exceeds needs",
      "Volume overload in CHF/cirrhosis/ESRD",
      "Less suitable for large resuscitation volumes because of glucose load and hypertonicity in the bag"
    ],
    "monitoring": [
      "Glucose",
      "Serum Na⁺ and Cl⁻",
      "Fluid balance and urine output",
      "Whether a balanced crystalloid or a non-dextrose fluid would better fit the current goal"
    ],
    "publicNotes": [
      "Generic D5NS is distinct from Taita No. 5",
      "Use it when you want plain saline plus dextrose, without extra potassium, magnesium, phosphate, or acetate"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=dextrose+sodium+chloride+injection"
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "taita-1": {
    "name": "Taita No. 1 Injection",
    "class": "Maintenance Electrolyte-Glucose Solution",
    "shortName": "Taita 1",
    "badge": "IV Infusion",
    "composition": "Per 500 mL bag: Na⁺ 12.5 mEq · K⁺ 9 mEq · Mg²⁺ 1.5 mEq · Cl⁻ 10 mEq · Acetate 10 mEq · Phosphate 3 mmol · Glucose 19 g",
    "sizes": [
      "500 mL bag"
    ],
    "osmolarity": "300 mOsm/L",
    "calories": "76 kcal/500 mL bag (152 kcal/L)",
    "aliases": [
      "Taita No. 1",
      "大塚1號",
      "taita 1",
      "local一號"
    ],
    "pkpd": "Low-sodium maintenance fluid with dextrose plus mixed electrolytes. Official listed ingredients are sodium chloride, potassium acetate, sodium acetate, magnesium chloride, potassium phosphate monobasic, and dextrose.",
    "mechanism": "Provides maintenance water, calories, and modest sodium with built-in potassium, magnesium, acetate, and phosphate. It is a local maintenance formulation, not a crystalloid resuscitation fluid.",
    "spectrum": "Water, electrolyte, and nutrition support; neonatal or low-sodium maintenance contexts; ward maintenance when only modest sodium delivery is desired.",
    "dose": {
      "standard": "Maintenance: individualize to age, weight, and ongoing losses; adult maintenance is typically 1–1.5 mL/kg/h, but this lower-sodium bag is mainly selected for specific maintenance goals rather than routine bolus use",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Use for maintenance only; monitor glucose and electrolytes daily"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate if fluid-sensitive; monitor Na⁺/K⁺/Mg²⁺/phosphate Q12–24h"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Use cautiously because K⁺/Mg²⁺/phosphate may accumulate; monitor fluid balance closely"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia (glucose-containing maintenance fluid)",
      "Electrolyte accumulation if renal function is poor (K⁺/Mg²⁺/phosphate)",
      "Hyponatraemia if used when sodium requirements are higher than the bag provides",
      "Volume overload in CHF/cirrhosis/ESRD"
    ],
    "monitoring": [
      "Glucose",
      "Serum Na⁺, K⁺, Mg²⁺, and phosphate",
      "Fluid balance and urine output",
      "Clinical reason for choosing a lower-sodium maintenance bag"
    ],
    "publicNotes": [
      "Taita No. 1 is not normal saline; it is a maintenance fluid with dextrose and added electrolytes",
      "Use it for maintenance goals, not for rapid volume resuscitation"
    ],
    "references": [
      {
        "text": "Product Information — Otsuka Pharmaceutical Co., Ltd.",
        "url": null
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "taita-2": {
    "name": "Taita No. 2 Injection",
    "class": "Maintenance Electrolyte-Glucose Solution",
    "shortName": "Taita 2",
    "badge": "IV Infusion",
    "composition": "Per 500 mL bag: Na⁺ 20 mEq · K⁺ 6 mEq · Cl⁻ 13 mEq · Acetate 10 mEq · Phosphate 3 mmol · Glucose 16.5 g",
    "sizes": [
      "500 mL bag"
    ],
    "osmolarity": "287 mOsm/L",
    "calories": "66 kcal/500 mL bag (132 kcal/L)",
    "aliases": [
      "Taita No. 2",
      "大塚2號",
      "taita 2",
      "local二號"
    ],
    "pkpd": "Intermediate-sodium maintenance fluid with dextrose and mixed electrolytes. Official listed ingredients are sodium chloride, potassium acetate, sodium acetate, sodium phosphate monobasic, and dextrose.",
    "mechanism": "Provides maintenance water, calories, sodium, potassium, acetate, and phosphate. Unlike generic D2.5-1/2NS, it also contains buffer and phosphate.",
    "spectrum": "Maintenance water/electrolyte/calorie support, historically used for pediatric diarrhea or higher GI losses when a maintenance-style bag with some sodium replacement is desired.",
    "dose": {
      "standard": "Maintenance: individualize to age, weight, and ongoing GI losses; not intended for rapid bolus resuscitation",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Use for maintenance only; monitor glucose and electrolytes daily"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate if fluid-sensitive; monitor Na⁺/K⁺/phosphate Q12–24h"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Use cautiously because K⁺/phosphate may accumulate; choose bag based on electrolyte goals"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia",
      "Electrolyte accumulation in renal impairment (especially K⁺ and phosphate)",
      "Hyponatraemia or inadequate sodium replacement if losses are underestimated",
      "Volume overload in fluid-sensitive patients"
    ],
    "monitoring": [
      "Glucose",
      "Serum Na⁺, K⁺, and phosphate",
      "Fluid balance and urine output",
      "Trend of GI losses if replacing ongoing diarrhea"
    ],
    "publicNotes": [
      "Taita No. 2 is not the same as generic 2.5% dextrose + 0.45% saline",
      "It includes acetate and phosphate, so bag choice should match the electrolyte goal rather than the glucose percentage alone"
    ],
    "references": [
      {
        "text": "Product Information — Otsuka Pharmaceutical Co., Ltd.",
        "url": null
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "taita-3": {
    "name": "Taita No. 3 Injection",
    "class": "Maintenance Electrolyte-Glucose Solution",
    "shortName": "Taita 3",
    "badge": "IV Infusion",
    "composition": "Per 500 mL bag: Na⁺ 37.5 mEq · K⁺ 6 mEq · Cl⁻ 30.5 mEq · Acetate 10 mEq · Phosphate 3 mmol · Glucose 10 g",
    "sizes": [
      "500 mL bag"
    ],
    "osmolarity": "285 mOsm/L",
    "calories": "40 kcal/500 mL bag (80 kcal/L)",
    "aliases": [
      "Taita No. 3",
      "大塚3號",
      "taita 3",
      "local三號"
    ],
    "pkpd": "Higher-sodium maintenance fluid with dextrose and mixed electrolytes. Official listed ingredients are sodium chloride, potassium acetate, sodium acetate, sodium phosphate monobasic, and dextrose.",
    "mechanism": "Provides maintenance water with substantially more sodium/chloride than Taita 1 or 2, while still carrying potassium, acetate, phosphate, and glucose. It is not LR/Hartmann.",
    "spectrum": "Maintenance fluid for patients needing more sodium replacement, isotonic diarrheal loss replacement in older local protocols, and ward maintenance when a Taita-series bag with higher sodium is desired.",
    "dose": {
      "standard": "Maintenance: individualize to weight, sodium goals, and ongoing losses; not intended for rapid resuscitation boluses",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Use for maintenance only; monitor glucose and electrolytes daily"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate if fluid-sensitive; monitor Na⁺/K⁺/phosphate Q12–24h"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Use cautiously because K⁺/phosphate may accumulate and sodium load may overshoot goals"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia",
      "Electrolyte accumulation in renal impairment (especially K⁺ and phosphate)",
      "Hypernatremia or chloride load if used without matching the patient’s losses and sodium goals",
      "Volume overload in fluid-sensitive patients"
    ],
    "monitoring": [
      "Glucose",
      "Serum Na⁺, K⁺, chloride, and phosphate",
      "Fluid balance and urine output",
      "Whether the higher-sodium profile still matches the clinical plan"
    ],
    "publicNotes": [
      "Taita No. 3 is not lactated Ringer’s or Hartmann’s",
      "Within the Taita series it is the more sodium-rich maintenance option, but it is still a maintenance bag rather than a resuscitation crystalloid"
    ],
    "references": [
      {
        "text": "Product Information — Otsuka Pharmaceutical Co., Ltd.",
        "url": null
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "taita-5": {
    "name": "Taita No. 5 Injection",
    "class": "Maintenance Electrolyte-Glucose Solution",
    "shortName": "Taita 5",
    "badge": "IV Infusion",
    "composition": "Per 400 mL bag: Na⁺ 14.4 mEq · K⁺ 7.2 mEq · Mg²⁺ 1.2 mEq · Cl⁻ 6.8 mEq · Acetate 11.2 mEq · Phosphate 4.8 mmol · Glucose 40 g",
    "sizes": [
      "250 mL bag",
      "400 mL bag",
      "500 mL bag"
    ],
    "osmolarity": "669 mOsm/L",
    "calories": "160 kcal/400 mL bag (400 kcal/L)",
    "aliases": [
      "Taita No. 5",
      "大塚5號",
      "taita 5",
      "local五號"
    ],
    "pkpd": "Maintenance fluid with dextrose plus mixed electrolytes. Official Otsuka ingredients are sodium chloride, dextrose, sodium acetate, potassium acetate, magnesium chloride hexahydrate, and potassium phosphate monobasic. This is not the same formulation as generic D5NS.",
    "mechanism": "Provides water, glucose calories, sodium/chloride, plus acetate-buffered potassium, magnesium, and phosphate supplementation. Intended as a local maintenance formulation rather than a pure saline-dextrose bag.",
    "spectrum": "Maintenance hydration for patients unable to eat, perioperative water/electrolyte/calorie support, and ward maintenance when mild potassium/phosphate/magnesium supplementation in the bag is desired.",
    "dose": {
      "standard": "Maintenance: 1–1.5 mL/kg/h (typical adult: 80–125 mL/h); post-op: 1 mL/kg/h with 2–4 hourly reassessment; adjust rate based on urine output, fluid balance, and current electrolyte goals",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard maintenance rate; monitor glucose and electrolytes daily"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce rate 0.5–1 mL/kg/h; monitor Na⁺/K⁺/Mg²⁺/phosphate Q12–24h"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Restrict to minimum; use cautiously because K⁺/Mg²⁺/phosphate may accumulate; monitor fluid balance Q8h and electrolytes Q8–12h"
      }
    ],
    "sideEffects": [
      "Hyperglycaemia (glucose content — monitor Q4–6h in DM, ICU, steroid users)",
      "Electrolyte accumulation if renal function is poor (especially K⁺, Mg²⁺, and phosphate)",
      "Volume overload (CHF, cirrhosis, ESRD — restrict accordingly)",
      "Hyponatraemia or hypo-osmotic effect after dextrose metabolism if prolonged infusion exceeds solute needs"
    ],
    "monitoring": [
      "Glucose (Q4–6h in DM or if on insulin)",
      "Serum Na⁺, K⁺, Mg²⁺, and phosphate (Q24h routine; Q8–12h if high risk)",
      "Fluid balance and urine output (Q8h)",
      "Signs of volume overload (oedema, lung crepitations, weight)"
    ],
    "publicNotes": [
      "Taita No. 5 is not plain D5NS; it also contains potassium, magnesium, acetate, and phosphate",
      "Treat it as a maintenance formulation, not a resuscitation fluid",
      "Review renal function and current electrolytes before choosing it for prolonged infusion"
    ],
    "references": [
      {
        "text": "Product Information — Otsuka Pharmaceutical Co., Ltd.",
        "url": null
      }
    ],
    "category": "fluid",
    "localNotes": []
  },
  "ketorolac": {
    "name": "Ketorolac (Toradol)",
    "class": "NSAID — Parenteral",
    "badge": "IV / IM / PO",
    "aliases": [
      "ketorolac",
      "toradol"
    ],
    "pkpd": "Analgesic onset: IV ~10 min, IM 30 min, PO 30–60 min. Peak effect: 1–2h. Duration: 4–6h. Potent parenteral NSAID — analgesia equivalent to ~12 mg morphine IV. Non-selective COX-1/COX-2 inhibitor.",
    "mechanism": "Non-selective COX-1/COX-2 inhibition → reduced prostaglandin synthesis → anti-inflammatory, analgesic, antipyretic. Reversible platelet inhibition (antiplatelet effect lasts ~2 days).",
    "spectrum": "Post-operative pain (opioid-sparing analgesia), renal colic (highly effective — prostaglandin-dependent ureteral contraction), musculoskeletal pain (IV/IM when PO unavailable), moderate-to-severe acute pain, gout flare adjunct.",
    "dose": {
      "standard": "Single dose: 30 mg IV once or 60 mg IM once; Multiple-dose IV/IM: 30 mg q6h (max 120 mg/day); PO continuation only after IV/IM lead-in: 20 mg once, then 10 mg q4–6h PRN (max 40 mg/day); MAXIMUM DURATION: 5 days total across all routes",
      "loading": "Special populations (age ≥65, renally impaired, or weight <50 kg) require lower single and repeated doses"
    },
    "renalAdj": [
      {
        "crcl": "Renally impaired but not advanced renal failure",
        "regimen": "Use the reduced special-population regimen: 15 mg IV/IM q6h (max 60 mg/day); if transitioning to PO, 10 mg once then 10 mg q4–6h PRN after parenteral dosing"
      },
      {
        "crcl": "Advanced renal impairment or volume-depleted patients at risk for renal failure",
        "regimen": "Contraindicated; correct hypovolemia and choose an alternative analgesic"
      }
    ],
    "sideEffects": [
      "AKI (prostaglandin-dependent renal perfusion — especially in hypovolaemia, CKD, CHF, NSAID-naïve elderly, concurrent nephrotoxins; holds renal function in afferent arteriole dilation)",
      "GI ulceration/bleeding (COX-1 gastric mucosal depletion — highest risk with prolonged use; add PPI for courses >3 days or high-risk patients)",
      "Platelet dysfunction (antiplatelet effect — avoid pre-op and in active bleeding/coagulopathy)",
      "Bronchospasm (aspirin-exacerbated respiratory disease)",
      "Wound healing impairment (prolonged use)"
    ],
    "monitoring": [
      "Renal function (SCr, urine output — baseline CrCl before use)",
      "Fluid status (withhold if clinically hypovolaemic)",
      "GI symptoms",
      "Strict ≤5 day duration limit — document start date, verify daily"
    ],
    "publicNotes": [
      "Ketorolac has a strict short-course role; do not let it drift into prolonged NSAID use",
      "Its renal and bleeding risks make patient selection important from the start"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ketorolac"
      },
      {
        "text": "FDA Safety Communication — NSAID Cardiovascular and GI Risks (2015)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-strengthens-warning-non-aspirin-nonsteroidal-anti-inflammatory"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "ibuprofen": {
    "name": "Ibuprofen (Advil / Brufen)",
    "class": "NSAID — Oral",
    "badge": "PO",
    "aliases": [
      "ibuprofen",
      "advil",
      "brufen",
      "nurofen"
    ],
    "pkpd": "Onset: PO 30–60 min. Peak: 1–2h. Duration: 4–6h (standard-release), 8–12h (extended-release). Highly protein-bound (~99%). Hepatic metabolism via CYP2C9. Half-life ~2h.",
    "mechanism": "Non-selective COX-1/COX-2 inhibitor → reduced prostaglandins → analgesic, anti-inflammatory, antipyretic. Reversible platelet inhibition (unlike aspirin — recovers within 24h of last dose).",
    "spectrum": "Mild-to-moderate pain (musculoskeletal, dental, headache, post-operative), fever, dysmenorrhoea, inflammatory conditions (OA, RA, gout flare), patent ductus arteriosus closure (IV neonatal formulation).",
    "dose": {
      "standard": "Analgesia/antipyresis: 400 mg PO q4–6h (max 1200 mg/day OTC); Anti-inflammatory: 400–600 mg PO TID–QID with food (max 2400 mg/day); take with food or milk",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard; limit to shortest effective duration"
      },
      {
        "crcl": "30–59",
        "regimen": "Use with caution; lowest effective dose; shortest course; avoid concurrent nephrotoxins"
      },
      {
        "crcl": "<30",
        "regimen": "AVOID — NSAIDs contraindicated in advanced CKD"
      }
    ],
    "sideEffects": [
      "GI: dyspepsia, nausea, ulceration/bleeding (take with food; add PPI if age >60, prior GI ulcer, or concurrent anticoagulant/steroid)",
      "AKI (prostaglandin-dependent GFR)",
      "Hypertension (Na⁺/water retention; blunts antihypertensives — ACEi/ARBs/diuretics)",
      "CV risk (MI, stroke — class effect for all non-aspirin NSAIDs; lowest CV risk with naproxen)",
      "Drug interactions: blunts aspirin antiplatelet effect (give aspirin ≥30 min before ibuprofen if both needed)"
    ],
    "monitoring": [
      "Renal function (especially CKD, CHF, elderly)",
      "Blood pressure",
      "GI symptoms",
      "Duration of use"
    ],
    "publicNotes": [
      "Ibuprofen is appropriate for many short-course pain indications, but renal, GI, and cardiovascular risks still matter",
      "If aspirin is also being used for antiplatelet effect, dose timing matters because ibuprofen can blunt it"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ibuprofen"
      },
      {
        "text": "FDA Safety Communication — NSAID Cardiovascular and GI Risks (2015)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-strengthens-warning-non-aspirin-nonsteroidal-anti-inflammatory"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "celecoxib": {
    "name": "Celecoxib (Celebrex)",
    "class": "COX-2 Selective Inhibitor",
    "badge": "PO",
    "aliases": [
      "celecoxib",
      "celebrex"
    ],
    "pkpd": "Onset: PO 1h. Peak: 2–3h. Duration: 12h (BID dosing). Highly protein-bound (~97%). Hepatic metabolism via CYP2C9. GI-safer than non-selective NSAIDs (COX-1 sparing).",
    "mechanism": "Selective COX-2 inhibition (inducible, inflammation-related) with sparing of COX-1 (gastric cytoprotection, platelet aggregation) → reduced GI ulceration but NO reduction in CV thrombotic risk vs. non-selective NSAIDs.",
    "spectrum": "Osteoarthritis, rheumatoid arthritis, acute musculoskeletal pain, dysmenorrhoea, ankylosing spondylitis. Preferred in patients with high GI risk. No meaningful advantage over tNSAIDs for renal or CV safety.",
    "dose": {
      "standard": "OA: 200 mg/day as 200 mg once daily or 100 mg BID; RA: 100–200 mg BID; Acute pain/dysmenorrhoea: 400 mg once, then an additional 200 mg if needed on day 1, followed by 200 mg BID PRN; Ankylosing spondylitis: 200 mg/day once daily or divided BID (if no response after 6 weeks, 400 mg/day may be tried)",
      "loading": "400 mg PO loading dose for acute pain/dysmenorrhoea"
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard"
      },
      {
        "crcl": "30–59",
        "regimen": "Lowest effective dose; shortest duration; monitor renal function"
      },
      {
        "crcl": "<30",
        "regimen": "AVOID — same prostaglandin-dependent renal risk as non-selective NSAIDs"
      }
    ],
    "sideEffects": [
      "CV risk: increased MI/stroke (class effect — similar or greater than non-selective NSAIDs at high doses; highlighted post-APPROVE and CLASS trials)",
      "GI: less mucosal ulceration (COX-1 sparing) — GI advantage is eliminated when combined with low-dose aspirin",
      "AKI (same prostaglandin-dependent mechanism)",
      "Hypertension (Na⁺ retention)",
      "Sulfonamide cross-reactivity: theoretical (celecoxib contains sulfonamide group) — monitor in documented sulfa-allergic patients; clinically rare"
    ],
    "monitoring": [
      "Blood pressure",
      "Renal function (especially elderly, CKD, CHF)",
      "CV risk reassessment for long-term use",
      "GI symptoms (add PPI if on concurrent aspirin)"
    ],
    "publicNotes": [
      "Celecoxib can reduce GI toxicity relative to nonselective NSAIDs, but it does not eliminate renal or cardiovascular risk",
      "Its GI advantage shrinks if the patient is also taking aspirin"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=celecoxib"
      },
      {
        "text": "PRECISION Trial — Nissen et al., NEJM 2016",
        "url": "https://doi.org/10.1056/NEJMoa1611593"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "diclofenac": {
    "name": "Diclofenac (Voltaren)",
    "class": "NSAID — PO / IM / Topical",
    "badge": "PO / IM / Topical",
    "aliases": [
      "diclofenac",
      "voltaren",
      "cataflam",
      "voltarol"
    ],
    "pkpd": "PO standard-release: onset 30–60 min, peak 2h, duration 6–8h. Slow-release (SR/XR): 75–100 mg, duration 12–24h. IM: onset 20–30 min. Topical gel: minimal systemic absorption (<10%).",
    "mechanism": "Non-selective COX inhibitor with preferential COX-2 selectivity (among highest selectivity of tNSAIDs) → highest CV thrombotic risk. Inhibits phospholipase A₂ additionally. Highest hepatotoxicity risk of common NSAIDs.",
    "spectrum": "OA, RA, acute musculoskeletal pain (IM for rapid effect), renal/biliary colic (IM), dysmenorrhoea, postoperative pain. Topical gel: OA of hands and knees (minimises systemic exposure in elderly).",
    "dose": {
      "standard": "PO: 50 mg TID or 75 mg SR BID (with food); IM: 75 mg once (max 2 days IM); Topical 1% gel: 2–4 g QID to affected joint (hands/knees — use dosing card)",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard; shortest effective course"
      },
      {
        "crcl": "30–59",
        "regimen": "Lowest effective dose; monitor closely; prefer topical route"
      },
      {
        "crcl": "<30",
        "regimen": "AVOID systemic; topical has minimal renal risk (acceptable with monitoring)"
      }
    ],
    "sideEffects": [
      "Hepatotoxicity: highest among common NSAIDs — LFT elevation in ~15% (usually transient); rare fulminant hepatic failure; monitor LFTs with prolonged use",
      "CV risk: highest CV thrombotic risk among common NSAIDs (COX-2 preferential — similar to celecoxib); avoid in established CV disease",
      "GI: moderate risk (better than indomethacin, similar to ibuprofen)",
      "AKI (same as all NSAIDs)",
      "IM injection site pain/induration"
    ],
    "monitoring": [
      "LFTs (baseline; recheck if symptomatic or >4 weeks use)",
      "Blood pressure",
      "Renal function",
      "CV risk"
    ],
    "publicNotes": [
      "Topical diclofenac is useful when you want local NSAID effect with less systemic exposure",
      "Oral and IM diclofenac carry comparatively higher cardiovascular and hepatic risk than many alternatives"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=diclofenac"
      },
      {
        "text": "FDA Safety Communication — NSAID Cardiovascular and GI Risks (2015)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-strengthens-warning-non-aspirin-nonsteroidal-anti-inflammatory"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "indomethacin": {
    "name": "Indomethacin (Indocid)",
    "class": "NSAID — Potent Non-selective",
    "badge": "PO / PR",
    "aliases": [
      "indomethacin",
      "indocid",
      "indocin"
    ],
    "pkpd": "PO: onset 30 min–2h, peak 2h, duration 4–6h. PR (rectal suppository): onset 30–60 min. Most potent anti-inflammatory NSAID. Good CNS penetration. Strong uricosuric effect.",
    "mechanism": "Most potent non-selective COX-1/COX-2 inhibitor. Also inhibits phospholipase A₂ and leukocyte migration. Closes patent ductus arteriosus by reducing prostaglandin E₂ → ductal smooth muscle constriction.",
    "spectrum": "Acute gout (highly effective first-line), pericarditis (+ colchicine standard combination), ankylosing spondylitis, pleuritis, patent ductus arteriosus closure (IV neonatal), heterotopic ossification prophylaxis post-THA.",
    "dose": {
      "standard": "Acute gout: 50 mg PO/PR TID until pain is tolerable, then taper rapidly to discontinuation; Pericarditis: 25–50 mg PO TID × 2 weeks then taper; AS: 25–75 mg PO BID–TID; PDA (IV neonatal): 0.2 mg/kg per protocol",
      "loading": "Gout: 50 mg initial dose with rapid titration only if clinically needed"
    },
    "renalAdj": [
      {
        "crcl": "Mild-to-moderate renal impairment",
        "regimen": "No label-based reduced-dose table is provided; use the lowest effective dose for the shortest duration and monitor renal function closely"
      },
      {
        "crcl": "Advanced renal disease",
        "regimen": "Avoid unless benefits are expected to outweigh the risk of worsening renal function; if used, monitor closely"
      }
    ],
    "sideEffects": [
      "GI: among the highest ulceration/bleeding risks of the traditional NSAIDs (very potent COX-1 inhibition) — consider gastroprotection in patients with meaningful GI risk factors",
      "CNS: headache, dizziness, confusion, delirium (significant especially in elderly — most common reason for discontinuation)",
      "AKI (prostaglandin-dependent GFR)",
      "Hepatotoxicity (rare)",
      "Hyperkalaemia (high doses — aldosterone blunting)"
    ],
    "monitoring": [
      "GI symptoms (use gastroprotection when GI risk is elevated)",
      "CNS symptoms (confusion/dizziness — reduce dose or switch if significant; avoid in elderly >65)",
      "Renal function",
      "Duration (aim ≤5 days for acute gout)"
    ],
    "publicNotes": [
      "Indomethacin is potent for acute gout and pericarditis but has enough GI and CNS toxicity that it deserves selective use",
      "Older adults often tolerate it poorly compared with other options"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=indomethacin"
      },
      {
        "text": "ESC Pericarditis Guidelines — Adler et al., EHJ 2015",
        "url": "https://doi.org/10.1093/eurheartj/ehv318"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "naproxen": {
    "name": "Naproxen (Aleve / Naprosyn)",
    "class": "NSAID — Long-Acting Oral",
    "badge": "PO",
    "aliases": [
      "naproxen",
      "aleve",
      "naprosyn",
      "anaprox"
    ],
    "pkpd": "Onset: PO 30–60 min. Peak: 1–2h. Duration: 8–12h (BID dosing sufficient). Half-life ~12–17h (longest common NSAID). Highly protein-bound (~99%). Less CYP2C9 metabolism than ibuprofen.",
    "mechanism": "Non-selective COX-1/COX-2 inhibition. Longer half-life allows BID dosing (better adherence). Among non-aspirin NSAIDs, naproxen has the lowest CV thrombotic risk (likely due to sustained COX-1 inhibition mimicking aspirin).",
    "spectrum": "OA, RA, acute gout, musculoskeletal pain, dysmenorrhoea, headache. Preferred NSAID in patients with elevated CV risk who require an NSAID (best CV safety profile among tNSAIDs).",
    "dose": {
      "standard": "Standard: 250–500 mg PO BID (with food); Acute gout: 750 mg loading, then 250 mg q8h × 3 days, then 500 mg BID; Max 1500 mg/day (short-term) or 1000 mg/day (long-term)",
      "loading": "Gout: 750 mg PO loading dose"
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce dose; shortest effective course; monitor renal function"
      },
      {
        "crcl": "<30",
        "regimen": "AVOID — same renal contraindication as other NSAIDs"
      }
    ],
    "sideEffects": [
      "GI: ulceration/bleeding (take with food; add PPI in high-risk patients)",
      "AKI (prostaglandin-dependent — same as all NSAIDs)",
      "Hypertension",
      "CV risk: lowest among non-aspirin NSAIDs (FitzGerald evidence, multiple meta-analyses)",
      "Photosensitivity (uncommon but more than ibuprofen)"
    ],
    "monitoring": [
      "Renal function",
      "Blood pressure",
      "GI symptoms",
      "Duration of use"
    ],
    "publicNotes": [
      "Naproxen is often preferred when an NSAID is needed in a patient with higher cardiovascular risk",
      "BID dosing can improve adherence compared with shorter-acting NSAIDs",
      "Acute gout efficacy is comparable to indomethacin with better CNS tolerability in many patients"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=naproxen"
      },
      {
        "text": "PRECISION Trial — Nissen et al., NEJM 2016",
        "url": "https://doi.org/10.1056/NEJMoa1611593"
      }
    ],
    "category": "nsaid",
    "localNotes": []
  },
  "lactulose": {
    "name": "Lactulose (Duphalac)",
    "class": "Osmotic Laxative — Synthetic Disaccharide",
    "shortName": "Lactulose",
    "badge": "PO / Syrup",
    "aliases": [
      "lactulose",
      "duphalac",
      "cephulac",
      "chronulac"
    ],
    "pkpd": "Onset: 24–48h for laxative effect; 1–3 days for full effect. Not systemically absorbed. Acts locally in colon. For hepatic encephalopathy: ammonia reduction begins within hours. Dose-dependent laxative effect.",
    "mechanism": "Non-absorbable disaccharide → colonic bacteria metabolize to organic acids (lactic, acetic) → acidification → osmotic water retention → stool softening and increased bulk. For HE: acidification traps NH₃ as NH₄⁺ (non-absorbable) → reduces ammonia absorption.",
    "spectrum": "Constipation (1st-line in many guidelines), Hepatic encephalopathy (primary treatment), portal-systemic encephalopathy prevention.",
    "dose": {
      "standard": "Constipation: 15–30 mL (10–20 g) PO BID–TID, titrate to 2–3 soft stools/day; Hepatic encephalopathy: 30–45 mL PO q1–2h until bowel movement, then TID–QID; Retention enema: 300 mL in 700 mL water q4–6h"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal adjustment needed (not systemically absorbed)"
      }
    ],
    "sideEffects": [
      "Diarrhoea (dose-dependent — most common reason to reduce dose)",
      "Bloating and flatulence (colonic fermentation by-products)",
      "Electrolyte imbalance with prolonged use or diarrhoea (hypokalaemia)",
      "Nausea (especially at high doses)",
      "Hypernatraemia (rare, with diarrhoeal fluid losses in elderly)"
    ],
    "monitoring": [
      "Stool frequency and consistency (aim: 2–3 soft stools/day)",
      "Electrolytes (K⁺, Na⁺) with prolonged use or diarrhoea",
      "Mental status in HE patients (clinical assessment preferred over serum ammonia alone)",
      "Blood glucose (lactulose contains galactose + fructose — monitor in diabetes)"
    ],
    "publicNotes": [
      "Lactulose remains a standard treatment for hepatic encephalopathy alongside rifaximin",
      "Titrate dose to achieve soft regular stools, not frank diarrhoea",
      "Expected onset 24–48h — counsel patients to start at a lower dose and titrate up"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=lactulose"
      },
      {
        "text": "AASLD/EASL Hepatic Encephalopathy Practice Guideline 2014",
        "url": "https://doi.org/10.1002/hep.27210"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "senna": {
    "name": "Senna (Sennoside / Glax)",
    "class": "Stimulant Laxative — Anthraquinone",
    "shortName": "Senna",
    "badge": "PO",
    "aliases": [
      "senna",
      "sennoside",
      "glax",
      "nylax",
      "senokot",
      "sennalax"
    ],
    "pkpd": "Onset PO: 6–12h. Metabolized by colonic bacteria to active anthrone metabolites. Minimal systemic absorption.",
    "mechanism": "Colonic bacteria convert sennosides to rheinanthrone → stimulates enteric nerve plexus and colonic smooth muscle → peristalsis → shortened transit time. Also inhibits water/electrolyte absorption from colon.",
    "spectrum": "Short-term constipation, opioid-induced constipation (preferred agent), post-operative constipation, constipation in palliative/cancer patients.",
    "dose": {
      "standard": "Adults: 1 tablet PO QD–BID (standard tablets); titrate up to 4 tablets BID for opioid-induced constipation (higher doses tolerated in palliative care)"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No adjustment needed"
      }
    ],
    "sideEffects": [
      "Diarrhoea (dose-dependent)",
      "Abdominal cramping (smooth muscle stimulation)",
      "Melanosis coli (dark discolouration of colonic mucosa with chronic use — benign, reversible)",
      "Electrolyte imbalance (hypokalaemia with prolonged use)"
    ],
    "monitoring": [
      "Stool frequency",
      "Electrolytes (K⁺) with prolonged use",
      "Duration of use (avoid chronic daily use >1 week without evaluation)"
    ],
    "publicNotes": [
      "Senna is a preferred agent for opioid-induced constipation and widely used in palliative care",
      "Prescribe prophylactically when starting opioids — do not wait for constipation to develop",
      "Melanosis coli is a benign colonoscopy finding — not a sign of harm if use is appropriate"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=senna"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "bisacodyl": {
    "name": "Bisacodyl (Dulcolax)",
    "class": "Stimulant Laxative — Diphenylmethane",
    "shortName": "Bisacodyl",
    "badge": "PO / PR",
    "aliases": [
      "bisacodyl",
      "dulcolax",
      "bisac",
      "laxoberon"
    ],
    "pkpd": "Onset PO: 6–12h (enteric-coated). Onset PR: 15–60 min. Primarily local action. Minimal systemic absorption (high first-pass effect). Pro-drug converted by gut esterases → active BHPM metabolite.",
    "mechanism": "Colonic bacteria and gut esterases convert bisacodyl to BHPM → activates enteric neurons → stimulates colonic propulsive contractions. Reduces water/electrolyte absorption; secretes water and electrolytes into bowel lumen.",
    "spectrum": "Acute constipation, bowel preparation (before procedures), post-operative constipation, opioid-induced constipation adjunct.",
    "dose": {
      "standard": "PO: 5–10 mg at bedtime (onset next morning); PR: 10 mg suppository (onset 15–60 min); Bowel prep: 10–20 mg PO evening before + 10 mg PR morning of procedure"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No adjustment needed"
      }
    ],
    "sideEffects": [
      "Abdominal cramping (common, especially PO — smooth muscle stimulation)",
      "Diarrhoea",
      "Rectal burning/irritation (suppository form)",
      "Hypokalaemia (with excessive or prolonged use)",
      "Nausea (PO form)"
    ],
    "monitoring": [
      "Electrolytes (K⁺) with frequent or prolonged use",
      "Stool frequency and consistency"
    ],
    "publicNotes": [
      "Avoid taking bisacodyl PO within 1 hour of milk or an antacid because the enteric coating can dissolve too early and worsen cramping",
      "PR suppository preferred when rapid effect is needed (15–60 min vs 6–12h for PO)",
      "Do not chew or crush the enteric-coated tablets"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=bisacodyl"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "mag-oxide": {
    "name": "Magnesium Oxide (MgO)",
    "class": "Saline Laxative — Magnesium Salt",
    "shortName": "MgO",
    "badge": "PO",
    "aliases": [
      "magnesium oxide",
      "mgo",
      "mag oxide",
      "magnesia"
    ],
    "pkpd": "Onset: 30 min–6h. About 4–20% of Mg²⁺ is systemically absorbed — excreted renally (risk of hypermagnesaemia in renal impairment). Most retained in GI lumen → osmotic effect.",
    "mechanism": "Mg²⁺ ions → osmotically retain water in intestinal lumen → increased bowel water content → softened stool and increased peristalsis. Mg²⁺ also activates cholecystokinin → stimulates bowel motility.",
    "spectrum": "Chronic constipation (daily prevention), dyspepsia/antacid use, adjunct in hypomagnesaemia prevention (especially with long-term PPI use).",
    "dose": {
      "standard": "Constipation: 250–500 mg PO BID–TID (low preventive dose); 1–2 g PO at bedtime (higher dose for active constipation); take with water; Antacid: 400–800 mg PO QID PRN between meals"
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard"
      },
      {
        "crcl": "30–59",
        "regimen": "Reduce dose; monitor Mg²⁺; avoid prolonged high-dose use"
      },
      {
        "crcl": "<30",
        "regimen": "AVOID or use with extreme caution — hypermagnesaemia risk (nausea, bradycardia, respiratory depression); monitor Mg²⁺ closely"
      }
    ],
    "sideEffects": [
      "Diarrhoea (dose-dependent)",
      "Hypermagnesaemia in renal impairment (nausea → flushing → bradycardia → respiratory depression at severe levels)",
      "Abdominal cramping",
      "Electrolyte imbalance with diarrhoea (hypokalaemia)"
    ],
    "monitoring": [
      "Serum magnesium (especially if CKD or daily dosing)",
      "Renal function (eGFR)",
      "Stool frequency"
    ],
    "publicNotes": [
      "Magnesium oxide is widely used as a daily mild laxative in many Asian countries",
      "Do not confuse magnesium oxide tablets with milk of magnesia, which is magnesium hydroxide",
      "Avoid in significant renal impairment due to risk of magnesium accumulation",
      "MgO has poor bioavailability — not reliable for correcting true hypomagnesaemia; higher-bioavailability forms preferred for supplementation"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=magnesium+oxide"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "glycerin-supp": {
    "name": "Glycerin Suppository",
    "class": "Rectal Laxative — Osmotic / Lubricant",
    "shortName": "Glycerin Supp.",
    "badge": "PR",
    "aliases": [
      "glycerin",
      "glycerol",
      "glycerin suppository",
      "glycerol suppository"
    ],
    "pkpd": "Onset: 15–30 min after rectal insertion. Acts locally — minimal systemic absorption. Softens hardened stool and lubricates rectal vault.",
    "mechanism": "Hyperosmotic agent → draws water into rectal lumen → softens stool. Direct lubricant action. Mild rectal mucosal irritation → reflex peristalsis.",
    "spectrum": "Acute constipation (especially hard, impacted stool in distal rectum), post-operative constipation, constipation in elderly or post-partum patients, faecal impaction as initial adjunct.",
    "dose": {
      "standard": "Adult: 1 suppository (2–3 g) PR; insert pointed end first; retain as long as possible; onset 15–30 min; may repeat once after 30 min if no effect"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No adjustment needed (local rectal action only)"
      }
    ],
    "sideEffects": [
      "Rectal discomfort or burning (mild, transient)",
      "Diarrhoea (if overdone)",
      "Abdominal cramping"
    ],
    "monitoring": [
      "Stool result (document in nursing notes)",
      "Rectal mucosa if repeated use"
    ],
    "publicNotes": [
      "Glycerin suppositories have minimal systemic absorption and are often a low-risk option for rapid rectal relief of constipation",
      "Pregnant patients should still follow product labeling and clinician advice rather than assuming unrestricted use",
      "Ideal for acute symptomatic relief when oral laxatives would take too long (need effect within 15–60 min)"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=glycerin+rectal"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "polyethylene-glycol": {
    "name": "Polyethylene Glycol (PEG) Laxative",
    "class": "Osmotic Laxative — PEG 3350",
    "shortName": "PEG",
    "badge": "PO",
    "aliases": [
      "peg",
      "polyethylene glycol",
      "peg 3350",
      "miralax",
      "forlax"
    ],
    "pkpd": "Onset: 1–3 days for regular dosing. Not systemically absorbed. PEG 3350 is an inert large polymer — passes through GI tract unchanged, retaining water via osmosis. No fermentation → less gas than lactulose.",
    "mechanism": "High-molecular-weight polymer binds water molecules → osmotic retention in colon → stool softening and increased bulk → stimulates peristalsis. No bacterial fermentation (unlike lactulose) → minimal gas and bloating.",
    "spectrum": "Occasional or chronic constipation, functional constipation, and opioid-associated constipation. Higher-dose disimpaction or bowel-prep regimens are product-specific and clinician-directed.",
    "dose": {
      "standard": "Generic PEG 3350 powders: 17 g PO once daily dissolved in 4–8 oz liquid. If using an electrolyte-containing PEG sachet product or a fecal-impaction regimen, follow the specific product/protocol rather than assuming the same dose applies"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "Not meaningfully systemically absorbed, but OTC labeling advises clinician supervision in kidney disease; monitor electrolytes for high-volume, prolonged, or electrolyte-containing regimens"
      }
    ],
    "sideEffects": [
      "Diarrhoea (if excessive dose)",
      "Abdominal bloating (mild — less than lactulose, no fermentation)",
      "Nausea",
      "Electrolyte disturbance (rare, associated with disimpaction doses — check electrolytes)"
    ],
    "monitoring": [
      "Stool frequency and consistency",
      "Electrolytes before and after disimpaction protocol"
    ],
    "publicNotes": [
      "PEG causes less gas and bloating than lactulose because it is not fermented by colonic bacteria",
      "Well-tolerated for constipation management and often first-line for non-encephalopathy constipation",
      "Product identity matters: plain PEG 3350 powders, electrolyte-containing sachets, and bowel-prep PEG products do not share one universal dosing scheme"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=polyethylene+glycol"
      }
    ],
    "category": "laxative",
    "localNotes": []
  },
  "zolpidem": {
    "name": "Zolpidem (Stilnox)",
    "class": "Non-Benzodiazepine Hypnotic — Z-Drug",
    "shortName": "Zolpidem",
    "badge": "PO",
    "aliases": [
      "zolpidem",
      "stilnox",
      "ambien",
      "bikalm"
    ],
    "pkpd": "Onset: 15–30 min. Peak: 1–2h. Duration: 6–8h. T½: 2–3h. Hepatic metabolism (CYP3A4, CYP2C19). Preferential α1 subunit binding → sedation with less anxiolytic/muscle relaxant effect than benzodiazepines.",
    "mechanism": "Positive allosteric modulator of GABA-A receptor at the benzodiazepine site → preferentially binds α1 subunit (BZ1 receptor) → sedation. Less anticonvulsant and muscle relaxant effect compared to traditional benzodiazepines.",
    "spectrum": "Short-term insomnia (sleep onset), acute insomnia in hospitalised patients.",
    "dose": {
      "standard": "Adults: 5–10 mg PO at bedtime; Elderly / Asian populations: 5 mg PO at bedtime (start low — lower CYP metabolism in Asian populations); Max 10 mg/night; Use for shortest duration possible"
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No dosage adjustment recommended in the official label; use the lowest effective dose and monitor closely for oversedation, falls, and next-day impairment"
      },
      {
        "crcl": "Advanced CKD / Dialysis",
        "regimen": "Pharmacokinetics are not markedly changed in renal impairment, but clinical caution is still appropriate; start low and reassess frequently"
      }
    ],
    "sideEffects": [
      "Daytime sedation and next-day impairment (especially at 10 mg or in elderly)",
      "Complex sleep behaviours: sleepwalking, sleep-driving, sleep-eating (FDA black box warning)",
      "Anterograde amnesia",
      "Rebound insomnia on abrupt discontinuation",
      "Dependence (schedule IV controlled — use only short-term)",
      "Falls and fractures (elderly — significant risk)",
      "CNS depression potentiated by alcohol and other CNS depressants"
    ],
    "monitoring": [
      "Falls risk assessment (especially patients >65)",
      "Complex sleep behaviour enquiry at follow-up",
      "Duration of use (limit to 2–4 weeks; reassess regularly)",
      "Respiratory status (caution in OSA, COPD)"
    ],
    "publicNotes": [
      "Zolpidem is not appropriate for long-term insomnia — it addresses symptoms without treating the underlying cause",
      "Cognitive behavioural therapy for insomnia (CBT-I) is the evidence-based long-term treatment",
      "FDA lowered recommended doses for women (5 mg) due to higher blood levels — an effect also observed in many Asian populations"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=zolpidem"
      },
      {
        "text": "FDA Black Box Warning — Complex Sleep Behaviours (2019)",
        "url": "https://www.fda.gov/drugs/drug-safety-and-availability/fda-adds-boxed-warning-risk-serious-injuries-caused-sleepwalking-certain-prescription-insomnia"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "lorazepam": {
    "name": "Lorazepam (Ativan)",
    "class": "Benzodiazepine — Intermediate-Acting",
    "shortName": "Lorazepam",
    "badge": "PO / IV / IM",
    "aliases": [
      "lorazepam",
      "ativan",
      "temesta"
    ],
    "pkpd": "Onset PO: 15–30 min; IV: 2–5 min; IM: 15–30 min. Duration: 6–8h. T½: 10–20h. Direct glucuronidation (no hepatic CYP oxidation) → safer in hepatic impairment and elderly. No active metabolites.",
    "mechanism": "Positive allosteric modulator of GABA-A receptor → increased chloride channel opening frequency → neuronal hyperpolarisation → CNS depression (sedation, anxiolysis, anterograde amnesia, anticonvulsant, muscle relaxation).",
    "spectrum": "Acute anxiety, alcohol withdrawal (CIWA protocol), status epilepticus (first-line IV), procedural sedation, pre-operative anxiolysis, acute agitation, short-term insomnia.",
    "dose": {
      "standard": "Anxiety/sedation: 0.5–2 mg PO/IV/IM q4–8h PRN; Status epilepticus: 0.1 mg/kg IV (max 4 mg) q5–10 min × 2; Alcohol withdrawal (CIWA): 1–4 mg IV/PO q1–4h PRN by score; ICU infusion: 0.02–0.06 mg/kg/h IV",
      "loading": "Status epilepticus: 4 mg IV push (may repeat × 1 in 5–10 min)"
    },
    "renalAdj": [
      {
        "crcl": "Mild-to-moderate renal impairment",
        "regimen": "No specific dosage adjustment is recommended in the official label; monitor sedation and respiratory status"
      },
      {
        "crcl": "Severe renal impairment / ESRD",
        "regimen": "Use cautiously, especially repeated IV/IM dosing, because lorazepam glucuronide can accumulate and prolong CNS effects"
      },
      {
        "crcl": "Dialysis",
        "regimen": "No routine supplemental dose is established; individualize based on clinical response and monitoring"
      }
    ],
    "sideEffects": [
      "CNS depression: sedation, confusion (especially elderly)",
      "Respiratory depression (IV — have airway equipment available)",
      "Anterograde amnesia",
      "Tolerance and physical dependence with prolonged use",
      "Rebound anxiety and withdrawal seizures on abrupt discontinuation",
      "Paradoxical agitation (especially in children and elderly)",
      "Propylene glycol toxicity with high-dose prolonged IV infusion (lactic acidosis, AKI)"
    ],
    "monitoring": [
      "Respiratory rate and SpO₂ (IV use — continuous monitoring)",
      "Level of consciousness (RASS in ICU)",
      "CIWA score (alcohol withdrawal — document before each PRN dose)",
      "Osmol gap and lactate with prolonged high-dose IV infusion (PG toxicity)",
      "Benzodiazepine withdrawal signs if stopping after prolonged use"
    ],
    "publicNotes": [
      "Lorazepam is preferred over diazepam for alcohol withdrawal in hepatic impairment — direct glucuronidation, no CYP oxidation, no active metabolites",
      "For status epilepticus, IV lorazepam is first-line benzodiazepine before levetiracetam or fosphenytoin",
      "Respiratory monitoring is essential for IV administration — resuscitation equipment must be at bedside"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=lorazepam"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "midazolam": {
    "name": "Midazolam (Dormicum)",
    "class": "Benzodiazepine — Short-Acting IV/IM",
    "shortName": "Midazolam",
    "badge": "IV / IM / IN",
    "aliases": [
      "midazolam",
      "dormicum",
      "versed",
      "hypnovel"
    ],
    "pkpd": "Onset IV: 1–5 min; IM: 5–15 min; IN: 5–10 min. Duration IV: 15–80 min (dose-dependent). T½: 1.5–2.5h (active metabolite α-hydroxymidazolam T½ ~1h). Hepatic CYP3A4 metabolism — significantly prolonged in hepatic impairment, elderly, and ICU (drug accumulation with prolonged infusions).",
    "mechanism": "Most potent GABA-A positive allosteric modulator among benzodiazepines. Water-soluble at pH <4 → lipophilic at physiologic pH → rapid CNS penetration. Produces sedation, anxiolysis, anterograde amnesia, and anticonvulsant effects.",
    "spectrum": "Procedural sedation (endoscopy, cardioversion, intubation), pre-operative anxiolysis, ICU sedation (infusion), status epilepticus (refractory — IM/IN preferred pre-hospital), seizure clusters (buccal/intranasal), palliative terminal sedation.",
    "dose": {
      "standard": "Procedural sedation: 0.5–2 mg IV titrated q2–3 min (max 5 mg for naïve patients); Elderly: start 0.5 mg IV, max 3.5 mg; ICU sedation: 0.01–0.1 mg/kg/h IV infusion (titrate to RASS target); Status epilepticus: 10 mg IM (adult)",
      "loading": "Procedural: initial 0.5–2 mg IV bolus (elderly: 0.5 mg); ICU: 0.01–0.05 mg/kg optional IV load"
    },
    "renalAdj": [
      {
        "crcl": "Mild-to-moderate renal impairment",
        "regimen": "No fixed dosage adjustment is established; titrate cautiously because sedation may be prolonged"
      },
      {
        "crcl": "Severe renal impairment",
        "regimen": "Use conservative dosing and close monitoring because midazolam and active metabolite effects can be more pronounced and prolonged"
      },
      {
        "crcl": "Dialysis/CRRT",
        "regimen": "No fixed dose adjustment is established; use cautious titration with continuous sedation and respiratory monitoring"
      }
    ],
    "sideEffects": [
      "Respiratory depression (SIGNIFICANT — airway management equipment mandatory for IV use)",
      "Hypotension (especially in volume-depleted or elderly patients)",
      "CNS depression",
      "Anterograde amnesia (useful for procedures)",
      "Hiccups (common with IV bolus)",
      "Drug accumulation with prolonged ICU infusion → prolonged sedation, tolerance"
    ],
    "monitoring": [
      "Continuous SpO₂ and capnography (mandatory for procedural sedation)",
      "Blood pressure and heart rate",
      "RASS or Ramsay scale for ICU sedation depth",
      "Flumazenil availability (reversal agent — note: shorter T½ than midazolam; may re-sedate)",
      "Daily spontaneous awakening trial in ICU"
    ],
    "publicNotes": [
      "Midazolam requires continuous monitoring and airway management readiness when given IV — never for unsupervised administration",
      "Flumazenil reversal: 0.2 mg IV q1 min to max 1 mg — patient may re-sedate after reversal; observe for ≥2 hours",
      "Prolonged ICU infusions lead to drug accumulation, tolerance, and prolonged awakening — daily awakening trials recommended"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=midazolam"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "melatonin": {
    "name": "Melatonin",
    "class": "Melatonin Receptor Agonist — Circadian Regulator",
    "shortName": "Melatonin",
    "badge": "PO",
    "aliases": [
      "melatonin",
      "circadin",
      "slenyto"
    ],
    "pkpd": "Onset: 30–60 min. T½: 45–65 min (short). Hepatic CYP1A2 metabolism. Extensive first-pass effect → bioavailability ~15%. Peak levels delayed by food. Does not produce pharmacological CNS depression.",
    "mechanism": "Agonist at MT1 and MT2 receptors in suprachiasmatic nucleus → MT1: acute sleep onset promotion; MT2: circadian phase shifting. Reinforces the endogenous circadian signal for sleep without sedation, dependence, or respiratory depression.",
    "spectrum": "Jet lag, circadian rhythm disorders, insomnia adjunct (especially in elderly), ICU delirium prevention (adjunct), insomnia where sedative-hypnotics are contraindicated.",
    "dose": {
      "standard": "Insomnia: 0.5–5 mg PO 30–60 min before desired sleep time; Start 1–3 mg; titrate; Elderly: 0.5–2 mg; Jet lag: 3–5 mg at destination bedtime for 3–5 days; Take in dim light"
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No dose adjustment necessary; caution in severe renal impairment (clearance reduced — accumulation possible)"
      }
    ],
    "sideEffects": [
      "Daytime drowsiness if taken at wrong time or at high dose",
      "Headache",
      "Dizziness",
      "Nausea",
      "Hypothermia (high doses, rare)"
    ],
    "monitoring": [
      "Sleep quality and timing (diary helpful)",
      "Duration of use"
    ],
    "publicNotes": [
      "Melatonin is not a sedative — it shifts and reinforces the circadian sleep signal rather than inducing pharmacological sedation",
      "Timing matters more than dose — take 30–60 min before desired sleep time, in dim light conditions",
      "Much safer than benzodiazepines or Z-drugs — no dependence risk, no rebound insomnia, minimal next-day impairment at standard doses"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=melatonin"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "hydroxyzine": {
    "name": "Hydroxyzine (Atarax)",
    "class": "Sedating Antihistamine — H1 Receptor Antagonist",
    "shortName": "Hydroxyzine",
    "badge": "PO / IM",
    "aliases": [
      "hydroxyzine",
      "atarax",
      "vistaril"
    ],
    "pkpd": "Onset PO: 15–30 min. Peak: 2h. Duration: 4–6h. T½: 20–25h (longer in elderly). Hepatic metabolism → active metabolite cetirizine (non-sedating antihistamine). CYP3A4/2D6 substrate.",
    "mechanism": "H1 receptor antagonist with significant CNS penetration → sedation. Also anticholinergic and mild anxiolytic (serotonin antagonism, GABA potentiation). Active metabolite cetirizine provides antihistamine effects without sedation.",
    "spectrum": "Pruritus (first-line antihistamine for itching), anxiety/tension (adjunct, short-term), sleep induction (short-term), nausea/vomiting, procedural anxiolysis.",
    "dose": {
      "standard": "Pruritus/anxiety: 25–50 mg PO QID PRN; Sleep: 50–100 mg PO at bedtime; IM: 25–100 mg IM q4–6h PRN (IM only — NEVER IV: causes thrombosis and tissue necrosis)"
    },
    "renalAdj": [
      {
        "crcl": "Any renal impairment",
        "regimen": "Official labeling does not provide a renal-dose table; start at the low end of the dosing range and monitor closely for oversedation and anticholinergic adverse effects"
      },
      {
        "crcl": "Dialysis",
        "regimen": "No standard post-dialysis supplemental dosing is established; if sedation risk is high, consider an alternative agent"
      }
    ],
    "sideEffects": [
      "Drowsiness (therapeutic at sleep doses; can be excessive in elderly)",
      "Dry mouth (anticholinergic)",
      "Urinary retention (anticholinergic — caution in BPH)",
      "QTc prolongation (higher doses — avoid with other QTc-prolonging drugs)",
      "Severe tissue necrosis if given IV (NEVER give IV — IM only for injectable)",
      "Falls and cognitive impairment in elderly (Beers Criteria)"
    ],
    "monitoring": [
      "QTc (ECG) at higher doses or with baseline QTc prolongation",
      "Anticholinergic effects (urinary retention, confusion in elderly)",
      "Sedation level"
    ],
    "publicNotes": [
      "Never administer hydroxyzine IV — IM only for injectable form; IV causes severe thrombosis and tissue necrosis",
      "QT risk is most relevant in patients with prolonged QT, structural heart disease, electrolyte abnormalities, bradyarrhythmia, or concomitant QT-prolonging drugs",
      "A reasonable non-controlled alternative to benzodiazepines for mild insomnia or procedural anxiolysis when those cardiac and anticholinergic risks are acceptable"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=hydroxyzine"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "triazolam": {
    "name": "Triazolam (Halcion)",
    "class": "Benzodiazepine Hypnotic — Ultra-Short-Acting",
    "shortName": "Triazolam",
    "badge": "PO",
    "aliases": [
      "triazolam",
      "halcion",
      "apo-triazo"
    ],
    "pkpd": "Onset: 15–30 min. Peak: 1–2h. Duration: 6–7h. T½: 1.5–5h (ultra-short — minimal daytime carry-over). Hepatic CYP3A4 metabolism → inactive metabolites (no active metabolite). Highly sensitive to CYP3A4 inhibitors (azoles, macrolides).",
    "mechanism": "Positive allosteric modulator of GABA-A receptor → sedation, anxiolysis, anterograde amnesia. Shortest-acting benzodiazepine hypnotic — selected to minimise next-day impairment versus longer-acting agents.",
    "spectrum": "Short-term insomnia (sleep onset and early maintenance), situational insomnia (travel, pre-procedure).",
    "dose": {
      "standard": "Adults: 0.125–0.25 mg PO at bedtime; Elderly/frail: 0.125 mg PO at bedtime strictly; Maximum: 0.25 mg/night; Limit to ≤2 weeks; avoid concurrent CYP3A4 inhibitors"
    },
    "renalAdj": [
      {
        "crcl": "Any renal impairment",
        "regimen": "Official labeling does not provide a renal-specific dose adjustment; observe usual precautions in renal impairment and use the lowest effective dose"
      }
    ],
    "sideEffects": [
      "Daytime drowsiness (less than longer-acting benzodiazepines)",
      "Anterograde amnesia (travellers amnesia with high doses)",
      "Rebound insomnia on discontinuation (more pronounced than with longer-acting agents)",
      "Complex sleep behaviours (sleepwalking, sleep-eating)",
      "Dependence (schedule 4 controlled substance)",
      "Paradoxical agitation or aggression (rare, especially in elderly)",
      "CNS depression with alcohol"
    ],
    "monitoring": [
      "Sleep quality and duration",
      "Complex sleep behaviour enquiry",
      "Duration of use (limit to 2 weeks)",
      "CYP3A4 drug interactions (azoles dramatically increase triazolam levels → toxicity)"
    ],
    "publicNotes": [
      "Triazolam is contraindicated with potent CYP3A inhibitors such as ketoconazole, itraconazole, nefazodone, and several HIV protease inhibitors; other azoles and macrolides can still raise levels substantially",
      "Rebound insomnia on stopping is more pronounced than with longer-acting agents — taper if used >2 weeks",
      "Shortest-acting benzodiazepine hypnotic — preferred when minimal daytime carry-over is a priority"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=triazolam"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "acetaminophen": {
    "name": "Acetaminophen (Paracetamol)",
    "class": "Analgesic / Antipyretic",
    "shortName": "Acetaminophen",
    "badge": "PO / IV / PR",
    "aliases": [
      "acetaminophen",
      "paracetamol",
      "tylenol",
      "pcm",
      "apap"
    ],
    "pkpd": "Analgesic and antipyretic effect without clinically meaningful anti-inflammatory or antiplatelet activity. Primarily hepatic glucuronidation/sulfation with a small CYP2E1 pathway producing NAPQI, which is detoxified by glutathione under usual dosing.",
    "mechanism": "Predominantly central prostaglandin synthesis inhibition with downstream analgesic and antipyretic effects. Lacks the peripheral COX inhibition profile of NSAIDs.",
    "spectrum": "First-line mild to moderate pain and fever control, especially when NSAIDs are a poor fit because of GI, renal, or bleeding risk.",
    "dose": {
      "standard": "650 mg PO/IV/PR q6h or 1 g q6–8h PRN; usual adult maximum 4 g/day from ALL sources. Frailty, malnutrition, chronic alcohol use, or liver disease often justify keeping total daily dose ≤3 g/day",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "Standard dosing; track the total daily dose from all acetaminophen-containing products"
      },
      {
        "crcl": "10–49",
        "regimen": "Usual dose generally acceptable; many institutions prefer at least a q6h interval"
      },
      {
        "crcl": "<10 / HD",
        "regimen": "Use a conservative total daily dose and consider q8h spacing; no routine post-HD supplemental dose"
      }
    ],
    "sideEffects": [
      "Hepatotoxicity in overdose or repeated cumulative excess dosing",
      "Medication-overlap toxicity when combination products are missed",
      "Rare rash or severe cutaneous reactions (SJS/TEN)",
      "Hypotension with IV formulation, especially in critically ill or volume-depleted patients"
    ],
    "monitoring": [
      "Total 24-hour acetaminophen exposure from all sources and routes",
      "LFTs if prolonged high-dose use or baseline liver disease",
      "Pain and fever response"
    ],
    "publicNotes": [
      "Count all combination products because duplicate acetaminophen exposure is a common preventable toxicity",
      "A strong default analgesic when NSAIDs are undesirable, but it does not replace anti-inflammatory therapy when inflammation is the main problem"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=acetaminophen"
      }
    ],
    "category": "analgesic",
    "localNotes": []
  },
  "pantoprazole": {
    "name": "Pantoprazole (Protonix)",
    "class": "Proton Pump Inhibitor",
    "shortName": "Pantoprazole",
    "badge": "PO / IV",
    "aliases": [
      "pantoprazole",
      "protonix",
      "pantoloc",
      "pantop"
    ],
    "pkpd": "Irreversible H+/K+-ATPase inhibition. Serum half-life is short, but acid suppression lasts much longer because new proton pumps must be synthesized. Full effect builds over several doses rather than immediately.",
    "mechanism": "Acid-activated prodrug that covalently binds the gastric parietal-cell proton pump, producing sustained suppression of gastric acid secretion.",
    "spectrum": "GERD, erosive esophagitis, upper-GI-bleed protocols, selected ICU stress-ulcer prophylaxis, and GI protection when high-risk NSAID or antithrombotic therapy cannot be avoided.",
    "dose": {
      "standard": "40 mg PO/IV daily for routine acid suppression. Upper GI bleed protocols commonly use higher-dose IV regimens per local pathway",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "HD / PD",
        "regimen": "Standard dose; no routine post-dialysis supplement"
      }
    ],
    "sideEffects": [
      "Headache",
      "Diarrhoea or abdominal discomfort",
      "Hypomagnesemia with prolonged use",
      "C. difficile and enteric infection risk with chronic unnecessary therapy",
      "Acute interstitial nephritis (rare but important)"
    ],
    "monitoring": [
      "Reassess whether an ongoing indication still exists",
      "Mg and vitamin B12 for prolonged therapy or unexplained deficiency symptoms",
      "GI bleeding or ulcer-recurrence context rather than symptom suppression alone"
    ],
    "publicNotes": [
      "Not every admitted patient needs stress-ulcer prophylaxis; deprescribe when the indication disappears",
      "Pantoprazole is usually the easiest PPI choice when clopidogrel is also needed because omeprazole and esomeprazole inhibit CYP2C19 more strongly"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=pantoprazole"
      }
    ],
    "category": "gi",
    "subcategory": "acid",
    "localNotes": []
  },
  "heparin": {
    "name": "Heparin (Unfractionated Heparin, UFH)",
    "class": "Anticoagulant - Unfractionated Heparin",
    "shortName": "UFH",
    "badge": "IV / SC",
    "aliases": [
      "heparin",
      "heparin sodium",
      "ufh",
      "unfractionated heparin"
    ],
    "pkpd": "Immediate effect with IV dosing and short functional half-life, but interpatient response is variable because of protein binding and acute-phase effects. Therapeutic use needs aPTT or anti-Xa titration.",
    "mechanism": "Potentiates antithrombin and accelerates inhibition of thrombin (IIa) and factor Xa, preventing further clot propagation.",
    "spectrum": "Inpatient VTE treatment or prophylaxis, ACS regimens, bridging, and situations where rapid on/off anticoagulation is needed or kidney function is changing quickly.",
    "dose": {
      "standard": "Prophylaxis: 5000 units SC q8–12h. Therapeutic IV regimens are protocol-based; label and institutional nomograms commonly use an IV bolus followed by continuous infusion titrated to aPTT or anti-Xa",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No formal renal dose adjustment; therapeutic infusions are titrated to aPTT or anti-Xa rather than CrCl alone"
      },
      {
        "crcl": "Advanced CKD / dialysis",
        "regimen": "Often preferred over LMWH when rapid reversal or close titration is important"
      }
    ],
    "sideEffects": [
      "Bleeding",
      "Heparin-induced thrombocytopenia (HIT)",
      "Injection-site hematoma",
      "Hyperkalemia from hypoaldosteronism (rare)",
      "Osteoporosis with prolonged high exposure"
    ],
    "monitoring": [
      "aPTT or anti-Xa for therapeutic dosing",
      "Platelet trend for HIT surveillance",
      "Hemoglobin and overt bleeding review",
      "K⁺ if prolonged therapy or other hyperkalemia risks are present"
    ],
    "publicNotes": [
      "Do not confuse therapeutic heparin with heparin flush products because concentrations and intent are very different",
      "UFH is often a safer anticoagulant starting point than LMWH when kidney function is unstable or urgent procedures are likely"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=heparin+sodium+injection"
      }
    ],
    "category": "anticoagulant",
    "localNotes": []
  },
  "apixaban": {
    "name": "Apixaban (Eliquis)",
    "class": "Anticoagulant - Factor Xa Inhibitor (DOAC)",
    "shortName": "Apixaban",
    "badge": "PO",
    "aliases": [
      "apixaban",
      "eliquis"
    ],
    "pkpd": "Predictable oral factor Xa inhibition with onset in a few hours and a half-life around 12 hours. Less renal clearance than some other DOACs, but bleeding risk still rises with frailty, procedures, and concomitant antithrombotics.",
    "mechanism": "Direct, selective, reversible inhibition of free and clot-bound factor Xa, reducing thrombin generation and clot propagation.",
    "spectrum": "Nonvalvular atrial fibrillation stroke prevention, DVT/PE treatment, extended VTE prevention, and selected postoperative prophylaxis.",
    "dose": {
      "standard": "NVAF: 5 mg PO BID. DVT/PE treatment: 10 mg PO BID for 7 days, then 5 mg PO BID. Extended VTE prevention: 2.5 mg PO BID",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Use the indication-specific standard dose unless another labeled reduction rule applies"
      },
      {
        "crcl": "<30",
        "regimen": "No single universal CrCl-based reduction fits all adult indications; review age, weight, serum creatinine, bleeding risk, and local policy carefully"
      },
      {
        "crcl": "Dialysis / ESRD",
        "regimen": "Use specialist or institutional guidance rather than a generic table dose"
      }
    ],
    "sideEffects": [
      "Bleeding including GI, GU, and intracranial bleeding",
      "Bruising",
      "Anaemia",
      "Spinal or epidural hematoma around neuraxial procedures"
    ],
    "monitoring": [
      "CBC and bleeding review",
      "Renal function for clinical context and peri-procedural planning",
      "Medication interaction review, especially strong P-gp/CYP3A4 modifiers"
    ],
    "publicNotes": [
      "Routine INR testing is not useful for apixaban effect monitoring",
      "For atrial fibrillation, the 2.5 mg BID dose is for specific labeled reduction criteria, not simply for any CKD by itself",
      "Temporary holds for procedures should follow both procedural bleeding risk and the thrombotic indication"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=apixaban"
      }
    ],
    "category": "anticoagulant",
    "localNotes": []
  },
  "warfarin": {
    "name": "Warfarin",
    "class": "Anticoagulant - Vitamin K Antagonist",
    "shortName": "Warfarin",
    "badge": "PO",
    "aliases": [
      "warfarin",
      "coumadin"
    ],
    "pkpd": "Delayed onset and offset because active clotting factors must turn over. Narrow therapeutic index with large effects from diet, liver function, genetics, interacting drugs, and acute illness. INR is the operational exposure marker.",
    "mechanism": "Inhibits vitamin K epoxide reductase (VKORC1), reducing activation of factors II, VII, IX, and X plus proteins C and S.",
    "spectrum": "Mechanical valves, selected atrial fibrillation or VTE patients, APS or other situations where a DOAC is unsuitable or not preferred.",
    "dose": {
      "standard": "Individualized. Common adult starts are 2–5 mg PO daily with INR-guided adjustment. Acute VTE generally needs overlap with parenteral anticoagulation until the INR is therapeutic as indicated",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No formal renal dose adjustment; dose to INR and start conservatively in frailty, malnutrition, liver disease, or high bleeding risk"
      },
      {
        "crcl": "Advanced CKD / dialysis",
        "regimen": "Still INR-guided rather than CrCl-guided, but bleeding and calciphylaxis risk are higher so closer follow-up is important"
      }
    ],
    "sideEffects": [
      "Bleeding",
      "Skin necrosis early in therapy (rare)",
      "Calciphylaxis (rare, especially in CKD)",
      "Purple toe syndrome / cholesterol microembolization"
    ],
    "monitoring": [
      "INR",
      "CBC and bleeding review",
      "Medication and diet interaction review",
      "Adherence and duplicate-anticoagulant exposure"
    ],
    "publicNotes": [
      "Warfarin remains first-line for mechanical valves and some APS patients",
      "Antibiotics, amiodarone, azoles, rifampin, herbal products, and vitamin K diet changes can all shift INR substantially",
      "Never assume a stable outpatient dose will stay stable through an acute admission"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=warfarin"
      }
    ],
    "category": "anticoagulant",
    "localNotes": []
  },
  "aspirin": {
    "name": "Aspirin (ASA)",
    "class": "Antiplatelet / NSAID",
    "shortName": "Aspirin",
    "badge": "PO",
    "aliases": [
      "aspirin",
      "asa",
      "acetylsalicylic acid",
      "ecasa",
      "low-dose aspirin"
    ],
    "pkpd": "Irreversible platelet COX-1 inhibition lasts for the platelet lifespan. Low antiplatelet doses and higher analgesic doses share the same salicylate biology, but bleeding and GI toxicity rise with exposure.",
    "mechanism": "Irreversibly acetylates cyclooxygenase, suppressing thromboxane A2 in platelets and reducing platelet aggregation. Higher doses also reduce prostaglandin-mediated pain and inflammation.",
    "spectrum": "Secondary ASCVD prevention, ACS protocols, stroke/TIA and PAD antiplatelet therapy, and limited analgesic or antipyretic use at higher doses.",
    "dose": {
      "standard": "Antiplatelet maintenance: 81–100 mg PO daily. ACS loading commonly uses 162–325 mg chewed once, then 81 mg daily",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No standard renal dose adjustment for low-dose antiplatelet therapy"
      },
      {
        "crcl": "Advanced CKD / volume depletion",
        "regimen": "Avoid high analgesic doses and reassess the antiplatelet indication versus bleeding risk carefully"
      }
    ],
    "sideEffects": [
      "GI irritation, ulceration, or bleeding",
      "Bleeding and bruising",
      "Bronchospasm in aspirin-exacerbated respiratory disease",
      "Tinnitus or salicylism at higher doses"
    ],
    "monitoring": [
      "Bleeding symptoms",
      "GI tolerance",
      "Clear indication if combined with anticoagulants or another antiplatelet"
    ],
    "publicNotes": [
      "For long-term cardiovascular prevention, 81 mg daily is usually the maintenance dose",
      "Chewable or non-enteric aspirin is preferred when rapid ACS antiplatelet effect is needed because enteric-coated tablets are slower"
    ],
    "references": [
      {
        "text": "FDA / DailyMed Product Information",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=aspirin"
      }
    ],
    "category": "antiplatelet",
    "localNotes": []
  },
  "clopidogrel": {
    "name": "Clopidogrel (Plavix)",
    "class": "Antiplatelet - P2Y12 Inhibitor",
    "shortName": "Clopidogrel",
    "badge": "PO",
    "aliases": [
      "clopidogrel",
      "plavix"
    ],
    "pkpd": "Prodrug that requires CYP2C19 activation. Irreversible platelet inhibition builds over several days without loading, but a loading dose produces faster effect when ACS or PCI protocols require it.",
    "mechanism": "Irreversibly blocks the platelet ADP P2Y12 receptor, reducing activation of the GPIIb/IIIa pathway and platelet aggregation.",
    "spectrum": "ACS and DAPT pathways, post-PCI antiplatelet therapy, aspirin-intolerant secondary prevention, and secondary prevention after recent MI, stroke, or PAD.",
    "dose": {
      "standard": "Maintenance: 75 mg PO daily. ACS/PCI loading commonly uses 300–600 mg PO once, then 75 mg daily with aspirin according to indication",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No standard renal dose adjustment"
      },
      {
        "crcl": "Advanced CKD",
        "regimen": "Use standard dosing but reassess net benefit frequently because both bleeding and thrombotic risk are higher"
      }
    ],
    "sideEffects": [
      "Bleeding",
      "Bruising",
      "Rash or diarrhoea",
      "Thrombotic thrombocytopenic purpura (rare)",
      "Reduced antiplatelet effect with poor CYP2C19 activation or interacting drugs"
    ],
    "monitoring": [
      "Bleeding review",
      "Medication interaction review",
      "Platelet count if thrombocytopenia or TTP is suspected"
    ],
    "publicNotes": [
      "Avoid omeprazole and esomeprazole when possible because they reduce CYP2C19 activation; pantoprazole is usually the easiest alternative if a PPI is needed",
      "Clopidogrel is commonly paired with aspirin after ACS or PCI, but the duration depends on stent type and bleeding risk"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=clopidogrel"
      }
    ],
    "category": "antiplatelet",
    "localNotes": []
  },
  "furosemide": {
    "name": "Furosemide (Lasix)",
    "class": "Loop Diuretic",
    "shortName": "Furosemide",
    "badge": "PO / IV",
    "aliases": [
      "furosemide",
      "lasix"
    ],
    "pkpd": "Rapid natriuresis with variable oral bioavailability and a brisker IV effect. Diuretic response falls when renal perfusion is poor or nephron sodium avidity is high, so escalating dose or IV strategy is often more important than sticking to one nominal dose.",
    "mechanism": "Inhibits the Na-K-2Cl cotransporter in the thick ascending limb, causing potent natriuresis, kaliuresis, and venodilation.",
    "spectrum": "Volume overload from heart failure, cirrhosis, nephrotic syndrome, or CKD; adjunct BP control when edema is present; pulmonary edema and hyperkalemia support in selected settings.",
    "dose": {
      "standard": "PO: 20–80 mg once or twice daily, titrated to response. IV: 20–40 mg, then titrate based on prior diuretic exposure and response; higher doses are often needed in CKD or chronic loop use",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥30",
        "regimen": "Standard starting doses usually work, but titrate to urine output, weight, edema, and creatinine response"
      },
      {
        "crcl": "<30",
        "regimen": "Higher doses are commonly required because diuretic delivery to the tubule is reduced; monitor renal function and electrolytes closely"
      },
      {
        "crcl": "HD / advanced ESRD",
        "regimen": "Only useful if meaningful residual urine output remains; otherwise routine loop escalation adds little benefit"
      }
    ],
    "sideEffects": [
      "Hypokalemia and metabolic alkalosis",
      "AKI or prerenal azotemia from overdiuresis",
      "Hypotension",
      "Hyponatremia or hypomagnesemia",
      "Ototoxicity with high-dose rapid IV use or concurrent ototoxins"
    ],
    "monitoring": [
      "Daily weight and volume exam",
      "Serum electrolytes and creatinine",
      "Urine output and diuretic response",
      "Blood pressure and orthostasis"
    ],
    "publicNotes": [
      "The right furosemide dose is the dose that actually produces decongestion, not the dose that looks conservative on paper",
      "If urine output is poor, check adherence, gut edema, renal perfusion, NSAID exposure, and whether a higher or IV dose is needed before declaring failure"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=furosemide"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "diuretic",
    "localNotes": []
  },
  "spironolactone": {
    "name": "Spironolactone",
    "class": "Mineralocorticoid Receptor Antagonist / Potassium-Sparing Diuretic",
    "shortName": "Spironolactone",
    "badge": "PO",
    "aliases": [
      "spironolactone",
      "aldactone"
    ],
    "pkpd": "Slow onset compared with loop diuretics because downstream sodium handling and aldosterone signaling must shift. Hyperkalemia risk rises substantially when kidney function falls or other potassium-raising drugs are added.",
    "mechanism": "Competitive mineralocorticoid receptor antagonism in the distal nephron reduces sodium reabsorption and potassium excretion; also has antiandrogen effects.",
    "spectrum": "HFrEF mortality reduction, resistant hypertension, cirrhotic ascites, edema states with hyperaldosteronism, and primary hyperaldosteronism workup or treatment.",
    "dose": {
      "standard": "HF or hypertension: 12.5–25 mg PO daily, titrated as tolerated. Ascites regimens often start around 100 mg/day and are frequently paired with furosemide",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": ">50",
        "regimen": "12.5–25 mg daily is a common start if serum potassium is acceptable"
      },
      {
        "crcl": "30–50",
        "regimen": "Consider 12.5–25 mg every other day or very cautious daily dosing with early potassium/creatinine recheck"
      },
      {
        "crcl": "<30",
        "regimen": "Usually avoid routine use because hyperkalemia risk is high unless there is a specific expert-guided indication"
      }
    ],
    "sideEffects": [
      "Hyperkalemia",
      "Worsening renal function",
      "Gynecomastia or breast tenderness",
      "Menstrual irregularity",
      "GI upset"
    ],
    "monitoring": [
      "K⁺ and creatinine within about 1 week of start or dose change, then periodically",
      "Blood pressure and volume status",
      "Breast or endocrine adverse effects on longer courses"
    ],
    "publicNotes": [
      "Spironolactone is often low-dose high-value therapy, but only if potassium and kidney follow-up actually happen",
      "Combining spironolactone with ACEi/ARB, potassium supplements, or NSAIDs is where many preventable hyperkalemia problems begin"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=spironolactone"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "diuretic",
    "localNotes": []
  },
  "losartan": {
    "name": "Losartan",
    "class": "Angiotensin II Receptor Blocker (ARB)",
    "shortName": "Losartan",
    "badge": "PO",
    "aliases": [
      "losartan",
      "cozaar",
      "losartan potassium"
    ],
    "pkpd": "Once-daily ARB with active metabolite contribution. BP effect accumulates over days to weeks rather than after one dose, while creatinine and potassium effects can appear quickly if renal perfusion is marginal.",
    "mechanism": "Blocks the angiotensin II AT1 receptor, reducing vasoconstriction, aldosterone signaling, and maladaptive glomerular efferent arteriolar tone.",
    "spectrum": "Hypertension, albuminuric diabetic kidney disease, CKD or HF regimens where RAAS blockade is indicated, and proteinuria reduction.",
    "dose": {
      "standard": "Usually 25–50 mg PO daily to start; common maintenance 50–100 mg/day in 1 or 2 doses depending on BP, kidney function, and tolerance",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No formal renal dose adjustment, but start lower and monitor closely if volume-depleted, advanced CKD, or hemodynamically fragile"
      },
      {
        "crcl": "Rising creatinine or hyperkalemia",
        "regimen": "Reassess dose, volume status, NSAID exposure, and whether continued RAAS blockade still offers net benefit"
      }
    ],
    "sideEffects": [
      "Hyperkalemia",
      "Rise in creatinine after initiation",
      "Hypotension, especially if volume depleted",
      "Rare angioedema"
    ],
    "monitoring": [
      "K⁺ and creatinine after start or dose change",
      "Blood pressure",
      "Concurrent NSAID, potassium supplement, or duplicate RAAS exposure review"
    ],
    "publicNotes": [
      "A small creatinine rise after starting an ARB can be expected, but a large jump should trigger a search for overdiuresis, renal artery disease, sepsis, or NSAID-related hemodynamic injury",
      "ARBs are contraindicated in pregnancy and should be stopped if pregnancy occurs"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=losartan"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "blood-pressure",
    "localNotes": []
  },
  "amlodipine": {
    "name": "Amlodipine",
    "class": "Dihydropyridine Calcium Channel Blocker",
    "shortName": "Amlodipine",
    "badge": "PO",
    "aliases": [
      "amlodipine",
      "norvasc",
      "amlor"
    ],
    "pkpd": "Long half-life supports once-daily dosing and smooth BP control. It lowers blood pressure gradually and does not need renal adjustment.",
    "mechanism": "Blocks L-type calcium channels in vascular smooth muscle, producing arterial vasodilation with minimal direct AV nodal effect at usual doses.",
    "spectrum": "Hypertension and chronic angina, especially when a once-daily BP agent with preserved renal tolerance is useful.",
    "dose": {
      "standard": "Start 2.5–5 mg PO daily; usual maintenance 5–10 mg daily. Frail, elderly, or hepatically impaired patients often start at 2.5 mg",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "Advanced CKD",
        "regimen": "Standard dosing remains appropriate; monitor edema and blood pressure response rather than changing dose for renal function alone"
      }
    ],
    "sideEffects": [
      "Peripheral edema",
      "Flushing or headache",
      "Palpitations",
      "Gingival hyperplasia (long-term, uncommon)",
      "Hypotension"
    ],
    "monitoring": [
      "Blood pressure",
      "Peripheral edema and symptom burden",
      "Adherence, because the long half-life can hide missed-dose patterns"
    ],
    "publicNotes": [
      "Amlodipine edema is from precapillary vasodilation and is not the same thing as volume overload, so reflex loop-diuretic escalation is often the wrong fix",
      "A useful BP option when CKD makes ACEi/ARB titration difficult or when beta-blockers are not desired"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amlodipine"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "blood-pressure",
    "localNotes": []
  },
  "atorvastatin": {
    "name": "Atorvastatin (Lipitor)",
    "class": "HMG-CoA Reductase Inhibitor (Statin)",
    "shortName": "Atorvastatin",
    "badge": "PO",
    "aliases": [
      "atorvastatin",
      "lipitor"
    ],
    "pkpd": "Potent LDL lowering with hepatic CYP3A4 metabolism and a long enough effect for once-daily dosing. Cardiovascular benefit comes from sustained long-term use, not short inpatient exposure alone.",
    "mechanism": "Inhibits HMG-CoA reductase, reducing hepatic cholesterol synthesis and increasing LDL receptor activity.",
    "spectrum": "ASCVD secondary prevention, primary prevention in high-risk patients, diabetes-related lipid management, and high-intensity statin therapy after ACS or ischemic stroke when indicated.",
    "dose": {
      "standard": "10–20 mg PO daily to start for many patients; 40–80 mg daily for high-intensity therapy when tolerated and indicated",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No routine renal dose adjustment needed"
      },
      {
        "crcl": "Severe CKD or frailty",
        "regimen": "Dose is still not CrCl-based, but muscle-toxicity risk is higher so interaction review and symptom monitoring matter more"
      }
    ],
    "sideEffects": [
      "Myalgias or myopathy",
      "Rare rhabdomyolysis",
      "Transaminase elevation",
      "Mild GI upset"
    ],
    "monitoring": [
      "Medication interaction review, especially strong CYP3A4 inhibitors",
      "Lipid response over time",
      "New muscle symptoms or dark urine"
    ],
    "publicNotes": [
      "Routine CK checks are not needed in every asymptomatic patient, but new muscle pain or weakness deserves follow-up",
      "High-intensity statin therapy after ACS or ischemic stroke is often appropriate unless a clear contraindication or intolerance exists"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=atorvastatin"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "lipid",
    "localNotes": []
  },
  "empagliflozin": {
    "name": "Empagliflozin (Jardiance)",
    "class": "SGLT2 Inhibitor",
    "shortName": "Empagliflozin",
    "badge": "PO",
    "aliases": [
      "empagliflozin",
      "jardiance"
    ],
    "pkpd": "Promotes glucosuria and natriuresis by blocking proximal tubular glucose-sodium reabsorption. Cardiorenal benefit often persists even when glucose-lowering effect fades at lower eGFR.",
    "mechanism": "Inhibits sodium-glucose cotransporter 2 in the proximal tubule, reducing glucose and sodium reabsorption.",
    "spectrum": "Type 2 diabetes, heart failure, and CKD regimens where SGLT2 therapy is indicated for cardiorenal benefit as well as or instead of glycemic control.",
    "dose": {
      "standard": "10 mg PO daily; may increase to 25 mg daily when additional glycemic lowering is desired and tolerated",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥45",
        "regimen": "10 mg daily; may increase to 25 mg daily for glycemic control if tolerated and indicated"
      },
      {
        "crcl": "30–44",
        "regimen": "10 mg daily may still be reasonable for cardiorenal indications, but glucose-lowering effect is reduced"
      },
      {
        "crcl": "<30 / dialysis",
        "regimen": "Avoid using it primarily for glycemic control; if the indication is heart failure or CKD, follow current labeling or specialist/institutional guidance rather than assuming routine outpatient diabetes dosing"
      }
    ],
    "sideEffects": [
      "Euglycemic ketoacidosis",
      "Volume depletion or dizziness",
      "Genital mycotic infection",
      "Polyuria",
      "Transient creatinine bump after initiation"
    ],
    "monitoring": [
      "Volume status and blood pressure",
      "Renal function context",
      "Sick-day and perioperative hold counseling",
      "Genital infection symptoms"
    ],
    "publicNotes": [
      "The key operational safety issue is knowing when to hold it: acute illness, poor oral intake, dehydration, or upcoming surgery all raise ketoacidosis risk",
      "Do not be reassured by a normal or only mildly elevated glucose if ketoacidosis is clinically suspected"
    ],
    "references": [
      {
        "text": "FDA / Official Product Information",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=empagliflozin"
      }
    ],
    "category": "metabolic",
    "localNotes": []
  },
  "omeprazole": {
    "name": "Omeprazole",
    "class": "Proton Pump Inhibitor",
    "shortName": "Omeprazole",
    "badge": "PO",
    "aliases": [
      "omeprazole",
      "losec",
      "prilosec"
    ],
    "pkpd": "Acid-activated prodrug with irreversible proton-pump inhibition. Serum half-life is short, but suppression persists until new pumps are synthesized. Full acid-suppression effect builds over several doses.",
    "mechanism": "Covalently inhibits the gastric parietal-cell H+/K+-ATPase, reducing basal and stimulated gastric acid secretion.",
    "spectrum": "GERD, peptic ulcer disease, H. pylori regimens, selected NSAID-related ulcer prevention, and other acid-suppression indications where oral therapy is sufficient.",
    "dose": {
      "standard": "20 mg PO daily for many routine acid-suppression indications; some ulcer or H. pylori regimens use 20–40 mg once or twice daily depending on the indication",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "HD / PD",
        "regimen": "Standard dose; no routine post-dialysis supplement"
      }
    ],
    "sideEffects": [
      "Headache",
      "Diarrhoea or abdominal discomfort",
      "Hypomagnesemia with prolonged use",
      "C. difficile or enteric infection risk with unnecessary chronic therapy",
      "Acute interstitial nephritis (rare)"
    ],
    "monitoring": [
      "Ongoing indication and duration",
      "Mg or vitamin B12 if prolonged therapy or deficiency concerns arise",
      "Symptom control and GI-bleeding context"
    ],
    "publicNotes": [
      "Omeprazole is a common outpatient PPI, but it is not always the best inpatient default if clopidogrel is also being used",
      "Long-term continuation should be intentional rather than automatic"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=omeprazole"
      }
    ],
    "category": "gi",
    "subcategory": "acid",
    "localNotes": []
  },
  "famotidine": {
    "name": "Famotidine",
    "class": "H2 Receptor Antagonist",
    "shortName": "Famotidine",
    "badge": "PO / IV",
    "aliases": [
      "famotidine",
      "pepcid"
    ],
    "pkpd": "Competitive histamine H2 blockade lowers acid secretion with quicker onset but less profound suppression than PPIs. A meaningful fraction is renally cleared, so accumulation matters in CKD.",
    "mechanism": "Blocks parietal-cell histamine H2 receptors, reducing basal and stimulated gastric acid secretion.",
    "spectrum": "GERD, dyspepsia, selected ulcer regimens, and lower-intensity acid suppression when a full PPI is not necessary.",
    "dose": {
      "standard": "20 mg PO/IV BID or 40 mg PO nightly depending on indication and severity",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Standard dose"
      },
      {
        "crcl": "30–59",
        "regimen": "Usual dose often acceptable, but consider lower total daily dose if prolonged therapy or CNS toxicity risk is high"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Reduce dose or extend interval because accumulation can increase confusion and other adverse effects; give after dialysis if applicable"
      }
    ],
    "sideEffects": [
      "Headache",
      "Constipation or diarrhoea",
      "Confusion or delirium in elderly or advanced CKD",
      "Rare thrombocytopenia"
    ],
    "monitoring": [
      "Renal function for dose context",
      "Mental status in older adults or CKD",
      "Need for ongoing therapy"
    ],
    "publicNotes": [
      "Famotidine is often a cleaner option than a PPI when only modest acid suppression is needed",
      "In advanced CKD, neurocognitive adverse effects are a bigger practical issue than many people expect"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=famotidine"
      }
    ],
    "category": "gi",
    "subcategory": "acid",
    "localNotes": []
  },
  "prednisone": {
    "name": "Prednisone",
    "class": "Systemic Corticosteroid / Glucocorticoid",
    "shortName": "Prednisone",
    "badge": "PO",
    "aliases": [
      "prednisone",
      "deltasone"
    ],
    "pkpd": "Converted to prednisolone after administration. Broad genomic and non-genomic anti-inflammatory effects, with clinically important hyperglycemia, mood, and infection effects that can appear within days.",
    "mechanism": "Glucocorticoid receptor agonism reduces inflammatory cytokine signaling, leukocyte trafficking, and capillary permeability.",
    "spectrum": "COPD or asthma exacerbations, inflammatory and autoimmune flares, allergic reactions, and many steroid-responsive conditions.",
    "dose": {
      "standard": "Highly indication-dependent. Common short burst examples include 40 mg PO daily for 5 days in COPD exacerbation or 40–60 mg daily in other inflammatory flares with tapering based on indication",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "Diabetes / acute infection / active GI bleed risk",
        "regimen": "Dose is not CrCl-based, but these clinical contexts often matter more than renal function alone when deciding whether to continue or taper"
      }
    ],
    "sideEffects": [
      "Hyperglycemia",
      "Mood change, insomnia, or agitation",
      "Fluid retention and hypertension",
      "Infection risk",
      "GI irritation or ulcer risk, especially with NSAIDs",
      "Adrenal suppression with longer courses"
    ],
    "monitoring": [
      "Glucose trend",
      "BP and fluid status",
      "Infection symptoms",
      "Sleep, mood, and taper plan if course is prolonged"
    ],
    "publicNotes": [
      "For short steroid bursts, the operational mistakes are usually forgetting glucose effects, giving them too late in the day, or not clarifying whether a taper is needed",
      "Prednisone is not a benign default add-on when infection source control or GI bleeding risk is already unstable"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=prednisone"
      }
    ],
    "category": "steroid",
    "localNotes": []
  },
  "albuterol": {
    "name": "Albuterol (Salbutamol)",
    "class": "Short-Acting Beta2 Agonist Bronchodilator (SABA)",
    "shortName": "Albuterol",
    "badge": "INH / NEB",
    "aliases": [
      "albuterol",
      "salbutamol",
      "ventolin",
      "salbutamol inhaler"
    ],
    "pkpd": "Rapid bronchodilation within minutes after inhaled dosing. Systemic spillover increases with repeated nebulization or high rescue use, bringing tremor, tachycardia, and potassium shift into play.",
    "mechanism": "Selective beta2 agonism relaxes airway smooth muscle and improves bronchospasm.",
    "spectrum": "Rescue bronchodilator for asthma or COPD symptoms, acute bronchospasm, and bronchodilator response trials.",
    "dose": {
      "standard": "MDI: 1–2 puffs q4–6h PRN. Nebulized rescue dosing commonly uses 2.5 mg per treatment, repeated based on severity and protocol",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No routine renal dose adjustment for inhaled use"
      },
      {
        "crcl": "High-dose repeated nebulization",
        "regimen": "Monitor heart rate and potassium more closely when escalation is needed"
      }
    ],
    "sideEffects": [
      "Tremor",
      "Tachycardia or palpitations",
      "Hypokalemia with repeated high-dose use",
      "Anxiety or jitteriness",
      "Rare paradoxical bronchospasm"
    ],
    "monitoring": [
      "Respiratory effort and wheeze response",
      "Heart rate",
      "Potassium if repeated high-dose nebulization is used",
      "How often rescue therapy is needed"
    ],
    "publicNotes": [
      "Frequent rescue albuterol use is a signal to reassess the underlying exacerbation plan, not just a cue to keep repeating bronchodilator doses forever",
      "Nebulizer and inhaler dosing are both common, but good inhaler technique often matters as much as the nominal dose"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=albuterol+sulfate+inhalation"
      }
    ],
    "category": "respiratory",
    "subcategory": "bronchodilator",
    "localNotes": []
  },
  "tiotropium": {
    "name": "Tiotropium (Spiriva)",
    "class": "Long-Acting Muscarinic Antagonist Bronchodilator (LAMA)",
    "shortName": "Tiotropium",
    "badge": "INH",
    "aliases": [
      "tiotropium",
      "spiriva"
    ],
    "pkpd": "Once-daily long-acting antimuscarinic bronchodilator with sustained airway smooth-muscle relaxation. It is a maintenance inhaler, not a rescue medication.",
    "mechanism": "Blocks muscarinic receptors in airway smooth muscle, reducing cholinergic bronchoconstriction.",
    "spectrum": "Maintenance therapy for COPD and selected maintenance asthma regimens depending on formulation and inhaler device.",
    "dose": {
      "standard": "Device-specific once-daily inhaled maintenance dosing. Follow the exact product device instructions because HandiHaler capsules and Respimat inhalers are not interchangeable",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥50",
        "regimen": "Standard inhaled maintenance dosing"
      },
      {
        "crcl": "<50",
        "regimen": "No automatic inhaler dose change, but monitor more closely for anticholinergic adverse effects because systemic exposure can rise"
      }
    ],
    "sideEffects": [
      "Dry mouth",
      "Constipation",
      "Urinary retention or worsening LUTS",
      "Blurred vision if powder or spray reaches eyes",
      "Rare paradoxical bronchospasm"
    ],
    "monitoring": [
      "Inhaler technique",
      "COPD symptom burden and rescue-inhaler frequency",
      "Urinary symptoms and anticholinergic tolerance"
    ],
    "publicNotes": [
      "Tiotropium is for maintenance control, not acute symptom rescue",
      "Capsule-based inhalation products are inhaled through the device and should never be swallowed whole"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=tiotropium"
      }
    ],
    "category": "respiratory",
    "subcategory": "bronchodilator",
    "localNotes": []
  },
  "ondansetron": {
    "name": "Ondansetron (Zofran)",
    "class": "Antiemetic - 5-HT3 Receptor Antagonist",
    "shortName": "Ondansetron",
    "badge": "PO / IV / ODT",
    "aliases": [
      "ondansetron",
      "zofran"
    ],
    "pkpd": "Selective serotonin 5-HT3 blockade reduces nausea signaling from the gut and central chemoreceptor trigger pathways. IV onset is fast, while oral and ODT forms remain very practical for ward symptom control.",
    "mechanism": "Blocks 5-HT3 receptors on vagal afferents and in central emetic pathways, reducing nausea and vomiting.",
    "spectrum": "Postoperative nausea and vomiting, chemotherapy-related nausea regimens, and common inpatient nausea control when bowel obstruction or dopamine-blocking toxicity is a concern.",
    "dose": {
      "standard": "4 mg PO/IV/ODT q6–8h PRN for many inpatient uses; some protocols use higher scheduled doses depending on the indication",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "Severe hepatic impairment",
        "regimen": "Daily exposure rises substantially, so lower total daily dosing is generally used"
      }
    ],
    "sideEffects": [
      "QT prolongation",
      "Constipation",
      "Headache",
      "Transient transaminase elevation",
      "Rare serotonin syndrome when combined with multiple serotonergic drugs"
    ],
    "monitoring": [
      "QT risk if baseline prolongation, electrolyte disturbance, or multiple QT-prolonging drugs are present",
      "Response versus persistent vomiting that may indicate obstruction or another untreated cause",
      "Bowel pattern if repeated doses are needed"
    ],
    "publicNotes": [
      "Ondansetron is a strong first-line ward antiemetic, but do not let symptom control delay recognition of ileus, obstruction, intracranial pathology, or severe metabolic illness",
      "IV push convenience can make it feel harmless, but QT and constipation still matter in frail inpatients"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=ondansetron"
      }
    ],
    "category": "gi",
    "subcategory": "nausea",
    "localNotes": []
  },
  "metoclopramide": {
    "name": "Metoclopramide (Reglan)",
    "class": "Antiemetic / Prokinetic Dopamine Antagonist",
    "shortName": "Metoclopramide",
    "badge": "PO / IV",
    "aliases": [
      "metoclopramide",
      "reglan",
      "maxolon"
    ],
    "pkpd": "Combined antiemetic and upper-GI prokinetic effects via dopamine antagonism. Renal clearance is clinically important, so repeated dosing accumulates in CKD more than many teams expect.",
    "mechanism": "Blocks central dopamine D2 receptors for antiemetic effect and enhances upper-GI motility through dopamine antagonism and downstream cholinergic facilitation.",
    "spectrum": "Gastroparesis, nausea with delayed gastric emptying, selected refractory nausea contexts, and short-course adjunctive prokinetic use.",
    "dose": {
      "standard": "5–10 mg PO/IV q6–8h PRN or scheduled depending on indication; use the lowest effective dose and shortest duration possible",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Usual short-course dosing generally acceptable"
      },
      {
        "crcl": "30–59",
        "regimen": "Consider lower dose or longer interval if repeated dosing is planned"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Reduce dose substantially or extend interval because CNS and extrapyramidal toxicity risk rises with accumulation"
      }
    ],
    "sideEffects": [
      "Akathisia or restlessness",
      "Acute dystonia or parkinsonism",
      "Sedation",
      "Diarrhoea",
      "Tardive dyskinesia with longer exposure or high cumulative dose"
    ],
    "monitoring": [
      "Restlessness, dystonia, parkinsonism, or other extrapyramidal symptoms",
      "Renal function if scheduled therapy is used",
      "Duration of therapy, because longer exposure increases tardive dyskinesia risk"
    ],
    "publicNotes": [
      "Metoclopramide is most useful when nausea has a motility component, not simply because it is another antiemetic to stack automatically",
      "If a patient becomes agitated or restless after a dose, think akathisia rather than worsening primary anxiety"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=metoclopramide"
      }
    ],
    "category": "gi",
    "subcategory": "nausea",
    "localNotes": []
  },
  "trazodone": {
    "name": "Trazodone",
    "class": "Sedating Antidepressant / Serotonin Antagonist and Reuptake Inhibitor",
    "shortName": "Trazodone",
    "badge": "PO",
    "aliases": [
      "trazodone",
      "desyrel"
    ],
    "pkpd": "Sedation occurs at relatively low doses through histamine and alpha-1 effects, while antidepressant dosing is typically higher. Hepatic metabolism and additive sedation with other CNS depressants matter more clinically than renal clearance alone.",
    "mechanism": "Serotonin antagonist and reuptake inhibitor with prominent antihistamine and alpha-1 blocking effects at common sleep doses.",
    "spectrum": "Insomnia adjunct when dependence-prone hypnotics are undesirable, depression, and selected agitation or sleep-maintenance problems where sedation is acceptable.",
    "dose": {
      "standard": "Sleep-focused dosing often starts at 25–50 mg PO at bedtime; antidepressant dosing is higher and indication-specific",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No standard renal dose adjustment, but start low in frailty or organ dysfunction because sedation and orthostasis still accumulate clinically"
      },
      {
        "crcl": "Advanced CKD / elderly",
        "regimen": "Use conservative bedtime dosing and monitor for oversedation, falls, and hypotension"
      }
    ],
    "sideEffects": [
      "Sedation or next-day grogginess",
      "Orthostatic hypotension",
      "Dry mouth",
      "QT prolongation",
      "Rare priapism"
    ],
    "monitoring": [
      "Morning sedation and falls risk",
      "Orthostatic symptoms",
      "Other serotonergic or QT-prolonging co-medications",
      "Need for ongoing bedtime use rather than reflex continuation"
    ],
    "publicNotes": [
      "Trazodone is often chosen because it is not a benzodiazepine, but that does not make it benign in frail or fall-prone patients",
      "Low-dose bedtime use is common on wards, yet the biggest practical risks are morning grogginess, orthostasis, and interaction stacking"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=trazodone+hydrochloride"
      }
    ],
    "category": "hypnotic",
    "localNotes": []
  },
  "budesonide-formoterol": {
    "name": "Budesonide-Formoterol (Symbicort)",
    "class": "ICS/LABA Combination Inhaler",
    "shortName": "Budesonide-Formoterol",
    "badge": "INH",
    "aliases": [
      "budesonide-formoterol",
      "symbicort",
      "budesonide formoterol"
    ],
    "pkpd": "Combines inhaled corticosteroid anti-inflammatory control with long-acting beta2 bronchodilation. It is a controller inhaler, and regimen details depend on whether it is being used only for maintenance or as part of an ICS-formoterol reliever strategy.",
    "mechanism": "Budesonide reduces airway inflammation; formoterol provides long-acting beta2-mediated bronchodilation with relatively rapid onset for a LABA.",
    "spectrum": "Asthma controller therapy, COPD maintenance in selected patients, and maintenance-and-reliever strategies when the specific regimen supports ICS-formoterol use.",
    "dose": {
      "standard": "Device- and indication-specific. Common outpatient regimens use 1–2 inhalations twice daily, with rescue use only if the prescribed asthma plan specifically uses an ICS-formoterol reliever strategy",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No routine renal dose adjustment for inhaled use"
      },
      {
        "crcl": "Frailty / tachyarrhythmia risk",
        "regimen": "Dose is not renal-based, but adverse-effect tolerance and inhaler technique should still be reassessed carefully"
      }
    ],
    "sideEffects": [
      "Oral candidiasis",
      "Dysphonia",
      "Tremor or palpitations",
      "Tachycardia",
      "Rare paradoxical bronchospasm"
    ],
    "monitoring": [
      "Inhaler technique",
      "Need for rescue therapy or escalation",
      "Mouth-rinsing adherence and thrush symptoms",
      "Whether the patient’s plan is maintenance-only or maintenance-and-reliever"
    ],
    "publicNotes": [
      "Do not assume all budesonide-formoterol regimens are interchangeable; maintenance-only use and SMART/MART-style use are not the same instructions",
      "Controller efficacy depends heavily on inhaler technique and adherence, not just that the medication is listed in the chart"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=budesonide+formoterol"
      }
    ],
    "category": "respiratory",
    "subcategory": "controller",
    "localNotes": []
  },
  "amiodarone": {
    "name": "Amiodarone",
    "class": "Class III Antiarrhythmic",
    "shortName": "Amiodarone",
    "badge": "PO / IV",
    "aliases": [
      "amiodarone",
      "cordarone",
      "pacerone"
    ],
    "pkpd": "Very long half-life with major tissue accumulation and a huge interaction footprint. Acute IV effects and chronic oral toxicity considerations are different enough that both the immediate rhythm indication and the long-term exit plan matter.",
    "mechanism": "Predominantly potassium-channel blockade with additional sodium-channel, calcium-channel, and beta-blocking effects, prolonging repolarization and suppressing atrial and ventricular arrhythmias.",
    "spectrum": "Atrial fibrillation rhythm or rate-control support in selected patients, ventricular arrhythmias, and difficult inpatient rhythm management when other agents are unsuitable or failing.",
    "dose": {
      "standard": "Highly indication- and route-specific. IV loading and infusion regimens are protocol-based; oral therapy commonly uses a loading phase followed by a lower maintenance dose",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "Chronic therapy",
        "regimen": "Dose is not CrCl-based, but interaction review and toxicity surveillance are essential regardless of renal function"
      }
    ],
    "sideEffects": [
      "QT prolongation and bradycardia",
      "Hypotension with IV use",
      "Thyroid dysfunction (hypo- or hyperthyroidism)",
      "Transaminitis or chronic liver toxicity",
      "Pulmonary toxicity",
      "Corneal deposits and visual symptoms"
    ],
    "monitoring": [
      "ECG and rhythm response",
      "LFTs and thyroid function",
      "Pulmonary symptom review for chronic therapy",
      "Major interaction review, especially warfarin and digoxin"
    ],
    "publicNotes": [
      "Amiodarone often solves the immediate rhythm problem while creating a slower outpatient follow-up problem, so document why it was started and what the planned next step is",
      "Starting or stopping amiodarone changes the handling of several common medications, especially warfarin and digoxin"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=amiodarone+hydrochloride"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "rate-rhythm",
    "localNotes": []
  },
  "metoprolol": {
    "name": "Metoprolol",
    "class": "Beta1-Selective Beta-Blocker",
    "shortName": "Metoprolol",
    "badge": "PO / IV",
    "aliases": [
      "metoprolol",
      "lopressor",
      "toprol-xl",
      "metoprolol tartrate",
      "metoprolol succinate"
    ],
    "pkpd": "Beta1-selective blockade with different practical formulations: tartrate is usually immediate-release and often BID, while succinate is extended-release and often daily. Acute heart-rate effects appear quickly, but chronic HF or BP benefit depends on sustained titration.",
    "mechanism": "Blocks cardiac beta1 receptors, lowering heart rate, AV nodal conduction, contractility, and myocardial oxygen demand.",
    "spectrum": "Rate control, hypertension, chronic coronary disease, HFrEF when the succinate formulation is intended, and selected inpatient tachyarrhythmia support.",
    "dose": {
      "standard": "Formulation-specific. Tartrate often starts at 12.5–25 mg PO BID or small IV doses for acute rate control; succinate commonly starts at 12.5–25 mg PO daily for chronic therapy and is titrated to indication and tolerance",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No routine renal dose adjustment needed"
      },
      {
        "crcl": "Shock / bradycardia / decompensated HF",
        "regimen": "Dose is not renal-based, but the clinical state may make continuation or escalation inappropriate"
      }
    ],
    "sideEffects": [
      "Bradycardia",
      "Hypotension",
      "Fatigue",
      "Worsening bronchospasm in susceptible patients despite beta1 selectivity",
      "Masking of hypoglycemia symptoms"
    ],
    "monitoring": [
      "Heart rate and blood pressure",
      "Whether the formulation is tartrate or succinate",
      "Signs of low-output state or decompensated HF",
      "Bronchospasm history if airway disease is present"
    ],
    "publicNotes": [
      "Metoprolol tartrate and succinate are not interchangeable in a casual way because the release profile and common indications differ",
      "Do not reflexively stop every chronic beta-blocker on admission, but do not push it through shock or active low-output states either"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=metoprolol"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "rate-rhythm",
    "localNotes": []
  },
  "digoxin": {
    "name": "Digoxin",
    "class": "Cardiac Glycoside",
    "shortName": "Digoxin",
    "badge": "PO / IV",
    "aliases": [
      "digoxin",
      "lanoxin"
    ],
    "pkpd": "Narrow therapeutic index with major renal dependence and clinically important electrolyte sensitivity. Toxicity is often a combined problem of kidney function, potassium status, interacting drugs, and tissue vulnerability rather than a single number alone.",
    "mechanism": "Inhibits Na+/K+-ATPase, indirectly increasing intracellular calcium and vagal tone; this can improve symptoms in selected HF patients and slow AV nodal conduction in atrial arrhythmias.",
    "spectrum": "Selected HFrEF symptom support and atrial fibrillation rate control when other agents are not enough or are poorly tolerated.",
    "dose": {
      "standard": "Indication-specific and conservative. Chronic maintenance often uses 0.125 mg daily or less; loading, if used, is specialized and should account for age, renal function, and interacting drugs",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "≥60",
        "regimen": "Low-dose maintenance may be acceptable, but start conservatively and avoid assuming standard daily dosing is harmless"
      },
      {
        "crcl": "30–59",
        "regimen": "Lower maintenance dosing or alternate-day dosing is often needed"
      },
      {
        "crcl": "<30 / HD",
        "regimen": "Use very cautious individualized dosing with level-guided follow-up because accumulation risk is high"
      }
    ],
    "sideEffects": [
      "Bradycardia or AV block",
      "Nausea, anorexia, or vomiting",
      "Confusion or weakness",
      "Visual disturbance such as yellow vision or halos",
      "Life-threatening arrhythmias in toxicity"
    ],
    "monitoring": [
      "Renal function and potassium",
      "Heart rate and ECG",
      "Serum digoxin level when clinically indicated or toxicity is suspected",
      "Interaction review, especially amiodarone and verapamil"
    ],
    "publicNotes": [
      "A “normal” digoxin level does not overrule clear toxicity if the patient is bradycardic, symptomatic, and clinically exposed to accumulation risks",
      "Whenever digoxin seems suddenly problematic, check kidney function, potassium, and whether amiodarone or another interaction changed recently"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=digoxin"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "rate-rhythm",
    "localNotes": []
  },
  "nitroglycerin": {
    "name": "Nitroglycerin",
    "class": "Organic Nitrate Antianginal",
    "shortName": "Nitroglycerin",
    "badge": "SL / IV",
    "aliases": [
      "nitroglycerin",
      "gtn",
      "nitrostat",
      "ntg"
    ],
    "pkpd": "Rapid venodilation and antianginal effect with sublingual dosing. Tolerance develops with continuous exposure, so intermittent scheduling matters for longer-acting nitrate strategies, but acute SL use is mainly about correct rescue technique and escalation thresholds.",
    "mechanism": "Converted to nitric oxide, increasing cGMP and producing venous and coronary vasodilation with lower preload and myocardial oxygen demand.",
    "spectrum": "Acute angina relief, ischemic chest pain protocols, selected hypertensive pulmonary edema settings, and IV anti-ischemic support in monitored care areas.",
    "dose": {
      "standard": "Sublingual acute angina: 0.3–0.4 mg under the tongue every 5 minutes as directed for up to 3 doses while following emergency escalation guidance. IV regimens are protocol-based and titrated to symptoms and blood pressure",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment needed"
      },
      {
        "crcl": "Hypotension / RV infarct / PDE-5 exposure",
        "regimen": "Dose is not renal-based, but these clinical situations can make nitroglycerin unsafe regardless of kidney function"
      }
    ],
    "sideEffects": [
      "Hypotension",
      "Headache",
      "Dizziness",
      "Reflex tachycardia",
      "Syncope"
    ],
    "monitoring": [
      "Blood pressure and symptom response",
      "Whether recent sildenafil, tadalafil, or vardenafil exposure occurred",
      "Ongoing chest-pain cause rather than symptom relief alone"
    ],
    "publicNotes": [
      "If chest pain is not improving after appropriate emergency-threshold sublingual dosing, the next step is escalation of ACS care, not simply more and more nitroglycerin",
      "Always ask about recent PDE-5 inhibitor use before giving nitrates"
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=nitroglycerin+sublingual"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "antianginal",
    "localNotes": []
  },
  "lisinopril": {
    "name": "Lisinopril",
    "class": "ACE Inhibitor",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication-specific oral dosing; titrate to BP, renal function, and potassium.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No simple renal dose formula; start lower and monitor Cr/K after initiation or escalation"
      },
      {
        "crcl": "AKI / hyperkalemia",
        "regimen": "Review temporary hold when AKI or K elevation develops"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Blood pressure",
      "Creatinine/eGFR",
      "Potassium",
      "Cough/angioedema"
    ],
    "publicNotes": [
      "Potassium and creatinine checks matter more than the nominal dose when the ward problem is AKI or hyperkalemia."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Lisinopril"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "renal-hf",
    "localNotes": []
  },
  "valsartan": {
    "name": "Valsartan",
    "class": "Angiotensin Receptor Blocker",
    "aliases": [
      "arb"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication-specific oral dosing; titrate to BP, renal function, and potassium.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No routine renal adjustment, but reassess during AKI, hypotension, or hyperkalemia"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Blood pressure",
      "Creatinine/eGFR",
      "Potassium"
    ],
    "publicNotes": [
      "ARB effects on potassium and renal perfusion are the key ward safety checks."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Valsartan"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "renal-hf",
    "localNotes": []
  },
  "sacubitril-valsartan": {
    "name": "Sacubitril-Valsartan",
    "class": "ARNI",
    "aliases": [
      "entresto",
      "arni"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "HFrEF dosing is protocol/indication specific; avoid ACE inhibitor overlap.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30",
        "regimen": "Start conservatively and monitor renal function and potassium closely"
      },
      {
        "crcl": "AKI / hyperkalemia",
        "regimen": "Reassess continuation during acute illness"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Blood pressure",
      "Creatinine/eGFR",
      "Potassium",
      "ACE inhibitor washout"
    ],
    "publicNotes": [
      "Do not overlap with ACE inhibitors; watch hypotension, AKI, and hyperkalemia."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Sacubitril-Valsartan"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "renal-hf",
    "localNotes": []
  },
  "hydrochlorothiazide": {
    "name": "Hydrochlorothiazide",
    "class": "Thiazide Diuretic",
    "aliases": [
      "hctz"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Oral dosing varies by indication; effect is weaker at low GFR.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30",
        "regimen": "Often less effective; monitor electrolytes closely if continued"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Sodium",
      "Potassium",
      "Creatinine/eGFR",
      "Volume status"
    ],
    "publicNotes": [
      "Common cause of hyponatremia/hypokalemia; reassess during AKI or poor intake."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Hydrochlorothiazide"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "diuretic",
    "localNotes": []
  },
  "bumetanide": {
    "name": "Bumetanide",
    "class": "Loop Diuretic",
    "aliases": [
      "loop diuretic"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose is individualized to volume status and prior loop exposure.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any CKD",
        "regimen": "No fixed adjustment; response-guided dosing with close electrolytes/renal monitoring"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Daily weight/volume status",
      "Creatinine/eGFR",
      "Potassium",
      "Magnesium"
    ],
    "publicNotes": [
      "Loop diuretics can worsen AKI or hypokalemia even when needed for congestion."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Bumetanide"
      }
    ],
    "category": "cardiovascular",
    "subcategory": "diuretic",
    "localNotes": []
  },
  "potassium-chloride": {
    "name": "Potassium Chloride",
    "class": "Electrolyte Supplement",
    "aliases": [
      "kcl",
      "potassium supplement"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Replacement route/dose depends on severity, ECG risk, and renal function.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30 / AKI",
        "regimen": "Use conservative replacement and repeat labs because accumulation risk is higher"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Potassium",
      "Renal function",
      "ECG context when severe"
    ],
    "publicNotes": [
      "Always reconcile active KCl when K is elevated or renal function worsens."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Potassium%20Chloride"
      }
    ],
    "category": "electrolyte",
    "subcategory": "potassium",
    "localNotes": []
  },
  "rivaroxaban": {
    "name": "Rivaroxaban",
    "class": "Direct Factor Xa Inhibitor",
    "aliases": [
      "doac",
      "xarelto"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication- and renal-function-specific oral dosing.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CrCl 15-50",
        "regimen": "Dose/indication review required"
      },
      {
        "crcl": "CrCl <15",
        "regimen": "Generally avoid for many indications"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Renal function",
      "Hemoglobin/bleeding",
      "Drug interactions"
    ],
    "publicNotes": [
      "Bleeding risk rises with renal impairment and antiplatelet/NSAID combinations."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Rivaroxaban"
      }
    ],
    "category": "anticoagulant",
    "subcategory": "doac",
    "localNotes": []
  },
  "dabigatran": {
    "name": "Dabigatran",
    "class": "Direct Thrombin Inhibitor",
    "aliases": [
      "doac",
      "pradaxa"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication- and renal-function-specific oral dosing.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CrCl 30-50",
        "regimen": "Review dose and interacting P-gp inhibitors"
      },
      {
        "crcl": "CrCl <30",
        "regimen": "High accumulation risk; indication-specific avoidance/review"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Renal function",
      "Hemoglobin/bleeding",
      "P-gp interactions"
    ],
    "publicNotes": [
      "Renal clearance is central; reassess during AKI."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Dabigatran"
      }
    ],
    "category": "anticoagulant",
    "subcategory": "doac",
    "localNotes": []
  },
  "edoxaban": {
    "name": "Edoxaban",
    "class": "Direct Factor Xa Inhibitor",
    "aliases": [
      "doac"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication- and renal-function-specific oral dosing.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CrCl 15-50",
        "regimen": "Dose review required"
      },
      {
        "crcl": "CrCl <15",
        "regimen": "Generally avoid/review alternatives"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Renal function",
      "Hemoglobin/bleeding",
      "Drug interactions"
    ],
    "publicNotes": [
      "Review renal function and antiplatelet/NSAID combinations on admission and discharge."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Edoxaban"
      }
    ],
    "category": "anticoagulant",
    "subcategory": "doac",
    "localNotes": []
  },
  "fondaparinux": {
    "name": "Fondaparinux",
    "class": "Factor Xa Inhibitor",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose depends on prophylaxis vs treatment indication.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CrCl <30",
        "regimen": "Contraindicated or avoid in many workflows due to accumulation"
      },
      {
        "crcl": "CrCl 30-50",
        "regimen": "Use caution and monitor bleeding"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Renal function",
      "Platelets",
      "Hemoglobin/bleeding"
    ],
    "publicNotes": [
      "Fondaparinux is strongly renal-cleared; AKI should trigger medication review."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Fondaparinux"
      }
    ],
    "category": "anticoagulant",
    "subcategory": "parenteral",
    "localNotes": []
  },
  "magnesium-sulfate": {
    "name": "Magnesium Sulfate",
    "class": "Electrolyte / Antiarrhythmic",
    "aliases": [
      "mgso4"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Replacement/rescue dosing is indication-specific and monitor-dependent.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30 / AKI",
        "regimen": "Use lower/repeated-small doses and monitor for accumulation"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Magnesium",
      "Renal function",
      "Reflexes/respiratory status when high-dose"
    ],
    "publicNotes": [
      "Useful for severe hypomagnesemia and torsades contexts, but renal accumulation matters."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Magnesium%20Sulfate"
      }
    ],
    "category": "electrolyte",
    "subcategory": "magnesium",
    "localNotes": []
  },
  "calcium-gluconate": {
    "name": "Calcium Gluconate",
    "class": "Electrolyte Rescue",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Emergency stabilization dosing is protocol-based.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal adjustment for emergency membrane stabilization; treat cause and monitor calcium"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "ECG",
      "Calcium",
      "IV access",
      "Extravasation"
    ],
    "publicNotes": [
      "In hyperkalemia, calcium stabilizes myocardium but does not lower potassium."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Calcium%20Gluconate"
      }
    ],
    "category": "electrolyte",
    "subcategory": "calcium",
    "localNotes": []
  },
  "sodium-bicarbonate": {
    "name": "Sodium Bicarbonate",
    "class": "Alkali Therapy",
    "aliases": [
      "bicarbonate"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Indication-specific; avoid reflex use without acid-base context.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CKD/AKI",
        "regimen": "May be used in selected acidosis contexts; monitor sodium/volume load"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "pH/HCO3",
      "Sodium",
      "Volume status",
      "Potassium"
    ],
    "publicNotes": [
      "Can shift potassium and add sodium load; interpret with ABG/chemistry."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Sodium%20Bicarbonate"
      }
    ],
    "category": "electrolyte",
    "subcategory": "alkali",
    "localNotes": []
  },
  "phosphate": {
    "name": "Sodium or Potassium Phosphate",
    "class": "Electrolyte Replacement",
    "aliases": [
      "sodium phosphate",
      "potassium phosphate"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Replacement depends on severity, route, potassium level, and renal function.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30 / AKI",
        "regimen": "Use caution and repeat labs due to phosphate/potassium accumulation risk"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Phosphate",
      "Calcium",
      "Potassium",
      "Renal function"
    ],
    "publicNotes": [
      "Choose sodium vs potassium salt based on potassium and renal context."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Sodium%20or%20Potassium%20Phosphate"
      }
    ],
    "category": "electrolyte",
    "subcategory": "phosphate",
    "localNotes": []
  },
  "dextrose-50": {
    "name": "Dextrose 50%",
    "class": "Hypoglycemia Rescue",
    "aliases": [
      "d50"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Rescue dosing is protocol-based.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal adjustment; reassess cause and recurrence risk"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Repeat glucose",
      "IV access",
      "Rebound hypoglycemia risk"
    ],
    "publicNotes": [
      "Treats the number quickly; the cognitive task is preventing recurrence."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Dextrose%2050%25"
      }
    ],
    "category": "metabolic",
    "subcategory": "rescue",
    "localNotes": []
  },
  "glucagon": {
    "name": "Glucagon",
    "class": "Hypoglycemia Rescue",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Rescue dosing is protocol-based when IV access is not available or specific toxicology context applies.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal adjustment"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Glucose response",
      "Nausea/vomiting",
      "Need for definitive carbohydrate"
    ],
    "publicNotes": [
      "Effect may be limited when glycogen stores are depleted."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Glucagon"
      }
    ],
    "category": "metabolic",
    "subcategory": "rescue",
    "localNotes": []
  },
  "sitagliptin": {
    "name": "Sitagliptin",
    "class": "DPP-4 Inhibitor",
    "aliases": [
      "dpp4"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Oral diabetes dosing is renal-function adjusted.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR 30-45",
        "regimen": "Dose reduction required"
      },
      {
        "crcl": "eGFR <30 / HD",
        "regimen": "Further dose reduction required"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Renal function",
      "Glucose",
      "Pancreatitis symptoms"
    ],
    "publicNotes": [
      "DPP-4 inhibitors are usually low hypoglycemia risk alone, but renal dosing still matters."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Sitagliptin"
      }
    ],
    "category": "metabolic",
    "subcategory": "diabetes",
    "localNotes": []
  },
  "linagliptin": {
    "name": "Linagliptin",
    "class": "DPP-4 Inhibitor",
    "aliases": [
      "dpp4"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Oral diabetes dosing; often no renal adjustment.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment commonly required"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Glucose",
      "Pancreatitis symptoms"
    ],
    "publicNotes": [
      "Useful contrast to sitagliptin because renal dose adjustment is usually not required."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Linagliptin"
      }
    ],
    "category": "metabolic",
    "subcategory": "diabetes",
    "localNotes": []
  },
  "glipizide": {
    "name": "Glipizide",
    "class": "Sulfonylurea",
    "aliases": [
      "sulfonylurea"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Oral dosing should be conservative in older adults and inconsistent intake.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CKD/AKI",
        "regimen": "Start low or avoid during acute illness; hypoglycemia risk increases"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Glucose",
      "Oral intake",
      "Hypoglycemia episodes"
    ],
    "publicNotes": [
      "Sulfonylureas are easy to forget during NPO/poor intake admissions."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Glipizide"
      }
    ],
    "category": "metabolic",
    "subcategory": "diabetes",
    "localNotes": []
  },
  "semaglutide": {
    "name": "Semaglutide",
    "class": "GLP-1 Receptor Agonist",
    "aliases": [
      "glp1"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Outpatient titration medication; inpatient continuation is context-dependent.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No simple renal dose adjustment, but dehydration/GI intolerance can worsen AKI risk"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "GI tolerance",
      "Hydration",
      "Glucose",
      "Peri-procedure/NPO plan"
    ],
    "publicNotes": [
      "Watch nausea, poor intake, dehydration, and peri-procedural aspiration-risk policies."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Semaglutide"
      }
    ],
    "category": "metabolic",
    "subcategory": "diabetes",
    "localNotes": []
  },
  "haloperidol": {
    "name": "Haloperidol",
    "class": "Antipsychotic",
    "aliases": [
      "haldol"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Use the lowest effective dose; route and monitoring depend on agitation/delirium context.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose formula, but frailty and QT/electrolytes drive safety"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "QTc",
      "Potassium/Magnesium",
      "EPS",
      "Sedation"
    ],
    "publicNotes": [
      "QT and electrolyte review matters before repeated dosing."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Haloperidol"
      }
    ],
    "category": "neuropsych",
    "subcategory": "delirium-qt",
    "localNotes": []
  },
  "quetiapine": {
    "name": "Quetiapine",
    "class": "Atypical Antipsychotic",
    "aliases": [
      "seroquel"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose depends on indication; start low for delirium/frailty contexts.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal adjustment usually required; monitor sedation and orthostasis"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Sedation",
      "Orthostasis",
      "QTc when risk factors",
      "Glucose"
    ],
    "publicNotes": [
      "Can compound QT risk when electrolytes are low or other QT drugs are active."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Quetiapine"
      }
    ],
    "category": "neuropsych",
    "subcategory": "delirium-qt",
    "localNotes": []
  },
  "morphine": {
    "name": "Morphine",
    "class": "Opioid Analgesic",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose depends on opioid tolerance, pain severity, route, and goals of care.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30 / AKI",
        "regimen": "Avoid or use extreme caution due to active metabolite accumulation"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Respiratory rate",
      "Sedation",
      "Renal function",
      "Bowel regimen"
    ],
    "publicNotes": [
      "Renal impairment can turn routine doses into prolonged sedation."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Morphine"
      }
    ],
    "category": "analgesic",
    "subcategory": "opioid",
    "localNotes": []
  },
  "oxycodone": {
    "name": "Oxycodone",
    "class": "Opioid Analgesic",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose depends on opioid tolerance, pain severity, and route.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "eGFR <30 / AKI",
        "regimen": "Use lower doses/longer intervals and monitor sedation"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Respiratory rate",
      "Sedation",
      "Renal/hepatic function",
      "Bowel regimen"
    ],
    "publicNotes": [
      "Less renal-metabolite concern than morphine, but still accumulates clinically in frailty/AKI."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Oxycodone"
      }
    ],
    "category": "analgesic",
    "subcategory": "opioid",
    "localNotes": []
  },
  "fentanyl": {
    "name": "Fentanyl",
    "class": "Opioid Analgesic",
    "aliases": [],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Dose depends heavily on route and opioid tolerance; patch is only for opioid-tolerant chronic pain.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "CKD/AKI",
        "regimen": "No active renal metabolite, but sedation/respiratory monitoring still required"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "Respiratory rate",
      "Sedation",
      "Route-specific safety",
      "Opioid tolerance"
    ],
    "publicNotes": [
      "Patch misuse in opioid-naive patients is dangerous; distinguish IV rescue from transdermal chronic therapy."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Fentanyl"
      }
    ],
    "category": "analgesic",
    "subcategory": "opioid",
    "localNotes": []
  },
  "acetylcysteine": {
    "name": "Acetylcysteine",
    "class": "Antidote / Mucolytic",
    "aliases": [
      "nac"
    ],
    "pkpd": "Ward-reference summary focused on safety review, renal handling, and monitoring rather than exhaustive prescribing.",
    "mechanism": "See class-specific pharmacology; use this entry as a deterministic bedside safety reminder.",
    "spectrum": "General internal medicine ward reference and medication-lab safety rule support.",
    "dose": {
      "standard": "Acetaminophen toxicity regimens are protocol-based; start promptly when indicated.",
      "loading": ""
    },
    "renalAdj": [
      {
        "crcl": "Any",
        "regimen": "No renal dose adjustment for antidote use"
      }
    ],
    "sideEffects": [
      "Class-specific adverse effects",
      "Dose- or exposure-related toxicity in vulnerable patients"
    ],
    "monitoring": [
      "AST/ALT",
      "INR",
      "Acetaminophen level/timing",
      "Anaphylactoid reaction with IV use"
    ],
    "publicNotes": [
      "When acetaminophen toxicity is plausible, timing and protocol adherence matter more than perfect certainty."
    ],
    "references": [
      {
        "text": "FDA Prescribing Information (DailyMed)",
        "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Acetylcysteine"
      }
    ],
    "category": "toxicity",
    "subcategory": "antidote",
    "localNotes": []
  }
};

const DRUG_TAXONOMY = {
  "amoxicillin": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "amoxicillin-clavulanate": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "ampicillin-sulbactam": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "piperacillin-tazobactam": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "cefazolin": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "ceftriaxone": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "cefepime": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "meropenem": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "ertapenem": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "vancomycin": {
    "category": "antimicrobial",
    "subcategory": "grampos"
  },
  "linezolid": {
    "category": "antimicrobial",
    "subcategory": "grampos"
  },
  "daptomycin": {
    "category": "antimicrobial",
    "subcategory": "grampos"
  },
  "metronidazole": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "azithromycin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "doxycycline": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "levofloxacin": {
    "category": "antimicrobial",
    "subcategory": "quinolone"
  },
  "ciprofloxacin": {
    "category": "antimicrobial",
    "subcategory": "quinolone"
  },
  "tmp-smx": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "ganciclovir": {
    "category": "antimicrobial",
    "subcategory": "antiviral"
  },
  "enoxaparin": {
    "category": "anticoagulant"
  },
  "metformin": {
    "category": "metabolic"
  },
  "fluconazole": {
    "category": "antimicrobial",
    "subcategory": "antifungal"
  },
  "voriconazole": {
    "category": "antimicrobial",
    "subcategory": "antifungal"
  },
  "caspofungin": {
    "category": "antimicrobial",
    "subcategory": "antifungal"
  },
  "amphotericin-b": {
    "category": "antimicrobial",
    "subcategory": "antifungal"
  },
  "ampicillin": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "ceftazidime": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "ceftazidime-avibactam": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "cefuroxime": {
    "category": "antimicrobial",
    "subcategory": "betalactam"
  },
  "gentamicin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "amikacin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "tigecycline": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "colistin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "clindamycin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "rifampicin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "fosfomycin": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "micafungin": {
    "category": "antimicrobial",
    "subcategory": "antifungal"
  },
  "minocycline": {
    "category": "antimicrobial",
    "subcategory": "other"
  },
  "insulin-regular": {
    "category": "insulin"
  },
  "insulin-rapid": {
    "category": "insulin"
  },
  "insulin-long": {
    "category": "insulin"
  },
  "insulin-nph": {
    "category": "insulin"
  },
  "normal-saline": {
    "category": "fluid"
  },
  "lactated-ringers": {
    "category": "fluid"
  },
  "d5w": {
    "category": "fluid"
  },
  "half-normal-saline": {
    "category": "fluid"
  },
  "d5ns": {
    "category": "fluid"
  },
  "taita-1": {
    "category": "fluid"
  },
  "taita-2": {
    "category": "fluid"
  },
  "taita-3": {
    "category": "fluid"
  },
  "taita-5": {
    "category": "fluid"
  },
  "ketorolac": {
    "category": "nsaid"
  },
  "ibuprofen": {
    "category": "nsaid"
  },
  "celecoxib": {
    "category": "nsaid"
  },
  "diclofenac": {
    "category": "nsaid"
  },
  "indomethacin": {
    "category": "nsaid"
  },
  "naproxen": {
    "category": "nsaid"
  },
  "lactulose": {
    "category": "laxative"
  },
  "senna": {
    "category": "laxative"
  },
  "bisacodyl": {
    "category": "laxative"
  },
  "mag-oxide": {
    "category": "laxative"
  },
  "glycerin-supp": {
    "category": "laxative"
  },
  "polyethylene-glycol": {
    "category": "laxative"
  },
  "zolpidem": {
    "category": "hypnotic"
  },
  "lorazepam": {
    "category": "hypnotic"
  },
  "midazolam": {
    "category": "hypnotic"
  },
  "melatonin": {
    "category": "hypnotic"
  },
  "hydroxyzine": {
    "category": "hypnotic"
  },
  "triazolam": {
    "category": "hypnotic"
  },
  "acetaminophen": {
    "category": "analgesic"
  },
  "pantoprazole": {
    "category": "gi",
    "subcategory": "acid"
  },
  "heparin": {
    "category": "anticoagulant"
  },
  "apixaban": {
    "category": "anticoagulant"
  },
  "warfarin": {
    "category": "anticoagulant"
  },
  "aspirin": {
    "category": "antiplatelet"
  },
  "clopidogrel": {
    "category": "antiplatelet"
  },
  "furosemide": {
    "category": "cardiovascular",
    "subcategory": "diuretic"
  },
  "spironolactone": {
    "category": "cardiovascular",
    "subcategory": "diuretic"
  },
  "losartan": {
    "category": "cardiovascular",
    "subcategory": "blood-pressure"
  },
  "amlodipine": {
    "category": "cardiovascular",
    "subcategory": "blood-pressure"
  },
  "atorvastatin": {
    "category": "cardiovascular",
    "subcategory": "lipid"
  },
  "empagliflozin": {
    "category": "metabolic"
  },
  "omeprazole": {
    "category": "gi",
    "subcategory": "acid"
  },
  "famotidine": {
    "category": "gi",
    "subcategory": "acid"
  },
  "prednisone": {
    "category": "steroid"
  },
  "albuterol": {
    "category": "respiratory",
    "subcategory": "bronchodilator"
  },
  "tiotropium": {
    "category": "respiratory",
    "subcategory": "bronchodilator"
  },
  "ondansetron": {
    "category": "gi",
    "subcategory": "nausea"
  },
  "metoclopramide": {
    "category": "gi",
    "subcategory": "nausea"
  },
  "trazodone": {
    "category": "hypnotic"
  },
  "budesonide-formoterol": {
    "category": "respiratory",
    "subcategory": "controller"
  },
  "amiodarone": {
    "category": "cardiovascular",
    "subcategory": "rate-rhythm"
  },
  "metoprolol": {
    "category": "cardiovascular",
    "subcategory": "rate-rhythm"
  },
  "digoxin": {
    "category": "cardiovascular",
    "subcategory": "rate-rhythm"
  },
  "nitroglycerin": {
    "category": "cardiovascular",
    "subcategory": "antianginal"
  },
  "lisinopril": {
    "category": "cardiovascular",
    "subcategory": "renal-hf"
  },
  "valsartan": {
    "category": "cardiovascular",
    "subcategory": "renal-hf"
  },
  "sacubitril-valsartan": {
    "category": "cardiovascular",
    "subcategory": "renal-hf"
  },
  "hydrochlorothiazide": {
    "category": "cardiovascular",
    "subcategory": "diuretic"
  },
  "bumetanide": {
    "category": "cardiovascular",
    "subcategory": "diuretic"
  },
  "potassium-chloride": {
    "category": "electrolyte",
    "subcategory": "potassium"
  },
  "rivaroxaban": {
    "category": "anticoagulant",
    "subcategory": "doac"
  },
  "dabigatran": {
    "category": "anticoagulant",
    "subcategory": "doac"
  },
  "edoxaban": {
    "category": "anticoagulant",
    "subcategory": "doac"
  },
  "fondaparinux": {
    "category": "anticoagulant",
    "subcategory": "parenteral"
  },
  "magnesium-sulfate": {
    "category": "electrolyte",
    "subcategory": "magnesium"
  },
  "calcium-gluconate": {
    "category": "electrolyte",
    "subcategory": "calcium"
  },
  "sodium-bicarbonate": {
    "category": "electrolyte",
    "subcategory": "alkali"
  },
  "phosphate": {
    "category": "electrolyte",
    "subcategory": "phosphate"
  },
  "dextrose-50": {
    "category": "metabolic",
    "subcategory": "rescue"
  },
  "glucagon": {
    "category": "metabolic",
    "subcategory": "rescue"
  },
  "sitagliptin": {
    "category": "metabolic",
    "subcategory": "diabetes"
  },
  "linagliptin": {
    "category": "metabolic",
    "subcategory": "diabetes"
  },
  "glipizide": {
    "category": "metabolic",
    "subcategory": "diabetes"
  },
  "semaglutide": {
    "category": "metabolic",
    "subcategory": "diabetes"
  },
  "haloperidol": {
    "category": "neuropsych",
    "subcategory": "delirium-qt"
  },
  "quetiapine": {
    "category": "neuropsych",
    "subcategory": "delirium-qt"
  },
  "morphine": {
    "category": "analgesic",
    "subcategory": "opioid"
  },
  "oxycodone": {
    "category": "analgesic",
    "subcategory": "opioid"
  },
  "fentanyl": {
    "category": "analgesic",
    "subcategory": "opioid"
  },
  "acetylcysteine": {
    "category": "toxicity",
    "subcategory": "antidote"
  }
};

Object.entries(DRUG_DATA).forEach(([key, drug]) => {
  const taxonomy = DRUG_TAXONOMY[key] || {};
  if (!Array.isArray(drug.references)) drug.references = [];
  if (!Array.isArray(drug.publicNotes)) drug.publicNotes = [];
  if (!Array.isArray(drug.localNotes)) drug.localNotes = [];
  if (!drug.category && taxonomy.category) drug.category = taxonomy.category;
  if (!drug.subcategory && taxonomy.subcategory) drug.subcategory = taxonomy.subcategory;
});
