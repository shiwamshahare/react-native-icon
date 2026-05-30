# react-native-icon

> A robust, production-ready, tree-shakeable React Native vector icon library.

**`react-native-icon`** is a custom SVG-to-Component engine tailored for React Native. It automatically ingests raw SVG assets, generates multiple stylistic variants (duotone, open, filled), and bundles them into highly optimized, fully typed React components.

---

## 🌟 Features

- **🎨 Dynamic Colors** — Complete control over stroke and fill colors via React props.
- **📏 Scalable Vectors** — Set precise sizes without losing resolution using the `size` prop.
- **🎭 Multi-Style Generation** — Every SVG automatically receives three variants: `default` (duotone), `-open` (monotone), and `-filled` (solid).
- **🌳 Tree-Shakeable** — Import exactly what you need. Dead code is eliminated in your application bundle.
- **📝 Native TypeScript** — 100% typed, granting autocomplete for over 1,300+ icon names.
- **⚡ Automated Pipeline** — Drop SVGs into a folder, run the codegen script, and components are instantly synthesized.
- **♿ Accessible** — Full screen-reader support via the `accessibilityLabel` prop.

---

## 📦 Installation

Install the library in your project:

```bash
npm install react-native-icon
```

---

## 🚀 Usage

### Unified `<Icon />` Component (Recommended)

The easiest way to render icons is via the unified `<Icon />` component. Your IDE will auto-complete the `name` prop for all 1,300+ available icons.

```tsx
import { Icon } from 'react-native-icon';

// 1. Basic usage — Renders the default variant (duotone)
<Icon name="healer-ambulance" size={24} />

// 2. Monotone usage — Renders the "-open" outline variant
<Icon name="healer-ambulance-open" size={32} color="#3B82F6" />

// 3. Solid usage — Renders the "-filled" solid variant
<Icon name="healer-ambulance-filled" size={48} color="#10B981" />

// 4. Advanced configuration
<Icon 
  name="florence-user-open" 
  size={24} 
  color="#EF4444" 
  strokeWidth={1.5}
  accessibilityLabel="User profile settings" 
/>
```

### Available Categories & Styles

The library ships with over **1,300 icons** spanning **6 major categories**:
- `florence-*`
- `freudian-*`
- `healer-*`
- `hepius-*`
- `sandow-*`
- `turing-*`

Each category supports the standard **three variants**:
1. `florence-user` (Base/Duotone)
2. `florence-user-open` (Monotone/Stroked)
3. `florence-user-filled` (Solid/Filled)

### Individual Imports (For Tree-Shaking)

If you prefer to bypass the unified component for strict tree-shaking rules, import the components directly:

```tsx
import { 
  HealerAmbulanceIcon, 
  HealerAmbulanceFilledIcon, 
  FlorenceUserOpenIcon 
} from 'react-native-icon';

<HealerAmbulanceIcon size={32} color="#3B82F6" />
<FlorenceUserOpenIcon size={24} color="#EF4444" strokeWidth={1.5} />
```

---

## ⚙️ Component API

The `<Icon />` component and all individual icon components accept the following props:

| Prop                 | Type                          | Default          | Description                                      |
| -------------------- | ----------------------------- | ---------------- | ------------------------------------------------ |
| `name`               | `IconName`                    | **(required)**   | The precise name of the icon to render (only on `<Icon />`) |
| `size`               | `number`                      | `24`             | The square dimensions (width & height) in pixels |
| `color`              | `string`                      | `"currentColor"` | Primary color injected into the SVG              |
| `strokeColor`        | `string`                      | `color`          | Dedicated color for stroked elements             |
| `strokeWidth`        | `number`                      | `2`              | Adjust the line thickness of stroked variants    |
| `accessibilityLabel` | `string`                      | `undefined`      | ARIA/Accessibility label for screen readers      |
| `style`              | `StyleProp<ViewStyle>`        | `undefined`      | React Native ViewStyle passed to the root `Svg`  |

*Note: Any additional props (like `testID`, `onPress`) are spread directly onto the root `Svg` element.*

---

## 🛠️ Developer Guide: Adding New Icons

This library handles its own build pipeline, making it incredibly easy to scale. 

### Step 1: Add the SVG
Drop your new raw `.svg` file into the `icons/` folder.
*If it's a duotone icon you want auto-variants for, make sure it has the `_duotone_` keyword.*

```text
rn-icon-library/
└── icons/
    └── my-new-category_duotone_example.svg
```

### Step 2: Generate Variants
Run the variant generator. This script normalizes the file name (e.g. `my-new-category-example.svg`) and automatically writes the `-open` and `-filled` variants using intelligent DOM traversal.

```bash
node scripts/generate-variants.js
```

### Step 3: Run Codegen & Build
Compile the SVGs into React Native components:

```bash
npm run codegen
npm run build
```
This triggers SVGR to wrap the SVGs in React components, replaces hardcoded colors with React props via `scripts/codegen.ts`, updates the barrel files, and executes TypeScript compilation to `dist/`.

---

## 📁 Repository Architecture

```text
rn-icon-library/
├── icons/                   # 1,300+ Raw SVG files
├── scripts/
│   ├── generate-variants.js # AST/Regex logic to auto-generate open/filled styles
│   ├── codegen.ts           # The SVGR code-generation pipeline
│   ├── svgr-template.js     # Component injection template for SVGR
│   └── build-esm.js         # ESM package wrapper
├── src/
│   ├── icons/               # 1,300+ Auto-generated React components (DO NOT EDIT)
│   ├── Icon.tsx             # The unified entrypoint component
│   ├── types.ts             # Prop types and the massive IconName union
│   └── registry.ts          # Key-value map of names to component imports
├── dist/                    # Compiled NPM bundle
├── package.json             
└── tsconfig.json            
```

---

## 📜 License

MIT License.
# react-native-icon
