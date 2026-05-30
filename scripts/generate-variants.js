const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../icons');

function run() {
  const files = fs.readdirSync(ICONS_DIR);
  
  for (const file of files) {
    if (!file.includes('duotone')) continue;
    if (!file.endsWith('.svg')) continue;

    const content = fs.readFileSync(path.join(ICONS_DIR, file), 'utf-8');

    // Normalize name: florence_duotone_activity tennis.svg -> florence-activity-tennis.svg
    const baseName = file
      .replace('_duotone_', '-')
      .replace(/_duotone/g, '') // fallback
      .replace(/duotone_/g, '') // fallback
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace('.svg', '');

    const newOriginalName = `${baseName}.svg`;
    const openName = `${baseName}-open.svg`;
    const filledName = `${baseName}-filled.svg`;

    // Rename the original file to normalize it
    if (file !== newOriginalName) {
      fs.renameSync(path.join(ICONS_DIR, file), path.join(ICONS_DIR, newOriginalName));
    }

    // 1. Generate Open (Monotone)
    // We assume the secondary duotone color is #808080. We change it to black.
    // Also remove any opacity attributes if they exist.
    let openContent = content
      .replace(/#808080/g, 'black')
      .replace(/opacity="[^"]*"/g, '');
    
    fs.writeFileSync(path.join(ICONS_DIR, openName), openContent);

    // 2. Generate Filled (Solid)
    // We strip all stroke-related attributes and set fill="black" on shape elements.
    let filledContent = content
      // Strip existing stroke attributes from paths/shapes
      .replace(/\sstroke="[^"]*"/g, '')
      .replace(/\sstroke-width="[^"]*"/g, '')
      .replace(/\sstroke-linecap="[^"]*"/g, '')
      .replace(/\sstroke-linejoin="[^"]*"/g, '');

    // Now for every path/circle/rect/etc, if it has a fill, change it to black.
    // If it doesn't have a fill, we need to add fill="black".
    // A simple regex approach: replace `<path ` with `<path fill="black" `
    // and then remove any duplicate or existing fills inside the path.
    // Actually, safer to remove existing fills on shapes first.
    filledContent = filledContent.replace(/<([^>]+)\sfill="[^"]*"/g, (match, tag) => {
      // Don't change the root svg fill="none"
      if (tag.startsWith('svg')) return match;
      return `<${tag}`;
    });

    // Add fill="black" to all shape elements
    const shapes = ['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon'];
    for (const shape of shapes) {
      const regex = new RegExp(`<${shape}\\s`, 'g');
      filledContent = filledContent.replace(regex, `<${shape} fill="black" `);
    }

    fs.writeFileSync(path.join(ICONS_DIR, filledName), filledContent);
    console.log(`Generated: ${openName} and ${filledName}`);
  }
}

run();
