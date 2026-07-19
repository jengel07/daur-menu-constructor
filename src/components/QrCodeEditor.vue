<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { computed } from 'vue';
import type { RestaurantInfo } from '../types/menu';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:model-value']);

// Генерируем ссылку на превью динамически
const previewUrl = computed(() => {
  return "https://kind-rivers-win.loca.lt/preview";т
});

const update = (key: string, value: any) => {
  emit('update:model-value', { 
    ...props.modelValue, 
    qrSettings: { ...props.modelValue.qrSettings, [key]: value } 
  });
};
</script>

<template>
  <div class="qr-editor-container">
    <!-- Панель управления -->
    <div class="controls">
      <label>Текст: 
        <input :value="modelValue.qrSettings.text" @input="update('text', ($event.target as HTMLInputElement).value)">
      </label>
      <label>Фон: 
        <input type="color" :value="modelValue.qrSettings.bgColor" @input="update('bgColor', ($event.target as HTMLInputElement).value)">
      </label>
      <label>Квадраты: 
        <input type="color" :value="modelValue.qrSettings.squareColor" @input="update('squareColor', ($event.target as HTMLInputElement).value)">
      </label>
    </div>

    <!-- Область отображения QR (имитация телефона) -->
    <div class="phone-preview">
      <div class="qr-box">
        <qrcode-vue 
          :value="previewUrl" 
          :background="modelValue.qrSettings.bgColor" 
          :foreground="modelValue.qrSettings.squareColor" 
          level="H" 
          :size="200"
        />
        <p class="qr-text">{{ modelValue.qrSettings.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-editor-container { display: flex; gap: 20px; }
.phone-preview { 
  background: black; 
  padding: 20px; 
  border-radius: 30px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  width: 250px;
}
.qr-box { background: white; padding: 15px; border-radius: 10px; text-align: center; }
.qr-text { margin-top: 10px; font-weight: bold; color: black; }
</style>