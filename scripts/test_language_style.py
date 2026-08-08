"""Tests for selectable language style (Tactical / Standard)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_default_settings_language_style():
    text = (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    assert "languageStyle: 'standard'" in text


def test_language_style_module():
    text = (ROOT / 'js/services/languageStyle.js').read_text(encoding='utf-8')
    assert "DEFAULT_LANGUAGE_STYLE = LANGUAGE_STYLES.STANDARD" in text
    assert 'if (value === LANGUAGE_STYLES.TACTICAL)' in text
    for symbol in ['export const COPY', 'export function t', 'setLanguageStyle', 'ratingLabelForStyle', 'chartRangeLabel', 'exerciseCountLabel']:
        assert symbol in text, f'Missing {symbol}'

    mappings = [
        ("commandCentre", "Command Centre", "Home"),
        ("fdsWorkout", "FDS Workout", "Quick Workout"),
        ("abortMission", "Abort Mission", "End Workout"),
        ("fieldManual", "Field Manual", "Exercise Guide"),
        ("integrity", "Integrity", "Consistency"),
    ]
    for key, tactical, standard in mappings:
        assert f"{key}:" in text
        assert f"tactical: '{tactical}'" in text or f'tactical: "{tactical}"' in text
        assert f"standard: '{standard}'" in text or f'standard: "{standard}"' in text

    assert "standard: 'Show up for'" in text
    assert "'exercise' : 'exercises'" not in text
    assert "return count === 1 ? 'exercise' : 'exercises'" in text


def test_app_wires_language_style():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert "from './services/languageStyle.js'" in app
    assert 'exerciseCountLabel' in app
    assert 'data-language-style' in app
    assert "t('languageStyleTitle')" in app
    assert 'language-style-hints' in app
    assert 'refreshCurrentScreen' in app
    assert 'exerciseCountLabel' in app


def test_briefing_and_fds_fixes():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    coach = (ROOT / 'js/services/coach.js').read_text(encoding='utf-8')
    assert 'openFdsWarmupPrompt' in app
    assert 'skipFdsWarmupAndStart' in app
    assert 'shouldShowWarmup()' in app
    assert 'Briefing render failed' in app
    assert 'campaign?.identity?.length' in coach


def test_form_cues_and_settings_return():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'settingsReturnScreen' in app
    assert 'restorePreSettingsScreen' in app
    assert 'openSettingsFromScreen' in app
    assert 'exercise-card--form-expanded' in app
    assert 'exercise-card--form-expanded' in css
    assert 'max-height: 88px' not in css
    assert 'Boolean(expandedHtml.trim())' in app


def test_sw_includes_language_style():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert 'athlete-os-v68' in sw
    assert './js/services/languageStyle.js' in sw
