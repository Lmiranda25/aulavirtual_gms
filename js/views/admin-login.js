// =============================================
// views/admin-login.js — Login administrador
// =============================================

function renderAdminLogin() {
  return `
  <div class="login-bg min-h-screen flex items-center justify-center px-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gms-teal/5 blur-3xl"></div>
    </div>
    <div class="relative w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gms-600 mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h1 class="text-white text-xl font-extrabold">Panel Administrativo</h1>
        <p class="text-slate-400 text-sm mt-1">GMS Consulting — Aula Virtual</p>
      </div>

      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 shadow-2xl">
        <div id="admin-login-error" class="hidden mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"></div>
        <form onsubmit="handleAdminLogin(event)" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5">Correo</label>
            <input id="admin-email" type="email" value="admin@gmsconsulting.pe"
              class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gms-teal focus:ring-1 focus:ring-gms-teal transition-all"/>
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5">Contraseña</label>
            <input id="admin-pass" type="password" value="admin2024"
              class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gms-teal focus:ring-1 focus:ring-gms-teal transition-all"/>
          </div>
          <button type="submit" class="w-full bg-gms-600 hover:bg-gms-500 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg mt-1">
            Acceder al Panel
          </button>
        </form>
        <div class="mt-4 text-center">
          <button onclick="Router.go('login')" class="text-slate-500 hover:text-slate-300 text-xs transition-colors">
            ← Volver al Login de Alumnos
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pass  = document.getElementById('admin-pass').value;
  const user  = MOCK_USERS.find(u => u.email.toLowerCase() === email && u.password === pass && u.role === 'admin');

  if (!user) {
    const err = document.getElementById('admin-login-error');
    err.textContent = 'Credenciales incorrectas.';
    err.classList.remove('hidden');
    return;
  }

  AppState.set({ currentUser: user, sessionId: 'sess_admin_' + Date.now() });
  showToast('Bienvenido al panel administrativo', 'success');
  Router.go('admin-dashboard');
}
