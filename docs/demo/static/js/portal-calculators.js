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

function calcABG() {
  const ph = parseFloat(document.getElementById('abg-ph').value);
  const paco2 = parseFloat(document.getElementById('abg-paco2').value);
  const hco3 = parseFloat(document.getElementById('abg-hco3').value);
  const na = parseFloat(document.getElementById('abg-na').value);
  const cl = parseFloat(document.getElementById('abg-cl').value);
  const alb = parseFloat(document.getElementById('abg-alb').value) || 4.0;
  const el = document.getElementById('abg-result');
  if (!ph || !paco2 || !hco3) { el.textContent = '—'; el.className = 'calc-result rich'; return; }

  const acidemia = ph < 7.35;
  const alkalemia = ph > 7.45;
  const nearNormal = !acidemia && !alkalemia;
  let primary = 'Mixed/near-normal acid-base pattern';
  let compensation = 'No single primary disorder is obvious; inspect PaCO2 and HCO3 direction for a compensated or mixed disorder.';
  let compensationTone = 'caution';
  const nextChecks = [];
  if (acidemia) {
    if (hco3 < 22) {
      primary = 'Primary metabolic acidosis';
      const expected = 1.5 * hco3 + 8;
      const low = expected - 2;
      const high = expected + 2;
      if (paco2 > high) {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} by Winter formula; observed ${paco2}, suggesting concurrent respiratory acidosis.`;
        compensationTone = 'danger';
        nextChecks.push('assess ventilation, fatigue, CNS/airway disease, sedatives, or COPD overlap');
      } else if (paco2 < low) {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} by Winter formula; observed ${paco2}, suggesting concurrent respiratory alkalosis.`;
        compensationTone = 'danger';
        nextChecks.push('look for sepsis, pain/anxiety, hypoxemia, liver disease, pregnancy, salicylates, or PE');
      } else {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} by Winter formula; observed ${paco2}, appropriate respiratory compensation.`;
        compensationTone = 'ok';
      }
    } else {
      primary = 'Primary respiratory acidosis';
      const delta = paco2 - 40;
      const acute = 24 + delta / 10;
      const chronic = 24 + 3.5 * delta / 10;
      compensation = `Expected HCO3 acute ~${Math.round(acute * 10) / 10}, chronic ~${Math.round(chronic * 10) / 10}; observed ${hco3}.`;
      if (hco3 < acute - 2) {
        compensation += ' Lower than expected: concurrent metabolic acidosis or early/uncompensated process.';
        compensationTone = 'danger';
      } else if (hco3 > chronic + 3) {
        compensation += ' Higher than expected: concurrent metabolic alkalosis or chronic CO2 retention with additional alkali.';
        compensationTone = 'caution';
      } else {
        compensationTone = 'ok';
      }
      nextChecks.push('assess airway/ventilation, opioids/sedatives, neuromuscular weakness, COPD/asthma, and oxygenation');
    }
  } else if (alkalemia) {
    if (hco3 > 26) {
      primary = 'Primary metabolic alkalosis';
      const expected = 40 + 0.7 * (hco3 - 24);
      const low = expected - 5;
      const high = Math.min(expected + 5, 55);
      if (paco2 > high) {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} for metabolic alkalosis; observed ${paco2}, suggesting concurrent respiratory acidosis.`;
        compensationTone = 'danger';
      } else if (paco2 < low) {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} for metabolic alkalosis; observed ${paco2}, suggesting concurrent respiratory alkalosis.`;
        compensationTone = 'danger';
      } else {
        compensation = `Expected PaCO2 ${Math.round(low)}-${Math.round(high)} for metabolic alkalosis; observed ${paco2}, appropriate compensation.`;
        compensationTone = 'ok';
      }
      nextChecks.push('review vomiting/NG suction, diuretics, volume/chloride depletion, mineralocorticoid excess, and K/Mg');
    } else {
      primary = 'Primary respiratory alkalosis';
      const delta = 40 - paco2;
      const acute = 24 - 2 * delta / 10;
      const chronic = 24 - 5 * delta / 10;
      compensation = `Expected HCO3 acute ~${Math.round(acute * 10) / 10}, chronic ~${Math.round(chronic * 10) / 10}; observed ${hco3}.`;
      if (hco3 > acute + 2) {
        compensation += ' Higher than expected: concurrent metabolic alkalosis or early/uncompensated process.';
        compensationTone = 'caution';
      } else if (hco3 < chronic - 3) {
        compensation += ' Lower than expected: concurrent metabolic acidosis.';
        compensationTone = 'danger';
      } else {
        compensationTone = 'ok';
      }
      nextChecks.push('look for hypoxemia, pain/anxiety, sepsis, pregnancy, liver disease, PE, or salicylates');
    }
  } else if (nearNormal) {
    if (hco3 < 22 && paco2 < 35) {
      primary = 'Near-normal pH with metabolic acidosis + respiratory alkalosis pattern';
      compensation = 'Both HCO3 and PaCO2 are low; this may be mixed rather than simply compensated.';
      compensationTone = 'danger';
      nextChecks.push('consider sepsis, salicylates, liver disease, pregnancy, or mixed shock physiology');
    } else if (hco3 > 26 && paco2 > 45) {
      primary = 'Near-normal pH with metabolic alkalosis + respiratory acidosis pattern';
      compensation = 'Both HCO3 and PaCO2 are high; consider chronic CO2 retention plus alkalosis, or compensated respiratory acidosis.';
      compensationTone = 'caution';
      nextChecks.push('review chronic hypercapnia, diuretics, vomiting/NG suction, chloride depletion, and volume status');
    } else if (hco3 < 22) {
      primary = 'Compensated metabolic acidosis or mixed near-normal pattern';
    } else if (hco3 > 26) {
      primary = 'Compensated metabolic alkalosis or mixed near-normal pattern';
    } else if (paco2 > 45) {
      primary = 'Compensated respiratory acidosis or mixed near-normal pattern';
    } else if (paco2 < 35) {
      primary = 'Compensated respiratory alkalosis or mixed near-normal pattern';
    }
  }

  let agText = 'Enter Na, Cl, and HCO3 to calculate anion gap.';
  let deltaText = '';
  let agTone = 'note';
  if (na && cl && hco3) {
    const ag = na - cl - hco3;
    const corrAg = ag + 2.5 * (4 - alb);
    agTone = corrAg > 12 ? 'caution' : 'ok';
    agText = `AG ${Math.round(ag * 10) / 10}, albumin-corrected ${Math.round(corrAg * 10) / 10} (Alb ${alb}).`;
    if (corrAg > 12) {
      nextChecks.push('high AG: consider lactate, ketones, renal failure/uremia, toxins, salicylate, medication causes');
    }
    if (hco3 < 24 && corrAg > 12) {
      const deltaRatio = (corrAg - 12) / (24 - hco3);
      const roundedDelta = Math.round(deltaRatio * 100) / 100;
      if (deltaRatio < 0.4) {
        deltaText = `Delta ratio ${roundedDelta}: predominant normal-gap metabolic acidosis pattern.`;
      } else if (deltaRatio < 1) {
        deltaText = `Delta ratio ${roundedDelta}: mixed high-gap + normal-gap metabolic acidosis pattern.`;
      } else if (deltaRatio <= 2) {
        deltaText = `Delta ratio ${roundedDelta}: high anion gap metabolic acidosis pattern.`;
      } else {
        deltaText = `Delta ratio ${roundedDelta}: high-gap acidosis plus metabolic alkalosis or chronic elevated bicarbonate pattern.`;
      }
    } else if (hco3 < 22 && corrAg <= 12) {
      deltaText = 'Normal anion gap metabolic acidosis pattern: review diarrhea, RTA, saline load, ureteral diversion, acetazolamide.';
      nextChecks.push('normal-gap acidosis: check diarrhea, renal tubular acidosis, saline load, acetazolamide, urinary diversion');
    }
  }

  if (ph < 7.2 || ph > 7.55) nextChecks.push('severe pH derangement: reassess clinically and escalate if unstable');
  if (!nextChecks.length) nextChecks.push('correlate with clinical context and repeat if values do not fit the patient');

  let cls = 'warn';
  if (compensationTone === 'danger' || ph < 7.2 || ph > 7.55) cls = 'danger';
  else if (compensationTone === 'ok' && agTone === 'ok' && ph >= 7.35 && ph <= 7.45 && hco3 >= 22 && hco3 <= 26 && paco2 >= 35 && paco2 <= 45) cls = 'success';

  el.innerHTML =
    '<div class="acidbase-result-main">' +
      `<div class="acidbase-chip"><strong>Primary</strong>${primary}. pH ${ph}, PaCO2 ${paco2}, HCO3 ${hco3}.</div>` +
      `<div class="acidbase-chip"><strong>Compensation</strong>${compensation}</div>` +
      `<div class="acidbase-chip"><strong>Anion gap</strong>${agText}${deltaText ? ' ' + deltaText : ''}</div>` +
    '</div>' +
    '<div class="acidbase-guide">' +
      '<strong>Next checks:</strong>' +
      `<ul>${Array.from(new Set(nextChecks)).map((item) => `<li>${item}</li>`).join('')}</ul>` +
    '</div>';
  el.className = `calc-result rich ${cls}`;
}

function calcNaFreeWater() {
  const na = parseFloat(document.getElementById('nafree-na').value);
  const glucose = parseFloat(document.getElementById('nafree-glu').value);
  const wt = parseFloat(document.getElementById('nafree-wt').value);
  const sex = document.getElementById('nafree-sex').value;
  const target = parseFloat(document.getElementById('nafree-target').value) || 145;
  const el = document.getElementById('nafree-result');
  if (!na) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const corrected = glucose && glucose > 100 ? na + 1.6 * ((glucose - 100) / 100) : na;
  const tbwFactor = sex === 'F' ? 0.5 : 0.6;
  let deficitText = '';
  if (wt && corrected > target) {
    const deficit = tbwFactor * wt * ((corrected / target) - 1);
    deficitText = ` Free water deficit to Na ${target}: ${Math.max(0, Math.round(deficit * 10) / 10)} L.`;
  }
  const cls = corrected >= 160 || corrected < 125 ? 'danger' : corrected >= 150 || corrected < 130 ? 'warn' : 'success';
  el.textContent = `Corrected Na: ${Math.round(corrected * 10) / 10} mEq/L.${deficitText} Use rate limits and ongoing losses clinically.`;
  el.className = `calc-result ${cls}`;
}

function calcHyponatremia() {
  const na = parseFloat(document.getElementById('hypona-na').value);
  const glucose = parseFloat(document.getElementById('hypona-glu').value);
  const serumOsm = parseFloat(document.getElementById('hypona-serum-osm').value);
  const urineOsm = parseFloat(document.getElementById('hypona-urine-osm').value);
  const urineNa = parseFloat(document.getElementById('hypona-urine-na').value);
  const volume = document.getElementById('hypona-volume').value;
  const chronicity = document.getElementById('hypona-chronicity').value;
  const symptoms = document.getElementById('hypona-symptoms').value;
  const odsRisk = document.getElementById('hypona-ods-risk').value;
  const el = document.getElementById('hypona-result');
  if (!na || na <= 0) { el.textContent = '—'; el.className = 'calc-result rich'; return; }

  const glucoseCorrection = glucose && glucose > 100 ? 1.6 * ((glucose - 100) / 100) : 0;
  const correctedNa = na + glucoseCorrection;
  const effectiveOsm = 2 * na + ((glucose || 0) / 18);
  const osmForTone = serumOsm || effectiveOsm;
  const osmSource = serumOsm ? 'measured serum osm' : 'effective osm estimate';
  const roundedNa = Math.round(correctedNa * 10) / 10;
  const roundedEffOsm = Math.round(effectiveOsm);

  let tonicity = 'Hypotonic hyponatremia likely';
  let toneDetail = `${osmSource} ${Math.round(osmForTone)} mOsm/kg`;
  if (osmForTone >= 295) {
    tonicity = 'Hypertonic / translocational pattern';
    toneDetail += ' — glucose or other effective osmoles can lower measured Na';
  } else if (osmForTone >= 275) {
    tonicity = 'Isotonic or non-hypotonic pattern';
    toneDetail += ' — consider pseudohyponatremia or non-hypotonic causes';
  }

  let urineOsmText = 'Urine osm not entered';
  if (urineOsm || urineOsm === 0) {
    urineOsmText = urineOsm < 100
      ? `Uosm ${urineOsm}: ADH suppressed; think primary polydipsia, low solute intake, or reset after water load`
      : `Uosm ${urineOsm}: ADH active; interpret with volume status and urine sodium`;
  }

  let urineNaText = 'Urine Na not entered';
  if (urineNa || urineNa === 0) {
    urineNaText = urineNa < 30
      ? `UNa ${urineNa}: sodium avidity / low effective arterial volume pattern`
      : `UNa ${urineNa}: renal sodium loss, SIADH-like, endocrine, renal failure, or diuretic pattern`;
  }

  let likely = 'Pattern incomplete: start with serum osm, urine osm, urine Na, volume exam, medication review.';
  if (osmForTone >= 295) {
    likely = 'Likely non-hypotonic/translocational hyponatremia; treat the effective osmole problem rather than chasing Na alone.';
  } else if (osmForTone >= 275) {
    likely = 'Non-hypotonic or pseudohyponatremia pattern; verify measured serum osm and consider lipids/protein or lab artifact.';
  } else if ((urineOsm || urineOsm === 0) && urineOsm < 100) {
    likely = 'Dilute urine pattern: excess water intake, low solute intake, or beer/tea-toast physiology is more likely than persistent SIADH.';
  } else if (volume === 'hypovolemic') {
    likely = (urineNa || urineNa === 0) && urineNa >= 30
      ? 'Hypovolemic with higher urine Na: consider diuretics, mineralocorticoid deficiency, salt wasting, or renal losses.'
      : 'Hypovolemic pattern: GI/skin/third-space losses are common; monitor closely for rapid auto-correction after volume is restored.';
  } else if (volume === 'euvolemic') {
    likely = (urineNa || urineNa === 0) && urineNa >= 30
      ? 'Euvolemic hypotonic pattern with concentrated urine: SIADH-like physiology; also check TSH, morning cortisol, meds, pain/nausea, pulmonary/CNS triggers.'
      : 'Euvolemic pattern with low urine sodium is less classic; re-check volume status, solute intake, and urine studies.';
  } else if (volume === 'hypervolemic') {
    likely = (urineNa || urineNa === 0) && urineNa < 30
      ? 'Hypervolemic low-effective-volume pattern: HF, cirrhosis, nephrotic syndrome, or advanced renal disease context.'
      : 'Hypervolemic pattern with higher urine Na: consider renal failure, diuretics, or mixed physiology.';
  } else if ((urineOsm || urineOsm === 0) && urineOsm >= 100 && (urineNa || urineNa === 0) && urineNa >= 30) {
    likely = 'Concentrated urine + UNa >=30: SIADH-like, endocrine, renal salt loss, renal failure, or diuretic-associated pattern.';
  } else if ((urineOsm || urineOsm === 0) && urineOsm >= 100 && (urineNa || urineNa === 0) && urineNa < 30) {
    likely = 'Concentrated urine + UNa <30: low effective arterial volume pattern; decide hypovolemic vs hypervolemic clinically.';
  }

  const target = odsRisk === 'high' ? '4-6 mmol/L in 24 h' : '4-8 mmol/L in 24 h';
  const limit = odsRisk === 'high' ? 'do not exceed 8 mmol/L in 24 h' : 'avoid >10 mmol/L in 24 h; many use 8 as a conservative ward target';
  const correctionText = `${odsRisk === 'high' ? 'High ODS risk' : 'Standard risk'}: target rise ${target}; ${limit}.`;

  const nextChecks = [];
  if (!serumOsm) nextChecks.push('measure serum osm to confirm hypotonicity');
  if (!(urineOsm || urineOsm === 0)) nextChecks.push('send urine osm');
  if (!(urineNa || urineNa === 0)) nextChecks.push('send urine sodium');
  if (osmForTone < 275 && volume === 'unknown') nextChecks.push('document volume status');
  if (osmForTone < 275 && ((urineOsm || 0) >= 100 || !(urineOsm || urineOsm === 0))) nextChecks.push('review thiazides/SSRIs/antiepileptics, TSH, and morning cortisol');
  if (symptoms === 'severe') nextChecks.push('severe symptoms: urgent hypertonic saline protocol / expert escalation');
  if (chronicity !== 'acute') nextChecks.push('trend Na and urine output during active correction');

  let cls = 'success';
  if (symptoms === 'severe' || correctedNa < 120) cls = 'danger';
  else if (correctedNa < 130 || symptoms === 'moderate') cls = 'warn';

  el.innerHTML =
    '<div class="hypona-result-main">' +
      `<div class="hypona-chip"><strong>Corrected Na</strong>${roundedNa} mEq/L${glucoseCorrection ? ` (glucose correction +${Math.round(glucoseCorrection * 10) / 10})` : ''}</div>` +
      `<div class="hypona-chip"><strong>Tonicity</strong>${tonicity}; ${toneDetail}; effective osm ${roundedEffOsm}</div>` +
      `<div class="hypona-chip"><strong>Urine</strong>${urineOsmText}. ${urineNaText}.</div>` +
      `<div class="hypona-chip"><strong>Correction guardrail</strong>${correctionText}</div>` +
    '</div>' +
    '<div class="hypona-guide">' +
      `<strong>Likely interpretation:</strong> ${likely}` +
      (nextChecks.length ? `<ul>${nextChecks.map((item) => `<li>${item}</li>`).join('')}</ul>` : '') +
    '</div>';
  el.className = `calc-result rich ${cls}`;
}

function calcDKAHHS() {
  const glucose = parseFloat(document.getElementById('dkahhs-glu').value);
  const na = parseFloat(document.getElementById('dkahhs-na').value);
  const k = parseFloat(document.getElementById('dkahhs-k').value);
  const ph = parseFloat(document.getElementById('dkahhs-ph').value);
  const hco3 = parseFloat(document.getElementById('dkahhs-hco3').value);
  const bhb = parseFloat(document.getElementById('dkahhs-bhb').value);
  const ag = parseFloat(document.getElementById('dkahhs-ag').value);
  const bun = parseFloat(document.getElementById('dkahhs-bun').value);
  const measuredOsm = parseFloat(document.getElementById('dkahhs-osm').value);
  const ketones = document.getElementById('dkahhs-ketones').value;
  const mental = document.getElementById('dkahhs-mental').value;
  const el = document.getElementById('dkahhs-result');
  if (!glucose) { el.textContent = '—'; el.className = 'calc-result rich'; return; }

  const has = (value) => value || value === 0;
  const round1 = (value) => Math.round(value * 10) / 10;
  const safe = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const correctedNa = has(na) ? na + (glucose > 100 ? 1.6 * ((glucose - 100) / 100) : 0) : null;
  const effectiveOsm = has(na) ? 2 * na + glucose / 18 : null;
  const estimatedTotalOsm = has(effectiveOsm) && has(bun) ? effectiveOsm + bun / 2.8 : null;
  const osmForHhs = Math.max(measuredOsm || 0, estimatedTotalOsm || 0, effectiveOsm || 0);

  const hyperglycemiaForDka = glucose >= 200;
  const euglycemicDkaConcern = glucose < 200 && ((bhb >= 3) || ketones === 'positive') && ((ph && ph < 7.3) || (hco3 && hco3 < 18));
  const ketosisConfirmed = (bhb >= 3) || ketones === 'positive';
  const ketosisAbsent = (bhb || bhb === 0) ? bhb < 3 : ketones === 'negative';
  const acidosis = (ph && ph < 7.3) || (hco3 && hco3 < 18);
  const dkaConfirmed = hyperglycemiaForDka && ketosisConfirmed && acidosis;
  const dkaPossible = hyperglycemiaForDka && acidosis && ketones === 'unknown' && !has(bhb);
  const hhsOsm = (measuredOsm && measuredOsm >= 320) || (estimatedTotalOsm && estimatedTotalOsm >= 320) || (effectiveOsm && effectiveOsm >= 300);
  const hhsCompatible = glucose >= 600 && hhsOsm && (!ph || ph >= 7.3) && (!hco3 || hco3 >= 15) && ketosisAbsent;
  const mixedOverlap = (dkaConfirmed || dkaPossible) && glucose >= 600 && hhsOsm;

  let pattern = 'No deterministic DKA/HHS pattern';
  if (mixedOverlap) pattern = 'Mixed DKA/HHS-compatible pattern';
  else if (dkaConfirmed) pattern = euglycemicDkaConcern ? 'Euglycemic DKA-compatible pattern' : 'DKA-compatible pattern';
  else if (dkaPossible) pattern = 'Possible DKA: acidosis present, confirm beta-hydroxybutyrate/ketones';
  else if (hhsCompatible) pattern = 'HHS-compatible pattern';
  else if (euglycemicDkaConcern) pattern = 'Euglycemic DKA-compatible pattern';
  else if (glucose >= 200 && !acidosis) pattern = 'Hyperglycemia without DKA-range acidosis';

  let severity = 'Severity incomplete';
  if (dkaConfirmed || dkaPossible || mixedOverlap) {
    severity = 'Mild/early DKA range';
    if ((ph && ph < 7.0) || (hco3 && hco3 < 10) || (bhb && bhb > 6) || mental === 'stupor') {
      severity = 'Severe DKA range';
    } else if ((ph && ph < 7.25) || (hco3 && hco3 < 15) || mental === 'drowsy') {
      severity = 'Moderate DKA range';
    }
  } else if (hhsCompatible) {
    severity = mental === 'alert' ? 'HHS physiology; mental status preserved' : 'HHS physiology with altered mentation';
  } else if (euglycemicDkaConcern) {
    severity = 'Euglycemic DKA concern: check SGLT2 inhibitor, starvation, pregnancy, alcohol, or insulin omission';
  }

  let potassiumText = 'K not entered: check before insulin and trend frequently.';
  if (has(k)) {
    if (k < 3.5) potassiumText = `Potassium <3.5 (${k}): replace K and delay insulin until K >3.5 per protocol.`;
    else if (k <= 5.2) potassiumText = `K ${k}: insulin usually requires ongoing K replacement and frequent checks.`;
    else potassiumText = `K ${k}: hold K initially, monitor closely as insulin/acidosis correction can drop K.`;
  }

  const nextChecks = [];
  if (!has(bhb) && ketones === 'unknown') nextChecks.push('send quantitative beta-hydroxybutyrate; urine ketones can lag during treatment');
  if (!has(ph)) nextChecks.push('check venous/arterial pH to stage acidosis');
  if (!has(na)) nextChecks.push('enter sodium to calculate corrected Na and effective osmolality');
  if (!has(bun) && !measuredOsm) nextChecks.push('enter BUN or measured osmolality to assess total hyperosmolality');
  if (dkaConfirmed || dkaPossible || mixedOverlap) nextChecks.push('DKA protocol: fluids, insulin, K/Mg/Phos monitoring, close anion gap/BHB follow-up');
  if (hhsCompatible || mixedOverlap) nextChecks.push('HHS protocol: gradual glucose/osmolality fall, volume status, urine output, neurologic monitoring');
  if (glucose >= 250) nextChecks.push('look for precipitant: infection, missed insulin, MI/stroke/PE, pancreatitis, steroids/SGLT2/ICI');
  if (k && k < 3.5) nextChecks.push('do not start insulin before potassium is corrected unless directed by local emergency protocol');
  if (glucose >= 600 && !hhsOsm) nextChecks.push('glucose is HHS-range; verify measured/total osmolality and hydration status');
  if (!nextChecks.length) nextChecks.push('correlate with clinical context and repeat labs if the pattern does not fit the patient');

  const osmText = has(na)
    ? `Effective osm ${round1(effectiveOsm)}${has(estimatedTotalOsm) ? `, estimated total osm ${round1(estimatedTotalOsm)}` : ''}${measuredOsm ? `, measured osm ${measuredOsm}` : ''}; corrected Na ${round1(correctedNa)}.`
    : `Na missing; measured osm ${measuredOsm || 'not entered'}.`;
  const ketoneText = has(bhb)
    ? `BHB ${bhb} mmol/L${bhb >= 3 ? ' meets DKA ketone criterion' : ' below DKA ketone criterion'}; qualitative ketones ${ketones}.`
    : `BHB not entered; qualitative ketones ${ketones}.`;

  let cls = 'success';
  if (dkaConfirmed || dkaPossible || hhsCompatible || mixedOverlap || (k && k < 3.5) || severity.startsWith('Severe')) cls = 'danger';
  else if (glucose >= 200 || euglycemicDkaConcern || !has(bhb) || !has(na)) cls = 'warn';

  el.innerHTML =
    '<div class="dkahhs-result-main">' +
      `<div class="dkahhs-chip"><strong>Pattern</strong>${safe(pattern)}</div>` +
      `<div class="dkahhs-chip"><strong>Severity</strong>${safe(severity)}</div>` +
      `<div class="dkahhs-chip"><strong>Osm / Na</strong>${safe(osmText)}</div>` +
      `<div class="dkahhs-chip"><strong>Ketones</strong>${safe(ketoneText)}</div>` +
      `<div class="dkahhs-chip"><strong>Potassium</strong>${safe(potassiumText)}</div>` +
    '</div>' +
    '<div class="dkahhs-guide">' +
      '<strong>Checklist:</strong>' +
      `<ul>${Array.from(new Set(nextChecks)).map((item) => `<li>${safe(item)}</li>`).join('')}</ul>` +
    '</div>';
  el.className = `calc-result rich ${cls}`;
}

function calcPaduaImprove() {
  const padua = (parseFloat(document.getElementById('padua-major').value) || 0) + (parseFloat(document.getElementById('padua-minor').value) || 0);
  const improve = (parseFloat(document.getElementById('improve-major').value) || 0) + (parseFloat(document.getElementById('improve-other').value) || 0);
  const el = document.getElementById('padua-result');
  const vteHigh = padua >= 4;
  const bleedHigh = improve >= 7;
  const cls = vteHigh && !bleedHigh ? 'warn' : bleedHigh ? 'danger' : 'success';
  el.textContent = `Padua ${padua} (${vteHigh ? 'high VTE risk' : 'lower VTE risk'}); IMPROVE bleeding ${improve} (${bleedHigh ? 'high bleeding risk' : 'not high'}). Review prophylaxis choice against contraindications.`;
  el.className = `calc-result ${cls}`;
}

function calcFEUrea() {
  const surea = parseFloat(document.getElementById('feurea-surea').value);
  const uurea = parseFloat(document.getElementById('feurea-uurea').value);
  const scr = parseFloat(document.getElementById('feurea-scr').value);
  const ucr = parseFloat(document.getElementById('feurea-ucr').value);
  const el = document.getElementById('feurea-result');
  if (!surea || !uurea || !scr || !ucr) { el.textContent = '—'; el.className = 'calc-result'; return; }
  const feurea = (uurea * scr) / (surea * ucr) * 100;
  const rounded = Math.round(feurea * 10) / 10;
  const cls = rounded < 35 ? 'warn' : 'info';
  el.textContent = `FEUrea: ${rounded}%${rounded < 35 ? ' (prerenal-compatible, useful with diuretic context)' : ' (less prerenal-compatible)'}.`;
  el.className = `calc-result ${cls}`;
}

function calcElectrolytes() {
  const k = parseFloat(document.getElementById('elytes-k').value);
  const mg = parseFloat(document.getElementById('elytes-mg').value);
  const phos = parseFloat(document.getElementById('elytes-phos').value);
  const egfr = parseFloat(document.getElementById('elytes-egfr').value);
  const el = document.getElementById('elytes-result');
  const notes = [];
  let cls = 'success';
  if (egfr && egfr < 30) notes.push('eGFR <30: use renal-adjusted replacement and repeat labs.');
  if (k || k === 0) {
    if (k < 3.0) { notes.push('K <3.0: severe hypokalemia review; check Mg and ECG context.'); cls = 'danger'; }
    else if (k < 3.5) { notes.push('K 3.0-3.4: mild/moderate replacement review.'); if (cls !== 'danger') cls = 'warn'; }
    else if (k >= 5.5) { notes.push('K >=5.5: hyperkalemia safety pathway, ECG/med review.'); cls = 'danger'; }
  }
  if (mg || mg === 0) {
    if (mg < 1.2) { notes.push('Mg <1.2: severe hypomagnesemia review.'); cls = 'danger'; }
    else if (mg < 1.8) { notes.push('Mg <1.8: replacement review, especially with low K/QT risk.'); if (cls !== 'danger') cls = 'warn'; }
  }
  if (phos || phos === 0) {
    if (phos < 1.0) { notes.push('Phos <1.0: severe hypophosphatemia review.'); cls = 'danger'; }
    else if (phos < 2.0) { notes.push('Phos <2.0: replacement/nutrition/refeeding review.'); if (cls !== 'danger') cls = 'warn'; }
  }
  if (!notes.length) { el.textContent = '—'; el.className = 'calc-result'; return; }
  el.textContent = notes.join(' ');
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

function ekgSelectText(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.options && el.selectedIndex >= 0) return el.options[el.selectedIndex].text.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return el.value || '';
}

function ekgValue(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}

function ekgEsc(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildEkgClueHtml() {
  const clueGroups = [
    {
      title: 'Rate / rhythm',
      items: [
        'Sinus: upright P in II before every QRS, constant PR.',
        'AF: irregularly irregular, no consistent P waves.',
        'Flutter: sawtooth atrial activity, often best in II, III, aVF, V1.',
        'Regular narrow tachycardia: look for hidden retrograde P waves.',
      ],
    },
    {
      title: 'Axis',
      items: [
        'Lead I positive + aVF positive: normal axis.',
        'Lead I positive + aVF negative: leftward; if lead II is also negative, LAD.',
        'LAD: consider LVH, LBBB, inferior MI, WPW, or LAFB pattern.',
        'Lead I negative + aVF positive: RAD; consider RV strain/RVH, PE/COPD, lateral MI, or LPFB.',
        'Lead I negative + aVF negative: extreme axis.',
      ],
    },
    {
      title: 'QRS / bundle blocks',
      items: [
        'QRS 110-119 ms suggests incomplete block or nonspecific IVCD; >= 120 ms is complete block range.',
        'RBBB: QRS >= 120 ms, rsR prime in V1-V2, wide terminal S in I/V6.',
        'LBBB: QRS >= 120 ms, broad/notched R in I/aVL/V5-V6, absent septal q in I/V5/V6.',
        'LBBB/paced rhythm: use modified Sgarbossa for ischemia, not standard STEMI criteria.',
        'Very wide QRS with peaked T waves: think hyperkalemia or sodium-channel blocker toxicity.',
      ],
    },
    {
      title: 'Intervals',
      items: [
        'PR > 200 ms: first-degree AV block pattern.',
        'Progressive PR then dropped QRS: Mobitz I; fixed PR dropped QRS: Mobitz II concern.',
        'Short PR + delta wave: WPW pattern; avoid AV nodal blockers in pre-excited AF.',
        'QT: measure from QRS onset to T-wave return to baseline; avoid including U waves.',
        'QTc > 500 ms: torsades risk; check K, Mg, Ca, bradycardia/high-grade AV block, and QT-prolonging meds.',
      ],
    },
    {
      title: 'Chamber / voltage',
      items: [
        'LVH: S in V1 + R in V5/V6 >= 35 mm, or Cornell voltage; look for lateral strain.',
        'RVH: dominant R in V1, deep S in I/V5/V6, and RAD support the pattern.',
        'Atrial abnormality: inspect P-wave width/notching for left atrial and tall peaked inferior P waves for right atrial.',
        'Low voltage: small QRS in limb and precordial leads; consider COPD, effusion, edema/body habitus, myxedema, infiltrative disease.',
      ],
    },
    {
      title: 'Q waves / R progression',
      items: [
        'Pathologic Q waves: wide or deep relative to R wave in contiguous leads; small septal q waves can be normal.',
        'Poor R-wave progression V1-V3: consider old anterior MI, LVH/RVH, COPD, LBBB/WPW, cardiomyopathy, pneumothorax, or lead placement.',
        'Dominant R in V1-V2: consider RVH, posterior MI, RBBB, WPW, HCM, or lead misplacement.',
        'Pseudoinfarct patterns can occur with LBBB, WPW, HCM, infiltrative disease, COPD, or pneumothorax.',
      ],
    },
    {
      title: 'ST-T / ischemia',
      items: [
        'STEMI: ST elevation in contiguous leads plus clinical context; look for reciprocal changes.',
        'Inferior: II, III, aVF. Lateral: I, aVL, V5-V6. Anterior/septal: V1-V4.',
        'Posterior: horizontal ST depression V1-V3, tall R waves; confirm with V7-V9.',
        'Pericarditis: diffuse concave ST elevation with PR depression; early repol often has stable J-point notching/slurring.',
        'Brugada: right precordial coved/downsloping ST elevation pattern; do not dismiss as simple RBBB.',
        'Wellens/de Winter/hyperacute T waves can be occlusion patterns without classic ST elevation.',
      ],
    },
    {
      title: 'T waves / electrolytes',
      items: [
        'Hyperkalemia: peaked T waves, PR prolongation, QRS widening, sine-wave in severe cases.',
        'Hypokalemia: ST depression, flat T waves, U waves, apparent long QU.',
        'Hypocalcemia lengthens QT; hypercalcemia shortens QT.',
        'Deep symmetric precordial T-wave inversion can be Wellens; diffuse deep T waves can be CNS/stress cardiomyopathy context.',
        'Hypomagnesemia can worsen QT prolongation and ventricular ectopy.',
      ],
    },
  ];
  return clueGroups.map((group) => `<div class="ekg-clue-card">
    <div class="ekg-clue-title">${ekgEsc(group.title)}</div>
    <ul>${group.items.map((item) => `<li>${ekgEsc(item)}</li>`).join('')}</ul>
  </div>`).join('');
}

function renderEkgClues() {
  const el = document.getElementById('ekg-clues');
  if (el) el.innerHTML = buildEkgClueHtml();
}

function toggleEkgGuideFocus(force) {
  const card = document.querySelector('.calc-card[data-calc="ekg"]');
  const btn = document.getElementById('ekg-focus-btn');
  if (!card) return;
  const next = typeof force === 'boolean' ? force : !card.classList.contains('ekg-focused');
  card.classList.toggle('ekg-focused', next);
  document.body.classList.toggle('ekg-guide-open', next);
  if (btn) btn.textContent = next ? 'Close' : 'Focus';
  if (next) {
    renderEkgClues();
    const first = document.getElementById('ekg-rate');
    if (first) first.focus();
  }
}

function buildEkgGuideSummary() {
  const rate = ekgValue('ekg-rate');
  const rhythm = ekgValue('ekg-rhythm');
  const pWaves = ekgValue('ekg-pwaves');
  const pr = ekgValue('ekg-pr');
  const axis = ekgValue('ekg-axis');
  const qrs = ekgValue('ekg-qrs');
  const widePattern = ekgValue('ekg-wide-pattern');
  const qtc = ekgValue('ekg-qtc');
  const chamber = ekgValue('ekg-chamber');
  const qProgression = ekgValue('ekg-q-progression');
  const st = ekgValue('ekg-st');
  const tWaves = ekgValue('ekg-twaves');
  const comparison = ekgValue('ekg-comparison');
  const notes = ekgValue('ekg-notes');

  const rhythmLabels = {
    sinus: 'sinus rhythm',
    sinus_tach: 'sinus tachycardia',
    sinus_brady: 'sinus bradycardia',
    af: 'atrial fibrillation',
    flutter: 'atrial flutter',
    svt: 'regular narrow-complex tachycardia / SVT pattern',
    paced: 'paced rhythm',
    uncertain: 'undetermined rhythm',
  };
  const axisLabels = {
    normal: 'normal axis',
    lad: 'left axis deviation',
    rad: 'right axis deviation',
    extreme: 'extreme axis',
    indeterminate: 'axis not determined',
  };
  const chamberLabels = {
    none: 'no chamber/voltage abnormality documented',
    laa: 'left atrial abnormality pattern',
    raa: 'right atrial abnormality pattern',
    lvh: 'left ventricular hypertrophy pattern',
    rvh: 'right ventricular hypertrophy pattern',
    bivh: 'possible biventricular hypertrophy pattern',
    low_voltage: 'low-voltage QRS pattern',
    unknown: 'chamber/voltage not assessed',
  };
  const qrsLabels = {
    narrow: 'narrow QRS',
    wide: 'wide QRS',
    paced: 'paced QRS',
    unknown: 'QRS width not documented',
  };
  const qProgressionLabels = {
    normal: 'no pathologic Q waves or R-wave progression concern documented',
    prwp: 'poor R-wave progression',
    path_q: 'pathologic Q-wave pattern',
    dominant_r_v1: 'dominant R wave in V1-V2',
    pseudoinfarct: 'possible pseudoinfarct pattern',
    unknown: 'Q waves/R-wave progression not assessed',
  };
  const qtcLabels = {
    normal: 'QTc not prolonged',
    prolonged: 'QTc prolonged',
    markedly_prolonged: 'QTc markedly prolonged',
    short: 'short QTc',
    unknown: 'QTc not assessed',
  };
  const stLabels = {
    none: 'no acute ST elevation/depression pattern documented',
    stemi: 'ST elevation in contiguous leads',
    depression: 'ST depression',
    diffuse_ste: 'diffuse ST elevation / PR depression pattern',
    posterior: 'posterior MI pattern to check',
    lbbb_sgarbossa: 'LBBB/paced rhythm requiring modified Sgarbossa check',
    early_repol: 'early repolarization pattern',
    brugada: 'Brugada-pattern ST elevation',
    strain: 'LVH/LBBB strain or secondary repolarization pattern',
    unknown: 'ST-T segment assessment incomplete',
  };
  const tLabels = {
    normal: 'no major T-wave abnormality documented',
    inversion: 'T-wave inversion',
    deep_symmetric: 'deep symmetric T-wave inversion',
    peaked: 'peaked T waves',
    flat_u: 'flat T waves / U waves',
    hyperacute: 'hyperacute T waves',
    unknown: 'T waves not assessed',
  };

  const prompts = ['Confirm calibration/quality and compare with prior EKG if available.'];
  let tone = '';
  if (rhythm === 'af') prompts.push('Irregularly irregular rhythm: check rate control, anticoagulation context, and reversible triggers.');
  if (rhythm === 'flutter') prompts.push('Flutter pattern: inspect inferior leads/V1 and estimate atrial-to-ventricular conduction ratio.');
  if (rhythm === 'svt') prompts.push('Regular narrow tachycardia: check onset, P waves, adenosine/vagal suitability, and instability signs.');
  if (pWaves === 'none') prompts.push('No clear P waves: re-check rhythm strip and consider AF/flutter/junctional/paced rhythm.');
  if (pr === 'prolonged') prompts.push('PR prolonged: consider first-degree AV block and medication/electrolyte contributors.');
  if (pr === 'short_delta') prompts.push('Short PR/delta wave: consider WPW pattern before AV nodal blockers in AF.');
  if (qrs === 'wide') prompts.push(`Wide QRS: classify as ${ekgSelectText('ekg-wide-pattern') || 'bundle branch block, ventricular rhythm, or metabolic/drug effect'}.`);
  if (axis === 'lad') prompts.push('Left axis deviation: check lead II, LVH/LBBB/inferior MI/WPW context, and LAFB criteria if QRS is not wide.');
  if (axis === 'rad') prompts.push('Right axis deviation: consider RV strain/RVH, PE/COPD, lateral MI, WPW, and LPFB pattern.');
  if (widePattern === 'vt') { prompts.push('Wide-complex tachycardia: treat as VT until proven otherwise if clinically unstable or uncertain.'); tone = 'danger'; }
  if (widePattern === 'hyperk') { prompts.push('Possible hyperkalemia pattern: check K immediately and treat empirically if unstable/high suspicion.'); tone = 'danger'; }
  if (widePattern === 'lbbb') prompts.push('LBBB pattern: expect discordant ST-T changes; assess ischemia with modified Sgarbossa if symptoms fit.');
  if (widePattern === 'rbbb') prompts.push('RBBB pattern: confirm rsR prime in V1-V2 and wide terminal S in I/V6.');
  if (chamber === 'lvh') prompts.push('LVH pattern: check voltage criteria and lateral strain; interpret ST-T changes as possible secondary repolarization.');
  if (chamber === 'rvh') prompts.push('RVH pattern: confirm RAD/deep lateral S waves and consider pulmonary pressure/PE/COPD context.');
  if (chamber === 'low_voltage') prompts.push('Low voltage: consider effusion, COPD, edema/body habitus, hypothyroidism, or infiltrative cardiomyopathy.');
  if (qProgression === 'prwp') prompts.push('Poor R-wave progression: verify V-lead placement and consider prior anterior MI, LVH/RVH, COPD, LBBB/WPW, or cardiomyopathy.');
  if (qProgression === 'path_q') prompts.push('Pathologic Q waves: confirm contiguous leads and correlate with old infarct vs pseudoinfarct mimics.');
  if (qProgression === 'dominant_r_v1') prompts.push('Dominant R in V1-V2: consider posterior MI, RVH, RBBB, WPW, HCM, or lead misplacement.');
  if (qtc === 'prolonged' || qtc === 'markedly_prolonged') prompts.push('QTc prolonged: check K/Mg/Ca and QT-prolonging medications.');
  if (qtc === 'markedly_prolonged') tone = 'danger';
  if (st === 'stemi') { prompts.push('ST elevation: verify contiguous leads, reciprocal changes, territory, symptoms, and emergent reperfusion pathway.'); tone = 'danger'; }
  if (st === 'posterior') { prompts.push('Posterior pattern: check V7-V9 and reciprocal anterior ST depression/tall R waves.'); tone = tone || 'warn'; }
  if (st === 'lbbb_sgarbossa') { prompts.push('LBBB/paced rhythm: apply modified Sgarbossa criteria rather than standard STEMI rules.'); tone = tone || 'warn'; }
  if (st === 'diffuse_ste') prompts.push('Diffuse ST elevation/PR depression: consider pericarditis pattern, but exclude STEMI mimics clinically.');
  if (st === 'early_repol') prompts.push('Early repolarization pattern: compare with prior and clinical context; look for stable J-point notching/slurring.');
  if (st === 'brugada') { prompts.push('Brugada-pattern ST elevation: check fever/drug/electrolyte triggers and syncope/family history context.'); tone = tone || 'warn'; }
  if (st === 'strain') prompts.push('Secondary repolarization: correlate with LVH, LBBB, pacing, or digoxin effect before calling primary ischemia.');
  if (tWaves === 'peaked') { prompts.push('Peaked T waves: check potassium and QRS widening.'); tone = tone || 'warn'; }
  if (tWaves === 'flat_u') prompts.push('Flat T/U waves: check potassium, magnesium, and QT/QU interval.');
  if (tWaves === 'deep_symmetric') { prompts.push('Deep symmetric T-wave inversion: consider Wellens, PE/right-heart strain, CNS event, stress cardiomyopathy, or memory T waves.'); tone = tone || 'warn'; }
  if (comparison === 'changed') prompts.push('Compared with prior: document what is new and whether symptoms/labs explain the change.');

  const impressionParts = [
    rate ? `rate ~${rate} bpm` : 'rate not estimated',
    rhythmLabels[rhythm] || 'rhythm not selected',
    axisLabels[axis] || 'axis not selected',
    qrsLabels[qrs] || 'QRS not selected',
    chamberLabels[chamber] || 'chamber/voltage not selected',
    qProgressionLabels[qProgression] || 'Q waves/R progression not selected',
    qtcLabels[qtc] || 'QTc not selected',
    stLabels[st] || 'ST-T assessment not selected',
    tLabels[tWaves] || 'T waves not selected',
  ];
  if (comparison && comparison !== 'unknown') impressionParts.push(`comparison: ${ekgSelectText('ekg-comparison')}`);

  const noteLines = [
    'EKG interpretation:',
    `Rate/Rhythm: ${rate ? `~${rate} bpm, ` : ''}${rhythmLabels[rhythm] || 'not selected'}.`,
    `Axis: ${axisLabels[axis] || 'not selected'}.`,
    `Intervals: ${pr ? `PR ${ekgSelectText('ekg-pr')}; ` : ''}${qrsLabels[qrs] || 'QRS not selected'}${widePattern && qrs === 'wide' ? ` (${ekgSelectText('ekg-wide-pattern')})` : ''}; ${qtcLabels[qtc] || 'QTc not selected'}.`,
    `Chamber/Voltage: ${chamberLabels[chamber] || 'not selected'}.`,
    `Q waves/R progression: ${qProgressionLabels[qProgression] || 'not selected'}.`,
    `ST-T: ${stLabels[st] || 'not selected'}; ${tLabels[tWaves] || 'T waves not selected'}.`,
    `Impression: ${impressionParts.join('; ')}.`,
  ];
  if (notes) noteLines.push(`Notes: ${notes}`);

  return { text: noteLines.join('\n'), prompts, tone };
}

function calcEkgGuide() {
  const el = document.getElementById('ekg-result');
  if (!el) return;
  const hasAny = ['ekg-rate','ekg-rhythm','ekg-axis','ekg-qrs','ekg-qtc','ekg-chamber','ekg-q-progression','ekg-st','ekg-twaves','ekg-notes']
    .some((id) => {
      const value = ekgValue(id);
      return value && !['unknown', 'uncertain', 'indeterminate'].includes(value);
    });
  if (!hasAny) {
    el.textContent = '—';
    el.className = 'calc-result';
    return;
  }
  const summary = buildEkgGuideSummary();
  renderEkgClues();
  el.textContent = `${summary.text}\n\nNext checks\n${summary.prompts.map((item) => `- ${item}`).join('\n')}`;
  el.innerHTML = `<div class="ekg-summary">${ekgEsc(summary.text).replace(/\n/g, '<br>')}</div>
    <div class="ekg-prompts"><strong>Next checks</strong><ul>${summary.prompts.map((item) => `<li>${ekgEsc(item)}</li>`).join('')}</ul></div>`;
  el.className = `calc-result rich ${summary.tone}`;
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
  card.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(inp => {
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
    case 'ekg': {
      if (typeof window !== 'undefined' && window._ekgWizCopy) return window._ekgWizCopy;
      const resultEl = document.getElementById('ekg-result');
      if (!resultEl) return null;
      const r = resultEl.textContent;
      if (r === '—') return null;
      return buildEkgGuideSummary().text;
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
    case 'abg': {
      const r = document.getElementById('abg-result').textContent;
      if (r === '—') return null;
      return `ABG / Acid-Base: pH ${get('abg-ph')}, PaCO2 ${get('abg-paco2')}, HCO3 ${get('abg-hco3')}\n${r}`;
    }
    case 'nafree': {
      const r = document.getElementById('nafree-result').textContent;
      if (r === '—') return null;
      return `Corrected Na / Free Water: Na ${get('nafree-na')}, Glucose ${get('nafree-glu')}, Wt ${get('nafree-wt')}\n${r}`;
    }
    case 'hypona': {
      const r = document.getElementById('hypona-result').textContent;
      if (r === '—') return null;
      return `Hyponatremia Helper: Na ${get('hypona-na')}, Glucose ${get('hypona-glu') || '-'}, Serum Osm ${get('hypona-serum-osm') || '-'}, Uosm ${get('hypona-urine-osm') || '-'}, UNa ${get('hypona-urine-na') || '-'}\n${r}`;
    }
    case 'dkahhs': {
      const r = document.getElementById('dkahhs-result').textContent;
      if (r === '—') return null;
      return `DKA/HHS Helper: Glucose ${get('dkahhs-glu')}, Na ${get('dkahhs-na')}, K ${get('dkahhs-k')}, pH ${get('dkahhs-ph') || '-'}, HCO3 ${get('dkahhs-hco3')}, BHB ${get('dkahhs-bhb') || '-'}\n${r}`;
    }
    case 'padua': {
      const r = document.getElementById('padua-result').textContent;
      if (r === '—') return null;
      return `Padua VTE / IMPROVE Bleeding\n${r}`;
    }
    case 'feurea': {
      const r = document.getElementById('feurea-result').textContent;
      if (r === '—') return null;
      return `FEUrea: Serum urea ${get('feurea-surea')}, Urine urea ${get('feurea-uurea')}, Serum Cr ${get('feurea-scr')}, Urine Cr ${get('feurea-ucr')}\n${r}`;
    }
    case 'elytes': {
      const r = document.getElementById('elytes-result').textContent;
      if (r === '—') return null;
      return `Electrolyte Replacement Review: K ${get('elytes-k')}, Mg ${get('elytes-mg')}, Phos ${get('elytes-phos')}, eGFR ${get('elytes-egfr')}\n${r}`;
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
    'chads','hasbled','qtc','ekg','wells','wellspe',
    'aa','curb',
    'meld','childpugh',
    'ag','ca','hypona',
    'news2','sofa','qsofa',
    'abg','nafree','dkahhs','padua','feurea','elytes'
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

function toggleLabTrends() {
  const sel = document.getElementById('calc-patient-select');
  const pid = sel ? sel.value : '';
  if (pid && (!activePatientId || activePatientId !== pid)) {
    openPatientContextById(pid, { view: true }).catch(() => openPatientContextWorkspace());
    return;
  }
  openPatientContextWorkspace();
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

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.body.classList.contains('ekg-guide-open')) {
      toggleEkgGuideFocus(false);
    }
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
  'Creatinine':       [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }, { field: 'feurea-scr' }],
  'creatinine':       [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }, { field: 'feurea-scr' }],
  'Cre':              [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }, { field: 'feurea-scr' }],
  'Cre(B)':           [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }, { field: 'feurea-scr' }],
  '肌酐酸':            [{ field: 'egfr-cr' }, { field: 'crcl-cr' }, { field: 'meld-cr' }, { field: 'feurea-scr' }],
  'eGFR':             [{ field: 'elytes-egfr' }],
  'BUN':              [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }, { field: 'feurea-surea' }, { field: 'osm-bun' }, { field: 'dkahhs-bun' }],
  'BUN(B)':           [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }, { field: 'feurea-surea' }, { field: 'osm-bun' }, { field: 'dkahhs-bun' }],
  '血中尿素氮':        [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }, { field: 'feurea-surea' }, { field: 'osm-bun' }, { field: 'dkahhs-bun' }],
  'Urea Nitrogen':    [{ field: 'curb-bun', transform: v => parseFloat(v) > 19 ? '1' : '0' }, { field: 'feurea-surea' }, { field: 'osm-bun' }, { field: 'dkahhs-bun' }],

  // ---- Electrolytes ----
  'Na':               [{ field: 'ag-na' }, { field: 'meld-na' }, { field: 'abg-na' }, { field: 'nafree-na' }, { field: 'dkahhs-na' }],
  'Na(B)':            [{ field: 'ag-na' }, { field: 'meld-na' }, { field: 'abg-na' }, { field: 'nafree-na' }, { field: 'dkahhs-na' }],
  '鈉':               [{ field: 'ag-na' }, { field: 'meld-na' }, { field: 'abg-na' }, { field: 'nafree-na' }, { field: 'dkahhs-na' }],
  'Sodium':           [{ field: 'ag-na' }, { field: 'meld-na' }, { field: 'abg-na' }, { field: 'nafree-na' }, { field: 'dkahhs-na' }],
  'K':                [{ field: 'dkahhs-k' }, { field: 'elytes-k' }],
  'K(B)':             [{ field: 'dkahhs-k' }, { field: 'elytes-k' }],
  '鉀':               [{ field: 'dkahhs-k' }, { field: 'elytes-k' }],
  'Potassium':        [{ field: 'dkahhs-k' }, { field: 'elytes-k' }],
  'Mg':               [{ field: 'elytes-mg' }],
  'Magnesium':        [{ field: 'elytes-mg' }],
  'Phos':             [{ field: 'elytes-phos' }],
  'Phosphate':        [{ field: 'elytes-phos' }],
  'Cl':               [{ field: 'ag-cl' }, { field: 'abg-cl' }],
  'Cl(B)':            [{ field: 'ag-cl' }, { field: 'abg-cl' }],
  '氯':               [{ field: 'ag-cl' }, { field: 'abg-cl' }],
  'Chloride':         [{ field: 'ag-cl' }, { field: 'abg-cl' }],
  'HCO3':             [{ field: 'ag-hco3' }, { field: 'abg-hco3' }, { field: 'dkahhs-hco3' }],
  'CO2':              [{ field: 'ag-hco3' }, { field: 'abg-hco3' }, { field: 'dkahhs-hco3' }],
  'TCO2':             [{ field: 'ag-hco3' }, { field: 'abg-hco3' }, { field: 'dkahhs-hco3' }],
  'Total CO2':        [{ field: 'ag-hco3' }, { field: 'abg-hco3' }, { field: 'dkahhs-hco3' }],
  '碳酸氫根':          [{ field: 'ag-hco3' }, { field: 'abg-hco3' }, { field: 'dkahhs-hco3' }],
  'AG':               [{ field: 'dkahhs-ag' }],
  'Anion Gap':        [{ field: 'dkahhs-ag' }],

  // ---- Calcium / Albumin ----
  'Ca':               [{ field: 'ca-total' }],
  'Ca(B)':            [{ field: 'ca-total' }],
  'Calcium':          [{ field: 'ca-total' }],
  '鈣':               [{ field: 'ca-total' }],
  'Albumin':          [{ field: 'ag-alb' }, { field: 'ca-alb' }, { field: 'abg-alb' }],
  'Alb':              [{ field: 'ag-alb' }, { field: 'ca-alb' }, { field: 'abg-alb' }],
  'ALB':              [{ field: 'ag-alb' }, { field: 'ca-alb' }, { field: 'abg-alb' }],
  '白蛋白':            [{ field: 'ag-alb' }, { field: 'ca-alb' }, { field: 'abg-alb' }],

  // ---- Liver / MELD ----
  'T-Bil':            [{ field: 'meld-bili' }],
  'T-Bil(B)':         [{ field: 'meld-bili' }],
  'Total Bilirubin':  [{ field: 'meld-bili' }],
  '總膽紅素':          [{ field: 'meld-bili' }],
  'Bilirubin Total':  [{ field: 'meld-bili' }],
  'INR':              [{ field: 'meld-inr' }],
  'PT(INR)':          [{ field: 'meld-inr' }],

  // ---- Glucose (Osmolality) ----
  'Glucose':          [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'GLU':              [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'Glu(B)':           [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'Sugar':            [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  '血糖':              [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'AC Sugar':         [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'PC Sugar':         [{ field: 'osm-glu' }, { field: 'nafree-glu' }, { field: 'dkahhs-glu' }],
  'Serum Osm':        [{ field: 'osm-meas' }, { field: 'hypona-serum-osm' }, { field: 'dkahhs-osm' }],
  'Serum Osmolality': [{ field: 'osm-meas' }, { field: 'hypona-serum-osm' }, { field: 'dkahhs-osm' }],
  'Osmolality':       [{ field: 'osm-meas' }, { field: 'hypona-serum-osm' }, { field: 'dkahhs-osm' }],
  'Measured Osm':     [{ field: 'osm-meas' }, { field: 'hypona-serum-osm' }, { field: 'dkahhs-osm' }],
  'Osm':              [{ field: 'osm-meas' }, { field: 'hypona-serum-osm' }, { field: 'dkahhs-osm' }],

  // ---- Ketones ----
  'Beta-Hydroxybutyrate': [{ field: 'dkahhs-bhb' }],
  'Beta hydroxybutyrate': [{ field: 'dkahhs-bhb' }],
  'β-Hydroxybutyrate':    [{ field: 'dkahhs-bhb' }],
  'BHB':                  [{ field: 'dkahhs-bhb' }],
  'BOHB':                 [{ field: 'dkahhs-bhb' }],
  'Ketone':               [{ field: 'dkahhs-ketones', transform: v => /neg/i.test(String(v)) ? 'negative' : /pos|\+|[\d.]/i.test(String(v)) ? 'positive' : 'unknown' }],
  'Ketones':              [{ field: 'dkahhs-ketones', transform: v => /neg/i.test(String(v)) ? 'negative' : /pos|\+|[\d.]/i.test(String(v)) ? 'positive' : 'unknown' }],

  // ---- Platelets (display; SOFA is select-based) ----
  'PLT':              [],
  'Platelet':         [],
  'Platelets':        [],
  '血小板':            [],

  // ---- ABG ----
  'PaO2':             [{ field: 'aa-pao2' }],
  'pO2':              [{ field: 'aa-pao2' }],
  'pH':               [{ field: 'abg-ph' }, { field: 'dkahhs-ph' }],
  'PaCO2':            [{ field: 'aa-paco2' }, { field: 'abg-paco2' }],
  'pCO2':             [{ field: 'aa-paco2' }, { field: 'abg-paco2' }],
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
  calcEGFR(); calcCrCl(); calcCorrCa(); calcAG(); calcAaGrad(); calcMELD(); calcCHADS(); calcCURB(); calcWells(); calcBMI(); calcMAP(); calcGCS(); calcFENa(); calcOsm(); calcQTc(); calcChildPugh(); calcHASBLED(); calcNEWS2(); calcSOFA(); calcABG(); calcNaFreeWater(); calcDKAHHS(); calcFEUrea(); calcElectrolytes();

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
    if (activePatientId) sel.value = activePatientId;
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
    calcEGFR(); calcCrCl(); calcCorrCa(); calcAG(); calcAaGrad(); calcMELD(); calcCHADS(); calcCURB(); calcWells(); calcWellsPE(); calcBMI(); calcMAP(); calcGCS(); calcFENa(); calcOsm(); calcQTc(); calcChildPugh(); calcHASBLED(); calcNEWS2(); calcSOFA(); calcQSOFA(); calcABG(); calcNaFreeWater(); calcDKAHHS(); calcFEUrea(); calcElectrolytes();

    if (typeof setActivePatientContext === 'function') {
      setActivePatientContext(data);
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

    let html = '<table class="census-table"><thead><tr><th>Patient</th><th>Diagnosis</th><th>Admitted</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>';

    // Active patients first
    for (const p of active) {
      const mod = p.modified ? new Date(p.modified).toLocaleDateString() + ' ' + new Date(p.modified).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
      html += `<tr class="census-clickable-row" tabindex="0" role="button" onclick="openPatientContextById('${escHtml(p.id)}', { view: true })" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPatientContextById('${escHtml(p.id)}', { view: true }); }">
        <td class="census-name">${escHtml(p.name)}</td>
        <td class="census-dx" title="${escHtml(p.dx)}">${escHtml(p.dx || '—')}</td>
        <td>${escHtml(p.admitted || '—')}</td>
        <td><span class="census-tag active">Active</span></td>
        <td style="font-size:0.6rem;color:var(--text-dim);">${mod}</td>
        <td>
          <div class="census-row-actions">
            <button class="census-inline-btn" onclick="event.stopPropagation(); openPatientContextById('${escHtml(p.id)}', { view: true })">Context</button>
            <button class="census-inline-btn" onclick="event.stopPropagation(); switchView('calculator'); loadPatientIntoCalc('${escHtml(p.id)}')">Calc</button>
          </div>
        </td>
      </tr>`;
    }

    // Discharged patients
    for (const p of discharged) {
      const mod = p.modified ? new Date(p.modified).toLocaleDateString() + ' ' + new Date(p.modified).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
      html += `<tr class="census-clickable-row" tabindex="0" role="button" onclick="openPatientContextById('${escHtml(p.id)}', { view: true })" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPatientContextById('${escHtml(p.id)}', { view: true }); }" style="opacity:0.6;">
        <td class="census-name" style="color:var(--text-dim);">${escHtml(p.name)}</td>
        <td class="census-dx" title="${escHtml(p.dx)}">${escHtml(p.dx || '—')}</td>
        <td>${escHtml(p.admitted || '—')}</td>
        <td><span class="census-tag dc">DC'd</span></td>
        <td style="font-size:0.6rem;color:var(--text-dim);">${mod}</td>
        <td>
          <div class="census-row-actions">
            <button class="census-inline-btn" onclick="event.stopPropagation(); openPatientContextById('${escHtml(p.id)}', { view: true })">Context</button>
          </div>
        </td>
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

