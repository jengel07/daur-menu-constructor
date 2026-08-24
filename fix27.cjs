const fs = require('fs');

let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

content = content.replace(/width: 'auto'/g, "width: '100%'");

fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
console.log('Fixed PhoneMockupContent button width');

