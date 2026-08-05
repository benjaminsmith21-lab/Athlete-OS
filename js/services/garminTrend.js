import { addDays } from '../utils/datetime.js';

export function sortDailyHealth(records) {
  return [...records].sort((a, b) => a.localDate.localeCompare(b.localDate));
}

export function getDailyHealthForDate(records, localDate) {
  return records.find((r) => r.localDate === localDate) || null;
}

export function getDailyHealthInRange(records, startDate, endDate) {
  return sortDailyHealth(records).filter((r) => r.localDate >= startDate && r.localDate <= endDate);
}

function valuesInWindow(records, endDate, days, getter) {
  const startDate = addDays(endDate, -(days - 1));
  return sortDailyHealth(records)
    .filter((r) => r.localDate >= startDate && r.localDate <= endDate)
    .map(getter)
    .filter((v) => v != null && !Number.isNaN(v));
}

export function calculateRollingAverage(records, endDate, days, getter) {
  const values = valuesInWindow(records, endDate, days, getter);
  if (!values.length) return { average: null, count: 0, provisional: true };
  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    average: Math.round((sum / values.length) * 10) / 10,
    count: values.length,
    provisional: values.length < days
  };
}

export function getSleepSevenDayAverage(records, endDate) {
  return calculateRollingAverage(
    records,
    endDate,
    7,
    (r) => r.sleep?.totalSeconds ?? null
  );
}

export function getRhrSevenDayAverage(records, endDate) {
  return calculateRollingAverage(records, endDate, 7, (r) => r.restingHeartRateBpm ?? null);
}

export function getHrvSevenDayAverage(records, endDate) {
  return calculateRollingAverage(records, endDate, 7, (r) => r.hrvNightlyAverageMs ?? null);
}

export function getStepsSevenDayAverage(records, endDate) {
  return calculateRollingAverage(records, endDate, 7, (r) => r.steps ?? null);
}

export function getStressSevenDayAverage(records, endDate) {
  return calculateRollingAverage(records, endDate, 7, (r) => r.averageStress ?? null);
}

export function getLatestDailyHealthRecord(records) {
  const sorted = sortDailyHealth(records);
  return sorted[sorted.length - 1] || null;
}

/** Prefer today, then yesterday, for Command Centre teaser. */
export function getRecentDailyHealth(records, endDate) {
  return (
    getDailyHealthForDate(records, endDate) ||
    getDailyHealthForDate(records, addDays(endDate, -1)) ||
    getLatestDailyHealthRecord(records)
  );
}

export function formatSleepDuration(totalSeconds) {
  if (totalSeconds == null || totalSeconds <= 0) return null;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function buildRecoveryTeaserLine(records, endDate) {
  const recent = getRecentDailyHealth(records, endDate);
  if (!recent) return null;
  const parts = [];
  const sleep = formatSleepDuration(recent.sleep?.totalSeconds);
  if (sleep) parts.push(`Last night: ${sleep}`);
  if (recent.restingHeartRateBpm != null) parts.push(`RHR ${recent.restingHeartRateBpm} bpm`);
  return parts.length ? parts.join(' · ') : null;
}

export function daysSinceIsoDate(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((Date.now() - then.getTime()) / (24 * 60 * 60 * 1000));
}
