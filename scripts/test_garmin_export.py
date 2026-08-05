"""Tests for GarminDB export pipeline."""

from __future__ import annotations

import json
import sqlite3
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / 'scripts'
sys.path.insert(0, str(SCRIPTS))

from garmin_export import export_snapshot, format_unsupported_message, validate_snapshot
from garmin_schema import ADAPTERS, SchemaInspection, UnsupportedSchemaError
from garmin_schema.schema_v1 import GarminDbSchemaV1

FORBIDDEN = {'password', 'username', 'token', 'credentials', 'cookie', 'sqlite', 'fit_path'}


def build_supported_fixture(dbs_dir: Path) -> None:
    dbs_dir.mkdir(parents=True, exist_ok=True)
    garmin = dbs_dir / 'garmin.db'
    activities = dbs_dir / 'garmin_activities.db'

    conn = sqlite3.connect(garmin)
    conn.executescript(
        '''
        CREATE TABLE attributes (name TEXT, value TEXT);
        INSERT INTO attributes VALUES ('measurement_system', 'metric');

        CREATE TABLE daily_summary (
            day TEXT PRIMARY KEY,
            steps INTEGER,
            rhr INTEGER,
            stress_avg INTEGER,
            moderate_activity_time TEXT,
            vigorous_activity_time TEXT
        );
        INSERT INTO daily_summary VALUES
            ('2026-08-04 00:00:00', 8100, 53, 30, '00:20:00', '00:08:00'),
            ('2026-08-05 00:00:00', 8400, 52, 28, '00:23:00', '00:10:00');

        CREATE TABLE sleep (
            day TEXT PRIMARY KEY,
            start TEXT,
            end TEXT,
            total_sleep TEXT,
            deep_sleep TEXT,
            light_sleep TEXT,
            rem_sleep TEXT,
            awake TEXT,
            score INTEGER
        );
        INSERT INTO sleep VALUES
            ('2026-08-05 00:00:00', '2026-08-04 22:51:00', '2026-08-05 06:03:00',
             '07:12:00', '01:30:00', '03:52:00', '01:35:00', '00:15:00', 78);

        CREATE TABLE hrv (day TEXT PRIMARY KEY, last_night_avg INTEGER);
        INSERT INTO hrv VALUES ('2026-08-05 00:00:00', 44);

        CREATE TABLE resting_hr (day TEXT PRIMARY KEY, resting_heart_rate INTEGER);
        INSERT INTO resting_hr VALUES ('2026-08-04 00:00:00', 54);
        '''
    )
    conn.close()

    act = sqlite3.connect(activities)
    act.executescript(
        '''
        CREATE TABLE activities (
            activity_id TEXT PRIMARY KEY,
            sport TEXT,
            sub_sport TEXT,
            type TEXT,
            name TEXT,
            start_time TEXT,
            elapsed_time TEXT,
            distance REAL,
            avg_hr INTEGER,
            max_hr INTEGER
        );
        INSERT INTO activities VALUES
            ('123456789', 'running', NULL, 'running', 'Morning Run',
             '2026-08-05 06:01:00', '00:45:02', 7.04, 148, 166);
        '''
    )
    act.close()


def build_unsupported_fixture(dbs_dir: Path) -> None:
    dbs_dir.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(dbs_dir / 'garmin.db')
    conn.executescript(
        '''
        CREATE TABLE legacy_metrics (id INTEGER PRIMARY KEY, value REAL);
        INSERT INTO legacy_metrics VALUES (1, 1.0);
        '''
    )
    conn.close()


def test_supported_schema_export():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_supported_fixture(dbs)
        out = Path(tmp) / 'garmin-snapshot.json'
        snapshot = export_snapshot(Path(tmp), out, health_data_dir=dbs)
        assert out.exists()
        assert snapshot['schemaVersion'] == 1
        assert len(snapshot['dailyHealth']) == 2
        assert len(snapshot['activities']) == 1
        day = snapshot['dailyHealth'][-1]
        assert day['localDate'] == '2026-08-05'
        assert day['steps'] == 8400
        assert day['sleep']['totalSeconds'] == 25920
        assert day['intensityMinutesModerate'] == 23
        assert snapshot['activities'][0]['durationSeconds'] == 2702
        assert snapshot['activities'][0]['distanceMeters'] == 7040.0


def test_unsupported_schema_fails():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_unsupported_fixture(dbs)
        out = Path(tmp) / 'out.json'
        try:
            export_snapshot(Path(tmp), out, health_data_dir=dbs)
            assert False, 'Expected UnsupportedSchemaError'
        except UnsupportedSchemaError as exc:
            msg = str(exc)
            assert 'Unsupported GarminDB schema' in msg
        assert not out.exists()


