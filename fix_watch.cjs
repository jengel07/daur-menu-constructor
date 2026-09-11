const fs = require('fs');

const path = 'src/components/client/PromoBanners.vue';
let code = fs.readFileSync(path, 'utf8');

const scriptRegex = /<script setup lang="ts">[\s\S]*?<\/script>/;
const scriptContent = `<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { bannersApi } from '../../api';

const props = defineProps({
  restaurantId: { type: String, required: false }
});

const banners = ref<any[]>([]);
const carousel = ref<HTMLElement | null>(null);
const currentIndex = ref(0);

const handleScroll = () => {
  if (!carousel.value) return;
  const scrollLeft = carousel.value.scrollLeft;
  const width = carousel.value.offsetWidth;
  currentIndex.value = Math.round(scrollLeft / width);
};

const fetchBanners = async () => {
  if (!props.restaurantId) return;
  try {
    const res = await bannersApi.getActive(props.restaurantId);
    banners.value = res.banners || [];
  } catch (error) {
    console.error('Failed to load banners', error);
  }
};

onMounted(fetchBanners);
watch(() => props.restaurantId, fetchBanners);

let intervalId: any;
onMounted(() => {
  intervalId = setInterval(() => {
    if (!carousel.value || banners.value.length <= 1) return;
    const width = carousel.value.offsetWidth;
    let nextIndex = currentIndex.value + 1;
    if (nextIndex >= banners.value.length) nextIndex = 0;
    carousel.value.scrollTo({ left: width * nextIndex, behavior: 'smooth' });
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>`;

code = code.replace(scriptRegex, scriptContent);
fs.writeFileSync(path, code);

// Now change v-if in PhoneMockupContent and ClientView
let mockupPath = 'src/components/PhoneMockupContent.vue';
let mockupCode = fs.readFileSync(mockupPath, 'utf8');
mockupCode = mockupCode.replace(/<PromoBanners v-if="computedRestaurantId" :restaurantId="computedRestaurantId"  \/>/g, '<PromoBanners :restaurantId="computedRestaurantId" />');
fs.writeFileSync(mockupPath, mockupCode);

let clientPath = 'src/views/ClientView.vue';
let clientCode = fs.readFileSync(clientPath, 'utf8');
clientCode = clientCode.replace(/<PromoBanners v-if="computedRestaurantId" :restaurant-id="computedRestaurantId" \/>/g, '<PromoBanners :restaurantId="computedRestaurantId" />');
fs.writeFileSync(clientPath, clientCode);

console.log('Fixed PromoBanners to watch restaurantId');

