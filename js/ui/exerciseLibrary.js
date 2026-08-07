import {
  searchExercises,
  getExercise,
  createExercise,
  updateExercise,
  archiveExercise,
  restoreExercise,
  getTrackingTypeLabel,
  formatExerciseLibraryRow,
  getExerciseDisplayMeta
} from '../services/exerciseLibrary.js';
import {
  getFavoriteExerciseIds,
  getRecentExerciseIds,
  toggleFavoriteExercise,
  isFavoriteExercise,
  partitionExerciseSections
} from '../services/exercisePreferences.js';
import { parseLineList, parseCommaList } from '../services/exerciseSchema.js';
import { TRACKING_TYPE_IDS, TRACKING_TYPES } from '../services/trackingTypes.js';
import { EXERCISE_CATEGORIES, EQUIPMENT_OPTIONS } from '../services/equipment.js';

const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'Strength', label: 'Strength' },
  { id: 'Running', label: 'Running' },
  { id: 'Shoulder / Rehab', label: 'Rehab' },
  { id: 'Mobility', label: 'Mobility' },
  { id: 'custom', label: 'Custom' }
];

const BODY_AREA_CHIPS = [
  { id: '', label: 'Any area' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'grip', label: 'Grip' },
  { id: 'core', label: 'Core' },
  { id: 'back', label: 'Back' }
];

const MOVEMENT_CHIPS = [
  { id: '', label: 'Any pattern' },
  { id: 'squat', label: 'Squat' },
  { id: 'hinge', label: 'Hinge' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'carry', label: 'Carry' }
];

const MOVEMENT_PATTERNS = ['squat', 'hinge', 'push', 'pull', 'carry', 'locomotion', 'mobility', 'other'];

let screenRoot = null;
let uiState = null;
let escapeHtml = (value) => String(value);
let setHeader = () => {};
let renderSettings = () => {};

export function initExerciseLibraryUI(deps) {
  screenRoot = deps.screenRoot;
  uiState = deps.uiState;
  escapeHtml = deps.escapeHtml;
  setHeader = deps.setHeader;
  renderSettings = deps.renderSettings;
}

function ensureLibraryUiState() {
  if (!uiState.exerciseLibrarySearch) uiState.exerciseLibrarySearch = '';
  if (!uiState.exerciseLibraryFilter) uiState.exerciseLibraryFilter = 'all';
  if (uiState.exerciseLibraryBodyArea == null) uiState.exerciseLibraryBodyArea = '';
  if (uiState.exerciseLibraryMovement == null) uiState.exerciseLibraryMovement = '';
  if (uiState.exerciseLibraryEquipment == null) uiState.exerciseLibraryEquipment = '';
  if (!uiState.exerciseLibraryFlash) uiState.exerciseLibraryFlash = null;
}

function renderFlash() {
  if (!uiState.exerciseLibraryFlash) return '';
  return `<p class="library-flash">${escapeHtml(uiState.exerciseLibraryFlash)}</p>`;
}

function renderChipGroup(chips, activeId, dataAttr) {
  return chips
    .map(
      (chip) => `
      <button type="button" class="library-chip ${activeId === chip.id ? 'library-chip--active' : ''}"
        data-${dataAttr}="${escapeHtml(chip.id)}">${chip.label}</button>
    `
    )
    .join('');
}

function renderExerciseRow(exercise, favoriteIds = []) {
  const row = formatExerciseLibraryRow(exercise);
  const starred = favoriteIds.includes(exercise.id);
  return `
    <div class="library-row-wrap">
      <button type="button" class="library-row" data-exercise-id="${escapeHtml(row.id)}">
        <span class="library-row-main">
          <strong>${escapeHtml(row.name)}</strong>
          <span class="library-row-meta">${escapeHtml(row.category)} · ${escapeHtml(row.equipment)} · ${escapeHtml(row.trackingLabel)}</span>
        </span>
        <span class="library-row-chevron" aria-hidden="true">›</span>
      </button>
      <button type="button" class="library-fav-btn ${starred ? 'library-fav-btn--active' : ''}" data-fav-id="${escapeHtml(row.id)}" aria-label="${starred ? 'Remove favourite' : 'Add favourite'}">${starred ? '★' : '☆'}</button>
    </div>
  `;
}

