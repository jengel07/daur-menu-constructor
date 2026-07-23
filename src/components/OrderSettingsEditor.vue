<template>
  <div class="order-hub-container">
    <header class="hub-header">
      <div class="hub-counters">
        <button v-for="tab in ['open', 'progress', 'done', 'cancelled']" :key="tab" class="counter-badge" :class="[tab, { active: currentTab === tab }]" @click="currentTab = tab as any">
          <span class="dot"></span> <span class="count-num">{{ stats[tab as keyof typeof stats] }}</span> {{ getTabName(tab) }}
        </button>
      </div>
      <div class="hub-actions">
        <button class="btn-action-top" @click="isOrderSettingsOpen = true">⚙️ Open Settings</button>
        <button class="btn-action-top refresh-btn" :class="{ rotating: isRefreshing }" @click="refreshOrders">🔄 Обновить</button>
      </div>
    </header>

    <main class="hub-main-workspace">
      <div v-if="getFilteredOrders.length === 0" class="no-orders-placeholder"><p>Нет заказов в категории "{{ getTabName(currentTab) }}"</p></div>
      <div v-else class="orders-list"></div>
    </main>

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

const { pickupActive, pickupTime, deliveryActive, deliveryTime, workDays } = useOrders();
const isOrderSettingsOpen = ref(true);
const orderMode = ref('order');
const isLiabilityAgreed = ref(false);
const isActivated = ref(false);

const setOrderMode = (mode: string) => {
  orderMode.value = mode;
  if (mode !== 'order' && !isActivated.value) isLiabilityAgreed.value = false;
};

const stats = ref({ open: 0, progress: 0, done: 0, cancelled: 0 });
const currentTab = ref<'open' | 'progress' | 'done' | 'cancelled'>('open');
const orders = ref<any[]>([]);
const isRefreshing = ref(false);

const refreshOrders = () => {
  isRefreshing.value = true;
  setTimeout(() => (isRefreshing.value = false), 600);
};

const getFilteredOrders = computed(() => orders.value.filter(o => o.status === currentTab.value));
const getTabName = (tab: string) => ({ open: 'Open', progress: 'in Progress', done: 'Done', cancelled: 'Cancelled' }[tab] || tab);

const onsiteActive = ref(false);
const notifType = ref('whatsapp');
const whatsappNumber = ref('+7');
const emailNotif = ref(true);
</script>

