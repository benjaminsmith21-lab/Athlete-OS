export const EQUIPMENT_OPTIONS = [
  'Bodyweight',
  'Kettlebell',
  'Dumbbell',
  'Resistance Band',
  'Rings',
  'Pull-up Bar',
  'Bench',
  'Cable Machine',
  'Barbell',
  'Machine',
  'Treadmill',
  'Bike',
  'Rowing Machine',
  'Outdoor',
  'Other'
];

export const EXERCISE_CATEGORIES = [
  'Strength',
  'Power',
  'Pull',
  'Push',
  'Carry',
  'Core',
  'Shoulder / Rehab',
  'Mobility',
  'Running',
  'Cardio',
  'Recovery',
  'Other'
];

export function isValidEquipment(value) {
  return EQUIPMENT_OPTIONS.includes(value);
}

export function isValidCategory(value) {
  return EXERCISE_CATEGORIES.includes(value);
}