function renderSection(title, exercises, favoriteIds) {
  if (!exercises.length) return '';
  return `
    <p class="settings-group-title">${escapeHtml(title)}</p>
    <div class="library-list">${exercises.map((exercise) => renderExerciseRow(exercise, favoriteIds)).join('')}</div>
  `;
}

function bindLibraryBack(buttonId, handler) {
  document.getElementById(buttonId)?.addEventListener('click', handler);
}

function bindListInteractions() {
  document.querySelectorAll('.library-row').forEach((row) => {
    row.addEventListener('click', () => renderExerciseLibraryDetail(row.dataset.exerciseId));
  });

  document.querySelectorAll('.library-fav-btn').forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.stopPropagation();
      await toggleFavoriteExercise(btn.dataset.favId);
      renderExerciseLibraryList();
    });
  });
}

export async function renderExerciseLibraryList() {
  ensureLibraryUiState();
  setHeader('Exercise Library');

  const [exercises, favoriteIds, recentIds] = await Promise.all([
    searchExercises(uiState.exerciseLibrarySearch, {
      filter: uiState.exerciseLibraryFilter,
      bodyArea: uiState.exerciseLibraryBodyArea || null,
      movementPattern: uiState.exerciseLibraryMovement || null,
      equipment: uiState.exerciseLibraryEquipment || null
    }),
    getFavoriteExerciseIds(),
    getRecentExerciseIds()
  ]);

  const hasSearch = Boolean(uiState.exerciseLibrarySearch.trim());
  const hasExtraFilters =
    uiState.exerciseLibraryBodyArea ||
    uiState.exerciseLibraryMovement ||
    uiState.exerciseLibraryEquipment ||
    (uiState.exerciseLibraryFilter && uiState.exerciseLibraryFilter !== 'all');

  let listHtml = '';
  if (!hasSearch && !hasExtraFilters) {
    const sections = partitionExerciseSections(exercises, favoriteIds, recentIds);
    listHtml = [
      renderSection('Favourites', sections.favourites, favoriteIds),
      renderSection('Recently Used', sections.recent, favoriteIds),
      renderSection('All Exercises', sections.all, favoriteIds)
    ].join('');
  } else {
    listHtml = `<div class="library-list">${exercises.length ? exercises.map((exercise) => renderExerciseRow(exercise, favoriteIds)).join('') : '<p class="settings-empty">No exercises match this search.</p>'}</div>`;
  }

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <div class="library-header">
          <p class="section-label">Training</p>
          <h1 class="library-title">Exercise Library</h1>
          <p class="library-count">${exercises.length} exercise${exercises.length === 1 ? '' : 's'}</p>
          ${renderFlash()}
          <input type="search" class="library-search" id="library-search" placeholder="Search legs, grip, kettlebell…" value="${escapeHtml(uiState.exerciseLibrarySearch)}">
          <div class="library-chips">${renderChipGroup(FILTER_CHIPS, uiState.exerciseLibraryFilter, 'filter')}</div>
          <div class="library-chips library-chips-secondary">${renderChipGroup(BODY_AREA_CHIPS, uiState.exerciseLibraryBodyArea, 'body-area')}</div>
          <div class="library-chips library-chips-secondary">${renderChipGroup(MOVEMENT_CHIPS, uiState.exerciseLibraryMovement, 'movement')}</div>
          <label class="library-field library-field-compact">
            <span>Equipment</span>
            <select id="library-equipment-filter">
              <option value="">Any equipment</option>
              ${EQUIPMENT_OPTIONS.map((item) => `<option value="${escapeHtml(item)}" ${uiState.exerciseLibraryEquipment === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}
            </select>
          </label>
          <button type="button" class="btn-secondary btn-fds-inline" id="btn-create-exercise">+ Create Exercise</button>
        </div>
        ${listHtml}
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-library-back-settings">Back to Settings</button>
      </div>
    </div>
  `;

  uiState.exerciseLibraryFlash = null;

  document.getElementById('library-search')?.addEventListener('input', (e) => {
    uiState.exerciseLibrarySearch = e.target.value;
    renderExerciseLibraryList();
  });

  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      uiState.exerciseLibraryFilter = chip.dataset.filter;
      renderExerciseLibraryList();
    });
  });

  document.querySelectorAll('[data-body-area]').forEach((chip) => {
    chip.addEventListener('click', () => {
      uiState.exerciseLibraryBodyArea = chip.dataset.bodyArea;
      renderExerciseLibraryList();
    });
  });

  document.querySelectorAll('[data-movement]').forEach((chip) => {
    chip.addEventListener('click', () => {
      uiState.exerciseLibraryMovement = chip.dataset.movement;
      renderExerciseLibraryList();
    });
  });

  document.getElementById('library-equipment-filter')?.addEventListener('change', (e) => {
    uiState.exerciseLibraryEquipment = e.target.value;
    renderExerciseLibraryList();
  });

  bindListInteractions();
  document.getElementById('btn-create-exercise')?.addEventListener('click', () => renderExerciseLibraryEditor());
  bindLibraryBack('btn-library-back-settings', renderSettings);
}

