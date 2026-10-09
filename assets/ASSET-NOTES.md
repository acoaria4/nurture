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

A reusable Three.js tin has been created in `../model-preview/model.js` and exported to `3d/nurture-everyday-complete-concept-v2.glb`. It has a removable gold lid, recessed top, underside, hollow interior, opening bead, rolled rims, gold foil label band and steel base. The generated flat label is `3d/nurture-label-wrap-concept-v2.png`, with designed front, botanical side and placeholder back panels. Dimensions and product information are provisional. Version 1 files are retained. This single model supports coherent 360-degree rotation and matching rendered product photos.

The inspection preview is served at `/model-preview/`. It is not the product page. See `3d/README.md` for model metadata and usage, and `../verification/report.json` for browser verification results.

Nine matching 1600-by-2000 PNG renders are saved in `product-photos/v2/`, with front, three-quarter, back, side, top, open-lid and detail studio views plus two alpha-transparent cutouts. The gallery is `/model-preview/photos.html`. These are CGI product renderings, not photographs of manufactured packaging.

Exact reproduction needs approved flat label artwork and real packaging dimensions. An external 3D artist is optional.

## Website campaign addition

`nurture-everyday-morning-concept-v1.png` was generated with the built-in image-generation tool for the everyday-care section. It is an editorial lifestyle concept, not a real customer or testimonial. Prompt: "Generate a landscape editorial photograph for the Nurture Everyday women's nutrition brand website, 3:2 aspect. Authentic natural morning photograph of an Indian woman in her early thirties wearing an olive-green casual linen shirt, quietly enjoying a sunlit moment at a bright white kitchen counter beside a window. One hand loosely holds a simple off-white ceramic mug, relaxed and thoughtful expression, not a posed advertising grin. Medium-wide portrait, waist up with ample visible room around her, woman on right half, soft white curtains, one modest leafy green plant, no visible food, no powders, no supplement ingredients, no packaging, no text, no graphics, no product claims. High-end contemporary lifestyle campaign with true skin texture, clear natural daylight, delicate tactile white and olive styling. No brown/beige-heavy grade, no dark atmospheric blur, no fake lens flare. The image should express everyday self-care without representing any health outcome. Save as a website project asset."

`web/` contains resized WebP encodings for website delivery. Original PNGs are retained unchanged. Supplied transparent TRAYN logos are copied to `brand/`; the site tints their alpha silhouettes using CSS masks, not regenerated logo artwork.

## Pending launch information

`product-content.placeholders.json` stores unknown values as null and provides explicit placeholder text. The 400g pack weight and supplied copy are transcribed from the reference, not independently verified. Do not invent prices, nutrient quantities, serving directions, reviews or certifications. Checkout remains pending until a destination or commerce integration is supplied.
