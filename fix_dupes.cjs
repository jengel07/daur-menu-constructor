const fs = require('fs');

let path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

// Replace duplicate phone-body tags that are adjacent
code = code.replace(
  /<div class="phone-body"[^>]*>\s*<div class="phone-body"([^>]*)>/g,
  '<div class="phone-body"$1>'
);

fs.writeFileSync(path, code);
console.log('Fixed duplicates in PhoneMockupContent');

