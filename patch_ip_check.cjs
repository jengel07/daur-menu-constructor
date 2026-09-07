const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the old condition
  const oldCondition = /if \(!API_URL \|\| API_URL\.includes\('192\.168\.'\) \|\| API_URL\.includes\('localhost'\) \|\| API_URL\.includes\('127\.0\.0\.1'\)\) \{/;
  const newCondition = `if (!API_URL || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {`;
  
  if (content.match(oldCondition)) {
    content = content.replace(oldCondition, newCondition);
    
    // Also, we need to fix BASE_URL inside api.ts which uses the same logic
    // but the variable name is BASE_URL instead of API_URL
  }
  
  const oldConditionBaseUrl = /if \(!BASE_URL \|\| BASE_URL\.includes\('192\.168\.'\) \|\| BASE_URL\.includes\('localhost'\) \|\| BASE_URL\.includes\('127\.0\.0\.1'\)\) \{/;
  const newConditionBaseUrl = `if (!BASE_URL || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {`;
  
  if (content.match(oldConditionBaseUrl)) {
    content = content.replace(oldConditionBaseUrl, newConditionBaseUrl);
  }
  
  fs.writeFileSync(file, content);
}

patchFile('src/api.ts');
patchFile('src/views/ClientView.vue');
console.log('Patched');

