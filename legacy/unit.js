const CLIENTS_STORAGE_KEY = "microset_intranet_clients_v1";
const UNITS_STORAGE_KEY = "microset_intranet_client_units_v1";
const UNIT_CONTENT_STORAGE_KEY = "microset_intranet_unit_content_v1";
const currentUser = MicrosetAuth.getCurrentUser();
if (!currentUser) window.location.replace("login.html");
MicrosetBalbo.sync();

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const clientId = params.get("client");
const unitId = params.get("unit");
const canEditUnits = MicrosetAuth.can("clients.edit", currentUser);

function loadClients(){ try{return JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY)||"[]")||[];}catch{return [];} }
function loadUnitsDb(){ try{return JSON.parse(localStorage.getItem(UNITS_STORAGE_KEY)||"{}")||{};}catch{return {}; } }
function loadUnitContentDb(){ try{return JSON.parse(localStorage.getItem(UNIT_CONTENT_STORAGE_KEY)||"{}")||{};}catch{return {}; } }
function saveUnitContentDb(data){ localStorage.setItem(UNIT_CONTENT_STORAGE_KEY, JSON.stringify(data)); }
function safe(value, fallback = "Não informado"){ return value && String(value).trim() ? String(value).trim() : fallback; }
function setDataValue(selector, value, fallback = "Não informado"){
  const element = $(selector);
  if (!element) return;
  const display = safe(value, fallback);
  element.textContent = display;
  element.classList.toggle("pending-data", /PENDENTE/i.test(display));
}
function isVipFlag(value){ return value === true || value === "true" || value === 1 || value === "1" || String(value).trim().toLowerCase() === "sim"; }

const client = loadClients().find(item => item.id === clientId);
const unitsDb = loadUnitsDb();
const unit = Array.isArray(unitsDb[clientId]) ? unitsDb[clientId].find(item => item.id === unitId) : null;
const seededUnit = window.MicrosetBalbo?.units?.find(item => item.id === unitId);
let unitContentDb = loadUnitContentDb();
const unitContentKey = `${clientId}::${unitId}`;

if (!client || !unit) {
  document.body.innerHTML = `<main class="client-detail-shell"><div class="content-empty" style="display:block"><div>!</div><h3>Unidade não encontrada</h3><p>O cadastro solicitado não existe ou foi removido.</p><p style="margin-top:14px"><a href="clientes.html" style="color:var(--micro-blue);font-weight:800">Voltar para Clientes</a></p></div></main>`;
  throw new Error("Unidade não encontrada");
}

const normalizedClient = {
  ...client,
  gn: client.gn || client.manager || "Gerente de Negócios",
  manager: client.gn || client.manager || "Gerente de Negócios",
  vip: isVipFlag(client.vip)
};


