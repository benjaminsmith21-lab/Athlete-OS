import {
  listCampaigns,
  createCampaign,
  deleteCampaign,
  duplicateCampaign,
  endCampaign,
  archiveCampaign,
  unscheduleCampaign,
  activateCampaign,
  CAMPAIGN_STATUS,
  getCampaign
} from '../services/campaignLibrary.js';
import { getOperationLabel } from '../services/campaignPrescription.js';
import { getCampaignWeek } from '../services/campaign.js';
import { t } from '../services/languageStyle.js';

let screenRoot = null;
let uiState = null;
let escapeHtml = (value) => String(value);
let setHeader = () => {};
let renderSettings = () => {};
let openCampaignBuilder = () => {};
let openCampaignView = () => {};
let openActivateConfirm = () => {};
let openEndCampaignConfirm = () => {};

export function initCampaignLibraryUI(deps) {
  screenRoot = deps.screenRoot;
  uiState = deps.uiState;
  escapeHtml = deps.escapeHtml;
  setHeader = deps.setHeader;
  renderSettings = deps.renderSettings;
  openCampaignBuilder = deps.openCampaignBuilder;
  openCampaignView = deps.openCampaignView;
  openActivateConfirm = deps.openActivateConfirm;
  openEndCampaignConfirm = deps.openEndCampaignConfirm || (() => {});
}

function renderFlash() {
  if (!uiState.campaignLibraryFlash) return '';
  return `<p class="library-flash">${escapeHtml(uiState.campaignLibraryFlash)}</p>`;
}

function renderCampaignRow(campaign, actions) {
  const week =
    campaign.status === CAMPAIGN_STATUS.ACTIVE && campaign.startDate
      ? getCampaignWeek(campaign.startDate, new Date(), campaign.durationWeeks)
      : null;
  const meta =
    week != null
      ? `Week ${week} of ${campaign.durationWeeks}`
      : campaign.status === CAMPAIGN_STATUS.SCHEDULED && campaign.scheduledStartDate
        ? `Starts ${campaign.scheduledStartDate}`
        : `${campaign.durationWeeks} weeks`;

  return `
    <div class="library-row campaign-row">
      <button type="button" class="library-row-main campaign-row-main" data-view="${escapeHtml(campaign.id)}">
        <strong>${escapeHtml(campaign.name)}</strong>
        <span class="library-row-meta">${escapeHtml(meta)}</span>
      </button>
      <div class="campaign-row-actions">${actions}</div>
    </div>
  `;
}

function bindRowActions() {
  screenRoot.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.view;
      const status = btn.closest('.campaign-row')?.dataset.status;
      if (status === CAMPAIGN_STATUS.DRAFT) openCampaignBuilder(id);
      else openCampaignView(id);
    });
  });
}

