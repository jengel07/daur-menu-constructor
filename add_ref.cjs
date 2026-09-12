const fs = require('fs');

let code = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

if (!code.includes('const modifierItem = ref')) {
  code = code.replace(
    /const selectedVariantItem = ref<any>\(null\);/g,
    "const selectedVariantItem = ref<any>(null);\nconst modifierItem = ref<any>(null);"
  );
  fs.writeFileSync('src/components/PhoneMockupContent.vue', code);
  console.log('Added modifierItem ref');
} else {
  console.log('modifierItem already exists');
}

