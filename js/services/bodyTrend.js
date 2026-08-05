import { addDays, daysBetween } from '../utils/datetime.js';

export const OUTLIER_THRESHOLD_KG = 4;
export const PLATEAU_THRESHOLD_KG = 0.3;
export const PLATEAU_MIN_DAYS = 21;

export function isTrendEligible(measurement) {
  if (!measurement || measurement.excludeFromTrend) return false;
  if (measurement.isConfirmedOutlier === false) return true;
  if (measurement.isConfirmedOutlier === true && !measurement.excludeFromTrend) return true;
  return measurement.isConfirmedOutlier !== true;
}

export function sortMeasurements(measurements) {
  return [...measurements].sort((a, b) => a.date.localeCompare(b.date));
}

export function getLatestMeasurement(measurements) {
  const sorted = sortMeasurements(measurements);
  return sorted[sorted.length - 1] || null;
}

export function getMeasurementForDate(measurements, date) {
  return measurements.find((m) => m.date === date) || null;
}

export function getMeasurementsInRange(measurements, startDate, endDate) {
  return sortMeasurements(measurements).filter((m) => m.date >= startDate && m.date <= endDate);
}

export function calculateRollingAverage(measurements, endDate, days) {
  const eligible = sortMeasurements(measurements).filter(isTrendEligible);
  if (!eligible.length) return { average: null, count: 0, provisional: true };

  const startDate = addDays(endDate, -(days - 1));
  const inWindow = eligible.filter((m) => m.date >= startDate && m.date <= endDate);
  if (!inWindow.length) return { average: null, count: 0, provisional: true };

  const sum = inWindow.reduce((acc, m) => acc + m.weightKg, 0);
  return {
    average: Math.round((sum / inWindow.length) * 10) / 10,
    count: inWindow.length,
    provisional: inWindow.length < days
  };
}

export function getCurrentSevenDayAverage(measurements, endDate) {
  return calculateRollingAverage(measurements, endDate, 7);
}

export function getThirtyDayChange(measurements, endDate) {
  const current = calculateRollingAverage(measurements, endDate, 7);
  if (current.average == null) return { change: null, insufficient: true };

  const previousEnd = addDays(endDate, -24);
  const previousStart = addDays(endDate, -30);
  const eligible = sortMeasurements(measurements).filter(isTrendEligible);
  const previousWindow = eligible.filter((m) => m.date >= previousStart && m.date <= previousEnd);
  if (previousWindow.length < 3) return { change: null, insufficient: true };

  const prevAvg = previousWindow.reduce((acc, m) => acc + m.weightKg, 0) / previousWindow.length;
  return {
    change: Math.round((current.average - prevAvg) * 10) / 10,
    insufficient: false
  };
}

export function getCampaignWeightChange(measurements, campaign, endDate) {
  const bodyMetrics = campaign?.bodyMetrics;
  if (!bodyMetrics?.weightTrackingEnabled) return { change: null, insufficient: true };

  const current = calculateRollingAverage(measurements, endDate, 7);
  if (current.average == null) return { change: null, insufficient: true };

  let baseline = bodyMetrics.initialRollingBaselineKg;
  if (baseline == null) {
    const first = sortMeasurements(measurements).find(isTrendEligible);
    if (!first) return { change: null, insufficient: true };
    const atStart = calculateRollingAverage(measurements, first.date, 7);
    baseline = atStart.average ?? first.weightKg;
  }

  return {
    change: Math.round((current.average - baseline) * 10) / 10,
    insufficient: false,
    baseline
  };
}

export function getWeighInConsistency(measurements, startDate, endDate) {
  const totalDays = daysBetween(startDate, endDate) + 1;
  if (totalDays <= 0) return 0;
  const count = getMeasurementsInRange(measurements, startDate, endDate).length;
  return Math.round((count / totalDays) * 100);
}

export function getLowestRollingAverage(measurements, windowDays = 7) {
  const eligible = sortMeasurements(measurements).filter(isTrendEligible);
  if (eligible.length < windowDays) return null;

  let lowest = null;
  for (let i = windowDays - 1; i < eligible.length; i++) {
    const endDate = eligible[i].date;
    const { average } = calculateRollingAverage(eligible, endDate, windowDays);
    if (average != null && (lowest == null || average < lowest)) lowest = average;
  }
  return lowest;
}

export function detectPotentialOutlier(weightKg, measurements, endDate) {
  const { average, count } = calculateRollingAverage(measurements, endDate, 7);
  if (average == null || count < 2) return { isOutlier: false, recentAverage: null };
  const diff = Math.abs(weightKg - average);
  return {
    isOutlier: diff > OUTLIER_THRESHOLD_KG,
    recentAverage: average,
    diff: Math.round(diff * 10) / 10
  };
}

export function getWeightTrendDirection(measurements, endDate, campaign) {
  const current = calculateRollingAverage(measurements, endDate, 7);
  if (current.count < 3) return 'insufficient_data';

  const thirty = getThirtyDayChange(measurements, endDate);
  if (thirty.insufficient || thirty.change == null) return 'insufficient_data';

  const weeklyRate = thirty.change / (30 / 7);
  const expected = campaign?.bodyMetrics?.expectedWeeklyChangeKg;

  if (Math.abs(weeklyRate) < 0.05) return 'stable';
  if (weeklyRate < 0) {
    if (expected && weeklyRate < expected.min * 1.5) return 'falling_quickly';
    if (expected && weeklyRate >= expected.min && weeklyRate <= expected.max) return 'falling_on_target';
    return 'falling_slowly';
  }
  if (weeklyRate > 0.3) return 'rising_quickly';
  return 'rising_slowly';
}

export function formatWeightChange(change) {
  if (change == null) return 'More data required';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} kg`;
}
