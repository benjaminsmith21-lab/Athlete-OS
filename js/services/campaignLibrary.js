import { get, getAll, put, remove, generateId, todayDateString } from '../db.js';
import { getLocalISOString } from '../utils/datetime.js';
import { BLUEPRINT, CAMPAIGN_ID } from '../seed/blueprint-v1.js';
import { LEGACY_ID_TO_LIBRARY } from '../seed/exercise-library-v1.js';
import { getExercise } from './exerciseLibrary.js';
import { getSettings, saveSettings } from './settings.js';
import {
  compileWeeklyMissionToBlueprint,
  createDefaultWarmupSection,
  createSection,
  dayNameFor,
  legacyBlueprintToWeeklyMission,
  blueprintExerciseToPrescription,
  validatePrescription,
  normalizeCampaign,
  normalizeDaySections,
  sortSections,
  getOperationLabel,
  getCompiledOperation,
  OPERATION_OTHER,
  SECTION_DEFAULT_TITLES,
  SECTION_TYPES
} from './campaignPrescription.js';

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function stampCampaign(campaign, partial = {}) {
  const now = getLocalISOString();
  return {
    ...campaign,
    ...partial,
    updatedAt: now,
    createdAt: campaign.createdAt || partial.createdAt || now
  };
}

export function createEmptyWeeklyMissions(campaignId) {
  return DAY_ORDER.map((dayOfWeek, index) => ({
    id: `${campaignId}-day-${dayOfWeek}`,
    dayOfWeek,
    dayName: dayNameFor(dayOfWeek),
    name: dayNameFor(dayOfWeek),
    operation: 'RESET',
    purpose: '',
    estimatedDurationMinutes: null,
    sections: [createSection('main', 0)]
  }));
}

export async function listCampaigns() {
  const all = await getAll('campaigns');
  const grouped = {
    active: [],
    scheduled: [],
    drafts: [],
    archive: []
  };

  for (const campaign of all) {
    switch (campaign.status) {
      case CAMPAIGN_STATUS.ACTIVE:
        grouped.active.push(campaign);
        break;
      case CAMPAIGN_STATUS.SCHEDULED:
        grouped.scheduled.push(campaign);
        break;
      case CAMPAIGN_STATUS.COMPLETED:
      case CAMPAIGN_STATUS.ARCHIVED:
        grouped.archive.push(campaign);
        break;
      default:
        grouped.drafts.push(campaign);
    }
  }

  const sortByUpdated = (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '');
  grouped.active.sort(sortByUpdated);
  grouped.scheduled.sort(sortByUpdated);
  grouped.drafts.sort(sortByUpdated);
  grouped.archive.sort(sortByUpdated);
  return grouped;
}

export async function getCampaign(id) {
  if (!id) return null;
  const campaign = await get('campaigns', id);
  if (campaign) normalizeCampaign(campaign);
  return campaign;
}

export async function createCampaign(partial = {}) {
  const id = generateId('campaign');
  const campaign = stampCampaign(
    {
      id,
      name: partial.name?.trim() || 'New Campaign',
      codename: partial.codename || '',
      status: CAMPAIGN_STATUS.DRAFT,
      durationWeeks: partial.durationWeeks || 12,
      startDate: partial.startDate || null,
      endDate: null,
      scheduledStartDate: partial.scheduledStartDate || null,
      primaryGoal: partial.primaryGoal || '',
      secondaryGoals: partial.secondaryGoals || [],
      notes: partial.notes || '',
      weeklyMissions: createEmptyWeeklyMissions(id),
      executionSnapshot: null
    },
    { createdAt: getLocalISOString() }
  );
  await put('campaigns', campaign);
  return campaign;
}

export async function updateCampaign(id, partial) {
  const existing = await getCampaign(id);
  if (!existing) throw new Error('Campaign not found.');
  const next = stampCampaign(existing, partial);
  await put('campaigns', next);
  return next;
}

export async function saveCampaignDocument(campaign) {
  const next = stampCampaign(campaign);
  await put('campaigns', next);
  return next;
}

export async function deleteCampaign(id) {
  const campaign = await getCampaign(id);
  if (!campaign) return null;
  if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {
    throw new Error('Only draft campaigns can be deleted.');
  }
  await remove('campaigns', id);
  return campaign;
}

function clonePrescriptionRow(row, order) {
  return {
    ...structuredClone(row),
    id: generateId('rx'),
    order
  };
}

