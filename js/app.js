import { OPERATIONS, FDS_FALLBACKS } from './seed/blueprint-v1.js';
import { getActiveCampaign, getTodayBlueprint, getCampaignWeek } from './services/campaign.js';
import {
  getOrCreateTodayMission,
  getMission,
  saveMission,
  startMission,
  logSet,
  getSetLogsForMission,
  getPreviousPerformance,
  completeMission,
  getCompletedMissionsThisWeek,
  advanceMissionPointer,
  getCurrentExercise,
  isStructuredExercise,
  isChecklistExercise,
  formatPrescription,
  formatExerciseName,
  getExerciseFieldDefaults,
  computeSuggestedRating,
  MISSION_STATUS,
  MISSION_RATINGS
} from './services/mission.js';
import { CoachService } from './services/coach.js';
import {
  getIntegrity,
  updateIntegrityAfterMission,
  getWeeklyStats,
  formatIntegritySummary
} from './services/integrity.js';
import {
  getSettings,
  saveSettings,
  kgToUnit,
  convertWeight,
  weightStep,
  bodyweightStart
} from './services/settings.js';
import { getMonthHeatmapData, renderHeatmapHtml } from './services/heatmap.js';

const state = {
  screen: 'centre',
  campaign: null,
  blueprint: null,
  mission: null,
  setLogs: [],
  settings: null,
  selectedRating: null,
  checklistDone: new Set()
};

let restTimerInterval = null;

const $ = (sel) => document.querySelector(sel);
const screenRoot = $('#screen-root');
const headerContext = $('#header-context');
const fdsBar = $('#fds-bar');
const overlay = $('#overlay');
const overlayContent = $('#overlay-content');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function operationStyle(op) {
  const cfg = OPERATIONS[op] || { label: op, color: '#7a8490' };
  return { ...cfg, style: `background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44` };
}

function showFdsBar(visible) {
  fdsBar.classList.toggle('hidden', !visible);
  screenRoot.classList.toggle('no-fds', !visible);
}

function setHeader(text) {
  headerContext.textContent = text || '';
}

function clearRestTimer() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
}

async function goHome() {
  clearRestTimer();
  closeOverlay();
  state.mission = await getMission(state.mission.id);
  state.setLogs = await getSetLogsForMission(state.mission.id);
  renderCentre();
}

function formatPrescriptionForDisplay(exercise, weightUnit) {
  if (exercise.type === 'weighted_reps' && exercise.weight != null) {
    const w = kgToUnit(exercise.weight, weightUnit);
    return `${w}${weightUnit} × ${exercise.reps}`;
  }
  if (exercise.type === 'carry' && exercise.weight != null) {
    const w = kgToUnit(exercise.weight, weightUnit);
    return `${w}${weightUnit}`;
  }
  if (exercise.type === 'carry' && exercise.weightMin != null) {
    const wMin = kgToUnit(exercise.weightMin, weightUnit);
    const wMax = kgToUnit(exercise.weightMax, weightUnit);
    return `${wMin}–${wMax}${weightUnit}`;
  }
  return formatPrescription(exercise);
}

function prepareFields(exercise, prev, settings) {
  const fields = getExerciseFieldDefaults(exercise, prev);
  const unit = settings.weightUnit;

  if (fields.weight !== '' && fields.weight != null) {
    const srcUnit = prev?.lastActual?.weightUnit || exercise.weightUnit || 'kg';
    fields.weight = convertWeight(Number(fields.weight), srcUnit, unit);
  } else if (exercise.weight != null) {
    fields.weight = kgToUnit(exercise.weight, unit);
  }

  return fields;
}

function renderDialRow(label, id, value, opts = {}) {
  const { min = 0, max = 999, step = 1, bw = false } = opts;
  const numVal = value === '' || value == null ? 0 : Number(value);
  const displayVal = bw && numVal <= 0 ? 'BW' : (Number.isInteger(step) ? numVal : numVal);

  return `
    <div class="adjust-row">
      <label>${label}</label>
      <div class="dial" data-id="${id}" data-min="${min}" data-max="${max}" data-step="${step}" data-bw="${bw ? '1' : '0'}">
        <button type="button" class="dial-btn dial-minus" aria-label="Decrease ${label}">−</button>
        <span class="dial-value" id="${id}">${displayVal === 'BW' ? 'BW' : displayVal}</span>
        <button type="button" class="dial-btn dial-plus" aria-label="Increase ${label}">+</button>
      </div>
    </div>`;
}

