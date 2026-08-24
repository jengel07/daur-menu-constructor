const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Remove the broken half
content = content.replace(/if \(!groups\[dateKey\]\) \{[\s\S]*?\}\);\n/, '');

// 2. Insert the correct full one
const correctGroupedLogic = `
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

content = content.replace(
  /const filteredOrders = computed\(\(\) =>/,
  `const filteredOrders = computed(() =>`
); // wait, I just need to place it AFTER filteredOrders.

content = content.replace(
  /const getOrderCountByStatus =/,
  `${correctGroupedLogic}\n\nconst getOrderCountByStatus =`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Fixed broken groupedArchivedOrders injection');

