const fs = require('fs');
let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// Load from localStorage on mount or init
const regexFormInit = /const customerForm = ref\(\{\s*name: '',\s*phone: '',\s*orderType: 'dine_in',\s*tableNumber: '',\s*address: '',\s*comment: '',\s*scheduledTime: getCurrentTimeStr\(\),\s*scheduledDate: getTodayDateStr\(\)\s*\}\);/;

const replacementInit = `const savedForm = JSON.parse(localStorage.getItem('customer_form') || '{}');
const customerForm = ref({
  name: savedForm.name || '',
  phone: savedForm.phone || '',
  orderType: savedForm.orderType || 'dine_in',
  tableNumber: savedForm.tableNumber || '',
  address: savedForm.address || '',
  comment: '', // don't save previous comment
  scheduledTime: getCurrentTimeStr(),
  scheduledDate: getTodayDateStr()
});

watch(customerForm, (newVal) => {
  localStorage.setItem('customer_form', JSON.stringify({
    name: newVal.name,
    phone: newVal.phone,
    orderType: newVal.orderType,
    tableNumber: newVal.tableNumber,
    address: newVal.address
  }));
}, { deep: true });`;

if (code.match(regexFormInit)) {
  code = code.replace(regexFormInit, replacementInit);
} else {
  console.log("Could not find customerForm initialization");
}

// Do not clear the fields completely on success! Keep name, phone, orderType, table, address.
const regexFormReset = /customerForm\.value = \{\s*name: '',\s*phone: '',\s*orderType: 'dine_in',\s*tableNumber: '',\s*address: '',\s*comment: '',\s*scheduledTime: getCurrentTimeStr\(\),\s*scheduledDate: getTodayDateStr\(\)\s*\};/;

const replacementReset = `customerForm.value = { 
        ...customerForm.value,
        comment: '',
        scheduledTime: getCurrentTimeStr(),
        scheduledDate: getTodayDateStr()
      };`;

if (code.match(regexFormReset)) {
  code = code.replace(regexFormReset, replacementReset);
} else {
  console.log("Could not find customerForm reset");
}

fs.writeFileSync('src/views/ClientView.vue', code);
console.log('Updated customerForm persistence');

