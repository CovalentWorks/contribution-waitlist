# Contribution waitlist

A standalone Next.js waitlist for CovalentWorks' group contributions product. The working name is **Padi**. This project collects waitlist signups; it does not collect money or identity documents.

## Local development

```sh
npm ci
node scripts/setup-env.mjs
# Add SendPulse SMTP credentials to .env
npm run dev
```

Open http://localhost:3035. Admin: http://localhost:3035/admin.

Change **`brand.name` in `src/config.ts`** to rename the website, page metadata, email subjects, email body, and sender display name. The repo, storage identifiers, and cookie names are intentionally stable across renames. Contact details and company name live in the same config. Set `SITE_URL` separately when changing domains, and redeploy.

## Signup and email

The form saves email, optional group type/purpose, timestamp, and consent version into SQLite. A unique case-insensitive email constraint prevents duplicate entries. Signup and welcome-email outbox insertion happen in one transaction. Email failure does not lose the signup.

SendPulse SMTP uses STARTTLS and the authenticated `hello@usecollet.com` sender. The production scheduled function retries queued messages every five minutes. The admin can view status, retry failed messages, search, export CSV, and remove signups. Welcome emails include a working unsubscribe link and one-click unsubscribe headers. Opening the unsubscribe page does not remove someone until they confirm; mail clients can POST the one-click URL.

The current account's hourly SMTP budget is handled conservatively: 40 welcome attempts and 8 admin-code attempts per hour. There are up to 12 delivery attempts with backoff. SMTP is at-least-once: a crash after provider acceptance but before saving the result can cause a duplicate email. A stable Message-ID helps mail clients recognize duplicates but does not guarantee deduplication. “Sent” means accepted by SendPulse, not confirmed inbox delivery.

## Admin access

Password plus a one-time email code, restricted on the server to:

- chinazorfredrick@gmail.com
- ugochigere02@gmail.com
- leslieokoduwa@gmail.com

The password is scrypt-hashed. Codes expire after 10 minutes, allow five guesses, and are single-use. Sessions expire after eight hours and use HttpOnly, Secure (production), SameSite=Strict cookies. Logout revokes the server session. Auth attempts are rate limited in the shared database. The original deployment password is shared privately, never committed.

## SQLite storage and deployment

Netlify functions have no durable writable filesystem. Production therefore runs **real SQLite through sql.js** and stores its encrypted database snapshot in a **private Netlify Blobs store**, `private-waitlist`, under `waitlist.enc`. AES-256-GCM protects the snapshot. Only the backend has the encryption key and storage credentials. There is no database download route and nothing is placed in `public/`.

Each write reads the latest snapshot with strong consistency, performs a SQLite transaction, then conditionally writes against its ETag. A conflicting write retries against fresh data. This prevents concurrent signups from overwriting each other. Transactions must have no external side effects: email runs after the durable commit.

This is intentionally for a small waitlist, not a high-throughput app database. Each transaction loads/exports the entire file, with a 25 MiB safety limit. Migrate to a persistent SQLite service or a dedicated database before substantially increasing traffic. Local development uses encrypted `.data/waitlist.enc`, with a per-process write queue; do not run multiple local writers against that file.

Deployment uses a public GitHub repository under CovalentWorks and Netlify continuous deployment from `main`. `netlify.toml` configures Node 22, the Next.js build, and the email retry schedule. Configure production environment variables from `.env.example` in Netlify. `SITE_URL` needs builds and functions scope; credentials and keys need functions scope. Set `DATABASE_BACKEND=netlify` in production. Never share production credentials with preview builds.

Preserve `DATABASE_ENCRYPTION_KEY`: losing it makes signups unrecoverable. Keep a private password-manager copy of this key and the other secrets. For backups, download the encrypted blob through authenticated Netlify tools and retain it separately from the encryption key. No automated off-site backup is configured. CSV exports are available to admins but are plaintext personal data. Do not commit exports or snapshots. Rotating `AUTH_SECRET` invalidates pending login codes and unsubscribe tokens; plan a token migration before changing it. Rotating the encryption key requires decrypting and re-encrypting the snapshot with both keys available.

The scheduled worker removes signups older than 365 days. Unsubscribe/admin deletion also removes queued mail. A message already handed to SMTP may still arrive after removal.

## Checks

```sh
npm test
npm run build
npm run test:integration
```

The integration suite starts an isolated production server on port 3036 with temporary encrypted storage and empty SMTP credentials. It tests persistence, duplicate signup, failure retries, CSRF, private paths, allowlisted login, code expiry/replay/guess limits, session logout, CSV formula protection, and unsubscribe. It never sends real emails.

Design research and photography credits: [docs/design-research.md](docs/design-research.md).
