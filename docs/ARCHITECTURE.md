# Arquitetura do Sistema — Jaspion V1

**Versão:** 1.0.0  
**Data:** 08/10/2026  
**Empresa:** Microset Telecom  
**Objetivo:** Central de Comando Operacional (CCO)  

---

## 1. Princípios Arquiteturais e Diretrizes Fundamentais

### 1.1. Keep It Simple (KISS)
- Aplicação modular, monolítica no backend, com banco de dados local SQLite.
- Sem microsserviços, sem Redis, sem RabbitMQ/Kafka, sem PostgreSQL e sem Docker na V1.
- Operação direta no **Windows Server 2016** gerenciada via **PM2**.
- Foco absoluto na velocidade de consulta operacional para o N1 do CCO, apoiando também N2, QA, Coordenação e Administração.

### 1.2. Segurança e Separação de Responsabilidades
- O banco SQLite (`jaspion.db`) é acessado **exclusivamente** pelo backend Fastify em memória/disco local. Nenhum cliente web ou compartilhamento SMB tem acesso direto ao arquivo de dados.
- Autenticação com senhas protegidas por **Argon2id**.
- Sessões persistidas no banco, validadas via cookies `HttpOnly`, `SameSite=Lax` e proteção contra CSRF.
- Validação estrita de todos os dados de entrada através de schemas **Zod** compartilhados.
- Controle de acesso granular no backend: usuários comuns não editam cadastros estruturais diretamente, submetendo **Solicitações de Alteração** para aprovação do Coordenador/Admin.

---

## 2. Estrutura do Monorepo

```
Jaspion/
├── shared/                       # Pacote de contratos compartilhados (TypeScript)
│   ├── src/
│   │   ├── schemas/              # Schemas Zod (Auth, Cliente, Unidade, Circuito, CEM, Znuny)
│   │   ├── types/                # Tipos TypeScript inferidos e interfaces de domínio
│   │   └── constants/            # Enums, roles, status e constantes globais
│   ├── package.json
│   └── tsconfig.json
├── backend/                      # Servidor de API REST Fastify (Node.js + TypeScript)
│   ├── src/
│   │   ├── config/               # Variáveis de ambiente (Zod env), logger Pino, portas
│   │   ├── database/             # Drizzle ORM, schema relacional, migrations e seeds
│   │   │   ├── schema/           # Tabelas: users, sessions, clients, units, circuits, etc.
│   │   │   ├── migrations/       # Migrations geradas pelo Drizzle Kit
│   │   │   └── seeds/            # Importadores idempotentes (Balbo, CEM, Admin inicial)
│   │   ├── modules/              # Módulos em Controller / Service / Repository
│   │   │   ├── auth/             # Login, sessão, Argon2id, lockout, troca de senha
│   │   │   ├── clientes/         # Cadastro, consulta e regras de clientes (VIP, GN)
│   │   │   ├── unidades/         # Unidades operacionais e vínculos
│   │   │   ├── circuitos/        # Circuitos de telecom (operadoras, LPs, velocidades)
│   │   │   ├── contatos/         # Contatos operacionais com relacionamento N:N
│   │   │   ├── procedimentos/    # Procedimentos operacionais e escalonamentos
│   │   │   ├── alteracoes/       # Workflow de aprovação de alterações cadastrais
│   │   │   ├── checklist-cem/    # Blocos, 90 questões, respostas e histórico de QA
│   │   │   ├── znuny/            # Espelho de tickets, sincronização periódica (5m)
│   │   │   ├── auditoria/        # Log estruturado de alterações e ações sensíveis
│   │   │   ├── notificacoes/     # Alertas e avisos internos da CCO
│   │   │   └── sugestoes/        # Sugestões e comentários da equipe
│   │   ├── plugins/              # Plugins Fastify (auth, cors, helmet, rate-limit, errorHandler)
│   │   ├── utils/                # Criptografia, helpers e formatadores
│   │   └── server.ts             # Inicialização do servidor Fastify (porta 6171)
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                     # Aplicação SPA React (TypeScript + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/               # Imagens oficiais da Microset, fotos Balbo, Mascote M7
│   │   ├── components/           # Componentes UI reutilizáveis (Card, Modal, Badge, Tabela)
│   │   ├── layouts/              # AppLayout (Topbar oficial com linha tricolor, Sidebar)
│   │   ├── pages/                # Telas (Dashboard CCO, Clientes, Unidade, CEM, Admin)
│   │   ├── services/             # Clientes HTTP (fetch/Axios) com tipagem compartilhada
│   │   ├── hooks/                # Custom hooks (useAuth, useTheme, useDebounce, etc.)
│   │   ├── stores/               # Gerenciamento de estado global (Zustand)
│   │   └── app/                  # Configuração de rotas (React Router) e Providers
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Documentação viva de arquitetura, migração e auditoria
├── data/                         # Armazenamento local do banco SQLite (fora do docroot)
│   └── jaspion.db
├── scripts/                      # Scripts operacionais (backup, restore, migração, seed)
├── ecosystem.config.js           # Orquestração do PM2 para Windows Server 2016
├── .env.example
├── .gitignore
├── package.json                  # Workspaces npm raiz
└── README.md
```

