let wakeLock = null;
let wakeLockWanted = false;

const WORKOUT_SCREENS = new Set(['warmup', 'briefing', 'active', 'rest']);

export async function acquireWakeLock() {
  wakeLockWanted = true;
  if (!('wakeLock' in navigator)) return;
  try {
    if (wakeLock) return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      if (wakeLockWanted) acquireWakeLock();
    });
  } catch {
    wakeLock = null;
  }
}

export async function releaseWakeLock() {
  wakeLockWanted = false;
  if (!wakeLock) return;
  try {
    await wakeLock.release();
  } catch {
    /* ignore */
  }
  wakeLock = null;
}

export function syncWakeLockForScreen(screenName) {
  if (WORKOUT_SCREENS.has(screenName)) {
    acquireWakeLock();
  } else {
    releaseWakeLock();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLockWanted) {
    acquireWakeLock();
  }
});
