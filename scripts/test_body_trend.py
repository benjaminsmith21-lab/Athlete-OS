"""Unit tests mirroring js/services/bodyTrend.js and bodyMeasurement validation logic."""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

OUTLIER_THRESHOLD_KG = 4
SOFT_MIN_KG = 70
SOFT_MAX_KG = 150


def add_days(date_str: str, days: int) -> str:
    d = date.fromisoformat(date_str)
    return (d + timedelta(days=days)).isoformat()


def days_between(start_str: str, end_str: str) -> int:
    return (date.fromisoformat(end_str) - date.fromisoformat(start_str)).days


def is_trend_eligible(measurement: dict) -> bool:
    if not measurement or measurement.get('excludeFromTrend'):
        return False
    if measurement.get('isConfirmedOutlier') is False:
        return True
    if measurement.get('isConfirmedOutlier') is True and not measurement.get('excludeFromTrend'):
        return True
    return measurement.get('isConfirmedOutlier') is not True


def sort_measurements(measurements: list[dict]) -> list[dict]:
    return sorted(measurements, key=lambda m: m['date'])


def calculate_rolling_average(measurements: list[dict], end_date: str, days: int) -> dict:
    eligible = sort_measurements([m for m in measurements if is_trend_eligible(m)])
    if not eligible:
        return {'average': None, 'count': 0, 'provisional': True}

    start_date = add_days(end_date, -(days - 1))
    in_window = [m for m in eligible if start_date <= m['date'] <= end_date]
    if not in_window:
        return {'average': None, 'count': 0, 'provisional': True}

    avg = round(sum(m['weightKg'] for m in in_window) / len(in_window), 1)
    return {'average': avg, 'count': len(in_window), 'provisional': len(in_window) < days}


def get_thirty_day_change(measurements: list[dict], end_date: str) -> dict:
    current = calculate_rolling_average(measurements, end_date, 7)
    if current['average'] is None:
        return {'change': None, 'insufficient': True}

    previous_start = add_days(end_date, -30)
    previous_end = add_days(end_date, -24)
    eligible = sort_measurements([m for m in measurements if is_trend_eligible(m)])
    previous_window = [m for m in eligible if previous_start <= m['date'] <= previous_end]
    if len(previous_window) < 3:
        return {'change': None, 'insufficient': True}

    prev_avg = sum(m['weightKg'] for m in previous_window) / len(previous_window)
    return {'change': round(current['average'] - prev_avg, 1), 'insufficient': False}


def detect_potential_outlier(weight_kg: float, measurements: list[dict], end_date: str) -> dict:
    result = calculate_rolling_average(measurements, end_date, 7)
    average, count = result['average'], result['count']
    if average is None or count < 2:
        return {'isOutlier': False, 'recentAverage': None}
    diff = abs(weight_kg - average)
    return {
        'isOutlier': diff > OUTLIER_THRESHOLD_KG,
        'recentAverage': average,
        'diff': round(diff, 1),
    }


def get_weight_trend_direction(measurements: list[dict], end_date: str, campaign: dict | None) -> str:
    current = calculate_rolling_average(measurements, end_date, 7)
    if current['count'] < 3:
        return 'insufficient_data'

    thirty = get_thirty_day_change(measurements, end_date)
    if thirty['insufficient'] or thirty['change'] is None:
        return 'insufficient_data'

    weekly_rate = thirty['change'] / (30 / 7)
    expected = (campaign or {}).get('bodyMetrics', {}).get('expectedWeeklyChangeKg')

    if abs(weekly_rate) < 0.05:
        return 'stable'
    if weekly_rate < 0:
        if expected and weekly_rate < expected['min'] * 1.5:
            return 'falling_quickly'
        if expected and expected['min'] <= weekly_rate <= expected['max']:
            return 'falling_on_target'
        return 'falling_slowly'
    if weekly_rate > 0.3:
        return 'rising_quickly'
    return 'rising_slowly'


def validate_measurement_input(weight_kg, body_fat=None) -> dict:
    errors = []
    if weight_kg == '' or weight_kg is None:
        errors.append('Weight is required.')
    else:
        try:
            w = float(weight_kg)
        except (TypeError, ValueError):
            errors.append('Weight is required.')
            w = None
        if w is not None:
            if w <= 0:
                errors.append('Weight must be greater than zero.')
            else:
                w = round(w, 1)
                soft = w < SOFT_MIN_KG or w > SOFT_MAX_KG
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'softRangeWarning': soft if not errors else None,
        'parsedWeight': w if not errors else None,
    }


def test_validation_rejects_invalid():
    assert not validate_measurement_input('')['valid']
    assert not validate_measurement_input(None)['valid']
    assert not validate_measurement_input('abc')['valid']
    assert not validate_measurement_input(0)['valid']
    assert not validate_measurement_input(-5)['valid']


