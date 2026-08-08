export const LANGUAGE_STYLES = {
  TACTICAL: 'tactical',
  STANDARD: 'standard'
};

export const DEFAULT_LANGUAGE_STYLE = LANGUAGE_STYLES.STANDARD;

let currentStyle = DEFAULT_LANGUAGE_STYLE;

export const COPY = {
  commandCentre: { tactical: 'Command Centre', standard: 'Home' },
  returnHome: { tactical: 'Return to Command Centre', standard: 'Return to Home' },
  activeCampaign: { tactical: 'Active Campaign', standard: 'Active Training Plan' },
  campaignLibrary: { tactical: 'Campaign Library', standard: 'Training Plan Library' },
  campaignBuilder: { tactical: 'Campaign Builder', standard: 'Plan Builder' },
  campaignReview: { tactical: 'Campaign Review', standard: 'Progress Review' },
  integrity: { tactical: 'Integrity', standard: 'Consistency' },
  healthIntelligence: { tactical: 'Health Intelligence', standard: 'Health Insights' },
  openHealthIntelligence: { tactical: 'Open Health Intelligence', standard: 'Open Health Insights' },
  fieldManual: { tactical: 'Field Manual', standard: 'Exercise Guide' },
  briefing: { tactical: 'Briefing', standard: 'Workout Overview' },
  activeMission: { tactical: 'Active Mission', standard: 'Active Workout' },
  debrief: { tactical: 'Debrief', standard: 'Workout Summary' },
  beginMission: { tactical: 'Begin Mission', standard: 'Start Workout' },
  resumeMission: { tactical: 'Resume Mission', standard: 'Resume Workout' },
  abortMission: { tactical: 'Abort Mission', standard: 'End Workout' },
  finishMission: { tactical: 'Finish Mission', standard: 'Finish Workout' },
  missionComplete: { tactical: 'Mission Complete', standard: 'Workout Complete' },
  viewDebrief: { tactical: 'View Debrief', standard: 'View Summary' },
  fdsWorkout: { tactical: 'FDS Workout', standard: 'Quick Workout' },
  fds: { tactical: 'FDS', standard: 'Quick' },
  loadout: { tactical: 'Loadout', standard: 'Show up for' },
  campaignContribution: { tactical: 'Campaign Contribution', standard: 'Supports' },
  todaysMission: { tactical: "Today's Mission", standard: "Today's Workout" },
  missionCompleteToday: { tactical: '✓ Mission complete today', standard: '✓ Workout complete today' },
  missionInProgress: { tactical: 'Mission in progress', standard: 'Workout in progress' },
  missionLoadout: { tactical: 'Mission Loadout', standard: "Today's exercises" },
  endCampaign: { tactical: 'End Campaign', standard: 'End Training Plan' },
  endCampaignTitle: { tactical: 'End Campaign?', standard: 'End Training Plan?' },
  replaceActiveCampaignTitle: { tactical: 'Replace active campaign?', standard: 'Replace active training plan?' },
  abortMissionTitle: { tactical: 'Abort Mission?', standard: 'End Workout?' },
  campaignEnded: { tactical: 'Campaign ended.', standard: 'Training plan ended.' },
  campaignActivated: { tactical: 'Campaign activated.', standard: 'Training plan activated.' },
  campaignDuplicated: { tactical: 'Campaign duplicated.', standard: 'Training plan duplicated.' },
  campaignArchived: { tactical: 'Campaign archived.', standard: 'Training plan archived.' },
  campaignUnscheduled: { tactical: 'Campaign unscheduled.', standard: 'Training plan unscheduled.' },
  campaignNotFound: { tactical: 'Campaign not found.', standard: 'Training plan not found.' },
  newCampaignDefault: { tactical: 'New Campaign', standard: 'New Training Plan' },
  createCampaign: { tactical: '+ Create Campaign', standard: '+ Create Training Plan' },
  missionName: { tactical: 'Mission name', standard: 'Workout name' },
  operation: { tactical: 'Operation', standard: 'Focus' },
  operationName: { tactical: 'Operation name', standard: 'Focus name' },
  campaignName: { tactical: 'Campaign name', standard: 'Training plan name' },
  campaignNotes: { tactical: 'Campaign notes', standard: 'Plan notes' },
  backToCommandCentre: { tactical: 'Back to Command Centre', standard: 'Back to Home' },
  backToSettings: { tactical: 'Back to Settings', standard: 'Back to Settings' },
  missionsCompleted: { tactical: 'Missions completed', standard: 'Workouts completed' },
  fdsPeriod: { tactical: 'FDS (period)', standard: 'Quick (period)' },
  chartRangePlan: { tactical: 'Campaign', standard: 'Plan' },
  couldNotActivateCampaign: { tactical: 'Could not activate campaign.', standard: 'Could not activate training plan.' },
  theCurrentCampaign: { tactical: 'the current campaign', standard: 'the current training plan' },
  flowCompleteLabel: { tactical: "Today's mission", standard: "Today's workout" },
  fdsOverlayTitle: { tactical: 'FDS — Do Something', standard: 'Quick Workout — Do Something' },
  startFds: { tactical: 'Start FDS', standard: 'Start Quick Workout' },
  returnToCommandCentre: { tactical: 'Return to Command Centre', standard: 'Return to Home' },
  thisWeekMissions: { tactical: '{count} missions', standard: '{count} workouts' },
  campaignChange: { tactical: 'Campaign change', standard: 'Plan change' },
  campaignMetaLink: { tactical: 'Campaign Review', standard: 'Progress Review' },
  builderActiveBanner: {
    tactical: 'Active campaign — edits apply to upcoming workouts immediately.',
    standard: 'Active training plan — edits apply to upcoming workouts immediately.'
  },
  builderActivateHint: {
    tactical: 'Becomes your active training plan. Replaces any current active campaign.',
    standard: 'Becomes your active training plan. Replaces any current active plan.'
  },
  trainingLibraryButton: { tactical: 'Campaign Library', standard: 'Training Plan Library' },
  trainingSettingsHint: {
    tactical: 'Create campaigns, browse exercises, and plan your training season.',
    standard: 'Create training plans, browse exercises, and plan your training season.'
  },
  completedWorkoutsHint: {
    tactical: 'Remove logged missions. Deletes set data and calendar entry.',
    standard: 'Remove logged workouts. Deletes set data and calendar entry.'
  },
  replaceActiveSub: {
    tactical: 'Completed workouts and logs are kept. Your training plan switches to the new campaign immediately.',
    standard: 'Completed workouts and logs are kept. Your training plan switches to the new plan immediately.'
  },
  endCampaignSubActive: {
    tactical: "You're ending {name} as your active campaign.",
    standard: "You're ending {name} as your active training plan."
  },
  endCampaignKeptBody: {
    tactical: 'all completed workouts, set logs, body data, and campaign design (moves to Archive as Completed).',
    standard: 'all completed workouts, set logs, body data, and plan design (moves to Archive as Completed).'
  },
  endCampaignStopsBody: {
    tactical: "today's active training plan until you activate another campaign (or duplicate/reactivate this one).",
    standard: "today's active training plan until you activate another plan (or duplicate/reactivate this one)."
  },
  endCampaignReloadBody: {
    tactical: 'duplicate the campaign from Archive to edit and activate again; historical logs stay tied to the original.',
    standard: 'duplicate the plan from Archive to edit and activate again; historical logs stay tied to the original.'
  },
  endCampaignKept: {
    tactical: 'Kept: all completed workouts, set logs, body data, and campaign design (moves to Archive as Completed).',
    standard: 'Kept: all completed workouts, set logs, body data, and plan design (moves to Archive as Completed).'
  },
  endCampaignStops: {
    tactical: "Stops: today's active training plan until you activate another campaign (or duplicate/reactivate this one).",
    standard: "Stops: today's active training plan until you activate another plan (or duplicate/reactivate this one)."
  },
  endCampaignReload: {
    tactical: 'Reload: duplicate the campaign from Archive to edit and activate again; historical logs stay tied to the original.',
    standard: 'Reload: duplicate the plan from Archive to edit and activate again; historical logs stay tied to the original.'
  },
  replaceActiveEnd: {
    tactical: 'End {current} and activate {incoming}?',
    standard: 'End {current} and activate {incoming}?'
  },
  heatmapSummary: {
    tactical: '{rate}% execution · {count} missions · {fds} FDS',
    standard: '{rate}% execution · {count} workouts · {fds} quick'
  },
  integrityFdsTotal: { tactical: '{count} FDS total', standard: '{count} quick total' },
  integrityHolding: { tactical: 'Integrity holding', standard: 'Consistency holding' },
  integrityOneMiss: { tactical: 'One miss — protect the next session', standard: 'One miss — protect the next session' },
  integrityExecutionWeek: { tactical: '{rate}% execution this week', standard: '{rate}% execution this week' },
  thisWeekStats: {
    tactical: '{count} missions · {rate}% execution',
    standard: '{count} workouts · {rate}% execution'
  },
  thisWeekFds: { tactical: ' · {count} FDS', standard: ' · {count} quick' },
  ratingPerfect: { tactical: 'Perfect Mission', standard: 'Perfect Workout' },
  ratingFull: { tactical: 'Full Mission', standard: 'Full Workout' },
  ratingMinimum: { tactical: 'Minimum — FDS', standard: 'Minimum — Quick' },
  ratingRecovery: { tactical: 'Recovery Mission', standard: 'Recovery Workout' },
  ratingAbandoned: { tactical: 'Abandoned', standard: 'Abandoned' },
  ratingLogged: { tactical: 'Mission Logged', standard: 'Workout Logged' },
  ratingHeatmapMinimum: { tactical: 'FDS', standard: 'Quick' },
  dayStatusFds: { tactical: 'FDS', standard: 'Quick' },
  purposeLabel: { tactical: 'Purpose', standard: 'Why it matters' },
  campaignLabel: { tactical: 'Campaign', standard: 'Training Plan' },
  languageStyleTitle: { tactical: 'Language Style', standard: 'Language Style' },
  languageStyleTactical: { tactical: 'Tactical', standard: 'Tactical' },
  languageStyleStandard: { tactical: 'Standard', standard: 'Standard' },
  languageStyleTacticalHint: { tactical: 'Mission-focused language', standard: 'Mission-focused language' },
  languageStyleStandardHint: { tactical: 'Clear everyday language', standard: 'Clear everyday language' },
  renderCentreFailed: { tactical: 'Failed to render Command Centre', standard: 'Failed to render Home' },
  coachFds: {
    tactical: 'FDS today — {label}. Integrity preserved. Not a zero day. Return tomorrow.',
    standard: 'Quick workout today — {label}. Consistency maintained. Not a zero day. Return tomorrow.'
  },
  coachAbandoned: {
    tactical: 'Mission abandoned. One miss is data. Two in a row breaks the identity line. Return when ready.',
    standard: 'Workout ended early. One miss is data. Two in a row breaks the identity line. Return when ready.'
  },
  coachPartial: {
    tactical: 'Partial mission. {count} entries logged. Consistency over perfection.',
    standard: 'Partial workout. {count} entries logged. Consistency over perfection.'
  },
  coachPerfect: {
    tactical: 'Perfect mission. Full execution including optional work.',
    standard: 'Perfect workout. Full execution including optional work.'
  },
  coachFull: {
    tactical: 'Full mission. All required work complete.',
    standard: 'Full workout. All required work complete.'
  },
  coachNeverMissTwo: {
    tactical: 'Never miss two in a row — holding the line.',
    standard: 'Never miss two in a row — holding the line.'
  },
  coachLogged: {
    tactical: 'Mission logged. Quiet progress.',
    standard: 'Workout logged. Quiet progress.'
  },
  progressionReviewHint: {
    tactical: 'Compare pace in Campaign Review every 4 weeks.',
    standard: 'Compare pace in Progress Review every 4 weeks.'
  },
  fdsWarmupTitle: { tactical: 'Warm up first?', standard: 'Warm up first?' },
  fdsWarmupBody: {
    tactical: 'A short warm-up helps. Skip if you are flat or short on time.',
    standard: 'A short warm-up helps. Skip if you are flat or short on time.'
  },
  fdsWarmupYes: { tactical: 'Warm up', standard: 'Warm up' },
  fdsWarmupSkip: { tactical: 'Skip to workout', standard: 'Skip to workout' },
  completeNewBest: { tactical: 'New best', standard: 'New best' },
  completeFastestSession: {
    tactical: 'Fastest {operation} session · {duration}',
    standard: 'Fastest {operation} session · {duration}'
  },
  completeExerciseCount: {
    tactical: '{count} objectives',
    standard: '{count} exercises'
  }
};

