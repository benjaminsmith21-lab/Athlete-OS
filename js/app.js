import { OPERATIONS, FDS_FALLBACKS } from './seed/blueprint-v1.js';
import { getActiveCampaign, getTodayBlueprint, getCampaignWeek, updateCampaignBodyMetrics } from './services/campaign.js';
import {
  getExerciseHistory,
  getOrCreateTodayMission,
  getMission,
  saveMission,
  startMission,
  abortMission,
  logSet,
  getSetLogsForMission,
  getPreviousPerformance,
  completeMission,
  getCompletedMissionsThisWeek,
  getMissionHistory,
  deleteCompletedMission,
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
  formatIntegritySummary,
  adjustIntegrityAfterDelete
} from './services/integrity.js';
import {
  getSettings,
  saveSettings,
  kgToUnit,
  convertWeight,
  weightStep,
  bodyweightStart
} from './services/settings.js';
import { getMonthHeatmapData, renderIntegrityHeatmapTile } from './services/heatmap.js';
import {
  getAllMeasurements,
  getTodayMeasurement,
  getLatestStoredMeasurement,
  getMeasurementById,
  saveDailyMeasurement,
  deleteMeasurement,
  checkOutlierBeforeSave,
  getDaysSinceLastWaist,
  validateMeasurementInput
} from './services/bodyMeasurement.js';
import {
  getLatestMeasurement,
  getMeasurementForDate,
  getCurrentSevenDayAverage,
  getThirtyDayChange,
  getCampaignWeightChange,
  getWeighInConsistency,
  formatWeightChange
} from './services/bodyTrend.js';
import { getBodyCoachInsights, getHighConfidenceInsight, updateCampaignBaselineIfReady } from './services/bodyCoach.js';
import { renderWeightChartSvg, getChartDateRange } from './services/bodyChart.js';
import {
  exportBodyMeasurementsCsv,
  downloadCsv,
  parseBodyCsv,
  detectImportConflicts,
  applyBackup,
  applyBodyMeasurementsImport,
  validateBackup,
  summarizeBackup
} from './services/backup.js';
import {
  getBackupSnapshots,
  restoreBackupSnapshot,
  getSnapshotLabel
} from './services/backupSnapshot.js';
import {
  requestPersistentStorage,
  markBackupDirty,
  runAutoExportIfNeeded,
  performBackupExport,
  shareLatestBackup,
  getBackupStatusLine,
  formatLastBackupLabel,
  isLikelyFreshInstall
} from './services/backupScheduler.js';
import {
  importGarminSnapshot,
  getGarminSyncState,
  getAllDailyHealth,
  getGarminActivities,
  formatDurationSeconds,
  formatDistanceMeters,
  formatActivityType,
  formatGarminSyncTime
} from './services/garminImport.js';
import {
  getRecentDailyHealth,
  getSleepSevenDayAverage,
  getRhrSevenDayAverage,
  getHrvSevenDayAverage,
  getStepsSevenDayAverage,
  getStressSevenDayAverage,
  formatSleepDuration,
  buildRecoveryTeaserLine,
  daysSinceIsoDate
} from './services/garminTrend.js';
import { getGarminCoachInsights } from './services/garminCoach.js';
import {
  buildCampaignReviewData,
  buildWeekStrip,
  isReviewWeek
} from './services/campaignReview.js';
import { renderGarminChartSvg, getGarminChartDateRange } from './services/garminChart.js';
import { getProgressionHints, formatExerciseHistoryRows } from './services/progressionCoach.js';
import { getAll } from './db.js';
import { getLocalDateString, formatDisplayDate } from './utils/datetime.js';

const state = {
  screen: 'centre',
  campaign: null,
  blueprint: null,
  mission: null,
  setLogs: [],
  settings: null,
  selectedRating: null,
  checklistDone: new Set(),
  exerciseStarted: false,
  exerciseStartedAt: null,
  exerciseNoteDraft: '',
  fdsSelection: [],
  workoutHistory: [],
  bodyMeasurements: [],
  chartRange: 'campaign',
  garminChartMetric: 'sleep',
  garminChartRange: '30d',
  bodySaveFlash: null,
  importPreview: null,
  pendingWeighInDate: null,
  pendingBackup: null,
  pendingBackupMode: 'merge',
  garminImportFlash: null,
  backupBanner: null
};

let restTimerInterval = null;
let exerciseTimerInterval = null;
let restCompleteAudio = null;

const REST_COMPLETE_SOUND_LEAD_SECONDS = 3;
const REST_COMPLETE_SOUND_URL = './assets/audio/rest-complete.wav';

const $ = (sel) => document.querySelector(sel);
const screenRoot = $('#screen-root');
const headerContext = $('#header-context');
const overlay = $('#overlay');
const overlayContent = $('#overlay-content');