def test_missing_optional_table_still_exports():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        dbs.mkdir(parents=True)
        conn = sqlite3.connect(dbs / 'garmin.db')
        conn.executescript(
            '''
            CREATE TABLE daily_summary (day TEXT PRIMARY KEY, steps INTEGER);
            INSERT INTO daily_summary VALUES ('2026-08-05 00:00:00', 5000);
            '''
        )
        conn.close()
        out = Path(tmp) / 'out.json'
        snapshot = export_snapshot(Path(tmp), out, health_data_dir=dbs)
        assert len(snapshot['dailyHealth']) == 1
        assert snapshot['dailyHealth'][0]['steps'] == 5000
        assert 'sleep' not in snapshot['dailyHealth'][0]


def test_missing_metric_not_zero():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        dbs.mkdir(parents=True)
        conn = sqlite3.connect(dbs / 'garmin.db')
        conn.executescript(
            '''
            CREATE TABLE daily_summary (day TEXT PRIMARY KEY, steps INTEGER, rhr INTEGER);
            INSERT INTO daily_summary VALUES ('2026-08-05 00:00:00', NULL, NULL);
            '''
        )
        conn.close()
        out = Path(tmp) / 'out.json'
        snapshot = export_snapshot(Path(tmp), out, health_data_dir=dbs)
        day = snapshot['dailyHealth'][0]
        assert 'steps' not in day
        assert 'restingHeartRateBpm' not in day


def test_no_credentials_in_output():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_supported_fixture(dbs)
        out = Path(tmp) / 'out.json'
        export_snapshot(Path(tmp), out, health_data_dir=dbs)
        text = out.read_text(encoding='utf-8').lower()
        for word in FORBIDDEN:
            assert word not in text


def test_no_local_paths_in_output():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_supported_fixture(dbs)
        out = Path(tmp) / 'out.json'
        export_snapshot(Path(tmp), out, health_data_dir=dbs)
        text = out.read_text(encoding='utf-8')
        assert 'HealthData' not in text
        assert '.GarminDb' not in text
        assert '.db' not in text.lower()


def test_atomic_file_output():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_supported_fixture(dbs)
        out = Path(tmp) / 'nested' / 'garmin-snapshot.json'
        export_snapshot(Path(tmp), out, health_data_dir=dbs)
        assert out.exists()
        assert not list(out.parent.glob('*.tmp'))


def test_malformed_sqlite_database():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        dbs.mkdir(parents=True)
        (dbs / 'garmin.db').write_bytes(b'not a sqlite file')
        out = Path(tmp) / 'out.json'
        try:
            export_snapshot(Path(tmp), out, health_data_dir=dbs)
            assert False, 'Expected failure'
        except Exception:
            assert not out.exists()


def test_duplicate_activity_ids_warning():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        dbs.mkdir(parents=True)
        garmin = sqlite3.connect(dbs / 'garmin.db')
        garmin.executescript(
            '''
            CREATE TABLE daily_summary (day TEXT PRIMARY KEY, steps INTEGER);
            INSERT INTO daily_summary VALUES ('2026-08-05 00:00:00', 1000);
            '''
        )
        garmin.close()
        act = sqlite3.connect(dbs / 'garmin_activities.db')
        act.executescript(
            '''
            CREATE TABLE activities (
                activity_id TEXT,
                sport TEXT,
                sub_sport TEXT,
                type TEXT,
                name TEXT,
                start_time TEXT,
                elapsed_time TEXT,
                distance REAL,
                avg_hr INTEGER,
                max_hr INTEGER
            );
            INSERT INTO activities VALUES
                ('123456789', 'running', NULL, 'running', 'Run A', '2026-08-05 06:01:00', '00:45:02', 7.04, 148, 166),
                ('123456789', 'running', NULL, 'running', 'Run B', '2026-08-05 07:00:00', '00:30:00', 5.0, 140, 160);
            '''
        )
        act.close()
        out = Path(tmp) / 'out.json'
        snapshot = export_snapshot(Path(tmp), out, health_data_dir=dbs)
        assert len(snapshot['activities']) == 1
        assert any(w['code'] == 'DUPLICATE_ACTIVITY' for w in snapshot['warnings'])


def test_adapter_matches():
    with tempfile.TemporaryDirectory() as tmp:
        dbs = Path(tmp) / 'DBs'
        build_supported_fixture(dbs)
        inspection = SchemaInspection(
            garmin_db_path=dbs / 'garmin.db',
            activities_db_path=dbs / 'garmin_activities.db',
        )
        assert GarminDbSchemaV1.matches(inspection)


def test_validate_snapshot_rejects_bad_schema():
    try:
        validate_snapshot({'schemaVersion': 99, 'source': {'name': 'GarminDB'}})
        assert False
    except ValueError:
        pass


if __name__ == '__main__':
    tests = [
        test_supported_schema_export,
        test_unsupported_schema_fails,
        test_missing_optional_table_still_exports,
        test_missing_metric_not_zero,
        test_no_credentials_in_output,
        test_no_local_paths_in_output,
        test_atomic_file_output,
        test_malformed_sqlite_database,
        test_duplicate_activity_ids_warning,
        test_adapter_matches,
        test_validate_snapshot_rejects_bad_schema,
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
    print(f'All {len(tests)} garmin export tests passed')
