const fs = require('fs');
let content = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

const tDynCode = `
const tDyn = (ruText: string) => {
  if (!ruText) return '';
  const lang = selectedLanguage.value;
  if (lang === 'ru' || lang === 'Русский') return ruText;
  if (translationCache[lang]?.[ruText]) return translationCache[lang][ruText];
  
  performTranslation(ruText, lang);
  return ruText;
};
`;

content = content.replace('const performTranslation = async (text: string, lang: string) => {', tDynCode + '\nconst performTranslation = async (text: string, lang: string) => {');

const oldCatName = `const getLocalizedCategoryName = (name: string) => {
  const lang = selectedLanguage.value;
  return categoryTranslations[name]?.[lang] || name;
};`;
const newCatName = `const getLocalizedCategoryName = (name: string) => {
  const lang = selectedLanguage.value;
  if (lang === 'Русский' || !name) return name;
  if (categoryTranslations[name]?.[lang]) return categoryTranslations[name][lang];
  if (translationCache[lang]?.[name]) return translationCache[lang][name];
  
  performTranslation(name, lang);
  return name;
};`;
content = content.replace(oldCatName, newCatName);

const oldItemName = `const getLocalizedItemName = (name: string) => {
  const lang = selectedLanguage.value;
  return dishTranslations[name]?.[lang]?.name || name;
};`;
const newItemName = `const getLocalizedItemName = (name: string) => {
  const lang = selectedLanguage.value;
  if (lang === 'Русский' || !name) return name;
  if (dishTranslations[name]?.[lang]?.name) return dishTranslations[name][lang].name;
  if (translationCache[lang]?.[name]) return translationCache[lang][name];
  
  performTranslation(name, lang);
  return name;
};`;
content = content.replace(oldItemName, newItemName);

fs.writeFileSync('src/components/PhoneMockupContent.vue', content);
console.log('Added tDyn and fixed getLocalized functions');

