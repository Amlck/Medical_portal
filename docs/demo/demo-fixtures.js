window.MEDIPORT_DEMO_FIXTURES = {
  generatedAt: '2026-05-08T08:00:00.000Z',
  patients: [
    {
      id: 'demo-alpha',
      name: 'Demo Patient Alpha',
      age: 72,
      sex: 'F',
      age_sex: '72F',
      mrn: 'DEMO-0001',
      admitted: '2026-05-01',
      dx: 'Community-acquired pneumonia with AKI recovery',
      pmh: 'HTN, CKD3, type 2 diabetes',
      allergies: 'No known drug allergies',
      code_status: 'Full code',
      team: 'Demo Medicine A',
      modified: '2026-05-08T07:45:00.000Z',
      content: `# Demo Patient Alpha

**Age/Sex:** 72F
**MRN:** DEMO-0001
**Admitted:** 2026-05-01
**Diagnosis:** Community-acquired pneumonia with AKI recovery
**PMH:** HTN, CKD3, type 2 diabetes
**Allergies:** No known drug allergies
**Code Status:** Full code
**Team:** Demo Medicine A

## 2026-05-01 Admission
Admitted with fever, productive cough, mild hypoxemia, and right lower-lobe infiltrate. Started ceftriaxone plus doxycycline after blood and sputum cultures.

## 2026-05-06 Labs
| Test | Value | Unit |
|------|-------|------|
| WBC | 13.2 | 10^3/uL |
| Hgb | 10.4 | g/dL |
| Plt | 214 | 10^3/uL |
| Na | 134 | mEq/L |
| K | 4.8 | mEq/L |
| HCO3 | 20 | mEq/L |
| BUN | 38 | mg/dL |
| Cr | 1.8 | mg/dL |
| CRP | 68 | mg/L |

## 2026-05-07 Imaging
CXR: improving right lower-lobe opacity, no pleural effusion.

## 2026-05-08 Clinical Note
Afebrile for 36 hours. Oxygen down to nasal cannula 1 L/min. Creatinine improving with oral intake and medication review. Plan oral step-down antibiotics if cultures remain negative.`,
      vitals: [
        { id: 'v-alpha-2', timestamp: '2026-05-08T06:00:00', temp: 37.1, hr: 92, bp_sys: 128, bp_dia: 68, rr: 18, spo2: 95, oxygen: 'NC 1 L/min' },
        { id: 'v-alpha-1', timestamp: '2026-05-07T18:00:00', temp: 37.4, hr: 101, bp_sys: 122, bp_dia: 64, rr: 20, spo2: 94, oxygen: 'NC 2 L/min' }
      ],
      pending: [
        { id: 'p-alpha-1', category: 'Microbiology', description: 'Final sputum culture', due_at: '2026-05-08T17:00', status: 'pending', priority: 'normal', created_at: '2026-05-07T09:00' },
        { id: 'p-alpha-2', category: 'Labs', description: 'Repeat BMP after AKI recovery', due_at: '2026-05-09T08:00', status: 'pending', priority: 'normal', created_at: '2026-05-08T07:00' }
      ],
      meta: { code_status: 'full', isolation: '', disposition: 'Home in 24-48h if stable' },
      io: [
        { id: 'io-alpha-1', timestamp: '2026-05-08T06:00:00', intake_ml: 1500, output_ml: 1250, notes: 'Net +250 mL' }
      ],
      medications: {
        baseline: [
          { id: 'mb-alpha-1', name: 'Metformin', dose: '500 mg', route: 'PO', frequency: 'BID', indication: 'Diabetes', status: 'active' },
          { id: 'mb-alpha-2', name: 'Losartan', dose: '50 mg', route: 'PO', frequency: 'daily', indication: 'HTN', status: 'active' }
        ],
        current: [
          { id: 'm-alpha-1', name: 'Ceftriaxone', drug_key: 'ceftriaxone', dose: '2 g', route: 'IV', frequency: 'q24h', indication: 'Pneumonia', status: 'active', notes: 'Day 4' },
          { id: 'm-alpha-2', name: 'Doxycycline', drug_key: 'doxycycline', dose: '100 mg', route: 'PO', frequency: 'BID', indication: 'Atypical pneumonia coverage', status: 'active' },
          { id: 'm-alpha-3', name: 'Metformin', drug_key: 'metformin', dose: '500 mg', route: 'PO', frequency: 'BID', indication: 'Diabetes', status: 'held', notes: 'Held during AKI' }
        ],
        changes: [
          { id: 'mc-alpha-1', action: 'held', timestamp: '2026-05-06T10:00:00', from_sig: 'Metformin 500 mg PO BID', to_sig: 'Held', reason: 'AKI' }
        ]
      },
      problems: {
        problems: [
          { id: 'pr-alpha-1', title: 'Community-acquired pneumonia', priority: 1, status: 'improving', owner: 'Medicine', assessment: 'Improving oxygen requirement and fever curve.', plan: 'Continue ceftriaxone/doxycycline today; oral step-down if cultures negative.' },
          { id: 'pr-alpha-2', title: 'AKI on CKD3', priority: 2, status: 'improving', owner: 'Medicine', assessment: 'Cr downtrending from peak 2.2 to 1.8.', plan: 'Trend BMP, avoid nephrotoxins, review renal dosing.' }
        ]
      },
      todos: [
        { id: 't-alpha-1', patient_id: 'demo-alpha', title: 'Review final sputum culture', note: 'De-escalate if no resistant organism.', priority: 'high', status: 'open', due_at: '2026-05-08T17:00', created_at: '2026-05-08T07:15:00' },
        { id: 't-alpha-2', patient_id: 'demo-alpha', title: 'Check BMP tomorrow', note: 'AKI recovery and potassium.', priority: 'normal', status: 'open', due_at: '2026-05-09', created_at: '2026-05-08T07:20:00' }
      ],
      watchRules: [
        { id: 'w-alpha-1', lab: 'Cr', operator: '>', value: 2, tone: 'warn', note: 'AKI recurrence watch' }
      ]
    },
    {
      id: 'demo-beta',
      name: 'Demo Patient Beta',
      age: 58,
      sex: 'M',
      age_sex: '58M',
      mrn: 'DEMO-0002',
      admitted: '2026-05-03',
      dx: 'DKA resolved, discharge planning',
      pmh: 'Type 1 diabetes, dyslipidemia',
      allergies: 'Sulfa rash',
      code_status: 'Full code',
      team: 'Demo Medicine B',
      modified: '2026-05-08T07:30:00.000Z',
      content: `# Demo Patient Beta

**Age/Sex:** 58M
**MRN:** DEMO-0002
**Admitted:** 2026-05-03
**Diagnosis:** DKA resolved, discharge planning
**PMH:** Type 1 diabetes, dyslipidemia
**Allergies:** Sulfa rash
**Code Status:** Full code
**Team:** Demo Medicine B

## 2026-05-03 Admission
Presented with nausea, dehydration, glucose 486 mg/dL, anion gap metabolic acidosis. Treated with insulin infusion and IV fluids.

## 2026-05-07 Labs
| Test | Value | Unit |
|------|-------|------|
| Na | 137 | mEq/L |
| K | 4.1 | mEq/L |
| HCO3 | 24 | mEq/L |
| BUN | 18 | mg/dL |
| Cr | 1.0 | mg/dL |
| Glu | 168 | mg/dL |

## 2026-05-08 Clinical Note
Anion gap closed. Eating reliably. Transitioned to basal-bolus insulin. Needs injection teaching and follow-up plan before discharge.`,
      vitals: [
        { id: 'v-beta-1', timestamp: '2026-05-08T06:00:00', temp: 36.8, hr: 84, bp_sys: 118, bp_dia: 72, rr: 16, spo2: 98, oxygen: 'Room air' }
      ],
      pending: [
        { id: 'p-beta-1', category: 'Education', description: 'Insulin pen teaching', due_at: '2026-05-08T15:00', status: 'pending', priority: 'high', created_at: '2026-05-08T08:00' }
      ],
      meta: { code_status: 'full', isolation: '', disposition: 'Likely discharge today after teaching' },
      io: [],
      medications: {
        baseline: [
          { id: 'mb-beta-1', name: 'Insulin glargine', dose: '18 units', route: 'SC', frequency: 'nightly', indication: 'Type 1 diabetes', status: 'active' }
        ],
        current: [
          { id: 'm-beta-1', name: 'Insulin glargine', dose: '22 units', route: 'SC', frequency: 'nightly', indication: 'Basal insulin', status: 'active' },
          { id: 'm-beta-2', name: 'Insulin lispro', dose: '6 units', route: 'SC', frequency: 'with meals', indication: 'Prandial insulin', status: 'active' }
        ],
        changes: [
          { id: 'mc-beta-1', action: 'dose_changed', timestamp: '2026-05-07T20:00:00', from_sig: 'Glargine 18 units nightly', to_sig: 'Glargine 22 units nightly', reason: 'Post-DKA transition' }
        ]
      },
      problems: {
        problems: [
          { id: 'pr-beta-1', title: 'DKA, resolved', priority: 1, status: 'improving', owner: 'Medicine', assessment: 'Gap closed and tolerating diet.', plan: 'Continue basal-bolus regimen; complete education.' },
          { id: 'pr-beta-2', title: 'Discharge readiness', priority: 2, status: 'stable', owner: 'Case management', assessment: 'Needs supplies and follow-up.', plan: 'Confirm insulin supplies and endocrine follow-up.' }
        ]
      },
      todos: [
        { id: 't-beta-1', patient_id: 'demo-beta', title: 'Confirm insulin supplies', note: 'Pens, needles, glucose strips.', priority: 'high', status: 'open', due_at: '2026-05-08T14:00', created_at: '2026-05-08T07:40:00' }
      ],
      watchRules: []
    }
  ],
  wardTodos: [
    { id: 't-ward-1', patient_id: '', title: 'Demo huddle: review pending discharges', note: 'Ward-level task example.', priority: 'normal', status: 'open', due_at: '2026-05-08T16:00', created_at: '2026-05-08T07:00:00' }
  ],
  cannedNotes: {
    sbar: `## SBAR Handoff
**Situation:** Demo patient is clinically improving with stable hemodynamics.
**Background:** Synthetic demo chart includes recent labs, vitals, active problems, and medication changes.
**Assessment:** Main overnight risks are culture follow-up, renal dosing review, and discharge readiness tasks.
**Recommendation:** Review pending items, continue current plan, and escalate for fever, worsening oxygen need, hypotension, or recurrent acidosis.`,
    progress: `## Progress Note
**Subjective:** Synthetic demo patient reports improved symptoms and no new overnight events.
**Objective:** Vitals stable. Recent labs show improving trend. Active medications and pending tasks reviewed.
**Assessment/Plan:** Continue current treatment plan, reconcile medications, complete pending results review, and prepare safe discharge checklist.`,
    discharge: `## Problem-Oriented Discharge Draft
1. **Primary hospital problem:** Improved with standard inpatient management in this synthetic scenario.
2. **Medication changes:** Reconcile demo medications and provide patient-facing instructions.
3. **Follow-up:** Arrange outpatient review and return precautions.
4. **Pending results:** Confirm no critical pending items before final discharge.`,
    discharge_ntuh: `## Chronological Discharge Course Draft
The synthetic patient was admitted for acute medical stabilization. Initial workup and treatment were completed, interval labs improved, and the patient transitioned to an outpatient-ready plan. Final discharge requires medication reconciliation, education, and review of pending demo tasks.`
  },
  consults: {
    note: `## Consult Request
**Reason for consult:** Demo question for specialist input.
**Clinical context:** Synthetic patient data only. Key active issues, recent vitals, labs, and medications are summarized from the canned fixture.
**Specific question:** Please advise on diagnosis, management, and follow-up recommendations.`,
    opinion: `## Consult Impression
This canned response models a concise specialist opinion. The patient appears stable in the demo scenario. Suggested next steps: verify key labs, narrow treatment when safe, and document clear contingency criteria.`,
    deescalation: `## Antibiotic De-escalation Demo
Cultures and clinical trajectory support narrowing therapy in this synthetic case if the patient remains afebrile and stable. Reassess source control, allergy history, renal function, and local guidance before making a real clinical decision.`
  }
};