function currentUnitContent(){
  return unitContentDb[unitContentKey] || { title: "Informações adicionais", html: "" };
}
function sanitizeDisplayHtml(html=""){
  const template = document.createElement("template");
  template.innerHTML = String(html);
  template.content.querySelectorAll("script,iframe,object,embed,form,input,button").forEach(node => node.remove());
  template.content.querySelectorAll("*").forEach(node => {
    [...node.attributes].forEach(attr => {
      if(/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      if((attr.name === "href" || attr.name === "src") && /^javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
    });
  });
  return template.innerHTML;
}
function renderUnitContent(){
  const data = currentUnitContent();
  $("#unitContentTitle").textContent = safe(data.title, "Informações adicionais");
  const view = $("#unitContentView");
  if(view) view.innerHTML = data.html && data.html.trim() ? sanitizeDisplayHtml(data.html) : "<p>Nenhuma informação adicional cadastrada para esta unidade.</p>";
  if(!canEditUnits) $("#editUnitContentButton")?.setAttribute("hidden", "");
}

function render(){
  document.title = `${unit.name} — ${normalizedClient.name}`;
  $("#backToClientLink").href = `cliente.html?id=${encodeURIComponent(clientId)}`;
  $("#unitHeroClientName").textContent = normalizedClient.name;
  setDataValue("#unitHeroClientCode", normalizedClient.code, "PENDENTE — código do cliente não informado");
  const photoBlade = $("#unitPhotoBlade");
  const unitImage = unit.image || seededUnit?.image;
  const unitImageLabel = unit.imageLabel || seededUnit?.imageLabel;
  if (unitImage) {
    $("#unitPhoto").src = unitImage;
    $("#unitPhoto").alt = `Imagem da unidade ${unit.name}`;
    $("#unitPhotoClient").textContent = normalizedClient.name;
    setDataValue("#unitPhotoClientCode", normalizedClient.code, "PENDENTE — não informado");
    $("#unitPhotoGn").textContent = safe(normalizedClient.gn);
    $("#unitPhotoName").textContent = unit.name;
    const city = safe(unit.city, "PENDENTE — cidade não informada");
    const state = safe(unit.state, "PENDENTE — estado não informado");
    setDataValue("#unitPhotoLocation", `${city} — ${state}`);
    setDataValue("#unitPhotoAddress", safe(unit.address, "PENDENTE — endereço não informado"));
    $("#unitPhotoLabel").textContent = unitImageLabel || "Imagem da unidade";
    photoBlade.hidden = false;
  } else {
    photoBlade.hidden = true;
  }
  setDataValue("#unitInfoName", unit.name);
  setDataValue("#unitInfoCode", unit.code);
  setDataValue("#unitInfoGn", normalizedClient.gn);
  setDataValue("#unitInfoGp", unit.gp);
  setDataValue("#unitInfoProject", unit.projectTicket);
  setDataValue("#unitInfoAddress", unit.address);
  setDataValue("#unitInfoCity", unit.city);
  setDataValue("#unitInfoState", unit.state);
  setDataValue("#unitInfoHours", unit.businessHours);
  setDataValue("#unitInfoPhone", unit.phone);
  setDataValue("#unitCircuitStrip", `Circuito: ${safe(unit.circuit)}`);
  const seal = $("#unitVipSeal");
  if (seal) {
    const showVipSeal = isVipFlag(normalizedClient.vip);
    seal.hidden = !showVipSeal;
    seal.style.display = showVipSeal ? "block" : "none";
    $("#unitNonVipBadge").hidden = showVipSeal;
  }
  const editLink = $("#editUnitLink");
  editLink.href = `cliente.html?id=${encodeURIComponent(clientId)}&editUnit=${encodeURIComponent(unitId)}`;
  if(!canEditUnits) editLink.hidden = true;
  renderUnitContent();
}


// ---------- Bloco TinyMCE da unidade ----------
const unitContentModal = $("#unitContentModal");
const unitContentForm = $("#unitContentForm");
const unitContentCancelConfirm = $("#unitContentCancelConfirm");
let unitContentSnapshot = "";
let tinyReady = false;

function editorHtml(){
  if(window.tinymce && tinymce.get("unitContentEditor")) return tinymce.get("unitContentEditor").getContent();
  return $("#unitContentEditor")?.value || "";
}
function setEditorHtml(html){
  if(window.tinymce && tinymce.get("unitContentEditor")) tinymce.get("unitContentEditor").setContent(html || "");
  else if($("#unitContentEditor")) $("#unitContentEditor").value = html || "";
}
function serializeUnitContentForm(){ return JSON.stringify({ title: $("#unitContentTitleInput")?.value.trim() || "", html: editorHtml() }); }
async function ensureTinyMce(){
  if(tinyReady || (window.tinymce && tinymce.get("unitContentEditor"))){ tinyReady = true; return; }
  if(!window.tinymce) return;
  await tinymce.init({
    selector: "#unitContentEditor",
    height: 340,
    menubar: false,
    branding: false,
    promotion: false,
    statusbar: true,
    plugins: "lists link table code autoresize",
    toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link table | alignleft aligncenter alignright | removeformat | code",
    content_style: "body{font-family:Ubuntu,Arial,sans-serif;font-size:14px;color:#2E2D4D;line-height:1.6;padding:8px;} a{color:#3A3B7D;}",
    invalid_elements: "script,iframe,object,embed,form,input,button",
    setup(editor){ editor.on("init", () => { tinyReady = true; }); }
  });
}
async function openUnitContentModal(){
  if(!canEditUnits) return;
  const data = currentUnitContent();
  $("#unitContentTitleInput").value = data.title || "Informações adicionais";
  unitContentModal.classList.add("open");
  unitContentModal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  await ensureTinyMce();
  setEditorHtml(data.html || "");
  setTimeout(() => { unitContentSnapshot = serializeUnitContentForm(); }, 30);
}
function forceCloseUnitContentModal(){
  unitContentModal.classList.remove("open");
  unitContentModal.setAttribute("aria-hidden","true");
  unitContentCancelConfirm.classList.remove("open");
  unitContentCancelConfirm.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  unitContentSnapshot = "";
}
function requestCloseUnitContentModal(){
  if(!unitContentModal.classList.contains("open")) return;
  unitContentCancelConfirm.classList.add("open");
  unitContentCancelConfirm.setAttribute("aria-hidden","false");
}
function hideUnitContentCancelConfirm(){
  unitContentCancelConfirm.classList.remove("open");
  unitContentCancelConfirm.setAttribute("aria-hidden","true");
}
$("#editUnitContentButton")?.addEventListener("click", openUnitContentModal);
$("#closeUnitContentModal")?.addEventListener("click", requestCloseUnitContentModal);
$("#cancelUnitContentButton")?.addEventListener("click", requestCloseUnitContentModal);
$("#continueUnitContentEditing")?.addEventListener("click", hideUnitContentCancelConfirm);
$("#confirmUnitContentCancel")?.addEventListener("click", forceCloseUnitContentModal);
unitContentModal?.addEventListener("click", event => { if(event.target === unitContentModal) requestCloseUnitContentModal(); });
unitContentCancelConfirm?.addEventListener("click", event => { if(event.target === unitContentCancelConfirm) hideUnitContentCancelConfirm(); });
unitContentForm?.addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#unitContentTitleInput").value.trim() || "Informações adicionais";
  const html = editorHtml();
  unitContentDb = loadUnitContentDb();
  unitContentDb[unitContentKey] = { title, html, updatedAt: new Date().toISOString(), updatedBy: currentUser.name };
  saveUnitContentDb(unitContentDb);
  forceCloseUnitContentModal();
  renderUnitContent();
  showToast("Conteúdo atualizado", "O bloco de informações da unidade foi salvo.");
});

let toastTimer;
function showToast(title, message){
  $("#toastTitle").textContent = title;
  $("#toastText").textContent = message;
  const toast = $("#toast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"), 3000);
}

$("#menuButton")?.addEventListener("click", ()=>{ const mainNav = $("#mainNav"); const open = mainNav.classList.toggle("open"); $("#menuButton").setAttribute("aria-expanded", String(open)); });
$("#notificationButton")?.addEventListener("click", ()=>showToast("Notificações", "Você tem 3 novos avisos operacionais."));

document.addEventListener("keydown", event => {
  if(event.key !== "Escape") return;
  if(unitContentCancelConfirm?.classList.contains("open")) { hideUnitContentCancelConfirm(); return; }
  if(unitContentModal?.classList.contains("open")) { requestCloseUnitContentModal(); return; }
  $("#mainNav")?.classList.remove("open");
});

render();
