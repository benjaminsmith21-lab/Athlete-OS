import { ex } from './helpers.js';

export const SQUAT_LUNGE = [
  ex('bodyweight-squat', 'Bodyweight Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['air squat', 'BW squat', 'squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['squat', 'legs', 'bodyweight', 'quads', 'glutes', 'fundamental'],
    technique: {
      setup: 'Stand with feet shoulder-width, toes slightly out; arms forward or at chest.',
      cues: [
        'Sit hips back and down keeping chest up.',
        'Drive knees out over toes throughout.',
        'Stand by pushing floor away and squeezing glutes.'
      ],
      commonMistakes: [
        'Heels lifting off the ground.',
        'Knees collapsing inward.',
        'Rounding upper back at the bottom.'
      ]
    }
  }),
  ex('front-squat', 'Front Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 120,
    aliases: ['barbell front squat', 'clean-grip squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['core', 'upper back', 'hamstrings'],
    keywords: ['squat', 'legs', 'barbell', 'quads', 'core', 'olympic'],
    technique: {
      setup: 'Rack bar on front delts with elbows high; feet shoulder-width.',
      cues: [
        'Keep elbows up so bar stays on shoulders.',
        'Sit straight down between hips with torso upright.',
        'Drive up through mid-foot keeping chest proud.'
      ],
      commonMistakes: [
        'Elbows dropping and bar rolling forward.',
        'Leaning too far forward and losing rack position.',
        'Cutting depth when mobility allows full range.'
      ]
    }
  }),
  ex('back-squat', 'Back Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'weighted_reps',
    equipment: ['Barbell'],
    defaultRestSeconds: 120,
    aliases: ['barbell back squat', 'high-bar squat', 'low-bar squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'lower back'],
    keywords: ['squat', 'legs', 'barbell', 'quads', 'glutes', 'strength'],
    technique: {
      setup: 'Bar on upper back; brace core and unrack with feet hip-to-shoulder width.',
      cues: [
        'Break at hips and knees together on descent.',
        'Keep knees tracking over toes and mid-foot pressure.',
        'Stand aggressively while maintaining brace.'
      ],
      commonMistakes: [
        'Good-morning out of the hole with hips rising first.',
        'Knees caving on the way up.',
        'Losing upper back tightness under load.'
      ]
    }
  }),
  ex('box-squat', 'Box Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'weighted_reps',
    equipment: ['Barbell', 'Bench'],
    defaultRestSeconds: 120,
    aliases: ['box back squat', 'paused box squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'lower back'],
    keywords: ['squat', 'legs', 'barbell', 'box', 'pause', 'strength'],
    technique: {
      setup: 'Set box at parallel or just below; bar on back, sit back to touch lightly.',
      cues: [
        'Reach hips back until glutes kiss the box.',
        'Pause briefly without fully relaxing tension.',
        'Drive up explosively from a dead stop.'
      ],
      commonMistakes: [
        'Plopping onto the box and losing brace.',
        'Rocking forward to cheat the ascent.',
        'Using a box too low for current mobility.'
      ]
    }
  }),
  ex('split-squat', 'Split Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['static lunge', 'stationary split squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['lunge', 'split squat', 'legs', 'single leg', 'quads', 'glutes'],
    technique: {
      setup: 'Stagger feet front to back; rear heel elevated or on toes.',
      cues: [
        'Drop straight down keeping torso slightly forward.',
        'Front knee tracks over toes without collapsing.',
        'Drive through front heel to return up.'
      ],
      commonMistakes: [
        'Taking too narrow a stance and losing balance.',
        'Pushing off back foot instead of loading front leg.',
        'Letting front knee dive past toes with heel lift.'
      ]
    }
  }),
  ex('reverse-lunge', 'Reverse Lunge', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['backward lunge', 'step-back lunge'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['lunge', 'legs', 'single leg', 'quads', 'glutes', 'bodyweight'],
    technique: {
      setup: 'Stand tall; step one foot back into a long stagger.',
      cues: [
        'Lower until back knee hovers just above floor.',
        'Keep front shin mostly vertical.',
        'Push through front foot to step back to start.'
      ],
      commonMistakes: [
        'Stepping too short and knee passing toes excessively.',
        'Leaning torso sideways for balance.',
        'Dropping back knee hard into the ground.'
      ]
    }
  }),
  ex('forward-lunge', 'Forward Lunge', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['walking lunge step', 'step-forward lunge'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['lunge', 'legs', 'single leg', 'quads', 'forward', 'bodyweight'],
    technique: {
      setup: 'Stand tall and step forward into a long lunge position.',
      cues: [
        'Lower under control until back knee nearly touches.',
        'Keep front knee aligned over ankle.',
        'Drive through front heel to return or continue walking.'
      ],
      commonMistakes: [
        'Overstriding and losing stability on front knee.',
        'Pushing off back toes to stand instead of front heel.',
        'Torso collapsing forward at the bottom.'
      ]
    }
  }),
  ex('walking-lunge', 'Walking Lunge', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['dynamic lunge', 'traveling lunge'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['lunge', 'legs', 'walking', 'quads', 'glutes', 'conditioning'],
    technique: {
      setup: 'Stand with feet together; take a long step forward into lunge.',
      cues: [
        'Drop back knee toward floor with control.',
        'Push through front leg to step through to next rep.',
        'Keep torso upright and eyes forward.'
      ],
      commonMistakes: [
        'Steps too short creating crowded knee angles.',
        'Wobbling side to side without bracing core.',
        'Rushing reps and bouncing off the back knee.'
      ]
    }
  }),
  ex('step-up', 'Step-up', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bench', 'Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['box step-up', 'bench step-up'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['step-up', 'legs', 'single leg', 'quads', 'glutes', 'bench'],
    technique: {
      setup: 'Place whole foot on box or bench; stand tall before stepping.',
      cues: [
        'Drive through the heel of the elevated foot only.',
        'Stand fully on top without pushing off back leg.',
        'Step down under control and alternate legs.'
      ],
      commonMistakes: [
        'Pushing off the trailing foot to assist.',
        'Using a box too high and compensating with torso swing.',
        'Letting knee cave inward on the drive up.'
      ]
    }
  }),
  ex('lateral-lunge', 'Lateral Lunge', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['side lunge', 'Cossack variation'],
    primaryMuscles: ['quads', 'glutes', 'adductors'],
    secondaryMuscles: ['hamstrings', 'core'],
    keywords: ['lunge', 'lateral', 'legs', 'adductors', 'mobility', 'single leg'],
    technique: {
      setup: 'Stand wide; shift weight to one leg keeping opposite leg straight.',
      cues: [
        'Sit hips back into the working leg.',
        'Keep chest up and heel flat on the bent side.',
        'Push floor away to return to center.'
      ],
      commonMistakes: [
        'Toes lifting on the bent leg side.',
        'Rounding back to reach lower.',
        'Collapsing knee inward on the working leg.'
      ]
    }
  }),
  ex('cossack-squat', 'Cossack Squat', {
    category: 'Mobility',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['side-to-side squat', 'Cossack'],
    primaryMuscles: ['quads', 'adductors', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    keywords: ['mobility', 'squat', 'lateral', 'adductors', 'legs', 'flexibility'],
    technique: {
      setup: 'Take a very wide stance; shift side to side with one leg bending, one straight.',
      cues: [
        'Keep heel down on the bent leg if possible.',
        'Sit deep while opposite foot stays flexed heel-down or toe-up.',
        'Move slowly through each side with control.'
      ],
      commonMistakes: [
        'Falling into depth without control.',
        'Both heels lifting and losing stability.',
        'Rushing side to side without owning range.'
      ]
    }
  }),
  ex('wall-sit', 'Wall Sit', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['wall squat hold', 'isometric squat'],
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'core', 'calves'],
    keywords: ['isometric', 'legs', 'quads', 'endurance', 'bodyweight', 'hold'],
    technique: {
      setup: 'Back flat against wall; slide down until thighs are parallel to floor.',
      cues: [
        'Keep knees stacked over ankles at 90°.',
        'Press lower back into wall without sliding up.',
        'Breathe steadily for the full hold duration.'
      ],
      commonMistakes: [
        'Thighs above parallel and calling it a full sit.',
        'Hands on knees taking load off quads.',
        'Knees drifting past toes with heels lifting.'
      ]
    }
  })
];
