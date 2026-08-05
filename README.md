# Athlete OS

Local-first mission execution PWA for athletic development.

## Quick start (phone)

### The address that works

Your phone needs your PC's **local Wi‑Fi IP**, not your public internet IP.

| Wrong | Right (your PC right now) |
|---|---|
| `180.181.248.163` (public internet) | `192.168.87.134` (local Wi‑Fi) |

Public IPs only work with port forwarding. For home use, both devices must be on the **same Wi‑Fi**.

### Steps

1. Double-click [`scripts/start-server-https.bat`](scripts/start-server-https.bat) — keep the window open.
2. On your phone (same Wi‑Fi, not mobile data), open:
   ```
   https://192.168.87.134:3443
   ```
   Use **https** (not http). Accept the security warning once (self-signed cert).
3. **Add to Home Screen** (Safari: Share → Add to Home Screen / Chrome: Install app)

### "Viewing an offline copy" on phone

This means the app loaded from cache but your PC server isn't reachable. Fix:

1. Start `scripts/start-server-https.bat` on your PC (must stay open).
2. Confirm PC and phone are on the same Wi‑Fi.
3. On phone: pull to refresh, or close the tab and reopen `https://192.168.87.134:3443`.
4. If still stuck: Chrome → site settings → Clear data for this site, then reload.

The app caches for offline gym use, but needs one successful load from the server after updates.

## What it does (v1)

- **Command Centre** — today's mission from your Winter 2026 blueprint
- **Briefing** — identity, exercise loadout, progression reminders
- **Active Mission** — one exercise at a time, hybrid set logging, no scroll during workouts
- **FDS** — "Fucking Do Something" minimum mission fallback
- **Debrief** — mission rating + rule-based coach note
- **Integrity** — execution rate, FDS count, never-miss-two tracking

All data stored locally in IndexedDB. No account, no cloud, no API costs.

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
