<template>
  <div class="menu-data-container" :class="{ 'dark-theme': isDarkMode }">
    <!-- ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ -->
    <header class="top-nav-bar">
      <div class="nav-left">
        <button class="btn-icon" @click="router.push('/dashboard')" title="Назад">
          ⬅
        </button>
        <span class="brand-badge">У</span>
        <span class="menu-title-main">Главное меню</span>
        <span class="chevron">▼</span>
      </div>

      <div class="nav-center-actions">
        <button class="action-tab" @click="router.push('/constructor')">⚙️ Конструктор</button>
        <button class="action-tab" @click="openPrintModal">🖨️ Печать</button>
        <button class="action-tab">📱 Цифровой</button>
        <button class="action-tab active-tab">田 Данные</button>
      </div>

      <div class="nav-right">
        <span class="lang-selector">🌐 Русский ▾</span>
        <button class="btn-refresh-top" @click="handleRefresh">Обновить</button>
        <button class="btn-chat-top">💬 Чат</button>
      </div>
    </header>

    <!-- СТАТИСТИКА ПОД ШАПКОЙ -->
    <div class="sub-header-info">
      <span>Главное меню</span>
      <span class="info-muted">{{ totalItemsCount }} товаров – {{ categories.length }} категорий</span>
      <div class="progress-line-text">загружено {{ totalItemsCount }}/{{ totalItemsCount }} товаров</div>
    </div>

    <!-- ПАНЕЛЬ КНОПОК УПРАВЛЕНИЯ -->
    <div class="action-buttons-bar">
      <button class="btn-primary-orange" @click="addCategory">+ Категория</button>
      
      <!-- Кнопка Подкатегория с выпадающим списком -->
      <div class="dropdown-container" ref="subCategoryDropdownRef">
        <button class="btn-secondary-light" @click="isSubCategoryMenuOpen = !isSubCategoryMenuOpen">
          + Подкатегория ▾
        </button>
        <div v-if="isSubCategoryMenuOpen" class="dropdown-menu">
          <div 
            v-for="(cat, idx) in categories" 
            :key="'sub-cat-opt-' + idx" 
            class="dropdown-item"
            @click="addSubcategoryTo(idx)"
          >
            <span class="folder-icon">📁</span> {{ cat.name }}
          </div>
        </div>
      </div>

      <button class="btn-secondary-light" @click="addItem">+ Элемент</button>
      <button class="btn-dropdown" @click="expandAll">Expand</button>
      <button class="btn-dropdown" @click="collapseAll">Collapse</button>
      
      <!-- Кнопка Колонки с выпадающим меню управления видимостью столбцов -->
      <div class="dropdown-container" ref="columnsDropdownRef">
        <button class="btn-dropdown" @click="isColumnsMenuOpen = !isColumnsMenuOpen">
          📊 Колонки ▾
        </button>
        <div v-if="isColumnsMenuOpen" class="dropdown-menu">
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.status" /> Статус
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.image" /> Изображение
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.name" /> Название
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.desc" /> Описание
          </label>
          <label class="dropdown-item">
            <input type="checkbox" v-model="visibleColumns.price" /> Цена
          </label>
        </div>
      </div>

      <div class="search-box-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Поиск..." />
      </div>
    </div>

    <!-- ТАБЛИЦА ДАННЫХ -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-checkbox"><input type="checkbox" /></th>
            <th v-if="visibleColumns.status" class="col-status">СТАТУС</th>
            <th v-if="visibleColumns.image" class="col-img">🖼️</th>
            <th v-if="visibleColumns.name" class="col-name">НАЗВАНИЕ</th>
            <th v-if="visibleColumns.desc" class="col-desc">ОПИСАНИЕ</th>
            <th v-if="visibleColumns.price" class="col-price">ЦЕНА</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, rIdx) in paginatedRows" :key="'row-' + rIdx">
            <!-- Если это строка категории -->
            <tr v-if="row.type === 'category'" class="category-row">
              <td><input type="checkbox" /></td>
              <td v-if="visibleColumns.status">-</td>
              <td v-if="visibleColumns.image"></td>
              <td v-if="visibleColumns.name" class="category-title-cell" :colspan="getCategoryColspan()">
                <span class="folder-icon" @click="toggleCategoryExpand(row.catIdx)" style="cursor: pointer;">
                  {{ row.data.expanded !== false ? '📂' : '📁' }}
                </span> 
                <div>
                  <input type="text" v-model="row.data.name" class="inline-edit-input cat-input" />
                  <div class="sub-count">{{ row.data.items.length }} предметов</div>
                </div>
              </td>
              <td v-if="visibleColumns.desc && !isNameOnlyColspan()">-</td>
              <td v-if="visibleColumns.price && !isNameOnlyColspan()">-</td>
            </tr>

            <!-- Если это строка элемента (скрывается, если категория свернута) -->
            <tr v-else-if="row.type === 'item' && isCategoryExpanded(row.catIdx)" class="item-row">
              <td><input type="checkbox" /></td>
              <td v-if="visibleColumns.status">
                <span 
                  class="badge-visible" 
                  :class="{ 'badge-hidden': !row.data.visible }"
                  @click="row.data.visible = !row.data.visible"
                  title="Нажмите, чтобы переключить видимость"
                >
                  {{ row.data.visible ? '● Видимо' : '○ Скрыто' }}
                </span>
              </td>
              <td v-if="visibleColumns.image" class="img-cell">
                <div class="image-uploader-box" @click="triggerUpload(row.catIdx, row.itemIdx)">
                  <img v-if="row.data.image" :src="row.data.image" class="thumb-img" alt="preview" />
                  <span v-else class="upload-icon-text">📤</span>
                </div>
              </td>
              <td v-if="visibleColumns.name" class="item-name-cell">
                <span class="file-icon">📄</span> 
                <input type="text" v-model="row.data.name" class="inline-edit-input" />
                <button class="btn-variants" v-if="row.data.variants">{{ row.data.variants.length }} варианта ▾</button>
              </td>
              <td v-if="visibleColumns.desc" class="item-desc-cell">
                <input type="text" v-model="row.data.desc" class="inline-edit-input desc-input" placeholder="Введите описание..." />
              </td>
              <td v-if="visibleColumns.price" class="item-price-cell">
                <input type="number" v-model.number="row.data.price" class="inline-edit-input price-input" placeholder="350" /> ₽
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- ФУТЕР ТАБЛИЦЫ С ПАГИНАЦИЕЙ -->
    <div class="table-footer">
      <span>{{ totalRowsCount }} строк</span>
      <div class="pagination-info">
        <span>Количество строк на странице: </span>
        <select class="select-rows" v-model.number="rowsPerPage" @change="currentPage = 1">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <span>{{ paginationRangeText }} из {{ totalRowsCount }}</span>
        <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <button class="btn-page" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО ШАБЛОНА ПЕЧАТИ -->
    <div v-if="isPrintModalOpen" class="print-modal-overlay">
      <div class="print-modal-content">
        <div class="print-modal-header">
          <h3>🖨️ Предпросмотр печатного меню</h3>
          <button class="close-btn" @click="isPrintModalOpen = false">✕</button>
        </div>

        <div class="print-menu-template" id="printable-area">
          <h1 class="print-restaurant-title">ГЛАВНОЕ МЕНЮ</h1>
          <div class="print-divider"></div>

          <div v-for="(cat, cIdx) in categories" :key="'print-cat-' + cIdx" class="print-category-block">
            <h2 class="print-category-title">{{ cat.name }}</h2>
            <div class="print-items-list">
              <template v-for="(item, iIdx) in cat.items.filter(i => i.visible)" :key="'print-item-' + iIdx">
                <div class="print-menu-item">
                  <div class="print-item-left">
                    <span class="print-item-name">{{ item.name }}</span>
                    <span v-if="item.desc && item.desc !== '-'" class="print-item-desc">{{ item.desc }}</span>
                  </div>
                  <div class="print-item-dots"></div>
                  <div class="print-item-price">{{ item.price || 350 }} ₽</div>
                </div>
              </template>
            </div>
          </div>

          <div class="print-footer-note">Приятного аппетита!</div>
        </div>

        <div class="print-modal-actions">
          <button class="btn-secondary-light" @click="isPrintModalOpen = false">Закрыть</button>
          <button class="btn-primary-orange" @click="triggerBrowserPrint">Печать документа</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isDarkMode = ref(false);
