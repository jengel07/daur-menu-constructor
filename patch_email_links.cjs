const fs = require('fs');

let indexJs = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

indexJs = indexJs.replace(
  /\}\/login">/g,
  '}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}">'
);

fs.writeFileSync('daur-menu-backend/index.js', indexJs);
console.log('Done!');

