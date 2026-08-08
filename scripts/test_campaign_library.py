"""Tests for campaign library, prescription engine, and builder wiring."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_tracking_types_extended():
    text = (ROOT / 'js/services/trackingTypes.js').read_text(encoding='utf-8')
    assert 'weighted_timed' in text
    assert 'weighted_distance' in text
    assert 'getPrescriptionFieldIds' in text


def test_campaign_prescription_exports():
    text = (ROOT / 'js/services/campaignPrescription.js').read_text(encoding='utf-8')
    for symbol in [
        'validatePrescription',
        'compileWeeklyMissionToBlueprint',
        'compilePrescriptionToMissionExercise',
        'createDefaultWarmupSection',
        'SECTION_TYPES',
        'OPERATION_OTHER',
        'getOperationLabel',
        'normalizeDaySections'
    ]:
        assert symbol in text, f'Missing {symbol}'
    assert "'accessory'" not in text.split('SECTION_TYPES')[1].split(']')[0]


def test_campaign_library_service():
    text = (ROOT / 'js/services/campaignLibrary.js').read_text(encoding='utf-8')
    for symbol in [
        'createCampaign',
        'duplicateCampaign',
        'duplicateDay',
        'duplicateDayToCampaign',
        'duplicatePrescription',
        'activateCampaign',
        'saveActiveCampaignEdits',
        'migrateLegacyCampaignIfNeeded',
        'CAMPAIGN_STATUS',
        'listEditableCampaigns'
    ]:
        assert symbol in text, f'Missing {symbol}'


def test_campaign_ux_fixes():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    library = (ROOT / 'js/ui/campaignLibrary.js').read_text(encoding='utf-8')
    builder = (ROOT / 'js/ui/campaignBuilder.js').read_text(encoding='utf-8')
    tracking = (ROOT / 'js/services/trackingTypes.js').read_text(encoding='utf-8')
    settings = (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'confirmActivateCampaignReplace' in library
    assert 'needsReplace' in library
    assert 'openReplaceActiveCampaignOverlay' in app
    assert 'restBetweenSetsEnabled' in settings
    assert 'Complete Set' in app
    assert 'getPrescriptionFieldLabel' in tracking
    assert 'Rest between sets (sec)' in tracking
    assert 'library-field-row' in builder
    assert 'saveActiveCampaignEdits' in builder
    assert 'builder-active-banner' in css
    assert 'currentX <= -threshold && hasNext' in app
    assert 'horizontal = false' not in app.split('function bindDaySummarySwipe')[1].split('function bindExerciseSwipe')[0]


def test_builder_ux_polish():
    builder = (ROOT / 'js/ui/campaignBuilder.js').read_text(encoding='utf-8')
    library = (ROOT / 'js/ui/campaignLibrary.js').read_text(encoding='utf-8')
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')
    assert 'window.prompt' not in builder
    assert 'builder-day-actions' in builder
    assert 'builder-operation-custom' in builder
    assert 'OPERATION_OTHER' in builder
    assert 'openEndCampaignConfirm' in library
    assert 'openEndCampaignConfirm' in app
    assert 'End Campaign?' in app
    assert '.builder-day-actions' in css
    assert '.duplicate-day-grid' in css


def test_db_and_settings():
    db = (ROOT / 'js/db.js').read_text(encoding='utf-8')
    settings = (ROOT / 'js/services/settings.js').read_text(encoding='utf-8')
    assert 'const DB_VERSION = 7' in db
    assert 'activeCampaignId' in settings
    assert 'scheduledCampaignId' in settings


def test_backup_schema():
    backup = (ROOT / 'js/services/backup.js').read_text(encoding='utf-8')
    assert 'BACKUP_SCHEMA_VERSION = 5' in backup


def test_ui_modules():
    app = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert 'openCampaignLibrary' in app
    assert 'initCampaignLibraryUI' in app
    assert 'initCampaignBuilderUI' in app
    assert 'getWarmupSteps' in app
    assert 'btn-open-campaign-library' in app
    assert (ROOT / 'js/ui/campaignLibrary.js').exists()
    assert (ROOT / 'js/ui/campaignBuilder.js').exists()
    assert (ROOT / 'js/ui/exercisePicker.js').exists()


def test_campaign_refactor():
    campaign = (ROOT / 'js/services/campaign.js').read_text(encoding='utf-8')
    mission = (ROOT / 'js/services/mission.js').read_text(encoding='utf-8')
    assert 'getActiveCampaignId' in campaign
    assert 'getActiveCampaignId' in mission
    assert 'CAMPAIGN_ID' not in mission


if __name__ == '__main__':
    test_tracking_types_extended()
    test_campaign_prescription_exports()
    test_campaign_library_service()
    test_campaign_ux_fixes()
    test_db_and_settings()
    test_backup_schema()
    test_ui_modules()
    test_campaign_refactor()
    test_builder_ux_polish()
    print('Campaign library tests passed')