export async function duplicatePrescription(campaignId, dayOfWeek, prescriptionId) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Campaign not found.');
  const day = campaign.weeklyMissions.find((d) => d.dayOfWeek === dayOfWeek);
  if (!day) throw new Error('Day not found.');
  for (const section of day.sections) {
    const index = section.exercises.findIndex((e) => e.id === prescriptionId);
    if (index >= 0) {
      const clone = clonePrescriptionRow(section.exercises[index], index + 1);
      section.exercises.splice(index + 1, 0, clone);
      section.exercises.forEach((row, i) => {
        row.order = i;
      });
      return saveCampaignDocument(campaign);
    }
  }
  throw new Error('Exercise prescription not found.');
}

export async function duplicateDay(campaignId, sourceDayOfWeek, targetDayOfWeek) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Campaign not found.');
  const source = campaign.weeklyMissions.find((d) => d.dayOfWeek === sourceDayOfWeek);
  const target = campaign.weeklyMissions.find((d) => d.dayOfWeek === targetDayOfWeek);
  if (!source || !target) throw new Error('Day not found.');

  target.name = source.name;
  target.operation = source.operation;
  target.operationCustom = source.operationCustom;
  target.purpose = source.purpose;
  target.estimatedDurationMinutes = source.estimatedDurationMinutes;
  target.sections = cloneDaySections(source);

  return saveCampaignDocument(campaign);
}

function cloneDaySections(sourceDay) {
  normalizeDaySections(sourceDay);
  return sourceDay.sections.map((section) => ({
    ...structuredClone(section),
    id: generateId('section'),
    order: section.order,
    exercises: section.exercises.map((row, rowIndex) => clonePrescriptionRow(row, rowIndex))
  }));
}

export async function duplicateDayToCampaign(
  sourceCampaignId,
  sourceDayOfWeek,
  targetCampaignId,
  targetDayOfWeek
) {
  const sourceCampaign = await getCampaign(sourceCampaignId);
  const targetCampaign = await getCampaign(targetCampaignId);
  if (!sourceCampaign || !targetCampaign) throw new Error('Campaign not found.');
  if (![CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.SCHEDULED].includes(targetCampaign.status)) {
    throw new Error('Can only copy into draft or scheduled campaigns.');
  }

  const source = sourceCampaign.weeklyMissions.find((d) => d.dayOfWeek === sourceDayOfWeek);
  const target = targetCampaign.weeklyMissions.find((d) => d.dayOfWeek === targetDayOfWeek);
  if (!source || !target) throw new Error('Day not found.');

  target.name = source.name;
  target.operation = source.operation;
  target.operationCustom = source.operationCustom;
  target.purpose = source.purpose;
  target.estimatedDurationMinutes = source.estimatedDurationMinutes;
  target.sections = cloneDaySections(source);

  return saveCampaignDocument(targetCampaign);
}

export async function listEditableCampaigns(excludeId = null) {
  const grouped = await listCampaigns();
  return [...grouped.drafts, ...grouped.scheduled].filter((campaign) => campaign.id !== excludeId);
}

export async function duplicateCampaign(id) {
  const source = await getCampaign(id);
  if (!source) throw new Error('Campaign not found.');
  const newId = generateId('campaign');
  const clone = stampCampaign(
    {
      ...structuredClone(source),
      id: newId,
      name: `${source.name} (Copy)`,
      status: CAMPAIGN_STATUS.DRAFT,
      startDate: null,
      endDate: null,
      scheduledStartDate: null,
      executionSnapshot: null,
      weeklyMissions: source.weeklyMissions.map((day) => ({
        ...structuredClone(day),
        id: `${newId}-day-${day.dayOfWeek}`,
        sections: day.sections.map((section, sectionIndex) => ({
          ...structuredClone(section),
          id: generateId('section'),
          order: sectionIndex,
          exercises: section.exercises.map((row, rowIndex) => clonePrescriptionRow(row, rowIndex))
        }))
      }))
    },
    { createdAt: getLocalISOString() }
  );
  await put('campaigns', clone);
  return clone;
}

export async function scheduleCampaign(id, scheduledStartDate) {
  const settings = await getSettings();
  if (settings.scheduledCampaignId && settings.scheduledCampaignId !== id) {
    throw new Error('Another campaign is already scheduled.');
  }
  const campaign = await updateCampaign(id, {
    status: CAMPAIGN_STATUS.SCHEDULED,
    scheduledStartDate
  });
  await saveSettings({ scheduledCampaignId: id });
  return campaign;
}

