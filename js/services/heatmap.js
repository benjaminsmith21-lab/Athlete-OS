import { getAll } from '../db.js';
import { MISSION_STATUS } from './mission.js';

const RATING_LEVEL = {
  perfect: 3,
  full: 3,
  recovery: 2,
  minimum: 1,
  abandoned: 0
};

const RATING_LABEL = {
  perfect: 'Perfect',
  full: 'Full',
  recovery: 'Recovery',
  minimum: 'FDS',
  abandoned: 'Abandoned'
};

export async function getMonthHeatmapData(year, month) {
  const missions = await getAll('missions');
  const monthStr = String(month + 1).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;

  const byDate = {};
  for (const m of missions) {
    if (m.status !== MISSION_STATUS.COMPLETE) continue;
    if (!m.date?.startsWith(prefix)) continue;
    byDate[m.date] = m;
  }

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ empty: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${prefix}-${String(day).padStart(2, '0')}`;
    const mission = byDate[date];
    const rating = mission?.rating || null;
    cells.push({
      empty: false,
      date,
      day,
      level: rating ? RATING_LEVEL[rating] ?? 0 : 0,
      rating,
      label: rating ? RATING_LABEL[rating] : null,
      isToday: date === todayStr
    });
  }

  return {
    year,
    month,
    monthName: firstDay.toLocaleString('default', { month: 'long' }),
    cells
  };
}

export function renderHeatmapHtml(data) {
  const headers = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    .map((d) => `<span class="heatmap-dow">${d}</span>`)
    .join('');

  const cells = data.cells
    .map((cell) => {
      if (cell.empty) return '<span class="heatmap-cell heatmap-empty"></span>';
      const classes = ['heatmap-cell', `heatmap-l${cell.level}`];
      if (cell.isToday) classes.push('heatmap-today');
      const title = cell.label ? `${cell.day} — ${cell.label}` : `${cell.day}`;
      return `<span class="${classes.join(' ')}" title="${title}"></span>`;
    })
    .join('');

  return `
    <div class="heatmap">
      <p class="section-label">${data.monthName} ${data.year}</p>
      <div class="heatmap-grid">${headers}${cells}</div>
      <div class="heatmap-legend">
        <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-l3"></span> Full</span>
        <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-l2"></span> Partial</span>
        <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-l1"></span> FDS</span>
      </div>
    </div>
  `;
}
