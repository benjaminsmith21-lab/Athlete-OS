import { searchExercises, formatExerciseLibraryRow } from '../services/exerciseLibrary.js';
import {
  getFavoriteExerciseIds,
  getRecentExerciseIds,
  recordRecentExercise,
  partitionExerciseSections
} from '../services/exercisePreferences.js';

let overlayRoot = null;
let overlayBackdrop = null;
let escapeHtml = (value) => String(value);
let onSelectExercise = () => {};

export function initExercisePicker(deps) {
  overlayRoot = deps.overlayRoot;
  overlayBackdrop = deps.overlayBackdrop || null;
  escapeHtml = deps.escapeHtml;
}

export function openExercisePicker({ onSelect, title = 'Add Exercise' } = {}) {
  if (!overlayRoot) return;
  onSelectExercise = onSelect || (() => {});
  renderExercisePicker({ title, query: '', filter: 'all' });
}

function renderPickerRow(exercise) {
  const row = formatExerciseLibraryRow(exercise);
  return `
    <button type="button" class="library-row picker-row" data-id="${escapeHtml(exercise.id)}">
      <span class="library-row-main">
        <strong>${escapeHtml(row.name)}</strong>
        <span class="library-row-meta">${escapeHtml(row.category)} · ${escapeHtml(row.trackingLabel)}</span>
      </span>
    </button>
  `;
}

function renderPickerSection(title, exercises) {
  if (!exercises.length) return '';
  return `
    <p class="picker-section-label">${escapeHtml(title)}</p>
    ${exercises.map(renderPickerRow).join('')}
  `;
}

function renderExercisePicker({ title, query, filter }) {
  if (overlayBackdrop) {
    overlayBackdrop.classList.remove('hidden');
    overlayBackdrop.classList.add('overlay--picker');
  }
  overlayRoot.innerHTML = `
    <div class="picker-panel">
      <p class="section-label">${escapeHtml(title)}</p>
      <input type="search" class="library-search" id="picker-search" placeholder="Search exercises" value="${escapeHtml(query)}" autocomplete="off">
      <div class="library-list" id="picker-list"></div>
      <button type="button" class="btn-secondary" id="picker-cancel">Cancel</button>
    </div>
  `;

  const renderList = async () => {
    const q = document.getElementById('picker-search')?.value || '';
    const [exercises, favoriteIds, recentIds] = await Promise.all([
      searchExercises(q, { filter, includeArchived: false }),
      getFavoriteExerciseIds(),
      getRecentExerciseIds()
    ]);
    const listEl = document.getElementById('picker-list');
    if (!listEl) return;

    if (!exercises.length) {
      listEl.innerHTML = '<p class="settings-hint">No exercises found.</p>';
      return;
    }

    if (q.trim()) {
      listEl.innerHTML = exercises.map(renderPickerRow).join('');
    } else {
      const sections = partitionExerciseSections(exercises, favoriteIds, recentIds);
      listEl.innerHTML = [
        renderPickerSection('Favourites', sections.favourites),
        renderPickerSection('Recently Used', sections.recent),
        renderPickerSection('All Exercises', sections.all)
      ].join('');
    }

    listEl.querySelectorAll('.picker-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const selected = exercises.find((item) => item.id === id);
        if (selected) {
          await recordRecentExercise(id);
          closeExercisePicker();
          await onSelectExercise(selected);
        }
      });
    });
  };

  document.getElementById('picker-search')?.addEventListener('input', () => {
    renderList();
  });
  document.getElementById('picker-cancel')?.addEventListener('click', closeExercisePicker);

  renderList();
}

export function closeExercisePicker() {
  if (overlayBackdrop) {
    overlayBackdrop.classList.add('hidden');
    overlayBackdrop.classList.remove('overlay--picker');
  }
  if (overlayRoot) overlayRoot.innerHTML = '';
}

export function showOverlayPicker(contentHtml) {
  if (overlayBackdrop) {
    overlayBackdrop.classList.remove('hidden');
    overlayBackdrop.classList.add('overlay--picker');
  }
  overlayRoot.innerHTML = contentHtml;
}

export function hideOverlayPicker() {
  closeExercisePicker();
}
