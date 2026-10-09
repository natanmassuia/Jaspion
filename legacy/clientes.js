const CLIENTS_STORAGE_KEY = "microset_intranet_clients_v1";
const UNITS_STORAGE_KEY = "microset_intranet_client_units_v1";
const currentUser = MicrosetAuth.getCurrentUser();
if (!currentUser) window.location.replace("login.html");
MicrosetBalbo.sync();

const BALBO_CLIENT = {"id": "grupo-balbo", "name": "Grupo Balbo", "units": 8, "manager": "Marta", "gn": "Marta", "vip": true, "economicGroup": "Grupo Balbo", "description": "Cliente Grupo Balbo. Cadastro estruturado com base no levantamento realizado para revisão de Intranet, mapas/Zabbix, modelo de atendimento, escalation e handover retroativo."};
const BALBO_UNITS = [{"id": "balbo-usf-escritorio-fiusa", "name": "Usina São Francisco Escritório (Escritório Fiusa)", "code": "", "city": "Ribeirão Preto", "state": "SP", "circuit": "Client Telecom MPLS 20 Mbps | Algar MPLS 20 Mbps (112781) | Vivo IP 10 Mbps / LPs 115293620068190, 115293620069099, 115293629107694", "gp": "", "projectTicket": "", "address": "Av. Professor João Fiusa, 1901, Fiusa Center Sala 204, Jardim São Luiz", "businessHours": "", "phone": "(16) 3902-2093"}, {"id": "balbo-usina-uberaba", "name": "Usina Uberaba", "code": "", "city": "Uberaba", "state": "MG", "circuit": "Microset MPLS rádio 50 Mbps | Microset IP dedicado 100 Mbps | Algar Internet rádio 300 Mbps (circuito 0811009)", "gp": "", "projectTicket": "", "address": "Estrada Municipal, 304, Fazenda Santo Antônio, Zona Rural", "businessHours": "", "phone": ""}, {"id": "balbo-usa-concentrador", "name": "Usina Santo Antônio Concentrador", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "Client L2L fibra 100 Mbps | Vivo Internet fibra 200 Mbps (887652) | Algar Internet rádio 120 Mbps (81628) | Algar MPLS rádio 80 Mbps (7352260)", "gp": "", "projectTicket": "", "address": "Fazenda Santo Antônio, Zona Rural", "businessHours": "", "phone": ""}, {"id": "balbo-usf-barracao-barrinha", "name": "Usina São Francisco | Barracão - Barrinha", "code": "", "city": "Barrinha", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-torre-sertaozinho", "name": "Torre Sertãozinho", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-torre-altinopolis", "name": "Torre Altinópolis", "code": "", "city": "Altinópolis", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-native-borba-gato", "name": "Native SP | Borba Gato", "code": "", "city": "Guarulhos", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}, {"id": "balbo-usf-filial", "name": "Usina São Francisco (Filial)", "code": "", "city": "Sertãozinho", "state": "SP", "circuit": "", "gp": "", "projectTicket": "", "address": "", "businessHours": "", "phone": ""}];

const defaultClients = [
  { ...BALBO_CLIENT },
  { id: MicrosetAuth.uuid(), name: "Viralcool", units: 3, manager: "Rafael Dinardi", gn: "Rafael Dinardi", vip: true, economicGroup: "Viralcool", description: "Cliente de monitoramento e operação de conectividade da Microset." },
  { id: MicrosetAuth.uuid(), name: "Unimed Botucatu", units: 2, manager: "Gerente de Negócios", gn: "Gerente de Negócios", vip: false, economicGroup: "Unimed", description: "Cliente com serviços e procedimentos operacionais acompanhados pelo CCO." },
  { id: MicrosetAuth.uuid(), name: "Pot of Foods", units: 1, manager: "Gerente de Negócios", gn: "Gerente de Negócios", vip: false, economicGroup: "Pot of Foods", description: "Cliente com operação monitorada pela Microset." },
  { id: MicrosetAuth.uuid(), name: "Prefeitura de Jardinópolis", units: 1, manager: "Laércio", gn: "Laércio", vip: false, economicGroup: "Prefeitura Municipal de Jardinópolis", description: "Cliente do setor público com múltiplos pontos e procedimentos de escalonamento." },
  { id: MicrosetAuth.uuid(), name: "Molyplast", units: 1, manager: "Gerente de Negócios", gn: "Gerente de Negócios", vip: false, economicGroup: "Molyplast", description: "Cliente Microset." },
  { id: MicrosetAuth.uuid(), name: "Microbiol", units: 1, manager: "Gerente de Negócios", gn: "Gerente de Negócios", vip: false, economicGroup: "Microbiol", description: "Cliente Microset." }
];

const $ = (selector) => document.querySelector(selector);
const clientGrid = $("#clientGrid");
const clientSearch = $("#clientSearch");
const totalClients = $("#totalClients");
const totalUnits = $("#totalUnits");
const clientsEmpty = $("#clientsEmpty");
const clientModal = $("#clientModal");
const clientForm = $("#clientForm");
const newClientButton = $("#newClientButton");
const closeClientModal = $("#closeClientModal");
const cancelClientButton = $("#cancelClientButton");
const cancelConfirm = $("#clientCancelConfirm");
const continueEditingButton = $("#continueClientEditing");
const confirmCancelButton = $("#confirmClientCancel");
const toast = $("#toast");
const menuButton = $("#menuButton");
const mainNav = $("#mainNav");
const notificationButton = $("#notificationButton");

const canCreate = MicrosetAuth.can("clients.create", currentUser);
const canEdit = MicrosetAuth.can("clients.edit", currentUser);
let editingId = null;
let modalSnapshot = "";

function normalizeClientRecord(client) {
  const gn = client.gn || client.manager || "Gerente de Negócios";
  return {
    ...client,
    manager: gn,
    gn,
    vip: client.vip === true || client.vip === "true",
    economicGroup: client.economicGroup || "",
    description: client.description || ""
  };
}

function loadClients() {
  const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
  if (!saved) {
    const seeded = defaultClients.map(normalizeClientRecord);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(saved).map(normalizeClientRecord);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    const seeded = defaultClients.map(normalizeClientRecord);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function loadUnitsDb() {
  try {
    const db = JSON.parse(localStorage.getItem(UNITS_STORAGE_KEY) || "{}");
    return db && typeof db === "object" ? db : {};
  } catch { return {}; }
}

function saveUnitsDb() { localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(unitsDb)); }
function saveClients() { localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients)); }

let clients = loadClients();
let unitsDb = loadUnitsDb();

function ensureBalboData() {
  if (window.MicrosetBalbo) {
    MicrosetBalbo.sync();
    clients = loadClients();
    unitsDb = loadUnitsDb();
    return;
  }
  let changedClients = false;
  let changedUnits = false;
  let balbo = clients.find(client => normalize(client.name) === "grupo balbo" || client.id === BALBO_CLIENT.id);
  if (!balbo) {
    balbo = { ...BALBO_CLIENT };
    clients.push(balbo);
    changedClients = true;
  } else {
    const updated = {
      ...balbo,
      name: BALBO_CLIENT.name,
      manager: balbo.manager || BALBO_CLIENT.manager,
      gn: balbo.gn || balbo.manager || BALBO_CLIENT.gn,
      vip: true,
      economicGroup: balbo.economicGroup || BALBO_CLIENT.economicGroup,
      description: balbo.description || BALBO_CLIENT.description
    };
    const index = clients.findIndex(client => client.id === balbo.id);
    clients[index] = updated;
    balbo = updated;
    changedClients = true;
  }

  const existingUnits = Array.isArray(unitsDb[balbo.id]) ? unitsDb[balbo.id] : [];
  const excludedNames = ["barueri gupe", "cantagalo"];
  let cleanUnits = existingUnits.filter(unit => !excludedNames.includes(normalize(unit.name)));
  if (cleanUnits.length !== existingUnits.length) changedUnits = true;

  BALBO_UNITS.forEach(seed => {
    const found = cleanUnits.find(unit => unit.id === seed.id || normalize(unit.name) === normalize(seed.name));
    if (!found) {
      cleanUnits.push({ ...seed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      changedUnits = true;
    } else {
      Object.keys(seed).forEach(key => {
        if ((found[key] === undefined || found[key] === null || found[key] === "") && seed[key] !== "") {
          found[key] = seed[key];
          changedUnits = true;
        }
      });
    }
  });
  unitsDb[balbo.id] = cleanUnits;
  if (changedClients) saveClients();
  if (changedUnits) saveUnitsDb();
}

ensureBalboData();

function migrateLegacyUnitCounts() {
  let changed = false;
  clients.forEach(client => {
    if (!Array.isArray(unitsDb[client.id])) {
      const legacyCount = Math.max(0, Number(client.units) || 0);
      unitsDb[client.id] = Array.from({length: legacyCount}, (_, index) => ({
        id: MicrosetAuth.uuid(),
        name: legacyCount === 1 ? "Unidade principal" : `Unidade ${index + 1}`,
        migrated: true
      }));
      changed = true;
    }
  });
  if (changed) saveUnitsDb();
}

migrateLegacyUnitCounts();

function unitCount(clientId) { return Array.isArray(unitsDb[clientId]) ? unitsDb[clientId].length : 0; }
function normalize(value = "") { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function initials(value = "") { return String(value).split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0]?.toUpperCase()).join("") || "CL"; }
function escapeHtml(value = "") { return MicrosetAuth.escapeHtml(value); }

function renderClients() {
  clients = loadClients();
  unitsDb = loadUnitsDb();
  migrateLegacyUnitCounts();
  const query = normalize(clientSearch.value);
  const filtered = clients
    .filter(client => !query || normalize(`${client.name} ${client.gn || client.manager} ${client.economicGroup || ""} ${client.description || ""}`).includes(query))
    .sort((a,b) => a.name.localeCompare(b.name,"pt-BR"));

  clientGrid.innerHTML = filtered.map(client => {
    const count = unitCount(client.id);
    return `
    <article class="client-card" data-id="${client.id}" data-open-client="${client.id}" tabindex="0" role="link" aria-label="Abrir ${escapeHtml(client.name)}">
      <div class="client-card__top">
        <div class="client-card__name"><div class="client-logo-placeholder">${escapeHtml(initials(client.name))}</div><div style="min-width:0"><h3 title="${escapeHtml(client.name)}">${escapeHtml(client.name)}</h3><div class="client-card__subtitle-line"><span class="client-card__subtitle">Cliente Microset</span>${client.vip ? `<span class="client-vip-badge">VIP</span>` : ""}</div></div></div>
        <div class="unit-bubble" title="Quantidade de unidades cadastradas"><strong>${count}</strong><span>${count === 1 ? "unidade" : "unidades"}</span></div>
      </div>
      <div class="client-card__manager">
        <div class="manager-info"><div class="manager-avatar">${escapeHtml(initials(client.gn || client.manager))}</div><div class="manager-copy"><span>GN — Gerente de negócios</span><strong title="${escapeHtml(client.gn || client.manager)}">${escapeHtml(client.gn || client.manager)}</strong></div></div>
        <div class="client-card__actions">
          ${canEdit ? `<button class="client-card__edit" type="button" data-edit-client="${client.id}" title="Editar cliente">Editar</button>` : ""}
          <button class="client-card__action" type="button" title="Abrir cliente">→</button>
        </div>
      </div>
    </article>`;
  }).join("");

  totalClients.textContent = clients.length;
  totalUnits.textContent = clients.reduce((sum, client) => sum + unitCount(client.id), 0);
  clientsEmpty.hidden = filtered.length > 0;
}

function serializeClientForm() {
  return JSON.stringify({
    name: $("#clientName").value.trim(),
    code: $("#clientCode").value.trim(),
    economicGroup: $("#clientEconomicGroup").value.trim(),
    manager: $("#clientManager").value.trim(),
    vip: $("#clientVip").value === "true",
    description: $("#clientDescription").value.trim()
  });
}

function openModal(client = null) {
  const isEdit = !!client;
  if (isEdit && !canEdit) return;
  if (!isEdit && !canCreate) return;
  editingId = client?.id || null;
  $("#clientId").value = editingId || "";
  $("#clientName").value = client?.name || "";
  $("#clientCode").value = client?.code || "";
  $("#clientEconomicGroup").value = client?.economicGroup || "";
  $("#clientManager").value = client?.gn || client?.manager || "";
  $("#clientVip").value = client?.vip ? "true" : "false";
  $("#clientDescription").value = client?.description || "";
  $("#clientModalKicker").textContent = isEdit ? "EDITAR CADASTRO" : "NOVO CADASTRO";
  $("#clientModalTitle").textContent = isEdit ? "Editar cliente" : "Cadastrar cliente";
  $("#saveClientButton").textContent = isEdit ? "Salvar alterações" : "Salvar cliente";
  modalSnapshot = serializeClientForm();
  clientModal.classList.add("open");
  clientModal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  setTimeout(() => $("#clientName").focus(), 50);
}

function forceCloseModal() {
  clientModal.classList.remove("open");
  clientModal.setAttribute("aria-hidden","true");
  cancelConfirm.classList.remove("open");
  cancelConfirm.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  clientForm.reset();
  editingId = null;
  modalSnapshot = "";
}

function isClientFormDirty() { return serializeClientForm() !== modalSnapshot; }
function requestCloseModal() {
  if (!clientModal.classList.contains("open")) return;
  cancelConfirm.classList.add("open");
  cancelConfirm.setAttribute("aria-hidden","false");
}
function hideCancelConfirm() {
  cancelConfirm.classList.remove("open");
  cancelConfirm.setAttribute("aria-hidden","true");
}

let toastTimer;
function showToast(title, message) {
  $("#toastTitle").textContent=title;
  $("#toastText").textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),3000);
}