export async function unscheduleCampaign(id) {
  const settings = await getSettings();
  const campaign = await updateCampaign(id, {
    status: CAMPAIGN_STATUS.DRAFT,
    scheduledStartDate: null
  });
  if (settings.scheduledCampaignId === id) {
    await saveSettings({ scheduledCampaignId: null });
  }
  return campaign;
}

export async function endCampaign(id) {
  const campaign = await updateCampaign(id, {
    status: CAMPAIGN_STATUS.COMPLETED,
    endDate: todayDateString()
  });
  const settings = await getSettings();
  if (settings.activeCampaignId === id) {
    await saveSettings({ activeCampaignId: null });
  }
  return campaign;
}

export async function archiveCampaign(id) {
  return updateCampaign(id, { status: CAMPAIGN_STATUS.ARCHIVED });
}

async function validateCampaignForActivation(campaign) {
  const errors = [];
  if (!campaign.name?.trim()) errors.push('Campaign name is required.');
  if (!campaign.durationWeeks || campaign.durationWeeks < 1) {
    errors.push('Duration must be at least 1 week.');
  }
  if (!Array.isArray(campaign.weeklyMissions) || campaign.weeklyMissions.length !== 7) {
    errors.push('Campaign must include all seven days.');
  }

  for (const day of campaign.weeklyMissions || []) {
    const exerciseCount = (day.sections || []).reduce(
      (sum, section) => sum + (section.exercises?.length || 0),
      0
    );
    if (exerciseCount === 0) {
      errors.push(`${day.dayName || 'Day'} has no exercises.`);
    }
    for (const section of day.sections || []) {
      for (const row of section.exercises || []) {
        const libraryExercise = await getExercise(row.libraryExerciseId);
        if (!libraryExercise || libraryExercise.active === false) {
          errors.push(`${row.exerciseSnapshot?.name || 'Exercise'} is missing from the library.`);
        }
        const rxErrors = validatePrescription(
          row.exerciseSnapshot?.trackingType,
          row.prescription || {}
        );
        rxErrors.forEach((msg) => errors.push(`${row.exerciseSnapshot?.name}: ${msg}`));
      }
    }
  }

  return errors;
}

async function writeCompiledBlueprints(campaign) {
  const snapshot = campaign.executionSnapshot?.weeklyMissions || campaign.weeklyMissions;
  const existing = await getAll('weeklyBlueprints');
  for (const row of existing.filter((bp) => bp.campaignId === campaign.id)) {
    await remove('weeklyBlueprints', row.id);
  }
  for (const day of snapshot) {
    const compiled = compileWeeklyMissionToBlueprint(campaign.id, day);
    await put('weeklyBlueprints', compiled);
  }
}

export async function activateCampaign(id, { replaceActive = false } = {}) {
  const campaign = await getCampaign(id);
  if (!campaign) throw new Error('Campaign not found.');

  const errors = await validateCampaignForActivation(campaign);
  if (errors.length) {
    const err = new Error(errors.join(' '));
    err.code = 'VALIDATION';
    err.details = errors;
    throw err;
  }

  const settings = await getSettings();
  const currentActiveId = settings.activeCampaignId;
  if (currentActiveId && currentActiveId !== id && !replaceActive) {
    const err = new Error('Another campaign is currently active.');
    err.code = 'ACTIVE_EXISTS';
    err.activeCampaignId = currentActiveId;
    throw err;
  }

  if (currentActiveId && currentActiveId !== id && replaceActive) {
    await endCampaign(currentActiveId);
  }

  const activatedAt = getLocalISOString();
  const startDate = campaign.scheduledStartDate || campaign.startDate || todayDateString();
  const next = stampCampaign(campaign, {
    status: CAMPAIGN_STATUS.ACTIVE,
    startDate,
    endDate: null,
    scheduledStartDate: null,
    executionSnapshot: {
      version: 1,
      activatedAt,
      weeklyMissions: structuredClone(campaign.weeklyMissions)
    }
  });

  await put('campaigns', next);
  await writeCompiledBlueprints(next);

  await put('integrity', {
    campaignId: id,
    fdsCount: (await get('integrity', id))?.fdsCount || 0,
    lastMissionDate: (await get('integrity', id))?.lastMissionDate || null,
    consecutiveMisses: (await get('integrity', id))?.consecutiveMisses || 0
  });

  await saveSettings({
    activeCampaignId: id,
    scheduledCampaignId: settings.scheduledCampaignId === id ? null : settings.scheduledCampaignId
  });

  return next;
}

