import { get, getAll, put, remove, generateId, todayDateString } from '../db.js';
import { CAMPAIGN_ID } from '../seed/blueprint-v1.js';

export const MISSION_STATUS = {
  READY: 'ready',
  BRIEFING: 'briefing',
  ACTIVE: 'active',
  COMPLETE: 'complete',
  ARCHIVE: 'archive'
};

export const MISSION_RATINGS = {
  PERFECT: 'perfect',
  FULL: 'full',
  MINIMUM: 'minimum',
  RECOVERY: 'recovery',
  ABANDONED: 'abandoned'
};

export async function getOrCreateTodayMission(blueprint) {
  const date = todayDateString();
  const missions = await getAll('missions');
  let mission = missions.find((m) => m.date === date && m.campaignId === CAMPAIGN_ID);

  if (!mission) {
    mission = {
      id: generateId('mission'),
      campaignId: CAMPAIGN_ID,
      blueprintId: blueprint.id,
      date,
      dayOfWeek: blueprint.dayOfWeek,
      dayName: blueprint.dayName,
      operation: blueprint.operation,
      exercises: structuredClone(blueprint.exercises),
      status: MISSION_STATUS.READY,
      rating: null,
      isFds: false,
      fdsExercise: null,
      fdsExercises: null,
      startedAt: null,
      completedAt: null,
      currentExerciseIndex: 0,
      currentSet: 1,
      skippedExercises: []
    };
    await put('missions', mission);
  }

  return mission;
}

export async function getMission(id) {
  return get('missions', id);
}

export async function saveMission(mission) {
  await put('missions', mission);
  return mission;
}

export async function startMission(mission) {
  mission.status = MISSION_STATUS.ACTIVE;
  mission.startedAt = mission.startedAt || new Date().toISOString();
  mission.currentExerciseIndex = 0;
  mission.currentSet = 1;
  return saveMission(mission);
}

export function formatExerciseName(name) {
  return String(name).replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function logSet(mission, exercise, setNumber, actual = {}) {
  const prescribed = {
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    weightUnit: exercise.weightUnit,
    duration: exercise.duration,
    durationUnit: exercise.durationUnit,
    distance: exercise.distance,
    distanceUnit: exercise.distanceUnit
  };

  const hasWeight = actual.weight != null && actual.weight !== '';
  const log = {
    id: generateId('set'),
    missionId: mission.id,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    setNumber,
    prescribed,
    actual: {
      sets: actual.sets ?? exercise.sets ?? 1,
      reps: actual.reps ?? exercise.reps ?? null,
      weight: hasWeight ? actual.weight : null,
      weightUnit: hasWeight ? (actual.weightUnit ?? exercise.weightUnit ?? 'kg') : null,
      weightLabel: actual.weightLabel ?? (hasWeight ? null : (exercise.weight ? null : 'bodyweight')),
      duration: actual.duration ?? exercise.duration ?? null,
      durationUnit: actual.durationUnit ?? exercise.durationUnit ?? 's',
      distance: actual.distance ?? exercise.distance ?? null,
      distanceUnit: actual.distanceUnit ?? exercise.distanceUnit ?? 'km',
      notes: actual.notes ?? '',
      elapsedSeconds: actual.elapsedSeconds ?? null
    },
    completedAt: new Date().toISOString()
  };

  await put('setLogs', log);
  return log;
}

export async function upsertExerciseLog(mission, exercise, actual = {}) {
  const existing = await getSetLogsForMission(mission.id);
  for (const log of existing.filter((l) => l.exerciseId === exercise.id)) {
    await remove('setLogs', log.id);
  }
  return logSet(mission, exercise, 1, actual);
}

export function getActiveExercises(mission) {
  return mission.exercises.filter((e) => !mission.skippedExercises?.includes(e.id));
}

export function isExerciseDone(exercise, setLogs, mission) {
  return setLogs.some((l) => l.exerciseId === exercise.id) || mission.skippedExercises?.includes(exercise.id);
}

export function countCompletedExercises(exercises, setLogs, mission) {
  return exercises.filter((e) => isExerciseDone(e, setLogs, mission)).length;
}

export function areRequiredExercisesDone(mission, setLogs) {
  const exercises = getActiveExercises(mission);
  const required = exercises.filter((e) => e.type !== 'optional' && e.type !== 'note_only');
  return required.every((e) => isExerciseDone(e, setLogs, mission));
}

export async function getMissionDurationEstimate(dayOfWeek, operation, exerciseCount) {
  const missions = await getAll('missions');
  const durations = missions
    .filter(
      (m) =>
        m.status === MISSION_STATUS.COMPLETE &&
        m.startedAt &&
        m.completedAt &&
        (m.dayOfWeek === dayOfWeek || m.operation === operation)
    )
    .map((m) => (new Date(m.completedAt) - new Date(m.startedAt)) / 60000)
    .filter((mins) => mins > 0 && mins < 240);

  if (durations.length > 0) {
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    return { label: `avg ${avg} min`, hasHistory: true, minutes: avg };
  }

  const estimate = Math.max(15, Math.round(exerciseCount * 6));
  return { label: `~${estimate} min`, hasHistory: false, minutes: estimate };
}

export async function getSetLogsForMission(missionId) {
  const all = await getAll('setLogs');
  return all.filter((l) => l.missionId === missionId);
}

export async function deleteSetLogsForMission(missionId) {
  const logs = await getSetLogsForMission(missionId);
  await Promise.all(logs.map((log) => remove('setLogs', log.id)));
}

export async function abortMission(mission, blueprint) {
  await deleteSetLogsForMission(mission.id);

  mission.status = MISSION_STATUS.READY;
  mission.rating = null;
  mission.isFds = false;
  mission.fdsExercise = null;
  mission.fdsExercises = null;
  mission.startedAt = null;
  mission.completedAt = null;
  mission.currentExerciseIndex = 0;
  mission.currentSet = 1;
  mission.skippedExercises = [];
  mission.exercises = structuredClone(blueprint.exercises);

  return saveMission(mission);
}

export async function getPreviousPerformance(exerciseId, excludeMissionId = null) {
  const logs = await getExerciseHistory(exerciseId, 1, excludeMissionId);
  if (!logs.length) return null;

  const last = logs[0];
  const summary = formatPerformanceSummary(last.exerciseName, last);

  return {
    logs,
    summary,
    lastNote: last.actual.notes || '',
    lastActual: last.actual,
    date: last.completedAt
  };
}

export async function getExerciseHistory(exerciseId, limit = 3, excludeMissionId = null) {
  const all = await getAll('setLogs');
  return all
    .filter((l) => l.exerciseId === exerciseId && l.missionId !== excludeMissionId)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, limit);
}

