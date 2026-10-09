# Jaspion V1 — Central de Comando Operacional (Microset Telecom)

Sistema web operacional do CCO da Microset Telecom para centralização de clientes, unidades, circuitos, procedimentos, escalonamentos e Checklist de Qualidade CEM.

## 🚀 Arquitetura
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (Porta: `6172`)
- **Backend:** Node.js + TypeScript + Fastify + Zod (Porta: `6171`)
- **Contratos Compartilhados:** Pacote `shared` (Zod Schemas + TypeScript Types)
- **Banco de Dados:** SQLite com Drizzle ORM (`./data/jaspion.db`)
- **Produção:** Windows Server 2016 com gerenciamento de processos via PM2.

## 📦 Estrutura do Projeto
```
├── shared/       # Schemas Zod, tipos TypeScript e constantes globais
├── backend/      # API REST Fastify (porta 6171)
├── frontend/     # SPA React Vite (porta 6172)
├── legacy/       # Cópia integral e intocada do código legado original
├── docs/         # Auditoria, arquitetura e planos de migração
├── data/         # Banco SQLite e backups locais
├── scripts/      # Scripts operacionais
└── ecosystem.config.js # Configuração PM2 para Windows Server
```

## 🛠️ Instalação e Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar arquivo de ambiente
cp .env.example .env

# 3. Executar migrations e seeds
npm run db:migrate
npm run db:seed

# 4. Executar em modo desenvolvimento
npm run dev
```
