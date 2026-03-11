// ---------------------------------------------------------------------------
// Clinical Calculator functions
// ---------------------------------------------------------------------------
function calcEGFR() {
  const cr = parseFloat(document.getElementById('egfr-cr').value);
  const age = parseInt(document.getElementById('egfr-age').value);
  const sex = document.getElementById('egfr-sex').value;
  const el = document.getElementById('egfr-result');
  if (!cr || !age || cr <= 0) { el.textContent = '—'; el.className = 'calc-result'; return; }
  // CKD-EPI 2021 (race-free)
  let k = sex === 'F' ? 0.7 : 0.9;
  let a = sex === 'F' ? -0.241 : -0.302;
  let mult = sex === 'F' ? 1.012 : 1.0;
  let gfr = 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.200) * Math.pow(0.9938, age) * mult;
  gfr = Math.round(gfr * 10) / 10;
  let cls = gfr >= 60 ? 'success' : gfr >= 30 ? 'warn' : 'danger';
  el.textContent = `eGFR: ${gfr} mL/min/1.73m²`;
  el.className = `calc-result ${cls}`;
}

function calcCrCl() {
  const cr = parseFloat(document.getElementById('crcl-cr').value);
  const age = parseInt(document.getElementById('crcl-age').value);
  const wt = parseFloat(document.getElementById('crcl-wt').value);
  const sex = document.getElementById('crcl-sex').value;
  const el = document.getElementById('crcl-result');
  if (!cr || !age || !wt || cr <= 0) { el.textContent = '—'; el.className = 'calc-result'; return; }
  let crcl = ((140 - age) * wt) / (72 * cr);
  if (sex === 'F') crcl *= 0.85;
  crcl = Math.round(crcl * 10) / 10;
  let cls = crcl >= 60 ? 'success' : crcl >= 30 ? 'warn' : 'danger';
  el.textContent = `CrCl: ${crcl} mL/min`;
  el.className = `calc-result ${cls}`;
}

function calcCorrCa() {
  const ca = parseFloat(document.getElementById('ca-total').value);
  const alb = parseFloat(document.getElementById('ca-alb').value);
  const el = document.getElementById('ca-result');
  if (!ca || !alb) { el.textContent = '—'; el.className = 'calc-result'; return; }
  let corrected = ca + 0.8 * (4.0 - alb);
  corrected = Math.round(corrected * 10) / 10;
  let cls = corrected >= 8.5 && corrected <= 10.5 ? 'success' : corrected > 10.5 ? 'danger' : 'warn';
  el.textContent = `Corrected Ca: ${corrected} mg/dL (normal 8.5-10.5)`;
  el.className = `calc-result ${cls}`;
}

function calcAG() {
  const na = parseFloat(document.getElementById('ag-na').value);
  const cl = parseFloat(document.getElementById('ag-cl').value);
  const hco3 = parseFloat(document.getElementById('ag-hco3').value);
  const alb = parseFloat(document.getElementById('ag-alb').value);
  const el = document.getElementById('ag-result');
  if (!na || !cl || !hco3) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const ag = na - cl - hco3;
  const corrAG = ag + 2.5 * (4.0 - (alb || 4.0));
  const delta = corrAG - 12;
  const deltaHCO3 = 24 - hco3;
  const ratio = deltaHCO3 > 0 ? (delta / deltaHCO3).toFixed(2) : 'N/A';
  let cls = corrAG > 12 ? 'warn' : 'success';
  el.textContent = `AG: ${Math.round(ag)} | Corrected AG: ${Math.round(corrAG * 10) / 10} | Delta/Delta: ${ratio}`;
  el.className = `calc-result ${cls}`;
}

function calcAaGrad() {
  const fio2 = parseFloat(document.getElementById('aa-fio2').value) / 100;
  const pao2 = parseFloat(document.getElementById('aa-pao2').value);
  const paco2 = parseFloat(document.getElementById('aa-paco2').value);
  const age = parseInt(document.getElementById('aa-age').value);
  const el = document.getElementById('aa-result');
  if (!fio2 || !pao2 || !paco2) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const pAtm = 760; const pH2O = 47;
  const pAO2 = fio2 * (pAtm - pH2O) - (paco2 / 0.8);
  const gradient = pAO2 - pao2;
  const expected = age ? (age / 4 + 4) : null;
  let text = `A-a Gradient: ${Math.round(gradient * 10) / 10} mmHg`;
  if (expected) text += ` (expected for age: < ${Math.round(expected)})`;
  let cls = expected && gradient > expected ? 'warn' : 'success';
  el.textContent = text;
  el.className = `calc-result ${cls}`;
}

function calcMELD() {
  let bili = parseFloat(document.getElementById('meld-bili').value);
  let cr = parseFloat(document.getElementById('meld-cr').value);
  let inr = parseFloat(document.getElementById('meld-inr').value);
  let na = parseFloat(document.getElementById('meld-na').value);
  const dialysis = document.getElementById('meld-dialysis').value === '1';
  const el = document.getElementById('meld-result');
  if (!bili || !cr || !inr) { el.textContent = '—'; el.className = 'calc-result'; return; }
  // Clamp values per MELD formula
  if (bili < 1) bili = 1;
  if (cr < 1) cr = 1;
  if (cr > 4 || dialysis) cr = 4;
  if (inr < 1) inr = 1;
  let meld = 10 * (0.957 * Math.log(cr) + 0.378 * Math.log(bili) + 1.120 * Math.log(inr) + 0.643);
  meld = Math.round(meld * 10) / 10;
  if (meld > 40) meld = 40;
  // MELD-Na adjustment
  if (na && meld >= 11) {
    if (na < 125) na = 125;
    if (na > 137) na = 137;
    meld = meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na);
    meld = Math.round(meld * 10) / 10;
  }
  let cls = meld < 15 ? 'success' : meld < 25 ? 'warn' : 'danger';
  el.textContent = `MELD-Na: ${meld}`;
  el.className = `calc-result ${cls}`;
}