const searchQuery = ref('');
const isPrintModalOpen = ref(false);
const isColumnsMenuOpen = ref(false);
const isSubCategoryMenuOpen = ref(false);

const columnsDropdownRef = ref<HTMLElement | null>(null);
const subCategoryDropdownRef = ref<HTMLElement | null>(null);

// Управление видимостью колонок
const visibleColumns = ref({
  status: true,
  image: true,
  name: true,
  desc: true,
  price: true
});

// Закрытие выпадающих меню при клике вне их
const handleClickOutside = (event: MouseEvent) => {
  if (columnsDropdownRef.value && !columnsDropdownRef.value.contains(event.target as Node)) {
    isColumnsMenuOpen.value = false;
  }
  if (subCategoryDropdownRef.value && !subCategoryDropdownRef.value.contains(event.target as Node)) {
    isSubCategoryMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Вычисление colspan для строки категории в зависимости от скрытых колонок
const getCategoryColspan = () => {
  let count = 1; // название всегда учитывается базово
  if (visibleColumns.value.status) count++;
  if (visibleColumns.value.image) count++;
  if (visibleColumns.value.desc) count++;
  if (visibleColumns.value.price) count++;
  return count;
};

const isNameOnlyColspan = () => {
  return !visibleColumns.value.status && !visibleColumns.value.image && !visibleColumns.value.desc && !visibleColumns.value.price;
};

// Параметры пагинации
const currentPage = ref(1);
const rowsPerPage = ref(10);

const categories = ref([
  {
    name: 'Блюда на завтрак',
    expanded: true,
    items: [
      { name: 'Яичница с ветчиной', desc: 'с помидорами и зеленью', price: 150, visible: true, image: '' },
      { name: 'Омлет с овощами', desc: 'болгарский перец, цукини', price: 150, visible: true, image: '' },
      { name: 'Омлет с ветчиной и помидорами', desc: 'сырная корочка', price: 150, visible: true, image: '' },
      { name: 'Пельмени домашние', desc: 'со сметаной и маслом', price: 150, visible: true, image: '' },
      { name: 'Вареники с сулугуни', desc: 'с сыром, творогом', price: 150, visible: true, image: '' },
      { name: 'Вареники с картошкой', desc: 'с жареным луком', price: 120, visible: true, image: '' },
      { name: 'Блины фирменные', desc: 'с творогом со сметаной', price: 120, visible: true, image: '' },
      { name: 'Сырники из фермерского творога', desc: 'с ягодами со сметаной', price: 180, visible: true, image: '' },
    ]
  },
  {
    name: 'Гарниры и закуски',
    expanded: true,
    items: [
      { name: 'Пюре картофельное', desc: 'нежное с маслом и сливками', price: 100, visible: true, image: '', variants: ['Стандартный', 'Большой'] },
      { name: 'Картофель фри', desc: 'золотистый соус тартар', price: 130, visible: true, image: '' },
      { name: 'Рис отварной', desc: 'ароматный басмати', price: 90, visible: true, image: '' },
      { name: 'Гречка рассыпчатая', desc: 'с сливочным маслом', price: 90, visible: true, image: '' },
    ]
  }
]);

const totalItemsCount = computed(() => {
  return categories.value.reduce((acc, cat) => acc + cat.items.length, 0);
});

// Функции для Expand / Collapse всего дерева
const expandAll = () => {
  categories.value.forEach(cat => { cat.expanded = true; });
};

const collapseAll = () => {
  categories.value.forEach(cat => { cat.expanded = false; });
};

const toggleCategoryExpand = (catIdx: number) => {
  categories.value[catIdx].expanded = categories.value[catIdx].expanded === false ? true : false;
};

const isCategoryExpanded = (catIdx: number) => {
  return categories.value[catIdx].expanded !== false;
};

// Плоский список всех строк таблицы (категории + элементы) с учетом поиска
const allFlattenedRows = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const rows: Array<any> = [];

  categories.value.forEach((cat, catIdx) => {
    const filteredItems = cat.items.filter(item => 
      !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );

    const catMatches = !q || cat.name.toLowerCase().includes(q);
    if (!catMatches && filteredItems.length === 0) return;

    rows.push({
      type: 'category',
      data: cat,
      catIdx
    });

    filteredItems.forEach((item) => {
      const itemIdx = cat.items.indexOf(item);
      rows.push({
        type: 'item',
        data: item,
        catIdx,
        itemIdx
      });
    });
  });

  return rows;
});

