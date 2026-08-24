async function test() {
  const text = 'Оформить заказ';
  const targetCode = 'en';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${targetCode}`);
    const data = await res.json();
    console.log('Result:', data.responseData.translatedText);
  } catch(e) { console.error('Error:', e); }
}
test();

