import { getLocalDateString } from '../utils/datetime.js';
import {
  sortDailyHealth,
  getDailyHealthForDate,
  getSleepSevenDayAverage,
  getRhrSevenDayAverage,
  getHrvSevenDayAverage,
  formatSleepDuration,
  daysSinceIsoDate
} from './garminTrend.js';

const STALE_IMPORT_DAYS = 7;

export function getGarminCoachInsights(dailyRecords, syncState, endDate = getLocalDateString()) {
  const insights = [];
  const sorted = sortDailyHealth(dailyRecords);
  if (!sorted.length) return insights;

  const today = getDailyHealthForDate(sorted, endDate);
  const latest = sorted[sorted.length - 1];
  const record = today || latest;

  const sleepSeven = getSleepSevenDayAverage(sorted, endDate);
  const rhrSeven = getRhrSevenDayAverage(sorted, endDate);
  const hrvSeven = getHrvSevenDayAverage(sorted, endDate);

  const lastSuccess = syncState?.lastSuccessAt;
  const daysSinceImport = daysSinceIsoDate(lastSuccess);
  if (daysSinceImport != null && daysSinceImport >= STALE_IMPORT_DAYS) {
    insights.push({
      type: 'observation',
      title: 'Garmin data aging',
      message: `Last import was ${daysSinceImport} days ago. Re-export from your PC to refresh recovery trends.`,
      confidence: 0.85,
      evidence: [`Last import: ${lastSuccess}`]
    });
  }

  if (
    record?.sleep?.totalSeconds != null &&
    sleepSeven.average != null &&
    !sleepSeven.provisional &&
    record.sleep.totalSeconds < sleepSeven.average * 0.9
  ) {
    insights.push({
      type: 'observation',
      title: 'Sleep below average',
      message: `Last night was ${formatSleepDuration(record.sleep.totalSeconds)}. Your 7-day average is ${formatSleepDuration(Math.round(sleepSeven.average))}.`,
      confidence: 0.8,
      evidence: [`Sleep: ${record.sleep.totalSeconds}s`, `7-day avg: ${sleepSeven.average}s`]
    });
  }

  if (
    record?.restingHeartRateBpm != null &&
    rhrSeven.average != null &&
    !rhrSeven.provisional &&
    record.restingHeartRateBpm > rhrSeven.average + 3
  ) {
    insights.push({
      type: 'observation',
      title: 'Resting HR elevated',
      message: `Today's resting HR is ${record.restingHeartRateBpm} bpm vs a 7-day average of ${Math.round(rhrSeven.average)} bpm.`,
      confidence: 0.75,
      evidence: [`RHR: ${record.restingHeartRateBpm}`, `7-day avg: ${rhrSeven.average}`]
    });
  }

  if (
    record?.hrvNightlyAverageMs != null &&
    hrvSeven.average != null &&
    !hrvSeven.provisional &&
    record.hrvNightlyAverageMs < hrvSeven.average * 0.85
  ) {
    insights.push({
      type: 'observation',
      title: 'HRV below recent baseline',
      message: `Nightly HRV is ${record.hrvNightlyAverageMs} ms vs a 7-day average of ${Math.round(hrvSeven.average)} ms.`,
      confidence: 0.7,
      evidence: [`HRV: ${record.hrvNightlyAverageMs} ms`, `7-day avg: ${hrvSeven.average} ms`]
    });
  }

  if (
    record?.sleep?.totalSeconds != null &&
    sleepSeven.average != null &&
    !sleepSeven.provisional &&
    record.sleep.totalSeconds >= sleepSeven.average &&
    record.restingHeartRateBpm != null &&
    rhrSeven.average != null &&
    record.restingHeartRateBpm <= rhrSeven.average + 2
  ) {
    insights.push({
      type: 'no_action',
      title: 'Recovery stable',
      message: 'Sleep and resting heart rate are in line with your recent baseline.',
      confidence: 0.65,
      evidence: []
    });
  }

  return insights;
}