export function formatPerformanceSummary(name, log) {
  const displayName = formatExerciseName(name);
  const a = log.actual;

  if (a.weightLabel === 'bodyweight' && a.reps && a.sets) {
    return `${displayName}: Bodyweight × ${a.reps} × ${a.sets} sets`;
  }
  if (a.weight && a.reps && a.sets) {
    return `${a.weight}${a.weightUnit || 'kg'} × ${a.reps} × ${a.sets} sets`;
  }
  if (a.weight && a.reps) {
    return `${a.weight}${a.weightUnit || 'kg'} × ${a.reps}`;
  }
  if (a.duration && a.sets) {
    return `${a.duration}${a.durationUnit || 's'} × ${a.sets} sets`;
  }
  if (a.duration) {
    return `${a.duration}${a.durationUnit || 's'}`;
  }
  if (a.distance) {
    return `${a.distance}${a.distanceUnit || 'km'}`;
  }
  if (a.notes) {
    return `${displayName}: ${a.notes}`;
  }
  return `${displayName}: completed`;
}

export function getExerciseFieldDefaults(exercise, prev) {
  const last = prev?.lastActual;
  const hasPrescribedWeight = exercise.weight != null;
  return {
    sets: last?.sets ?? exercise.sets ?? 1,
    reps: last?.reps ?? exercise.reps ?? exercise.repsMin ?? '',
    weight: last?.weight ?? (hasPrescribedWeight ? exercise.weight : ''),
    weightLabel: last?.weightLabel ?? (hasPrescribedWeight ? null : 'bodyweight'),
    duration: last?.duration ?? exercise.duration ?? '',
    distance: last?.distance ?? exercise.distance ?? exercise.distanceMin ?? '',
    notes: prev?.lastNote ?? ''
  };
}

export async function completeMission(mission, rating, options = {}) {
  mission.status = MISSION_STATUS.COMPLETE;
  mission.rating = rating;
  mission.completedAt = new Date().toISOString();
  if (options.isFds) {
    mission.isFds = true;
    mission.fdsExercises = options.fdsExercises || null;
    mission.fdsExercise = options.fdsExercise || options.fdsExercises?.[0] || null;
    mission.rating = MISSION_RATINGS.MINIMUM;
  }
  return saveMission(mission);
}

