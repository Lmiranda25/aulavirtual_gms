// =============================================
// views/dashboard-alumno.js — Vista principal del curso
// =============================================

function renderDashboardAlumno() {
  const state = AppState.get();
  AuditLog.record('COURSE_ACCESSED', { course_id: MOCK_COURSE.id });

  const steps = [
    {
      key: 'ppt',
      num: 1,
      title: 'Descarga de Material PPT',
      desc: 'Descarga el material de estudio del curso antes de la clase.',
      icon: '📄',
      view: 'ppt',
    },
    {
      key: 'zoom',
      num: 2,
      title: 'Clase en Vivo — Zoom',
      desc: 'Ingresa a la sesión en vivo a la hora indicada.',
      icon: '🎥',
      view: 'zoom',
    },
    {
      key: 'exam',
      num: 3,
      title: 'Examen de Evaluación',
      desc: 'Responde el examen dentro de la plataforma. No se permiten herramientas externas.',
      icon: '📝',
      view: 'examen',
    },
    {
      key: 'encuesta',
      num: 4,
      title: 'Encuesta de Satisfacción',
      desc: 'Obligatoria. Necesaria para habilitar tu certificado.',
      icon: '⭐',
      view: 'encuesta',
    },
    {
      key: 'certificado',
      num: 5,
      title: 'Certificado Digital',
      desc: 'Descarga tu certificado PDF al finalizar todos los pasos.',
      icon: '🏆',
      view: 'certificado',
    },
  ];

  const stepsHtml = steps.map(s => {
    const done      = AppState.isStepDone(s.key);
    const available = AppState.isStepAvailable(s.key);
    const locked    = !done && !available;

    let statusKey = 'bloqueado';
    if (done)      statusKey = 'completado';
    else if (available) statusKey = 'disponible';

    let btnHtml = '';
    if (done) {
      btnHtml = `<button onclick="Router.go('${s.view}')" class="text-xs text-slate-500 hover:text-gms-teal transition-colors">Ver detalle →</button>`;
    } else if (available) {
      btnHtml = `<button onclick="Router.go('${s.view}')" class="bg-gms-teal hover:bg-gms-tealDark text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all">Comenzar</button>`;
    } else {
      btnHtml = `<span class="text-xs text-slate-400 flex items-center gap-1">🔒 Bloqueado</span>`;
    }

    const borderColor = done ? 'border-green-200' : available ? 'border-blue-200' : 'border-slate-200';
    const bgColor     = done ? 'bg-green-50' : available ? 'bg-blue-50/60' : 'bg-slate-50';
    const numBg       = done ? 'bg-green-500' : available ? 'bg-gms-500' : 'bg-slate-300';

    return `
    <div class="flex items-start gap-4 p-4 rounded-xl border ${borderColor} ${bgColor} transition-all">
      <div class="w-9 h-9 rounded-full ${numBg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
        ${done ? '✓' : s.num}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="font-semibold text-slate-800 text-sm leading-tight">${s.icon} ${s.title}</span>
          ${statusBadge(statusKey)}
        </div>
        <p class="text-slate-500 text-xs">${s.desc}</p>
      </div>
      <div class="flex-shrink-0 mt-1">${btnHtml}</div>
    </div>`;
  }).join('');

  const progressPct = Math.round((AppState.STEP_ORDER.filter(k => AppState.isStepDone(k)).length / AppState.STEP_ORDER.length) * 100);

  const content = `
  <!-- Header del curso -->
  <div class="bg-gradient-to-r from-gms-800 to-gms-600 rounded-2xl p-4 sm:p-6 mb-6 text-white shadow-lg">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="text-gms-tealLight text-xs font-semibold uppercase tracking-wider mb-1">Curso en Progreso</div>
        <h2 class="text-xl font-extrabold leading-tight mb-1">${MOCK_COURSE.title}</h2>
        <p class="text-slate-300 text-sm">${MOCK_COURSE.subtitle}</p>
        <div class="flex flex-wrap gap-4 mt-3 text-sm">
          <span class="flex items-center gap-1.5 text-slate-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            ${MOCK_COURSE.instructor}
          </span>
          <span class="flex items-center gap-1.5 text-slate-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${MOCK_COURSE.date}
          </span>
          <span class="flex items-center gap-1.5 text-slate-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${MOCK_COURSE.duration}
          </span>
        </div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-extrabold text-gms-tealLight">${progressPct}%</div>
        <div class="text-slate-400 text-xs mt-0.5">completado</div>
      </div>
    </div>
    <!-- Progress bar -->
    <div class="mt-4 h-2 bg-gms-900/40 rounded-full overflow-hidden">
      <div class="h-full bg-gms-teal progress-bar-fill rounded-full" style="width:${progressPct}%"></div>
    </div>
  </div>

  <!-- Flujo de pasos -->
  <div class="mb-6">
    <h3 class="text-slate-700 font-bold text-base mb-3">Flujo del Curso</h3>
    <div class="space-y-3">${stepsHtml}</div>
  </div>

  <!-- Resumen rápido -->
  <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <h4 class="text-slate-700 font-bold text-sm mb-3">Descripción del Curso</h4>
    <p class="text-slate-500 text-sm leading-relaxed">${MOCK_COURSE.description}</p>
    <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
      <strong>⚠ Flujo obligatorio:</strong> Debes completar cada paso en orden. No puedes avanzar sin cumplir el paso anterior.
      La encuesta de satisfacción es requisito para obtener tu certificado.
    </div>
  </div>`;

  return renderAlumnoLayout('dashboard-alumno', content, 'Mi Curso');
}
