import { OPERATIONS } from '../seed/blueprint-v1.js';
import {
  getCampaign,
  saveCampaignDocument,
  saveActiveCampaignEdits,
  duplicatePrescription,
  duplicateDay,
  duplicateDayToCampaign,
  listEditableCampaigns,
  CAMPAIGN_STATUS,
  DAY_ORDER
} from '../services/campaignLibrary.js';
import { t } from '../services/languageStyle.js';
import {
  createSection,
  dayNameFor,
  defaultPrescription,
  formatPrescriptionSummary,
  SECTION_DEFAULT_TITLES,
  SECTION_TYPES,
  sortSections,
  validatePrescription,
  OPERATION_OTHER
} from '../services/campaignPrescription.js';
import { getTrackingTypeLabel, getPrescriptionFieldIds, getPrescriptionFieldLabel } from '../services/trackingTypes.js';
import { generateId } from '../db.js';
import { openExercisePicker, showOverlayPicker, hideOverlayPicker } from './exercisePicker.js';

let screenRoot = null;
let overlayRoot = null;
let overlayBackdrop = null;
let uiState = null;
let escapeHtml = (value) => String(value);
let setHeader = () => {};
let renderCampaignLibraryList = () => {};
let openActivateConfirm = () => {};
let autosaveTimer = null;
let autosaveState = 'saved';

const DAY_TAB_LABELS = {
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
  0: 'SUN'
};

export function initCampaignBuilderUI(deps) {
  screenRoot = deps.screenRoot;
  overlayRoot = deps.overlayRoot;
  overlayBackdrop = deps.overlayBackdrop || null;
  uiState = deps.uiState;
  escapeHtml = deps.escapeHtml;
  setHeader = deps.setHeader;
  renderCampaignLibraryList = deps.renderCampaignLibraryList;
  openActivateConfirm = deps.openActivateConfirm || (() => {});
}

function ensureBuilderState() {
  if (uiState.builderDayOfWeek == null) uiState.builderDayOfWeek = 1;
  if (!uiState.builderStage) uiState.builderStage = 'details';
}

function setAutosaveStatus(status) {
  autosaveState = status;
  const el = document.getElementById('builder-autosave');
  if (!el) return;
  if (status === 'saving') el.textContent = 'Saving…';
  else if (status === 'error') el.textContent = 'Unable to save';
  else el.textContent = 'Saved';
}

function scheduleAutosave(campaign) {
  uiState.builderCampaign = campaign;
  setAutosaveStatus('saving');
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async () => {
    try {
      if (campaign.status === CAMPAIGN_STATUS.ACTIVE) {
        uiState.builderCampaign = await saveActiveCampaignEdits(campaign);
      } else {
        await saveCampaignDocument(campaign);
      }
      setAutosaveStatus('saved');
    } catch {
      setAutosaveStatus('error');
    }
  }, 800);
}

async function flushCampaignSave(campaign) {
  clearTimeout(autosaveTimer);
  if (campaign.status === CAMPAIGN_STATUS.ACTIVE) {
    uiState.builderCampaign = await saveActiveCampaignEdits(campaign);
    return uiState.builderCampaign;
  }
  await saveCampaignDocument(campaign);
  setAutosaveStatus('saved');
  return campaign;
}

function operationOptions(selected) {
  const presets = Object.entries(OPERATIONS)
    .map(
      ([key, meta]) =>
        `<option value="${key}" ${selected === key ? 'selected' : ''}>${escapeHtml(meta.label)}</option>`
    )
    .join('');
  return `${presets}<option value="${OPERATION_OTHER}" ${selected === OPERATION_OTHER ? 'selected' : ''}>Other</option>`;
}

function renderUnitSelect(field, value, options) {
  return `
    <select name="${field}" data-field="${field}">
      ${options.map((opt) => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
    </select>
  `;
}

