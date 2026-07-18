<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MenuItem, MenuCategory } from '../types/menu';

// ИСПРАВЛЕНО: Корректный синтаксис объединения типов для ref
const fileInput = ref<HTMLInputElement | null>(null);

// !!! НОВЫЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ ДЛЯ ЗАГРУЗКИ
const isImageLoading = ref(false); // Показывает, идет ли загрузка прямо сейчас
const imageLoadError = ref<string | null>(null); // Хранит текст ошибки, если она произойдет

const props = defineProps<{
  items: MenuItem[];
  categories: MenuCategory[];
}>();

const emit = defineEmits<{
  (e: 'update-items', items: MenuItem[]): void;
  (e: 'update-categories', categories: MenuCategory[]): void;
}>();

// Состояние поиска и фильтрации
const searchQuery = ref('');
const selectedCategoryId = ref<string>('all');

// Состояние модального окна добавления/редактирования
const isModalOpen = ref(false);

// ИСПРАВЛЕНО: Расширяем Partial типом для картинки
const editingItem = ref<(Partial<MenuItem> & { image?: string }) | null>(null);

// !!! ОБНОВЛЕННАЯ ФУНКЦИЯ ОБРАБОТКИ ЗАГРУЗКИ
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  imageLoadError.value = null; // Сбрасываем старую ошибку перед новой загрузкой

  if (target.files && target.files[0]) {
    const file = target.files[0];

    // Простая валидация типа файла (только изображения)
    if (!file.type.startsWith('image/')) {
      imageLoadError.value = 'Пожалуйста, выберите файл изображения (png, jpg).';
      return;
    }

    const reader = new FileReader();
    
    // 1. Включаем индикатор загрузки
    isImageLoading.value = true;

    reader.onload = (e) => {
      // Искусственная задержка 1.5 секунды, чтобы увидеть спиннер
      // В реальном проекте убрать setTimeout и оставить только код внутри!
      setTimeout(() => {
        if (editingItem.value) {
          editingItem.value.image = e.target?.result as string;
        }
        // 2. Выключаем индикатор загрузки
        isImageLoading.value = false;
      }, 1500);
    };

    reader.onerror = () => {
      // Обработка ошибки чтения файла
      isImageLoading.value = false;
      imageLoadError.value = 'Ошибка при чтении файла. Попробуйте еще раз.';
    };
    
    reader.readAsDataURL(file);
  }
};

// Фильтрация списка блюд в реальном времени
const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategoryId.value === 'all' || item.categoryId === selectedCategoryId.value;
    return matchesSearch && matchesCategory;
  });
});

// Быстрое переключение доступности блюда
const toggleAvailability = (itemId: string) => {
  const updated = props.items.map(item => {
    if (item.id === itemId) {
      return { ...item, isAvailable: !item.isAvailable };
    }
    return item;
  });
  emit('update-items', updated);
};

// Удаление блюда
const deleteItem = (itemId: string) => {
  if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
    const updated = props.items.filter(item => item.id !== itemId);
    emit('update-items', updated);
  }
};

// Открытие формы редактирования или создания
const openEditModal = (item?: MenuItem) => {
  if (item) {
    editingItem.value = { ...item };
  } else {
    editingItem.value = {
      id: 'item-' + Date.now(),
      name: '',
      description: '',
      price: 0,
      image: '',
      categoryId: props.categories[0]?.id || '',
      isAvailable: true
    };
  }
  isModalOpen.value = true;
};

