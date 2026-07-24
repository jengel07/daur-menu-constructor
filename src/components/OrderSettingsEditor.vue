<template>
  <div class="order-hub-container">
    <header class="hub-header">
      <div class="hub-counters">
        <button 
          v-for="tab in ['open', 'progress', 'done', 'cancelled']" 
          :key="tab" 
          class="counter-badge" 
          :class="[tab, { active: currentTab === tab }]" 
          @click="currentTab = tab as any"
        >
          <span class="dot"></span> 
          <span class="count-num">{{ stats[tab as keyof typeof stats] || 0 }}</span> 
          {{ getTabName(tab) }}
        </button>
      </div>
      <div class="hub-actions">
        <button class="btn-action-top" @click="isOrderSettingsOpen = true">⚙️ Настройки</button>
        <button class="btn-action-top refresh-btn" :class="{ rotating: isRefreshing }" @click="refreshOrders">🔄 Обновить</button>
      </div>
    </header>

    <main class="hub-main-workspace">
      <div v-if="getFilteredOrders.length === 0" class="no-orders-placeholder">
        <p>Нет заказов в категории "{{ getTabName(currentTab) }}"</p>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in getFilteredOrders" :key="order.id" class="order-card-item">
          <div class="order-card-header">
            <span class="order-id">ORD-{{ order.id }}</span>
            <span class="order-time">{{ order.time || '14:44' }}</span>
          </div>
          <div class="order-items-summary">
            <div v-for="(item, idx) in order.items" :key="idx" class="order-item-row">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>RUB {{ item.price * item.quantity }}</span>
            </div>
          </div>
          <div class="order-card-footer">
            <span class="order-total">Итого: RUB {{ order.total }}</span>
            <div class="order-actions-btns">
              <button 
                v-if="order.status === 'open'" 
                class="btn-cancel-order" 
                @click="updateOrderStatus(order.id, 'cancelled')"
              >
                Отменить
              </button>
              <button 
                v-if="order.status === 'open'" 
                class="btn-progress-order" 
                @click="updateOrderStatus(order.id, 'progress')"
              >
                В работу ➔
              </button>
              <button 
                v-if="order.status === 'progress'" 
                class="btn-done-order" 
                @click="updateOrderStatus(order.id, 'done')"
              >
                Готово ✓
              </button>
              <button 
                v-if="order.status === 'cancelled'" 
                class="btn-restore-order" 
                @click="updateOrderStatus(order.id, 'open')"
              >
                ↺ Вернуть
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно настроек заказов -->
    <div v-if="isOrderSettingsOpen" class="modal-overlay" @click.self="isOrderSettingsOpen = false">
      <div class="modal-content order-settings-modal">
        <div class="modal-header">
          <h2>Order Settings</h2>
          <button class="close-btn" @click="isOrderSettingsOpen = false">✕</button>
        </div>

        <div class="mode-tabs">
          <button v-for="m in [{id:'menu',label:'📖 Меню'}, {id:'cart',label:'🛒 Корзина'}, {id:'order',label:'📄 Заказ'}]" :key="m.id" :class="{ active: orderMode === m.id }" @click="setOrderMode(m.id)">{{ m.label }}</button>
        </div>

        <div v-if="orderMode === 'menu'" class="mode-description-card"><p>Классический цифровой опыт. Гости могут просматривать ваши позиции, но не могут добавлять их в корзину.</p></div>
        <div v-if="orderMode === 'cart'" class="mode-description-card"><p>Дайте вашим гостям «Список желаемого». Пользователи могут добавлять позиции в корзину, чтобы отслеживать свои любимые и видеть общую стоимость.</p></div>

        <template v-if="orderMode === 'order'">
          <template v-if="!isActivated">
            <p class="order-top-text">Принимай заказы клиентов прямо в Dashboard и по email. Быстрый и простой способ увеличить выручку без лишних заморочек.</p>
            <div class="mode-description-card warning-card">
              <div class="checkbox-row">
                <input type="checkbox" id="liability" v-model="isLiabilityAgreed" />
                <label for="liability">Я понимаю, что сервис предоставляет инструмент для заказов, но я несу полную ответственность за выполнение заказов и потерянные уведомления.</label>
              </div>
            </div>
            <div class="modal-footer-actions">
              <button class="btn-cancel" @click="isOrderSettingsOpen = false">Отмена</button>
              <button class="btn-activate" :disabled="!isLiabilityAgreed" @click="isActivated = true">Активировать заказы ➔</button>
            </div>
          </template>

          <template v-else>
            <div class="activated-settings-scroll">
              <p class="order-top-text">Принимай заказы клиентов прямо в Dashboard и по email. Быстрый и простой способ увеличить выручку без лишних заморочек.</p>

              <!-- Самовывоз -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">📦</span><span>Самовывоз</span></div>
                  <label class="switch"><input type="checkbox" v-model="pickupActive" /><span class="slider round"></span></label>
                </div>
                <span class="status-text">{{ pickupActive ? 'Включено' : 'Отключено' }}</span>
                <template v-if="pickupActive">
                  <div class="range-group">
                    <div class="range-label"><span>Время приготовления</span><span class="highlight-orange">{{ pickupTime }} мин</span></div>
                    <input type="range" min="5" max="120" step="5" v-model="pickupTime" class="range-input" />
                  </div>
                  <div class="input-group"><label>Адрес самовывоза</label><input type="text" placeholder="Введите адрес" v-model="pickupAddress" class="text-input" /></div>
                  <div class="row-inputs">
                    <div class="input-group"><label>Город</label><input type="text" placeholder="Город" v-model="pickupCity" class="text-input" /></div>
                    <div class="input-group"><label>Почтовый индекс</label><input type="text" placeholder="Индекс" v-model="pickupIndex" class="text-input" /></div>
                  </div>
                </template>
              </div>

              <!-- Доставка -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">🚲</span><span>Доставка</span></div>
                  <label class="switch"><input type="checkbox" v-model="deliveryActive" /><span class="slider round"></span></label>
                </div>
                <span class="status-text">{{ deliveryActive ? 'Включено' : 'Отключено' }}</span>
                <template v-if="deliveryActive">
                  <div class="range-group">
                    <div class="range-label"><span>Время доставки</span><span class="highlight-orange">{{ deliveryTime }} мин</span></div>
                    <input type="range" min="10" max="120" step="5" v-model="deliveryTime" class="range-input" />
                  </div>
                  <div class="row-inputs-three">
                    <div class="input-group"><label>Плата</label><div class="input-with-unit"><input type="number" v-model="deliveryFee" class="text-input" /><span>RUB</span></div></div>
                    <div class="input-group"><label>Мин. заказ</label><div class="input-with-unit"><input type="number" v-model="minOrder" class="text-input" /><span>RUB</span></div></div>
                    <div class="input-group"><label>Бесплатно от</label><div class="input-with-unit"><input type="number" v-model="freeFrom" class="text-input" /><span>RUB</span></div></div>
                  </div>
                </template>
              </div>

              <!-- На месте -->
              <div class="setting-block">
                <div class="setting-row-switch">
                  <div class="setting-label-with-icon"><span class="block-icon">🍽️</span><span>На месте</span></div>
                  <label class="switch"><input type="checkbox" v-model="onsiteActive" /><span class="slider round"></span></label>
                </div>
                <span class="status-text">{{ onsiteActive ? 'Включено' : 'Отключено' }}</span>
              </div>

              <!-- Часы работы -->
              <div class="setting-block">
                <div class="setting-label-with-icon mb-12"><span class="block-icon">⏱️</span><span>Часы работы</span></div>
                <div v-for="day in workDays" :key="day.name" class="work-day-row">
                  <div class="day-switch-left"><label class="switch"><input type="checkbox" v-model="day.active" /><span class="slider round"></span></label><span :class="{ 'text-muted': !day.active }">{{ day.name }}</span></div>
                  <span class="day-action-right">{{ day.active ? '+' : 'закрыто' }}</span>
                </div>
              </div>

              <!-- Уведомление -->
              <div class="setting-block">
                <div class="setting-label-with-icon mb-12"><span class="block-icon">🔔</span><span>Уведомление</span></div>
                <div class="notification-tabs">
                  <button :class="{ active: notifType === 'dashboard' }" @click="notifType = 'dashboard'">📋 Хаб заказов</button>
                  <button :class="{ active: notifType === 'whatsapp' }" @click="notifType = 'whatsapp'">💬 WhatsApp</button>
                </div>
                <div v-if="notifType === 'whatsapp'" class="input-group mt-16">
                  <label>Номер WhatsApp</label>
                  <div class="phone-input-wrapper">
                    <div class="country-select"><span class="flag-icon">🇷🇺</span><span class="select-arrow">↕</span></div>
                    <input type="tel" v-model="whatsappNumber" placeholder="+7 (999) 000-00-00" class="text-input phone-input" />
                  </div>
                </div>
                <div class="setting-row-switch mt-16">
                  <div class="notif-text-desc"><span>Уведомлять по электронной почте</span><p>Отправлять копию письма на ваш аккаунт.</p></div>
                  <label class="switch"><input type="checkbox" v-model="emailNotif" /><span class="slider round"></span></label>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RestaurantInfo } from '../types/menu';
