const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const regex = /<div\s+v-if="item\.price"\s+v-show="item\.priceBottle \|\| item\.priceGlass"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

content = content.replace(regex, '');

fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
console.log('Fixed PhoneMockupContent');
