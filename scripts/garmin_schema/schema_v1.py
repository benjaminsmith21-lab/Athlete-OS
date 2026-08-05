"""GarminDB schema adapter v1 — garmin.db daily_summary/sleep/hrv + garmin_activities.db."""

from __future__ import annotations

import re
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from .base import SchemaAdapter, SchemaInspection

ADAPTER_ID = 'garmindb-v1'
REQUIRED = ('daily_summary',)
TIME_RE = re.compile(r'^(\d+):(\d{2}):(\d{2})(?:\.\d+)?$')
DATE_ONLY_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
MELBOURNE_TZ_NAME = 'Australia/Melbourne'


def get_timezone(name: str = MELBOURNE_TZ_NAME):
    try:
        return ZoneInfo(name)
    except Exception:
        if name == MELBOURNE_TZ_NAME:
            return timezone(timedelta(hours=10))
        raise


def _connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def _table_columns(conn: sqlite3.Connection, table: str) -> set[str]:
    rows = conn.execute(f'PRAGMA table_info({table})').fetchall()
    return {row['name'] for row in rows}


def _has_columns(conn: sqlite3.Connection, table: str, columns: tuple[str, ...]) -> bool:
    tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if table not in tables:
        return False
    cols = _table_columns(conn, table)
    return all(c in cols for c in columns)


