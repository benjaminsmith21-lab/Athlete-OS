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
        'buildCampaignReviewData',
        'extractMaxHangSeconds',
        'extractZone2Best',
    ]:
        assert symbol in text, f'Missing {symbol} in campaignReview.js'


def test_progression_coach_exports():
    text = (ROOT / 'js/services/progressionCoach.js').read_text(encoding='utf-8')
    assert 'getProgressionHints' in text
    assert 'formatExerciseHistoryRows' in text
    assert 'mon-hangs' in text
    assert 'mon-z2' in text


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


if __name__ == '__main__':
    test_campaign_review_exports()
    test_progression_coach_exports()
    test_garmin_chart_exports()
    test_app_wires_review_screen()
    print('Campaign review tests passed')
