# Separate waitlist experiments

## Current direction: simple photograph, no 3D

### Subsecute reference and stable photo position

The user subsequently requested the slight slant and decorations used on [Subsecute's live landing page](https://www.subsecute.com/). The live hero, family photo and gift-link composition were inspected visually and through their rendered styles. The hero uses a roughly -3° panel tilt; the gift composition has a warm rotated backing shape and small decorative objects at its edges. Padi adapts these with a -2° photograph (-1.5° on mobile), a flat peach backing shape at +2.5°, and two small Phosphor people/receipt marks. They are decorative, hidden from assistive technology, and do not block pointer events. No 3D, circular framing, financial balances, or simulated activity was introduced.

The optional-fields jump was caused by the photo being vertically centred in a grid area spanning the heading and signup. Expanding the form increased that area's height and moved the centred photo. It now aligns to the top. A real-browser regression check clicked the optional-fields toggle open and closed at 320, 390, 768, 1024 and 1440px and verified unchanged document coordinates and dimensions for the photograph, with no horizontal overflow or page errors. Screenshots were inspected and the production build passed.

The user selected a flat photographic design: keep the five friends in Abuja, remove the circular crop and all 3D objects, and use the rust-brown accent from the original local page instead of blue. The current `/lab/circle` URL is retained so existing preview links continue to work, but the concept is now labelled **Friends**. The photo uses a rectangular crop with small corner rounding and a thin offset rust outline. The headline accent and button use `#a93f27`; the pale-ivory background remains. There are no raised shadows or WebGL canvases.

The shared 3D component, Three.js dependency, and its types were removed. The secondary dark comparison also uses a flat photo. The Abuja photo is retained: the user's clarification referred to the reddish-brown colour, not replacing it with the family photo from port 3035.

Browser screenshots were checked at mobile and desktop widths with zero canvases, no horizontal overflow, and no page errors. The production build passes. No deployment was made; the existing port 3035 app is untouched.

The research and earlier review below document the history of this experiment; the current direction above supersedes their dimensional-art recommendations.

These concepts are isolated on branch `design/modern-experiments` in the `padi-design-lab` worktree. They are not deployed and do not replace the existing local app on port 3035. Run `npx next dev --port 3038` here, then open:

- http://localhost:3038/ — comparison index
- http://localhost:3038/lab/circle — latest pale-ivory and rust photographic design
- http://localhost:3038/lab/assembly — dark/lilac photographic comparison

The local environment has its own database and secrets, with no SMTP credentials. Preview submissions must not be mistaken for live signups. Keep this environment isolated; do not copy the production environment into the lab.

## Research and direction

The user's references changed the brief from a warm editorial photograph to a modern dimensional composition. Three reviewers independently inspected Mobbin and official pages, then reviewed rendered desktop and mobile experiments.

| Reference | Observed pattern applied |
| --- | --- |
| [Slush on Mobbin](https://mobbin.com/sites/sections/e7eecbe7-1792-468d-8e26-d8b68e0ce6bc), [official site](https://slush.app/) | Huge tactile blue forms, oversized type, and a continuous icy-blue background. |
| [Spade on Mobbin](https://mobbin.com/sites/sections/344c8713-802a-46a5-a154-73c6ca83fe48), [official site](https://www.spade.com/) | One dimensional object connected to the product idea; compact mobile composition. |
| [Stripe on Mobbin](https://mobbin.com/sites/sections/033e268c-5938-4b45-97c3-4f355f1a63c8), [official site](https://stripe.com/) | Artwork and text share the hero background; large objects crop deliberately at its edges. |
| [Phantom on Mobbin](https://mobbin.com/sites/sections/bd9c2f1d-0cca-4dc8-8a76-b8189e7fdf07), [official site](https://phantom.com/) | Dark dimensional scenes and a restrained lilac shell informed the comparison concept. |

[Block's current homepage](https://block.xyz/) was also inspected. It showed a minimal white mission page, not a 3D hero. No exact Block Mobbin listing was found; it is not claimed as a current 3D reference.

Reference artwork and logos were not reused. The earlier sculptures used original Three.js geometry; that implementation has now been removed at the user's request.

## Photographs and rights

- Circle, current revision: [Group of Smiling Friends in Abuja, Nigeria](https://www.pexels.com/photo/group-of-smiling-friends-in-abuja-nigeria-32617902/) by **Muhammad-Taha Ibrahim**. Source location: Abuja, Federal Capital Territory, Nigeria. Optimized local file: `public/images/abuja-friends.webp`. Found after the user's requested Pexels search, “group of friends african black,” followed by Nigerian group-photo searches. The source describes five friends; the image was visually inspected before selection. CSS positions the portrait crop toward the group rather than the empty sky.
- Circle, previous revision: [Friends Smiling at Phone in Lagos, Nigeria](https://www.pexels.com/photo/friends-smiling-at-phone-in-lagos-nigeria-30677716/) by **Ninthgrid**. Source location: Lagos, Lagos, Nigeria. Original local file retained: `public/images/lagos-friends.webp`.
- Assembly: [Joyful Wedding Celebration in Nigeria](https://www.pexels.com/photo/joyful-wedding-celebration-in-nigeria-30049861/) by **Deji Prince**. Source location: Federal Capital Territory, Nigeria. Optimized local file: `public/images/nigerian-wedding.webp`.

The photographs were downloaded under the [Pexels licence](https://www.pexels.com/license/), which permits free commercial use and modification. The subjects are not represented as actual customers or endorsers. Nigerian context comes from source metadata, not assumptions based on appearance. Images are real photographs; no synthetic people were generated.

## Earlier lighter Circle revision

After choosing Circle, the user requested a lighter background like the warm local version. Circle now uses pale ivory `#fbf8f1`, warm-white form surfaces, soft neutral borders/shadows, and a muted butter-yellow button. The blue sculpture, navy/blue heading, layout, copy, and type remain. These overrides are scoped to Circle; Assembly and the original app on port 3035 are unchanged. This revision is still local, with no deployment.

## Earlier 3D review outcome

All three reviewers — visual design, mobile UX, and waitlist design — preferred **Circle**. The photo and ring form a clearer composition than Assembly's photographic panel and blocks. Assembly remains a comparison, not an equally resolved recommendation.

Review refinements: enlarged Circle's photo aperture, made the desktop sculpture larger and deliberately cropped, protected the mobile body text from overlap, switched tablet widths to a stacked composition, and retained the accepted headline for a fair visual comparison. The form keeps optional group details and required consent before submission.

## Implementation and checks

- The name and contact details still come from `src/config.ts`.
- No 3D library, canvas, pointer animation, or WebGL dependency remains.
- The existing signup component and backend are reused. No authentication, storage, email, or deployment behavior was changed.
- Browser review covers 320, 390, 430, 768, 1024 and 1440px widths. Tablet layout was corrected after visual inspection, not just an overflow check.
- Prior mocked browser requests checked optional fields, error recovery, and successful submission without adding signups or sending mail. The form and backend behavior remain unchanged in the flat-photo revision.
- Run `npm run build` for production compilation. The experiments remain local and are marked noindex.

Before promoting any concept, carry only the chosen UI into the production branch, reconcile its privacy/email/share styling, and repeat the existing production release checks. Do not deploy the comparison gallery as the waitlist homepage.
