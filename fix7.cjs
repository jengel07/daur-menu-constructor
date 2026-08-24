const fs = require('fs');

const files = ['src/views/ClientView.vue', 'src/components/PhoneMockupContent.vue'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to replace the hardcoded initial state with one that loads from localStorage
  const initCacheRegex = /const translationCache = reactive<Record<string, Record<string, string>>>\(\{\s*'en':\s*\{\},\s*'de':\s*\{\},\s*'ab':\s*\{\},\s*'ru':\s*\{\}(?:,\s*'English':\s*\{\},\s*'Deutsch':\s*\{\},\s*'Аҧсшәа':\s*\{\},\s*'Русский':\s*\{\})?\s*\}\);/;
  
  const initCacheClientView = `const savedCache = localStorage.getItem('translationCache_client');
  const translationCache = reactive<Record<string, Record<string, string>>>(
    savedCache ? JSON.parse(savedCache) : {
      'en': {},
      'de': {},
      'ab': {},
      'ru': {}
    }
  );`;

  const initCachePhoneMockup = `const savedCache = localStorage.getItem('translationCache_mockup');
  const translationCache = reactive<Record<string, Record<string, string>>>(
    savedCache ? JSON.parse(savedCache) : {
      'English': {},
      'Deutsch': {},
      'Аҧсшәа': {},
      'Русский': {}
    }
  );`;

  if (file.includes('ClientView')) {
    content = content.replace(/const translationCache = reactive<Record<string, Record<string, string>>>\(\{[\s\S]*?\}\);/, initCacheClientView);
    // Also save to localStorage on success
    content = content.replace(
      'translationCache[targetLangCode][text] = translated;',
      'translationCache[targetLangCode][text] = translated;\n      localStorage.setItem(\'translationCache_client\', JSON.stringify(translationCache));'
    );
  } else {
    content = content.replace(/const translationCache = reactive<Record<string, Record<string, string>>>\(\{[\s\S]*?\}\);/, initCachePhoneMockup);
    content = content.replace(
      'translationCache[lang][text] = translated;',
      'translationCache[lang][text] = translated;\n    localStorage.setItem(\'translationCache_mockup\', JSON.stringify(translationCache));'
    );
  }

  fs.writeFileSync(file, content);
});
console.log('Added localStorage caching');

