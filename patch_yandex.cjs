const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const search = `                      </div>
                    </div>
                  </div>

                  <div class="checkout-summary">`;

const replace = `                      </div>
                      
                      <div v-if="orderRating >= 4 && store.generalSettings?.yandexReviewLink" class="yandex-review-prompt">
                        <a :href="store.generalSettings.yandexReviewLink" target="_blank" class="yandex-review-btn">
                          Оставить отзыв на Яндекс Картах
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="checkout-summary">`;

code = code.replace(search, replace);

const cssSearch = `</style>`;
const cssReplace = `.yandex-review-prompt {
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}
.yandex-review-btn {
  display: inline-block;
  background: #fc3f1d;
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}
</style>`;

code = code.replace(cssSearch, cssReplace);

fs.writeFileSync(path, code);
console.log('Added Yandex review button to ClientView');

