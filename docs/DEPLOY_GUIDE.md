# Guia de Publicação e Operação no Windows Server 2016 — Jaspion V1

Este guia descreve os passos para publicar e manter o **Jaspion V1 (Central de Comando Operacional)** em execução no Windows Server (`172.16.0.49`).

---

## 🚀 Publicação Rápida (1 Comando)

1. Acesse o Windows Server via Área de Trabalho Remota (RDP no IP `172.16.0.49`).
2. Abra o **PowerShell como Administrador**.
3. Navegue até a pasta do projeto e execute o script de automação:

```powershell
cd C:\Apps\Jaspion
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows-server.ps1
```

O script cuidará automaticamente de:
- Checar Node.js e instalar o PM2 se necessário.
- Instalar as dependências (`npm install`).
- Gerar o build de produção (`npm run build`).
- Liberar as portas **6171** (API) e **6172** (Frontend) no Windows Firewall.
- Iniciar os processos no PM2 e salvar o estado.
- Testar o healthcheck da API.

---

## 🛠️ Publicação Manual Passo a Passo

Caso prefira executar cada etapa manualmente:

### 1. Pré-requisitos no Servidor
- **Node.js**: v18 ou v20 LTS instalado ([nodejs.org](https://nodejs.org/)).
- **PM2**: Gerenciador de processos Node.
  ```powershell
  npm install -g pm2
  ```

### 2. Instalação e Compilação
No diretório `C:\Apps\Jaspion`:

```powershell
# Instalar dependências de todos os workspaces
npm install

# Compilar shared, backend e frontend
npm run build
```

### 3. Liberação de Portas no Windows Firewall
Execute no PowerShell como Administrador:

```powershell
New-NetFirewallRule -DisplayName "Jaspion Backend API (6171)" -Direction Inbound -LocalPort 6171 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Jaspion Frontend SPA (6172)" -Direction Inbound -LocalPort 6172 -Protocol TCP -Action Allow
```

### 4. Inicialização via PM2
```powershell
# Iniciar as duas aplicações (backend e frontend) configuradas no ecosystem
pm2 start ecosystem.config.js

# Salvar a lista de processos para persistência
pm2 save
```

### 5. Configurar Inicialização Automática no Boot do Windows
Para que o Jaspion inicialize sozinho mesmo após o reinício do servidor:

```powershell
npm install -g pm2-windows-service
pm2-service-install
```
> *Pressione `Enter` para as perguntas padrões durante o assistente de instalação do serviço.*

---

## 🌐 URLs de Acesso

| Serviço | Acesso Local (no Servidor) | Acesso na Rede Microset |
| :--- | :--- | :--- |
| **Frontend SPA (Painel)** | `http://localhost:6172` | `http://172.16.0.49:6172` |
| **Backend REST API** | `http://localhost:6171` | `http://172.16.0.49:6171` |
| **Health Check API** | `http://localhost:6171/api/health` | `http://172.16.0.49:6171/api/health` |

---

## 📋 Comandos Operacionais do Dia a Dia

Execute no diretório `C:\Apps\Jaspion` no servidor:

- **Ver status dos processos:**
  ```powershell
  pm2 list
  ```
- **Acompanhar logs em tempo real:**
  ```powershell
  pm2 logs
  # Ou logs específicos:
  pm2 logs jaspion-backend
  pm2 logs jaspion-frontend
  ```
- **Reiniciar os serviços:**
  ```powershell
  pm2 restart ecosystem.config.js
  ```
- **Parar os serviços:**
  ```powershell
  pm2 stop ecosystem.config.js
  ```

