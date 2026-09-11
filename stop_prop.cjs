const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');
code = code.replace('@click="clearActiveOrder"', '@click.stop="clearActiveOrder"');
fs.writeFileSync(path, code);

