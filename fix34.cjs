const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const groupedLogic = `
const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups: Record<string, any[]> = {};
  
  filteredOrders.value.forEach(order => {
    const dateObj = new Date(order.createdAt);
    const dateKey = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });
  
  return Object.keys(groups).map(date => ({
    date,
    orders: groups[date]
  }));
});
`;

if (!content.includes('const groups: Record<string, any[]>')) {
  content = content.replace(
    /const filteredOrders = computed\(\(\) =>/,
    `${groupedLogic}\n\nconst filteredOrders = computed(() =>`
  );
}

// Fix noOrdersIcon
content = content.replace(
  /\{ new: '🆕', progress: '⏳', done: '✅', cancelled: '❌' \}/,
  `{ new: '🆕', progress: '⏳', done: '✅', cancelled: '❌', archived: '📦' }`
);

// Fix any leftover typeLabel
content = content.replace(/typeLabel\(/g, "getOrderTypeLabel(");

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Fixed script setup injections');

