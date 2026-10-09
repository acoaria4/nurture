# Implementation audit — 9 October 2026

## Scope and concept

Complete light luxury rebuild inside `nurture-redesign/`, using the installed `build-awwwards-quality-sites` skill and compatible editorial direction. The parent website and original source assets were not edited. Phase 0–3 decisions are recorded in DESIGN.md; Phase 4–6 results follow here. No award submission or deployment was performed.

**The everyday, considered.** An ivory editorial product study around the existing cream-and-gold mockup. Exactly one product-led hero interaction, **A closer look**, changes angle to front, gently enlarges the product and exposes two packaging details. It supports repeat reversal, keyboard, touch, instantaneous reduced motion and a complete static fallback.

## Craft and corrections

- Replaced the old green hero, campaign surfaces, orbit decoration, layout and footer. Removed obsolete copied media from this child folder.
- Refined reading hierarchy, large serif composition, local font loading, restrained gold accents, focus indicators, hover feedback, image loading/error states and semantic headings.
- Added a matching favicon, 1200 × 630 sharing image, sourced/attributed SVG arrows and deployment-aware absolute metadata URLs.
- Kept truthful concept disclosures. Corrected a stale FAQ reference to generated campaign images. Unconfirmed commerce/specification/testimonial fields remain unrendered.
- Darkened muted text from #726154 to #69594d after checking stone-surface contrast. Darkened section numbers to #80633f. Calculated contrast: muted on stone 5.06:1, oat 5.36:1, ivory 6.26:1; section numbers on ivory 5.20:1; primary button text 12.89:1; inspection hover 4.92:1.
- Corrected desktop anchor alignment using the actual destination coordinate and reading offset. Mobile uses native scroll.
- Edge testing found focus could escape a native dialog after the last control. Added shared explicit Tab wrapping to gallery and mobile navigation; reran successfully in Edge and WebKit.

## Actual checks

`npm run typecheck` and `npm run build` passed. Build includes SSR prerendering of the full page; the production bundle does not include the development diagnostic API.

Production browser suite passed at 320, 390, 820, 1440 and 1920px, with no horizontal overflow, broken images, JavaScript errors or unexpected HTTP errors. Tested the reversible hero interaction, all four gallery views, enlargement, arrow keys, Escape, focus restoration, desktop anchors, back to top, mobile navigation, scroll unlocking, FAQ pointer/keyboard operation, visible first-tab skip link, reduced motion, and a simulated image failure followed by recovery. No-JavaScript tests passed for page content, navigation, image links and native FAQ.

Independent cross-browser checks passed in Microsoft Edge 154.0.4258.62 and Playwright WebKit 26.5 at 1440 and 390px. WebKit on Windows is engine coverage, not a physical iPhone/Safari test. Visual inspection covered desktop/mobile captures, the two signature states, material studies, gallery, development section, full page and social image.

Axe WCAG 2 A/AA and 2.1 AA scans: desktop and mobile each returned 26 passing rules, zero violations, and a color-contrast item requiring review. The main reading tokens were checked numerically above. This does not establish complete WCAG conformance; image/complex-background contrast, human usability and assistive-technology testing remain outside the automated check.

Chromium development lifecycle check under React StrictMode:

| State | Page animations | Scroll triggers | Lenis tickers | Scroll lock / open dialogs |
| --- | ---: | ---: | ---: | --- |
| Mounted | 13 | 9 | 1 | None |
| Unmounted with dialog open | 0 | 0 | 0 | Cleared / 0 |
| Remounted | 13 | 9 | 1 | None |
| Live reduced-motion change | 0 | 0 | 0 | None |

GSAP retains one internal ScrollTrigger `_refreshAll` delayed callback. It is reported separately as `libraryRefreshCalls` and excluded from page-animation counts. Remounting does not multiply it. The check verifies application resources rather than claiming the library globally disappears.

## Performance measurements

Nine sequential cold-cache headless Chrome loads: three per scenario; production Vite preview on localhost; device pixel ratio 1. Network cache disabled. Mobile throttle: 4× CPU, 1.6 Mbps download, 0.75 Mbps upload, 150ms latency. These are browser lab timings, not Lighthouse scores, deployed-host measurements or field Core Web Vitals. The preview's transferred scripts are uncompressed.

