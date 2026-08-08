import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_workout_summary_module_exported():
    text = (ROOT / 'js/services/workoutSummary.js').read_text(encoding='utf-8')
    assert 'export function buildCompletionHighlights' in text
    assert 'export function computeSessionTonnage' in text
    assert 'export function detectExercisePersonalBests' in text
    assert 'export function detectFastestOperation' in text


def test_complete_highlights_css():
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert '.complete-highlights' in css
    assert '.complete-badge--pr' in css
    assert '.complete-title' in css
    assert 'font-family: var(--font-display)' in css.split('.complete-title {', 1)[1][:120]


def test_warmup_display_fonts():
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert '.warmup-title {' in css
    assert '.warmup-rx {' in css
    block_start = css.index('.warmup-title {')
    block = css[block_start:block_start + 180]
    assert 'font-family: var(--font-display)' in block
    rx_start = css.index('.warmup-rx {')
    rx_block = css[rx_start:rx_start + 120]
    assert 'font-family: var(--font-display)' in rx_block


def test_goldeneye_warmup_font_sizes():
    css = (ROOT / 'css/themes.css').read_text(encoding='utf-8')
    assert '[data-theme="goldeneye"] .warmup-title' in css
    assert '[data-theme="goldeneye"] .dial-value' in css
    assert '[data-theme="goldeneye"] .complete-badge' in css


def test_render_complete_wires_highlights():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert "import { buildCompletionHighlights } from './services/workoutSummary.js'" in app
    assert 'renderCompleteHighlightsHtml' in app
    assert 'buildCompletionHighlights({' in app


def test_language_style_complete_copy():
    text = (ROOT / 'js/services/languageStyle.js').read_text(encoding='utf-8')
    assert 'completeNewBest' in text
    assert 'completeFastestSession' in text
    assert 'completeExerciseCount' in text


def test_sw_precaches_workout_summary():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert './js/services/workoutSummary.js' in sw
    assert 'athlete-os-v68' in sw


if __name__ == '__main__':
    test_workout_summary_module_exported()
    test_complete_highlights_css()
    test_warmup_display_fonts()
    test_goldeneye_warmup_font_sizes()
    test_render_complete_wires_highlights()
    test_language_style_complete_copy()
    test_sw_precaches_workout_summary()
    print('All workout summary tests passed.')
