import { get, getAll, put, putAll, runTransaction } from '../db.js';
import { getLocalISOString } from '../utils/datetime.js';

export const GARMIN_SNAPSHOT_SCHEMA_VERSION = 1;
export const GARMIN_SOURCE = 'garmindb';
export const GARMIN_INTEGRATION = 'garmin';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

export function parseGarminSnapshot(text) {
  let data;
  try {
    data = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    return { ok: false, errors: ['Invalid JSON file.'] };
  }
  return validateGarminSnapshot(data);
}

export function validateGarminSnapshot(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['Snapshot must be a JSON object.'] };
  }
  if (data.schemaVersion !== GARMIN_SNAPSHOT_SCHEMA_VERSION) {
    errors.push(`Unsupported snapshot schemaVersion: ${data.schemaVersion}`);
  }
  if (data.source?.name !== 'GarminDB') {
    errors.push('Snapshot source must be GarminDB.');
  }
  if (!Array.isArray(data.dailyHealth)) {
    errors.push('dailyHealth must be an array.');
  }
  if (!Array.isArray(data.activities)) {
    errors.push('activities must be an array.');
  }
  if (errors.length) {
    return { ok: false, errors };
  }

  const dailyHealth = [];
  const activities = [];
  const seenDates = new Set();
  const seenActivities = new Set();

  for (const row of data.dailyHealth) {
    const parsed = validateDailyHealthRow(row);
    if (!parsed.ok) {
      errors.push(...parsed.errors);
      continue;
    }
    if (seenDates.has(parsed.value.localDate)) {
      errors.push(`Duplicate dailyHealth localDate: ${parsed.value.localDate}`);
      continue;
    }
    seenDates.add(parsed.value.localDate);
    dailyHealth.push(parsed.value);
  }

  for (const row of data.activities) {
    const parsed = validateActivityRow(row);
    if (!parsed.ok) {
      errors.push(...parsed.errors);
      continue;
    }
    if (seenActivities.has(parsed.value.sourceActivityId)) {
      errors.push(`Duplicate sourceActivityId: ${parsed.value.sourceActivityId}`);
      continue;
    }
    seenActivities.add(parsed.value.sourceActivityId);
    activities.push(parsed.value);
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    snapshot: {
      schemaVersion: data.schemaVersion,
      exportedAt: data.exportedAt,
      timezone: data.timezone || 'Australia/Melbourne',
      source: data.source,
      dailyHealth,
      activities,
      warnings: Array.isArray(data.warnings) ? data.warnings : []
    }
  };
}

function validateDailyHealthRow(row) {
  const errors = [];
  if (!row || typeof row !== 'object') {
    return { ok: false, errors: ['Invalid dailyHealth row.'] };
  }
  if (!DATE_RE.test(row.localDate || '')) {
    errors.push(`Invalid localDate: ${row.localDate}`);
  }
  const numericFields = [
    'steps',
    'restingHeartRateBpm',
    'averageStress',
    'hrvNightlyAverageMs',
    'intensityMinutesModerate',
    'intensityMinutesVigorous'
  ];
  for (const field of numericFields) {
    if (field in row && row[field] != null && !Number.isFinite(Number(row[field]))) {
      errors.push(`Invalid ${field} for ${row.localDate}`);
    }
  }
  if (row.sourceUpdatedAt && !ISO_RE.test(row.sourceUpdatedAt)) {
    errors.push(`Invalid sourceUpdatedAt for ${row.localDate}`);
  }
  if (row.sleep && typeof row.sleep === 'object') {
    const sleepFields = [
      'totalSeconds',
      'deepSeconds',
      'lightSeconds',
      'remSeconds',
      'awakeSeconds',
      'score'
    ];
    for (const field of sleepFields) {
      if (field in row.sleep && row.sleep[field] != null && !Number.isFinite(Number(row.sleep[field]))) {
        errors.push(`Invalid sleep.${field} for ${row.localDate}`);
      }
    }
    for (const tsField of ['startAt', 'endAt']) {
      if (row.sleep[tsField] && !ISO_RE.test(row.sleep[tsField])) {
        errors.push(`Invalid sleep.${tsField} for ${row.localDate}`);
      }
    }
  }
  if (errors.length) {
    return { ok: false, errors };
  }
  return { ok: true, value: row };
}

function validateActivityRow(row) {
  const errors = [];
  if (!row || typeof row !== 'object') {
    return { ok: false, errors: ['Invalid activity row.'] };
  }
  if (!row.sourceActivityId || typeof row.sourceActivityId !== 'string') {
    errors.push('Activity missing sourceActivityId.');
  }
  if (!row.type || typeof row.type !== 'string') {
    errors.push(`Activity ${row.sourceActivityId || '?'} missing type.`);
  }
  if (!row.startedAt || !ISO_RE.test(row.startedAt)) {
    errors.push(`Activity ${row.sourceActivityId || '?'} has invalid startedAt.`);
  }
  for (const field of [
    'durationSeconds',
    'distanceMeters',
    'averageHeartRateBpm',
    'maximumHeartRateBpm'
  ]) {
    if (field in row && row[field] != null && !Number.isFinite(Number(row[field]))) {
      errors.push(`Invalid ${field} for activity ${row.sourceActivityId}`);
    }
  }
  if (errors.length) {
    return { ok: false, errors };
  }
  return { ok: true, value: row };
}

