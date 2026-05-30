import * as fs from 'fs';
import * as path from 'path';
import * as htmlparser2 from 'htmlparser2';

const ROOT_DIR = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'icons');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ICONS_OUT_DIR = path.join(SRC_DIR, 'icons');

function collectSvgFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectSvgFiles(fullPath));
    else if (entry.name.endsWith('.svg')) results.push(fullPath);
  }
  return results;
}

function toIconName(filename: string): string {
  let name = filename.replace(/\.svg$/i, '').replace(/_/g, '-').toLowerCase();
  const parts = name.split('-');
  const categories = ['florence', 'freudian', 'healer', 'hepius', 'sandow', 'turing'];
  const firstPart = parts[0];
  
  if (categories.includes(firstPart)) {
    parts.shift();
    parts.push(firstPart);
    name = parts.join('-');
  }
  return name;
}

function toPascalCaseIconName(filename: string): string {
  const name = filename.replace(/\.svg$/i, '');
  const parts = name.split(/[-_\s]+/);
  
  // The known categories
  const categories = ['florence', 'freudian', 'healer', 'hepius', 'sandow', 'turing'];
  const firstPart = parts[0].toLowerCase();
  
  // If the filename starts with a category, move it to the end (before 'Icon')
  // e.g., 'healer-email' -> ['email', 'healer'] -> EmailHealerIcon
  // e.g., 'healer-email-open' -> ['email', 'open', 'healer'] -> EmailOpenHealerIcon
  if (categories.includes(firstPart)) {
    parts.shift();
    parts.push(firstPart);
  }
  
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('') + 'Icon';
}

function processColor(val: string): string {
  if (!val || val === 'none') return val;
  const lower = val.toLowerCase();
  if (lower === '#808080' || lower === '#808' || lower === 'gray' || lower === 'grey') return 'secondary';
  // If it's another color, like black/white/hex, map to primary.
  return 'primary';
}

function camelCaseAttributes(attribs: Record<string, string>): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(attribs)) {
    if (key.startsWith('xmlns') || key === 'xml:space') continue;
    
    const ccKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
    
    let finalVal = value;
    if (ccKey === 'stroke' || ccKey === 'fill') {
      finalVal = processColor(value);
    }
    
    result[ccKey] = finalVal;
  }
  return result;
}

function nodeToArray(node: any): any {
  if (node.type === 'tag') {
    const tagName = node.name;
    const attrs = camelCaseAttributes(node.attribs);
    const children = (node.children || []).map(nodeToArray).filter(Boolean);
    
    if (children.length > 0) return [tagName, attrs, children];
    return [tagName, attrs];
  }
  return null;
}

