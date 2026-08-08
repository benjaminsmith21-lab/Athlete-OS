import { MISSION_RATINGS } from './mission.js';
import { t } from './languageStyle.js';

export const CoachService = {
  async getBriefingNote(campaign) {
    if (!campaign?.identity?.length) return '';
    return campaign.identity[Math.floor(Math.random() * campaign.identity.length)];
  },

  async getPostMissionNote(mission, context = {}) {
    const { setLogs = [], weeklyCount = 0, integrity = {} } = context;

    if (mission.isFds || mission.rating === MISSION_RATINGS.MINIMUM) {
      const names = (mission.fdsExercises || (mission.fdsExercise ? [mission.fdsExercise] : []))
        .map((e) => e.name)
        .filter(Boolean);
      const label = names.length > 1 ? names.join(', ') : names[0] || 'one thing';
      return t('coachFds', { label });
    }

    if (mission.rating === MISSION_RATINGS.ABANDONED) {
      return t('coachAbandoned');
    }

    if (mission.rating === MISSION_RATINGS.RECOVERY) {
      return t('coachPartial', { count: setLogs.length });
    }

    const lines = [];

    if (mission.rating === MISSION_RATINGS.PERFECT) {
      lines.push(t('coachPerfect'));
    } else if (mission.rating === MISSION_RATINGS.FULL) {
      lines.push(t('coachFull'));
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
      lines.push(t('coachNeverMissTwo'));
    }

    return lines.length ? lines.join(' ') : t('coachLogged');
  },

  async getAiDebrief() {
    throw new Error('AI coach not configured. Use BYOK in a future version.');
  }
};
