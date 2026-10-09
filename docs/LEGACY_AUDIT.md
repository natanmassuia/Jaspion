# Auditoria Técnica do Legado — Jaspion (Microset Telecom)

**Data da Auditoria:** 08/10/2026  
**Ambiente de Origem:** Repositório Git público / Compartilhamento de Rede CCO  
**Commit Base:** `adb2a52` (*feat: initial commit - Intranet CCO / Jaspion*)  
**Branch de Trabalho:** `feature/jaspion-v1-architecture`  
**Responsável:** Arquiteto de Software Sênior & Desenvolvedor Full Stack  

---

## 1. Visão Geral do Sistema Legado

O Jaspion legado consiste em uma aplicação estática baseada em HTML5, CSS3 e JavaScript Vanilla (ES6+), originalmente concebida como uma Proof-of-Concept (POC v0.102 a v0.123) para a Intranet Operacional do Centro de Controle Operacional (CCO) da Microset Telecom e para o Checklist de Qualidade CEM (v2.2.1).

### Arquitetura Original
- **Interface e Navegação:** Páginas HTML individuais multipágina (`index.html`, `clientes.html`, `cliente.html`, `unit.html`, `login.html`, `usuarios.html`, `admin-site.html`, `documentacao.html`, `cco/checklist-qualidade-cem-v2.2.1.html`).
- **Camada de Dados & Persistência:** `localStorage` com wrappers em `shared-database.js` e IndexedDB (`unified-db.js`, banco `microset-intranet-cco`), com mecanismos de cache e exportação/importação manual de arquivos JSON (`backup-intranet-cco-*.json`).
- **Autenticação:** Baseada exclusivamente no navegador (`auth.js`), com usuários fixos em array JavaScript gravados em `localStorage` e senhas em texto puro.
- **Identidade Visual:** Regras centralizadas em `brandbook.css` e `styles.css`, suporte a temas claro/escuro via `theme.css` e `theme.js` com tokens CSS customizados da Microset.

---

## 2. Inventário e Classificação de Arquivos

Cada arquivo do repositório foi inspecionado, analisado e classificado de acordo com as seguintes categorias:
- **REAPROVEITAR:** Identidade visual, tokens, assets de imagem/SVG, regras de negócio e procedimentos operacionais válidos.
- **REFAZER:** Funcionalidades que devem ser reimplementadas na stack moderna (React, TypeScript, Vite, Tailwind, Fastify).
- **MIGRAR DADOS:** Registros estáticos ou em JSON que devem ser convertidos para entidades relacionais no banco SQLite.
- **DESCARTAR NA V1:** Códigos legados obsoletos, persistência em localStorage/IndexedDB, autenticação insegura em cliente, mocks de demonstração sem validação.
- **INVESTIGAR:** Arquivos ou componentes que dependem de definições externas ou validação com a equipe operacional.

