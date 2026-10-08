/* Banco compartilhado da POC — a pasta do projeto é a fonte oficial. */
(function () {
  "use strict";
  const DATABASE_VERSION = "0.123";
  const VERSION_KEY = "microset_shared_database_version";
  const MANAGED_KEYS = ["microset_intranet_clients_v1","microset_intranet_client_units_v1","microset_intranet_client_content_v1","microset_intranet_unit_content_v1","microset_balbo_data_version","microset-site-structure-v1","microset-site-core-v1"];
  let refreshed = false;
  try {
    if (localStorage.getItem(VERSION_KEY) !== DATABASE_VERSION) {
      MANAGED_KEYS.forEach(key => localStorage.removeItem(key));
      localStorage.setItem(VERSION_KEY, DATABASE_VERSION);
      refreshed = true;
    }
  } catch (_) {}
  window.MicrosetSharedDatabase = Object.freeze({version:DATABASE_VERSION,mode:"project-folder",source:"arquivos de dados da POC",browserStorageRole:"cache",refreshed});
  document.documentElement.dataset.sharedDatabase = DATABASE_VERSION;
})();
