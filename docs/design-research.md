# Design references

Current approved direction: the pale-ivory/rust photographic layout with five friends in Abuja. The historical research below is retained for context; the later direction and photo provenance are recorded in [modern-experiments.md](modern-experiments.md).

Research was performed in the authenticated Mobbin account in Chrome. The final page adapts composition and interaction patterns; it does not reuse another product's logo, copy, or proprietary imagery.

- [Luffu hero](https://mobbin.com/sites/sections/56a6a5fd-ab26-4726-ad57-1e63615c27a9): photography as the main visual, restrained navigation, large wordmark. This informed the portrait panel and simple page structure.
- [Pally signup](https://mobbin.com/sites/sections/e896962b-08ae-4b1b-beb9-5dfc0c7c0275): focused email capture with few competing actions. This informed the compact form, with optional research questions collapsed by default.
- [Ease hero](https://mobbin.com/sites/sections/6695790f-7142-4e99-86a9-2632963b795d): generous spacing and green typography. Reviewed as an additional reference.
- [Daydream hero](https://mobbin.com/sites/sections/0bc24482-f3ff-4d45-b252-024b51e2bcd0): reviewed an illustration-led alternative, then moved to real photography following feedback.
- [Osmo welcome email](https://reallygoodemails.com/emails/osmo-supply-welcome-newsletter): clear signup acknowledgement, one image, and a short personal note. The email uses independently written copy and a table layout with inline styles for email compatibility.

The copy explains the actual proposed controls: collection links, visible contributions and spending, and signatory approval for withdrawals. It avoids invented traction, testimonials, guarantees, and a fabricated launch date. The product is explicitly in development.

## Photography

[Cheerful Black friends hugging on a sandy beach](https://www.pexels.com/photo/cheerful-black-friends-hugging-on-sandy-beach-5161734/) by **SALOMON BYUMA**, Pexels. Used under the [Pexels license](https://www.pexels.com/license/). Stored locally as `public/images/community.webp` and `community-email.jpg`, resized/compressed for web and email. These are stock-photo subjects, not claimed customers or team members. The user's brief specifically requested Black or African people.

Bricolage Grotesque ExtraBold for display text and Archivo for body text are self-hosted through Fontsource. This follows the user’s request for big, bold, modern, curving typography; icons are from Phosphor. No third-party font requests or analytics are required by the page.

## Mobile opening revision

Reviewed Mobbin's archived Luffu hero and Pally waitlist again, plus the live phone layouts of [Luffu](https://luffu.com/), [Partiful](https://partiful.com/), and [Pally](https://pally.com/). The live Luffu and Pally pages have evolved beyond their archived waitlists. Luffu uses photography behind its opening message; Partiful places its social image beneath a short headline and actions while still showing it in the first phone viewport. Pally uses a focused text-led opening.

For Ourmoni, the previous phone layout placed a long paragraph and the complete form before the photo, making the strongest visual feel detached. The revised phone hero combines the photo and headline in one opening composition. Faces stay in the upper portion and a dark lower scrim keeps the headline legible; the description and form follow immediately. Desktop retains the side-by-side composition. The image and headline are not duplicated in the DOM.

## Independent Mobbin review and redesign (18 October 2026)

Three design reviewers independently inspected references in authenticated Mobbin, captured and viewed screenshots, then compared three rendered Ourmoni candidates at 390px and 1440px: cobalt/butter with a panoramic photo below signup, a saturated rust page with an arched photograph, and a warm cream page with a full-width headline above a landscape photograph and signup.

New references inspected:

- [Partiful hero](https://mobbin.com/sites/sections/5472e9d8-de81-40dc-ba9e-a2d6f4e71fe1): concise copy and action sit apart from expressive social imagery. Ourmoni borrows that separation without party decoration or text over faces.
- [Unify hero](https://mobbin.com/sites/sections/acd5dcfc-c4b8-48af-bbe0-69d41446e1b7): uninterrupted headline above a photographic field. This informed the winning desktop composition.
- [Eat Hungry Tiger hero](https://mobbin.com/sites/sections/f6d74eb3-c4bb-4302-bff9-41aa18c34f68): confident warm colours and large typography. This informed the rust contender and the winner's restrained accent.
- [Daylight hero](https://mobbin.com/sites/sections/ae02560e-359b-462e-ac3d-887c2444d273): warm colour and environmental photography. Its opening interstitial was rejected because it delays the waitlist action.
- [Goldsand CTA](https://mobbin.com/sites/sections/3630fa58-de35-4bed-9a13-e2e20f69461d): one dominant object and a quiet action area. Its product imagery and claims were not transferred.
- [Fixa CTA](https://mobbin.com/sites/sections/d84f593d-7b77-4382-8b3f-423645a3cfa9): photography with deliberate negative space. Its moody blur was unsuitable for Ourmoni.

The reviewers ranked the rendered candidates independently. Visual direction: Rust, Warm, Cobalt. Mobile UX: Warm, Cobalt, Rust. Waitlist design: Warm, Rust, Cobalt. Warm won two of three first-place votes. All three approved the final refined Warm implementation. This is a qualitative design review, not a conversion experiment.

### Final implementation

Cream `#FBF6EC`, brown `#34251F`, rust `#A93F27`, Bricolage Grotesque 800 display and Archivo body. Desktop uses a broad headline above the landscape photograph and signup. Mobile uses headline, a compact landscape photograph, explanation, then signup. No dark photo overlay, oversized duplicate wordmark, invented customer evidence, or decorative dashboard. The required consent and optional group fields now precede submit. All existing group choices remain available. The email template and social preview use the same photograph and palette.

### New free photograph

[Family setting the table for dinner](https://www.pexels.com/photo/family-setting-the-table-for-dinner-4262011/) by August de Richelieu, downloaded from Pexels and served locally as optimized WebP and email JPEG. The [Pexels licence](https://www.pexels.com/license/) permits free commercial use and modification without mandatory attribution. The people are illustrative subjects, not claimed Ourmoni users. A landscape crop preserves the intergenerational gathering and shared table. The previous beach image remains in repository history; it is no longer the current page or email visual.

### Validation

Production build, backend unit tests and API integration checks pass. Browser checks cover 320, 390, 430, 760, 768, 1024 and 1440px, optional group fields, input sizing, overflow, loading/error/success states and consent interaction. Tests use intercepted signup requests or an isolated test database, not real welcome emails.
