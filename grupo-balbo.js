/* Grupo Balbo — fonte consolidada DEV v0.122 */
(function () {
  const PENDING = "PENDENTE — informação não localizada nas fontes consultadas";
  const VERSION = "0.122";
  const CLIENT_ID = "grupo-balbo";
  const PROJECT_TICKET = "882005329";
  const SOURCE_URL = "http://www.microset.net.br/?p=81712";

  const standardTelecom = [
    "Ao receber um alerta, ligar imediatamente para Douglas no horário comercial: (16) 3946-4062.",
    "Após o contato com o cliente, realizar o escalonamento interno imediato; responsável inicial: Marta Corrêa.",
    "Fora do horário comercial, acionar José Carlos pelo WhatsApp: (16) 98146-0581.",
    "Registrar o atendimento e a finalização nos grupos GB-MICROSET - NOC - INF e INT - Balbo CCO.",
    "Não limitar as informações somente ao grupo do cliente.",
    "Para alertas de servidor, reclassificar como Cliente Informado e encerrar conforme o procedimento vigente."
  ];
  const standardInfrastructure = "A unidade requer integração técnica. Grupo de integração: INTERNOM7-CCO/Integração M7-Fornecedores.";
  const escalationHtml = `<h3>Escalonamentos</h3><h4>Cliente — horário comercial</h4><ol><li>Douglas — (16) 3946-4062</li></ol><h4>Cliente — fora do horário comercial</h4><ul><li>José Carlos — WhatsApp (16) 98146-0581</li><li>Não limitar as informações somente ao grupo do cliente.</li></ul><h4>Escalonamento interno</h4><ol><li>Marta Corrêa</li><li>Luis Henrique — GN</li></ol>`;
  const list = items => `<ol>${items.map(item => `<li>${item}</li>`).join("")}</ol>`;
  const bullets = items => items.length ? `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>` : `<p class="pending-data">${PENDING}</p>`;
  const procedure = `<h4>Telecom</h4>${list(standardTelecom)}<h4>Infraestrutura</h4><ol><li>${standardInfrastructure}</li></ol>`;
  const section = unit => `<h3>Identificação</h3><p><strong>Identificação na Intra:</strong> ${unit.intra}</p><p><strong>Ambiente:</strong> ${unit.environment || `<span class="pending-data">${PENDING}</span>`}</p><p><strong>Chamado do projeto:</strong> ${unit.projectTicket}</p><h3>Serviços</h3><h4>Telecom — links</h4>${bullets(unit.telecom)}<h4>Infraestrutura</h4>${unit.infrastructure.length ? bullets(unit.infrastructure) : `<p class="pending-data">PENDENTE — infraestrutura não reportada.</p>`}<h3>Mapa e dependências</h3>${unit.dependenciesPending ? `<p class="pending-data">PENDENTE — dependências não informadas.</p>` : `<p>${unit.dependencies}</p>`}<h3>Procedimentos</h3>${unit.procedureHtml}${escalationHtml}${unit.pending?.length ? `<h3>Pendências e validações necessárias</h3><ul class="pending-data">${unit.pending.map(item => `<li>${item}</li>`).join("")}</ul>` : ""}`;

  const base = { code:PENDING, city:PENDING, state:PENDING, gp:PENDING, projectTicket:PROJECT_TICKET, address:PENDING, businessHours:PENDING, phone:PENDING, environment:"Intranet", infrastructure:[], dependenciesPending:true, procedureHtml:procedure, pending:[], sourceUrl:SOURCE_URL };
  const unitImages = {
    "balbo-usa-concentrador": { image:"assets/balbo-usa.jpg", imageLabel:"Foto oficial — Native / Grupo Balbo" },
    "balbo-usina-uberaba": { image:"assets/balbo-ube.jpg", imageLabel:"Foto oficial — Native / Grupo Balbo" },
    "balbo-ufra-usina-sao-francisco": { image:"assets/balbo-ufra.jpg", imageLabel:"Foto oficial — Native / Grupo Balbo" },
    "balbo-native-guarulhos": { image:"assets/balbo-guarulhos-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-native-fiusa": { image:"assets/balbo-fiusa-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-barrinha-deposito": { image:"assets/balbo-barrinha-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-santa-ernestina": { image:"assets/balbo-santa-ernestina-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-torre-sertaozinho": { image:"assets/balbo-torre-sertaozinho-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-barueri-gupe": { image:"assets/balbo-guarulhos-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-cantagalo": { image:"assets/balbo-fiusa-illustrative.png", imageLabel:"Imagem ilustrativa" },
    "balbo-torre-altinopolis": { image:"assets/balbo-torre-sertaozinho-illustrative.png", imageLabel:"Imagem ilustrativa" }
  };
  const units = [
    { id:"balbo-usa-concentrador", name:"USA — Usina Santo Antônio — Concentrador", intra:"USINA SANTO ANTONIO | CONCENTRADOR", code:"8081", city:"Sertãozinho", state:"SP", address:"Fazenda Santo Antônio, Zona Rural, Sertãozinho-SP", gp:"Luis Henrique", telecom:["Cliente — L2L, 100 Mbps, fibra","Vivo — Internet, 200 Mbps, fibra; circuito 887652; LP IP dedicado 115993942260999; LP VPN IP 115993942272490","Algar — Internet, 120 Mbps, rádio; circuito 81628","Algar — MPLS, 80 Mbps, rádio; circuito 7352260"], infrastructure:["Switches","Servidores","PABX","Medidor de energia","Medidor de energia de backup","Zabbix Proxy"], dependenciesPending:false, dependencies:"Conecta-se à UFRA — Usina São Francisco por fibra do cliente e rádio.", pending:[] },
    { id:"balbo-usina-uberaba", name:"UBE — Usina Uberaba", intra:"USINA UBERABA", code:"8083", city:"Uberaba", state:"MG", address:"Estrada Municipal, 304 — Fazenda Santo Antônio, Zona Rural, Uberaba-MG", gp:"Luis Henrique", telecom:["Microset — MPLS, 50 Mbps, rádio","Microset + Web — IP dedicado, 100 Mbps","Algar — Internet IP, 300 Mbps, rádio; circuito 0811009","Algar — MPLS VPN, 200 Mbps, rádio; circuito 217957","Vivo — IP dedicado; LP 325480155525395","Vivo — MPLS VPN IP; LP 325480165836998"], infrastructure:["Switches","Servidores","PABX"], pending:[] },
    { id:"balbo-ufra-usina-sao-francisco", name:"UFRA — Usina São Francisco", intra:"USINA SAO FRANCISCO", code:"9006", city:"Sertãozinho", state:"SP", address:"Rodovia Carlos Tonani, km 97,5, Sertãozinho-SP, CEP 14174-000", phone:"(16) 3946-7000", gp:"Luis Henrique", telecom:["Fibra do cliente interligando UFRA e USA"], infrastructure:["Switches","Servidores","PABX","Medidor de energia","Medidor de energia de backup"], dependenciesPending:false, dependencies:"Conecta-se à USA por fibra do cliente e rádio. Em falha da fibra, informar o cliente e validar o local e os equipamentos.", pending:[] },
    { id:"balbo-native-guarulhos", name:"Native — Escritório Guarulhos", intra:"NATIVE SP | BORBA GATO", code:"8702", city:"Guarulhos", state:"SP", address:"Rua Manoel Borba Gato, 100, Vila Saiago, Guarulhos-SP", businessHours:"Atendimento 24 horas", gp:"Luis Henrique", telecom:["WCS — MPLS, 100 Mbps, fibra; circuito ZZ63504023001","Algar — MPLS, 20 Mbps, fibra; circuito 0000081648","Vivo — VPN IP MPLS; LP 118922421015896"], infrastructure:["Switches","PABX"], pending:[] },
    { id:"balbo-native-fiusa", name:"Native — Escritório Fiúsa", intra:"USINA SAO FRANCISCO | ESCRITORIO", code:"8082", city:"Ribeirão Preto", state:"SP", address:"Avenida Professor João Fiúsa, 1901, Fiúsa Center, sala 204, Jardim São Luiz, Ribeirão Preto-SP", gp:"Luis Henrique", telecom:["Cliente — MPLS, 20 Mbps, fibra","Algar — MPLS, 20 Mbps, fibra; circuito 112781","Vivo — IP dedicado, 10 Mbps, fibra; LP 115293620068190","Vivo — MPLS; LP 115293620069099","Vivo — IP dedicado; LP 115293629107694"], pending:[] },
    { id:"balbo-barrinha-deposito", name:"Barrinha — Depósito", intra:"USINA SAO FRANCISCO | BARRACAO - BARRINHA", code:"24529", city:"Barrinha", state:"SP", address:"Avenida Giovani Marcari, 750, Quadra 04, Área Industrial, Barrinha-SP", gp:"Luis Henrique", telecom:["NICNET — Internet, 30 Mbps, fibra; ONU FHTT97763138; VLAN 1861 untagged"], dependenciesPending:false, dependencies:"Fibra direcionada ao depósito de herbicida da UFRA.", pending:[] },
    { id:"balbo-santa-ernestina", name:"Santa Ernestina", intra:`<span class="pending-data">PENDENTE — unidade não localizada na fonte pública consultada.</span>`, city:"Santa Ernestina", state:"SP", gp:PENDING, telecom:["Microset — MPLS, 20 Mbps, rádio"], pending:["Validar o código, endereço, identificação na Intra e situação cadastral da unidade."] },
    { id:"balbo-torre-sertaozinho", name:"Torre Sertãozinho", intra:"TORRE SERTAOZINHO", code:"28348", city:"Sertãozinho", state:"SP", address:"Estrada Municipal Jacomo Nelson Balbo, Setor Industrial Nordeste, Sertãozinho-SP", gp:"Luis Henrique", telecom:["Microset — MPLS, 20 Mbps, rádio"], pending:[] },
    { id:"balbo-barueri-gupe", name:"Barueri — Gupe", intra:"BARUERI | GUPE", code:"8703", city:"Barueri", state:"SP", address:"Avenida Gupe, 10767, Jardim Belval, Barueri-SP", gp:"Luis Henrique", telecom:["WCS — MPLS, 10 Mbps, fibra","Algar — MPLS, 20 Mbps, fibra; circuito 81649"], pending:[] },
    { id:"balbo-cantagalo", name:"Cantagalo", intra:"CANTAGALO", code:"8701", city:"São Paulo", state:"SP", address:"Rua Cantagalo, 74, Tatuapé, São Paulo-SP", gp:"Luis Henrique", telecom:["WCS — MPLS, 10 Mbps, fibra","Algar — MPLS, 20 Mbps, fibra; circuito 81647"], pending:[] },
    { id:"balbo-torre-altinopolis", name:"Torre Altinópolis", intra:"TORRE ALTINOPOLIS", code:"28347", city:"Altinópolis", state:"SP", address:"Estrada José Leme Walter, 00, Parque Municipal da Santa Cruz, Thomaz Rodrigues Alkmin, Altinópolis-SP", gp:"Luis Henrique", telecom:["Microset — MPLS, 20 Mbps, rádio"], pending:[] }
  ].map(raw => { const unit={...base,...raw,...(unitImages[raw.id]||{})}; unit.circuit=unit.telecom.length?unit.telecom.join(" | "):PENDING; unit.content=section(unit); return unit; });

  const client = { id:CLIENT_ID, name:"Grupo Balbo", code:PENDING, units:11, manager:"Marta Corrêa", gn:"Luis Henrique", vip:true, economicGroup:"Grupo Balbo", description:"Cadastro operacional consolidado com o handover e a Intranet CCO pública. Unidades explicitamente desativadas foram excluídas." };
  const procedures = [
    { id:"balbo-proc-telecom", title:"Procedimento operacional padrão — Telecom", category:"Operacional", version:VERSION, description:standardTelecom.map((v,i)=>`${i+1}. ${v}`).join("\n"), link:"" },
    { id:"balbo-proc-infra", title:"Procedimento operacional padrão — Infraestrutura", category:"Infraestrutura", version:VERSION, description:standardInfrastructure, link:"" },
    { id:"balbo-escalonamento", title:"Matriz padrão de escalonamento", category:"Escalonamento", version:VERSION, description:"HORÁRIO COMERCIAL\nDouglas — (16) 3946-4062\n\nFORA DO HORÁRIO COMERCIAL\nJosé Carlos — WhatsApp (16) 98146-0581\n\nINTERNO\nMarta Corrêa\nLuis Henrique", link:"" },
    { id:"balbo-pendencias", title:"Pendências consolidadas", category:"Checklist", version:VERSION, description:"PENDENTE — validar o cadastro oficial, o código, o endereço e a situação operacional de Santa Ernestina.", link:"", pending:true }
  ];
  function parse(key,fallback){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;} }
  function sync(){
    const clientsKey="microset_intranet_clients_v1", unitsKey="microset_intranet_client_units_v1", contentKey="microset_intranet_client_content_v1", unitContentKey="microset_intranet_unit_content_v1";
    const saved=parse(unitsKey,{}); const current=Array.isArray(saved[CLIENT_ID])?saved[CLIENT_ID]:[];
    const ready=units.every(seed=>current.some(item=>item.id===seed.id&&item.image===seed.image));
    if(localStorage.getItem("microset_balbo_data_version")===VERSION&&ready)return;
    const clients=parse(clientsKey,[]); const index=clients.findIndex(item=>item.id===CLIENT_ID||String(item.name||"").toLowerCase()==="grupo balbo");
    if(index>=0)clients[index]={...clients[index],...client,id:CLIENT_ID,name:client.name,units:11};else clients.push(client);
    saved[CLIENT_ID]=units.map(({content,...unit})=>{const previous=current.find(item=>item.id===unit.id)||{};return {...previous,...unit,createdAt:previous.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};});
    const contentDb=parse(contentKey,{}), previousContent=contentDb[CLIENT_ID]||{procedures:[],documents:[]};
    contentDb[CLIENT_ID]={procedures:procedures.map(seed=>({...((previousContent.procedures||[]).find(item=>item.id===seed.id)||{}),...seed})),documents:Array.isArray(previousContent.documents)?previousContent.documents:[]};
    const unitContentDb=parse(unitContentKey,{});
    units.forEach(unit=>{const key=`${CLIENT_ID}::${unit.id}`,previous=unitContentDb[key]||{};unitContentDb[key]={...previous,title:previous.title||"Handover operacional da unidade",html:unit.content,updatedAt:new Date().toISOString(),updatedBy:"Atualização DEV v0.122 — fonte Intranet CCO"};});
    localStorage.setItem(clientsKey,JSON.stringify(clients)); localStorage.setItem(unitsKey,JSON.stringify(saved)); localStorage.setItem(contentKey,JSON.stringify(contentDb)); localStorage.setItem(unitContentKey,JSON.stringify(unitContentDb)); localStorage.setItem("microset_balbo_data_version",VERSION);
  }
  window.MicrosetBalbo={VERSION,CLIENT_ID,PENDING,client,units,procedures,sync};
})();
