const fs = require('fs');
let content = fs.readFileSync('src/Constructor.vue', 'utf8');

const oldTableStorage = `      .map((item: any) => ({
        id: item.id || 'item-' + Math.random(),
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        isAvailable: item.isAvailable !== false,
        image: item.image || ''
      }))`;

const newTableStorage = `      .map((item: any) => ({
        id: item.id || 'item-' + Math.random(),
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        priceGlass: item.priceGlass || 0,
        priceBottle: item.priceBottle || 0,
        noNuts: item.noNuts || false,
        noLactose: item.noLactose || false,
        noGluten: item.noGluten || false,
        isAvailable: item.isAvailable !== false,
        image: item.image || ''
      }))`;

content = content.replace(oldTableStorage, newTableStorage);
fs.writeFileSync('src/Constructor.vue', content);
console.log('Successfully updated Constructor.vue table storage map');

