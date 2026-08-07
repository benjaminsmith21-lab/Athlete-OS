import { ex } from './helpers.js';

export const RUNNING = [
  ex('recovery-run', 'Recovery Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['easy recovery jog', 'shakeout run', 'very easy run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'recovery', 'easy', 'aerobic', 'legs', 'cardio'],
    technique: {
      setup: 'Start extra easy—slower than your normal easy pace.',
      cues: [
        'Stay fully conversational the entire run.',
        'Keep form relaxed with soft landings.',
        'Stop if anything feels sharp or worsening.'
      ],
      commonMistakes: [
        'Running too fast and adding fatigue.',
        'Skipping recovery runs when schedule is busy.',
        'Tensing up and shortening stride unnecessarily.'
      ]
    }
  }),
  ex('threshold-run', 'Threshold Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['lactate threshold run', 'cruise intervals', 'LT run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'threshold', 'tempo', 'speed', 'endurance', 'legs'],
    technique: {
      setup: 'Warm up 10–15 minutes easy; settle into comfortably hard sustained effort.',
      cues: [
        'Hold pace you could sustain for about an hour racing.',
        'Keep shoulders relaxed as effort rises.',
        'Finish with easy cooldown jog.'
      ],
      commonMistakes: [
        'Starting at race pace and fading early.',
        'Running threshold too often in a week.',
        'Letting form collapse when legs burn.'
      ]
    }
  }),
  ex('long-run', 'Long Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['LSD run', 'long slow distance', 'weekly long run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'long run', 'endurance', 'aerobic', 'legs', 'marathon prep'],
    technique: {
      setup: 'Plan route, fuel, and pace before starting; begin conservatively.',
      cues: [
        'Run mostly easy with optional moderate finish if prescribed.',
        'Practice race nutrition on longer efforts.',
        'Keep cadence steady as fatigue accumulates.'
      ],
      commonMistakes: [
        'Starting too fast on fresh legs.',
        'Neglecting hydration on warm days.',
        'Jumping long-run distance too quickly.'
      ]
    }
  }),
  ex('interval-run', 'Interval Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['track intervals', 'speed intervals', 'repeats'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'intervals', 'speed', 'VO2', 'track', 'legs'],
    technique: {
      setup: 'Warm up thoroughly; know work and rest durations before starting.',
      cues: [
        'Run hard intervals with tall posture and quick turnover.',
        'Jog or walk easy during rest until breathing recovers.',
        'Hit consistent splits rather than all-out first rep.'
      ],
      commonMistakes: [
        'Insufficient warm-up before fast reps.',
        'Rest too short to maintain quality.',
        'Sprinting first rep and dying on later intervals.'
      ]
    }
  }),
  ex('hill-repeats', 'Hill Repeats', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['hill sprints', 'hill intervals', 'incline repeats'],
    primaryMuscles: ['quads', 'glutes', 'calves'],
    secondaryMuscles: ['hamstrings', 'core'],
    keywords: ['running', 'hills', 'power', 'strength', 'legs', 'speed'],
    technique: {
      setup: 'Find moderate grade hill; warm up on flat ground first.',
      cues: [
        'Drive knees and lean slightly into hill.',
        'Power up with quick short strides.',
        'Jog down easy for recovery between reps.'
      ],
      commonMistakes: [
        'Choosing too steep a hill and breaking form.',
        'Walking down too slowly and cooling off.',
        'Starting reps before legs are warm.'
      ]
    }
  }),
  ex('progression-run', 'Progression Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['negative split run', 'build run', 'fast finish run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'progression', 'negative split', 'endurance', 'pacing', 'legs'],
    technique: {
      setup: 'Begin easy; divide run mentally into thirds or quarters.',
      cues: [
        'Each segment slightly faster than the last.',
        'Stay controlled—do not sprint early.',
        'Finish strong without blowing up last mile.'
      ],
      commonMistakes: [
        'Going out too fast and unable to progress.',
        'Saving all effort for a final sprint only.',
        'Ignoring effort cues and running by feel too aggressively.'
      ]
    }
  }),
  ex('run-walk', 'Run/Walk', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['run walk intervals', 'Jeff Galloway method', 'walk breaks'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'run walk', 'beginner', 'endurance', 'recovery', 'legs'],
    technique: {
      setup: 'Set run and walk intervals before starting (e.g. 2 min run / 1 min walk).',
      cues: [
        'Start walk breaks before you feel exhausted.',
        'Keep run portions at easy to moderate effort.',
        'Use walk periods to reset form and breathing.'
      ],
      commonMistakes: [
        'Skipping walk breaks when feeling good early.',
        'Running too hard between walks.',
        'Walking too slowly and stiffening up.'
      ]
    }
  })
];
