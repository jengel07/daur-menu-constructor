const fs = require('fs');
let content = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');
const lines = content.split('\n');

const getOrderCountIdx = lines.findIndex(l => l.includes('const getOrderCountByStatus ='));
const fetchOrdersIdx = lines.findIndex(l => l.includes('const fetchOrders ='));
const filteredOrdersIdx = lines.findIndex(l => l.includes('const filteredOrders ='));
// find the first line after fetchOrders setup (or just replace the whole section)

// Let's just use regex to clean up.
let newContent = content.replace(/const filteredOrders = computed\(\(\) =>[\s\S]*?const currentTabLabel = computed/g, 
`const filteredOrders = computed(() =>
  allOrders.value.filter(o =>
    o.status === currentTab.value ||
    (currentTab.value === 'new' && o.status === 'open')
  )
);

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

const getOrderCountByStatus = (status: string) =>
  allOrders.value.filter(o =>
    o.status === status || (status === 'new' && o.status === 'open')
  ).length;

const currentTabLabel = computed`
);

// We still have garbage between line 410 and 420.
// Let's replace anything that looks like orphaned code
newContent = newContent.replace(/if \(!groups\[dateKey\]\) \{[\s\S]*?\}\);\n/g, '');
newContent = newContent.replace(/return Object\.keys\(groups\)[\s\S]*?\}\);\n/g, '');

// Since we might have deleted the good groupedArchivedOrders, let's inject it again safely
newContent = newContent.replace(/const groupedArchivedOrders = computed\(\(\) => \{[\s\S]*?\}\);\n/g, '');

newContent = newContent.replace(
  /const getOrderCountByStatus =/,
  `const groupedArchivedOrders = computed(() => {
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
});\n\nconst getOrderCountByStatus =`
);

fs.writeFileSync('src/components/OrderSettingsEditor.vue', newContent);

