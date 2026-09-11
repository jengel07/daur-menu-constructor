const fs = require('fs');
let path = 'src/components/GeneralSettings.vue';
let code = fs.readFileSync(path, 'utf8');

const search = `    </div>
  </div>
</template>`;

const replace = `    </div>

    <!-- Ссылка на Яндекс Отзывы -->
    <div class="form-group" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
      <label>Ссылка на Яндекс Отзывы (появляется при оценке 4-5 звезд)</label>
      <input 
        type="text" 
        v-model="store.generalSettings.yandexReviewLink" 
        placeholder="Например: https://yandex.ru/maps/org/..." 
        style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #ddd; font-size: 14px;"
      />
      <p class="description" style="margin-top: 6px; font-size: 12px; color: #777;">
        Если клиент поставит 4 или 5 звезд при оформлении заказа, ему будет предложена кнопка "Оставить отзыв на Яндекс Картах".
      </p>
    </div>
  </div>
</template>`;

code = code.replace(/    <\/div>\r?\n  <\/div>\r?\n<\/template>/, replace);

fs.writeFileSync(path, code);
console.log('Patched GeneralSettings.vue');

