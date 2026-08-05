#!/usr/bin/env python3
"""Read-only exporter: GarminDB SQLite -> sanitised garmin-snapshot.json for Athlete OS."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
import sqlite3
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from garmin_schema import ADAPTERS, SchemaInspection, UnsupportedSchemaError

DEFAULT_TIMEZONE = 'Australia/Melbourne'
FORBIDDEN_OUTPUT_KEYS = {
    'password',
    'username',
    'user',
    'token',
    'credentials',
    'cookie',
    'session',
    'fit_path',
    'sqlite',
    'config_path',
}


def detect_garmindb_version() -> str | None:
    try:
        return importlib.metadata.version('garmindb')
    except importlib.metadata.PackageNotFoundError:
        return None


def resolve_health_data_dir(garmin_db_dir: Path) -> Path:
    config_path = garmin_db_dir / 'GarminConnectConfig.json'
    if config_path.exists():
        try:
            config = json.loads(config_path.read_text(encoding='utf-8'))
            directories = config.get('directories', {})
            base_dir = directories.get('base_dir', 'HealthData')
            if directories.get('relative_to_home', True):
                return Path.home() / base_dir / 'DBs'
            return Path(base_dir) / 'DBs'
        except (json.JSONDecodeError, OSError):
            pass
    return Path.home() / 'HealthData' / 'DBs'


def inspect_databases(dbs_dir: Path) -> SchemaInspection:
    inspection = SchemaInspection(
        garmin_db_path=dbs_dir / 'garmin.db',
        activities_db_path=dbs_dir / 'garmin_activities.db',
        garmindb_version=detect_garmindb_version(),
    )
    if inspection.garmin_db_path.exists():
        conn = sqlite3.connect(f'file:{inspection.garmin_db_path}?mode=ro', uri=True)
        try:
            tables = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ).fetchall()
            for (name,) in tables:
                cols = conn.execute(f'PRAGMA table_info({name})').fetchall()
                inspection.tables[name] = [c[1] for c in cols]
        finally:
            conn.close()
    return inspection


def select_adapter(inspection: SchemaInspection):
    for adapter in ADAPTERS:
        if adapter.matches(inspection):
            return adapter
    return None


def validate_snapshot(snapshot: dict) -> None:
    if snapshot.get('schemaVersion') != 1:
        raise ValueError('Invalid schemaVersion in snapshot')
    if snapshot.get('source', {}).get('name') != 'GarminDB':
        raise ValueError('Invalid source in snapshot')
    dumped = json.dumps(snapshot)
    lower = dumped.lower()
    for forbidden in FORBIDDEN_OUTPUT_KEYS:
        if f'"{forbidden}"' in lower:
            raise ValueError(f'Snapshot contains forbidden key: {forbidden}')


def write_atomic(snapshot: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(
        suffix='.tmp',
        prefix='garmin-snapshot-',
        dir=str(output_path.parent),
    )
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            json.dump(snapshot, handle, indent=2, ensure_ascii=False)
            handle.write('\n')
        validate_snapshot(snapshot)
        os.replace(tmp_path, output_path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def format_unsupported_message(inspection: SchemaInspection) -> str:
    lines = [
        'Unsupported GarminDB schema.',
        '',
        f'Detected GarminDB version: {inspection.garmindb_version or "unknown"}',
        'Detected tables:',
    ]
    for name in sorted(inspection.tables.keys()):
        lines.append(f'- {name}')
    lines.extend([
        '',
        'No supported Athlete OS adapter matched this schema.',
        'No export was written.',
    ])
    return '\n'.join(lines)


def export_snapshot(
    garmin_db_dir: Path,
    output_path: Path,
    health_data_dir: Path | None = None,
    timezone: str = DEFAULT_TIMEZONE,
) -> dict:
    dbs_dir = health_data_dir or resolve_health_data_dir(garmin_db_dir)
    inspection = inspect_databases(dbs_dir)
    adapter = select_adapter(inspection)
    if adapter is None:
        raise UnsupportedSchemaError(format_unsupported_message(inspection))
    snapshot = adapter.export(inspection, timezone)
    write_atomic(snapshot, output_path)
    return snapshot


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description='Export sanitised Garmin health data for Athlete OS')
    parser.add_argument(
        '--garmin-db-dir',
        default=os.environ.get('GARMIN_DB_DIR'),
        help='GarminDB config directory (default: %%USERPROFILE%%\\.GarminDb or GARMIN_DB_DIR env)',
    )
    parser.add_argument(
        '--health-data-dir',
        default=os.environ.get('HEALTH_DATA_DIR'),
        help='Override HealthData/DBs directory (default: from config or ~/HealthData/DBs)',
    )
    parser.add_argument(
        '--output',
        default=os.environ.get('GARMIN_SNAPSHOT_OUTPUT'),
        help='Output JSON path (default: ~/AthleteOS-exports/garmin-snapshot.json)',
    )
    parser.add_argument(
        '--timezone',
        default=os.environ.get('GARMIN_EXPORT_TIMEZONE', DEFAULT_TIMEZONE),
        help=f'IANA timezone (default: {DEFAULT_TIMEZONE})',
    )
    args = parser.parse_args(argv)

    garmin_db_dir = Path(args.garmin_db_dir) if args.garmin_db_dir else Path.home() / '.GarminDb'
    output_path = Path(args.output) if args.output else Path.home() / 'AthleteOS-exports' / 'garmin-snapshot.json'
    health_data_dir = Path(args.health_data_dir) if args.health_data_dir else None

    try:
        snapshot = export_snapshot(garmin_db_dir, output_path, health_data_dir, args.timezone)
    except UnsupportedSchemaError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except (sqlite3.Error, OSError, ValueError) as exc:
        print(f'Export failed: {exc}', file=sys.stderr)
        return 1

    daily_count = len(snapshot.get('dailyHealth', []))
    activity_count = len(snapshot.get('activities', []))
    print(f'Exported {daily_count} daily records and {activity_count} activities to {output_path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
