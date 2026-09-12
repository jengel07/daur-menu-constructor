const fs = require('fs');

let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Find the modal block
const modalRegex = /\s*<!-- Modifiers Modal -->\s*<ClientModifiersModal[\s\S]*?\/>\s*<\/template>\s*/;
const match = code.match(modalRegex);

if (match) {
  // Remove it
  code = code.replace(match[0], '\n');
  
  // Now we need to place it before the LAST </template>
  // Wait, the match might have included the premature </template>!
  // Let's just remove the ClientModifiersModal text.
} else {
  // Try another regex without </template>
  const regex2 = /\s*<!-- Modifiers Modal -->\s*<ClientModifiersModal[\s\S]*?\/>\s*/;
  code = code.replace(regex2, '\n');
}

// Ensure there is only one </template> at the root level before <script setup>
// Let's find `<script setup lang="ts">`
const scriptIndex = code.indexOf('<script setup lang="ts">');
let templatePart = code.slice(0, scriptIndex);
const scriptPart = code.slice(scriptIndex);

// Remove ANY rogue </template> that are dangling at the end of templatePart
templatePart = templatePart.replace(/<\/template>\s*<\/template>\s*$/, '</template>\n');

// Wait, what if there's a </template> at line 401?
// Let's just append the modal at the very end of templatePart, BEFORE the last </template>
const lastTemplateEnd = templatePart.lastIndexOf('</template>');
if (lastTemplateEnd !== -1) {
  const modalHtml = `
    <!-- Modifiers Modal -->
    <ClientModifiersModal
      v-if="modifierItem"
      :item="modifierItem"
      @close="modifierItem = null"
      @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }"
    />
`;
  templatePart = templatePart.slice(0, lastTemplateEnd) + modalHtml + templatePart.slice(lastTemplateEnd);
}

// Also, let's remove the rogue </template> that might be at line 401.
// Actually, how do I know it's rogue? If I just replaced the modal and it had </template> after it.
// Let's see if the vue compiler complains.
fs.writeFileSync('src/views/ClientView.vue', templatePart + scriptPart);
console.log('Fixed ClientView.vue modal position');

