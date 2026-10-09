# Jaspion V1 â€” Central de Comando Operacional (Microset Telecom)

Sistema web operacional do CCO da Microset Telecom para centralizaÃ§Ã£o de clientes, unidades, circuitos, procedimentos, escalonamentos e Checklist de Qualidade CEM.

## ðŸš€ Arquitetura
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (Porta: `6172`)
- **Backend:** Node.js + TypeScript + Fastify + Zod (Porta: `6171`)
- **Contratos Compartilhados:** Pacote `shared` (Zod Schemas + TypeScript Types)
- **Banco de Dados:** SQLite com Drizzle ORM (`./data/jaspion.db`)
- **ProduÃ§Ã£o:** Windows Server 2016 com gerenciamento de processos via PM2.

## ðŸ“¦ Estrutura do Projeto
```
â”œâ”€â”€ shared/       # Schemas Zod, tipos TypeScript e constantes globais
â”œâ”€â”€ backend/      # API REST Fastify (porta 6171)
â”œâ”€â”€ frontend/     # SPA React Vite (porta 6172)
â”œâ”€â”€ legacy/       # CÃ³pia integral e intocada do cÃ³digo legado original
â”œâ”€â”€ docs/         # Auditoria, arquitetura e planos de migraÃ§Ã£o
â”œâ”€â”€ data/         # Banco SQLite e backups locais
â”œâ”€â”€ scripts/      # Scripts operacionais
â””â”€â”€ ecosystem.config.js # ConfiguraÃ§Ã£o PM2 para Windows Server
```

## ðŸ› ï¸ InstalaÃ§Ã£o e ExecuÃ§Ã£o Local

```bash
# 1. Instalar dependÃªncias
npm install

# 2. Copiar arquivo de ambiente
cp .env.example .env

# 3. Executar migrations e seeds
npm run db:migrate
npm run db:seed

# 4. Executar em modo desenvolvimento
npm run dev
```


## 🚀 Publicação em Produção (Windows Server 2016)

Para publicar o sistema no Windows Server (`172.16.0.49`), consulte o guia detalhado em [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md) ou execute diretamente no servidor via PowerShell como Administrador:

```powershell
cd C:\Apps\Jaspion
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows-server.ps1
```

