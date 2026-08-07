const FALLBACK = {
  muted: '#8a9299',
  weight: '#c4923a',
  weightSoft: 'rgba(196, 146, 58, 0.35)',
  weightFaint: 'rgba(196, 146, 58, 0.4)',
  garmin: '#3d8b8b',
  campaign: '#6b8f4e'
};

export function getChartColors() {
  if (typeof document === 'undefined') return { ...FALLBACK };
  const style = getComputedStyle(document.documentElement);
  const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
  return {
    muted: read('--chart-muted', FALLBACK.muted),
    weight: read('--chart-weight', FALLBACK.weight),
    weightSoft: read('--chart-weight-soft', FALLBACK.weightSoft),
    weightFaint: read('--chart-weight-faint', FALLBACK.weightFaint),
    garmin: read('--chart-garmin', FALLBACK.garmin),
    campaign: read('--chart-campaign', FALLBACK.campaign)
  };
}
