<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MenuItem, MenuCategory } from '../types/menu';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ImagePlus, 
  AlertTriangle 
} from 'lucide-vue-next';

const fileInput = ref<HTMLInputElement | null>(null);

const isImageLoading = ref(false);
const imageLoadError = ref<string | null>(null);

const props = defineProps<{
  items: MenuItem[];
  categories: MenuCategory[];
}>();

const emit = defineEmits<{
  (e: 'update-items', items: MenuItem[]): void;
  (e: 'update-categories', categories: MenuCategory[]): void;
}>();

// Синхронизация с сервером и локальным хранилищем
const syncWithServer = async (updatedItems: MenuItem[]) => {
  const dataToSave = {
    categories: props.categories,
    items: updatedItems
  };

  // Сохраняем локально для ПК
  localStorage.setItem('preview_items', JSON.stringify(updatedItems));
  localStorage.setItem('preview_categories', JSON.stringify(props.categories));

  // Отправляем на ваш Node.js сервер, чтобы телефон отображал те же данные
  try {
    await axios.post('http://192.168.31.240:3000/api/preview-menu', dataToSave);
  } catch (e) {
    console.error('Ошибка сохранения на сервер', e);
  }
};

const searchQuery = ref('');
const selectedCategoryId = ref<string>('all');

const isModalOpen = ref(false);
const editingItem = ref<(Partial<MenuItem> & { image?: string }) | null>(null);

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  imageLoadError.value = null;

  if (target.files && target.files[0]) {
    const file = target.files[0];

    if (!file.type.startsWith('image/')) {
      imageLoadError.value = 'Пожалуйста, выберите файл изображения (png, jpg).';
      return;
    }

    const reader = new FileReader();
    isImageLoading.value = true;

    reader.onload = (e) => {
      setTimeout(() => {
        if (editingItem.value) {
          editingItem.value.image = e.target?.result as string;
        }
        isImageLoading.value = false;
      }, 1000);
    };

    reader.onerror = () => {
      isImageLoading.value = false;
      imageLoadError.value = 'Ошибка при чтении файла. Попробуйте еще раз.';
    };
    
    reader.readAsDataURL(file);
  }
};

const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchesCategory = selectedCategoryId.value === 'all' || String(item.categoryId) === String(selectedCategoryId.value);
    
    return matchesSearch && matchesCategory;
  });
});

const toggleAvailability = (itemId: string | number) => {
  const updated = props.items.map(item => {
    if (item.id === itemId) {
      return { ...item, isAvailable: !item.isAvailable };
    }
    return item;
  });
  emit('update-items', updated);
  syncWithServer(updated);
};

const deleteItem = (itemId: string | number) => {
  if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
    const updated = props.items.filter(item => item.id !== itemId);
    emit('update-items', updated);
    syncWithServer(updated);
  }
};

const openEditModal = (item?: MenuItem) => {
  if (item) {
    editingItem.value = { ...item };
  } else {
    const firstCat = props.categories[0];
    editingItem.value = {
      id: 'item-' + Date.now(),
      name: '',
      description: '',
      price: 150,
      image: '',
      categoryId: firstCat ? firstCat.id : '',
      isAvailable: true
    };
  }
  isModalOpen.value = true;
};

const saveItem = () => {
  if (!editingItem.value || !editingItem.value.name || isImageLoading.value) return;

  const updatedItems = [...props.items];
  const index = updatedItems.findIndex(i => String(i.id) === String(editingItem.value?.id));

  if (index !== -1) {
    updatedItems[index] = { ...updatedItems[index], ...editingItem.value } as MenuItem;
  } else {
    updatedItems.push(editingItem.value as MenuItem);
  }

  emit('update-items', updatedItems);
  syncWithServer(updatedItems);
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  editingItem.value = null;
  imageLoadError.value = null;
  isImageLoading.value = false;
};
</script>