def _parse_day(value: Any, tz: ZoneInfo) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    if DATE_ONLY_RE.match(text):
        return text
    for fmt in ('%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            dt = datetime.strptime(text[:26], fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=tz)
            return dt.astimezone(tz).date().isoformat()
        except ValueError:
            continue
    return None


def _time_to_seconds(value: Any) -> int | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text in ('00:00:00', '0:00:00'):
        return 0
    match = TIME_RE.match(text)
    if not match:
        return None
    hours, minutes, seconds = (int(match.group(i)) for i in range(1, 4))
    return hours * 3600 + minutes * 60 + seconds


def _time_to_minutes(value: Any) -> int | None:
    seconds = _time_to_seconds(value)
    if seconds is None:
        return None
    return seconds // 60


def _to_iso(value: Any, tz: ZoneInfo) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    for fmt in ('%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S'):
        try:
            dt = datetime.strptime(text[:26], fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=tz)
            return dt.astimezone(tz).isoformat(timespec='seconds')
        except ValueError:
            continue
    return None


def _nullable_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _nullable_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _metric_distance_meters(value: Any, metric: bool) -> float | None:
    dist = _nullable_float(value)
    if dist is None or dist <= 0:
        return None
    return round(dist * 1000, 1) if metric else round(dist * 1609.344, 1)


def _activity_type(row: sqlite3.Row) -> str:
    for key in ('sport', 'sub_sport', 'type', 'name'):
        if key in row.keys() and row[key]:
            return str(row[key]).strip().lower().replace(' ', '_')
    return 'activity'


class GarminDbSchemaV1(SchemaAdapter):
    adapter_id = ADAPTER_ID
    required_tables = REQUIRED

    @classmethod
    def matches(cls, inspection: SchemaInspection) -> bool:
        if not inspection.garmin_db_path or not inspection.garmin_db_path.exists():
            return False
        conn = _connect(inspection.garmin_db_path)
        try:
            return _has_columns(conn, 'daily_summary', ('day', 'steps'))
        finally:
            conn.close()

    @classmethod
    def export(cls, inspection: SchemaInspection, timezone_name: str) -> dict[str, Any]:
        tz = get_timezone(timezone_name)
        now = datetime.now(tz).isoformat(timespec='seconds')
        warnings: list[dict[str, str]] = []
        daily_by_date: dict[str, dict[str, Any]] = {}
        activities: list[dict[str, Any]] = []

        conn = _connect(inspection.garmin_db_path)
        try:
            metric = cls._is_metric(conn)
            cls._load_daily_summary(conn, tz, timezone_name, daily_by_date, warnings)
            if _has_columns(conn, 'sleep', ('day', 'total_sleep')):
                cls._load_sleep(conn, tz, timezone_name, daily_by_date)
            else:
                warnings.append({
                    'code': 'TABLE_UNSUPPORTED',
                    'date': '',
                    'message': 'Sleep table not present in GarminDB schema.',
                })
            if _has_columns(conn, 'hrv', ('day', 'last_night_avg')):
                cls._load_hrv(conn, tz, timezone_name, daily_by_date)
            if _has_columns(conn, 'resting_hr', ('day', 'resting_heart_rate')):
                cls._load_resting_hr(conn, tz, timezone_name, daily_by_date)
        finally:
            conn.close()

        if inspection.activities_db_path and inspection.activities_db_path.exists():
            cls._load_activities(inspection.activities_db_path, tz, metric, activities, warnings)
        else:
            warnings.append({
                'code': 'ACTIVITIES_DB_MISSING',
                'date': '',
                'message': 'Activities database was not found; activities omitted.',
            })

        daily_health = [daily_by_date[k] for k in sorted(daily_by_date.keys())]
        for day in daily_health:
            if 'sleep' not in day:
                warnings.append({
                    'code': 'SLEEP_MISSING',
                    'date': day['localDate'],
                    'message': 'No sleep record was present in GarminDB.',
                })

        return {
            'schemaVersion': 1,
            'exportedAt': now,
            'timezone': timezone_name,
            'source': {
                'name': 'GarminDB',
                'version': inspection.garmindb_version or 'unknown',
                'databaseSchema': ADAPTER_ID,
            },
            'dailyHealth': daily_health,
            'activities': activities,
            'warnings': warnings,
        }

    @staticmethod
    def _is_metric(conn: sqlite3.Connection) -> bool:
        try:
            row = conn.execute(
                "SELECT value FROM attributes WHERE name = 'measurement_system'"
            ).fetchone()
            if row and row[0]:
                return str(row[0]).lower() == 'metric'
        except sqlite3.Error:
            pass
        return True

    @staticmethod
    def _ensure_day(daily: dict[str, dict[str, Any]], local_date: str, tz_name: str) -> dict[str, Any]:
        if local_date not in daily:
            daily[local_date] = {'localDate': local_date, 'timezone': tz_name}
        return daily[local_date]

    @classmethod
    def _load_daily_summary(
        cls,
        conn: sqlite3.Connection,
        tz,
        timezone_name: str,
        daily: dict[str, dict[str, Any]],
        warnings: list[dict[str, str]],
    ) -> None:
        cols = _table_columns(conn, 'daily_summary')
        select = ['day']
        for col in ('steps', 'rhr', 'stress_avg', 'moderate_activity_time', 'vigorous_activity_time'):
            if col in cols:
                select.append(col)
        rows = conn.execute(f"SELECT {', '.join(select)} FROM daily_summary ORDER BY day").fetchall()
        if not rows:
            warnings.append({
                'code': 'DAILY_SUMMARY_EMPTY',
                'date': '',
                'message': 'daily_summary table contained no rows.',
            })
        for row in rows:
            local_date = _parse_day(row['day'], tz)
            if not local_date:
                continue
            entry = cls._ensure_day(daily, local_date, timezone_name)
            if 'steps' in row.keys():
                steps = _nullable_int(row['steps'])
                if steps is not None:
                    entry['steps'] = steps
            if 'rhr' in row.keys():
                rhr = _nullable_int(row['rhr'])
                if rhr is not None and rhr > 0:
                    entry['restingHeartRateBpm'] = rhr
            if 'stress_avg' in row.keys():
                stress = _nullable_int(row['stress_avg'])
                if stress is not None:
                    entry['averageStress'] = stress
            if 'moderate_activity_time' in row.keys():
                mins = _time_to_minutes(row['moderate_activity_time'])
                if mins is not None:
                    entry['intensityMinutesModerate'] = mins
            if 'vigorous_activity_time' in row.keys():
                mins = _time_to_minutes(row['vigorous_activity_time'])
                if mins is not None:
                    entry['intensityMinutesVigorous'] = mins
            entry['sourceUpdatedAt'] = _to_iso(row['day'], tz)

    @classmethod
    def _load_sleep(cls, conn: sqlite3.Connection, tz, timezone_name: str, daily: dict[str, dict[str, Any]]) -> None:
        rows = conn.execute(
            'SELECT day, start, end, total_sleep, deep_sleep, light_sleep, rem_sleep, awake, score FROM sleep ORDER BY day'
        ).fetchall()
        for row in rows:
            local_date = _parse_day(row['day'], tz)
            if not local_date:
                continue
            total = _time_to_seconds(row['total_sleep'])
            if total is None or total <= 0:
                continue
            entry = cls._ensure_day(daily, local_date, timezone_name)
            sleep: dict[str, Any] = {'totalSeconds': total}
            for src, dst in (
                ('deep_sleep', 'deepSeconds'),
                ('light_sleep', 'lightSeconds'),
                ('rem_sleep', 'remSeconds'),
                ('awake', 'awakeSeconds'),
            ):
                val = _time_to_seconds(row[src])
                if val is not None:
                    sleep[dst] = val
            score = _nullable_int(row['score'])
            if score is not None:
                sleep['score'] = score
            start_at = _to_iso(row['start'], tz)
            end_at = _to_iso(row['end'], tz)
            if start_at:
                sleep['startAt'] = start_at
            if end_at:
                sleep['endAt'] = end_at
            entry['sleep'] = sleep
            if not entry.get('sourceUpdatedAt'):
                entry['sourceUpdatedAt'] = _to_iso(row['day'], tz)

    @classmethod
    def _load_hrv(cls, conn: sqlite3.Connection, tz, timezone_name: str, daily: dict[str, dict[str, Any]]) -> None:
        rows = conn.execute('SELECT day, last_night_avg FROM hrv ORDER BY day').fetchall()
        for row in rows:
            local_date = _parse_day(row['day'], tz)
            if not local_date:
                continue
            hrv = _nullable_int(row['last_night_avg'])
            if hrv is None or hrv <= 0:
                continue
            entry = cls._ensure_day(daily, local_date, timezone_name)
            entry['hrvNightlyAverageMs'] = hrv

    @classmethod
    def _load_resting_hr(cls, conn: sqlite3.Connection, tz, timezone_name: str, daily: dict[str, dict[str, Any]]) -> None:
        rows = conn.execute('SELECT day, resting_heart_rate FROM resting_hr ORDER BY day').fetchall()
        for row in rows:
            local_date = _parse_day(row['day'], tz)
            if not local_date:
                continue
            rhr = _nullable_int(row['resting_heart_rate'])
            if rhr is None or rhr <= 0:
                continue
            entry = cls._ensure_day(daily, local_date, timezone_name)
            if entry.get('restingHeartRateBpm') is None:
                entry['restingHeartRateBpm'] = rhr

    @classmethod
    def _load_activities(
        cls,
        path: Path,
        tz: ZoneInfo,
        metric: bool,
        activities: list[dict[str, Any]],
        warnings: list[dict[str, str]],
    ) -> None:
        conn = _connect(path)
        try:
            if not _has_columns(conn, 'activities', ('activity_id', 'start_time')):
                warnings.append({
                    'code': 'ACTIVITIES_UNSUPPORTED',
                    'date': '',
                    'message': 'Activities table schema is not supported.',
                })
                return
            rows = conn.execute(
                '''SELECT activity_id, sport, sub_sport, type, name, start_time, elapsed_time, distance, avg_hr, max_hr
                   FROM activities ORDER BY start_time'''
            ).fetchall()
            seen: set[str] = set()
            for row in rows:
                activity_id = str(row['activity_id']).strip()
                if not activity_id:
                    continue
                source_id = f'garmin:{activity_id}'
                if source_id in seen:
                    warnings.append({
                        'code': 'DUPLICATE_ACTIVITY',
                        'date': '',
                        'message': f'Duplicate activity ID {activity_id} in GarminDB.',
                    })
                    continue
                seen.add(source_id)
                started = _to_iso(row['start_time'], tz)
                if not started:
                    continue
                item: dict[str, Any] = {
                    'sourceActivityId': source_id,
                    'type': _activity_type(row),
                    'startedAt': started,
                }
                duration = _time_to_seconds(row['elapsed_time'])
                if duration is not None and duration > 0:
                    item['durationSeconds'] = duration
                distance = _metric_distance_meters(row['distance'], metric)
                if distance is not None:
                    item['distanceMeters'] = distance
                avg_hr = _nullable_int(row['avg_hr'])
                if avg_hr is not None and avg_hr > 0:
                    item['averageHeartRateBpm'] = avg_hr
                max_hr = _nullable_int(row['max_hr'])
                if max_hr is not None and max_hr > 0:
                    item['maximumHeartRateBpm'] = max_hr
                activities.append(item)
        finally:
            conn.close()
