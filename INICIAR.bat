@echo off
start /min cmd /c "npm run dev"
timeout /t 5
start http://localhost:3000
exit