import { get, getAll, put, remove, generateId, getOneByIndex } from '../db.js';
import { DEFAULT_TIMEZONE, getLocalDateString, getLocalISOString } from '../utils/datetime.js';
import { detectPotentialOutlier, getLatestMeasurement, sortMeasurements } from './bodyTrend.js';

export const BODY_STORE = 'bodyMeasurements';
export const SOFT_MIN_KG = 70;
export const SOFT_MAX_KG = 150;

export async function getAllMeasurements() {
  return sortMeasurements(await getAll(BODY_STORE));
}

export async function getMeasurementByDate(date) {
  return getOneByIndex(BODY_STORE, 'date', date);
}

export async function getMeasurementById(id) {
  return get(BODY_STORE, id);
}

export async function getTodayMeasurement(timezone = DEFAULT_TIMEZONE) {
  const date = getLocalDateString(new Date(), timezone);
  return getMeasurementByDate(date);
}

export async function getLatestStoredMeasurement() {
  const all = await getAllMeasurements();
  return getLatestMeasurement(all);
}

export function roundWeightKg(value) {
  return Math.round(Number(value) * 10) / 10;
}

export function validateMeasurementInput(input) {
  const errors = [];
  const weight = input.weightKg;

  if (weight === '' || weight == null || Number.isNaN(Number(weight))) {
    errors.push('Weight is required.');
  } else if (Number(weight) <= 0) {
    errors.push('Weight must be greater than zero.');
  }

  const weightKg = roundWeightKg(weight);
  let softRangeWarning = null;
  if (!errors.length && (weightKg < SOFT_MIN_KG || weightKg > SOFT_MAX_KG)) {
    softRangeWarning = 'This is outside your usual range. Check the value before saving.';
  }

  let bodyFatPercent;
  if (input.bodyFatPercent !== '' && input.bodyFatPercent != null) {
    bodyFatPercent = roundWeightKg(input.bodyFatPercent);
    if (bodyFatPercent <= 0 || bodyFatPercent > 70) errors.push('Body fat must be between 0 and 70%.');
  }

  let waistCm;
  if (input.waistCm !== '' && input.waistCm != null) {
    waistCm = roundWeightKg(input.waistCm);
    if (waistCm <= 0 || waistCm > 200) errors.push('Waist must be between 0 and 200 cm.');
  }

  return {
    valid: errors.length === 0,
    errors,
    softRangeWarning,
    parsed: {
      weightKg,
      bodyFatPercent,
      waistCm,
      note: input.note?.trim() || undefined
    }
  };
}

export async function checkOutlierBeforeSave(weightKg, date) {
  const all = await getAllMeasurements();
  const existing = all.filter((m) => m.date !== date);
  return detectPotentialOutlier(weightKg, existing, date);
}

export async function saveDailyMeasurement(input, options = {}) {
  const timezone = options.timezone || DEFAULT_TIMEZONE;
  const validation = validateMeasurementInput(input);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const date = options.date || getLocalDateString(new Date(), timezone);
  const nowIso = getLocalISOString(new Date(), timezone);
  const existing = await getMeasurementByDate(date);

  const record = {
    id: existing?.id || generateId('body'),
    date,
    recordedAt: existing?.recordedAt || nowIso,
    updatedAt: nowIso,
    timezone,
    weightKg: validation.parsed.weightKg,
    bodyFatPercent: validation.parsed.bodyFatPercent,
    waistCm: validation.parsed.waistCm,
    note: validation.parsed.note,
    source: options.source || existing?.source || 'manual',
    isConfirmedOutlier: options.isConfirmedOutlier ?? existing?.isConfirmedOutlier,
    excludeFromTrend: options.excludeFromTrend ?? existing?.excludeFromTrend
  };

  await put(BODY_STORE, record);
  const saved = await get(BODY_STORE, record.id);
  return { ok: true, record: saved, softRangeWarning: validation.softRangeWarning };
}

export async function deleteMeasurement(id) {
  const existing = await get(BODY_STORE, id);
  if (!existing) return null;
  await remove(BODY_STORE, id);
  return existing;
}

export async function getDaysSinceLastWaist() {
  const all = await getAllMeasurements();
  const withWaist = all.filter((m) => m.waistCm != null).sort((a, b) => b.date.localeCompare(a.date));
  if (!withWaist.length) return Infinity;
  const today = getLocalDateString();
  const last = withWaist[0].date;
  const d1 = new Date(today + 'T12:00:00');
  const d2 = new Date(last + 'T12:00:00');
  return Math.round((d1 - d2) / (24 * 60 * 60 * 1000));
}
