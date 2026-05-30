/**
 * Custom SVGR template for React Native icon components.
 *
 * This template generates components that:
 * - Accept size, color, strokeColor, strokeWidth, accessibilityLabel props
 * - Replace all hardcoded stroke colors with the strokeColor prop
 * - Replace all hardcoded fill colors with the color prop (preserving fill="none")
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
      strokeWidth = 2,
      accessibilityLabel,
      style,
      ...props
    },
    ref,
  ) => {
    const _strokeColor = strokeColor ?? color;
    return (${variables.jsx});
  },
);

${exportName}.displayName = '${exportName}';

export default ${exportName};
export { ${exportName} };
`;
};

module.exports = template;
