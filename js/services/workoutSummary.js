import { formatExerciseName, MISSION_STATUS, MISSION_RATINGS } from './mission.js';
import { kgToUnit, unitToKg } from './settings.js';

const BADGE_PRIORITY = {
  weight: 0,
  duration: 1,
  pace: 2,
  fastest: 3
};

function formatPacePerKm(secondsPerKm) {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${String(secs).padStart(2, '0')}/km`;
}

function formatTonnageDisplay(totalKg, unit) {
  const displayVal = kgToUnit(totalKg, unit);
  const formatted = Number.isInteger(displayVal) ? String(displayVal) : displayVal.toFixed(1);
  return `${Number(formatted).toLocaleString()} ${unit} moved`;
}

export function computeSessionTonnage(setLogs, unit = 'kg') {
  let totalKg = 0;

  for (const log of setLogs) {
    const actual = log.actual || {};
    if (actual.weight == null || !actual.reps) continue;
    const weightKg = unitToKg(actual.weight, actual.weightUnit || 'kg');
    if (weightKg == null) continue;
    const setCount = actual.sets || 1;
    totalKg += weightKg * actual.reps * setCount;
  }

  if (totalKg <= 0) return null;

  return {
    totalKg,
    display: formatTonnageDisplay(totalKg, unit)
  };
}

export function detectExercisePersonalBests(sessionLogs, historicalLogs, missionId) {
  const badges = [];
  const seenExercise = new Set();

  for (const log of sessionLogs) {
    if (seenExercise.has(log.exerciseId)) continue;

    const prior = historicalLogs.filter(
      (entry) => entry.exerciseId === log.exerciseId && entry.missionId !== missionId
    );
    if (!prior.length) continue;

    const actual = log.actual || {};
    const exerciseName = formatExerciseName(log.exerciseName || 'Exercise');
    let badge = null;

    if (actual.weight != null && actual.reps) {
      const currentKg = unitToKg(actual.weight, actual.weightUnit || 'kg');
      const priorMaxKg = prior
        .filter((entry) => entry.actual?.weight != null && entry.actual.reps >= actual.reps)
        .map((entry) => unitToKg(entry.actual.weight, entry.actual.weightUnit || 'kg'))
        .filter((value) => value != null);

      if (currentKg != null && priorMaxKg.length && currentKg > Math.max(...priorMaxKg)) {
        badge = {
          type: 'weight',
          exerciseName,
          detail: `${actual.weight}${actual.weightUnit || 'kg'} × ${actual.reps}`,
          priority: BADGE_PRIORITY.weight
        };
      }
    }

    if (!badge && actual.duration != null) {
      const priorDurations = prior
        .map((entry) => entry.actual?.duration)
        .filter((value) => value != null);

      if (priorDurations.length && actual.duration > Math.max(...priorDurations)) {
        badge = {
          type: 'duration',
          exerciseName,
          detail: `${actual.duration}${actual.durationUnit || 's'}`,
          priority: BADGE_PRIORITY.duration
        };
      }
    }

    if (!badge && actual.distance > 0 && actual.elapsedSeconds > 0) {
      const pace = actual.elapsedSeconds / actual.distance;
      const priorPaces = prior
        .filter((entry) => entry.actual?.distance > 0 && entry.actual?.elapsedSeconds > 0)
        .map((entry) => entry.actual.elapsedSeconds / entry.actual.distance);

      if (priorPaces.length && pace < Math.min(...priorPaces)) {
        badge = {
          type: 'pace',
          exerciseName,
          detail: formatPacePerKm(pace),
          priority: BADGE_PRIORITY.pace
        };
      }
    }

    if (badge) {
      badges.push(badge);
      seenExercise.add(log.exerciseId);
    }
  }

  return badges;
}

export function detectFastestOperation(mission, priorMissions) {
  if (!mission?.startedAt || !mission?.completedAt) return null;

  const durationSeconds = Math.round(
    (new Date(mission.completedAt) - new Date(mission.startedAt)) / 1000
  );
  if (durationSeconds <= 0) return null;

  const prior = priorMissions.filter(
    (entry) =>
      entry.id !== mission.id &&
      entry.status === MISSION_STATUS.COMPLETE &&
      entry.operation === mission.operation &&
      entry.startedAt &&
      entry.completedAt
  );

  if (!prior.length) return null;

  const priorDurations = prior.map(
    (entry) => (new Date(entry.completedAt) - new Date(entry.startedAt)) / 1000
  );
  const fastestPrior = Math.min(...priorDurations);

  if (durationSeconds >= fastestPrior) return null;

  return {
    type: 'fastest',
    operation: mission.operation,
    durationSeconds,
    priority: BADGE_PRIORITY.fastest
  };
}

export function buildCompletionHighlights({
  mission,
  setLogs,
  allSetLogs,
  allMissions,
  unit = 'kg'
}) {
  if (mission?.rating === MISSION_RATINGS.ABANDONED) {
    return { badges: [], stats: null, showHighlights: false };
  }

  const historicalLogs = allSetLogs.filter((log) => log.missionId !== mission.id);
  const prBadges = detectExercisePersonalBests(setLogs, historicalLogs, mission.id);
  const fastest = detectFastestOperation(mission, allMissions);

  const badges = [...prBadges];
  if (fastest) badges.push(fastest);
  badges.sort((a, b) => a.priority - b.priority);

  const tonnage = computeSessionTonnage(setLogs, unit);
  const exerciseCount = new Set(setLogs.map((log) => log.exerciseId)).size;
  const durationSeconds =
    mission.startedAt && mission.completedAt
      ? Math.round((new Date(mission.completedAt) - new Date(mission.startedAt)) / 1000)
      : 0;

  const hasWork = setLogs.length > 0;
  const showHighlights = hasWork && (badges.length > 0 || tonnage != null);

  return {
    badges: badges.slice(0, 2),
    stats: {
      exerciseCount,
      tonnage,
      durationSeconds
    },
    showHighlights
  };
}
