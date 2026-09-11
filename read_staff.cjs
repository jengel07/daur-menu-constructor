const fs = require('fs');
const lines = fs.readFileSync('daur-menu-backend/index.js', 'utf8').split('\n');
let print = false;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('app.post(\'/api/staff\', authMiddleware, adminOnly')) print = true;
  if (print) console.log(lines[i]);
  if (print && lines[i].includes('// POST /api/staff/invite')) break;
}

