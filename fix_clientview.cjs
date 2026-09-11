const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove setTimeout auto-close
code = code.replace(
  /setTimeout\(\(\) => \{\s*activeOrderId\.value = null;\s*activeOrderNumber\.value = null;\s*localStorage\.removeItem\('active_order_id'\);\s*\}, 30000\);/g,
  `// Auto-close removed so user can leave feedback`
);

// 2. Fix the success state to keep Yandex review button
// Right now it's:
/*
                    <div v-if="orderRating > 0 && !feedbackSubmitted" class="feedback-details-section">
                       ...
                      <div v-if="orderRating >= 4" class="yandex-review-prompt">
                        <a :href="..." target="_blank" class="yandex-review-btn">
                          Оставить отзыв на Яндекс Картах
                        </a>
                      </div>
                    </div>
                    <div v-if="feedbackSubmitted" class="feedback-success-msg">
                      {{ tDyn('Спасибо за ваш отзыв!') }}
                    </div>
*/
// We will change it so the Yandex button is OUTSIDE the `!feedbackSubmitted` block, or we just put the Yandex button inside the success block too.

const yandexBtnHtml = `
                      <div v-if="orderRating >= 4" class="yandex-review-prompt" style="margin-top: 12px;">
                        <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
                          Оставить отзыв на Яндекс Картах
                        </a>
                      </div>
`;

code = code.replace(
  /<div v-if="feedbackSubmitted" class="feedback-success-msg">\s*\{\{ tDyn\('Спасибо за ваш отзыв!'\) \}\}\s*<\/div>/,
  `<div v-if="feedbackSubmitted" class="feedback-success-msg">
                      {{ tDyn('Спасибо за ваш отзыв!') }}
                      ${yandexBtnHtml}
                    </div>`
);

fs.writeFileSync(path, code);
console.log('Patched ClientView timeout and success state');

