import { ex } from './helpers.js';

export const PULL_HORIZONTAL = [
  ex('one-arm-dumbbell-row', 'One-arm Dumbbell Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell', 'Bench'],
    defaultRestSeconds: 90,
    aliases: ['DB row', 'single-arm dumbbell row', 'bench row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'core', 'forearms'],
    keywords: ['row', 'pull', 'back', 'dumbbell', 'lats', 'unilateral'],
    technique: {
      setup: 'One hand and knee on bench; other foot on floor, dumbbell hanging straight down.',
      cues: [
        'Pull elbow back toward hip, not flared wide.',
        'Squeeze shoulder blade without twisting torso.',
        'Lower with control to full arm extension.'
      ],
      commonMistakes: [
        'Rotating torso to jerk weight up.',
        'Shrugging instead of retracting scapula.',
        'Rounding lower back at bottom.'
      ]
    }
  }),
  ex('one-arm-kettlebell-row', 'One-arm Kettlebell Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB row', 'single-arm KB row', 'kettlebell bent row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'core', 'forearms'],
    keywords: ['row', 'pull', 'kettlebell', 'KB', 'back', 'lats', 'unilateral'],
    technique: {
      setup: 'Hinge with flat back; support on bench or rack, KB in one hand.',
      cues: [
        'Keep bell close to body on the pull.',
        'Drive elbow to ceiling without opening hips.',
        'Pause briefly at top before lowering.'
      ],
      commonMistakes: [
        'Using hip rotation to cheat reps.',
        'Letting shoulder roll forward at bottom.',
        'Hunching upper back throughout set.'
      ]
    }
  }),
  ex('bent-over-row', 'Bent-over Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 90,
    aliases: ['barbell row', 'BB bent-over row', 'Pendlay row variation'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'lower back', 'forearms'],
    keywords: ['row', 'pull', 'barbell', 'back', 'lats', 'strength'],
    technique: {
      setup: 'Hinge to ~45° with bar hanging at arms length; grip just outside knees.',
      cues: [
        'Pull bar to lower ribs or upper abs.',
        'Keep torso angle fixed—no rising with each rep.',
        'Squeeze shoulder blades together at top.'
      ],
      commonMistakes: [
        'Standing more upright and turning it into a shrug row.',
        'Using momentum from hip extension.',
        'Rounding lower back under load.'
      ]
    }
  }),
  ex('chest-supported-row', 'Chest-supported Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell', 'Bench'],
    defaultRestSeconds: 90,
    aliases: ['incline bench row', 'seal row', 'supported row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts'],
    keywords: ['row', 'pull', 'back', 'supported', 'shoulder friendly', 'lats'],
    technique: {
      setup: 'Lie chest-down on incline bench; let dumbbells hang straight down.',
      cues: [
        'Pull elbows back along your sides.',
        'Squeeze upper back at top without lifting chest off pad.',
        'Lower slowly to full stretch.'
      ],
      commonMistakes: [
        'Lifting chest off bench to shorten range.',
        'Shrugging traps instead of rowing.',
        'Using too much weight and half-repping.'
      ]
    }
  }),
  ex('cable-row', 'Cable Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Cable Machine'],
    defaultRestSeconds: 60,
    aliases: ['seated cable row', 'low cable row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'forearms'],
    keywords: ['row', 'pull', 'cable', 'back', 'lats', 'machine'],
    technique: {
      setup: 'Sit tall at cable station; grab handle, slight knee bend, shoulders down.',
      cues: [
        'Pull handle to belly button driving elbows back.',
        'Pause with shoulder blades squeezed.',
        'Return with control keeping torso still.'
      ],
      commonMistakes: [
        'Rocking torso back and forth for momentum.',
        'Shrugging at end of pull.',
        'Rounding forward at full stretch.'
      ]
    }
  }),
  ex('inverted-row', 'Inverted Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Barbell', 'Bench'],
    defaultRestSeconds: 60,
    aliases: ['body row', 'Australian pull-up', 'TRX row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'core'],
    keywords: ['row', 'pull', 'bodyweight', 'horizontal pull', 'back', 'beginner pull-up'],
    technique: {
      setup: 'Set bar at waist height; hang underneath with body straight and heels on floor.',
      cues: [
        'Pull chest to bar keeping body rigid.',
        'Squeeze shoulder blades at top.',
        'Lower under control to full arm extension.'
      ],
      commonMistakes: [
        'Sagging hips or piking at top.',
        'Partial reps without chest nearing bar.',
        'Shrugging instead of retracting scapulae.'
      ]
    }
  })
];
