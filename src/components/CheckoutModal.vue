<!-- src/components/CheckoutModal.vue -->
<template>
  <div class="checkout-modal-overlay" @click.self="$emit('close')">
    <div class="checkout-modal">
      
      <!-- ШАГ 1: Форма ввода данных -->
      <template v-if="step === 1">
        <div class="checkout-header">
          <h3>Оформление заказа</h3>
          <button class="close-modal-btn" @click="$emit('close')">✕</button>
        </div>
        
        <form @submit.prevent="$emit('next-step')" class="checkout-form">
          <div class="form-group">
            <label>Тип заказа</label>
            <select v-model="form.orderType">
              <option value="dine_in">🍽️ В заведении (Столик)</option>
              <option value="takeaway">🏃 С собой (Самовывоз)</option>
              <option value="delivery">🚗 Доставка</option>
            </select>
          </div>

          <div class="form-group">
            <label>Имя {{ form.orderType === 'dine_in' ? '(необязательно)' : '' }}</label>
            <input v-model="form.name" type="text" placeholder="Введите ваше имя" :required="form.orderType !== 'dine_in'" />
          </div>

          <div class="form-group">
            <label>Телефон {{ form.orderType === 'dine_in' ? '(необязательно)' : '' }}</label>
            <input v-model="form.phone" type="tel" placeholder="+7 (999) 000-00-00" :required="form.orderType !== 'dine_in'" />
          </div>

          <div v-if="form.orderType === 'dine_in'" class="form-group">
            <label>Номер столика</label>
            <input v-model="form.tableNumber" type="text" placeholder="Например: 5" required />
          </div>

          <div v-if="form.orderType === 'delivery'" class="form-group">
            <label>Адрес доставки</label>
            <input v-model="form.address" type="text" placeholder="Улица, дом, квартира" required />
          </div>

          <div v-if="form.orderType === 'takeaway' || form.orderType === 'delivery'" class="time-picker-block">
            <label class="block-title">{{ form.orderType === 'takeaway' ? 'Когда приготовить?' : 'Когда доставить?' }}</label>
            <div class="time-inputs-row">
              <input v-model="form.scheduledTime" type="time" class="time-input" />
              <input v-model="form.scheduledDate" type="date" class="date-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Примечание (необязательно)</label>
            <textarea v-model="form.comment" placeholder="Напр., соусы отдельно?"></textarea>
          </div>

          <div class="checkout-summary">
            <span>Итого к оплате:</span>
            <strong>{{ totalPrice.toFixed(2) }} ₽</strong>
          </div>

          <button type="submit" class="submit-order-btn" :style="{ backgroundColor: primaryColor }">
            Далее: Проверить заказ
          </button>
        </form>
      </template>

      <!-- ШАГ 2: Проверка заказа -->
      <template v-else-if="step === 2">
        <div class="checkout-header">
          <button class="back-btn" @click="$emit('prev-step')">〈</button>
          <h3>Проверка заказа</h3>
          <button class="close-modal-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="review-screen-content">
          <div class="review-card-block">
            <div class="review-card-title">Итого заказа</div>
            <div class="review-items-list">
              <div v-for="item in cartItems" :key="item.id" class="review-item-row">
                <span class="r-name"><b>{{ item.quantity }}x</b> {{ getItemName(item) }}</span>
                <span class="r-price">RUB {{ (Number(item.price || 0) * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="review-totals-divider"></div>
            <div class="review-total-line main-total">
              <span>Итого</span>
              <span>RUB {{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <div class="review-card-block">
            <div class="review-card-title">Ваши данные</div>
            <div class="data-row" v-if="form.name"><span class="icon">👤</span> <div><div class="label-muted">Имя</div><div class="val">{{ form.name }}</div></div></div>
            <div class="data-row" v-if="form.phone"><span class="icon">📞</span> <div><div class="label-muted">Телефон</div><div class="val">{{ form.phone }}</div></div></div>
            <div class="data-row" v-if="form.address"><span class="icon">📍</span> <div><div class="label-muted">Адрес</div><div class="val">{{ form.address }}</div></div></div>
          </div>

          <!-- Карта для самовывоза -->
          <div v-if="form.orderType === 'takeaway'" class="review-card-block">
            <div class="review-card-title">Как добраться (Самовывоз)</div>
            <div class="map-container">
              <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A1d0a5190835de3973c52a3279f1dbf7f1bc3d2fa1a1154c148283a0058e390c5&amp;source=constructor" width="100%" height="140" frameborder="0" style="border-radius: 8px;"></iframe>
            </div>
            <a :href="yandexNavigatorUrl" target="_blank" class="yandex-map-btn">🗺️ Открыть в Яндекс Картах</a>
          </div>

          <div class="review-actions-row">
            <button class="btn-secondary-action" @click="$emit('prev-step')">Назад</button>
            <button class="btn-primary-action" @click="submitOrder" :style="{ backgroundColor: primaryColor }">Разместить заказ</button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import axios from 'axios';

const props = defineProps<{
  step: number;
  form: any;
  cartItems: any[];
  totalPrice: number;
  primaryColor: string;
  restaurantAddress: string;
  getItemName: (item: any) => string;
}>();

const emit = defineEmits(['close', 'next-step', 'prev-step', 'confirm']);

const yandexNavigatorUrl = computed(() => {
  const query = encodeURIComponent(props.restaurantAddress || 'Ресторан');
  return `https://yandex.ru/maps/?text=${query}`;
});

// Исправленная функция отправки с динамическим URL бэкенда
const submitOrder = async () => {
  try {
    const API_URL = `${window.location.protocol}//${window.location.hostname}:3000/api/orders`;
    
    // Отправляем данные на сервер
    await axios.post(API_URL, {
      items: props.cartItems,
      form: props.form,
      total: props.totalPrice
    });

    emit('confirm');
  } catch (error) {
    console.error('Ошибка отправки заказа:', error);
    alert('Не удалось отправить заказ. Проверьте соединение с сервером.');
  }
};
</script>

<style scoped>
.checkout-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: flex-end; }
.checkout-modal { background: #f4f5f7; color: #111; width: 100%; max-height: 92%; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 16px; box-sizing: border-box; overflow-y: auto; }
.checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.checkout-header h3 { margin: 0; font-size: 14px; font-weight: bold; }
.close-modal-btn, .back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #666; padding: 0; }
.checkout-form, .review-screen-content { display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.form-group label { font-size: 10px; font-weight: 600; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #ddd; font-size: 11px; outline: none; box-sizing: border-box; background: #fff; }
.form-group textarea { resize: none; height: 45px; }
.time-picker-block { background: #fff; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 6px; border: 1.5px solid #eee; }
.block-title { font-size: 11px; font-weight: bold; color: #333; }
.time-inputs-row { display: flex; gap: 8px; }
.time-input, .date-input { flex: 1; padding: 8px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 11px; background: #fff; }
.checkout-summary { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #ddd; font-size: 12px; }
.submit-order-btn, .btn-primary-action { color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
.review-card-block { background: #fff; border-radius: 12px; padding: 12px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.review-card-title { font-size: 12px; font-weight: bold; color: #111; margin-bottom: 8px; }
.review-items-list { display: flex; flex-direction: column; gap: 8px; }
.review-item-row { display: flex; justify-content: space-between; font-size: 11px; color: #333; }
.review-total-line.main-total { font-size: 13px; font-weight: bold; color: #111; margin-top: 6px; }
.data-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 11px; }
.label-muted { font-size: 9px; color: #888; }
.val { font-weight: 500; color: #222; }
.map-container { margin-bottom: 8px; border-radius: 8px; overflow: hidden; }
.yandex-map-btn { display: block; text-align: center; background: #fc3f1d; color: #fff; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; }
.review-actions-row { display: flex; gap: 8px; margin-top: 4px; }
.btn-secondary-action { flex: 1; background: #e2e8f0; color: #333; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
</style>