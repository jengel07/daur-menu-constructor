FROM node:22-alpine AS builder

# Устанавливаем зависимости и собираем фронтенд
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Подготавливаем бекенд
FROM node:22-alpine

# Устанавливаем системные зависимости для Prisma (openssl)
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Копируем файлы бекенда
COPY daur-menu-backend/package*.json ./daur-menu-backend/
RUN cd daur-menu-backend && npm install

COPY daur-menu-backend ./daur-menu-backend

# Генерируем Prisma клиент
RUN cd daur-menu-backend && npx prisma generate

# Копируем собранный фронтенд в папку public бекенда
COPY --from=builder /app/dist ./daur-menu-backend/public

WORKDIR /app/daur-menu-backend

EXPOSE 3000

# Запускаем синхронизацию схемы и сервер
CMD ["sh", "-c", "npx prisma db push && npm start"]

