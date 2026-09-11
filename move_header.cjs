const fs = require('fs');

function moveHeader(path, bodySelector) {
  let code = fs.readFileSync(path, 'utf8');
  
  const headerStart = code.indexOf('<div class="phone-header"');
  if (headerStart === -1) return;
  
  const bodyStart = code.indexOf(bodySelector, headerStart);
  if (bodyStart === -1) return;
  
  // Extract header
  const headerBlock = code.substring(headerStart, bodyStart).trim();
  
  // Find where the header block actually ends (it should end with </div> that closes phone-header)
  // But wait, my extraction takes everything from `<div class="phone-header"` to `<div class="phone-body..."`.
  // This is safe because there is nothing else between them!
  
  const bodyTagEnd = code.indexOf('>', bodyStart) + 1;
  
  // Remove header from its original place
  code = code.substring(0, headerStart) + code.substring(bodyStart, bodyTagEnd) + '\n          ' + headerBlock + '\n' + code.substring(bodyTagEnd);
  
  fs.writeFileSync(path, code);
  console.log('Moved header in ' + path);
}

moveHeader('src/views/ClientView.vue', '<div class="phone-body">');
moveHeader('src/components/PhoneMockupContent.vue', '<div class="phone-body"');

// Fix CSS: phone-body needs padding-top: 0 instead of 10px if we want the header to be flush with the top!
function fixCss(path) {
  let code = fs.readFileSync(path, 'utf8');
  // .phone-body { flex: 1; padding: 10px; overflow-y: auto; padding-bottom: 95px; }
  code = code.replace(
    /\.phone-body\s*\{[^\}]*\}/,
    `.phone-body { flex: 1; padding: 0 10px 95px 10px; overflow-y: auto; }`
  );
  
  // .phone-header { height: 110px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; }
  // We need to add negative margin to make it flush because phone-body has 10px padding on the sides!
  code = code.replace(
    /\.phone-header\s*\{[^\}]*\}/,
    `.phone-header { height: 110px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; margin: 0 -10px 10px -10px; }`
  );
  
  fs.writeFileSync(path, code);
  console.log('Fixed CSS in ' + path);
}

fixCss('src/views/ClientView.vue');
fixCss('src/components/PhoneMockupContent.vue');

