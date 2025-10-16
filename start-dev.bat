@echo off
echo ========================================
echo   Trello Nippon - Modo Desenvolvimento
echo ========================================
echo.
echo Abrindo 2 terminais:
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.

start "Trello Nippon - Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak > nul
start "Trello Nippon - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servidores iniciando...
echo Aguarde alguns segundos e acesse:
echo http://localhost:3000
echo.

