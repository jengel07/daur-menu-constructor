const fs = require('fs');
let path = 'src/components/SettingsbarForClient.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /<component :is="viewMode === 'grid' \? LayoutGrid : \(viewMode === 'full' \? Square : List\)" :size="20" stroke-width="2" \/>/,
  `<component :is="viewMode === 'list' ? LayoutGrid : (viewMode === 'grid' ? Square : List)" :size="20" stroke-width="2" />`
);

fs.writeFileSync(path, code);
console.log('Fixed SettingsbarForClient.vue icons');