function renderPrescriptionFields(trackingType, prescription = {}) {
  const fields = getPrescriptionFieldIds(trackingType);
  if (!fields.length) {
    return '<p class="settings-hint">No prescription fields for this tracking type.</p>';
  }

  const fieldSet = new Set(fields);
  const parts = [];

  for (const field of fields) {
    if (field === 'weightUnit' && fieldSet.has('weight')) continue;
    if (field === 'distanceUnit' && fieldSet.has('distance')) continue;

    const value = prescription[field] ?? '';

    if (field === 'weight' && fieldSet.has('weightUnit')) {
      parts.push(`
        <label class="library-field">
          <span>${escapeHtml(getPrescriptionFieldLabel('weight'))}</span>
          <div class="library-field-row">
            <input type="number" name="weight" data-field="weight" value="${escapeHtml(String(prescription.weight ?? ''))}">
            ${renderUnitSelect('weightUnit', prescription.weightUnit ?? 'kg', ['kg', 'lbs'])}
          </div>
        </label>
      `);
      continue;
    }

    if (field === 'distance' && fieldSet.has('distanceUnit')) {
      parts.push(`
        <label class="library-field">
          <span>${escapeHtml(getPrescriptionFieldLabel('distance'))}</span>
          <div class="library-field-row">
            <input type="number" name="distance" data-field="distance" value="${escapeHtml(String(prescription.distance ?? ''))}">
            ${renderUnitSelect('distanceUnit', prescription.distanceUnit ?? 'km', ['km', 'm', 'mi'])}
          </div>
        </label>
      `);
      continue;
    }

    if (field === 'weightUnit' || field === 'distanceUnit') {
      const options = field === 'weightUnit' ? ['kg', 'lbs'] : ['km', 'm', 'mi'];
      parts.push(`
        <label class="library-field">
          <span>${escapeHtml(getPrescriptionFieldLabel(field))}</span>
          ${renderUnitSelect(field, value, options)}
        </label>
      `);
      continue;
    }

    const inputType = ['sets', 'reps', 'restSeconds', 'durationSeconds', 'weight', 'distance'].includes(field)
      ? 'number'
      : 'text';
    parts.push(`
      <label class="library-field">
        <span>${escapeHtml(getPrescriptionFieldLabel(field))}</span>
        <input type="${inputType}" name="${field}" data-field="${field}" value="${escapeHtml(String(value))}">
      </label>
    `);
  }

  return parts.join('');
}

function getDay(campaign, dayOfWeek) {
  return campaign.weeklyMissions.find((day) => day.dayOfWeek === dayOfWeek);
}

function ensureSection(campaign, dayOfWeek, type) {
  const day = getDay(campaign, dayOfWeek);
  let section = day.sections.find((item) => item.type === type);
  if (!section) {
    section = createSection(type, day.sections.length);
    day.sections.push(section);
  }
  return section;
}

function renderExerciseRow(row, sectionType) {
  const summary = formatPrescriptionSummary(row.exerciseSnapshot?.trackingType, row.prescription);
  return `
    <div class="builder-exercise-row" data-rx-id="${escapeHtml(row.id)}" data-section="${sectionType}">
      <div class="builder-exercise-main">
        <strong>${escapeHtml(row.exerciseSnapshot?.name || 'Exercise')}</strong>
        <span class="library-row-meta">${escapeHtml(getTrackingTypeLabel(row.exerciseSnapshot?.trackingType))} · ${escapeHtml(summary)}${row.optional ? ' · Optional' : ''}</span>
      </div>
      <div class="builder-exercise-actions">
        <button type="button" class="btn-text" data-edit-rx="${escapeHtml(row.id)}">Edit</button>
        <button type="button" class="btn-text" data-dup-rx="${escapeHtml(row.id)}">Dup</button>
        <button type="button" class="btn-text btn-text-danger" data-remove-rx="${escapeHtml(row.id)}">Remove</button>
      </div>
    </div>
  `;
}

