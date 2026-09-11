const fs = require('fs');

let path = 'src/components/PhoneMockupContent.vue';
let code = fs.readFileSync(path, 'utf8');

// Find the second phone-header and phone-body
const firstBodyStart = code.indexOf('<div class="phone-body"');
const secondHeaderStart = code.indexOf('<div class="phone-header"', firstBodyStart + 1);

if (secondHeaderStart !== -1) {
  const secondBodyStart = code.indexOf('<div class="phone-body"', secondHeaderStart);
  
  if (secondBodyStart !== -1) {
    const headerBlock = code.substring(secondHeaderStart, secondBodyStart).trim();
    const bodyTagEnd = code.indexOf('>', secondBodyStart) + 1;
    
    code = code.substring(0, secondHeaderStart) + code.substring(secondBodyStart, bodyTagEnd) + '\n            ' + headerBlock + '\n' + code.substring(bodyTagEnd);
    
    fs.writeFileSync(path, code);
    console.log('Fixed second occurrence in PhoneMockupContent.vue');
  }
}

