import { formatExerciseName } from './mission.js';

const TIMED_EXERCISE_IDS = ['mon-hangs', 'thu-hangs', 'fri-hangs', 'fds-hangs'];
const WEIGHTED_PROGRESSION_IDS = ['tue-goblet', 'tue-row', 'mon-halos'];

export function getProgressionHints(exercise, recentLogs = []) {
  if (!exercise || !recentLogs.length) return [];

  const hints = [];
  const name = formatExerciseName(exercise.name);

  if (exercise.type === 'timed' || TIMED_EXERCISE_IDS.includes(exercise.id)) {
    const prescribed = exercise.duration;
    const matching = recentLogs.filter((l) => l.actual?.duration === prescribed);
    if (matching.length >= 2 && prescribed != null) {
      hints.push({
        type: 'observation',
        title: 'Hang progression',
        message: `${matching.length} recent sessions at ${prescribed}s. Progression rule: add 5 seconds before making hangs harder.`,
        confidence: 0.8
      });
    }
  }

  if (exercise.type === 'weighted_reps' || WEIGHTED_PROGRESSION_IDS.includes(exercise.id)) {
    const prescribedWeight = exercise.weight;
    const prescribedReps = exercise.reps;
    const matching = recentLogs.filter(
      (l) =>
        l.actual?.weight === prescribedWeight &&
        l.actual?.reps === prescribedReps &&
        prescribedWeight != null
    );
    if (matching.length >= 3) {
      hints.push({
        type: 'observation',
        title: 'Load progression',
        message: `${matching.length} clean sessions at ${prescribedWeight}${exercise.weightUnit || 'kg'} × ${prescribedReps} on ${name}. Consider a small weight increase when every rep stays crisp.`,
        confidence: 0.75
      });
    }
  }

  if (exercise.id === 'mon-z2' && recentLogs.length >= 2) {
    const withPace = recentLogs.filter((l) => l.actual?.distance && l.actual?.elapsedSeconds);
    if (withPace.length >= 2) {
      hints.push({
        type: 'no_action',
        title: 'Zone 2 baseline building',
        message: `${withPace.length} logged runs with distance and duration. Compare pace in Campaign Review every 4 weeks.`,
        confidence: 0.7
      });
    }
  }

  return hints;
}

export function formatExerciseHistoryRows(logs, unit = 'kg') {
  return logs.map((log) => {
    const a = log.actual;
    const date = (log.completedAt || '').slice(0, 10);
    if (a.duration) return { date, summary: `${a.duration}${a.durationUnit || 's'}` };
    if (a.weight && a.reps) return { date, summary: `${a.weight}${a.weightUnit || unit} × ${a.reps}` };
    if (a.distance) {
      let s = `${a.distance}${a.distanceUnit || 'km'}`;
      if (a.elapsedSeconds && a.distance > 0) {
        const pace = a.elapsedSeconds / 60 / a.distance;
        const mins = Math.floor(pace);
        const secs = Math.round((pace - mins) * 60);
        s += ` · ${mins}:${String(secs).padStart(2, '0')}/km`;
      }
      return { date, summary: s };
    }
    if (a.reps) return { date, summary: `${a.reps} reps` };
    return { date, summary: 'Logged' };
  });
}
