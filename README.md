# Athlete OS

Local-first mission execution PWA for athletic development.

## Quick start (phone)

### Use the live app (recommended)

Open on your phone:

**https://benjaminsmith21-lab.github.io/Athlete-OS/**

Then **Add to Home Screen** (Safari: Share → Add to Home Screen / Chrome: Install app).

Works on any network — no PC server or same Wi‑Fi needed. Data stays on your phone (IndexedDB).

### Local dev (optional)

To run from your PC on the same Wi‑Fi:

1. Double-click [`scripts/start-server-https.bat`](scripts/start-server-https.bat) — keep the window open.
2. On your phone (same Wi‑Fi), open `https://<your-pc-local-ip>:3443`
3. Accept the security warning once (self-signed cert).

The app caches for offline gym use after the first load.

## What it does (v1)

- **Command Centre** — today's mission from your Winter 2026 blueprint
- **Briefing** — identity, exercise loadout, progression reminders
- **Active Mission** — one exercise at a time, hybrid set logging, no scroll during workouts
- **FDS** — "Fucking Do Something" minimum mission fallback
- **Debrief** — mission rating + rule-based coach note
- **Integrity** — execution rate, FDS count, never-miss-two tracking

All data stored locally in IndexedDB. No account, no cloud, no API costs.

**Backup:** Enable auto-backup in Settings and keep export files in Google Drive. See [`docs/backup.md`](docs/backup.md) for what survives clearing Chrome data and how to restore.

## Edit your program

Workouts are defined in [`js/seed/blueprint-v1.js`](js/seed/blueprint-v1.js). Edit that file and refresh.

## Project structure

```
index.html          App shell
manifest.json       PWA manifest
sw.js               Service worker (offline cache)
css/app.css         Field Intelligence theme
js/app.js           Screens + routing
js/db.js            IndexedDB wrapper
js/seed/            Campaign blueprint data
js/services/        Campaign, Mission, Coach, Integrity
```
