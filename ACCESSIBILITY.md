# Accessibility Statement

We are committed to making ResQ accessible and usable for all people, including those with visual, motor, auditory, or cognitive disabilities.

## Accessibility Principles & Standards

Our frontend interfaces follow WCAG 2.1 Level AA principles:

### 1. High Contrast & Readability
* Dark-luxury theme with high-contrast text ratios (white `#F8FAFC` and sky blue `#38BDF8` over `#090D16` and `#0F172A`).
* Generous typographic sizing, clear font weights, and adjustable system font scaling support.

### 2. Touch Targets & Interaction
* Interactive touch elements adhere to minimum touch target dimensions ($\ge 44 \times 44$ pt on iOS and $\ge 48 \times 48$ dp on Android).
* Prominent hit slop allowances on icon buttons to prevent mis-taps under stress.

### 3. Screen Reader Support
* Screen elements include explicit `accessibilityRole`, `accessibilityLabel`, and dynamic `accessibilityState` attributes.
* Form inputs and modals provide clear auditory descriptions and state notifications.

### 4. Low-Stress Emergency Interaction
* Disguise mode and 112 emergency calling are reachable with single-tap, high-visibility controls.

## Feedback and Reporting Barriers

If you encounter accessibility barriers, difficult-to-read interfaces, or screen-reader incompatibilities, please open an issue using the Bug Report template or contact project maintainers. We treat accessibility bugs with high priority.