const RATING_COPY_KEYS = {
  perfect: 'ratingPerfect',
  full: 'ratingFull',
  minimum: 'ratingMinimum',
  recovery: 'ratingRecovery',
  abandoned: 'ratingAbandoned'
};

export function normalizeLanguageStyle(value) {
  if (value === LANGUAGE_STYLES.STANDARD) return LANGUAGE_STYLES.STANDARD;
  if (value === LANGUAGE_STYLES.TACTICAL) return LANGUAGE_STYLES.TACTICAL;
  return DEFAULT_LANGUAGE_STYLE;
}

export function setLanguageStyle(style) {
  currentStyle = normalizeLanguageStyle(style);
}

export function getLanguageStyle() {
  return currentStyle;
}

export function t(key, vars = null, style = null) {
  const entry = COPY[key];
  if (!entry) return key;
  const resolvedStyle = style ? normalizeLanguageStyle(style) : currentStyle;
  let text = entry[resolvedStyle] ?? entry[DEFAULT_LANGUAGE_STYLE] ?? key;
  if (vars && typeof vars === 'object') {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function ratingLabelForStyle(rating, style = null) {
  const key = RATING_COPY_KEYS[rating];
  if (key) return t(key, null, style);
  return t('ratingLogged', null, style);
}

export function chartRangeLabel(key, style = null) {
  if (key === 'campaign') return t('chartRangePlan', null, style);
  return key.toUpperCase();
}

export function exerciseCountLabel(count, style = null) {
  const resolvedStyle = style ? normalizeLanguageStyle(style) : currentStyle;
  if (resolvedStyle === LANGUAGE_STYLES.STANDARD) {
    return count === 1 ? 'exercise' : 'exercises';
  }
  return count === 1 ? 'objective' : 'objectives';
}

export function getDayStatusLabel(status, style = null) {
  if (status === 'fds') return t('dayStatusFds', null, style);
  const labels = {
    completed: 'Completed',
    missed: 'Missed',
    rest: 'Rest',
    upcoming: 'Upcoming'
  };
  return labels[status] || status;
}
