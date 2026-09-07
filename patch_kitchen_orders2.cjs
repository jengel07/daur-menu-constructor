const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

const importRegex = /import \{ ordersApi \} from '\.\.\/api'/;
const importReplacement = `import { ordersApi } from '../api'
import StopListModal from '../components/kitchen/StopListModal.vue'`;

code = code.replace(importRegex, importReplacement);

const refRegex = /const currentTab = ref<string>\('new'\)/;
const refReplacement = `const currentTab = ref<string>('new')
const showStopList = ref(false)`;

code = code.replace(refRegex, refReplacement);

const modalRegex = /<\/template>/;
const modalReplacement = `  <StopListModal v-if="showStopList" @close="showStopList = false" />
</template>`;

code = code.replace(modalRegex, modalReplacement);

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('KitchenOrders.vue patched');