export async function renderCampaignLibraryList() {
  setHeader(t('campaignLibrary'));
  uiState.screen = 'campaign-library';
  const grouped = await listCampaigns();

  const section = (title, rows) =>
    rows.length
      ? `<p class="settings-group-title">${title}</p><div class="library-list">${rows.join('')}</div>`
      : '';

  const activeRows = grouped.active.map((campaign) =>
    renderCampaignRow(
      campaign,
      `
      <button type="button" class="btn-text" data-view="${campaign.id}">View</button>
      <button type="button" class="btn-text" data-edit="${campaign.id}">Edit</button>
      <button type="button" class="btn-text" data-duplicate="${campaign.id}">Duplicate</button>
      <button type="button" class="btn-text btn-text-danger" data-end="${campaign.id}">End</button>
    `
    )
  );

  const scheduledRows = grouped.scheduled.map((campaign) =>
    renderCampaignRow(
      campaign,
      `
      <button type="button" class="btn-text" data-view="${campaign.id}">View</button>
      <button type="button" class="btn-text" data-edit="${campaign.id}">Edit</button>
      <button type="button" class="btn-text" data-unschedule="${campaign.id}">Unschedule</button>
      <button type="button" class="btn-text" data-duplicate="${campaign.id}">Duplicate</button>
    `
    )
  );

  const draftRows = grouped.drafts.map((campaign) =>
    renderCampaignRow(
      campaign,
      `
      <button type="button" class="btn-text" data-edit="${campaign.id}">Edit</button>
      <button type="button" class="btn-text" data-duplicate="${campaign.id}">Duplicate</button>
      <button type="button" class="btn-text btn-text-danger" data-delete="${campaign.id}">Delete</button>
    `
    )
  );

  const archiveRows = grouped.archive.map((campaign) =>
    renderCampaignRow(
      campaign,
      `
      <button type="button" class="btn-text" data-view="${campaign.id}">View</button>
      <button type="button" class="btn-text" data-duplicate="${campaign.id}">Duplicate</button>
      ${
        campaign.status === CAMPAIGN_STATUS.COMPLETED
          ? `<button type="button" class="btn-text" data-archive="${campaign.id}">Archive</button>`
          : ''
      }
    `
    )
  );

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">${t('campaignLibrary')}</p>
        ${renderFlash()}
        ${section('Active', activeRows)}
        ${section('Up Next', scheduledRows)}
        ${section('Drafts', draftRows)}
        ${section('Archive', archiveRows)}
      </div>
      <div class="screen-footer">
        <button type="button" class="btn-secondary" id="btn-campaign-library-back">Back to Settings</button>
        <button type="button" class="btn-primary" id="btn-create-campaign">${t('createCampaign')}</button>
      </div>
    </div>
  `;

  document.getElementById('btn-campaign-library-back')?.addEventListener('click', () => renderSettings());
  document.getElementById('btn-create-campaign')?.addEventListener('click', async () => {
    const campaign = await createCampaign({ name: t('newCampaignDefault') });
    openCampaignBuilder(campaign.id);
  });

  bindRowActions();

  screenRoot.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openCampaignBuilder(btn.dataset.edit));
  });
  screenRoot.querySelectorAll('[data-duplicate]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await duplicateCampaign(btn.dataset.duplicate);
      uiState.campaignLibraryFlash = t('campaignDuplicated');
      await renderCampaignLibraryList();
    });
  });
  screenRoot.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await deleteCampaign(btn.dataset.delete);
      uiState.campaignLibraryFlash = 'Draft deleted.';
      await renderCampaignLibraryList();
    });
  });
  screenRoot.querySelectorAll('[data-end]').forEach((btn) => {
    btn.addEventListener('click', () => openEndCampaignConfirm(btn.dataset.end));
  });
  screenRoot.querySelectorAll('[data-archive]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await archiveCampaign(btn.dataset.archive);
      uiState.campaignLibraryFlash = t('campaignArchived');
      await renderCampaignLibraryList();
    });
  });
  screenRoot.querySelectorAll('[data-unschedule]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await unscheduleCampaign(btn.dataset.unschedule);
      uiState.campaignLibraryFlash = t('campaignUnscheduled');
      await renderCampaignLibraryList();
    });
  });
}

export async function renderCampaignLibraryView(id) {
  const campaign = await getCampaign(id);
  if (!campaign) {
    uiState.campaignLibraryFlash = t('campaignNotFound');
    return renderCampaignLibraryList();
  }
  setHeader(campaign.name);
  uiState.screen = 'campaign-view';

  const daySummaries = (campaign.weeklyMissions || [])
    .map((day) => {
      const count = (day.sections || []).reduce(
        (sum, section) => sum + (section.exercises?.length || 0),
        0
      );
      return `<li>${escapeHtml(day.dayName)} · ${escapeHtml(getOperationLabel(day))} · ${count} exercises</li>`;
    })
    .join('');

  screenRoot.innerHTML = `
    <div class="screen">
      <div class="screen-scroll">
        <p class="section-label">${escapeHtml(campaign.status)}</p>
        <h2 class="library-title">${escapeHtml(campaign.name)}</h2>
        <p class="settings-hint">${campaign.durationWeeks} weeks${campaign.primaryGoal ? ` · ${escapeHtml(campaign.primaryGoal)}` : ''}</p>
        ${campaign.notes ? `<p class="library-detail-copy">${escapeHtml(campaign.notes)}</p>` : ''}
        <ul class="exercise-list">${daySummaries}</ul>
      </div>
      <div class="screen-footer campaign-view-footer">
        <button type="button" class="btn-secondary" id="btn-campaign-view-back">Back</button>
        ${
          campaign.status === CAMPAIGN_STATUS.DRAFT ||
          campaign.status === CAMPAIGN_STATUS.SCHEDULED ||
          campaign.status === CAMPAIGN_STATUS.ACTIVE
            ? `<button type="button" class="btn-secondary" id="btn-campaign-view-edit">Edit</button>`
            : ''
        }
        ${
          campaign.status === CAMPAIGN_STATUS.DRAFT || campaign.status === CAMPAIGN_STATUS.SCHEDULED
            ? `<button type="button" class="btn-primary" id="btn-campaign-activate">Activate</button>`
            : ''
        }
      </div>
    </div>
  `;

  document.getElementById('btn-campaign-view-back')?.addEventListener('click', () => renderCampaignLibraryList());
  document.getElementById('btn-campaign-view-edit')?.addEventListener('click', () => openCampaignBuilder(id));
  document.getElementById('btn-campaign-activate')?.addEventListener('click', () => openActivateConfirm(id));
}

export async function confirmActivateCampaign(id) {
  try {
    await activateCampaign(id, { replaceActive: false });
    uiState.campaignLibraryFlash = t('campaignActivated');
    return { ok: true };
  } catch (error) {
    if (error.code === 'ACTIVE_EXISTS') {
      return {
        ok: false,
        needsReplace: true,
        campaignId: id,
        activeCampaignId: error.activeCampaignId
      };
    }
    const message = error.details?.join(' ') || error.message;
    uiState.campaignLibraryFlash = message;
    return { ok: false, error: message };
  }
}

export async function confirmActivateCampaignReplace(id) {
  try {
    await activateCampaign(id, { replaceActive: true });
    uiState.campaignLibraryFlash = t('campaignActivated');
    return { ok: true };
  } catch (error) {
    const message = error.details?.join(' ') || error.message;
    uiState.campaignLibraryFlash = message;
    return { ok: false, error: message };
  }
}
