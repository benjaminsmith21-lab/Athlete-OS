import { get, getAll, put, generateId } from '../db.js';
import { getLocalISOString } from '../utils/datetime.js';
import { EXERCISE_LIBRARY_SEED } from '../seed/exercises/index.js';
import { isValidTrackingType, getTrackingTypeLabel } from './trackingTypes.js';
import { isValidCategory, isValidEquipment } from './equipment.js';
import { getSettings } from './settings.js';
import { searchAndRankExercises } from './exerciseSearch.js';
import {
  normalizeExerciseRecord,
  mergeSeedMetadata,
  buildTechnique,
  parseCommaList,
  clampTechniqueList,
  MAX_TECHNIQUE_CUES,
  MAX_TECHNIQUE_MISTAKES
} from './exerciseSchema.js';

export {
  getLibraryIdForLegacyInstance,
  LIBRARY_TO_LEGACY_IDS,
  LEGACY_ID_TO_LIBRARY
} from '../seed/exercises/index.js';
export { getTrackingTypeLabel } from './trackingTypes.js';
export { normalizeExerciseRecord } from './exerciseSchema.js';

const SEED_MARKER_V1 = 'exercise-library-seed-v1';
const SEED_MARKER_V2 = 'exercise-library-seed-v2';
const SEED_MARKERS = new Set([SEED_MARKER_V1, SEED_MARKER_V2]);

/** Retired seed IDs — archived on re-seed; resolve to canonical via RETIRED_LIBRARY_ALIASES. */
const RETIRED_SEED_IDS = ['bottom-up-hold'];

const RETIRED_LIBRARY_ALIASES = {
  'bottom-up-hold': 'bottom-up-carry'
};

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function stampExercise(exercise, partial = {}) {
  const now = getLocalISOString();
  return normalizeExerciseRecord({
    ...exercise,
    ...partial,
    nameNormalized: normalizeName(partial.name ?? exercise.name),
    updatedAt: now,
    createdAt: exercise.createdAt || partial.createdAt || now
  });
}

function isSeedMarker(record) {
  return SEED_MARKERS.has(record?.id);
}

function buildExerciseFromInput(input, base = {}) {
  const technique = buildTechnique({
    setup:
      input.technique?.setup ??
      input.setup ??
      (input.description !== undefined ? input.description : base.technique?.setup ?? base.description),
    cues: input.technique?.cues ?? input.cues ?? base.technique?.cues ?? base.cues,
    commonMistakes:
      input.technique?.commonMistakes ?? input.commonMistakes ?? base.technique?.commonMistakes
  });

  return normalizeExerciseRecord({
    ...base,
    ...input,
    aliases: Array.isArray(input.aliases)
      ? input.aliases.filter(Boolean)
      : input.aliases != null
        ? parseCommaList(input.aliases)
        : base.aliases || [],
    primaryMuscles: Array.isArray(input.primaryMuscles)
      ? input.primaryMuscles.filter(Boolean)
      : input.primaryMuscles != null
        ? parseCommaList(input.primaryMuscles)
        : base.primaryMuscles || [],
    secondaryMuscles: Array.isArray(input.secondaryMuscles)
      ? input.secondaryMuscles.filter(Boolean)
      : input.secondaryMuscles != null
        ? parseCommaList(input.secondaryMuscles)
        : base.secondaryMuscles || [],
    keywords: Array.isArray(input.keywords)
      ? input.keywords.filter(Boolean)
      : input.keywords != null
        ? parseCommaList(input.keywords)
        : base.keywords || [],
    equipment:
      input.equipment != null
        ? (Array.isArray(input.equipment) ? input.equipment.filter(Boolean) : [])
        : base.equipment || [],
    technique,
    description: technique?.setup || input.description || base.description || '',
    cues: technique?.cues || base.cues || []
  });
}