<style scoped>
.order-hub-container { display: flex; flex-direction: column; min-height: 100vh; background-color: #121212; color: #fff; font-family: inherit; }
.hub-header { display: flex; align-items: center; justify-content: space-between; background-color: #1a1a1a; border-bottom: 1px solid #2d2d2d; padding: 12px 24px; gap: 16px; }
.hub-counters { display: flex; gap: 10px; align-items: center; }
.counter-badge { display: flex; align-items: center; gap: 8px; background: #262626; border: 1px solid #333; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #a0aec0; cursor: pointer; transition: all 0.2s; }
.counter-badge:hover { border-color: #4a5568; }
.counter-badge.active { background: #2d2d2d; color: #fff; border-color: #555; }
.counter-badge .dot { width: 8px; height: 8px; border-radius: 50%; }
.counter-badge.open .dot { background-color: #f97316; }
.counter-badge.progress .dot { background-color: #3b82f6; }
.counter-badge.done .dot { background-color: #10b981; }
.counter-badge.cancelled .dot { background-color: #ef4444; }
.count-num { font-weight: 600; color: #fff; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 10px; font-size: 11px; }
.hub-actions { display: flex; gap: 12px; }
.btn-action-top { background: #2d2d2d; border: 1px solid #3d3d3d; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-action-top:hover { background: #3d3d3d; }
.refresh-btn { background: #2563eb; border-color: #2563eb; }
.refresh-btn:hover { background: #1d4ed8; }
.refresh-btn.rotating { opacity: 0.7; }
.hub-main-workspace { flex: 1; padding: 24px; background-color: #18181b; }
.no-orders-placeholder { display: flex; justify-content: center; align-items: center; height: 300px; color: #71717a; font-size: 14px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content.order-settings-modal { background: #fff; color: #1a202c; width: 100%; max-width: 520px; max-height: 85vh; padding: 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); box-sizing: border-box; display: flex; flex-direction: column; }
.activated-settings-scroll { overflow-y: auto; padding-right: 4px; max-height: 65vh; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #1a202c; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #718096; }
.mode-tabs { display: flex; background: #edf2f7; padding: 4px; border-radius: 12px; margin-bottom: 20px; flex-shrink: 0; }
.mode-tabs button { flex: 1; background: transparent; border: none; padding: 10px; font-size: 14px; font-weight: 500; color: #4a5568; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.mode-tabs button.active { background: #fff; color: #1a202c; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.mode-description-card { background: #f7fafc; padding: 16px; border-radius: 12px; font-size: 14px; color: #4a5568; line-height: 1.5; margin-bottom: 20px; border: 1px solid #edf2f7; }
.warning-card { background: #f8fafc; }
.order-top-text { font-size: 14px; color: #4a5568; margin-bottom: 16px; line-height: 1.4; }
.checkbox-row { display: flex; align-items: flex-start; gap: 12px; }
.checkbox-row input[type="checkbox"] { margin-top: 3px; width: 16px; height: 16px; cursor: pointer; }
.checkbox-row label { font-size: 13px; color: #4a5568; line-height: 1.4; cursor: pointer; }
.modal-footer-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 16px; flex-shrink: 0; }
.btn-cancel { background: #f7fafc; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #4a5568; cursor: pointer; }
.btn-activate { background: #718096; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer; transition: background 0.2s; }
.btn-activate:not(:disabled) { background: #4a5568; }
.btn-activate:disabled { opacity: 0.6; cursor: not-allowed; }
.setting-block { background: #fdfdfd; border: 1px solid #edf2f7; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.setting-row-switch { display: flex; justify-content: space-between; align-items: center; }
.setting-label-with-icon { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; color: #2d3748; }
.block-icon { font-size: 18px; }
.status-text { font-size: 12px; color: #a0aec0; margin-top: 4px; display: block; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e0; transition: .3s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: #fff; transition: .3s; }
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }
.range-group { margin-top: 16px; }
.range-label { display: flex; justify-content: space-between; font-size: 13px; color: #4a5568; margin-bottom: 8px; }
.highlight-orange { color: #f97316; font-weight: 600; }
.range-input { width: 100%; accent-color: #f97316; cursor: pointer; }
.input-group { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.input-group label { font-size: 12px; color: #718096; }
.text-input { background: #f7fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 14px; color: #2d3748; outline: none; }
.text-input:focus { border-color: #cbd5e0; }
.phone-input-wrapper { display: flex; align-items: center; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.phone-input-wrapper:focus-within { border-color: #cbd5e0; }
.country-select { display: flex; align-items: center; gap: 6px; padding: 0 12px; border-right: 1px solid #e2e8f0; background: #edf2f7; height: 41px; cursor: pointer; }
.flag-icon { font-size: 16px; }
.select-arrow { font-size: 11px; color: #718096; }
.phone-input { border: none !important; background: transparent !important; flex: 1; }
.row-inputs { display: flex; gap: 12px; }
.row-inputs-three { display: flex; gap: 8px; margin-top: 12px; }
.input-with-unit { position: relative; display: flex; align-items: center; }
.input-with-unit input { width: 100%; padding-right: 45px; }
.input-with-unit span { position: absolute; right: 10px; font-size: 11px; color: #a0aec0; font-weight: 600; }
.mb-12 { margin-bottom: 12px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.work-day-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f7fafc; font-size: 14px; color: #2d3748; }
.day-switch-left { display: flex; align-items: center; gap: 12px; }
.text-muted { color: #a0aec0; }
.day-action-right { font-size: 13px; color: #718096; cursor: pointer; }
.notification-tabs { display: flex; background: #edf2f7; padding: 4px; border-radius: 8px; }
.notification-tabs button { flex: 1; background: transparent; border: none; padding: 8px; font-size: 13px; font-weight: 500; color: #4a5568; border-radius: 6px; cursor: pointer; }
.notification-tabs button.active { background: #fff; color: #1a202c; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.notif-text-desc span { font-size: 14px; color: #2d3748; font-weight: 500; }
.notif-text-desc p { margin: 2px 0 0 0; font-size: 12px; color: #718096; }
</style>