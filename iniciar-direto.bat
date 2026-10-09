@echo off
title Jaspion V1 - Modo Standalone / Dev
cd /d C:\Apps\Jaspion
echo ========================================================
echo   MICROSET TELECOM - JASPION V1 (MODO STANDALONE)
echo ========================================================
echo.
echo Iniciando servidores integrados...
echo Frontend: http://localhost:6172
echo Backend:  http://localhost:6171
echo.
npm run dev
pause