function buildPatientAwareDosingHints(drugKey, crcl) {
  if (typeof getActivePatientClinicalSnapshot !== 'function') return '';
  const snapshot = getActivePatientClinicalSnapshot();
  if (!snapshot) return '';

  const latest = snapshot.latestLabs || {};
  const hints = [];
  const add = (tone, text) => hints.push({ tone, text });
  const renalRiskDrugs = new Set(['vancomycin', 'gentamicin', 'amikacin', 'acyclovir', 'ganciclovir', 'enoxaparin', 'metformin', 'nitrofurantoin']);

  if (snapshot.egfr !== null && Math.abs(snapshot.egfr - crcl) >= 15) {
    add('warn', `Manual renal input ${crcl} differs from active-patient eGFR ${snapshot.egfr}. Recheck which estimate you want to dose from.`);
  }
  if (renalRiskDrugs.has(drugKey) && snapshot.egfr !== null && snapshot.egfr < 30) {
    add('danger', `Active patient eGFR is ${snapshot.egfr}. This is a high-risk renal dosing situation.`);
  }
  if (latest.Cr !== undefined && snapshot.previousLabs && snapshot.previousLabs.Cr !== undefined && latest.Cr > snapshot.previousLabs.Cr + 0.2) {
    add('warn', `Creatinine is rising (${snapshot.previousLabs.Cr} → ${latest.Cr}). If renal function is changing quickly, fixed interval dosing may age badly.`);
  }
  if (drugKey === 'tmpSmx' && latest.K !== undefined && latest.K >= 5.0) {
    add(latest.K >= 5.5 ? 'danger' : 'warn', `Latest potassium is ${latest.K}. TMP-SMX can worsen hyperkalemia.`);
  }
  if (drugKey === 'ganciclovir') {
    if (latest.ANC !== undefined && latest.ANC < 1000) add(latest.ANC < 500 ? 'danger' : 'warn', `ANC is ${latest.ANC}. Ganciclovir can worsen neutropenia.`);
    if (latest.Plt !== undefined && latest.Plt < 100) add('warn', `Platelets are ${latest.Plt}. Ganciclovir can worsen cytopenias.`);
  }
  if (drugKey === 'enoxaparin') {
    if (latest.Plt !== undefined && latest.Plt < 100) add('warn', `Platelets are ${latest.Plt}. Recheck bleeding/HIT context before anticoagulant dosing.`);
    if (snapshot.egfr !== null && snapshot.egfr < 30) add('warn', 'Renal impairment increases enoxaparin accumulation and bleeding risk.');
  }
  if (drugKey === 'nitrofurantoin' && snapshot.egfr !== null && snapshot.egfr < 30) {
    add('danger', 'Active patient renal function is below the usual nitrofurantoin threshold.');
  }
  if (drugKey === 'metformin' && latest.HCO3 !== undefined && latest.HCO3 < 20) {
    add('warn', `HCO3 is ${latest.HCO3}. If there is active acidosis or sepsis, metformin is a poor fit even before the chronic renal threshold.`);
  }

  if (hints.length === 0) {
    add('info', 'No extra patient-specific dosing flags detected from the active context.');
  }

  const chips = [];
  if (snapshot.egfr !== null) chips.push(`eGFR ${snapshot.egfr}`);
  if (latest.Cr !== undefined) chips.push(`Cr ${latest.Cr}`);
  if (latest.K !== undefined) chips.push(`K ${latest.K}`);
  if (latest.ANC !== undefined) chips.push(`ANC ${latest.ANC}`);
  if (latest.Plt !== undefined) chips.push(`Plt ${latest.Plt}`);

  return `
    <div style="margin-top:0.55rem;padding-top:0.5rem;border-top:1px dashed var(--border);">
      <div style="font-size:0.72em;font-weight:700;color:var(--text);">Active Patient Context: ${escHtml(snapshot.name)}</div>
      <div style="font-size:0.68em;color:var(--text-dim);margin-top:0.15rem;">${escHtml(snapshot.dx || '—')}${chips.length ? ` · ${escHtml(chips.join(' · '))}` : ''}</div>
      <div style="margin-top:0.35rem;display:flex;flex-direction:column;gap:0.28rem;">
        ${hints.map((hint) => `<div style="font-size:0.72em;line-height:1.5;color:${hint.tone === 'danger' ? 'var(--red)' : hint.tone === 'warn' ? 'var(--warn)' : 'var(--text-dim)'};">${escHtml(hint.text)}</div>`).join('')}
      </div>
    </div>`;
}