<template>
  <div class="menu-editor">
    <div class="toolbar">
      <div class="filter-group">
        <div style="position: relative; flex-grow: 1; display: flex; align-items: center;">
          <Search :size="18" stroke-width="2" style="position: absolute; left: 12px; color: var(--text-muted, #888);" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск блюда..." 
            class="search-input"
            style="padding-left: 38px; width: 100%; box-sizing: border-box;"
          />
        </div>
        
        <select v-model="selectedCategoryId" class="category-select">
          <option value="all">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <button @click="openEditModal()" class="btn-add" style="display: flex; align-items: center; gap: 6px;">
        <Plus :size="16" stroke-width="2.5" /> Добавить блюдо
      </button>
    </div>

    <div v-if="filteredItems.length > 0" class="items-grid">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="item-card"
        :class="{ 'not-available': !item.isAvailable }"
      >
        <div class="card-image-wrapper" v-if="item.image">
          <img :src="item.image" :alt="item.name" class="card-thumb" />
        </div>

        <div class="card-header">
          <span class="category-badge">
            {{ categories.find(c => String(c.id) === String(item.categoryId))?.name || 'Без категории' }}
          </span>
          <div class="actions">
            <button @click="openEditModal(item)" class="action-btn edit-btn" title="Редактировать">
              <Pencil :size="15" stroke-width="2" />
            </button>
            <button @click="deleteItem(item.id)" class="action-btn delete-btn" title="Удалить">
              <Trash2 :size="15" stroke-width="2" />
            </button>
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

    <div v-else class="empty-results">
      <p>Ничего не найдено по вашему запросу 🧐</p>
    </div>

    <div v-if="isModalOpen && editingItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h2 class="modal-title">
          {{ props.items.some(i => String(i.id) === String(editingItem?.id)) ? 'Редактировать блюдо' : 'Новое блюдо' }}
        </h2>
      
        <div class="form-group">
          <label>Фото блюда</label>
          <div 
            class="image-upload-area" 
            :class="{ 'is-loading': isImageLoading, 'has-error': imageLoadError }"
            @click="!isImageLoading && fileInput?.click()"
          >
            <div v-if="isImageLoading" class="loading-overlay">
              <div class="spinner"></div>
              <span class="loading-text">Обработка...</span>
            </div>

            <div v-else-if="imageLoadError" class="error-message">
              <span style="display: flex; align-items: center; gap: 4px;"><AlertTriangle :size="16" /> {{ imageLoadError }}</span>
              <span class="retry-text">Нажмите, чтобы попробовать снова</span>
            </div>

            <template v-else>
              <img v-if="editingItem.image" :src="editingItem.image" class="preview-img" alt="Превью" />
              <span v-else style="display: flex; align-items: center; gap: 6px;">
                <ImagePlus :size="20" stroke-width="1.5" /> Нажмите для загрузки фото
              </span>
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
          <input v-model="editingItem.name" type="text" placeholder="Например, Яичница с ветчиной" />
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
  background: var(--bg-input, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-main, white);
  font-size: 0.95rem;
}

.category-select {
  background: var(--bg-input, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-main, white);
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-add {
  background: var(--accent, #646cff);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  opacity: 0.9;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
}

.card-image-wrapper {
  width: calc(100% + 32px);
  height: 140px;
  margin: -16px -16px 12px -16px;
  overflow: hidden;
}

.card-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent, #4a4a4a);
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
  background: var(--badge-bg, rgba(255, 255, 255, 0.05));
  color: var(--badge-color, #a0a0a0);
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #a0a0a0);
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.action-btn:hover {
  background: var(--action-hover, rgba(255, 255, 255, 0.1));
  color: var(--text-main, #fff);
}

.card-body {
  margin-bottom: 16px;
  flex-grow: 1;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main, white);
}

.item-desc {
  margin: 0;
  color: var(--text-muted, #888888);
  font-size: 0.85rem;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color, #2e2e2e);
  padding-top: 12px;
}

.item-price {
  font-weight: 700;
  color: var(--accent, #646cff);
  font-size: 1.1rem;
}

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
  background-color: var(--slider-bg, #444);
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
  background-color: var(--accent, #646cff);
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.switch-label {
  font-size: 0.75rem;
  color: var(--text-muted, #a0a0a0);
  user-select: none;
}

.empty-results {
  text-align: center;
  padding: 40px;
  color: var(--text-muted, #666);
}

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
  background: var(--bg-card, #1e1e1e);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  color: var(--text-main, white);
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-main, white);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-muted, #a0a0a0);
}

.form-group input, .form-group textarea, .form-group select {
  background: var(--bg-input-inner, #141414);
  border: 1px solid var(--border-color, #2e2e2e);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-main, white);
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
  border: 1px solid var(--border-color, #333);
  color: var(--text-muted, #a0a0a0);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--action-hover, rgba(255, 255, 255, 0.05));
}

.btn-save {
  background: var(--accent, #646cff);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  opacity: 0.9;
}

.image-upload-area {
  width: 100%;
  height: 140px;
  border: 2px dashed var(--border-dashed, #333);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  color: var(--text-muted, #666);
  background: var(--bg-input-inner, #141414);
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload-area.is-loading {
  cursor: wait;
  border-color: var(--accent, #646cff);
}

.image-upload-area.has-error {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: var(--loading-overlay-bg, rgba(20, 20, 20, 0.8));
  position: absolute;
  top: 0;
  left: 0;
}

.loading-text {
  font-size: 0.8rem;
  color: var(--accent, #646cff);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(100, 108, 255, 0.2);
  border-top-color: var(--accent, #646cff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

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
  color: var(--text-muted, #888);
  margin-top: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>