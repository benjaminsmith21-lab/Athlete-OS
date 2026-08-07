import { ex } from './helpers.js';

export const CONDITIONING = [
  ex('hiking', 'Hiking', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['trail hike', 'hill hike', 'nature walk'],
    primaryMuscles: ['quads', 'glutes', 'calves'],
    secondaryMuscles: ['hamstrings', 'core'],
    keywords: ['cardio', 'hiking', 'outdoor', 'legs', 'endurance', 'conditioning'],
    technique: {
      setup: 'Wear appropriate footwear; pack water for longer routes.',
      cues: [
        'Use shorter steps on steep climbs.',
        'Keep upright torso and active poles if used.',
        'Descend with control to save knees.'
      ],
      commonMistakes: [
        'Overstriding downhill and pounding joints.',
        'Under-fueling on long hikes.',
        'Ignoring weather and trail conditions.'
      ]
    }
  }),
  ex('cycling', 'Cycling', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Bike', 'Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['bike ride', 'road cycling', 'indoor cycling'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    keywords: ['cardio', 'cycling', 'bike', 'legs', 'endurance', 'low impact'],
    technique: {
      setup: 'Adjust saddle height; start easy to warm legs and spin.',
      cues: [
        'Maintain smooth cadence around 80–100 rpm.',
        'Keep shoulders relaxed on handlebars.',
        'Modulate effort for prescribed zone or duration.'
      ],
      commonMistakes: [
        'Saddle too low causing knee stress.',
        'Mashing heavy gear with low cadence.',
        'Grip too tight causing neck and arm tension.'
      ]
    }
  }),
  ex('rowing-machine', 'Rowing Machine', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Rowing Machine'],
    defaultRestSeconds: 0,
    aliases: ['erg row', 'Concept2 row', 'indoor row'],
    primaryMuscles: ['lats', 'quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'core', 'biceps'],
    keywords: ['cardio', 'rowing', 'erg', 'full body', 'conditioning', 'endurance'],
    technique: {
      setup: 'Strap feet secure; grab handle with flat back at catch.',
      cues: [
        'Drive with legs first, then lean, then pull arms.',
        'Return in reverse order: arms, body, legs.',
        'Keep stroke ratio controlled—not rushed.'
      ],
      commonMistakes: [
        'Pulling with arms before leg drive.',
        'Rounding upper back at catch.',
        'Rushing recovery and shortening stroke.'
      ]
    }
  }),
  ex('ski-erg', 'Ski Erg', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Machine'],
    defaultRestSeconds: 0,
    aliases: ['ski ergometer', 'Concept2 ski', 'skierg'],
    primaryMuscles: ['lats', 'triceps'],
    secondaryMuscles: ['core', 'glutes', 'shoulders'],
    keywords: ['cardio', 'ski erg', 'conditioning', 'upper body', 'full body'],
    technique: {
      setup: 'Stand facing machine; grip handles overhead with slight knee bend.',
      cues: [
        'Hinge and pull handles down past hips powerfully.',
        'Extend arms forward on recovery with control.',
        'Use legs and core—not just arms—for drive.'
      ],
      commonMistakes: [
        'Arms-only pulling without hip hinge.',
        'Standing too upright and losing power.',
        'Short choppy strokes at max tension always.'
      ]
    }
  }),
  ex('assault-bike', 'Assault Bike', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'timed',
    equipment: ['Bike', 'Machine'],
    defaultRestSeconds: 60,
    aliases: ['air bike', 'fan bike', 'Airdyne'],
    primaryMuscles: ['quads', 'shoulders'],
    secondaryMuscles: ['glutes', 'hamstrings', 'triceps', 'core'],
    keywords: ['cardio', 'assault bike', 'conditioning', 'intervals', 'full body'],
    technique: {
      setup: 'Adjust seat; grip moving handles and pedals lightly at start.',
      cues: [
        'Push and pull handles in sync with leg drive.',
        'Stay seated for steady efforts; stand for sprints if needed.',
        'Build pace gradually on longer intervals.'
      ],
      commonMistakes: [
        'All-out first 10 seconds on long intervals.',
        'Hunching forward and restricting breathing.',
        'Grip death-gripping handles and tensing neck.'
      ]
    }
  }),
  ex('jump-rope', 'Jump Rope', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'timed',
    equipment: ['Other'],
    defaultRestSeconds: 45,
    aliases: ['skipping rope', 'rope skipping', 'speed rope'],
    primaryMuscles: ['calves'],
    secondaryMuscles: ['quads', 'shoulders', 'forearms', 'core'],
    keywords: ['cardio', 'jump rope', 'conditioning', 'coordination', 'calves', 'warm-up'],
    technique: {
      setup: 'Rope behind heels; elbows in, wrists turning the rope.',
      cues: [
        'Jump just high enough for rope to pass.',
        'Land softly on balls of feet.',
        'Keep shoulders relaxed and gaze forward.'
      ],
      commonMistakes: [
        'Jumping too high and wasting energy.',
        'Swinging arms from shoulders not wrists.',
        'Starting too fast before rhythm is established.'
      ]
    }
  }),
  ex('burpee', 'Burpee', {
    category: 'Cardio',
    movementPattern: 'other',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['squat thrust jump', 'full burpee'],
    primaryMuscles: ['quads', 'chest'],
    secondaryMuscles: ['shoulders', 'core', 'glutes', 'calves'],
    keywords: ['conditioning', 'burpee', 'full body', 'cardio', 'HIIT', 'bodyweight'],
    technique: {
      setup: 'Stand tall; drop hands to floor and jump feet to plank.',
      cues: [
        'Chest touches floor or perform a clean push-up.',
        'Jump feet forward and stand explosively.',
        'Optional small jump at top with soft landing.'
      ],
      commonMistakes: [
        'Worming up with sagging hips in plank.',
        'Landing hard with locked knees.',
        'Rushing reps and losing push-up quality.'
      ]
    }
  }),
  ex('step-ups-for-time', 'Step-ups for Time', {
    category: 'Cardio',
    movementPattern: 'squat',
    trackingType: 'timed',
    equipment: ['Bench', 'Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['timed step-ups', 'box step-ups AMRAP'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    keywords: ['conditioning', 'step-up', 'legs', 'timed', 'cardio', 'quads'],
    technique: {
      setup: 'Set timer; use box height where you can maintain pace without push-off.',
      cues: [
        'Drive through top foot only each rep.',
        'Alternate legs or stick to one side per round as prescribed.',
        'Stand fully on box before stepping down.'
      ],
      commonMistakes: [
        'Pushing off back leg to cheat reps.',
        'Box too high and slowing cadence.',
        'Slapping down on floor and jarring knees.'
      ]
    }
  }),
  ex('battle-ropes', 'Battle Ropes', {
    category: 'Cardio',
    movementPattern: 'other',
    trackingType: 'timed',
    equipment: ['Other'],
    defaultRestSeconds: 60,
    aliases: ['rope slams', 'alternating waves', 'heavy ropes'],
    primaryMuscles: ['shoulders', 'core'],
    secondaryMuscles: ['forearms', 'glutes', 'quads'],
    keywords: ['conditioning', 'battle ropes', 'shoulders', 'core', 'HIIT', 'cardio'],
    technique: {
      setup: 'Anchor ropes; athletic stance with slight knee bend.',
      cues: [
        'Create waves from core and shoulders—not just arms.',
        'Stay rooted through hips and glutes.',
        'Maintain steady breathing for interval length.'
      ],
      commonMistakes: [
        'Standing upright and isolating arms only.',
        'Holding breath during entire interval.',
        'Ropes too slack reducing wave quality.'
      ]
    }
  }),
  ex('sled-push', 'Sled Push', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Other'],
    defaultRestSeconds: 90,
    aliases: ['prowler push', 'sled drive', 'heavy sled'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['calves', 'core', 'shoulders'],
    keywords: ['conditioning', 'sled', 'legs', 'power', 'push', 'strongman'],
    technique: {
      setup: 'Hands on high or low handles; body angled into sled.',
      cues: [
        'Drive through balls of feet with short powerful steps.',
        'Keep hips low and core braced.',
        'Push continuously without pausing mid-distance.'
      ],
      commonMistakes: [
        'Hips rising too high losing drive angle.',
        'Arms bending and absorbing instead of legs driving.',
        'Loading sled so heavy you cannot move steadily.'
      ]
    }
  }),
  ex('treadmill-walk', 'Treadmill Walk', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Treadmill'],
    defaultRestSeconds: 0,
    aliases: ['incline walk', 'TM walk', 'walking cardio'],
    primaryMuscles: ['quads', 'glutes', 'calves'],
    secondaryMuscles: ['hamstrings', 'core'],
    keywords: ['cardio', 'treadmill', 'walk', 'incline', 'low impact', 'recovery'],
    technique: {
      setup: 'Set comfortable speed; add incline gradually if desired.',
      cues: [
        'Walk tall without holding rails unless needed for balance.',
        'Land heel to toe with active glutes on incline.',
        'Keep pace conversational for recovery sessions.'
      ],
      commonMistakes: [
        'Holding rails and leaning back on incline.',
        'Oversteep incline causing hip flexor strain.',
        'Stepping off belt while still moving.'
      ]
    }
  }),
  ex('elliptical', 'Elliptical', {
    category: 'Cardio',
    movementPattern: 'locomotion',
    trackingType: 'timed',
    equipment: ['Machine'],
    defaultRestSeconds: 0,
    aliases: ['cross trainer', 'elliptical trainer'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    keywords: ['cardio', 'elliptical', 'low impact', 'machine', 'conditioning', 'recovery'],
    technique: {
      setup: 'Step onto pedals; grip handles lightly and stand centered.',
      cues: [
        'Drive through whole foot with smooth circular stride.',
        'Keep upright posture without leaning on handles.',
        'Use arms actively if moving handles are available.'
      ],
      commonMistakes: [
        'Slouching forward and short-striding.',
        'Locking knees at bottom of stroke.',
        'Resistance too high forcing slow grind always.'
      ]
    }
  })
];
