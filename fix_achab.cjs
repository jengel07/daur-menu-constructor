const fs = require('fs');
let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');
indexCode = indexCode.replace(/Achab!<\/h2>/g, `\${restName}!</h2>`);
fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Fixed Achab!');

