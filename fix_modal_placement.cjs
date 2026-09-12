const fs = require('fs');

function fixModalPlacement(filePath, isComponent) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Remove the broken insertion
  const brokenStr = `  <ClientModifiersModal 
    v-if="modifierItem" 
    :item="modifierItem" 
    :restaurantInfo="${isComponent ? 'currentRestaurantInfo' : 'restaurantInfo'}" 
    @close="modifierItem = null" 
    @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }" 
  />\n`;
  
  code = code.replace(brokenStr, '');

  // 2. Insert it RIGHT BEFORE the end of the root div.
  // The root div is `<div class="client-wrapper"...` (or something similar).
  // Actually, wait, let's just insert it RIGHT BEFORE `<script setup lang="ts">`!
  // Because that's safely outside all DOM elements but inside the file.
  // Wait, in Vue SFC, <template> has a closing tag </template> right before <script>.
  // Let's find the last </template> in the file.
  
  const lastTemplateIndex = code.lastIndexOf('</template>');
  if (lastTemplateIndex !== -1) {
    const validModal = `
  <ClientModifiersModal 
    v-if="modifierItem" 
    :item="modifierItem" 
    :restaurantInfo="${isComponent ? 'currentRestaurantInfo' : 'restaurantInfo'}" 
    @close="modifierItem = null" 
    @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }" 
  />
`;
    code = code.substring(0, lastTemplateIndex) + validModal + code.substring(lastTemplateIndex);
  }

  fs.writeFileSync(filePath, code);
  console.log('Fixed modal placement in', filePath);
}

fixModalPlacement('src/views/ClientView.vue', false);
fixModalPlacement('src/components/PhoneMockupContent.vue', true);

