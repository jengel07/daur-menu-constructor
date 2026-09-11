const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Add orderFeedbackText ref
code = code.replace(
  /const orderFeedback = ref<string\[\]>\(\[\]\);/,
  `const orderFeedback = ref<string[]>([]);\n  const orderFeedbackText = ref<string>('');\n  const feedbackSubmitted = ref<boolean>(false);`
);

// 2. Add submitFeedback function
const submitFeedbackCode = `
  const submitFeedback = async () => {
    if (!activeOrderId.value || !orderRating.value) return;
    try {
      const fbStr = orderFeedback.value.length > 0 ? \`[\${orderFeedback.value.join(', ')}] \` : '';
      const fullText = fbStr + orderFeedbackText.value;
      
      const res = await fetch(\`\${API_URL}/api/orders/\${activeOrderId.value}/feedback\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: orderRating.value, feedback: fullText })
      });
      if (res.ok) {
        feedbackSubmitted.value = true;
      }
    } catch (e) {
      console.error(e);
    }
  };
`;
code = code.replace(
  /const toggleFeedback = \(id: string\) => \{/,
  `${submitFeedbackCode}\n  const toggleFeedback = (id: string) => {`
);

// 3. Update feedback-widget HTML
const widgetSearch = /<div v-if="orderRating > 0" class="feedback-details-section">[\s\S]*?<div v-if="orderRating >= 4" class="yandex-review-prompt">[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/;

const newWidgetHtml = `
                    <div v-if="orderRating > 0 && !feedbackSubmitted" class="feedback-details-section">
                      <div class="feedback-subtitle">{{ tDyn('Что именно вам особенно понравилось или не понравилось?') }}</div>
                      <div class="feedback-options-scroll">
                        <div 
                          v-for="opt in feedbackOptions" :key="opt.id"
                          class="feedback-option-card"
                          :class="{ 'selected': orderFeedback.includes(opt.id) }"
                          @click.prevent="toggleFeedback(opt.id)"
                        >
                          <component :is="opt.icon" class="feedback-opt-icon" />
                          <span class="feedback-opt-label">{{ tDyn(opt.label) }}</span>
                        </div>
                      </div>
                      
                      <textarea v-model="orderFeedbackText" class="feedback-textarea" :placeholder="tDyn('Расскажите подробнее...')"></textarea>
                      <button class="feedback-submit-btn" @click="submitFeedback">{{ tDyn('Отправить отзыв') }}</button>
                      
                      <div v-if="orderRating >= 4" class="yandex-review-prompt">
                        <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
                          Оставить отзыв на Яндекс Картах
                        </a>
                      </div>
                    </div>
                    <div v-if="feedbackSubmitted" class="feedback-success-msg">
                      {{ tDyn('Спасибо за ваш отзыв!') }}
                    </div>
`;

code = code.replace(widgetSearch, newWidgetHtml.trim());

// 4. Add CSS
const cssReplace = `
.feedback-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  font-size: 12px;
  min-height: 60px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}
.feedback-submit-btn {
  width: 100%;
  background: #111;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
}
.feedback-success-msg {
  color: #10b981;
  font-weight: bold;
  font-size: 14px;
  margin-top: 12px;
}
</style>
`;
code = code.replace(/<\/style>/, cssReplace);

fs.writeFileSync(path, code);
console.log('Added text feedback support');

