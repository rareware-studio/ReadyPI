---
name: Technical Precision
colors:
  surface: '#1f0f0b'
  surface-dim: '#1f0f0b'
  surface-bright: '#49342f'
  surface-container-lowest: '#190a06'
  surface-container-low: '#291712'
  surface-container: '#2d1b16'
  surface-container-high: '#392520'
  surface-container-highest: '#44302a'
  on-surface: '#fddbd3'
  on-surface-variant: '#e7bdb2'
  inverse-surface: '#fddbd3'
  inverse-on-surface: '#402c26'
  outline: '#ad887e'
  outline-variant: '#5d4038'
  surface-tint: '#ffb5a0'
  primary: '#ffb5a0'
  on-primary: '#601400'
  primary-container: '#ff5625'
  on-primary-container: '#541100'
  inverse-primary: '#b12d00'
  secondary: '#ffb4a8'
  on-secondary: '#690100'
  secondary-container: '#ff5540'
  on-secondary-container: '#5c0000'
  tertiary: '#a5c8ff'
  on-tertiary: '#00315e'
  tertiary-container: '#2592ff'
  on-tertiary-container: '#002a53'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#872000'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#930100'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004785'
  background: '#1f0f0b'
  on-background: '#fddbd3'
  surface-variant: '#44302a'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  code-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  metric-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.01em
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 16px
  margin: 24px
  density-compact: 8px
  density-comfortable: 16px
---

## Brand & Style
The design system is engineered for high-performance technical environments where data density and clarity are paramount. The brand personality is clinical, authoritative, and sophisticated, catering to developers and data architects. 

The aesthetic blends **Modern Technical** and **High-Contrast Minimalism**. It utilizes a "black-hole" foundation (#0A0A0A) to eliminate visual noise, allowing the π symbol hero and the primary Red-Orange CTAs to act as high-frequency signals. The interface prioritizes information throughput, using structural grid lines and monospaced accents to evoke the feel of a high-end integrated development environment (IDE).

## Colors
The palette is anchored by a deep obsidian background (#0A0A0A) to maximize the "pop" of technical data. 

- **Primary Action:** A high-affordance Red-Orange gradient is reserved exclusively for the most critical user actions and the π hero element.
- **Surface Strategy:** Layers are defined by subtle shifts in dark greys (#141414 and #1A1A1A) rather than shadows.
- **Logos & Marquee:** Partners and payment integrations appear in desaturated greyscale (approx. 40% opacity) to maintain focus on the core product. On hover, these transition to their native brand colors using a 200ms ease-in-out transition.

## Typography
This design system employs a dual-font strategy to separate intent:
1. **Inter (Sans-Serif):** Used for all UI chrome, navigation, and body copy. It provides maximum legibility at small sizes in high-density layouts.
2. **Space Grotesk (Monospace/Technical):** Used for technical metrics, data points, API keys, and logs. This font signals "data" to the user, distinguishing raw information from UI labels.

Text sizes are kept slightly smaller than standard consumer apps (14px base) to accommodate higher data density.

## Layout & Spacing
The layout follows a **Fixed Grid** model (12 columns) for dashboard views, transitioning to a focused single-column layout for technical documentation. 

A strict 4px baseline grid ensures alignment across dense data tables and integration flows. To manage high density, use "Compact" spacing (8px) for internal component padding and "Comfortable" spacing (16px) for section headers and major groupings. Data-heavy lists should use a 32px row height to maximize vertical information visibility.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. 

- **Level 0 (Base):** #0A0A0A (Background)
- **Level 1 (Card/Section):** #141414 with a 1px border of #262626.
- **Level 2 (Popovers/Modals):** #1A1A1A with a 1px border of #333333.

The π hero element may utilize a subtle outer glow using the primary red-orange palette to suggest energy and focal importance, but all other elements remain strictly flat and structural.

## Shapes
The shape language is **Sharp (0px)**. This reinforces the technical, engineered nature of the platform. All buttons, input fields, cards, and tabs must have square corners. This allows elements to sit flush against one another in high-density grids without creating awkward "trapped" white space in the corners.

## Components
- **Primary CTA:** Square-cornered buttons featuring the Red-Orange gradient. Text must be white and bold.
- **Secondary Buttons:** Ghost style with a 1px white or #262626 border.
- **Technical Metrics:** Presented in Space Grotesk. Labels should be uppercase, 10px, with 0.1em tracking for a "readout" effect.
- **Integration Cards:** Use #141414 backgrounds. Logos within should be greyscale at 40% opacity, hitting 100% color and brightness on hover.
- **Data Tables:** No vertical borders. Horizontal borders in #1A1A1A. Hover states on rows should highlight the background in #1A1A1A.
- **Input Fields:** Dark background (#050505), 1px border (#262626), sharp corners. Active state uses a 1px primary red-orange border.
- **Status Indicators:** Small 6px squares (not circles) to maintain the geometric, technical theme.