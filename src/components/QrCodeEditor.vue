<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import type { RestaurantInfo } from '../types/menu';

const props = defineProps<{ modelValue: RestaurantInfo }>();
const emit = defineEmits(['update:model-value']);

const update = (key: string, value: any) => {
  emit('update:model-value', { ...props.modelValue, qrSettings: { ...props.modelValue.qrSettings, [key]: value } });
};
</script>

<template>
  <div class="qr-editor">
    <label>Текст на QR: <input :value="modelValue.qrSettings.text" @input="update('text', ($event.target as HTMLInputElement).value)"></label>
    <label>Фон: <input type="color" :value="modelValue.qrSettings.bgColor" @input="update('bgColor', ($event.target as HTMLInputElement).value)"></label>
    <label>Квадраты: <input type="color" :value="modelValue.qrSettings.squareColor" @input="update('squareColor', ($event.target as HTMLInputElement).value)"></label>
  </div>
</template>