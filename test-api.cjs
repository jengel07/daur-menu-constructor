const fetch = require('node-fetch');
async function test() {
  const text = 'Оформить заказ';
  const targetCode = 'en';
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    console.log('Result:', data[0].map(x => x[0]).join(''));
  } catch(e) { console.error('Error:', e); }
}
test();
