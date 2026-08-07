import { getAll, clearStore, clearAllStores, put } from '../db.js';
import { getLocalISOString } from '../utils/datetime.js';
import { getAllMeasurements, saveDailyMeasurement } from './bodyMeasurement.js';
import { mergeExerciseLibraryOnRestore } from './exerciseLibrary.js';

export const BACKUP_SCHEMA_VERSION = 5;

export const BACKUP_STORES = [
  'campaigns',
  'weeklyBlueprints',
  'missions',
  'setLogs',
  'integrity',
  'settings',
  'dailyHealth',
  'garminActivities',
  'integrationSyncState',
  'exerciseLibrary'
];

export async function exportFullBackup() {
  const [
    campaigns,
    weeklyBlueprints,
    missions,
    setLogs,
    integrity,
    settings,
    bodyMeasurements,
    dailyHealth,
    garminActivities,
    integrationSyncState,
    exerciseLibrary
  ] = await Promise.all([
    getAll('campaigns'),
    getAll('weeklyBlueprints'),
    getAll('missions'),
    getAll('setLogs'),
    getAll('integrity'),
    getAll('settings'),
    getAllMeasurements(),
    getAll('dailyHealth'),
    getAll('garminActivities'),
    getAll('integrationSyncState'),
    getAll('exerciseLibrary')
  ]);

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: getLocalISOString(),
    campaigns,
    weeklyBlueprints,
    missions,
    setLogs,
    integrity,
    settings,
    bodyMeasurements,
    dailyHealth,
    garminActivities,
    integrationSyncState,
    exerciseLibrary: exerciseLibrary.filter((item) => item.id !== 'exercise-library-seed-v1')
  };
}

export function validateBackup(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid backup file.' };
  }
  if (!data.schemaVersion) {
    return { valid: false, error: 'Missing schema version.' };
  }

  const requiredArrays = [
    'campaigns',
    'weeklyBlueprints',
    'missions',
    'setLogs',
    'integrity',
    'settings',
    'bodyMeasurements',
    'dailyHealth',
    'garminActivities',
    'integrationSyncState'
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      return { valid: false, error: `Backup is missing a valid ${key} list.` };
    }
  }

  if (data.exerciseLibrary != null && !Array.isArray(data.exerciseLibrary)) {
    return { valid: false, error: 'Backup is missing a valid exerciseLibrary list.' };
  }

  return { valid: true };
}

export function summarizeBackup(data) {
  return {
    missions: data.missions?.length ?? 0,
    setLogs: data.setLogs?.length ?? 0,
    bodyMeasurements: data.bodyMeasurements?.length ?? 0,
    dailyHealth: data.dailyHealth?.length ?? 0,
    garminActivities: data.garminActivities?.length ?? 0,
    exportedAt: data.exportedAt || null
  };
}

