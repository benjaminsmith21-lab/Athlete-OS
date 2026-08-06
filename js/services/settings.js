import { get, put } from '../db.js';

export const SETTINGS_ID = 'user';

export const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  weightUnit: 'kg',
  restTimerSeconds: 60,
  showNextExerciseOnRest: true,
  restTimerSoundEnabled: true,
  autoBackupEnabled: true,
  autoBackupIntervalDays: 7,
  lastBackupExportAt: null,
  backupDirtyAt: null,
  restorePromptDismissed: false
};

const KG_TO_LBS = 2.20462;

export function roundWeight(value) {
  return Math.round(value * 2) / 2;
}

export function kgToUnit(kg, unit) {
  if (kg == null || kg === '') return '';
  if (unit === 'lbs') return roundWeight(kg * KG_TO_LBS);
  return kg;
}

export function unitToKg(value, unit) {
  if (value == null || value === '') return null;
  if (unit === 'lbs') return roundWeight(value / KG_TO_LBS);
  return value;
}

export function convertWeight(value, fromUnit, toUnit) {
  if (value == null || value === '' || fromUnit === toUnit) return value;
  if (fromUnit === 'kg' && toUnit === 'lbs') return roundWeight(value * KG_TO_LBS);
  if (fromUnit === 'lbs' && toUnit === 'kg') return roundWeight(value / KG_TO_LBS);
  return value;
}

export async function getSettings() {
  const saved = await get('settings', SETTINGS_ID);
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const next = { ...current, ...partial, id: SETTINGS_ID };
  await put('settings', next);
  return next;
}

export function weightStep(unit) {
  return unit === 'lbs' ? 1 : 0.5;
}

export function bodyweightStart(unit) {
  return unit === 'lbs' ? 5 : 2.5;
}
