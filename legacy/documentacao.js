const CLIENTS_STORAGE_KEY = "microset_intranet_clients_v1";
const currentUser = MicrosetAuth.getCurrentUser();
MicrosetBalbo.sync();
const BALBO_CLIENT = {"id": "grupo-balbo", "name": "Grupo Balbo", "units": 8, "manager": "Marta", "gn": "Marta", "vip": true, "economicGroup": "Grupo Balbo", "description": "Cliente Grupo Balbo. Cadastro estruturado com base no levantamento realizado para revisão de Intranet, mapas/Zabbix, modelo de atendimento, escalation e handover retroativo."};
const BALBO_UNITS = [{"id": "balbo-usf-escritorio-fiusa", "name": "Usina São Francisco Escritório (Escritório Fiusa)", "code": "", "city": "Ribeirão Preto", "state": "SP", "circuit": "Client Telecom MPLS 20 Mbps | Algar MPLS 20 Mbps (112781) | Vivo IP 10 Mbps / LPs 115293620068190, 115293620069099, 115293629107694", "gp": "", "projectTicket": "", "address": "Av. Professor João Fiusa, 1901, Fiusa Center Sala 204, Jardim São Luiz", "businessHours": "", "phone": "(16) 3902-2093"}, {"id": "balbo-usina-uberaba", "name": "Usina Uberaba", "code": "", "city": "Uberaba", "state": "MG", "circuit": "Microset MPLS rádio 50 Mbps | Microset IP dedicado 100 Mbps | Algar Internet rádio 300 Mbps (circuito 0811009)", "gp": "", "projectTicket": "", "address": "Estrada Municipal, 304, Fazenda Santo Antônio, Zona Rural", "businessHours": "", "phone": ""}, {"id": "balbo-usa-concentrador", "name": "Usina Santo Antônio Concentrador", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "Client L2L fibra 100 Mbps | Vivo Internet fibra 200 Mbps (887652) | Algar Internet rádio 120 Mbps (81628) | Algar MPLS rádio 80 Mbps (7352260)", "gp": "", "projectTicket": "", "address": "Fazenda Santo Antônio, Zona Rural", "businessHours": "", "phone": ""}, {"id": "balbo-usf-barracao-barrinha", "name": "Usina São Francisco | Barracão - Barrinha", "code": "", "city": "Barrinha", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-torre-sertaozinho", "name": "Torre Sertãozinho", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-torre-altinopolis", "name": "Torre Altinópolis", "code": "", "city": "Altinópolis", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-native-borba-gato", "name": "Native SP | Borba Gato", "code": "", "city": "Guarulhos", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-usf-filial", "name": "Usina São Francisco (Filial)", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}];

if (!currentUser) window.location.replace("login.html");

const $ = (selector) => document.querySelector(selector);
const grid = $("#documentationClientGrid");
const search = $("#documentationSearch");
const empty = $("#documentationEmpty");
const menuButton = $("#menuButton");
const mainNav = $("#mainNav");
const notificationButton = $("#notificationButton");
const toast = $("#toast");

const fallbackClients = [
  { ...BALBO_CLIENT },
  { id: "client-viralcool", name: "Viralcool", units: 3, manager: "Rafael Dinardi" },
  { id: "client-unimed-botucatu", name: "Unimed Botucatu", units: 2, manager: "Gerente de Negócios" },
  { id: "client-pot-foods", name: "Pot of Foods", units: 1, manager: "Gerente de Negócios" },
  { id: "client-jardinopolis", name: "Prefeitura de Jardinópolis", units: 1, manager: "Laércio" }
];

function loadClients() {
  try {
    const saved = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch {}
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(fallbackClients));
  return fallbackClients;
}

let clients = loadClients();
const normalize = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const initials = (value = "") => value.split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]?.toUpperCase()).join("") || "CL";
const esc = (value = "") => MicrosetAuth.escapeHtml(value);

function render() {
  clients = loadClients();
  const query = normalize(search.value);
  const filtered = clients.filter(client => !query || normalize(`${client.name} ${client.manager}`).includes(query)).sort((a,b) => a.name.localeCompare(b.name,"pt-BR"));
  grid.innerHTML = filtered.map(client => `
    <article class="client-card" tabindex="0" role="link" data-client-id="${esc(client.id)}" aria-label="Abrir documentação de ${esc(client.name)}">
      <div class="client-card__top">
        <div class="client-card__name">
          <div class="client-logo-placeholder">${esc(initials(client.name))}</div>
          <div style="min-width:0">
            <h3 title="${esc(client.name)}">${esc(client.name)}</h3>
            <span class="client-card__subtitle">Cliente Microset</span>
            <span class="document-card-tag">Procedimentos + Documentação</span>
          </div>
        </div>
        <div class="unit-bubble" title="Quantidade de unidades"><strong>${Number(client.units)||0}</strong><span>unidades</span></div>
      </div>
      <div class="client-card__manager">
        <div class="manager-info">
          <div class="manager-avatar">${esc(initials(client.manager))}</div>
          <div class="manager-copy"><span>Gerente de negócios</span><strong title="${esc(client.manager)}">${esc(client.manager)}</strong></div>
        </div>
        <button class="client-card__action" type="button" aria-label="Abrir cliente">→</button>
      </div>
    </article>`).join("");
  $("#documentationClientCount").textContent = clients.length;
  $("#documentationUnitCount").textContent = clients.reduce((sum, client) => sum + (Number(client.units)||0), 0);
  empty.hidden = filtered.length > 0;
}

function openClient(id) {
  window.location.href = `cliente.html?id=${encodeURIComponent(id)}&tab=documentacao`;
}

grid.addEventListener("click", event => {
  const card = event.target.closest("[data-client-id]");
  if (card) openClient(card.dataset.clientId);
});
grid.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-client-id]");
  if (card) { event.preventDefault(); openClient(card.dataset.clientId); }
});
search.addEventListener("input", render);
menuButton?.addEventListener("click",()=>{const open=mainNav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});
let toastTimer;
notificationButton?.addEventListener("click",()=>{toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),3000);});
render();