export async function getGarminSyncState() {
  const state = await get('integrationSyncState', GARMIN_INTEGRATION);
  return state || { integration: GARMIN_INTEGRATION };
}

export async function updateGarminSyncState(partial) {
  const current = await getGarminSyncState();
  const next = { ...current, integration: GARMIN_INTEGRATION, ...partial };
  await put('integrationSyncState', next);
  return next;
}

function buildDailyHealthRecord(row, snapshot, importedAt) {
  return {
    localDate: row.localDate,
    timezone: row.timezone || snapshot.timezone || 'Australia/Melbourne',
    steps: row.steps ?? null,
    restingHeartRateBpm: row.restingHeartRateBpm ?? null,
    averageStress: row.averageStress ?? null,
    hrvNightlyAverageMs: row.hrvNightlyAverageMs ?? null,
    intensityMinutesModerate: row.intensityMinutesModerate ?? null,
    intensityMinutesVigorous: row.intensityMinutesVigorous ?? null,
    sleep: row.sleep
      ? {
          totalSeconds: row.sleep.totalSeconds ?? null,
          deepSeconds: row.sleep.deepSeconds ?? null,
          lightSeconds: row.sleep.lightSeconds ?? null,
          remSeconds: row.sleep.remSeconds ?? null,
          awakeSeconds: row.sleep.awakeSeconds ?? null,
          score: row.sleep.score ?? null,
          startAt: row.sleep.startAt ?? null,
          endAt: row.sleep.endAt ?? null
        }
      : undefined,
    source: GARMIN_SOURCE,
    sourceSchemaVersion: snapshot.schemaVersion,
    sourceUpdatedAt: row.sourceUpdatedAt ?? null,
    importedAt
  };
}

function buildActivityRecord(row, importedAt) {
  return {
    sourceActivityId: row.sourceActivityId,
    type: row.type,
    startedAt: row.startedAt,
    durationSeconds: row.durationSeconds ?? null,
    distanceMeters: row.distanceMeters ?? null,
    averageHeartRateBpm: row.averageHeartRateBpm ?? null,
    maximumHeartRateBpm: row.maximumHeartRateBpm ?? null,
    source: GARMIN_SOURCE,
    importedAt
  };
}

export async function upsertDailyHealth(records) {
  const toWrite = records.map((r) => {
    const { sleep, ...rest } = r;
    const record = { ...rest };
    if (sleep) record.sleep = sleep;
    return record;
  });
  await putAll('dailyHealth', toWrite);
  return toWrite.length;
}

export async function upsertGarminActivities(records) {
  await putAll('garminActivities', records);
  return records.length;
}

export async function importGarminSnapshot(text) {
  const attemptAt = getLocalISOString();
  await updateGarminSyncState({ lastAttemptAt: attemptAt });

  const parsed = parseGarminSnapshot(text);
  if (!parsed.ok) {
    await updateGarminSyncState({
      lastError: parsed.errors.join(' ')
    });
    return { ok: false, errors: parsed.errors };
  }

  const { snapshot } = parsed;
  const importedAt = getLocalISOString();
  const dailyRecords = snapshot.dailyHealth.map((row) =>
    buildDailyHealthRecord(row, snapshot, importedAt)
  );
  const activityRecords = snapshot.activities.map((row) =>
    buildActivityRecord(row, importedAt)
  );

  try {
    await runTransaction(['dailyHealth', 'garminActivities', 'integrationSyncState'], 'readwrite', async (tx) => {
      const dailyStore = tx.objectStore('dailyHealth');
      const activityStore = tx.objectStore('garminActivities');
      for (const record of dailyRecords) {
        dailyStore.put(record);
      }
      for (const record of activityRecords) {
        activityStore.put(record);
      }
      const syncStore = tx.objectStore('integrationSyncState');
      syncStore.put({
        integration: GARMIN_INTEGRATION,
        lastAttemptAt: attemptAt,
        lastSuccessAt: importedAt,
        lastError: null,
        lastDailyRecordCount: dailyRecords.length,
        lastActivityRecordCount: activityRecords.length,
        lastSnapshotExportedAt: snapshot.exportedAt || null,
        lastSourceVersion: snapshot.source?.version || null,
        lastSchemaVersion: snapshot.source?.databaseSchema || null
      });
    });
  } catch (err) {
    await updateGarminSyncState({
      lastError: err?.message || 'Import transaction failed.'
    });
    return { ok: false, errors: [err?.message || 'Import transaction failed.'] };
  }

  return {
    ok: true,
    dailyCount: dailyRecords.length,
    activityCount: activityRecords.length,
    warnings: snapshot.warnings
  };
}

export async function getAllDailyHealth() {
  const rows = await getAll('dailyHealth');
  return rows.sort((a, b) => a.localDate.localeCompare(b.localDate));
}

export async function getLatestDailyHealth() {
  const rows = await getAllDailyHealth();
  return rows[rows.length - 1] || null;
}

export async function getGarminActivities(limit = 20) {
  const rows = await getAll('garminActivities');
  return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
}

export function formatDurationSeconds(totalSeconds) {
  if (totalSeconds == null || totalSeconds <= 0) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatDistanceMeters(meters) {
  if (meters == null || meters <= 0) return null;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatActivityType(type) {
  if (!type) return 'Activity';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatGarminSyncTime(iso) {
  if (!iso) return 'Never imported';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Never imported';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}
