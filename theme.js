(function () {
  "use strict";

  const STORAGE_KEY = "microset-theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function effectiveTheme(preference) {
    return preference === "dark" || preference === "light"
      ? preference
      : (systemDark.matches ? "dark" : "light");
  }

  function applyTheme(preference, persist) {
    const theme = effectiveTheme(preference);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, preference); } catch (_) {}
    }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      const dark = theme === "dark";
      button.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
      button.setAttribute("title", dark ? "Ativar modo claro" : "Ativar modo escuro");
      button.setAttribute("aria-pressed", String(dark));
      button.querySelector(".theme-icon-sun").hidden = !dark;
      button.querySelector(".theme-icon-moon").hidden = dark;
    });
  }

  applyTheme(storedTheme() || "system", false);

  function createToggle() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.dataset.themeToggle = "";
    button.innerHTML = '<svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z"/></svg><svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
    button.addEventListener("click", function () {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
    return button;
  }

  function mountThemeToggle() {
    if (document.querySelector("[data-theme-toggle]")) {
      applyTheme(storedTheme() || "system", false);
      return;
    }
    const toggle = createToggle();
    const actions = document.querySelector(".topbar__actions, .portal-user");
    if (actions) actions.insertBefore(toggle, actions.firstChild);
    else document.body.appendChild(toggle);
    applyTheme(storedTheme() || "system", false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountThemeToggle);
  else mountThemeToggle();

  systemDark.addEventListener("change", function () {
    if (!storedTheme() || storedTheme() === "system") applyTheme("system", false);
  });
})();
