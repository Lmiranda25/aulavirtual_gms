// =============================================
// views/admin-detalle.js — Detalle de alumno + timeline auditoría
// =============================================

function renderAdminDetalle(userId) {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) {
    return renderAdminLayout('admin-alumnos', `<p class="text-red-500">Alumno no encontrado.</p>`);
  }

  const prog   = MOCK_STUDENT_PROGRESS[userId] || { steps_done: ['login'], score: null, cert_code: null };
  const events = MOCK_AUDIT_EVENTS[userId] || [];

  // Timeline visual de pasos
  const flowSteps = [
    { key: 'login',       label: 'Ingreso al curso',    icon: '🔑' },
    { key: 'ppt',         label: 'Descarga de PPT',     icon: '📄' },
    { key: 'zoom',        label: 'Clic en Zoom',        icon: '🎥' },
    { key: 'exam',        label: 'Examen',              icon: '📝' },
    { key: 'encuesta',    label: 'Encuesta',            icon: '⭐' },
    { key: 'certificado', label: 'Certificado',         icon: '🏆' },
  ];

  const timelineHtml = flowSteps.map((s, idx) => {
    const done = prog.steps_done.includes(s.key);
    const isLast = idx === flowSteps.length - 1;
    // Buscar evento relacionado
    const relatedEvents = {
      login:       ['LOGIN_SUCCESS', 'COURSE_ACCESSED'],
      ppt:         ['PPT_VIEWED', 'PPT_DOWNLOADED'],
      zoom:        ['ZOOM_BUTTON_CLICKED', 'LIVE_CLASS_ACCESS_ATTEMPTED'],
      exam:        ['EXAM_STARTED', 'EXAM_SUBMITTED', 'EXAM_FINISHED', 'EXAM_GRADED'],
      encuesta:    ['SURVEY_STARTED', 'SURVEY_SUBMITTED'],
      certificado: ['CERTIFICATE_ENABLED', 'CERTIFICATE_GENERATED', 'CERTIFICATE_DOWNLOADED'],
    };
    const rel = events.filter(e => (relatedEvents[s.key] || []).includes(e.event_type));
    const ts  = rel.length ? rel[0].timestamp : null;

    return `
    <div class="flex gap-4">
      <div class="flex flex-col items-center">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${done ? 'bg-gms-teal text-white' : 'bg-slate-200 text-slate-400'}">
          ${done ? '✓' : s.icon}
        </div>
        ${!isLast ? `<div class="w-0.5 flex-1 mt-1 ${done ? 'bg-gms-teal/40' : 'bg-slate-200'}"></div>` : ''}
      </div>
      <div class="pb-5 flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="font-semibold text-slate-800 text-sm">${s.icon} ${s.label}</span>
          ${done
            ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Completado</span>`
            : `<span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Pendiente</span>`}
          ${ts ? `<span class="text-xs text-slate-400">${_formatTs(ts)}</span>` : ''}
        </div>
        ${rel.length > 0 ? `
        <div class="flex flex-wrap gap-1 mt-1">
          ${rel.map(e => eventTypeBadge(e.event_type)).join('')}
        </div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Tabla completa de eventos
  const eventsTableHtml = events.length > 0
    ? events.map(e => `
      <tr class="border-b border-slate-100">
        <td class="py-2 px-3 text-xs text-slate-500 font-mono whitespace-nowrap">${_formatTs(e.timestamp)}</td>
        <td class="py-2 px-3">${eventTypeBadge(e.event_type)}</td>
        <td class="py-2 px-3 text-xs text-slate-500">${e.ip}</td>
        <td class="py-2 px-3 text-xs text-slate-500 max-w-xs truncate">${JSON.stringify(e.metadata)}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="text-center py-6 text-slate-400 text-sm">Sin eventos registrados para este alumno</td></tr>`;

  const content = `
  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm text-slate-500 mb-5">
    <button onclick="Router.go('admin-alumnos')" class="hover:text-gms-teal transition-colors">Alumnos</button>
    <span>/</span>
    <span class="text-slate-800 font-semibold">${user.name}</span>
  </div>

  <!-- Header alumno -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-5 flex flex-wrap items-center gap-4">
    <div class="w-14 h-14 rounded-full bg-gms-teal flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
      ${user.avatar}
    </div>
    <div class="flex-1 min-w-0">
      <h2 class="text-slate-800 font-extrabold text-lg">${user.name}</h2>
      <div class="text-slate-500 text-sm">${user.email}</div>
      <div class="text-slate-400 text-xs mt-0.5">${user.empresa}</div>
    </div>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div class="bg-slate-50 rounded-xl p-3">
        <div class="text-slate-400 text-xs">Progreso</div>
        <div class="font-extrabold text-gms-teal">${Math.round((prog.steps_done.length/6)*100)}%</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-3">
        <div class="text-slate-400 text-xs">Nota</div>
        <div class="font-extrabold ${prog.score != null ? (prog.score >= 60 ? 'text-green-600' : 'text-red-500') : 'text-slate-400'}">
          ${prog.score != null ? prog.score + '%' : '—'}
        </div>
      </div>
      <div class="bg-slate-50 rounded-xl p-3">
        <div class="text-slate-400 text-xs">Certificado</div>
        <div class="font-extrabold text-xs ${prog.cert_code ? 'text-gms-teal' : 'text-slate-400'}">
          ${prog.cert_code ? '✓' : '—'}
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <!-- Timeline flujo -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 class="font-bold text-slate-700 text-sm mb-4">Timeline del Flujo</h3>
      <div>${timelineHtml}</div>
    </div>

    <!-- Historial completo de eventos -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 class="font-bold text-slate-700 text-sm mb-4">
        Historial de Auditoría
        <span class="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">${events.length} eventos</span>
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-400 border-b border-slate-100">
              <th class="text-left pb-2 font-semibold">Timestamp</th>
              <th class="text-left pb-2 font-semibold">Evento</th>
              <th class="text-left pb-2 font-semibold">IP</th>
              <th class="text-left pb-2 font-semibold">Datos</th>
            </tr>
          </thead>
          <tbody>${eventsTableHtml}</tbody>
        </table>
      </div>
    </div>
  </div>`;

  return renderAdminLayout('admin-alumnos', content);
}

function _formatTs(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return isoString; }
}
