const fs = require('fs');

let code = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const modalStr = `
    <!-- Modifiers Modal -->
    <ClientModifiersModal
      v-if="modifierItem"
      :item="modifierItem"
      @close="modifierItem = null"
      @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }"
    />
`;

// Insert it before the last </template>
if (!code.includes('<ClientModifiersModal v-if="modifierItem"')) {
  const lastIndex = code.lastIndexOf('</template>');
  if (lastIndex !== -1) {
    code = code.slice(0, lastIndex) + modalStr + code.slice(lastIndex);
    fs.writeFileSync('src/components/PhoneMockupContent.vue', code);
    console.log('Added ClientModifiersModal to PhoneMockupContent');
  } else {
    console.log('Could not find </template>');
  }
} else {
  console.log('Already has ClientModifiersModal');
}

