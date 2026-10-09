# ==============================================================================
# Jaspion V1 - Script de Publicação e Inicialização no Windows Server 2016
# ==============================================================================
# Execute este script no PowerShell como Administrador dentro do Windows Server.
# Diretório esperado: C:\Apps\Jaspion

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Iniciando Publicação do Jaspion V1 no Windows Server   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Definir e verificar diretório
if (Test-Path "$PSScriptRoot\..\package.json") {
    $projectDir = (Resolve-Path "$PSScriptRoot\..").Path
} elseif (Test-Path "C:\Apps\Jaspion") {
    $projectDir = "C:\Apps\Jaspion"
} else {
    $projectDir = (Get-Location).Path
}
if (-not (Test-Path $projectDir)) {
    $projectDir = (Get-Location).Path
    Write-Warning "Diretório C:\Apps\Jaspion não encontrado diretamente, usando diretório atual: $projectDir"
}
Set-Location $projectDir

# 2. Verificar Node.js e npm
Write-Host "`n[1/6] Verificando Node.js e npm..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    $npmVer = npm -v
    Write-Host "  Node.js: $nodeVer" -ForegroundColor Green
    Write-Host "  npm:     v$npmVer" -ForegroundColor Green
} catch {
    Write-Error "Node.js não foi encontrado no PATH do servidor! Por favor, instale o Node.js v18 ou v20 LTS antes de continuar."
    exit 1
}

# 3. Verificar / Instalar PM2
Write-Host "`n[2/6] Verificando PM2..." -ForegroundColor Yellow
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "  Instalando PM2 globalmente..." -ForegroundColor Cyan
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar PM2 globalmente."
        exit 1
    }
} else {
    Write-Host "  PM2 já instalado!" -ForegroundColor Green
}

# 4. Instalar dependências e compilar projeto
Write-Host "`n[3/6] Instalando dependências (npm install)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha durante o npm install."
    exit 1
}

Write-Host "`n[4/6] Compilando os pacotes (shared, backend, frontend)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha durante o npm run build."
    exit 1
}
Write-Host "  Build gerado com sucesso!" -ForegroundColor Green

# 5. Configurar Regras de Firewall para as Portas 6171 e 6172
Write-Host "`n[5/6] Configurando regras do Windows Firewall..." -ForegroundColor Yellow
try {
    $fwBackend = Get-NetFirewallRule -DisplayName "Jaspion Backend API (6171)" -ErrorAction SilentlyContinue
    if (-not $fwBackend) {
        New-NetFirewallRule -DisplayName "Jaspion Backend API (6171)" -Direction Inbound -LocalPort 6171 -Protocol TCP -Action Allow -Profile Any | Out-Null
        Write-Host "  Regra de firewall criada para porta 6171 (Backend)" -ForegroundColor Green
    } else {
        Write-Host "  Regra para porta 6171 já existe." -ForegroundColor Green
    }

    $fwFrontend = Get-NetFirewallRule -DisplayName "Jaspion Frontend SPA (6172)" -ErrorAction SilentlyContinue
    if (-not $fwFrontend) {
        New-NetFirewallRule -DisplayName "Jaspion Frontend SPA (6172)" -Direction Inbound -LocalPort 6172 -Protocol TCP -Action Allow -Profile Any | Out-Null
        Write-Host "  Regra de firewall criada para porta 6172 (Frontend)" -ForegroundColor Green
    } else {
        Write-Host "  Regra para porta 6172 já existe." -ForegroundColor Green
    }
} catch {
    Write-Warning "Não foi possível criar as regras de firewall automaticamente. Execute o PowerShell como Administrador se necessário."
}

# 6. Iniciar serviços via PM2
Write-Host "`n[6/6] Inicializando serviços no PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js
pm2 save

Write-Host "`nStatus dos processos no PM2:" -ForegroundColor Cyan
pm2 list

# 7. Teste de Health Check
Start-Sleep -Seconds 3
Write-Host "`nTestando Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:6171/api/health" -Method Get -TimeoutSec 5
    Write-Host "  Backend Status: $($health.status) | DB: $($health.database.status)" -ForegroundColor Green
} catch {
    Write-Warning "Backend ainda iniciando ou retornou erro: $($_.Exception.Message)"
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "       JASPION V1 PUBLICADO COM SUCESSO!                  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Acesso Local:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:6172" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:6171" -ForegroundColor Cyan
Write-Host "`nAcesso pela Rede Corporativa:" -ForegroundColor White
Write-Host "  Frontend: http://172.16.0.49:6172" -ForegroundColor Cyan
Write-Host "  Backend:  http://172.16.0.49:6171" -ForegroundColor Cyan
Write-Host "==========================================================`n" -ForegroundColor Green


