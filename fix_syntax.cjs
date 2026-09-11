const fs = require('fs');
const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /><\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  '></div>\n    </div>\n  </div>'
);

fs.writeFileSync(path, code);
console.log('Fixed syntax error in PromoBanners.vue');

