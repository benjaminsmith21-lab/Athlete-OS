export const WARMUP_DURATION_SECONDS = 60;
export const WARMUP_SOUND_LEAD_SECONDS = 3;

export const WARMUP_STEPS = [
  {
    minute: 1,
    title: 'Halos',
    weightKg: 20,
    rx: '5 each direction',
    purpose: 'Thoracic · shoulder · core'
  },
  {
    minute: 2,
    title: 'Bottom-up carry',
    weightMinKg: 10,
    weightMaxKg: 15,
    rx: '30 seconds each arm',
    purpose: 'Rotator cuff · grip · posture'
  },
  {
    minute: 3,
    title: 'Kettlebell Flow',
    rx: 'Keep the bell in your hands',
    flowLines: ['5 Goblet Squats (20 or 24kg)', '5 Romanian Deadlifts', '5 Bent-over Rows each arm'],
    purpose: 'Hips · glutes · lats · heart rate'
  }
];
