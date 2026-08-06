import { getAll, get, put, remove, generateId } from '../db.js';
import { getLocalISOString } from '../utils/datetime.js';
import {
  exportFullBackup,
  BACKUP_SCHEMA_VERSION,
  applyBackup,
  replaceAllBodyMeasurements
} from './backup.js';

const MAX_SNAPSHOTS = 3;
const DEBOUNCE_MS = 30000;

let debounceTimer = null;

export function scheduleBackupSnapshot() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    saveBackupSnapshot().catch(() => {});
  }, DEBOUNCE_MS);
}

export async function saveBackupSnapshot() {
  const payload = await exportFullBackup();
  const snapshot = {
    id: generateId('snap'),
    createdAt: getLocalISOString(),
    schemaVersion: BACKUP_SCHEMA_VERSION,
    payload
  };
  await put('backupSnapshots', snapshot);
  await trimSnapshots();
  return snapshot;
}

async function trimSnapshots() {
  const snapshots = await getBackupSnapshots();
  if (snapshots.length <= MAX_SNAPSHOTS) return;
  const toDelete = snapshots.slice(0, snapshots.length - MAX_SNAPSHOTS);
  for (const snap of toDelete) {
    await remove('backupSnapshots', snap.id);
  }
}

export async function getBackupSnapshots() {
  const rows = await getAll('backupSnapshots');
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getLatestBackupSnapshot() {
  const snapshots = await getBackupSnapshots();
  return snapshots[snapshots.length - 1] || null;
}

export async function restoreBackupSnapshot(snapshotId) {
  const snap = await get('backupSnapshots', snapshotId);
  if (!snap?.payload) throw new Error('Snapshot not found.');
  const bodyRows = await applyBackup(snap.payload, { replaceAll: true });
  await replaceAllBodyMeasurements(bodyRows);
  return snap;
}

export function getSnapshotLabel(snapshot) {
  if (!snapshot?.createdAt) return 'Unknown snapshot';
  const d = new Date(snapshot.createdAt);
  if (Number.isNaN(d.getTime())) return 'Unknown snapshot';
  return d.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}
