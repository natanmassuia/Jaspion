
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = MicrosetAuth.getCurrentUser();
  if(!currentUser || !MicrosetAuth.can('users.manage', currentUser)) return;

  const roleGrid = document.getElementById('roleGrid');
  const tbody = document.getElementById('usersTableBody');
  const searchInput = document.getElementById('userSearch');
  const userModal = document.getElementById('userModal');
  const userForm = document.getElementById('userForm');
  const newUserButton = document.getElementById('newUserButton');
  const closeUserModal = document.getElementById('closeUserModal');
  const cancelUserButton = document.getElementById('cancelUserButton');
  const passwordHint = document.getElementById('passwordHint');
  let editingId = null;
  let toastTimer;
  let userSnapshot = '';
  const userCancelConfirm = document.getElementById('userCancelConfirm');
  const continueUserEditing = document.getElementById('continueUserEditing');
  const confirmUserCancel = document.getElementById('confirmUserCancel');

  const fields = {
    id: document.getElementById('userId'),
    name: document.getElementById('userName'),
    email: document.getElementById('userEmail'),
    department: document.getElementById('userDepartment'),
    role: document.getElementById('userRole'),
    password: document.getElementById('userPassword'),
    active: document.getElementById('userActive')
  };

  function showToast(title, text){
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastText').textContent = text;
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function serializeUserForm(){ return JSON.stringify({name:fields.name.value.trim(),email:fields.email.value.trim(),department:fields.department.value.trim(),role:fields.role.value,password:fields.password.value,active:fields.active.checked}); }

  function openModal(user){
    editingId = user?.id || null;
    fields.id.value = editingId || '';
    fields.name.value = user?.name || '';
    fields.email.value = user?.email || '';
    fields.department.value = user?.department || '';
    fields.role.value = user?.role || 'viewer';
    fields.password.value = '';
    fields.active.checked = user ? !!user.active : true;
    document.getElementById('userModalKicker').textContent = user ? 'EDITAR USUÁRIO' : 'NOVO USUÁRIO';
    document.getElementById('userModalTitle').textContent = user ? 'Editar usuário' : 'Cadastrar usuário';
    document.getElementById('saveUserButton').textContent = user ? 'Salvar alterações' : 'Salvar usuário';
    passwordHint.textContent = user ? 'preencha apenas se quiser alterar' : 'obrigatória no cadastro';
    userSnapshot = serializeUserForm();
    userModal.classList.add('open');
    userModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => fields.name.focus(), 50);
  }
  function forceCloseModal(){
    userModal.classList.remove('open');
    userModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    editingId = null;
    userForm.reset();
    fields.active.checked = true;
    userSnapshot = '';
    userCancelConfirm?.classList.remove('open');
    userCancelConfirm?.setAttribute('aria-hidden','true');
  }
  function requestCloseModal(){
    if(!userModal.classList.contains('open')) return;
    userCancelConfirm?.classList.add('open');
    userCancelConfirm?.setAttribute('aria-hidden','false');
  }
  function hideCancelConfirm(){
    userCancelConfirm?.classList.remove('open');
    userCancelConfirm?.setAttribute('aria-hidden','true');
  }

  function users(){ return MicrosetAuth.loadUsers(); }
  function save(usersList){ MicrosetAuth.saveUsers(usersList); render(); }

  function renderRoles(){
    const allUsers = users();
    const cards = Object.entries(MicrosetAuth.roles).map(([key, role]) => {
      const qty = allUsers.filter(user => user.role === key && user.active).length;
      return `<article class="role-card"><span class="role-card__kicker">Perfil</span><strong>${role.label}</strong><p>${role.permissions.join(' • ')}</p><b>${qty}</b></article>`;
    }).join('');
    roleGrid.innerHTML = cards;
  }
  function renderTable(){
    const term = searchInput.value.trim().toLowerCase();
    const rows = users().filter(user => {
      const hay = `${user.name} ${user.email} ${user.department} ${MicrosetAuth.roleLabel(user.role)}`.toLowerCase();
      return !term || hay.includes(term);
    }).sort((a,b) => a.name.localeCompare(b.name,'pt-BR'));
    tbody.innerHTML = rows.map(user => `
      <tr>
        <td><div class="user-cell"><span class="user-avatar">${MicrosetAuth.escapeHtml(MicrosetAuth.initials(user.name))}</span><div><strong>${MicrosetAuth.escapeHtml(user.name)}</strong><small>${MicrosetAuth.escapeHtml(user.email)}</small></div></div></td>
        <td>${MicrosetAuth.escapeHtml(user.department)}</td>
        <td><span class="level-pill level-pill--${user.role}">${MicrosetAuth.escapeHtml(MicrosetAuth.roleLabel(user.role))}</span></td>
        <td><span class="status-pill-table ${user.active ? 'is-active' : 'is-inactive'}">${user.active ? 'Ativo' : 'Inativo'}</span></td>
        <td><div class="table-actions"><button type="button" data-edit="${user.id}">Editar</button>${user.id !== currentUser.id ? `<button type="button" data-toggle="${user.id}">${user.active ? 'Desativar' : 'Ativar'}</button>` : ''}</div></td>
      </tr>
    `).join('');
  }
  function render(){ renderRoles(); renderTable(); }

  newUserButton?.addEventListener('click', () => openModal());
  closeUserModal?.addEventListener('click', requestCloseModal);
  cancelUserButton?.addEventListener('click', requestCloseModal);
  continueUserEditing?.addEventListener('click', hideCancelConfirm);
  confirmUserCancel?.addEventListener('click', forceCloseModal);
  userModal?.addEventListener('click', event => { if(event.target === userModal) requestCloseModal(); });
  userCancelConfirm?.addEventListener('click', event => { if(event.target === userCancelConfirm) hideCancelConfirm(); });
  searchInput?.addEventListener('input', renderTable);
  document.addEventListener('keydown', event => {
    if(event.key !== 'Escape') return;
    if(userCancelConfirm?.classList.contains('open')) { hideCancelConfirm(); return; }
    if(userModal.classList.contains('open')) requestCloseModal();
  });

  userForm?.addEventListener('submit', event => {
    event.preventDefault();
    const list = users();
    const email = fields.email.value.trim().toLowerCase();
    const existing = list.find(user => user.email.toLowerCase() === email && user.id !== editingId);
    if(existing){ alert('Já existe um usuário com este e-mail.'); return; }
    if(!editingId && !fields.password.value.trim()){ alert('Informe uma senha para o novo usuário.'); return; }
    const base = {
      id: editingId || MicrosetAuth.uuid(),
      name: fields.name.value.trim(),
      email,
      department: fields.department.value.trim(),
      role: fields.role.value,
      active: fields.active.checked,
      password: fields.password.value.trim()
    };
    if(editingId){
      const index = list.findIndex(user => user.id === editingId);
      const old = list[index];
      list[index] = { ...old, ...base, password: base.password || old.password };
      save(list);
      showToast('Usuário atualizado', `${base.name} foi atualizado.`);
    } else {
      list.unshift(base);
      save(list);
      showToast('Usuário cadastrado', `${base.name} foi adicionado.`);
    }
    forceCloseModal();
  });

  tbody?.addEventListener('click', event => {
    const editButton = event.target.closest('[data-edit]');
    if(editButton){ const user = users().find(item => item.id === editButton.dataset.edit); if(user) openModal(user); return; }
    const toggleButton = event.target.closest('[data-toggle]');
    if(toggleButton){
      const list = users();
      const index = list.findIndex(item => item.id === toggleButton.dataset.toggle);
      if(index < 0) return;
      list[index].active = !list[index].active;
      save(list);
      showToast('Status atualizado', `${list[index].name} agora está ${list[index].active ? 'ativo' : 'inativo'}.`);
    }
  });

  render();
});
