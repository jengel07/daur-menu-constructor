const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// Remove the incorrect insertion
code = code.replace(`                <StopListModal v-if="showStopList" @close="showStopList = false" />\r\n  </template>`, `                </template>`);
code = code.replace(`                <StopListModal v-if="showStopList" @close="showStopList = false" />\n  </template>`, `                </template>`);

// Insert correctly before the last </template>
const lastTemplateIndex = code.lastIndexOf('</template>');
if (lastTemplateIndex !== -1) {
  code = code.substring(0, lastTemplateIndex) + `  <StopListModal v-if="showStopList" @close="showStopList = false" />\n` + code.substring(lastTemplateIndex);
}

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('Fixed insertion');

