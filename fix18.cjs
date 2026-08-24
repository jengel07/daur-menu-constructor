const fs = require('fs');
let content = fs.readFileSync('src/Constructor.vue', 'utf8');
const lines = content.split('\n');
let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const price = Number(row.Price')) {
    startIndex = i;
  }
  if (startIndex !== -1 && lines[i].includes('const priceGlass = Number')) {
    endIndex = i;
    break;
  }
}
if (startIndex !== -1 && endIndex !== -1) {
  const newParse = `          let rawPrice = row.Price || row['Цена, руб. (Price)'] || row['Цена'] || 0;
          let price = 0;
          let priceBottle = Number(row['Цена за бутылку'] || row['Цена (бутылка)'] || 0);
          let priceGlass = Number(row['Цена за бокал'] || row['Цена (бокал)'] || row['Цена за стакан'] || 0);

          if (typeof rawPrice === 'string' && rawPrice.includes('/')) {
            const parts = rawPrice.split('/').map(p => Number(p.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p) && p > 0);
            if (parts.length === 2) {
              priceGlass = Math.min(...parts);
              priceBottle = Math.max(...parts);
            }
          } else {
            price = Number(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;
          }`;
  lines.splice(startIndex, endIndex - startIndex + 1, newParse);
  fs.writeFileSync('src/Constructor.vue', lines.join('\n'));
  console.log('Replaced via lines!');
} else {
  console.log('Not found via lines');
}

