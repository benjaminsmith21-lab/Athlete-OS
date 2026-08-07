import { ex } from './helpers.js';

export const MOBILITY = [
  ex('worlds-greatest-stretch', "World's Greatest Stretch", {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['WGS', 'world greatest stretch', 'spiderman stretch flow'],
    primaryMuscles: ['hip flexors', 'hamstrings'],
    secondaryMuscles: ['glutes', 'thoracic spine', 'shoulders'],
    keywords: ['mobility', 'warm-up', 'hips', 'thoracic', 'full body', 'stretch'],
    technique: {
      setup: 'From standing, step into deep lunge and place opposite hand inside front foot.',
      cues: [
        'Rotate open toward front leg reaching arm to sky.',
        'Straighten front leg briefly to hit hamstring.',
        'Flow back to lunge and switch sides.'
      ],
      commonMistakes: [
        'Rushing through without owning each position.',
        'Front knee collapsing inward in lunge.',
        'Skipping rotation and hamstring segments.'
      ]
    }
  }),
  ex('hip-flexor-stretch', 'Hip Flexor Stretch', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['half kneeling hip flexor stretch', 'couch stretch lite'],
    primaryMuscles: ['hip flexors'],
    secondaryMuscles: ['quads', 'glutes'],
    keywords: ['mobility', 'hip flexors', 'stretch', 'running', 'legs', 'desk recovery'],
    technique: {
      setup: 'Half kneel with rear knee down; tuck pelvis under before leaning forward.',
      cues: [
        'Squeeze glute on back leg side.',
        'Shift hips forward gently until stretch is felt.',
        'Keep ribs down and torso tall.'
      ],
      commonMistakes: [
        'Arching lower back instead of tucking pelvis.',
        'Leaning torso far forward too aggressively.',
        'Holding breath and bracing through stretch.'
      ]
    }
  }),
  ex('couch-stretch', 'Couch Stretch', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Bench', 'Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['quad couch stretch', 'rear-foot elevated quad stretch'],
    primaryMuscles: ['quads', 'hip flexors'],
    secondaryMuscles: ['glutes'],
    keywords: ['mobility', 'quads', 'hip flexors', 'stretch', 'legs', 'running'],
    technique: {
      setup: 'Back knee against wall or bench with shin vertical; front foot flat in lunge.',
      cues: [
        'Stay tall and squeeze glute on back leg side.',
        'Shift hips forward into gentle stretch.',
        'Breathe and relax into position over time.'
      ],
      commonMistakes: [
        'Low back over-arching to feel more stretch.',
        'Front foot too close limiting hip opening.',
        'Fighting intense pain instead of moderate tension.'
      ]
    }
  }),
  ex('hamstring-stretch', 'Hamstring Stretch', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['standing hamstring stretch', 'toe touch stretch'],
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'lower back'],
    keywords: ['mobility', 'hamstrings', 'stretch', 'legs', 'running', 'posterior chain'],
    technique: {
      setup: 'Hinge forward with flat back or elevate foot on low step.',
      cues: [
        'Keep spine long and hinge from hips.',
        'Feel stretch behind knee without bouncing.',
        'Hold steady breathing into tension.'
      ],
      commonMistakes: [
        'Rounding upper back to reach toes.',
        'Bouncing aggressively at end range.',
        'Locking knee and hyperextending.'
      ]
    }
  }),
  ex('calf-stretch', 'Calf Stretch', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['wall calf stretch', 'gastrocnemius stretch'],
    primaryMuscles: ['calves'],
    secondaryMuscles: ['achilles'],
    keywords: ['mobility', 'calves', 'stretch', 'running', 'legs', 'achilles'],
    technique: {
      setup: 'Hands on wall; stagger stance with back leg straight, heel down.',
      cues: [
        'Lean forward until stretch is felt in calf.',
        'Keep back heel planted on floor.',
        'Switch bent-knee version for soleus.'
      ],
      commonMistakes: [
        'Back heel lifting off floor.',
        'Hips rotating open instead of square.',
        'Stretching into sharp pain at achilles.'
      ]
    }
  }),
  ex('thoracic-rotation', 'Thoracic Rotation', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['open book', 'T-spine rotation', 'quadruped rotation'],
    primaryMuscles: ['thoracic spine'],
    secondaryMuscles: ['shoulders', 'obliques'],
    keywords: ['mobility', 'thoracic', 'rotation', 'T-spine', 'posture', 'shoulders'],
    technique: {
      setup: 'Side-lying or quadruped; place one hand behind head or on wall.',
      cues: [
        'Rotate through upper back keeping hips stable.',
        'Follow elbow or hand with eyes.',
        'Return slowly and repeat both sides.'
      ],
      commonMistakes: [
        'Rotating from lower back instead of mid-back.',
        'Rushing reps without end-range pause.',
        'Forcing rotation into pinchy shoulders.'
      ]
    }
  }),
  ex('cat-cow', 'Cat Cow', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['cat-camel', 'spinal flexion extension'],
    primaryMuscles: ['spine'],
    secondaryMuscles: ['core', 'shoulders'],
    keywords: ['mobility', 'spine', 'warm-up', 'yoga', 'cat cow', 'flexibility'],
    technique: {
      setup: 'Hands under shoulders, knees under hips in quadruped.',
      cues: [
        'Round spine up on exhale tucking chin.',
        'Arch gently on inhale lifting chest and tailbone.',
        'Move slowly through each segment.'
      ],
      commonMistakes: [
        'Moving only at neck and lower back.',
        'Rushing through the cycle.',
        'Hyperextending lumbar aggressively in cow.'
      ]
    }
  }),
  ex('childs-pose', "Child's Pose", {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['child pose', 'resting pose'],
    primaryMuscles: ['lower back', 'lats'],
    secondaryMuscles: ['hips', 'shoulders'],
    keywords: ['mobility', 'recovery', 'stretch', 'yoga', 'back', 'relaxation'],
    technique: {
      setup: 'Kneel and sit hips toward heels; reach arms forward on floor.',
      cues: [
        'Relax shoulders and breathe into back.',
        'Widen knees if hips need more space.',
        'Hold without forcing depth.'
      ],
      commonMistakes: [
        'Shrugging shoulders up by ears.',
        'Forcing hips down with knee pain.',
        'Holding breath instead of relaxing.'
      ]
    }
  }),
  ex('ninety-ninety-hip-switch', '90/90 Hip Switch', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['90-90 switch', 'seated hip switch'],
    primaryMuscles: ['hips', 'glutes'],
    secondaryMuscles: ['adductors', 'piriformis'],
    keywords: ['mobility', 'hips', '90/90', 'rotation', 'glutes', 'flexibility'],
    technique: {
      setup: 'Sit with front and back legs both at 90°; hands behind for support if needed.',
      cues: [
        'Rotate both knees to opposite side without using hands.',
        'Stay tall through torso during switch.',
        'Move slowly and control each transition.'
      ],
      commonMistakes: [
        'Flopping over using arms to whip legs.',
        'Rounding spine to compensate for hip restriction.',
        'Rushing switches and bouncing off floor.'
      ]
    }
  }),
  ex('shoulder-cars', 'Shoulder CARs', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['controlled articular rotations shoulders', 'shoulder circles'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['rotator cuff', 'traps'],
    keywords: ['mobility', 'shoulders', 'CARs', 'joint health', 'rehab', 'warm-up'],
    technique: {
      setup: 'Stand tall; raise one arm and make a slow large circle isolating shoulder.',
      cues: [
        'Keep tension through full range like moving through mud.',
        'Do not compensate with torso sway.',
        'Complete forward and backward rotations.'
      ],
      commonMistakes: [
        'Moving too fast without control.',
        'Leaning trunk to extend range.',
        'Skipping the backward rotation set.'
      ]
    }
  }),
  ex('hip-cars', 'Hip CARs', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 30,
    aliases: ['controlled articular rotations hips', 'hip circles'],
    primaryMuscles: ['hips'],
    secondaryMuscles: ['glutes', 'hip flexors'],
    keywords: ['mobility', 'hips', 'CARs', 'joint health', 'warm-up', 'legs'],
    technique: {
      setup: 'Stand holding support; lift knee and trace largest circle possible.',
      cues: [
        'Move hip slowly through full available range.',
        'Keep pelvis stable—isolate the hip joint.',
        'Perform circles both directions each leg.'
      ],
      commonMistakes: [
        'Using momentum to swing leg around.',
        'Rotating whole pelvis instead of hip.',
        'Skipping reverse direction circles.'
      ]
    }
  })
];
