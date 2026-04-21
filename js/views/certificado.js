// =============================================
// views/certificado.js — Certificado digital PDF
// =============================================

function renderCertificado() {
  const state = AppState.get();

  if (!state.certEnabled) {
    // Verificar si la encuesta está completa (por si recargó)
    if (!AppState.isStepDone('encuesta')) {
      return renderAlumnoLayout('certificado',
        _blockedStep('Debes completar la encuesta de satisfacción para obtener tu certificado.'),
        'Certificado');
    }
  }

  const user     = state.currentUser;
  const certCode = state.certCode || 'GMS-APN-2026-0001';
  const today    = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const isDone   = AppState.isStepDone('certificado');

  const content = `
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button onclick="Router.go('dashboard-alumno')" class="text-slate-400 hover:text-slate-600 transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h2 class="text-slate-800 font-bold text-lg">Certificado Digital</h2>
        <p class="text-slate-500 text-sm">Paso 5 de 5 — Descarga tu certificado</p>
      </div>
      ${statusBadge(isDone ? 'completado' : 'disponible')}
    </div>

    <!-- Felicitaciones -->
    <div class="bg-gradient-to-r from-gms-teal to-gms-tealDark rounded-2xl p-5 text-white text-center mb-6 shadow-lg">
      <div class="text-4xl mb-2">🏆</div>
      <h3 class="font-extrabold text-xl mb-1">¡Felicitaciones, ${user?.name?.split(' ')[0] || 'alumno'}!</h3>
      <p class="text-white/80 text-sm">Has completado exitosamente el flujo del curso. Tu certificado está disponible.</p>
    </div>

    <!-- Vista previa del certificado -->
    <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6" id="cert-preview">
      <!-- Borde decorativo superior -->
      <div class="h-2 bg-gradient-to-r from-gms-800 via-gms-teal to-gms-800"></div>
      <div class="p-8 text-center relative">
        <!-- Watermark decorativo -->
        <div class="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none select-none">
          <div class="text-8xl font-black text-gms-800 opacity-5">GMS</div>
        </div>

        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gms-teal flex items-center justify-center text-white font-black text-sm">GMS</div>
          <div class="text-left">
            <div class="font-extrabold text-gms-800 text-sm">GMS Consulting</div>
            <div class="text-slate-400 text-xs">Formación Técnica Especializada</div>
          </div>
        </div>

        <div class="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">Certificado de Participación</div>

        <div class="text-slate-600 text-sm mb-2">Se certifica que</div>
        <div class="text-2xl font-extrabold text-gms-800 mb-2 border-b-2 border-gms-teal inline-block pb-1">
          ${user?.name || 'Nombre del Alumno'}
        </div>

        <div class="text-slate-600 text-sm mt-3 mb-2">ha completado satisfactoriamente el curso</div>
        <div class="text-lg font-bold text-gms-600 mb-1">${MOCK_COURSE.title}</div>
        <div class="text-slate-500 text-sm mb-4">${MOCK_COURSE.subtitle}</div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm mt-4 mb-6">
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs">Duración</div>
            <div class="font-bold text-slate-700">${MOCK_COURSE.duration}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs">Fecha</div>
            <div class="font-bold text-slate-700">${today}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-slate-400 text-xs">Nota</div>
            <div class="font-bold text-gms-teal">${state.examScore ?? 80}%</div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4 flex flex-col items-center gap-1">
          <div class="text-xs text-slate-400">Código de verificación</div>
          <div class="font-mono text-sm font-bold text-gms-800 bg-slate-100 px-4 py-1.5 rounded-lg">${certCode}</div>
          <div class="text-xs text-slate-400 mt-1">Autorizado por APN | GMS Consulting SAC</div>
        </div>
      </div>
      <!-- Borde decorativo inferior -->
      <div class="h-2 bg-gradient-to-r from-gms-800 via-gms-teal to-gms-800"></div>
    </div>

    <!-- Botón descarga -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      ${isDone
        ? `<div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 mb-4">
            <span class="text-xl">✅</span>
            <div>
              <div class="font-semibold">Certificado descargado</div>
              <div class="text-green-600 text-xs">Código: ${certCode} — Registrado en auditoría</div>
            </div>
          </div>`
        : ''
      }
      <button onclick="downloadCertificate()" class="w-full bg-gms-teal hover:bg-gms-tealDark text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Descargar Certificado PDF
      </button>
    </div>

    <!-- Resumen final -->
    <div class="bg-gms-800 text-white rounded-2xl p-4 sm:p-5">
      <h4 class="font-bold text-sm mb-3 text-gms-tealLight">✅ Flujo completado — Resumen</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        ${[
          ['Material PPT', '✓ Descargado'],
          ['Clase en Vivo', '✓ Acceso registrado'],
          ['Examen', `✓ ${state.examScore ?? 80}% — ${(state.examScore ?? 80) >= 60 ? 'Aprobado' : 'Desaprobado'}`],
          ['Encuesta', '✓ Completada'],
          ['Certificado', `✓ ${certCode}`],
        ].map(([k,v]) => `
        <div class="bg-gms-700/50 rounded-xl p-3">
          <div class="text-slate-400 text-xs">${k}</div>
          <div class="font-semibold text-white text-xs mt-0.5">${v}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;

  return renderAlumnoLayout('certificado', content, 'Certificado Digital');
}

function downloadCertificate() {
  const state = AppState.get();
  AuditLog.record('CERTIFICATE_GENERATED',  { cert_code: state.certCode, course_id: MOCK_COURSE.id });
  AuditLog.record('CERTIFICATE_DOWNLOADED', { cert_code: state.certCode, user_id: state.currentUser?.id });
  AppState.completeStep('certificado');

  showToast('Certificado generado y descarga registrada en auditoría ✓', 'success');

  // Simular PDF con ventana de impresión del preview
  setTimeout(() => {
    const cert = document.getElementById('cert-preview');
    if (cert) {
      const win = window.open('', '_blank', 'width=800,height=600');
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificado — ${MOCK_COURSE.title}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; background: white; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${cert.outerHTML}
          <script>window.print();<\/script>
        </body>
        </html>`);
    }
    Router.go('certificado');
  }, 500);
}
