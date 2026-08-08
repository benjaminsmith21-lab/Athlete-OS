from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_default_theme_in_settings():
    text = (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    assert "theme: 'command-centre'" in text


def test_theme_service_exports():
    text = (ROOT / 'js/services/theme.js').read_text(encoding='utf-8')
    assert "export const DEFAULT_THEME = 'command-centre'" in text
    assert "export const THEMES" in text
    assert "'goldeneye'" in text
    assert "'red-alert'" in text
    assert 'RED_ALERT_BOOT_PENDING_KEY' in text


def test_goldeneye_font_split():
    css = (ROOT / 'css/themes.css').read_text(encoding='utf-8')
    assert "--font-display: 'Press Start 2P'" in css
    assert "--font-data: 'Consolas', 'Courier New', monospace" in css


def test_goldeneye_text_accent_effort_split():
    css = (ROOT / 'css/themes.css').read_text(encoding='utf-8')
    block_start = css.index('[data-theme="goldeneye"]')
    block = css[block_start:block_start + 900]
    assert '--color-bg: #0c100c' in block
    assert '--color-text: #6b9460' in block
    assert '--color-accent: #8fd464' in block
    assert '--color-effort: #b8ff78' in block
    assert '--color-recovery: #5eb8d4' in block
    assert '--color-hud-blue: #6ec8e8' in block
    assert block.index('--color-text') < block.index('--color-accent') < block.index('--color-effort')


def test_goldeneye_button_typography():
    css = (ROOT / 'css/themes.css').read_text(encoding='utf-8')
    assert '[data-theme="goldeneye"] .btn-primary' in css
    assert 'font-family: var(--font-display)' in css
    assert '[data-theme="goldeneye"] .btn-primary {\n  font-size: 10px;' in css
    assert '[data-theme="goldeneye"] .btn-secondary' in css
    assert '[data-theme="goldeneye"] .body-status-value' in css
    assert '[data-theme="goldeneye"] .mission-brief-operation' in css
    assert '[data-theme="goldeneye"] .mission-brief .status-complete' in css
    assert '[data-theme="goldeneye"] .week-strip-label' in css


def test_pre_paint_theme_script():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert "athlete-os-theme" in html
    assert 'data-theme' in html
    assert 'css/themes.css' in html


def test_theme_picker_in_settings():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert "renderThemePickerHtml" in app
    assert "renderSettingsAccordion('Appearance'" in app
    assert 'setAppTheme' in app


def test_red_alert_boot_capped():
    theme = (ROOT / 'js/services/theme.js').read_text(encoding='utf-8')
    assert '600' in theme
    assert 'RED_ALERT_BOOT_PENDING_KEY' in theme


def test_sw_includes_theme_assets():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert './css/themes.css' in sw
    assert './js/services/theme.js' in sw
    assert './fonts/PressStart2P-Regular.woff2' in sw
    assert 'athlete-os-v64' in sw


if __name__ == '__main__':
    test_default_theme_in_settings()
    test_theme_service_exports()
    test_goldeneye_font_split()
    test_goldeneye_text_accent_effort_split()
    test_goldeneye_button_typography()
    test_pre_paint_theme_script()
    test_theme_picker_in_settings()
    test_red_alert_boot_capped()
    test_sw_includes_theme_assets()
    print('All theme tests passed.')