function bindDials(container) {
  const unit = state.settings?.weightUnit || 'kg';

  container.querySelectorAll('.dial').forEach((dial) => {
    const valueEl = dial.querySelector('.dial-value');
    const minus = dial.querySelector('.dial-minus');
    const plus = dial.querySelector('.dial-plus');
    const min = parseFloat(dial.dataset.min);
    const max = parseFloat(dial.dataset.max);
    const step = parseFloat(dial.dataset.step);
    const isBw = dial.dataset.bw === '1';

    function getVal() {
      const t = valueEl.textContent.trim();
      if (t === 'BW') return 0;
      return parseFloat(t) || 0;
    }

    function setVal(v) {
      if (isBw && v <= 0) {
        valueEl.textContent = 'BW';
      } else if (Number.isInteger(step)) {
        valueEl.textContent = Math.round(v);
      } else {
        valueEl.textContent = String(Math.round(v * 2) / 2);
      }
    }

    minus.addEventListener('click', () => {
      let v = getVal();
      v = Math.max(min, Math.round((v - step) * 2) / 2);
      setVal(v);
    });

    plus.addEventListener('click', () => {
      let v = getVal();
      if (isBw && v <= 0) {
        v = bodyweightStart(unit);
      } else {
        v = Math.min(max, Math.round((v + step) * 2) / 2);
      }
      setVal(v);
    });
  });
}

function showSetsField(exercise) {
  return isStructuredExercise(exercise);
}

function showRepsField(exercise) {
  return ['weighted_reps', 'reps'].includes(exercise.type);
}

function showWeightField(exercise) {
  return ['weighted_reps', 'reps', 'carry'].includes(exercise.type) || exercise.weight != null;
}

function showDurationField(exercise) {
  return exercise.type === 'timed';
}

function showDistanceField(exercise) {
  return ['distance', 'carry'].includes(exercise.type);
}

function buildAdjustmentPanel(exercise, fields) {
  const unit = state.settings?.weightUnit || 'kg';
  const wStep = weightStep(unit);
  const isBw = fields.weightLabel === 'bodyweight';
  const weightLabel = isBw ? 'Bodyweight' : `Weight (${unit})`;

  let html = '<div class="adjust-panel" id="adjust-panel">';

  if (showSetsField(exercise)) {
    html += renderDialRow('Sets', 'adj-sets', fields.sets, { min: 1, max: 20, step: 1 });
  }

  if (showRepsField(exercise)) {
    html += renderDialRow('Reps', 'adj-reps', fields.reps, { min: 1, max: 50, step: 1 });
  }

  if (showWeightField(exercise)) {
    html += renderDialRow(weightLabel, 'adj-weight', fields.weight, {
      min: 0,
      max: unit === 'lbs' ? 440 : 200,
      step: wStep,
      bw: isBw
    });
  }

  if (showDurationField(exercise)) {
    html += renderDialRow(`Duration (${exercise.durationUnit || 's'})`, 'adj-duration', fields.duration, {
      min: 5,
      max: 300,
      step: 5
    });
  }

  if (showDistanceField(exercise)) {
    html += renderDialRow(`Distance (${exercise.distanceUnit || 'km'})`, 'adj-distance', fields.distance, {
      min: 0,
      max: 50,
      step: 0.1
    });
  }

  html += `
    <div class="adjust-row adjust-row-full">
      <label>Notes</label>
      <textarea id="adj-notes" class="adj-notes" placeholder="Optional — shown next time you do this exercise">${escapeHtml(fields.notes)}</textarea>
    </div>
  </div>`;

  return html;
}

function getDialValue(id) {
  const el = $(`#${id}`);
  if (!el) return null;
  const t = el.textContent.trim();
  if (t === 'BW') return 0;
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : n;
}

