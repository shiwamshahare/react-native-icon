import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'icons');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ICONS_OUT_DIR = path.join(SRC_DIR, 'icons');

/**
 * Convert a filename like "mail-open.svg" to PascalCase + "Icon" suffix.
 * Handles hyphens, underscores, dots, and numbers.
 * Examples:
 *   mail.svg        → MailIcon
 *   mail-open.svg   → MailOpenIcon
 *   arrow_left.svg  → ArrowLeftIcon
 *   2fa-code.svg    → 2FaCodeIcon (preserves leading numbers)
 */
function toPascalCaseIconName(filename: string): string {
  const name = filename.replace(/\.svg$/i, '');
  const pascalCase = name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  return pascalCase + 'Icon';
}

/**
 * Derive the icon lookup name from a filename.
 * This is the kebab-case name without the .svg extension.
 * Examples:
 *   mail.svg        → "mail"
 *   mail-open.svg   → "mail-open"
 *   arrow_left.svg  → "arrow-left"  (underscores normalized to hyphens)
 */
function toIconName(filename: string): string {
  return filename
    .replace(/\.svg$/i, '')
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * Recursively collect all .svg files from a directory.
 */
function collectSvgFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) {
    console.error(`❌ Icons directory not found: ${dir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSvgFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Post-process the SVGR output to replace hardcoded colors with props.
 *
 * Strategy:
 * - Replace stroke="<any-color>" with stroke={_strokeColor}
 *   (but NOT stroke="none")
 * - Replace fill="<any-color>" with fill={color}
 *   (but NOT fill="none")
 * - Replace strokeWidth={<number>} with strokeWidth={strokeWidth}
 * - Ensure width/height use {size}
 */
function postProcessComponent(code: string): string {
  let result = code;

  // Replace stroke="<color>" with stroke={_strokeColor}
  // Handle both JSX attribute formats: stroke={"value"} and stroke="value"
  result = result.replace(
    /stroke=\{?"((?:#[0-9a-fA-F]{3,8}|black|white|red|green|blue|gray|grey|orange|yellow|purple|pink|currentColor))"?\}/g,
    'stroke={_strokeColor}',
  );
  result = result.replace(
    /stroke="(#[0-9a-fA-F]{3,8}|black|white|red|green|blue|gray|grey|orange|yellow|purple|pink|currentColor)"/g,
    'stroke={_strokeColor}',
  );

  // Replace fill="<color>" with fill={color}, but NOT fill="none"
  result = result.replace(
    /fill=\{?"((?:#[0-9a-fA-F]{3,8}|black|white|red|green|blue|gray|grey|orange|yellow|purple|pink|currentColor))"?\}/g,
    'fill={color}',
  );
  result = result.replace(
    /fill="(#[0-9a-fA-F]{3,8}|black|white|red|green|blue|gray|grey|orange|yellow|purple|pink|currentColor)"/g,
    'fill={color}',
  );

  // Replace hardcoded strokeWidth values with the prop
  result = result.replace(/strokeWidth=\{?\d+\.?\d*\}?/g, 'strokeWidth={strokeWidth}');
  result = result.replace(/strokeWidth="\d+\.?\d*"/g, 'strokeWidth={strokeWidth}');

  // Remove SVGR's auto-injected ref and spread props from the Svg element
  // (we inject our own clean version below)
  result = result.replace(/\s*ref=\{ref\}/g, '');
  result = result.replace(/\s*\{\.\.\.props\}/g, '');

  // Remove xmlns attribute — not valid in react-native-svg
  result = result.replace(/\s*xmlns="[^"]*"/g, '');

  // Inject width={size}, height={size}, style, ref, accessibility, and spread props
  // into the root <Svg element. SVGO's removeDimensions already stripped width/height,
  // so we inject them fresh.
  if (!result.includes('width={size}')) {
    result = result.replace(
      /(<Svg\b)/,
      '$1\n      ref={ref}\n      width={size}\n      height={size}\n      style={style}\n      accessible={!!accessibilityLabel}\n      accessibilityLabel={accessibilityLabel}\n      {...props}',
    );
  }

  return result;
}

/**
 * Generate the types.ts file with the shared IconProps interface.
 */
function generateTypesFile(iconNames: string[]): void {
  const nameUnion = iconNames.map((n) => `'${n}'`).join(' | ');

  const typesContent = `import type { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  /** Icon size (width and height). Defaults to 24. */
  size?: number;
  /** Primary color for fill elements. Defaults to "currentColor". */
  color?: string;
  /** Color for stroke elements. Defaults to the value of \`color\`. */
  strokeColor?: string;
  /** Width of strokes. Defaults to 2. */
  strokeWidth?: number;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
  /** Additional styles applied to the root SVG element. */
  style?: StyleProp<ViewStyle>;
}

/** All available icon names. */
export type IconName = ${nameUnion};

/** Props for the unified \`<Icon />\` component. */
export interface IconComponentProps extends IconProps {
  /** The name of the icon to render. */
  name: IconName;
}
`;

  const typesPath = path.join(SRC_DIR, 'types.ts');
  fs.writeFileSync(typesPath, typesContent, 'utf-8');
  console.log('✅ Generated src/types.ts');
}

/**
 * Generate the icon registry that maps icon names to their components.
 */
function generateRegistryFile(iconMap: Map<string, string>): void {
  const lines: string[] = [
    '// Auto-generated icon registry — do not edit manually.',
    "// Run 'npm run codegen' to regenerate.",
    '',
    "import * as React from 'react';",
    "import type { IconProps } from './types';",
    '',
  ];

  // Import all icons
  const sortedEntries = [...iconMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [, componentName] of sortedEntries) {
    lines.push(`import { ${componentName} } from './icons/${componentName}';`);
  }

  lines.push('');
  lines.push(
    'export const iconRegistry: Record<string, React.ForwardRefExoticComponent<IconProps & React.RefAttributes<any>>> = {',
  );

  for (const [iconName, componentName] of sortedEntries) {
    lines.push(`  '${iconName}': ${componentName},`);
  }

  lines.push('};');
  lines.push('');

  const registryPath = path.join(SRC_DIR, 'registry.ts');
  fs.writeFileSync(registryPath, lines.join('\n'), 'utf-8');
  console.log('✅ Generated src/registry.ts');
}

/**
 * Generate the unified <Icon /> component.
 */
function generateIconComponent(): void {
  const content = `// Auto-generated Icon component — do not edit manually.
// Run 'npm run codegen' to regenerate.

import * as React from 'react';
import { iconRegistry } from './registry';
import type { IconComponentProps } from './types';
import type Svg from 'react-native-svg';

/**
 * Unified Icon component.
 *
 * @example
 * <Icon name="mail" size={24} color="#000" />
 * <Icon name="mail-open" size={32} strokeWidth={1.5} />
 */
const Icon = React.forwardRef<React.ElementRef<typeof Svg>, IconComponentProps>(
  ({ name, ...props }, ref) => {
    const IconComponent = iconRegistry[name];

    if (!IconComponent) {
      if (__DEV__) {
        console.warn(
          \`[react-native-icons-shiwam] Unknown icon name: "\${name}". \` +
          \`Available icons: \${Object.keys(iconRegistry).join(', ')}\`,
        );
      }
      return null;
    }

    return <IconComponent ref={ref} {...props} />;
  },
);

Icon.displayName = 'Icon';

export default Icon;
export { Icon };
`;

  const iconPath = path.join(SRC_DIR, 'Icon.tsx');
  fs.writeFileSync(iconPath, content, 'utf-8');
  console.log('✅ Generated src/Icon.tsx');
}

/**
 * Generate the index.ts barrel file exporting all icons, types, and the unified Icon component.
 */
function generateIndexFile(componentNames: string[]): void {
  const lines: string[] = [
    '// Auto-generated barrel file — do not edit manually.',
    "// Run 'npm run codegen' to regenerate.",
    '',
    "export type { IconProps, IconName, IconComponentProps } from './types';",
    "export { Icon } from './Icon';",
    "export { iconRegistry } from './registry';",
    '',
  ];

  for (const name of componentNames.sort()) {
    lines.push(`export { ${name} } from './icons/${name}';`);
  }

  lines.push(''); // trailing newline

  const indexPath = path.join(SRC_DIR, 'index.ts');
  fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8');
  console.log('✅ Generated src/index.ts');
}

async function main() {
  console.log('🔧 react-native-icons-shiwam codegen starting...\n');

  // Ensure output directories exist
  if (!fs.existsSync(SRC_DIR)) {
    fs.mkdirSync(SRC_DIR, { recursive: true });
  }
  if (!fs.existsSync(ICONS_OUT_DIR)) {
    fs.mkdirSync(ICONS_OUT_DIR, { recursive: true });
  }

  // Collect SVG files
  const svgFiles = collectSvgFiles(ICONS_DIR);
  if (svgFiles.length === 0) {
    console.error('❌ No SVG files found in icons/ directory');
    process.exit(1);
  }

  console.log(`📁 Found ${svgFiles.length} SVG file(s)\n`);

  // Dynamic import for @svgr/core (ESM module)
  const { transform } = await import('@svgr/core');
  const template = require('./svgr-template');

  const componentNames: string[] = [];
  const iconMap = new Map<string, string>(); // iconName → componentName

  for (const svgPath of svgFiles) {
    const filename = path.basename(svgPath);
    const componentName = toPascalCaseIconName(filename);
    const iconName = toIconName(filename);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');

    console.log(`  📄 ${filename} → ${componentName} (name: "${iconName}")`);

    try {
      let jsCode = await transform(
        svgContent,
        {
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          native: true,
          typescript: true,
          ref: true,
          template,
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    // Don't remove viewBox — we need it
                    removeViewBox: false,
                    // Don't convert colors
                    convertColors: false,
                    // Don't remove stroke attributes
                    removeUnknownsAndDefaults: {
                      keepRoleAttr: true,
                    },
                  },
                },
              },
              // Remove width/height from SVG so our template controls sizing
              'removeDimensions',
            ],
          },
          svgProps: {},
        },
        {
          componentName: componentName,
        },
      );

      // Post-process to replace hardcoded colors with props
      jsCode = postProcessComponent(jsCode);

      // Write the component file
      const outPath = path.join(ICONS_OUT_DIR, `${componentName}.tsx`);
      fs.writeFileSync(outPath, jsCode, 'utf-8');
      componentNames.push(componentName);
      iconMap.set(iconName, componentName);
    } catch (err) {
      console.error(`  ❌ Failed to process ${filename}:`, err);
    }
  }

  console.log('');

  // Generate types.ts (with IconName union type)
  const iconNames = [...iconMap.keys()].sort();
  generateTypesFile(iconNames);

  // Generate registry.ts (name → component mapping)
  generateRegistryFile(iconMap);

  // Generate Icon.tsx (unified component)
  generateIconComponent();

  // Generate index.ts (barrel exports)
  generateIndexFile(componentNames);

  // Summary
  console.log('\n📊 Codegen Summary:');
  console.log(`   Total icons processed: ${componentNames.length}`);
  console.log(`   Components generated:`);
  for (const name of componentNames.sort()) {
    console.log(`     - ${name}`);
  }
  console.log('\n✨ Codegen complete!\n');
}

main().catch((err) => {
  console.error('Fatal error during codegen:', err);
  process.exit(1);
});
