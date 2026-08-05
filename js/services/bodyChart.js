import { addDays } from '../utils/datetime.js';
import { calculateRollingAverage, isTrendEligible } from './bodyTrend.js';

export function renderWeightChartSvg(measurements, options = {}) {
  const {
    width = 320,
    height = 180,
    startDate,
    endDate,
    campaignStartDate,
    targetWeightKg
  } = options;

  const eligible = measurements.filter(isTrendEligible).filter((m) => {
    if (startDate && m.date < startDate) return false;
    if (endDate && m.date > endDate) return false;
    return true;
  });

  if (!eligible.length) {
    return `<svg class="weight-chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true"><text x="50%" y="50%" text-anchor="middle" fill="#8a9299" font-size="12">No data for this range</text></svg>`;
  }

  const padding = { top: 16, right: 12, bottom: 24, left: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const weights = eligible.map((m) => m.weightKg);
  const rolling = eligible.map((m) => calculateRollingAverage(measurements, m.date, 7).average ?? m.weightKg);
  const allY = [...weights, ...rolling];
  if (targetWeightKg) allY.push(targetWeightKg);
  const minY = Math.min(...allY) - 1;
  const maxY = Math.max(...allY) + 1;
  const rangeY = maxY - minY || 1;

  const dates = eligible.map((m) => m.date);
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  const dateRange = Math.max(1, new Date(maxDate) - new Date(minDate));

  function xPos(date) {
    if (dates.length === 1) return padding.left + plotW / 2;
    const t = (new Date(date + 'T12:00:00') - new Date(minDate + 'T12:00:00')) / dateRange;
    return padding.left + t * plotW;
  }

  function yPos(val) {
    return padding.top + plotH - ((val - minY) / rangeY) * plotH;
  }

  const dailyDots = eligible
    .map(
      (m) =>
        `<circle cx="${xPos(m.date).toFixed(1)}" cy="${yPos(m.weightKg).toFixed(1)}" r="3" fill="rgba(196,146,58,0.35)" data-date="${m.date}" data-weight="${m.weightKg}" class="chart-point"/>`
    )
    .join('');

  const rollingLine = rolling
    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${xPos(eligible[i].date).toFixed(1)} ${yPos(val).toFixed(1)}`)
    .join(' ');

  let campaignMarker = '';
  if (campaignStartDate && campaignStartDate >= minDate && campaignStartDate <= maxDate) {
    const cx = xPos(campaignStartDate);
    campaignMarker = `<line x1="${cx}" y1="${padding.top}" x2="${cx}" y2="${padding.top + plotH}" stroke="#6b8f4e" stroke-dasharray="4 3" stroke-width="1"/>`;
  }

  let targetLine = '';
  if (targetWeightKg) {
    const ty = yPos(targetWeightKg);
    targetLine = `<line x1="${padding.left}" y1="${ty}" x2="${padding.left + plotW}" y2="${ty}" stroke="rgba(196,146,58,0.4)" stroke-width="1"/>`;
  }

  const yLabels = [minY, (minY + maxY) / 2, maxY]
    .map(
      (v) =>
        `<text x="${padding.left - 6}" y="${yPos(v).toFixed(1)}" text-anchor="end" fill="#8a9299" font-size="9">${v.toFixed(1)}</text>`
    )
    .join('');

  return `
    <svg class="weight-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Weight trend chart">
      ${yLabels}
      ${targetLine}
      ${campaignMarker}
      ${dailyDots}
      <path d="${rollingLine}" fill="none" stroke="#c4923a" stroke-width="2.5"/>
    </svg>
  `;
}

export function getChartDateRange(rangeKey, campaign, endDate) {
  switch (rangeKey) {
    case '30d':
      return { startDate: addDays(endDate, -29), endDate };
    case '6mo':
      return { startDate: addDays(endDate, -182), endDate };
    case '1y':
      return { startDate: addDays(endDate, -365), endDate };
    case 'all':
      return { startDate: null, endDate };
    case 'campaign':
    default:
      return { startDate: campaign?.startDate || addDays(endDate, -89), endDate };
  }
}
