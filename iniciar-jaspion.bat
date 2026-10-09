@echo off
title Jaspion V1 - Central de Comando Operacional Microset
cd /d C:\Apps\Jaspion
echo ========================================================
echo   MICROSET TELECOM - CENTRAL DE COMANDO OPERACIONAL (CCO)
echo   JASPION V1
echo ========================================================
echo.
echo Iniciando servicos em segundo plano via PM2...
call npx pm2 start ecosystem.config.js
echo.
call npx pm2 status
echo.
echo ========================================================
echo   Jaspion Online!
echo   Frontend: http://localhost:6172 (ou http://172.16.0.49:6172)
echo   Backend API: http://localhost:6171 (ou http://172.16.0.49:6171)
echo ========================================================
pause
