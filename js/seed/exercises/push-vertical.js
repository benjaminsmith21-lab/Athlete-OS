import { ex } from './helpers.js';

export const PUSH_VERTICAL = [
  ex('dumbbell-overhead-press', 'Dumbbell Overhead Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell'],
    defaultRestSeconds: 90,
    aliases: ['DB OHP', 'standing dumbbell press', 'shoulder press'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper chest', 'core'],
    keywords: ['overhead', 'shoulders', 'dumbbell', 'push', 'OHP', 'press'],
    technique: {
      setup: 'Stand with dumbbells at shoulder height, palms forward or neutral.',
      cues: [
        'Brace core and glutes before each rep.',
        'Press straight up clearing head without excessive lean.',
        'Lower under control to shoulder level.'
      ],
      commonMistakes: [
        'Overarching lower back to finish reps.',
        'Pressing dumbbells forward instead of up.',
        'Shrugging traps at lockout.'
      ]
    }
  }),
  ex('kettlebell-press', 'Kettlebell Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB press', 'single-arm KB press', 'military KB press'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core', 'forearms'],
    keywords: ['kettlebell', 'KB', 'overhead', 'shoulders', 'press', 'unilateral'],
    technique: {
      setup: 'Clean KB to rack; wrist straight, elbow tight to ribs.',
      cues: [
        'Root foot and squeeze glute on working side.',
        'Press bell up along a vertical path.',
        'Lock out with biceps by ear and ribs down.'
      ],
      commonMistakes: [
        'Leaning away from bell excessively.',
        'Pressing around the bell instead of vertical.',
        'Hyperextending lower back at top.'
      ]
    }
  }),
  ex('half-kneeling-press', 'Half-kneeling Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell', 'Kettlebell'],
    defaultRestSeconds: 60,
    aliases: ['half kneeling OHP', 'kneeling shoulder press'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core', 'glutes'],
    keywords: ['overhead', 'shoulders', 'half kneeling', 'core', 'press', 'stability'],
    technique: {
      setup: 'Half kneel with down knee under hip; bell or dumbbell in rack at shoulder.',
      cues: [
        'Tuck pelvis slightly and squeeze down-side glute.',
        'Press overhead without leaning back.',
        'Lower slowly keeping ribs stacked over pelvis.'
      ],
      commonMistakes: [
        'Arching back to compensate for tight shoulders.',
        'Knees not aligned causing wobble.',
        'Rushing reps and losing core tension.'
      ]
    }
  }),
  ex('landmine-press', 'Landmine Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 60,
    aliases: ['single-arm landmine press', 'angled press'],
    primaryMuscles: ['shoulders', 'chest'],
    secondaryMuscles: ['triceps', 'core'],
    keywords: ['landmine', 'shoulders', 'press', 'barbell', 'shoulder friendly', 'core'],
    technique: {
      setup: 'Anchor barbell in corner; hold end at shoulder in staggered or half-kneeling stance.',
      cues: [
        'Press bar up and forward on an arc.',
        'Keep ribs down and avoid excessive back arch.',
        'Control descent back to shoulder.'
      ],
      commonMistakes: [
        'Turning it into a chest fly with elbow flared.',
        'Using legs to drive every rep.',
        'Letting bar drift off the natural arc path.'
      ]
    }
  }),
  ex('pike-push-up', 'Pike Push-up', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['pike press', 'downward dog push-up'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper chest', 'core'],
    keywords: ['shoulders', 'push', 'bodyweight', 'pike', 'handstand prep', 'overhead'],
    technique: {
      setup: 'Start in downward dog with hips high; hands shoulder-width.',
      cues: [
        'Lower head toward floor between hands.',
        'Keep hips high and legs mostly straight.',
        'Press back up by driving through shoulders.'
      ],
      commonMistakes: [
        'Dropping hips into a regular push-up shape.',
        'Head diving forward instead of straight down.',
        'Elbows flaring wide stressing shoulders.'
      ]
    }
  })
];
