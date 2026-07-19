<script setup lang="ts">
import { ref } from 'vue';
import type { RestaurantInfo } from '@/types/menu';

const props = defineProps<{
  modelValue: RestaurantInfo;
}>();

const emit = defineEmits(['update:modelValue']);

// Создаем refs для инпутов
const avatarInput = ref<HTMLInputElement | null>(null);
const coverInput = ref<HTMLInputElement | null>(null);

// Функции для вызова клика (будут доступны в App.vue)
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const triggerCoverUpload = () => {
  coverInput.value?.click();
};

// Экспортируем функции наружу
defineExpose({ triggerAvatarUpload, triggerCoverUpload });

const handleFileUpload = (event: Event, type: 'cover' | 'avatar') => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    
    const updatedData = { ...props.modelValue };
    if (type === 'cover') updatedData.coverImage = result;
    else updatedData.avatarImage = result;

    emit('update:modelValue', updatedData);
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="branding-editor">
    <h3>Брендинг и лого</h3>

    <div class="form-group">
      <label>Фоновое изображение (обложка)</label>
      <div class="image-upload-container cover-upload" 
           :style="modelValue.coverImage ? { backgroundImage: `url(${modelValue.coverImage})` } : {}">
        <label class="upload-btn">
          <!-- Добавлен ref="coverInput" -->
          <input ref="coverInput" type="file" accept="image/*" @change="(e) => handleFileUpload(e, 'cover')" hidden />
          {{ modelValue.coverImage ? 'Изменить обложку' : 'Загрузить обложку' }}
        </label>
        <div v-if="!modelValue.coverImage" class="placeholder-text">1200x400px</div>
      </div>
    </div>

    <div class="form-group">
      <label>Аватар ресторана</label>
      <div class="avatar-wrapper">
        <div class="avatar-circle" :style="modelValue.avatarImage ? { backgroundImage: `url(${modelValue.avatarImage})` } : {}">
          <span v-if="!modelValue.avatarImage">🍽️</span>
          
          <label class="avatar-overlay">
            <!-- ref="avatarInput" уже был здесь -->
            <input ref="avatarInput" type="file" accept="image/*" @change="(e) => handleFileUpload(e, 'avatar')" hidden />
            <span>{{ modelValue.avatarImage ? 'Изменить' : 'Выбрать' }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.branding-editor { display: flex; flex-direction: column; gap: 24px; padding: 16px; }
.form-group label { display: block; margin-bottom: 8px; color: #a0a0a0; font-size: 14px; }

.image-upload-container {
  border: 2px dashed #333; border-radius: 12px; display: flex;
  flex-direction: column; justify-content: center; align-items: center;
  background-color: #242424; background-size: cover;
  background-position: center; position: relative; overflow: hidden;
}

.cover-upload { width: 100%; height: 150px; justify-content: flex-end; }
.placeholder-text { color: #666; font-size: 12px; margin-top: 4px; position: absolute; pointer-events: none; }

.avatar-wrapper { display: flex; align-items: center; gap: 16px; }
.avatar-circle { 
  width: 100px; height: 100px; border-radius: 50%; 
  background-size: cover; background-position: center; 
  display: flex; justify-content: center; align-items: center; 
  font-size: 40px; color: #555; background-color: #333;
  position: relative; overflow: hidden; border: 2px solid #333;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute; inset: 0; display: flex; 
  justify-content: center; align-items: center;
  background: rgba(0, 0, 0, 0.6); color: white;
  font-size: 12px; cursor: pointer; opacity: 0;
  transition: opacity 0.2s; pointer-events: auto; 
}

.avatar-circle:hover .avatar-overlay { opacity: 1; }

.avatar-circle:not(:has([style*="background-image"])) .avatar-overlay { opacity: 0.6; }

.upload-btn { 
  cursor: pointer; background-color: rgba(0, 0, 0, 0.5); 
  color: white; padding: 6px 12px; border-radius: 6px; 
  font-size: 12px; margin: 8px; transition: background 0.2s; 
}
.upload-btn:hover { background-color: rgba(0, 0, 0, 0.7); }
</style>