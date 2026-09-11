const fs = require('fs');

// 1. PhoneMockupContent.vue
let path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import PromoBanners')) {
  code = code.replace(
    /import QrcodeVue from 'qrcode\.vue';/,
    `import QrcodeVue from 'qrcode.vue';\nimport PromoBanners from './client/PromoBanners.vue';`
  );
  fs.writeFileSync(path, code);
  console.log('Import added to PhoneMockupContent.vue');
}

// 2. ClientView.vue
path = 'src/views/ClientView.vue';
code = fs.readFileSync(path, 'utf8');

if (!code.includes('import PromoBanners')) {
  code = code.replace(
    /import \{ useMenuStore \} from '\.\.\/store\/menuStore';/,
    `import { useMenuStore } from '../store/menuStore';\nimport PromoBanners from '../components/client/PromoBanners.vue';`
  );
  fs.writeFileSync(path, code);
  console.log('Import added to ClientView.vue');
}

