const fs = require('fs');

// 1. Add barista to InviteStaffModal.vue
let inviteModalPath = 'src/components/admin/InviteStaffModal.vue';
let inviteModalCode = fs.readFileSync(inviteModalPath, 'utf8');

if (!inviteModalCode.includes('<option value="barista">')) {
  inviteModalCode = inviteModalCode.replace(
    /<option value="waiter">[^<]+<\/option>/,
    `$&
            <option value="barista">Бармен / Бариста (принимает заказы на бар)</option>`
  );
  fs.writeFileSync(inviteModalPath, inviteModalCode);
  console.log('Added barista to InviteStaffModal');
}

// 2. Add barista label to KitchenOrders.vue
let kitchenOrdersPath = 'src/views/KitchenOrders.vue';
let kitchenOrdersCode = fs.readFileSync(kitchenOrdersPath, 'utf8');

kitchenOrdersCode = kitchenOrdersCode.replace(
  /const roleLabel = role === 'cook' \? '[^']+' : role === 'waiter' \? '[^']+' : '[^']+'/,
  "const roleLabel = role === 'cook' ? '👨‍🍳 Повар' : role === 'waiter' ? '🧑‍🍽️ Официант' : role === 'barista' ? '☕ Бармен' : '👤 Сотрудник'"
);
fs.writeFileSync(kitchenOrdersPath, kitchenOrdersCode);
console.log('Added barista label to KitchenOrders');

