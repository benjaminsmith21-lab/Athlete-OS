import { addDays } from '../utils/datetime.js';
import { calculateRollingAverage, sortDailyHealth, formatSleepDuration } from './garminTrend.js';

export function getGarminChartDateRange(rangeKey, campaign, endDate) {
  switch (rangeKey) {
    case '30d':
      return { startDate: addDays(endDate, -29), endDate };
    case '6mo':
      return { startDate: addDays(endDate, -182), endDate };
    case 'campaign':
      return { startDate: campaign?.startDate || addDays(endDate, -89), endDate };
    case 'all':
    default:
      return { startDate: null, endDate };
  }
}

function rollingSleepHours(records, date) {
  const result = calculateRollingAverage(records, date, 7, (r) => r.sleep?.totalSeconds ?? null);
  return result.average != null ? result.average / 3600 : null;
}

function rollingRhr(records, date) {
  return calculateRollingAverage(records, date, 7, (r) => r.restingHeartRateBpm ?? null).average;
}

export function renderGarminChartSvg(records, options = {}) {
  const {
    width = 320,
    height = 180,
    startDate,
    endDate,
    metric = 'sleep',
    campaignStartDate
  } = options;

  const sorted = sortDailyHealth(records).filter((r) => {
    if (startDate && r.localDate < startDate) return false;
    if (endDate && r.localDate > endDate) return false;
    return true;
  });

  const points = sorted
    .map((r) => {
      const value = metric === 'sleep' ? rollingSleepHours(records, r.localDate) : rollingRhr(records, r.localDate);
      return value != null ? { date: r.localDate, value } : null;
    })
    .filter(Boolean);

  if (!points.length) {
    return `<svg class="weight-chart-svg garmin-chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true"><text x="50%" y="50%" text-anchor="middle" fill="#8a9299" font-size="12">No ${metric === 'sleep' ? 'sleep' : 'RHR'} data for this range</text></svg>`;
  }

  const padding = { top: 16, right: 12, bottom: 24, left: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const values = points.map((p) => p.value);
  const minY = Math.min(...values) * 0.95;
  const maxY = Math.max(...values) * 1.05;
  const rangeY = maxY - minY || 1;

  const minDate = points[0].date;
  const maxDate = points[points.length - 1].date;
  const dateRange = Math.max(1, new Date(maxDate) - new Date(minDate));

  function xPos(date) {
    if (points.length === 1) return padding.left + plotW / 2;
    const t = (new Date(date + 'T12:00:00') - new Date(minDate + 'T12:00:00')) / dateRange;
    return padding.left + t * plotW;
  }

  function yPos(val) {
    return padding.top + plotH - ((val - minY) / rangeY) * plotH;
  }

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(p.date).toFixed(1)} ${yPos(p.value).toFixed(1)}`)
    .join(' ');

  const yLabels = [minY, (minY + maxY) / 2, maxY]
    .map((v) => {
      const label = metric === 'sleep' ? `${v.toFixed(1)}h` : `${Math.round(v)}`;
      return `<text x="${padding.left - 6}" y="${yPos(v).toFixed(1)}" text-anchor="end" fill="#8a9299" font-size="9">${label}</text>`;
    })
    .join('');

  let campaignMarker = '';
  if (campaignStartDate && campaignStartDate >= minDate && campaignStartDate <= maxDate) {
    const cx = xPos(campaignStartDate);
    campaignMarker = `<line x1="${cx}" y1="${padding.top}" x2="${cx}" y2="${padding.top + plotH}" stroke="#6b8f4e" stroke-dasharray="4 3" stroke-width="1"/>`;
  }

  const ariaLabel = metric === 'sleep' ? 'Sleep trend chart (7-day rolling average)' : 'Resting heart rate trend chart (7-day rolling average)';

  return `
    <svg class="weight-chart-svg garmin-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}">
      ${yLabels}
      ${campaignMarker}
      <path d="${line}" fill="none" stroke="#3d8b8b" stroke-width="2.5"/>
    </svg>
  `;
}

export function formatGarminChartSummary(records, endDate, metric = 'sleep') {
  if (metric === 'sleep') {
    const avg = calculateRollingAverage(records, endDate, 7, (r) => r.sleep?.totalSeconds ?? null);
    return avg.average != null ? formatSleepDuration(Math.round(avg.average)) : '—';
  }
  const avg = calculateRollingAverage(records, endDate, 7, (r) => r.restingHeartRateBpm ?? null);
  return avg.average != null ? `${Math.round(avg.average)} bpm` : '—';
}
