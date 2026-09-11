const fs = require('fs');
const path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Update activeTab ref
code = code.replace(
  "const activeTab = ref<'navigation' | 'colors' | 'branding' | 'general' | 'qrcode' | 'orders'>('navigation');",
  "const activeTab = ref<'navigation' | 'colors' | 'branding' | 'banners' | 'general' | 'qrcode' | 'orders'>('navigation');"
);

// 2. Update the v-for array
code = code.replace(
  "v-for=\"tab in ['navigation', 'colors', 'branding', 'general', 'qrcode', 'orders']\"",
  "v-for=\"tab in ['navigation', 'colors', 'branding', 'banners', 'general', 'qrcode', 'orders']\""
);

// 3. Add Sparkles icon replacement
code = code.replace(
  "<Sparkles v-else-if=\"tab === 'branding'\" :size=\"18\" stroke-width=\"2\" />",
  "<Sparkles v-else-if=\"tab === 'branding'\" :size=\"18\" stroke-width=\"2\" />\n                <ImageIcon v-else-if=\"tab === 'banners'\" :size=\"18\" stroke-width=\"2\" />"
);

// 4. Add the label translation
code = code.replace(
  "tab === 'branding' ? 'Брендинг и лого' : tab === 'general'",
  "tab === 'branding' ? 'Брендинг и лого' : tab === 'banners' ? 'Баннеры' : tab === 'general'"
);

// Fallback if encoding issues happen with Russian text in code
if (code.includes("tab === 'branding' ? '")) {
  // Let's use a regex to insert banners label right after branding label
  code = code.replace(
    /(tab === 'branding' \? '[^']+' : )/,
    "$1tab === 'banners' ? 'Баннеры' : "
  );
}

// 5. Add BannerManager to editor-content
code = code.replace(
  /<BrandingEditor v-else-if="activeTab === 'branding'"[^>]+><\/BrandingEditor>|<BrandingEditor v-else-if="activeTab === 'branding'"[^>]+\/>/g,
  match => `${match}\n          <BannerManager v-else-if="activeTab === 'banners'" :restaurantId="(menuStore.restaurantInfo as any).id || (menuStore.restaurantInfo as any).restaurantId || JSON.parse(localStorage.getItem('currentUser') || '{}').restaurantId" />`
);


fs.writeFileSync(path, code);
console.log('Main menu UI patched');

