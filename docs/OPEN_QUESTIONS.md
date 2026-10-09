# Questões Abertas e Decisões Técnicas — Jaspion V1

**Data:** 08/10/2026  
**Finalidade:** Registrar ambiguidades e pontos de validação com a equipe da Microset Telecom sem interromper o fluxo de desenvolvimento.

---

### 1. Regra de Cálculo do Score do Checklist CEM para "Parcialmente Conforme"
- **Situação no Legado:**
  No código legado (`checklist-qualidade-cem-v2.2.1.html`), o cálculo era realizado como:
  `score = Math.round((good / (good + bad + fourth)) * 100)`
  onde `fourth` representa a resposta "Parcialmente Conforme".
  Dessa forma, o item "Parcialmente Conforme" aumentava o denominador sem somar pontos no numerador (impactando negativamente a nota da mesma forma que um "Não Conforme").
- **Alternativa Proposta:**
  Em alguns modelos de qualidade, itens parcialmente conformes atribuem metade da pontuação (ex: 50% ou 0,5 pontos).
- **Decisão Provisória V1:**
  Manteremos a fórmula literal do legado para preservar consistência com o histórico, mas com a função de cálculo isolada em `calculateCemScore()` no pacote `shared` para permitir ajuste imediato caso QA opte por peso de 50%.

---

### 2. Credenciais e Endpoint Oficial do Znuny
- **Situação:**
  Não há credenciais reais nem URLs corporativas de produção do Znuny expostas no repositório (o que é uma boa prática de segurança).
- **Decisão Provisória V1:**
  A integração será implementada com client configurável via variáveis de ambiente (`ZNUNY_API_URL`, `ZNUNY_API_USER`, `ZNUNY_API_TOKEN`) e fornecerá uma camada de **Mock/Fixtures** habilitada por padrão em ambiente de desenvolvimento (`ZNUNY_MOCK=true`). A conexão real só será acionada quando os parâmetros de produção forem definidos pela TI da Microset.

---

### 3. Integração com Sankhya
- **Situação:**
  O legado possui campos manuais para códigos do Sankhya (código do projeto, código do cliente, GP).
- **Diretriz Confirmada:**
  Não haverá integração automática com o Sankhya na V1. Os campos permanecerão como metadados textuais cadastrados e pesquisáveis na busca global.

---

### 4. Compilação de Drivers Nativos (`better-sqlite3`) no Windows Server 2016
- **Situação:**
  O `better-sqlite3` requer binários nativos Node C++. Dependendo da versão do Node.js e do Visual C++ Redistributable no Windows Server 2016, a compilação nativa pode demandar ferramentas específicas.
- **Mitigação Arquitetural:**
  O backend utilizará uma abstração de driver através do Drizzle ORM, permitindo o uso de `better-sqlite3` com pré-compilados do Node LTS ou fallback imediato para `sqlite3` / driver WASM puro (`@libsql/client`), garantindo compatibilidade total sem dependência de compiladores no servidor de produção.