function renderBulletList(items, emptyText) {
  if (!items?.length) return `<p class="settings-hint">${emptyText}</p>`;
  return `<ul class="library-detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export async function renderExerciseLibraryDetail(id) {
  const exercise = await getExercise(id);
  if (!exercise) {
    uiState.exerciseLibraryFlash = 'Exercise not found.';
    return renderExerciseLibraryList();
  }

  const meta = getExerciseDisplayMeta(exercise);
  const technique = meta.technique || {};
  const favorite = await isFavoriteExercise(id);

  setHeader('Exercise');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll field-manual">
        <div class="field-manual-head">
          <p class="section-label">${exercise.isCustom ? 'Custom Exercise' : 'Field Manual'}</p>
          <div class="field-manual-title-row">
            <h1 class="library-title">${escapeHtml(exercise.name)}</h1>
            <button type="button" class="library-fav-btn library-fav-btn--large ${favorite ? 'library-fav-btn--active' : ''}" id="btn-detail-fav" aria-label="Toggle favourite">${favorite ? '★' : '☆'}</button>
          </div>
          <p class="field-manual-subtitle">${escapeHtml(meta.subtitle)}</p>
          <p class="field-manual-equipment">${escapeHtml(meta.equipment)}</p>
        </div>
        ${renderFlash()}
        ${technique.setup ? `<p class="section-label">Setup</p><p class="library-detail-copy">${escapeHtml(technique.setup)}</p>` : ''}
        <p class="section-label">Form Cues</p>
        ${renderBulletList(technique.cues, 'No cues added.')}
        <p class="section-label">Common Mistakes</p>
        ${renderBulletList(technique.commonMistakes, 'None listed.')}
        <div class="library-detail-grid">
          <div><span class="library-detail-label">Tracking</span><strong>${escapeHtml(meta.trackingLabel)}</strong></div>
          <div><span class="library-detail-label">Default Rest</span><strong>${meta.defaultRestSeconds ? `${meta.defaultRestSeconds} sec` : '—'}</strong></div>
        </div>
        ${exercise.progressionNotes ? `<p class="section-label">Progression</p><p class="library-detail-copy">${escapeHtml(exercise.progressionNotes)}</p>` : ''}
        <div class="library-detail-actions">
          <button type="button" class="btn-secondary btn-fds-inline" id="btn-edit-exercise">Edit Exercise</button>
          ${
            exercise.active === false
              ? '<button type="button" class="btn-secondary btn-fds-inline" id="btn-restore-exercise">Restore Exercise</button>'
              : '<button type="button" class="btn-secondary btn-fds-inline" id="btn-archive-exercise">Archive Exercise</button>'
          }
        </div>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-library-back-list">Back to Library</button>
      </div>
    </div>
  `;

  uiState.exerciseLibraryFlash = null;
  document.getElementById('btn-detail-fav')?.addEventListener('click', async () => {
    await toggleFavoriteExercise(id);
    renderExerciseLibraryDetail(id);
  });
  document.getElementById('btn-edit-exercise')?.addEventListener('click', () => renderExerciseLibraryEditor(id));
  document.getElementById('btn-archive-exercise')?.addEventListener('click', async () => {
    await archiveExercise(id);
    uiState.exerciseLibraryFlash = `${exercise.name} archived.`;
    renderExerciseLibraryList();
  });
  document.getElementById('btn-restore-exercise')?.addEventListener('click', async () => {
    await restoreExercise(id);
    uiState.exerciseLibraryFlash = `${exercise.name} restored.`;
    renderExerciseLibraryDetail(id);
  });
  bindLibraryBack('btn-library-back-list', renderExerciseLibraryList);
}

