const fs = require('fs');
const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /<div v-if="banners\.length > 0" class="promo-banners-container">/,
  `<div v-if="banners.length > 0" class="promo-banners-container">`
);

code = code.replace(
  /<\/div>\s*<\/div>\s*<\/template>/,
  `  </div>
    </div>
  </div>
  <div v-else-if="restaurantId" style="background: red; color: white; padding: 20px; text-align: center; margin: 10px; border-radius: 8px;">
    DEBUG: Banners array is empty (0). ID: {{ restaurantId }}
  </div>
  <div v-else style="background: blue; color: white; padding: 20px; text-align: center; margin: 10px; border-radius: 8px;">
    DEBUG: No restaurant ID provided!
  </div>
</template>`
);

fs.writeFileSync(path, code);
console.log('Added debug UI to PromoBanners.vue');

