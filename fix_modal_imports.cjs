const fs = require('fs');

function fixImports(filePath, isComponent = false) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Insert the import right after <script setup lang="ts">
  const scriptTag = '<script setup lang="ts">';
  const importStatement = isComponent 
    ? "import ClientModifiersModal from './ClientModifiersModal.vue';" 
    : "import ClientModifiersModal from '../components/ClientModifiersModal.vue';";

  if (!code.includes('ClientModifiersModal from')) {
    code = code.replace(
      scriptTag,
      `${scriptTag}\n${importStatement}`
    );
    fs.writeFileSync(filePath, code);
    console.log("Fixed import in", filePath);
  } else {
    console.log("Import already exists in", filePath);
  }
}

fixImports('src/views/ClientView.vue', false);
fixImports('src/components/PhoneMockupContent.vue', true);

