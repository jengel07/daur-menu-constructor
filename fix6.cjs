const fs = require('fs');
let content = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const regex = /const langCodeMap: Record<string, string> = \{[\s\S]*?\};\s*const targetCode = langCodeMap\[targetLangCode\];\s*if \(\!targetCode\) return;/;
content = content.replace(regex, 'const targetCode = targetLangCode;');

fs.writeFileSync('src/views/ClientView.vue', content);
console.log('Fixed ClientView translation API call');