function calcCHADS() {
  const vals = ['chads-chf', 'chads-htn', 'chads-age', 'chads-dm', 'chads-stroke', 'chads-vasc', 'chads-sex'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('chads-result');
  const riskMap = {0:'0.2%',1:'0.6%',2:'2.2%',3:'3.2%',4:'4.8%',5:'7.2%',6:'9.7%',7:'11.2%',8:'10.8%',9:'12.2%'};
  let cls = score <= 1 ? 'success' : score <= 3 ? 'warn' : 'danger';
  el.textContent = `Score: ${score} — Annual stroke risk: ${riskMap[score] || '>12%'}${score >= 2 ? ' (anticoagulation recommended)' : score === 1 ? ' (consider anticoagulation)' : ''}`;
  el.className = `calc-result ${cls}`;
}

function calcCURB() {
  const vals = ['curb-conf', 'curb-bun', 'curb-rr', 'curb-bp', 'curb-age'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('curb-result');
  const recs = ['Low risk — consider outpatient', 'Low risk — consider outpatient', 'Short inpatient / supervised outpatient', 'Hospitalize — severe pneumonia', 'ICU admission — severe pneumonia', 'ICU admission — severe pneumonia'];
  let cls = score <= 1 ? 'success' : score <= 2 ? 'warn' : 'danger';
  el.textContent = `Score: ${score}/5 — ${recs[score]}`;
  el.className = `calc-result ${cls}`;
}

function calcWells() {
  const vals = ['wells-cancer', 'wells-paral', 'wells-bed', 'wells-tend', 'wells-swell', 'wells-calf', 'wells-edema', 'wells-coll', 'wells-alt'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('wells-result');
  let risk, cls;
  if (score <= 0) { risk = 'Low probability (~5%)'; cls = 'success'; }
  else if (score <= 2) { risk = 'Moderate probability (~17%)'; cls = 'warn'; }
  else { risk = 'High probability (~53%) — consider imaging'; cls = 'danger'; }
  el.textContent = `Score: ${score} — ${risk}`;
  el.className = `calc-result ${cls}`;
}

// ---------------------------------------------------------------------------
// New Calculator functions
// ---------------------------------------------------------------------------
function calcBMI() {
  const wt = parseFloat(document.getElementById('bmi-wt').value);
  const ht = parseFloat(document.getElementById('bmi-ht').value);
  const el = document.getElementById('bmi-result');
  if (!wt || !ht || ht <= 0) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const bmi = wt / Math.pow(ht / 100, 2);
  const r = Math.round(bmi * 10) / 10;
  let cat, cls;
  if (r < 18.5) { cat = 'Underweight'; cls = 'warn'; }
  else if (r < 25) { cat = 'Normal'; cls = 'success'; }
  else if (r < 30) { cat = 'Overweight'; cls = 'warn'; }
  else { cat = 'Obese'; cls = 'danger'; }
  el.textContent = `BMI: ${r} kg/m² — ${cat}`;
  el.className = `calc-result ${cls}`;
}

function calcMAP() {
  const sbp = parseFloat(document.getElementById('map-sbp').value);
  const dbp = parseFloat(document.getElementById('map-dbp').value);
  const el = document.getElementById('map-result');
  if (!sbp || !dbp) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const map = dbp + (sbp - dbp) / 3;
  const r = Math.round(map);
  let cls = r >= 65 && r <= 110 ? 'success' : r < 65 ? 'danger' : 'warn';
  el.textContent = `MAP: ${r} mmHg${r < 65 ? ' — hypotension' : ''}`;
  el.className = `calc-result ${cls}`;
}

function calcGCS() {
  const eye = parseInt(document.getElementById('gcs-eye').value);
  const verbal = parseInt(document.getElementById('gcs-verbal').value);
  const motor = parseInt(document.getElementById('gcs-motor').value);
  const el = document.getElementById('gcs-result');
  const total = eye + verbal + motor;
  let severity, cls;
  if (total <= 8) { severity = 'Severe (intubation likely)'; cls = 'danger'; }
  else if (total <= 12) { severity = 'Moderate'; cls = 'warn'; }
  else { severity = 'Mild'; cls = 'success'; }
  el.textContent = `GCS: ${total}/15 (E${eye} V${verbal} M${motor}) — ${severity}`;
  el.className = `calc-result ${cls}`;
}

function calcFENa() {
  const sna = parseFloat(document.getElementById('fena-sna').value);
  const scr = parseFloat(document.getElementById('fena-scr').value);
  const una = parseFloat(document.getElementById('fena-una').value);
  const ucr = parseFloat(document.getElementById('fena-ucr').value);
  const el = document.getElementById('fena-result');
  if (!sna || !scr || !una || !ucr || scr <= 0 || ucr <= 0 || sna <= 0) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const fena = (una * scr) / (sna * ucr) * 100;
  const r = Math.round(fena * 100) / 100;
  let interp, cls;
  if (r < 1) { interp = 'Prerenal'; cls = 'success'; }
  else if (r <= 2) { interp = 'Indeterminate'; cls = 'warn'; }
  else { interp = 'Intrinsic renal'; cls = 'danger'; }
  el.textContent = `FENa: ${r}% — ${interp}`;
  el.className = `calc-result ${cls}`;
}

function calcOsm() {
  const na = parseFloat(document.getElementById('osm-na').value);
  const glu = parseFloat(document.getElementById('osm-glu').value);
  const bun = parseFloat(document.getElementById('osm-bun').value);
  const meas = parseFloat(document.getElementById('osm-meas').value);
  const el = document.getElementById('osm-result');
  if (!na) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const calcOsm = 2 * na + (glu || 0) / 18 + (bun || 0) / 2.8;
  const r = Math.round(calcOsm);
  let text = `Calculated Osm: ${r} mOsm/kg`;
  let cls = (r >= 275 && r <= 295) ? 'success' : 'warn';
  if (meas) {
    const gap = Math.round(meas - r);
    text += ` | Osmolar Gap: ${gap}`;
    if (gap > 10) { text += ' (elevated — consider toxic alcohols)'; cls = 'danger'; }
  }
  el.textContent = text;
  el.className = `calc-result ${cls}`;
}

function calcQTc() {
  const qt = parseFloat(document.getElementById('qtc-qt').value);
  const hr = parseFloat(document.getElementById('qtc-hr').value);
  const el = document.getElementById('qtc-result');
  if (!qt || !hr || hr <= 0) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const rr = 60 / hr;
  const bazett = Math.round(qt / Math.sqrt(rr));
  const fridericia = Math.round(qt / Math.pow(rr, 1 / 3));
  let cls = bazett <= 470 ? 'success' : bazett <= 500 ? 'warn' : 'danger';
  el.textContent = `Bazett QTc: ${bazett} ms | Fridericia: ${fridericia} ms${bazett > 500 ? ' — prolonged (risk of TdP)' : bazett > 470 ? ' — borderline' : ''}`;
  el.className = `calc-result ${cls}`;
}

function calcChildPugh() {
  const vals = ['cp-bili', 'cp-alb', 'cp-inr', 'cp-ascites', 'cp-enceph'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('childpugh-result');
  let grade, survival, cls;
  if (score <= 6) { grade = 'A'; survival = '100% 1yr'; cls = 'success'; }
  else if (score <= 9) { grade = 'B'; survival = '80% 1yr'; cls = 'warn'; }
  else { grade = 'C'; survival = '45% 1yr'; cls = 'danger'; }
  el.textContent = `Child-Pugh: ${score}/15 — Class ${grade} (${survival})`;
  el.className = `calc-result ${cls}`;
}

function calcHASBLED() {
  const vals = ['hasbled-htn','hasbled-renal','hasbled-liver','hasbled-stroke','hasbled-bleed','hasbled-inr','hasbled-age','hasbled-drugs','hasbled-etoh'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('hasbled-result');
  let cls = score <= 1 ? 'success' : score <= 2 ? 'warn' : 'danger';
  el.textContent = `HAS-BLED: ${score}/9${score >= 3 ? ' — High bleeding risk (consider alternatives)' : ' — Acceptable bleeding risk'}`;
  el.className = `calc-result ${cls}`;
}

function calcNEWS2() {
  const el = document.getElementById('news2-result');
  let total = 0;
  // RR scoring
  const rr = parseInt(document.getElementById('news-rr').value);
  if (rr) {
    if (rr <= 8) total += 3;
    else if (rr <= 11) total += 1;
    else if (rr <= 20) total += 0;
    else if (rr <= 24) total += 2;
    else total += 3;
  }
  // SpO2 scoring (Scale 1 — no COPD)
  const spo2 = parseInt(document.getElementById('news-spo2').value);
  if (spo2) {
    if (spo2 <= 91) total += 3;
    else if (spo2 <= 93) total += 2;
    else if (spo2 <= 95) total += 1;
    else total += 0;
  }
  // Supplemental O2
  total += parseInt(document.getElementById('news-o2').value);
  // Temperature
  const temp = parseFloat(document.getElementById('news-temp').value);
  if (temp) {
    if (temp <= 35.0) total += 3;
    else if (temp <= 36.0) total += 1;
    else if (temp <= 38.0) total += 0;
    else if (temp <= 39.0) total += 1;
    else total += 2;
  }
  // SBP
  const sbp = parseInt(document.getElementById('news-sbp').value);
  if (sbp) {
    if (sbp <= 90) total += 3;
    else if (sbp <= 100) total += 2;
    else if (sbp <= 110) total += 1;
    else if (sbp <= 219) total += 0;
    else total += 3;
  }
  // HR
  const hr = parseInt(document.getElementById('news-hr').value);
  if (hr) {
    if (hr <= 40) total += 3;
    else if (hr <= 50) total += 1;
    else if (hr <= 90) total += 0;
    else if (hr <= 110) total += 1;
    else if (hr <= 130) total += 2;
    else total += 3;
  }
  // AVPU
  total += parseInt(document.getElementById('news-avpu').value);

  const hasInputs = rr || spo2 || temp || sbp || hr;
  if (!hasInputs) { el.textContent = '—'; el.className = 'calc-result'; return; }

  let risk, cls;
  if (total <= 4) { risk = 'Low'; cls = 'success'; }
  else if (total <= 6) { risk = 'Medium — consider urgent review'; cls = 'warn'; }
  else { risk = 'High — urgent/critical care review'; cls = 'danger'; }
  el.textContent = `NEWS2: ${total} — ${risk}`;
  el.className = `calc-result ${cls}`;
}

function calcSOFA() {
  const vals = ['sofa-resp','sofa-coag','sofa-liver','sofa-cardio','sofa-neuro','sofa-renal'];
  let score = vals.reduce((sum, id) => sum + parseInt(document.getElementById(id).value), 0);
  const el = document.getElementById('sofa-result');
  // Approximate mortality from SOFA score
  let mort, cls;
  if (score <= 1) { mort = '<5%'; cls = 'success'; }
  else if (score <= 6) { mort = '<10%'; cls = 'success'; }
  else if (score <= 9) { mort = '15-20%'; cls = 'warn'; }
  else if (score <= 12) { mort = '40-50%'; cls = 'danger'; }
  else { mort = '>80%'; cls = 'danger'; }
  el.textContent = `SOFA: ${score}/24 — Estimated mortality: ${mort}`;
  el.className = `calc-result ${cls}`;
}

function calcQSOFA() {
  const rr = parseInt(document.getElementById('qsofa-rr').value);
  const ment = parseInt(document.getElementById('qsofa-ment').value);
  const sbp = parseInt(document.getElementById('qsofa-sbp').value);
  const score = rr + ment + sbp;
  const el = document.getElementById('qsofa-result');
  let risk, cls;
  if (score >= 2) { risk = 'High risk — consider ICU, sepsis workup'; cls = 'danger'; }
  else if (score === 1) { risk = 'Low-intermediate risk — monitor closely'; cls = 'warn'; }
  else { risk = 'Low risk'; cls = 'success'; }
  el.textContent = `qSOFA: ${score}/3 — ${risk}`;
  el.className = `calc-result ${cls}`;
}

function calcWellsPE() {
  const ids = ['wellspe-dvt','wellspe-alt','wellspe-hr','wellspe-immob','wellspe-prior','wellspe-hemo','wellspe-malig'];
  const score = ids.reduce((sum, id) => sum + parseFloat(document.getElementById(id).value), 0);
  const el = document.getElementById('wellspe-result');
  let risk, cls;
  if (score > 4) { risk = 'PE likely — consider CT-PA'; cls = 'danger'; }
  else { risk = 'PE unlikely — consider D-dimer'; cls = 'warn'; }
  el.textContent = `Wells PE: ${score} — ${risk}`;
  el.className = `calc-result ${cls}`;
}

// ---------------------------------------------------------------------------
// Calculator: Category switching
// ---------------------------------------------------------------------------
function switchCalcCat(cat) {
  // Update tab buttons
  document.querySelectorAll('.calc-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + cat + "'"));
  });
  // Show/hide sections
  document.querySelectorAll('.calc-cat-section').forEach(sec => {
    if (cat === 'all') {
      sec.classList.add('active');
    } else {
      sec.classList.toggle('active', sec.dataset.cat === cat);
    }
  });
}

// ---------------------------------------------------------------------------
// Calculator: Clear / Reset
// ---------------------------------------------------------------------------
function clearCalc(prefix) {
  const card = document.querySelector(`.calc-card[data-calc="${prefix}"]`);
  if (!card) return;
  card.querySelectorAll('input[type="number"]').forEach(inp => {
    // Preserve defaults (like FiO2=21, Albumin=4.0)
    const def = inp.getAttribute('value');
    inp.value = def || '';
  });
  card.querySelectorAll('select').forEach(sel => { sel.selectedIndex = 0; });
  const result = card.querySelector('.calc-result');
  if (result) { result.textContent = '\u2014'; result.className = 'calc-result'; }
}

// ---------------------------------------------------------------------------
// Calculator: Copy Results
// ---------------------------------------------------------------------------

// Build structured text summary for each calculator
function buildCalcSummary(prefix) {
  const get = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const selText = id => { const e = document.getElementById(id); return e ? e.options[e.selectedIndex].text : ''; };
  const yn = (id, label) => { const v = get(id); return `${label}(${v === '0' ? '-' : '+'})`; };

  switch (prefix) {
    case 'egfr': {
      const cr = get('egfr-cr'), age = get('egfr-age'), sex = selText('egfr-sex');
      const r = document.getElementById('egfr-result').textContent;
      if (r === '—') return null;
      return `eGFR (CKD-EPI 2021): Cr ${cr} mg/dL, Age ${age}, ${sex}\n${r}`;
    }
    case 'crcl': {
      const cr = get('crcl-cr'), age = get('crcl-age'), wt = get('crcl-wt'), sex = selText('crcl-sex');
      const r = document.getElementById('crcl-result').textContent;
      if (r === '—') return null;
      return `CrCl (Cockcroft-Gault): Cr ${cr} mg/dL, Age ${age}, Wt ${wt} kg, ${sex}\n${r}`;
    }
    case 'ca': {
      const ca = get('ca-total'), alb = get('ca-alb');
      const r = document.getElementById('ca-result').textContent;
      if (r === '—') return null;
      return `Corrected Calcium: Ca ${ca} mg/dL, Alb ${alb} g/dL\n${r}`;
    }
    case 'ag': {
      const na = get('ag-na'), cl = get('ag-cl'), hco3 = get('ag-hco3'), alb = get('ag-alb');
      const r = document.getElementById('ag-result').textContent;
      if (r === '—') return null;
      return `Anion Gap: Na ${na}, Cl ${cl}, HCO3 ${hco3}, Alb ${alb}\n${r}`;
    }
    case 'aa': {
      const fio2 = get('aa-fio2'), pao2 = get('aa-pao2'), paco2 = get('aa-paco2'), age = get('aa-age');
      const r = document.getElementById('aa-result').textContent;
      if (r === '—') return null;
      return `A-a Gradient: FiO2 ${fio2}%, PaO2 ${pao2}, PaCO2 ${paco2}, Age ${age}\n${r}`;
    }
    case 'meld': {
      const bili = get('meld-bili'), cr = get('meld-cr'), inr = get('meld-inr'), na = get('meld-na');
      const dialysis = selText('meld-dialysis');
      const r = document.getElementById('meld-result').textContent;
      if (r === '—') return null;
      return `MELD-Na: Bili ${bili}, Cr ${cr}, INR ${inr}, Na ${na}, Dialysis: ${dialysis}\n${r}`;
    }
    case 'chads': {
      const items = [
        yn('chads-chf', 'CHF'), yn('chads-htn', 'HTN'),
        `Age ${selText('chads-age')}`, yn('chads-dm', 'DM'),
        yn('chads-stroke', 'Stroke/TIA'), yn('chads-vasc', 'Vascular Dz'),
        `Sex: ${selText('chads-sex')}`
      ];
      const r = document.getElementById('chads-result').textContent;
      if (r === '—') return null;
      return `CHA₂DS₂-VASc: ${items.join(', ')}\n${r}`;
    }
    case 'curb': {
      const items = [
        yn('curb-conf', 'Confusion'), yn('curb-bun', 'BUN>19'),
        yn('curb-rr', 'RR≥30'), yn('curb-bp', 'Low BP'), yn('curb-age', 'Age≥65')
      ];
      const r = document.getElementById('curb-result').textContent;
      if (r === '—') return null;
      return `CURB-65: ${items.join(', ')}\n${r}`;
    }
    case 'wells': {
      const items = [
        yn('wells-cancer', 'Cancer'), yn('wells-paral', 'Paralysis'),
        yn('wells-bed', 'Bedridden/Surg'), yn('wells-tend', 'Tenderness'),
        yn('wells-swell', 'Leg swollen'), yn('wells-calf', 'Calf>3cm'),
        yn('wells-edema', 'Pitting edema'), yn('wells-coll', 'Collaterals'),
        yn('wells-alt', 'Alt Dx likely')
      ];
      const r = document.getElementById('wells-result').textContent;
      if (r === '—') return null;
      return `Wells DVT: ${items.join(', ')}\n${r}`;
    }
    case 'bmi': {
      const wt = get('bmi-wt'), ht = get('bmi-ht');
      const r = document.getElementById('bmi-result').textContent;
      if (r === '—') return null;
      return `BMI: Wt ${wt} kg, Ht ${ht} cm\n${r}`;
    }
    case 'map': {
      const sbp = get('map-sbp'), dbp = get('map-dbp');
      const r = document.getElementById('map-result').textContent;
      if (r === '—') return null;
      return `MAP: SBP ${sbp}, DBP ${dbp}\n${r}`;
    }
    case 'gcs': {
      const r = document.getElementById('gcs-result').textContent;
      if (r === '—') return null;
      return `${r}`;
    }
    case 'fena': {
      const sna = get('fena-sna'), scr = get('fena-scr'), una = get('fena-una'), ucr = get('fena-ucr');
      const r = document.getElementById('fena-result').textContent;
      if (r === '—') return null;
      return `FENa: Serum Na ${sna}, Serum Cr ${scr}, Urine Na ${una}, Urine Cr ${ucr}\n${r}`;
    }
    case 'osm': {
      const na = get('osm-na'), glu = get('osm-glu'), bun = get('osm-bun'), meas = get('osm-meas');
      const r = document.getElementById('osm-result').textContent;
      if (r === '—') return null;
      let s = `Serum Osmolality: Na ${na}, Glucose ${glu || '-'}, BUN ${bun || '-'}`;
      if (meas) s += `, Measured ${meas}`;
      return `${s}\n${r}`;
    }
    case 'qtc': {
      const qt = get('qtc-qt'), hr = get('qtc-hr');
      const r = document.getElementById('qtc-result').textContent;
      if (r === '—') return null;
      return `QTc: QT ${qt} ms, HR ${hr} bpm\n${r}`;
    }
    case 'childpugh': {
      const items = [
        `Bilirubin: ${selText('cp-bili')}`, `Albumin: ${selText('cp-alb')}`,
        `INR: ${selText('cp-inr')}`, `Ascites: ${selText('cp-ascites')}`,
        `Encephalopathy: ${selText('cp-enceph')}`
      ];
      const r = document.getElementById('childpugh-result').textContent;
      if (r === '—') return null;
      return `Child-Pugh: ${items.join(', ')}\n${r}`;
    }
    case 'hasbled': {
      const items = [
        yn('hasbled-htn', 'HTN(SBP>160)'), yn('hasbled-renal', 'Renal'),
        yn('hasbled-liver', 'Liver'), yn('hasbled-stroke', 'Stroke Hx'),
        yn('hasbled-bleed', 'Prior Bleed'), yn('hasbled-inr', 'Labile INR'),
        yn('hasbled-age', 'Age>65'), yn('hasbled-drugs', 'Drugs'), yn('hasbled-etoh', 'Alcohol')
      ];
      const r = document.getElementById('hasbled-result').textContent;
      if (r === '—') return null;
      return `HAS-BLED: ${items.join(', ')}\n${r}`;
    }
    case 'news2': {
      const rr = get('news-rr'), spo2 = get('news-spo2'), o2 = selText('news-o2');
      const temp = get('news-temp'), sbp = get('news-sbp'), hr = get('news-hr');
      const avpu = selText('news-avpu');
      const r = document.getElementById('news2-result').textContent;
      if (r === '—') return null;
      const parts = [];
      if (rr) parts.push(`RR ${rr}`);
      if (spo2) parts.push(`SpO2 ${spo2}%`);
      parts.push(`O2: ${o2}`);
      if (temp) parts.push(`T ${temp}°C`);
      if (sbp) parts.push(`SBP ${sbp}`);
      if (hr) parts.push(`HR ${hr}`);
      parts.push(`AVPU: ${avpu}`);
      return `NEWS2: ${parts.join(', ')}\n${r}`;
    }
    case 'sofa': {
      const items = [
        `Resp: ${selText('sofa-resp')}`, `Coag: ${selText('sofa-coag')}`,
        `Liver: ${selText('sofa-liver')}`, `Cardio: ${selText('sofa-cardio')}`,
        `Neuro: GCS ${selText('sofa-neuro')}`, `Renal: ${selText('sofa-renal')}`
      ];
      const r = document.getElementById('sofa-result').textContent;
      if (r === '—') return null;
      return `SOFA: ${items.join(', ')}\n${r}`;
    }
    case 'qsofa': {
      const rrV = get('qsofa-rr'), mentV = get('qsofa-ment'), sbpV = get('qsofa-sbp');
      const score = parseInt(rrV) + parseInt(mentV) + parseInt(sbpV);
      // Only include in copy if at least one criterion is positive
      if (score === 0) return null;
      const items = [
        `RR≥22: ${selText('qsofa-rr')}`, `Mentation: ${selText('qsofa-ment')}`, `SBP≤100: ${selText('qsofa-sbp')}`
      ];
      const r = document.getElementById('qsofa-result').textContent;
      return `qSOFA: ${items.join(', ')}\n${r}`;
    }
    case 'wellspe': {
      const ids2 = ['wellspe-dvt','wellspe-alt','wellspe-hr','wellspe-immob','wellspe-prior','wellspe-hemo','wellspe-malig'];
      const score2 = ids2.reduce((s, id) => s + parseFloat(get(id)), 0);
      if (score2 === 0) return null;
      const items = [
        `DVT signs: ${selText('wellspe-dvt')}`, `Alt Dx: ${selText('wellspe-alt')}`,
        `HR>100: ${selText('wellspe-hr')}`, `Immob/Surg: ${selText('wellspe-immob')}`,
        `Prior DVT/PE: ${selText('wellspe-prior')}`, `Hemoptysis: ${selText('wellspe-hemo')}`,
        `Malignancy: ${selText('wellspe-malig')}`
      ];
      const r = document.getElementById('wellspe-result').textContent;
      return `Wells PE: ${items.join(', ')}\n${r}`;
    }
    default: return null;
  }
}

async function copyCalcResult(prefix, btn) {
  const summary = buildCalcSummary(prefix);
  if (!summary) {
    btn.textContent = 'No result';
    setTimeout(() => { btn.textContent = '⧉ Copy'; }, 1500);
    return;
  }
  try {
    await navigator.clipboard.writeText(summary);
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '⧉ Copy'; btn.classList.remove('copied'); }, 2000);
  } catch (e) {
    // Fallback for iframe/sandbox
    const ta = document.createElement('textarea');
    ta.value = summary; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '⧉ Copy'; btn.classList.remove('copied'); }, 2000);
  }
}