function renderDayEditor(campaign, dayOfWeek) {
  const day = getDay(campaign, dayOfWeek);
  const sections = sortSections(day.sections);
  const sectionHtml = sections
    .map((section) => {
      const rows = [...section.exercises].sort((a, b) => a.order - b.order);
      return `
        <section class="builder-section" data-section-type="${section.type}">
          <div class="builder-section-head">
            <h3>${escapeHtml(section.title || SECTION_DEFAULT_TITLES[section.type])}</h3>
            <button type="button" class="btn-text" data-add-exercise="${section.type}">+ Add Exercise</button>
          </div>
          <div class="builder-section-body">
            ${rows.length ? rows.map((row) => renderExerciseRow(row, section.type)).join('') : '<p class="settings-hint">No exercises yet.</p>'}
          </div>
        </section>
      `;
    })
    .join('');

  const missingSections = SECTION_TYPES.filter((type) => type !== 'main' && !sections.some((section) => section.type === type));

  return `
    <div class="builder-day-meta">
      <label class="library-field">
        <span>${t('missionName')}</span>
        <input type="text" id="builder-day-name" value="${escapeHtml(day.name || day.dayName)}">
      </label>
      <label class="library-field">
        <span>${t('operation')}</span>
        <select id="builder-day-operation">${operationOptions(day.operation)}</select>
      </label>
      <label class="library-field ${day.operation === OPERATION_OTHER ? '' : 'hidden'}" id="builder-operation-custom-wrap">
        <span>${t('operationName')}</span>
        <input type="text" id="builder-operation-custom" value="${escapeHtml(day.operationCustom || '')}" placeholder="e.g. Hypertrophy">
      </label>
      <label class="library-field">
        <span>${t('purposeLabel')}</span>
        <input type="text" id="builder-day-purpose" value="${escapeHtml(day.purpose || '')}">
        <span class="settings-hint">What this day is for — e.g. "Build aerobic base" or "Heavy lower body". Shown in planning only; optional.</span>
      </label>
      <label class="library-field">
        <span>Estimated duration (minutes)</span>
        <input type="number" id="builder-day-duration" value="${day.estimatedDurationMinutes ?? ''}">
      </label>
    </div>
    ${sectionHtml}
    <div class="builder-day-actions">
      ${missingSections
        .map(
          (type) =>
            `<button type="button" class="btn-secondary btn-fds-inline" data-add-section="${type}">+ ${escapeHtml(SECTION_DEFAULT_TITLES[type])}</button>`
        )
        .join('')}
      <button type="button" class="btn-secondary btn-fds-inline" id="btn-duplicate-day">Duplicate Day</button>
    </div>
  `;
}

function renderDetailsStage(campaign) {
  return `
    <form id="builder-details-form" class="library-editor-form">
      <label class="library-field">
        <span>${t('campaignName')}</span>
        <input type="text" name="name" required value="${escapeHtml(campaign.name)}">
      </label>
      <label class="library-field">
        <span>Duration (weeks)</span>
        <input type="number" name="durationWeeks" min="1" required value="${campaign.durationWeeks || 12}">
      </label>
      <label class="library-field">
        <span>Primary goal</span>
        <input type="text" name="primaryGoal" value="${escapeHtml(campaign.primaryGoal || '')}">
      </label>
      <label class="library-field">
        <span>Notes</span>
        <textarea name="notes" rows="3">${escapeHtml(campaign.notes || '')}</textarea>
      </label>
    </form>
  `;
}

function bindDayMeta(campaign, dayOfWeek) {
  const day = getDay(campaign, dayOfWeek);
  const opSelect = document.getElementById('builder-day-operation');
  const customWrap = document.getElementById('builder-operation-custom-wrap');

  const toggleCustomOperation = () => {
    const isOther = opSelect?.value === OPERATION_OTHER;
    customWrap?.classList.toggle('hidden', !isOther);
  };

  document.getElementById('builder-day-name')?.addEventListener('input', (e) => {
    day.name = e.target.value;
    scheduleAutosave(campaign);
  });
  opSelect?.addEventListener('change', (e) => {
    day.operation = e.target.value;
    if (day.operation !== OPERATION_OTHER) day.operationCustom = '';
    toggleCustomOperation();
    scheduleAutosave(campaign);
  });
  document.getElementById('builder-operation-custom')?.addEventListener('input', (e) => {
    day.operationCustom = e.target.value;
    scheduleAutosave(campaign);
  });
  document.getElementById('builder-day-purpose')?.addEventListener('input', (e) => {
    day.purpose = e.target.value;
    scheduleAutosave(campaign);
  });
  document.getElementById('builder-day-duration')?.addEventListener('input', (e) => {
    day.estimatedDurationMinutes = e.target.value ? Number(e.target.value) : null;
    scheduleAutosave(campaign);
  });
  toggleCustomOperation();
}