function renderBootError(message) {
  if (!screenRoot) return;
  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">Load Error</p>
        <p class="boot-error">${escapeHtml(message)}</p>
        <p class="boot-error-hint">Try a hard refresh. On mobile: clear site data for this address, then reload.</p>
      </div>
    </div>
  `;
}

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

function setHeader(text) {
  headerContext.textContent = text || '';
}

function clearRestTimer(stopSound = true) {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  if (stopSound) stopRestCompleteSound();
}

function getRestCompleteAudio() {
  if (!restCompleteAudio) {
    restCompleteAudio = new Audio(REST_COMPLETE_SOUND_URL);
  }
  return restCompleteAudio;
}

function preloadRestCompleteSound() {
  try {
    getRestCompleteAudio().load();
  } catch {
    /* ignore preload failures */
  }
}

/** Unlock audio during a user gesture so delayed rest-end playback works on mobile. */
function unlockRestCompleteSound() {
  if (!state.settings?.restTimerSoundEnabled) return;
  try {
    const audio = getRestCompleteAudio();
    const played = audio.play();
    if (played) {
      played
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

function playRestCompleteSound() {
  if (!state.settings?.restTimerSoundEnabled) return;
  try {
    const audio = getRestCompleteAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    /* ignore playback failures */
  }
}

function stopRestCompleteSound() {
  if (!restCompleteAudio) return;
  try {
    restCompleteAudio.pause();
    restCompleteAudio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

function maybePlayRestCompleteSound(remaining, totalSeconds, restSoundPlayed) {
  if (restSoundPlayed.value || !state.settings?.restTimerSoundEnabled) return;
  const triggerAt =
    totalSeconds < REST_COMPLETE_SOUND_LEAD_SECONDS
      ? totalSeconds
      : REST_COMPLETE_SOUND_LEAD_SECONDS;
  if (remaining === triggerAt) {
    restSoundPlayed.value = true;
    playRestCompleteSound();
  }
}

function clearExerciseTimer() {
  if (exerciseTimerInterval) {
    clearInterval(exerciseTimerInterval);
    exerciseTimerInterval = null;
  }
}

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getWorkoutElapsedSeconds() {
  if (!state.mission?.startedAt) return 0;
  return (Date.now() - new Date(state.mission.startedAt).getTime()) / 1000;
}

function getExerciseElapsedSeconds() {
  if (!state.exerciseStartedAt) return 0;
  return (Date.now() - state.exerciseStartedAt) / 1000;
}

function renderTimerStrip() {
  const workout = formatElapsed(getWorkoutElapsedSeconds());
  const exercise = state.exerciseStarted ? formatElapsed(getExerciseElapsedSeconds()) : null;
  return `
    <div class="timer-strip">
      <span class="timer-item">Workout ${workout}</span>
      ${exercise ? `<span class="timer-item">Exercise ${exercise}</span>` : ''}
    </div>
  `;
}

async function goHome() {
  clearRestTimer();
  clearExerciseTimer();
  closeOverlay();
  state.mission = await getMission(state.mission.id);
  state.setLogs = await getSetLogsForMission(state.mission.id);
  renderCentre();
}

function toggleSettings() {
  if (state.screen === 'settings') {
    renderCentre();
    return;
  }
  renderSettings();
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

  if (prev?.lastActual?.elapsedSeconds) {
    fields.runDurationMinutes = Math.round(prev.lastActual.elapsedSeconds / 60);
  }

  return fields;
}

function renderProgressionHintsHtml(hints) {
  if (!hints?.length) return '';
  return hints
    .map(
      (h) => `
      <div class="coach-note progression-hint body-coach-${h.type}">
        <strong>${escapeHtml(h.title)}</strong><br>${escapeHtml(h.message)}
      </div>
    `
    )
    .join('');
}

function renderExerciseHistoryHtml(rows) {
  if (!rows?.length || rows.length <= 1) return '';
  return `
    <div class="exercise-history">
      <p class="exercise-history-label">Recent sessions</p>
      <table class="exercise-history-table">
        <tbody>
          ${rows
            .map(
              (r) =>
                `<tr><td>${escapeHtml(formatDisplayDate(r.date))}</td><td>${escapeHtml(r.summary)}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderWeekStripHtml(days) {
  const statusClass = {
    completed: 'week-dot--done',
    fds: 'week-dot--fds',
    missed: 'week-dot--missed',
    rest: 'week-dot--rest',
    upcoming: 'week-dot--upcoming'
  };
  return `
    <div class="week-strip" aria-label="This week">
      ${days
        .map(
          (d) => `
        <div class="week-strip-day ${d.isToday ? 'week-strip-day--today' : ''}">
          <span class="week-strip-label">${d.label}</span>
          <span class="week-dot ${statusClass[d.status] || ''}" title="${escapeHtml(d.status)}"></span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
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

function showRunDurationField(exercise) {
  return exercise.type === 'distance' && exercise.id === 'mon-z2';
}

function buildAdjustmentPanel(exercise, fields) {
  const unit = state.settings?.weightUnit || 'kg';
  const wStep = weightStep(unit);
  const isBw = fields.weightLabel === 'bodyweight' || (!exercise.weight && showWeightField(exercise));

  let html = '<div class="adjust-panel" id="adjust-panel">';

  if (showSetsField(exercise)) {
    html += renderDialRow('Sets', 'adj-sets', fields.sets, { min: 1, max: 20, step: 1 });
  }

  if (showRepsField(exercise)) {
    html += renderDialRow('Reps', 'adj-reps', fields.reps, { min: 1, max: 50, step: 1 });
  }

  if (showWeightField(exercise)) {
    html += renderDialRow(`Weight (${unit})`, 'adj-weight', fields.weight, {
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

  if (showRunDurationField(exercise)) {
    html += renderDialRow('Duration (min)', 'adj-run-duration', fields.runDurationMinutes ?? '', {
      min: 1,
      max: 180,
      step: 1
    });
  }

  html += '</div>';

  return html;
}

function renderNoteButton(note) {
  if (note) {
    const preview = note.length > 24 ? `${note.slice(0, 24)}…` : note;
    return `<button type="button" class="exercise-note-link has-note" id="btn-exercise-note" title="${escapeHtml(note)}">${escapeHtml(preview)}</button>`;
  }
  return `<button type="button" class="exercise-note-link" id="btn-exercise-note">+ note</button>`;
}

function formatNextExercisePreview(exercise, prev, unit) {
  const name = formatExerciseName(exercise.name);
  let detail = formatPrescriptionForDisplay(exercise, unit);

  if (prev?.lastActual) {
    const a = prev.lastActual;
    const displayUnit = a.weightUnit || unit;
    let weight = a.weight;
    if (weight != null && displayUnit !== unit) {
      weight = convertWeight(weight, displayUnit, unit);
    }

    if (weight && a.reps && a.sets) {
      detail = `${weight}${unit} × ${a.reps} × ${a.sets} sets`;
    } else if (weight && a.reps) {
      detail = `${weight}${unit} × ${a.reps}`;
    } else if (a.weightLabel === 'bodyweight' && a.reps && a.sets) {
      detail = `BW × ${a.reps} × ${a.sets} sets`;
    } else if (a.weightLabel === 'bodyweight' && a.reps) {
      detail = `BW × ${a.reps}`;
    } else if (a.reps && a.sets) {
      detail = `${a.reps} × ${a.sets} sets`;
    } else if (prev.summary) {
      detail = prev.summary.includes(':') ? prev.summary.split(':').slice(1).join(':').trim() : prev.summary;
    }
  }

  const noteHtml = prev?.lastNote
    ? `<p class="rest-next-note">${escapeHtml(prev.lastNote)}</p>`
    : '';

  return `
    <div class="rest-next">
      <p class="rest-next-title">Up next: <strong>${escapeHtml(name)}</strong></p>
      <p class="rest-next-detail">${escapeHtml(detail)}</p>
      ${noteHtml}
    </div>
  `;
}

function beginExerciseTimer() {
  state.exerciseStarted = true;
  state.exerciseStartedAt = Date.now();
  startActiveTimerTick();
}

function openNoteOverlay() {
  overlayContent.innerHTML = `
    <p class="overlay-title">Exercise Note</p>
    <p class="overlay-sub">Saved for next time you do this exercise.</p>
    <textarea id="note-edit" class="note-edit" placeholder="Optional">${escapeHtml(state.exerciseNoteDraft)}</textarea>
    <button type="button" class="btn-primary" id="btn-save-note">Save</button>
    <button type="button" class="btn-secondary" id="btn-cancel-note">Cancel</button>
  `;
  overlay.classList.remove('hidden');

  $('#btn-save-note').addEventListener('click', () => {
    state.exerciseNoteDraft = $('#note-edit').value.trim();
    closeOverlay();
    refreshActiveExerciseView();
  });

  $('#btn-cancel-note').addEventListener('click', closeOverlay);
}

function bindNoteButton() {
  $('#btn-exercise-note')?.addEventListener('click', openNoteOverlay);
}

function refreshActiveExerciseView() {
  const row = $('.exercise-note-row');
  if (row) {
    row.innerHTML = renderNoteButton(state.exerciseNoteDraft);
    bindNoteButton();
  }
}

function startActiveTimerTick() {
  clearExerciseTimer();
  exerciseTimerInterval = setInterval(() => {
    const strip = $('.timer-strip');
    if (strip) {
      strip.outerHTML = renderTimerStrip();
    } else {
      clearExerciseTimer();
    }
  }, 1000);
}

function bindExerciseActions(exercise) {
  bindDials(screenRoot);
  bindNoteButton();

  $('#btn-complete-exercise')?.addEventListener('click', async () => {
    unlockRestCompleteSound();
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

function renderActiveExerciseBody(exercise, prev, fields, exIndex, totalExercises, rx, historyRows = [], hints = []) {
  const progress = (exIndex / totalExercises) * 100;
  state.exerciseNoteDraft = fields.notes || '';

  return `
    <div class="progress-bar-wrap">
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <p class="progress-label">Exercise ${exIndex + 1} of ${totalExercises}</p>
    </div>

    ${renderTimerStrip()}

    <div class="exercise-card">
      <h2 class="exercise-name">${escapeHtml(formatExerciseName(exercise.name))}</h2>
      <p class="exercise-rx">${escapeHtml(rx)}</p>
      <div class="exercise-note-row">${renderNoteButton(state.exerciseNoteDraft)}</div>
      ${renderPreviousBlock(prev, historyRows, hints)}
    </div>

    ${buildAdjustmentPanel(exercise, fields)}
  `;
}

function renderActiveExerciseFooter(exercise) {
  return `
    <button type="button" class="btn-primary" id="btn-complete-exercise">Complete Exercise</button>
    ${exercise.type === 'optional' ? '<button type="button" class="btn-secondary" id="btn-skip">Skip</button>' : ''}
  `;
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
  const runDuration = getDialValue('adj-run-duration');

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
  if (runDuration != null && showRunDurationField(exercise)) {
    actual.elapsedSeconds = Math.round(runDuration * 60);
  } else if (state.exerciseStartedAt) {
    actual.elapsedSeconds = Math.round(getExerciseElapsedSeconds());
  }

  if (state.exerciseNoteDraft) actual.notes = state.exerciseNoteDraft;

  return actual;
}

function renderPreviousBlock(prev, historyRows = [], hints = []) {
  let html = '';
  if (prev) {
    html += `<p class="exercise-prev">Last time: <span>${escapeHtml(prev.summary)}</span></p>`;
  }
  html += renderExerciseHistoryHtml(historyRows);
  html += renderProgressionHintsHtml(hints);
  return html;
}

async function afterExerciseComplete(done) {
  clearExerciseTimer();
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

async function renderRestTimer(totalSeconds, onDone) {
  clearRestTimer();
  clearExerciseTimer();
  state.screen = 'rest';
  setHeader('Rest');

  const settings = state.settings || (await getSettings());
  const unit = settings.weightUnit || 'kg';
  const exercises = state.mission.exercises.filter((e) => !state.mission.skippedExercises?.includes(e.id));
  const nextIndex = state.mission.currentExerciseIndex;
  const nextExercise = settings.showNextExerciseOnRest ? exercises[nextIndex] : null;

  let nextPreviewHtml = '';
  if (nextExercise) {
    const prev = await getPreviousPerformance(nextExercise.id, state.mission.id);
    nextPreviewHtml = formatNextExercisePreview(nextExercise, prev, unit);
  }

  let remaining = totalSeconds;
  const restSoundPlayed = { value: false };

  if (settings.restTimerSoundEnabled) {
    preloadRestCompleteSound();
    maybePlayRestCompleteSound(remaining, totalSeconds, restSoundPlayed);
  }

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
          ${nextPreviewHtml}
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
      clearRestTimer(false);
      onDone();
    } else {
      maybePlayRestCompleteSound(remaining, totalSeconds, restSoundPlayed);
      render();
    }
  }, 1000);
}

async function init() {
  try {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update();
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch(() => {});

      setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update()).catch(() => {});
      }, 60 * 60 * 1000);
    }

    state.settings = await getSettings();
    await requestPersistentStorage();
    state.campaign = await getActiveCampaign();
    state.blueprint = await getTodayBlueprint();
    if (!state.blueprint) {
      throw new Error('No workout blueprint found for today.');
    }
    state.mission = await getOrCreateTodayMission(state.blueprint);
    state.setLogs = await getSetLogsForMission(state.mission.id);

    const autoBackup = await runAutoExportIfNeeded();
    if (autoBackup) {
      state.backupBanner = {
        message: 'Backup saved to Downloads',
        data: autoBackup.data,
        filename: autoBackup.filename
      };
    }

    const freshInstall =
      !state.settings.restorePromptDismissed && (await isLikelyFreshInstall());

    if (state.mission.status === MISSION_STATUS.COMPLETE) {
      renderComplete(true);
    } else {
      renderCentre();
    }

    if (freshInstall) {
      openFirstRunRestoreOverlay();
    }

    $('#btn-home').addEventListener('click', goHome);
    $('#btn-settings').addEventListener('click', () => toggleSettings());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  } catch (err) {
    console.error('Athlete OS init failed:', err);
    renderBootError(err?.message || 'Unknown error');
  }
}

async function loadBodyMeasurements() {
  state.bodyMeasurements = await getAllMeasurements();
  return state.bodyMeasurements;
}

function formatKg(value, provisional = false) {
  if (value == null) return 'More data required';
  return `${value.toFixed(1)} kg${provisional ? ' *' : ''}`;
}

async function buildBodyStatusCardHtml() {
  const measurements = state.bodyMeasurements || [];
  const today = getLocalDateString();
  const todayM = getMeasurementForDate(measurements, today);
  const latest = getLatestMeasurement(measurements);
  const seven = getCurrentSevenDayAverage(measurements, today);
  const thirty = getThirtyDayChange(measurements, today);
  const insight = getHighConfidenceInsight(measurements, state.campaign, today);
  const flash = state.bodySaveFlash ? `<p class="body-save-flash">${escapeHtml(state.bodySaveFlash)}</p>` : '';
  const dailyHealth = await getAllDailyHealth();
  const recoveryTeaser = buildRecoveryTeaserLine(dailyHealth, today);
  const recoveryHtml = recoveryTeaser
    ? `<p class="body-status-recovery">${escapeHtml(recoveryTeaser)}</p>`
    : '';

  const logLabel = todayM ? "EDIT TODAY'S WEIGH-IN" : 'LOG WEIGHT';
  const logId = todayM ? 'btn-edit-weight' : 'btn-log-weight';

  if (!measurements.length) {
    const viewHealthLink = dailyHealth.length
      ? `<div class="body-status-header"><p class="section-label">Body Status</p><button type="button" class="body-status-link" id="btn-view-body-comp">View health</button></div>`
      : '<p class="section-label">Body Status</p>';
    return `
      <div class="body-status-card">
        ${viewHealthLink}
        <p class="body-status-empty">No weigh-ins recorded.</p>
        <p class="body-status-hint">Your trend starts with today's reading.</p>
        ${recoveryHtml}
        ${flash}
        <button type="button" class="btn-secondary btn-fds-inline" id="${logId}">${logLabel}</button>
      </div>
    `;
  }

  if (todayM) {
    const avgLabel = seven.provisional ? '7-day average (provisional)' : '7-day average';
    return `
      <div class="body-status-card body-status-card--logged">
        <div class="body-status-header">
          <p class="section-label">Body Status</p>
          <button type="button" class="body-status-link" id="btn-view-body-comp">View health</button>
        </div>
        <div class="body-status-grid">
          <div class="body-status-stat">
            <span class="body-status-label">Today</span>
            <span class="body-status-value">${todayM.weightKg.toFixed(1)} kg</span>
          </div>
          <div class="body-status-stat">
            <span class="body-status-label">${avgLabel}</span>
            <span class="body-status-value">${formatKg(seven.average, seven.provisional)}</span>
          </div>
          <div class="body-status-stat">
            <span class="body-status-label">30-day change</span>
            <span class="body-status-value">${formatWeightChange(thirty.change)}</span>
          </div>
        </div>
        ${recoveryHtml}
        ${insight ? `<p class="body-status-insight">${escapeHtml(insight.message)}</p>` : ''}
        ${flash}
        <button type="button" class="btn-secondary btn-fds-inline" id="${logId}">${logLabel}</button>
      </div>
    `;
  }

  return `
    <div class="body-status-card">
      <div class="body-status-header">
        <p class="section-label">Body Status</p>
        <button type="button" class="body-status-link" id="btn-view-body-comp">View health</button>
      </div>
      <div class="body-status-grid">
        <div class="body-status-stat">
          <span class="body-status-label">Last recorded</span>
          <span class="body-status-value">${latest.weightKg.toFixed(1)} kg</span>
        </div>
        <div class="body-status-stat">
          <span class="body-status-label">Today</span>
          <span class="body-status-value body-status-not-recorded">NOT RECORDED</span>
        </div>
      </div>
      ${recoveryHtml}
      ${flash}
      <button type="button" class="btn-secondary btn-fds-inline" id="${logId}">${logLabel}</button>
    </div>
  `;
}

function bindBodyStatusCard() {
  $('#btn-log-weight')?.addEventListener('click', () => openWeighInOverlay());
  $('#btn-edit-weight')?.addEventListener('click', () => openWeighInOverlay(true));
  $('#btn-view-body-comp')?.addEventListener('click', () => renderBodyComposition());
}

async function openWeighInOverlay(isEdit = false, measurementId = null) {
  let editing = null;
  if (measurementId) {
    editing = await getMeasurementById(measurementId);
  } else if (isEdit) {
    editing = await getTodayMeasurement();
  }
  const latest = await getLatestStoredMeasurement();
  const prefill = editing?.weightKg ?? latest?.weightKg ?? '';
  const showDetails = !!(editing?.bodyFatPercent || editing?.waistCm || editing?.note);
  const daysSinceWaist = await getDaysSinceLastWaist();
  const waistPrompt =
    !measurementId && daysSinceWaist >= 7
      ? '<p class="weigh-in-waist-prompt">Weekly waist measurement is available today.</p>'
      : '';

  state.pendingWeighInDate = editing?.date || null;

  overlayContent.innerHTML = `
    <div class="weigh-in-form">
      <p class="overlay-title">Daily Weigh-In</p>
      <div class="weigh-in-primary">
        <label class="weigh-in-label" for="weigh-in-weight">Body weight</label>
        <div class="weigh-in-weight-field">
          <input type="text" inputmode="decimal" id="weigh-in-weight" class="weigh-in-weight-input" value="${prefill}" aria-label="Body weight in kilograms">
          <span class="weigh-in-unit">kg</span>
        </div>
      </div>
      <p class="weigh-in-error hidden" id="weigh-in-error"></p>
      ${waistPrompt}
      <button type="button" class="btn-ghost" id="btn-toggle-details">${showDetails ? 'Hide details' : 'Add details'}</button>
      <div class="weigh-in-details ${showDetails ? '' : 'hidden'}" id="weigh-in-details">
        <label class="weigh-in-label" for="weigh-in-fat">Estimated body fat</label>
        <div class="weigh-in-weight-row">
          <input type="text" inputmode="decimal" id="weigh-in-fat" class="weigh-in-detail-input" value="${editing?.bodyFatPercent ?? ''}" placeholder="Optional" aria-label="Estimated body fat percentage">
          <span class="weigh-in-unit">%</span>
        </div>
        <label class="weigh-in-label" for="weigh-in-waist">Waist</label>
        <div class="weigh-in-weight-row">
          <input type="text" inputmode="decimal" id="weigh-in-waist" class="weigh-in-detail-input" value="${editing?.waistCm ?? ''}" placeholder="Optional" aria-label="Waist in centimetres">
          <span class="weigh-in-unit">cm</span>
        </div>
        <label class="weigh-in-label" for="weigh-in-note">Note</label>
        <textarea id="weigh-in-note" class="note-edit" placeholder="Optional">${escapeHtml(editing?.note || '')}</textarea>
      </div>
      <button type="button" class="btn-primary" id="btn-save-weigh-in">${editing ? 'Save Weigh-In' : 'Save Weigh-In'}</button>
      <button type="button" class="btn-secondary" id="btn-cancel-weigh-in">Cancel</button>
    </div>
  `;
  overlay.classList.add('overlay--weigh-in');
  overlay.classList.remove('hidden');

  const weightInput = $('#weigh-in-weight');
  weightInput.focus();
  weightInput.select();

  $('#btn-toggle-details').addEventListener('click', () => {
    $('#weigh-in-details').classList.toggle('hidden');
    $('#btn-toggle-details').textContent = $('#weigh-in-details').classList.contains('hidden')
      ? 'Add details'
      : 'Hide details';
  });

  $('#btn-save-weigh-in').addEventListener('click', () => submitWeighIn());
  $('#btn-cancel-weigh-in').addEventListener('click', closeOverlay);
}

function collectWeighInForm() {
  return {
    weightKg: $('#weigh-in-weight')?.value,
    bodyFatPercent: $('#weigh-in-fat')?.value,
    waistCm: $('#weigh-in-waist')?.value,
    note: $('#weigh-in-note')?.value
  };
}

async function submitWeighIn(skipChecks = {}) {
  const form = collectWeighInForm();
  const validation = validateMeasurementInput(form);
  const errEl = $('#weigh-in-error');
  if (!validation.valid) {
    errEl.textContent = validation.errors.join(' ');
    errEl.classList.remove('hidden');
    return;
  }

  if (!skipChecks.softRange && validation.softRangeWarning) {
    openWeighInConfirm(validation.softRangeWarning, () => submitWeighIn({ softRange: true, outlier: skipChecks.outlier }));
    return;
  }

  const today = getLocalDateString();
  if (!skipChecks.outlier) {
    const outlier = await checkOutlierBeforeSave(validation.parsed.weightKg, today);
    if (outlier.isOutlier) {
      openWeighInConfirm(
        `This reading is unusually different from your recent trend.\n${outlier.recentAverage?.toFixed(1)} kg recent average\n${validation.parsed.weightKg.toFixed(1)} kg entered\n\nSave anyway?`,
        () => submitWeighIn({ softRange: true, outlier: true })
      );
      return;
    }
  }

  const result = await saveDailyMeasurement(form, {
    date: state.pendingWeighInDate || undefined
  });
  if (!result.ok) {
    errEl.textContent = result.errors.join(' ');
    errEl.classList.remove('hidden');
    return;
  }

  await loadBodyMeasurements();
  const baseline = await updateCampaignBaselineIfReady(state.bodyMeasurements, state.campaign);
  if (baseline) {
    state.campaign = await updateCampaignBodyMetrics(baseline);
  }

  closeOverlay();
  state.pendingWeighInDate = null;
  state.bodySaveFlash = 'Weigh-in saved';
  await markBackupDirty();
  setTimeout(() => {
    state.bodySaveFlash = null;
  }, 2500);

  if (state.screen === 'body') renderBodyComposition();
  else renderCentre();
}

function openWeighInConfirm(message, onConfirm) {
  overlayContent.innerHTML = `
    <div class="weigh-in-form">
      <p class="overlay-title">Confirm</p>
      <p class="overlay-sub">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <button type="button" class="btn-primary" id="btn-confirm-weigh-in">Save anyway</button>
      <button type="button" class="btn-secondary" id="btn-back-weigh-in">Go back</button>
    </div>
  `;
  $('#btn-confirm-weigh-in').addEventListener('click', () => {
    closeOverlay();
    onConfirm();
  });
  $('#btn-back-weigh-in').addEventListener('click', () => openWeighInOverlay(true));
}

function formatGarminRollingSub(rolling, formatter) {
  if (rolling.average == null) return '';
  const label = rolling.provisional ? '7-day avg (provisional)' : '7-day avg';
  const value = formatter(rolling.average);
  return `<span class="body-metric-sub">${label}: ${value}${rolling.provisional ? ' *' : ''}</span>`;
}

function buildRecoverySectionHtml(dailyHealth, activities, garminSync, today) {
  if (!dailyHealth.length) {
    return `
      <div class="health-section health-section--recovery">
        <p class="section-label">Recovery</p>
        <p class="health-empty">Import a Garmin snapshot in Settings to see sleep, heart rate, and activity trends.</p>
      </div>
    `;
  }

  const latest = getRecentDailyHealth(dailyHealth, today);
  const dateLabel = latest ? formatDisplayDate(latest.localDate) : '—';
  const sleepSeven = getSleepSevenDayAverage(dailyHealth, today);
  const rhrSeven = getRhrSevenDayAverage(dailyHealth, today);
  const hrvSeven = getHrvSevenDayAverage(dailyHealth, today);
  const stepsSeven = getStepsSevenDayAverage(dailyHealth, today);
  const stressSeven = getStressSevenDayAverage(dailyHealth, today);

  const sleepMain = latest?.sleep?.totalSeconds != null ? formatSleepDuration(latest.sleep.totalSeconds) : '—';
  const sleepScore =
    latest?.sleep?.score != null ? `<span class="body-metric-sub">Score ${latest.sleep.score}</span>` : '';
  const rhrMain = latest?.restingHeartRateBpm != null ? `${latest.restingHeartRateBpm} bpm` : '—';
  const hrvMain = latest?.hrvNightlyAverageMs != null ? `${latest.hrvNightlyAverageMs} ms` : '—';
  const stepsMain = latest?.steps != null ? latest.steps.toLocaleString('en-AU') : '—';
  const stressMain = latest?.averageStress != null ? String(latest.averageStress) : '—';

  const activityHtml = activities.length
    ? activities
        .map((a) => {
          const dist = formatDistanceMeters(a.distanceMeters);
          const dur = a.durationSeconds ? formatDurationSeconds(a.durationSeconds) : '—';
          const parts = [formatActivityType(a.type)];
          if (dist) parts.push(dist);
          if (dur !== '—') parts.push(dur);
          return `<p class="garmin-activity-line">${escapeHtml(parts.join(' · '))}</p>`;
        })
        .join('')
    : '<p class="settings-empty">No activities imported yet.</p>';

  const garminInsights = getGarminCoachInsights(dailyHealth, garminSync, today);
  const garminInsightHtml = garminInsights
    .map(
      (i) => `
      <div class="coach-note body-coach-note body-coach-${i.type}">
        <strong>${escapeHtml(i.title)}</strong><br>${escapeHtml(i.message)}
      </div>
    `
    )
    .join('');

  const staleDays = garminSync.lastSuccessAt ? daysSinceIsoDate(garminSync.lastSuccessAt.slice(0, 10)) : null;
  const staleNudge =
    staleDays != null && staleDays > 7
      ? `<p class="garmin-stale-nudge">Garmin import is ${staleDays} days old — consider refreshing in Settings.</p>`
      : '';

  const garminRange = getGarminChartDateRange(state.garminChartRange, state.campaign, today);
  const garminChartSvg = renderGarminChartSvg(dailyHealth, {
    ...garminRange,
    metric: state.garminChartMetric,
    campaignStartDate: state.campaign?.startDate
  });
  const metricButtons = ['sleep', 'rhr']
    .map(
      (key) =>
        `<button type="button" class="segment-btn ${state.garminChartMetric === key ? 'selected' : ''}" data-garmin-metric="${key}">${key === 'sleep' ? 'Sleep' : 'RHR'}</button>`
    )
    .join('');
  const garminRangeButtons = ['30d', 'campaign', '6mo', 'all']
    .map(
      (key) =>
        `<button type="button" class="segment-btn ${state.garminChartRange === key ? 'selected' : ''}" data-garmin-range="${key}">${key === 'campaign' ? 'Campaign' : key.toUpperCase()}</button>`
    )
    .join('');

  return `
    <div class="health-section health-section--recovery">
      <p class="section-label">Recovery</p>
      <p class="health-recovery-date">${escapeHtml(dateLabel)}</p>
      <div class="body-metric-summary health-recovery-grid">
        <div class="body-metric-card">
          <span>Last night sleep</span>
          <strong>${escapeHtml(sleepMain)}</strong>
          ${sleepScore}
          ${formatGarminRollingSub(sleepSeven, (v) => formatSleepDuration(Math.round(v)) || '—')}
        </div>
        <div class="body-metric-card">
          <span>Resting HR</span>
          <strong>${escapeHtml(rhrMain)}</strong>
          ${formatGarminRollingSub(rhrSeven, (v) => `${Math.round(v)} bpm`)}
        </div>
        <div class="body-metric-card">
          <span>HRV (nightly avg)</span>
          <strong>${escapeHtml(hrvMain)}</strong>
          ${formatGarminRollingSub(hrvSeven, (v) => `${Math.round(v)} ms`)}
        </div>
        <div class="body-metric-card">
          <span>Steps</span>
          <strong>${stepsMain}</strong>
          ${formatGarminRollingSub(stepsSeven, (v) => Math.round(v).toLocaleString('en-AU'))}
        </div>
        <div class="body-metric-card">
          <span>Average stress</span>
          <strong>${escapeHtml(stressMain)}</strong>
          ${formatGarminRollingSub(stressSeven, (v) => String(Math.round(v)))}
        </div>
      </div>

      ${garminInsightHtml}
      ${staleNudge}

      <p class="section-label health-subsection-label">Recovery Trends</p>
      <div class="chart-range-control segmented-control garmin-metric-control">${metricButtons}</div>
      <div class="chart-range-control segmented-control garmin-range-control">${garminRangeButtons}</div>
      <div class="weight-chart garmin-trend-chart">${garminChartSvg}</div>

      <p class="section-label health-subsection-label">Recent Activity</p>
      ${activityHtml}

      <p class="garmin-sync-meta">Last import: ${escapeHtml(formatGarminSyncTime(garminSync.lastSuccessAt))}</p>
    </div>
  `;
}

async function renderBodyComposition() {
  clearRestTimer();
  clearExerciseTimer();
  state.screen = 'body';
  setHeader('Health Intelligence');

  await loadBodyMeasurements();
  const measurements = state.bodyMeasurements;
  const today = getLocalDateString();
  const seven = getCurrentSevenDayAverage(measurements, today);
  const thirty = getThirtyDayChange(measurements, today);
  const campaignChange = getCampaignWeightChange(measurements, state.campaign, today);
  const latest = getLatestMeasurement(measurements);
  const consistency = getWeighInConsistency(
    measurements,
    state.campaign.startDate,
    today
  );
  const insights = getBodyCoachInsights(measurements, state.campaign, today);
  const range = getChartDateRange(state.chartRange, state.campaign, today);
  const chartSvg = renderWeightChartSvg(measurements, {
    ...range,
    campaignStartDate: state.campaign.startDate,
    targetWeightKg: state.campaign.bodyMetrics?.targetWeightKg
  });

  const dailyHealth = await getAllDailyHealth();
  const garminSync = await getGarminSyncState();
  const activities = await getGarminActivities(10);
  const recoveryHtml = buildRecoverySectionHtml(dailyHealth, activities, garminSync, today);

  const rangeButtons = ['campaign', '30d', '6mo', '1y', 'all']
    .map(
      (key) =>
        `<button type="button" class="segment-btn ${state.chartRange === key ? 'selected' : ''}" data-range="${key}">${key === 'campaign' ? 'Campaign' : key.toUpperCase()}</button>`
    )
    .join('');

  const historyHtml = measurements.length
    ? [...measurements]
        .reverse()
        .map(
          (m) => `
        <div class="workout-history-item measurement-history-item">
          <div class="workout-history-info">
            <strong>${escapeHtml(formatDisplayDate(m.date))}</strong>
            <span>${m.weightKg.toFixed(1)} kg${m.bodyFatPercent ? ` · ${m.bodyFatPercent}% est. fat` : ''}${m.waistCm ? ` · ${m.waistCm} cm waist` : ''}</span>
          </div>
          <div class="measurement-actions">
            <button type="button" class="btn-delete-workout" data-edit-measurement="${m.id}">Edit</button>
            <button type="button" class="btn-delete-workout" data-delete-measurement="${m.id}">Delete</button>
          </div>
        </div>
      `
        )
        .join('')
    : '<p class="settings-empty">No weigh-ins recorded yet.</p>';

  const insightHtml = insights
    .map(
      (i) => `
      <div class="coach-note body-coach-note body-coach-${i.type}">
        <strong>${escapeHtml(i.title)}</strong><br>${escapeHtml(i.message)}
      </div>
    `
    )
    .join('');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <div class="health-section health-section--body">
          <p class="section-label">Body Composition</p>
          <p class="section-label health-subsection-label">Trend Intelligence</p>
          <div class="body-metric-summary">
            <div class="body-metric-card"><span>Latest</span><strong>${latest ? `${latest.weightKg.toFixed(1)} kg` : '—'}</strong></div>
            <div class="body-metric-card"><span>7-day avg</span><strong>${formatKg(seven.average, seven.provisional)}</strong></div>
            <div class="body-metric-card"><span>30-day change</span><strong>${formatWeightChange(thirty.change)}</strong></div>
            <div class="body-metric-card"><span>Campaign change</span><strong>${formatWeightChange(campaignChange.change)}</strong></div>
            <div class="body-metric-card"><span>Weigh-in consistency</span><strong>${consistency}%</strong></div>
          </div>

          ${seven.provisional && seven.count > 0 ? `<p class="body-calibrating">Trend calibrating — ${seven.count} of 7 initial weigh-ins recorded.</p>` : ''}

          <div class="chart-range-control segmented-control">${rangeButtons}</div>
          <div class="weight-chart">${chartSvg}</div>

          ${insightHtml}

          <p class="section-label health-subsection-label">Measurement History</p>
          <div class="workout-history-list">${historyHtml}</div>
        </div>

        ${recoveryHtml}
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-primary" id="btn-log-weight-body">Log Weight</button>
        <button type="button" class="btn-secondary" id="btn-back-centre-body">Back to Command Centre</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.chart-range-control .segment-btn[data-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.chartRange = btn.dataset.range;
      renderBodyComposition();
    });
  });

  document.querySelectorAll('.garmin-metric-control .segment-btn[data-garmin-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.garminChartMetric = btn.dataset.garminMetric;
      renderBodyComposition();
    });
  });

  document.querySelectorAll('.garmin-range-control .segment-btn[data-garmin-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.garminChartRange = btn.dataset.garminRange;
      renderBodyComposition();
    });
  });

  document.querySelectorAll('[data-delete-measurement]').forEach((btn) => {
    btn.addEventListener('click', () => openDeleteMeasurementOverlay(btn.dataset.deleteMeasurement));
  });

  document.querySelectorAll('[data-edit-measurement]').forEach((btn) => {
    btn.addEventListener('click', () => openWeighInOverlay(true, btn.dataset.editMeasurement));
  });

  document.querySelectorAll('.chart-point').forEach((pt) => {
    pt.addEventListener('click', () => {
      overlayContent.innerHTML = `
        <p class="overlay-title">${escapeHtml(formatDisplayDate(pt.dataset.date))}</p>
        <p class="overlay-sub">${pt.dataset.weight} kg</p>
        <button type="button" class="btn-secondary" id="btn-close-chart-tip">Close</button>
      `;
      overlay.classList.remove('hidden');
      $('#btn-close-chart-tip').addEventListener('click', closeOverlay);
    });
  });

  $('#btn-log-weight-body').addEventListener('click', () => openWeighInOverlay());
  $('#btn-back-centre-body').addEventListener('click', () => renderCentre());
}

function openDeleteMeasurementOverlay(id) {
  const m = state.bodyMeasurements.find((x) => x.id === id);
  if (!m) return;
  overlayContent.innerHTML = `
    <p class="overlay-title">Delete Weigh-In?</p>
    <p class="overlay-sub">Delete the weigh-in recorded on ${escapeHtml(formatDisplayDate(m.date))}? This will update historical trends.</p>
    <button type="button" class="btn-primary btn-danger" id="btn-confirm-delete-measurement">Delete</button>
    <button type="button" class="btn-secondary" id="btn-cancel-delete-measurement">Cancel</button>
  `;
  overlay.classList.remove('hidden');
  $('#btn-confirm-delete-measurement').addEventListener('click', async () => {
    await deleteMeasurement(id);
    await markBackupDirty();
    closeOverlay();
    await loadBodyMeasurements();
    renderBodyComposition();
  });
  $('#btn-cancel-delete-measurement').addEventListener('click', closeOverlay);
}

function buildBackupBannerHtml() {
  if (!state.backupBanner) return '';
  return `
    <div class="backup-banner" id="backup-banner">
      <p class="backup-banner-text">${escapeHtml(state.backupBanner.message)}</p>
      <div class="backup-banner-actions">
        <button type="button" class="btn-ghost backup-banner-share" id="btn-backup-share">Share to Drive</button>
        <button type="button" class="btn-ghost backup-banner-dismiss" id="btn-backup-dismiss">Dismiss</button>
      </div>
    </div>
  `;
}

function bindBackupBanner() {
  $('#btn-backup-dismiss')?.addEventListener('click', () => {
    state.backupBanner = null;
    $('#backup-banner')?.remove();
  });
  $('#btn-backup-share')?.addEventListener('click', async () => {
    if (!state.backupBanner?.data) return;
    const shared = await shareLatestBackup(state.backupBanner.data, state.backupBanner.filename);
    if (shared) {
      state.backupBanner = null;
      $('#backup-banner')?.remove();
    }
  });
}

async function reloadAppStateAfterRestore() {
  state.settings = await getSettings();
  state.campaign = await getActiveCampaign();
  state.blueprint = await getTodayBlueprint();
  state.mission = await getOrCreateTodayMission(state.blueprint);
  state.setLogs = await getSetLogsForMission(state.mission.id);
  await loadBodyMeasurements();
}

function openFirstRunRestoreOverlay() {
  overlayContent.innerHTML = `
    <div class="weigh-in-form">
      <p class="overlay-title">Restore your data?</p>
      <p class="overlay-sub">If you cleared site data or reinstalled Athlete OS, import a backup file to recover your workouts, weigh-ins, and Garmin data.</p>
      <button type="button" class="btn-primary" id="btn-first-run-import">Choose backup file</button>
      <button type="button" class="btn-secondary" id="btn-first-run-skip">Start fresh</button>
    </div>
  `;
  overlay.classList.add('overlay--weigh-in');
  overlay.classList.remove('hidden');
  $('#btn-first-run-import').addEventListener('click', () => {
    closeOverlay();
    renderSettings();
    setTimeout(() => $('#btn-import-backup')?.click(), 0);
  });
  $('#btn-first-run-skip').addEventListener('click', async () => {
    state.settings = await saveSettings({ restorePromptDismissed: true });
    closeOverlay();
  });
}

function openRestoreSnapshotOverlay() {
  const snapshots = state.backupSnapshots || [];
  const latest = snapshots[snapshots.length - 1];
  if (!latest) return;
  overlayContent.innerHTML = `
    <div class="weigh-in-form">
      <p class="overlay-title">Restore local snapshot?</p>
      <p class="overlay-sub">This replaces all current Athlete OS data with the snapshot from ${escapeHtml(getSnapshotLabel(latest))}. Use this if a recent import went wrong.</p>
      <button type="button" class="btn-primary btn-danger" id="btn-confirm-restore-snapshot">Restore snapshot</button>
      <button type="button" class="btn-secondary" id="btn-cancel-restore-snapshot">Cancel</button>
    </div>
  `;
  overlay.classList.add('overlay--weigh-in');
  overlay.classList.remove('hidden');
  $('#btn-confirm-restore-snapshot').addEventListener('click', async () => {
    await restoreBackupSnapshot(latest.id);
    closeOverlay();
    await reloadAppStateAfterRestore();
    renderCentre();
  });
  $('#btn-cancel-restore-snapshot').addEventListener('click', closeOverlay);
}

async function renderCampaignReview() {
  clearRestTimer();
  clearExerciseTimer();
  state.screen = 'review';
  setHeader('Campaign Review');

  const today = getLocalDateString();
  const now = new Date();
  const [integrity, missions, setLogs, dailyHealth, heatmapData] = await Promise.all([
    getIntegrity(),
    getAll('missions'),
    getAll('setLogs'),
    getAllDailyHealth(),
    getMonthHeatmapData(now.getFullYear(), now.getMonth())
  ]);
  await loadBodyMeasurements();

  const review = await buildCampaignReviewData({
    campaign: state.campaign,
    measurements: state.bodyMeasurements,
    dailyHealth,
    missions,
    setLogs,
    integrity,
    endDate: today
  });

  const heatmapSummary = `${review.integrity.executionRate}% execution · ${review.integrity.missionsCompleted} missions · ${review.integrity.fdsCount} FDS`;
  const heatmapHtml = renderIntegrityHeatmapTile(escapeHtml(heatmapSummary), heatmapData);

  const milestoneRows = review.milestones
    .map(
      (m) => `
      <tr>
        <td>${escapeHtml(m.label)}</td>
        <td>${escapeHtml(m.current)}</td>
        <td>${escapeHtml(m.previous)}</td>
        ${m.delta ? `<td>${escapeHtml(m.delta)}</td>` : '<td>—</td>'}
      </tr>
    `
    )
    .join('');

  const rulesHtml = (review.progressionRules || [])
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join('');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">Campaign Review</p>
        <h1 class="campaign-title">Week ${review.week}</h1>
        <p class="campaign-meta">${escapeHtml(formatDisplayDate(review.periodStart))} – ${escapeHtml(formatDisplayDate(review.endDate))}</p>

        <p class="section-label">Integrity</p>
        <div class="review-metrics">
          <div class="body-metric-card"><span>Execution rate</span><strong>${review.integrity.executionRate}%</strong></div>
          <div class="body-metric-card"><span>Missions completed</span><strong>${review.integrity.missionsCompleted}</strong></div>
          <div class="body-metric-card"><span>FDS (period)</span><strong>${review.integrity.fdsCount}</strong></div>
          <div class="body-metric-card"><span>Full / perfect</span><strong>${review.integrity.fullCount}</strong></div>
        </div>
        ${heatmapHtml}

        <p class="section-label">Body</p>
        <div class="review-metrics">
          <div class="body-metric-card"><span>7-day weight avg</span><strong>${review.body.weightAvg != null ? `${review.body.weightAvg.toFixed(1)} kg` : '—'}</strong></div>
          <div class="body-metric-card"><span>4-week change</span><strong>${review.body.weightDelta != null ? formatWeightChange(review.body.weightDelta) : '—'}</strong></div>
          <div class="body-metric-card"><span>Weigh-ins</span><strong>${review.body.weighIns}</strong></div>
        </div>

        <p class="section-label">Recovery</p>
        <div class="review-metrics">
          <div class="body-metric-card"><span>Sleep (7-day avg)</span><strong>${review.recovery.sleepLabel || '—'}</strong></div>
          <div class="body-metric-card"><span>RHR (7-day avg)</span><strong>${review.recovery.rhrAvg != null ? `${Math.round(review.recovery.rhrAvg)} bpm` : '—'}</strong></div>
          <div class="body-metric-card"><span>Days with data</span><strong>${review.recovery.daysWithData}</strong></div>
        </div>

        <p class="section-label">Milestones</p>
        <p class="review-milestone-hint">Latest vs previous 4-week period</p>
        <table class="milestone-table">
          <thead>
            <tr><th>Metric</th><th>Current</th><th>Previous</th><th>Change</th></tr>
          </thead>
          <tbody>${milestoneRows}</tbody>
        </table>

        <div class="review-reminder">
          <p class="section-label">Progression Reminder</p>
          <ul class="review-rules">${rulesHtml}</ul>
          ${review.finalReminder ? `<p class="review-final">${escapeHtml(review.finalReminder)}</p>` : ''}
        </div>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-back-centre-review">Back to Command Centre</button>
      </div>
    </div>
  `;

  $('#btn-back-centre-review').addEventListener('click', () => renderCentre());
}

function renderCentre() {
  state.screen = 'centre';
  const completed = state.mission.status === MISSION_STATUS.COMPLETE;
  const active = state.mission.status === MISSION_STATUS.ACTIVE;
  setHeader('Command Centre');

  const op = operationStyle(state.blueprint.operation);
  const week = getCampaignWeek(state.campaign.startDate);
  const exerciseCount = state.blueprint.exercises.length;

  const now = new Date();
  const today = getLocalDateString();

  Promise.all([
    getIntegrity(),
    getCompletedMissionsThisWeek(),
    getMonthHeatmapData(now.getFullYear(), now.getMonth()),
    loadBodyMeasurements(),
    buildWeekStrip(today)
  ]).then(async ([integrity, weekly, heatmapData, , weekStrip]) => {
    const stats = await getWeeklyStats(weekly);
    const summary = formatIntegritySummary(integrity, stats);
    const heatmapHtml = renderIntegrityHeatmapTile(escapeHtml(summary), heatmapData);
    const bodyStatusHtml = await buildBodyStatusCardHtml();
    const reviewDue = isReviewWeek(week);
    const reviewBadge = reviewDue
      ? '<span class="review-badge">Review available</span>'
      : '';
    const lastBackupLabel = formatLastBackupLabel(state.settings?.lastBackupExportAt);
    const backupLineHtml = `<p class="centre-backup-line">Last backup: ${escapeHtml(lastBackupLabel)}</p>`;
    const weekStripHtml = renderWeekStripHtml(weekStrip);

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
          ${buildBackupBannerHtml()}
          <p class="section-label">Active Campaign</p>
          <h1 class="campaign-title">${escapeHtml(state.campaign.name)}</h1>
          <p class="campaign-meta">${escapeHtml(state.campaign.season)} · Week ${week} of ${state.campaign.durationWeeks} ${reviewBadge}</p>

          ${weekStripHtml}

          <div class="centre-stack">
            <div class="mission-card">
              <span class="operation-badge" style="${op.style}">${op.label}</span>
              <p class="mission-day">${escapeHtml(state.blueprint.dayName)}</p>
              <p class="mission-focus">Today's Mission</p>
              <p class="mission-stats">${exerciseCount} exercises · ${op.label} front</p>
              ${completed ? '<p class="status-complete">✓ Mission complete today</p>' : ''}
              ${active && !completed ? '<p class="status-complete">Mission in progress</p>' : ''}
            </div>

            <div class="centre-actions">
              <button type="button" class="btn-primary" id="btn-begin" ${completed ? 'disabled' : ''}>
                ${primaryLabel}
              </button>
              ${completed ? '<button type="button" class="btn-secondary" id="btn-view-complete">View Debrief</button>' : ''}
              ${active && !completed ? '<button type="button" class="btn-secondary btn-abort-inline" id="btn-centre-abort">Abort Mission</button>' : ''}
              ${!completed && !active ? '<button type="button" class="btn-secondary btn-fds-inline" id="btn-centre-fds">FDS Workout</button>' : ''}
              <button type="button" class="btn-secondary" id="btn-campaign-review">Campaign Review</button>
            </div>

            ${bodyStatusHtml}

            ${heatmapHtml}

            ${backupLineHtml}
          </div>
        </div>
      </div>
    `;

    if (!completed) {
      $('#btn-begin').addEventListener('click', primaryAction);
    }
    if (completed) {
      $('#btn-view-complete').addEventListener('click', () => renderComplete(true));
    }
    $('#btn-centre-fds')?.addEventListener('click', openFdsOverlay);
    $('#btn-centre-abort')?.addEventListener('click', openAbortOverlay);
    $('#btn-campaign-review')?.addEventListener('click', () => renderCampaignReview());
    bindBodyStatusCard();
    bindBackupBanner();
  }).catch((err) => {
    console.error('Command Centre render failed:', err);
    renderBootError(err?.message || 'Failed to render Command Centre');
  });
}

async function renderSettings() {
  clearRestTimer();
  clearExerciseTimer();
  state.screen = 'settings';
  setHeader('Settings');

  state.settings = await getSettings();
  const s = state.settings;
  const garminSync = await getGarminSyncState();
  const history = await getMissionHistory(20);
  state.workoutHistory = history;
  const backupStatusLine = await getBackupStatusLine();
  const backupSnapshots = await getBackupSnapshots();
  state.backupSnapshots = backupSnapshots;
  const lastBackupLabel = formatLastBackupLabel(s.lastBackupExportAt);
  const autoBackupOn = s.autoBackupEnabled !== false;
  const backupInterval = s.autoBackupIntervalDays ?? 7;

  const garminStatus = garminSync.lastSuccessAt
    ? 'Current'
    : garminSync.lastError
      ? 'Import failed'
      : 'Never imported';
  const garminFlash = state.garminImportFlash
    ? `<p class="garmin-import-flash ${garminSync.lastError ? 'garmin-import-flash--error' : ''}">${escapeHtml(state.garminImportFlash)}</p>`
    : '';

  const garminStatusHtml = garminSync.lastSuccessAt
    ? `
        <p class="garmin-sync-line"><span>Last successful import</span><strong>${escapeHtml(formatGarminSyncTime(garminSync.lastSuccessAt))}</strong></p>
        <p class="garmin-sync-line"><span>Daily records</span><strong>${garminSync.lastDailyRecordCount ?? 0}</strong></p>
        <p class="garmin-sync-line"><span>Activities</span><strong>${garminSync.lastActivityRecordCount ?? 0}</strong></p>
        <p class="garmin-sync-line"><span>Source</span><strong>GarminDB ${escapeHtml(garminSync.lastSourceVersion || 'unknown')}</strong></p>
      `
    : garminSync.lastError
      ? `
        <p class="garmin-sync-error">Previous Garmin data remains available.</p>
        <p class="garmin-sync-line"><span>Error</span><strong>${escapeHtml(garminSync.lastError)}</strong></p>
      `
      : '<p class="settings-hint">Import a garmin-snapshot.json exported from your PC.</p>';

  const garminImportLabel = garminSync.lastSuccessAt ? 'Import New Snapshot' : 'Import Garmin Snapshot';

  const historyHtml = history.length
    ? (
        await Promise.all(
          history.map(async (m) => {
            const logs = await getSetLogsForMission(m.id);
            const label = `${m.dayName || m.date} · ${ratingLabel(m.rating)}`;
            return `
              <div class="workout-history-item">
                <div class="workout-history-info">
                  <strong>${escapeHtml(label)}</strong>
                  <span>${escapeHtml(m.date)} · ${logs.length} exercises</span>
                </div>
                <button type="button" class="btn-delete-workout" data-mission-id="${m.id}">Delete</button>
              </div>
            `;
          })
        )
      ).join('')
    : '<p class="settings-empty">No completed workouts yet.</p>';

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
          <div class="settings-toggle-row">
            <span class="settings-toggle-label">Show next exercise during rest</span>
            <button type="button" class="toggle-switch ${s.showNextExerciseOnRest ? 'on' : ''}" id="toggle-next-exercise" aria-pressed="${s.showNextExerciseOnRest}">
              <span class="toggle-knob"></span>
            </button>
          </div>
          <div class="settings-toggle-row">
            <span class="settings-toggle-label">Play sound when rest ends</span>
            <button type="button" class="toggle-switch ${s.restTimerSoundEnabled ? 'on' : ''}" id="toggle-rest-sound" aria-pressed="${s.restTimerSoundEnabled}">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>

        <div class="settings-group">
          <p class="settings-group-title">Garmin Data</p>
          <div class="garmin-sync-card">
            <p class="garmin-sync-label">Status</p>
            <p class="garmin-sync-status ${garminSync.lastError ? 'garmin-sync-status--error' : ''}">${escapeHtml(garminStatus)}</p>
            ${garminStatusHtml}
            ${garminFlash}
            <button type="button" class="btn-secondary btn-fds-inline" id="btn-import-garmin">${garminImportLabel}</button>
            <input type="file" id="import-garmin-file" accept=".json,application/json" hidden>
            ${garminSync.lastSuccessAt ? '<button type="button" class="btn-secondary btn-fds-inline" id="btn-view-garmin">Open Health Intelligence</button>' : ''}
          </div>
        </div>

        <div class="settings-group">
          <p class="settings-group-title">Data & Backup</p>
          <div class="backup-status-card">
            <p class="backup-status-line">${escapeHtml(backupStatusLine)}</p>
            <p class="backup-status-sub">Last file export: ${escapeHtml(lastBackupLabel)}</p>
            <div class="settings-toggle-row">
              <span class="settings-toggle-label">Auto-backup to Downloads</span>
              <button type="button" class="toggle-switch ${autoBackupOn ? 'on' : ''}" id="toggle-auto-backup" aria-pressed="${autoBackupOn}">
                <span class="toggle-knob"></span>
              </button>
            </div>
            <p class="settings-hint">Auto-backup interval</p>
            <div class="segmented-control backup-interval-control">
              <button type="button" class="segment-btn ${backupInterval === 7 ? 'selected' : ''}" data-interval="7">7 days</button>
              <button type="button" class="segment-btn ${backupInterval === 14 ? 'selected' : ''}" data-interval="14">14 days</button>
              <button type="button" class="segment-btn ${backupInterval === 30 ? 'selected' : ''}" data-interval="30">30 days</button>
            </div>
          </div>
          <p class="settings-hint">Clearing site data removes app data. Auto-backup saves a JSON file to Downloads — move it to Google Drive for long-term safety.</p>
          <button type="button" class="btn-secondary" id="btn-export-backup">Export now</button>
          <button type="button" class="btn-secondary btn-fds-inline" id="btn-import-backup">Import full backup</button>
          <input type="file" id="import-backup-file" accept=".json,application/json" hidden>
          ${backupSnapshots.length ? '<button type="button" class="btn-secondary btn-fds-inline" id="btn-restore-snapshot">Restore local snapshot</button>' : ''}
          <button type="button" class="btn-secondary btn-fds-inline" id="btn-export-body-csv">Export body measurements CSV</button>
          <button type="button" class="btn-secondary btn-fds-inline" id="btn-import-body-csv">Import body measurements CSV</button>
          <input type="file" id="import-body-csv-file" accept=".csv,text/csv" hidden>
        </div>

        <div class="settings-group">
          <p class="settings-group-title">Completed Workouts</p>
          <p class="settings-hint">Remove logged missions. Deletes set data and calendar entry.</p>
          <div class="workout-history-list">${historyHtml}</div>
        </div>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-settings-back">Back to Command Centre</button>
      </div>
    </div>
  `;

  bindDials(screenRoot);

  document.querySelectorAll('.segment-btn[data-unit]').forEach((btn) => {
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

  $('#toggle-next-exercise').addEventListener('click', async () => {
    const next = !state.settings.showNextExerciseOnRest;
    state.settings = await saveSettings({ showNextExerciseOnRest: next });
    renderSettings();
  });

  $('#toggle-rest-sound').addEventListener('click', async () => {
    const next = !state.settings.restTimerSoundEnabled;
    state.settings = await saveSettings({ restTimerSoundEnabled: next });
    renderSettings();
  });

  $('#toggle-auto-backup')?.addEventListener('click', async () => {
    const next = state.settings.autoBackupEnabled === false;
    state.settings = await saveSettings({ autoBackupEnabled: next });
    renderSettings();
  });

  document.querySelectorAll('.backup-interval-control .segment-btn[data-interval]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.settings = await saveSettings({ autoBackupIntervalDays: Number(btn.dataset.interval) });
      renderSettings();
    });
  });

  document.querySelectorAll('.btn-delete-workout[data-mission-id]').forEach((btn) => {
    btn.addEventListener('click', () => openDeleteWorkoutOverlay(btn.dataset.missionId));
  });

  $('#btn-import-garmin')?.addEventListener('click', () => $('#import-garmin-file').click());

  $('#import-garmin-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const text = await file.text();
      const result = await importGarminSnapshot(text);
      if (!result.ok) {
        state.garminImportFlash = result.errors.join(' ');
      } else {
        state.garminImportFlash = `Imported ${result.dailyCount} daily records and ${result.activityCount} activities.`;
        await markBackupDirty();
      }
    } catch (err) {
      state.garminImportFlash = err?.message || 'Import failed.';
    }
    setTimeout(() => {
      state.garminImportFlash = null;
    }, 4000);
    renderSettings();
  });

  $('#btn-view-garmin')?.addEventListener('click', () => renderBodyComposition());

  $('#btn-export-backup').addEventListener('click', async () => {
    const result = await performBackupExport();
    state.backupBanner = {
      message: 'Backup saved to Downloads',
      data: result.data,
      filename: result.filename
    };
    renderSettings();
  });

  $('#btn-restore-snapshot')?.addEventListener('click', () => openRestoreSnapshotOverlay());

  $('#btn-import-backup').addEventListener('click', () => $('#import-backup-file').click());

  $('#import-backup-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const validation = validateBackup(data);
      if (!validation.valid) throw new Error(validation.error);
      const existing = await getAllMeasurements();
      state.pendingBackup = data;
      state.pendingBackupMode = 'replace';
      state.importPreview = detectImportConflicts(existing, data.bodyMeasurements || []);
      e.target.value = '';
      openBackupImportOverlay();
    } catch (err) {
      e.target.value = '';
      overlayContent.innerHTML = `
        <p class="overlay-title">Import Failed</p>
        <p class="overlay-sub">${escapeHtml(err.message || 'Could not read backup file.')}</p>
        <button type="button" class="btn-secondary" id="btn-close-import-error">Close</button>
      `;
      overlay.classList.remove('hidden');
      $('#btn-close-import-error').addEventListener('click', closeOverlay);
    }
  });

  $('#btn-export-body-csv').addEventListener('click', async () => {
    const measurements = await getAllMeasurements();
    downloadCsv(exportBodyMeasurementsCsv(measurements), `body-measurements-${getLocalDateString()}.csv`);
  });

  $('#btn-import-body-csv').addEventListener('click', () => $('#import-body-csv-file').click());

  $('#import-body-csv-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseBodyCsv(text);
    const existing = await getAllMeasurements();
    state.importPreview = detectImportConflicts(existing, rows);
    e.target.value = '';
    openImportPreviewOverlay();
  });

  $('#btn-settings-back').addEventListener('click', () => renderCentre());
}

