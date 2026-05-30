# rn-vector-icons

> A robust, production-ready React Native vector icon library.

[![npm version](https://img.shields.io/npm/v/rn-vector-icons.svg)](https://www.npmjs.com/package/rn-vector-icons)
[![npm downloads](https://img.shields.io/npm/dm/rn-vector-icons.svg)](https://www.npmjs.com/package/rn-vector-icons)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**`rn-vector-icons`** provides 5,800+ highly optimized, fully typed SVG icons for React Native and Expo. 

---

## Features

- **True Duotone Colors** — Support for real two-tone icons via `color` and `secondaryColor` props.
- **Scalable Vectors** — Precise sizing without resolution loss using the `size` prop.
- **Multi-Style Variants** — Base (duotone), `-open` (outline), and `-filled` (solid) styles for every icon.
- **Tree-Shakeable** — Import only what you need.
- **Native TypeScript** — 100% typed with full autocomplete.
- **Expo Compatible** — Works flawlessly with Expo managed and bare workflows.

---

##  Installation

### Expo (Recommended)

```bash
npx expo install react-native-svg
npm install rn-vector-icons
```

### React Native (Bare)

```bash
npm install rn-vector-icons react-native-svg
cd ios && pod install
```

---

## Usage

### 1. Unified `<Icon />` Component

```tsx
import { Icon } from 'rn-vector-icons';

// Default (duotone) variant — monotone, single color
<Icon name="email-florence" size={24} color="#000" />

// Outline variant
<Icon name="email-open-florence" size={32} color="#3B82F6" />

// Solid/filled variant
<Icon name="email-filled-florence" size={48} color="#10B981" />
```

### 2. True Duotone Colors

Pass `secondaryColor` to apply a different color to the accent elements of the icon.

```tsx
import { Icon } from 'rn-vector-icons';

<Icon
  name="activity-barbell-florence"
  size={32}
  color="#3B82F6"           // Main body color
  secondaryColor="#BFDBFE"  // Accent/secondary color
/>
```

> **Note:** Only "Base" variants (without `-open` or `-filled` suffixes) support duotone colors.

---

## Available Icon Sets

The library ships with **1,300+ base icons** (5,800+ total variants) across 6 icon sets:

| Suffix | Description |
|---|---|
| `*-florence` | Medical & Healthcare icons |
| `*-freudian` | Psychology & Mental health icons |
| `*-healer` | General health & wellness icons |
| `*-hepius` | Clinical & hospital icons |
| `*-sandow` | Fitness & physical therapy icons |
| `*-turing` | General UI & utility icons |

---

## Component API

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `IconName` | **(required)** | Icon name (only on `<Icon />`) |
| `size` | `number` | `24` | Width & height in pixels |
| `color` | `string` | `"currentColor"` | Primary color (fill & stroke) |
| `secondaryColor` | `string` | `color` | Duotone accent color |
| `strokeColor` | `string` | `color` | Override stroke color separately |
| `strokeWidth` | `number` | `2` | Line thickness |

*Any additional props (e.g. `style`, `accessibilityLabel`) are passed directly to the root `<Svg>` element.*

---

## License

[MIT License](./LICENSE) — Copyright © 2026 Shiwam Shahare
