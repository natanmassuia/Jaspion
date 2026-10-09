const CLIENTS_STORAGE_KEY = "microset_intranet_clients_v1";
const UNITS_STORAGE_KEY = "microset_intranet_client_units_v1";
const CONTENT_STORAGE_KEY = "microset_intranet_client_content_v1";
const currentUser = MicrosetAuth.getCurrentUser();
if (!currentUser) window.location.replace("login.html");
MicrosetBalbo.sync();

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const clientId = params.get("id");
const canManage = MicrosetAuth.can("content.manage", currentUser);
const canManageUnits = MicrosetAuth.can("clients.edit", currentUser);
let activeTab = params.get("tab") === "documentacao" ? "documentacao" : "procedimentos";
let editingContentId = null;
let editingContentType = null;
let contentSnapshot = "";
let editingUnitId = null;
let unitSnapshot = "";

function loadClients(){ try{return JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY)||"[]")||[];}catch{return [];} }
function saveClients(data){ localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(data)); }
function loadUnitsDb(){ try{return JSON.parse(localStorage.getItem(UNITS_STORAGE_KEY)||"{}")||{};}catch{return {};} }
function saveUnitsDb(data){ localStorage.setItem(UNITS_STORAGE_KEY,JSON.stringify(data)); }
function loadContent(){ try{return JSON.parse(localStorage.getItem(CONTENT_STORAGE_KEY)||"{}")||{};}catch{return {};} }
function saveContent(data){ localStorage.setItem(CONTENT_STORAGE_KEY,JSON.stringify(data)); }
const esc = (v="") => MicrosetAuth.escapeHtml(v);
const initials = (v="") => String(v).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"CL";
const norm = (v="") => String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const formatDate = iso => { if(!iso)return "—"; try{return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(iso));}catch{return "—";} };
const fallback = value => value && String(value).trim() ? String(value).trim() : "Não informado";
const pendingClass = value => /PENDENTE/i.test(String(value || "")) ? "pending-data" : "";
function isVipFlag(value){ return value === true || value === "true" || value === 1 || value === "1" || String(value).trim().toLowerCase() === "sim"; }

let clients = loadClients();
let client = clients.find(item => item.id === clientId);
if (!client) {
  document.body.innerHTML = `<main class="client-detail-shell"><div class="content-empty" style="display:block"><div>!</div><h3>Cliente não encontrado</h3><p>O cadastro solicitado não existe ou foi removido.</p><p style="margin-top:14px"><a href="clientes.html" style="color:var(--micro-blue);font-weight:800">Voltar para Clientes</a></p></div></main>`;
  throw new Error("Cliente não encontrado");
}
client = {
  ...client,
  gn: client.gn || client.manager || "Gerente de Negócios",
  manager: client.gn || client.manager || "Gerente de Negócios",
  vip: isVipFlag(client.vip),
  economicGroup: client.economicGroup || "",
  description: client.description || ""
};

let unitsDb = loadUnitsDb();
function normalizeUnitRecord(unit = {}, index = 0) {
  return {
    id: unit.id || MicrosetAuth.uuid(),
    name: unit.name || unit.unit || (index === 0 ? "Unidade principal" : `Unidade ${index + 1}`),
    code: unit.code || "",
    city: unit.city || "",
    state: unit.state || "",
    circuit: unit.circuit || "",
    gp: unit.gp || "",
    projectTicket: unit.projectTicket || unit.project || "",
    address: unit.address || "",
    businessHours: unit.businessHours || unit.hours || "",
    phone: unit.phone || "",
    createdAt: unit.createdAt || new Date().toISOString(),
    updatedAt: unit.updatedAt || unit.createdAt || "",
    migrated: !!unit.migrated
  };
}
function migrateLegacyUnits(){
  let changed = false;
  if (!Array.isArray(unitsDb[clientId])) {
    const legacyCount = Math.max(0, Number(client.units) || 0);
    unitsDb[clientId] = Array.from({length: legacyCount}, (_, i) => normalizeUnitRecord({name: legacyCount === 1 ? "Unidade principal" : `Unidade ${i + 1}`, migrated:true}, i));
    changed = true;
  } else {
    unitsDb[clientId] = unitsDb[clientId].map((unit, index) => normalizeUnitRecord(unit, index));
    changed = true;
  }
  if (changed) saveUnitsDb(unitsDb);
}
migrateLegacyUnits();
function currentUnits(){ return Array.isArray(unitsDb[clientId]) ? unitsDb[clientId] : []; }

