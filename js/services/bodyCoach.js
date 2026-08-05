import { getLocalDateString } from '../utils/datetime.js';
import {
  calculateRollingAverage,
  getCurrentSevenDayAverage,
  getThirtyDayChange,
  getCampaignWeightChange,
  getWeightTrendDirection,
  getMeasurementsInRange,
  getMeasurementForDate,
  PLATEAU_MIN_DAYS,
  PLATEAU_THRESHOLD_KG
} from './bodyTrend.js';

export function getBodyCoachInsights(measurements, campaign, endDate = getLocalDateString()) {
  const insights = [];
  const bodyMetrics = campaign?.bodyMetrics;
  if (!bodyMetrics?.weightTrackingEnabled) return insights;

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return insights;

  const today = getMeasurementForDate(sorted, endDate);
  const yesterday = getMeasurementForDate(sorted, addDaysLocal(endDate, -1));
  const sevenDay = getCurrentSevenDayAverage(sorted, endDate);
  const thirtyDay = getThirtyDayChange(sorted, endDate);
  const trend = getWeightTrendDirection(sorted, endDate, campaign);

  if (sevenDay.provisional && sevenDay.count > 0 && sevenDay.count < 7) {
    insights.push({
      type: 'observation',
      title: 'Trend calibrating',
      message: `${sevenDay.count} of 7 initial weigh-ins recorded. The rolling average will become more useful after one week.`,
      confidence: 0.9,
      evidence: [`${sevenDay.count} readings in last 7 days`]
    });
  }

  if (today && yesterday && today.weightKg > yesterday.weightKg && sevenDay.average != null) {
    const prevSeven = calculateRollingAverage(sorted, addDaysLocal(endDate, -1), 7);
    if (prevSeven.average != null && sevenDay.average <= prevSeven.average + 0.2) {
      insights.push({
        type: 'no_action',
        title: 'Normal fluctuation',
        message: "Today's increase appears to be normal fluctuation. The broader trend remains unchanged.",
        confidence: 0.85,
        evidence: [`Today: ${today.weightKg} kg`, `7-day avg: ${sevenDay.average} kg`]
      });
    }
  }

  if (bodyMetrics.weightRole === 'primary' && !sevenDay.provisional && thirtyDay.change != null && thirtyDay.change < 0) {
    const expected = bodyMetrics.expectedWeeklyChangeKg;
    if (expected && trend === 'falling_on_target') {
      insights.push({
        type: 'recommendation',
        title: 'Weight trend on course',
        message: `Your seven-day average is ${formatChange(thirtyDay.change)} over the last 30 days. Maintain the current approach.`,
        confidence: 0.8,
        evidence: [`30-day trend: ${formatChange(thirtyDay.change)}`]
      });
    }
  }

  if (trend === 'falling_quickly') {
    insights.push({
      type: 'warning',
      title: 'Rapid decline',
      message: 'Weight is falling faster than planned. Protect training quality, protein intake and recovery. Do not reduce food further.',
      confidence: 0.75,
      evidence: [`Trend: ${trend}`]
    });
  }

  if (detectPlateau(sorted, endDate) && bodyMetrics.weightRole === 'primary') {
    insights.push({
      type: 'observation',
      title: 'Plateau',
      message: 'Weight has been stable for three weeks. Training consistency remains strong. Nutrition is the highest-leverage area to review.',
      confidence: 0.7,
      evidence: ['21+ days of stable rolling average']
    });
  }

  const recentDays = getMeasurementsInRange(sorted, addDaysLocal(endDate, -6), endDate);
  if (recentDays.length <= 2 && sorted.length >= 5) {
    insights.push({
      type: 'observation',
      title: 'Trend confidence',
      message: 'Weight trend confidence is lower because recent weigh-ins are limited. Record today\'s value to restore the trend.',
      confidence: 0.65,
      evidence: [`${recentDays.length} weigh-ins in last 7 days`]
    });
  }

  if (!insights.length && sevenDay.average != null && !sevenDay.provisional) {
    insights.push({
      type: 'no_action',
      title: 'Trend stable',
      message: 'Record the reading. Trust the trend. Continue the campaign.',
      confidence: 0.6,
      evidence: [`7-day average: ${sevenDay.average} kg`]
    });
  }

  return insights;
}

function addDaysLocal(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatChange(change) {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} kg`;
}

function detectPlateau(measurements, endDate) {
  if (measurements.length < PLATEAU_MIN_DAYS) return false;
  const start = addDaysLocal(endDate, -(PLATEAU_MIN_DAYS - 1));
  const window = getMeasurementsInRange(measurements, start, endDate);
  if (window.length < 5) return false;

  const firstAvg = calculateRollingAverage(measurements, addDaysLocal(endDate, -14), 7);
  const lastAvg = calculateRollingAverage(measurements, endDate, 7);
  if (firstAvg.average == null || lastAvg.average == null) return false;
  return Math.abs(lastAvg.average - firstAvg.average) < PLATEAU_THRESHOLD_KG;
}

export function getHighConfidenceInsight(measurements, campaign, endDate) {
  const insights = getBodyCoachInsights(measurements, campaign, endDate);
  return insights.find((i) => i.confidence >= 0.8 && i.type === 'recommendation') || null;
}

export async function updateCampaignBaselineIfReady(measurements, campaign) {
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const bodyMetrics = campaign.bodyMetrics || {};
  let updated = false;

  if (!bodyMetrics.firstRecordedWeightKg && sorted.length) {
    bodyMetrics.firstRecordedWeightKg = sorted[0].weightKg;
    updated = true;
  }

  const sevenDay = getCurrentSevenDayAverage(sorted, getLocalDateString());
  if (!sevenDay.provisional && sevenDay.average != null && bodyMetrics.initialRollingBaselineKg == null) {
    bodyMetrics.initialRollingBaselineKg = sevenDay.average;
    updated = true;
  }

  return updated ? bodyMetrics : null;
}
