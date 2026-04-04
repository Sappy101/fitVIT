# FitVit Local Website (Stitch + Mock Backend)

## Run locally (recommended now)

Your machine currently does not have Node in PATH, so run the website in static mode.

1. Open terminal in this folder:

```powershell
cd fitvit-web
```

2. Start a simple local server with Python:

```powershell
python -m http.server 5500
```

3. Open:

- http://localhost:5500/public/

You can also use VS Code Live Server extension and open `public/index.html`.

## Install Node on Windows (recommended)

1. Download Node.js LTS from: https://nodejs.org
2. Run installer with default options.
3. Close and reopen terminal.
4. Verify:

```powershell
node -v
npm -v
```

If version numbers appear, Node is installed correctly.

## Run with backend API (Node mode)

```powershell
cd fitvit-web
node server.mjs
```

Open: http://localhost:5173

The app now auto-detects backend availability:
- If Node API is running, it uses API login/data.
- If not, it falls back to static local mode.

## Login

- User ID: `admin`
- Password: `admin`

## What's implemented

- Login page with default auth (`admin/admin`)
- Main dashboard with working UI elements:
  - Mess optimizer filters (budget, distance, type)
  - Ranked mess list based on score
  - Day-wise menu viewer
  - Admin quick-add form writing to dummy DB
- Stitch previews section that opens your exported pages directly from workspace folders

## Backend structure

Current default mode: static frontend + localStorage persistence + `db/mockData.json` seed data.

Optional Node backend mode (after Node install): `server.mjs` + `db/mockData.json`

APIs:

- `POST /api/login`
- `GET /api/bootstrap`
- `GET /api/messes`
- `POST /api/messes`
- `GET /api/menu`

## Current behavior in static mode

- Login check is local (`admin` / `admin`).
- Mess add form writes to localStorage (so it persists in your browser).
- Stitch previews open your exported page folders directly.

## Easy migration path

### Supabase

- Replace file read/write in `server.mjs` with Supabase queries.
- Keep API response shape same to avoid frontend rewrites.

## Supabase profile setup (now integrated)

User profile create/save is now wired in frontend flows:

- Signup: creates a base profile row.
- Onboarding: upserts profile fields + preferred mess.
- Profile Settings: loads profile from Supabase and saves edits back.

### 1. Create table + policy

Run SQL from:

- `supabase/user_profiles.sql`

This creates `public.user_profiles` and a permissive anon policy for quick dev.

### 2. Add project URL and anon key

Preferred: set keys once in `public/config.js` (auto-loaded by profile/auth pages):

- `public/config.js`

This file already exposes:

- `window.FITVIT_SUPABASE_URL`
- `window.FITVIT_SUPABASE_ANON_KEY`

Fallback option (if you do not want to edit file), set keys in browser console:

```js
localStorage.setItem("fitvit_supabase_url", "https://YOUR_PROJECT.supabase.co");
localStorage.setItem("fitvit_supabase_anon_key", "YOUR_ANON_KEY");
```

Then reload the app.

Optional helper:

```js
window.FitVitSupabase.setConfig("https://YOUR_PROJECT.supabase.co", "YOUR_ANON_KEY");
```

### 3. Verify profile sync

1. Create account.
2. Complete onboarding fields.
3. Open profile settings and update a field.
4. Confirm row in Supabase table `user_profiles` updates.

### Notes

- If Supabase is not configured or temporarily fails, app falls back to localStorage profile save.
- Tighten Row Level Security policies before production; current policy is intentionally dev-friendly.
- For Vercel deployment, keep using `public/config.js` for anon URL/key, or replace it with an environment-injected config script in your deploy pipeline.

### SQLite

- Replace `readDb/writeDb` with SQLite functions (e.g., `better-sqlite3` or `sqlite3`).
- Keep endpoint contracts unchanged.

This keeps the frontend stable while backend evolves.
