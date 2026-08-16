---
name: CivicFix
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#444653'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#611e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa583'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 24px
  max-width: 1200px
---

## Brand & Style

The design system is rooted in the "Corporate Modern" aesthetic, tailored specifically for civic engagement. It prioritizes clarity, accessibility, and an institutional sense of reliability. By leaning into a high-utility, minimal interface, the system eliminates friction for citizens reporting issues while maintaining a "government-grade" professional polish.

The emotional response is one of calm efficiency. It avoids the playfulness of consumer apps in favor of a trustworthy, utilitarian environment. Key characteristics include:
- **Functional Minimalism:** Whitespace is used as a structural tool to separate concerns.
- **Institutional Reliability:** A structured layout that feels official but modern.
- **Status-Driven Visuals:** Color is used sparingly but meaningfully to communicate urgency and progress.

## Colors

The palette is anchored by a deep Navy Primary, chosen to evoke the stability of public institutions. The neutral palette uses cool slates to maintain a clean, "uncluttered" workspace.

- **Primary (#1E40AF):** Used for primary actions, branding, and active states.
- **Secondary (#F8FAFC):** A soft off-white used for background surfaces to reduce eye strain.
- **Semantic Status Palette:** These colors are reserved strictly for severity levels and status updates. They should always be paired with icons or text labels to ensure accessibility for color-blind users.
- **Surface Neutrals:** Use varying weights of slate for borders, secondary text, and iconography.

## Typography

This design system utilizes **Inter** across all levels for its exceptional legibility and systematic feel. 

- **Body Text:** A minimum size of 16px is enforced for the primary body role to ensure high readability for all demographics, including older citizens and those with visual impairments.
- **Headlines:** Use tighter letter spacing for large display text to create a more cohesive, "locked-in" look.
- **Labels:** Use Medium (500) or Semi-Bold (600) weights for metadata and status badges to ensure they stand out against body copy.

## Layout & Spacing

The system follows a strict **8px grid** (soft grid) philosophy. All padding, margins, and component heights must be multiples of 8.

- **Layout Model:** A fluid grid for mobile and tablet, transitioning to a fixed-width centered container (1200px) on desktop to prevent line lengths from becoming too long for comfortable reading.
- **Responsive Behavior:** 
  - **Mobile:** 4-column layout, 16px side margins.
  - **Tablet:** 8-column layout, 24px side margins.
  - **Desktop:** 12-column layout, 32px side margins.
- **Vertical Rhythm:** Use generous vertical spacing (40px+) between major sections to emphasize the "clean" and "open" brand personality.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. The interface should feel flat and accessible, with elevation used only to indicate interactivity or information hierarchy.

- **Surface Level (0dp):** The main background color (#F8FAFC).
- **Card Level (1dp):** Pure white (#FFFFFF) with a very soft, diffused shadow (15% opacity, 12px blur, 4px Y-offset). No heavy borders.
- **Overlay Level (2dp):** Modals and dropdowns use a slightly more pronounced shadow (20% opacity, 24px blur) to sit clearly above the content.
- **Interaction:** On hover, cards should subtly increase their shadow spread to provide tactile feedback.

## Shapes

The shape language is "Rounded," striking a balance between modern friendliness and professional structure.

- **Standard Radius:** 8px (0.5rem) for small components like inputs and buttons.
- **Large Radius (rounded-lg):** 16px (1rem) for content cards and containers.
- **Extra Large (rounded-xl):** 24px (1.5rem) for modal containers.
- **Circular:** Reserved for the Floating Action Button (FAB) and avatar elements.

## Components

### Buttons
- **Primary:** Solid Navy (#1E40AF) with white text. 8px corner radius.
- **Secondary:** Outlined with a 1px border (#CBD5E1) and Primary text.
- **Floating Action Button (FAB):** Circular, Primary color, elevated shadow, containing a 24px 'Plus' icon. Positioned in the bottom-right for mobile reachability.

### Status Badges
- **Style:** Light tinted backgrounds (10% opacity of status color) with high-contrast text.
- **Iconography:** Must include a leading 14px Lucide-style outline icon (e.g., an exclamation triangle for 'Critical').

### Input Fields
- **Style:** White background, 1px slate-200 border, 8px radius.
- **Active State:** 2px Navy border with a soft blue outer glow.
- **Labels:** Always placed above the field, never as placeholder-only.

### Cards
- **Style:** White background, 16px radius, soft ambient shadow.
- **Padding:** Minimum 24px internal padding for comfortable content breathing room.

### Lists
- **Style:** Borderless list items separated by a subtle 1px horizontal line (#F1F5F9). 
- **Tap Targets:** Minimum height of 56px for all list items to ensure mobile accessibility.