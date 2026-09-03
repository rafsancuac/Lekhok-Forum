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