export function createBackupBlob(data) {
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export function downloadJson(data, filename) {
  const blob = createBackupBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareBackupFile(data, filename) {
  const blob = createBackupBlob(data);
  const file = new File([blob], filename, { type: 'application/json' });
  if (!navigator.canShare?.({ files: [file] })) return false;
  await navigator.share({ files: [file], title: 'Athlete OS backup' });
  return true;
}

export function exportBodyMeasurementsCsv(measurements) {
  const header = 'date,recordedAt,weightKg,bodyFatPercent,waistCm,note,source';
  const rows = measurements.map((m) =>
    [
      m.date,
      m.recordedAt,
      m.weightKg,
      m.bodyFatPercent ?? '',
      m.waistCm ?? '',
      csvEscape(m.note ?? ''),
      m.source
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

function csvEscape(value) {
  const s = String(value).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBodyCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const isEufy = header.some((h) => h.includes('weight') && !h.includes('weightkg'));

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    if (isEufy) return parseEufyRow(cols, header);
    return parseStandardRow(cols, header);
  }).filter(Boolean);
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseStandardRow(cols, header) {
  const row = Object.fromEntries(header.map((h, i) => [h, cols[i]]));
  const date = (row.date || '').slice(0, 10);
  const weight = parseFloat(row.weightkg || row.weight);
  if (!date || Number.isNaN(weight)) return null;
  return {
    date,
    recordedAt: row.recordedat || `${date}T07:00:00+10:00`,
    weightKg: Math.round(weight * 10) / 10,
    bodyFatPercent: row.bodyfatpercent ? parseFloat(row.bodyfatpercent) : undefined,
    waistCm: row.waistcm ? parseFloat(row.waistcm) : undefined,
    note: row.note || undefined,
    source: row.source || 'eufy_csv'
  };
}

function parseEufyRow(cols, header) {
  const row = Object.fromEntries(header.map((h, i) => [h, cols[i]]));
  const dateKey = header.find((h) => h.includes('date') || h.includes('time')) || header[0];
  const weightKey = header.find((h) => h.includes('weight') && !h.includes('fat')) || header[1];
  const fatKey = header.find((h) => h.includes('fat') || h.includes('bmi'));

  let dateRaw = row[dateKey] || cols[0];
  let date = dateRaw.includes('T') ? dateRaw.slice(0, 10) : dateRaw.slice(0, 10);
  if (date.includes('/')) {
    const [d, m, y] = date.split('/');
    date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const weight = parseFloat(row[weightKey] || cols[1]);
  if (!date || Number.isNaN(weight)) return null;

  return {
    date,
    recordedAt: `${date}T07:00:00+10:00`,
    weightKg: Math.round(weight * 10) / 10,
    bodyFatPercent: fatKey ? parseFloat(row[fatKey]) : undefined,
    source: 'eufy_csv'
  };
}

export async function applyBackup(data, options = {}) {
  const stores = BACKUP_STORES.filter((store) => store !== 'exerciseLibrary');

  if (options.replaceAll) {
    await clearAllStores([...stores, 'bodyMeasurements', 'exerciseLibrary']);
  }

  for (const store of stores) {
    for (const item of data[store] || []) {
      await put(store, item);
    }
  }

  if (Array.isArray(data.exerciseLibrary)) {
    await mergeExerciseLibraryOnRestore(data.exerciseLibrary);
  }

  return data.bodyMeasurements || [];
}

export function detectImportConflicts(existing, imported) {
  const byDate = Object.fromEntries(existing.map((m) => [m.date, m]));
  return imported.map((row) => ({
    row,
    existing: byDate[row.date] || null,
    conflict: !!byDate[row.date]
  }));
}

export async function applyBodyMeasurementsImport(preview, resolutions = [], options = {}) {
  if (options.replaceAll) {
    await clearStore('bodyMeasurements');
    for (const p of preview) {
      await saveDailyMeasurement(
        {
          weightKg: p.row.weightKg,
          bodyFatPercent: p.row.bodyFatPercent,
          waistCm: p.row.waistCm,
          note: p.row.note
        },
        { date: p.row.date, source: p.row.source || 'manual' }
      );
    }
    return;
  }

  for (let i = 0; i < preview.length; i++) {
    const p = preview[i];
    const action = resolutions[i] || (p.conflict ? 'skip' : 'replace');
    if (action === 'skip' || action === 'keep') continue;
    await saveDailyMeasurement(
      {
        weightKg: p.row.weightKg,
        bodyFatPercent: p.row.bodyFatPercent,
        waistCm: p.row.waistCm,
        note: p.row.note
      },
      { date: p.row.date, source: p.row.source || 'manual' }
    );
  }
}

export async function replaceAllBodyMeasurements(rows) {
  await clearStore('bodyMeasurements');
  for (const row of rows) {
    await saveDailyMeasurement(
      {
        weightKg: row.weightKg,
        bodyFatPercent: row.bodyFatPercent,
        waistCm: row.waistCm,
        note: row.note
      },
      { date: row.date, source: row.source || 'manual' }
    );
  }
}