const totalRowsCount = computed(() => allFlattenedRows.value.length);

const totalPages = computed(() => {
  return Math.ceil(totalRowsCount.value / rowsPerPage.value) || 1;
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return allFlattenedRows.value.slice(start, end);
});

const paginationRangeText = computed(() => {
  if (totalRowsCount.value === 0) return '0–0';
  const start = (currentPage.value - 1) * rowsPerPage.value + 1;
  const end = Math.min(currentPage.value * rowsPerPage.value, totalRowsCount.value);
  return `${start}–${end}`;
});

const handleRefresh = () => {
  window.location.reload();
};

const addCategory = () => {
  categories.value.push({
    name: 'Новая категория',
    expanded: true,
    items: [
      { name: 'Новое блюдо в категории', desc: 'описание новинки', price: 200, visible: true, image: '' }
    ]
  });
  currentPage.value = totalPages.value;
};

const addSubcategoryTo = (catIndex: number) => {
  categories.value[catIndex].items.push({
    name: 'Новая подкатегория / элемент',
    desc: 'свежеприготовленное блюдо',
    price: 200,
    visible: true,
    image: ''
  });
  isSubCategoryMenuOpen.value = false;
  currentPage.value = totalPages.value;
};

const addItem = () => {
  if (categories.value.length === 0) {
    addCategory();
  }
  categories.value[0].items.push({
    name: 'Новый элемент меню',
    desc: 'рекомендуется шеф-поваром',
    price: 250,
    visible: true,
    image: ''
  });
  currentPage.value = totalPages.value;
};