---

## 3. Modelo de Dados e Domínio (Drizzle ORM & SQLite)

### 3.1. Hierarquia de Entidades Operacionais
```
Cliente (ex: Grupo Balbo)
  │
  └── Unidades (ex: USA Concentrador, UBE, UFRA, etc.)
        │
        ├── Circuitos (Microset, Vivo, Algar, L2L / LPs específicas / Fibra / Rádio)
        ├── Contatos Operacionais (vínculo N:N por unidade_contatos)
        ├── Infraestrutura Local (Switches, Roteadores, Medidores, Zabbix Proxy)
        └── Procedimentos e Escalonamentos (horário comercial, plantão, grupos WhatsApp)
```

### 3.2. Esquema das Principais Tabelas

1. **`users`**: `id`, `name`, `email`, `password_hash`, `role` (ADMIN, COORDENADOR, USUARIO), `department`, `must_change_password`, `active`, `failed_attempts`, `locked_until`, `created_at`, `updated_at`.
2. **`sessions`**: `id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `created_at`.
3. **`clients`**: `id`, `name`, `is_vip`, `economic_group`, `manager_name`, `gn_name`, `sankhya_code`, `description`, `created_at`, `updated_at`.
4. **`units`**: `id`, `client_id`, `name`, `intra_code`, `sankhya_code`, `city`, `state`, `address`, `business_hours`, `phone`, `environment`, `dependencies`, `is_active`, `created_at`, `updated_at`.
5. **`circuits`**: `id`, `unit_id`, `operator`, `technology` (fibra, rádio, satélite), `speed_mbps`, `circuit_id`, `contract_id`, `lp_ip`, `lp_vpn`, `is_primary`, `notes`, `created_at`.
6. **`contacts`**: `id`, `name`, `role_description`, `phone`, `mobile`, `whatsapp`, `email`, `schedule` (comercial, 24x7, plantão), `created_at`.
7. **`unit_contacts`**: `unit_id`, `contact_id`, `priority_order`.
8. **`procedures`**: `id`, `unit_id`, `client_id`, `category` (telecom, infra, escalonamento), `content_markdown`, `version`, `updated_at`.
9. **`change_requests`**: `id`, `author_id`, `module`, `action` (create, update, delete), `target_id`, `previous_values`, `new_values`, `reason`, `status` (PENDING, APPROVED, REJECTED), `reviewed_by`, `review_notes`, `reviewed_at`, `created_at`.
10. **`audit_logs`**: `id`, `user_id`, `module`, `action`, `target_id`, `details`, `ip_address`, `created_at`.
11. **`cem_blocks`**: `id`, `name`, `order_index`, `color`, `description`, `created_at`.
12. **`cem_questions`**: `id`, `block_id`, `text`, `order_index`, `is_active`, `created_at`.
13. **`cem_evaluations`**: `id`, `ticket_protocol`, `evaluator_id`, `evaluation_date`, `shift`, `score_percentage`, `good_count`, `bad_count`, `fourth_count`, `na_count`, `notes`, `created_at`.
14. **`cem_answers`**: `id`, `evaluation_id`, `question_id`, `answer` (conforme, nao_conforme, parcialmente, na), `observation`.
15. **`znuny_tickets_mirror`**: `id` (ticket_id), `tn` (protocolo), `title`, `customer_id`, `customer_user_login`, `queue`, `state`, `priority`, `owner`, `service`, `circuit_ref`, `created_time`, `closed_time`, `last_sync_at`.
16. **`sync_logs`**: `id`, `source` (znuny), `status` (SUCCESS, FAILED), `records_synced`, `error_message`, `started_at`, `finished_at`.

---

## 4. Integração Znuny (Somente Leitura)

- **Regra de Ouro:** A integração com o Znuny é estritamente **read-only**. O Jaspion nunca cria, altera ou encerra chamados no Znuny.
- **Relacionamento Operacional:**
  - `CustomerID` = Código ou Nome do Cliente.
  - `CustomerUser` = Unidade ou Site associado.
- **Agendamento:** Tarefa periódica executada dentro do processo backend a cada 5 minutos via timer resiliente.
- **Botão Manual:** Ação autorizada no frontend ("Atualizar Agora") que dispara `POST /api/znuny/sync` (com trava de concorrência — mutex em memória — para evitar requisições simultâneas).
- **Tratamento de Falhas (Fallback):** Se o Znuny estiver inacessível, o Jaspion mantém e exibe integralmente os dados espelhados no SQLite e apresenta um indicador claro com a data e horário da última sincronização bem-sucedida.

---

## 5. Checklist CEM (Qualidade e Conformidade)

- **Responsabilidade Funcional:** Prioritariamente da equipe de QA / CCO.
- **Estrutura:** Preservação estrita dos 7 blocos e 90 perguntas originais auditados do legado.
- **Respostas Suportadas:**
  - Conforme
  - Não Conforme
  - Parcialmente Conforme
  - Não se Aplica (N/A)
- **Histórico e Auditoria:** Cada avaliação armazena analista, turno, data/hora, score e respostas individuais com observações.

---

## 6. Autenticação, Perfis e Segurança

### 6.1. Algoritmo e Sessões
- **Hash de Senha:** `argon2id` com salt criptográfico aleatório.
- **Bloqueio Temporário:** 5 tentativas consecutivas de senha incorreta bloqueiam a conta por 15 minutos.
- **Troca Obrigatória:** O flag `must_change_password: true` força o redirecionamento imediato para a tela de alteração de senha antes de liberar qualquer visualização operacional.
- **Cookies Seguros:** Cookie `jaspion_session` emitido como `HttpOnly`, `SameSite=Lax`, com tempo de expiração de 12 horas.

### 6.2. Matriz de Perfis e Permissões

| Perfil | Acesso Geral | Solicitar Alteração | Aprovar Alterações | Checklist CEM | Gerenciar Usuários |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **USUÁRIO (N1/N2)** | Leitura total (Clientes, Unidades, Circuitos, Tickets) | Sim (cria solicitação) | Não | Apenas consulta | Não |
| **COORDENADOR** | Leitura total | Sim | Sim (aprova e aplica) | Consulta / Realiza | Não |
| **ADMIN** | Total (Leitura e Escrita Direta) | Sim | Sim | Total | Sim |

---

## 7. Infraestrutura de Produção (Windows Server 2016)

- **Node.js LTS:** Node.js v18 ou v20 LTS instalado no servidor.
- **Portas:**
  - Frontend SPA: **6172** (servido via Vite preview em dev ou servidor estático Fastify/serve em produção).
  - Backend API: **6171** (Fastify REST).
- **Gerenciador de Processos:** **PM2** configurado via `ecosystem.config.js`.
- **Persistência de Inicialização:** `pm2-windows-service` ou agendador de tarefas do Windows para auto-início no boot do servidor.
- **Rotina de Backup:** Script PowerShell em `scripts/backup.ps1` executando cópia segura do SQLite com timestamp para compartilhamento de rede (`M:\...` ou `\\172.16.0.49\...`).
