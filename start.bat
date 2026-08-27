@echo off
echo Запуск Daur Menu...
docker-compose up -d --build
echo Ожидание запуска сервера...
timeout /t 10
start http://localhost:3000
echo Готово! Приложение открыто в браузере.
pause