| Arquivo Original | Tamanho | Função Identificada | Decisão | Destino na V1 | Observações Técnicas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `brandbook.css` | 17.6 KB | Design tokens oficiais, paleta de cores, tipografia Ubuntu, dimensões de topbar | **REAPROVEITAR** | `frontend/src/index.css` & `tailwind.config.ts` | Extrair paleta (`#2E2D4D`, `#5F6EC3`, `#EF7F22`, `#FABE49`), gradientes da barra superior e classes de utilidade. |
| `theme.css` | 7.6 KB | Variáveis CSS para modo claro e escuro (`[data-theme="dark"]`) | **REAPROVEITAR** | `frontend/src/index.css` | Integrar as variáveis semânticas de superfície, texto e bordas ao tema dark do Tailwind. |
| `theme.js` | 2.8 KB | Alternador de tema via script e persistência em `localStorage` | **REFAZER** | `frontend/src/hooks/useTheme.ts` & componente `ThemeToggle.tsx` | Reimplementar em React com Context API / Zustand, sincronizando com classe/dataset na tag html. |
| `styles.css` | 14.8 KB | Estilos legados de componentes, tabelas, modais e cards da intranet | **REFAZER / DESCARTAR** | Componentes Tailwind | Reconstruir componentes nativos em React + Tailwind, descartando seletores CSS obsoletos. |
| `index.html` | 12.4 KB | Dashboard operacional inicial, busca rápida, avisos e atalhos CCO | **REFAZER** | `frontend/src/pages/DashboardPage.tsx` | Criar a Central de Comando Operacional com busca global, status do CEM, Znuny e VIPs. |
| `app.js` | 3.2 KB | Lógica inicial da home, renderização de cards e busca simplificada | **REFAZER** | `frontend/src/pages/DashboardPage.tsx` | Migrar consultas para API Fastify. |
| `login.html` | 3.8 KB | Formulário de login com botões de atalho para usuários de teste | **REFAZER** | `frontend/src/pages/LoginPage.tsx` | Reconstruir com formulário controlado React Hook Form + Zod, mantendo visual original. |
| `login.css` | 4.8 KB | Estilos visuais do card centralizado e identidade de login | **REAPROVEITAR** | `frontend/src/pages/LoginPage.tsx` | Reaproveitar o layout limpo e área de respiro da marca Microset com Tailwind. |
| `login.js` | 2.0 KB | Captura de submit e validação client-side insegura | **DESCARTAR NA V1** | Substituído por API REST `/api/auth/login` | Validação e criação de sessão passam a ser 100% no backend. |
| `auth.js` | 8.4 KB | Gerenciamento de usuários e papéis (`admin`, `editor`, `viewer`) em localStorage | **REFAZER / DESCARTAR** | `backend/src/modules/auth` | Descartar senhas em texto puro e localStorage; implementar Argon2id, sessões em SQLite e cookies HttpOnly. |
| `clientes.html` | 8.5 KB | Listagem de clientes com tabela, status VIP, GN e quantidade de unidades | **REFAZER** | `frontend/src/pages/ClientesListPage.tsx` | Implementar tabela moderna com paginação, filtros, badges VIP e busca integrada. |
| `clientes.css` | 8.3 KB | Estilos da tabela e cards de clientes | **DESCARTAR NA V1** | Estilização via Tailwind CSS | Substituído por componentes reutilizáveis. |
| `clientes.js` | 18.5 KB | Manipulação da DOM da listagem e sincronização inicial Balbo | **REFAZER** | `frontend/src/services/clientesService.ts` | Regras de busca e listagem convertidas para service e React hooks. |
| `cliente.html` | 13.9 KB | Visão detalhada do cliente (Grupo Balbo): abas de unidades, doc e procedimentos | **REFAZER** | `frontend/src/pages/ClienteDetailPage.tsx` | Reconstruir abas organizadas: Unidades, Procedimentos, Documentação e Histórico. |
| `cliente.css` | 24.9 KB | Estilos detalhados de abas, grids de unidades e formulários | **DESCARTAR NA V1** | Componentes Tailwind | Reconstruir com Tailwind CSS. |
| `cliente.js` | 25.2 KB | Gerenciamento de abas, edição de unidades e persistência local | **REFAZER** | `backend/src/modules/clientes` & `unidades` | Validação com Zod e operações com integridade referencial. |
| `unit.html` | 9.0 KB | Ficha operacional da unidade: circuitos, NOC, contatos, SLA e dependências | **REFAZER** | `frontend/src/pages/UnidadeDetailPage.tsx` | Tela mais crítica para o N1 do CCO. Destacar contingências, contatos e circuitos ativos. |
| `unit.js` | 11.3 KB | Renderização dinâmica dos dados de circuitos e contatos da unidade | **REFAZER** | `backend/src/modules/circuitos` & `contatos` | Extrair modelo de dados estruturado (operadora, velocidade, tipo, LPs). |
| `usuarios.html` | 6.0 KB | Tela de gerenciamento de usuários e permissões do sistema | **REFAZER** | `frontend/src/pages/UsuariosPage.tsx` | Gestão de contas (ADMIN, COORDENADOR, USUÁRIO) protegida no backend. |
| `usuarios.css` | 5.1 KB | Estilos de tabela de usuários e modais | **DESCARTAR NA V1** | Tailwind CSS | Substituído por modal padronizado. |
| `usuarios.js` | 8.6 KB | CRUD de usuários em localStorage | **REFAZER** | `backend/src/modules/usuarios` | Operações com hashes Argon2id, reset de senha e troca obrigatória no 1º acesso. |
| `admin-site.html` | 4.3 KB | Painel de configuração de itens da intranet e links | **DESCARTAR NA V1** | Configuração no backend / banco | Estrutura de navegação fixa e modular, dispensando personalização solta. |
| `admin-site.js` | 3.6 KB | Reordenação visual de itens de menu | **DESCARTAR NA V1** | `frontend/src/layouts/AppLayout.tsx` | Menu estático e parametrizado por permissão do usuário. |
| `site-navigation.js` | 8.5 KB | Controle de rotas ativas e animações de transição de tela | **DESCARTAR NA V1** | `react-router-dom` | Gerenciamento de rotas canônicas no cliente com React Router. |
| `data-persistence.js`| 2.9 KB | Exportação e importação de JSON (`backup-intranet-cco`) | **DESCARTAR NA V1** | Rotina de backup do SQLite em backend | Persistência exclusiva em SQLite com dumps automáticos fora da raiz web. |
| `shared-database.js`| 1.0 KB | Versionamento simples de chaves em localStorage (`v0.123`) | **DESCARTAR NA V1** | Drizzle ORM Migrations | Migrações formais versionadas no backend. |
| `unified-db.js` | 4.7 KB | Ponte entre localStorage e IndexedDB (`microset-intranet-cco`) | **DESCARTAR NA V1** | SQLite / Drizzle ORM | Banco relacional server-side. |
| `grupo-balbo-dados.json`| 790 B | Metadados do handover oficial do Grupo Balbo (11 unidades, GN, VIP) | **MIGRAR DADOS** | `data/seeds/grupo-balbo.json` & Seed Script | Fonte primária para importação de clientes e unidades. |
| `grupo-balbo.js` | 13.2 KB | Dados completos de 11 unidades do Grupo Balbo, circuitos, telefones e procedimentos | **MIGRAR DADOS / REAPROVEITAR** | `backend/src/database/seeds/importBalbo.ts` | Extrair todas as 11 unidades, circuitos (Vivo, Algar, Microset, LPs) e escalonamentos para o SQLite. |
| `construction.html` | 2.4 KB | Página de aviso de módulo em construção | **DESCARTAR NA V1** | Componente `EmptyState` ou rota 404 | Substituído por tratamento padrão de rotas. |
| `documentacao.html` | 4.7 KB | Visualização de documentos internos e manuais operacionais | **REFAZER** | `frontend/src/pages/ProcedimentosPage.tsx` | Centralizar manuais e procedimentos operacionais padronizados. |
| `documentacao.js` | 7.0 KB | Renderizador de links e guias | **REFAZER** | `backend/src/modules/procedimentos` | Gestão de procedimentos com histórico e busca. |
| `DIRETRIZ_ENTREGA_DEV_PROD.md` | 704 B | Regras antigas de deploy em pasta de rede (`M:\Noc\Everlin...`) | **DESCARTAR NA V1** | `docs/DEPLOY_GUIDE.md` | Substituído por pipeline com PM2 no Windows Server 2016 e Git local. |
| `cco/backup-checklist-cem.json` | 62.6 KB | Banco oficial do Checklist CEM: 7 blocos, 90 perguntas e histórico de avaliações | **MIGRAR DADOS / REAPROVEITAR** | `backend/src/database/seeds/seedCem.ts` | Migrar blocos e 90 perguntas para as tabelas `cem_blocks` e `cem_questions` no SQLite. |
| `cco/checklist-qualidade-cem-v2.2.1.html`| 95.9 KB | Aplicação completa do Checklist de Qualidade CEM v2.2.1 | **REFAZER** | `frontend/src/pages/ChecklistCemPage.tsx` | Migrar formulário por lâminas, cálculo ponderado de conformidade e histórico. |
| `cco/GoogleAppsScript_Code_v2.2.1.gs` | 2.8 KB | Script para envio opcional de avaliações para o Google Sheets | **INVESTIGAR / REFAZER** | `backend/src/modules/checklist-cem` | Manter suporte opcional de exportação webhook ou exportação nativa em XLSX/CSV. |
| `cco/index.html` | 2.9 KB | Redirecionador para a versão vigente do checklist | **DESCARTAR NA V1** | Rota `/checklist-cem` no React | Navegação integrada na SPA. |
| `cco/LEIA-ME_Checklist_CEM_v2.2.1.txt` | 1.6 KB | Instruções de uso e navegação em lâminas da equipe de QA | **REAPROVEITAR** | `docs/CHECKLIST_CEM_GUIDE.md` | Preservar as regras de usabilidade (lâminas por setor, indicadores de conformidade). |
| `cco/MIGRACOES_BANCO_v2.2.1.md` | 3.1 KB | Documentação da evolução do esquema de dados do checklist | **REAPROVEITAR** | `docs/ARCHITECTURE.md` | Base para o esquema relacional de blocos, perguntas, avaliações e respostas. |
| `assets/*` | ~20 MB | Logotipos da Microset, Mascote M7, imagens oficiais das usinas Balbo | **REAPROVEITAR** | `frontend/src/assets/` | Copiar diretamente todos os assets visuais, preservando marcas e fotos oficiais. |

