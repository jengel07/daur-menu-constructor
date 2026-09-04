@echo off
setlocal

echo Detecting LAN IP...
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get_ip.ps1"`) do set HOST_IP=%%a

if "%HOST_IP%"=="" (
    set HOST_IP=localhost
)

echo Updating .env with IP: %HOST_IP%
echo VITE_API_URL=http://%HOST_IP%:3000> .env

echo Starting Daur Menu...
docker-compose up -d

echo Waiting for startup...
timeout /t 10

echo DONE! Opening admin panel at http://%HOST_IP%:3000
start http://%HOST_IP%:3000
pause