function openBackupImportOverlay() {
  const preview = state.importPreview || [];
  const backup = state.pendingBackup;
  const summary = summarizeBackup(backup || {});
  const conflictCount = preview.filter((p) => p.conflict).length;
  const rowsHtml = preview.length
    ? preview
        .map(
          (p, i) => `
      <div class="import-preview-row">
        <strong>${escapeHtml(p.row.date)}</strong> — ${p.row.weightKg} kg
        ${p.conflict ? `<span class="import-conflict">Conflict (current: ${p.existing.weightKg} kg)</span>` : ''}
        ${p.conflict ? `
          <select id="import-action-${i}" class="import-action-select">
            <option value="skip">Skip</option>
            <option value="replace">Replace with imported</option>
            <option value="keep">Keep current</option>
          </select>
        ` : `<span class="import-new">New</span>`}
      </div>
    `
        )
        .join('')
    : '<p class="settings-empty">No body measurements in backup.</p>';

  overlayContent.innerHTML = `
    <div class="weigh-in-form">
      <p class="overlay-title">Import Backup</p>
      <p class="overlay-sub">Backup from ${escapeHtml(summary.exportedAt ? formatDisplayDate(summary.exportedAt.slice(0, 10)) : 'unknown date')}</p>
      <div class="backup-import-summary">
        <p>${summary.missions} missions · ${summary.setLogs} set logs · ${summary.bodyMeasurements} weigh-ins</p>
        <p>${summary.dailyHealth} Garmin days · ${summary.garminActivities} activities</p>
      </div>
      <fieldset class="backup-import-mode">
        <label class="backup-import-option">
          <input type="radio" name="backup-import-mode" value="replace" ${state.pendingBackupMode === 'replace' ? 'checked' : ''}>
          Replace all local data (recommended after site data clear)
        </label>
        <label class="backup-import-option">
          <input type="radio" name="backup-import-mode" value="merge" ${state.pendingBackupMode === 'merge' ? 'checked' : ''}>
          Merge with existing data
        </label>
      </fieldset>
      <div class="backup-import-conflicts ${state.pendingBackupMode === 'merge' ? '' : 'hidden'}" id="backup-import-conflicts">
        <p class="settings-hint">${preview.length} weigh-ins${conflictCount ? ` · ${conflictCount} conflicts` : ''}</p>
        <div class="import-preview-list">${rowsHtml}</div>
      </div>
      <button type="button" class="btn-primary" id="btn-apply-backup-import">Apply Import</button>
      <button type="button" class="btn-secondary" id="btn-cancel-backup-import">Cancel</button>
    </div>
  `;
  overlay.classList.add('overlay--weigh-in');
  overlay.classList.remove('hidden');

  document.querySelectorAll('input[name="backup-import-mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.pendingBackupMode = input.value;
      $('#backup-import-conflicts')?.classList.toggle('hidden', input.value !== 'merge');
    });
  });

  $('#btn-apply-backup-import').addEventListener('click', () => applyBackupImport());
  $('#btn-cancel-backup-import').addEventListener('click', () => {
    state.pendingBackup = null;
    state.importPreview = null;
    state.pendingBackupMode = 'merge';
    closeOverlay();
  });
}

