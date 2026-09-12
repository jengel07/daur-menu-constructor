const fs = require('fs');
let code = fs.readFileSync('src/components/ModifiersEditor.vue', 'utf8');

code = code.replace(
`watch(() => props.modifiers, (val) => {
  if (val) {
    localModifiers.value = JSON.parse(JSON.stringify(val));
  } else {
    localModifiers.value = [];
  }
}, { immediate: true });`,
`import { onMounted } from 'vue';
onMounted(() => {
  if (props.modifiers) {
    localModifiers.value = JSON.parse(JSON.stringify(props.modifiers));
  } else {
    localModifiers.value = [];
  }
});`
);

// We need to make sure we don't duplicate `import { onMounted } from 'vue'` if `import { ref, watch } from 'vue'` is there.
// Actually, I can just replace `watch` with `onMounted` in the imports.
code = code.replace(`import { ref, watch } from 'vue';`, `import { ref } from 'vue';`);

fs.writeFileSync('src/components/ModifiersEditor.vue', code);
console.log('Fixed ModifiersEditor reactivity bug');

