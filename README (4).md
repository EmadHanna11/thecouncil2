# The Council — website version

## Run and rebuild on Replit

Use Node.js 24 and Python 3. Run `npm ci` in this directory, then `npm start`
(port 5000). `npm run build` regenerates the website and its server-only prompts
from `../source/`; its paths do not depend on the current working directory.
`npm test` includes concurrent quota and database rollback regression checks.

Replit uses PostgreSQL (`DATABASE_URL`) for durable account, session, usage and
statistics records. The schema is in `db/schema.sql`; the managed Publish flow
applies the development schema to production. Do not run DDL at server startup.
The original Netlify hosting/storage implementation is retained separately.
See `../replit.md` for setup and data-preservation details.

- `public/index.html` — the app
- `netlify/functions/ai.mts` — the AI gateway at `/api/ai` (keys stay on the server)
- `netlify.toml` — Netlify settings

## Environment variables (Netlify → Project configuration → Environment variables)
| Variable | Value |
|---|---|
| AI_PROVIDER | `kimi`, `openai` or `claude` |
| MOONSHOT_API_KEY | your Kimi key (secret) |
| OPENAI_API_KEY | optional (secret) |
| ANTHROPIC_API_KEY | optional (secret) |
| KIMI_MODEL / OPENAI_MODEL / CLAUDE_MODEL | optional model override |
| AI_FALLBACK_PROVIDER | optional second provider if the first fails |
| DAILY_CALL_LIMIT | AI calls per visitor per day (default 150; 0 = no limit) |

## Deploy from your computer
    npm install -g netlify-cli
    netlify login
    netlify link --id 9e9a29dd-9a63-4808-a0fc-f498811cd2c9
    netlify deploy --build --prod

## Name, email and password accounts

Account signup/sign-in is enabled by default without an email-delivery service.
Users create an account with their council name, email and password (10–128
characters); their account retains its usage limits after signing out.

Optional environment variables:
- `DISCUSSIONS_PER_DAY` (optional, default 2): new discussions per email in any rolling 24 hours.
- `CALLS_PER_ACCOUNT_DAY` (optional, default 120): safety cap on AI calls per email per day.
- `REQUIRE_SIGNIN=0`: disable account gating.

Passwords use salted scrypt hashes; session tokens are hashed in storage and
kept in HttpOnly cookies, not browser localStorage. Sessions last 30 days.
Starting a discussion uses one slot; continuing one uses only the AI-call
budget. Replit stores account records in PostgreSQL; legacy Netlify hosting
retains its own Blobs store. Email ownership is not verified and password
recovery is not implemented. Discussions remain browser-only.

## Protecting your prompts and code

- All AI prompts are built on the server (`netlify/lib/prompts.mjs`, generated from the app source by `extract_prompts.py`).
  The browser only sends small task requests (`pick`, `contribute`, `synthesize`); `/api/ai` rejects anything else,
  so nobody can see the prompts or use the endpoint as a general AI.
- Hidden persona fields (reasoning style, tone, sensitivity) are removed from the page and live only in `netlify/lib/personas.json`.
- The shipped front-end code is compressed and scrambled at build time (terser).

## Admin access (owner only)

Set `SITE_PASSKEY` in Netlify, redeploy, then open `/admin` and enter it. That browser becomes admin for 30 days:
unlimited discussions, no account sign-in. `/admin/logout` signs out. Wrong attempts are slowed and limited to 10 per hour per IP.
The public site stays open to everyone.
