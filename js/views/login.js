// =============================================
// views/login.js — Login del alumno
// =============================================

function renderLogin() {
  return `
  <div class="login-bg min-h-screen flex items-center justify-center px-4">
    <!-- Background decorativo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gms-teal/10 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo / Branding -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gms-teal mb-4 shadow-lg">
          <svg class="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-white text-2xl font-extrabold">GMS Consulting</h1>
        <p class="text-slate-400 text-sm mt-1">Aula Virtual — Plataforma de Formación</p>
      </div>

      <!-- Card login -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h2 class="text-white text-xl font-bold mb-1">Iniciar Sesión</h2>
        <p class="text-slate-400 text-sm mb-6">Ingresa con tus credenciales asignadas</p>

        <div id="login-error" class="hidden mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"></div>

        <form id="login-form" onsubmit="handleLogin(event)" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5">Correo electrónico</label>
            <input id="login-email" type="email" placeholder="correo@empresa.pe"
              class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gms-teal focus:ring-1 focus:ring-gms-teal transition-all"
              value="cmendoza@empresa.pe" />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5">Contraseña</label>
            <input id="login-pass" type="password" placeholder="••••••••"
              class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gms-teal focus:ring-1 focus:ring-gms-teal transition-all"
              value="gms2024" />
          </div>
          <button type="submit"
            class="w-full bg-gms-teal hover:bg-gms-tealDark text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg mt-2">
            Ingresar al Aula
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-white/10">
          <p class="text-slate-500 text-xs text-center mb-3">Credenciales de demostración</p>
          <div class="grid grid-cols-1 gap-2">
            ${MOCK_USERS.filter(u => u.role === 'alumno').slice(0,2).map(u => `
            <button onclick="quickLogin('${u.email}','${u.password}')"
              class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-left transition-all">
              <div class="w-7 h-7 rounded-full bg-gms-teal/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${u.avatar}</div>
              <div>
                <div class="text-slate-300 text-xs font-medium">${u.name}</div>
                <div class="text-slate-500 text-xs">${u.email}</div>
              </div>
            </button>`).join('')}
          </div>
          <div class="mt-3 text-center">
            <button onclick="Router.go('admin-login')" class="text-gms-tealLight hover:text-white text-xs transition-colors">
              → Acceso Administrador
            </button>
          </div>
        </div>
      </div>

      <p class="text-center text-slate-600 text-xs mt-6">
        Ca. Fray Martín de Murúa 150, Of. 902, San Miguel — Lima, Perú
      </p>
    </div>
  </div>`;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const user  = MOCK_USERS.find(u => u.email.toLowerCase() === email && u.password === pass && u.role === 'alumno');

  if (!user) {
    const err = document.getElementById('login-error');
    err.textContent = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    err.classList.remove('hidden');
    return;
  }

  const sessionId = 'sess_' + Date.now();
  AppState.set({ currentUser: user, sessionId });
  AuditLog.record('LOGIN_SUCCESS', { browser: navigator.userAgent.substring(0,60) });

  showToast(`Bienvenido, ${user.name.split(' ')[0]}`, 'success');
  Router.go('course-selection');
}

function quickLogin(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
  handleLogin({ preventDefault: () => {} });
}
