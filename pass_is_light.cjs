const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

const regex = /<StopListModal v-if="showStopList" @close="showStopList = false" \/>/g;
code = code.replace(regex, '<StopListModal v-if="showStopList" :is-light="isLight" @close="showStopList = false" />');

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('Passed isLight prop');