function calcDosing() {
  const drugKey = document.getElementById('dosing-drug').value;
  const el = document.getElementById('dosing-result');
  hydrateDosingInputsFromActivePatient();
  const wt = parseFloat(document.getElementById('dosing-wt').value);
  const crcl = parseFloat(document.getElementById('dosing-crcl').value);

  if (!drugKey) { el.textContent = '—'; el.className = 'calc-result'; return; }
  if (!wt || wt <= 0) {
    el.innerHTML = `Enter patient weight${buildPatientAwareDosingHints(drugKey, crcl)}`;
    el.className = 'calc-result warn rich';
    return;
  }
  if (isNaN(crcl) || crcl < 0) {
    el.innerHTML = `Enter CrCl / eGFR${buildPatientAwareDosingHints(drugKey, crcl)}`;
    el.className = 'calc-result warn rich';
    return;
  }

  const drug = DRUG_DOSING[drugKey];
  if (!drug) { el.textContent = 'Drug not found'; el.className = 'calc-result'; return; }

  const result = drug.calc(wt, crcl);
  const patientAwareHints = buildPatientAwareDosingHints(drugKey, crcl);
  let cls = 'success';
  if (result.dose === 'AVOID' || result.dose === 'CONTRAINDICATED') cls = 'danger';
  else if (crcl < 30) cls = 'warn';

  el.innerHTML = `<strong>${drug.name}</strong> [${drug.route}]<br>
    <span style="font-size:0.85em;">Dose: <strong>${result.dose}</strong> &nbsp;|&nbsp; Interval: <strong>${result.interval}</strong></span><br>
    <span style="font-size:0.75em;color:var(--text-dim);margin-top:0.25rem;display:block;">${drug.note}</span>
    <span style="font-size:0.75em;margin-top:0.25rem;display:block;">${result.note}</span>
    ${patientAwareHints}`;
  el.className = `calc-result ${cls} rich`;
}