function bindBuilderInteractions(campaign) {
  const dayOfWeek = uiState.builderDayOfWeek;

  bindDayMeta(campaign, dayOfWeek);

  screenRoot.querySelectorAll('[data-add-exercise]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sectionType = btn.dataset.addExercise;
      openExercisePicker({
        title: 'Add Exercise',
        onSelect: async (exercise) => {
          const section = ensureSection(campaign, dayOfWeek, sectionType);
          const row = {
            id: generateId('rx'),
            libraryExerciseId: exercise.id,
            exerciseSnapshot: { name: exercise.name, trackingType: exercise.trackingType },
            order: section.exercises.length,
            optional: false,
            prescription: defaultPrescription(exercise.trackingType, exercise),
            campaignNotes: ''
          };
          section.exercises.push(row);
          scheduleAutosave(campaign);
          await renderCampaignBuilder(campaign.id);
          openPrescriptionEditor(campaign, dayOfWeek, row.id);
        }
      });
    });
  });

  screenRoot.querySelectorAll('[data-add-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.addSection;
      const day = getDay(campaign, dayOfWeek);
      if (!day.sections.some((section) => section.type === type)) {
        day.sections.push(createSection(type, day.sections.length));
        scheduleAutosave(campaign);
        renderCampaignBuilder(campaign.id);
      }
    });
  });

  screenRoot.querySelectorAll('[data-edit-rx]').forEach((btn) => {
    btn.addEventListener('click', () => openPrescriptionEditor(campaign, dayOfWeek, btn.dataset.editRx));
  });

  screenRoot.querySelectorAll('[data-dup-rx]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await duplicatePrescription(campaign.id, dayOfWeek, btn.dataset.dupRx);
      uiState.builderCampaign = await getCampaign(campaign.id);
      renderCampaignBuilder(campaign.id);
    });
  });

  screenRoot.querySelectorAll('[data-remove-rx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = getDay(campaign, dayOfWeek);
      for (const section of day.sections) {
        section.exercises = section.exercises.filter((row) => row.id !== btn.dataset.removeRx);
        section.exercises.forEach((row, index) => {
          row.order = index;
        });
      }
      scheduleAutosave(campaign);
      renderCampaignBuilder(campaign.id);
    });
  });

  document.getElementById('btn-duplicate-day')?.addEventListener('click', () => {
    openDuplicateDayPicker(campaign, dayOfWeek);
  });
}

function renderDuplicateDayButtons(sourceDayOfWeek, { disableSource = true } = {}) {
  return DAY_ORDER.map((dow) => {
    const disabled = disableSource && dow === sourceDayOfWeek;
    return `<button type="button" class="duplicate-day-btn${disabled ? ' duplicate-day-btn--disabled' : ''}" data-target-day="${dow}"${disabled ? ' disabled' : ''}>${DAY_TAB_LABELS[dow]}</button>`;
  }).join('');
}

function bindDuplicateDayGrid(container, handler) {
  if (!container) return;
  container.querySelectorAll('[data-target-day]:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => handler(Number(btn.dataset.targetDay)));
  });
}