async function applyBackupImport() {
  const preview = state.importPreview || [];
  const mode =
    document.querySelector('input[name="backup-import-mode"]:checked')?.value ||
    state.pendingBackupMode ||
    'merge';
  const replaceAll = mode === 'replace';
  const resolutions = preview.map((p, i) => {
    if (!p.conflict) return 'replace';
    return $(`#import-action-${i}`)?.value || 'skip';
  });

  if (state.pendingBackup) {
    await applyBackup(state.pendingBackup, { replaceAll });
    if (replaceAll) {
      await applyBodyMeasurementsImport(preview, [], { replaceAll: true });
    } else {
      await applyBodyMeasurementsImport(preview, resolutions);
    }
    await markBackupDirty();
  }

  closeOverlay();
  state.pendingBackup = null;
  state.importPreview = null;
  state.pendingBackupMode = 'merge';
  await reloadAppStateAfterRestore();
  if (replaceAll) renderCentre();
  else renderSettings();
}

function openImportPreviewOverlay() {
  const preview = state.importPreview || [];
  const rowsHtml = preview
    .map(
      (p, i) => `
      <div class="import-preview-row">
        <strong>${escapeHtml(p.row.date)}</strong> — ${p.row.weightKg} kg
        ${p.conflict ? `<span class="import-conflict">Conflict (current: ${p.existing.weightKg} kg)</span>` : ''}
        ${p.conflict ? `
          <select id="import-action-${i}" class="import-action-select">
            <option value="skip">Skip</option>
            <option value="replace">Replace with imported</option>
            <option value="keep">Keep current</option>
          </select>
        ` : `<span class="import-new">New</span>`}
      </div>
    `
    )
    .join('');

  overlayContent.innerHTML = `
    <p class="overlay-title">Import Preview</p>
    <p class="overlay-sub">${preview.length} rows found. Review conflicts before applying.</p>
    <div class="import-preview-list">${rowsHtml}</div>
    <button type="button" class="btn-primary" id="btn-apply-import">Apply Import</button>
    <button type="button" class="btn-secondary" id="btn-cancel-import">Cancel</button>
  `;
  overlay.classList.remove('hidden');

  $('#btn-apply-import').addEventListener('click', () => applyImportPreview());
  $('#btn-cancel-import').addEventListener('click', closeOverlay);
}

