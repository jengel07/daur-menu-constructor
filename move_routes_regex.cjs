const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /\/\/ ============================================================\s*\/\/ СТОП-ЛИСТ \(ДЛЯ ПЕРСОНАЛА\)\s*\/\/ ============================================================[\s\S]*?app\.patch\('\/api\/staff\/dishes\/:id\/availability'[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Ошибка сервера' \}\);\s*\}\s*\}\);/g;

const match = regex.exec(code);

if (match) {
  const block = match[0];
  code = code.replace(block, '');
  
  // Find where to insert
  const insertRegex = /(export function adminOnly.*?next\(\);\s*\})/s;
  code = code.replace(insertRegex, `$1\n\n${block}\n`);
  
  fs.writeFileSync('daur-menu-backend/index.js', code);
  console.log("Moved correctly!");
} else {
  console.log("Still not found!");
}

