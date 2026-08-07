"""Unit-style checks for campaign review and progression coach modules."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_campaign_review_exports():
    text = (ROOT / 'js/services/campaignReview.js').read_text(encoding='utf-8')
    for symbol in [
        'REVIEW_WEEKS',
        'isReviewWeek',
        'buildMilestones',
        'buildWeekStrip',
        'buildDaySummary',
        'buildCampaignReviewData',
        'extractMaxHangSeconds',
        'extractZone2Best',
    ]:
        assert symbol in text, f'Missing {symbol} in campaignReview.js'


def test_progression_coach_exports():
    text = (ROOT / 'js/services/progressionCoach.js').read_text(encoding='utf-8')
    assert 'getProgressionHints' in text
    assert 'formatExerciseHistoryRows' in text
    assert 'getLibraryIdForLegacyInstance' in text
    assert 'ring-hangs' in text
    assert 'zone-2-run' in text


def test_garmin_chart_exports():
    text = (ROOT / 'js/services/garminChart.js').read_text(encoding='utf-8')
    assert 'renderGarminChartSvg' in text
    assert 'getGarminChartDateRange' in text


def test_app_wires_review_screen():
    text = (ROOT / 'js/app.js').read_text(encoding='utf-8')
    assert 'renderCampaignReview' in text
    assert 'btn-campaign-review' in text
    assert 'week-strip' in text
    assert 'garmin-metric-control' in text
    assert 'adj-run-duration' in text
    assert 'buildMissionBriefCardHtml' in text
    assert 'exercise-swipe-card' in text
    assert 'bindDaySummarySwipe' in text
    assert 'openExerciseLibrary' in text
    assert 'openCampaignLibrary' in text
    assert 'Exercise Library' in text
    assert 'Campaign Library' in text
    assert 'Operation Forge' in (ROOT / 'js/seed/blueprint-v1.js').read_text(encoding='utf-8')
    assert 'OPERATION_META' in (ROOT / 'js/seed/blueprint-v1.js').read_text(encoding='utf-8')


if __name__ == '__main__':
    test_campaign_review_exports()
    test_progression_coach_exports()
    test_garmin_chart_exports()
    test_app_wires_review_screen()
    print('Campaign review tests passed')
