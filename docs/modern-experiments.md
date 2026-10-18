# Separate modern waitlist experiments

These concepts are isolated on branch `design/modern-experiments` in the `padi-design-lab` worktree. They are not deployed and do not replace the existing local app on port 3035. Run `npx next dev --port 3038` here, then open:

- http://localhost:3038/ — comparison index
- http://localhost:3038/lab/circle — pale-ivory background with a blue shared ring
- http://localhost:3038/lab/assembly — dark/lilac assembled blocks

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

Reference artwork and logos were not reused. Both sculptures are original Three.js geometry. Four sections completing one circle suggest contributions coming together. Assembly explores individual rounded pieces forming a whole, with a photographic front face.

## Photographs and rights

- Circle, current revision: [Group of Smiling Friends in Abuja, Nigeria](https://www.pexels.com/photo/group-of-smiling-friends-in-abuja-nigeria-32617902/) by **Muhammad-Taha Ibrahim**. Source location: Abuja, Federal Capital Territory, Nigeria. Optimized local file: `public/images/abuja-friends.webp`. Found after the user's requested Pexels search, “group of friends african black,” followed by Nigerian group-photo searches. The source describes five friends; the image was visually inspected before selection. CSS positions the portrait crop toward the group rather than the empty sky.
- Circle, previous revision: [Friends Smiling at Phone in Lagos, Nigeria](https://www.pexels.com/photo/friends-smiling-at-phone-in-lagos-nigeria-30677716/) by **Ninthgrid**. Source location: Lagos, Lagos, Nigeria. Original local file retained: `public/images/lagos-friends.webp`.
- Assembly: [Joyful Wedding Celebration in Nigeria](https://www.pexels.com/photo/joyful-wedding-celebration-in-nigeria-30049861/) by **Deji Prince**. Source location: Federal Capital Territory, Nigeria. Optimized local file: `public/images/nigerian-wedding.webp`.

The photographs were downloaded under the [Pexels licence](https://www.pexels.com/license/), which permits free commercial use and modification. The subjects are not represented as actual customers or endorsers. Nigerian context comes from source metadata, not assumptions based on appearance. Images are real photographs; no synthetic people were generated.

## Lighter Circle revision

After choosing Circle, the user requested a lighter background like the warm local version. Circle now uses pale ivory `#fbf8f1`, warm-white form surfaces, soft neutral borders/shadows, and a muted butter-yellow button. The blue sculpture, navy/blue heading, layout, copy, and type remain. These overrides are scoped to Circle; Assembly and the original app on port 3035 are unchanged. This revision is still local, with no deployment.

## Review outcome

All three reviewers — visual design, mobile UX, and waitlist design — preferred **Circle**. The photo and ring form a clearer composition than Assembly's photographic panel and blocks. Assembly remains a comparison, not an equally resolved recommendation.

Review refinements: enlarged Circle's photo aperture, made the desktop sculpture larger and deliberately cropped, protected the mobile body text from overlap, switched tablet widths to a stacked composition, and retained the accepted headline for a fair visual comparison. The form keeps optional group details and required consent before submission.

## Implementation and checks

- The name and contact details still come from `src/config.ts`.
- Three.js is dynamically imported. A CSS fallback and real image remain when WebGL cannot initialize.
- Pointer tilt is restrained, ignores touch, and respects reduced motion. Rendering stops when settled or offscreen. Resources/listeners are disposed on unmount.
- The existing signup component and backend are reused. No authentication, storage, email, or deployment behavior was changed.
- Browser review covers 320, 390, 430, 768, 1024 and 1440px widths. Tablet layout was corrected after visual inspection, not just an overflow check.
- Mocked browser requests check optional fields, error recovery, and successful submission without adding signups or sending mail. Reduced-motion rendering and unavailable-WebGL fallbacks are checked separately.
- Run `npm run build` for production compilation. The experiments remain local and are marked noindex.

Before promoting any concept, carry only the chosen UI into the production branch, reconcile its privacy/email/share styling, and repeat the existing production release checks. Do not deploy the comparison gallery as the waitlist homepage.