function collectActualFromForm(exercise) {
  const actual = {};
  const unit = state.settings?.weightUnit || 'kg';

  const sets = getDialValue('adj-sets');
  const reps = getDialValue('adj-reps');
  const weight = getDialValue('adj-weight');
  const duration = getDialValue('adj-duration');
  const distance = getDialValue('adj-distance');
  const notes = $('#adj-notes');

  if (sets != null) actual.sets = Math.round(sets);
  if (reps != null) actual.reps = Math.round(reps);
  if (weight != null && weight > 0) {
    actual.weight = weight;
    actual.weightUnit = unit;
  } else if (showWeightField(exercise) && !exercise.weight) {
    actual.weightLabel = 'bodyweight';
  }
  if (duration != null) {
    actual.duration = Math.round(duration);
    actual.durationUnit = exercise.durationUnit || 's';
  }
  if (distance != null) {
    actual.distance = distance;
    actual.distanceUnit = exercise.distanceUnit || 'km';
  }
  if (notes?.value) actual.notes = notes.value.trim();

  return actual;
}

function renderPreviousBlock(prev) {
  if (!prev) return '';
  let html = `<p class="exercise-prev">Last time: <span>${escapeHtml(prev.summary)}</span></p>`;
  if (prev.lastNote) {
    html += `<p class="exercise-prev-note">Note: <span>${escapeHtml(prev.lastNote)}</span></p>`;
  }
  return html;
}

async function afterExerciseComplete(done) {
  if (done) {
    renderComplete(false);
    return;
  }
  const settings = await getSettings();
  state.settings = settings;
  if (settings.restTimerSeconds > 0) {
    renderRestTimer(settings.restTimerSeconds, () => renderActive());
  } else {
    renderActive();
  }
}

function renderRestTimer(totalSeconds, onDone) {
  clearRestTimer();
  state.screen = 'rest';
  showFdsBar(false);
  setHeader('Rest');

  let remaining = totalSeconds;

  function render() {
    const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const display = `${mins}:${String(secs).padStart(2, '0')}`;

    screenRoot.innerHTML = `
      <div class="screen">
        <div class="rest-screen">
          <p class="rest-label">Rest</p>
          <p class="rest-countdown">${display}</p>
          <div class="rest-progress">
            <div class="rest-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="screen-footer">
          <button type="button" class="btn-secondary" id="btn-skip-rest">Skip Rest</button>
        </div>
      </div>
    `;

    $('#btn-skip-rest').addEventListener('click', () => {
      clearRestTimer();
      onDone();
    });
  }

  render();
  restTimerInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearRestTimer();
      onDone();
    } else {
      render();
    }
  }, 1000);
}

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
    }).catch(() => {});
  }

  state.settings = await getSettings();
  state.campaign = await getActiveCampaign();
  state.blueprint = await getTodayBlueprint();
  state.mission = await getOrCreateTodayMission(state.blueprint);
  state.setLogs = await getSetLogsForMission(state.mission.id);

  if (state.mission.status === MISSION_STATUS.COMPLETE) {
    renderComplete(true);
  } else {
    renderCentre();
  }

  $('#btn-home').addEventListener('click', goHome);
  $('#btn-settings').addEventListener('click', () => renderSettings());
  $('#btn-fds').addEventListener('click', openFdsOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });
}

function renderCentre() {
  state.screen = 'centre';
  const completed = state.mission.status === MISSION_STATUS.COMPLETE;
  const active = state.mission.status === MISSION_STATUS.ACTIVE;
  showFdsBar(!completed);
  setHeader('Command Centre');

  const op = operationStyle(state.blueprint.operation);
  const week = getCampaignWeek(state.campaign.startDate);
  const exerciseCount = state.blueprint.exercises.length;

  const now = new Date();

  Promise.all([
    getIntegrity(),
    getCompletedMissionsThisWeek(),
    getMonthHeatmapData(now.getFullYear(), now.getMonth())
  ]).then(async ([integrity, weekly, heatmapData]) => {
    const stats = await getWeeklyStats(weekly);
    const summary = formatIntegritySummary(integrity, stats);
    const heatmapHtml = renderHeatmapHtml(heatmapData);

    let primaryLabel = 'Begin Mission';
    let primaryAction = () => renderBriefing();
    if (completed) {
      primaryLabel = 'Mission Complete';
    } else if (active) {
      primaryLabel = 'Resume Mission';
      primaryAction = () => renderActive();
    }

    screenRoot.innerHTML = `
      <div class="screen">
        <div class="screen-scroll">
          <p class="section-label">Active Campaign</p>
          <h1 class="campaign-title">${escapeHtml(state.campaign.name)}</h1>
          <p class="campaign-meta">${escapeHtml(state.campaign.season)} · Week ${week} of ${state.campaign.durationWeeks}</p>

          <div class="mission-card">
            <span class="operation-badge" style="${op.style}">${op.label}</span>
            <p class="mission-day">${escapeHtml(state.blueprint.dayName)}</p>
            <p class="mission-focus">Today's Mission</p>
            <p class="mission-stats">${exerciseCount} exercises · ${op.label} front</p>
            ${completed ? '<p class="status-complete">✓ Mission complete today</p>' : ''}
            ${active && !completed ? '<p class="status-complete">Mission in progress</p>' : ''}
          </div>

          <div class="integrity-bar">
            <strong>Integrity</strong><br>${escapeHtml(summary)}
          </div>

          ${heatmapHtml}
        </div>
        <div class="screen-footer">
          <button type="button" class="btn-primary" id="btn-begin" ${completed ? 'disabled' : ''}>
            ${primaryLabel}
          </button>
          ${completed ? '<button type="button" class="btn-secondary" id="btn-view-complete">View Debrief</button>' : ''}
        </div>
      </div>
    `;

    if (!completed) {
      $('#btn-begin').addEventListener('click', primaryAction);
    }
    if (completed) {
      $('#btn-view-complete').addEventListener('click', () => renderComplete(true));
    }
  });
}

