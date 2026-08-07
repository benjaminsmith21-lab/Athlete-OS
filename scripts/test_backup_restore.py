"""Unit tests mirroring backup validation, replace-all stores, and snapshot retention."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BACKUP_SCHEMA_VERSION = 5
BACKUP_STORES = [
    'campaigns',
    'weeklyBlueprints',
    'missions',
    'setLogs',
    'integrity',
    'settings',
    'dailyHealth',
    'garminActivities',
    'integrationSyncState',
    'exerciseLibrary',
]

STORE_KEY_PATHS = {
    'campaigns': 'id',
    'weeklyBlueprints': 'id',
    'missions': 'id',
    'setLogs': 'id',
    'integrity': 'campaignId',
    'settings': 'id',
    'bodyMeasurements': 'id',
    'dailyHealth': 'localDate',
    'garminActivities': 'sourceActivityId',
    'integrationSyncState': 'integration',
    'backupSnapshots': 'id',
    'exerciseLibrary': 'id',
}

MAX_SNAPSHOTS = 3


def validate_backup(data: dict) -> dict:
    if not data or not isinstance(data, dict):
        return {'valid': False, 'error': 'Invalid backup file.'}
    if not data.get('schemaVersion'):
        return {'valid': False, 'error': 'Missing schema version.'}
    required = [
        'campaigns',
        'weeklyBlueprints',
        'missions',
        'setLogs',
        'integrity',
        'settings',
        'bodyMeasurements',
        'dailyHealth',
        'garminActivities',
        'integrationSyncState',
    ]
    for key in required:
        if not isinstance(data.get(key), list):
            return {'valid': False, 'error': f'Backup is missing a valid {key} list.'}
    return {'valid': True}


def replace_all_store_names() -> list[str]:
    return [*BACKUP_STORES, 'bodyMeasurements']


def trim_snapshots(snapshots: list[dict]) -> list[dict]:
    sorted_snaps = sorted(snapshots, key=lambda s: s['createdAt'])
    if len(sorted_snaps) <= MAX_SNAPSHOTS:
        return sorted_snaps
    return sorted_snaps[-MAX_SNAPSHOTS:]


def test_validate_backup_ok():
    data = {
        'schemaVersion': BACKUP_SCHEMA_VERSION,
        'campaigns': [],
        'weeklyBlueprints': [],
        'missions': [],
        'setLogs': [],
        'integrity': [],
        'settings': [],
        'bodyMeasurements': [],
        'dailyHealth': [],
        'garminActivities': [],
        'integrationSyncState': [],
    }
    assert validate_backup(data)['valid'] is True


def test_validate_backup_missing_schema():
    assert validate_backup({})['valid'] is False


def test_validate_backup_invalid_array():
    data = {
        'schemaVersion': BACKUP_SCHEMA_VERSION,
        'campaigns': [],
        'weeklyBlueprints': [],
        'missions': 'bad',
        'setLogs': [],
        'integrity': [],
        'settings': [],
        'bodyMeasurements': [],
        'dailyHealth': [],
        'garminActivities': [],
        'integrationSyncState': [],
    }
    assert validate_backup(data)['valid'] is False


def test_replace_all_includes_body_measurements():
    stores = replace_all_store_names()
    assert 'bodyMeasurements' in stores
    assert 'integrationSyncState' in stores


def test_store_key_paths_special_keys():
    assert STORE_KEY_PATHS['integrity'] == 'campaignId'
    assert STORE_KEY_PATHS['dailyHealth'] == 'localDate'
    assert STORE_KEY_PATHS['garminActivities'] == 'sourceActivityId'
    assert STORE_KEY_PATHS['integrationSyncState'] == 'integration'


def test_trim_snapshots_keeps_latest_three():
    snaps = [{'id': f's{i}', 'createdAt': f'2026-08-0{i}T10:00:00'} for i in range(1, 6)]
    kept = trim_snapshots(snaps)
    assert len(kept) == 3
    assert kept[0]['id'] == 's3'
    assert kept[-1]['id'] == 's5'


def test_js_modules_exist():
    backup_js = (ROOT / 'js/services/backup.js').read_text(encoding='utf-8')
    snapshot_js = (ROOT / 'js/services/backupSnapshot.js').read_text(encoding='utf-8')
    scheduler_js = (ROOT / 'js/services/backupScheduler.js').read_text(encoding='utf-8')
    db_js = (ROOT / 'js/db.js').read_text(encoding='utf-8')

    assert 'validateBackup' in backup_js
    assert 'bodyMeasurements' in backup_js
    assert 'backupSnapshots' in db_js
    assert 'DB_VERSION = 7' in db_js
    assert 'exerciseLibrary' in backup_js
    assert 'scheduleBackupSnapshot' in snapshot_js
    assert 'runAutoExportIfNeeded' in scheduler_js


if __name__ == '__main__':
    test_validate_backup_ok()
    test_validate_backup_missing_schema()
    test_validate_backup_invalid_array()
    test_replace_all_includes_body_measurements()
    test_store_key_paths_special_keys()
    test_trim_snapshots_keeps_latest_three()
    test_js_modules_exist()
    print('All backup restore tests passed')
