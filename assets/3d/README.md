# Nurture Everyday concept model

This is a reusable product asset and a separate inspection preview. The product page has not been built.

## Deliverables

- `nurture-everyday-concept-v1.glb`: binary glTF model with embedded label and material textures.
- `nurture-label-wrap-concept-v1.png`: generated flat wraparound artwork based on the user's reference image.
- `../../model-preview/model.js`: editable procedural geometry and material source.

The GLB has a separate removable lid group, cylindrical can shell, full circumference label, rolled gold lid edges, recessed lid face, and steel base seam. Front artwork faces +Z. Model origin is near the tin centre. Units are metres.

The nominal height is approximately 166mm and diameter approximately 106mm. These dimensions are estimated for visual proportions, not measurements or manufacturing specifications. Generated front artwork differs from the source; side and back artwork are intentionally blank. No nutrition panel or barcode has been invented.

## Preview

Run `npm install`, then `npm run dev`, and open `/model-preview/` on the reported local address. The preview supports pointer/touch orbit, keyboard rotation, zoom, front/side/back/top views, optional auto-rotation, three lighting presets, GLB export and PNG capture. Automatic rotation starts off. Reduced-motion mode disables animated camera transitions and damping.

For the later React page, the GLB can be loaded with Three.js GLTFLoader. Environment lighting must be supplied by the consuming scene; preview lights and floor are not part of the model.

## Artwork provenance

Source reference: `../trayn-nurture-everyday-marketing.png` supplied by the user. Label image generated using the built-in image-generation tool.

Prompt summary: generate a flat landscape unfolded label, approximately 2.15:1, uniform ivory with a continuous gold band across the bottom 17 percent. Keep the front branding, woman and botanical illustration, benefit categories and 400g copy in the central third, with blank matching sides. No tin, perspective, shadows, extra claims, barcode or invented back label.

## Validation

Verification captures and a machine-readable report are stored in `../../verification/`. Validation checks the model geometry, embedded textures, GLB reloading, desktop/mobile framing, canvas pixels, orbit interaction, lighting controls, downloads and reduced motion.