async function openDuplicateDayPicker(campaign, sourceDayOfWeek) {
  const sourceName = dayNameFor(sourceDayOfWeek);

  showOverlayPicker(`
    <div class="picker-panel duplicate-day-picker">
      <p class="section-label">Copy ${escapeHtml(sourceName)} to…</p>
      <div class="duplicate-day-grid" id="dup-day-same-grid">${renderDuplicateDayButtons(sourceDayOfWeek)}</div>
      <button type="button" class="btn-text duplicate-day-advanced-toggle" id="dup-day-advanced-toggle">Copy to another campaign</button>
      <div class="duplicate-day-advanced hidden" id="dup-day-advanced">
        <label class="library-field">
          <span>${t('campaignLabel')}</span>
          <select id="dup-day-campaign"></select>
        </label>
        <div class="duplicate-day-grid" id="dup-day-advanced-grid">${renderDuplicateDayButtons(sourceDayOfWeek, { disableSource: false })}</div>
      </div>
      <button type="button" class="btn-secondary" id="dup-day-cancel">Cancel</button>
    </div>
  `);

  document.getElementById('dup-day-cancel')?.addEventListener('click', hideOverlayPicker);

  bindDuplicateDayGrid(document.getElementById('dup-day-same-grid'), async (targetDay) => {
    hideOverlayPicker();
    await duplicateDay(campaign.id, sourceDayOfWeek, targetDay);
    uiState.builderCampaign = await getCampaign(campaign.id);
    uiState.builderDayOfWeek = targetDay;
    renderCampaignBuilder(campaign.id);
  });

  document.getElementById('dup-day-advanced-toggle')?.addEventListener('click', async () => {
    const advanced = document.getElementById('dup-day-advanced');
    const toggle = document.getElementById('dup-day-advanced-toggle');
    advanced?.classList.remove('hidden');
    toggle?.classList.add('hidden');
    if (advanced?.dataset.loaded) return;

    const campaigns = await listEditableCampaigns(campaign.id);
    const select = document.getElementById('dup-day-campaign');
    if (!campaigns.length) {
      select.innerHTML = '<option value="">No other editable campaigns</option>';
      advanced.dataset.loaded = '1';
      return;
    }
    select.innerHTML = campaigns
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
      .join('');

    bindDuplicateDayGrid(document.getElementById('dup-day-advanced-grid'), async (targetDay) => {
      const targetCampaignId = select.value;
      if (!targetCampaignId) return;
      hideOverlayPicker();
      await duplicateDayToCampaign(campaign.id, sourceDayOfWeek, targetCampaignId, targetDay);
      const targetName = campaigns.find((item) => item.id === targetCampaignId)?.name || 'campaign';
      uiState.campaignLibraryFlash = `Day copied to ${targetName}.`;
    });

    advanced.dataset.loaded = '1';
  });
}

function openPrescriptionEditor(campaign, dayOfWeek, prescriptionId) {
  const day = getDay(campaign, dayOfWeek);
  let row = null;
  let sectionType = 'main';
  for (const section of day.sections) {
    const found = section.exercises.find((item) => item.id === prescriptionId);
    if (found) {
      row = found;
      sectionType = section.type;
      break;
    }
  }
  if (!row) return;

  showOverlayPicker(`
    <div class="picker-panel">
      <p class="section-label">Edit Prescription</p>
      <h3 class="library-title">${escapeHtml(row.exerciseSnapshot?.name || 'Exercise')}</h3>
      <form id="prescription-form" class="library-editor-form">
        ${renderPrescriptionFields(row.exerciseSnapshot?.trackingType, row.prescription)}
        <label class="library-field">
          <span>${t('campaignNotes')}</span>
          <input type="text" name="campaignNotes" value="${escapeHtml(row.campaignNotes || '')}">
        </label>
        <label class="library-field library-field-inline">
          <input type="checkbox" name="optional" ${row.optional ? 'checked' : ''}>
          <span>Optional exercise</span>
        </label>
        <p class="settings-hint" id="prescription-error"></p>
      </form>
      <div class="library-detail-actions">
        <button type="button" class="btn-secondary" id="prescription-cancel">Cancel</button>
        <button type="button" class="btn-primary" id="prescription-save">Save</button>
      </div>
    </div>
  `);

  document.getElementById('prescription-cancel')?.addEventListener('click', hideOverlayPicker);

  document.getElementById('prescription-save')?.addEventListener('click', () => {
    const form = document.getElementById('prescription-form');
    const nextPrescription = { ...row.prescription };
    form.querySelectorAll('[data-field]').forEach((input) => {
      nextPrescription[input.dataset.field] =
        input.type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value;
    });
    const errors = validatePrescription(row.exerciseSnapshot?.trackingType, nextPrescription);
    const errorEl = document.getElementById('prescription-error');
    if (errors.length) {
      errorEl.textContent = errors.join(' ');
      return;
    }
    row.prescription = nextPrescription;
    row.campaignNotes = form.querySelector('[name="campaignNotes"]')?.value || '';
    row.optional = form.querySelector('[name="optional"]')?.checked || false;
    scheduleAutosave(campaign);
    hideOverlayPicker();
    renderCampaignBuilder(campaign.id);
  });
}

