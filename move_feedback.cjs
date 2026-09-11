const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const feedbackRegex = /([ \t]*)<div class="feedback-widget">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const match = code.match(feedbackRegex);

if (match) {
  let indent = match[1];
  let widgetHtml = match[0];

  // Remove the widget from step 1
  code = code.replace(widgetHtml, '');

  // Add the Yandex button into the widget
  const yandexBtnHtml = `
                    <div v-if="orderRating >= 4" class="yandex-review-prompt">
                      <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
                        Оставить отзыв на Яндекс Картах
                      </a>
                    </div>`;
  
  // Insert Yandex button before the last 3 </div> tags of the widget
  // The widget structure is:
  // <div class="feedback-widget"> ...
  //   <div v-if="orderRating > 0" class="feedback-details-section"> ...
  //     <div class="feedback-options-scroll"> ... </div>
  //   </div>
  // </div>
  // So we insert it after the options-scroll.
  
  const insertTarget = /<\/div>\s*<\/div>\s*<\/div>$/;
  widgetHtml = widgetHtml.replace(insertTarget, `  </div>${yandexBtnHtml}\n                    </div>\n                  </div>`);

  // Now, inject the updated widget into checkoutStep === 2.
  // Before the <div class="review-actions-row">
  const step2Search = /([ \t]*)<div class="review-actions-row">/;
  code = code.replace(step2Search, `\n$1${widgetHtml.trim()}\n\n$1<div class="review-actions-row">`);

  fs.writeFileSync(path, code);
  console.log('Moved feedback widget to step 2 and added Yandex button');
} else {
  console.log('Could not find feedback-widget');
}