// Copy all non-empty calculator results to clipboard
async function copyAllResults(btn) {
  const allPrefixes = [
    'bmi','gcs','map',
    'egfr','crcl','fena','osm',
    'chads','hasbled','qtc','wells','wellspe',
    'aa','curb',
    'meld','childpugh',
    'ag','ca',
    'news2','sofa','qsofa'
  ];
  const lines = [];
  for (const p of allPrefixes) {
    const s = buildCalcSummary(p);
    if (s) lines.push(s);
  }
  if (lines.length === 0) {
    btn.textContent = 'Nothing to copy';
    setTimeout(() => { btn.textContent = '⧉ Copy All Results'; }, 2000);
    return;
  }
  const text = `=== Calculator Results (${new Date().toLocaleDateString()}) ===\n\n` + lines.join('\n\n');
  try {
    await navigator.clipboard.writeText(text);
  } catch(e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
  }
  btn.textContent = `✓ Copied (${lines.length} result${lines.length > 1 ? 's' : ''})`;
  setTimeout(() => { btn.textContent = '⧉ Copy All Results'; }, 2500);
}

// ---------------------------------------------------------------------------
// Lab Trends Panel
// ---------------------------------------------------------------------------

let labTrendsVisible = false;

function toggleLabTrends() {
  labTrendsVisible = !labTrendsVisible;
  const panel = document.getElementById('lab-trends-panel');
  const btn = document.getElementById('lab-trends-toggle-btn');
  panel.style.display = labTrendsVisible ? 'block' : 'none';
  btn.style.opacity = labTrendsVisible ? '1' : '';
  btn.style.background = labTrendsVisible ? 'var(--accent-muted, rgba(99,102,241,0.12))' : '';
}

