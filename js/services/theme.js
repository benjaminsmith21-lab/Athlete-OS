export const DEFAULT_THEME = 'command-centre';

export const THEME_STORAGE_KEY = 'athlete-os-theme';
export const RED_ALERT_BOOT_PENDING_KEY = 'athlete-os-red-alert-boot-pending';

export const THEMES = [
  {
    id: 'command-centre',
    name: 'Command Centre',
    swatch: ['#1a1c1e', '#232629', '#c4923a']
  },
  {
    id: 'iron-and-chalk',
    name: 'Iron & Chalk',
    swatch: ['#141312', '#1e1c1a', '#b87333']
  },
  {
    id: 'track-club',
    name: 'Track Club',
    swatch: ['#1c1f24', '#252931', '#e8c547']
  },
  {
    id: 'ma',
    name: 'Ma',
    swatch: ['#f5f2eb', '#ffffff', '#c0392b']
  },
  {
    id: 'poster-brut',
    name: 'Poster Brut',
    swatch: ['#0a0a0a', '#141414', '#ff4d00']
  },
  {
    id: 'vitals',
    name: 'Vitals',
    swatch: ['#0b1117', '#121a22', '#00bcd4']
  },
  {
    id: 'goldeneye',
    name: 'Goldeneye',
    swatch: ['#0c100c', '#121a12', '#8fd464']
  },
  {
    id: 'red-alert',
    name: 'Red Alert',
    swatch: ['#1a0808', '#220a0a', '#ffb020']
  },
  {
    id: 'chef',
    name: 'Chef',
    swatch: ['#1a0a2e', '#3d1860', '#e84393']
  }
];

export const VALID_THEME_IDS = new Set(THEMES.map((t) => t.id));

export function normalizeThemeId(id) {
  return VALID_THEME_IDS.has(id) ? id : DEFAULT_THEME;
}

export function getThemeName(id) {
  return THEMES.find((t) => t.id === normalizeThemeId(id))?.name ?? 'Command Centre';
}

export function readStoredTheme() {
  try {
    return normalizeThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(id) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizeThemeId(id));
  } catch {
    /* ignore quota errors */
  }
}

export function applyTheme(id) {
  const themeId = normalizeThemeId(id);
  document.documentElement.setAttribute('data-theme', themeId);
  writeStoredTheme(themeId);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }

  return themeId;
}

export function markRedAlertBootPending() {
  try {
    localStorage.setItem(RED_ALERT_BOOT_PENDING_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearRedAlertBootPending() {
  try {
    localStorage.removeItem(RED_ALERT_BOOT_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function isRedAlertBootPending() {
  try {
    return localStorage.getItem(RED_ALERT_BOOT_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function maybeShowRedAlertBoot(themeId) {
  if (themeId !== 'red-alert') return;
  if (prefersReducedMotion()) {
    clearRedAlertBootPending();
    return;
  }
  if (!isRedAlertBootPending()) return;

  clearRedAlertBootPending();

  const overlay = document.createElement('div');
  overlay.className = 'red-alert-boot';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = '<div class="red-alert-boot-panel"><span class="red-alert-boot-text">SYSTEM ONLINE</span></div>';

  const dismiss = () => {
    overlay.classList.add('red-alert-boot--out');
    window.setTimeout(() => overlay.remove(), 80);
  };

  overlay.addEventListener('click', dismiss, { once: true });
  document.body.appendChild(overlay);

  window.setTimeout(dismiss, 600);
}