window.addEventListener('patient-context-updated', () => {
  const drugEl = document.getElementById('dosing-drug');
  if (!drugEl) return;
  hydrateDosingInputsFromActivePatient();
  if (drugEl.value) calcDosing();
});

function clearDosingCalc() {
  document.getElementById('dosing-drug').value = '';
  document.getElementById('dosing-wt').value = '';
  document.getElementById('dosing-crcl').value = '';
  const el = document.getElementById('dosing-result');
  el.textContent = '—'; el.className = 'calc-result';
}

function extractPatientWeight(record) {
  if (!record) return null;
  const match = record.match(/(?:Weight|BW|Wt)\s*[:=]?\s*([\d.]+)\s*(?:kg)?/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function getCurrentRenalEstimate() {
  const crclEl = document.getElementById('crcl-result');
  const egfrEl = document.getElementById('egfr-result');

  if (crclEl && crclEl.textContent !== '—') {
    const match = crclEl.textContent.match(/([\d.]+)\s*mL/i);
    if (match) return parseFloat(match[1]);
  }
  if (egfrEl && egfrEl.textContent !== '—') {
    const match = egfrEl.textContent.match(/([\d.]+)\s*mL/i);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function hydrateDosingInputsFromActivePatient() {
  const wtEl = document.getElementById('dosing-wt');
  const crclEl = document.getElementById('dosing-crcl');
  if (!wtEl || !crclEl) return false;

  let updated = false;
  const record = (typeof activePatientData !== 'undefined' && activePatientData && activePatientData.content)
    ? activePatientData.content
    : '';
  const snapshot = typeof getActivePatientClinicalSnapshot === 'function'
    ? getActivePatientClinicalSnapshot()
    : null;

  if (!wtEl.value) {
    const weight = extractPatientWeight(record);
    if (weight !== null) {
      wtEl.value = weight;
      updated = true;
    }
  }

  if (!crclEl.value) {
    const renalEstimate = getCurrentRenalEstimate() || (snapshot && snapshot.egfr !== null ? snapshot.egfr : null);
    if (renalEstimate !== null && renalEstimate !== undefined) {
      crclEl.value = Math.round(renalEstimate * 10) / 10;
      updated = true;
    }
  }

  return updated;
}

function pullGFRIntoDosingCalc() {
  const val = getCurrentRenalEstimate();
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
