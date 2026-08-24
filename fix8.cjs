const fs = require('fs');

const files = ['src/views/ClientView.vue', 'src/components/PhoneMockupContent.vue'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Change client=gtx to client=dict-chrome-ex
  content = content.replace(/client=gtx/g, 'client=dict-chrome-ex');

  fs.writeFileSync(file, content);
});
console.log('Changed API client to dict-chrome-ex');

