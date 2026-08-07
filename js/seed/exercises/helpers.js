/** Compact seed entry builder for curated exercise catalogue. */
export function ex(id, name, opts = {}) {
  const technique = opts.technique || {
    setup: opts.setup || opts.description || '',
    cues: (opts.cues || []).slice(0, 3),
    commonMistakes: (opts.commonMistakes || []).slice(0, 3)
  };

  return {
    id,
    name,
    category: opts.category || 'Strength',
    movementPattern: opts.movementPattern || 'other',
    trackingType: opts.trackingType || 'reps',
    equipment: opts.equipment || [],
    defaultRestSeconds: opts.defaultRestSeconds ?? 60,
    aliases: opts.aliases || [],
    primaryMuscles: opts.primaryMuscles || [],
    secondaryMuscles: opts.secondaryMuscles || [],
    keywords: opts.keywords || [],
    technique,
    legacyInstanceIds: opts.legacyInstanceIds || [],
    progressionNotes: opts.progressionNotes || null,
    description: technique.setup || opts.description || ''
  };
}
