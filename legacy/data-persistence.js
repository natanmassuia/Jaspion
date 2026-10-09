/* Backup portátil unificado da Intranet + Checklist CCO — v0.116 */
(function(){
  const KEYS=["microset_intranet_clients_v1","microset_intranet_client_units_v1","microset_intranet_client_content_v1","microset_intranet_unit_content_v1","microset_intranet_users_v1","microset_balbo_data_version"];
  async function buildPayload(){
    await window.MicrosetDB?.ready;
    const payload={format:"microset-intranet-cco-backup",version:"0.116",schemaVersion:1,exportedAt:new Date().toISOString(),stores:{main:{},cco:{},meta:{}}};
    if(window.MicrosetDB){
      payload.stores.main=await MicrosetDB.getAll(MicrosetDB.stores.main);
      payload.stores.cco=await MicrosetDB.getAll(MicrosetDB.stores.cco);
      payload.stores.meta=await MicrosetDB.getAll(MicrosetDB.stores.meta);
    }else KEYS.forEach(key=>{if(localStorage.getItem(key)!==null)payload.stores.main[key]=localStorage.getItem(key);});
    return payload;
  }
  async function exportData(){
    const payload=await buildPayload();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");
    link.href=url;link.download=`backup-intranet-cco-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);
  }
  async function importData(file){
    const payload=JSON.parse(await file.text());
    if(payload?.format==="microset-intranet-backup"&&payload.data)payload.stores={main:payload.data,cco:{},meta:{}};
    else if(payload?.format!=="microset-intranet-cco-backup"||!payload.stores)throw new Error("Arquivo de backup inválido.");
    await window.MicrosetDB?.ready;
    if(window.MicrosetDB){
      await MicrosetDB.replaceStore(MicrosetDB.stores.main,payload.stores.main||{});
      await MicrosetDB.replaceStore(MicrosetDB.stores.cco,payload.stores.cco||{});
      await MicrosetDB.replaceStore(MicrosetDB.stores.meta,payload.stores.meta||{});
    }
    KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(payload.stores.main||{},key)&&payload.stores.main[key]!=null)localStorage.setItem(key,payload.stores.main[key]);});
    location.reload();
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const exportButton=document.getElementById("exportDataButton"),importButton=document.getElementById("importDataButton"),input=document.getElementById("importDataInput");
    exportButton?.addEventListener("click",()=>exportData().catch(error=>alert(error.message)));
    importButton?.addEventListener("click",()=>input?.click());
    input?.addEventListener("change",async()=>{if(!input.files?.[0])return;try{await importData(input.files[0]);}catch(error){alert(error.message||"Não foi possível importar o backup.");}finally{input.value="";}});
  });
  window.MicrosetPersistence={exportData,importData,buildPayload,keys:KEYS};
})();