if (!canCreate) {
  newClientButton.hidden = true;
  const readOnly = document.createElement("span");
  readOnly.className = "read-only-pill";
  readOnly.textContent = "Acesso somente para consulta";
  document.querySelector(".clients-search-wrap")?.appendChild(readOnly);
}

clientSearch.addEventListener("input", renderClients);
newClientButton.addEventListener("click", () => openModal());
closeClientModal.addEventListener("click", requestCloseModal);
cancelClientButton.addEventListener("click", requestCloseModal);
continueEditingButton.addEventListener("click", hideCancelConfirm);
confirmCancelButton.addEventListener("click", forceCloseModal);
clientModal.addEventListener("click", event => { if (event.target === clientModal) requestCloseModal(); });
cancelConfirm.addEventListener("click", event => { if (event.target === cancelConfirm) hideCancelConfirm(); });

clientGrid.addEventListener("click", event => {
  const edit = event.target.closest("[data-edit-client]");
  if (edit) {
    event.stopPropagation();
    const client = clients.find(item => item.id === edit.dataset.editClient);
    if (client) openModal(client);
    return;
  }
  const card = event.target.closest("[data-open-client]");
  if (card) window.location.href = `cliente.html?id=${encodeURIComponent(card.dataset.openClient)}`;
});

clientGrid.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("[data-edit-client]")) return;
  const card = event.target.closest("[data-open-client]");
  if (card) { event.preventDefault(); window.location.href = `cliente.html?id=${encodeURIComponent(card.dataset.openClient)}`; }
});

clientForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#clientName").value.trim();
  const code = $("#clientCode").value.trim();
  const economicGroup = $("#clientEconomicGroup").value.trim();
  const manager = $("#clientManager").value.trim();
  const vip = $("#clientVip").value === "true";
  const description = $("#clientDescription").value.trim();
  if (!name || !manager) return;

  if (editingId) {
    if (!canEdit) return;
    const index=clients.findIndex(client=>client.id===editingId);
    if(index<0) return;
    clients[index]={...clients[index],name,code,manager,gn:manager,economicGroup,vip,description,updatedBy:currentUser.name,updatedAt:new Date().toISOString()};
    saveClients();
    renderClients();
    forceCloseModal();
    showToast("Cliente atualizado", `${name} foi atualizado com sucesso.`);
  } else {
    if (!canCreate) return;
    const id = MicrosetAuth.uuid();
    clients.push({id,name,code,manager,gn:manager,economicGroup,vip,description,createdBy:currentUser.name,createdAt:new Date().toISOString()});
    unitsDb[id] = [];
    saveClients();
    saveUnitsDb();
    renderClients();
    forceCloseModal();
    showToast("Cliente cadastrado", `${name} foi adicionado. Abrindo a página do cliente para cadastrar as unidades...`);
    setTimeout(() => { window.location.href = `cliente.html?id=${encodeURIComponent(id)}`; }, 650);
  }
});

menuButton?.addEventListener("click",()=>{const open=mainNav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});
notificationButton?.addEventListener("click",()=>showToast("Notificações","Você tem 3 novos avisos operacionais."));
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape") return;
  if(cancelConfirm.classList.contains("open")) { hideCancelConfirm(); return; }
  if(clientModal.classList.contains("open")) requestCloseModal();
  mainNav?.classList.remove("open");
});

renderClients();
const editFromQuery = new URLSearchParams(location.search).get("edit");
if (editFromQuery && canEdit) {
  const clientToEdit = clients.find(item => item.id === editFromQuery);
  if (clientToEdit) {
    openModal(clientToEdit);
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete("edit");
    history.replaceState({}, "", cleanUrl);
  }
}
