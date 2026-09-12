const fs = require('fs');
let code = fs.readFileSync('src/components/ModifiersEditor.vue', 'utf8');

code = code.replace(/<button /g, '<button type="button" ');
code = code.replace(/type="button" type="button"/g, 'type="button"');

fs.writeFileSync('src/components/ModifiersEditor.vue', code);
console.log('Added type="button"');