async function renderSettings() {
  clearRestTimer();
  state.screen = 'settings';
  showFdsBar(false);
  setHeader('Settings');

  state.settings = await getSettings();
  const s = state.settings;

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <div class="settings-group">
          <p class="settings-group-title">Weight Unit</p>
          <div class="segmented-control">
            <button type="button" class="segment-btn ${s.weightUnit === 'kg' ? 'selected' : ''}" data-unit="kg">kg</button>
            <button type="button" class="segment-btn ${s.weightUnit === 'lbs' ? 'selected' : ''}" data-unit="lbs">lbs</button>
          </div>
          <p class="settings-hint">Applies to weight dials and prescriptions.</p>
        </div>

        <div class="settings-group">
          <p class="settings-group-title">Rest Timer (between exercises)</p>
          ${renderDialRow('Seconds', 'setting-rest', s.restTimerSeconds, { min: 0, max: 180, step: 15 })}
          <p class="settings-hint">Default 60s. Set to 0 to disable.</p>
        </div>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-settings-back">Back to Command Centre</button>
      </div>
    </div>
  `;

  bindDials(screenRoot);

  document.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.settings = await saveSettings({ weightUnit: btn.dataset.unit });
      renderSettings();
    });
  });

  screenRoot.querySelector('[data-id="setting-rest"]')?.querySelectorAll('.dial-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await new Promise((r) => setTimeout(r, 0));
      const val = getDialValue('setting-rest') ?? 0;
      state.settings = await saveSettings({ restTimerSeconds: val });
    });
  });

  $('#btn-settings-back').addEventListener('click', () => renderCentre());
}

function renderBriefing() {
  state.screen = 'briefing';
  showFdsBar(false);
  setHeader('Briefing');

  const op = operationStyle(state.blueprint.operation);
  const unit = state.settings?.weightUnit || 'kg';

  const exerciseItems = state.blueprint.exercises
    .map((ex) => {
      const rx = formatPrescriptionForDisplay(ex, unit);
      return `<li><span>${escapeHtml(formatExerciseName(ex.name))}</span><span class="rx">${escapeHtml(rx)}</span></li>`;
    })
    .join('');

  CoachService.getBriefingNote(state.campaign).then((note) => {
    screenRoot.innerHTML = `
      <div class="screen">
        <div class="screen-scroll">
          <span class="operation-badge" style="${op.style}">${op.label}</span>
          <h1 class="campaign-title">${escapeHtml(state.blueprint.dayName)} Mission</h1>
          <p class="campaign-meta">${escapeHtml(state.blueprint.operation)} front</p>

          <div class="identity-block">"${escapeHtml(note)}"</div>

          <p class="section-label">Mission Loadout</p>
          <ul class="exercise-list">${exerciseItems}</ul>

          <div class="brief-footer">
            <strong>Progression:</strong> ${escapeHtml(state.campaign.progressionRules[0])}<br>
            <strong>Fuel:</strong> ${escapeHtml(state.campaign.nutrition[0])}
          </div>
        </div>
        <div class="screen-footer">
          <button type="button" class="btn-primary" id="btn-start">Start</button>
          <button type="button" class="btn-secondary" id="btn-back-centre">Back</button>
        </div>
      </div>
    `;

    $('#btn-start').addEventListener('click', async () => {
      state.mission = await startMission(state.mission);
      state.setLogs = [];
      state.checklistDone = new Set();
      renderActive();
    });
    $('#btn-back-centre').addEventListener('click', () => renderCentre());
  });
}

async function renderActive() {
  clearRestTimer();
  state.screen = 'active';
  showFdsBar(false);
  setHeader('Active Mission');

  state.mission = await getMission(state.mission.id);
  state.setLogs = await getSetLogsForMission(state.mission.id);

  const exercises = state.mission.exercises.filter((e) => !state.mission.skippedExercises?.includes(e.id));
  const isChecklistDay = exercises.every((e) => isChecklistExercise(e));

  if (isChecklistDay) {
    renderChecklistActive(exercises);
    return;
  }

  const exercise = getCurrentExercise(state.mission);
  if (!exercise) {
    renderComplete(false);
    return;
  }

  if (isChecklistExercise(exercise)) {
    await renderChecklistItem(exercise, exercises);
    return;
  }

  const unit = state.settings?.weightUnit || 'kg';
  const rx = formatPrescriptionForDisplay(exercise, unit);
  const prev = await getPreviousPerformance(exercise.id, state.mission.id);
  const fields = prepareFields(exercise, prev, state.settings);

  const exIndex = exercises.indexOf(exercise);
  const totalExercises = exercises.length;
  const progress = (exIndex / totalExercises) * 100;

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-body">
        <div class="progress-bar-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <p class="progress-label">Exercise ${exIndex + 1} of ${totalExercises}</p>
        </div>

        <div class="exercise-card">
          <h2 class="exercise-name">${escapeHtml(formatExerciseName(exercise.name))}</h2>
          <p class="exercise-rx">${escapeHtml(rx)}</p>
          ${renderPreviousBlock(prev)}
        </div>

        ${buildAdjustmentPanel(exercise, fields)}
      </div>

      <div class="screen-footer">
        <button type="button" class="btn-primary" id="btn-complete-exercise">Complete Exercise</button>
        ${exercise.type === 'optional' ? '<button type="button" class="btn-secondary" id="btn-skip">Skip</button>' : ''}
      </div>
    </div>
  `;

  bindDials(screenRoot);

  $('#btn-complete-exercise').addEventListener('click', async () => {
    const actual = collectActualFromForm(exercise);
    await logSet(state.mission, exercise, 1, actual);

    const { done, mission } = advanceMissionPointer(state.mission);
    state.mission = await saveMission(mission);

    await afterExerciseComplete(done);
  });

  $('#btn-skip')?.addEventListener('click', async () => {
    if (!state.mission.skippedExercises) state.mission.skippedExercises = [];
    state.mission.skippedExercises.push(exercise.id);
    state.mission.currentExerciseIndex += 1;
    state.mission = await saveMission(state.mission);

    const next = getCurrentExercise(state.mission);
    if (!next) renderComplete(false);
    else renderActive();
  });
}

