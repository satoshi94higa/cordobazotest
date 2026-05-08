@echo off
title Iniciar Mapa Cordobazo - MODO KIOSCO
echo ==========================================
echo   INICIANDO MAPA EN MODO KIOSCO
echo ==========================================
echo.
echo 1. Iniciando servidor local...
start /b npm run dev
echo.
echo 2. Esperando a que el servidor este listo (8 segundos)...
timeout /t 8
echo.
echo 3. Abriendo Google Chrome en modo Kiosco...
echo (Si no funciona, verifica que Chrome este instalado)
echo.
:: Intentamos abrir Chrome en modo kiosco. 
:: Usamos una carpeta de datos temporal para evitar conflictos con sesiones abiertas.
start chrome --kiosk --app=http://localhost:3000 --user-data-dir="%temp%\cordobazo_kiosk" --no-first-run --disable-features=Translate
echo.
echo Para salir del modo Kiosco, presiona ALT + F4.
echo No cierres esta ventana de comandos para mantener el servidor activo.
echo.
pause
