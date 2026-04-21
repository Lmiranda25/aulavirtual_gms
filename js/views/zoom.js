// =============================================
// views/zoom.js — Acceso a clase en vivo
// =============================================

function renderZoom() {
  const course = getCurrentCourse();
  if (!AppState.isStepAvailable('zoom') && !AppState.isStepDone('zoom')) {
    return renderAlumnoLayout('zoom', _blockedStep('Primero debes descargar el material PPT para acceder a la clase.'), 'Clase en Vivo');
  }

  const done = AppState.isStepDone('zoom');

  const content = `
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button onclick="Router.go('dashboard-alumno')" class="text-slate-400 hover:text-slate-600 transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h2 class="text-slate-800 font-bold text-lg">Clase en Vivo</h2>
        <p class="text-slate-500 text-sm">Paso 2 de 5 — Sesión Zoom</p>
      </div>
      ${statusBadge(done ? 'completado' : 'disponible')}
    </div>

    <!-- Card Zoom -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">🎥</div>
          <div>
            <div class="text-blue-200 text-xs font-semibold uppercase tracking-wider">Clase en Vivo</div>
            <h3 class="font-bold text-base mt-0.5">${course.title}</h3>
            <div class="mt-1 text-blue-200 text-sm">${course.date}</div>
          </div>
        </div>
        <!-- Status en vivo -->
        <div class="mt-4 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
          <span class="text-sm font-semibold">EN VIVO AHORA</span>
        </div>
      </div>
      <div class="p-6">
        <p class="text-slate-600 text-sm mb-5 leading-relaxed">
          Al hacer clic en el botón de acceso, el sistema registrará tu intento de ingreso a la clase en vivo.
          Esta acción queda auditada como evidencia de asistencia.
        </p>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
          <strong>⚠ Importante:</strong> Asegúrate de tener Zoom instalado. El clic en el botón queda registrado
          como evidencia de acceso a la clase.
        </div>

        ${done
          ? `<div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 mb-4">
              <span class="text-xl">✅</span>
              <div>
                <div class="font-semibold">Acceso registrado</div>
                <div class="text-green-600 text-xs">Tu ingreso a la clase fue registrado correctamente.</div>
              </div>
            </div>
            <button onclick="simulateZoomAccess()" class="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 rounded-xl transition-all text-sm">
              🔗 Volver a acceder a Zoom
            </button>`
          : `<button onclick="simulateZoomAccess()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm">
              🔗 Ingresar a la Clase en Vivo (Zoom)
            </button>`
        }
      </div>
    </div>

    <!-- Información del instructor -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      <h4 class="font-bold text-slate-700 text-sm mb-3">Detalles de la sesión</h4>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="text-slate-400 text-xs mb-0.5">Instructor</div>
        <div class="text-slate-700 font-semibold">${course.instructor}</div>
        </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs mb-0.5">Duración</div>
            <div class="text-slate-700 font-semibold">${course.duration}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs mb-0.5">Modalidad</div>
            <div class="text-slate-700 font-semibold">En Vivo (Zoom)</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs mb-0.5">Fecha</div>
            <div class="text-slate-700 font-semibold">${course.date}</div>
        </div>
      </div>
    </div>

    ${done ? `
    <div class="flex justify-end">
      <button onclick="Router.go('examen')" class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
        Continuar → Examen
      </button>
    </div>` : ''}
  </div>`;

  return renderAlumnoLayout('zoom', content, 'Clase en Vivo');
}

function simulateZoomAccess() {
  const course = getCurrentCourse();
  AuditLog.record('ZOOM_BUTTON_CLICKED',         { zoom_url: course.zoom_url });
  AuditLog.record('LIVE_CLASS_ACCESS_ATTEMPTED', { course_id: course.id });
  AppState.completeStep('zoom');
  showToast('Acceso a clase registrado. Zoom abrirá en una nueva pestaña.', 'info');
  // En producción: window.open(MOCK_COURSE.zoom_url, '_blank');
  setTimeout(() => Router.go('zoom'), 500);
}

function _blockedStep(msg) {
  return `
  <div class="max-w-md mx-auto mt-12 text-center">
    <div class="text-5xl mb-4">🔒</div>
    <h3 class="text-slate-700 font-bold text-lg mb-2">Paso bloqueado</h3>
    <p class="text-slate-500 text-sm mb-6">${msg}</p>
    <button onclick="Router.go('dashboard-alumno')" class="bg-gms-teal text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gms-tealDark transition-all">
      Volver al inicio
    </button>
  </div>`;
}
