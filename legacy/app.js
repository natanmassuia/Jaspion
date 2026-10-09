const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const mainNav = $("#mainNav");
const menuButton = $("#menuButton");
const searchPanel = $("#searchPanel");
const searchToggle = $("#searchToggle");
const globalSearch = $("#globalSearch");
const heroSearch = $("#heroSearch");
const heroSearchButton = $("#heroSearchButton");
const notificationButton = $("#notificationButton");
const toast = $("#toast");
const dateTime = $("#dateTime");

function toggleMenu() {
  const open = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
}

function openSearch() {
  searchPanel.classList.add("open");
  searchPanel.setAttribute("aria-hidden", "false");
  setTimeout(() => globalSearch.focus(), 80);
}

function closeSearch() {
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
}

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterContent(term) {
  const query = normalize(term);
  const searchable = $$("[data-search]");

  searchable.forEach((item) => {
    if (!query) {
      item.classList.remove("filtered-out");
      return;
    }

    const content = normalize(
      `${item.dataset.search || ""} ${item.textContent || ""}`
    );

    item.classList.toggle("filtered-out", !content.includes(query));
  });

  if (query) {
    $("#quick-access").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function syncSearch(source) {
  globalSearch.value = source.value;
  heroSearch.value = source.value;
  filterContent(source.value);
}

function updateClock() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(now);

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);

  dateTime.textContent = `${date} • ${time}`;
}

let toastTimer;
function showToast() {
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

menuButton?.addEventListener("click", toggleMenu);
searchToggle?.addEventListener("click", () => {
  searchPanel.classList.contains("open") ? closeSearch() : openSearch();
});
globalSearch?.addEventListener("input", () => syncSearch(globalSearch));
heroSearch?.addEventListener("input", () => syncSearch(heroSearch));
heroSearchButton?.addEventListener("click", () => filterContent(heroSearch.value));
notificationButton?.addEventListener("click", showToast);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearch();
    mainNav.classList.remove("open");
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

$$(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});

updateClock();
setInterval(updateClock, 30000);
