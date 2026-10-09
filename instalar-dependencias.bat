@echo off
title Jaspion V1 - Instalacao de Dependencias
cd /d C:\Apps\Jaspion
echo ========================================================
echo   MICROSET TELECOM - CENTRAL DE COMANDO OPERACIONAL (CCO)
echo   Instalando dependencias do Jaspion V1...
echo ========================================================
echo.
call npm install
echo.
echo Compilando modulos...
call npm run build
echo.
echo ========================================================
echo   Instalacao concluida com sucesso!
echo ========================================================
pause
