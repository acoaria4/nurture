# Nurture asset preparation

The page has not been built. These assets support a later implementation.

## Sources

- `trayn-nurture-everyday-marketing.png`: user-provided product reference.
- Original silver logo assets remain in `G:/Trayn/Logo Assets v2 - Use This/No BG/`.

## Generated concept images

Generated using the built-in image generation tool with the user-provided product image as reference.

- `nurture-product-cutout-concept-v1.png`: product on an alpha-transparent background.
- `nurture-campaign-wide-concept-v1.png`: wide product photograph concept with foliage, white flowers, limestone and open space for future text.

Both are generated interpretations. Label illustration, lettering, dimensions and lighting can differ from the source. Use the original reference for product details; replace generated packaging with approved artwork when available.

## Generation prompts

Cutout: Remove the background, flowers, vase, stone table, fabric and shadow from the reference. Keep the full front-facing cream-and-gold tin, lid, bottom rim, product identity and existing label text, with a small transparent margin. Request actual alpha transparency and clean edges.

Campaign: Create a 16:9 premium editorial photograph based on the reference tin. Place the complete product in the right half on pale limestone, with green foliage and white flowers, realistic directional daylight and a pale wall with open space on the left. Keep product identity and avoid additional claims, people, ingredient specimens, overlay text or watermarks.

## Created 3D asset

A reusable Three.js tin has been created in `../model-preview/model.js` and exported to `3d/nurture-everyday-concept-v1.glb`. It has a separate gold lid, recessed top, rolled rims, printed label and steel base. The generated flat label is `3d/nurture-label-wrap-concept-v1.png`. Dimensions are estimated; unseen side and back artwork are blank and provisional. This single model supports coherent 360-degree rotation and future rendered sequences.

The inspection preview is served at `/model-preview/`. It is not the product page. See `3d/README.md` for model metadata and usage, and `../verification/report.json` for browser verification results.

Exact reproduction needs approved flat label artwork and real packaging dimensions. An external 3D artist is optional.

## Product information

`product-content.placeholders.json` stores unknown values as null and provides explicit placeholder text. The 400g pack weight and supplied copy are transcribed from the reference, not independently verified. Do not invent prices, nutrient quantities, serving directions, reviews or certifications. Checkout remains pending until a destination or commerce integration is supplied.
