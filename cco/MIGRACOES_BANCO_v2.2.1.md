# Migrações do banco — Checklist CEM v2.2.1

## Objetivo

O banco local usa `schemaVersion`, um número inteiro independente da versão visual do aplicativo. Sempre que a estrutura dos dados mudar, uma nova migração transforma o esquema anterior no seguinte sem apagar lâminas, perguntas, configurações, rascunhos ou tickets.

Versão atual do aplicativo: `2.2.1`  
Versão atual do esquema: `2`

## Fluxo automático

1. O sistema lê `schemaVersion` do arquivo importado.
2. Se o campo não existir, considera o esquema `0`.
3. Executa as funções de migração sequencialmente: `0 → 1`, `1 → 2` e assim por diante.
4. Normaliza e valida o resultado no esquema atual.
5. Registra a operação em `meta.migrationHistory`.
6. Mantém o arquivo selecionado intacto e carrega a cópia convertida somente no navegador.
7. Salva os dados internos somente depois que todas as etapas terminarem sem erro.

Um banco com esquema superior ao suportado é recusado. Isso impede que uma versão antiga do HTML danifique dados criados por uma versão futura.

## Migrações existentes

### Esquema 0 → 1

- Reconhece bancos sem `schemaVersion`.
- Converte os nomes antigos `sections` e `tickets` para `blocks` e `records`.
- Cria configurações e rascunho quando ausentes.

### Esquema 1 → 2

- Adiciona metadados e histórico de migração.
- Normaliza IDs, cores, descrições e perguntas.
- Converte perguntas antigas salvas apenas como texto.
- Converte mapas antigos de respostas para listas estruturadas.
- Adiciona `reviewNeeded` e `reviewReason` aos rascunhos e registros.
- Mantém configurações do Google Sheets e a quarta resposta personalizada.

## Como adicionar o esquema 3 no futuro

1. Aumente `DB_SCHEMA_VERSION` de `2` para `3` no HTML.
2. Adicione uma função `2: data => { ...; data.schemaVersion = 3; return data; }` ao objeto `databaseMigrations`.
3. Não altere nem remova as migrações `0` e `1`; elas são necessárias para bancos antigos percorrerem toda a cadeia.
4. Preserve campos desconhecidos sempre que possível.
5. Inicialize novos campos com valores seguros, sem inventar dados operacionais.
6. Teste pelo menos um banco de cada esquema anterior e um banco já atualizado.
7. Atualize este documento e o banco inicial distribuído no ZIP.

## Preparação para MariaDB

Os identificadores estáveis de blocos, perguntas e registros devem ser preservados na futura migração para MariaDB. Uma importação recomendada é:

- `blocks`: lâminas e ordem de apresentação;
- `questions`: perguntas, vínculo ao bloco e ordem;
- `evaluations`: ticket, data, percentual e revisão;
- `evaluation_answers`: resposta e observação por pergunta;
- `settings`: configurações globais e integração;
- `schema_migrations`: número do esquema e histórico aplicado.

O arquivo JSON continua sendo o formato portátil de intercâmbio. A camada de armazenamento poderá ser trocada por uma API/MariaDB mantendo o mesmo formato de importação e exportação.
