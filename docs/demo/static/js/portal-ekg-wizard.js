// portal-ekg-wizard.js
// Step-by-step EKG interpretation wizard — launched from the Calculator view.
// Public API (window globals): openEkgWizard, closeEkgWizard,
//   ekgWizChoose, ekgWizBack, ekgWizJumpTo, ekgWizRestart, ekgWizCopy

(function () {
  'use strict';

  // ============================================================
  // STEP DEFINITIONS
  // Each step: id, label, q (question), sub (hint), opts[], ref[]
  // opts: { v (value), l (label), s (sub), c (css class), badge? }
  // ref sections: { t (title), items?, formula? }
  // ============================================================
  const STEPS = {

    rate: {
      id: 'rate', label: 'Rate',
      q: 'What is the ventricular rate?',
      sub: 'Count large squares between consecutive R waves: rate ≈ 300 ÷ (# large squares)',
      opts: [
        { v: 'brady',  l: 'Bradycardia',  s: '< 60 bpm',      c: 'ekw-c-warn' },
        { v: 'normal', l: 'Normal',        s: '60 – 100 bpm',  c: 'ekw-c-green' },
        { v: 'tachy',  l: 'Tachycardia',  s: '> 100 bpm',     c: '' },
      ],
      ref: [
        { t: 'Quick Estimation (memorize)', items: [
          '1 large sq → 300 bpm', '2 → 150', '3 → 100', '4 → 75', '5 → 60', '6 → 50'
        ]},
        { t: 'Precise Method', formula: 'Rate = 60,000 ÷ RR (ms)\nor 1,500 ÷ (# small squares)' },
      ]
    },

    rhythm: {
      id: 'rhythm', label: 'Rhythm',
      q: 'What is the rhythm?',
      sub: 'Are R-R intervals regular? Is there a P wave before every QRS?',
      opts: [
        { v: 'sinus',   l: 'Regular Sinus',         s: 'P before every QRS · constant PR · regular R-R',          c: 'ekw-c-green' },
        { v: 'afib',    l: 'Irregularly Irregular',  s: 'No distinct P waves · fibrillatory baseline · variable R-R', c: 'ekw-c-warn',
          badge: { txt: 'A-Fib', type: 'warn' } },
        { v: 'reg_irr', l: 'Regularly Irregular',   s: 'Sawtooth flutter waves at 300 bpm, or grouped beats',       c: 'ekw-c-warn' },
        { v: 'no_p',    l: 'No P Waves',             s: 'Junctional, ventricular, or AV dissociation',              c: '' },
      ],
      ref: [
        { t: 'P Wave Assessment', items: [
          'Normal: upright in I, II, aVF — inverted in aVR',
          'Sawtooth 300 bpm + 2:1 or variable block → atrial flutter',
          'No distinct P + irregular R-R → atrial fibrillation',
        ]},
        { t: 'AFib Rate', items: [
          'Controlled: ventricular rate 60–100 bpm',
          'Uncontrolled: ventricular rate > 100 bpm',
          'Slow AFib (< 60): dig toxicity, BB/CCB excess, AV block',
        ]},
      ]
    },

    pr: {
      id: 'pr', label: 'PR Interval',
      q: 'What is the PR interval?',
      sub: 'Measure from onset of P wave to onset of QRS complex',
      opts: [
        { v: 'normal',   l: 'Normal',              s: '120 – 200 ms (3 – 5 small squares)',                         c: 'ekw-c-green' },
        { v: 'long',     l: 'Prolonged',           s: '> 200 ms → 1st-degree AV block',                            c: 'ekw-c-warn' },
        { v: 'short_d',  l: 'Short + Delta Wave',  s: '< 120 ms + slurred upstroke → WPW pre-excitation',          c: 'ekw-c-warn',
          badge: { txt: 'WPW?', type: 'warn' } },
        { v: 'variable', l: 'Variable / Dropped',  s: 'PR lengthens then drops (Mobitz I) or fixed then drops (Mobitz II)', c: 'ekw-c-warn',
          badge: { txt: 'AV Block', type: 'warn' } },
      ],
      ref: [
        { t: 'PR Norms', items: ['Normal: 120–200 ms = 3–5 small squares'] },
        { t: 'AV Block', items: [
          '1°: PR > 200 ms, all P waves conduct — benign',
          '2° Mobitz I: progressive PR ↑ until one P drops (AV node)',
          '2° Mobitz II: fixed PR, sudden non-conducted P — higher risk',
          '3° (complete): no AV conduction, escape QRS',
        ]},
        { t: 'Short PR', items: [
          'WPW: delta wave + short PR + wide QRS',
          'Junctional: PR < 120 ms if P is retrograde',
        ]},
      ]
    },

    qrs_width: {
      id: 'qrs_width', label: 'QRS Width',
      q: 'What is the QRS duration?',
      sub: 'Measure earliest onset to latest offset across all leads',
      opts: [
        { v: 'narrow',     l: 'Narrow',      s: '< 110 ms (< 2.75 small squares)',        c: 'ekw-c-green' },
        { v: 'borderline', l: 'Borderline',  s: '110 – 119 ms — possible IVCD',           c: 'ekw-c-warn' },
        { v: 'wide',       l: 'Wide',        s: '≥ 120 ms — BBB · paced · VT · metabolic', c: 'ekw-c-warn',
          badge: { txt: 'Branches →', type: 'info' } },
      ],
      ref: [
        { t: 'Wide QRS Differential', items: [
          'RBBB: rSR\' in V1/V2, wide S in I and V6',
          'LBBB: broad R in I/aVL/V5-6, no Q in I/V5-6',
          'Paced: pacemaker spike before wide QRS',
          'VT: AV dissociation ± fusion/capture beats',
          'Metabolic/drug: diffuse widening (hyperK, Na-channel)',
        ]},
        { t: 'Normal V1 / V6 Example', images: [
          { src: 'static/img/ekg/normal-qrs-v1-v6.png', alt: 'Normal QRS morphology example in V1 and V6', caption: 'Normal septal forces: small r in V1 and q/R pattern in V6.' },
        ]},
      ]
    },

    qrs_type: {
      id: 'qrs_type', label: 'Wide QRS Type',
      q: 'Wide QRS — what is the morphology?',
      sub: 'Look at V1 (rSR\' vs broad R), V6 (S wave), leads I, aVL; check for pacemaker spike',
      opts: [
        { v: 'rbbb',  l: 'RBBB',              s: 'rSR\' in V1/V2 · wide slurred S in I and V6',                   c: '' },
        { v: 'lbbb',  l: 'LBBB',              s: 'Broad monophasic R in I/aVL/V5-6 · absent Q in I/V5-6',         c: '' },
        { v: 'paced', l: 'Paced Rhythm',      s: 'Pacemaker spike before QRS · LBBB-like if RV-paced',            c: 'ekw-c-warn' },
        { v: 'vt',    l: 'VT / Uncertain',   s: 'AV dissociation · concordance · NW axis · Brugada criteria',    c: 'ekw-c-warn',
          badge: { txt: 'Urgent', type: 'danger' } },
        { v: 'meta',  l: 'Metabolic / Drug', s: 'Diffuse widening · no clear BBB · sine-wave (hyperK)',           c: 'ekw-c-warn' },
      ],
      ref: [
        { t: 'RBBB Criteria (all)', items: [
          'QRS ≥ 120 ms',
          'rSR\' (M-shape) in V1 or V2',
          'Wide slurred S in I and V6',
        ], images: [
          { src: 'static/img/ekg/rbbb-v1-v6.png', alt: 'RBBB morphology example in V1 and V6', caption: 'RBBB morphology: terminal R prime in V1/V2 and broad terminal S in lateral leads.' },
        ]},
        { t: 'LBBB Criteria (all)', items: [
          'QRS ≥ 120 ms',
          'Broad monophasic R in I, aVL, V5-V6',
          'Absent Q in I, V5-V6 · QS or rS in V1',
          'LBBB invalidates standard LVH and STEMI criteria',
        ], images: [
          { src: 'static/img/ekg/lbbb-v1-v6.png', alt: 'LBBB morphology example in V1 and V6', caption: 'LBBB morphology: deep QS/rS in V1 and broad monophasic lateral R wave.' },
        ]},
        { t: 'VT vs. SVT-Aberrancy', items: [
          'AV dissociation → VT',
          'Positive concordance (all R) V1-V6 → VT',
          'NW axis (neg I and aVF) → VT',
          'Rate > 170, no preceding P → treat as VT',
        ]},
      ]
    },

    narrow_tach: {
      id: 'narrow_tach', label: 'Narrow Tachycardia',
      q: 'Narrow-complex tachycardia — what pattern best fits?',
      sub: 'Use onset, regularity, P-wave location, flutter waves, and response to vagal maneuvers or adenosine.',
      opts: [
        { v: 'sinus',      l: 'Sinus Tachycardia',       s: 'Gradual onset · sinus P before each QRS · usually < 150 bpm', c: 'ekw-c-green' },
        { v: 'avnrt_avrt', l: 'AVNRT / Orthodromic AVRT', s: 'Abrupt on/off · regular · P hidden in QRS or retrograde after QRS', c: 'ekw-c-warn' },
        { v: 'flutter',    l: 'Atrial Flutter',          s: 'Sawtooth F waves · often ventricular rate near 150 with 2:1 block', c: 'ekw-c-warn' },
        { v: 'af_mat',     l: 'AF / MAT',                s: 'Irregular narrow tachycardia · AF has no P waves; MAT has ≥3 P morphologies', c: 'ekw-c-warn' },
        { v: 'uncertain',  l: 'Uncertain SVT',           s: 'If unstable, treat per ACLS; otherwise capture rhythm strip and compare priors', c: '' },
      ],
      ref: [
        { t: 'Narrow Tachycardia Clues', items: [
          'Gradual onset favors sinus tachycardia; abrupt start/stop favors reentry.',
          'Regular narrow tachycardia without visible P waves favors AVNRT.',
          'Short RP with retrograde inferior P waves suggests AVNRT/AVRT.',
          'Flutter often conducts 2:1, producing a ventricular rate near 150.',
          'Irregular narrow tachycardia suggests AF, flutter with variable block, or MAT.',
        ]},
        { t: 'Adenosine / Vagal Response', items: [
          'AVNRT/AVRT may terminate abruptly.',
          'AF/flutter/atrial tachycardia may slow and reveal atrial activity.',
          'Avoid AV-nodal blockers if an accessory pathway with pre-excited AF is suspected.',
        ]},
      ]
    },

    wct: {
      id: 'wct', label: 'Wide Tachycardia',
      q: 'Wide-complex tachycardia — which risk pattern is present?',
      sub: 'For a fast wide rhythm, assume VT until proven otherwise; rate and blood pressure alone do not reliably distinguish VT from SVT with aberrancy.',
      opts: [
        { v: 'vt_likely',     l: 'VT Likely',              s: 'AV dissociation · capture/fusion beats · concordance · extreme axis · prior MI/CMP', c: 'ekw-c-warn',
          badge: { txt: 'Treat as VT', type: 'danger' } },
        { v: 'svt_aberrancy', l: 'SVT with Aberrancy',     s: 'Typical BBB morphology · known baseline BBB · no VT clues identified', c: '' },
        { v: 'preexcited_af', l: 'Pre-excited AF Concern', s: 'Irregular wide tachycardia · very rapid/variable QRS · WPW pattern or delta wave history', c: 'ekw-c-warn',
          badge: { txt: 'Avoid AVN blockers', type: 'danger' } },
        { v: 'torsades',      l: 'Polymorphic / TdP',      s: 'Beat-to-beat QRS morphology changes · twisting axis · prolonged QT or pause-dependent runs', c: 'ekw-c-warn',
          badge: { txt: 'Mg + QT review', type: 'warn' } },
        { v: 'paced_device',  l: 'Paced / Device Rhythm',  s: 'Pacemaker spikes or device-mediated wide rhythm; compare with device history', c: '' },
      ],
      ref: [
        { t: 'VT-Favoring ECG Criteria', items: [
          'AV dissociation, capture beats, or fusion beats prove VT.',
          'Positive or negative concordance across V1-V6 favors VT.',
          'Extreme / northwest axis favors VT.',
          'Very wide QRS: >140 ms RBBB-type or >160 ms LBBB-type favors VT.',
          'Atypical BBB morphology: monophasic R in V1, r/S <1 in V6, q wave in V6, or slow initial forces.',
        ]},
        { t: 'Irregular Wide Tachycardia', items: [
          'AF with aberrancy: irregular but QRS morphology usually similar beat-to-beat.',
          'Pre-excited AF: very rapid, irregular, variable wide QRS; avoid beta-blockers, diltiazem/verapamil, digoxin, adenosine.',
          'Polymorphic VT/TdP: changing QRS morphology; review QTc, K, Mg, Ca, and QT-prolonging meds.',
        ]},
        { t: 'Clinical Guardrail', items: [
          'If unstable: synchronized cardioversion per ACLS.',
          'When uncertain, manage as VT while escalating.',
        ]},
      ]
    },

    brady_av: {
      id: 'brady_av', label: 'Brady / AV Block',
      q: 'Bradycardia or AV block — what pattern best fits?',
      sub: 'Look for P waves, the P:QRS relationship, PR behavior, dropped beats, and whether the escape QRS is narrow or wide.',
      opts: [
        { v: 'sinus_brady', l: 'Sinus Bradycardia',       s: 'Sinus P before every QRS · constant PR · slow but conducted rhythm', c: 'ekw-c-green' },
        { v: 'junctional',  l: 'Junctional Escape',       s: 'No visible P or retrograde/inverted P · usually narrow QRS · rate 40-60', c: '' },
        { v: 'first_deg',   l: '1st-degree AV Block',     s: 'PR > 200 ms · every P conducts to QRS', c: 'ekw-c-warn' },
        { v: 'mobitz_i',    l: 'Mobitz I / Wenckebach',   s: 'Progressive PR lengthening until a dropped QRS · often grouped beating', c: 'ekw-c-warn' },
        { v: 'mobitz_ii',   l: 'Mobitz II / High-grade',  s: 'Fixed PR with dropped QRS, or ≥2 dropped P waves in a row · often infranodal', c: 'ekw-c-warn',
          badge: { txt: 'Pacing risk', type: 'danger' } },
        { v: 'complete',    l: 'Complete Heart Block',    s: 'AV dissociation · P waves and QRS march independently · junctional or ventricular escape', c: 'ekw-c-warn',
          badge: { txt: 'Urgent', type: 'danger' } },
        { v: 'reversible',  l: 'Reversible / Medication', s: 'Beta-blocker, CCB, digoxin, amiodarone, ischemia, hyperK, hypothermia, OSA, hypothyroid', c: '' },
      ],
      ref: [
        { t: 'AV Block Pattern Check', items: [
          '1st degree: PR > 200 ms and all P waves conduct.',
          'Mobitz I: PR progressively lengthens before the dropped QRS.',
          'Mobitz II: PR stays fixed before dropped QRS; wide QRS raises infranodal concern.',
          '2:1 AV block cannot be typed by PR behavior alone; use QRS width, context, and prior tracings.',
          'Complete heart block: atria and ventricles are independent; escape may be narrow junctional or wide ventricular.',
        ]},
        { t: 'Bradycardia Safety Check', items: [
          'If unstable: atropine while preparing pacing/vasopressor support per ACLS.',
          'Review reversible causes: beta-blockers, non-DHP CCBs, digoxin, amiodarone, hyperkalemia, inferior MI, hypothermia, hypothyroidism.',
          'Mobitz II, high-grade AV block, complete heart block, or wide unstable escape rhythm deserves urgent escalation.',
        ]},
      ]
    },

    axis: {
      id: 'axis', label: 'Axis',
      q: 'What is the frontal QRS axis?',
      sub: 'Check net QRS deflection in leads I and aVF — then use II to confirm LAD boundary',
      opts: [
        { v: 'normal',  l: 'Normal',                 s: '0° to +90° · positive in both I and aVF',          c: 'ekw-c-green' },
        { v: 'lad',     l: 'Left Axis Deviation',    s: 'Beyond −30° · positive I · negative aVF · S > R in II', c: 'ekw-c-warn' },
        { v: 'rad',     l: 'Right Axis Deviation',   s: 'Beyond +90° · negative I · positive aVF',          c: 'ekw-c-warn' },
        { v: 'extreme', l: 'Extreme / NW Axis',      s: '−90° to ±180° · negative I and negative aVF',     c: '' },
      ],
      ref: [
        { t: 'Axis Quick-Check Grid', items: [
          'I(+), aVF(+) → Normal (0° to +90°)',
          'I(+), aVF(−) → LAD (confirm: S > R in II)',
          'I(−), aVF(+) → RAD (> +90°)',
          'I(−), aVF(−) → Extreme / NW axis',
        ], images: [
          { src: 'static/img/ekg/qrs-axis.png', alt: 'QRS axis diagram', caption: 'Quick frontal-plane QRS axis map.' },
        ]},
        { t: 'LAD Causes', items: ['LVH · LBBB · inferior MI · WPW · LAFB'] },
        { t: 'LAFB Criteria', items: [
          'LAD −45° to −90°', 'qR in aVL', 'rS in II, III, aVF', 'QRS < 120 ms',
        ]},
        { t: 'RAD Causes', items: ['RVH · PE · COPD · lateral MI · WPW · LPFB · septal defect'] },
      ]
    },

    qtc: {
      id: 'qtc', label: 'QTc',
      q: 'What is the corrected QT interval (QTc)?',
      sub: 'Bazett: QTc = QT ÷ √RR (seconds). Measure in lead II or V5.',
      opts: [
        { v: 'normal',     l: 'Normal QTc',    s: '< 440 ms (♂) · < 460 ms (♀)',              c: 'ekw-c-green' },
        { v: 'borderline', l: 'Borderline',    s: '440 – 499 ms — monitor, review meds',       c: 'ekw-c-warn' },
        { v: 'prolonged',  l: 'Prolonged QTc', s: '≥ 500 ms — Torsades de Pointes risk',       c: 'ekw-c-warn',
          badge: { txt: 'TdP Risk', type: 'danger' } },
        { v: 'short',      l: 'Short QTc',     s: '< 360 ms — hypercalcemia · digoxin · SQTS', c: '' },
      ],
      ref: [
        { t: 'Bazett Formula', formula: 'QTc = QT ÷ √RR\n(RR in seconds)' },
        { t: 'Normal Limits', items: ['♂ < 440 ms · ♀ < 460 ms · > 500 ms = TdP risk'] },
        { t: 'QTc Prolongation Causes', items: [
          'Drugs: amio, sotalol, haloperidol, methadone, macrolides, FQs',
          'Electrolytes: ↓K⁺, ↓Mg²⁺, ↓Ca²⁺',
          'CNS: stroke, SAH, head trauma',
          'Congenital LQTS',
        ]},
      ]
    },

    chamber: {
      id: 'chamber', label: 'Chamber / Voltage',
      q: 'Any chamber enlargement or voltage abnormality?',
      sub: 'Check LVH/RVH voltage criteria and P-wave duration/amplitude',
      opts: [
        { v: 'none',   l: 'None',                 s: 'No LVH, RVH, atrial enlargement, or low voltage',       c: 'ekw-c-green' },
        { v: 'lvh',    l: 'LVH',                  s: 'Sokolow: S(V1)+R(V5/V6) ≥ 35 mm · Cornell criteria',    c: '' },
        { v: 'rvh',    l: 'RVH',                  s: 'R > S in V1 · RAD ≥ 110° · RV strain in V1-V3',         c: 'ekw-c-warn' },
        { v: 'atrial', l: 'Atrial Enlargement',   s: 'P > 120 ms (LAA) · P ≥ 2.5 mm in II (RAA)',             c: '' },
        { v: 'low_v',  l: 'Low Voltage',          s: 'All QRS < 5 mm limb or < 10 mm precordial leads',       c: 'ekw-c-warn' },
      ],
      ref: [
        { t: 'LVH Voltage Criteria', items: [
          'Sokolow-Lyon: S(V1) + R(V5 or V6) ≥ 35 mm',
          'Cornell: R(aVL) + S(V3) > 28 mm (♂) or > 20 mm (♀)',
          'LVH strain: downsloping ST↓ + T-inv in I, aVL, V5-V6',
        ]},
        { t: 'RVH Criteria', items: [
          'R > S in V1 (or R > 7 mm)', 'RAD ≥ 110°',
          'RV strain: ST↓ + T-inv V1-V3, II, III, aVF',
        ]},
        { t: 'Low Voltage DDx', items: [
          'Pericardial effusion/tamponade (urgent echo)',
          'Hypothyroidism · obesity · COPD · amyloidosis',
        ]},
      ]
    },

    q_waves: {
      id: 'q_waves', label: 'Q Waves / R Progression',
      q: 'Q-wave abnormalities or poor R-wave progression?',
      sub: 'Pathologic Q: width ≥ 30 ms OR depth > 25% of R-wave height in ≥ 2 contiguous leads',
      opts: [
        { v: 'normal',   l: 'Normal',               s: 'Septal q in I/aVL/V5-6 OK · R grows V1 → V5',         c: 'ekw-c-green' },
        { v: 'prwp',     l: 'Poor R Progression',   s: 'R wave ≤ 3 mm in V3 · fails to grow V1 → V4',         c: 'ekw-c-warn' },
        { v: 'path_q',   l: 'Pathologic Q Waves',   s: '≥ 30 ms wide or > 25% R-height in ≥ 2 contiguous leads', c: 'ekw-c-warn',
          badge: { txt: 'Prior MI?', type: 'warn' } },
        { v: 'dom_r_v1', l: 'Dominant R in V1-V2',  s: 'R > S in V1 — posterior MI · RVH · RBBB · WPW',       c: '' },
      ],
      ref: [
        { t: 'Pathologic Q Criteria', items: [
          'Width ≥ 30 ms (0.03 s), OR depth > 25% of R-wave',
          'In ≥ 2 contiguous leads',
          'Normal septal q: narrow (< 40 ms) in I, aVL, V5-V6',
        ]},
        { t: 'Q Territory → Vessel', items: [
          'II, III, aVF → inferior (RCA)',
          'I, aVL → high lateral (diagonal/LCx)',
          'V1-V4 → anterior (LAD)',
          'V5-V6 → apical/lateral',
          'Dominant R in V1-V2 → posterior',
        ]},
        { t: 'PRWP DDx', items: [
          'Anterior MI · LBBB · LVH · COPD · lead misplacement',
        ]},
      ]
    },

    st: {
      id: 'st', label: 'ST Segment',
      q: 'ST segment changes?',
      sub: 'Measure at the J-point. Compare with TP baseline.',
      opts: [
        { v: 'normal',  l: 'No ST Changes',          s: 'Isoelectric · minor variation acceptable V1-V2',        c: 'ekw-c-green' },
        { v: 'stemi',   l: 'STE — Contiguous Leads', s: 'Convex STE ≥ 1 mm in ≥ 2 contiguous limb leads, or ≥ 2 mm V2-V3', c: 'ekw-c-warn',
          badge: { txt: 'STEMI / Equiv', type: 'danger' } },
        { v: 'std',     l: 'ST Depression',          s: '≥ 0.5 mm J-point depression — ischemia · posterior MI · strain', c: 'ekw-c-warn' },
        { v: 'peri',    l: 'Diffuse STE + PR↓',      s: 'Concave STE most leads + PR depression → pericarditis', c: 'ekw-c-warn' },
        { v: 'brugada', l: 'Brugada Pattern',        s: 'Coved Type 1 STE ≥ 2 mm + negative T in V1-V2',        c: 'ekw-c-warn',
          badge: { txt: 'Brugada', type: 'danger' } },
        { v: 'early_r', l: 'Early Repolarization',  s: 'Concave STE + J-point notching V2-V5 in young patients', c: '' },
        { v: 'strain',  l: 'Strain Pattern',         s: 'Downsloping ST↓ + T-inv in LVH/RVH territory (secondary)', c: '' },
      ],
      ref: [
        { t: 'STEMI Territory', items: [
          'V1-V4: anterior (LAD)',
          'II, III, aVF: inferior (RCA)',
          'I, aVL: lateral (LCx/diagonal)',
          'V7-V9 (or STD V1-V3 + dominant R): posterior',
          'aVR STE + diffuse STD: left main or proximal LAD',
        ]},
        { t: 'Pericarditis vs. STEMI', items: [
          'Pericarditis: diffuse, concave, PR↓, no reciprocal STD, evolves days',
          'STEMI: territorial, convex, reciprocal STD, evolves hours',
        ]},
        { t: 'ST Depression DDx', items: [
          'Subendocardial ischemia · posterior MI equivalent',
          'Digoxin effect (scooping) · hypokalemia · LVH/LBBB strain',
        ]},
      ]
    },

    t_waves: {
      id: 't_waves', label: 'T Waves',
      q: 'T-wave abnormalities?',
      sub: 'Normal: upright in I, II, V3-V6; inverted in aVR; variable in III, V1-V2',
      opts: [
        { v: 'normal',   l: 'Normal T Waves',        s: 'Upright I/II/V3-V6 · inverted aVR · no focal change',     c: 'ekw-c-green' },
        { v: 'inv',      l: 'T-Wave Inversion',      s: 'Focal TWI — ischemia · RVH strain · cardiomyopathy',      c: 'ekw-c-warn' },
        { v: 'deep_sym', l: 'Deep Symmetric TWI',    s: 'V2-V4 deep symmetric inversions — Wellens pattern',       c: 'ekw-c-warn',
          badge: { txt: 'Wellens?', type: 'danger' } },
        { v: 'peaked',   l: 'Peaked / Hyperacute',   s: 'Tall broad symmetric T — hyperK · hyperacute MI · de Winter', c: 'ekw-c-warn',
          badge: { txt: 'Check K⁺', type: 'warn' } },
        { v: 'flat_u',   l: 'Flat T + Prominent U',  s: 'Hypokalemia · hypomagnesemia · bradycardia',              c: 'ekw-c-warn' },
      ],
      ref: [
        { t: 'Wellens Syndrome', items: [
          'Type A: biphasic T in V2-V3',
          'Type B: deep symmetric TWI V2-V4 (more common)',
          'After chest pain resolves — critical proximal LAD stenosis',
          'Do NOT stress test → urgent coronary angiography',
        ]},
        { t: 'Peaked T Waves', items: [
          'Early hyperK: peaked narrow T (check K⁺ urgently)',
          'Hyperacute STEMI: tall broad T early in MI',
          'de Winter pattern: upsloping STD + tall T V1-V6 = LAD occlusion equivalent',
        ]},
        { t: 'Hyperkalemia EKG Sequence', items: [
          'K⁺ 5.5–6.5: peaked narrow T', 'K⁺ 6.5–7.5: PR ↑, QRS widens',
          'K⁺ > 7.5: sine-wave pattern → arrest risk',
        ]},
      ]
    },

    comparison: {
      id: 'comparison', label: 'Prior Comparison',
      q: 'Compared with prior EKG?',
      sub: 'New vs old changes often determine urgency. Use "no prior" if unavailable.',
      opts: [
        { v: 'no_prior',  l: 'No Prior Available',      s: 'No baseline tracing available for comparison',       c: '' },
        { v: 'unchanged', l: 'No Meaningful Change',    s: 'Findings appear unchanged compared with prior EKG',   c: 'ekw-c-green' },
        { v: 'new',       l: 'New / Dynamic Change',    s: 'New ischemic, conduction, rhythm, or interval change', c: 'ekw-c-warn',
          badge: { txt: 'Attention', type: 'warn' } },
      ],
      ref: [
        { t: 'Comparison Pearls', items: [
          'New ST-T, Q-wave, rhythm, conduction, or QTc changes deserve higher attention.',
          'Old LBBB, LVH strain, early repolarization, and prior Q waves can prevent over-calling acute ischemia.',
          'If no prior is available, document that uncertainty explicitly.',
        ]},
      ]
    },

  };

  // ============================================================
  // SEQUENCE BUILDER (handles branching)
  // ============================================================
  function buildSequence(ans) {
    const seq = ['rate', 'rhythm'];
    if (ans.rhythm !== 'afib' && ans.rhythm !== 'no_p') seq.push('pr');
    seq.push('qrs_width');
    if (ans.qrs_width === 'wide') seq.push('qrs_type');
    if (ans.rate === 'brady' || ans.pr === 'long' || ans.pr === 'variable' || ans.rhythm === 'no_p') seq.push('brady_av');
    if (ans.rate === 'tachy' && ans.qrs_width && ans.qrs_width !== 'wide') seq.push('narrow_tach');
    if (ans.rate === 'tachy' && ans.qrs_width === 'wide') seq.push('wct');
    seq.push('axis', 'qtc', 'chamber', 'q_waves', 'st', 't_waves', 'comparison', 'summary');
    return seq;
  }

  // ============================================================
  // STATE
  // ============================================================
  const state = {
    history:  [],
    answers:  {},
    finalNote: '',
    sequence: buildSequence({}),
  };

  // ============================================================
  // OPEN / CLOSE
  // ============================================================
  function open() {
    var overlay = document.getElementById('ekgWizardOverlay');
    if (!overlay) { console.warn('[ekg-wizard] overlay element not found'); return; }
    // Move overlay to body on first use so it is never clipped by a parent
    // overflow:hidden or stacking context (e.g. .view flex container).
    if (overlay.parentNode !== document.body) {
      document.body.appendChild(overlay);
    }
    state.history  = [];
    state.answers  = {};
    state.finalNote = '';
    state.sequence = buildSequence({});
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    document.body.classList.add('ekg-wiz-open');
    renderStep(state.sequence[0], 'fwd');
    renderCrumb();
  }

  function close() {
    var overlay = document.getElementById('ekgWizardOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('ekg-wiz-open');
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function choose(stepId, value, label) {
    const step = STEPS[stepId];
    state.history.push({ stepId, label, value, stepLabel: step ? step.label : stepId });
    state.answers[stepId] = value;
    state.sequence = buildSequence(state.answers);
    const ci = state.sequence.indexOf(stepId);
    const nextId = state.sequence[ci + 1];
    renderCrumb();
    if (nextId) renderStep(nextId, 'fwd');
  }

  function back() {
    if (!state.history.length) return;
    const last = state.history.pop();
    delete state.answers[last.stepId];
    state.sequence = buildSequence(state.answers);
    renderCrumb();
    renderStep(last.stepId, 'back');
  }

  function jumpTo(hIdx) {
    const removed = state.history.splice(hIdx);
    removed.forEach(function (h) { delete state.answers[h.stepId]; });
    state.sequence = buildSequence(state.answers);
    renderCrumb();
    renderStep(removed[0].stepId, 'back');
  }

  function restart() {
    state.history  = [];
    state.answers  = {};
    state.finalNote = '';
    state.sequence = buildSequence({});
    renderCrumb();
    renderStep('rate', 'back');
  }

  function buildQtcMiniCalculatorHtml() {
    return '<div class="ekw-qtc-mini" aria-label="QTc calculator">' +
      '<div class="ekw-qtc-mini-head">QTc Calculator</div>' +
      '<div class="ekw-qtc-mini-grid">' +
        '<label><span>QT interval</span><input id="ekgWizQtMs" type="number" inputmode="numeric" min="1" step="1" placeholder="ms" oninput="ekgWizCalcQtc()"></label>' +
        '<label><span>Heart rate</span><input id="ekgWizHrBpm" type="number" inputmode="numeric" min="1" step="1" placeholder="bpm" oninput="ekgWizCalcQtc()"></label>' +
      '</div>' +
      '<div class="ekw-qtc-mini-result" id="ekgWizQtcResult">Enter QT and HR to calculate Bazett and Fridericia.</div>' +
      '<div class="ekw-qtc-reminders">' +
        '<strong>If prolonged:</strong> review QT-prolonging meds; check K, Mg, Ca; replete K &gt; 4 and Mg &gt; 2 when clinically appropriate.' +
      '</div>' +
    '</div>';
  }

  function calcQtcMini() {
    var qtEl = document.getElementById('ekgWizQtMs');
    var hrEl = document.getElementById('ekgWizHrBpm');
    var out = document.getElementById('ekgWizQtcResult');
    if (!qtEl || !hrEl || !out) return;

    var qt = parseFloat(qtEl.value);
    var hr = parseFloat(hrEl.value);
    if (!qt || !hr || qt <= 0 || hr <= 0) {
      out.textContent = 'Enter QT and HR to calculate Bazett and Fridericia.';
      out.className = 'ekw-qtc-mini-result';
      return;
    }

    var rr = 60 / hr;
    var bazett = Math.round(qt / Math.sqrt(rr));
    var fridericia = Math.round(qt / Math.pow(rr, 1 / 3));
    var cls = bazett >= 500 || fridericia >= 500 ? 'danger' : (bazett >= 460 || fridericia >= 460 ? 'warn' : 'ok');
    out.textContent = 'Bazett QTc ' + bazett + ' ms · Fridericia ' + fridericia + ' ms' +
      (cls === 'danger' ? ' · high TdP risk range' : cls === 'warn' ? ' · review risk factors' : ' · not prolonged by usual thresholds');
    out.className = 'ekw-qtc-mini-result ' + cls;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateSummaryNote() {
    var noteEl = document.getElementById('ekgWizFinalNote');
    state.finalNote = noteEl ? noteEl.value.trim() : '';
    window._ekgWizCopy = buildSummary().copyText;
  }

  // ============================================================
  // SLIDE RENDERING
  // ============================================================
  function renderStep(id, dir) {
    if (id === 'summary') { renderSummary(dir); return; }
    const step = STEPS[id];
    if (!step) return;

    const vp = document.getElementById('ekgWizVp');
    if (!vp) return;

    const old = vp.querySelector('.ekw-slide.is-active');
    if (old) {
      old.classList.remove('is-active');
      old.classList.add(dir === 'fwd' ? 'is-leaving-fwd' : 'is-leaving-back');
      setTimeout(function () { if (old.parentNode) old.remove(); }, 360);
    }

    const slide = document.createElement('div');
    slide.className = 'ekw-slide ' + (dir === 'fwd' ? 'is-entering-fwd' : 'is-entering-back');
    slide.dataset.sid = id;

    const keys = ['A','B','C','D','E','F','G'];
    const optsHtml = step.opts.map(function (o, i) {
      const badgeHtml = o.badge
        ? '<span class="ekw-opt-badge ekw-badge-' + o.badge.type + '">' + o.badge.txt + '</span>'
        : '';
      const cl = o.c ? ' ' + o.c : '';
      const safeLabel = o.l.replace(/'/g, "\\'");
      return '<button class="ekw-opt' + cl + '"' +
        ' onclick="ekgWizChoose(\'' + id + '\',\'' + o.v + '\',\'' + safeLabel + '\')">' +
        '<span class="ekw-opt-key">' + keys[i] + '</span>' +
        '<span class="ekw-opt-body">' +
          '<span class="ekw-opt-main">' +
            '<span class="ekw-opt-label">' + o.l + '</span>' +
            badgeHtml +
          '</span>' +
          '<span class="ekw-opt-sub">' + o.s + '</span>' +
        '</span>' +
        '</button>';
    }).join('');

    const extraHtml = id === 'qtc' ? buildQtcMiniCalculatorHtml() : '';

    slide.innerHTML =
      '<div class="ekw-q">' + step.q + '</div>' +
      '<div class="ekw-q-sub">' + step.sub + '</div>' +
      extraHtml +
      '<div class="ekw-opts">' + optsHtml + '</div>';

    vp.appendChild(slide);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        slide.classList.remove('is-entering-fwd', 'is-entering-back');
        slide.classList.add('is-active');
      });
    });

    updateHeader(step.label, id);
    renderRef(step.ref);
    const backBtn = document.getElementById('ekgWizBackBtn');
    if (backBtn) backBtn.disabled = state.history.length === 0;
  }

  function updateHeader(stepLabel, stepId) {
    const seq   = state.sequence;
    const idx   = seq.indexOf(stepId);
    const total = seq.length - 1;
    const n     = idx + 1;

    const nameEl  = document.getElementById('ekgWizStepName');
    const countEl = document.getElementById('ekgWizCount');
    const fillEl  = document.getElementById('ekgWizFill');

    if (nameEl)  nameEl.textContent  = stepLabel;
    if (countEl) countEl.textContent = 'Step ' + n + ' of ' + total;
    if (fillEl) {
      const pct = total <= 1 ? 0 : ((n - 1) / (total - 1)) * 100;
      fillEl.style.width = Math.max(4, pct) + '%';
    }
  }

  // ============================================================
  // REFERENCE PANEL
  // ============================================================
  function renderRef(sections) {
    const body = document.getElementById('ekgWizRefBody');
    if (!body) return;
    if (!sections || !sections.length) { body.innerHTML = ''; return; }
    body.innerHTML = sections.map(function (sec) {
      const imageHtml = (sec.images || []).map(function (img) {
        return '<figure class="ekw-ref-image-card">' +
          '<img src="' + escapeHtml(img.src) + '" alt="' + escapeHtml(img.alt || '') + '">' +
          (img.caption ? '<figcaption>' + escapeHtml(img.caption) + '</figcaption>' : '') +
          '</figure>';
      }).join('');
      return '<div class="ekw-ref-sec">' +
        '<div class="ekw-ref-sec-title">' + escapeHtml(sec.t) + '</div>' +
        (sec.formula ? '<div class="ekw-ref-formula">' + escapeHtml(sec.formula) + '</div>' : '') +
        (sec.items || []).map(function (it) {
          return '<div class="ekw-ref-line">' + escapeHtml(it) + '</div>';
        }).join('') +
        imageHtml +
        '</div>';
    }).join('');
  }

  function toggleRef() {
    var panel = document.getElementById('ekgWizRef');
    var icon  = document.getElementById('ekgWizRefIcon');
    if (!panel) return;
    var isOpen = panel.classList.toggle('is-open');
    if (icon) {
      icon.classList.toggle('is-active', isOpen);
      icon.textContent = isOpen ? '− Reference' : 'ⓘ Reference';
    }
  }

  // ============================================================
  // BREADCRUMB
  // ============================================================
  function renderCrumb() {
    const bar = document.getElementById('ekgWizCrumb');
    if (!bar) return;
    if (!state.history.length) {
      bar.innerHTML = '<span class="ekw-crumb-empty">—</span>';
      return;
    }
    bar.innerHTML = state.history.map(function (h, i) {
      const sep = i < state.history.length - 1 ? '<span class="ekw-crumb-sep">›</span>' : '';
      return '<span class="ekw-crumb-chip" onclick="ekgWizJumpTo(' + i + ')" title="Jump back to ' + h.stepLabel + '">' +
        '<span>' + h.stepLabel + ':</span>' +
        '<span class="ekw-cv">' + h.label + '</span>' +
        '</span>' + sep;
    }).join('');
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  function renderSummary(dir) {
    const vp = document.getElementById('ekgWizVp');
    if (!vp) return;

    const old = vp.querySelector('.ekw-slide.is-active');
    if (old) {
      old.classList.remove('is-active');
      old.classList.add(dir === 'fwd' ? 'is-leaving-fwd' : 'is-leaving-back');
      setTimeout(function () { if (old.parentNode) old.remove(); }, 360);
    }

    const built = buildSummary();
    window._ekgWizCopy = built.copyText;

    const alertsHtml = built.alerts.map(function (a) {
      return '<div class="ekw-alert ekw-alert-' + a.sev + '">' +
        '<div class="ekw-alert-title">' + a.title + '</div>' +
        '<div class="ekw-alert-body">' + a.body + '</div>' +
        '</div>';
    }).join('');

    const chipsHtml = built.chips.map(function (c) {
      return '<span class="ekw-sum-chip ekw-chip-' + c.cls + '">' + c.l + '</span>';
    }).join('');

    const narrativeHtml = built.narrative.map(function (l) {
      return '<span>' + l + '</span>';
    }).join('');

    const slide = document.createElement('div');
    slide.className = 'ekw-slide ' + (dir === 'fwd' ? 'is-entering-fwd' : 'is-entering-back');
    slide.dataset.sid = 'summary';

    slide.innerHTML =
      '<div class="ekw-summary-wrap">' +
      (built.alerts.length ? '<div class="ekw-sum-card"><div class="ekw-sum-card-hd">Clinical Alerts</div><div class="ekw-sum-card-bd">' + alertsHtml + '</div></div>' : '') +
      '<div class="ekw-sum-card"><div class="ekw-sum-card-hd">Findings</div><div class="ekw-sum-card-bd"><div class="ekw-sum-chips">' + chipsHtml + '</div></div></div>' +
      '<div class="ekw-sum-card"><div class="ekw-sum-card-hd">Narrative</div><div class="ekw-sum-card-bd"><div class="ekw-sum-narrative">' + narrativeHtml + '</div></div></div>' +
      '<div class="ekw-sum-card"><div class="ekw-sum-card-hd">Clinical Context / Note</div><div class="ekw-sum-card-bd">' +
        '<textarea class="ekw-final-note" id="ekgWizFinalNote" rows="3" placeholder="Symptoms, prior comparison details, troponin/vitals, disposition..." oninput="ekgWizUpdateNote()">' + escapeHtml(state.finalNote || '') + '</textarea>' +
      '</div></div>' +
      '<button class="ekw-copy-btn" id="ekgWizCopyBtn" onclick="ekgWizCopy()">⎘ Copy to Clipboard</button>' +
      '</div>';

    vp.appendChild(slide);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        slide.classList.remove('is-entering-fwd', 'is-entering-back');
        slide.classList.add('is-active');
      });
    });

    const nameEl  = document.getElementById('ekgWizStepName');
    const countEl = document.getElementById('ekgWizCount');
    const fillEl  = document.getElementById('ekgWizFill');
    const backBtn = document.getElementById('ekgWizBackBtn');
    if (nameEl)  nameEl.textContent  = 'Summary';
    if (countEl) countEl.textContent = 'Complete';
    if (fillEl)  fillEl.style.width  = '100%';
    if (backBtn) backBtn.disabled = false;

    renderRef([{
      t: 'After Systematic Read',
      items: [
        'Compare with any prior EKG',
        'Correlate with symptoms, vitals, troponin trend',
        'STEMI/Equiv: activate protocol, target D2B < 90 min',
        'QTc ≥ 500 ms: hold QT meds, replete K⁺ > 4 and Mg²⁺ > 2',
        'Wellens TWI: avoid stress test — urgent cath',
        'Mobitz II or 3° AV block: pacing consultation',
      ]
    }]);
  }

  function buildSummary() {
    var a = state.answers;
    var alerts = [], chips = [], narrative = [];

    var rateLabels = { brady: 'Bradycardia (< 60 bpm)', normal: 'Normal rate (60–100 bpm)', tachy: 'Tachycardia (> 100 bpm)' };
    if (a.rate) {
      narrative.push('Rate: ' + (rateLabels[a.rate] || a.rate) + '.');
      chips.push({ l: rateLabels[a.rate] || a.rate, cls: a.rate === 'normal' ? 'ok' : 'caution' });
    }

    var rhythmLabels = { sinus: 'Regular sinus rhythm', afib: 'Atrial fibrillation (irregularly irregular, no P waves)',
      reg_irr: 'Regularly irregular rhythm (atrial flutter or grouped beats)',
      no_p: 'No clear P waves (junctional or ventricular rhythm)' };
    if (a.rhythm) {
      narrative.push('Rhythm: ' + (rhythmLabels[a.rhythm] || a.rhythm) + '.');
      chips.push({ l: (rhythmLabels[a.rhythm] || a.rhythm).split(' (')[0], cls: a.rhythm === 'sinus' ? 'ok' : 'caution' });
      if (a.rhythm === 'afib') {
        alerts.push({ sev: 'caution', title: 'Atrial Fibrillation',
          body: 'Assess rate control vs rhythm control. Calculate CHA₂DS₂-VASc for anticoagulation decision.' });
      }
    }

    var prLabels = { normal: 'Normal PR (120–200 ms)', long: '1st-degree AV block (PR > 200 ms)',
      short_d: 'Short PR with delta wave (WPW pre-excitation)', variable: '2nd-degree AV block (variable or dropped beats)' };
    if (a.pr) {
      narrative.push('PR interval: ' + (prLabels[a.pr] || a.pr) + '.');
      if (a.pr !== 'normal') {
        chips.push({ l: (prLabels[a.pr] || a.pr).split(' (')[0], cls: 'caution' });
        if (a.pr === 'short_d') {
          alerts.push({ sev: 'caution', title: 'WPW Pre-excitation',
            body: 'Avoid AV node blockers (adenosine, digoxin, verapamil) if AFib develops — risk of rapid accessory conduction → VF. Electrophysiology referral.' });
        }
        if (a.pr === 'variable') {
          alerts.push({ sev: 'caution', title: 'AV Block',
            body: 'Classify: Mobitz I (Wenckebach — usually benign) vs Mobitz II (infranodal — higher risk, may need pacing). 3° AV block requires urgent cardiology.' });
        }
      } else {
        chips.push({ l: 'Normal PR', cls: 'ok' });
      }
    }

    var qrsLabels = { narrow: 'Narrow QRS (< 110 ms)', borderline: 'Borderline QRS (110–119 ms)', wide: 'Wide QRS (≥ 120 ms)' };
    if (a.qrs_width) {
      narrative.push('QRS: ' + (qrsLabels[a.qrs_width] || a.qrs_width) + '.');
      chips.push({ l: qrsLabels[a.qrs_width] || a.qrs_width, cls: a.qrs_width === 'narrow' ? 'ok' : 'caution' });
    }

    var qrsTypeLabels = { rbbb: 'RBBB morphology', lbbb: 'LBBB morphology', paced: 'Paced rhythm',
      vt: 'VT or SVT with aberrancy', meta: 'Metabolic/drug-effect wide QRS' };
    if (a.qrs_type) {
      narrative.push('Wide QRS pattern: ' + (qrsTypeLabels[a.qrs_type] || a.qrs_type) + '.');
      chips.push({ l: qrsTypeLabels[a.qrs_type] || a.qrs_type, cls: a.qrs_type === 'vt' ? 'alert' : 'note' });
      if (a.qrs_type === 'vt') {
        alerts.push({ sev: 'danger', title: 'Possible Ventricular Tachycardia',
          body: 'Treat as VT until proven otherwise. If unstable: synchronized cardioversion. If stable: antiarrhythmic + cardiology.' });
      }
      if (a.qrs_type === 'lbbb') {
        alerts.push({ sev: 'info', title: 'LBBB — Important Caveats',
          body: 'LBBB or paced rhythm can obscure ischemia. Apply Sgarbossa/modified Sgarbossa criteria and correlate with symptoms, troponin trend, and prior EKG. LBBB invalidates standard LVH voltage criteria.' });
      }
    }

    var narrowTachLabels = {
      sinus: 'Sinus tachycardia pattern',
      avnrt_avrt: 'Regular re-entrant SVT pattern (AVNRT/AVRT)',
      flutter: 'Atrial flutter pattern',
      af_mat: 'Irregular narrow tachycardia (AF/MAT)',
      uncertain: 'Uncertain narrow-complex tachycardia',
    };
    if (a.narrow_tach) {
      narrative.push('Narrow tachycardia branch: ' + (narrowTachLabels[a.narrow_tach] || a.narrow_tach) + '.');
      chips.push({ l: narrowTachLabels[a.narrow_tach] || a.narrow_tach, cls: a.narrow_tach === 'sinus' ? 'ok' : 'caution' });
      if (a.narrow_tach === 'avnrt_avrt') {
        alerts.push({ sev: 'caution', title: 'Regular Re-entrant SVT',
          body: 'Look for abrupt onset/offset and hidden or retrograde P waves. Vagal maneuvers or adenosine may terminate AVNRT/orthodromic AVRT if no pre-excitation concern.' });
      }
      if (a.narrow_tach === 'flutter') {
        alerts.push({ sev: 'caution', title: 'Atrial Flutter Pattern',
          body: 'Search inferior leads and V1 for sawtooth flutter waves, especially when the ventricular rate is near 150 bpm.' });
      }
    }

    var wctLabels = {
      vt_likely: 'Wide-complex tachycardia: VT likely',
      svt_aberrancy: 'Wide-complex tachycardia: SVT with aberrancy possible',
      preexcited_af: 'Irregular wide tachycardia: pre-excited AF concern',
      torsades: 'Polymorphic VT / torsades concern',
      paced_device: 'Paced or device-mediated wide tachycardia',
    };
    if (a.wct) {
      narrative.push('Wide tachycardia branch: ' + (wctLabels[a.wct] || a.wct) + '.');
      chips.push({ l: wctLabels[a.wct] || a.wct, cls: (a.wct === 'vt_likely' || a.wct === 'preexcited_af' || a.wct === 'torsades') ? 'alert' : 'caution' });
      if (a.wct === 'vt_likely') {
        alerts.push({ sev: 'danger', title: 'Wide-Complex Tachycardia — Treat as VT',
          body: 'VT is the default diagnosis for undifferentiated regular WCT. AV dissociation, capture/fusion beats, concordance, extreme axis, or prior MI/CMP strengthen VT concern.' });
      }
      if (a.wct === 'preexcited_af') {
        alerts.push({ sev: 'danger', title: 'Pre-excited AF Concern',
          body: 'Irregular very rapid wide-complex rhythm with variable QRS can deteriorate to VF. Avoid AV-nodal blockers and escalate urgently.' });
      }
      if (a.wct === 'torsades') {
        alerts.push({ sev: 'danger', title: 'Polymorphic VT / Torsades Concern',
          body: 'Review QTc, stop QT-prolonging meds, replete electrolytes, and give magnesium when clinically appropriate.' });
      }
    }

    var bradyLabels = {
      sinus_brady: 'Sinus bradycardia',
      junctional: 'Junctional escape rhythm',
      first_deg: '1st-degree AV block',
      mobitz_i: 'Mobitz I / Wenckebach',
      mobitz_ii: 'Mobitz II or high-grade AV block',
      complete: 'Complete heart block',
      reversible: 'Possible reversible or medication-related bradycardia',
    };
    if (a.brady_av) {
      narrative.push('Brady/AV block branch: ' + (bradyLabels[a.brady_av] || a.brady_av) + '.');
      chips.push({ l: bradyLabels[a.brady_av] || a.brady_av, cls: (a.brady_av === 'mobitz_ii' || a.brady_av === 'complete') ? 'alert' : (a.brady_av === 'sinus_brady' ? 'ok' : 'caution') });
      if (a.brady_av === 'mobitz_i') {
        alerts.push({ sev: 'caution', title: 'Mobitz I / Wenckebach',
          body: 'Progressive PR lengthening before a dropped beat usually localizes to the AV node. Correlate with symptoms, medications, inferior ischemia, and vagal tone.' });
      }
      if (a.brady_av === 'mobitz_ii') {
        alerts.push({ sev: 'danger', title: 'Mobitz II / High-grade AV Block',
          body: 'Fixed PR with dropped QRS or consecutive dropped P waves suggests infranodal disease. Place pacing pads and escalate urgently, especially with wide QRS or symptoms.' });
      }
      if (a.brady_av === 'complete') {
        alerts.push({ sev: 'danger', title: 'Complete Heart Block',
          body: 'P waves and QRS complexes march independently. Assess stability, prepare pacing support, review reversible causes, and involve cardiology urgently.' });
      }
      if (a.brady_av === 'reversible') {
        alerts.push({ sev: 'caution', title: 'Reversible Bradycardia Check',
          body: 'Review beta-blockers, non-DHP calcium channel blockers, digoxin, amiodarone, hyperkalemia, inferior MI, hypothermia, hypothyroidism, and sleep apnea.' });
      }
    }

    var axisLabels = { normal: 'Normal axis (0° to +90°)', lad: 'Left axis deviation', rad: 'Right axis deviation', extreme: 'Extreme/NW axis' };
    if (a.axis) {
      narrative.push('Axis: ' + (axisLabels[a.axis] || a.axis) + '.');
      chips.push({ l: axisLabels[a.axis] || a.axis, cls: a.axis === 'normal' ? 'ok' : 'caution' });
    }

    var qtcLabels = { normal: 'Normal QTc', borderline: 'Borderline QTc (monitor)', prolonged: 'Prolonged QTc ≥ 500 ms', short: 'Short QTc (< 360 ms)' };
    if (a.qtc) {
      narrative.push('QTc: ' + (qtcLabels[a.qtc] || a.qtc) + '.');
      if (a.qtc === 'prolonged') {
        chips.push({ l: 'QTc ≥ 500 ms — TdP risk', cls: 'alert' });
        alerts.push({ sev: 'danger', title: 'Prolonged QTc — Torsades Risk',
          body: 'Hold QT-prolonging meds. Replete K⁺ > 4 mEq/L and Mg²⁺ > 2 mg/dL. Continuous cardiac monitoring. Electrophysiology if symptomatic.' });
      } else if (a.qtc === 'borderline') {
        chips.push({ l: 'Borderline QTc — monitor', cls: 'caution' });
      } else if (a.qtc === 'short') {
        chips.push({ l: 'Short QTc', cls: 'caution' });
      } else {
        chips.push({ l: 'Normal QTc', cls: 'ok' });
      }
    }

    var chamberLabels = { none: 'No chamber abnormalities', lvh: 'LVH', rvh: 'RVH', atrial: 'Atrial enlargement', low_v: 'Low voltage' };
    if (a.chamber) {
      if (a.chamber !== 'none') {
        narrative.push('Chamber/voltage: ' + (chamberLabels[a.chamber] || a.chamber) + '.');
        chips.push({ l: chamberLabels[a.chamber] || a.chamber, cls: a.chamber === 'low_v' ? 'caution' : 'note' });
        if (a.chamber === 'low_v') {
          alerts.push({ sev: 'caution', title: 'Low Voltage',
            body: 'Consider pericardial effusion/tamponade (urgent bedside echo), hypothyroidism, amyloidosis, COPD, or obesity.' });
        }
      } else {
        chips.push({ l: 'No chamber abnormality', cls: 'ok' });
      }
    }

    var qLabels = { normal: 'Normal Q waves / R progression', prwp: 'Poor R-wave progression',
      path_q: 'Pathologic Q waves (possible prior MI)', dom_r_v1: 'Dominant R in V1-V2' };
    if (a.q_waves) {
      if (a.q_waves !== 'normal') {
        narrative.push('Q waves/R progression: ' + (qLabels[a.q_waves] || a.q_waves) + '.');
        chips.push({ l: qLabels[a.q_waves] || a.q_waves, cls: 'caution' });
        if (a.q_waves === 'path_q') {
          alerts.push({ sev: 'caution', title: 'Pathologic Q Waves',
            body: 'Suggests prior MI in corresponding territory. Correlate with clinical history, troponin, and prior EKG.' });
        }
      } else {
        chips.push({ l: 'Normal Q / R progression', cls: 'ok' });
      }
    }

    var stLabels = { normal: 'No ST changes', stemi: 'ST elevation — contiguous leads (STEMI pattern)',
      std: 'ST depression', peri: 'Diffuse STE with PR depression (pericarditis)',
      brugada: 'Brugada pattern (coved STE V1-V2)', early_r: 'Early repolarization pattern', strain: 'Strain pattern (secondary)' };
    if (a.st) {
      if (a.st !== 'normal') narrative.push('ST segment: ' + (stLabels[a.st] || a.st) + '.');
      if (a.st === 'stemi') {
        chips.push({ l: 'STEMI / Equivalent', cls: 'alert' });
        alerts.push({ sev: 'danger', title: 'STEMI / STEMI-Equivalent',
          body: 'Activate STEMI protocol immediately. Aspirin 325 mg + P2Y12. Target door-to-balloon < 90 min. Do not delay for labs.' });
      } else if (a.st === 'brugada') {
        chips.push({ l: 'Brugada Pattern', cls: 'alert' });
        alerts.push({ sev: 'danger', title: 'Brugada Pattern (Type 1)',
          body: 'Coved STE ≥ 2 mm in V1-V2 = sudden cardiac death risk. Urgent electrophysiology referral. Avoid Na-channel blockers, fever, large meals.' });
      } else if (a.st === 'peri') {
        chips.push({ l: 'Pericarditis Pattern', cls: 'caution' });
        alerts.push({ sev: 'caution', title: 'Pericarditis Pattern',
          body: 'Confirm with echo to exclude effusion/tamponade. NSAIDs + colchicine × 3 months. Activity restriction.' });
      } else if (a.st === 'normal') {
        chips.push({ l: 'No ST changes', cls: 'ok' });
      } else {
        chips.push({ l: stLabels[a.st] || a.st, cls: 'caution' });
      }
    }

    var tLabels = { normal: 'Normal T waves', inv: 'T-wave inversion',
      deep_sym: 'Deep symmetric TWI (Wellens pattern)', peaked: 'Peaked/hyperacute T waves', flat_u: 'Flat T + prominent U waves' };
    if (a.t_waves) {
      if (a.t_waves !== 'normal') narrative.push('T waves: ' + (tLabels[a.t_waves] || a.t_waves) + '.');
      if (a.t_waves === 'deep_sym') {
        chips.push({ l: 'Wellens Pattern', cls: 'alert' });
        alerts.push({ sev: 'danger', title: 'Possible Wellens Syndrome',
          body: 'Deep symmetric TWI V2-V4 after chest pain = critical proximal LAD stenosis. Avoid stress testing. Urgent coronary angiography.' });
      } else if (a.t_waves === 'peaked') {
        chips.push({ l: 'Peaked T Waves — check K⁺', cls: 'caution' });
        alerts.push({ sev: 'caution', title: 'Peaked T Waves',
          body: 'Early hyperkalemia (check K⁺ urgently) or hyperacute MI / de Winter pattern. Correlate clinically.' });
      } else if (a.t_waves === 'flat_u') {
        chips.push({ l: 'Hypokalemia Pattern', cls: 'caution' });
        alerts.push({ sev: 'caution', title: 'Flat T + Prominent U Waves',
          body: 'Check K⁺ and Mg²⁺. Dangerous if concurrent QTc prolongation (TdP risk).' });
      } else if (a.t_waves === 'normal') {
        chips.push({ l: 'Normal T waves', cls: 'ok' });
      } else {
        chips.push({ l: tLabels[a.t_waves] || a.t_waves, cls: 'caution' });
      }
    }

    var comparisonLabels = {
      no_prior: 'No prior EKG available for comparison',
      unchanged: 'No meaningful change compared with prior EKG',
      new: 'New or dynamic change compared with prior EKG',
    };
    if (a.comparison) {
      narrative.push('Comparison: ' + (comparisonLabels[a.comparison] || a.comparison) + '.');
      chips.push({
        l: a.comparison === 'new' ? 'New/dynamic change' : (comparisonLabels[a.comparison] || a.comparison),
        cls: a.comparison === 'new' ? 'caution' : (a.comparison === 'unchanged' ? 'ok' : 'note'),
      });
      if (a.comparison === 'new') {
        alerts.push({ sev: 'caution', title: 'New / Dynamic EKG Change',
          body: 'Correlate with symptoms, vitals, electrolytes, troponin trend, and medication changes; escalate based on the specific finding.' });
      }
    }

    if (!chips.length) chips.push({ l: 'No findings recorded', cls: 'note' });

    var copyText = '=== EKG Systematic Interpretation ===\n' +
      narrative.join('\n') +
      (state.finalNote ? '\n\nClinical context / note:\n' + state.finalNote : '') +
      (alerts.length ? '\n\nALERTS:\n' + alerts.map(function (al) { return '• ' + al.title + ': ' + al.body; }).join('\n') : '');

    return { alerts: alerts, chips: chips, narrative: narrative, copyText: copyText };
  }

  function copySummary() {
    var btn = document.getElementById('ekgWizCopyBtn');
    var text = window._ekgWizCopy || '';
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        if (btn) { btn.textContent = '✓ Copied!'; btn.classList.add('ekw-copied'); }
        setTimeout(function () {
          if (btn) { btn.textContent = '⍘ Copy to Clipboard'; btn.classList.remove('ekw-copied'); }
        }, 2200);
      });
    }
  }

  // ============================================================
  // KEYBOARD
  // ============================================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('ekg-wiz-open')) close();
  });

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.openEkgWizard  = open;
  window.closeEkgWizard = close;
  window.ekgWizChoose   = choose;
  window.ekgWizBack     = back;
  window.ekgWizJumpTo   = jumpTo;
  window.ekgWizRestart  = restart;
  window.ekgWizCopy     = copySummary;
  window.ekgWizToggleRef = toggleRef;
  window.ekgWizCalcQtc  = calcQtcMini;
  window.ekgWizUpdateNote = updateSummaryNote;

})();
