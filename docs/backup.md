# Backup & Data Safety

Athlete OS stores all data locally in your browser (IndexedDB). Backups let you recover after clearing site data or reinstalling the app.

## What survives clearing Chrome history?

| Action | Athlete OS data |
|--------|-----------------|
| Clear **browsing history** only | Usually **kept** |
| Clear **cookies and site data** | **Deleted** |
| Chrome → Site settings → Clear & reset | **Deleted** |
| Uninstall PWA (sometimes) | **Deleted** |

Your workouts, weigh-ins, and Garmin imports are **not** stored in browsing history. They live in IndexedDB until site data is cleared.

## Recommended workflow

1. Leave **Auto-backup to Downloads** enabled (Settings → Data & Backup).
2. When a backup runs, move `athlete-os-backup-YYYY-MM-DD.json` from Downloads to **Google Drive** or another cloud folder.
3. Optionally tap **Share to Drive** on the backup banner after an auto-export.

Auto-backup runs when:
- You open the app and the last export is older than your interval (default 7 days), or
- Data has changed since the last export.

## What's included in a full backup

- Campaign, blueprints, missions, set logs, integrity
- Settings (weight unit, rest timer, etc.)
- Body measurements (weigh-ins)
- Imported Garmin daily health, activities, and sync state

**Not included:** Garmin credentials, raw GarminDB databases, or PC export files. Re-export Garmin from your PC if needed.

## Restore after clearing site data

1. Open Athlete OS (fresh install is normal).
2. Tap **Choose backup file** on the restore prompt, or go to Settings → **Import full backup**.
3. Select your `athlete-os-backup-*.json` file.
4. Choose **Replace all local data** (recommended after a site-data clear).
5. Tap **Apply Import**.

## Local snapshots (in-app safety net)

Athlete OS also keeps up to **3 rolling snapshots** inside the browser after data changes. These help if a bad import goes wrong, but they are **deleted** when you clear site data.

Settings → **Restore local snapshot** (only shown when snapshots exist).

## Manual export

Settings → **Export now** — downloads a full backup immediately and updates the last-export timestamp.

## Body measurements only

CSV export/import remains available for weigh-ins only. Use full backup for complete recovery.
