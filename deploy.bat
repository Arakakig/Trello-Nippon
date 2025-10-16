@echo off
echo ========================================
echo    Build e Deploy - Trello Nippon
echo ========================================
echo.

REM 1. Instalar dependencias
echo [1/4] Instalando dependencias do Backend...
cd backend
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo.
echo [2/4] Instalando dependencias do Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

REM 2. Build do Frontend
echo.
echo [3/4] Fazendo build do Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

REM 3. Verificar build
echo.
echo [4/4] Verificando build...
if exist "frontend\out\" (
    echo ✓ Build criado com sucesso!
) else (
    echo X Erro: pasta 'out' nao foi criada
    exit /b 1
)

REM Sucesso
echo.
echo ========================================
echo   BUILD COMPLETO!
echo ========================================
echo.
echo Proximos passos:
echo   1. Configure backend\.env para producao
echo   2. Execute: cd backend ^&^& npm start
echo   3. Acesse: http://localhost:5000
echo.
echo Ou execute: start-production.bat
echo.
pause

