<script setup lang="ts">
import type { RestaurantInfo } from '@/types/menu';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:modelValue']);

// Функция для обновления любого поля
const update = (field: keyof RestaurantInfo, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};
</script>

<template>
  <div class="general-settings">
    <h3>Общие данные</h3>

    <!-- Переключатель Wi-Fi -->
    <div class="wifi-toggle-container">
      <div class="toggle-header">
        <label>Включить Wi-Fi</label>
        <input 
          type="checkbox" 
          :checked="modelValue.isWifiEnabled" 
          @change="update('isWifiEnabled', ($event.target as HTMLInputElement).checked)" 
        />
      </div>
      <p class="description">
        Позвольте вашим клиентам подключаться к вашей сети Wi-Fi. 
        Если вы отключите эту функцию, кнопка Wi-Fi не будет отображаться.
      </p>
    </div>

    <!-- Поля Wi-Fi отображаются только если функция включена -->
    <div v-if="modelValue.isWifiEnabled" class="wifi-fields">
      <div class="form-group">
        <label>Название сети (SSID)</label>
        <input 
          type="text" 
          :value="modelValue.wifiName" 
          @input="update('wifiName', ($event.target as HTMLInputElement).value)" 
          placeholder="Введите название вашей сети" 
        />
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input 
          type="text" 
          :value="modelValue.wifiPassword" 
          @input="update('wifiPassword', ($event.target as HTMLInputElement).value)" 
          placeholder="Введите ваш пароль" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.general-settings { display: flex; flex-direction: column; gap: 20px; padding: 16px; }
.general-settings h3 { color: var(--text-main); }
.form-group { margin-top: 15px; }
.form-group label { display: block; margin-bottom: 8px; color: var(--text-muted, #a0a0a0); font-size: 14px; }

.wifi-toggle-container { background: var(--card-bg, #d7d7d761); border: 1px solid var(--border-color, #333); padding: 15px; border-radius: 8px; }
.toggle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.toggle-header label { font-weight: bold; color: var(--text-main); }
.description { font-size: 12px; color: var(--text-muted, #777); margin: 0; line-height: 1.4; }

input[type="text"] { 
  width: 100%; padding: 12px; background: var(--input-bg, #d7d7d761); border: 1px solid var(--border-color, #333); 
  border-radius: 8px; color: var(--text-main); box-sizing: border-box; 
}
input[type="text"]:focus { border-color: #646cff; outline: none; }
</style>