// Parse all timestamped lab entries from a patient record string.
// Returns array of { timestamp, date, labs } sorted oldest→newest.
function parseLabTimeline(record) {
  // Split on ## YYYY-MM-DD HH:MM — Category headings
  const sectionRe = /^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/m;
  const parts = record.split(/(?=^## \d{4}-\d{2}-\d{2})/m);
  const timeline = [];

  for (const part of parts) {
    const tsMatch = part.match(/^##\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/m);
    if (!tsMatch) continue;
    const timestamp = `${tsMatch[1]} ${tsMatch[2]}`;
    const labs = {};

    // Parse markdown table rows  | Test | Value |
    const tableRowRe = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
    let m;
    while ((m = tableRowRe.exec(part)) !== null) {
      const name = m[1].trim();
      const val = m[2].trim();
      if (name === 'Test' || name.startsWith('-')) continue;
      const numM = val.match(/^[<>]?\s*([\d.]+)/);
      if (!numM) continue;
      const v = parseFloat(numM[1]);
      const nl = name.toLowerCase();
      if (/creatinine|^cre$/i.test(name)) labs.Cr = v;
      else if (/^na$/i.test(name) || /sodium/i.test(name)) labs.Na = v;
      else if (/^k$/i.test(name) || /potassium/i.test(name)) labs.K = v;
      else if (/^cl$/i.test(name) || /chloride/i.test(name)) labs.Cl = v;
      else if (/hco3|^co2$|^tco2$/i.test(name)) labs.HCO3 = v;
      else if (/^bun/i.test(name) || /urea.*n/i.test(name)) labs.BUN = v;
      else if (/albumin|^alb$/i.test(name)) labs.Alb = v;
      else if (/bilirubin|t-bil|t\.bil/i.test(name)) labs.TBili = v;
      else if (/^inr$/i.test(name)) labs.INR = v;
      else if (/calcium|^ca$/i.test(name)) labs.Ca = v;
      else if (/glucose|^glu$/i.test(name)) labs.Glu = v;
      else if (/platelet|^plt$/i.test(name)) labs.Plt = v;
      else if (/hemoglobin|^hb$|^hgb$/i.test(name)) labs.Hgb = v;
      else if (/wbc|white.*blood|leukocyte/i.test(name)) labs.WBC = v;
    }

    // Regex fallback for free-text vitals/labs in same section
    if (!labs.Cr) { const x = part.match(/(?:Cr(?:eatinine)?|SCr)\s*[:=]?\s*([\d.]+)/i); if (x) labs.Cr = parseFloat(x[1]); }
    if (!labs.Na) { const x = part.match(/(?:\bNa\b|Sodium)\s*[:=]?\s*(\d+)/i); if (x) labs.Na = parseFloat(x[1]); }
    if (!labs.K)  { const x = part.match(/(?:\bK\b|Potassium)\s*[:=]?\s*([\d.]+)/i); if (x) labs.K = parseFloat(x[1]); }
    if (!labs.Hgb){ const x = part.match(/(?:Hgb|Hb|Hemoglobin)\s*[:=]?\s*([\d.]+)/i); if (x) labs.Hgb = parseFloat(x[1]); }
    if (!labs.WBC){ const x = part.match(/(?:WBC|Leukocyte)\s*[:=]?\s*([\d.]+)/i); if (x) labs.WBC = parseFloat(x[1]); }
    if (!labs.Plt){ const x = part.match(/(?:Plt|Platelet)\s*[:=]?\s*([\d.]+)/i); if (x) labs.Plt = parseFloat(x[1]); }

    if (Object.keys(labs).length > 0) {
      timeline.push({ timestamp, labs });
    }
  }
  return timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

// Render the lab trend table in the panel
function renderLabTrends(timeline, patientName) {
  const panel = document.getElementById('lab-trends-content');
  if (timeline.length === 0) {
    panel.innerHTML = '<span style="color:var(--text-dim);">No timestamped lab data found in record.</span>';
    return;
  }

  // Collect all lab keys present across all timepoints
  const allKeys = [];
  for (const entry of timeline) {
    for (const k of Object.keys(entry.labs)) {
      if (!allKeys.includes(k)) allKeys.push(k);
    }
  }

  const trendArrow = (curr, prev) => {
    if (prev === undefined) return '<span style="color:var(--text-dim)">—</span>';
    const diff = curr - prev;
    const pct = Math.abs(diff / prev) * 100;
    if (pct < 3) return '<span style="color:var(--text-dim)">→</span>';
    return diff > 0
      ? `<span style="color:var(--red)">↑</span>`
      : `<span style="color:var(--green)">↓</span>`;
  };

  // Build HTML table — rows = lab tests, columns = timepoints (max 6 most recent)
  const shown = timeline.slice(-6);
  let html = `<div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:0.4rem;">`;
  html += `${patientName} — ${timeline.length} lab set${timeline.length > 1 ? 's' : ''} found`;
  if (timeline.length > 6) html += ` (showing last 6)`;
  html += `</div>`;

  html += `<div style="overflow-x:auto;"><table style="border-collapse:collapse;width:100%;font-size:0.61rem;">`;
  html += `<thead><tr><th style="text-align:left;padding:2px 6px;border-bottom:1px solid var(--border);white-space:nowrap;">Test</th>`;
  for (const entry of shown) {
    html += `<th style="text-align:right;padding:2px 6px;border-bottom:1px solid var(--border);white-space:nowrap;">${entry.timestamp.replace('T',' ')}</th>`;
  }
  html += `</tr></thead><tbody>`;

  for (const key of allKeys) {
    const vals = shown.map(e => e.labs[key]);
    if (vals.every(v => v === undefined)) continue;
    html += `<tr>`;
    html += `<td style="padding:2px 6px;color:var(--text-dim);white-space:nowrap;">${key}</td>`;
    for (let i = 0; i < shown.length; i++) {
      const v = shown[i].labs[key];
      const prev = i > 0 ? shown[i-1].labs[key] : undefined;
      const arrow = v !== undefined && prev !== undefined ? trendArrow(v, prev) : '<span style="color:var(--text-dim)">—</span>';
      const display = v !== undefined ? `${v} ${arrow}` : '<span style="color:var(--text-dim)">—</span>';
      html += `<td style="text-align:right;padding:2px 6px;">${display}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table></div>`;
  panel.innerHTML = html;
}

// On load: inject copy buttons into every calc-card header (next to clear button)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.calc-card').forEach(card => {
    const prefix = card.dataset.calc;
    if (!prefix) return;
    const headerRow = card.querySelector('div[style*="display:flex"]');
    if (!headerRow) return;
    const clearBtn = headerRow.querySelector('.calc-clear-btn');
    if (!clearBtn) return;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'calc-copy-btn';
    copyBtn.textContent = '⧉ Copy';
    copyBtn.title = 'Copy result to clipboard';
    copyBtn.onclick = function() { copyCalcResult(prefix, this); };
    headerRow.insertBefore(copyBtn, clearBtn);
  });
});

// ---------------------------------------------------------------------------
// Calculator: NTUH Lab Data Paste Parser
// ---------------------------------------------------------------------------

// NTUH lab test name → calculator field mapping
// Each entry: { field: target input ID, transform: optional fn }
// For score-based selects (curb-bun), transform returns the option value
const NTUH_LAB_MAP = {
  // ---- Renal ----
  'Creatinine':       [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }],
  'creatinine':       [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }],
  'Cre':              [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }],
  'Cre(B)':           [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }],
  '肌酐酸':            [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }],
  'BUN':              [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }],
  'BUN(B)':           [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }],
  '血中尿素氮':        [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }],
  'Urea Nitrogen':    [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }],

  // ---- Electrolytes ----
  'Na':               [{ field: 'ag-na' }, { field: 'meld-na' }],
  'Na(B)':            [{ field: 'ag-na' }, { field: 'meld-na' }],
  '鈉':               [{ field: 'ag-na' }, { field: 'meld-na' }],
  'Sodium':           [{ field: 'ag-na' }, { field: 'meld-na' }],
  'K':                [],  // captured for display but no calc field yet
  'K(B)':             [],
  '鉀':               [],
  'Potassium':        [],
  'Cl':               [{ field: 'ag-cl' }],
  'Cl(B)':            [{ field: 'ag-cl' }],
  '氯':               [{ field: 'ag-cl' }],
  'Chloride':         [{ field: 'ag-cl' }],
  'HCO3':             [{ field: 'ag-hco3' }],
  'CO2':              [{ field: 'ag-hco3' }],
  'TCO2':             [{ field: 'ag-hco3' }],
  'Total CO2':        [{ field: 'ag-hco3' }],
  '碳酸氫根':          [{ field: 'ag-hco3' }],

  // ---- Calcium / Albumin ----
  'Ca':               [{ field: 'ca-total' }],
  'Ca(B)':            [{ field: 'ca-total' }],
  'Calcium':          [{ field: 'ca-total' }],
  '鈣':               [{ field: 'ca-total' }],
  'Albumin':          [{ field: 'ag-alb' }, { field: 'ca-alb' }],
  'Alb':              [{ field: 'ag-alb' }, { field: 'ca-alb' }],
  'ALB':              [{ field: 'ag-alb' }, { field: 'ca-alb' }],
  '白蛋白':            [{ field: 'ag-alb' }, { field: 'ca-alb' }],

  // ---- Liver / MELD ----
  'T-Bil':            [{ field: 'meld-bili' }],
  'T-Bil(B)':         [{ field: 'meld-bili' }],
  'Total Bilirubin':  [{ field: 'meld-bili' }],
  '總膽紅素':          [{ field: 'meld-bili' }],
  'Bilirubin Total':  [{ field: 'meld-bili' }],
  'INR':              [{ field: 'meld-inr' }],
  'PT(INR)':          [{ field: 'meld-inr' }],

  // ---- Glucose (Osmolality) ----
  'Glucose':          [{ field: 'osm-glu' }],
  'GLU':              [{ field: 'osm-glu' }],
  'Glu(B)':           [{ field: 'osm-glu' }],
  'Sugar':            [{ field: 'osm-glu' }],
  '血糖':              [{ field: 'osm-glu' }],
  'AC Sugar':         [{ field: 'osm-glu' }],
  'PC Sugar':         [{ field: 'osm-glu' }],

  // ---- Platelets (display; SOFA is select-based) ----
  'PLT':              [],
  'Platelet':         [],
  'Platelets':        [],
  '血小板':            [],

  // ---- ABG ----
  'PaO2':             [{ field: 'aa-pao2' }],
  'pO2':              [{ field: 'aa-pao2' }],
  'PaCO2':            [{ field: 'aa-paco2' }],
  'pCO2':             [{ field: 'aa-paco2' }],
  'FiO2':             [{ field: 'aa-fio2' }],
};

