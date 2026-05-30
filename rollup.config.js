import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

/**
 * All react and react-native packages must stay external.
 */
const external = (id) =>
  id.startsWith('react') || id.startsWith('react-native');

/**
 * Babel handles TS + TSX → JS transformation.
 */
const babelPlugin = babel({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  babelHelpers: 'bundled',
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'classic' }],
  ],
});

/**
 * Terser minification settings.
 * - Strips all comments
 * - Shortens variable names
 * - Preserves displayName for React DevTools
 */
const terserPlugin = terser({
  compress: {
    passes: 2,
    drop_console: false,
    pure_getters: true,
  },
  mangle: {
    reserved: ['Icon', '__DEV__'],
  },
  format: {
    comments: false,
  },
});

const sharedPlugins = [
  peerDepsExternal(),
  resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
  commonjs(),
  babelPlugin,
  terserPlugin,
];

export default [
  // 1. CommonJS build — minified, for Metro bundler / Node.js
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: false,
      // 'compat' emits proper interop helpers so that named imports from
      // react-native-svg (which ships as CJS) resolve to the actual
      // component functions — not the raw module namespace object.
      // Without this, Svg/Path/etc. come back as `undefined` at runtime,
      // causing the "Element type is invalid: got object" React error.
      interop: 'compat',
    },
    external,
    plugins: sharedPlugins,
  },

  // 2. ESM build — minified, for modern bundlers (Webpack, Vite, etc.)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: false,
    },
    external,
    plugins: sharedPlugins,
  },

  // 3. TypeScript declarations — bundled into a SINGLE index.d.ts
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [
      peerDepsExternal(),
      resolve({ extensions: ['.ts', '.tsx'] }),
      dts(),
    ],
  },
];
