---
name: Monochrome Lab
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display-xl:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  technical-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.02em
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin: 32px
---

## Brand & Style

This design system is built on the intersection of scientific rigor and luxury craftsmanship. It evokes the atmosphere of a high-end, subterranean research facility—precise, exclusive, and uncompromising. The aesthetic leans heavily into **High-Contrast Minimalism** with **Technical Brutalism** influences, emphasizing structural integrity and data density over decorative flair.

The target audience consists of specialists who require absolute clarity and a distraction-free environment. The emotional response is one of authority and focus; the UI does not ask for attention but commands it through stark contrasts and intentional voids. Every element is treated as a critical instrument, where the absence of color reinforces the importance of the data that earns it.

## Colors

The palette is strictly functional, utilizing a "Void-First" philosophy. By using **Deep Black (#0A0A0A)** as the primary canvas, the design system minimizes ocular strain in low-light environments and allows the content to emerge from the shadows. 

**Dark Gray (#1A1A1A)** is reserved for elevated surfaces such as control panels and toolbars, providing a subtle tonal lift. **Cool Gray (#262626)** is the primary tool for structural definition, used for hair-line borders and grid systems. 

The **ReadyPi Red-Orange (#FF4500)** is the only chromatic element allowed. It is used sparingly as a "Critical Focal Point"—it signifies active states, errors, or high-priority data streams. If everything is emphasized, nothing is; therefore, this accent should never exceed 5% of the total screen real estate.

## Typography

The typographic strategy balances academic authority with engineering precision. **Noto Serif** is utilized for headers to provide a sense of heritage and high-end editorial quality. It should always be set with tight tracking and bold weights to ground the page.

For functional interface elements, **Inter** provides a neutral, highly legible foundation for body copy. However, the soul of the system lies in its technical data. **Space Grotesk** is used for all labels, numerical readouts, and metadata. These elements should often be set in uppercase with slight letter-spacing to mimic the look of technical schematics and laboratory equipment displays.

## Layout & Spacing

This design system employs a **Rigid Fixed Grid** model based on a 4px baseline. All components and layouts must align to an 8-column or 12-column grid depending on screen density. 

The rhythm is intentionally tight to facilitate high data density. Gutters are kept at a constant 16px to ensure that even complex layouts maintain a cohesive, "locked-in" appearance. Margins are generous (32px+) to create a frame-like effect, emphasizing the content as a specimen within a viewfinder. Information should be grouped into logical modules separated by 1px lines rather than large gaps of whitespace.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** and **Bold Outlines** rather than shadows. Shadows are strictly prohibited to maintain the "flat-technical" aesthetic of a digital instrument.

- **Level 0 (Floor):** Deep Black (#0A0A0A) - used for the primary background.
- **Level 1 (Surface):** Dark Gray (#1A1A1A) - used for cards, panels, and input backgrounds.
- **Level 2 (Active/Overlay):** Dark Gray (#1A1A1A) with a Cool Gray (#262626) 1px border.

To indicate "focus" or "interaction," use the accent color as a 1px or 2px border stroke rather than changing the surface color. This mimics the behavior of a laser or a high-precision sensor.

## Shapes

The shape language is defined by **Zero-Radius Precision**. Every element—buttons, inputs, cards, and windows—must have sharp, 90-degree corners. 

Rounded corners are viewed as "organic" and "soft," which contradicts the laboratory aesthetic. The sharp geometry reinforces the feeling of architectural stability and mathematical exactness. When items are nested, they must maintain perfectly parallel lines with the grid, creating a nested-box effect that is common in technical blueprints.

## Components

### Buttons
Primary buttons are solid Deep Black with a 1px Cool Gray border and White text. On hover, the border transforms to the Accent Color (#FF4500). Ghost buttons use the technical-label typography style and only reveal a border on interaction.

### Inputs
Fields are Dark Gray rectangles with a 1px Cool Gray bottom border only. Upon focus, the bottom border expands to 2px and changes to the Accent Color. Labels are always positioned above the input in the technical-label style.

### Cards & Containers
Containers are defined by 1px Cool Gray borders. Header sections within cards should be separated by a horizontal 1px line, with the header text using the Bold Serif style at a smaller scale (headline-md).

### Data Tables
Tables are the heart of this system. They should use no vertical lines, only 1px horizontal dividers. Row hover states should be indicated by a subtle background shift to #1A1A1A and an accent-colored "marker" (a 2px wide vertical line) at the start of the row.

### Technical Indicators
Use small geometric shapes (triangles, squares) instead of rounded icons. Status indicators should be simple 8px squares; use the Accent Color for "Live/Active" and Cool Gray for "Inactive."