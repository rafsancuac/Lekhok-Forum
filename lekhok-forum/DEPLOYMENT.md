# Deployment — Vercel + Turso + Vercel Blob

This app deploys to **Vercel** as a serverless function backed by **Turso (libSQL)** for persistence and **Vercel Blob** for file uploads.

## Architecture

```
Browser ──► Vercel Edge / @vercel/node
                │
                ├──► Turso (libSQL/SQLite-compatible)
                │       20+ tables: users, posts, messages, daily_content, etc.
                │
                └──► Vercel Blob
                        Avatars, covers, gallery images, message attachments
```

In **local dev**, the same code uses:
- `sql.js` for an in-memory + on-disk `lekhok.db`
- Local disk `public/uploads/<subdir>/` for files

The `IS_TURSO` and `USE_BLOB` flags are flipped automatically when the relevant env vars are set.

## Required Environment Variables

| Variable | Required? | Purpose |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes (prod) | e.g. `libsql://lekhok-forum.turso.io` |
| `TURSO_AUTH_TOKEN`   | Yes (prod) | Issued by `turso db tokens create` |
| `SESSION_SECRET`     | Recommended | Long random string |
| `BLOB_READ_WRITE_TOKEN` | Yes (prod, for uploads) | From Vercel Blob dashboard |

## First-time setup (Turso)

```bash
# 1. Install Turso CLI
brew install tursodatabase/tap/turso     # macOS
# or: curl -sSfL https://get.tur.so/install.sh | bash

# 2. Login
turso auth login

# 3. Create a database
turso db create lekhok-forum
turso db show lekhok-forum --url
turso db tokens create lekhok-forum     # copy the token

# 4. Add env vars to Vercel
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add SESSION_SECRET production
vercel env add BLOB_READ_WRITE_TOKEN production
```

## Local development

```bash
cd lekhok-forum
npm install
cp .env.example .env.local      # leave empty to use sql.js
npm run dev                      # http://localhost:8080
```

The first run creates `lekhok.db` locally with an empty schema + admin user.

To test the Vercel pipeline locally:
```bash
npm i -g vercel
npm run vercel-dev               # runs vercel dev with @vercel/node
```

## Deploy

```bash
# First time
vercel                           # creates project + preview URL

# Production
vercel --prod                    # deploys to production
```

After the first deploy, run migrations against the live Turso DB:
```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run migrate
```

## Deploy WITHOUT Turso — Blob snapshot mode (zero external accounts)

No Turso account? The app can still run on Vercel. When `BLOB_READ_WRITE_TOKEN`
is set and no `TURSO_DATABASE_URL` is configured, **db.js automatically switches
to snapshot mode**: the sql.js database image is periodically uploaded to a
secret-hashed Vercel Blob object (`private/db-<hash>.sqlite`) and restored on
every cold boot. Data survives restarts/redeploys with no extra service.

### Setup (dashboard only, ~3 minutes)
1. Vercel → Project → **Settings → General → Root Directory** → `lekhok-forum` → Save
2. Vercel → Project → **Storage** → **Create Database/Blob** → create a Blob store
   (Hobby plan includes free tier) → **Connect to project** → the
   `BLOB_READ_WRITE_TOKEN` env var is added automatically
3. Optional: Settings → Environment Variables → `SESSION_SECRET` (long random string)
4. **Deployments → Redeploy**

Logins on a fresh deploy: `admin/admin123`, `moderator/moderator123`,
demo users `ismail`/`monem`/… (`demo123`) — seeded automatically on first boot.

### Trade-offs vs Turso (read before real-world use)
| | Blob snapshot mode | Turso |
|---|---|---|
| Signup | none (part of Vercel) | free account needed |
| Consistency | **last-write-wins** — two serverless instances writing "at once" can drop one writer's changes | real transactions, always consistent |
| Cold boots | 1 extra Blob download (~100–300 ms) | direct SQL |
| Best for | demo / very light traffic club site | production |

The DB snapshot pathname contains a SHA-256 hash of `SESSION_SECRET`, so the
blob URL is unguessable — but treat the mode as demo-grade. When the site outgrows
it, create a Turso DB, set the two `TURSO_*` vars, and redeploy: snapshot mode
switches off automatically (users/data do NOT migrate automatically; export first
via `npm run migrate`-style tooling or the admin panel).

Force-disable with env `DB_BLOB_SNAPSHOT=0`.

## File-upload migration

Files in `public/uploads/` (created during local dev) **won't survive** the Vercel deploy because the serverless filesystem is read-only.

To migrate:
1. Run `vercel env pull` locally to get the production blob token
2. Use a small Node script (not yet written) to enumerate `public/uploads/**/*` and re-upload each to Vercel Blob, replacing the DB column with the new URL
3. Or simply re-upload via the admin panel

## Caveats

- **Cold start**: First request after deploy may take 1-2s while Turso connection is established
- **Serverless timeout**: Vercel free tier = 10s. Multer maxes at 10MB so this should be safe; for larger files, use a direct-to-Blob client upload (not yet implemented)
- **No persistent disk**: All temp files, logs, or local DB writes fail on Vercel
