const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the old condition
  const oldCondition = /if \(!API_URL \|\| API_URL\.includes\('192\.168\.'\) \|\| API_URL\.includes\('localhost'\) \|\| API_URL\.includes\('127\.0\.0\.1'\)\) \{/;
  const newCondition = `if (!API_URL || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {`;
  
  if (content.match(oldCondition)) {
    content = content.replace(oldCondition, newCondition);
  }
  
  const oldCondition2 = /if \(!apiUrl \|\| apiUrl\.includes\('192\.168\.'\) \|\| apiUrl\.includes\('localhost'\) \|\| apiUrl\.includes\('127\.0\.0\.1'\)\) \{/;
  const newCondition2 = `if (!apiUrl || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {`;
  
  if (content.match(oldCondition2)) {
    content = content.replace(oldCondition2, newCondition2);
  }
  
  fs.writeFileSync(file, content);
}

patchFile('src/Constructor.vue');
patchFile('src/components/MenuEditor.vue');
console.log('Patched');

