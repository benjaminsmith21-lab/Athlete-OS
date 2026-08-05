import { BLUEPRINT, CAMPAIGN_ID } from '../seed/blueprint-v1.js';
import { get, getAll, put } from '../db.js';

export const DEFAULT_BODY_METRICS = BLUEPRINT.bodyMetrics;

export async function seedIfNeeded() {
  const existing = await get('campaigns', CAMPAIGN_ID);
  if (existing) return mergeCampaignBodyMetrics(existing);

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
    finalReminder: BLUEPRINT.finalReminder,
    bodyMetrics: structuredClone(BLUEPRINT.bodyMetrics)
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

function mergeCampaignBodyMetrics(campaign) {
  if (!campaign.bodyMetrics) {
    campaign.bodyMetrics = structuredClone(DEFAULT_BODY_METRICS);
    put('campaigns', campaign);
  }
  return campaign;
}

export async function getActiveCampaign() {
  await seedIfNeeded();
  const campaign = await get('campaigns', CAMPAIGN_ID);
  return mergeCampaignBodyMetrics(campaign);
}

export async function updateCampaignBodyMetrics(partial) {
  const campaign = await getActiveCampaign();
  campaign.bodyMetrics = { ...campaign.bodyMetrics, ...partial };
  await put('campaigns', campaign);
  return campaign;
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
