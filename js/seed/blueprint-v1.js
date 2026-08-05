export const CAMPAIGN_ID = 'campaign-1';

export const OPERATIONS = {
  ENGINE: { label: 'Engine', color: '#3d8b8b' },
  FOUNDATION: { label: 'Foundation', color: '#b8a068' },
  POWER: { label: 'Power', color: '#c4923a' },
  PULL: { label: 'Pull', color: '#6b8f4e' },
  SPEED: { label: 'Speed', color: '#4a7eb8' },
  ADVENTURE: { label: 'Adventure', color: '#8b6ba8' },
  RESET: { label: 'Reset', color: '#7a8490' }
};

export const FDS_FALLBACKS = [
  { id: 'fds-hangs', name: 'Ring hangs', type: 'timed', duration: 20, durationUnit: 's' },
  { id: 'fds-walk', name: '10-min walk', type: 'open', notes: '10 minutes' },
  { id: 'fds-mobility', name: '5-min mobility', type: 'open', notes: '5 minutes' },
  { id: 'fds-scap', name: '10 scap pulls', type: 'reps', sets: 1, reps: 10 }
];

export const BLUEPRINT = {
  id: CAMPAIGN_ID,
  name: "Ben's Athlete Blueprint v1.0",
  season: 'Winter 2026 → Summer 2026',
  missionStatement:
    'Build a strong, lean endurance athlete with a fully functioning shoulder, first pull-up, faster half marathon and a physique you\'re proud of.',
  startDate: '2026-06-02',
  durationWeeks: 12,
  identity: [
    'I am an athlete.',
    'I value consistency over novelty.',
    'I never miss two workouts in a row.',
    "I don't change the plan for 12 weeks."
  ],
  progressionRules: [
    'Increase weight only when every rep is clean.',
    'Add 5 seconds to hangs before making them harder.',
    'Move feet forward to progress ring rows.',
    'Review progress every 4 weeks: weight, waist, max hang, push-ups, Zone 2 pace.'
  ],
  nutrition: [
    'Protein ~180g/day',
    'Creatine 5g/day',
    'Meal prep weekdays',
    'Earlier bedtime beats extra training'
  ],
  finalReminder: "Don't search for a better program. Become the person who executes this one.",
  weeklyBlueprints: [
    {
      dayOfWeek: 1,
      dayName: 'Monday',
      operation: 'ENGINE',
      exercises: [
        { id: 'mon-z2', name: 'Zone 2 run', type: 'distance', distance: 6, distanceUnit: 'km' },
        { id: 'mon-dip', name: 'Ocean dip', type: 'optional' },
        { id: 'mon-hangs', name: 'Ring hangs', type: 'timed', sets: 2, duration: 20, durationUnit: 's' },
        { id: 'mon-scap', name: 'Scap pulls', type: 'reps', sets: 2, reps: 5 },
        { id: 'mon-halos', name: 'Halos', type: 'weighted_reps', sets: 2, reps: 6, weight: 20, weightUnit: 'kg' },
        { id: 'mon-scaption', name: 'Scaption', type: 'weighted_reps', sets: 3, reps: 8, weight: 1, weightUnit: 'kg' }
      ]
    },
    {
      dayOfWeek: 2,
      dayName: 'Tuesday',
      operation: 'FOUNDATION',
      exercises: [
        { id: 'tue-serratus', name: 'Serratus', type: 'reps', sets: 3, reps: 10 },
        { id: 'tue-carry', name: 'Bottom-up carry', type: 'carry', weight: 12.5, weightMin: 10, weightMax: 15, weightUnit: 'kg' },
        { id: 'tue-goblet', name: 'Goblet squat', type: 'weighted_reps', sets: 4, reps: 10, weight: 24, weightUnit: 'kg' },
        { id: 'tue-row', name: 'Row', type: 'weighted_reps', sets: 4, reps: 10, weight: 24, weightUnit: 'kg' },
        { id: 'tue-rear-delt', name: 'Rear delt raise', type: 'reps', sets: 3, reps: 12 },
        { id: 'tue-face-pull', name: 'Face pull', type: 'reps', sets: 3, reps: 15 },
        { id: 'tue-ring-rows', name: 'Ring rows', type: 'reps', sets: 3, reps: 8 },
        { id: 'tue-pushup-plus', name: 'Push-up plus', type: 'reps', sets: 3, reps: 8 }
      ]
    },
    {
      dayOfWeek: 3,
      dayName: 'Wednesday',
      operation: 'POWER',
      exercises: [
        { id: 'wed-goblet', name: 'Goblet squat', type: 'weighted_reps', sets: 4, reps: 10, weight: 24, weightUnit: 'kg' },
        { id: 'wed-bulgarian', name: 'Bulgarian split squat', type: 'reps', sets: 3, reps: 8 },
        { id: 'wed-rdl', name: 'Single-leg RDL', type: 'weighted_reps', sets: 3, reps: 8, weight: 18, weightMin: 16, weightMax: 20, weightUnit: 'kg' },
        { id: 'wed-swings', name: 'Swings', type: 'weighted_reps', sets: 5, reps: 15, weight: 20, weightUnit: 'kg' },
        { id: 'wed-farmer', name: 'Farmer carries', type: 'carry', weight: 24, weightUnit: 'kg' }
      ]
    },
    {
      dayOfWeek: 4,
      dayName: 'Thursday',
      operation: 'PULL',
      exercises: [
        { id: 'thu-pulldown', name: 'Band pulldown', type: 'reps', sets: 4, reps: 12 },
        { id: 'thu-row', name: 'Row', type: 'weighted_reps', sets: 3, reps: 10, weight: 24, weightUnit: 'kg' },
        { id: 'thu-rear-delt', name: 'Rear delt raise', type: 'reps', sets: 3, reps: 12 },
        { id: 'thu-hangs', name: 'Ring hangs', type: 'timed', sets: 3, duration: 20, durationUnit: 's' },
        { id: 'thu-scap', name: 'Scap pulls', type: 'reps', sets: 3, reps: 5 },
        { id: 'thu-ring-rows', name: 'Ring rows', type: 'reps', sets: 3, repsMin: 8, repsMax: 12 }
      ]
    },
    {
      dayOfWeek: 5,
      dayName: 'Friday',
      operation: 'SPEED',
      exercises: [
        { id: 'fri-easy1', name: 'Easy run', type: 'distance', distance: 1.5, distanceUnit: 'km' },
        { id: 'fri-tempo', name: 'Tempo run', type: 'distance', distance: 5, distanceUnit: 'km', notes: '~5:30/km' },
        { id: 'fri-easy2', name: 'Easy run', type: 'distance', distance: 1.5, distanceUnit: 'km' },
        { id: 'fri-dip', name: 'Ocean dip', type: 'optional' },
        { id: 'fri-hangs', name: 'Ring hangs', type: 'timed', sets: 1, duration: 20, durationUnit: 's' }
      ]
    },
    {
      dayOfWeek: 6,
      dayName: 'Saturday',
      operation: 'ADVENTURE',
      exercises: [
        { id: 'sat-run', name: 'Run club', type: 'distance', distanceMin: 6, distanceMax: 10, distanceUnit: 'km' },
        { id: 'sat-hangs', name: 'Hangs', type: 'optional' }
      ]
    },
    {
      dayOfWeek: 0,
      dayName: 'Sunday',
      operation: 'RESET',
      exercises: [
        { id: 'sun-walk', name: 'Walk', type: 'open' },
        { id: 'sun-mobility', name: 'Mobility', type: 'open' },
        { id: 'sun-family', name: 'Family', type: 'note_only' }
      ]
    }
  ]
};

export function getBlueprintForDay(dayOfWeek) {
  return BLUEPRINT.weeklyBlueprints.find((b) => b.dayOfWeek === dayOfWeek);
}

export function getDayName(dayOfWeek) {
  return getBlueprintForDay(dayOfWeek)?.dayName ?? '';
}
