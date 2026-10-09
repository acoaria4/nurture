# Nurture Everyday complete concept model

This is a reusable product asset and a separate inspection preview. The product page has not been built.

## Deliverables

- `nurture-everyday-complete-concept-v2.glb`: complete binary glTF model with embedded artwork and material textures.
- `nurture-label-wrap-concept-v2.png`: generated full wrap with front, botanical side and placeholder back panels.
- `nurture-everyday-concept-v1.glb` and `nurture-label-wrap-concept-v1.png`: retained first-version assets.
- `../../model-preview/model.js`: editable procedural geometry and material source.

The version 2 GLB has a separate removable lid with underside seating ring, hollow cylindrical can shell, interior base, opening bead, full circumference label with gold foil band, rolled gold lid edges, recessed lid face, and steel base seam. Front artwork faces +Z and back artwork -Z. The botanical side faces +X. Model origin is near the tin centre. Units are metres. The GLB always exports closed, independently of the lid pose in the inspection preview.

The nominal height is approximately 166mm and diameter approximately 106mm. These dimensions are estimated for visual proportions, not measurements or manufacturing specifications. Generated front artwork differs from the source. The back has designed sections for nutrition, ingredients, preparation, allergens, batch and price details, with pending values and a concept packaging notice. No nutrient quantities, directions, barcode, contact information or certification details have been invented.

## Preview

Run `npm install`, then `npm run dev`, and open `/model-preview/` on the reported local address. The preview supports pointer/touch orbit, keyboard rotation, zoom, front/side/back/top views, opening and closing the lid, optional auto-rotation, three lighting presets, GLB export and PNG capture. Automatic rotation starts off. Reduced-motion mode disables animated camera transitions and damping. `/model-preview/photos.html` contains the matching photo gallery.

For the later React page, the GLB can be loaded with Three.js GLTFLoader. Environment lighting must be supplied by the consuming scene; preview lights and floor are not part of the model.

## Artwork provenance

Source reference: `../trayn-nurture-everyday-marketing.png` supplied by the user. Label image generated using the built-in image-generation tool.

Version 2 prompt summary: edit the first flat label into a complete 2.15:1 wrapper. Preserve the front artwork centred at 25 percent of the width and design a back panel centred at 75 percent with TRAYN/Nurture headings, ruled placeholder sections, "Values pending", "Details pending", "Instructions pending" and "CONCEPT PACKAGING / NOT FOR SALE". Add a botanical Nurture side at the midpoint. Preserve uniform ivory, a continuous gold lower 16 percent and matching seam edges. No perspective, shadows, extra claims, invented values, barcode, QR code or contact details.

## Validation

Verification captures and a machine-readable report are stored in `../../verification/`. Validation checks the model geometry, embedded textures, GLB reloading, lid opening, desktop/mobile framing, canvas pixels, orbit interaction, lighting controls, downloads and reduced motion. Product photo renders have their own manifest in `../product-photos/v2/manifest.json`.
