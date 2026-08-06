import { addDays, getLocalDateString } from '../utils/datetime.js';
import { getAll } from '../db.js';
import { MISSION_STATUS, MISSION_RATINGS } from './mission.js';
import {
  calculateRollingAverage,
  formatWeightChange,
  getLatestMeasurement,
  getMeasurementsInRange,
  isTrendEligible,
  sortMeasurements
} from './bodyTrend.js';
import {
  formatSleepDuration,
  getDailyHealthInRange,
  getRhrSevenDayAverage,
  getSleepSevenDayAverage
} from './garminTrend.js';
import { getCampaignWeek } from './campaign.js';

export const REVIEW_WEEKS = [4, 8, 12];

export const MILESTONE_EXERCISES = {
  maxHang: ['mon-hangs', 'thu-hangs', 'fri-hangs', 'fds-hangs'],
  zone2: ['mon-z2'],
  pushUps: ['tue-pushup-plus']
};

export function isReviewWeek(week) {
  return REVIEW_WEEKS.includes(week);
}

export function getReviewPeriodStart(endDate) {
  return addDays(endDate, -27);
}

export function getPreviousReviewPeriodStart(endDate) {
  return addDays(endDate, -55);
}

export function getPreviousReviewPeriodEnd(endDate) {
  return addDays(endDate, -28);
}

function logDate(log) {
  return (log.completedAt || '').slice(0, 10);
}

export function extractMaxHangSeconds(setLogs, startDate = null, endDate = null) {
  let max = null;
  for (const log of setLogs) {
    if (!MILESTONE_EXERCISES.maxHang.includes(log.exerciseId)) continue;
    const d = logDate(log);
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;
    const seconds = log.actual?.duration;
    if (seconds != null && (max == null || seconds > max)) max = seconds;
  }
  return max;
}

export function extractMaxPushUpReps(setLogs, startDate = null, endDate = null) {
  let max = null;
  for (const log of setLogs) {
    if (!MILESTONE_EXERCISES.pushUps.includes(log.exerciseId)) continue;
    const d = logDate(log);
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;
    const reps = log.actual?.reps;
    if (reps != null && (max == null || reps > max)) max = reps;
  }
  return max;
}

export function extractZone2Best(setLogs, startDate = null, endDate = null) {
  let best = null;
  for (const log of setLogs) {
    if (!MILESTONE_EXERCISES.zone2.includes(log.exerciseId)) continue;
    const d = logDate(log);
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;
    const distance = log.actual?.distance;
    const elapsed = log.actual?.elapsedSeconds;
    if (distance == null) continue;
    const pace = elapsed && distance > 0 ? elapsed / 60 / distance : null;
    if (!best || distance > best.distance) {
      best = { distance, distanceUnit: log.actual?.distanceUnit || 'km', elapsedSeconds: elapsed, paceMinPerKm: pace };
    }
  }
  return best;
}

function formatHang(seconds) {
  if (seconds == null) return '—';
  return `${seconds}s`;
}

function formatZone2(best) {
  if (!best) return '—';
  const dist = `${best.distance}${best.distanceUnit || 'km'}`;
  if (best.paceMinPerKm != null) {
    const mins = Math.floor(best.paceMinPerKm);
    const secs = Math.round((best.paceMinPerKm - mins) * 60);
    return `${dist} · ${mins}:${String(secs).padStart(2, '0')}/km`;
  }
  return dist;
}

export function buildMilestones(setLogs, measurements, endDate) {
  const periodStart = getReviewPeriodStart(endDate);
  const prevStart = getPreviousReviewPeriodStart(endDate);
  const prevEnd = getPreviousReviewPeriodEnd(endDate);

  const latest = getLatestMeasurement(measurements);
  const periodWaist = getMeasurementsInRange(measurements, periodStart, endDate)
    .filter((m) => m.waistCm != null)
    .slice(-1)[0];
  const prevWaist = getMeasurementsInRange(measurements, prevStart, prevEnd)
    .filter((m) => m.waistCm != null)
    .slice(-1)[0];

  const weightSeven = calculateRollingAverage(measurements.filter(isTrendEligible), endDate, 7);
  const prevWeightEnd = prevEnd;
  const weightPrevSeven = calculateRollingAverage(
    measurements.filter(isTrendEligible),
    prevWeightEnd,
    7
  );
  const weightChange =
    weightSeven.average != null && weightPrevSeven.average != null
      ? Math.round((weightSeven.average - weightPrevSeven.average) * 10) / 10
      : null;

  return [
    {
      id: 'weight',
      label: 'Weight (7-day avg)',
      current: weightSeven.average != null ? `${weightSeven.average.toFixed(1)} kg` : '—',
      previous: weightPrevSeven.average != null ? `${weightPrevSeven.average.toFixed(1)} kg` : '—',
      delta: weightChange != null ? formatWeightChange(weightChange) : null
    },
    {
      id: 'waist',
      label: 'Waist',
      current: latest?.waistCm != null ? `${latest.waistCm} cm` : periodWaist ? `${periodWaist.waistCm} cm` : '—',
      previous: prevWaist ? `${prevWaist.waistCm} cm` : '—',
      delta: null
    },
    {
      id: 'maxHang',
      label: 'Max hang',
      current: formatHang(extractMaxHangSeconds(setLogs, periodStart, endDate)),
      previous: formatHang(extractMaxHangSeconds(setLogs, prevStart, prevEnd)),
      delta: null
    },
    {
      id: 'pushUps',
      label: 'Push-up plus (max reps)',
      current: formatReps(extractMaxPushUpReps(setLogs, periodStart, endDate)),
      previous: formatReps(extractMaxPushUpReps(setLogs, prevStart, prevEnd)),
      delta: null
    },
    {
      id: 'zone2',
      label: 'Zone 2 run (best)',
      current: formatZone2(extractZone2Best(setLogs, periodStart, endDate)),
      previous: formatZone2(extractZone2Best(setLogs, prevStart, prevEnd)),
      delta: null
    }
  ];
}

