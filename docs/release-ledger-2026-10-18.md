# Animated ledger release — 0.1.2

The user selected the animated ledger and authorized production deployment. The homepage replaces the photograph with the Metro Lagos Estate generator collection, using the revised Manrope ExtraBold heading. The sample payment is to Chinedu the mechanic. Preview labels and playback controls are removed as requested. The three explicitly selected privacy passages are removed.

The sequence loops with cleaned-up timers, pauses in hidden tabs, and is static for reduced-motion preferences. Only the animation is a client component. The existing form and all backend services remain unchanged. No new payment functionality, real customer records or financial transactions are connected to the animation.

The local design gallery and two rejected page variants are retired. The production build contains no `/lab/*` routes. Existing local `/lab/ledger` bookmarks redirect to the selected local homepage. Previous design history remains in Git.

## Validation and deployment

Run the existing database/security tests, production build and isolated API integration tests. Check the animation sequence, exact approved copy, removed controls/labels, privacy text, desktop/mobile layout, form expansion stability and reduced motion. Do not submit a real signup or send production mail during release checks. Push reviewed main to the existing GitHub-to-Netlify pipeline and verify the published commit and live page.

## Results before publishing

- Dependency install: audit found zero vulnerabilities.
- `npm test`: all 5 tests passed.
- Production build and TypeScript checks passed; no experiment routes appear in the build.
- Isolated integration suite passed persistence, duplicate handling, SMTP retry, CSRF, honeypot, private-file protection, admin allowlist/OTP/session, CSV safety, unsubscribe and worker authentication checks. No real emails sent.
- Independent review approved the release with no blockers; API/auth/database/form/email/deployment configuration is unchanged.
- Browser checks at 320, 390, 768, 1024 and 1440px passed: no overflow, no ledger movement on form expansion, correct Manrope font and copy. The full autoplay sequence and restart, arithmetic, approvals and reduced-motion state passed.
- Rejected routes and private file paths return 404; unauthenticated admin records return 401.

## Rollback

Previous production: `68b0d0da17f88264b084e9d5ec1b5161f37a4191` (v0.1.1). Republish its successful Netlify deployment, or revert the ledger release commit and push main. No database migration or environment change accompanies this release; preserve the encrypted database, production keys, mail credentials and admin configuration.
