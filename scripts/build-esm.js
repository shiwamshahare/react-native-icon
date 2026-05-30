/**
 * Simple script to create an ESM copy of the built output.
 * Copies dist/index.js to dist/index.esm.js with module-style exports.
 * This is a lightweight approach — for production, consider using a bundler like rollup.
 */

const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const cjsEntry = path.join(distDir, 'index.js');
const esmEntry = path.join(distDir, 'index.esm.js');

if (fs.existsSync(cjsEntry)) {
  // For a simple ESM wrapper, we re-export from the CJS module
  // In a real production build, you'd use Rollup or similar
  let content = fs.readFileSync(cjsEntry, 'utf-8');

  // Replace CommonJS patterns with ESM
  content = content
    .replace(/^"use strict";\s*/m, '')
    .replace(/Object\.defineProperty\(exports, "__esModule", \{ value: true \}\);/g, '')
    .replace(/exports\.(\w+)\s*=\s*void 0;/g, '')
    .replace(/exports\.(\w+)\s*=\s*(\w+);/g, 'export { $2 as $1 };')
    .replace(/var (\w+)\s*=\s*require\("([^"]+)"\);/g, 'import * as $1 from "$2";');

  fs.writeFileSync(esmEntry, content, 'utf-8');
  console.log('✅ Created dist/index.esm.js');
} else {
  console.log('⚠️  dist/index.js not found, skipping ESM generation');
}
