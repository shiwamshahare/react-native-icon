// Auto-generated unified Icon component
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
      if (__DEV__) console.warn(`[rn-vector-icons] Unknown icon: "${name}"`);
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
