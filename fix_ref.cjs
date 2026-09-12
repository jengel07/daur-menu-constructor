const fs = require('fs');
let code = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');
code = code.replace("import { ref } from 'vue';\nimport { ref, computed }", "import { ref, computed }");
fs.writeFileSync('src/components/MenuEditor.vue', code);
console.log('Fixed ref import');

