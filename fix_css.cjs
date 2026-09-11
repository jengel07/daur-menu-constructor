const fs = require('fs');
const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove debug boxes
code = code.replace(
  /<div v-else-if="restaurantId" style="background: red;[^>]+>[\s\S]*?<\/div>\s*<div v-else style="background: blue;[^>]+>[\s\S]*?<\/div>/,
  ''
);

// 2. Adjust CSS for full width with small margin
code = code.replace(
  /margin: 0 16px;/,
  'margin: 0 3mm;'
);
code = code.replace(
  /border-radius: 16px;/,
  'border-radius: 12px;'
);

fs.writeFileSync(path, code);
console.log('Fixed PromoBanners styling and removed debug');

