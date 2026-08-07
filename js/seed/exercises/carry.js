import { ex } from './helpers.js';

export const CARRY = [
  ex('suitcase-carry', 'Suitcase Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell', 'Dumbbell'],
    defaultRestSeconds: 60,
    aliases: ['single-arm carry', 'unilateral farmer carry'],
    primaryMuscles: ['core', 'forearms'],
    secondaryMuscles: ['glutes', 'traps', 'obliques', 'grip'],
    keywords: ['carry', 'core', 'anti-lateral flexion', 'grip', 'kettlebell', 'KB', 'obliques'],
    technique: {
      setup: 'Hold one bell at side like a suitcase; stand tall before walking.',
      cues: [
        'Fight lean—stay vertical through torso.',
        'Walk with controlled steps and packed shoulder.',
        'Switch sides each set or halfway.'
      ],
      commonMistakes: [
        'Leaning toward the load side.',
        'Shrugging working shoulder up.',
        'Rushing and losing midline tension.'
      ]
    }
  }),
  ex('front-rack-carry', 'Front Rack Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 60,
    aliases: ['double rack carry', 'KB front rack walk'],
    primaryMuscles: ['core', 'shoulders'],
    secondaryMuscles: ['forearms', 'traps', 'glutes', 'quads'],
    keywords: ['carry', 'front rack', 'kettlebell', 'KB', 'core', 'shoulders'],
    technique: {
      setup: 'Clean two kettlebells to rack position at chest; elbows tight.',
      cues: [
        'Keep ribs down and bells close to body.',
        'Walk tall without leaning back.',
        'Breathe behind the brace while moving.'
      ],
      commonMistakes: [
        'Elbows flaring and bells drifting forward.',
        'Hyperextending lower back under load.',
        'Shuffling feet too fast and losing rack.'
      ]
    }
  }),
  ex('waiter-carry', 'Waiter Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 60,
    aliases: ['single-arm overhead hold walk', 'KB waiter walk'],
    primaryMuscles: ['shoulders', 'core'],
    secondaryMuscles: ['forearms', 'traps', 'glutes'],
    keywords: ['carry', 'overhead', 'shoulders', 'kettlebell', 'KB', 'stability', 'core'],
    technique: {
      setup: 'Press one kettlebell overhead; lock elbow and stack wrist over shoulder.',
      cues: [
        'Keep biceps by ear and ribs from flaring.',
        'Walk slow and stay tall through midline.',
        'Switch arms each set.'
      ],
      commonMistakes: [
        'Elbow bending and bell drifting forward.',
        'Side bending away from load.',
        'Walking too fast and losing lockout.'
      ]
    }
  }),
  ex('overhead-carry', 'Overhead Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell', 'Dumbbell'],
    defaultRestSeconds: 60,
    aliases: ['double overhead carry', 'OH carry', 'overhead walk'],
    primaryMuscles: ['shoulders', 'core'],
    secondaryMuscles: ['traps', 'forearms', 'glutes', 'upper back'],
    keywords: ['carry', 'overhead', 'shoulders', 'core', 'stability', 'KB', 'grip'],
    technique: {
      setup: 'Lock two bells overhead or one heavy bell; ribs down, glutes on.',
      cues: [
        'Push up into the weight continuously.',
        'Take short steps keeping full lockout.',
        'Stop before form breaks down.'
      ],
      commonMistakes: [
        'Ribs flaring and lower back arching.',
        'Elbows unlocking as distance increases.',
        'Using weight beyond stable overhead capacity.'
      ]
    }
  })
];