function renderTrackingOptions(selected) {
  return TRACKING_TYPE_IDS.map(
    (id) =>
      `<option value="${id}" ${selected === id ? 'selected' : ''}>${escapeHtml(TRACKING_TYPES[id].label)}</option>`
  ).join('');
}

function renderCategoryOptions(selected) {
  return EXERCISE_CATEGORIES.map(
    (category) => `<option value="${category}" ${selected === category ? 'selected' : ''}>${category}</option>`
  ).join('');
}

function renderMovementOptions(selected) {
  return MOVEMENT_PATTERNS.map(
    (pattern) =>
      `<option value="${pattern}" ${selected === pattern ? 'selected' : ''}>${pattern.charAt(0).toUpperCase()}${pattern.slice(1)}</option>`
  ).join('');
}

function renderEquipmentCheckboxes(selected = []) {
  return EQUIPMENT_OPTIONS.map((item) => {
    const checked = selected.includes(item) ? 'checked' : '';
    return `
      <label class="library-equipment-option">
        <input type="checkbox" name="equipment" value="${escapeHtml(item)}" ${checked}>
        <span>${escapeHtml(item)}</span>
      </label>
    `;
  }).join('');
}

export async function renderExerciseLibraryEditor(id = null) {
  const existing = id ? await getExercise(id) : null;
  const isEdit = !!existing;
  const technique = existing?.technique || {};
  setHeader(isEdit ? 'Edit Exercise' : 'Create Exercise');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">${isEdit ? 'Edit Exercise' : 'Create Exercise'}</p>
        ${renderFlash()}
        <form id="library-editor-form" class="library-editor-form">
          <label class="library-field">
            <span>Exercise name</span>
            <input type="text" id="library-name" required value="${escapeHtml(existing?.name || '')}">
          </label>
          <label class="library-field">
            <span>Tracking</span>
            <select id="library-tracking" ${isEdit && existing?.legacyInstanceIds?.length ? 'disabled' : ''}>
              ${renderTrackingOptions(existing?.trackingType || 'reps')}
            </select>
          </label>
          <label class="library-field">
            <span>Category</span>
            <select id="library-category">${renderCategoryOptions(existing?.category || 'Other')}</select>
          </label>
          <label class="library-field">
            <span>Default rest (seconds)</span>
            <input type="number" id="library-rest" min="0" max="600" step="15" value="${existing?.defaultRestSeconds ?? 60}">
          </label>
          <button type="button" class="btn-text" id="btn-toggle-advanced">${uiState.exerciseLibraryAdvancedOpen ? 'Hide advanced metadata' : 'Show advanced metadata'}</button>
          <div class="library-advanced ${uiState.exerciseLibraryAdvancedOpen ? '' : 'hidden'}" id="library-advanced">
            <label class="library-field">
              <span>Aliases (comma-separated)</span>
              <input type="text" id="library-aliases" value="${escapeHtml((existing?.aliases || []).join(', '))}">
            </label>
            <label class="library-field">
              <span>Movement pattern</span>
              <select id="library-movement">${renderMovementOptions(existing?.movementPattern || 'other')}</select>
            </label>
            <label class="library-field">
              <span>Primary muscles (comma-separated)</span>
              <input type="text" id="library-primary-muscles" value="${escapeHtml((existing?.primaryMuscles || []).join(', '))}">
            </label>
            <label class="library-field">
              <span>Secondary muscles (comma-separated)</span>
              <input type="text" id="library-secondary-muscles" value="${escapeHtml((existing?.secondaryMuscles || []).join(', '))}">
            </label>
            <label class="library-field">
              <span>Keywords (comma-separated)</span>
              <input type="text" id="library-keywords" value="${escapeHtml((existing?.keywords || []).join(', '))}">
            </label>
            <div class="library-field">
              <span>Equipment</span>
              <div class="library-equipment-grid">${renderEquipmentCheckboxes(existing?.equipment || [])}</div>
            </div>
            <label class="library-field">
              <span>Setup</span>
              <textarea id="library-setup" rows="2">${escapeHtml(technique.setup || existing?.description || '')}</textarea>
            </label>
            <label class="library-field">
              <span>Form cues (one per line, max 3)</span>
              <textarea id="library-cues" rows="3">${escapeHtml((technique.cues || existing?.cues || []).join('\n'))}</textarea>
            </label>
            <label class="library-field">
              <span>Common mistakes (one per line, max 3)</span>
              <textarea id="library-mistakes" rows="3">${escapeHtml((technique.commonMistakes || []).join('\n'))}</textarea>
            </label>
          </div>
          <label class="library-field">
            <span>Progression notes</span>
            <textarea id="library-progression" rows="3">${escapeHtml(existing?.progressionNotes || '')}</textarea>
          </label>
          <p class="settings-hint" id="library-editor-error"></p>
          <button type="submit" class="btn-primary">${isEdit ? 'Save Exercise' : 'Create Exercise'}</button>
        </form>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-library-editor-back">${isEdit ? 'Cancel' : 'Back to Library'}</button>
      </div>
    </div>
  `;

  uiState.exerciseLibraryFlash = null;

  document.getElementById('btn-toggle-advanced')?.addEventListener('click', () => {
    uiState.exerciseLibraryAdvancedOpen = !uiState.exerciseLibraryAdvancedOpen;
    renderExerciseLibraryEditor(id);
  });

  document.getElementById('library-editor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('library-editor-error');
    const advancedOpen = uiState.exerciseLibraryAdvancedOpen;
    const payload = {
      name: document.getElementById('library-name').value,
      trackingType: document.getElementById('library-tracking').value,
      category: document.getElementById('library-category').value,
      defaultRestSeconds: Number(document.getElementById('library-rest').value || 0),
      progressionNotes: document.getElementById('library-progression').value.trim() || null
    };

    if (advancedOpen) {
      payload.aliases = parseCommaList(document.getElementById('library-aliases').value);
      payload.movementPattern = document.getElementById('library-movement').value;
      payload.primaryMuscles = parseCommaList(document.getElementById('library-primary-muscles').value);
      payload.secondaryMuscles = parseCommaList(document.getElementById('library-secondary-muscles').value);
      payload.keywords = parseCommaList(document.getElementById('library-keywords').value);
      payload.equipment = [...document.querySelectorAll('input[name="equipment"]:checked')].map((el) => el.value);
      payload.technique = {
        setup: document.getElementById('library-setup').value.trim(),
        cues: parseLineList(document.getElementById('library-cues').value, 3),
        commonMistakes: parseLineList(document.getElementById('library-mistakes').value, 3)
      };
    } else if (isEdit && existing) {
      payload.equipment = existing.equipment;
      payload.technique = existing.technique;
    }

    try {
      if (isEdit) {
        await updateExercise(id, payload);
        uiState.exerciseLibraryFlash = `${payload.name} saved.`;
        renderExerciseLibraryDetail(id);
      } else {
        const created = await createExercise(payload);
        uiState.exerciseLibraryFlash = `${created.name} created.`;
        renderExerciseLibraryDetail(created.id);
      }
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message || 'Could not save exercise.';
    }
  });

  bindLibraryBack(
    'btn-library-editor-back',
    isEdit ? () => renderExerciseLibraryDetail(id) : renderExerciseLibraryList
  );
}