function toggleLabPaste() {
  const area = document.getElementById('lab-paste-area');
  const arrow = document.getElementById('lab-paste-arrow');
  const isOpen = area.classList.toggle('open');
  arrow.innerHTML = isOpen ? '&#9660;' : '&#9654;';
}

function clearLabPaste() {
  document.getElementById('lab-paste-box').innerHTML = '';
  const status = document.getElementById('lab-parsed-status');
  status.className = 'calc-lab-parsed';
  status.innerHTML = '';
}

// Main paste handler: intercepts Ctrl+V to capture HTML clipboard
document.addEventListener('DOMContentLoaded', function() {
  const box = document.getElementById('lab-paste-box');
  if (!box) return;

  box.addEventListener('paste', function(e) {
    // Store the raw HTML from clipboard for parsing
    const htmlData = e.clipboardData.getData('text/html');
    const textData = e.clipboardData.getData('text/plain');

    // Let the paste happen naturally into the contenteditable div
    // but store the HTML data for when user clicks "Parse & Fill"
    box.dataset.pastedHtml = htmlData || '';
    box.dataset.pastedText = textData || '';
  });

  // Placeholder behavior for contenteditable
  box.addEventListener('focus', function() { if (box.textContent.trim() === '') box.classList.add('focused'); });
  box.addEventListener('blur', function() { box.classList.remove('focused'); });
});

function parseLabPaste() {
  const box = document.getElementById('lab-paste-box');
  const statusEl = document.getElementById('lab-parsed-status');

  // Try HTML first (from clipboard), then fall back to text content of the box
  const html = box.dataset.pastedHtml || '';
  const text = box.dataset.pastedText || box.textContent || '';

  let parsedLabs = {};

  if (html && html.includes('<t')) {
    // === Strategy 1: Parse HTML table structure ===
    parsedLabs = parseLabsFromHtml(html);
  }

  if (Object.keys(parsedLabs).length === 0 && text.trim()) {
    // === Strategy 2: Plain text fallback ===
    parsedLabs = parseLabsFromText(text);
  }

  if (Object.keys(parsedLabs).length === 0) {
    statusEl.className = 'calc-lab-parsed show warn';
    statusEl.innerHTML = 'No lab values recognized. Make sure you pasted data from the NTUH lab report.';
    return;
  }

  // Apply parsed values to calculator fields
  let filled = 0;
  let filledNames = [];

  for (const [labName, labValue] of Object.entries(parsedLabs)) {
    const mappings = findLabMappings(labName);
    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        const el = document.getElementById(mapping.field);
        if (!el) continue;
        if (mapping.transform) {
          el.value = mapping.transform(labValue);
        } else {
          el.value = labValue;
        }
      }
      filled++;
      filledNames.push(`<span><b>${escHtml(labName)}</b>: ${escHtml(labValue)}</span>`);
    }
  }

  // Trigger all recalculations
  calcEGFR(); calcCrCl(); calcCorrCa(); calcAG(); calcAaGrad(); calcMELD(); calcCHADS(); calcCURB(); calcWells(); calcBMI(); calcMAP(); calcGCS(); calcFENa(); calcOsm(); calcQTc(); calcChildPugh(); calcHASBLED(); calcNEWS2(); calcSOFA();

  // Show status
  statusEl.className = `calc-lab-parsed show ${filled > 0 ? 'success' : 'warn'}`;
  statusEl.innerHTML = filled > 0
    ? `Parsed ${filled} lab values and filled into calculators:<div class="calc-lab-parsed-values">${filledNames.join('')}</div>`
    : `Found ${Object.keys(parsedLabs).length} lab items but none matched calculator fields.`;
}

function findLabMappings(labName) {
  // Direct match
  if (NTUH_LAB_MAP[labName]) return NTUH_LAB_MAP[labName];
  // Try trimmed
  const trimmed = labName.trim();
  if (NTUH_LAB_MAP[trimmed]) return NTUH_LAB_MAP[trimmed];
  // Case-insensitive search
  for (const [key, val] of Object.entries(NTUH_LAB_MAP)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) return val;
  }
  // Partial match — lab name contains a known key or vice versa
  for (const [key, val] of Object.entries(NTUH_LAB_MAP)) {
    if (val.length > 0 && (trimmed.includes(key) || key.includes(trimmed)) && trimmed.length >= 2) return val;
  }
  return null;
}

