import { LEGACY_V1 } from './legacy-v1.js';
import { SQUAT_LUNGE } from './squat-lunge.js';
import { HINGE } from './hinge.js';
import { PUSH_HORIZONTAL } from './push-horizontal.js';
import { PUSH_VERTICAL } from './push-vertical.js';
import { PULL_HORIZONTAL } from './pull-horizontal.js';
import { PULL_VERTICAL } from './pull-vertical.js';
import { CARRY } from './carry.js';
import { CORE } from './core.js';
import { SHOULDER_STABILITY } from './shoulder-stability.js';
import { MOBILITY } from './mobility.js';
import { RUNNING } from './running.js';
import { CONDITIONING } from './conditioning.js';

export const EXERCISE_LIBRARY_SEED = [
  ...LEGACY_V1,
  ...SQUAT_LUNGE,
  ...HINGE,
  ...PUSH_HORIZONTAL,
  ...PUSH_VERTICAL,
  ...PULL_HORIZONTAL,
  ...PULL_VERTICAL,
  ...CARRY,
  ...CORE,
  ...SHOULDER_STABILITY,
  ...MOBILITY,
  ...RUNNING,
  ...CONDITIONING
];

export const LIBRARY_TO_LEGACY_IDS = Object.fromEntries(
  EXERCISE_LIBRARY_SEED.map((exercise) => [exercise.id, exercise.legacyInstanceIds || []])
);

export const LEGACY_ID_TO_LIBRARY = Object.fromEntries(
  EXERCISE_LIBRARY_SEED.flatMap((exercise) =>
    (exercise.legacyInstanceIds || []).map((legacyId) => [legacyId, exercise.id])
  )
);

export function getLibraryIdForLegacyInstance(legacyId) {
  return LEGACY_ID_TO_LIBRARY[legacyId] || null;
}

export { LEGACY_V1, SQUAT_LUNGE, HINGE, PUSH_HORIZONTAL, PUSH_VERTICAL, PULL_HORIZONTAL, PULL_VERTICAL, CARRY, CORE, SHOULDER_STABILITY, MOBILITY, RUNNING, CONDITIONING };