export async function getCompletedMissionsThisWeek() {
  const all = await getAll('missions');
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return all.filter((m) => {
    if (m.status !== MISSION_STATUS.COMPLETE) return false;
    const d = new Date(m.date + 'T12:00:00');
    return d >= monday;
  });
}

export async function getMissionHistory(limit = 10) {
  const all = await getAll('missions');
  return all
    .filter((m) => m.status === MISSION_STATUS.COMPLETE)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export async function deleteCompletedMission(missionId) {
  const mission = await get('missions', missionId);
  if (!mission || mission.status !== MISSION_STATUS.COMPLETE) return null;

  await deleteSetLogsForMission(missionId);
  await remove('missions', missionId);
  return mission;
}

export function getExerciseTotalSets(exercise) {
  switch (exercise.type) {
    case 'weighted_reps':
    case 'reps':
    case 'timed':
      return exercise.sets || 1;
    case 'distance':
    case 'carry':
    case 'optional':
    case 'open':
    case 'note_only':
      return 1;
    default:
      return 1;
  }
}

export function isStructuredExercise(exercise) {
  return ['weighted_reps', 'reps', 'timed'].includes(exercise.type);
}

export function isSimpleLogExercise(exercise) {
  return exercise.type === 'distance' || exercise.type === 'optional';
}

export function isCardExercise(exercise) {
  return isStructuredExercise(exercise) || exercise.type === 'carry';
}

export function isChecklistExercise(exercise) {
  return ['distance', 'carry', 'optional', 'open', 'note_only'].includes(exercise.type);
}

export function formatPrescription(exercise, setNumber) {
  switch (exercise.type) {
    case 'weighted_reps':
      return `${exercise.weight}${exercise.weightUnit} × ${exercise.reps}`;
    case 'reps':
      if (exercise.repsMin && exercise.repsMax) {
        return `${exercise.repsMin}–${exercise.repsMax} reps`;
      }
      return `${exercise.reps} reps`;
    case 'timed':
      return `${exercise.duration}${exercise.durationUnit}`;
    case 'distance':
      if (exercise.distanceMin && exercise.distanceMax) {
        return `${exercise.distanceMin}–${exercise.distanceMax}${exercise.distanceUnit}`;
      }
      return `${exercise.distance}${exercise.distanceUnit}${exercise.notes ? ` (${exercise.notes})` : ''}`;
    case 'carry':
      if (exercise.weightMin && exercise.weightMax) {
        return `${exercise.weightMin}–${exercise.weightMax}${exercise.weightUnit}`;
      }
      return `${exercise.weight}${exercise.weightUnit}`;
    case 'optional':
      return 'Optional';
    case 'open':
      return 'Open';
    case 'note_only':
      return '';
    default:
      return '';
  }
}

export function advanceMissionPointer(mission) {
  const exercises = mission.exercises.filter((e) => !mission.skippedExercises.includes(e.id));
  let { currentExerciseIndex } = mission;

  currentExerciseIndex += 1;
  mission.currentExerciseIndex = currentExerciseIndex;
  mission.currentSet = 1;

  const nextExercise = exercises[currentExerciseIndex];
  const done = !nextExercise || currentExerciseIndex >= exercises.length;

  return { done, mission, exercise: nextExercise };
}

export function getCurrentExercise(mission) {
  const exercises = mission.exercises.filter((e) => !mission.skippedExercises.includes(e.id));
  return exercises[mission.currentExerciseIndex] || null;
}

export function computeSuggestedRating(mission, setLogs) {
  if (mission.isFds) return MISSION_RATINGS.MINIMUM;

  const exercises = mission.exercises.filter((e) => e.type !== 'note_only');
  const required = exercises.filter((e) => e.type !== 'optional');
  const completedExerciseIds = new Set(setLogs.map((l) => l.exerciseId));

  const requiredDone = required.every((e) => completedExerciseIds.has(e.id));
  const allDone = exercises.every((e) => e.type === 'optional' || completedExerciseIds.has(e.id) || mission.skippedExercises.includes(e.id));

  if (allDone && requiredDone) {
    const optionalSkipped = exercises.some((e) => e.type === 'optional' && !completedExerciseIds.has(e.id));
    return optionalSkipped ? MISSION_RATINGS.FULL : MISSION_RATINGS.PERFECT;
  }
  if (requiredDone) return MISSION_RATINGS.FULL;
  if (completedExerciseIds.size > 0) return MISSION_RATINGS.RECOVERY;
  return MISSION_RATINGS.ABANDONED;
}