---

## 3. Identidade Visual e Tokens Preservados

### Paleta Institucional Microset
Os valores extraídos de `brandbook.css` e `theme.css` definem a identidade visual inegociável:
- **Navy Principal:** `#2E2D4D` (fundo da barra superior, títulos principais)
- **Blue Intermediário:** `#3A3B7D`
- **Cyan de Destaque:** `#5F6EC3` (destaque institucional e links)
- **Laranja Operacional:** `#EF7F22` (alertas e divisores)
- **Amarelo Microset:** `#FABE49` (status de atenção e badges)
- **Sucesso / Conforme:** `#4D6A57` / `#1B8F60`
- **Fundo Claro:** `#F7F7FB`
- **Bordas / Linhas:** `#E2E3EE`

### Barra Superior (Topbar)
- Altura padronizada: `82px` desktop.
- Linha de acabamento inferior tricolor:  
  `background: linear-gradient(90deg, #5F6EC3 0 58%, #EF7F22 58% 79%, #FABE49 79% 100%)` com altura de 3px a 4px.

### Tipografia
- Fonte primária: **Ubuntu** (ou Inter como fallback de alta legibilidade).

### Mascote M7 e Logotipos
- Mascote M7 (`assets/mascote-m7.svg` e `assets/mascote-m7.png`).
- Logotipo oficial positivo (`assets/microset-logo-positive.png`) e negativo (`assets/microset-logo-negative.png`).
- Badge VIP (`assets/vip-badge.png`).

