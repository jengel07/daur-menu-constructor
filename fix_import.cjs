const fs = require('fs');
let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

code = code.replace(
  "import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';",
  "import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';"
);

fs.writeFileSync('src/views/ClientView.vue', code);
console.log('Added watch to imports');
