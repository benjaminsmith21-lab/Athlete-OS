import { ex } from './helpers.js';

export const CORE = [
  ex('plank', 'Plank', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['front plank', 'forearm plank', 'high plank'],
    primaryMuscles: ['core', 'abs'],
    secondaryMuscles: ['shoulders', 'glutes'],
    keywords: ['core', 'plank', 'abs', 'isometric', 'stability', 'bodyweight'],
    technique: {
      setup: 'Forearms or hands on floor; body straight from head to heels.',
      cues: [
        'Brace abs like preparing for a punch.',
        'Squeeze glutes without piking hips.',
        'Keep neck neutral looking at floor.'
      ],
      commonMistakes: [
        'Hips sagging toward floor.',
        'Piking hips up to make it easier.',
        'Holding breath the entire duration.'
      ]
    }
  }),
  ex('side-plank', 'Side Plank', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['side bridge', 'lateral plank'],
    primaryMuscles: ['obliques', 'core'],
    secondaryMuscles: ['shoulders', 'glutes'],
    keywords: ['core', 'obliques', 'side plank', 'lateral', 'stability', 'rehab'],
    technique: {
      setup: 'Forearm on floor, elbow under shoulder; stack feet or stagger for balance.',
      cues: [
        'Lift hips to straight line from head to feet.',
        'Drive top hip forward slightly.',
        'Hold without letting hips drop or rotate.'
      ],
      commonMistakes: [
        'Hips sagging toward floor.',
        'Shoulder collapsing away from ear.',
        'Rotating chest toward floor.'
      ]
    }
  }),
  ex('dead-bug', 'Dead Bug', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['deadbug', 'alternating dead bug'],
    primaryMuscles: ['core', 'abs'],
    secondaryMuscles: ['hip flexors'],
    keywords: ['core', 'abs', 'dead bug', 'anti-extension', 'rehab', 'low back'],
    technique: {
      setup: 'Lie on back, arms up, hips and knees at 90°; press low back into floor.',
      cues: [
        'Extend opposite arm and leg slowly.',
        'Keep ribs down and back flat on floor.',
        'Return and alternate sides with control.'
      ],
      commonMistakes: [
        'Lower back arching off floor.',
        'Moving too fast and losing tension.',
        'Holding breath instead of steady breathing.'
      ]
    }
  }),
  ex('bird-dog', 'Bird Dog', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['quadruped reach', 'opposite arm leg extension'],
    primaryMuscles: ['core', 'lower back'],
    secondaryMuscles: ['glutes', 'shoulders'],
    keywords: ['core', 'bird dog', 'stability', 'rehab', 'low back', 'balance'],
    technique: {
      setup: 'Hands under shoulders, knees under hips; spine neutral.',
      cues: [
        'Reach opposite arm and leg long.',
        'Keep hips square without rotating.',
        'Hold briefly, return, and switch sides.'
      ],
      commonMistakes: [
        'Rotating hips open to lift leg higher.',
        'Arching lower back excessively.',
        'Rushing reps without pause at end range.'
      ]
    }
  }),
  ex('hollow-hold', 'Hollow Hold', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['hollow body hold', 'gymnastics hollow'],
    primaryMuscles: ['abs', 'core'],
    secondaryMuscles: ['hip flexors', 'quads'],
    keywords: ['core', 'abs', 'hollow', 'gymnastics', 'isometric', 'anti-extension'],
    technique: {
      setup: 'Lie on back; lift shoulders and legs off floor with low back pressed down.',
      cues: [
        'Reach arms overhead and toes forward.',
        'Ribs down—create a shallow banana shape.',
        'Breathe shallowly while maintaining tension.'
      ],
      commonMistakes: [
        'Lower back peeling off floor.',
        'Neck craning forward aggressively.',
        'Legs too low for current strength level.'
      ]
    }
  }),
  ex('pallof-press', 'Pallof Press', {
    category: 'Core',
    movementPattern: 'other',
    trackingType: 'reps',
    equipment: ['Cable Machine', 'Resistance Band'],
    defaultRestSeconds: 45,
    aliases: ['anti-rotation press', 'Pallof hold'],
    primaryMuscles: ['core', 'obliques'],
    secondaryMuscles: ['shoulders', 'glutes'],
    keywords: ['core', 'anti-rotation', 'Pallof', 'band', 'cable', 'obliques', 'rehab'],
    technique: {
      setup: 'Stand sideways to cable or band at chest height; hold handle at sternum.',
      cues: [
        'Press straight out resisting pull toward anchor.',
        'Hold extended position without twisting.',
        'Return handle to chest under control.'
      ],
      commonMistakes: [
        'Rotating torso toward the cable.',
        'Standing too close and reducing challenge.',
        'Shrugging shoulder on pressing arm.'
      ]
    }
  }),
  ex('suitcase-march', 'Suitcase March', {
    category: 'Core',
    movementPattern: 'carry',
    trackingType: 'reps',
    equipment: ['Kettlebell', 'Dumbbell'],
    defaultRestSeconds: 45,
    aliases: ['loaded march', 'single-arm march'],
    primaryMuscles: ['core', 'obliques'],
    secondaryMuscles: ['glutes', 'forearms', 'hip flexors'],
    keywords: ['core', 'march', 'carry', 'anti-lateral', 'obliques', 'KB', 'stability'],
    technique: {
      setup: 'Hold one bell at side; stand tall with ribs down.',
      cues: [
        'March slowly lifting knees without leaning.',
        'Keep shoulders level throughout.',
        'Switch sides after prescribed reps or time.'
      ],
      commonMistakes: [
        'Leaning toward loaded side each step.',
        'Rushing march and losing control.',
        'Using too heavy a load and compensating.'
      ]
    }
  }),
  ex('bear-crawl', 'Bear Crawl', {
    category: 'Core',
    movementPattern: 'locomotion',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['quadruped crawl', 'bear walk'],
    primaryMuscles: ['core', 'shoulders'],
    secondaryMuscles: ['quads', 'glutes', 'hip flexors'],
    keywords: ['core', 'crawl', 'conditioning', 'shoulders', 'coordination', 'warm-up'],
    technique: {
      setup: 'Hands under shoulders, knees under hips; lift knees 1–2 inches off floor.',
      cues: [
        'Move opposite hand and foot together.',
        'Keep back flat and knees low.',
        'Take small controlled steps forward or backward.'
      ],
      commonMistakes: [
        'Hips bouncing side to side.',
        'Knees too high turning it into a squat walk.',
        'Looking up and losing neutral neck.'
      ]
    }
  }),
  ex('mountain-climber', 'Mountain Climber', {
    category: 'Core',
    movementPattern: 'locomotion',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['running plank', 'alternating knee drive'],
    primaryMuscles: ['core', 'hip flexors'],
    secondaryMuscles: ['shoulders', 'quads', 'calves'],
    keywords: ['core', 'conditioning', 'cardio', 'mountain climber', 'abs', 'warm-up'],
    technique: {
      setup: 'High plank position; shoulders over wrists, body straight.',
      cues: [
        'Drive one knee toward chest without hips piking.',
        'Alternate legs with rhythm or controlled tempo.',
        'Keep hands planted and core braced.'
      ],
      commonMistakes: [
        'Hips shooting up into downward dog.',
        'Bouncing on toes and losing plank line.',
        'Letting shoulders drift behind wrists.'
      ]
    }
  })
];
