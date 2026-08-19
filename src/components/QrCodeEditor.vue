<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { RestaurantInfo } from '../types/menu';
import html2canvas from 'html2canvas';
import QrcodeVue from 'qrcode.vue';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:model-value']);

const downloadFormat = ref('PNG');
const exportRef = ref<HTMLElement | null>(null);

const update = (key: string, value: any) => {
  emit('update:model-value', { 
    ...props.modelValue, 
    qrSettings: { ...props.modelValue.qrSettings, [key]: value } 
  });
};

// --- АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ ССЫЛКИ ---
onMounted(() => {
  const restaurantId = (props.modelValue as any).id || (props.modelValue as any).restaurantId;
  const currentUrl = props.modelValue.qrSettings?.url || '';

  // Если URL пустой, содержит старый предпросмотр или стоит пример — генерируем автоматически
  if (restaurantId && (!currentUrl || currentUrl.includes('preview=true') || currentUrl === 'https://example.com')) {
    // Формируем правильную ссылку с текущим IP и нужным ID
    const autoUrl = `${window.location.origin}/client?id=${restaurantId}`;
    update('url', autoUrl);
  }
});

const downloadQRCode = async () => {
  if (!exportRef.value) return;
  
  if (downloadFormat.value === 'PNG') {
    const canvas = await html2canvas(exportRef.value, {
      scale: 3,
      backgroundColor: props.modelValue?.qrSettings?.textBgColor || '#000000',
      useCORS: true
    });
    
    const link = document.createElement('a');
    link.download = `qr-menu-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else if (downloadFormat.value === 'SVG') {
    const svgElement = exportRef.value.querySelector('svg');
    if (!svgElement) return;

    const fullSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="340" viewBox="0 0 300 340">
        <rect width="100%" height="100%" rx="16" fill="${props.modelValue.qrSettings?.textBgColor || '#000000'}" />
        <g transform="translate(30, 20)">
          <rect width="240" height="240" rx="10" fill="${props.modelValue?.qrSettings?.textBgColor || '#ffffff'}" />
          <g transform="translate(20, 20)">
            ${svgElement.innerHTML}
          </g>
        </g>
        <text x="150" y="300" 
            fill="${props.modelValue.qrSettings?.textColor || '#ffffff'}" 
            font-family="${props.modelValue.qrSettings?.fontFamily || 'Comfortaa'}" 
            font-size="16" 
            font-weight="bold" 
            text-anchor="middle">
          ${props.modelValue.qrSettings?.text || ''}
        </text>
      </svg>
    `;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-menu-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
};
</script>

<template>
  <div class="qr-page-wrapper">
    <!-- Общий контейнер в ряд: настройки и превью -->
    <div class="qr-editor-container">
      
      <!-- Карточка настроек -->
      <div class="controls-card">
        <h3>Настройки QR-кода</h3>
        
        <div class="control-group">
          <label>Ссылка для QR:</label> 
          <input 
            type="text" 
            :value="modelValue.qrSettings?.url" 
            @input="update('url', ($event.target as HTMLInputElement).value)"
            placeholder="https://example.com"
          >
        </div>

        <div class="control-group">
          <label>Текст под QR:</label> 
          <input 
            type="text" 
            :value="modelValue.qrSettings?.text" 
            @input="update('text', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Шрифт текста:</label>
          <select 
            :value="modelValue.qrSettings?.fontFamily || 'Comfortaa'" 
            @change="update('fontFamily', ($event.target as HTMLSelectElement).value)"
          >
            <option value="Comfortaa">Comfortaa</option>
            <option value="Lora">Lora (Elegant)</option>
            <option value="Playfair Display">Playfair Display (Classic)</option>
            <option value="Oswald">Oswald (Bold)</option>
            <option value="Caveat">Caveat (Handwritten)</option>
            <option value="Montserrat">Montserrat (Geometric)</option>
            <option value="Arvo">Arvo (Sturdy)</option>
            <option value="Lobster">Lobster (Bold Script)</option>
            <option value="Merriweather">Merriweather (Readable)</option>
            <option value="Anton">Anton (Impactful)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Фон QR:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.bgColor" 
            @input="update('bgColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Квадраты:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.squareColor" 
            @input="update('squareColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Текст Фон:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.textBgColor" 
            @input="update('textBgColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="control-group">
          <label>Текст Цвет:</label> 
          <input 
            type="color" 
            :value="modelValue.qrSettings?.textColor" 
            @input="update('textColor', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <!-- Блок скачивания -->
        <div class="download-section">
          <div class="control-group">
            <label>Формат файла:</label>
            <select v-model="downloadFormat">
              <option value="PNG">PNG</option>
              <option value="SVG">SVG</option>
            </select>
          </div>
          <button class="download-btn" @click="downloadQRCode">
            📥 Скачать QR-код
          </button>
        </div>
      </div>

      <!-- Блок живого превью QR-кода справа -->
      <div class="preview-section">
        <span class="preview-title">Предпросмотр</span>
        <div 
          class="qr-card-export" 
          :style="{ background: modelValue.qrSettings?.textBgColor || '#000000' }"
        >
          <div class="qr-box-export" :style="{ background: modelValue.qrSettings?.bgColor || '#ffffff' }">
            <QrcodeVue 
              :value="modelValue.qrSettings?.url || 'https://example.com'" 
              :size="150" 
              :background="modelValue.qrSettings?.bgColor || '#ffffff'" 
              :foreground="modelValue.qrSettings?.squareColor || '#000000'" 
              level="H" 
            />
          </div>
          <div 
            class="qr-label-export" 
            :style="{ 
              color: modelValue.qrSettings?.textColor || '#ffffff',
              fontFamily: modelValue.qrSettings?.fontFamily || 'Comfortaa'
            }"
          >
            {{ modelValue.qrSettings?.text }}
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Скрытый элемент для генерации точной копии карточки в высоком разрешении при скачивании -->
  <div style="position: absolute; left: -9999px; top: -9999px;">
    <div 
      ref="exportRef" 
      class="qr-card-export" 
      :style="{ background: modelValue.qrSettings?.textBgColor || '#000000' }"
    >
      <div class="qr-box-export" :style="{ background: modelValue.qrSettings?.bgColor || '#ffffff' }">
        <QrcodeVue 
          :value="modelValue.qrSettings?.url || 'https://example.com'" 
          :size="200" 
          :background="modelValue.qrSettings?.bgColor || '#ffffff'" 
          :foreground="modelValue.qrSettings?.squareColor || '#000000'" 
          level="H" 
        />
      </div>
      <div 
        class="qr-label-export" 
        :style="{ 
          color: modelValue.qrSettings?.textColor || '#ffffff',
          fontFamily: modelValue.qrSettings?.fontFamily || 'Comfortaa'
        }"
      >
        {{ modelValue.qrSettings?.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Главный контейнер выстраивает настройки и превью в ряд */
.qr-editor-container { 
  display: flex; 
  flex-direction: row;
  align-items: flex-start;
  gap: 24px; 
  flex-wrap: wrap;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview-title {
  font-size: 13px;
  color: var(--text-muted, #aaa);
  margin-left: 4px;
}

.controls-card {
  background: var(--card-bg, #c0c0c030);
  border: 1px solid var(--border-color, #333);
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-main, #fff);
  width: 380px;
}

:global(.constructor-wrapper.light-theme) .controls-card {
  background: var(--card-bg, #ffffff) !important;
  border-color: var(--border-color, #545454) !important;
  color: var(--text-main, #333) !important;
}

.controls-card h3 {
  margin-bottom: 5px;
  font-size: 18px;  
  color: var(--text-main);
}
.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.control-group label {
  font-size: 14px;
  color: var(--text-muted, #ccc);
}

:global(.constructor-wrapper.light-theme) .control-group label {
  color: var(--text-muted, #666) !important;
}

.control-group input[type="text"],
.control-group select {
  background: var(--input-bg, #8e8d8d5b);
  border: 1px solid var(--border-color, #444);
  color: var(--text-main, #fff);
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
  width: 180px;
}

:global(.constructor-wrapper.light-theme) .control-group input[type="text"],
:global(.constructor-wrapper.light-theme) .control-group select {
  background: var(--input-bg, #f4f5f7) !important;
  border-color: var(--border-color, #555555) !important;
  color: var(--text-main, #333) !important;
}

.control-group select {
  cursor: pointer;
}
.control-group input[type="color"] {
  border: none;
  width: 40px;
  height: 32px;
  cursor: pointer;
  background: transparent;
  border-radius: 4px;
}
.download-section {
  margin-top: 10px;
  border-top: 1px solid var(--border-color, #333);
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.download-btn {
  background: #ff5722;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}
.download-btn:hover {
  background: #f4511e;
}

.qr-card-export {
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 210px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.qr-box-export {
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-label-export {
  margin-top: 12px;
  font-weight: bold;
  font-size: 15px;
  width: 100%;
  word-break: break-word;
}
</style>