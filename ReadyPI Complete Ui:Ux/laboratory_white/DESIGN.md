---
name: Laboratory White
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5d4038'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#926f66'
  outline-variant: '#e7bdb2'
  surface-tint: '#b12d00'
  primary: '#ad2c00'
  on-primary: '#ffffff'
  primary-container: '#d83900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5b5c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#737575'
  on-tertiary-container: '#fdfcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#872000'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-data:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0em
spacing:
  grid-unit: 1px
  base-unit: 8px
  margin-sm: 16px
  margin-md: 24px
  gutter: 1px
  container-max: 1440px
---

## Brand & Style

This design system is engineered to evoke the sterile, high-precision environment of a modern research facility. The brand personality is clinical, objective, and rigorously organized, prioritizing data clarity over decorative elements. 

The aesthetic sits at the intersection of **Minimalism** and **Technical Brutalism**. It utilizes a "White-Out" approach where the canvas is pure and expansive, interrupted only by a functional 1px underlying grid. The emotional response should be one of absolute clarity and high-stakes performance, mimicking the interface of a high-end laboratory instrument or a mission-critical diagnostic tool.

## Colors

The palette is strictly controlled to maintain a high-contrast, clinical atmosphere. 

*   **Surface:** Pure #FFFFFF is used for all primary backgrounds to ensure maximum light and focus.
*   **Grid:** A subtle #F5F5F5 1px grid is persistent across all layouts, acting as a functional guide for alignment rather than a decorative pattern.
*   **Accents:** Vibrant Red-Orange (#FF4500) is reserved exclusively for interactive triggers, critical alerts, and status indicators. It should be the only "warmth" in the system.
*   **Borders:** Light Cool Slate (#EAEAEA) defines boundaries, separating modules without creating heavy visual weight.
*   **Typography:** Absolute Black (#000000) ensures maximum legibility and authority.

## Typography

This design system uses **Space Grotesk** as its primary typeface to achieve a geometric, technical feel that approximates a modern monospace without sacrificing readability. 

Headlines must be bold and impactful, set in absolute black. Body text uses a medium weight to maintain presence against the stark white background. For raw data points, logs, or coordinates, fall back to the system's default **monospace** stack to reinforce the technical nature of the content. Use "label-caps" for all structural headers and metadata to create a clear hierarchy between content and container labels.

## Layout & Spacing

The layout is governed by a **Fixed Grid** philosophy. Every element must align perfectly to the 1px light gray grid. 

*   **Modular Blocks:** Content is housed in modules separated by 1px cool slate borders (#EAEAEA).
*   **Internal Padding:** Use an 8px (base-unit) increment for all internal spacing. A standard 24px padding is used for most containers to maintain a sense of airy, "clean room" whitespace.
*   **The 1px Rule:** Instead of gutters, use 1px borders to separate columns. This mimics a blueprint or a spreadsheet, maximizing the efficiency of the screen real estate while maintaining order.

## Elevation & Depth

This design system avoids the use of shadows, blurs, or gradients. Hierarchy is established exclusively through **Bold Borders** and **Tonal Layering**.

All UI components exist on a flat plane. Depth is communicated by:
1.  **Border Density:** Doubling a border to 2px for a focused or "active" module.
2.  **Inversion:** Highlighting a selected state by inverting the colors (Black background with White text).
3.  **Accent Lines:** Using 4px top-borders in #FF4500 to denote the primary active section or a critical notification.

There is no "Z-index" depth in the traditional sense; the interface is treated as a physical, flat diagnostic surface.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every button, input field, card, and modal must have 90-degree corners. Rounded corners are considered too "organic" for this clinical aesthetic. This sharpness emphasizes the precision of the system and ensures that every element fits perfectly into the underlying 1px grid without visual leakage.

## Components

*   **Buttons:** Rectangular with 0px radius. The primary button is a solid #000000 block with white monospace text. The secondary button is a 1px #EAEAEA outline with black text. The "Action" button is solid #FF4500.
*   **Inputs:** Simple 1px #EAEAEA bottom-border or full box. On focus, the border changes to #000000. Labels are always positioned above the input in "label-caps" style.
*   **Chips:** Small, rectangular boxes with a 1px #EAEAEA border. If active, the background becomes #FF4500 and the border disappears.
*   **Status Indicators:** Small 8x8px squares (not circles). #FF4500 for "Live/Active," #000000 for "Standby," and #EAEAEA for "Inactive."
*   **Cards/Modules:** Defined by 1px #EAEAEA borders on all sides. No background color other than #FFFFFF. Titles are separated by a 1px horizontal rule.
*   **Data Tables:** Essential for this system. Use 1px #F5F5F5 internal grid lines for every cell. Header cells should have a #F5F5F5 background to distinguish them from data.