export async function renderCampaignBuilder(campaignId) {
  ensureBuilderState();
  const campaign = uiState.builderCampaign?.id === campaignId ? uiState.builderCampaign : await getCampaign(campaignId);
  if (!campaign) {
    uiState.campaignLibraryFlash = t('campaignNotFound');
    return renderCampaignLibraryList();
  }
  uiState.builderCampaign = campaign;
  uiState.builderCampaignId = campaignId;
  uiState.screen = 'campaign-builder';
  setHeader(campaign.name);

  const tabs = DAY_ORDER.map(
    (dayOfWeek) => `
      <button type="button" class="builder-day-tab ${uiState.builderDayOfWeek === dayOfWeek ? 'builder-day-tab--active' : ''}" data-day="${dayOfWeek}">
        ${DAY_TAB_LABELS[dayOfWeek]}
      </button>
    `
  ).join('');

  const body =
    uiState.builderStage === 'details'
      ? renderDetailsStage(campaign)
      : renderDayEditor(campaign, uiState.builderDayOfWeek);

  const isActive = campaign.status === CAMPAIGN_STATUS.ACTIVE;
  const canActivate =
    campaign.status === CAMPAIGN_STATUS.DRAFT || campaign.status === CAMPAIGN_STATUS.SCHEDULED;

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <div class="builder-header">
          <p class="section-label">${t('campaignBuilder')}</p>
          <p class="builder-autosave" id="builder-autosave">${autosaveState === 'saving' ? 'Saving…' : autosaveState === 'error' ? 'Unable to save' : 'Saved'}</p>
        </div>
        ${isActive ? `<p class="builder-active-banner">${t('builderActiveBanner')}</p>` : ''}
        ${uiState.builderFlash ? `<p class="library-flash">${escapeHtml(uiState.builderFlash)}</p>` : ''}
        <div class="builder-stage-tabs">
          <button type="button" class="builder-stage-tab ${uiState.builderStage === 'details' ? 'builder-stage-tab--active' : ''}" data-stage="details">Details</button>
          <button type="button" class="builder-stage-tab ${uiState.builderStage === 'days' ? 'builder-stage-tab--active' : ''}" data-stage="days">Days</button>
        </div>
        ${uiState.builderStage === 'days' ? `<div class="builder-day-tabs">${tabs}</div>` : ''}
        <div class="builder-body">${body}</div>
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-builder-back">Back</button>
        ${
          canActivate
            ? `<div class="builder-activate-wrap">
                <button type="button" class="btn-primary" id="btn-builder-activate">Activate</button>
                <p class="builder-activate-hint">${t('builderActivateHint')}</p>
              </div>`
            : ''
        }
      </div>
    </div>
  `;

  document.getElementById('btn-builder-back')?.addEventListener('click', () => renderCampaignLibraryList());

  screenRoot.querySelectorAll('[data-stage]').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiState.builderStage = btn.dataset.stage;
      renderCampaignBuilder(campaignId);
    });
  });

  screenRoot.querySelectorAll('[data-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiState.builderDayOfWeek = Number(btn.dataset.day);
      uiState.builderStage = 'days';
      renderCampaignBuilder(campaignId);
    });
  });

  document.getElementById('builder-details-form')?.addEventListener('input', (event) => {
    const form = event.currentTarget;
    campaign.name = form.name.value.trim() || campaign.name;
    campaign.durationWeeks = Number(form.durationWeeks.value) || campaign.durationWeeks;
    campaign.primaryGoal = form.primaryGoal.value;
    campaign.notes = form.notes.value;
    scheduleAutosave(campaign);
  });

  if (uiState.builderStage === 'days') {
    bindBuilderInteractions(campaign);
  }

  document.getElementById('btn-builder-activate')?.addEventListener('click', async () => {
    uiState.builderFlash = '';
    await flushCampaignSave(campaign);
    openActivateConfirm(campaignId);
  });
}