function formatReps(reps) {
  if (reps == null) return '—';
  return `${reps} reps`;
}

export async function buildWeekStrip(endDate = getLocalDateString()) {
  const blueprints = await getAll('weeklyBlueprints');
  const missions = await getAll('missions');
  const byDate = Object.fromEntries(missions.map((m) => [m.date, m]));

  const end = new Date(endDate + 'T12:00:00');
  const day = end.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(end);
  monday.setDate(end.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dow = d.getDay();
    const bp = blueprints.find((b) => b.dayOfWeek === dow);
    const mission = byDate[dateStr];
    let status = 'rest';
    if (mission?.status === MISSION_STATUS.COMPLETE) {
      if (mission.isFds || mission.rating === MISSION_RATINGS.MINIMUM) status = 'fds';
      else if (mission.rating === MISSION_RATINGS.ABANDONED) status = 'missed';
      else status = 'completed';
    } else if (bp && dow >= 1 && dow <= 5 && dateStr < endDate) {
      status = 'missed';
    } else if (dateStr > endDate) {
      status = 'upcoming';
    } else if (bp) {
      status = 'rest';
    }

    days.push({
      date: dateStr,
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      status,
      isToday: dateStr === endDate
    });
  }
  return days;
}

export async function buildCampaignReviewData({
  campaign,
  measurements,
  dailyHealth,
  missions,
  setLogs,
  integrity,
  endDate
}) {
  const periodStart = getReviewPeriodStart(endDate);
  const week = getCampaignWeek(campaign.startDate, new Date(endDate + 'T12:00:00'));

  const periodMissions = missions.filter(
    (m) =>
      m.status === MISSION_STATUS.COMPLETE &&
      m.date >= periodStart &&
      m.date <= endDate &&
      m.rating !== MISSION_RATINGS.ABANDONED
  );
  const fdsCount = periodMissions.filter(
    (m) => m.isFds || m.rating === MISSION_RATINGS.MINIMUM
  ).length;
  const fullCount = periodMissions.filter(
    (m) => m.rating === MISSION_RATINGS.FULL || m.rating === MISSION_RATINGS.PERFECT
  ).length;

  const trainingDays = [1, 2, 3, 4, 5, 6];
  let scheduled = 0;
  for (let d = new Date(periodStart + 'T12:00:00'); d <= new Date(endDate + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
    if (trainingDays.includes(d.getDay())) scheduled += 1;
  }
  const executionRate = scheduled > 0 ? Math.round((periodMissions.length / scheduled) * 100) : 0;

  const weightSeven = calculateRollingAverage(measurements.filter(isTrendEligible), endDate, 7);
  const prevEnd = getPreviousReviewPeriodEnd(endDate);
  const weightPrevSeven = calculateRollingAverage(
    measurements.filter(isTrendEligible),
    prevEnd,
    7
  );
  const weightDelta =
    weightSeven.average != null && weightPrevSeven.average != null
      ? Math.round((weightSeven.average - weightPrevSeven.average) * 10) / 10
      : null;

  const periodHealth = getDailyHealthInRange(dailyHealth, periodStart, endDate);
  const sleepAvg = getSleepSevenDayAverage(dailyHealth, endDate);
  const rhrAvg = getRhrSevenDayAverage(dailyHealth, endDate);

  const milestones = buildMilestones(setLogs, measurements, endDate);

  return {
    week,
    periodStart,
    endDate,
    integrity: {
      executionRate,
      missionsCompleted: periodMissions.length,
      fdsCount,
      fullCount,
      totalFds: integrity?.fdsCount ?? 0
    },
    body: {
      weightAvg: weightSeven.average,
      weightDelta,
      weighIns: getMeasurementsInRange(measurements, periodStart, endDate).length
    },
    recovery: {
      sleepAvg: sleepAvg.average,
      sleepLabel: sleepAvg.average != null ? formatSleepDuration(Math.round(sleepAvg.average)) : null,
      rhrAvg: rhrAvg.average,
      daysWithData: periodHealth.length
    },
    milestones,
    progressionRules: campaign.progressionRules || [],
    finalReminder: campaign.finalReminder
  };
}
