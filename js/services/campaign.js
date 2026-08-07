import { BLUEPRINT, CAMPAIGN_ID } from '../seed/blueprint-v1.js';
import { get, getAll, put } from '../db.js';
import { getSettings } from './settings.js';
import { migrateLegacyCampaignIfNeeded } from './campaignLibrary.js';

export const DEFAULT_BODY_METRICS = BLUEPRINT.bodyMetrics;

export async function seedIfNeeded() {
  await migrateLegacyCampaignIfNeeded();
}

export async function getActiveCampaignId() {
  const settings = await getSettings();
  return settings.activeCampaignId || CAMPAIGN_ID;
}

export async function getActiveCampaign() {
  await seedIfNeeded();
  const campaignId = await getActiveCampaignId();
  const campaign = await get('campaigns', campaignId);
  if (!campaign) {
    return mergeCampaignBodyMetrics(await migrateLegacyCampaignIfNeeded());
  }
  return mergeCampaignBodyMetrics(campaign);
}

function mergeCampaignBodyMetrics(campaign) {
  if (!campaign.bodyMetrics) {
    campaign.bodyMetrics = structuredClone(DEFAULT_BODY_METRICS);
    put('campaigns', campaign);
  }
  return campaign;
}

export async function updateCampaignBodyMetrics(partial) {
  const campaign = await getActiveCampaign();
  campaign.bodyMetrics = { ...campaign.bodyMetrics, ...partial };
  await put('campaigns', campaign);
  return campaign;
}

export async function getBlueprintForDay(dayOfWeek, campaignId = null) {
  await seedIfNeeded();
  const activeId = campaignId || (await getActiveCampaignId());
  const all = await getAll('weeklyBlueprints');
  return all.find((b) => b.dayOfWeek === dayOfWeek && b.campaignId === activeId);
}

export async function getTodayBlueprint() {
  return getBlueprintForDay(new Date().getDay());
}

export function getCampaignWeek(startDate, currentDate = new Date(), durationWeeks = 12) {
  const start = new Date(startDate + 'T12:00:00');
  const now = new Date(currentDate);
  const diffMs = now - start;
  const week = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
  return Math.min(week, durationWeeks || 12);
}
