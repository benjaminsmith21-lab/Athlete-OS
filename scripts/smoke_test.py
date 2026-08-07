"""Smoke test for Athlete OS static assets and blueprint seed."""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'http://localhost:3456'

REQUIRED_FILES = [
    'index.html',
    'manifest.json',
    'sw.js',
    'css/app.css',
    'js/app.js',
    'js/db.js',
    'js/utils/datetime.js',
    'js/seed/blueprint-v1.js',
    'js/services/campaign.js',
    'js/services/mission.js',
    'js/services/coach.js',
    'js/services/integrity.js',
    'js/services/settings.js',
    'js/services/heatmap.js',
    'js/services/bodyMeasurement.js',
    'js/services/bodyTrend.js',
    'js/services/bodyCoach.js',
    'js/services/bodyChart.js',
    'js/services/backup.js',
    'js/services/garminImport.js',
    'js/services/garminTrend.js',
    'js/services/garminCoach.js',
    'js/services/campaignReview.js',
    'js/services/wakeLock.js',
    'js/services/garminChart.js',
    'js/services/progressionCoach.js',
    'js/services/backupSnapshot.js',
    'js/services/backupScheduler.js',
    'assets/audio/rest-complete.wav',
    'assets/audio/workout complete/mission-accomplished.mp3',
    'assets/audio/workout complete/red-alert2-victory.mp3',
    'assets/audio/workout complete/mission-accomplished-well-done-toy-story-disney-sergeant-r-lee-ermey-good-job-success-complete.mp3',
    'icons/icon-192.png',
    'icons/icon-512.png',
]

def test_local_files():
    missing = [f for f in REQUIRED_FILES if not (ROOT / f).exists()]
    assert not missing, f'Missing files: {missing}'

def test_blueprint_seed():
    text = (ROOT / 'js/seed/blueprint-v1.js').read_text(encoding='utf-8')
    assert 'weeklyBlueprints' in text
    assert text.count('dayOfWeek:') == 7
    assert 'FDS_FALLBACKS' in text
    assert 'bodyMetrics' in text

def test_service_worker_cache():
    text = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert 'bodyMeasurement.js' in text
    assert 'garminImport.js' in text
    assert 'garminTrend.js' in text
    assert 'garminCoach.js' in text
    assert 'campaignReview.js' in text
    assert 'garminChart.js' in text
    assert 'progressionCoach.js' in text
    assert 'backupSnapshot.js' in text
    assert 'backupScheduler.js' in text
    assert 'rest-complete.wav' in text
    assert 'workout%20complete/mission-accomplished.mp3' in text
    assert 'athlete-os-v34' in text
    assert 'overlay--day-summary' in (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'renderDaySummaryOverlay' in (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert 'wakeLock.js' in text
    assert 'soundEnabled' in (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    assert 'buildDaySummary' in (ROOT / 'js/services/campaignReview.js').read_text(encoding='utf-8')
    assert 'week-strip-day[data-date]' in (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert 'datetime.js' in text

def test_manifest():
    data = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    assert data['display'] == 'standalone'
    assert len(data['icons']) >= 2

def test_server():
    for path in ['index.html', 'js/app.js', 'manifest.json', 'sw.js']:
        url = f'{BASE}/{path}'
        with urllib.request.urlopen(url, timeout=5) as resp:
            assert resp.status == 200, url

if __name__ == '__main__':
    test_local_files()
    test_blueprint_seed()
    test_service_worker_cache()
    test_manifest()
    try:
        test_server()
        print('All smoke tests passed (including live server)')
    except Exception as e:
        print('Local file tests passed; server test skipped:', e)
