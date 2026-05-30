const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'icons');
const tags = {};

function walk(d) {
  const files = fs.readdirSync(d, { withFileTypes: true });
  for (const file of files) {
    const full = path.join(d, file.name);
    if (file.isDirectory()) walk(full);
    else if (file.name.endsWith('.svg')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.matchAll(/<([a-zA-Z0-9]+)/g);
      for (const m of matches) {
        tags[m[1]] = (tags[m[1]] || 0) + 1;
      }
    }
  }
}

walk(dir);
console.log(Object.entries(tags).sort((a, b) => b[1] - a[1]));
