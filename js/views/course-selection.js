// =============================================
// views/course-selection.js — Catálogo de cursos
// =============================================

function renderCourseSelection() {
  const user = AppState.get().currentUser;

  // Calcular progreso guardado por curso
  const byC = AppState.get().progressByCourse || {};

  const cards = MOCK_COURSES.map(course => {
    const saved  = byC[course.id] || {};
    const done   = (saved.stepsCompleted || []);
    const pct    = Math.round((done.length / AppState.STEP_ORDER.length) * 100);
    const isComp = saved.certEnabled || false;
    const inProg = done.length > 0 && !isComp;

    let statusHtml = '';
    let btnHtml    = '';
    let btnBase    = `onclick="enterCourse('${course.id}')"`;

    if (isComp) {
      statusHtml = `<span class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">✓ Completado</span>`;
      btnHtml    = `<button ${btnBase} class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
        <span>Ver certificado</span> <span>🏆</span>
      </button>`;
    } else if (inProg) {
      statusHtml = `<span class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">● En progreso</span>`;
      btnHtml    = `<button ${btnBase} class="w-full bg-gms-teal hover:bg-gms-tealDark text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
        <span>Continuar</span> <span>→</span>
      </button>`;
    } else {
      statusHtml = `<span class="inline-flex items-center gap-1 ${course.categoryColor} text-xs font-semibold px-2.5 py-0.5 rounded-full">${course.category}</span>`;
      btnHtml    = `<button ${btnBase} class="w-full bg-gms-800 hover:bg-gms-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
        <span>Ingresar al curso</span> <span>→</span>
      </button>`;
    }

    const progressBar = done.length > 0 ? `
    <div class="mt-3">
      <div class="flex justify-between text-xs text-slate-400 mb-1">
        <span>Progreso</span>
        <span class="${isComp ? 'text-green-600' : 'text-gms-teal'} font-semibold">${pct}%</span>
      </div>
      <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div class="h-full ${isComp ? 'bg-green-500' : 'bg-gms-teal'} progress-bar-fill rounded-full" style="width:${pct}%"></div>
      </div>
    </div>` : '';

    return `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover flex flex-col">
      <!-- Gradient header -->
      <div class="bg-gradient-to-br ${course.gradient} p-5 relative overflow-hidden">
        <div class="absolute -top-4 -right-4 text-7xl opacity-10 select-none pointer-events-none">${course.icon}</div>
        <div class="relative">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">${course.icon}</div>
            ${statusHtml}
          </div>
          <h3 class="text-white font-extrabold text-base leading-tight mb-1">${course.title}</h3>
          <p class="text-white/70 text-xs leading-snug">${course.subtitle}</p>
        </div>
      </div>
      <!-- Content -->
      <div class="p-4 flex flex-col flex-1">
        <p class="text-slate-500 text-xs leading-relaxed mb-4 flex-1">${course.description}</p>
        <!-- Meta -->
        <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div class="flex items-center gap-1.5 text-slate-500">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span class="truncate">${course.instructor.replace('Ing. ','').replace('Lic. ','')}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-500">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>${course.duration}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-500 col-span-2">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>${course.date}</span>
          </div>
        </div>
        <!-- Enrolled -->
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <span>👥</span>
          <span>${course.enrolled} alumnos matriculados</span>
        </div>
        ${progressBar}
        <!-- CTA -->
        <div class="mt-4">${btnHtml}</div>
      </div>
    </div>`;
  }).join('');

  const greeting = _getGreeting();

  return `
  <!-- Topbar simplificado (sin sidebar) -->
  <header class="fixed top-0 left-0 right-0 z-40 bg-gms-800 border-b border-gms-700 h-16 flex items-center px-4 sm:px-6 shadow-lg">
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
    <div class="flex-1"></div>
    <div class="flex items-center gap-3">
      <div class="hidden sm:block text-right">
        <div class="text-white text-sm font-medium">${user?.name || ''}</div>
        <div class="text-slate-400 text-xs">${user?.empresa || ''}</div>
      </div>
      <div class="w-9 h-9 rounded-full bg-gms-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        ${user?.avatar || '?'}
      </div>
      <button onclick="Router.go('logout')" class="text-slate-400 hover:text-red-400 transition-colors" title="Cerrar sesión">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>
  </header>

  <!-- Main content -->
  <main class="mt-16 min-h-[calc(100vh-4rem)] bg-slate-50">
    <!-- Hero section -->
    <div class="bg-gradient-to-r from-gms-900 to-gms-700 px-4 sm:px-8 py-8 sm:py-10">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div class="text-gms-tealLight text-sm font-semibold mb-1">${greeting}</div>
            <h2 class="text-white text-2xl sm:text-3xl font-extrabold mb-1">${user?.name?.split(' ')[0] || 'Alumno'} 👋</h2>
            <p class="text-slate-400 text-sm">${user?.empresa || ''}</p>
          </div>
          <div class="flex gap-4 text-center">
            <div class="bg-white/10 rounded-xl px-4 py-3">
              <div class="text-gms-tealLight text-xl font-extrabold">${MOCK_COURSES.length}</div>
              <div class="text-slate-400 text-xs">Cursos disponibles</div>
            </div>
            <div class="bg-white/10 rounded-xl px-4 py-3">
              <div class="text-gms-tealLight text-xl font-extrabold">
                ${Object.values(AppState.get().progressByCourse || {}).filter(p => p.certEnabled).length}
              </div>
              <div class="text-slate-400 text-xs">Completados</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de cursos -->
    <div class="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-slate-700 font-bold text-lg">Mis Cursos Asignados</h3>
        <span class="text-slate-400 text-sm">${MOCK_COURSES.length} cursos</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 fade-in">
        ${cards}
      </div>
    </div>
  </main>`;
}

function enterCourse(courseId) {
  const course = MOCK_COURSES.find(c => c.id === courseId);
  if (!course) return;
  AppState.selectCourse(course);
  AuditLog.record('COURSE_ACCESSED', { course_id: course.id, course_title: course.title });
  Router.go('dashboard-alumno');
}

function _getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días,';
  if (h < 18) return 'Buenas tardes,';
  return 'Buenas noches,';
}
