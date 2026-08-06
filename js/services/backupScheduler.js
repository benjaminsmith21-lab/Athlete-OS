import { getLocalDateString, getLocalISOString } from '../utils/datetime.js';
import { getSettings, saveSettings } from './settings.js';
import { exportFullBackup, downloadJson, shareBackupFile, summarizeBackup } from './backup.js';
import { scheduleBackupSnapshot } from './backupSnapshot.js';

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function markBackupDirty() {
  scheduleBackupSnapshot();
  const settings = await getSettings();
  if (settings.backupDirtyAt) return settings;
  return saveSettings({ backupDirtyAt: getLocalISOString() });
}

export function shouldAutoExport(settings) {
  if (settings.autoBackupEnabled === false) return false;
  const intervalDays = settings.autoBackupIntervalDays ?? 7;
  if (settings.backupDirtyAt) return true;
  if (!settings.lastBackupExportAt) return true;
  const last = new Date(settings.lastBackupExportAt);
  if (Number.isNaN(last.getTime())) return true;
  const daysSince = (Date.now() - last.getTime()) / (24 * 60 * 60 * 1000);
  return daysSince >= intervalDays;
}

export async function runAutoExportIfNeeded() {
  const settings = await getSettings();
  if (!shouldAutoExport(settings)) return null;
  return performBackupExport({ automatic: true });
}

export async function performBackupExport(options = {}) {
  const data = await exportFullBackup();
  const filename = `athlete-os-backup-${getLocalDateString()}.json`;
  downloadJson(data, filename);
  await saveSettings({
    lastBackupExportAt: getLocalISOString(),
    backupDirtyAt: null
  });
  scheduleBackupSnapshot();
  return { data, filename, automatic: !!options.automatic, summary: summarizeBackup(data) };
}

export async function shareLatestBackup(data, filename) {
  try {
    return await shareBackupFile(data, filename);
  } catch {
    return false;
  }
}

export function formatLastBackupLabel(iso) {
  if (!iso) return 'Never exported';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Never exported';
  const now = new Date();
  const diffDays = Math.floor((now - d) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0 && d.toDateString() === now.toDateString()) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function getBackupStatusLine() {
  const settings = await getSettings();
  const data = await exportFullBackup();
  const summary = summarizeBackup(data);
  const lastLabel = formatLastBackupLabel(settings.lastBackupExportAt);
  return `${lastLabel} · ${summary.missions} missions · ${summary.bodyMeasurements} weigh-ins · ${summary.dailyHealth} Garmin days`;
}

export async function isLikelyFreshInstall() {
  const data = await exportFullBackup();
  const summary = summarizeBackup(data);
  const completedMissions = (data.missions || []).filter((m) => m.status === 'complete').length;
  return (
    completedMissions === 0 &&
    summary.bodyMeasurements === 0 &&
    summary.dailyHealth === 0 &&
    summary.garminActivities === 0
  );
}
