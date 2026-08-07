export const TRACKING_TYPES = {
  weighted_reps: {
    label: 'Weight + Reps',
    type: 'weighted_reps',
    fields: ['weight', 'weightUnit', 'sets', 'reps', 'restSeconds'],
    usesWorkTimer: false,
    usesRestTimer: true
  },
  reps: {
    label: 'Reps',
    type: 'reps',
    fields: ['sets', 'reps', 'restSeconds'],
    usesWorkTimer: false,
    usesRestTimer: true
  },
  timed: {
    label: 'Timed',
    type: 'timed',
    fields: ['sets', 'durationSeconds', 'restSeconds'],
    usesWorkTimer: true,
    usesRestTimer: true
  },
  weighted_timed: {
    label: 'Weighted Timed',
    type: 'weighted_timed',
    fields: ['sets', 'weight', 'weightUnit', 'durationSeconds', 'restSeconds'],
    usesWorkTimer: true,
    usesRestTimer: true
  },
  carry: {
    label: 'Carry',
    type: 'carry',
    fields: ['weight', 'weightUnit', 'distance', 'distanceUnit', 'restSeconds'],
    usesWorkTimer: false,
    usesRestTimer: true
  },
  weighted_distance: {
    label: 'Weighted Distance',
    type: 'weighted_distance',
    fields: ['sets', 'weight', 'weightUnit', 'distance', 'distanceUnit', 'restSeconds'],
    usesWorkTimer: false,
    usesRestTimer: true
  },
  distance: {
    label: 'Distance',
    type: 'distance',
    fields: ['distance', 'distanceUnit', 'durationSeconds'],
    usesWorkTimer: false,
    usesRestTimer: false
  },
  optional: {
    label: 'Optional',
    type: 'optional',
    fields: [],
    usesWorkTimer: false,
    usesRestTimer: false
  },
  open: {
    label: 'Checklist',
    type: 'open',
    fields: [],
    usesWorkTimer: false,
    usesRestTimer: false
  },
  note_only: {
    label: 'Note only',
    type: 'note_only',
    fields: [],
    usesWorkTimer: false,
    usesRestTimer: false
  }
};

export const TRACKING_TYPE_IDS = Object.keys(TRACKING_TYPES);

export function isValidTrackingType(value) {
  return TRACKING_TYPE_IDS.includes(value);
}

export function getTrackingTypeConfig(trackingType) {
  return TRACKING_TYPES[trackingType] || null;
}

export function getMissionType(trackingType) {
  return getTrackingTypeConfig(trackingType)?.type || trackingType;
}

export function getTrackingTypeLabel(trackingType) {
  return getTrackingTypeConfig(trackingType)?.label || trackingType;
}

export function getPrescriptionFieldIds(trackingType) {
  return getTrackingTypeConfig(trackingType)?.fields || [];
}
