import { getSettings, saveSettings } from './settings.js';
import { getExercise, getAllExercises } from './exerciseLibrary.js';

export const MAX_RECENT_EXERCISES = 12;

export async function getFavoriteExerciseIds() {
  const settings = await getSettings();
  return settings.favoriteExerciseIds || [];
}

export async function isFavoriteExercise(id) {
  if (!id) return false;
  const favorites = await getFavoriteExerciseIds();
  return favorites.includes(id);
}

export async function toggleFavoriteExercise(id) {
  if (!id) return false;
  const settings = await getSettings();
  const favorites = [...(settings.favoriteExerciseIds || [])];
  const index = favorites.indexOf(id);
  if (index >= 0) {
    favorites.splice(index, 1);
    await saveSettings({ favoriteExerciseIds: favorites });
    return false;
  }
  favorites.unshift(id);
  await saveSettings({ favoriteExerciseIds: favorites });
  return true;
}

export async function getRecentExerciseIds() {
  const settings = await getSettings();
  return settings.recentExerciseIds || [];
}

export async function recordRecentExercise(id) {
  if (!id) return;
  const exercise = await getExercise(id);
  if (!exercise || exercise.active === false) return;

  const settings = await getSettings();
  const recent = [...(settings.recentExerciseIds || [])].filter((item) => item !== id);
  recent.unshift(id);
  await saveSettings({ recentExerciseIds: recent.slice(0, MAX_RECENT_EXERCISES) });
}

export async function getFavoriteExercises({ includeArchived = false } = {}) {
  const favorites = new Set(await getFavoriteExerciseIds());
  const exercises = await getAllExercises({ includeArchived });
  return exercises.filter((exercise) => favorites.has(exercise.id));
}

export async function getRecentExercises({ includeArchived = false } = {}) {
  const recentIds = await getRecentExerciseIds();
  const byId = Object.fromEntries((await getAllExercises({ includeArchived })).map((e) => [e.id, e]));
  return recentIds.map((id) => byId[id]).filter(Boolean);
}

export function partitionExerciseSections(exercises, favoriteIds = [], recentIds = []) {
  const favoriteSet = new Set(favoriteIds);
  const recentSet = new Set(recentIds);
  const seen = new Set();

  const favourites = [];
  const recent = [];
  const all = [];

  for (const id of favoriteIds) {
    const exercise = exercises.find((item) => item.id === id);
    if (exercise && !seen.has(id)) {
      favourites.push(exercise);
      seen.add(id);
    }
  }

  for (const id of recentIds) {
    if (favoriteSet.has(id)) continue;
    const exercise = exercises.find((item) => item.id === id);
    if (exercise && !seen.has(id)) {
      recent.push(exercise);
      seen.add(id);
    }
  }

  for (const exercise of exercises) {
    if (!seen.has(exercise.id)) {
      all.push(exercise);
      seen.add(exercise.id);
    }
  }

  return { favourites, recent, all };
}