def test_validation_accepts_valid():
    result = validate_measurement_input(82.3)
    assert result['valid']
    assert result['parsedWeight'] == 82.3


def test_soft_range_warning():
    result = validate_measurement_input(65)
    assert result['valid']
    assert result['softRangeWarning']


def test_rolling_average_with_gaps():
    measurements = [
        {'date': '2026-01-01', 'weightKg': 80.0},
        {'date': '2026-01-03', 'weightKg': 82.0},
        {'date': '2026-01-05', 'weightKg': 84.0},
    ]
    result = calculate_rolling_average(measurements, '2026-01-05', 7)
    assert result['average'] == 82.0
    assert result['provisional'] is True


def test_rolling_average_excludes_outliers():
    measurements = [
        {'date': '2026-01-01', 'weightKg': 80.0},
        {'date': '2026-01-02', 'weightKg': 80.5},
        {'date': '2026-01-03', 'weightKg': 80.2, 'excludeFromTrend': True},
    ]
    result = calculate_rolling_average(measurements, '2026-01-03', 7)
    assert result['average'] == 80.2
    assert result['count'] == 2


def test_thirty_day_change_insufficient():
    measurements = [{'date': '2026-01-01', 'weightKg': 80.0}]
    result = get_thirty_day_change(measurements, '2026-01-01')
    assert result['insufficient'] is True


def test_thirty_day_change_with_data():
    measurements = []
    for i in range(35):
        d = add_days('2026-01-01', i)
        measurements.append({'date': d, 'weightKg': 90.0 - i * 0.1})
    result = get_thirty_day_change(measurements, add_days('2026-01-01', 34))
    assert result['insufficient'] is False
    assert result['change'] is not None
    assert result['change'] < 0


def test_outlier_detection():
    measurements = [
        {'date': '2026-01-01', 'weightKg': 80.0},
        {'date': '2026-01-02', 'weightKg': 80.5},
        {'date': '2026-01-03', 'weightKg': 80.2},
    ]
    normal = detect_potential_outlier(80.3, measurements, '2026-01-03')
    assert normal['isOutlier'] is False

    outlier = detect_potential_outlier(90.0, measurements, '2026-01-03')
    assert outlier['isOutlier'] is True


def test_trend_direction_insufficient():
    measurements = [{'date': '2026-01-01', 'weightKg': 80.0}]
    assert get_weight_trend_direction(measurements, '2026-01-01', None) == 'insufficient_data'


def test_upsert_same_date_logic():
    """One record per date — simulated by dict keyed by date."""
    store: dict[str, dict] = {}
    record = {'date': '2026-01-01', 'weightKg': 80.0, 'id': 'body-1'}
    store[record['date']] = record
    updated = {**store['2026-01-01'], 'weightKg': 79.5}
    store['2026-01-01'] = updated
    assert len(store) == 1
    assert store['2026-01-01']['weightKg'] == 79.5


def test_melbourne_date_in_source():
    text = (ROOT / 'js/utils/datetime.js').read_text(encoding='utf-8')
    assert 'Australia/Melbourne' in text
    assert 'en-CA' in text


def test_body_trend_js_exports():
    text = (ROOT / 'js/services/bodyTrend.js').read_text(encoding='utf-8')
    for fn in [
        'calculateRollingAverage',
        'getThirtyDayChange',
        'getCampaignWeightChange',
        'getWeightTrendDirection',
        'detectPotentialOutlier',
    ]:
        assert fn in text


def test_db_v4_body_and_garmin_stores():
    text = (ROOT / 'js/db.js').read_text(encoding='utf-8')
    assert 'DB_VERSION = 5' in text
    assert 'bodyMeasurements' in text
    assert 'dailyHealth' in text
    assert 'garminActivities' in text


def test_blueprint_body_metrics():
    text = (ROOT / 'js/seed/blueprint-v1.js').read_text(encoding='utf-8')
    assert 'bodyMetrics' in text
    assert 'expectedWeeklyChangeKg' in text


if __name__ == '__main__':
    tests = [
        test_validation_rejects_invalid,
        test_validation_accepts_valid,
        test_soft_range_warning,
        test_rolling_average_with_gaps,
        test_rolling_average_excludes_outliers,
        test_thirty_day_change_insufficient,
        test_thirty_day_change_with_data,
        test_outlier_detection,
        test_trend_direction_insufficient,
        test_upsert_same_date_logic,
        test_melbourne_date_in_source,
        test_body_trend_js_exports,
        test_db_v4_body_and_garmin_stores,
        test_blueprint_body_metrics,
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
    print(f'All {len(tests)} body trend tests passed')
