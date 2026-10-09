
document.addEventListener('DOMContentLoaded', () => {
  MicrosetAuth.seedUsers();
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorBox = document.getElementById('loginError');
  const togglePassword = document.getElementById('togglePassword');
  const next = new URLSearchParams(location.search).get('next') || 'index.html';

  function showError(message){ errorBox.hidden = false; errorBox.textContent = message; }
  function clearError(){ errorBox.hidden = true; errorBox.textContent = ''; }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const user = MicrosetAuth.loadUsers().find(item => item.email.toLowerCase() === email && item.active);
    if(!user || user.password !== password){ showError('Usuário ou senha inválidos.'); return; }
    MicrosetAuth.setSession(user);
    location.replace(next);
  });

  togglePassword?.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    togglePassword.textContent = showing ? '👁' : '🙈';
  });

  document.querySelectorAll('.demo-user').forEach(button => {
    button.addEventListener('click', () => {
      const demoEmail = button.dataset.email || '';
      const demoPassword = button.dataset.password || '';
      clearError();
      const demoUser = MicrosetAuth.ensureDemoUser(demoEmail, demoPassword);
      if(!demoUser){
        showError('Não foi possível preparar este acesso de demonstração.');
        return;
      }
      emailInput.value = demoUser.email;
      passwordInput.value = demoPassword;
      MicrosetAuth.setSession(demoUser);
      location.replace(next);
    });
  });
});
