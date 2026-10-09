

Atualização v0.108:
- Cliente Grupo Balbo pré-cadastrado como VIP, Grupo Econômico Grupo Balbo, GN Marta.
- 8 unidades confirmadas adicionadas ao cadastro.
- Barueri Gupe e Cantagalo permanecem excluídas.
- Campos sem informação confirmada foram mantidos em branco/Não informado.

Atualização v0.109:
- Padronizada a altura da área azul das páginas operacionais para 360 px no desktop.
- Padronizados os eixos horizontais e verticais do conteúdo em Início, Clientes, Documentação, Cliente e Unidade.
- Mascote e elementos gráficos agora ocupam a mesma posição e escala entre páginas.
- Página Usuários e Permissões alinhada ao mesmo eixo visual.
- Conteúdos continuam específicos de cada tela, sem alterar dados ou funcionalidades.

Atualização v0.110:
- Altura da faixa azul reduzida de 360 px para 320 px em todas as páginas operacionais.
- Mascote reduzido proporcionalmente, preservando os eixos e alinhamentos.

Atualização v0.111:
- Grupo Balbo atualizado a partir do handover fornecido pelo usuário.
- Mantidas exclusivamente 8 unidades: USA, UBE, UFRA, Native Guarulhos, Native Fiúsa, Barrinha, Santa Ernestina e Torre Sertãozinho.
- Serviços de Telecom, Infraestrutura, dependências, procedimentos e escalonamentos cadastrados.
- Pendências e informações ausentes destacadas em vermelho e negrito.
- Migração versionada atualiza dados já salvos no navegador e remove unidades antigas do Grupo Balbo.

Atualização v0.112:
- Adicionada lâmina fotográfica horizontal nas 8 unidades do Grupo Balbo.
- USA, UBE e UFRA usam fotos oficiais publicadas pela Native / Grupo Balbo.
- Escritórios, Barrinha, Santa Ernestina e Torre Sertãozinho usam imagens ilustrativas, identificadas na interface.
- Cadastros continuam armazenados no navegador e migrações preservam alterações existentes.
- Adicionados os comandos Exportar dados e Importar backup na página Clientes para transportar os cadastros entre navegadores, computadores ou versões abertas em endereços diferentes.

Atualização v0.113:
- Corrigida a migração de navegadores que já tinham marcado a v0.112 antes de receber os caminhos das imagens.
- A página da unidade agora usa a imagem cadastrada ou, como segurança, a imagem padrão da unidade na própria versão.
- A correção preserva os dados e edições existentes.

Atualização v0.114:
- Bloco 1 da página de unidade agora apresenta somente o cliente, código do cliente, status VIP e mascote M7.
- Bloco 2 reúne imagem, nome da unidade, cidade/estado, endereço, cliente, código do cliente e GN.
- Removida a repetição do nome da unidade no cabeçalho e no quadro cadastral inferior.
- Adicionado o campo Código do cliente ao formulário de cadastro e edição de clientes.
Atualização v0.115:
- Adicionada a área CCO entre Início e Clientes no menu principal.
- Incorporado integralmente o Checklist de Qualidade CEM v2.2.1, com logotipo, mascote, backup, histórico, administração, instruções e arquivos auxiliares.
- Incluído link de retorno do Checklist CEM para a Intranet.
Atualização v0.116:
- Padronizada a página CCO com a barra superior completa da Intranet.
- Mantida a navegação para todas as seções do site, com CCO destacado como área ativa.
- Ajustado o comportamento responsivo e a impressão do Checklist de Qualidade.
Atualização v0.117:
- Substituído o logotipo recriado do CCO pela assinatura oficial negativa da Microset.
- Padronizadas as dimensões da barra superior, logotipo e faixa cromática conforme o brandbook e as demais páginas.
Projeto integrado Intranet Microset + Checklist CCO — v0.116

