@echo off
echo ========================================
echo   Trello Nippon - Modo Producao
echo ========================================
echo.
echo Iniciando servidor...
echo Frontend + Backend em http://localhost:5000
echo.

cd backend
set NODE_ENV=production
npm start

