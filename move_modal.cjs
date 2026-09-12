const fs = require('fs');
let code = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

// The modal string to match:
const modalStr = `  <ModifiersEditor 
        v-if="showModifiersModal" 
        :modifiers="editingItem.modifiers || []" 
        @close="showModifiersModal = false"
        @save="mods => { editingItem.modifiers = mods; showModifiersModal = false; }" 
      />`;

if (code.includes(modalStr)) {
  code = code.replace(modalStr, '');
  
  // Find the LAST </template>
  const lastIndex = code.lastIndexOf('</template>');
  if (lastIndex !== -1) {
    code = code.slice(0, lastIndex) + modalStr + '\n' + code.slice(lastIndex);
    fs.writeFileSync('src/components/MenuEditor.vue', code);
    console.log('Moved modal correctly');
  } else {
    console.log('Could not find </template>');
  }
} else {
  console.log('Modal string not found!');
}

