# Planora AI — Image Asset Specification

All imagery strictly adheres to the unified visual language: warm golden-hour atmospheric lighting, celebration decor only (no people, faces, watermarks, or text), and optimized lightweight WebP delivery under strict performance budgets.

## Asset Inventory

| File Name | Dimensions | Aspect Ratio | Format | File Size | Performance Budget | Subject & Composition | Suggested Unsplash / Pexels Search Queries |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `hero-desktop.webp` | 1920x1080 | 16:9 | WebP | ~33.3 KB | <= 180 KB | Warm golden-hour mandap decor, marigold and rose garlands, warm fairy lights, bokeh. Left third calm and darker for headline readability. | `indian wedding mandap golden hour floral garlands bokeh warm lighting empty` |
| `hero-mobile.webp` | 828x1104 | 3:4 | WebP | ~16.0 KB | <= 70 KB | Atmospheric celebration decor with top marigold canopy and deep warm gradient toward bottom for high-contrast mobile text overlay. | `indian celebration floral arch warm evening fairy lights background` |
| `event-wedding.webp` | 960x1280 | 3:4 | WebP | ~24.1 KB | <= 90 KB | Wedding mandap with marigold and crimson rose garlands, warm string lights, brass diya ambient glow. | `royal awadhi wedding mandap marigold floral strings night banquet warm` |
| `event-birthday.webp` | 960x1280 | 3:4 | WebP | ~21.5 KB | <= 90 KB | Birthday celebration atmosphere with gold and galaxy balloons, party dessert table, and warm fairy lights. | `milestone birthday celebration balloons party table fairy lights cozy golden` |
| `event-community.webp` | 960x1280 | 3:4 | WebP | ~19.7 KB | <= 90 KB | Diwali community mela with traditional earthen diyas, festive akash kandil lanterns, and warm festive illumination. | `diwali festival earthen diyas lanterns community mela night celebration` |

## Technical Implementation & Delivery Rules
1. **LCP Hero Optimization**: The hero background is rendered as a native `<picture>` element with art-directed `<source>` tags (`hero-desktop.webp` for `>= 1024px`, `hero-mobile.webp` for `< 1024px`), `fetchPriority="high"`, `sizes="100vw"`, explicit width/height to avoid CLS, and dominant-color placeholder.
2. **Context Panel Lazy Loading**: `event-wedding.webp`, `event-birthday.webp`, and `event-community.webp` are loaded with `loading="lazy"` on large screens only (>= 1024px) in the Create Event wizard. They are completely excluded from phone/tablet downloads.
3. **SaveData Fallback**: When `navigator.connection.saveData` or `prefers-reduced-motion` is active, hero photographic rendering can be bypassed in favor of the lightweight CSS gradient fallback.
