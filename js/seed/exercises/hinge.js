import { ex } from './helpers.js';

export const HINGE = [
  ex('deadlift', 'Deadlift', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 120,
    aliases: ['conventional deadlift', 'barbell deadlift', 'DL'],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower back', 'traps', 'forearms', 'core'],
    keywords: ['deadlift', 'hinge', 'barbell', 'posterior chain', 'glutes', 'hamstrings', 'grip'],
    technique: {
      setup: 'Bar over mid-foot; grip just outside legs, hips higher than knees, flat back.',
      cues: [
        'Push floor away and keep bar close to shins.',
        'Lock out by squeezing glutes, not hyperextending back.',
        'Hinge hips back for a controlled descent.'
      ],
      commonMistakes: [
        'Rounding lower back to move weight.',
        'Bar drifting forward away from body.',
        'Jerking bar off floor with hips shooting up first.'
      ]
    }
  }),
  ex('romanian-deadlift', 'Romanian Deadlift', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 90,
    aliases: ['RDL', 'barbell RDL', 'stiff-leg deadlift variation'],
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower back', 'forearms', 'core'],
    keywords: ['RDL', 'hinge', 'hamstrings', 'glutes', 'barbell', 'posterior chain'],
    technique: {
      setup: 'Start standing with bar at hips; soft knees, shoulders packed.',
      cues: [
        'Push hips back while bar slides down thighs.',
        'Stop when hamstrings stretch or back starts to round.',
        'Drive hips forward to stand without squatting.'
      ],
      commonMistakes: [
        'Turning it into a squat by bending knees too much.',
        'Rounding upper or lower back at bottom.',
        'Letting bar drift away from legs.'
      ]
    }
  }),
  ex('kettlebell-deadlift', 'Kettlebell Deadlift', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB deadlift', 'sumo KB deadlift', 'bell deadlift'],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower back', 'forearms', 'core'],
    keywords: ['deadlift', 'kettlebell', 'KB', 'hinge', 'glutes', 'hamstrings', 'fundamental'],
    technique: {
      setup: 'KB between feet; hinge and grip handle with flat back.',
      cues: [
        'Wedge hips back and keep chest proud.',
        'Drive through heels and stand tall at top.',
        'Lower by hinging, not squatting the bell down.'
      ],
      commonMistakes: [
        'Squatting down with shoulders ahead of hips.',
        'Rounding back to pick up heavier bells.',
        'Hyperextending at lockout.'
      ]
    }
  }),
  ex('hip-thrust', 'Hip Thrust', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell', 'Bench'],
    defaultRestSeconds: 90,
    aliases: ['barbell hip thrust', 'glute thrust'],
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'quads'],
    keywords: ['glutes', 'hip thrust', 'barbell', 'posterior chain', 'legs'],
    technique: {
      setup: 'Upper back on bench, bar over hips; feet flat shoulder-width.',
      cues: [
        'Drive hips up until torso is parallel to floor.',
        'Squeeze glutes hard at top without arching low back.',
        'Lower under control keeping chin tucked.'
      ],
      commonMistakes: [
        'Hyperextending lumbar spine at lockout.',
        'Feet too far forward and feeling quads not glutes.',
        'Bouncing reps off the bench.'
      ]
    }
  }),
  ex('glute-bridge', 'Glute Bridge', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['hip bridge', 'BW glute bridge'],
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    keywords: ['glutes', 'bridge', 'bodyweight', 'hips', 'posterior chain', 'rehab'],
    technique: {
      setup: 'Lie on back, knees bent, feet flat hip-width; arms at sides.',
      cues: [
        'Drive through heels and squeeze glutes at top.',
        'Create straight line from knees to shoulders.',
        'Lower slowly without dropping pelvis abruptly.'
      ],
      commonMistakes: [
        'Pushing through toes and cramping hamstrings.',
        'Overarching lower back at the top.',
        'Rushing reps without end-range squeeze.'
      ]
    }
  }),
  ex('good-morning', 'Good Morning', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 90,
    aliases: ['barbell good morning', 'GM'],
    primaryMuscles: ['hamstrings', 'lower back'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['hinge', 'hamstrings', 'barbell', 'posterior chain', 'good morning'],
    technique: {
      setup: 'Bar on upper back like a squat; feet hip-width, soft knees.',
      cues: [
        'Push hips back keeping shins vertical.',
        'Maintain flat back until hamstrings limit range.',
        'Drive hips forward to stand tall.'
      ],
      commonMistakes: [
        'Rounding spine under load.',
        'Bending knees into a squat pattern.',
        'Using too much weight too soon.'
      ]
    }
  }),
  ex('cable-pull-through', 'Cable Pull-through', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Cable Machine'],
    defaultRestSeconds: 60,
    aliases: ['rope pull-through', 'cable hip hinge'],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'lower back'],
    keywords: ['hinge', 'cable', 'glutes', 'hamstrings', 'posterior chain'],
    technique: {
      setup: 'Face away from low cable; rope between legs, hinge to reach back.',
      cues: [
        'Hinge with flat back until hamstrings stretch.',
        'Snap hips forward pulling rope through legs.',
        'Stand tall squeezing glutes without leaning back.'
      ],
      commonMistakes: [
        'Squatting instead of hinging.',
        'Using arms to yank the cable.',
        'Overextending lower back at finish.'
      ]
    }
  }),
  ex('trap-bar-deadlift', 'Trap Bar Deadlift', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 120,
    aliases: ['hex bar deadlift', 'hex bar DL', 'trap bar DL'],
    primaryMuscles: ['glutes', 'quads', 'hamstrings'],
    secondaryMuscles: ['traps', 'forearms', 'core'],
    keywords: ['deadlift', 'trap bar', 'hex bar', 'hinge', 'legs', 'grip'],
    technique: {
      setup: 'Step inside trap bar; grip handles, chest up, hips down and back.',
      cues: [
        'Push floor away keeping chest proud.',
        'Drive through whole foot to stand.',
        'Lower by hinging hips back with control.'
      ],
      commonMistakes: [
        'Treating it like a squat with upright torso only.',
        'Shrugging shoulders at lockout.',
        'Letting knees collapse inward on heavy reps.'
      ]
    }
  }),
  ex('sumo-deadlift', 'Sumo Deadlift', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 120,
    aliases: ['sumo DL', 'wide-stance deadlift'],
    primaryMuscles: ['glutes', 'quads', 'adductors'],
    secondaryMuscles: ['hamstrings', 'lower back', 'traps', 'forearms'],
    keywords: ['deadlift', 'sumo', 'barbell', 'hinge', 'glutes', 'legs', 'grip'],
    technique: {
      setup: 'Wide stance, toes out; grip bar inside knees, hips close to bar.',
      cues: [
        'Spread floor with feet and push knees out.',
        'Keep chest up and bar close up the legs.',
        'Lock out with glutes, not lumbar hyperextension.'
      ],
      commonMistakes: [
        'Hips shooting up and turning it into a stiff-leg pull.',
        'Bar drifting forward around the knees.',
        'Stance too wide to maintain tension.'
      ]
    }
  })
];