function parseLabsFromHtml(html) {
  const parsed = {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Find all table rows
  const rows = doc.querySelectorAll('tr');
  for (const row of rows) {
    const cells = row.querySelectorAll('td, th');
    if (cells.length < 2) continue;

    const itemName = (cells[0].textContent || '').trim();
    const itemValue = (cells[1].textContent || '').trim();

    // Skip header rows and empty values
    if (!itemName || !itemValue) continue;
    if (itemName === '檢驗項目' || itemName === 'Test') continue;

    // Extract numeric value — handle cases like "Negative", ">150", "<0.01"
    const numMatch = itemValue.match(/^[<>]?\s*([\d.]+)/);
    if (numMatch) {
      parsed[itemName] = numMatch[1];
    } else if (/negative|positive/i.test(itemValue)) {
      // Store qualitative results for display but they won't fill numeric calc fields
      parsed[itemName] = itemValue;
    }
  }

  // Also try parsing cells that may be in a flat structure (NTUH sometimes uses
  // single-row tables or spans within tables)
  if (Object.keys(parsed).length === 0) {
    // Try finding text nodes that look like lab item/value pairs in any table cells
    const allCells = doc.querySelectorAll('td');
    const cellTexts = Array.from(allCells).map(c => c.textContent.trim()).filter(Boolean);
    // Process consecutive cells as name/value pairs
    for (let i = 0; i < cellTexts.length - 1; i++) {
      const name = cellTexts[i];
      const value = cellTexts[i + 1];
      const numM = value.match(/^[<>]?\s*([\d.]+)/);
      if (numM && findLabMappings(name)) {
        parsed[name] = numM[1];
        i++; // skip the value cell
      }
    }
  }

  return parsed;
}

function parseLabsFromText(text) {
  const parsed = {};

  // Strategy: try to match known lab names followed by numeric values
  // Works for formats like "Creatinine 1.2", "Na: 138", "BUN=19.5"
  for (const labName of Object.keys(NTUH_LAB_MAP)) {
    // Escape regex special chars in lab name
    const escaped = labName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: labName, optional separator, then a number
    const pattern = new RegExp(escaped + '\\s*[:=]?\\s*([<>]?\\s*[\\d.]+)', 'i');
    const m = text.match(pattern);
    if (m) {
      const numMatch = m[1].match(/[\d.]+/);
      if (numMatch) parsed[labName] = numMatch[0];
    }
  }

  // Also try tab-separated format (when table copy preserves tabs)
  if (Object.keys(parsed).length === 0 && text.includes('\t')) {
    const lines = text.split('\n');
    for (const line of lines) {
      const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const name = parts[0];
        const value = parts[1];
        const numM = value.match(/^[<>]?\s*([\d.]+)/);
        if (numM && findLabMappings(name)) {
          parsed[name] = numM[1];
        }
      }
    }
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Calculator: Load patient data from Handoff
// ---------------------------------------------------------------------------
async function loadCalcPatientList() {
  const sel = document.getElementById('calc-patient-select');
  if (!sel) return;
  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) return;
    const patients = await res.json();
    // Keep the placeholder option
    sel.innerHTML = '<option value="">\u2014 Select patient \u2014</option>';
    patients.filter(p => !p.id.endsWith('_dc')).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.dx || 'no dx'})`;
      sel.appendChild(opt);
    });
  } catch(e) { /* Handoff offline, leave selector empty */ }
}

async function loadPatientIntoCalc(pid) {
  if (!pid) return;
  const statusEl = document.getElementById('calc-patient-status');
  statusEl.style.display = 'inline'; statusEl.textContent = 'Loading...'; statusEl.style.color = 'var(--accent)';

  try {
    const res = await fetch(`/s/handoff/api/patients/${pid}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const record = data.content || '';

    // Parse age and sex from header: **Age/Sex:** 49M or *49M
    let age = null, sex = null;
    const ageSexMatch = record.match(/(?:\*\*Age\/Sex:\*\*\s*|^\*?)(\d+)\s*([MF])/im);
    if (ageSexMatch) { age = parseInt(ageSexMatch[1]); sex = ageSexMatch[2].toUpperCase(); }

    // --- Parse labs: try structured markdown tables first, then regex fallback ---
    const labs = {};

    // Strategy 1: Parse markdown tables (from structured NTUH paste)
    // Format: | Test | Value | Unit | Reference |
    // Uses the NTUH_LAB_MAP dictionary already defined for the paste parser
    const tableRowRegex = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
    let tableMatch;
    while ((tableMatch = tableRowRegex.exec(record)) !== null) {
      const testName = tableMatch[1].trim();
      const testValue = tableMatch[2].trim();
      if (testName === 'Test' || testName === '---' || testName.startsWith('-')) continue;
      const numM = testValue.match(/^[<>]?\s*([\d.]+)/);
      if (!numM) continue;
      const val = parseFloat(numM[1]);
      // Map NTUH test names to internal lab keys
      const nameLC = testName.toLowerCase();
      if (/creatinine|^cre$/i.test(testName)) labs.cr = val;
      else if (/^na$/i.test(testName) || /鈉|sodium/i.test(testName)) labs.na = val;
      else if (/^cl$/i.test(testName) || /氯|chloride/i.test(testName)) labs.cl = val;
      else if (/hco3|co2|碳酸氫根/i.test(testName)) labs.hco3 = val;
      else if (/^bun/i.test(testName) || /尿素氮/i.test(testName)) labs.bun = val;
      else if (/bilirubin|t-bil|總膽紅素/i.test(testName)) labs.bili = val;
      else if (/^inr$|pt.*inr/i.test(testName)) labs.inr = val;
      else if (/albumin|^alb$/i.test(testName) || /白蛋白/i.test(testName)) labs.alb = val;
      else if (/calcium|^ca$/i.test(testName) || /鈣/i.test(testName)) labs.ca = val;
      else if (/pao2|^po2$/i.test(testName)) labs.pao2 = val;
      else if (/paco2|^pco2$/i.test(testName)) labs.paco2 = val;
      else if (/fio2/i.test(testName)) labs.fio2 = val;
      else if (/^k$/i.test(testName) || /鉀|potassium/i.test(testName)) labs.k = val;
      else if (/glucose|glu|sugar|血糖/i.test(testName)) labs.glu = val;
      else if (/platelet|plt|血小板/i.test(testName)) labs.plt = val;
    }

    // Strategy 2: Regex fallback for older free-text records
    if (Object.keys(labs).length === 0) {
      const labPatterns = {
        cr: /(?:Cr(?:eatinine)?|SCr)\s*[:=]?\s*([\d.]+)/i,
        na: /(?:\bNa\b|Sodium)\s*[:=]?\s*(\d+)/i,
        cl: /(?:\bCl\b|Chloride)\s*[:=]?\s*(\d+)/i,
        hco3: /(?:HCO3|Bicarb(?:onate)?)\s*[:=]?\s*(\d+)/i,
        bun: /(?:BUN|Urea\s*N)\s*[:=]?\s*([\d.]+)/i,
        bili: /(?:Bilirubin|T-?Bil|Total\s*Bil)\s*[:=]?\s*([\d.]+)/i,
        inr: /(?:INR|PT\/INR)\s*[:=]?\s*([\d.]+)/i,
        alb: /(?:Albumin|Alb)\s*[:=]?\s*([\d.]+)/i,
        ca: /(?:Calcium|\bCa\b)\s*[:=]?\s*([\d.]+)/i,
        pao2: /(?:PaO2|pO2)\s*[:=]?\s*([\d.]+)/i,
        paco2: /(?:PaCO2|pCO2)\s*[:=]?\s*([\d.]+)/i,
        fio2: /(?:FiO2)\s*[:=]?\s*([\d.]+)/i,
        glu: /(?:Glucose|GLU|Sugar)\s*[:=]?\s*([\d.]+)/i,
        plt: /(?:PLT|Platelet)\s*[:=]?\s*([\d.]+)/i,
      };
      for (const [key, pattern] of Object.entries(labPatterns)) {
        const m = record.match(pattern);
        if (m) labs[key] = parseFloat(m[1]);
      }
    }

    // Parse weight and vitals from record
    const wtMatch = record.match(/(?:Weight|BW|Wt)\s*[:=]?\s*([\d.]+)\s*(?:kg)?/i);
    const weight = wtMatch ? parseFloat(wtMatch[1]) : null;
    const sbpMatch = record.match(/(?:SBP|Systolic)\s*[:=]?\s*(\d+)/i) || record.match(/BP\s*[:=]?\s*(\d+)\s*\//i);
    const dbpMatch = record.match(/(?:DBP|Diastolic)\s*[:=]?\s*(\d+)/i) || record.match(/BP\s*[:=]?\s*\d+\s*\/\s*(\d+)/i);
    const hrMatch = record.match(/(?:HR|Heart\s*Rate|Pulse)\s*[:=]?\s*(\d+)/i);
    const tempMatch = record.match(/(?:Temp|Temperature|BT|T)\s*[:=]?\s*([\d.]+)\s*(?:°?C)?/i);
    const spo2Match = record.match(/(?:SpO2|SaO2|O2\s*Sat)\s*[:=]?\s*(\d+)/i);
    const rrMatch = record.match(/(?:RR|Resp(?:iratory)?\s*Rate)\s*[:=]?\s*(\d+)/i);

    let filled = 0;

    // --- Demographics: age, sex ---
    if (age) {
      document.getElementById('egfr-age').value = age;
      document.getElementById('crcl-age').value = age;
      document.getElementById('aa-age').value = age;
      // CHA₂DS₂-VASc age brackets: 0 = <65, 1 = 65-74, 2 = ≥75
      document.getElementById('chads-age').value = age >= 75 ? '2' : age >= 65 ? '1' : '0';
      // CURB-65 age: 0 = <65, 1 = ≥65
      document.getElementById('curb-age').value = age >= 65 ? '1' : '0';
      filled++;
    }
    if (sex) {
      // eGFR and CrCl use M/F values
      document.getElementById('egfr-sex').value = sex;
      document.getElementById('crcl-sex').value = sex;
      // CHA₂DS₂-VASc uses scoring values: 0=Male, 1=Female (+1 point)
      document.getElementById('chads-sex').value = sex === 'F' ? '1' : '0';
      filled++;
    }

    // --- Lab values across calculators ---
    // Creatinine → eGFR, CrCl, MELD
    if (labs.cr) {
      document.getElementById('egfr-cr').value = labs.cr;
      document.getElementById('crcl-cr').value = labs.cr;
      document.getElementById('meld-cr').value = labs.cr;
      filled++;
    }
    if (weight) { document.getElementById('crcl-wt').value = weight; filled++; }

    // Electrolytes → Anion Gap, MELD
    if (labs.na) { document.getElementById('ag-na').value = labs.na; document.getElementById('meld-na').value = labs.na; filled++; }
    if (labs.cl) { document.getElementById('ag-cl').value = labs.cl; filled++; }
    if (labs.hco3) { document.getElementById('ag-hco3').value = labs.hco3; filled++; }

    // Albumin → Anion Gap, Corrected Calcium
    if (labs.alb) { document.getElementById('ag-alb').value = labs.alb; document.getElementById('ca-alb').value = labs.alb; filled++; }

    // Calcium → Corrected Calcium
    if (labs.ca) { document.getElementById('ca-total').value = labs.ca; filled++; }

    // Liver → MELD
    if (labs.bili) { document.getElementById('meld-bili').value = labs.bili; filled++; }
    if (labs.inr) { document.getElementById('meld-inr').value = labs.inr; filled++; }

    // ABG → A-a Gradient
    if (labs.pao2) { document.getElementById('aa-pao2').value = labs.pao2; filled++; }
    if (labs.paco2) { document.getElementById('aa-paco2').value = labs.paco2; filled++; }
    if (labs.fio2) { document.getElementById('aa-fio2').value = labs.fio2; filled++; }

    // BUN → CURB-65 (BUN > 19 mg/dL = 1 point) + Osmolality
    if (labs.bun) {
      document.getElementById('curb-bun').value = labs.bun > 19 ? '1' : '0';
      document.getElementById('osm-bun').value = labs.bun;
      filled++;
    }

    // Glucose → Osmolality
    if (labs.glu) { document.getElementById('osm-glu').value = labs.glu; filled++; }

    // Na → Osmolality (already filled ag-na and meld-na above)
    if (labs.na) { document.getElementById('osm-na').value = labs.na; }

    // Weight → BMI (also already in CrCl)
    if (weight) { document.getElementById('bmi-wt').value = weight; }

    // Height from record
    const htMatch = record.match(/(?:Height|Ht|身高)\s*[:=]?\s*([\d.]+)\s*(?:cm)?/i);
    if (htMatch) { document.getElementById('bmi-ht').value = parseFloat(htMatch[1]); filled++; }

    // HAS-BLED age
    if (age) {
      document.getElementById('hasbled-age').value = age > 65 ? '1' : '0';
    }

    // Vitals → MAP, NEWS2, qSOFA
    const sbp = sbpMatch ? parseInt(sbpMatch[1]) : null;
    const dbp = dbpMatch ? parseInt(dbpMatch[1]) : null;
    if (sbp) {
      document.getElementById('map-sbp').value = sbp;
      document.getElementById('news-sbp').value = sbp;
      document.getElementById('qsofa-sbp').value = sbp <= 100 ? '1' : '0';
      filled++;
    }
    if (dbp) { document.getElementById('map-dbp').value = dbp; filled++; }
    const hr = hrMatch ? parseInt(hrMatch[1]) : null;
    if (hr) {
      document.getElementById('news-hr').value = hr;
      document.getElementById('wellspe-hr').value = hr > 100 ? '1.5' : '0';
      filled++;
    }
    if (tempMatch) { document.getElementById('news-temp').value = parseFloat(tempMatch[1]); filled++; }
    if (spo2Match) { document.getElementById('news-spo2').value = parseInt(spo2Match[1]); filled++; }
    const rr = rrMatch ? parseInt(rrMatch[1]) : null;
    if (rr) {
      document.getElementById('news-rr').value = rr;
      document.getElementById('qsofa-rr').value = rr >= 22 ? '1' : '0';
      filled++;
    }

    // Trigger all recalculations
    calcEGFR(); calcCrCl(); calcCorrCa(); calcAG(); calcAaGrad(); calcMELD(); calcCHADS(); calcCURB(); calcWells(); calcWellsPE(); calcBMI(); calcMAP(); calcGCS(); calcFENa(); calcOsm(); calcQTc(); calcChildPugh(); calcHASBLED(); calcNEWS2(); calcSOFA(); calcQSOFA();

    // Update lab trends panel if visible or auto-open if data found
    const labTimeline = parseLabTimeline(record);
    if (labTimeline.length > 0) {
      renderLabTrends(labTimeline, data.name);
      // Auto-show panel if more than one lab set (trends are meaningful)
      if (labTimeline.length > 1 && !labTrendsVisible) {
        toggleLabTrends();
      }
    } else {
      document.getElementById('lab-trends-content').innerHTML =
        '<span style="color:var(--text-dim);">No timestamped lab entries found in this record.</span>';
    }

    statusEl.style.color = 'var(--green)';
    statusEl.textContent = filled > 0 ? `Loaded ${filled} values from ${data.name}` : `No parseable lab values found for ${data.name}`;
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
  } catch(e) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = 'Failed to load patient';
    setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
  }
}

