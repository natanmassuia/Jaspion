
(function(){
  const USERS_STORAGE_KEY = "microset_intranet_users_v1";
  const SESSION_STORAGE_KEY = "microset_intranet_session_v1";
  const ROLES = {
    admin: { label: "Administrador", permissions: ["users.manage","clients.view","clients.edit","content.manage"] },
    editor: { label: "Editor", permissions: ["clients.view","clients.edit","content.manage"] },
    viewer: { label: "Consulta", permissions: ["clients.view"] }
  };
  const DEFAULT_USERS = [
    { id: cryptoRandom(), name: "Administrador POC", email: "admin@microset.local", department: "Administração", role: "admin", password: "Admin@123", active: true },
    { id: cryptoRandom(), name: "Editor POC", email: "editor@microset.local", department: "Q.A. CCO", role: "editor", password: "Editor@123", active: true },
    { id: cryptoRandom(), name: "Consulta POC", email: "consulta@microset.local", department: "Operação", role: "viewer", password: "Consulta@123", active: true }
  ];

  function cryptoRandom(){ return (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || 'null') || []; }
    catch { return []; }
  }
  function saveUsers(users){ localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); }
  function seedUsers(){
    const users = loadUsers();
    if(!users.length){ saveUsers(DEFAULT_USERS); return DEFAULT_USERS; }
    let changed = false;
    DEFAULT_USERS.forEach(defaultUser => {
      const exists = users.some(user => String(user.email || '').toLowerCase() === defaultUser.email.toLowerCase());
      if(!exists){ users.push({ ...defaultUser, id: cryptoRandom() }); changed = true; }
    });
    if(changed) saveUsers(users);
    return users;
  }
  function ensureDemoUser(email, password){
    const targetEmail = String(email || '').trim().toLowerCase();
    const template = DEFAULT_USERS.find(user => user.email.toLowerCase() === targetEmail);
    if(!template) return null;
    const users = seedUsers();
    const index = users.findIndex(user => String(user.email || '').toLowerCase() === targetEmail);
    const repaired = {
      ...(index >= 0 ? users[index] : {}),
      ...template,
      id: index >= 0 && users[index].id ? users[index].id : cryptoRandom(),
      email: template.email,
      password: password || template.password,
      active: true
    };
    if(index >= 0) users[index] = repaired; else users.push(repaired);
    saveUsers(users);
    return repaired;
  }
  function getSession(){ try { return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null'); } catch { return null; } }
  function setSession(user){ sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: user.id })); }
  function clearSession(){ sessionStorage.removeItem(SESSION_STORAGE_KEY); }
  function getCurrentUser(){ const users = seedUsers(); const session = getSession(); if(!session?.id) return null; return users.find(user => user.id === session.id && user.active) || null; }
  function roleLabel(role){ return ROLES[role]?.label || role || "Consulta"; }
  function rolePermissions(role){ return ROLES[role]?.permissions || []; }
  function can(permission, user){ const current = user || getCurrentUser(); if(!current) return false; return rolePermissions(current.role).includes(permission); }
  function escapeHtml(value=""){ return String(value).replace(/[&<>\"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function initials(name=""){ return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0].toUpperCase()).join('') || 'MS'; }
  function ensureAuth(){
    const body = document.body;
    const required = body.dataset.auth === 'required';
    const permission = body.dataset.permission;
    const current = getCurrentUser();
    if(required && !current){
      const next = location.pathname.split('/').pop() + location.search;
      location.replace(`login.html?next=${encodeURIComponent(next)}`);
      return null;
    }
    if(permission && current && !can(permission, current)){
      body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:40px;background:#f7f7fb;font-family:Ubuntu,Arial,sans-serif"><div style="max-width:520px;background:#fff;border:1px solid #e2e3ee;border-radius:20px;padding:28px;box-shadow:0 18px 40px rgba(46,45,77,.08)"><div style="font-size:13px;font-weight:700;color:#5F6EC3;letter-spacing:1px">ACESSO RESTRITO</div><h1 style="margin:12px 0 10px;color:#2E2D4D">Sem permissão para acessar esta página</h1><p style="margin:0 0 18px;color:#6f7488;line-height:1.6">Seu perfil atual não possui permissão para visualizar este módulo da intranet.</p><a href="index.html" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:12px;background:#EF7F22;color:#fff;font-weight:700;text-decoration:none">Voltar ao início</a></div></main>`;
      return null;
    }
    return current;
  }
  function populateProfile(current){
    const button = document.getElementById('profileButton');
    if(!button || !current) return;
    const avatar = button.querySelector('.avatar');
    const strong = button.querySelector('.profile-copy strong');
    const small = button.querySelector('.profile-copy small');
    if(avatar) avatar.textContent = initials(current.name);
    if(strong) strong.textContent = current.name;
    if(small) small.textContent = `${current.department} • ${roleLabel(current.role)}`;
  }
  function buildProfileMenu(current){
    const button = document.getElementById('profileButton');
    if(!button || !current) return;
    const topbarActions = button.parentElement || document.body;
    let menu = document.getElementById('profileMenu');
    if(menu) menu.remove();
    menu = document.createElement('div');
    menu.id = 'profileMenu';
    menu.className = 'profile-menu';
    menu.hidden = true;
    menu.innerHTML = `
      <div class="profile-menu__head">
        <div class="profile-menu__avatar">${escapeHtml(initials(current.name))}</div>
        <div class="profile-menu__copy">
          <strong>${escapeHtml(current.name)}</strong>
          <span>${escapeHtml(current.email)}</span>
          <small>${escapeHtml(current.department)} • ${escapeHtml(roleLabel(current.role))}</small>
        </div>
      </div>
      <div class="profile-menu__divider"></div>
      ${can('users.manage', current) ? `<a class="profile-menu__item" href="usuarios.html"><span>Usuários e permissões</span><b>→</b></a>` : ''}
      <button type="button" class="profile-menu__item profile-menu__item--logout" id="logoutButton"><span>Sair</span><b>↗</b></button>
    `;
    topbarActions.style.position = 'relative';
    topbarActions.appendChild(menu);

    const closeMenu = () => { menu.hidden = true; button.setAttribute('aria-expanded','false'); button.classList.remove('is-open'); };
    const openMenu = () => { menu.hidden = false; button.setAttribute('aria-expanded','true'); button.classList.add('is-open'); };
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); menu.hidden ? openMenu() : closeMenu(); });
    menu.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
    menu.querySelector('#logoutButton')?.addEventListener('click', () => { clearSession(); location.replace('login.html'); });
  }

  const api = {
    usersStorageKey: USERS_STORAGE_KEY,
    sessionStorageKey: SESSION_STORAGE_KEY,
    roles: ROLES,
    uuid: cryptoRandom,
    escapeHtml,
    can,
    getCurrentUser,
    loadUsers,
    saveUsers,
    seedUsers,
    ensureDemoUser,
    setSession,
    clearSession,
    roleLabel,
    initials,
    ensureAuth
  };
  window.MicrosetAuth = api;
  document.addEventListener('DOMContentLoaded', () => {
    seedUsers();
    const current = ensureAuth();
    if(current){ populateProfile(current); buildProfileMenu(current); }
  });
})();
