import { ex } from './helpers.js';

export const PUSH_HORIZONTAL = [
  ex('push-up', 'Push-up', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['press-up', 'floor push-up', 'BW push-up'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    keywords: ['push', 'chest', 'bodyweight', 'triceps', 'shoulders', 'fundamental'],
    technique: {
      setup: 'High plank, hands slightly wider than shoulders, body in one line.',
      cues: [
        'Lower chest toward floor with elbows at 45°.',
        'Keep core tight so hips do not sag.',
        'Press floor away to full lockout.'
      ],
      commonMistakes: [
        'Hips sagging or piking up.',
        'Elbows flaring straight out to sides.',
        'Partial reps without chest nearing floor.'
      ]
    }
  }),
  ex('incline-push-up', 'Incline Push-up', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bench', 'Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['elevated push-up', 'bench push-up'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    keywords: ['push', 'chest', 'incline', 'beginner', 'bodyweight', 'shoulders'],
    technique: {
      setup: 'Hands on bench or box; walk feet back into a straight plank.',
      cues: [
        'Lower chest toward edge with control.',
        'Keep body rigid from head to heels.',
        'Press back to straight arms without shrugging.'
      ],
      commonMistakes: [
        'Hips dipping as fatigue sets in.',
        'Hands too wide causing shoulder discomfort.',
        'Using a surface too high and barely loading chest.'
      ]
    }
  }),
  ex('decline-push-up', 'Decline Push-up', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bench', 'Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['feet-elevated push-up', 'downhill push-up'],
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    keywords: ['push', 'chest', 'decline', 'shoulders', 'bodyweight', 'advanced'],
    technique: {
      setup: 'Feet on bench, hands on floor shoulder-width; body in plank.',
      cues: [
        'Lower with control keeping elbows tucked moderately.',
        'Maintain straight line—do not pike at hips.',
        'Press up emphasizing upper chest and shoulders.'
      ],
      commonMistakes: [
        'Elevating feet too high and losing push-up position.',
        'Neck craning to reach bottom range.',
        'Sagging lower back under load.'
      ]
    }
  }),
  ex('dumbbell-bench-press', 'Dumbbell Bench Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell', 'Bench'],
    defaultRestSeconds: 90,
    aliases: ['DB bench press', 'dumbbell flat bench'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    keywords: ['bench', 'chest', 'dumbbell', 'push', 'upper body'],
    technique: {
      setup: 'Lie on bench with dumbbells at chest; feet flat, slight arch in upper back.',
      cues: [
        'Press up and slightly together over chest.',
        'Lower with control until upper arms parallel to floor.',
        'Keep shoulder blades pinched into bench.'
      ],
      commonMistakes: [
        'Flaring elbows to 90° and stressing shoulders.',
        'Bouncing bells off chest.',
        'Feet floating off floor losing leg drive.'
      ]
    }
  }),
  ex('barbell-bench-press', 'Barbell Bench Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Barbell', 'Bench'],
    defaultRestSeconds: 120,
    aliases: ['flat bench press', 'BB bench', 'bench press'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    keywords: ['bench', 'barbell', 'chest', 'push', 'strength', 'upper body'],
    technique: {
      setup: 'Eyes under bar; grip slightly wider than shoulders, feet planted.',
      cues: [
        'Unrack and lower bar to mid-chest with forearms vertical.',
        'Drive bar up and slightly back over shoulders.',
        'Keep glutes on bench and shoulder blades retracted.'
      ],
      commonMistakes: [
        'Bouncing bar off chest.',
        'Elbows flaring excessively.',
        'Lifting hips off bench to cheat lockout.'
      ]
    }
  }),
  ex('dumbbell-floor-press', 'Dumbbell Floor Press', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell'],
    defaultRestSeconds: 90,
    aliases: ['DB floor press', 'floor press'],
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    keywords: ['floor press', 'chest', 'triceps', 'dumbbell', 'shoulder friendly'],
    technique: {
      setup: 'Lie on floor, knees bent; dumbbells at chest with elbows on ground at bottom.',
      cues: [
        'Press up until arms lock without shrugging.',
        'Pause briefly when upper arms touch floor.',
        'Keep wrists stacked over elbows.'
      ],
      commonMistakes: [
        'Bouncing elbows off floor to rebound reps.',
        'Over-arching lower back off the ground.',
        'Using momentum from hip drive.'
      ]
    }
  }),
  ex('chest-press-machine', 'Chest Press Machine', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Machine'],
    defaultRestSeconds: 90,
    aliases: ['machine chest press', 'seated chest press'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    keywords: ['chest', 'machine', 'push', 'beginner', 'upper body'],
    technique: {
      setup: 'Adjust seat so handles align with mid-chest; back flat on pad.',
      cues: [
        'Press handles forward to full extension.',
        'Control the return without letting stack slam.',
        'Keep shoulders down throughout the rep.'
      ],
      commonMistakes: [
        'Seat too low and pressing upward into shoulders.',
        'Shrugging at end range.',
        'Using partial reps with too much stack weight.'
      ]
    }
  })
];