function renderClientHeader(){
  clients = loadClients();
  client = clients.find(item => item.id === clientId) || client;
  client = { ...client, gn: client.gn || client.manager || "Gerente de Negócios", manager: client.gn || client.manager || "Gerente de Negócios", vip: isVipFlag(client.vip), economicGroup: client.economicGroup || "", description: client.description || "" };
  document.title = `${client.name} — Intranet Microset`;
  $("#clientName").textContent = client.name;
  $("#clientUnits").textContent = currentUnits().length;
  $("#clientManager").textContent = client.gn || client.manager || "—";
  $("#clientInitials").textContent = initials(client.name);
  $("#clientInfoName").textContent = client.name;
  $("#clientEconomicGroup").textContent = client.economicGroup || "Não informado";
  $("#clientGn").textContent = client.gn || client.manager || "Não informado";
  $("#clientDescription").textContent = client.description || "Sem descrição cadastrada.";
  const vipSeal = $("#clientVipSeal");
  if (vipSeal) {
    const showVipSeal = isVipFlag(client.vip);
    vipSeal.hidden = !showVipSeal;
    vipSeal.style.display = showVipSeal ? "block" : "none";
  }
  const editLink = $("#editClientLink");
  if(editLink){
    editLink.href = `clientes.html?edit=${encodeURIComponent(client.id)}`;
    if(!MicrosetAuth.can("clients.edit", currentUser)) editLink.hidden = true;
  }
}

let contentDb = loadContent();
if (!contentDb[clientId]) {
  contentDb[clientId] = {
    procedures:[{id:MicrosetAuth.uuid(),title:"Fluxo de atendimento N1",category:"Operacional",version:"1.0",description:"Procedimento inicial de referência para atendimento e direcionamento operacional do cliente.",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:"Sistema POC"}],
    documents:[{id:MicrosetAuth.uuid(),title:"Handover operacional",category:"Handover",version:"1.0",description:"Documento de referência para operação, contendo informações essenciais do cliente.",link:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),updatedBy:"Sistema POC"}]
  };
  saveContent(contentDb);
}
function currentData(){ return contentDb[clientId] || {procedures:[],documents:[]}; }
function renderCounts(){ $("#procedureCount").textContent = currentData().procedures.length; $("#documentationCount").textContent = currentData().documents.length; }
function contentCard(item,type){
  const link = type === "document" && item.link ? `<a href="${esc(item.link)}" target="_blank" rel="noopener">Abrir referência ↗</a>` : "";
  return `<article class="content-card ${type === "document" ? "content-card--document" : ""}" data-content-id="${esc(item.id)}" data-content-type="${type}">
    <div class="content-card__icon">${type === "document" ? "▤" : "↻"}</div>
    <div class="content-card__main">
      <div class="content-card__top"><h3>${esc(item.title)}</h3><span class="content-chip">${esc(item.category || "Geral")}</span>${item.version ? `<span class="content-version">v${esc(item.version)}</span>` : ""}</div>
      <p class="${item.pending || /^PENDENTE/i.test(item.description || "") ? "pending-data" : ""}">${esc(item.description || "Sem descrição.")}</p>
      <div class="content-card__meta"><span>Atualizado: ${formatDate(item.updatedAt)}</span><span>Por: ${esc(item.updatedBy || "—")}</span>${link}</div>
    </div>
    ${canManage ? `<div class="content-card__actions"><button class="content-action" type="button" data-edit-content>Editar</button><button class="content-action content-action--danger" type="button" data-delete-content>Excluir</button></div>` : ""}
  </article>`;
}
function renderProcedures(){
  const q = norm($("#procedureSearch").value);
  const rows = currentData().procedures.filter(item => !q || norm(`${item.title} ${item.category} ${item.description}`).includes(q)).sort((a,b)=>a.title.localeCompare(b.title,"pt-BR"));
  $("#procedureList").innerHTML = rows.map(item => contentCard(item, "procedure")).join("");
  $("#procedureEmpty").hidden = rows.length > 0;
}
function renderDocuments(){
  const q = norm($("#documentSearch").value);
  const rows = currentData().documents.filter(item => !q || norm(`${item.title} ${item.category} ${item.description}`).includes(q)).sort((a,b)=>a.title.localeCompare(b.title,"pt-BR"));
  $("#documentList").innerHTML = rows.map(item => contentCard(item, "document")).join("");
  $("#documentEmpty").hidden = rows.length > 0;
}
function renderAllContent(){ renderCounts(); renderProcedures(); renderDocuments(); }

