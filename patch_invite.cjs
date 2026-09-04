const fs = require('fs');

let content = fs.readFileSync('src/components/admin/InviteStaffModal.vue', 'utf8');

// Replace script setup
content = content.replace(/<script setup lang="ts">[\s\S]*?<\/script>/, `<script setup lang="ts">
import { ref } from 'vue';
import { staffApi } from '../../api';

const emit = defineEmits(['close', 'invited']);

const loading = ref(false);
const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'chef'
});

const handleInvite = async () => {
  if (!form.value.email || !form.value.password || !form.value.name) return;
  
  loading.value = true;
  try {
    const response = await staffApi.create({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role
    });

    emit('invited', response.staff || { ...form.value, id: Date.now(), status: 'active' });
    emit('close');
  } catch (error: any) {
    console.error('Ошибка при добавлении:', error);
    alert(error.message || 'Ошибка при добавлении');
  } finally {
    loading.value = false;
  }
};
</script>`);

// Add Name and Password to form
const newInputs = `<form @submit.prevent="handleInvite" class="modal-body">
        <div class="form-group">
          <label>Имя сотрудника</label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="Иван" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label>Email сотрудника</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="colleague@example.com" 
            required 
          />
          <p class="field-hint">Для входа в систему</p>
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="Минимум 6 символов" 
            required 
            minlength="6"
          />
        </div>`;

content = content.replace(/<form @submit\.prevent="handleInvite" class="modal-body">[\s\S]*?<div class="form-group">\s*<label>.*?роль.*?<\/label>/i, newInputs + '\n\n        <div class="form-group">\n          <label>Роль</label>');

fs.writeFileSync('src/components/admin/InviteStaffModal.vue', content);

