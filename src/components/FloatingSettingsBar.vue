<template>
  <div 
    class="floating-settings-bar" 
    :style="barStyle"
  >
    <button class="fs-item" @click="$emit('open-modal', 'language')">
      <span class="fs-icon">🌐</span>
      <span class="fs-text">{{ selectedLanguage || 'Русский' }}</span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <button class="fs-item" @click="$emit('open-modal', 'filters')">
      <span class="fs-icon">🎛️</span>
      <span class="fs-text">Фильтры</span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <button class="fs-icon-btn" @click="$emit('open-modal', 'share')" title="Поделиться">
      <span>📤</span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <!-- Кнопка переключения вида: Сетка / Список -->
    <button class="fs-icon-btn" @click="$emit('toggle-view')" :title="viewMode === 'grid' ? 'Сделать списком' : 'Сделать сеткой'">
      <span>{{ viewMode === 'grid' ? '📋' : '🔲' }}</span>
    </button>
    <div class="fs-divider" :style="{ backgroundColor: dividerColor }"></div>

    <button class="fs-icon-btn" @click="$emit('open-modal', 'search')" title="Поиск">
      <span>🔍</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  backgroundColor?: string;
  primaryColor?: string; // Добавили поддержку primaryColor для синхронизации
  selectedLanguage?: string;
  isVisible?: boolean;
  viewMode?: 'grid' | 'list';
}>();

defineEmits<{
  (e: 'open-modal', modalName: string): void;
  (e: 'toggle-view'): void;
}>();

// Функция для вычисления контрастного цвета (черный или белый)
const getContrastColor = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return '#FFFFFF';
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128 ? '#000000' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
};

// Выбираем цвет фона для плашки (приоритет primaryColor, затем backgroundColor, либо дефолтный)
const activeBgColor = computed(() => props.primaryColor || props.backgroundColor || '#646cff');

// Автоматически определяем цвет текста (черный или белый) в зависимости от фона
const textColor = computed(() => getContrastColor(activeBgColor.value));

// Цвет разделителей (полупрозрачный вариант текста)
const dividerColor = computed(() => {
  return textColor.value === '#000000' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
});

// Итоговые стили для плашки
const barStyle = computed(() => ({
  backgroundColor: activeBgColor.value,
  color: textColor.value
}));
</script>

<style scoped>
.floating-settings-bar {
  position: absolute;
  bottom: 15px;
  left: 10px;
  right: 10px;
  border-radius: 30px;
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  z-index: 15;
  box-sizing: border-box;
  overflow: hidden;
  transition: transform 0.3s ease, opacity 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.floating-settings-bar.bar-hidden {
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.fs-item {
  background: transparent;
  border: none;
  color: inherit; /* Наследует цвет текста плашки */
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 2px;
  flex: 1.5;
  min-width: 0;
}

.fs-icon-btn {
  background: transparent;
  border: none;
  color: inherit; /* Наследует цвет текста плашки */
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  flex: 0.8;
  min-width: 0;
}

.fs-item:hover,
.fs-icon-btn:hover {
  opacity: 0.8;
}

.fs-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.fs-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fs-divider {
  width: 1px;
  height: 14px;
  flex-shrink: 0;
  margin: 0 1px;
  transition: background-color 0.3s ease;
}
</style>