import { ex } from './helpers.js';

export const SHOULDER_STABILITY = [
  ex('serratus-wall-slide', 'Serratus Wall Slide', {
    category: 'Shoulder / Rehab',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['wall slide with protraction', 'serratus slide'],
    primaryMuscles: ['serratus'],
    secondaryMuscles: ['shoulders', 'traps'],
    keywords: ['serratus', 'shoulders', 'rehab', 'wall slide', 'scapular', 'prehab'],
    technique: {
      setup: 'Forearms on wall, elbows at 90°; stand close enough to keep contact.',
      cues: [
        'Slide arms up while reaching into the wall.',
        'Protract shoulder blades at the top.',
        'Lower slowly maintaining forearm contact.'
      ],
      commonMistakes: [
        'Arching lower back to reach higher.',
        'Losing wall contact with forearms.',
        'Shrugging instead of reaching through serratus.'
      ]
    }
  }),
  ex('band-external-rotation', 'Band External Rotation', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Resistance Band'],
    defaultRestSeconds: 45,
    aliases: ['external rotation', 'ER band pull', 'rotator cuff ER'],
    primaryMuscles: ['rotator cuff'],
    secondaryMuscles: ['rear delts'],
    keywords: ['shoulders', 'rehab', 'rotator cuff', 'band', 'external rotation', 'prehab'],
    technique: {
      setup: 'Anchor band at elbow height; elbow bent 90° tucked to side.',
      cues: [
        'Rotate hand outward keeping elbow pinned.',
        'Pause at end range without leaning back.',
        'Return slowly resisting band tension.'
      ],
      commonMistakes: [
        'Elbow drifting away from ribs.',
        'Using trunk rotation to finish reps.',
        'Band tension too heavy and losing control.'
      ]
    }
  }),
  ex('band-internal-rotation', 'Band Internal Rotation', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Resistance Band'],
    defaultRestSeconds: 45,
    aliases: ['internal rotation', 'IR band pull'],
    primaryMuscles: ['rotator cuff'],
    secondaryMuscles: ['chest', 'lats'],
    keywords: ['shoulders', 'rehab', 'rotator cuff', 'band', 'internal rotation', 'prehab'],
    technique: {
      setup: 'Stand with band anchored to outside; elbow at 90° against side.',
      cues: [
        'Rotate forearm across body keeping elbow fixed.',
        'Move through comfortable range only.',
        'Control return without snapping back.'
      ],
      commonMistakes: [
        'Elbow lifting away from torso.',
        'Shrugging shoulder during rotation.',
        'Forcing range when shoulder feels pinchy.'
      ]
    }
  }),
  ex('y-raise', 'Y Raise', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Dumbbell', 'Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['prone Y raise', 'incline Y raise'],
    primaryMuscles: ['rear delts', 'traps'],
    secondaryMuscles: ['rotator cuff', 'lower traps'],
    keywords: ['shoulders', 'Y raise', 'rear delts', 'rehab', 'posture', 'prehab'],
    technique: {
      setup: 'Chest on incline bench or floor; arms hang with thumbs up.',
      cues: [
        'Raise arms in a Y shape to about 45° overhead.',
        'Lead with thumbs and keep shoulders down.',
        'Lower slowly without swinging.'
      ],
      commonMistakes: [
        'Shrugging traps to lift higher.',
        'Using momentum from hips.',
        'Going too heavy and losing Y arm path.'
      ]
    }
  }),
  ex('t-raise', 'T Raise', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Dumbbell', 'Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['prone T raise', 'incline T raise'],
    primaryMuscles: ['rear delts', 'rhomboids'],
    secondaryMuscles: ['traps', 'rotator cuff'],
    keywords: ['shoulders', 'T raise', 'rear delts', 'rehab', 'posture', 'upper back'],
    technique: {
      setup: 'Chest supported on bench; arms hang straight down palms facing in.',
      cues: [
        'Raise arms straight out to sides forming a T.',
        'Squeeze shoulder blades at top.',
        'Lower with control to full stretch.'
      ],
      commonMistakes: [
        'Bending elbows into a row pattern.',
        'Lifting chest off bench to cheat range.',
        'Using weight that causes shrugging.'
      ]
    }
  }),
  ex('prone-y', 'Prone Y', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['floor Y raise', 'swimmer Y'],
    primaryMuscles: ['lower traps', 'rear delts'],
    secondaryMuscles: ['traps', 'rotator cuff'],
    keywords: ['shoulders', 'prone Y', 'lower traps', 'rehab', 'posture', 'prehab'],
    technique: {
      setup: 'Lie face down; arms overhead in Y with thumbs pointing up.',
      cues: [
        'Lift arms slightly off floor using upper back.',
        'Keep neck neutral and gaze down.',
        'Hold briefly at top before lowering.'
      ],
      commonMistakes: [
        'Cranking neck to look forward.',
        'Lifting chest aggressively off floor.',
        'Shrugging instead of using lower traps.'
      ]
    }
  }),
  ex('prone-t', 'Prone T', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['floor T raise', 'prone T raise'],
    primaryMuscles: ['rear delts', 'rhomboids'],
    secondaryMuscles: ['traps', 'rotator cuff'],
    keywords: ['shoulders', 'prone T', 'rear delts', 'rehab', 'posture', 'upper back'],
    technique: {
      setup: 'Lie face down; arms out to sides at 90° with thumbs up.',
      cues: [
        'Lift arms toward ceiling squeezing upper back.',
        'Keep shoulders away from ears.',
        'Lower slowly to floor between reps.'
      ],
      commonMistakes: [
        'Bending elbows to shorten lever.',
        'Over-lifting chest and arching lumbar.',
        'Rushing reps without scapular squeeze.'
      ]
    }
  }),
  ex('scapular-push-up', 'Scapular Push-up', {
    category: 'Shoulder / Rehab',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['scap push-up', 'protraction push-up'],
    primaryMuscles: ['serratus'],
    secondaryMuscles: ['chest', 'shoulders', 'core'],
    keywords: ['scapular', 'serratus', 'push-up', 'shoulders', 'rehab', 'prehab'],
    technique: {
      setup: 'High plank with straight arms; hands under shoulders.',
      cues: [
        'Keep elbows locked throughout.',
        'Push floor away to spread shoulder blades.',
        'Allow shoulder blades to come together on return.'
      ],
      commonMistakes: [
        'Bending elbows into partial push-ups.',
        'Only shrugging up and down.',
        'Sagging hips during movement.'
      ]
    }
  }),
  ex('wall-slide', 'Wall Slide', {
    category: 'Shoulder / Rehab',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 45,
    aliases: ['overhead wall slide', 'shoulder wall slide'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['serratus', 'traps'],
    keywords: ['shoulders', 'mobility', 'wall slide', 'overhead', 'rehab', 'posture'],
    technique: {
      setup: 'Back against wall; forearms and wrists on wall in W position.',
      cues: [
        'Slide arms up overhead maintaining contact.',
        'Keep ribs down and lower back near wall.',
        'Reverse slide without losing wrist or elbow touch.'
      ],
      commonMistakes: [
        'Arching lower back off wall.',
        'Losing contact at wrists or elbows.',
        'Shrugging traps as arms go overhead.'
      ]
    }
  })
];
