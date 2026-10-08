(function () {
  const CUSTOM_KEY = "microset-site-structure-v1";
  const CORE_KEY = "microset-site-core-v1";
  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = new URL("./", scriptUrl || document.baseURI);
  const pageUrl = (path) => new URL(path, baseUrl).href;
  const slugify = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
  const CORE_DEFAULTS = [
    { id: "inicio", name: "Início", path: "index.html", hash: "", visible: true, subsections: [] },
    { id: "cco", name: "CCO", path: "cco/index.html", hash: "", visible: true, subsections: [{ id: "qualidade", name: "Qualidade", path: "cco/checklist-qualidade-cem-v2.2.1.html", fixed: true }] },
    { id: "clientes", name: "Clientes", path: "clientes.html", hash: "", visible: true, subsections: [] },
    { id: "parceiros", name: "Parceiros", path: "index.html", hash: "quick-access", visible: true, subsections: [] },
    { id: "repetidoras", name: "Repetidoras", path: "index.html", hash: "quick-access", visible: true, subsections: [] },
    { id: "documentacao", name: "Documentação", path: "documentacao.html", hash: "", visible: true, subsections: [] },
    { id: "operacao", name: "Operação", path: "index.html", hash: "notices", visible: true, subsections: [] },
    { id: "conhecimento", name: "Base de conhecimento", path: "index.html", hash: "knowledge", visible: true, subsections: [] }
  ];
  const parse = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value ?? fallback; } catch (_) { return fallback; } };
  const readStructure = () => { const value = parse(CUSTOM_KEY, []); return Array.isArray(value) ? value.filter((item) => item.id !== "cco-extensions" && !item.hiddenParent) : []; };
  function readCore() {
    const saved = parse(CORE_KEY, []);
    const legacy = parse(CUSTOM_KEY, []).find((item) => item.id === "cco-extensions");
    const savedItems = Array.isArray(saved) ? saved : [];
    const map = new Map(savedItems.map((item) => [item.id, item]));
    const orderedDefaults = savedItems.map((item) => CORE_DEFAULTS.find((base) => base.id === item.id)).filter(Boolean).concat(CORE_DEFAULTS.filter((base) => !map.has(base.id)));
    return orderedDefaults.map((base) => {
      const current = map.get(base.id) || {};
      const fixed = base.subsections.filter((item) => item.fixed);
      const custom = Array.isArray(current.subsections) ? current.subsections.filter((item) => !fixed.some((f) => f.id === item.id)) : [];
      if (base.id === "cco" && legacy?.subsections) custom.push(...legacy.subsections.filter((item) => !custom.some((x) => x.id === item.id)));
      return { ...base, ...current, subsections: [...fixed, ...custom] };
    });
  }
  const writeCore = (items) => localStorage.setItem(CORE_KEY, JSON.stringify(items));
  const constructionHref = (section, subsection) => { const p = new URLSearchParams({ secao: section }); if (subsection) p.set("subsecao", subsection); return `${pageUrl("construction.html")}?${p}`; };
  const sectionHref = (item) => item.path ? `${pageUrl(item.path)}${item.hash ? `#${item.hash}` : ""}` : constructionHref(item.name);
  const subsectionHref = (parent, item) => item.path ? pageUrl(item.path) : constructionHref(parent.name, item.name);
  function isActive(item) { const file = location.pathname.split("/").pop() || "index.html"; if (item.id === "cco") return location.pathname.toLowerCase().includes("/cco/"); return item.path?.endsWith(file) && !item.hash; }
  function dropdown(item, items) {
    const box = document.createElement("div"); box.className = `nav-dropdown${isActive(item) ? " active" : ""}`;
    const trigger = document.createElement("a"); trigger.className = "nav-dropdown__trigger"; trigger.href = sectionHref(item); trigger.textContent = item.name; trigger.setAttribute("aria-haspopup", "true");
    const menu = document.createElement("div"); menu.className = "nav-dropdown__menu"; menu.setAttribute("role", "menu");
    items.forEach((sub) => { const link = document.createElement("a"); link.href = subsectionHref(item, sub); link.textContent = sub.name; link.setAttribute("role", "menuitem"); menu.appendChild(link); });
    box.append(trigger, menu); return box;
  }
  function rebuildNavigation() {
    const core = readCore();
    document.querySelectorAll(".main-nav").forEach((nav) => {
      nav.replaceChildren();
      core.filter((item) => item.visible !== false).forEach((item) => {
        const subs = (item.subsections || []).filter((sub) => sub.visible !== false);
        if (subs.length) nav.appendChild(dropdown(item, subs));
        else { const link = document.createElement("a"); link.href = sectionHref(item); link.textContent = item.name; if (isActive(item)) link.className = "active"; nav.appendChild(link); }
      });
      readStructure().forEach((item) => {
        const subs = (item.subsections || []).filter((sub) => sub?.name && sub.visible !== false);
        if (subs.length) nav.appendChild(dropdown(item, subs));
        else { const link = document.createElement("a"); link.href = constructionHref(item.name); link.textContent = item.name; nav.appendChild(link); }
      });
    });
    document.querySelectorAll(".topbar__actions").forEach((actions) => {
      if (!actions.querySelector(".search-toggle")) {
        const search = document.createElement("button"); search.type = "button"; search.className = "icon-button search-toggle"; search.setAttribute("aria-label", "Pesquisar"); search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/></svg>'; actions.prepend(search);
      }
      if (!actions.querySelector(".notification-button")) {
        const notification = document.createElement("button"); notification.type = "button"; notification.className = "icon-button notification-button"; notification.setAttribute("aria-label", "Notificações"); notification.innerHTML = '<span class="notification-dot"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>'; actions.querySelector(".search-toggle").after(notification);
      }
      if (actions.querySelector(".site-admin-link")) return;
      const link = document.createElement("a"); link.className = "icon-button site-admin-link"; link.href = pageUrl("admin-site.html"); link.title = "Administrar seções"; link.setAttribute("aria-label", "Painel administrativo do site");
      link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.38.37.72.6 1 .28.34.65.55 1.1.6h.1v4h-.1a1.7 1.7 0 0 0-1.7.4Z"/></svg>';
      actions.prepend(link);
    });
  }
  window.MicrosetSiteAdmin = { CUSTOM_KEY, CORE_KEY, CORE_DEFAULTS, readStructure, readCore, writeCore, slugify, rebuildNavigation };
  if (!document.querySelector('link[href$="theme.css"]')) { const themeCss = document.createElement("link"); themeCss.rel = "stylesheet"; themeCss.href = pageUrl("theme.css"); document.head.appendChild(themeCss); }
  if (!document.querySelector('script[src$="theme.js"]')) { const themeScript = document.createElement("script"); themeScript.src = pageUrl("theme.js"); document.head.appendChild(themeScript); }
  rebuildNavigation();
  document.addEventListener("click", (event) => { const link = event.target.closest("a[href]"); if (!link || link.target || event.ctrlKey || event.metaKey || event.shiftKey || link.href.startsWith("javascript:")) return; const target = new URL(link.href, location.href); if (target.protocol !== location.protocol || (target.pathname === location.pathname && target.search === location.search)) return; document.documentElement.classList.add("site-leaving"); });
})();
