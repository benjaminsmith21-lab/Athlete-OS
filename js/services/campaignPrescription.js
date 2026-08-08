import {
  getTrackingTypeConfig,
  getMissionType,
  getPrescriptionFieldIds,
  getPrescriptionFieldLabel,
  isValidTrackingType
} from './trackingTypes.js';
import { WARMUP_DURATION_SECONDS } from '../seed/warmup-v1.js';
import { LEGACY_ID_TO_LIBRARY } from '../seed/exercise-library-v1.js';
import { OPERATIONS } from '../seed/blueprint-v1.js';

export const SECTION_TYPES = ['warmup', 'main', 'recovery'];

export const SECTION_ORDER = {
  warmup: 0,
  main: 1,
  recovery: 2
};

export const OPERATION_OTHER = 'OTHER';

export const SECTION_DEFAULT_TITLES = {
  warmup: 'Warm-up',
  main: 'Main',
  recovery: 'Recovery'
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dayNameFor(dayOfWeek) {
  return DAY_NAMES[dayOfWeek] || 'Day';
}

export function getOperationLabel(dayOrBlueprint) {
  if (!dayOrBlueprint) return '—';
  if (dayOrBlueprint.operation === OPERATION_OTHER) {
    return dayOrBlueprint.operationCustom?.trim() || 'Other';
  }
  const op = dayOrBlueprint.operation;
  return OPERATIONS[op]?.label || op || '—';
}

export function getCompiledOperation(day) {
  if (day?.operation === OPERATION_OTHER) {
    return day.operationCustom?.trim() || OPERATION_OTHER;
  }
  return day?.operation || 'RESET';
}

export function sortSections(sections = []) {
  return [...sections].sort((a, b) => {
    const orderA = SECTION_ORDER[a.type] ?? 99;
    const orderB = SECTION_ORDER[b.type] ?? 99;
    return orderA - orderB || (a.order ?? 0) - (b.order ?? 0);
  });
}

export function normalizeDaySections(day) {
  if (!day.sections) day.sections = [];
  let changed = false;

  const accessory = day.sections.find((section) => section.type === 'accessory');
  if (accessory) {
    let main = day.sections.find((section) => section.type === 'main');
    if (!main) {
      main = createSection('main', 1);
      day.sections.push(main);
    }
    const startOrder = main.exercises.length;
    accessory.exercises.forEach((row, index) => {
      main.exercises.push({ ...row, order: startOrder + index });
    });
    day.sections = day.sections.filter((section) => section.type !== 'accessory');
    changed = true;
  }

  for (const type of SECTION_TYPES) {
    if (!day.sections.some((section) => section.type === type) && type === 'main') {
      day.sections.push(createSection('main', SECTION_ORDER.main));
      changed = true;
    }
  }

  day.sections = sortSections(day.sections);
  day.sections.forEach((section, index) => {
    const expectedOrder = SECTION_ORDER[section.type] ?? index;
    if (section.order !== expectedOrder) {
      section.order = expectedOrder;
      changed = true;
    }
  });

  return changed;
}

export function normalizeWeeklyMission(day) {
  return normalizeDaySections(day);
}

export function normalizeCampaign(campaign) {
  if (!campaign?.weeklyMissions) return false;
  let changed = false;
  for (const day of campaign.weeklyMissions) {
    if (normalizeDaySections(day)) changed = true;
  }
  return changed;
}

export function createSection(type, order = 0) {
  return {
    id: `section-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: SECTION_DEFAULT_TITLES[type] || type,
    order,
    exercises: []
  };
}

export function defaultPrescription(trackingType, exerciseDef = {}) {
  const fields = getPrescriptionFieldIds(trackingType);
  const rx = {};
  if (fields.includes('sets')) rx.sets = 3;
  if (fields.includes('reps')) rx.reps = 10;
  if (fields.includes('weight')) rx.weight = exerciseDef.defaultUnit === 'lbs' ? 20 : 12;
  if (fields.includes('weightUnit')) rx.weightUnit = exerciseDef.defaultUnit || 'kg';
  if (fields.includes('durationSeconds')) rx.durationSeconds = 60;
  if (fields.includes('distance')) rx.distance = 1;
  if (fields.includes('distanceUnit')) rx.distanceUnit = 'km';
  if (fields.includes('restSeconds')) {
    rx.restSeconds = exerciseDef.defaultRestSeconds ?? 60;
  }
  return rx;
}

export function validatePrescription(trackingType, prescription = {}) {
  const errors = [];
  if (!isValidTrackingType(trackingType)) {
    errors.push('Invalid tracking type.');
    return errors;
  }
  const fields = getPrescriptionFieldIds(trackingType);
  if (!fields.length) return errors;

  const optionalFields = new Set(['weightUnit', 'distanceUnit', 'restSeconds']);
  if (trackingType === 'distance') optionalFields.add('durationSeconds');

  for (const field of fields) {
    if (optionalFields.has(field)) continue;
    const label = getPrescriptionFieldLabel(field);
    const value = prescription[field];
    if (value == null || value === '') {
      errors.push(`Missing ${label}.`);
      continue;
    }
    if (['sets', 'reps', 'restSeconds', 'durationSeconds'].includes(field)) {
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) errors.push(`${label} must be a positive number.`);
    }
    if (['weight', 'distance'].includes(field)) {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0) errors.push(`${label} must be zero or greater.`);
    }
  }
  return errors;
}

function legacyExerciseFromBlueprint(exercise) {
  return {
    id: exercise.id,
    name: exercise.name,
    type: exercise.type,
    sets: exercise.sets,
    reps: exercise.reps,
    repsMin: exercise.repsMin,
    repsMax: exercise.repsMax,
    weight: exercise.weight,
    weightMin: exercise.weightMin,
    weightMax: exercise.weightMax,
    weightUnit: exercise.weightUnit,
    duration: exercise.duration,
    durationUnit: exercise.durationUnit,
    distance: exercise.distance,
    distanceMin: exercise.distanceMin,
    distanceMax: exercise.distanceMax,
    distanceUnit: exercise.distanceUnit,
    notes: exercise.notes,
    libraryExerciseId: exercise.libraryExerciseId || null,
    sectionType: exercise.sectionType || 'main',
    optional: exercise.optional === true
  };
}

export function compilePrescriptionToMissionExercise(prescriptionRow) {
  const trackingType = prescriptionRow.exerciseSnapshot?.trackingType;
  const missionType = getMissionType(trackingType);
  const rx = prescriptionRow.prescription || {};
  const exercise = {
    id: prescriptionRow.id,
    name: prescriptionRow.exerciseSnapshot?.name || 'Exercise',
    type: missionType,
    libraryExerciseId: prescriptionRow.libraryExerciseId,
    sectionType: prescriptionRow.sectionType || 'main',
    optional: prescriptionRow.optional === true,
    campaignNotes: prescriptionRow.campaignNotes || ''
  };

  if (rx.sets != null) exercise.sets = Number(rx.sets);
  if (rx.reps != null) exercise.reps = Number(rx.reps);
  if (rx.repsMin != null) exercise.repsMin = Number(rx.repsMin);
  if (rx.repsMax != null) exercise.repsMax = Number(rx.repsMax);
  if (rx.weight != null && rx.weight !== '') exercise.weight = Number(rx.weight);
  if (rx.weightMin != null) exercise.weightMin = Number(rx.weightMin);
  if (rx.weightMax != null) exercise.weightMax = Number(rx.weightMax);
  if (rx.weightUnit) exercise.weightUnit = rx.weightUnit;
  if (rx.durationSeconds != null) {
    exercise.duration = Number(rx.durationSeconds);
    exercise.durationUnit = 's';
  }
  if (rx.distance != null) exercise.distance = Number(rx.distance);
  if (rx.distanceMin != null) exercise.distanceMin = Number(rx.distanceMin);
  if (rx.distanceMax != null) exercise.distanceMax = Number(rx.distanceMax);
  if (rx.distanceUnit) exercise.distanceUnit = rx.distanceUnit;
  if (rx.restSeconds != null) exercise.restSeconds = Number(rx.restSeconds);
  if (prescriptionRow.campaignNotes) exercise.notes = prescriptionRow.campaignNotes;

  return exercise;
}

function buildWarmupStepsFromSection(section) {
  if (!section?.exercises?.length) return null;
  return section.exercises.map((row, index) => {
    const rx = row.prescription || {};
    const isFlow = row.libraryExerciseId === 'warmup-kb-flow';
    let rxText = row.campaignNotes || '';
    if (!rxText && rx.durationSeconds) {
      rxText = `${rx.durationSeconds}s`;
    }
    return {
      minute: index + 1,
      title: row.exerciseSnapshot?.name || 'Warm-up',
      rx: rxText,
      purpose: row.campaignNotes || '',
      isFlow,
      libraryExerciseId: row.libraryExerciseId,
      durationSeconds: rx.durationSeconds || WARMUP_DURATION_SECONDS
    };
  });
}

export function compileWeeklyMissionToBlueprint(campaignId, weeklyMission) {
  const sections = sortSections(weeklyMission.sections || []);
  const exercises = [];
  for (const section of sections) {
    const rows = [...(section.exercises || [])].sort((a, b) => a.order - b.order);
    for (const row of rows) {
      const compiled = compilePrescriptionToMissionExercise({
        ...row,
        sectionType: section.type
      });
      exercises.push(compiled);
    }
  }

  const warmupSection = sections.find((s) => s.type === 'warmup');
  const warmupSteps = buildWarmupStepsFromSection(warmupSection);

  return {
    id: `${campaignId}-day-${weeklyMission.dayOfWeek}`,
    campaignId,
    dayOfWeek: weeklyMission.dayOfWeek,
    dayName: weeklyMission.dayName || dayNameFor(weeklyMission.dayOfWeek),
    operation: getCompiledOperation(weeklyMission),
    operationCustom: weeklyMission.operation === OPERATION_OTHER ? weeklyMission.operationCustom : undefined,
    name: weeklyMission.name,
    purpose: weeklyMission.purpose,
    estimatedDurationMinutes: weeklyMission.estimatedDurationMinutes,
    exercises,
    warmupSteps: warmupSteps || undefined,
    sections: structuredClone(sections)
  };
}

export function blueprintExerciseToPrescription(exercise, libraryExerciseId = null) {
  const resolvedLibraryId = libraryExerciseId || LEGACY_ID_TO_LIBRARY[exercise.id] || exercise.libraryExerciseId || null;
  const trackingType =
    exercise.trackingType ||
    (exercise.type === 'optional'
      ? 'optional'
      : exercise.type === 'open'
        ? 'open'
        : exercise.type === 'note_only'
          ? 'note_only'
          : exercise.type);

  const prescription = {};
  if (exercise.sets != null) prescription.sets = exercise.sets;
  if (exercise.reps != null) prescription.reps = exercise.reps;
  if (exercise.repsMin != null) prescription.repsMin = exercise.repsMin;
  if (exercise.repsMax != null) prescription.repsMax = exercise.repsMax;
  if (exercise.weight != null) prescription.weight = exercise.weight;
  if (exercise.weightMin != null) prescription.weightMin = exercise.weightMin;
  if (exercise.weightMax != null) prescription.weightMax = exercise.weightMax;
  if (exercise.weightUnit) prescription.weightUnit = exercise.weightUnit;
  if (exercise.duration != null) prescription.durationSeconds = exercise.duration;
  if (exercise.distance != null) prescription.distance = exercise.distance;
  if (exercise.distanceMin != null) prescription.distanceMin = exercise.distanceMin;
  if (exercise.distanceMax != null) prescription.distanceMax = exercise.distanceMax;
  if (exercise.distanceUnit) prescription.distanceUnit = exercise.distanceUnit;

  return {
    id: exercise.id,
    libraryExerciseId: resolvedLibraryId || exercise.id,
    exerciseSnapshot: {
      name: exercise.name,
      trackingType
    },
    order: 0,
    optional: exercise.type === 'optional' || exercise.optional === true,
    prescription,
    campaignNotes: exercise.notes || ''
  };
}

export function legacyBlueprintToWeeklyMission(campaignId, blueprintRow) {
  const mainSection = createSection('main', 0);
  mainSection.exercises = (blueprintRow.exercises || []).map((exercise, index) => {
    const row = blueprintExerciseToPrescription(exercise);
    row.order = index;
    return row;
  });

  return {
    id: `${campaignId}-day-${blueprintRow.dayOfWeek}`,
    dayOfWeek: blueprintRow.dayOfWeek,
    dayName: blueprintRow.dayName,
    name: blueprintRow.name,
    operation: blueprintRow.operation,
    purpose: blueprintRow.purpose,
    estimatedDurationMinutes: blueprintRow.estimatedDurationMinutes,
    sections: [mainSection]
  };
}

export function createDefaultWarmupSection() {
  const section = createSection('warmup', 0);
  const defaults = [
    {
      id: 'warmup-rx-halos',
      libraryExerciseId: 'warmup-halos',
      exerciseSnapshot: { name: 'Halos', trackingType: 'timed' },
      order: 0,
      optional: false,
      prescription: { durationSeconds: 60 },
      campaignNotes: '5 each direction'
    },
    {
      id: 'warmup-rx-carry',
      libraryExerciseId: 'warmup-bottom-up-carry',
      exerciseSnapshot: { name: 'Bottom-up Carry', trackingType: 'timed' },
      order: 1,
      optional: false,
      prescription: { durationSeconds: 60 },
      campaignNotes: '30 seconds each arm'
    },
    {
      id: 'warmup-rx-flow',
      libraryExerciseId: 'warmup-kb-flow',
      exerciseSnapshot: { name: 'Kettlebell Flow', trackingType: 'timed' },
      order: 2,
      optional: false,
      prescription: { durationSeconds: 60 },
      campaignNotes: 'Keep the bell in your hands'
    }
  ];
  section.exercises = defaults;
  return section;
}

export function formatPrescriptionSummary(trackingType, prescription = {}) {
  const parts = [];
  if (prescription.weight != null && prescription.weight !== '') {
    parts.push(`${prescription.weight}${prescription.weightUnit || 'kg'}`);
  }
  if (prescription.reps != null) parts.push(`${prescription.reps} reps`);
  if (prescription.sets != null) parts.push(`${prescription.sets} sets`);
  if (prescription.durationSeconds != null) parts.push(`${prescription.durationSeconds}s`);
  if (prescription.distance != null) {
    parts.push(`${prescription.distance}${prescription.distanceUnit || 'km'}`);
  }
  if (!parts.length) return getTrackingTypeConfig(trackingType)?.label || trackingType;
  return parts.join(' · ');
}

export { legacyExerciseFromBlueprint };
