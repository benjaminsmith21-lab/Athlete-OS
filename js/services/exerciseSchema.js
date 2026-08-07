export const MAX_TECHNIQUE_CUES = 3;
export const MAX_TECHNIQUE_MISTAKES = 3;

export function clampTechniqueList(items = [], max = 3) {
  return (Array.isArray(items) ? items : []).map((item) => String(item).trim()).filter(Boolean).slice(0, max);
}

export function buildTechnique(input = {}) {
  const setup = String(input.setup || input.description || '').trim();
  const cues = clampTechniqueList(input.cues, MAX_TECHNIQUE_CUES);
  const commonMistakes = clampTechniqueList(input.commonMistakes, MAX_TECHNIQUE_MISTAKES);
  if (!setup && !cues.length && !commonMistakes.length) return null;
  return { setup, cues, commonMistakes };
}

export function normalizeExerciseRecord(exercise) {
  if (!exercise) return exercise;

  const legacyCues = Array.isArray(exercise.cues) ? exercise.cues.filter(Boolean) : [];
  const legacyDescription = String(exercise.description || '').trim();
  const techniqueInput = exercise.technique || {};

  const technique = buildTechnique({
    setup: techniqueInput.setup || legacyDescription,
    cues: techniqueInput.cues?.length ? techniqueInput.cues : legacyCues,
    commonMistakes: techniqueInput.commonMistakes || []
  });

  return {
    ...exercise,
    aliases: Array.isArray(exercise.aliases) ? exercise.aliases.filter(Boolean) : [],
    primaryMuscles: Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles.filter(Boolean) : [],
    secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles.filter(Boolean) : [],
    keywords: Array.isArray(exercise.keywords) ? exercise.keywords.filter(Boolean) : [],
    equipment: Array.isArray(exercise.equipment) ? exercise.equipment.filter(Boolean) : [],
    cues: technique?.cues || legacyCues,
    description: technique?.setup || legacyDescription,
    technique: technique || { setup: '', cues: [], commonMistakes: [] }
  };
}

export function techniqueWasEdited(current, seedDefaults = {}) {
  if (!current) return false;
  const normalized = normalizeExerciseRecord(current);
  const seedTechnique = buildTechnique(seedDefaults.technique || {
    setup: seedDefaults.description,
    cues: seedDefaults.cues
  });

  if (!seedTechnique) {
    return Boolean(normalized.technique?.setup || normalized.technique?.cues?.length);
  }

  const setupChanged = normalized.technique.setup !== seedTechnique.setup;
  const cuesChanged =
    JSON.stringify(normalized.technique.cues || []) !== JSON.stringify(seedTechnique.cues || []);
  const mistakesChanged = (normalized.technique.commonMistakes || []).length > 0;
  return setupChanged || cuesChanged || mistakesChanged;
}

export function mergeSeedMetadata(current, seed) {
  const merged = { ...current };
  const arrayFields = ['aliases', 'primaryMuscles', 'secondaryMuscles', 'keywords'];

  for (const field of arrayFields) {
    const local = current[field];
    const seeded = seed[field];
    if (!Array.isArray(local) || local.length === 0) {
      merged[field] = Array.isArray(seeded) ? [...seeded] : [];
    }
  }

  if (!techniqueWasEdited(current, seed)) {
    merged.technique = buildTechnique(seed.technique || {
      setup: seed.description,
      cues: seed.cues
    });
    merged.description = merged.technique?.setup || '';
    merged.cues = merged.technique?.cues || [];
  }

  return normalizeExerciseRecord(merged);
}

export function parseCommaList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseLineList(value, max = 3) {
  return clampTechniqueList(
    String(value || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    max
  );
}
