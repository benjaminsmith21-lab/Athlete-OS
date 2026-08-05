"""Unit tests mirroring js/services/garminTrend.js rolling-average logic."""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def add_days(date_str: str, days: int) -> str:
    d = date.fromisoformat(date_str)
    return (d + timedelta(days=days)).isoformat()


def sort_daily_health(records: list[dict]) -> list[dict]:
    return sorted(records, key=lambda r: r['localDate'])


def values_in_window(records: list[dict], end_date: str, days: int, getter) -> list[float]:
    start_date = add_days(end_date, -(days - 1))
    return [
        getter(r)
        for r in sort_daily_health(records)
        if start_date <= r['localDate'] <= end_date and getter(r) is not None
    ]


def calculate_rolling_average(records: list[dict], end_date: str, days: int, getter) -> dict:
    values = values_in_window(records, end_date, days, getter)
    if not values:
        return {'average': None, 'count': 0, 'provisional': True}
    avg = round(sum(values) / len(values), 1)
    return {'average': avg, 'count': len(values), 'provisional': len(values) < days}


def get_sleep_seven_day_average(records: list[dict], end_date: str) -> dict:
    return calculate_rolling_average(
        records, end_date, 7, lambda r: (r.get('sleep') or {}).get('totalSeconds')
    )


def get_rhr_seven_day_average(records: list[dict], end_date: str) -> dict:
    return calculate_rolling_average(records, end_date, 7, lambda r: r.get('restingHeartRateBpm'))


def get_recent_daily_health(records: list[dict], end_date: str) -> dict | None:
    by_date = {r['localDate']: r for r in records}
    return (
        by_date.get(end_date)
        or by_date.get(add_days(end_date, -1))
        or (sort_daily_health(records)[-1] if records else None)
    )


def format_sleep_duration(total_seconds: int | float | None) -> str | None:
    if total_seconds is None or total_seconds <= 0:
        return None
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    if hours > 0:
        return f'{hours}h {minutes}m'
    return f'{minutes}m'


def build_recovery_teaser_line(records: list[dict], end_date: str) -> str | None:
    recent = get_recent_daily_health(records, end_date)
    if not recent:
        return None
    parts = []
    sleep = format_sleep_duration((recent.get('sleep') or {}).get('totalSeconds'))
    if sleep:
        parts.append(f'Last night: {sleep}')
    rhr = recent.get('restingHeartRateBpm')
    if rhr is not None:
        parts.append(f'RHR {rhr} bpm')
    return ' · '.join(parts) if parts else None


def make_record(local_date: str, sleep_seconds: int | None = None, rhr: int | None = None) -> dict:
    record: dict = {'localDate': local_date}
    if sleep_seconds is not None:
        record['sleep'] = {'totalSeconds': sleep_seconds}
    if rhr is not None:
        record['restingHeartRateBpm'] = rhr
    return record


def test_sleep_seven_day_average_full_window():
    end = '2026-08-05'
    records = [make_record(add_days(end, -i), sleep_seconds=25200 + i * 60) for i in range(7)]
    result = get_sleep_seven_day_average(records, end)
    assert result['count'] == 7
    assert result['provisional'] is False
    assert result['average'] == round(sum(25200 + i * 60 for i in range(7)) / 7, 1)


def test_sleep_seven_day_average_provisional():
    end = '2026-08-05'
    records = [make_record(add_days(end, -i), sleep_seconds=25200) for i in range(3)]
    result = get_sleep_seven_day_average(records, end)
    assert result['count'] == 3
    assert result['provisional'] is True
    assert result['average'] == 25200.0


def test_rhr_seven_day_average_ignores_missing():
    end = '2026-08-05'
    records = [
        make_record(add_days(end, -2), rhr=52),
        make_record(add_days(end, -1), rhr=54),
        make_record(end, rhr=53),
    ]
    result = get_rhr_seven_day_average(records, end)
    assert result['average'] == 53.0
    assert result['count'] == 3
    assert result['provisional'] is True


def test_get_recent_daily_health_prefers_today_then_yesterday():
    end = '2026-08-05'
    yesterday = add_days(end, -1)
    records = [
        make_record(yesterday, sleep_seconds=24000, rhr=55),
        make_record(end, sleep_seconds=26000, rhr=52),
    ]
    assert get_recent_daily_health(records, end)['localDate'] == end
    records_only_yesterday = [make_record(yesterday, rhr=55)]
    assert get_recent_daily_health(records_only_yesterday, end)['localDate'] == yesterday


def test_build_recovery_teaser_line():
    end = '2026-08-05'
    records = [make_record(end, sleep_seconds=25920, rhr=52)]
    line = build_recovery_teaser_line(records, end)
    assert line == 'Last night: 7h 12m · RHR 52 bpm'


def test_empty_records():
    end = '2026-08-05'
    assert get_sleep_seven_day_average([], end)['average'] is None
    assert build_recovery_teaser_line([], end) is None


def test_js_module_exists():
    text = (ROOT / 'js/services/garminTrend.js').read_text(encoding='utf-8')
    assert 'getSleepSevenDayAverage' in text
    assert 'buildRecoveryTeaserLine' in text


if __name__ == '__main__':
    test_sleep_seven_day_average_full_window()
    test_sleep_seven_day_average_provisional()
    test_rhr_seven_day_average_ignores_missing()
    test_get_recent_daily_health_prefers_today_then_yesterday()
    test_build_recovery_teaser_line()
    test_empty_records()
    test_js_module_exists()
    print('All garmin trend tests passed')
