import { getTrackingTypeLabel } from './trackingTypes.js';
import { normalizeExerciseRecord } from './exerciseSchema.js';

export function normalizeSearchText(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

export function tokenizeSearchQuery(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

export function buildSearchHaystack(exercise) {
  const normalized = normalizeExerciseRecord(exercise);
  const technique = normalized.technique || {};
  return normalizeSearchText(
    [
      normalized.name,
      normalized.nameNormalized,
      ...(normalized.aliases || []),
      normalized.category,
      normalized.movementPattern,
      ...(normalized.primaryMuscles || []),
      ...(normalized.secondaryMuscles || []),
      ...(normalized.equipment || []),
      ...(normalized.keywords || []),
      getTrackingTypeLabel(normalized.trackingType),
      technique.setup,
      ...(technique.cues || []),
      ...(technique.commonMistakes || []),
      normalized.description,
      ...(normalized.cues || [])
    ]
      .filter(Boolean)
      .join(' ')
  );
}

export function scoreExerciseMatch(exercise, query) {
  const tokens = tokenizeSearchQuery(query);
  if (!tokens.length) return 1;

  const haystack = buildSearchHaystack(exercise);
  const nameNorm = normalizeSearchText(exercise.name);
  let score = 0;

  for (const token of tokens) {
    if (!haystack.includes(token)) return 0;
    if (nameNorm.includes(token)) score += 10;
    else if ((exercise.aliases || []).some((alias) => normalizeSearchText(alias).includes(token))) score += 8;
    else if ((exercise.keywords || []).some((kw) => normalizeSearchText(kw).includes(token))) score += 5;
    else score += 1;
  }

  return score;
}

export function applyExerciseFilters(exercises, filters = {}, settings = {}) {
  let result = exercises;

  if (filters.filter === 'custom') {
    result = result.filter((exercise) => exercise.isCustom);
  } else if (filters.filter === 'favourites') {
    const favs = new Set(settings.favoriteExerciseIds || []);
    result = result.filter((exercise) => favs.has(exercise.id));
  } else if (filters.filter && filters.filter !== 'all') {
    result = result.filter((exercise) => exercise.category === filters.filter);
  }

  if (filters.equipment) {
    result = result.filter((exercise) => (exercise.equipment || []).includes(filters.equipment));
  }

  if (filters.movementPattern) {
    result = result.filter((exercise) => exercise.movementPattern === filters.movementPattern);
  }

  if (filters.bodyArea) {
    const area = normalizeSearchText(filters.bodyArea);
    result = result.filter((exercise) => buildSearchHaystack(exercise).includes(area));
  }

  return result;
}

export function searchAndRankExercises(exercises, query = '', filters = {}, settings = {}) {
  const filtered = applyExerciseFilters(exercises, filters, settings);
  const tokens = tokenizeSearchQuery(query);
  if (!tokens.length) return filtered.sort((a, b) => a.name.localeCompare(b.name));

  return filtered
    .map((exercise) => ({ exercise, score: scoreExerciseMatch(exercise, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .map((item) => item.exercise);
}
