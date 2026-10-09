# Nurture Everyday — redesign

An independent product showcase in `nurture-redesign/`. The original application remains separate.

## Run locally

```sh
cd nurture-redesign
npm ci
npm run dev
```

Open http://127.0.0.1:4180/. A production preview is available with:

```sh
npm run typecheck
npm run build
npm run preview
```

The build produces `dist/`, including the complete prerendered page. Deploy the contents of `dist/` on any static host. Relative asset paths allow hosting beneath a subfolder. Do not open the source HTML directly from the filesystem. `noindex, nofollow` is deliberate while the product is a concept; remove it when approved public-launch content is available.

## Design

The `build-awwwards-quality-sites` and `editorial-tech` skills informed the composition. Deep mineral green, paper cream, sage and a restrained oxblood accent are drawn from the supplied cream-and-gold packaging. Self-hosted Cormorant Garamond and Manrope pair expressive headlines with precise utility labels. See `DESIGN.md`.

GSAP / ScrollTrigger handles the short entrance, selected section reveals, accessible word reveals, and a subtle campaign-image parallax. Lenis is the sole smooth-scroll engine and runs only on fine-pointer desktop devices. Touch devices use native scrolling. Reduced motion disables choreography and smooth scrolling. Effects, ticker callbacks, media queries and dialog listeners clean up. There is no live Three.js canvas; existing CGI renders put the packaging first with less runtime cost.

## Product content and extension

`src/content/product.ts` contains the identity, media, image descriptions, gallery configuration, FAQ and concept status. Shared navigation, typography, gallery and layout tokens live separately. The current primary action is **Explore the concept**.

The site does not take orders, collect email addresses, store a local bag or claim successful signups. No email service, confirmed contact address or launch privacy policy was supplied. To add a waitlist, connect a real service, write the applicable consent/privacy copy, and implement validated loading, server-error and confirmed-success states. Do not substitute local storage for a submitted signup.

The structured commerce fields remain null and are not displayed. Variants, specifications and testimonials are empty collections awaiting genuine data. Introduce dedicated product routes and shared components when real product content warrants them, rather than implementing speculative checkout screens now.

Required before sales: final product photography and artwork, approved formulation and benefit copy, ingredients/allergens, nutrition amounts, suitability, serving instructions, accurate weight/variants, pricing, inventory, shipping/returns policies, checkout integration and approved legal copy. No launch date has been assumed.

## Media provenance

Existing brand-supplied TRAYN marks and packaging reference; existing CGI tin renders; existing AI-generated campaign and lifestyle studies. None are evidence of a manufactured product, a health outcome or an endorsement. The site discloses their concept status. See `public/media/PROVENANCE.md` and the original repository's `assets/ASSET-NOTES.md`.

`prepare-media.mjs` trims alpha margins, crops the existing artwork render, and encodes lighter WebP files. No original assets were changed. It needs `sharp` and the original parent asset folder only when regenerating media; deployed builds and day-to-day development are self-contained.

## Verification

```sh
npm run verify
```

The verification script requires Playwright and Chromium. When using bundled tooling, set `PLAYWRIGHT_MODULE` to the installed Playwright package directory and `BROWSER_EXECUTABLE` to Chromium's executable. `SITE_URL` can target another preview. Reports and screenshots are written to `verification/`.

Checks include real production-browser rendering at 1440, 1920, 820, 390 and 320 pixels; missing media and HTTP errors; four-view gallery, image enlargement, arrow keys and focus restoration; desktop anchors, mobile navigation and scroll unlocking; native FAQ; visible keyboard focus; reduced motion; and full-page navigation/media/FAQ without JavaScript. Type checking and the prerendered production build are separate checks.