function switchTab(tab){
  activeTab = tab;
  document.querySelectorAll(".client-tab").forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", String(on));
  });
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
  const next = new URL(location.href); next.searchParams.set("tab", tab); history.replaceState({}, "", next);
}
document.querySelectorAll(".client-tab").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

// ---------- Unidades ----------
const unitsModal = $("#unitsModal");
const unitForm = $("#unitForm");
const unitCancelConfirm = $("#unitCancelConfirm");
function serializeUnitForm(){ return JSON.stringify({name:$("#unitName").value.trim(), code:$("#unitCode").value.trim(), city:$("#unitCity").value.trim(), state:$("#unitState").value.trim(), gp:$("#unitGp").value.trim(), projectTicket:$("#unitProjectTicket").value.trim(), address:$("#unitAddress").value.trim(), businessHours:$("#unitBusinessHours").value.trim(), phone:$("#unitPhone").value.trim(), circuit:$("#unitCircuit").value.trim()}); }
function openUnitPage(unitId){ window.location.href = `unit.html?client=${encodeURIComponent(clientId)}&unit=${encodeURIComponent(unitId)}`; }
function renderUnits(){
  unitsDb = loadUnitsDb();
  migrateLegacyUnits();
  const rows = currentUnits().slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
  $("#unitsGrid").innerHTML = rows.map(unit => `
    <article class="unit-card" data-open-unit="${esc(unit.id)}" tabindex="0" role="link" aria-label="Abrir unidade ${esc(unit.name)}">
      <div class="unit-card__header">
        <div>
          <span class="unit-card__eyebrow">Unidade</span>
          <h3 title="${esc(unit.name)}">${esc(unit.name)}</h3>
        </div>
        ${isVipFlag(client.vip) ? `<span class="client-vip-badge">VIP</span>` : ""}
      </div>
      <div class="unit-card__grid">
        <div class="unit-card__data"><span>Cidade</span><strong class="${pendingClass(unit.city)}">${esc(unit.city || "Não informado")}</strong></div>
        <div class="unit-card__data"><span>Estado</span><strong class="${pendingClass(unit.state)}">${esc(unit.state || "Não informado")}</strong></div>
        <div class="unit-card__data"><span>Unidade</span><strong>${esc(unit.name || "Não informado")}</strong></div>
        <div class="unit-card__data"><span>Código</span><strong class="${pendingClass(unit.code)}">${esc(unit.code || "Não informado")}</strong></div>
      </div>
      <div class="unit-card__footer">
        <small>${unit.updatedAt || unit.createdAt ? `Atualizada em ${formatDate(unit.updatedAt || unit.createdAt)}` : "Unidade cadastrada"}</small>
        ${canManageUnits ? `<div class="unit-card__actions"><button type="button" data-edit-unit="${esc(unit.id)}">Editar</button><button type="button" data-delete-unit="${esc(unit.id)}">Excluir</button></div>` : ""}
      </div>
      <div class="unit-card__circuit ${pendingClass(unit.circuit)}">Circuito: ${esc(unit.circuit || "Não informado")}</div>
    </article>
  `).join("");
  $("#unitsEmptyPage").hidden = rows.length > 0;
  renderClientHeader();
}
function openUnitModal(unit = null){
  if(!canManageUnits) return;
  editingUnitId = unit?.id || null;
  $("#unitId").value = editingUnitId || "";
  $("#unitName").value = unit?.name || "";
  $("#unitCode").value = unit?.code || "";
  $("#unitCity").value = unit?.city || "";
  $("#unitState").value = unit?.state || "";
  $("#unitGp").value = unit?.gp || "";
  $("#unitProjectTicket").value = unit?.projectTicket || "";
  $("#unitAddress").value = unit?.address || "";
  $("#unitBusinessHours").value = unit?.businessHours || "";
  $("#unitPhone").value = unit?.phone || "";
  $("#unitCircuit").value = unit?.circuit || "";
  $("#unitModalKicker").textContent = unit ? "EDITAR UNIDADE" : "NOVA UNIDADE";
  $("#unitsModalTitle").textContent = unit ? "Editar unidade" : "Cadastrar unidade";
  $("#saveUnitButton").textContent = unit ? "Salvar alterações" : "Salvar unidade";
  unitSnapshot = serializeUnitForm();
  unitsModal.classList.add("open"); unitsModal.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden";
  setTimeout(() => $("#unitName").focus(), 60);
}
function forceCloseUnitModal(){
  unitsModal.classList.remove("open"); unitsModal.setAttribute("aria-hidden","true");
  unitCancelConfirm.classList.remove("open"); unitCancelConfirm.setAttribute("aria-hidden","true");
  document.body.style.overflow = ""; unitForm.reset(); editingUnitId = null; unitSnapshot = "";
}
function requestCloseUnitModal(){ if(!unitsModal.classList.contains("open")) return; unitCancelConfirm.classList.add("open"); unitCancelConfirm.setAttribute("aria-hidden","false"); }
function hideUnitCancelConfirm(){ unitCancelConfirm.classList.remove("open"); unitCancelConfirm.setAttribute("aria-hidden","true"); }
if(!canManageUnits) $("#newUnitButton").hidden = true;
$("#newUnitButton")?.addEventListener("click", () => openUnitModal());
$("#closeUnitsModal")?.addEventListener("click", requestCloseUnitModal);
$("#cancelUnitButton")?.addEventListener("click", requestCloseUnitModal);
$("#continueUnitEditing")?.addEventListener("click", hideUnitCancelConfirm);
$("#confirmUnitCancel")?.addEventListener("click", forceCloseUnitModal);
unitsModal?.addEventListener("click", event => { if(event.target === unitsModal) requestCloseUnitModal(); });
unitCancelConfirm?.addEventListener("click", event => { if(event.target === unitCancelConfirm) hideUnitCancelConfirm(); });
unitForm?.addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#unitName").value.trim();
  if(!name) return;
  const record = normalizeUnitRecord({
    id: editingUnitId || MicrosetAuth.uuid(),
    name,
    code: $("#unitCode").value.trim(),
    city: $("#unitCity").value.trim(),
    state: $("#unitState").value.trim().toUpperCase(),
    gp: $("#unitGp").value.trim(),
    projectTicket: $("#unitProjectTicket").value.trim(),
    address: $("#unitAddress").value.trim(),
    businessHours: $("#unitBusinessHours").value.trim(),
    phone: $("#unitPhone").value.trim(),
    circuit: $("#unitCircuit").value.trim(),
    createdAt: editingUnitId ? currentUnits().find(unit => unit.id === editingUnitId)?.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const units = currentUnits().slice();
  if(editingUnitId){
    const index = units.findIndex(unit => unit.id === editingUnitId);
    if(index >= 0) units[index] = record;
  } else {
    units.push(record);
  }
  unitsDb[clientId] = units;
  saveUnitsDb(unitsDb);
  renderUnits();
  forceCloseUnitModal();
  showToast(editingUnitId ? "Unidade atualizada" : "Unidade cadastrada", `${name} foi ${editingUnitId ? "atualizada" : "cadastrada"} com sucesso.`);
});
$("#unitsGrid")?.addEventListener("click", event => {
  const editBtn = event.target.closest("[data-edit-unit]");
  if(editBtn){
    event.stopPropagation();
    const unit = currentUnits().find(item => item.id === editBtn.dataset.editUnit);
    if(unit) openUnitModal(unit);
    return;
  }
  const deleteBtn = event.target.closest("[data-delete-unit]");
  if(deleteBtn){
    event.stopPropagation();
    const unit = currentUnits().find(item => item.id === deleteBtn.dataset.deleteUnit);
    if(unit && confirm(`Excluir a unidade \"${unit.name}\"?`)){
      unitsDb[clientId] = currentUnits().filter(item => item.id !== unit.id);
      saveUnitsDb(unitsDb);
      renderUnits();
      showToast("Unidade removida", `${unit.name} foi excluída.`);
    }
    return;
  }
  const card = event.target.closest("[data-open-unit]");
  if(card) openUnitPage(card.dataset.openUnit);
});
$("#unitsGrid")?.addEventListener("keydown", event => {
  if(event.key !== "Enter" && event.key !== " ") return;
  if(event.target.closest("[data-edit-unit]") || event.target.closest("[data-delete-unit]")) return;
  const card = event.target.closest("[data-open-unit]");
  if(card){ event.preventDefault(); openUnitPage(card.dataset.openUnit); }
});

