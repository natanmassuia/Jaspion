# Plano de Migração e Implementação Progressiva — Jaspion V1

**Versão:** 1.0.0  
**Data:** 08/10/2026  
**Estratégia:** Execução sequencial em 9 fases verificáveis.

---

## Fase 1 — Auditoria e Preservação (CONCLUÍDA)
- [x] Clonar/obter o repositório legado no diretório de trabalho (`C:\Jaspion`).
- [x] Registrar o commit inicial de referência (`adb2a52`).
- [x] Criar a branch de trabalho `feature/jaspion-v1-architecture`.
- [x] Criar diretório `legacy/` preservando 100% dos arquivos originais intocados.
- [x] Mapear e classificar todos os 58 arquivos em REAPROVEITAR, REFAZER, MIGRAR DADOS, DESCARTAR e INVESTIGAR.
- [x] Identificar design tokens oficiais da Microset (`brandbook.css`, `theme.css`).
- [x] Identificar dados reais de circuitos e escalonamentos do Grupo Balbo.
- [x] Identificar os 7 blocos e 90 perguntas do Checklist CEM v2.2.1.
- [x] Elaborar `docs/LEGACY_AUDIT.md`.
- [x] Elaborar `docs/ARCHITECTURE.md`.
- [x] Elaborar `docs/MIGRATION_PLAN.md`.
- [x] Elaborar `docs/OPEN_QUESTIONS.md`.

---

## Fase 2 — Fundação Executável (EM ANDAMENTO)
- [ ] Configurar monorepo com npm workspaces (`shared`, `backend`, `frontend`).
- [ ] Configurar TypeScript com compilação e tipagem compartilhada.
- [ ] Configurar pacote `shared` com schemas Zod, tipos e constantes.
- [ ] Configurar `backend` com Fastify, plugins, health check (`GET /api/health`) e porta 6171.
- [ ] Configurar `data/jaspion.db`, Drizzle ORM e Drizzle Kit com migrations.
- [ ] Configurar `frontend` com Vite, React, TypeScript, Tailwind CSS e Lucide Icons na porta 6172.
- [ ] Testar execução paralela local de frontend e backend.

---

## Fase 3 — Identidade Visual e Navegação
- [ ] Configurar tokens do Brandbook no Tailwind (`colors`, `fonts`, `gradients`).
- [ ] Copiar assets oficiais da Microset para `frontend/src/assets/`.
- [ ] Implementar tema claro e escuro (`ThemeContext` e `ThemeToggle`).
- [ ] Implementar Topbar oficial com gradiente institucional tricolor e Mascote M7.
- [ ] Implementar layout base responsivo com navegação React Router.
- [ ] Recriar visualmente a tela de login respeitando a identidade original.

---

## Fase 4 — Dados e Módulos Centrais
- [ ] Criar tabelas e migrations para `clients`, `units`, `circuits`, `contacts`, `procedures`.
- [ ] Criar importador idempotente dos dados do Grupo Balbo (`grupo-balbo.js` e `grupo-balbo-dados.json`).
- [ ] Validar a integridade referencial dos dados importados (11 unidades, circuitos, telefones e procedimentos).
- [ ] Implementar endpoints da API REST para Clientes, Unidades e Circuitos.
- [ ] Implementar telas do frontend: Listagem de Clientes, Detalhes do Cliente e Ficha da Unidade com circuitos e contingências.

---

## Fase 5 — Segurança e Governança
- [ ] Implementar hash de senha com `argon2id`.
- [ ] Implementar criação e validação de sessões com cookies `HttpOnly`.
- [ ] Implementar bloqueio temporário após 5 falhas consecutivas.
- [ ] Implementar política de troca obrigatória de senha no 1º acesso.
- [ ] Implementar controle de perfis (ADMIN, COORDENADOR, USUÁRIO) e permissões no backend.
- [ ] Implementar módulo de auditoria com gravação de autor, IP, dados anteriores e novos.
- [ ] Implementar fluxo de aprovação de alterações cadastrais (Pendente -> Aprovar/Rejeitar).

---

## Fase 6 — Checklist CEM
- [ ] Criar tabelas para blocos (`cem_blocks`), perguntas (`cem_questions`), avaliações (`cem_evaluations`) e respostas (`cem_answers`).
- [ ] Criar seed idempotente dos 7 blocos e 90 perguntas auditados do legado.
- [ ] Implementar formulário em lâminas (abas por setor) no frontend com opções Conforme, Não Conforme, Parcialmente Conforme, N/A.
- [ ] Implementar cálculo formal de pontuação e persistência no SQLite.
- [ ] Implementar tela de histórico de avaliações com busca por chamado/ticket.

---

## Fase 7 — Znuny
- [ ] Criar tabela `znuny_tickets_mirror` e `sync_logs`.
- [ ] Implementar conector somente de leitura com suporte a fixtures/mocks para testes seguros.
- [ ] Implementar rotina de sincronização periódica a cada 5 minutos no backend.
- [ ] Implementar endpoint `POST /api/znuny/sync` para o botão "Atualizar Agora" com proteção contra concorrência.
- [ ] Implementar fallback resiliente: manter dados locais acessíveis se a API externa falhar.

---

## Fase 8 — Dashboard e Recursos Complementares
- [ ] Implementar busca global unificada (por Cliente, Unidade, Circuito, LP, Protocolo Znuny).
- [ ] Implementar Central de Comando Operacional na Home (incidentes, VIPs afetados, status do CEM e avisos).
- [ ] Implementar sistema de avisos e notificações internas.
- [ ] Implementar exportação de relatórios em CSV e XLSX.

---

## Fase 9 — Homologação e Implantação
- [ ] Executar testes automatizados (Vitest unitários e integração).
- [ ] Realizar build de produção de frontend e backend.
- [ ] Validar compatibilidade no ambiente Windows Server 2016.
- [ ] Configurar `ecosystem.config.js` para PM2.
- [ ] Criar e testar scripts de backup e restauração (`backup.ps1`, `restore.ps1`).
- [ ] Elaborar documentação completa de implantação (`docs/DEPLOY_GUIDE.md`).
