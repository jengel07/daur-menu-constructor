const fs = require('fs');

function restoreModifiers(filePath, isComponent = false) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Add import and state
  if (!code.includes('ClientModifiersModal.vue')) {
    if (isComponent) {
      code = code.replace(
        /import { ref, computed } from 'vue';/,
        "import { ref, computed } from 'vue';\nimport ClientModifiersModal from './ClientModifiersModal.vue';"
      );
    } else {
      code = code.replace(
        /import { ref, computed, onMounted, onUnmounted } from 'vue';/,
        "import { ref, computed, onMounted, onUnmounted } from 'vue';\nimport ClientModifiersModal from '../components/ClientModifiersModal.vue';"
      );
    }
  }

  if (!code.includes('const modifierItem = ref')) {
    code = code.replace(
      /const activeModal = ref</,
      "const modifierItem = ref<any>(null);\nconst activeModal = ref<"
    );
  }

  // Replace button logic
  code = code.replace(
    /@click="addToCart\(item\)">\+\s*\{\{\s*tDyn\('добавить'\)\s*\}\}/g,
    `@click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? tDyn('опции') : tDyn('добавить') }}`
  );

  // Add the modal component to template
  if (!code.includes('<ClientModifiersModal')) {
    code = code.replace(
      /<\/template>/,
      `  <ClientModifiersModal 
    v-if="modifierItem" 
    :item="modifierItem" 
    :restaurantInfo="${isComponent ? 'currentRestaurantInfo' : 'restaurantInfo'}" 
    @close="modifierItem = null" 
    @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }" 
  />\n</template>`
    );
  }

  fs.writeFileSync(filePath, code);
  console.log('Restored modifiers in', filePath);
}

restoreModifiers('src/views/ClientView.vue', false);
restoreModifiers('src/components/PhoneMockupContent.vue', true);

