<script setup lang="ts">
import type { RestaurantInfo } from '@/types/menu';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:modelValue']);

// Функция для вычисления контрастного цвета (черный или белый)
const getContrastColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128 ? '#000000' : '#FFFFFF';
};

const update = (field: keyof RestaurantInfo, value: string) => {
  const updatedData = { ...props.modelValue, [field]: value };
  
  // Если меняется primaryColor, синхронизируем его для плавающей панели, 
  // если она управляется через отдельное свойство или стиль в родительском компоненте.
  // Здесь мы отправляем полный обновленный объект модели.
  emit('update:modelValue', updatedData);
};

const applyTheme = (bg: string, text: string, primary: string) => {
  emit('update:modelValue', { 
    ...props.modelValue, 
    backgroundColor: bg, 
    textColor: text, 
    primaryColor: primary 
  });
};

const themes = [
  { bg: '#FFF9F2', text: '#333333', primary: '#FF8C00' },
  { bg: '#F5F2EE', text: '#4A3728', primary: '#D2691E' },
  { bg: '#FFF0ED', text: '#000000', primary: '#FF4500' },
  { bg: '#F2F7F2', text: '#000000', primary: '#2D6A4F' },
  { bg: '#EDF4F9', text: '#000000', primary: '#0A9396' },
  { bg: '#FFF0F5', text: '#000000', primary: '#9D0208' },
  { bg: '#FFFBF0', text: '#000000', primary: '#B58900' },
  { bg: '#FFF0F0', text: '#FFFFFF', primary: '#E63946' },
  { bg: '#F5F5FF', text: '#4B0082', primary: '#8A2BE2' },
  { bg: '#F8F8F8', text: '#000000', primary: '#353B48' },
  { bg: '#F0FAF9', text: '#006D77', primary: '#20B2AA' },
  { bg: '#FDF7F2', text: '#5D4037', primary: '#8D6E63' },
  { bg: '#F0F4FF', text: '#1E3A8A', primary: '#3B82F6' },
  { bg: '#FFF7ED', text: '#9A3412', primary: '#F97316' },
  { bg: '#F0FDF4', text: '#166534', primary: '#22C55E' },
  { bg: '#F5F3FF', text: '#5B21B6', primary: '#8B5CF6' },
  { bg: '#FFF1F2', text: '#9F1239', primary: '#F43F5E' },
  { bg: '#ECFDF5', text: '#065F46', primary: '#10B981' },
  { bg: '#FFFBEB', text: '#92400E', primary: '#F59E0B' },
  { bg: '#F1F5F9', text: '#334155', primary: '#64748B' },
  { bg: '#FEF2F2', text: '#991B1B', primary: '#EF4444' },
  { bg: '#FDF2F8', text: '#9D174D', primary: '#EC4899' },
  { bg: '#FAFAFA', text: '#171717', primary: '#525252' },
  { bg: '#F8FAFC', text: '#1E293B', primary: '#475569' }
];
</script>

<template>
  <div class="color-editor">
    <h3>ЦВЕТОВЫЕ ТЕМЫ</h3>
    <div class="theme-grid">
      <button 
        v-for="(theme, index) in themes" 
        :key="index"
        class="theme-card"
        :style="{ backgroundColor: theme.bg, color: theme.text }"
        @click="applyTheme(theme.bg, theme.text, theme.primary)"
      >
        <span class="card-text">Aa</span>
        <div class="color-dot" :style="{ backgroundColor: theme.primary }"></div>
      </button>
    </div>
    
    <div class="color-pickers">
      <label>Фон <input type="color" :value="modelValue.backgroundColor" @input="update('backgroundColor', ($event.target as HTMLInputElement).value)"></label>
      <label>Текст <input type="color" :value="modelValue.textColor" @input="update('textColor', ($event.target as HTMLInputElement).value)"></label>
      <label>Основной <input type="color" :value="modelValue.primaryColor" @input="update('updateColor', ($event.target as HTMLInputElement).value) || update('primaryColor', ($event.target as HTMLInputElement).value)"></label>
    </div>
  </div>
</template>

<style scoped>
.theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.theme-card { border: 1px solid #ccc; border-radius: 8px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; height: 45px; }
.card-text { font-weight: bold; font-size: 14px; }
.color-dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }
.color-pickers { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.color-pickers label { display: flex; justify-content: space-between; align-items: center; color: #a0a0a0; font-size: 14px; }
</style>