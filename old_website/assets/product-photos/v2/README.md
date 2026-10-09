# Nurture product photo set v2

Nine 1600-by-2000 PNG images rendered directly from the complete version 2 Three.js model. These are CGI concept images, not physical product photographs. Every view uses the same geometry, label and material setup.

- `nurture-front-v2.png`
- `nurture-three-quarter-v2.png`
- `nurture-back-v2.png`
- `nurture-side-v2.png`
- `nurture-top-v2.png`
- `nurture-open-lid-v2.png`
- `nurture-lid-detail-v2.png`
- `nurture-front-transparent-v2.png`
- `nurture-angle-transparent-v2.png`

The last two images have alpha-transparent backgrounds and no ground shadow. The open-lid image shows an empty concept interior; product contents have not been inferred. The lid detail intentionally crops the lower body. All other views frame the complete tin or open-lid assembly.

The back label uses pending values. Exact artwork, physical dimensions and regulatory/product information need approved source material before these assets represent a production package.

`manifest.json` records resolution, framing, transparency and pixel verification. The gallery is available at `/model-preview/photos.html`. Renders can be reproduced using `npm run render:photos`, with Playwright and sharp available to Node via `PLAYWRIGHT_MODULE` and `SHARP_MODULE` when they are not installed locally. `BROWSER_EXECUTABLE` optionally selects an installed Chromium browser.
