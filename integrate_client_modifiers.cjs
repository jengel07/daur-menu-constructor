const fs = require('fs');

let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import ClientModifiersModal')) {
  // Add import
  code = code.replace(
    /import CheckoutModal from '\.\.\/components\/CheckoutModal\.vue';/,
    `import CheckoutModal from '../components/CheckoutModal.vue';\nimport ClientModifiersModal from '../components/ClientModifiersModal.vue';`
  );

  // Add ref
  code = code.replace(
    /const cartItems = ref<any\[\]>\(\[\]\);/,
    `const cartItems = ref<any[]>([]);\nconst modifierItem = ref<any>(null);`
  );

  // Update addToCart function in the template!
  // Find <button ... @click="addToCart(item)">
  code = code.replace(
    /@click="addToCart\(item\)"/g,
    `@click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)"`
  );
  
  // Also for variants, but variants don't use the standard addToCart button. They use `openVariantModal`.
  // Wait, if an item has variants AND modifiers... Oh boy.
  // The user mainly wants it for "Классический кофе".
  // So they will just click the `addToCart` button.
  // Let's modify `openVariantModal` to just handle modifiers if no variants exist? No, variants are triggered if `item.priceGlass || item.priceBottle`.
  // If we just hook into `addToCart(item)` it's enough for now.

  // Add the modal to the template
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
    /<\/div>\s*<\/div>\s*<\/template>/,
    `      ${modalHtml}\n    </div>\n  </div>\n</template>`
  );

  fs.writeFileSync(path, code);
  console.log('Integrated ClientModifiersModal');
} else {
  console.log('Already integrated');
}

