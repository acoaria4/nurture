# Nurture Everyday by TRAYN Nutrition

A React + TypeScript product concept website with GSAP, ScrollTrigger, Lenis, a React Bits-inspired magnetic CTA, and a lazy-loaded Three.js product journey.

## Local use

```sh
npm install
npm run dev -- --port 4173
npm run typecheck
npm run build
```

- Website: `http://127.0.0.1:4173/`
- Full model inspection and export: `/model-preview/`
- Original CGI gallery: `/model-preview/photos.html`

The multi-page production build keeps all three routes. Serve `dist` with a static web server; do not open the source HTML directly.

Vite reports one large Three.js chunk (approximately 542kB uncompressed). It is loaded when the product story approaches the viewport, not with the initial page. Website delivery images are WebP; the original high-resolution PNGs remain available in the separate asset gallery.

## Design and motion

Botanical luxury: forest green, ivory, warm gold, charcoal, self-hosted Cormorant Garamond and Manrope. The product-led photographic hero flows into editorial copy, a scroll-controlled full 3D tin, on-pack nutrient categories, lifestyle imagery, purchase preview, FAQs and footer.

GSAP owns hero and word reveals, image parallax and scroll measurement. Lenis is the only smooth-scroll engine, synchronized through the GSAP ticker. CSS handles ordinary hover and focus states. The locally adapted React Bits Magnet uses scoped pointer events and GSAP quickTo rather than continuous React updates; its original license is retained in `licenses/react-bits-LICENSE.md`.

Three.js draws only on scroll, resize, visibility restoration or initial load. It pauses offscreen and when hidden, caps pixel ratio at 1.75, disposes resources on unmount, and guards late model loads. Reduced motion uses the static product poster, native scrolling and nonanimated final content. WebGL failure/context loss retains the poster and the rest of the page. The chapter buttons remain usable without scroll animation.

## Functionality

- Responsive navigation, accessible dialogs and keyboard-operated product tabs.
- Six-view product gallery, enlarged images, arrow navigation and Escape dismissal.
- Quantity control and local bag, persisted across reloads and synchronized between tabs.
- Remove/empty states, quantity limit of 12 and disabled checkout.
- Light/dark appearance preference, FAQ disclosures and policy dialogs.
- Basic readable product information and gallery link without JavaScript.

## Launch information

This is deliberately not a live checkout. `assets/product-content.placeholders.json` is the supplied product information ledger. The 400g weight and original tagline are from the supplied packaging reference. Price, flavours, full ingredients, allergens, nutrition amounts, preparation, suitability, final claims, certifications, reviews, shipping, returns and commerce integration remain unconfirmed. No fake evidence or orders are generated. `noindex,nofollow` is intentional until approved launch content is supplied.

Replace the relevant placeholders and preview policies, integrate actual commerce, approve artwork/dimensions and provide final product information before public launch.

## Assets and provenance

Original brand marks and packaging reference: supplied by the user. Original sources remain unchanged. CSS alpha masks tint the supplied logo silhouette to match Nurture's palette.

Campaign and morning lifestyle images: generated concept assets, not manufactured-product photographs or endorsements. Product gallery and live tin: CGI concepts derived from the same full tin model. See `assets/ASSET-NOTES.md`, `assets/3d/README.md` and `assets/product-photos/v2/README.md`.

`scripts/prepare-web-assets.mjs` produces lighter WebP delivery copies in `assets/web`, without changing original artwork. Its manifest records each source and output.

## Verification

`scripts/verify-site.mjs` uses Playwright plus Sharp for visual and canvas checks. Set `PLAYWRIGHT_MODULE`, `SHARP_MODULE` and `BROWSER_EXECUTABLE` to installed runtime locations when these are not available from project dependencies. `SITE_URL` can target a production preview. Reports and captures are written to `verification/site`.

It exercises gallery/keyboard behaviour, local bag persistence/removal, pending checkout, information tabs, FAQ, theme, desktop/mobile layouts, product pixel visibility/framing, scroll poses, reduced motion and no-JavaScript content. Existing model and gallery verification scripts are retained.
