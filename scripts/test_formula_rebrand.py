from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def test_manifest_formula_brand():
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    assert manifest['name'] == 'Formula'
    assert manifest['short_name'] == 'Formula'
    assert manifest['background_color'] == '#000000'


def test_index_formula_brand():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert '<title>Formula</title>' in html
    assert 'apple-mobile-web-app-title" content="Formula"' in html
    assert 'icons/icon.svg' in html
    assert '&#402;' in html


def test_icon_assets():
    assert (ROOT / 'icons/icon.svg').exists()
    assert (ROOT / 'icons/icon-192.png').exists()
    assert (ROOT / 'icons/icon-512.png').exists()
    svg = (ROOT / 'icons/icon.svg').read_text(encoding='utf-8')
    assert '#000000' in svg
    assert '#8fd464' in svg


def test_sw_includes_formula_icons():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert './icons/icon.svg' in sw
    assert 'athlete-os-v68' in sw


def test_user_facing_copy():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    backup = (ROOT / 'js/services/backup.js').read_text(encoding='utf-8')
    assert 'reinstalled Formula' in app
    assert 'Formula backup' in backup
    assert 'Athlete OS' not in app.replace('athlete-os', '')


if __name__ == '__main__':
    test_manifest_formula_brand()
    test_index_formula_brand()
    test_icon_assets()
    test_sw_includes_formula_icons()
    test_user_facing_copy()
    print('All Formula rebrand tests passed.')