async function applyImportPreview() {
  const preview = state.importPreview || [];
  const resolutions = preview.map((p, i) => {
    if (!p.conflict) return 'replace';
    return $(`#import-action-${i}`)?.value || 'skip';
  });
  await applyBodyMeasurementsImport(preview, resolutions);
  await markBackupDirty();
  closeOverlay();
  state.importPreview = null;
  await loadBodyMeasurements();
  renderSettings();
}

function renderBriefing() {
  state.screen = 'briefing';
  setHeader('Briefing');

  const op = operationStyle(state.blueprint.operation);
  const unit = state.settings?.weightUnit || 'kg';

  Promise.all(
    state.blueprint.exercises.map(async (ex) => {
      const history = await getExerciseHistory(ex.id, 3);
      const hints = getProgressionHints(ex, history);
      return { ex, hints };
    })
  ).then((exerciseData) => {
    CoachService.getBriefingNote(state.campaign).then((note) => {
      const exerciseItems = exerciseData
        .map(({ ex, hints }) => {
          const rx = formatPrescriptionForDisplay(ex, unit);
          const hintHtml = hints.length
            ? `<div class="briefing-hints">${renderProgressionHintsHtml(hints)}</div>`
            : '';
          return `<li><span>${escapeHtml(formatExerciseName(ex.name))}</span><span class="rx">${escapeHtml(rx)}</span>${hintHtml}</li>`;
        })
        .join('');

      const hintsSection = exerciseData.some((e) => e.hints.length)
        ? '<p class="section-label">Progression Notes</p>'
        : '';

      screenRoot.innerHTML = `
        <div class="screen">
          <div class="screen-scroll">
            <span class="operation-badge" style="${op.style}">${op.label}</span>
            <h1 class="campaign-title">${escapeHtml(state.blueprint.dayName)} Mission</h1>
            <p class="campaign-meta">${escapeHtml(state.blueprint.operation)} front</p>

            <div class="identity-block">"${escapeHtml(note)}"</div>

            <p class="section-label">Mission Loadout</p>
            <ul class="exercise-list">${exerciseItems}</ul>
            ${hintsSection}

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
  });
}

async function renderActive() {
  clearRestTimer();
  state.screen = 'active';
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
  const history = await getExerciseHistory(exercise.id, 3, state.mission.id);
  const historyRows = formatExerciseHistoryRows(history, unit);
  const hints = getProgressionHints(exercise, history);

  const exIndex = exercises.indexOf(exercise);
  const totalExercises = exercises.length;

  beginExerciseTimer();

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-body">
        ${renderActiveExerciseBody(exercise, prev, fields, exIndex, totalExercises, rx, historyRows, hints)}
      </div>
      <div class="screen-footer">
        ${renderActiveExerciseFooter(exercise)}
      </div>
    </div>
  `;

  bindExerciseActions(exercise);
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
  const prev = await getPreviousPerformance(exercise.id, state.mission.id);
  const fields = prepareFields(exercise, prev, state.settings);
  const history = await getExerciseHistory(exercise.id, 3, state.mission.id);
  const historyRows = formatExerciseHistoryRows(history, unit);
  const hints = getProgressionHints(exercise, history);

  const exIndex = exercises.indexOf(exercise);
  const totalExercises = exercises.length;

  beginExerciseTimer();

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-body">
        ${renderActiveExerciseBody(exercise, prev, fields, exIndex, totalExercises, rx, historyRows, hints)}
      </div>
      <div class="screen-footer">
        ${renderActiveExerciseFooter(exercise)}
      </div>
    </div>
  `;

  bindExerciseActions(exercise);
}

async function renderComplete(alreadyDone = false) {
  clearRestTimer();
  clearExerciseTimer();
  state.screen = 'complete';
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
            <p class="complete-sub">${state.setLogs.length} exercises logged${formatWorkoutDuration()}</p>
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
      await markBackupDirty();
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
            <p class="complete-sub">${escapeHtml(state.blueprint.dayName)} · ${escapeHtml(state.blueprint.operation)}${formatWorkoutDuration()}</p>
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

function formatWorkoutDuration() {
  if (!state.mission?.startedAt) return '';
  const end = state.mission.completedAt ? new Date(state.mission.completedAt) : new Date();
  const seconds = Math.round((end - new Date(state.mission.startedAt)) / 1000);
  return seconds > 0 ? ` · ${formatElapsed(seconds)}` : '';
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

function fdsOptionPayload(ex) {
  return JSON.stringify({
    id: ex.id,
    name: ex.name,
    type: ex.type || 'open',
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight,
    weightUnit: ex.weightUnit,
    duration: ex.duration,
    durationUnit: ex.durationUnit,
    distance: ex.distance,
    distanceUnit: ex.distanceUnit
  });
}

function renderFdsOverlayContent() {
  const todayOptions = state.blueprint.exercises.slice(0, 6);
  const allOptions = [
    ...todayOptions.map((ex) => ({ ...ex, label: `${formatExerciseName(ex.name)} (today)` })),
    ...FDS_FALLBACKS.map((ex) => ({ ...ex, label: formatExerciseName(ex.name) }))
  ];

  const optionsHtml = allOptions
    .map((ex) => {
      const selectedIndex = state.fdsSelection.findIndex((s) => s.id === ex.id);
      const selected = selectedIndex >= 0;
      return `
        <button type="button" class="fds-option ${selected ? 'selected' : ''}" data-fds='${fdsOptionPayload(ex)}'>
          ${selected ? `<span class="fds-order">${selectedIndex + 1}</span>` : ''}
          ${escapeHtml(ex.label)}
        </button>
      `;
    })
    .join('');

  const count = state.fdsSelection.length;

  overlayContent.innerHTML = `
    <p class="overlay-title">FDS — Do Something</p>
    <p class="overlay-sub">Pick 1–3 exercises. Tap in the order you want to do them.</p>
    ${optionsHtml}
    <button type="button" class="btn-primary" id="btn-start-fds" ${count ? '' : 'disabled'}>
      Start FDS${count ? ` (${count})` : ''}
    </button>
    <button type="button" class="btn-secondary" id="btn-cancel-fds">Cancel</button>
  `;

  overlayContent.querySelectorAll('.fds-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ex = JSON.parse(btn.dataset.fds);
      const existing = state.fdsSelection.findIndex((s) => s.id === ex.id);
      if (existing >= 0) {
        state.fdsSelection.splice(existing, 1);
      } else if (state.fdsSelection.length < 3) {
        state.fdsSelection.push(ex);
      }
      renderFdsOverlayContent();
    });
  });

  $('#btn-start-fds')?.addEventListener('click', startFdsMission);
  $('#btn-cancel-fds').addEventListener('click', closeOverlay);
}

async function startFdsMission() {
  if (!state.fdsSelection.length) return;

  const selected = state.fdsSelection.map((ex) => structuredClone(ex));
  closeOverlay();
  state.fdsSelection = [];

  if (state.mission.status !== MISSION_STATUS.ACTIVE) {
    state.mission = await startMission(state.mission);
  }

  state.mission.isFds = true;
  state.mission.fdsExercises = selected;
  state.mission.fdsExercise = selected[0];
  state.mission.exercises = selected;
  state.mission.currentExerciseIndex = 0;
  state.mission.skippedExercises = [];
  state.mission = await saveMission(state.mission);
  state.setLogs = [];
  renderActive();
}

function openDeleteWorkoutOverlay(missionId) {
  const mission = state.workoutHistory?.find((m) => m.id === missionId);
  const label = mission ? `${mission.dayName || mission.date} · ${ratingLabel(mission.rating)}` : 'This workout';

  overlayContent.innerHTML = `
    <p class="overlay-title">Delete Workout?</p>
    <p class="overlay-sub"><strong>${escapeHtml(label)}</strong> will be removed. Set logs and calendar entry deleted.</p>
    <button type="button" class="btn-primary btn-danger" id="btn-confirm-delete-workout">Delete Workout</button>
    <button type="button" class="btn-secondary" id="btn-cancel-delete-workout">Cancel</button>
  `;
  overlay.classList.remove('hidden');

  $('#btn-confirm-delete-workout').addEventListener('click', () => confirmDeleteWorkout(missionId));
  $('#btn-cancel-delete-workout').addEventListener('click', closeOverlay);
}

async function confirmDeleteWorkout(missionId) {
  closeOverlay();
  const deleted = await deleteCompletedMission(missionId);
  if (!deleted) return;

  await adjustIntegrityAfterDelete(deleted);
  await markBackupDirty();

  if (state.mission?.id === missionId) {
    state.mission = await getOrCreateTodayMission(state.blueprint);
    state.setLogs = [];
  }

  renderSettings();
}

function openAbortOverlay() {
  overlayContent.innerHTML = `
    <p class="overlay-title">Abort Mission?</p>
    <p class="overlay-sub">This cancels today's in-progress workout. Nothing will be logged for today.</p>
    <button type="button" class="btn-primary btn-danger" id="btn-confirm-abort">Abort Mission</button>
    <button type="button" class="btn-secondary" id="btn-cancel-abort">Keep Going</button>
  `;
  overlay.classList.remove('hidden');

  $('#btn-confirm-abort').addEventListener('click', confirmAbortMission);
  $('#btn-cancel-abort').addEventListener('click', closeOverlay);
}

async function confirmAbortMission() {
  closeOverlay();
  clearRestTimer();
  clearExerciseTimer();
  state.mission = await abortMission(state.mission, state.blueprint);
  state.setLogs = [];
  state.checklistDone = new Set();
  state.fdsSelection = [];
  renderCentre();
}

function openFdsOverlay() {
  state.fdsSelection = [];
  overlay.classList.remove('hidden');
  renderFdsOverlayContent();
}

function closeOverlay() {
  overlay.classList.add('hidden');
  overlay.classList.remove('overlay--weigh-in');
  overlayContent.innerHTML = '';
}

init();