import { useOrders } from '../composables/useOrders';

defineProps<{ modelValue: RestaurantInfo }>();

const { 
  pickupActive, 
  pickupTime, 
  deliveryActive, 
  deliveryTime, 
  workDays,
  orders,
  stats,
  updateOrderStatus
} = useOrders();

const isOrderSettingsOpen = ref(false);
const orderMode = ref('order');
const isLiabilityAgreed = ref(false);
const isActivated = ref(true);

// Дополнительные реактивные переменные для модального окна настроек
const pickupAddress = ref('');
const pickupCity = ref('');
const pickupIndex = ref('');
const deliveryFee = ref(0);
const minOrder = ref(0);
const freeFrom = ref(0);
const notifType = ref('dashboard');
const whatsappNumber = ref('');
const emailNotif = ref(false);

const setOrderMode = (mode: string) => {
  orderMode.value = mode;
  if (mode !== 'order' && !isActivated.value) isLiabilityAgreed.value = false;
};

const currentTab = ref<'open' | 'progress' | 'done' | 'cancelled'>('open');
const isRefreshing = ref(false);

const refreshOrders = () => {
  isRefreshing.value = true;
  setTimeout(() => (isRefreshing.value = false), 600);
};

const getFilteredOrders = computed(() => {
  return orders.value.filter(o => o.status === currentTab.value);
});

