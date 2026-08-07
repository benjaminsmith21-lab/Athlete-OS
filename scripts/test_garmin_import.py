"""Tests mirroring js/services/garminImport.js validation and import rules."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GARMIN_SNAPSHOT_SCHEMA_VERSION = 1
DATE_RE = __import__('re').compile(r'^\d{4}-\d{2}-\d{2}$')
ISO_RE = __import__('re').compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$')


def validate_garmin_snapshot(data):
    errors = []
    if not isinstance(data, dict):
        return False, ['Snapshot must be a JSON object.']
    if data.get('schemaVersion') != GARMIN_SNAPSHOT_SCHEMA_VERSION:
        errors.append(f'Unsupported snapshot schemaVersion: {data.get("schemaVersion")}')
    if data.get('source', {}).get('name') != 'GarminDB':
        errors.append('Snapshot source must be GarminDB.')
    if not isinstance(data.get('dailyHealth'), list):
        errors.append('dailyHealth must be an array.')
    if not isinstance(data.get('activities'), list):
        errors.append('activities must be an array.')
    if errors:
        return False, errors

    seen_dates = set()
    seen_acts = set()
    for row in data['dailyHealth']:
        if not DATE_RE.match(row.get('localDate', '')):
            errors.append(f'Invalid localDate: {row.get("localDate")}')
        if row['localDate'] in seen_dates:
            errors.append(f'Duplicate dailyHealth localDate: {row["localDate"]}')
        seen_dates.add(row['localDate'])
    for row in data['activities']:
        aid = row.get('sourceActivityId')
        if not aid:
            errors.append('Activity missing sourceActivityId.')
        if aid in seen_acts:
            errors.append(f'Duplicate sourceActivityId: {aid}')
        seen_acts.add(aid)
        if not ISO_RE.match(row.get('startedAt', '')):
            errors.append(f'Activity {aid} has invalid startedAt.')
    return (not errors), errors


def sample_snapshot():
    return {
        'schemaVersion': 1,
        'exportedAt': '2026-08-05T21:00:00+10:00',
        'timezone': 'Australia/Melbourne',
        'source': {'name': 'GarminDB', 'version': '3.5.0', 'databaseSchema': 'garmindb-v1'},
        'dailyHealth': [
            {
                'localDate': '2026-08-05',
                'steps': 8400,
                'restingHeartRateBpm': 52,
                'averageStress': 28,
                'hrvNightlyAverageMs': 44,
                'intensityMinutesModerate': 23,
                'intensityMinutesVigorous': 10,
                'sleep': {
                    'totalSeconds': 25920,
                    'deepSeconds': 5400,
                    'score': 78,
                    'startAt': '2026-08-04T22:51:00+10:00',
                    'endAt': '2026-08-05T06:03:00+10:00',
                },
                'sourceUpdatedAt': '2026-08-05T08:15:00+10:00',
            }
        ],
        'activities': [
            {
                'sourceActivityId': 'garmin:123456789',
                'type': 'running',
                'startedAt': '2026-08-05T06:01:00+10:00',
                'durationSeconds': 2702,
                'distanceMeters': 7040,
                'averageHeartRateBpm': 148,
                'maximumHeartRateBpm': 166,
            }
        ],
        'warnings': [],
    }


def simulate_idempotent_import(existing_daily, existing_activities, snapshot):
    daily = {r['localDate']: r for r in existing_daily if r.get('source') == 'garmindb'}
    activities = {r['sourceActivityId']: r for r in existing_activities if r.get('source') == 'garmindb'}
    imported_at = '2026-08-05T22:00:00+10:00'
    for row in snapshot['dailyHealth']:
        daily[row['localDate']] = {
            **row,
            'source': 'garmindb',
            'importedAt': imported_at,
        }
    for row in snapshot['activities']:
        activities[row['sourceActivityId']] = {
            **row,
            'source': 'garmindb',
            'importedAt': imported_at,
        }
    return list(daily.values()), list(activities.values())


def test_valid_snapshot_import():
    ok, errors = validate_garmin_snapshot(sample_snapshot())
    assert ok, errors


def test_invalid_schema_rejected():
    bad = sample_snapshot()
    bad['schemaVersion'] = 2
    ok, errors = validate_garmin_snapshot(bad)
    assert not ok
    assert any('schemaVersion' in e for e in errors)


def test_duplicate_import_idempotent():
    snap = sample_snapshot()
    d1, a1 = simulate_idempotent_import([], [], snap)
    d2, a2 = simulate_idempotent_import(d1, a1, snap)
    assert len(d1) == len(d2) == 1
    assert len(a1) == len(a2) == 1


def test_newer_garmin_daily_replaces_older():
    snap = sample_snapshot()
    old = [{'localDate': '2026-08-05', 'steps': 8000, 'source': 'garmindb', 'importedAt': 'old'}]
    daily, _ = simulate_idempotent_import(old, [], snap)
    assert daily[0]['steps'] == 8400


def test_manual_body_data_not_touched_by_import():
    """Garmin import must not write to bodyMeasurements or missions stores."""
    text = (ROOT / 'js/services/garminImport.js').read_text(encoding='utf-8')
    assert 'bodyMeasurements' not in text
    assert 'saveDailyMeasurement' not in text
    assert 'missions' not in text


def test_partial_optional_fields_accepted():
    snap = sample_snapshot()
    snap['dailyHealth'][0] = {'localDate': '2026-08-05', 'steps': 1000}
    ok, errors = validate_garmin_snapshot(snap)
    assert ok, errors


def test_missing_arrays_rejected():
    snap = sample_snapshot()
    del snap['activities']
    ok, errors = validate_garmin_snapshot(snap)
    assert not ok


def test_malformed_dates_rejected():
    snap = sample_snapshot()
    snap['dailyHealth'][0]['localDate'] = '05-08-2026'
    ok, errors = validate_garmin_snapshot(snap)
    assert not ok


def test_backup_includes_garmin_stores():
    backup_js = (ROOT / 'js/services/backup.js').read_text(encoding='utf-8')
    assert 'dailyHealth' in backup_js
    assert 'garminActivities' in backup_js
    assert 'integrationSyncState' in backup_js
    assert 'BACKUP_SCHEMA_VERSION = 5' in backup_js


def test_db_v4_stores():
    db_js = (ROOT / 'js/db.js').read_text(encoding='utf-8')
    assert 'DB_VERSION = 5' in db_js
    assert 'dailyHealth' in db_js
    assert 'garminActivities' in db_js
    assert 'integrationSyncState' in db_js


def test_no_garmin_credentials_in_frontend():
    for rel in ['js/services/garminImport.js', 'js/app.js']:
        text = (ROOT / rel).read_text(encoding='utf-8').lower()
        assert 'garminconnectconfig' not in text
        assert 'garmindb_cli' not in text


def test_sw_includes_garmin_import():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert 'garminImport.js' in sw


if __name__ == '__main__':
    tests = [
        test_valid_snapshot_import,
        test_invalid_schema_rejected,
        test_duplicate_import_idempotent,
        test_newer_garmin_daily_replaces_older,
        test_manual_body_data_not_touched_by_import,
        test_partial_optional_fields_accepted,
        test_missing_arrays_rejected,
        test_malformed_dates_rejected,
        test_backup_includes_garmin_stores,
        test_db_v4_stores,
        test_no_garmin_credentials_in_frontend,
        test_sw_includes_garmin_import,
    ]
    failed = 0
    for t in tests:
        try:
            t()
            print(f'OK  {t.__name__}')
        except Exception as e:
            failed += 1
            print(f'FAIL {t.__name__}: {e}')
    if failed:
        raise SystemExit(1)
    print(f'All {len(tests)} garmin import tests passed')
