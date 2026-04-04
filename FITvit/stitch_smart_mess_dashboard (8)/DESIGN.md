# Design System Specification: High-Performance Nutrition Editorial

## 1. Overview & Creative North Star
This design system is built to transform the mundane university "mess hall" experience into a high-performance, personalized nutrition journey. Our Creative North Star is **"The Living Greenhouse."** 

This isn't a standard utility app; it is a digital environment that breathes. We move beyond the "template" look by utilizing intentional asymmetry—where organic shapes (like a `3rem` rounded corner) intersect with a rigid editorial grid. The system focuses on high-contrast typography scales and layered surfaces to create a sense of botanical freshness and academic authority.

## 2. Colors & The Tonal Depth Philosophy
The palette is rooted in health and vitality, using a sophisticated range of greens and "warm whites."

### Core Palette Roles
*   **Primary (`#216d00`):** Used for critical success states and the primary action path. It represents growth and vigor.
*   **Surface & Background (`#f7faf7`):** A tinted white that reduces eye strain and feels more premium than pure hex white.
*   **Secondary/Tertiary:** Used for data visualization (Carbs, Protein, Fat) to ensure a multi-dimensional health overview.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to create a "pocket" of content without a harsh line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to create depth:
1.  **Base Layer:** `surface` (Background)
2.  **Structural Sections:** `surface-container-low` (Secondary sections)
3.  **Active Cards:** `surface-container-lowest` (Highest contrast for white "paper" cards)

### The "Glass & Signature Texture" Rule
To move beyond a "generic" feel, use **Glassmorphism** for floating navigation bars or high-level overlays. Apply a `background: surface_variant` with a 60% opacity and a `backdrop-filter: blur(20px)`. 
*   **Signature Gradient:** For main CTAs, use a linear gradient from `primary` to `primary_container` at a 135-degree angle. This provides a tactile "soul" to the interface that flat color cannot replicate.

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance character with readability.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Editorial" voices. Use `display-lg` for daily calorie counts and `headline-md` for meal names. These should feel authoritative and spacious.
*   **Body & Labels (Manrope):** A modern, high-legibility sans-serif. Manrope’s geometric qualities complement the rounded UI. Use `body-lg` for nutritional descriptions and `label-sm` for micro-data.

**Hierarchy Note:** Always maintain a significant scale jump between your Title and Body. If the title is `title-lg`, the supporting text should be `body-md` to ensure the eye knows exactly where to land first.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely replaced by **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a soft, natural lift.
*   **Ambient Shadows:** When a "floating" element (like a floating action button) is required, shadows must be extra-diffused. Use a blur value of `24px` or higher and an opacity of `6%`. The shadow color must be a tinted `on-surface` (dark green/grey) rather than black.
*   **The "Ghost Border" Fallback:** If a container lacks contrast (e.g., in a dark mode shift), use a "Ghost Border": the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.

## 5. Components & Interface Patterns

### Buttons
*   **Primary:** High-pill shape (`9999px`). Uses the signature green gradient. High-contrast `on-primary` text.
*   **Tertiary:** No background, no border. Use `primary` text color with a `label-md` weight.

### Input Fields
*   **Styling:** Large rounded corners (`1rem`). Background should be `surface-container-highest` with no border. 
*   **States:** On focus, transition the background to `surface-container-lowest` and apply a subtle `primary` ghost border.

### Chips (Meal Categories/Filters)
*   Use `rounded-full` corners. 
*   Selected state: `primary_container` background with `on_primary_container` text.
*   Unselected: `surface_container_high` with `on_surface_variant` text.

### Cards & Lists (The "Anti-Divider" Pattern)
*   **Forbid dividers.** To separate meal items in a list, use a vertical spacing of `1.4rem` (`spacing-4`) and subtle background shifts.
*   **Progress Bars:** Use `primary` for the "filled" state and `surface-container-highest` for the track. For "over-limit" states, shift the fill to `error`.

### Dashboard Metrics
*   Large numeric displays (`display-md`) should be paired with a `label-md` descriptor to emphasize the "Smart" in Smart Mess.

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. The `1.4rem` to `2.75rem` spacing tokens are your best friends.
*   **DO** use organic image masks. Photos of food should have `2rem` (lg) or `3rem` (xl) corner radii to match the "soft" brand identity.
*   **DO** use the vibrant `primary_fixed` for success animations or progress completions.

### Don't
*   **DON'T** use pure black (#000000). Use `on_surface` (#181c1b) to maintain the organic, high-end feel.
*   **DON'T** use standard 4px or 8px corners. Our brand identity lives in the "roundedness" scale of `1rem` and above.
*   **DON'T** stack more than three levels of surface containers. It breaks the "flat-layered" editorial aesthetic.