| Median of 3 loads | LCP | FCP | CLS | Transferred bytes | Long-task blocking time* |
| --- | ---: | ---: | ---: | ---: | ---: |
| Desktop 1440 × 900 | 88ms | 88ms | 0.00033 | 636,943 | 0ms |
| Mobile 390 × 844 | 84ms | 84ms | 0 | 580,131 | 0ms |
| Throttled mobile | 1,860ms | 1,064ms | 0.04409 | 580,131 | 72ms |

*Sum of observed task duration exceeding 50ms during the capture window; this is not a Lighthouse TBT score. LCP was the hero-angle image in every sample. Individual desktop LCP varied from 80–276ms, local mobile 84–92ms, throttled mobile 1,848–1,864ms. All three throttled samples showed the same small layout shift; font swapping remains a possible refinement and has not been isolated as its cause.

Actual artifact sizes, measured with Node gzip: JavaScript 376,507 bytes / 123,581 gzip; CSS 31,354 / 9,095 gzip. Sharing JPEG 56,908 bytes, 1200 × 630. Full raw samples and conditions are saved in `verification/performance.json`.

## Candid rubric self-assessment

These are subjective internal ratings of this implementation, not invented Awwwards votes, an award prediction or external evaluation.

| Criterion | Internal rating | Assessment |
| --- | ---: | --- |
| Design | 8/10 | Cohesive warm palette, editorial hierarchy and product detail composition. Existing CGI label imperfections and limited photographic variety constrain polish. |
| Usability | 8.5/10 | Clear exploration, working keyboard/touch paths, mobile composition, reduced motion, static fallbacks and tested error recovery. No physical-device, screen-reader or participant study yet. |
| Creativity | 7/10 | The product inspection supports the idea of everyday attention without spectacle. It is thoughtful and restrained, not technically groundbreaking. |
| Content | 7/10 | Honest concept narrative and transparent development status. The page cannot yet answer real formulation, suitability, pricing or fulfilment questions. |

No weighted award total is presented. The experience is a complete concept showcase; it is not yet a sales website.

## Remaining integrations and limits

Final approved product information, artwork and real photographs; real inventory/price/checkout and fulfilment policies; an email service with privacy/consent copy if a waitlist is wanted; the confirmed production URL for absolute sharing metadata. Keep noindex during concept development. Actual host performance, Safari/iPhone hardware, Firefox, screen-reader and human usability testing remain unmeasured. The mockup is clearly disclosed throughout and no health outcomes, fabricated reviews, stock state or purchase actions are presented.

## Changed implementation

Page composition and tokens: `src/App.tsx`, `src/styles.css`. Signature: `src/components/Hero.tsx`. Navigation/gallery/dialog handling: `Navigation.tsx`, `ProductGallery.tsx`, `useModal.ts`. Typography/icons: `Typography.tsx`. Motion and diagnostics: `src/useMotion.ts`, `src/main.tsx`. Product/future-launch content: `src/content/product.ts`, `launch.ts`. Metadata/build: `index.html`, `scripts/prerender.mjs`, `package.json` and lockfile. Brand assets: favicon, social preview, attributed arrows and media provenance; obsolete copied media removed. Reproducible verification and capture scripts, JSON results, README and DESIGN documentation complete the delivery.

## Repository migration

At the user's request, the completed showcase was promoted to the repository root and the former root website was moved into `old_website/`. All 127 tracked original files were hash-verified with SHA256 after the move. Historical measurements above belong to the completed showcase before promotion. Generated verification output is now ignored by Git and remains available locally.


Post-migration verification passed: root type checking, prerendered production build, and the full root production-browser suite across 320–1920px, including interactions, keyboard navigation, reduced motion, no-JavaScript rendering and media-error recovery. The archived application's type checking and production build also passed. Ignore-rule checks confirm that generated output is untracked in both projects while source files, assets, lockfiles and .env.example remain trackable.
