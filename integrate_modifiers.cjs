const fs = require('fs');

let path = 'src/components/MenuEditor.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import ModifiersEditor')) {
  code = code.replace(
    /<script setup lang="ts">/,
    `<script setup lang="ts">
import ModifiersEditor from './ModifiersEditor.vue';
import { ref } from 'vue';`
  );
  
  if (!code.includes('const showModifiersModal')) {
    code = code.replace(
      /const isImageLoading = ref\(false\);/,
      `const isImageLoading = ref(false);
const showModifiersModal = ref(false);`
    );
  }

  // Add the button to open the modal
  const buttonHtml = `
          <div class="form-group">
            <button type="button" class="btn-secondary" style="width: 100%; border-style: dashed; padding: 12px;" @click="showModifiersModal = true">
              ⚙️ Настроить опции и добавки ({{ editingItem.modifiers ? editingItem.modifiers.length : 0 }} групп)
            </button>
          </div>
  `;
  
  // Insert before tags or price
  code = code.replace(
    /<div class="form-group">\s*<label>Диетические теги<\/label>/,
    buttonHtml + '\n          <div class="form-group">\n            <label>Диетические теги</label>'
  );

  // Add the modal component to the template
  code = code.replace(
    /<\/template>/,
    `  <ModifiersEditor 
      v-if="showModifiersModal" 
      :modifiers="editingItem.modifiers || []" 
      @close="showModifiersModal = false"
      @save="mods => { editingItem.modifiers = mods; showModifiersModal = false; }" 
    />
  </template>`
  );

  fs.writeFileSync(path, code);
  console.log('Integrated ModifiersEditor');
} else {
  console.log('Already integrated');
}

