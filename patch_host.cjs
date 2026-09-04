const fs = require('fs');

let indexJs = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

indexJs = indexJs.replace(
  /<a href="\$\{process\.env\.FRONTEND_URL \|\| 'http:\/\/localhost:5173'\}\/login\?email=\$\{encodeURIComponent\(email\)\}&password=\$\{encodeURIComponent\(password\)\}">/g,
  '<a href="${req.protocol}://${req.get(\'host\')}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}">'
);

fs.writeFileSync('daur-menu-backend/index.js', indexJs);
console.log('Replaced');