// ---------- Conteúdo ----------
const contentModal = $("#contentModal");
const contentForm = $("#contentForm");
const contentCancelConfirm = $("#contentCancelConfirm");
const categorySets = {
  procedure: ["Operacional","Escalonamento","Checklist","Atendimento","Infraestrutura","Outro"],
  document: ["Handover","Manual","Topologia","Relatório","Política","Outro"]
};
function serializeContentForm(){ return JSON.stringify({ title:$("#contentTitle").value.trim(), category:$("#contentCategory").value, version:$("#contentVersion").value.trim(), description:$("#contentDescription").value.trim(), link:$("#contentLink").value.trim() }); }
function fillCategoryOptions(type, selected = ""){
  $("#contentCategory").innerHTML = categorySets[type].map(option => `<option value="${esc(option)}" ${option === selected ? "selected" : ""}>${esc(option)}</option>`).join("");
}
function openContentModal(type, item = null){
  if(!canManage) return;
  editingContentType = type;
  editingContentId = item?.id || null;
  $("#contentId").value = editingContentId || "";
  $("#contentType").value = type;
  $("#contentTitle").value = item?.title || "";
  fillCategoryOptions(type, item?.category || categorySets[type][0]);
  $("#contentVersion").value = item?.version || "";
  $("#contentDescription").value = item?.description || "";
  $("#contentLink").value = item?.link || "";
  const isDocument = type === "document";
  $("#contentModalKicker").textContent = item ? "EDITAR ITEM" : `NOVO ${isDocument ? "DOCUMENTO" : "PROCEDIMENTO"}`;
  $("#contentModalTitle").textContent = item ? (isDocument ? "Editar documento" : "Editar procedimento") : (isDocument ? "Cadastrar documento" : "Cadastrar procedimento");
  $("#contentCategoryLabel").textContent = isDocument ? "Tipo do documento" : "Categoria";
  $("#contentLinkField").hidden = !isDocument;
  $("#saveContentButton").textContent = item ? "Salvar alterações" : "Salvar";
  contentSnapshot = serializeContentForm();
  contentModal.classList.add("open"); contentModal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
  setTimeout(() => $("#contentTitle").focus(), 50);
}
function forceCloseContentModal(){
  contentModal.classList.remove("open"); contentModal.setAttribute("aria-hidden","true");
  contentCancelConfirm.classList.remove("open"); contentCancelConfirm.setAttribute("aria-hidden","true");
  document.body.style.overflow = ""; contentForm.reset(); editingContentId = null; editingContentType = null; contentSnapshot = "";
}
function requestCloseContentModal(){ if(!contentModal.classList.contains("open")) return; contentCancelConfirm.classList.add("open"); contentCancelConfirm.setAttribute("aria-hidden","false"); }
function hideContentCancelConfirm(){ contentCancelConfirm.classList.remove("open"); contentCancelConfirm.setAttribute("aria-hidden","true"); }
if(!canManage){ $("#newProcedureButton").hidden = true; $("#newDocumentButton").hidden = true; }
$("#newProcedureButton")?.addEventListener("click", () => openContentModal("procedure"));
$("#newDocumentButton")?.addEventListener("click", () => openContentModal("document"));
$("#closeContentModal")?.addEventListener("click", requestCloseContentModal);
$("#cancelContentButton")?.addEventListener("click", requestCloseContentModal);
$("#continueContentEditing")?.addEventListener("click", hideContentCancelConfirm);
$("#confirmContentCancel")?.addEventListener("click", forceCloseContentModal);
contentModal?.addEventListener("click", event => { if(event.target === contentModal) requestCloseContentModal(); });
contentCancelConfirm?.addEventListener("click", event => { if(event.target === contentCancelConfirm) hideContentCancelConfirm(); });
contentForm?.addEventListener("submit", event => {
  event.preventDefault();
  if(!editingContentType) return;
  const title = $("#contentTitle").value.trim();
  if(!title) return;
  const payload = {
    id: editingContentId || MicrosetAuth.uuid(),
    title,
    category: $("#contentCategory").value,
    version: $("#contentVersion").value.trim(),
    description: $("#contentDescription").value.trim(),
    link: editingContentType === "document" ? $("#contentLink").value.trim() : "",
    createdAt: editingContentId ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.name
  };
  const db = currentData();
  const key = editingContentType === "document" ? "documents" : "procedures";
  const rows = db[key].slice();
  if(editingContentId){
    const index = rows.findIndex(item => item.id === editingContentId);
    if(index >= 0) rows[index] = { ...rows[index], ...payload };
  } else {
    rows.unshift({ ...payload, createdAt: new Date().toISOString() });
  }
  contentDb[clientId] = { ...db, [key]: rows };
  saveContent(contentDb);
  renderAllContent();
  forceCloseContentModal();
  showToast(editingContentType === "document" ? "Documento salvo" : "Procedimento salvo", `${title} foi salvo com sucesso.`);
});
function resolveContentContext(target){
  const card = target.closest("[data-content-id]");
  if(!card) return null;
  const type = card.dataset.contentType;
  const key = type === "document" ? "documents" : "procedures";
  const item = currentData()[key].find(row => row.id === card.dataset.contentId);
  return item ? { item, type } : null;
}
document.addEventListener("click", event => {
  const editBtn = event.target.closest("[data-edit-content]");
  if(editBtn){
    const ctx = resolveContentContext(event.target);
    if(ctx) openContentModal(ctx.type, ctx.item);
    return;
  }
  const deleteBtn = event.target.closest("[data-delete-content]");
  if(deleteBtn){
    const ctx = resolveContentContext(event.target);
    if(!ctx) return;
    if(confirm(`Excluir ${ctx.type === "document" ? "o documento" : "o procedimento"} \"${ctx.item.title}\"?`)){
      const key = ctx.type === "document" ? "documents" : "procedures";
      contentDb[clientId] = { ...currentData(), [key]: currentData()[key].filter(item => item.id !== ctx.item.id) };
      saveContent(contentDb);
      renderAllContent();
      showToast("Conteúdo removido", `${ctx.item.title} foi excluído.`);
    }
  }
});
$("#procedureSearch")?.addEventListener("input", renderProcedures);
$("#documentSearch")?.addEventListener("input", renderDocuments);

