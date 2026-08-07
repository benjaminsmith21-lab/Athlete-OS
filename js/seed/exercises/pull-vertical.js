import { ex } from './helpers.js';

export const PULL_VERTICAL = [
  ex('pull-up', 'Pull-up', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Pull-up Bar'],
    defaultRestSeconds: 90,
    aliases: ['overhand pull-up', 'pronated pull-up'],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'forearms', 'core'],
    keywords: ['pull-up', 'vertical pull', 'lats', 'back', 'grip', 'bodyweight'],
    technique: {
      setup: 'Hang from bar with overhand grip slightly wider than shoulders.',
      cues: [
        'Depress shoulder blades before initiating pull.',
        'Drive elbows down until chin clears bar.',
        'Lower with control to full dead hang.'
      ],
      commonMistakes: [
        'Kipping wildly to finish reps.',
        'Shrugging shoulders without lat engagement.',
        'Half reps without full extension at bottom.'
      ]
    }
  }),
  ex('chin-up', 'Chin-up', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Pull-up Bar'],
    defaultRestSeconds: 90,
    aliases: ['underhand pull-up', 'supinated pull-up'],
    primaryMuscles: ['lats', 'biceps'],
    secondaryMuscles: ['rhomboids', 'forearms', 'core'],
    keywords: ['chin-up', 'pull-up', 'biceps', 'lats', 'vertical pull', 'grip'],
    technique: {
      setup: 'Hang with underhand grip at shoulder width.',
      cues: [
        'Start pull by driving elbows to ribs.',
        'Keep chest slightly lifted toward bar.',
        'Lower slowly until arms are straight.'
      ],
      commonMistakes: [
        'Swinging legs for momentum.',
        'Craning neck without chin actually clearing bar.',
        'Rushing negatives and dropping from top.'
      ]
    }
  }),
  ex('assisted-pull-up', 'Assisted Pull-up', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Pull-up Bar', 'Resistance Band'],
    defaultRestSeconds: 60,
    aliases: ['band-assisted pull-up', 'assisted chin-up'],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'forearms'],
    keywords: ['pull-up', 'assisted', 'band', 'beginner', 'lats', 'vertical pull'],
    technique: {
      setup: 'Loop band over bar and under foot or knee; grip bar and hang.',
      cues: [
        'Use same form as unassisted pull-up.',
        'Control descent even with band help.',
        'Reduce assistance as strength improves.'
      ],
      commonMistakes: [
        'Relying on band bounce at bottom.',
        'Kipping to compensate for heavy assistance.',
        'Staying on same band tension too long.'
      ]
    }
  }),
  ex('lat-pulldown', 'Lat Pulldown', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Cable Machine'],
    defaultRestSeconds: 60,
    aliases: ['cable pulldown', 'wide-grip pulldown'],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'forearms'],
    keywords: ['pulldown', 'lats', 'vertical pull', 'cable', 'back', 'machine'],
    technique: {
      setup: 'Sit with thighs under pad; grip bar wider than shoulders.',
      cues: [
        'Pull bar to upper chest driving elbows down.',
        'Lean slightly back without swinging.',
        'Return with control until arms extend.'
      ],
      commonMistakes: [
        'Pulling bar behind neck.',
        'Using body momentum to yank weight.',
        'Shrugging shoulders at start of rep.'
      ]
    }
  }),
  ex('dead-hang', 'Dead Hang', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'timed',
    equipment: ['Pull-up Bar'],
    defaultRestSeconds: 60,
    aliases: ['passive hang', 'bar hang', 'hang hold'],
    primaryMuscles: ['lats', 'forearms'],
    secondaryMuscles: ['shoulders', 'grip'],
    keywords: ['hang', 'grip', 'shoulders', 'decompression', 'pull-up bar', 'recovery'],
    technique: {
      setup: 'Grip pull-up bar shoulder-width; let body hang with feet off floor.',
      cues: [
        'Relax shoulders slightly without collapsing.',
        'Breathe steadily throughout hold.',
        'Step down controlled when grip fails.'
      ],
      commonMistakes: [
        'Shrugging aggressively the entire hold.',
        'Swinging to extend time.',
        'Hanging too long when shoulders feel pinchy.'
      ]
    }
  }),
  ex('scap-pull-up', 'Scap Pull-up', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Pull-up Bar'],
    defaultRestSeconds: 60,
    aliases: ['scapular pull-up', 'bar scap pull'],
    primaryMuscles: ['lats', 'serratus'],
    secondaryMuscles: ['rhomboids', 'traps', 'forearms'],
    keywords: ['scapular', 'pull-up', 'shoulders', 'rehab', 'prehab', 'grip'],
    technique: {
      setup: 'Hang from bar with straight arms and slight hollow body.',
      cues: [
        'Depress and retract shoulder blades without bending elbows.',
        'Hold top position briefly each rep.',
        'Return to full relaxed hang with control.'
      ],
      commonMistakes: [
        'Bending elbows to cheat elevation.',
        'Shrugging up instead of pulling down.',
        'Rushing through reps without pause.'
      ]
    }
  })
];