export async function migrateLegacyCampaignIfNeeded() {
  const settings = await getSettings();
  if (!settings.activeCampaignId) {
    await saveSettings({ activeCampaignId: CAMPAIGN_ID });
  }

  const existing = await getCampaign(CAMPAIGN_ID);
  if (existing?.weeklyMissions?.length === 7) {
    if (!existing.status) {
      await updateCampaign(CAMPAIGN_ID, { status: CAMPAIGN_STATUS.ACTIVE });
    }
    return existing;
  }

  await seedLegacyCampaignIfMissing();

  const campaign = await getCampaign(CAMPAIGN_ID);
  const blueprints = await getAll('weeklyBlueprints');
  const campaignBlueprints = blueprints
    .filter((bp) => bp.campaignId === CAMPAIGN_ID)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const weeklyMissions = [];
  for (const dayOfWeek of DAY_ORDER) {
    const bp = campaignBlueprints.find((row) => row.dayOfWeek === dayOfWeek);
    if (bp) {
      const day = legacyBlueprintToWeeklyMission(CAMPAIGN_ID, bp);
      const warmup = createDefaultWarmupSection();
      day.sections = [warmup, ...day.sections.map((section, index) => ({ ...section, order: index + 1 }))];
      weeklyMissions.push(day);
    } else {
      weeklyMissions.push({
        id: `${CAMPAIGN_ID}-day-${dayOfWeek}`,
        dayOfWeek,
        dayName: dayNameFor(dayOfWeek),
        name: dayNameFor(dayOfWeek),
        operation: 'RESET',
        sections: [createDefaultWarmupSection(), createSection('main', 1)]
      });
    }
  }

  for (const day of weeklyMissions) {
    for (const section of day.sections) {
      for (const row of section.exercises) {
        const libraryId = LEGACY_ID_TO_LIBRARY[row.id] || row.libraryExerciseId;
        if (libraryId) row.libraryExerciseId = libraryId;
        const libraryExercise = libraryId ? await getExercise(libraryId) : null;
        row.exerciseSnapshot = {
          name: libraryExercise?.name || row.exerciseSnapshot?.name || row.id,
          trackingType: libraryExercise?.trackingType || row.exerciseSnapshot?.trackingType || 'open'
        };
      }
    }
  }

  const migrated = stampCampaign(
    {
      ...campaign,
      status: CAMPAIGN_STATUS.ACTIVE,
      weeklyMissions,
      executionSnapshot: {
        version: 1,
        activatedAt: getLocalISOString(),
        weeklyMissions: structuredClone(weeklyMissions)
      }
    },
    { createdAt: campaign?.createdAt || getLocalISOString() }
  );

  await put('campaigns', migrated);
  await saveSettings({ activeCampaignId: CAMPAIGN_ID });

  for (const day of weeklyMissions) {
    const compiled = compileWeeklyMissionToBlueprint(CAMPAIGN_ID, day);
    const existing = await get('weeklyBlueprints', compiled.id);
    if (existing) {
      await put('weeklyBlueprints', {
        ...existing,
        warmupSteps: compiled.warmupSteps
      });
    }
  }

  return migrated;
}

async function seedLegacyCampaignIfMissing() {
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
    finalReminder: BLUEPRINT.finalReminder,
    bodyMetrics: structuredClone(BLUEPRINT.bodyMetrics),
    status: CAMPAIGN_STATUS.ACTIVE,
    createdAt: getLocalISOString(),
    updatedAt: getLocalISOString()
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

export function getWeeklyMission(campaign, dayOfWeek) {
  return campaign?.weeklyMissions?.find((day) => day.dayOfWeek === dayOfWeek) || null;
}

export function countCampaignExercises(campaign) {
  return (campaign?.weeklyMissions || []).reduce((sum, day) => {
    return (
      sum +
      (day.sections || []).reduce((sectionSum, section) => sectionSum + (section.exercises?.length || 0), 0)
    );
  }, 0);
}

export { blueprintExerciseToPrescription, DAY_ORDER };
