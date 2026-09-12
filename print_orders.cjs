const fs = require('fs');
const lines = fs.readFileSync('daur-menu-backend/index.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("app.post('/api/orders'"));
for (let i = idx; i <= idx + 40; i++) {
  if (lines[i] !== undefined) console.log(i + ': ' + lines[i]);
}

