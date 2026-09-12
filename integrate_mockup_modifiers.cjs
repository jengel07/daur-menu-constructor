const fs = require('fs');

let path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import ClientModifiersModal')) {
  // Add import
  code = code.replace(
    /import PromoBanners from '\.\/client\/PromoBanners\.vue';/,
    `import PromoBanners from './client/PromoBanners.vue';\nimport ClientModifiersModal from './ClientModifiersModal.vue';`
  );

  // Add ref
  code = code.replace(
    /const emit = defineEmits/,
    `const modifierItem = ref<any>(null);\nconst emit = defineEmits`
  );

  // Update addToCart function in the template
  code = code.replace(
    /@click="addToCart\(item\)"/g,
    `@click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)"`
  );

  // Add the modal to the template (need to add it in TWO places because PhoneMockupContent has two blocks for fullscreen/normal)
  const modalHtml = `
      <!-- Modifiers Modal -->
      <ClientModifiersModal
        v-if="modifierItem"
        :item="modifierItem"
        @close="modifierItem = null"
        @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }"
      />
  `;

  code = code.replace(
    /<!-- Bottom Cart Bar -->/g,
    `      ${modalHtml}\n\n      <!-- Bottom Cart Bar -->`
  );

  fs.writeFileSync(path, code);
  console.log('Integrated ClientModifiersModal into PhoneMockupContent');
} else {
  console.log('Already integrated');
}

