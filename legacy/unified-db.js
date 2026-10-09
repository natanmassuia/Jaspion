/* Banco unificado da Intranet Microset + Checklist CCO — v0.116 */
(function () {
  "use strict";
  const DB_NAME = "microset-intranet-cco";
  const DB_VERSION = 1;
  const MAIN_STORE = "main";
  const CCO_STORE = "cco";
  const META_STORE = "meta";
  const LEGACY_KEYS = ["microset_intranet_clients_v1","microset_intranet_client_units_v1","microset_intranet_client_content_v1","microset_intranet_unit_content_v1","microset_intranet_users_v1","microset_balbo_data_version"];

  function open(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;[MAIN_STORE,CCO_STORE,META_STORE].forEach(store=>{if(!db.objectStoreNames.contains(store))db.createObjectStore(store);});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function get(store,key){const db=await open();return new Promise((resolve,reject)=>{const request=db.transaction(store).objectStore(store).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function set(store,key,value){const db=await open();return new Promise((resolve,reject)=>{const request=db.transaction(store,"readwrite").objectStore(store).put(value,key);request.onsuccess=()=>resolve(value);request.onerror=()=>reject(request.error);});}
  async function remove(store,key){const db=await open();return new Promise((resolve,reject)=>{const request=db.transaction(store,"readwrite").objectStore(store).delete(key);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);});}
  async function getAll(store){const db=await open();return new Promise((resolve,reject)=>{const transaction=db.transaction(store);const objectStore=transaction.objectStore(store);const keys=objectStore.getAllKeys();const values=objectStore.getAll();transaction.oncomplete=()=>{const result={};keys.result.forEach((key,index)=>{result[key]=values.result[index];});resolve(result);};transaction.onerror=()=>reject(transaction.error);});}
  async function replaceStore(store,values){const db=await open();return new Promise((resolve,reject)=>{const transaction=db.transaction(store,"readwrite");const objectStore=transaction.objectStore(store);objectStore.clear();Object.entries(values||{}).forEach(([key,value])=>objectStore.put(value,key));transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});}
  async function readLegacyCco(){return new Promise(resolve=>{const request=indexedDB.open("cem-checklist-db",1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("kv"))request.result.createObjectStore("kv");};request.onerror=()=>resolve(undefined);request.onsuccess=()=>{const db=request.result;const transaction=db.transaction("kv");const read=transaction.objectStore("kv").get("database");read.onsuccess=()=>resolve(read.result);read.onerror=()=>resolve(undefined);};});}
  async function migrateLegacyData(){const sharedRefresh=window.MicrosetSharedDatabase?.refreshed===true;for(const key of LEGACY_KEYS){const browserValue=localStorage.getItem(key);const indexedValue=await get(MAIN_STORE,key);if(sharedRefresh){if(browserValue===null)await remove(MAIN_STORE,key);else await set(MAIN_STORE,key,browserValue);continue;}if(indexedValue===undefined&&browserValue!==null)await set(MAIN_STORE,key,browserValue);else if(indexedValue!==undefined&&browserValue!==indexedValue)nativeSetItem.call(localStorage,key,indexedValue);}if(await get(CCO_STORE,"database")===undefined){const legacyCco=await readLegacyCco();if(legacyCco!==undefined)await set(CCO_STORE,"database",legacyCco);}await set(META_STORE,"database",{projectVersion:"0.123",schemaVersion:2,migratedAt:new Date().toISOString(),officialSource:"project-folder",browserStorage:"cache",legacyCcoDatabase:"cem-checklist-db"});}

  const nativeSetItem=Storage.prototype.setItem;
  const nativeRemoveItem=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(key,value){nativeSetItem.call(this,key,value);if(this===localStorage&&LEGACY_KEYS.includes(String(key)))set(MAIN_STORE,String(key),String(value)).catch(console.warn);};
  Storage.prototype.removeItem=function(key){nativeRemoveItem.call(this,key);if(this===localStorage&&LEGACY_KEYS.includes(String(key)))remove(MAIN_STORE,String(key)).catch(console.warn);};

  const ready=migrateLegacyData().catch(error=>console.warn("Não foi possível iniciar o banco unificado.",error));
  window.MicrosetDB={name:DB_NAME,version:DB_VERSION,stores:{main:MAIN_STORE,cco:CCO_STORE,meta:META_STORE},legacyKeys:LEGACY_KEYS,ready,open,get,set,remove,getAll,replaceStore};
})();
