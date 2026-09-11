const fs = require('fs');
let path = 'src/views/ClientView.vue';
let code = fs.readFileSync(path, 'utf8');

// 1. Imports
if (code.includes("import { ShoppingCart } from 'lucide-vue-next';")) {
  code = code.replace(
    "import { ShoppingCart } from 'lucide-vue-next';",
    "import { ShoppingCart, Star, ConciergeBell, ClipboardCheck, Armchair } from 'lucide-vue-next';"
  );
}

// 2. Script state
const stateInjection = `const checkoutStep = ref<1 | 2>(1);

const orderRating = ref(0);
const orderFeedback = ref<string[]>([]);
const feedbackOptions = [
  { id: 'kitchen', label: 'Кухня', icon: ConciergeBell },
  { id: 'service', label: 'Обслуживание', icon: ClipboardCheck },
  { id: 'interior', label: 'Интерьер', icon: Armchair }
];
const toggleFeedback = (id: string) => {
  if (orderFeedback.value.includes(id)) {
    orderFeedback.value = orderFeedback.value.filter(x => x !== id);
  } else {
    orderFeedback.value.push(id);
  }
};`;

code = code.replace("const checkoutStep = ref<1 | 2>(1);", stateInjection);

// 3. Update closeModal to reset feedback
const closeModalSearch = `const closeModal = () => {
    showCheckoutModal.value = false;
    checkoutStep.value = 1;`;
const closeModalReplace = `const closeModal = () => {
    showCheckoutModal.value = false;
    checkoutStep.value = 1;
    orderRating.value = 0;
    orderFeedback.value = [];`;
code = code.replace(closeModalSearch, closeModalReplace);

// 4. Update newOrderData to include rating and feedback
const orderDataSearch = `      comment: customerForm.value.comment,
      scheduledTime: customerForm.value.scheduledTime
    };`;
const orderDataReplace = `      comment: customerForm.value.comment,
      scheduledTime: customerForm.value.scheduledTime,
      rating: orderRating.value,
      feedback: orderFeedback.value
    };`;
code = code.replace(orderDataSearch, orderDataReplace);

// 5. Template injection
const templateSearch = `                  <div class="checkout-summary">`;
const templateReplace = `                  <div class="feedback-widget">
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
code = code.replace(templateSearch, templateReplace);

// 6. CSS injection
const cssSearch = `</style>`;
const cssReplace = `.feedback-widget {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 10px;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.feedback-title {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
}
.stars-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 4px;
}
.star-icon {
  width: 32px;
  height: 32px;
  color: #e2e8f0;
  fill: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}
.star-icon.filled {
  color: #facc15;
  fill: #facc15;
}
.feedback-details-section {
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}
.feedback-subtitle {
  font-size: 12px;
  color: #555;
  margin-bottom: 12px;
  font-weight: 500;
}
.feedback-options-scroll {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.feedback-options-scroll::-webkit-scrollbar {
  display: none;
}
.feedback-option-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 75px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}
.feedback-option-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}
.feedback-option-card.selected .feedback-opt-icon {
  color: #1d4ed8;
}
.feedback-opt-icon {
  width: 24px;
  height: 24px;
  color: #475569;
}
.feedback-opt-label {
  font-size: 10px;
  font-weight: 600;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>`;
code = code.replace(cssSearch, cssReplace);

fs.writeFileSync(path, code);
console.log('ClientView.vue patched with feedback widget');