function renderChecklistActive(exercises) {
  const unit = state.settings?.weightUnit || 'kg';

  const items = exercises
    .map((ex) => {
      const done = state.checklistDone.has(ex.id) || state.setLogs.some((l) => l.exerciseId === ex.id);
      const rx = formatPrescriptionForDisplay(ex, unit);
      return `
        <div class="checklist-item ${done ? 'done' : ''}" data-id="${ex.id}">
          <input type="checkbox" id="chk-${ex.id}" ${done ? 'checked disabled' : ''}>
          <label for="chk-${ex.id}">
            <strong>${escapeHtml(formatExerciseName(ex.name))}</strong>
            ${rx ? `<br><span style="font-size:12px;color:var(--text-muted)">${escapeHtml(rx)}</span>` : ''}
          </label>
        </div>
      `;
    })
    .join('');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">${escapeHtml(state.blueprint.operation)} — Checklist</p>
        <p class="campaign-meta" style="margin-bottom:16px">Tap each item when done</p>
        ${items}
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-primary" id="btn-finish-checklist">Finish Mission</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.checklist-item').forEach((el) => {
    if (el.classList.contains('done')) return;
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const exercise = exercises.find((e) => e.id === id);
      if (!exercise || state.checklistDone.has(id)) return;

      await logSet(state.mission, exercise, 1, { notes: '' });
      state.checklistDone.add(id);
      state.setLogs = await getSetLogsForMission(state.mission.id);
      renderChecklistActive(exercises);
    });
  });

  $('#btn-finish-checklist').addEventListener('click', () => renderComplete(false));
}