async function main() {
  console.log('🔧 rn-vector-icons Data-Driven codegen starting...');
  
  const svgFiles = collectSvgFiles(ICONS_DIR);
  if (svgFiles.length === 0) {
    console.error('❌ No SVG files found in icons/ directory');
    process.exit(1);
  }

  const iconData: Record<string, any[]> = {};
  const componentNames: string[] = [];
  const iconMap = new Map<string, string>();

  if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive: true });
  if (fs.existsSync(ICONS_OUT_DIR)) fs.rmSync(ICONS_OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(ICONS_OUT_DIR, { recursive: true });

  console.log(`📁 Processing ${svgFiles.length} SVG files...`);

  for (const file of svgFiles) {
    const filename = path.basename(file);
    const iconName = toIconName(filename);
    const componentName = toPascalCaseIconName(filename);
    
    const content = fs.readFileSync(file, 'utf-8');
    const dom = htmlparser2.parseDocument(content);
    const svgNode = dom.children.find(n => n.type === 'tag' && n.name === 'svg');
    
    if (!svgNode) continue;
    
    const children = (svgNode as any).children.map(nodeToArray).filter(Boolean);
    iconData[iconName] = children;
    
    componentNames.push(componentName);
    iconMap.set(iconName, componentName);
  }

  // 1. Generate iconData.ts
  const dataFile = `// Auto-generated icon data dictionary
export const iconData = JSON.parse(JSON.stringify(${JSON.stringify(iconData)}));
`;
  // Wait, actually writing the huge string literal to JSON.parse avoids Metro parsing an object literal!
  const stringifiedData = JSON.stringify(iconData);
  const dataFileOptimized = `// Auto-generated icon data dictionary (optimized for fast Metro parsing)
export const iconData = JSON.parse('${stringifiedData.replace(/'/g, "\\'")}');
`;
  fs.writeFileSync(path.join(SRC_DIR, 'iconData.ts'), dataFileOptimized, 'utf-8');

  // 2. Generate Icon.tsx
  const iconTsx = `// Auto-generated unified Icon component
import * as React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Polygon, G, Defs, ClipPath, Mask, Use, Ellipse } from 'react-native-svg';
import { iconData } from './iconData';
import type { IconComponentProps } from './types';

const TAG_MAP: Record<string, React.ElementType> = {
  path: Path, rect: Rect, circle: Circle, line: Line, 
  polyline: Polyline, polygon: Polygon, g: G, defs: Defs, 
  clipPath: ClipPath, mask: Mask, use: Use, ellipse: Ellipse
};

function renderNode(node: any, idx: number, props: any) {
  if (!node) return null;
  const [tag, attrs, children] = node;
  const Tag = TAG_MAP[tag];
  if (!Tag) return null;

  const { color, secondaryColor, strokeColor, strokeWidth } = props;
  const resolvedAttrs = { ...attrs, key: idx };

  if (resolvedAttrs.stroke === 'primary') resolvedAttrs.stroke = strokeColor ?? color;
  if (resolvedAttrs.stroke === 'secondary') resolvedAttrs.stroke = secondaryColor ?? strokeColor ?? color;
  
  if (resolvedAttrs.fill === 'primary') resolvedAttrs.fill = color;
  if (resolvedAttrs.fill === 'secondary') resolvedAttrs.fill = secondaryColor ?? color;
  
  if (resolvedAttrs.strokeWidth !== undefined && strokeWidth !== undefined) {
    resolvedAttrs.strokeWidth = strokeWidth;
  }

  return (
    <Tag {...resolvedAttrs}>
      {children?.map((child: any, i: number) => renderNode(child, i, props))}
    </Tag>
  );
}

const Icon = React.forwardRef<React.ElementRef<typeof Svg>, IconComponentProps>(
  ({ name, size = 24, color = 'currentColor', secondaryColor, strokeColor, strokeWidth = 2, accessibilityLabel, style, ...rest }, ref) => {
    const nodes = iconData[name];
    if (!nodes) {
      if (__DEV__) console.warn(\`[rn-vector-icons] Unknown icon: "\${name}"\`);
      return null;
    }

    return (
      <Svg
        ref={ref}
        width={size}
        height={size}
        style={style}
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        fill="none"
        viewBox="0 0 24 24"
        {...rest}
      >
        {nodes.map((node: any, i: number) => renderNode(node, i, { color, secondaryColor, strokeColor, strokeWidth }))}
      </Svg>
    );
  }
);

Icon.displayName = 'Icon';
export default Icon;
export { Icon };
`;
  fs.writeFileSync(path.join(SRC_DIR, 'Icon.tsx'), iconTsx, 'utf-8');

  // 3. Generate types.ts
  const iconNames = [...iconMap.keys()].sort();
  const nameUnion = iconNames.map(n => `'${n}'`).join(' | ');
  const typesContent = `import type { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  strokeColor?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type IconName = ${nameUnion};

export interface IconComponentProps extends IconProps {
  name: IconName;
}
`;
  fs.writeFileSync(path.join(SRC_DIR, 'types.ts'), typesContent, 'utf-8');

  // 4. Generate index.ts
  const indexLines = [
    "export type { IconProps, IconName, IconComponentProps } from './types';",
    "export { Icon } from './Icon';",
  ];
  fs.writeFileSync(path.join(SRC_DIR, 'index.ts'), indexLines.join('\n'), 'utf-8');

  if (fs.existsSync(path.join(SRC_DIR, 'registry.ts'))) {
    fs.unlinkSync(path.join(SRC_DIR, 'registry.ts'));
  }

  console.log('✅ Codegen complete! Compressed data-driven architecture generated.');
}

main().catch(console.error);
