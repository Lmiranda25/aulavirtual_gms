// =============================================
// views/ppt.js — Descarga de PPT
// =============================================

function renderPPT() {
  const course = getCurrentCourse();
  const done = AppState.isStepDone('ppt');
  AuditLog.record('PPT_VIEWED', { file: course.ppt_file, version: course.ppt_version });

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
        <h2 class="text-slate-800 font-bold text-lg">Material del Curso</h2>
        <p class="text-slate-500 text-sm">Paso 1 de 5 — Descarga de PPT</p>
      </div>
      ${statusBadge(done ? 'completado' : 'disponible')}
    </div>

    <!-- Card principal -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
      <div class="bg-gradient-to-r from-gms-800 to-gms-600 p-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">📄</div>
          <div>
            <div class="text-gms-tealLight text-xs font-semibold uppercase tracking-wider">Material Oficial</div>
            <h3 class="text-white font-bold text-base mt-0.5">${course.ppt_file}</h3>
            <div class="flex items-center gap-3 mt-1 text-sm text-slate-300">
              <span>Versión ${course.ppt_version}</span>
              <span>•</span>
              <span>Curso: ${course.title}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6">
        <p class="text-slate-600 text-sm mb-5 leading-relaxed">
          Este archivo contiene todo el material teórico del curso. Descárgalo y revísalo antes de asistir a la clase en vivo.
          La descarga quedará registrada en el sistema de auditoría.
        </p>

        <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="text-slate-400 text-xs mb-0.5">Formato</div>
            <div class="text-slate-700 font-semibold">PowerPoint (.pptx)</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="text-slate-400 text-xs mb-0.5">Versión</div>
            <div class="text-slate-700 font-semibold">${course.ppt_version}</div>
          </div>
        </div>

        ${done
          ? `<div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 mb-4">
              <span class="text-xl">✅</span>
              <div>
                <div class="font-semibold">Descarga registrada</div>
                <div class="text-green-600 text-xs">Este paso está completado. Puedes continuar al siguiente.</div>
              </div>
            </div>
            <button onclick="simulateDownloadPPT()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm">
              📥 Volver a descargar
            </button>`
          : `<button onclick="simulateDownloadPPT()" class="w-full bg-gms-teal hover:bg-gms-tealDark text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm pulse-teal">
              📥 Descargar material del curso
            </button>`
        }
      </div>
    </div>

    <!-- Instrucciones -->
    <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
      <h4 class="font-bold mb-2">Instrucciones</h4>
      <ul class="space-y-1.5 list-disc list-inside text-blue-700">
        <li>Descarga el material antes de la clase en vivo</li>
        <li>Revisa los contenidos para poder participar activamente</li>
        <li>El archivo está vinculado a tu usuario y queda registrado</li>
        <li>Luego de descargar, podrás acceder al botón de Zoom</li>
      </ul>
    </div>

    <!-- Siguiente paso -->
    ${done ? `
    <div class="mt-5 flex justify-end">
      <button onclick="Router.go('zoom')" class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
        Continuar → Clase en Vivo
      </button>
    </div>` : ''}
  </div>`;

  return renderAlumnoLayout('ppt', content, 'Material del Curso');
}

function simulateDownloadPPT() {
  const course = getCurrentCourse();
  const user   = AppState.get().currentUser;
  AuditLog.record('PPT_DOWNLOADED', {
    file: course.ppt_file, version: course.ppt_version,
    user_id: user.id, course_id: course.id,
  });
  AppState.completeStep('ppt');
  showToast('Material descargado y registrado correctamente ✓', 'success');
  setTimeout(() => Router.go('ppt'), 400);
}