export function validateExerciseInput(input, { requireName = true, requireTrackingType = true } = {}) {
  const errors = [];
  const name = String(input.name || '').trim();
  if (requireName && !name) errors.push('Exercise name is required.');
  if (requireTrackingType && !isValidTrackingType(input.trackingType)) {
    errors.push('Tracking type is required.');
  }
  if (input.category && !isValidCategory(input.category)) {
    errors.push('Invalid category.');
  }
  if (Array.isArray(input.equipment)) {
    for (const item of input.equipment) {
      if (item && !isValidEquipment(item)) errors.push(`Invalid equipment: ${item}`);
    }
  }
  const cueCount = clampTechniqueList(input.technique?.cues ?? input.cues, MAX_TECHNIQUE_CUES).length;
  const mistakeCount = clampTechniqueList(
    input.technique?.commonMistakes ?? input.commonMistakes,
    MAX_TECHNIQUE_MISTAKES
  ).length;
  if (cueCount > MAX_TECHNIQUE_CUES) errors.push(`Maximum ${MAX_TECHNIQUE_CUES} form cues.`);
  if (mistakeCount > MAX_TECHNIQUE_MISTAKES) errors.push(`Maximum ${MAX_TECHNIQUE_MISTAKES} common mistakes.`);
  return errors;
}

