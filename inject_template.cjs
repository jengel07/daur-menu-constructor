const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

const templateSearch = `                <div class="checkout-summary">`;
const templateReplace = `                <div class="feedback-widget">
                  <div class="feedback-title">{{ tDyn('Вам все понравилось?') }}</div>
                  <div class="stars-container">
                    <Star 
                      v-for="i in 5" :key="i"
                      :class="['star-icon', { 'filled': i <= orderRating }]"
                      @click="orderRating = i"
                    />
                  </div>
                  
                  <div v-if="orderRating > 0" class="feedback-details-section">
                    <div class="feedback-subtitle">{{ tDyn('Что вам особенно понравилось?') }}</div>
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
                  </div>
                </div>

                <div class="checkout-summary">`;

if (code.includes(templateSearch)) {
  code = code.replace(templateSearch, templateReplace);
  fs.writeFileSync(path, code);
  console.log('Template injected');
} else {
  console.log('Template search string not found');
}

