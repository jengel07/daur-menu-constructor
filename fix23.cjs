const fs = require('fs');
let content = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const targetGrid = `<template v-else>
                      {{ tDyn('от') }} {{ Number(item.priceGlass || item.priceBottle || 0).toFixed(2) }} ₽
                    </template>`;

const replacementGrid = `<template v-else>
                      {{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽
                    </template>`;

content = content.replace(targetGrid, replacementGrid);

fs.writeFileSync('src/views/ClientView.vue', content);
console.log('ClientView grid fixed');

