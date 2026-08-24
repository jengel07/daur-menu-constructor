<template>
  <div class="login-page">
    <!-- Логотип в левом верхнем углу -->
    <header class="login-header">
      <div class="brand-logo">ConstructorMenu</div>
    </header>

    <!-- Основная карточка входа/регистрации -->
    <main class="login-container">
      <!-- Вкладки Вход / Регистрация -->
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab"
          :class="{ active: !isRegistering }"
          @click="switchMode(false)"
        >
          Вход
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="{ active: isRegistering }"
          @click="switchMode(true)"
        >
          Регистрация
        </button>
      </div>

      <p class="welcome-text">
        {{ isRegistering ? 'Заполните данные для регистрации.' : 'С возвращением! Введите email и пароль.' }}
      </p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Поле имени (только для регистрации) -->
        <div class="form-group" v-if="isRegistering">
          <label for="register-name">Имя</label>
          <input
            id="register-name"
            name="name"
            v-model="name"
            type="text"
            placeholder="Ваше имя"
            required
          />
        </div>

        <!-- Email field -->
        <div class="form-group">
          <label for="user-email">Email адрес</label>
          <input
            id="user-email"
            name="email"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>

        <!-- Password field -->
        <div class="form-group">
          <label for="user-password">Пароль</label>
          <div class="password-input-wrapper">
            <input
              id="user-password"
              name="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="******"
              required
            />
            <button
              type="button"
              class="btn-toggle-eye"
              @click="showPassword = !showPassword"
            >
              👁️
            </button>
          </div>
        </div>

        <div class="forgot-wrapper" v-if="!isRegistering">
          <a href="#" class="forgot-link">Забыли пароль?</a>
        </div>

        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
          <!-- Кнопка быстрого переключения на вход, если email уже занят -->
          <button
            v-if="showSwitchToLogin"
            type="button"
            class="btn-switch-inline"
            @click="switchMode(false)"
          >
            Войти с этим email →
          </button>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading">⏳ Загрузка...</span>
          <span v-else>{{ isRegistering ? 'Создать аккаунт' : 'Войти' }}</span>
        </button>
      </form>

      <!-- Google Auth Button -->
      <button type="button" class="btn-google" @click="handleGoogleAuth">
        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Войти через Google
      </button>

      <!-- Footer Policy Links -->
      <footer class="legal-footer">
        Регистрируясь, вы соглашаетесь с нашими
        <a href="#">Условиями использования</a> и
        <a href="#">Политикой конфиденциальности</a>.
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi, setToken } from '../api';
import { useMenuStore } from '../store/menuStore';

const router = useRouter();
const menuStore = useMenuStore();

// По умолчанию — режим ВХОДА, не регистрации
const isRegistering = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
// Показывать ли кнопку «Войти с этим email →» после ошибки «уже существует»
const showSwitchToLogin = ref(false);

/** Переключение между режимами Вход / Регистрация с очисткой ошибок */
const switchMode = (register: boolean) => {
  isRegistering.value = register;
  errorMessage.value = '';
  showSwitchToLogin.value = false;
};

/** Применяем результат успешного ответа бэкенда */
const applyAuthResult = (result: {
  token: string;
  restaurantId: string;
  name: string;
  role?: string;
}) => {
  setToken(result.token);

  const role = result.role || 'admin';

  localStorage.setItem('currentUser', JSON.stringify({
    restaurantId: result.restaurantId,
    name: result.name,
    email: email.value,
    role,
  }));

  menuStore.loadUserInfo();

  // Редирект по роли с гибкой проверкой
  const lowerRole = role.toLowerCase();
  
  // ПРОПИШИТЕ СЮДА ВАШ ЛИЧНЫЙ EMAIL:
  if (email.value === 'geller.9797@mail.ru') { 
    router.push('/super-admin');
  } 
  else if (
    lowerRole.includes('cook') ||
    lowerRole.includes('chef') ||
    lowerRole.includes('waiter') ||
    lowerRole.includes('повар') ||
    lowerRole.includes('официант')
  ) {
    router.push('/kitchen-orders');
  } else {
    menuStore.loadFromServer();
    router.push('/constructor');
  }
};

const handleSubmit = async () => {
  errorMessage.value = '';
  showSwitchToLogin.value = false;
  isLoading.value = true;

  try {
    if (isRegistering.value) {
      // ── Режим РЕГИСТРАЦИИ ──────────────────────────────────────
      try {
        const result = await authApi.register({
          email: email.value,
          password: password.value,
          name: name.value || undefined,
        });
        applyAuthResult(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        // Если email уже занят — предлагаем войти вместо регистрации
        if (
          msg.includes('уже существует') ||
          msg.includes('already') ||
          msg === 'HTTP 409'
        ) {
          errorMessage.value = 'Пользователь с таким email уже зарегистрирован.';
          showSwitchToLogin.value = true;
        } else {
          errorMessage.value = msg || 'Ошибка регистрации. Попробуйте снова.';
        }
      }
    } else {
      // ── Режим ВХОДА ───────────────────────────────────────────
      const result = await authApi.login({
        email: email.value,
        password: password.value,
      });
      applyAuthResult(result);
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error
      ? err.message
      : 'Произошла ошибка. Попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleAuth = () => {
  errorMessage.value = 'Вход через Google пока недоступен. Используйте Email.';
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 30px 40px;
}

.brand-logo {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #000000;
}

.login-container {
  max-width: 400px;
  width: 100%;
  margin: 40px auto auto auto;
  padding: 0 20px;
  text-align: center;
}

.auth-tabs {
  display: flex;
  background-color: #f3f3f3;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 9px;
  transition: background-color 0.2s, color 0.2s;
  color: #6b7280;
}

.auth-tab.active {
  background-color: #ffffff;
  color: #000000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.welcome-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  background-color: #f3f3f3;
  font-size: 14px;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus {
  background-color: #ffffff;
  border-color: #000000;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-toggle-eye {
  position: absolute;
  right: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  font-size: 14px;
}

.btn-toggle-eye:hover {
  opacity: 1;
}

.forgot-wrapper {
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  text-decoration: underline;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}

.btn-switch-inline {
  display: block;
  margin: 8px auto 0 auto;
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  font-size: 12px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: #18181b;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  margin-bottom: 12px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background-color: #000000;
}

.btn-google {
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.2s;
}

.btn-google:hover {
  background-color: #f9fafb;
}

.legal-footer {
  margin-top: 60px;
  margin-bottom: 30px;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.5;
}

.legal-footer a {
  color: #000000;
  font-weight: 700;
  text-decoration: none;
}

.legal-footer a:hover {
  text-decoration: underline;
}
</style>