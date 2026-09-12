const fs = require('fs');
let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

if (!code.includes("import ClientModifiersModal from '../components/ClientModifiersModal.vue';")) {
  code = code.replace(
    "import { ref, computed, onMounted } from 'vue';",
    "import { ref, computed, onMounted } from 'vue';\nimport ClientModifiersModal from '../components/ClientModifiersModal.vue';"
  );
  fs.writeFileSync('src/views/ClientView.vue', code);
  console.log('Added ClientModifiersModal import to ClientView');
} else {
  console.log('Already imported');
}

