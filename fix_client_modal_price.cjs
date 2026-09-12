const fs = require('fs');

let code = fs.readFileSync('src/components/ClientModifiersModal.vue', 'utf8');

// Replace script setup logic
code = code.replace(
`const modifiers = computed(() => props.item.modifiers || []);

// State`,
`const modifiers = computed(() => props.item.modifiers || []);

const isAbsoluteGroup = (group: any) => {
  if (group.isAbsolute !== undefined) return group.isAbsolute;
  const n = (group.name || '').toLowerCase();
  return group.type === 'radio' && (n.includes('размер') || n.includes('объем') || n.includes('порци'));
};

// State`
);

code = code.replace(
`const totalPrice = computed(() => {
  let base = Number(props.item.price) || 0;
  for (const group of modifiers.value) {
    if (group.type === 'radio') {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt) base += Number(opt.price) || 0;
    } else {
      const selectedIds = selections.value[group.id] || [];
      selectedIds.forEach((sid: string) => {
        const opt = group.options.find((o: any) => o.id === sid);
        if (opt) base += Number(opt.price) || 0;
      });
    }
  }
  return base.toFixed(2);
});`,
`const totalPrice = computed(() => {
  let base = Number(props.item.price) || 0;
  
  // First pass: find absolute group
  for (const group of modifiers.value) {
    if (isAbsoluteGroup(group)) {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt && Number(opt.price) > 0) {
        base = Number(opt.price);
      }
    }
  }

  // Second pass: add everything else
  for (const group of modifiers.value) {
    if (isAbsoluteGroup(group)) continue;
    
    if (group.type === 'radio') {
      const selectedId = selections.value[group.id];
      const opt = group.options.find((o: any) => o.id === selectedId);
      if (opt) base += Number(opt.price) || 0;
    } else {
      const selectedIds = selections.value[group.id] || [];
      selectedIds.forEach((sid: string) => {
        const opt = group.options.find((o: any) => o.id === sid);
        if (opt) base += Number(opt.price) || 0;
      });
    }
  }
  return base.toFixed(2);
});`
);

code = code.replace(
`<span v-if="opt.price > 0" class="opt-price">+{{ opt.price }} ₽</span>`,
`<span v-if="opt.price > 0" class="opt-price">
                <template v-if="isAbsoluteGroup(group)">{{ opt.price }} ₽</template>
                <template v-else>+{{ opt.price }} ₽</template>
              </span>`
);

fs.writeFileSync('src/components/ClientModifiersModal.vue', code);
console.log('Updated ClientModifiersModal.vue');

