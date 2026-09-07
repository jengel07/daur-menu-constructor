const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// Remove all occurrences of StopListModal inside <template v-if="order.type === 'delivery'">
code = code.replace(/<StopListModal v-if="showStopList" @close="showStopList = false" \/>\s*<\/template>/g, '</template>');

// And if I accidentally removed the correct one at the end...
const lastTemplateIndex = code.lastIndexOf('</template>');
if (!code.substring(lastTemplateIndex - 100, lastTemplateIndex).includes('StopListModal')) {
  code = code.substring(0, lastTemplateIndex) + `  <StopListModal v-if="showStopList" @close="showStopList = false" />\n` + code.substring(lastTemplateIndex);
}

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('Fixed insertion again');

