# Wedding Invitation

Digital wedding invitation built with Next.js, Tailwind CSS, Framer Motion, and Firebase.

Replace the placeholder photos in `public/images` with your own locally. Do not commit personal photos, logos, music, or bank details — those belong in `.env` and gitignored media files.

Optional background music: place `public/audio/background.m4a` locally (gitignored).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template and fill in values:
   ```bash
   cp .env.example .env
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Guest generate commands

Generate invite links and WhatsApp messages from Firestore.

### Prerequisites

1. Firebase web config filled in `.env` (`NEXT_PUBLIC_FIREBASE_*`)
2. Service account JSON at `secrets/firebase-service-account.json`
3. In `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   INVITE_HMAC_SECRET=  # openssl rand -hex 32
   ```
   If `NEXT_PUBLIC_SITE_URL` is empty, links default to `http://localhost:3000`.

### CSV format

File: `data/guests.csv` (see `data/guests.sample.csv`)

```csv
name,title,inviteType
Andi,Mr,livestream
Barus,Mrs,physical
```

| Column | Values |
| --- | --- |
| `name` | Guest name |
| `title` | `Mr` / `Mrs` / `Ms` / `Dear` (optional style) |
| `inviteType` | `physical` or `livestream` |

### Commands

**Import new guests** (append-only; skips names that already exist) + write Excel:

```bash
npm run guests -- import data/guests.csv
```

**Export all guests** from Firestore (no re-import) — use this after changing `NEXT_PUBLIC_SITE_URL`:

```bash
npm run guests -- export
```

Output: `data/guests-links-*.xlsx`

Sort order:
1. Attending (accept) — earliest RSVP time first
2. Declined (reject) — earliest RSVP time first
3. Not yet RSVP — invite type then name
4. Excel also includes `RSVP At` column (from `wishSubmittedAt`)

| Excel column | Use |
| --- | --- |
| `Invite URL` | Personal invite link (`{SITE_URL}/?g={guestId}&k={token}`) |
| `Chat WA` | Ready-to-paste WhatsApp message |
| `RSVP` / `Attending Count` / `Wish` | Present on **export** only |

RSVP deadline is shared via `NEXT_PUBLIC_RSVP_CLOSE_DATE` (Chat WA + invitation form).

### Typical flow

1. Edit `data/guests.csv`
2. `npm run guests -- import data/guests.csv`
3. Set live `NEXT_PUBLIC_SITE_URL` in `.env`
4. `npm run guests -- export`
5. Share `Invite URL` or `Chat WA` from the new Excel file

## Invite security

The invitation is not public. Opening `/` without a signed personal link shows the gate.

Guest records and RSVP writes are **not** readable/writable with the Firebase web API key (Postman / Burp against Firestore will fail). The browser talks only to Next.js API routes, which require:

1. A signed link `/?g={guestId}&k={hmac}` (`INVITE_HMAC_SECRET` stays on the server)
2. Same-origin browser signals on RSVP
3. Optional [Firebase App Check](https://firebase.google.com/docs/app-check) (`NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` + `APP_CHECK_ENFORCE=true`) to reject scripts even when someone has a valid link

After setting `INVITE_HMAC_SECRET`, re-run `npm run guests -- export` and share the new URLs. Old `?g=`-only links will not open.

On Vercel, set `INVITE_HMAC_SECRET` and either `FIREBASE_SERVICE_ACCOUNT` (full JSON) or `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`. Deploy updated **Firestore rules** so all client reads/writes are denied.

## Deploy

Recommended for Next.js: **Vercel** (simple, professional defaults).  
Alternatives: Netlify, Cloudflare Pages, or GitHub + any Node host.

Set the same `NEXT_PUBLIC_*` variables plus `INVITE_HMAC_SECRET` and the Admin SDK credentials in your hosting dashboard. Do not upload `.env` or service account files.
