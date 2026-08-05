import { get, put } from '../db.js';
import { CAMPAIGN_ID } from '../seed/blueprint-v1.js';
import { MISSION_RATINGS, MISSION_STATUS } from './mission.js';

export async function getIntegrity() {
  let record = await get('integrity', CAMPAIGN_ID);
  if (!record) {
    record = { campaignId: CAMPAIGN_ID, fdsCount: 0, lastMissionDate: null, consecutiveMisses: 0 };
    await put('integrity', record);
  }
  return record;
}

export async function updateIntegrityAfterMission(mission) {
  const integrity = await getIntegrity();
  const today = mission.date;
  const yesterday = getYesterday(today);

  const completed = mission.status === MISSION_STATUS.COMPLETE &&
    mission.rating !== MISSION_RATINGS.ABANDONED;

  if (completed) {
    if (integrity.lastMissionDate) {
      const last = new Date(integrity.lastMissionDate + 'T12:00:00');
      const current = new Date(today + 'T12:00:00');
      const diffDays = Math.round((current - last) / (24 * 60 * 60 * 1000));

      if (diffDays > 1) {
        integrity.consecutiveMisses = 0;
      }
    }
    integrity.lastMissionDate = today;
    integrity.consecutiveMisses = 0;

    if (mission.isFds || mission.rating === MISSION_RATINGS.MINIMUM) {
      integrity.fdsCount = (integrity.fdsCount || 0) + 1;
    }
  } else if (mission.rating === MISSION_RATINGS.ABANDONED) {
    if (integrity.lastMissionDate === yesterday) {
      integrity.consecutiveMisses = (integrity.consecutiveMisses || 0) + 1;
    } else if (integrity.lastMissionDate !== today) {
      integrity.consecutiveMisses = 1;
    }
  }

  await put('integrity', integrity);
  return integrity;
}

export async function getWeeklyStats(completedMissions) {
  const trainingDays = [1, 2, 3, 4, 5, 6];
  const completedTraining = completedMissions.filter((m) => trainingDays.includes(m.dayOfWeek));
  const fdsThisWeek = completedMissions.filter((m) => m.isFds || m.rating === MISSION_RATINGS.MINIMUM).length;
  const total = completedTraining.length;
  const scheduled = countScheduledTrainingDaysThisWeek();

  return {
    completed: total,
    scheduled,
    executionRate: scheduled > 0 ? Math.round((total / scheduled) * 100) : 0,
    fdsThisWeek,
    weeklyCount: total
  };
}

function countScheduledTrainingDaysThisWeek() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    const dow = d.getDay();
    if (dow >= 1 && dow <= 6) count += 1;
  }
  return count;
}

function getYesterday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatIntegritySummary(integrity, weeklyStats) {
  const parts = [];
  parts.push(`${weeklyStats.executionRate}% execution this week`);
  if (integrity.fdsCount > 0) {
    parts.push(`${integrity.fdsCount} FDS total`);
  }
  if (integrity.consecutiveMisses >= 1) {
    parts.push('One miss — protect the next session');
  } else if (integrity.lastMissionDate) {
    parts.push('Integrity holding');
  }
  return parts.join(' · ');
}
