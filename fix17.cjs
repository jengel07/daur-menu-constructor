const fs = require('fs');
let content = fs.readFileSync('src/Constructor.vue', 'utf8');

const regex = /const price = Number\([\s\S]*?const priceGlass = Number\([^)]+\) \|\| 0\);/;

const match = content.match(regex);
if (match) {
  const newParse = `let rawPrice = row.Price || row['Цена, руб. (Price)'] || row['Цена'] || 0;
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
          
  content = content.replace(regex, newParse);
  fs.writeFileSync('src/Constructor.vue', content);
  console.log("Successfully replaced price parsing logic");
} else {
  console.log("Could not match price parsing regex");
}