Armazenamento:
- IndexedDB unificado: microset-intranet-cco.
- Stores: main (clientes, unidades, conteúdos e usuários), cco (checklist e histórico) e meta (versão e migrações).
- Os dados antigos do localStorage são migrados automaticamente e mantidos como cache de compatibilidade.
- O banco anterior cem-checklist-db é migrado automaticamente para o store cco.
- O backup agora reúne Intranet e Checklist CCO em um único arquivo JSON.
- Backups antigos da Intranet e do Checklist continuam aceitos para importação.

Operação de versões:
- A pasta DEV deve manter esta versão mais recente em uma pasta estável, sem compactação.
- A promoção para Produção somente deve ocorrer após aprovação, com backup prévio e execução das migrações.
Atualização v0.117:
- Implementado modo escuro em toda a POC com paleta confortável, superfícies em camadas e cores dessaturadas.
- Adicionado controle Sol/Lua em todas as páginas, inclusive login e CCO.
- A preferência acompanha o sistema por padrão e a escolha manual é preservada no localStorage sem clarão no carregamento.
- Imagens são atenuadas no modo escuro e os estados de foco e contraste foram reforçados para acessibilidade.
Atualização v0.118:
- O CCO passou a usar exatamente o mesmo cabeçalho, tipografia e folha de estilos das demais áreas da Intranet.
- Eliminada a recriação visual independente que causava diferenças de alinhamento, fonte e espaçamento.
- Isolados os estilos do banner interno do Checklist para evitar conflitos com a navegação global.
Atualização v0.119:
- CCO transformado em seção principal com menu suspenso e subseção Qualidade.
- Conteúdo do Checklist de Qualidade mantido integralmente na subseção Qualidade.
- Criada página inicial da área CCO.
- Criado painel administrativo para cadastrar seções e subseções persistentes.
- Novas áreas direcionam automaticamente para uma página padronizada "Em construção".
- Adicionado atalho administrativo ao cabeçalho de todas as páginas.
Atualização DEV v0.120:
- Corrigida a duplicação da seção CCO ao navegar para Clientes e outras páginas.
- A navegação agora é reconstruída por uma única estrutura canônica compartilhada.
- Todas as seções existentes podem ser renomeadas, ocultadas/exibidas e reordenadas no painel administrativo.
- É possível adicionar subseções a qualquer seção existente.
- Produção permanece inalterada, conforme a diretriz Dev/Prod.
Atualização DEV v0.121:
- Padronizadas as colunas do cabeçalho para manter logotipo, navegação e ações nos mesmos eixos em todas as seções.
- Controles ausentes são completados automaticamente para evitar diferenças visuais entre páginas.
- Adicionada transição curta e View Transition entre páginas para eliminar a piscada visual durante a navegação.
- Produção permanece inalterada.
Atualização DEV v0.123:
- A pasta do projeto passou a ser a fonte oficial dos dados cadastrados na POC.
- O arquivo shared-database.js controla a versão do banco compartilhado e atualiza o cache de cada navegador automaticamente.
- localStorage e IndexedDB permanecem apenas como cache e área de rascunho, não como fonte oficial da versão.
- Todos os usuários que abrirem os HTMLs da mesma versão recebem os mesmos dados publicados na pasta.
- Por segurança do navegador em file://, edições administrativas feitas pela interface precisam ser publicadas em uma nova versão para se tornarem compartilhadas.
- Produção permanece inalterada.
Atualização DEV v0.122:
- O controle de tema exibe somente a ação oposta ao tema atual: Sol no modo escuro e Lua no modo claro.
- Grupo Balbo atualizado com dados cadastrais e operacionais da Intranet CCO pública e do handover anterior.
- Adicionadas Barueri — Gupe, Cantagalo e Torre Altinópolis; Santa Ernestina foi preservada com pendências destacadas.
- IMOBILIARIA e QUIOSQUE NATIVE não foram adicionadas porque constam como desativadas na fonte.
- Credenciais eventualmente expostas na fonte pública não foram copiadas para a POC.
- Produção permanece inalterada.
