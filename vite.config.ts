import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Указываем относительные пути для корректной работы ресурсов
  plugins: [vue()],
  server: {
    allowedHosts: true
  }
})