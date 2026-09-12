const fs = require('fs');
let code = fs.readFileSync('src/components/ClientModifiersModal.vue', 'utf8');

code = code.replace(/<button /g, '<button type="button" ');
code = code.replace(/type="button" type="button"/g, 'type="button"');

if (!code.includes('z-index: 10000;')) {
  code = code.replace('.modifiers-modal {', '.modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.5);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 10000;\n}\n.modifiers-modal {');
}

fs.writeFileSync('src/components/ClientModifiersModal.vue', code);
console.log('Fixed ClientModifiersModal');

