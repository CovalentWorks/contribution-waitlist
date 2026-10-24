# Ourmoni waitlist

A standalone Next.js waitlist for **Ourmoni**, CovalentWorks' group contributions product. This project collects waitlist signups; it does not collect money or identity documents.

## Local development

```sh
npm ci
node scripts/setup-env.mjs
# Add SendPulse SMTP credentials to .env
npm run dev
```

Open http://localhost:3035. Admin: open `http://localhost:3035/<ADMIN_PATH>` using the route printed by the setup script.

Change **`brand.name` in `src/config.ts`** to rename the website, page metadata, email subjects, email body, and sender display name. The repo, storage identifiers, and cookie names are intentionally stable across renames. Contact details and company name live in the same config. Set `SITE_URL` separately when changing domains, and redeploy.



## Checks

```sh
npm test
npm run build
npm run test:integration
```