const getTabName = (tab: string) => ({ 
  open: 'Новые', 
  progress: 'В работу', 
  done: 'Готовы', 
  cancelled: 'Отменено' 
}[tab] || tab);

const onsiteActive = ref(false);
</script>

<style scoped>
/* ТЕМНАЯ ТЕМА ПО УМОЛЧАНИЮ (Черная) */
.order-hub-container { 
  display: flex; 
  flex-direction: column; 
  min-height: 100vh; 
  font-family: inherit; 
  background-color: #121212;
  color: #fff;
}
.hub-header {
  background-color: #1a1a1a;
  border-bottom: 1px solid #2d2d2d;
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 12px 24px; 
  gap: 16px;
}
.counter-badge {
  background: #262626;
  border: 1px solid #333;
  color: #a0aec0;
  display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.counter-badge.active {
  background: #2d2d2d;
  color: #fff;
  border-color: #555;
}
.btn-action-top {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  color: #fff;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.hub-main-workspace {
  background-color: #18181b;
  flex: 1; padding: 24px;
}
.order-card-item {
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  color: #fff;
  border-radius: 12px; padding: 16px 20px;
}
.order-card-header {
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-bottom: 12px; padding-bottom: 8px;
}
.order-card-footer {
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; justify-content: space-between; align-items: center; padding-top: 12px;
}
.order-item-row {
  color: #d1d5db;
  display: flex; justify-content: space-between;
}
.order-total {
  color: #10b981;
  font-weight: 600; font-size: 14px;
}
.count-num {
  font-weight: 600; padding: 1px 6px; border-radius: 10px; font-size: 11px;
  color: #fff; background: rgba(255,255,255,0.1);
}
.order-time { color: #a0aec0; font-size: 13px; }

.hub-counters { display: flex; gap: 10px; align-items: center; }
.counter-badge .dot { width: 8px; height: 8px; border-radius: 50%; }
.counter-badge.open .dot { background-color: #f97316; }
.counter-badge.progress .dot { background-color: #3b82f6; }
.counter-badge.done .dot { background-color: #10b981; }
.counter-badge.cancelled .dot { background-color: #ef4444; }
.hub-actions { display: flex; gap: 12px; }
.refresh-btn { background: #2563eb !important; border-color: #2563eb !important; color: #fff !important; }
.refresh-btn:hover { background: #1d4ed8 !important; }
.refresh-btn.rotating { opacity: 0.7; }
.no-orders-placeholder { display: flex; justify-content: center; align-items: center; height: 200px; font-size: 14px; color: #71717a; }
.orders-list { display: flex; flex-direction: column; gap: 16px; max-width: 750px; }
.order-items-summary { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 14px; }
.order-actions-btns { display: flex; gap: 8px; }
.btn-cancel-order { background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-progress-order, .btn-done-order { background: #3b82f6; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-restore-order { background: #6b7280; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-cancel-order:hover, .btn-progress-order:hover, .btn-done-order:hover, .btn-restore-order:hover { opacity: 0.9; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content.order-settings-modal { background: #fff; color: #1a202c; width: 100%; max-width: 520px; max-height: 85vh; padding: 24px; border-radius: 16px; display: flex; flex-direction: column; }
.activated-settings-scroll { overflow-y: auto; padding-right: 4px; max-height: 65vh; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #718096; }
.mode-tabs { display: flex; background: #edf2f7; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
.mode-tabs button { flex: 1; background: transparent; border: none; padding: 10px; font-size: 14px; color: #4a5568; border-radius: 8px; cursor: pointer; }
.mode-tabs button.active { background: #fff; color: #1a202c; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.setting-block { background: #fdfdfd; border: 1px solid #edf2f7; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.setting-row-switch { display: flex; justify-content: space-between; align-items: center; }
.setting-label-with-icon { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; color: #2d3748; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e0; transition: .3s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: #fff; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }

/* Дополнительные стили для полей ввода внутри модалки настроек */
.order-top-text { font-size: 13px; color: #4a5568; margin-bottom: 16px; line-height: 1.4; }
.status-text { display: block; font-size: 12px; color: #718096; margin-top: 6px; margin-bottom: 12px; }
.range-group { margin-top: 12px; margin-bottom: 12px; }
.range-label { display: flex; justify-content: space-between; font-size: 13px; color: #4a5568; margin-bottom: 6px; }
.highlight-orange { color: #f97316; font-weight: 600; }
.range-input { width: 100%; accent-color: #f97316; }
.input-group { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
.input-group label { font-size: 12px; color: #4a5568; font-weight: 500; }
.text-input { padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; background: #fff; color: #1a202c; }
.text-input:focus { border-color: #3b82f6; }
.row-inputs { display: flex; gap: 12px; }
.row-inputs .input-group { flex: 1; }
.row-inputs-three { display: flex; gap: 8px; }
.row-inputs-three .input-group { flex: 1; }
.input-with-unit { display: flex; align-items: center; border: 1px solid #cbd5e0; border-radius: 8px; background: #fff; overflow: hidden; }
.input-with-unit input { border: none; border-radius: 0; }
.input-with-unit span { padding: 0 8px; font-size: 12px; color: #718096; background: #f7fafc; height: 100%; display: flex; align-items: center; }
.work-day-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f7fafc; font-size: 13px; }
.day-switch-left { display: flex; align-items: center; gap: 10px; }
.text-muted { color: #a0aec0; }
.day-action-right { font-weight: 500; color: #4a5568; }
.mb-12 { margin-bottom: 12px; }
.mt-16 { margin-top: 16px; }
.notification-tabs { display: flex; background: #edf2f7; padding: 3px; border-radius: 8px; gap: 4px; }
.notification-tabs button { flex: 1; background: transparent; border: none; padding: 8px; font-size: 13px; color: #4a5568; border-radius: 6px; cursor: pointer; font-weight: 500; }
.notification-tabs button.active { background: #fff; color: #1a202c; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.phone-input-wrapper { display: flex; align-items: center; border: 1px solid #cbd5e0; border-radius: 8px; overflow: hidden; background: #fff; }
.country-select { display: flex; align-items: center; gap: 4px; padding: 0 10px; background: #f7fafc; border-right: 1px solid #cbd5e0; font-size: 13px; }
.phone-input { border: none !important; border-radius: 0 !important; }
.notif-text-desc span { font-size: 13px; font-weight: 500; color: #2d3748; display: block; }
.notif-text-desc p { font-size: 11px; color: #718096; margin-top: 2px; }
</style>

<!-- СВЕТЛАЯ ТЕМА -->
<style>
.constructor-wrapper.light-theme .order-hub-container {
  background-color: #f4f5f7 !important;
  color: #1a202c !important;
}
.constructor-wrapper.light-theme .hub-header {
  background-color: #ffffff !important;
  border-bottom: 1px solid #d1d5db !important;
}
.constructor-wrapper.light-theme .counter-badge {
  background: #f1f3f5 !important;
  border: 1px solid #d1d5db !important;
  color: #4a5568 !important;
}
.constructor-wrapper.light-theme .counter-badge.active {
  background: #e2e8f0 !important;
  color: #1a202c !important;
  border-color: #cbd5e0 !important;
}
.constructor-wrapper.light-theme .btn-action-top {
  background: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #1a202c !important;
}
.constructor-wrapper.light-theme .hub-main-workspace {
  background-color: #f4f5f7 !important;
}
.constructor-wrapper.light-theme .order-card-item {
  background: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #1a202c !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.constructor-wrapper.light-theme .order-card-header {
  border-bottom: 1px solid #e2e8f0 !important;
  color: #1a202c !important;
}
.constructor-wrapper.light-theme .order-card-footer {
  border-top: 1px solid #e2e8f0 !important;
}
.constructor-wrapper.light-theme .order-item-row {
  color: #2d3748 !important;
}
.constructor-wrapper.light-theme .order-total {
  color: #047857 !important;
}
.constructor-wrapper.light-theme .count-num {
  color: #1a202c !important;
  background: rgba(0,0,0,0.06) !important;
}
.constructor-wrapper.light-theme .order-time {
  color: #718096 !important;
}
</style>