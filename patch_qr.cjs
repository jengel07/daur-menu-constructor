const fs = require('fs');
let content = fs.readFileSync('src/components/QrCodeEditor.vue', 'utf8');

const regex = /if \(realRestaurantId && \(!currentUrl \|\| currentUrl\.includes\('preview=true'\) \|\| currentUrl === 'https:\/\/example\.com' \|\| currentUrl\.includes\('undefined'\) \|\| currentUrl\.includes\('localhost'\)\)\) \{/;

const newCheck = `
  const isOldLocalIp = currentUrl.includes('/client?id=') && !currentUrl.startsWith(window.location.origin);
  if (realRestaurantId && (!currentUrl || currentUrl.includes('preview=true') || currentUrl === 'https://example.com' || currentUrl.includes('undefined') || currentUrl.includes('localhost') || isOldLocalIp)) {`;

content = content.replace(regex, newCheck);

fs.writeFileSync('src/components/QrCodeEditor.vue', content);
console.log('Fixed QrCodeEditor.vue');

