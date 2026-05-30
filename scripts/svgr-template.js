/**
 * Custom SVGR template for React Native icon components.
 *
 * This template generates components that:
 * - Accept size, color, strokeColor, secondaryColor, strokeWidth, accessibilityLabel props
 * - Replace all hardcoded primary (black) stroke colors with the strokeColor prop
 * - Replace all hardcoded secondary (#808080) stroke colors with the secondaryColor prop
 * - Replace all hardcoded primary fill colors with the color prop
 * - Replace all hardcoded secondary (#808080) fill colors with the secondaryColor prop
 * - Preserve fill="none"
 * - Use React.forwardRef for ref forwarding
 * - Export as both default and named export
 */

const template = (variables, { tpl }) => {
  const componentName = variables.componentName;
  // Remove the "Svg" prefix that SVGR adds by default
  const exportName = componentName.replace(/^Svg/, '');

  return tpl`
import * as React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Polygon, G, Defs, ClipPath, Mask, Use, Ellipse, Text as SvgText, TSpan, Image as SvgImage, LinearGradient, RadialGradient, Stop, Symbol, Pattern, ForeignObject } from 'react-native-svg';
import type { IconProps } from '../types';

const ${exportName} = React.forwardRef<React.ElementRef<typeof Svg>, IconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeColor,
      secondaryColor,
      strokeWidth = 2,
      accessibilityLabel,
      style,
      ...props
    },
    ref,
  ) => {
    // Primary stroke color — defaults to the primary color prop
    const _strokeColor = strokeColor ?? color;
    // Secondary color — used for duotone accent elements (originally #808080 in SVG source)
    // Defaults to color so that icons without secondaryColor look like standard monotone icons
    const _secondaryColor = secondaryColor ?? color;
    const _secondaryStrokeColor = secondaryColor ?? _strokeColor;
    return (${variables.jsx});
  },
);

${exportName}.displayName = '${exportName}';

export default ${exportName};
export { ${exportName} };
`;
};

module.exports = template;
