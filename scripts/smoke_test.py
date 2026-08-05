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
    'js/seed/blueprint-v1.js',
    'js/services/campaign.js',
    'js/services/mission.js',
    'js/services/coach.js',
    'js/services/integrity.js',
    'js/services/settings.js',
    'js/services/heatmap.js',
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
    test_manifest()
    try:
        test_server()
        print('All smoke tests passed (including live server)')
    except Exception as e:
        print('Local file tests passed; server test skipped:', e)
