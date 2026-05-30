// Auto-generated Icon component — do not edit manually.
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
          `[rn-vector-icons] Unknown icon name: "${name}". ` +
          `Available icons: ${Object.keys(iconRegistry).join(', ')}`,
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
