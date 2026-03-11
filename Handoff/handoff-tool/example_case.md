# Example Case for Testing

Use these to test the handoff tool. Create the patient via the UI, then paste each data block one at a time in the "Add Data" tab with the indicated category.

---

## Patient Setup (fill in the "New Patient" form)

- **Name:** Jane Doe
- **Age/Sex:** 72F
- **MRN:** 000001
- **Admission Date:** 2026-02-20
- **Admitting Dx:** Community-acquired pneumonia with sepsis
- **PMH:** COPD GOLD III, HTN, DM2 (A1c 8.2), Afib on warfarin, CKD stage 3a (baseline Cr 1.4)
- **Allergies:** Penicillin (rash)
- **Code Status:** Full code
- **Primary Team:** Pulmonology

---

## Entry 1 — Category: Labs
*Paste this on day of admission (Feb 20)*

Admission labs (2026-02-20 14:00):
WBC 18.4 (N 88%), Hgb 11.2, Plt 198
Na 131, K 4.8, Cl 98, HCO3 18, BUN 34, Cr 2.1 (baseline 1.4), Glucose 243
AST 42, ALT 38, Alk Phos 102, T.Bili 1.1
Lactate 3.8
Procalcitonin 4.2
INR 2.4 (on warfarin)
ABG: pH 7.31, pCO2 32, pO2 68 on 3L NC
Blood cultures x2 drawn
Sputum culture sent
UA: negative

---

## Entry 2 — Category: Imaging
*Paste this shortly after Entry 1*

CXR PA/Lat (2026-02-20 15:30):
Right lower lobe consolidation with air bronchograms. Small right-sided pleural effusion. No pneumothorax. Heart size upper limits of normal. No pulmonary edema.

---

## Entry 3 — Category: Clinical Note
*Paste this as the admission note*

Admission note (2026-02-20 16:00):
72F w/ COPD, DM2, CKD3a presenting with 3 days of productive cough (yellow-green sputum), fever (Tmax 39.2), and progressive dyspnea. Found to be hypotensive in ED (BP 88/52), tachycardic (HR 112), SpO2 91% on RA. Meets SIRS criteria, qSOFA 2. Started on NS 30mL/kg bolus, levofloxacin 750mg IV (PCN allergy), and placed on 3L NC. BP improved to 102/64 after 2L IVF. AKI likely prerenal in setting of sepsis (Cr 2.1 from baseline 1.4). Warfarin held given acute illness. DVT ppx with heparin SQ.

---

## Entry 4 — Category: Labs
*Paste this the next morning (Feb 21)*

Morning labs (2026-02-21 06:00):
WBC 15.2 (down from 18.4), Hgb 10.8, Plt 182
Na 133, K 4.5, Cr 1.9 (improving from 2.1), Glucose 198
Lactate 2.1 (down from 3.8)
INR 2.8 (warfarin held, trending up)
Blood cultures: pending (no growth at 24h)
Sputum culture: pending

---

## Entry 5 — Category: Vitals
*Paste this same morning*

Vitals (2026-02-21 08:00):
T 37.8 (down from 39.2), HR 98, BP 110/68, RR 20, SpO2 94% on 2L NC
I/O (24h): In 3200mL, Out 1800mL (UOP 75mL/hr avg)

---

## Entry 6 — Category: Consult
*Paste this on Feb 21 afternoon*

ID consult (2026-02-21 14:00):
Agree with levofloxacin for CAP given PCN allergy. Would broaden to add metronidazole if no improvement in 48h to cover aspiration component given COPD history. Recommend repeat procalcitonin day 3 to guide duration. Target 7 days total abx if uncomplicated. Follow blood and sputum cultures. Consider CT chest if no improvement by day 3 to evaluate for empyema given pleural effusion.

---

## Entry 7 — Category: Labs
*Paste this on Feb 22*

Morning labs (2026-02-22 06:00):
WBC 11.8 (trending down), Hgb 10.6, Plt 175
Na 136, K 4.2, Cr 1.6 (improving), Glucose 178
Lactate 1.4 (normalizing)
Procalcitonin 1.8 (down from 4.2)
INR 3.1 (still rising, warfarin held)
Blood cultures: No growth at 48h (final pending)
Sputum culture: Streptococcus pneumoniae, sensitive to levofloxacin, resistant to penicillin

---

## Entry 8 — Category: Vitals
*Paste on Feb 22*

Vitals (2026-02-22 08:00):
T 37.2, HR 88, BP 118/72, RR 18, SpO2 96% on 1L NC (weaning)
I/O (24h): In 2400mL, Out 2200mL

---

## Entry 9 — Category: Clinical Note
*Paste on Feb 22*

Progress (2026-02-22 10:00):
Patient reporting improved dyspnea, cough still productive but less. Appetite returning. Ambulated to bathroom independently. Lung exam: decreased crackles RLL, still some dullness at base. Plan: continue levofloxacin, wean O2 as tolerated, target d/c in 1-2 days if continues to improve. Resume warfarin tonight at reduced dose (3mg, was on 5mg) given INR 3.1. Recheck INR in AM. Transition to PO levofloxacin when tolerating diet well. Will need total 7 days abx per ID recs.

---

## What to test

1. **After all entries are in**, go to Generate Note tab:
   - Generate **SBAR** — should summarize current status and overnight concerns (INR trending up, O2 weaning)
   - Generate **Progress Note** — should focus on Feb 22 data with trends
   - Generate **Discharge Summary** — should produce full hospital course narrative across all 3 days

2. **Batch SBAR** — if you add a second test patient, the batch button should generate notes for both
