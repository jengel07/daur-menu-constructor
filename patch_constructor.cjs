const fs = require('fs');
const path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Image to lucide imports
code = code.replace(
  'import {',
  'import {\n  Image as ImageIcon,'
);

// 2. Add BannerManager to imports
const importsRegex = /(import PhoneMockupContent from '\.\/components\/PhoneMockupContent\.vue';)/;
code = code.replace(importsRegex, "$1\nimport BannerManager from './components/admin/BannerManager.vue';");

// 3. Update SidebarView type
const sidebarTypeRegex = /type SidebarView = 'main' \| 'orders' \| 'staff' \| 'payment' \| 'profile' \| 'filters' \| 'trash';/;
code = code.replace(sidebarTypeRegex, "type SidebarView = 'main' | 'orders' | 'staff' | 'payment' | 'profile' | 'filters' | 'trash' | 'banners';");

// 4. Add "Banners" button to main menu
const addStaffBtnRegex = /(<button class="smenu-nav-item" @click="openSidebarView\('staff'\)">[\s\S]*?<\/button>)/;
const bannersBtn = `
            <button class="smenu-nav-item" @click="openSidebarView('banners')">
              <ImageIcon :size="18" />
              <span>Баннеры</span>
            </button>`;
code = code.replace(addStaffBtnRegex, `$1${bannersBtn}`);

// 5. Add BannerManager tab
const staffTabRegex = /(<template v-else-if="sidebarView === 'staff'">[\s\S]*?<\/template>)/;
const bannersTab = `
        <!-- БАННЕРЫ С АКЦИЯМИ -->
        <template v-else-if="sidebarView === 'banners'">
          <div class="smenu-scrollable">
            <BannerManager :restaurantId="JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" />
          </div>
        </template>`;
code = code.replace(staffTabRegex, `${bannersTab}\n$1`);

fs.writeFileSync(path, code);
console.log('Constructor.vue patched');

