<script setup lang="ts">
import { ref } from 'vue';
import type { MenuItem, MenuCategory } from '../types/menu';

// Эмитим событие наверх, когда меню "загружено"
const emit = defineEmits<{
  (e: 'import-success', data: { categories: MenuCategory[]; items: MenuItem[] }): void;
}>();

const isParsing = ref(false);
const progress = ref(0);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Обработка выбора файла через проводник
const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    await processFile(target.files[0]);
  }
};

// Обработка сброса файла (Drag and Drop)
const onDrop = async (event: DragEvent) => {
  isDragOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    await processFile(event.dataTransfer.files[0]);
  }
};

// Запуск локальной обработки файла
const processFile = async (file: File) => {
  // Разрешаем только PDF и изображения
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    alert('Пожалуйста, загрузите изображение (PNG, JPG) или PDF-документ меню.');
    return;
  }

  // Включаем лоадер
  isParsing.value = true;
  progress.value = 0;

  // Имитируем быструю локальную обработку (чтение файла) через интервал
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 10;
    } else {
      clearInterval(interval);
      isParsing.value = false;

      // Возвращаем базовый шаблон для ручного ввода
      const defaultResult = {
        categories: [
          { id: 'cat-1', name: 'Основные блюда' },
          { id: 'cat-2', name: 'Напитки' }
        ],
        items: [
          { id: 'item-1', categoryId: 'cat-1', name: 'Новое блюдо', price: 0, description: '' }
        ]
      };

      emit('import-success', defaultResult);
    }
  }, 150); // Каждые 150мс прибавляем прогресс для визуального отклика
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div class="import-container">
    <div class="import-card">
      <h2 class="import-title">Импорт меню</h2>
      <p class="import-subtitle">
        Загрузите файл меню или изображение, чтобы быстро перейти к его редактированию в интерактивном конструкторе.
      </p>

      <!-- Зона Drag and Drop / Загрузки -->
      <div
        v-if="!isParsing"
        class="dropzone"
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*,application/pdf"
          class="file-input"
          @change="onFileChange"
        />
        
        <div class="dropzone-content">
          <!-- Иконка загрузки -->
          <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          
          <p class="dropzone-text">
            <span>Перетащите файл сюда</span> или <span class="highlight">выберите на компьютере</span>
          </p>
          <p class="dropzone-hint">Поддерживаются PDF, PNG, JPG, JPEG</p>
        </div>
      </div>

      <!-- Экран анализа (Лоадер) -->
      <div v-else class="parsing-screen">
        <div class="loader-spinner"></div>
        <h3 class="parsing-status">Подготавливаем конструктор...</h3>
        <p class="parsing-substatus">Инициализация структуры и загрузка компонентов</p>
        
        <!-- Прогресс-бар -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-value">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
  padding: 20px;
}

.import-card {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.import-title {
  color: #ffffff;
  font-size: 1.8rem;
  margin-bottom: 12px;
  font-weight: 600;
}

.import-subtitle {
  color: #a0a0a0;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 32px;
}

.dropzone {
  border: 2px dashed #4a4a4a;
  border-radius: 12px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #1a1a1a;
}

.dropzone:hover, .dropzone.is-dragover {
  border-color: #646cff;
  background: rgba(100, 108, 255, 0.05);
}

.file-input {
  display: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #646cff;
}

.dropzone-text {
  color: #e0e0e0;
  font-size: 1rem;
}

.highlight {
  color: #646cff;
  font-weight: 500;
  text-decoration: underline;
}

.dropzone-hint {
  color: #666666;
  font-size: 0.8rem;
}

/* Стили парсинга / лоадера */
.parsing-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #333;
  border-top: 4px solid #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

.parsing-status {
  color: #ffffff;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.parsing-substatus {
  color: #888888;
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.progress-container {
  width: 80%;
  height: 6px;
  background: #2d2d2d;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: #646cff;
  transition: width 0.2s ease;
}

.progress-value {
  color: #646cff;
  font-weight: 600;
  font-size: 0.95rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>