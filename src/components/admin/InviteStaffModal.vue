<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Пригласить сотрудника</h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleInvite" class="modal-body">
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
        </div>

        <div class="form-group">
          <label>Роль</label>
          <select v-model="form.role" required>
            <option value="chef">Шеф-повар / Кухня (Доступ к заказам и стоп-листам)</option>
            <option value="waiter">Официант (Создание и статус заказов)</option>
            <option value="barista">Бармен / Бариста (принимает заказы на бар)</option>
            <option value="manager">Менеджер (Полный доступ к меню и заказам)</option>
            <option value="other">Другой персонал</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">Отмена</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Отправка...' : 'Отправить приглашение' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--card-bg, #ffffff);
  color: var(--text-main, #111827);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color, #e5e7eb);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-main, #374151);
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--input-bg, #f9fafb);
  color: var(--text-main, #111827);
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}

.form-group input:focus, 
.form-group select:focus {
  border-color: #ff5500;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  background: var(--button-hover, #f3f4f6);
  color: var(--text-main, #374151);
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #ff5500;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #e64d00;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>