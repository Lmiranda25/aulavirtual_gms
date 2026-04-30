// =============================================
// components.js — Componentes visuales reutilizables
// =============================================

// ── Toast notifications ──────────────────────
function ensureToastContainer() {
  if (!document.getElementById('toast-container')) {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
}

function showToast(message, type = 'success', duration = 3500) {
  ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${_toastIcon(type)}</span>
      <span>${message}</span>
    </div>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function _toastIcon(type) {
  const icons = {
    success: '✓', info: 'ℹ', warning: '⚠', error: '✕'
  };
  return icons[type] || '•';
}

// ── Sidebar toggle (mobile) ───────────────────
function toggleSidebar() {
  document.getElementById('gms-sidebar')?.classList.toggle('is-open');
  document.getElementById('sidebar-overlay')?.classList.toggle('is-visible');
}
function closeSidebar() {
  document.getElementById('gms-sidebar')?.classList.remove('is-open');
  document.getElementById('sidebar-overlay')?.classList.remove('is-visible');
}

// ── Header/Topbar del alumno ─────────────────
function renderTopbar(title = '') {
  const user = AppState.get().currentUser;
  return `
  <header class="fixed top-0 left-0 right-0 z-40 bg-gms-800 border-b border-gms-700 h-16 flex items-center px-4 sm:px-6 shadow-lg">
    <button onclick="toggleSidebar()" class="lg:hidden text-white mr-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0" aria-label="Menú">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
    <div class="flex items-center gap-2 flex-shrink-0">
      <div class="w-8 h-8 rounded-lg bg-gms-teal flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      </div>
      <div>
        <div class="text-white font-bold text-sm leading-tight">GMS Consulting</div>
        <div class="text-gms-tealLight text-xs leading-tight">Aula Virtual</div>
      </div>
    </div>
    <div class="flex-1 flex items-center">
      ${title ? `<h1 class="text-slate-200 font-semibold text-base">${title}</h1>` : ''}
    </div>
    <div class="flex items-center gap-4">
      <div class="text-right hidden sm:block">
        <div class="text-white text-sm font-medium">${user?.name || ''}</div>
        <div class="text-slate-400 text-xs">${user?.empresa || ''}</div>
      </div>
      <div class="w-9 h-9 rounded-full bg-gms-teal flex items-center justify-center text-white font-bold text-sm">
        ${user?.avatar || '?'}
      </div>
      <button onclick="Router.go('logout')" class="text-slate-400 hover:text-red-400 transition-colors ml-2" title="Cerrar sesión">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>
  </header>
  <div id="sidebar-overlay" class="sidebar-overlay" onclick="closeSidebar()"></div>`;
}

// ── Sidebar del alumno ───────────────────────
function renderSidebar(activeView) {
  const state  = AppState.get();
  const course = getCurrentCourse();

  const steps = [
    { key: 'dashboard', label: 'Mi Curso', icon: '🏠', view: 'dashboard-alumno', alwaysAvailable: true },
    { key: 'ppt',        label: 'Material PPT',     icon: '📄', view: 'ppt' },
    { key: 'zoom',       label: 'Clase en Vivo',    icon: '🎥', view: 'zoom' },
    { key: 'exam',       label: 'Examen',           icon: '📝', view: 'examen' },
    { key: 'encuesta',   label: 'Encuesta',         icon: '⭐', view: 'encuesta' },
    { key: 'certificado',label: 'Certificado',      icon: '🏆', view: 'certificado' },
  ];

  const stepItems = steps.map(s => {
    const isDone      = AppState.isStepDone(s.key);
    const isAvailable = s.alwaysAvailable || AppState.isStepAvailable(s.key);
    const isActive    = activeView === s.view;
    const isLocked    = !isAvailable && !isDone;

    let cls = 'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-all ';
    let badge = '';
    let clickable = true;

    if (isLocked) {
      cls += 'text-slate-500 cursor-not-allowed opacity-60';
      badge = `<span class="ml-auto text-xs text-slate-500">🔒</span>`;
      clickable = false;
    } else if (isActive) {
      cls += 'bg-gms-teal/20 text-gms-tealLight font-semibold border-r-2 border-gms-teal';
      badge = `<span class="ml-auto text-xs bg-gms-teal/30 text-gms-tealLight px-1.5 py-0.5 rounded">Aquí</span>`;
    } else if (isDone) {
      cls += 'text-slate-300 hover:bg-white/5 cursor-pointer';
      badge = `<span class="ml-auto text-green-400 text-sm">✓</span>`;
    } else {
      cls += 'text-slate-300 hover:bg-white/5 cursor-pointer';
    }

    const onclick = clickable ? `Router.go('${s.view}')` : "showToast('Completa los pasos anteriores primero', 'warning')";

    return `
    <li>
      <button onclick="${onclick}" class="${cls}" style="width:100%; text-align:left; background:none; border:none; ${isLocked ? 'pointer-events:none;' : ''}">
        <span class="text-base">${s.icon}</span>
        <span>${s.label}</span>
        ${badge}
      </button>
    </li>`;
  }).join('');

  const progress = _calcProgress(state);

  return `
  <aside id="gms-sidebar" class="sidebar-mobile fixed top-16 left-0 bottom-0 w-64 bg-gms-800 border-r border-gms-700 z-30 flex flex-col overflow-y-auto">
    <button onclick="closeSidebar()" class="lg:hidden absolute top-3 right-3 z-10 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
    <!-- Curso info -->
    <div class="p-4 border-b border-gms-700/60 mt-2">
      <!-- Volver a mis cursos -->
      <button onclick="closeSidebar(); Router.go('course-selection')" class="flex items-center gap-1.5 text-gms-tealLight hover:text-white text-xs font-semibold mb-3 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Mis Cursos
      </button>
      <div class="bg-gms-900/60 rounded-xl p-3">
        <div class="text-xs text-gms-tealLight font-semibold uppercase tracking-wider mb-1">Curso activo</div>
        <div class="text-white text-sm font-semibold leading-snug">${course.title}</div>
        <div class="text-slate-400 text-xs mt-1">${course.date}</div>
        <!-- Progress -->
        <div class="mt-3">
          <div class="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progreso</span>
            <span class="text-gms-tealLight font-semibold">${progress}%</span>
          </div>
          <div class="h-1.5 bg-gms-700 rounded-full overflow-hidden">
            <div class="h-full bg-gms-teal progress-bar-fill rounded-full" style="width:${progress}%"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Navigation -->
    <nav class="flex-1 py-3">
      <div class="px-4 mb-2">
        <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Flujo del curso</span>
      </div>
      <ul class="space-y-0.5">${stepItems}</ul>
    </nav>
    <!-- Footer -->
    <div class="p-4 border-t border-gms-700/60">
      <div class="text-xs text-slate-500 text-center">© GMS Consulting 2026</div>
    </div>
  </aside>`;
}

function _calcProgress(state) {
  const total = AppState.STEP_ORDER.length;
  const done = AppState.STEP_ORDER.filter(k => AppState.isStepDone(k)).length;
  return Math.round((done / total) * 100);
}

// ── Badge de estado ──────────────────────────
function statusBadge(status) {
  const map = {
    pendiente:   ['badge-pendiente',  'Pendiente'],
    disponible:  ['badge-disponible', 'Disponible'],
    'en-proceso':['badge-en-proceso', 'En Proceso'],
    completado:  ['badge-completado', 'Completado'],
    bloqueado:   ['badge-bloqueado',  'Bloqueado'],
  };
  const [cls, label] = map[status] || ['badge-pendiente', status];
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}">${label}</span>`;
}

// ── Layout wrapper alumno ────────────────────
function renderAlumnoLayout(activeView, content, topTitle = '') {
  return `
  ${renderTopbar(topTitle)}
  ${renderSidebar(activeView)}
  <main class="main-content-shift mt-16 min-h-[calc(100vh-4rem)] bg-slate-50">
    <div class="p-4 sm:p-6 fade-in">${content}</div>
  </main>`;
}

// ── Layout wrapper admin ─────────────────────
function renderAdminTopbar() {
  const user = AppState.get().currentUser;
  return `
  <header class="fixed top-0 left-0 right-0 z-40 bg-gms-900 border-b border-gms-700 h-16 flex items-center px-4 sm:px-6 shadow-lg">
    <button onclick="toggleSidebar()" class="lg:hidden text-white mr-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0" aria-label="Menú">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
    <div class="flex items-center gap-2 flex-shrink-0">
      <div class="w-8 h-8 rounded-lg bg-gms-teal flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      </div>
      <div>
        <div class="text-white font-bold text-sm leading-tight">GMS Consulting</div>
        <div class="text-gms-tealLight text-xs leading-tight">Panel Administrativo</div>
      </div>
    </div>
    <div class="flex-1"></div>
    <div class="flex items-center gap-4">
      <div class="text-white text-sm font-medium">${user?.name || 'Admin'}</div>
      <div class="w-9 h-9 rounded-full bg-gms-teal flex items-center justify-center text-white font-bold text-sm">${user?.avatar || 'A'}</div>
      <button onclick="Router.go('logout')" class="text-slate-400 hover:text-red-400 transition-colors" title="Salir">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>
  </header>
  <div id="sidebar-overlay" class="sidebar-overlay" onclick="closeSidebar()"></div>`;
}

function renderAdminSidebar(active) {
  const links = [
    { key: 'admin-dashboard', label: 'Dashboard', icon: '📊', view: 'admin-dashboard' },
    { key: 'admin-alumnos',   label: 'Alumnos',   icon: '👥', view: 'admin-alumnos' },
  ];
  const items = links.map(l => {
    const isActive = active === l.view;
    const cls = isActive
      ? 'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm bg-gms-teal/20 text-gms-tealLight font-semibold'
      : 'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 cursor-pointer';
    return `
    <li>
      <button onclick="Router.go('${l.view}')" class="${cls}" style="width:100%;text-align:left;background:none;border:none;">
        <span class="text-base">${l.icon}</span>
        <span>${l.label}</span>
        ${isActive ? '<span class="ml-auto w-1.5 h-1.5 rounded-full bg-gms-teal"></span>' : ''}
      </button>
    </li>`;
  }).join('');

  return `
  <aside id="gms-sidebar" class="sidebar-mobile fixed top-16 left-0 bottom-0 w-64 bg-gms-900 border-r border-gms-700 z-30 flex flex-col overflow-y-auto">
    <button onclick="closeSidebar()" class="lg:hidden absolute top-3 right-3 z-10 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
    <nav class="flex-1 py-4">
      <div class="px-4 mb-3">
        <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Gestión</span>
      </div>
      <ul class="space-y-0.5">${items}</ul>
    </nav>
    <div class="p-4 border-t border-gms-700/60 text-xs text-slate-500 text-center">Datos al 21 Abr 2026</div>
  </aside>`;
}

function renderAdminLayout(active, content) {
  return `
  ${renderAdminTopbar()}
  ${renderAdminSidebar(active)}
  <main class="main-content-shift mt-16 min-h-[calc(100vh-4rem)] bg-slate-100">
    <div class="p-4 sm:p-6 fade-in">${content}</div>
  </main>`;
}

// ── KPI Card ─────────────────────────────────
function kpiCard(value, label, sub, colorClass = 'text-gms-teal') {
  return `
  <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
    <div class="text-3xl font-extrabold ${colorClass} mb-1">${value}</div>
    <div class="text-slate-700 font-semibold text-sm">${label}</div>
    ${sub ? `<div class="text-slate-400 text-xs mt-1">${sub}</div>` : ''}
  </div>`;
}

// ── Evento tipo badge ─────────────────────────
function eventTypeBadge(type) {
  const map = {
    LOGIN_SUCCESS:               ['bg-blue-100 text-blue-700',    'Login'],
    COURSE_ACCESSED:             ['bg-indigo-100 text-indigo-700','Acceso Curso'],
    PPT_VIEWED:                  ['bg-purple-100 text-purple-700','PPT Vista'],
    PPT_DOWNLOADED:              ['bg-purple-200 text-purple-800','PPT Descarga'],
    ZOOM_BUTTON_CLICKED:         ['bg-cyan-100 text-cyan-700',    'Zoom Clic'],
    LIVE_CLASS_ACCESS_ATTEMPTED: ['bg-cyan-200 text-cyan-800',    'Clase Acceso'],
    EXAM_STARTED:                ['bg-amber-100 text-amber-700',  'Examen Inicio'],
    EXAM_ANSWER_SAVED:           ['bg-amber-100 text-amber-800',  'Resp. Guardada'],
    EXAM_SUBMITTED:              ['bg-orange-100 text-orange-700','Exam. Enviado'],
    EXAM_FINISHED:               ['bg-orange-200 text-orange-800','Exam. Finalizado'],
    EXAM_GRADED:                 ['bg-green-100 text-green-700',  'Exam. Calificado'],
    SURVEY_STARTED:              ['bg-teal-100 text-teal-700',    'Encuesta Inicio'],
    SURVEY_SUBMITTED:            ['bg-teal-200 text-teal-800',    'Encuesta Enviada'],
    CERTIFICATE_ENABLED:         ['bg-yellow-100 text-yellow-700','Cert. Habilitado'],
    CERTIFICATE_GENERATED:       ['bg-yellow-200 text-yellow-800','Cert. Generado'],
    CERTIFICATE_DOWNLOADED:      ['bg-green-200 text-green-800',  'Cert. Descargado'],
    SESSION_TIMEOUT:             ['bg-red-100 text-red-700',      'Sesión Expirada'],
    SESSION_ENDED:               ['bg-slate-200 text-slate-700',  'Sesión Finalizada'],
  };
  const [cls, label] = map[type] || ['bg-slate-100 text-slate-600', type];
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cls}">${label}</span>`;
}
