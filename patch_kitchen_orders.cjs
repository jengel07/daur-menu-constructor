const fs = require('fs');
let code = fs.readFileSync('src/views/KitchenOrders.vue', 'utf8');

// 1. Add button
const headerActionsRegex = /<div class="k-header-actions">/;
const headerActionsWithButton = `<div class="k-header-actions">
        <button class="k-btn-refresh" style="background: #eab308; color: #000;" @click="showStopList = true">
          🛑 Стоп-лист
        </button>`;

if (code.includes('<div class="k-header-actions">')) {
  code = code.replace(headerActionsRegex, headerActionsWithButton);
} else {
  console.log("Could not find k-header-actions");
}

// 2. Add StopListModal component
const modalInsertionRegex = /<!-- Modal Rejection -->/;
const modalInsertionWithStopList = `<!-- Stop-List Modal -->
    <StopListModal v-if="showStopList" @close="showStopList = false" />

    <!-- Modal Rejection -->`;

if (code.includes('<!-- Modal Rejection -->')) {
  code = code.replace(modalInsertionRegex, modalInsertionWithStopList);
} else {
  console.log("Could not find Modal Rejection");
}

// 3. Add imports and ref
const importRegex = /import \{ useToast \} from 'vue-toastification';/;
const importWithStopList = `import { useToast } from 'vue-toastification';
import StopListModal from '../components/kitchen/StopListModal.vue';`;

if (code.includes("import { useToast } from 'vue-toastification';")) {
  code = code.replace(importRegex, importWithStopList);
} else {
  console.log("Could not find import useToast");
}

const refRegex = /const filterTab = ref\('new'\);/;
const refWithStopList = `const filterTab = ref('new');
const showStopList = ref(false);`;

if (code.includes("const filterTab = ref('new');")) {
  code = code.replace(refRegex, refWithStopList);
} else {
  console.log("Could not find const filterTab");
}

fs.writeFileSync('src/views/KitchenOrders.vue', code);
console.log('KitchenOrders.vue patched');