---

## 4. Regras de Domínio e Dados Identificados

### 4.1. Hierarquia de Entidades
```
Cliente (ex: Grupo Balbo — VIP, GN Luis Henrique)
  ├── Unidades (11 cadastradas: USA, UBE, UFRA, Guarulhos, Fiúsa, Barrinha, Santa Ernestina, etc.)
  │     ├── Circuitos (Microset, Algar, Vivo, Links de Fibra/Rádio, LPs específicas)
  │     ├── Contatos Operacionais (Horário comercial, plantão, WhatsApp)
  │     ├── Infraestrutura Física (Switches, Roteadores, Medidores de energia, Zabbix Proxy)
  │     └── Procedimentos Operacionais (Avisos de grupo, regras para servidores)
```

### 4.2. Checklist CEM (Controle e Eficiência Microset)
- **7 Setores / Blocos:**
  1. *Chamado de Projetos* (37 perguntas)
  2. *Ativações* (3 perguntas)
  3. *Desenvolvimento* (5 perguntas)
  4. *Intranet* (39 perguntas)
  5. *Backup de Dispositivos* (1 pergunta)
  6. *Homologação* (4 perguntas)
  7. *Qualidade* (1 pergunta)
  - **Total de Perguntas:** 90 questões ativas.
- **Opções de Resposta:** Conforme (`conforme`), Não Conforme (`nao-conforme`), Parcialmente Conforme (`quarta`), Não se Aplica (`na`).
- **Cálculo da Conformidade no Legado:**
  `score = applicable ? Math.round((good / applicable) * 100) : 0`  
  onde `applicable = good + bad + fourth` (itens N/A são excluídos da base de cálculo).

---

## 5. Vulnerabilidades Críticas de Segurança no Legado

1. **Credenciais Expostas no Código:** Senhas padrão (`Admin@123`, `Editor@123`, `Consulta@123`) gravadas em texto puro em `auth.js`.
2. **Armazenamento Desprotegido:** Dados salvos em `localStorage` e `IndexedDB` podem ser inspecionados ou adulterados por qualquer script no navegador.
3. **Ausência de Backend Seguro:** Qualquer usuário pode alterar permissões ou dados disparando funções no console do navegador.
4. **Vulnerabilidade a XSS:** Concatenação direta de strings HTML sem sanitização em `unit.js`, `cliente.js` e `grupo-balbo.js`.
5. **Token do Google Apps Script Exposto:** O token de integração com planilhas consta diretamente no código JavaScript cliente.

---

## 6. Conclusão da Auditoria

O sistema legado contém riqueza operacional imensa (especialmente os dados reais de circuitos e escalonamentos do Grupo Balbo e as 90 questões do Checklist CEM), porém possui arquitetura de persistência e segurança totalmente incompatíveis com um ambiente corporativo de CCO.

A Fase 2 estabelecerá a base de engenharia sólida (React + Vite + Tailwind + Fastify + SQLite com Drizzle ORM) para absorver esses dados com segurança e máxima fidelidade visual.
