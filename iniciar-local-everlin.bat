@echo off
setlocal
title Jaspion - Ambiente local Everlin
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js LTS ou execute pelo ambiente Codex desta maquina.
  pause
  exit /b 1
)

echo Iniciando o Jaspion local na branch Everlin...
start "Jaspion Backend Local" /min "%NODE_EXE%" "backend\dist\server.js"
start "Jaspion Frontend Local" /min /d "%~dp0frontend" "%NODE_EXE%" "%~dp0node_modules\vite\bin\vite.js" preview --port 6172 --host 0.0.0.0

timeout /t 3 /nobreak >nul
start "" "http://localhost:6172"

echo.
echo Frontend: http://localhost:6172
echo API:      http://localhost:6171/api/health
echo Pasta:    %~dp0
echo.
pause
