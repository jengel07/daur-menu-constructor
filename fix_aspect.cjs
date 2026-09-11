const fs = require('fs');
const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\.banners-carousel\s*\{[^}]+\}/,
  `.banners-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* margin removed */
  /* border-radius removed */
}`
);

code = code.replace(
  /\.banner-slide\s*\{[^}]+\}/,
  `.banner-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}`
);

code = code.replace(
  /\.banner-slide img\s*\{[^}]+\}/,
  `.banner-slide img {
  width: 100%;
  height: auto;
  display: block;
}`
);

fs.writeFileSync(path, code);
console.log('Fixed aspect ratio and margin');

