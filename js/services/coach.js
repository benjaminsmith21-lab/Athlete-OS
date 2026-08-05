import { MISSION_RATINGS } from './mission.js';

export const CoachService = {
  async getBriefingNote(campaign) {
    const identity = campaign.identity[Math.floor(Math.random() * campaign.identity.length)];
    return identity;
  },

  async getPostMissionNote(mission, context = {}) {
    const { setLogs = [], weeklyCount = 0, integrity = {} } = context;

    if (mission.isFds || mission.rating === MISSION_RATINGS.MINIMUM) {
      const name = mission.fdsExercise?.name || 'one thing';
      return `FDS today — ${name}. Integrity preserved. Not a zero day. Return tomorrow.`;
    }

    if (mission.rating === MISSION_RATINGS.ABANDONED) {
      return 'Mission abandoned. One miss is data. Two in a row breaks the identity line. Return when ready.';
    }

    if (mission.rating === MISSION_RATINGS.RECOVERY) {
      return `Partial mission. ${setLogs.length} entries logged. Consistency over perfection.`;
    }

    const lines = [];

    if (mission.rating === MISSION_RATINGS.PERFECT) {
      lines.push('Perfect mission. Full execution including optional work.');
    } else if (mission.rating === MISSION_RATINGS.FULL) {
      lines.push('Full mission. All required work complete.');
    }

    if (weeklyCount > 0) {
      lines.push(`Session ${weeklyCount} this week.`);
    }

    const weighted = setLogs.find((l) => l.actual.weight && l.actual.reps);
    if (weighted) {
      const { weight, weightUnit, reps } = weighted.actual;
      const p = weighted.prescribed;
      const match = p.weight === weight && p.reps === reps;
      lines.push(
        `${weighted.exerciseName}: ${weight}${weightUnit || 'kg'} × ${reps}${match ? ' — matches prescription' : ' — adjusted'}`
      );
    }

    if (integrity.consecutiveMisses === 0 && integrity.lastMissionDate) {
      lines.push('Never miss two in a row — holding the line.');
    }

    return lines.length ? lines.join(' ') : 'Mission logged. Quiet progress.';
  },

  async getAiDebrief() {
    throw new Error('AI coach not configured. Use BYOK in a future version.');
  }
};
