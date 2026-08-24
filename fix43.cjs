const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// I will extract everything between the end of allOrders and the start of filteredOrders
// to clean it up.

const startMarker = '}); // end of fetchOrders or whatever'; // wait, it's easier to use a regex to clean up the bad lines.
// Let's replace the whole section from line 410 to 425 with nothing, then insert properly.

let lines = content.split('\n');
// find filteredOrders
const filteredIdx = lines.findIndex(l => l.includes('const filteredOrders = computed(() =>'));
const getOrderCountIdx = lines.findIndex(l => l.includes('const getOrderCountByStatus ='));

if (filteredIdx !== -1 && getOrderCountIdx !== -1) {
  // Let's remove any groupedArchivedOrders related stuff BEFORE filteredOrders
  // Actually let's just clear lines 410 to filteredIdx - 1
  for(let i = filteredIdx - 20; i < filteredIdx; i++) {
    if (lines[i] && (lines[i].includes('return Object.keys') || lines[i].includes('date,') || lines[i].includes('orders: groups') || lines[i].includes('}));') || lines[i].includes('});'))) {
       lines[i] = '';
    }
  }
}

content = lines.join('\n');

// Also check for multiple groupedArchivedOrders
content = content.replace(/const groupedArchivedOrders = computed\(\(\) => \{[\s\S]*?\}\);\n/g, '');

const correctGroupedLogic = `
const groupedArchivedOrders = computed(() => {
  if (currentTab.value !== 'archived') return [];
  const groups: Record<string, any[]> = {};
  
  filteredOrders.value.forEach((order: any) => {
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
  /const getOrderCountByStatus =/,
  `${correctGroupedLogic}\n\nconst getOrderCountByStatus =`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', content);
console.log('Cleaned and fixed OrderSettingsEditor computed blocks');

