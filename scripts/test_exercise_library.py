"""Tests for exercise library seed, services, search, and backup integration."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LEGACY_IDS = [
    'zone-2-run', 'ocean-dip', 'ring-hangs', 'scap-pulls', 'halos', 'scaption', 'serratus',
    'bottom-up-carry', 'goblet-squat', 'row', 'rear-delt-raise', 'face-pull', 'ring-rows',
    'push-up-plus', 'bulgarian-split-squat', 'single-leg-rdl', 'swings', 'farmer-carry',
    'band-pulldown', 'easy-run', 'tempo-run', 'run-club', 'hangs-optional', 'walk',
    'mobility', 'family', 'warmup-halos', 'warmup-bottom-up-carry', 'warmup-kb-flow'
]


def _seed_root():
    return ROOT / 'js' / 'seed' / 'exercises'


def _all_seed_text():
    parts = []
    for path in sorted(_seed_root().glob('*.js')):
        if path.name in {'helpers.js', 'index.js'}:
            continue
        parts.append(path.read_text(encoding='utf-8'))
    return '\n'.join(parts)


def _seed_ids():
    text = (ROOT / 'js/seed/exercises/index.js').read_text(encoding='utf-8')
    modules = [
        'LEGACY_V1', 'SQUAT_LUNGE', 'HINGE', 'PUSH_HORIZONTAL', 'PUSH_VERTICAL',
        'PULL_HORIZONTAL', 'PULL_VERTICAL', 'CARRY', 'CORE', 'SHOULDER_STABILITY',
        'MOBILITY', 'RUNNING', 'CONDITIONING'
    ]
    for module in modules:
        assert module in text, f'Missing seed module {module}'

    ids = re.findall(r"ex\('([^']+)'", _all_seed_text())
    return ids


def test_tracking_types_exports():
    text = (ROOT / 'js/services/trackingTypes.js').read_text(encoding='utf-8')
    for symbol in ['TRACKING_TYPES', 'isValidTrackingType', 'getTrackingTypeLabel']:
        assert symbol in text, f'Missing {symbol} in trackingTypes.js'
    assert 'weighted_reps' in text
    assert 'timed' in text


def test_exercise_library_seed_size_and_legacy_ids():
    ids = _seed_ids()
    assert len(ids) >= 120, f'Expected >=120 seed exercises, got {len(ids)}'
    assert len(ids) == len(set(ids)), 'Duplicate seed IDs found'
    for legacy_id in LEGACY_IDS:
        assert legacy_id in ids, f'Missing legacy ID {legacy_id}'


def test_exercise_library_service_exports():
    text = (ROOT / 'js/services/exerciseLibrary.js').read_text(encoding='utf-8')
    for symbol in [
        'seedExerciseLibraryIfNeeded',
        'createExercise',
        'updateExercise',
        'archiveExercise',
        'searchExercises',
        'mergeExerciseLibraryOnRestore',
        'normalizeExerciseRecord',
        'getExerciseDisplayMeta',
        'exercise-library-seed-v2'
    ]:
        assert symbol in text, f'Missing {symbol} in exerciseLibrary.js'


def test_search_module_exports():
    text = (ROOT / 'js/services/exerciseSearch.js').read_text(encoding='utf-8')
    for symbol in [
        'normalizeSearchText',
        'buildSearchHaystack',
        'scoreExerciseMatch',
        'searchAndRankExercises'
    ]:
        assert symbol in text, f'Missing {symbol} in exerciseSearch.js'


def test_schema_and_preferences():
    schema = (ROOT / 'js/services/exerciseSchema.js').read_text(encoding='utf-8')
    prefs = (ROOT / 'js/services/exercisePreferences.js').read_text(encoding='utf-8')
    settings = (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    assert 'normalizeExerciseRecord' in schema
    assert 'mergeSeedMetadata' in schema
    assert 'technique' in schema
    assert 'toggleFavoriteExercise' in prefs
    assert 'recordRecentExercise' in prefs
    assert 'MAX_RECENT_EXERCISES' in prefs
    assert 'favoriteExerciseIds' in settings
    assert 'recentExerciseIds' in settings
    assert 'showFormTips: true' in settings


def test_search_metadata_in_seed():
    seed = _all_seed_text()
    assert "'goblet-squat'" in seed or "ex('goblet-squat'" in seed
    assert 'aliases' in seed
    assert 'keywords' in seed
    assert 'technique' in seed
    assert "'RDL'" in seed or '"RDL"' in seed
    assert 'legs' in seed
    assert 'grip' in seed
    assert 'rehab' in seed
    assert 'kettlebell' in seed.lower() or 'Kettlebell' in seed


def test_db_store_and_backup():
    db = (ROOT / 'js/db.js').read_text(encoding='utf-8')
    backup = (ROOT / 'js/services/backup.js').read_text(encoding='utf-8')
    assert 'exerciseLibrary' in db
    assert "const DB_VERSION = 7" in db
    assert 'exerciseLibrary' in backup
    assert 'BACKUP_SCHEMA_VERSION = 5' in backup
    assert 'mergeExerciseLibraryOnRestore' in backup


def test_app_wires_library_ui():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    ui = (ROOT / 'js/ui/exerciseLibrary.js').read_text(encoding='utf-8')
    picker = (ROOT / 'js/ui/exercisePicker.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'seedExerciseLibraryIfNeeded' in app
    assert 'btn-open-exercise-library' in app
    assert 'renderExerciseFormCues' in app
    assert 'getLibraryExerciseForMission' in app
    assert 'buildTechnique' in app
    assert 'recordRecentExercise' in app
    assert 'field-manual' in ui
    assert 'toggleFavoriteExercise' in ui
    assert 'recordRecentExercise' in picker
    assert 'partitionExerciseSections' in picker
    assert '.exercise-form-cues' in css
    assert '.exercise-card--form-expanded' in css
    assert '.exercise-name + .exercise-set-label' in css
    assert '.library-fav-btn' in css


def test_form_cues_render_logic():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert 'if (!technique) return' in app
    assert 'SETUP_PREVIEW_MAX' in app
    assert 'cues.slice(0, 2)' in app
    assert 'truncateSetup' in app
    assert 'commonMistakes' in app
    assert 'Boolean(expandedHtml.trim())' in app
    assert 'showFormTips' in app
    assert 'toggle-form-tips' in app
    assert 'if (!cues.length) return' not in app


def test_bottom_up_carry_merged():
    legacy = (ROOT / 'js/seed/exercises/legacy-v1.js').read_text(encoding='utf-8')
    shoulder = (ROOT / 'js/seed/exercises/shoulder-stability.js').read_text(encoding='utf-8')
    library = (ROOT / 'js/services/exerciseLibrary.js').read_text(encoding='utf-8')
    assert "ex('bottom-up-carry'" in legacy
    assert 'bottom-up hold' in legacy
    assert "ex('bottom-up-hold'" not in shoulder
    assert 'RETIRED_LIBRARY_ALIASES' in library
    assert "'bottom-up-hold': 'bottom-up-carry'" in library


def test_progression_uses_library_map():
    text = (ROOT / 'js/services/progressionCoach.js').read_text(encoding='utf-8')
    assert 'getLibraryIdForLegacyInstance' in text
    assert 'ring-hangs' in text


def test_sw_version():
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    assert 'athlete-os-v64' in sw
    assert 'exerciseSearch.js' in sw
    assert 'exerciseSchema.js' in sw


if __name__ == '__main__':
    test_tracking_types_exports()
    test_exercise_library_seed_size_and_legacy_ids()
    test_exercise_library_service_exports()
    test_search_module_exports()
    test_schema_and_preferences()
    test_search_metadata_in_seed()
    test_db_store_and_backup()
    test_app_wires_library_ui()
    test_form_cues_render_logic()
    test_bottom_up_carry_merged()
    test_progression_uses_library_map()
    test_sw_version()
    print('Exercise library tests passed')
