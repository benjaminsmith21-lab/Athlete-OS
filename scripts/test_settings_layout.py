from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_settings_accordion_markup():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'renderSettingsAccordion' in app
    assert 'settings-accordion' in app
    assert '<details class="settings-group settings-accordion">' in app
    assert 'settings-accordion-summary' in app
    assert 'settings-accordion-meta' in app
    assert '.settings-accordion-summary' in css
    assert '.settings-accordion-meta' in css


def test_settings_section_order():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    anchor = app.index('const appearanceMeta = getThemeName')
    settings_block = app[anchor:anchor + 12000]
    rest_ex = settings_block.index('Rest between exercises')
    appearance = settings_block.index("renderSettingsAccordion('Appearance'")
    training = settings_block.index('settings-group-title">Training')
    completed = settings_block.index("renderSettingsAccordion('Completed Workouts'")
    backup = settings_block.index("renderSettingsAccordion('Data & Backup'")
    about = settings_block.index("renderSettingsAccordion('About'")
    assert rest_ex < appearance < training < completed < backup < about


def test_training_section_includes_weight_and_form_tips():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    anchor = app.index('settings-group-title">Training')
    training_block = app[anchor:anchor + 1800]
    assert 'Weight unit' in training_block
    assert 'toggle-form-tips' in training_block
    assert 'data-unit="kg"' in training_block
    assert training_block.index('Weight unit') < training_block.index('toggle-form-tips')


def test_settings_about_section():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert "renderSettingsAccordion('About'" in app
    assert 'renderAboutBodyHtml' in app
    assert "Trust what you've already decided." in app
    assert 'Built by Ben, shared with people he loves.' in app
    assert '.settings-about-lead' in css


def test_settings_accordion_meta():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    theme = (ROOT / 'js/services/theme.js').read_text(encoding='utf-8')
    assert 'getThemeName' in theme
    assert 'export function getThemeName' in theme
    assert 'appearanceMeta = getThemeName' in app
    assert 'completedWorkoutsMeta' in app
    assert 'backupMeta' in app
    assert 'Last export:' in app


if __name__ == '__main__':
    test_settings_accordion_markup()
    test_settings_section_order()
    test_training_section_includes_weight_and_form_tips()
    test_settings_about_section()
    test_settings_accordion_meta()
    print('All settings layout tests passed.')
