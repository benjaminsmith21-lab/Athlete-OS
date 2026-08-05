import { BLUEPRINT, CAMPAIGN_ID } from '../seed/blueprint-v1.js';
import { get, getAll, put, generateId } from '../db.js';

export async function seedIfNeeded() {
  const existing = await get('campaigns', CAMPAIGN_ID);
  if (existing) return existing;

  const campaign = {
    id: CAMPAIGN_ID,
    name: BLUEPRINT.name,
    season: BLUEPRINT.season,
    missionStatement: BLUEPRINT.missionStatement,
    startDate: BLUEPRINT.startDate,
    durationWeeks: BLUEPRINT.durationWeeks,
    identity: BLUEPRINT.identity,
    progressionRules: BLUEPRINT.progressionRules,
    nutrition: BLUEPRINT.nutrition,
    finalReminder: BLUEPRINT.finalReminder
  };
  await put('campaigns', campaign);

  for (const bp of BLUEPRINT.weeklyBlueprints) {
    await put('weeklyBlueprints', {
      id: `${CAMPAIGN_ID}-day-${bp.dayOfWeek}`,
      campaignId: CAMPAIGN_ID,
      dayOfWeek: bp.dayOfWeek,
      dayName: bp.dayName,
      operation: bp.operation,
      exercises: bp.exercises
    });
  }

  await put('integrity', {
    campaignId: CAMPAIGN_ID,
    fdsCount: 0,
    lastMissionDate: null,
    consecutiveMisses: 0
  });

  return campaign;
}

export async function getActiveCampaign() {
  await seedIfNeeded();
  return get('campaigns', CAMPAIGN_ID);
}

export async function getBlueprintForDay(dayOfWeek) {
  await seedIfNeeded();
  const all = await getAll('weeklyBlueprints');
  return all.find((b) => b.dayOfWeek === dayOfWeek && b.campaignId === CAMPAIGN_ID);
}

export async function getTodayBlueprint() {
  return getBlueprintForDay(new Date().getDay());
}

export function getCampaignWeek(startDate, currentDate = new Date()) {
  const start = new Date(startDate + 'T12:00:00');
  const now = new Date(currentDate);
  const diffMs = now - start;
  const week = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
  return Math.min(week, 12);
}
