// =============================================
// views/admin-alumnos.js — Listado de alumnos
// =============================================

function renderAdminAlumnos() {
  const alumnos = MOCK_USERS.filter(u => u.role === 'alumno');

  const rows = alumnos.map(u => {
    const prog = MOCK_STUDENT_PROGRESS[u.id] || { step: 0, steps_done: ['login'], score: null, cert_code: null, completed: false };
    const stepNames = ['login','ppt','zoom','exam','encuesta','certificado'];
    const doneCount = prog.steps_done.length;
    const total     = stepNames.length;
    const pct       = Math.round((doneCount / total) * 100);

    let statusLabel = 'En progreso';
    let statusCls   = 'bg-amber-100 text-amber-700';
    if (prog.completed) { statusLabel = 'Completado'; statusCls = 'bg-green-100 text-green-700'; }
    else if (doneCount <= 1) { statusLabel = 'Iniciado'; statusCls = 'bg-blue-100 text-blue-700'; }

    const scoreHtml = prog.score != null
      ? `<span class="${prog.score >= 60 ? 'text-green-600' : 'text-red-500'} font-bold">${prog.score}%</span>`
      : `<span class="text-slate-400">—</span>`;

    const certHtml = prog.cert_code
      ? `<span class="font-mono text-xs text-gms-teal">${prog.cert_code}</span>`
      : `<span class="text-slate-400 text-xs">—</span>`;

    return `
    <tr class="border-b border-slate-100 cursor-pointer hover:bg-slate-50" onclick="Router.go('admin-detalle', '${u.id}')">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gms-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${u.avatar}</div>
          <div>
            <div class="font-semibold text-slate-800 text-sm">${u.name}</div>
            <div class="text-slate-400 text-xs">${u.email}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-sm text-slate-600">${u.empresa}</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden" style="min-width:60px">
            <div class="h-full bg-gms-teal rounded-full" style="width:${pct}%"></div>
          </div>
          <span class="text-xs font-bold text-slate-600 w-8">${pct}%</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls}">${statusLabel}</span>
      </td>
      <td class="py-3 px-4 text-sm">${scoreHtml}</td>
      <td class="py-3 px-4">${certHtml}</td>
      <td class="py-3 px-4">
        <button onclick="event.stopPropagation(); Router.go('admin-detalle', '${u.id}')"
          class="text-gms-teal hover:text-gms-tealDark text-xs font-semibold transition-colors">
          Ver detalle →
        </button>
      </td>
    </tr>`;
  }).join('');

  const content = `
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-slate-800 font-extrabold text-xl">Listado de Alumnos</h2>
      <p class="text-slate-500 text-sm">${alumnos.length} alumnos matriculados — Curso: ${MOCK_COURSE.title}</p>
    </div>
  </div>

  <!-- Tabla -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div class="admin-table-wrap">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Alumno</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Empresa</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Progreso</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nota</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Certificado</th>
            <th class="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  return renderAdminLayout('admin-alumnos', content);
}
