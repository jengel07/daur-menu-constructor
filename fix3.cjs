const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const tFunction = `const t = (key: string) => {
  const lang = selectedLanguage.value;
  return translations[lang]?.[key] || translations['Русский'][key] || key;
};`;

const addition = `

const translationCache = reactive<Record<string, Record<string, string>>>({
  'English': {},
  'Deutsch': {},
  'Аҧсшәа': {},
  'Русский': {}
});

const translateQueue = new Set<string>();

const performTranslation = async (text: string, lang: string) => {
  if (!text || lang === 'Русский') return;
  if (translationCache[lang]?.[text]) return;

  const cacheKey = \`\${lang}:\${text}\`;
  if (translateQueue.has(cacheKey)) return;
  translateQueue.add(cacheKey);

  const langCodeMap: Record<string, string> = {
    'English': 'en',
    'Deutsch': 'de',
    'Аҧсшәа': 'ab'
  };
  const targetCode = langCodeMap[lang];
  if (!targetCode) return;

  try {
    const res = await fetch(\`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=\${targetCode}&dt=t&q=\${encodeURIComponent(text)}\`);
    const data = await res.json();
    const translated = data[0].map((x: any) => x[0]).join('');

    if (!translationCache[lang]) translationCache[lang] = {};
    translationCache[lang][text] = translated;
  } catch (error) {
    console.error('Translation error:', error);
  } finally {
    translateQueue.delete(cacheKey);
  }
};`;

if (content.includes('const t = (key: string) => {')) {
  // Regex to match the t function exactly since Windows newlines are messy
  content = content.replace(/const t = \(key: string\) => \{[\s\S]*?\};/, match => match + addition);
  fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
  console.log('Added translation logic back');
}

