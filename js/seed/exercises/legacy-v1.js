import { ex } from './helpers.js';

export const LEGACY_V1 = [
  ex('zone-2-run', 'Zone 2 Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['Z2 run', 'aerobic run', 'easy aerobic'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'cardio', 'aerobic', 'legs', 'endurance', 'zone 2'],
    technique: {
      setup: 'Start at a pace where you can hold a full conversation without gasping.',
      cues: [
        'Keep posture tall and relaxed through shoulders.',
        'Land lightly with a quick cadence around 170–180 steps per minute.',
        'Breathe steadily through nose or nose-mouth combo.'
      ],
      commonMistakes: [
        'Running too fast and drifting out of zone 2.',
        'Overstriding with heavy heel strikes.',
        'Tensing shoulders and clenching fists.'
      ]
    },
    legacyInstanceIds: ['mon-z2']
  }),
  ex('ocean-dip', 'Ocean Dip', {
    category: 'Recovery',
    movementPattern: 'other',
    trackingType: 'optional',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['cold plunge', 'sea dip', 'ocean swim entry'],
    primaryMuscles: [],
    secondaryMuscles: [],
    keywords: ['recovery', 'cold exposure', 'outdoor', 'reset'],
    technique: {
      setup: 'Enter calm, safe water you know; have a towel and warm layer ready.',
      cues: [
        'Ease in and control your breathing on entry.',
        'Stay present for 1–3 minutes unless conditions change.',
        'Exit calmly and warm up gradually afterward.'
      ],
      commonMistakes: [
        'Forcing a long dip in rough or unsafe conditions.',
        'Hyperventilating instead of slowing breath.',
        'Skipping warm-up after cold exposure.'
      ]
    },
    legacyInstanceIds: ['mon-dip', 'fri-dip']
  }),
  ex('ring-hangs', 'Ring Hangs', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'timed',
    equipment: ['Rings'],
    defaultRestSeconds: 60,
    aliases: ['ring dead hang', 'ring support hang'],
    primaryMuscles: ['lats', 'forearms'],
    secondaryMuscles: ['shoulders', 'core', 'grip'],
    keywords: ['rings', 'hang', 'grip', 'shoulders', 'pull', 'rehab'],
    technique: {
      setup: 'Set rings at shoulder width; grip firmly and step feet off the ground.',
      cues: [
        'Depress shoulder blades slightly without shrugging ears.',
        'Keep arms straight and ribs stacked over hips.',
        'Breathe steadily and hold tension through grip and core.'
      ],
      commonMistakes: [
        'Shrugging shoulders up to the ears.',
        'Swinging or kipping to extend hang time.',
        'Holding breath and turning face red.'
      ]
    },
    progressionNotes: 'Add 5 seconds to hangs before making them harder.',
    legacyInstanceIds: ['mon-hangs', 'thu-hangs', 'fri-hangs', 'fds-hangs']
  }),
  ex('scap-pulls', 'Scap Pulls', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Rings'],
    defaultRestSeconds: 60,
    aliases: ['scapular pull-ups', 'ring scap pulls'],
    primaryMuscles: ['lats', 'serratus'],
    secondaryMuscles: ['rhomboids', 'traps', 'forearms'],
    keywords: ['scapular', 'shoulders', 'rehab', 'rings', 'pull', 'prehab'],
    technique: {
      setup: 'Hang from rings with arms straight and body in a slight hollow.',
      cues: [
        'Pull shoulder blades down and together without bending elbows.',
        'Pause briefly at the top of each rep.',
        'Return with control to a full dead hang.'
      ],
      commonMistakes: [
        'Bending elbows to cheat the movement.',
        'Shrugging instead of depressing the scapula.',
        'Rushing reps without a clear top pause.'
      ]
    },
    legacyInstanceIds: ['mon-scap', 'thu-scap', 'fds-scap']
  }),
  ex('halos', 'Halos', {
    category: 'Shoulder / Rehab',
    movementPattern: 'mobility',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 60,
    aliases: ['KB halo', 'kettlebell halo'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['core', 'traps', 'forearms'],
    keywords: ['kettlebell', 'KB', 'shoulders', 'mobility', 'warm-up', 'rehab'],
    technique: {
      setup: 'Hold a kettlebell bottom-up or by the horns at chest height.',
      cues: [
        'Circle the bell tightly around your head in a smooth arc.',
        'Keep ribs down and glutes lightly engaged.',
        'Move slowly through sticky spots in each direction.'
      ],
      commonMistakes: [
        'Arching the lower back as the bell passes behind.',
        'Using too heavy a weight and losing control.',
        'Rushing the circle instead of owning each segment.'
      ]
    },
    legacyInstanceIds: ['mon-halos']
  }),
  ex('scaption', 'Scaption', {
    category: 'Shoulder / Rehab',
    movementPattern: 'push',
    trackingType: 'weighted_reps',
    equipment: ['Dumbbell'],
    defaultRestSeconds: 60,
    aliases: ['scapular plane raise', 'thumb-up raise'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps', 'serratus'],
    keywords: ['shoulders', 'rehab', 'dumbbell', 'rotator cuff', 'prehab'],
    technique: {
      setup: 'Stand tall with light dumbbells, thumbs pointing up at your sides.',
      cues: [
        'Raise arms on a 30–45° angle in front of your body.',
        'Stop around shoulder height without shrugging.',
        'Lower slowly with control.'
      ],
      commonMistakes: [
        'Shrugging traps to lift heavier weight.',
        'Swinging momentum from the hips.',
        'Raising above shoulder height and impinging.'
      ]
    },
    legacyInstanceIds: ['mon-scaption']
  }),
  ex('serratus', 'Serratus', {
    category: 'Shoulder / Rehab',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['serratus punch', 'wall serratus slide'],
    primaryMuscles: ['serratus'],
    secondaryMuscles: ['shoulders', 'core'],
    keywords: ['serratus', 'shoulders', 'rehab', 'scapular', 'bodyweight'],
    technique: {
      setup: 'Stand facing a wall with forearms or hands on the surface at shoulder height.',
      cues: [
        'Protract shoulder blades by pushing the wall away.',
        'Keep elbows straight and ribs from flaring.',
        'Hold the reach for a beat, then return with control.'
      ],
      commonMistakes: [
        'Bending elbows instead of reaching through the shoulder.',
        'Arching the lower back to get extra range.',
        'Moving too fast without feeling the serratus fire.'
      ]
    },
    legacyInstanceIds: ['tue-serratus']
  }),
  ex('bottom-up-carry', 'Bottom-up Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 60,
    aliases: [
      'bottoms-up carry',
      'BU carry',
      'KB bottom-up walk',
      'bottom-up hold',
      'bottoms-up hold',
      'BU KB hold',
      'bell-up hold'
    ],
    primaryMuscles: ['forearms', 'shoulders'],
    secondaryMuscles: ['core', 'grip', 'traps', 'rotator cuff'],
    keywords: ['kettlebell', 'KB', 'carry', 'grip', 'shoulders', 'stability', 'hold', 'rehab', 'bottom-up'],
    technique: {
      setup: 'Clean a kettlebell to bottom-up rack (or overhead); bell points at the ceiling.',
      cues: [
        'Crush the handle and stack wrist over elbow.',
        'Walk tall or hold steady—ribs down, breathe.',
        'Switch sides each set; stop before the bell wobbles.'
      ],
      commonMistakes: [
        'Letting the bell wobble or drift off midline.',
        'Shrugging the working shoulder.',
        'Going too heavy or moving too fast.'
      ]
    },
    legacyInstanceIds: ['tue-carry']
  }),
  ex('goblet-squat', 'Goblet Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB goblet squat', 'goblet KB squat'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['core', 'hamstrings', 'upper back'],
    keywords: ['squat', 'legs', 'kettlebell', 'KB', 'glutes', 'quads'],
    technique: {
      setup: 'Hold a kettlebell at chest height with elbows pointing down and feet shoulder-width.',
      cues: [
        'Sit between your heels keeping chest proud.',
        'Drive knees out over toes on the way down.',
        'Stand by pushing the floor away and squeezing glutes.'
      ],
      commonMistakes: [
        'Letting elbows drop and upper back round.',
        'Heels lifting or knees collapsing inward.',
        'Cutting depth short when mobility allows more.'
      ]
    },
    progressionNotes: 'Increase load only when every rep is clean.',
    legacyInstanceIds: ['tue-goblet', 'wed-goblet']
  }),
  ex('row', 'Row', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB row', 'kettlebell row', 'single-arm row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'core', 'forearms'],
    keywords: ['row', 'pull', 'back', 'kettlebell', 'KB', 'lats'],
    technique: {
      setup: 'Hinge at the hips with a flat back; support on a bench or free-standing with KB in one hand.',
      cues: [
        'Pull elbow back toward hip, not straight out to the side.',
        'Squeeze shoulder blade at the top without twisting.',
        'Lower with control until arm is fully extended.'
      ],
      commonMistakes: [
        'Rotating torso to jerk the weight up.',
        'Shrugging shoulder instead of pulling with the back.',
        'Rounding the lower back at the bottom.'
      ]
    },
    progressionNotes: 'Increase load only when every rep is clean.',
    legacyInstanceIds: ['tue-row', 'thu-row']
  }),
  ex('rear-delt-raise', 'Rear Delt Raise', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Dumbbell'],
    defaultRestSeconds: 60,
    aliases: ['reverse fly', 'bent-over rear delt raise'],
    primaryMuscles: ['rear delts'],
    secondaryMuscles: ['rhomboids', 'traps'],
    keywords: ['shoulders', 'rear delts', 'rehab', 'dumbbell', 'posture'],
    technique: {
      setup: 'Hinge forward with a flat back; let dumbbells hang under shoulders, palms facing each other.',
      cues: [
        'Raise arms out to the sides in a wide arc.',
        'Lead with elbows and pause at shoulder height.',
        'Lower slowly without swinging.'
      ],
      commonMistakes: [
        'Using momentum from the hips.',
        'Shrugging traps to lift higher.',
        'Bending elbows too much into a row pattern.'
      ]
    },
    legacyInstanceIds: ['tue-rear-delt', 'thu-rear-delt']
  }),
  ex('face-pull', 'Face Pull', {
    category: 'Shoulder / Rehab',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Resistance Band'],
    defaultRestSeconds: 60,
    aliases: ['band face pull', 'rear delt band pull'],
    primaryMuscles: ['rear delts', 'rhomboids'],
    secondaryMuscles: ['traps', 'rotator cuff'],
    keywords: ['shoulders', 'rehab', 'band', 'posture', 'pull', 'prehab'],
    technique: {
      setup: 'Anchor a band at face height; grip with palms down and step back to create tension.',
      cues: [
        'Pull band toward forehead with elbows high and wide.',
        'Externally rotate at the end so knuckles face back.',
        'Control the return without letting shoulders roll forward.'
      ],
      commonMistakes: [
        'Pulling to the chest instead of the face.',
        'Using too much weight and losing external rotation.',
        'Arching lower back to finish the rep.'
      ]
    },
    legacyInstanceIds: ['tue-face-pull']
  }),
  ex('ring-rows', 'Ring Rows', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Rings'],
    defaultRestSeconds: 60,
    aliases: ['inverted row', 'body row', 'feet-elevated ring row'],
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear delts', 'core'],
    keywords: ['rings', 'row', 'pull', 'back', 'bodyweight', 'horizontal pull'],
    technique: {
      setup: 'Set rings at waist to chest height; hang underneath with body in a straight plank.',
      cues: [
        'Pull chest to rings by driving elbows back.',
        'Squeeze shoulder blades together at the top.',
        'Lower under control keeping hips aligned.'
      ],
      commonMistakes: [
        'Sagging hips or piking at the top.',
        'Shrugging instead of retracting scapulae.',
        'Using a partial range when full depth is available.'
      ]
    },
    progressionNotes: 'Move feet forward to progress ring rows.',
    legacyInstanceIds: ['tue-ring-rows', 'thu-ring-rows']
  }),
  ex('push-up-plus', 'Push-up Plus', {
    category: 'Push',
    movementPattern: 'push',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 60,
    aliases: ['scapular push-up', 'protraction push-up'],
    primaryMuscles: ['serratus', 'chest'],
    secondaryMuscles: ['shoulders', 'triceps', 'core'],
    keywords: ['push', 'shoulders', 'serratus', 'rehab', 'scapular', 'bodyweight'],
    technique: {
      setup: 'Start in a high plank with hands under shoulders and body in one line.',
      cues: [
        'Perform a standard push-up with elbows at 45°.',
        'At the top, push the floor away to protract shoulder blades.',
        'Return shoulder blades smoothly before the next rep.'
      ],
      commonMistakes: [
        'Only shrugging instead of reaching through the serratus.',
        'Sagging hips during the push-up portion.',
        'Rushing the plus without a clear end-range hold.'
      ]
    },
    legacyInstanceIds: ['tue-pushup-plus']
  }),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', {
    category: 'Strength',
    movementPattern: 'squat',
    trackingType: 'reps',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 90,
    aliases: ['rear-foot elevated split squat', 'RFESS', 'BSS'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    keywords: ['legs', 'squat', 'lunge', 'single leg', 'glutes', 'quads'],
    technique: {
      setup: 'Place rear foot on a bench behind you; front foot far enough forward to allow depth.',
      cues: [
        'Drop straight down keeping torso slightly forward.',
        'Drive through the front heel to stand.',
        'Keep front knee tracking over toes without collapsing inward.'
      ],
      commonMistakes: [
        'Pushing off the back foot instead of loading the front leg.',
        'Letting front knee cave inward.',
        'Standing too upright and limiting depth.'
      ]
    },
    legacyInstanceIds: ['wed-bulgarian']
  }),
  ex('single-leg-rdl', 'Single-leg RDL', {
    category: 'Strength',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['SL RDL', 'single-leg deadlift', 'KB single-leg RDL'],
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['core', 'calves', 'forearms'],
    keywords: ['hinge', 'legs', 'hamstrings', 'glutes', 'balance', 'kettlebell', 'KB'],
    technique: {
      setup: 'Stand on one leg holding a kettlebell in the opposite hand; soft knee on standing leg.',
      cues: [
        'Hinge hips back while free leg reaches behind for balance.',
        'Keep back flat and bell close to standing leg.',
        'Drive hip forward to stand without rotating pelvis.'
      ],
      commonMistakes: [
        'Rounding the lower back at the bottom.',
        'Opening hips and losing square alignment.',
        'Bending the standing knee into a squat pattern.'
      ]
    },
    legacyInstanceIds: ['wed-rdl']
  }),
  ex('swings', 'Swings', {
    category: 'Power',
    movementPattern: 'hinge',
    trackingType: 'weighted_reps',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['KB swing', 'kettlebell swing', 'two-hand swing'],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'lats', 'forearms', 'shoulders'],
    keywords: ['kettlebell', 'KB', 'power', 'hinge', 'glutes', 'conditioning'],
    technique: {
      setup: 'Stand with KB a foot in front; hinge and grip with both hands, hike bell back between legs.',
      cues: [
        'Snap hips forward to float the bell to chest height.',
        'Keep arms relaxed and lats engaged throughout.',
        'Let the bell fall back into the hinge without squatting down.'
      ],
      commonMistakes: [
        'Lifting with arms instead of driving with hips.',
        'Squatting instead of hinging.',
        'Overextending the lower back at the top.'
      ]
    },
    legacyInstanceIds: ['wed-swings']
  }),
  ex('farmer-carry', 'Farmer Carry', {
    category: 'Carry',
    movementPattern: 'carry',
    trackingType: 'carry',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 90,
    aliases: ['farmer walk', 'KB farmer carry', 'double carry'],
    primaryMuscles: ['forearms', 'traps'],
    secondaryMuscles: ['core', 'glutes', 'grip'],
    keywords: ['carry', 'grip', 'core', 'kettlebell', 'KB', 'conditioning'],
    technique: {
      setup: 'Pick up a kettlebell in each hand and stand tall with shoulders packed.',
      cues: [
        'Walk with short, controlled steps.',
        'Keep ribs down and eyes forward.',
        'Crush the handles without shrugging ears up.'
      ],
      commonMistakes: [
        'Leaning to one side as fatigue sets in.',
        'Shrugging traps and compressing the neck.',
        'Rushing steps and losing posture.'
      ]
    },
    legacyInstanceIds: ['wed-farmer']
  }),
  ex('band-pulldown', 'Band Pulldown', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'reps',
    equipment: ['Resistance Band'],
    defaultRestSeconds: 60,
    aliases: ['band lat pulldown', 'anchor pulldown'],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'core'],
    keywords: ['pull', 'lats', 'band', 'vertical pull', 'back'],
    technique: {
      setup: 'Anchor band overhead; kneel or stand and grip with arms extended.',
      cues: [
        'Pull elbows down toward ribs without leaning back excessively.',
        'Squeeze lats at the bottom of each rep.',
        'Return with control keeping tension on the band.'
      ],
      commonMistakes: [
        'Using body swing to finish reps.',
        'Pulling band behind the neck.',
        'Shrugging shoulders instead of depressing first.'
      ]
    },
    legacyInstanceIds: ['thu-pulldown']
  }),
  ex('easy-run', 'Easy Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['recovery run', 'easy jog', 'conversational run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'easy', 'recovery', 'legs', 'aerobic', 'cardio'],
    technique: {
      setup: 'Start slower than you think; aim for fully conversational effort.',
      cues: [
        'Relax shoulders and keep jaw unclenched.',
        'Land with light, quick steps.',
        'Finish feeling like you could keep going.'
      ],
      commonMistakes: [
        'Drifting into tempo pace on fresh legs.',
        'Overstriding when tired.',
        'Skipping easy days and accumulating fatigue.'
      ]
    },
    legacyInstanceIds: ['fri-easy1', 'fri-easy2']
  }),
  ex('tempo-run', 'Tempo Run', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['threshold run', 'steady state run', 'comfortably hard run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'tempo', 'threshold', 'legs', 'speed', 'endurance'],
    technique: {
      setup: 'Warm up 10–15 minutes easy before settling into tempo effort.',
      cues: [
        'Hold a controlled, comfortably hard pace you can sustain.',
        'Keep form tall as fatigue builds.',
        'Breathe rhythmically—roughly 2:2 or 3:2 inhale-exhale.'
      ],
      commonMistakes: [
        'Starting too fast and fading badly.',
        'Running tempo pace on every outing.',
        'Tensing up and losing cadence under effort.'
      ]
    },
    legacyInstanceIds: ['fri-tempo']
  }),
  ex('run-club', 'Run Club', {
    category: 'Running',
    movementPattern: 'locomotion',
    trackingType: 'distance',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['group run', 'social run', 'club run'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['running', 'social', 'group', 'outdoor', 'cardio', 'legs'],
    technique: {
      setup: 'Know the planned route and pace before joining the group.',
      cues: [
        'Start conservatively and find your rhythm in the pack.',
        'Communicate if you need to peel off or adjust pace.',
        'Cool down and hydrate after the run.'
      ],
      commonMistakes: [
        'Sprinting early to keep up with faster runners.',
        'Skipping warm-up because the group starts fast.',
        'Ignoring niggles to stay with the pack.'
      ]
    },
    legacyInstanceIds: ['sat-run']
  }),
  ex('hangs-optional', 'Hangs', {
    category: 'Pull',
    movementPattern: 'pull',
    trackingType: 'optional',
    equipment: ['Rings'],
    defaultRestSeconds: 0,
    aliases: ['optional hang', 'passive hang', 'dead hang'],
    primaryMuscles: ['lats', 'forearms'],
    secondaryMuscles: ['shoulders', 'grip'],
    keywords: ['hang', 'rings', 'grip', 'shoulders', 'optional', 'recovery'],
    technique: {
      setup: 'Use rings or a bar at comfortable reach; grip and let body hang freely.',
      cues: [
        'Relax shoulders slightly without collapsing completely.',
        'Breathe normally throughout the hold.',
        'Step down when grip or shoulders feel done.'
      ],
      commonMistakes: [
        'Forcing long hangs when shoulders are irritated.',
        'Shrugging aggressively the entire time.',
        'Dropping off abruptly without controlling descent.'
      ]
    },
    legacyInstanceIds: ['sat-hangs']
  }),
  ex('walk', 'Walk', {
    category: 'Recovery',
    movementPattern: 'locomotion',
    trackingType: 'open',
    equipment: ['Outdoor'],
    defaultRestSeconds: 0,
    aliases: ['recovery walk', 'easy walk', 'stroll'],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes', 'core'],
    keywords: ['walk', 'recovery', 'outdoor', 'low intensity', 'legs'],
    technique: {
      setup: 'Choose comfortable shoes and a flat or gently rolling route.',
      cues: [
        'Walk at an easy pace you could hold indefinitely.',
        'Swing arms naturally and stand tall.',
        'Use the time to decompress, not push pace.'
      ],
      commonMistakes: [
        'Turning recovery walks into brisk hikes every day.',
        'Slouching forward with head down.',
        'Skipping walks on busy days when they help most.'
      ]
    },
    legacyInstanceIds: ['sun-walk', 'fds-walk']
  }),
  ex('mobility', 'Mobility', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'open',
    equipment: ['Bodyweight'],
    defaultRestSeconds: 0,
    aliases: ['mobility flow', 'movement prep', 'stretch session'],
    primaryMuscles: [],
    secondaryMuscles: [],
    keywords: ['mobility', 'flexibility', 'recovery', 'warm-up', 'movement'],
    technique: {
      setup: 'Clear floor space; pick 3–5 areas that feel tight from recent training.',
      cues: [
        'Move slowly through each position with steady breathing.',
        'Spend extra time where you feel genuine restriction.',
        'Finish feeling looser, not exhausted.'
      ],
      commonMistakes: [
        'Bouncing aggressively into end range.',
        'Rushing through a long list without focus.',
        'Confusing mobility work with hard conditioning.'
      ]
    },
    legacyInstanceIds: ['sun-mobility', 'fds-mobility']
  }),
  ex('family', 'Family', {
    category: 'Recovery',
    movementPattern: 'other',
    trackingType: 'note_only',
    equipment: ['Other'],
    defaultRestSeconds: 0,
    aliases: ['family time', 'rest day activity', 'life balance'],
    primaryMuscles: [],
    secondaryMuscles: [],
    keywords: ['recovery', 'family', 'rest', 'life', 'balance'],
    technique: {
      setup: 'Block time away from structured training for family or personal life.',
      cues: [
        'Be present—phones away when possible.',
        'Keep movement light if you play together outdoors.',
        'Treat this as productive recovery, not a skipped day.'
      ],
      commonMistakes: [
        'Sneaking in hard training and calling it family time.',
        'Feeling guilty instead of recharging.',
        'Over-scheduling so recovery never happens.'
      ]
    },
    legacyInstanceIds: ['sun-family']
  }),
  ex('warmup-halos', 'Halos', {
    category: 'Mobility',
    movementPattern: 'mobility',
    trackingType: 'timed',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 0,
    aliases: ['warm-up halo', 'prep halos'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['core', 'traps'],
    keywords: ['warm-up', 'kettlebell', 'KB', 'shoulders', 'mobility', 'prep'],
    technique: {
      setup: 'Use a light kettlebell; perform 5 circles each direction as part of warm-up.',
      cues: [
        'Keep circles tight and controlled around the head.',
        'Stay braced through core the entire set.',
        'Switch directions smoothly without pausing.'
      ],
      commonMistakes: [
        'Using training weight instead of warm-up load.',
        'Rushing reps to finish the warm-up block.',
        'Skipping the reverse direction.'
      ]
    },
    legacyInstanceIds: []
  }),
  ex('warmup-bottom-up-carry', 'Bottom-up Carry', {
    category: 'Mobility',
    movementPattern: 'carry',
    trackingType: 'timed',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 0,
    aliases: ['warm-up BU carry', 'prep bottom-up carry'],
    primaryMuscles: ['forearms', 'shoulders'],
    secondaryMuscles: ['core', 'grip'],
    keywords: ['warm-up', 'kettlebell', 'KB', 'carry', 'grip', 'shoulders', 'prep'],
    technique: {
      setup: 'Hold a light kettlebell bottom-up; walk or stand for 30 seconds each arm.',
      cues: [
        'Stack wrist over elbow with a firm grip.',
        'Stand or walk tall without rushing.',
        'Switch arms at the halfway mark.'
      ],
      commonMistakes: [
        'Going too heavy and fighting the bell.',
        'Shrugging the working shoulder.',
        'Cutting time short on the weaker side.'
      ]
    },
    legacyInstanceIds: []
  }),
  ex('warmup-kb-flow', 'Kettlebell Flow', {
    category: 'Mobility',
    movementPattern: 'other',
    trackingType: 'timed',
    equipment: ['Kettlebell'],
    defaultRestSeconds: 0,
    aliases: ['KB flow', 'kettlebell warm-up flow', 'movement flow'],
    primaryMuscles: ['shoulders', 'hips'],
    secondaryMuscles: ['core', 'glutes', 'hamstrings'],
    keywords: ['warm-up', 'kettlebell', 'KB', 'flow', 'mobility', 'movement prep'],
    technique: {
      setup: 'Use a light kettlebell and link 3–5 familiar patterns into a continuous flow.',
      cues: [
        'Move smoothly between positions without resetting every rep.',
        'Keep breath steady and weight manageable.',
        'Stop while form is still crisp.'
      ],
      commonMistakes: [
        'Chaining too many novel moves in warm-up.',
        'Using heavy load and losing control.',
        'Fatiguing before the main session starts.'
      ]
    },
    legacyInstanceIds: []
  })
];