let toastTimer;
function showToast(title, message) {
  $("#toastTitle").textContent = title;
  $("#toastText").textContent = message;
  const toast = $("#toast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

$("#menuButton")?.addEventListener("click", ()=>{ const mainNav = $("#mainNav"); const open = mainNav.classList.toggle("open"); $("#menuButton").setAttribute("aria-expanded", String(open)); });
$("#notificationButton")?.addEventListener("click", ()=>showToast("Notificações", "Você tem 3 novos avisos operacionais."));
document.addEventListener("keydown", event => {
  if(event.key !== "Escape") return;
  if(contentCancelConfirm.classList.contains("open")) { hideContentCancelConfirm(); return; }
  if(unitCancelConfirm.classList.contains("open")) { hideUnitCancelConfirm(); return; }
  if(contentModal.classList.contains("open")) { requestCloseContentModal(); return; }
  if(unitsModal.classList.contains("open")) { requestCloseUnitModal(); return; }
  $("#mainNav")?.classList.remove("open");
});

renderClientHeader();
renderUnits();
renderAllContent();
switchTab(activeTab);
const editUnitFromQuery = params.get("editUnit");
if (editUnitFromQuery && canManageUnits) {
  const unitToEdit = currentUnits().find(unit => unit.id === editUnitFromQuery);
  if (unitToEdit) openUnitModal(unitToEdit);
}