// ---------------------------------------------------------------------------
// Patient Census Board
// ---------------------------------------------------------------------------
async function loadCensus() {
  const body = document.getElementById('census-body');
  const countEl = document.getElementById('census-count');
  body.innerHTML = '<div class="census-empty"><div class="spinner"></div><div style="margin-top:0.6rem;">Loading patients from Handoff...</div></div>';

  try {
    const res = await fetch('/s/handoff/api/patients');
    if (!res.ok) throw new Error('Handoff service unavailable');
    const patients = await res.json();

    const active = patients.filter(p => !p.id.endsWith('_dc'));
    const discharged = patients.filter(p => p.id.endsWith('_dc'));

    countEl.textContent = `${active.length} active${discharged.length ? `, ${discharged.length} discharged` : ''}`;

    if (patients.length === 0) {
      body.innerHTML = '<div class="census-empty"><div class="census-empty-icon">&#9638;</div><div>No patients in system</div><div style="font-size:0.65rem;margin-top:0.3rem;color:var(--text-dim);">Add patients via Handoff Tool or Admissions</div></div>';
      return;
    }

    let html = '<table class="census-table"><thead><tr><th>Patient</th><th>Diagnosis</th><th>Admitted</th><th>Status</th><th>Last Updated</th></tr></thead><tbody>';

    // Active patients first
    for (const p of active) {
      const mod = p.modified ? new Date(p.modified).toLocaleDateString() + ' ' + new Date(p.modified).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
      html += `<tr>
        <td class="census-name">${escHtml(p.name)}</td>
        <td class="census-dx" title="${escHtml(p.dx)}">${escHtml(p.dx || '—')}</td>
        <td>${escHtml(p.admitted || '—')}</td>
        <td><span class="census-tag active">Active</span></td>
        <td style="font-size:0.6rem;color:var(--text-dim);">${mod}</td>
      </tr>`;
    }

    // Discharged patients
    for (const p of discharged) {
      const mod = p.modified ? new Date(p.modified).toLocaleDateString() + ' ' + new Date(p.modified).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
      html += `<tr style="opacity:0.6;">
        <td class="census-name" style="color:var(--text-dim);">${escHtml(p.name)}</td>
        <td class="census-dx" title="${escHtml(p.dx)}">${escHtml(p.dx || '—')}</td>
        <td>${escHtml(p.admitted || '—')}</td>
        <td><span class="census-tag dc">DC'd</span></td>
        <td style="font-size:0.6rem;color:var(--text-dim);">${mod}</td>
      </tr>`;
    }

    html += '</tbody></table>';
    body.innerHTML = html;

  } catch (e) {
    body.innerHTML = `<div class="census-empty"><div class="census-empty-icon">&#9888;</div><div>Could not load census</div><div style="font-size:0.65rem;margin-top:0.3rem;color:var(--text-dim);">${e.message}. Is Handoff Tool running?</div></div>`;
    countEl.textContent = 'Offline';
  }
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---------------------------------------------------------------------------
// Renal Drug Dosing Calculator
// ---------------------------------------------------------------------------

const DRUG_DOSING = {
  vancomycin: {
    name: 'Vancomycin', route: 'IV',
    note: 'AUC-guided dosing preferred (target AUC/MIC 400–600 mg·h/L). Trough-only monitoring now discouraged. Obtain levels after 3rd dose.',
    calc: (wt, crcl) => {
      const dose = Math.round(Math.min(wt * 15, 3000) / 250) * 250;
      let iv, n;
      if (crcl >= 70)      { iv = 'q8–12h';     n = 'Standard. Monitor AUC or 2 troughs.'; }
      else if (crcl >= 40) { iv = 'q12h';        n = 'Moderate impairment. Monitor closely.'; }
      else if (crcl >= 20) { iv = 'q24h';        n = 'Severe impairment. ID/pharmacy consult advised.'; }
      else if (crcl >= 10) { iv = 'q48h';        n = 'Severe impairment. Level monitoring mandatory.'; }
      else                 { iv = 'q4–7 days';   n = 'Dialysis — redose based on pre-dialysis levels. Pharmacy consult required.'; }
      return { dose: `${dose} mg`, interval: iv, note: n };
    }
  },
  pipTazo: {
    name: 'Piperacillin-Tazobactam', route: 'IV',
    note: 'Extended infusion over 4h strongly preferred for MIC ≥16 mg/L or severe infection.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 40)      { d = '4.5 g';  iv = 'q8h';  n = 'Infuse over 4h (extended infusion). Maximises time above MIC.'; }
      else if (crcl >= 20) { d = '3.375 g'; iv = 'q8h'; n = 'Moderate impairment — reduce to 3.375 g dose.'; }
      else                 { d = '2.25 g';  iv = 'q8h'; n = 'ESRD. Supplement 0.75 g after haemodialysis sessions.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  meropenem: {
    name: 'Meropenem', route: 'IV',
    note: 'Extended infusion (3h) recommended for severe infections or organisms with MIC ≥1 mg/L. For CNS/VAP use 2 g dose.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 50)      { d = '1 g';    iv = 'q8h';  n = 'Standard. CNS/Pseudomonas/VAP: 2 g q8h, infuse over 3h.'; }
      else if (crcl >= 25) { d = '1 g';    iv = 'q12h'; n = 'Moderate impairment.'; }
      else if (crcl >= 10) { d = '500 mg'; iv = 'q12h'; n = 'Severe impairment.'; }
      else                 { d = '500 mg'; iv = 'q24h'; n = 'ESRD — supplement after HD.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  cefepime: {
    name: 'Cefepime', route: 'IV',
    note: '⚠️ Neurotoxicity (encephalopathy, myoclonus) with renal impairment — dose adjust carefully.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 60)      { d = '2 g'; iv = 'q8h';  n = 'Standard. Febrile neutropenia / VAP: 2 g q8h.'; }
      else if (crcl >= 30) { d = '2 g'; iv = 'q12h'; n = 'Moderate impairment.'; }
      else if (crcl >= 11) { d = '2 g'; iv = 'q24h'; n = 'Severe impairment. Watch for neurotoxicity.'; }
      else                 { d = '1 g'; iv = 'q24h'; n = 'ESRD. Supplement after HD. High neurotoxicity risk.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  ceftazidime: {
    name: 'Ceftazidime', route: 'IV',
    note: 'Active against Pseudomonas. No MRSA coverage. Consider ceftazidime-avibactam for KPC producers.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 50)      { d = '2 g'; iv = 'q8h';  n = 'Standard.'; }
      else if (crcl >= 31) { d = '2 g'; iv = 'q12h'; n = 'Moderate impairment.'; }
      else if (crcl >= 16) { d = '2 g'; iv = 'q24h'; n = 'Moderate–severe impairment.'; }
      else if (crcl >= 6)  { d = '1 g'; iv = 'q24h'; n = 'Severe impairment.'; }
      else                 { d = '500 mg'; iv = 'q24h (post-HD)'; n = 'ESRD — dose after dialysis.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  cefazolin: {
    name: 'Cefazolin', route: 'IV',
    note: 'Preferred agent for MSSA bacteremia (superior outcomes vs vancomycin). Surgical prophylaxis standard.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 55)      { d = '2 g'; iv = 'q8h';  n = 'Standard. Surgical prophylaxis: 2 g × 1 dose. MSSA bacteremia: 2 g q8h × 14–42 days.'; }
      else if (crcl >= 35) { d = '2 g'; iv = 'q12h'; n = 'Moderate impairment.'; }
      else if (crcl >= 11) { d = '2 g'; iv = 'q24h'; n = 'Severe impairment.'; }
      else                 { d = '1 g'; iv = 'q48h'; n = 'ESRD — supplement 500 mg after HD.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  ampSulbactam: {
    name: 'Ampicillin-Sulbactam', route: 'IV',
    note: 'Activity against XDR Acinetobacter via sulbactam component (intrinsic activity). Use high-dose sulbactam 9–18 g/day for MDR Acinetobacter.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 30)      { d = '3 g (2 g amp + 1 g sulb)'; iv = 'q6h'; n = 'Standard. For XDR Acinetobacter: 3 g q4h (off-label). Always combined with another agent.'; }
      else if (crcl >= 15) { d = '3 g'; iv = 'q12h'; n = 'Moderate–severe impairment. Reduce frequency.'; }
      else                 { d = '3 g'; iv = 'q24h'; n = 'ESRD — dose after HD.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  gentamicin: {
    name: 'Gentamicin', route: 'IV',
    note: 'Extended-interval (once-daily) preferred. Target peak 5–10 mg/L, trough <1 mg/L at 18–24h. Avoid in CKD if possible.',
    calc: (wt, crcl) => {
      const lo = (wt * 5).toFixed(0), hi = (wt * 7).toFixed(0);
      let iv, n;
      if (crcl >= 60)      { iv = 'q24h';             n = 'Once-daily. Use Hartford nomogram for interval adjustment.'; }
      else if (crcl >= 40) { iv = 'q36h';             n = 'Extend interval. Check nomogram. Monitor renal function daily.'; }
      else if (crcl >= 20) { iv = 'q48h';             n = 'Significant toxicity risk. Consider alternative.'; }
      else                 { iv = 'avoid / post-HD';  n = 'ESRD — avoid if possible. If essential: level-guided post-HD dosing.'; }
      return { dose: `${lo}–${hi} mg (5–7 mg/kg)`, interval: iv, note: n };
    }
  },
  amikacin: {
    name: 'Amikacin', route: 'IV',
    note: 'Reserve for MDR organisms. Target peak 20–35 mg/L, trough <5 mg/L. Ototoxicity/nephrotoxicity risk.',
    calc: (wt, crcl) => {
      const dose = (wt * 15).toFixed(0);
      let iv, n;
      if (crcl >= 60)      { iv = 'q24h';            n = 'Once-daily. ID consult recommended for MDR use.'; }
      else if (crcl >= 40) { iv = 'q36h';            n = 'Reduce interval. Monitor levels closely.'; }
      else if (crcl >= 20) { iv = 'q48h';            n = 'Significant toxicity risk.'; }
      else                 { iv = 'avoid / post-HD'; n = 'ESRD — avoid if possible. Level-guided post-HD dosing only.'; }
      return { dose: `${dose} mg (15 mg/kg)`, interval: iv, note: n };
    }
  },
  levofloxacin: {
    name: 'Levofloxacin', route: 'IV / PO',
    note: 'High oral bioavailability (IV = PO). QTc prolongation risk. Tendinopathy. Avoid monotherapy for severe Pseudomonas.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 50)      { d = '750 mg';            iv = 'q24h'; n = 'Standard. For UTI: 500 mg q24h × 5–7d.'; }
      else if (crcl >= 20) { d = '750 mg load, then 500 mg'; iv = 'q24h'; n = 'Reduce maintenance dose.'; }
      else                 { d = '750 mg load, then 250 mg'; iv = 'q24h'; n = 'Severe/ESRD. HD: supplement 500 mg after each session.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  ciprofloxacin: {
    name: 'Ciprofloxacin', route: 'IV / PO',
    note: '⚠️ Taiwan GNR FQ resistance ~20–30% — confirm susceptibility. Avoid monotherapy for serious Pseudomonas infections.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 30)      { d = '400 mg IV / 500 mg PO'; iv = 'q12h'; n = 'Standard. Pseudomonas: 400 mg IV q8h or 750 mg PO q12h.'; }
      else                 { d = '400 mg IV / 500 mg PO'; iv = 'q18–24h'; n = 'Renal impairment — extend interval. HD: 250–500 mg after dialysis.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  tmpSmx: {
    name: 'TMP-SMX (Bactrim)', route: 'IV / PO',
    note: 'Dose expressed as TMP component. Watch for hyperkalaemia, bone marrow suppression. Check G6PD status.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 30)      { d = `${(wt * 5).toFixed(0)} mg TMP q6–8h IV / 1 DS tab PO BID`; iv = 'q6–8h IV or BID PO'; n = 'PCP treatment: 15–20 mg/kg/day TMP divided q6–8h. UTI: 1 DS BID × 3d.'; }
      else if (crcl >= 15) { d = '50% dose reduction'; iv = 'see note'; n = 'Use with caution. Monitor K⁺ and SCr closely.'; }
      else                 { d = 'AVOID'; iv = '—'; n = '🚫 Contraindicated if CrCl <15. For PCP: use atovaquone or pentamidine.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  metronidazole: {
    name: 'Metronidazole', route: 'IV / PO',
    note: 'No renal dose adjustment needed. Reduce dose in severe hepatic impairment. Watch for peripheral neuropathy with prolonged use.',
    calc: (wt, crcl) => {
      return { dose: '500 mg', interval: 'q8h IV/PO', note: 'No renal adjustment required. Hepatic failure: 50% dose reduction.' };
    }
  },
  nitrofurantoin: {
    name: 'Nitrofurantoin', route: 'PO',
    note: 'For uncomplicated lower UTI only — does not achieve therapeutic levels in tissue/blood. Pulmonary toxicity risk with long-term use.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 45)      { d = '100 mg (modified-release)'; iv = 'q12h × 5d'; n = 'Standard for uncomplicated UTI. Macrocrystalline 50–100 mg QID if MR unavailable.'; }
      else if (crcl >= 30) { d = '50 mg'; iv = 'QID × 7d'; n = 'Use with caution — reduced efficacy and increased toxicity below CrCl 45.'; }
      else                 { d = 'AVOID'; iv = '—'; n = '🚫 Contraindicated if CrCl <30. Use alternative (fosfomycin, trimethoprim, cephalexin).'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  fluconazole: {
    name: 'Fluconazole', route: 'IV / PO',
    note: '⚠️ C. tropicalis and C. glabrata common in Taiwan — check susceptibilities. Echinocandin preferred empirically for candidemia.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 50)      { d = '400 mg (loading dose 800 mg)'; iv = 'q24h'; n = 'IV and PO bioequivalent. Cryptococcal consolidation: 400 mg q24h × 8 weeks.'; }
      else                 { d = '200 mg (loading dose 400 mg)'; iv = 'q24h'; n = 'Halve maintenance dose. HD: full dose after each session.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  micafungin: {
    name: 'Micafungin', route: 'IV',
    note: 'No renal dose adjustment. Drug of choice for candidemia in Taiwan given azole-resistant species prevalence.',
    calc: (wt, crcl) => {
      return { dose: '100 mg (treatment) / 50 mg (prophylaxis)', interval: 'q24h', note: 'No dose adjustment needed. Esophageal candidiasis: 150 mg q24h.' };
    }
  },
  acyclovir: {
    name: 'Acyclovir (IV)', route: 'IV',
    note: 'Crystalline nephropathy risk — hydrate aggressively (1 L pre-infusion + 500 mL q8h). Infuse over 1 hour.',
    calc: (wt, crcl) => {
      const dose = `${(wt * 10).toFixed(0)} mg (10 mg/kg)`;
      let iv, n;
      if (crcl >= 50)      { iv = 'q8h';  n = 'HSV encephalitis dose. VZV: 10–15 mg/kg q8h. Maintain IV hydration.'; }
      else if (crcl >= 25) { iv = 'q12h'; n = 'Moderate impairment. Maintain hydration.'; }
      else if (crcl >= 10) { iv = 'q24h'; n = 'Severe impairment.'; }
      else                 { iv = 'q48h'; n = 'ESRD — dose after haemodialysis.'; }
      return { dose, interval: iv, note: n };
    }
  },
  ganciclovir: {
    name: 'Ganciclovir (IV)', route: 'IV',
    note: 'Requires dose adjustment for CrCl <70. Monitor for neutropenia and thrombocytopenia (hold if ANC <500). Valganciclovir PO is preferred for induction if able to tolerate oral.',
    calc: (wt, crcl) => {
      let d, iv, n;
      // Induction dose 5mg/kg, maintenance 5mg/kg q24h
      if (crcl >= 70)      { d = `${(wt*5).toFixed(0)} mg (5 mg/kg)`;  iv = 'q12h (induction)'; n = 'Maintenance: 5 mg/kg q24h. Monitor CBC twice weekly.'; }
      else if (crcl >= 50) { d = `${(wt*2.5).toFixed(0)} mg (2.5 mg/kg)`;  iv = 'q12h';  n = 'Reduce dose.'; }
      else if (crcl >= 25) { d = `${(wt*2.5).toFixed(0)} mg (2.5 mg/kg)`;  iv = 'q24h';  n = 'Further interval extension.'; }
      else if (crcl >= 10) { d = `${(wt*1.25).toFixed(0)} mg (1.25 mg/kg)`; iv = 'q24h'; n = 'Severe impairment.'; }
      else                 { d = `${(wt*1.25).toFixed(0)} mg (1.25 mg/kg)`; iv = '3× weekly post-HD'; n = 'ESRD — dose after HD sessions only.'; }
      return { dose: d, interval: iv, note: n };
    }
  },
  enoxaparin: {
    name: 'Enoxaparin (Lovenox)', route: 'SC',
    note: 'Anti-Xa monitoring recommended if CrCl <30, BMI >40, or pregnancy. Target anti-Xa: 0.5–1.0 IU/mL (treatment) or 0.2–0.4 IU/mL (prophylaxis).',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 30) {
        d = `Tx: ${wt.toFixed(0)} mg q12h (1 mg/kg) | Prophylaxis: 40 mg q24h`;
        iv = 'SC'; n = 'Standard. Obesity (BMI>40): increase dose by 25%. Max 100 mg per treatment dose.';
      } else {
        d = `Tx: ${wt.toFixed(0)} mg q24h (1 mg/kg) | Prophylaxis: 20 mg q24h`;
        iv = 'SC'; n = '⚠️ CrCl <30 — extend treatment to q24h; prophylaxis 20 mg q24h. Monitor anti-Xa levels.';
      }
      return { dose: d, interval: iv, note: n };
    }
  },
  metformin: {
    name: 'Metformin', route: 'PO',
    note: 'Lactic acidosis risk with renal impairment. Hold 48h before/after IV contrast and reassess renal function before restarting.',
    calc: (wt, crcl) => {
      let d, iv, n;
      if (crcl >= 60)      { d = '500–1000 mg with meals'; iv = 'BID–TID'; n = 'Standard. Maximum 2550 mg/day.'; }
      else if (crcl >= 45) { d = '500–1000 mg';            iv = 'BID';     n = 'Reduced dose. Review renal function q3–6 months.'; }
      else if (crcl >= 30) { d = '500 mg';                 iv = 'BID';     n = '⚠️ Increased lactic acidosis risk. Close monitoring required. Avoid in acute illness or contrast procedures.'; }
      else                 { d = 'CONTRAINDICATED';        iv = '—';       n = '🚫 Stop if CrCl <30. Switch to DPP-4 inhibitor (dose-adjusted) or insulin.'; }
      return { dose: d, interval: iv, note: n };
    }
  }
};

function calcDosing() {
  const drugKey = document.getElementById('dosing-drug').value;
  const wt = parseFloat(document.getElementById('dosing-wt').value);
  const crcl = parseFloat(document.getElementById('dosing-crcl').value);
  const el = document.getElementById('dosing-result');

  if (!drugKey) { el.textContent = '—'; el.className = 'calc-result'; return; }
  if (!wt || wt <= 0) { el.textContent = 'Enter patient weight'; el.className = 'calc-result warn'; return; }
  if (isNaN(crcl) || crcl < 0) { el.textContent = 'Enter CrCl / eGFR'; el.className = 'calc-result warn'; return; }

  const drug = DRUG_DOSING[drugKey];
  if (!drug) { el.textContent = 'Drug not found'; el.className = 'calc-result'; return; }

  const result = drug.calc(wt, crcl);
  let cls = 'success';
  if (result.dose === 'AVOID' || result.dose === 'CONTRAINDICATED') cls = 'danger';
  else if (crcl < 30) cls = 'warn';

  el.innerHTML = `<strong>${drug.name}</strong> [${drug.route}]<br>
    <span style="font-size:0.85em;">Dose: <strong>${result.dose}</strong> &nbsp;|&nbsp; Interval: <strong>${result.interval}</strong></span><br>
    <span style="font-size:0.75em;color:var(--text-dim);margin-top:0.25rem;display:block;">${drug.note}</span>
    <span style="font-size:0.75em;margin-top:0.25rem;display:block;">${result.note}</span>`;
  el.className = `calc-result ${cls}`;
}

function clearDosingCalc() {
  document.getElementById('dosing-drug').value = '';
  document.getElementById('dosing-wt').value = '';
  document.getElementById('dosing-crcl').value = '';
  const el = document.getElementById('dosing-result');
  el.textContent = '—'; el.className = 'calc-result';
}

function pullGFRIntoDosingCalc() {
  // Try egfr-result text first: "eGFR: 45 mL/min/1.73m²  ·  Stage 3a CKD"
  const egfrEl = document.getElementById('egfr-result');
  const crclEl = document.getElementById('crcl-result');
  let val = null;
  if (egfrEl && egfrEl.textContent !== '—') {
    const m = egfrEl.textContent.match(/([\d.]+)\s*mL/);
    if (m) val = parseFloat(m[1]);
  }
  if (!val && crclEl && crclEl.textContent !== '—') {
    const m = crclEl.textContent.match(/([\d.]+)\s*mL/);
    if (m) val = parseFloat(m[1]);
  }
  if (val) {
    document.getElementById('dosing-crcl').value = val;
    calcDosing();
    const btn = document.querySelector('[onclick="pullGFRIntoDosingCalc()"]');
    if (btn) { btn.textContent = `✓ Pulled ${val} mL/min`; setTimeout(() => { btn.textContent = '↺ Use current eGFR'; }, 2000); }
  } else {
    const btn = document.querySelector('[onclick="pullGFRIntoDosingCalc()"]');
    if (btn) { btn.textContent = 'No eGFR calculated yet'; setTimeout(() => { btn.textContent = '↺ Use current eGFR'; }, 2000); }
  }
}