// Сохранение изменений в модальном окне
const saveItem = () => {
  if (!editingItem.value || !editingItem.value.name || isImageLoading.value) return;

  const updatedItems = [...props.items];
  const index = updatedItems.findIndex(item => item.id === editingItem.value?.id);

  if (index !== -1) {
    updatedItems[index] = { ...updatedItems[index], ...editingItem.value } as MenuItem;
  } else {
    updatedItems.push(editingItem.value as MenuItem);
  }

  emit('update-items', updatedItems);
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
  imageLoadError.value = null; // Сброс ошибки при закрытии
  isImageLoading.value = false; // Сброс загрузки при закрытии
};
</script>
<template>
  <div class="menu-editor">
    
    <!-- Панель инструментов: поиск, категории и кнопка "Добавить" -->
    <div class="toolbar">
      <div class="filter-group">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Поиск блюда..." 
          class="search-input"
        />
        
        <select v-model="selectedCategoryId" class="category-select">
          <option value="all">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <button @click="openEditModal()" class="btn-add">
        ➕ Добавить блюдо
      </button>
    </div>

    <!-- Сетка карточек блюд -->
    <div v-if="filteredItems.length > 0" class="items-grid">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="item-card"
        :class="{ 'not-available': !item.isAvailable }"
      >
        <div class="card-header">
          <span class="category-badge">
            {{ categories.find(c => c.id === item.categoryId)?.name || 'Без категории' }}
          </span>
          <div class="actions">
            <button @click="openEditModal(item)" class="action-btn edit-btn" title="Редактировать">✏️</button>
            <button @click="deleteItem(item.id)" class="action-btn delete-btn" title="Удалить">🗑️</button>
          </div>
        </div>

        <div class="card-body">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-desc">{{ item.description }}</p>
        </div>

        <div class="card-footer">
          <span class="item-price">{{ item.price }} ₽</span>
          
          <label class="switch">
            <input 
              type="checkbox" 
              :checked="item.isAvailable" 
              @change="toggleAvailability(item.id)"
            />
            <span class="slider round"></span>
            <span class="switch-label">{{ item.isAvailable ? 'Активно' : 'В стопе' }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Если ничего не найдено -->
    <div v-else class="empty-results">
      <p>Ничего не найдено по вашему запросу 🧐</p>
    </div>

    <!-- Модальное окно редактирования/добавления -->
    <div v-if="isModalOpen && editingItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">

        <!-- Заголовок (один!) -->
    <h2 class="modal-title">
      {{ props.items.some(i => i.id === (editingItem?.id ?? '')) ? 'Редактировать блюдо' : 'Новое блюдо' }}
    </h2>
      
<!-- Блок загрузки фото -->
<div class="form-group">
  <label>Фото блюда</label>
  <div 
    class="image-upload-area" 
    :class="{ 'is-loading': isImageLoading, 'has-error': imageLoadError }"
    @click="!isImageLoading && fileInput?.click()"
  >
    <!-- 1. Пока идет загрузка - показываем спиннер -->
    <div v-if="isImageLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span class="loading-text">Обработка...</span>
    </div>

    <!-- 2. Ошибка загрузки -->
    <div v-else-if="imageLoadError" class="error-message">
      <span>⚠️ {{ imageLoadError }}</span>
      <span class="retry-text">Нажмите, чтобы попробовать снова</span>
    </div>

    <!-- 3. Обычное состояние (есть фото или нет фото) -->
    <template v-else>
      <img v-if="editingItem.image" :src="editingItem.image" class="preview-img" alt="Превью" />
      <span v-else>+ Нажмите для загрузки фото</span>
    </template>

    <input 
      type="file" 
      ref="fileInput" 
      @change="handleImageUpload" 
      accept="image/*" 
      style="display: none" 
    />
  </div>
</div>
        
        <div class="form-group">
          <label>Название блюда</label>
          <input v-model="editingItem.name" type="text" placeholder="Например, Суп Том Ям" />
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="editingItem.description" placeholder="Ингредиенты, особенности вкуса..." rows="3"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Цена (₽)</label>
            <input v-model.number="editingItem.price" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Категория</label>
            <select v-model="editingItem.categoryId">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn-cancel">Отмена</button>
          <button @click="saveItem" class="btn-save">Сохранить</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.menu-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Панель инструментов */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-grow: 1;
  max-width: 600px;
}

.search-input {
  flex-grow: 1;
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  padding: 10px 16px;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
}

.category-select {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  padding: 10px 16px;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-add {
  background: #646cff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #535bf2;
}

/* Сетка карточек */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: transform 0.2s, border-color 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: #4a4a4a;
}

.item-card.not-available {
  opacity: 0.6;
  border-style: dashed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-badge {
  background: rgba(255, 255, 255, 0.05);
  color: #a0a0a0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.card-body {
  margin-bottom: 16px;
  flex-grow: 1;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-desc {
  margin: 0;
  color: #888888;
  font-size: 0.85rem;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #2e2e2e;
  padding-top: 12px;
}

.item-price {
  font-weight: 700;
  color: #646cff;
  font-size: 1.1rem;
}

/* Переключатель Toggle (Свитч) */
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  width: 34px;
  height: 20px;
  background-color: #444;
  transition: .2s;
  border-radius: 34px;
  position: relative;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #646cff;
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.switch-label {
  font-size: 0.75rem;
  color: #a0a0a0;
  user-select: none;
}

.empty-results {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  color: #a0a0a0;
}

.form-group input, .form-group textarea, .form-group select {
  background: #141414;
  border: 1px solid #2e2e2e;
  border-radius: 8px;
  padding: 10px 12px;
  color: white;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #333;
  color: #a0a0a0;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-save {
  background: #646cff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #535bf2;
}
.image-upload-area {
  width: 100%;
  height: 140px;
  border: 2px dashed #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  color: #666;
  background: #141414;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- СТИЛИ ДЛЯ ИНДИКАТОРА ЗАГРУЗКИ (ДОБАВИТЬ В КОНЕЦ) --- */

/* Область загрузки в состоянии загрузки или ошибки */
.image-upload-area.is-loading {
  cursor: wait;
  border-color: #646cff; /* Цвет основного CSS-файла */
}

.image-upload-area.has-error {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

/* Оверлей загрузки поверх всего внутри области */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0.8); /* Чуть темнее фона */
  position: absolute;
  top: 0;
  left: 0;
}

.loading-text {
  font-size: 0.8rem;
  color: #646cff;
}

/* Стили CSS-спиннера */
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(100, 108, 255, 0.2);
  border-top-color: #646cff; /* Цвет основного CSS-файла */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Блок сообщения об ошибке */
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  text-align: center;
  font-size: 0.85rem;
}

.retry-text {
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
}

/* Анимация вращения */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>