async function renderChecklistItem(exercise, exercises) {
  const unit = state.settings?.weightUnit || 'kg';
  const rx = formatPrescriptionForDisplay(exercise, unit);
  const isOptional = exercise.type === 'optional';
  const prev = await getPreviousPerformance(exercise.id, state.mission.id);
  const fields = prepareFields(exercise, prev, state.settings);

  const exIndex = exercises.indexOf(exercise);
  const totalExercises = exercises.length;
  const progress = (exIndex / totalExercises) * 100;

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-body">
        <div class="progress-bar-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <p class="progress-label">Exercise ${exIndex + 1} of ${totalExercises}</p>
        </div>

        <div class="exercise-card">
          <h2 class="exercise-name">${escapeHtml(formatExerciseName(exercise.name))}</h2>
          <p class="exercise-rx">${escapeHtml(rx)}</p>
          ${renderPreviousBlock(prev)}
        </div>

        ${buildAdjustmentPanel(exercise, fields)}
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-primary" id="btn-done-segment">Complete Exercise</button>
        ${isOptional ? '<button type="button" class="btn-secondary" id="btn-skip-segment">Skip</button>' : ''}
      </div>
    </div>
  `;

  bindDials(screenRoot);

  $('#btn-done-segment').addEventListener('click', async () => {
    const actual = collectActualFromForm(exercise);
    await logSet(state.mission, exercise, 1, actual);
    const { done, mission } = advanceMissionPointer(state.mission);
    state.mission = await saveMission(mission);
    await afterExerciseComplete(done);
  });

  $('#btn-skip-segment')?.addEventListener('click', async () => {
    if (!state.mission.skippedExercises) state.mission.skippedExercises = [];
    state.mission.skippedExercises.push(exercise.id);
    state.mission.currentExerciseIndex += 1;
    state.mission = await saveMission(state.mission);
    const next = getCurrentExercise(state.mission);
    if (!next) renderComplete(false);
    else renderActive();
  });
}

async function renderComplete(alreadyDone = false) {
  clearRestTimer();
  state.screen = 'complete';
  showFdsBar(false);
  setHeader('Debrief');

  state.setLogs = await getSetLogsForMission(state.mission.id);
  const suggested = computeSuggestedRating(state.mission, state.setLogs);
  state.selectedRating = state.mission.rating || suggested;

  if (!alreadyDone) {
    screenRoot.innerHTML = `
      <div class="screen">
        <div class="screen-scroll">
          <div class="complete-banner">
            <p class="complete-title">Mission Complete</p>
            <p class="complete-sub">${state.setLogs.length} exercises logged</p>
          </div>

          <p class="section-label">Rate This Mission</p>
          <div class="rating-grid" id="rating-grid">
            ${ratingButton('perfect', 'Perfect')}
            ${ratingButton('full', 'Full')}
            ${ratingButton('minimum', 'Minimum / FDS')}
            ${ratingButton('recovery', 'Recovery')}
            ${ratingButton('abandoned', 'Abandoned')}
          </div>
          <div id="coach-preview" class="coach-note"></div>
        </div>
        <div class="screen-footer">
          <button type="button" class="btn-primary" id="btn-save-complete">Confirm & Return</button>
        </div>
      </div>
    `;

    bindRatingButtons();
    updateCoachPreview();

    $('#btn-save-complete').addEventListener('click', async () => {
      state.mission = await completeMission(state.mission, state.selectedRating);
      await updateIntegrityAfterMission(state.mission);
      renderComplete(true);
    });
  } else {
    const weekly = await getCompletedMissionsThisWeek();
    const stats = await getWeeklyStats(weekly);
    const integrity = await getIntegrity();
    const note = await CoachService.getPostMissionNote(state.mission, {
      setLogs: state.setLogs,
      weeklyCount: stats.weeklyCount,
      integrity
    });

    screenRoot.innerHTML = `
      <div class="screen">
        <div class="screen-scroll">
          <div class="complete-banner">
            <p class="complete-title">${ratingLabel(state.mission.rating)}</p>
            <p class="complete-sub">${escapeHtml(state.blueprint.dayName)} · ${escapeHtml(state.blueprint.operation)}</p>
          </div>
          <div class="coach-note">${escapeHtml(note)}</div>
          <div class="integrity-bar">
            <strong>This week</strong><br>
            ${stats.completed} missions · ${stats.executionRate}% execution
            ${stats.fdsThisWeek ? ` · ${stats.fdsThisWeek} FDS` : ''}
          </div>
        </div>
        <div class="screen-footer">
          <button type="button" class="btn-primary" id="btn-return-centre">Return to Command Centre</button>
        </div>
      </div>
    `;

    $('#btn-return-centre').addEventListener('click', () => goHome());
  }
}

function ratingButton(value, label) {
  const selected = state.selectedRating === value ? 'selected' : '';
  return `<button type="button" class="rating-btn ${selected}" data-rating="${value}">${label}</button>`;
}

function ratingLabel(rating) {
  const labels = {
    perfect: 'Perfect Mission',
    full: 'Full Mission',
    minimum: 'Minimum — FDS',
    recovery: 'Recovery Mission',
    abandoned: 'Abandoned'
  };
  return labels[rating] || 'Mission Logged';
}

function bindRatingButtons() {
  document.querySelectorAll('.rating-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedRating = btn.dataset.rating;
      document.querySelectorAll('.rating-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateCoachPreview();
    });
  });
}

async function updateCoachPreview() {
  const el = $('#coach-preview');
  if (!el) return;
  const integrity = await getIntegrity();
  const weekly = await getCompletedMissionsThisWeek();
  const stats = await getWeeklyStats(weekly);
  const previewMission = { ...state.mission, rating: state.selectedRating, isFds: state.selectedRating === 'minimum' };
  const note = await CoachService.getPostMissionNote(previewMission, {
    setLogs: state.setLogs,
    weeklyCount: stats.weeklyCount + 1,
    integrity
  });
  el.textContent = note;
}

function openFdsOverlay() {
  const todayOptions = state.blueprint.exercises
    .slice(0, 6)
    .map(
      (ex) =>
        `<button type="button" class="fds-option" data-fds='${JSON.stringify({ id: ex.id, name: ex.name, type: ex.type })}'>${escapeHtml(formatExerciseName(ex.name))} (today)</button>`
    )
    .join('');

  const fallbackOptions = FDS_FALLBACKS.map(
    (ex) =>
      `<button type="button" class="fds-option" data-fds='${JSON.stringify({ id: ex.id, name: ex.name, type: ex.type })}'>${escapeHtml(formatExerciseName(ex.name))}</button>`
  ).join('');

  overlayContent.innerHTML = `
    <p class="overlay-title">FDS — Do Something</p>
    <p class="overlay-sub">Pick one thing. Integrity preserved. Not a zero day.</p>
    ${todayOptions}
    ${fallbackOptions}
    <button type="button" class="btn-secondary" id="btn-cancel-fds">Cancel</button>
  `;

  overlay.classList.remove('hidden');

  overlayContent.querySelectorAll('.fds-option').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const fdsExercise = JSON.parse(btn.dataset.fds);
      closeOverlay();

      if (state.mission.status !== MISSION_STATUS.ACTIVE) {
        state.mission = await startMission(state.mission);
      }

      const stubExercise = { id: fdsExercise.id, name: fdsExercise.name, type: fdsExercise.type || 'open' };
      await logSet(state.mission, stubExercise, 1, { notes: 'FDS' });

      state.mission = await completeMission(state.mission, MISSION_RATINGS.MINIMUM, {
        isFds: true,
        fdsExercise: stubExercise
      });
      await updateIntegrityAfterMission(state.mission);
      state.setLogs = await getSetLogsForMission(state.mission.id);
      renderComplete(true);
    });
  });

  $('#btn-cancel-fds').addEventListener('click', closeOverlay);
}

function closeOverlay() {
  overlay.classList.add('hidden');
  overlayContent.innerHTML = '';
}

init();
