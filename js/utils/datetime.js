export const DEFAULT_TIMEZONE = 'Australia/Melbourne';

export function getLocalDateString(date = new Date(), timezone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getLocalISOString(date = new Date(), timezone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset'
  }).formatToParts(date);

  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  const offset = map.timeZoneName?.replace('GMT', '') || '+10:00';
  const normalizedOffset = offset.includes(':') ? offset : `${offset}:00`;
  const sign = normalizedOffset.startsWith('-') ? '-' : '+';
  const offsetBody = normalizedOffset.replace(/^[-+]/, '');
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}${sign}${offsetBody}`;
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysBetween(startStr, endStr) {
  const start = new Date(startStr + 'T12:00:00');
  const end = new Date(endStr + 'T12:00:00');
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatMissionDayHeading(date = new Date()) {
  return date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
}
