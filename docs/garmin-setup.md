# GarminDB Integration for Athlete OS

Athlete OS imports **sanitised health data** from GarminDB. Garmin credentials, SQLite databases, and raw FIT files never enter the PWA or this repository.

## Security boundary

```text
Garmin Connect
  -> GarminDB (local Windows PC, credentials in ~/.GarminDb/)
  -> GarminDB SQLite (read-only)
  -> scripts/garmin_export.py
  -> garmin-snapshot.json (sanitised)
  -> Athlete OS Settings import
  -> IndexedDB (read-only display)
```

Athlete OS **never**:

- stores Garmin credentials
- talks to Garmin Connect
- queries GarminDB SQLite from the browser
- requires Garmin sync for workouts

The official Garmin Connect Developer Program is designed for approved business or enterprise integrations and is not a practical primary path for this private single-user application.

## Windows installation

1. Install Python 3.10+.
2. Install GarminDB:

```bash
pip install garmindb
```

3. Copy the example config:

```text
copy %USERPROFILE%\.GarminDb\GarminConnectConfig.json.example %USERPROFILE%\.GarminDb\GarminConnectConfig.json
```

4. Edit `%USERPROFILE%\.GarminDb\GarminConnectConfig.json` locally. Add your Garmin Connect username and password. **Never commit this file.**

5. Adjust `data` start dates to match your Garmin history.

## Incremental sync

Run periodically (e.g. Windows Task Scheduler):

```bash
garmindb_cli.py --all --download --import --analyze --latest
```

## Backup GarminDB data

```bash
garmindb_cli.py --backup
```

Also back up:

- `%USERPROFILE%\.GarminDb\`
- `%USERPROFILE%\HealthData\`

Use OS-level encryption and file permissions on these folders.

## Export for Athlete OS

From the Athlete OS project directory:

```bash
python scripts/garmin_export.py ^
  --garmin-db-dir "%USERPROFILE%\.GarminDb" ^
  --output "%USERPROFILE%\AthleteOS-exports\garmin-snapshot.json"
```

Environment variables `GARMIN_DB_DIR`, `HEALTH_DATA_DIR`, and `GARMIN_SNAPSHOT_OUTPUT` are also supported.

The exporter is **read-only**. It never writes to GarminDB databases and never includes credentials, tokens, or local file paths in the output.

## Import into Athlete OS

1. Transfer `garmin-snapshot.json` to your phone (cloud drive, USB, etc.).
2. Open Athlete OS -> **Settings** -> **Garmin Data**.
3. Tap **Import Garmin Snapshot** and select the file.
4. Confirm status shows last successful import time and record counts.
5. Tap **View Garmin Data** to inspect latest metrics.

Import failures do **not** block workouts or app startup. Previous Garmin data remains available after a failed import.

## Troubleshooting

| Issue | Action |
|---|---|
| Unsupported GarminDB schema | Update GarminDB (`pip install --upgrade garmindb`), re-sync, re-export |
| Empty daily data | Run `garmindb_cli.py --all --download --import --analyze --latest` |
| Missing sleep | Ensure sleep sync is enabled in Garmin Connect; check GarminDB sleep table |
| Export fails | Verify `%USERPROFILE%\HealthData\DBs\garmin.db` exists |

GarminDB is community-maintained and may break when Garmin Connect changes.

## Credential safety

- Keep `GarminConnectConfig.json` only on your PC
- Never paste credentials into Athlete OS
- Never commit `.GarminDb/`, `HealthData/`, or snapshot files to Git
- Athlete OS full backup includes imported Garmin data only — not Garmin credentials

## Data limitations (Phase 1)

Imported:

- Steps, resting HR, sleep, stress, HRV, intensity minutes
- Activity summaries (type, duration, distance, heart rate)

Not imported:

- Weight or body fat (use Athlete OS weigh-in)
- Raw heart-rate streams, GPS tracks, FIT files
- Training readiness or coaching adjustments

## Removing the integration

1. Stop running GarminDB sync/export tasks.
2. In Athlete OS, export a full backup if you want to keep historical data.
3. Clear site data for Athlete OS in the browser (removes IndexedDB).
4. Delete local `%USERPROFILE%\.GarminDb\` and `%USERPROFILE%\HealthData\` if desired.