const triggerUpload = (catIdx: number, itemIdx: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          categories.value[catIdx].items[itemIdx].image = uploadEvent.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

const openPrintModal = () => {
  isPrintModalOpen.value = true;
};

const triggerBrowserPrint = () => {
  window.print();
};
</script>

<style scoped>
.menu-data-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: sans-serif;
  color: #111827;
}

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 15px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.brand-badge {
  background: #22c55e;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
}

.nav-center-actions {
  display: flex;
  gap: 6px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}

.action-tab {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #4b5563;
}

.action-tab.active-tab {
  background: #111827;
  color: white;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.btn-refresh-top {
  background: #646cff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-chat-top {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.sub-header-info {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 700;
}

.info-muted {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.progress-line-text {
  margin-left: auto;
  font-size: 12px;
  color: #f97316;
}

.action-buttons-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  background: #ffffff;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  position: relative;
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 100;
  min-width: 180px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.btn-primary-orange {
  background: #f97316;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary-light, .btn-dropdown {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.search-box-wrapper {
  margin-left: auto;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 8px;
  gap: 6px;
}

.search-box-wrapper input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  color: #6b7280;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.category-row {
  background: #fcfcfc;
  font-weight: 600;
}

.category-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}

.badge-visible {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
}

.badge-hidden {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.image-uploader-box {
  width: 36px;
  height: 36px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f8fafc;
  overflow: hidden;
}

.image-uploader-box:hover {
  border-color: #f97316;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon-text {
  font-size: 14px;
}

.inline-edit-input {
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: inherit;
  width: 80%;
}

.inline-edit-input:hover, .inline-edit-input:focus {
  border-color: #d1d5db;
  background: #ffffff;
  outline: none;
}

.cat-input {
  font-weight: 600;
  font-size: 14px;
}

.desc-input {
  width: 100%;
}

.price-input {
  width: 60px;
}

.btn-variants {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  margin-left: 10px;
  cursor: pointer;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  font-size: 13px;
  color: #6b7280;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-rows {
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.btn-page {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стили модального окна печати */
.print-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.print-modal-content {
  background: white;
  width: 650px;
  max-height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.print-modal-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.print-modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.print-menu-template {
  padding: 30px;
  background: #fff;
  overflow-y: auto;
  font-family: 'Georgia', serif;
  color: #222;
}

.print-restaurant-title {
  text-align: center;
  font-size: 24px;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
}

.print-divider {
  width: 50px;
  height: 2px;
  background: #333;
  margin: 0 auto 25px auto;
}

.print-category-block {
  margin-bottom: 20px;
}

.print-category-title {
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 4px;
  margin-bottom: 12px;
  color: #444;
}

.print-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 14px;
}

.print-item-left {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.print-item-name {
  font-weight: bold;
}

.print-item-desc {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.print-item-dots {
  flex-grow: 1;
  border-bottom: 1px dotted #bbb;
  margin: 0 8px;
}

.print-item-price {
  font-weight: bold;
  white-space: nowrap;
}

.print-footer-note {
  text-align: center;
  margin-top: 30px;
  font-style: italic;
  font-size: 12px;
  color: #555;
}

.print-modal-actions {
  padding: 15px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 10px;
    background: white;
  }
  .print-modal-overlay {
    background: transparent;
  }
}
</style>