export async function getAllExercises({ includeArchived = false } = {}) {
  const all = await getAll('exerciseLibrary');
  return all
    .filter((exercise) => !isSeedMarker(exercise))
    .filter((exercise) => includeArchived || exercise.active !== false)
    .map(normalizeExerciseRecord)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getExercise(id) {
  if (!id || isSeedMarker({ id })) return null;
  const resolvedId = RETIRED_LIBRARY_ALIASES[id] || id;
  const exercise = await get('exerciseLibrary', resolvedId);
  return exercise ? normalizeExerciseRecord(exercise) : null;
}

export async function searchExercises(query = '', options = {}) {
  const {
    filter = 'all',
    equipment = null,
    movementPattern = null,
    bodyArea = null,
    includeArchived = false
  } = options;

  const exercises = await getAllExercises({ includeArchived });
  const settings = await getSettings();
  return searchAndRankExercises(
    exercises,
    query,
    { filter, equipment, movementPattern, bodyArea },
    settings
  );
}

export async function findDuplicateByName(name, excludeId = null) {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  const all = await getAll('exerciseLibrary');
  return (
    all.find(
      (exercise) =>
        !isSeedMarker(exercise) &&
        exercise.id !== excludeId &&
        exercise.nameNormalized === normalized
    ) || null
  );
}

export async function seedExerciseLibraryIfNeeded() {
  const existing = await getAll('exerciseLibrary');
  const byId = Object.fromEntries(existing.map((item) => [item.id, item]));
  const now = getLocalISOString();

  for (const seed of EXERCISE_LIBRARY_SEED) {
    const current = byId[seed.id];
    if (current?.isCustom) continue;

    const base = {
      description: '',
      cues: [],
      progressionNotes: seed.progressionNotes || null,
      regressionNotes: null,
      movementPattern: seed.movementPattern || 'other',
      defaultUnit: 'kg',
      legacyInstanceIds: current?.legacyInstanceIds?.length
        ? current.legacyInstanceIds
        : seed.legacyInstanceIds || [],
      active: current?.active ?? true,
      isCustom: false,
      aliases: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      keywords: [],
      ...seed
    };

    const merged = current
      ? mergeSeedMetadata(
          stampExercise(current, {
            progressionNotes: current.progressionNotes ?? seed.progressionNotes ?? null
          }),
          seed
        )
      : normalizeExerciseRecord(stampExercise(base, { createdAt: now }));

    await put('exerciseLibrary', merged);
  }

  for (const retiredId of RETIRED_SEED_IDS) {
    const retired = byId[retiredId];
    if (retired && !retired.isCustom && retired.active !== false) {
      await put('exerciseLibrary', { ...retired, active: false, updatedAt: now });
    }
  }

  if (!byId[SEED_MARKER_V1]) {
    await put('exerciseLibrary', { id: SEED_MARKER_V1, seededAt: now });
  }
  await put('exerciseLibrary', { id: SEED_MARKER_V2, seededAt: now, count: EXERCISE_LIBRARY_SEED.length });
}

function slugifyId(name) {
  const base = normalizeName(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || generateId('exercise').replace('exercise-', 'custom-');
}

export async function createExercise(input) {
  const errors = validateExerciseInput(input);
  if (errors.length) throw new Error(errors.join(' '));

  const duplicate = await findDuplicateByName(input.name);
  if (duplicate) {
    const err = new Error(`An exercise named "${duplicate.name}" already exists.`);
    err.code = 'DUPLICATE';
    err.duplicate = duplicate;
    throw err;
  }

  let id = input.id || slugifyId(input.name);
  if (await getExercise(id)) {
    id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const exercise = stampExercise(
    buildExerciseFromInput(input, {
      id,
      name: String(input.name).trim(),
      category: input.category || 'Other',
      movementPattern: input.movementPattern || 'other',
      trackingType: input.trackingType,
      defaultRestSeconds: input.defaultRestSeconds ?? 60,
      defaultUnit: input.defaultUnit || 'kg',
      progressionNotes: input.progressionNotes || null,
      regressionNotes: input.regressionNotes || null,
      legacyInstanceIds: [],
      active: true,
      isCustom: true
    }),
    { createdAt: getLocalISOString() }
  );

  await put('exerciseLibrary', exercise);
  return exercise;
}

export async function updateExercise(id, partial) {
  const current = await getExercise(id);
  if (!current) throw new Error('Exercise not found.');

  if (partial.name && normalizeName(partial.name) !== current.nameNormalized) {
    const duplicate = await findDuplicateByName(partial.name, id);
    if (duplicate) {
      const err = new Error(`An exercise named "${duplicate.name}" already exists.`);
      err.code = 'DUPLICATE';
      err.duplicate = duplicate;
      throw err;
    }
  }

  if (partial.trackingType && partial.trackingType !== current.trackingType) {
    if ((await exerciseHasLinkedHistory(id)) || current.legacyInstanceIds?.length) {
      const err = new Error('Tracking type cannot be changed for exercises with history.');
      err.code = 'TRACKING_LOCKED';
      throw err;
    }
  }

  const next = stampExercise(current, buildExerciseFromInput(partial, current));
  await put('exerciseLibrary', next);
  return next;
}

export async function archiveExercise(id) {
  return updateExercise(id, { active: false });
}

export async function restoreExercise(id) {
  return updateExercise(id, { active: true });
}

export async function exerciseHasLinkedHistory(id) {
  const exercise = await getExercise(id);
  if (!exercise) return false;
  const legacyIds = new Set(exercise.legacyInstanceIds || []);
  if (!legacyIds.size) return false;
  const logs = await getAll('setLogs');
  return logs.some((log) => legacyIds.has(log.exerciseId));
}

export async function mergeExerciseLibraryOnRestore(imported = []) {
  const existing = await getAll('exerciseLibrary');
  const byId = Object.fromEntries(existing.map((item) => [item.id, item]));

  for (const item of imported) {
    if (!item?.id || isSeedMarker(item)) continue;
    const normalized = normalizeExerciseRecord(item);
    const current = byId[item.id];
    if (!current) {
      await put('exerciseLibrary', normalized);
      continue;
    }
    if (current.isCustom) {
      await put('exerciseLibrary', normalizeExerciseRecord({ ...current, ...normalized, isCustom: true }));
      continue;
    }
    if (normalized.isCustom) {
      await put('exerciseLibrary', normalized);
    }
  }
}

export function formatExerciseLibraryRow(exercise) {
  const normalized = normalizeExerciseRecord(exercise);
  const equipment = (normalized.equipment || []).slice(0, 2).join(' · ') || '—';
  return {
    id: normalized.id,
    name: normalized.name,
    category: normalized.category || 'Other',
    equipment,
    trackingLabel: getTrackingTypeLabel(normalized.trackingType),
    movementPattern: normalized.movementPattern || 'other',
    isCustom: !!normalized.isCustom,
    active: normalized.active !== false
  };
}

export function getExerciseDisplayMeta(exercise) {
  const normalized = normalizeExerciseRecord(exercise);
  const equipment = (normalized.equipment || []).join(' · ') || '—';
  const pattern = normalized.movementPattern
    ? normalized.movementPattern.charAt(0).toUpperCase() + normalized.movementPattern.slice(1)
    : 'Other';
  return {
    subtitle: `${normalized.category || 'Other'} · ${pattern}`,
    equipment,
    technique: normalized.technique,
    trackingLabel: getTrackingTypeLabel(normalized.trackingType),
    defaultRestSeconds: normalized.defaultRestSeconds
  };
}
