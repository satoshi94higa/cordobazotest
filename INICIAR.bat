@echo off
title Iniciar Mapa Cordobazo
echo ==========================================
echo   INICIANDO MAPA DEL CORDOBAZO (OFFLINE)
echo ==========================================
echo.
echo 1. Comprobando dependencias...
call npm install
echo.
echo 2. Iniciando servidor local en puerto 3000...
start /b npm run dev
echo.
echo 3. Esperando a que el servidor este listo...
timeout /t 5
echo.
echo 4. Abriendo el mapa en el navegador...
start http://localhost:3000
echo.
echo Todo listo. No cierres esta ventana mientras uses el mapa.
pause
