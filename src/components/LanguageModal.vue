<template>
  <div class="bottom-sheet-overlay" @click.self="$emit('close')">
    <div class="bottom-sheet">
      <div class="sheet-indicator"></div>
      <h3>{{ title }}</h3>
      <div class="lang-grid">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          class="lang-option-btn" 
          :class="{ active: currentLang === lang.code }" 
          :style="currentLang === lang.code ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}" 
          @click="$emit('select', lang.code)"
        >
          {{ lang.flag }} {{ lang.name }}
        </button>
      </div>
      <div class="modal-footer-text">© Проект от Web-Visual-World | 2024</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentLang: string;
  primaryColor: string;
  title: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'select', langCode: string): void;
}>();

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ab', name: 'Аԥсшәа', flag: '🟢' },
];
</script>

<style scoped>
.bottom-sheet-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  background: #1e1e1e;
  color: #fff;
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-indicator {
  width: 28px;
  height: 3px;
  background: #444;
  border-radius: 2px;
  align-self: center;
}

.bottom-sheet h3 {
  font-size: 13px;
  margin: 0;
  color: #646cff;
}

.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}

.lang-option-btn {
  background: #2a2a2a;
  color: white;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 8px;
  font-size: 10px;
  cursor: pointer;
  text-align: left;
}

.lang-option-btn.active {
  border-color: transparent;
}

.modal-footer-text {
  text-align: center;
  font-size: 8px;
  color: #666;
  margin-top: 4px;
}
</style>