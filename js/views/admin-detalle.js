// =============================================
// views/admin-detalle.js — Auditoría detallada ISO 8601 + Unix Timestamp
// =============================================

function renderAdminDetalle(userId) {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) return renderAdminLayout('admin-alumnos', `<p class="text-red-500">Alumno no encontrado.</p>`);

  const prog   = MOCK_STUDENT_PROGRESS[userId] || { steps_done: ['login'], score: null, cert_code: null };
  const events = MOCK_AUDIT_EVENTS[userId] || [];

  // ── Helpers ──────────────────────────────────────────────
  const firstEv   = (type) => events.find(e => e.event_type === type);
  const tsUnix    = (e) => e ? (e.unix_ts || Math.floor(new Date(e.timestamp).getTime() / 1000)) : null;
  const tsDiff    = (e1, e2) => (tsUnix(e1) != null && tsUnix(e2) != null) ? Math.abs(tsUnix(e2) - tsUnix(e1)) : null;

  // ── Eventos clave ─────────────────────────────────────────
  const evLogin   = firstEv('LOGIN_SUCCESS');
  const evPptDl   = firstEv('PPT_DOWNLOADED');
  const evZoomBtn = firstEv('ZOOM_BUTTON_CLICKED');
  const evZoomJn  = firstEv('ZOOM_SESSION_JOINED');
  const evZoomLt  = firstEv('ZOOM_SESSION_LEFT');
  const evExamSt  = firstEv('EXAM_STARTED');
  const evExamSub = firstEv('EXAM_SUBMITTED');
  const evExamGr  = firstEv('EXAM_GRADED');
  const evSurvSt  = firstEv('SURVEY_STARTED');
  const evSurvSub = firstEv('SURVEY_SUBMITTED');
  const evCertEn  = firstEv('CERTIFICATE_ENABLED');
  const evCertDl  = firstEv('CERTIFICATE_DOWNLOADED');

  // ── Durations ─────────────────────────────────────────────
  const zoomDur   = (evZoomLt?.metadata?.duration_seconds) || tsDiff(evZoomJn, evZoomLt);
  const examDur   = (evExamSub?.metadata?.duration_seconds) || tsDiff(evExamSt, evExamSub);
  const survDur   = (evSurvSub?.metadata?.duration_seconds) || tsDiff(evSurvSt, evSurvSub);
  const zoomToEx  = tsDiff(evZoomLt, evExamSt);
  const totalSess = tsDiff(evLogin, evCertDl || evZoomLt || evExamSub);
  const examScore = evExamGr?.metadata?.score;

  // ── Panel de tiempos ──────────────────────────────────────
  const timingItems = [
    { label: 'Clase Zoom',   secs: zoomDur,  icon: '🎥', color: 'text-blue-700' },
    { label: 'Examen',       secs: examDur,  icon: '📝', color: 'text-purple-700' },
    { label: 'Encuesta',     secs: survDur,  icon: '⭐', color: 'text-amber-600' },
    { label: 'Zoom → Examen',secs: zoomToEx, icon: '⏳', color: 'text-slate-600' },
    { label: 'Sesión total', secs: totalSess,icon: '⏱', color: 'text-gms-teal' },
  ];
  const timingHtml = timingItems.map(t => `
    <div class="bg-slate-50 rounded-xl p-3 text-center">
      <div class="text-xl mb-1">${t.icon}</div>
      <div class="text-xs text-slate-400 mb-0.5 leading-tight">${t.label}</div>
      <div class="font-extrabold text-sm ${t.secs ? t.color : 'text-slate-300'}">${t.secs ? _adminFmtDur(t.secs) : '—'}</div>
    </div>`).join('');

  // ── Compliance checks ────────────────────────────────────
  const rules = [
    {
      label: 'PPT descargado ANTES del examen',
      ok: tsUnix(evPptDl) && tsUnix(evExamSt) ? tsUnix(evPptDl) < tsUnix(evExamSt) : null,
      detail: evPptDl && evExamSt ? `PPT: ${_tsFmt(evPptDl.timestamp)}  →  Examen: ${_tsFmt(evExamSt.timestamp)}` : 'Sin datos suficientes',
    },
    {
      label: 'Zoom accedido ANTES del examen',
      ok: tsUnix(evZoomBtn) && tsUnix(evExamSt) ? tsUnix(evZoomBtn) < tsUnix(evExamSt) : null,
      detail: evZoomBtn && evExamSt ? `Zoom clic: ${_tsFmt(evZoomBtn.timestamp)}  →  Examen: ${_tsFmt(evExamSt.timestamp)}` : 'Sin datos suficientes',
    },
    {
      label: 'Examen DESPUÉS de finalizar la clase en vivo',
      ok: tsUnix(evZoomLt) && tsUnix(evExamSt) ? tsUnix(evZoomLt) < tsUnix(evExamSt) : null,
      detail: evZoomLt && evExamSt ? `Salida Zoom: ${_tsFmt(evZoomLt.timestamp)}  →  Examen: ${_tsFmt(evExamSt.timestamp)}` : 'Sin datos de ZOOM_SESSION_LEFT',
    },
    {
      label: 'Encuesta POSTERIOR al examen calificado (regla APN)',
      ok: tsUnix(evExamGr) && tsUnix(evSurvSt) ? tsUnix(evExamGr) < tsUnix(evSurvSt) : null,
      detail: evExamGr && evSurvSt ? `Examen calificado: ${_tsFmt(evExamGr.timestamp)}  →  Encuesta inicio: ${_tsFmt(evSurvSt.timestamp)}` : 'Sin datos suficientes',
    },
    {
      label: 'Certificado habilitado DESPUÉS de encuesta enviada',
      ok: tsUnix(evSurvSub) && tsUnix(evCertEn) ? tsUnix(evSurvSub) <= tsUnix(evCertEn) : null,
      detail: evSurvSub && evCertEn ? `Encuesta enviada: ${_tsFmt(evSurvSub.timestamp)}  →  Certificado: ${_tsFmt(evCertEn.timestamp)}` : 'Sin datos suficientes',
    },
  ];
  const passCount = rules.filter(r => r.ok === true).length;
  const compHtml  = rules.map(r => `
    <div class="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span class="text-lg flex-shrink-0 mt-0.5">${r.ok === true ? '✅' : r.ok === false ? '❌' : '⏳'}</span>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold ${r.ok === true ? 'text-slate-700' : r.ok === false ? 'text-red-600' : 'text-slate-400'}">${r.label}</div>
        <div class="text-xs text-slate-400 mt-0.5">${r.detail}</div>
      </div>
      <span class="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${r.ok === true ? 'bg-green-100 text-green-700' : r.ok === false ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}">
        ${r.ok === true ? 'CUMPLE' : r.ok === false ? 'FALLA' : 'N/A'}
      </span>
    </div>`).join('');

  // ── Timeline ──────────────────────────────────────────────
  const flowSteps = [
    { key: 'login',       label: 'Ingreso al sistema', icon: '🔑', types: ['LOGIN_SUCCESS','COURSE_ACCESSED'] },
    { key: 'ppt',         label: 'Material PPT',       icon: '📄', types: ['PPT_VIEWED','PPT_DOWNLOADED'] },
    { key: 'zoom',        label: 'Clase en Vivo',      icon: '🎥', types: ['ZOOM_BUTTON_CLICKED','LIVE_CLASS_ACCESS_ATTEMPTED','ZOOM_SESSION_JOINED','ZOOM_SESSION_LEFT'] },
    { key: 'exam',        label: 'Examen',             icon: '📝', types: ['EXAM_STARTED','EXAM_ANSWER_SAVED','EXAM_SUBMITTED','EXAM_FINISHED','EXAM_GRADED'] },
    { key: 'encuesta',    label: 'Encuesta',           icon: '⭐', types: ['SURVEY_STARTED','SURVEY_SUBMITTED'] },
    { key: 'certificado', label: 'Certificado',        icon: '🏆', types: ['CERTIFICATE_ENABLED','CERTIFICATE_GENERATED','CERTIFICATE_DOWNLOADED'] },
  ];
  const timelineHtml = flowSteps.map((s, idx) => {
    const done  = prog.steps_done.includes(s.key);
    const isLst = idx === flowSteps.length - 1;
    const rel   = events.filter(e => s.types.includes(e.event_type));
    const first = rel.find(e => !['EXAM_ANSWER_SAVED'].includes(e.event_type)) || rel[0];
    const unix  = tsUnix(first);
    let durBadge = '';
    if (s.key === 'zoom' && zoomDur) durBadge = `<span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">${_adminFmtDur(zoomDur)}</span>`;
    if (s.key === 'exam' && examDur) durBadge = `<span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">${_adminFmtDur(examDur)}</span>`;
    if (s.key === 'encuesta' && survDur) durBadge = `<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-mono">${_adminFmtDur(survDur)}</span>`;
    return `
    <div class="flex gap-3">
      <div class="flex flex-col items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${done ? 'bg-gms-teal text-white' : 'bg-slate-200 text-slate-400'}">
          ${done ? '✓' : s.icon}
        </div>
        ${!isLst ? `<div class="w-0.5 flex-1 mt-1 ${done ? 'bg-gms-teal/40' : 'bg-slate-100'}"></div>` : ''}
      </div>
      <div class="pb-4 flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span class="font-semibold text-slate-800 text-sm">${s.label}</span>
          ${done ? `<span class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">✓</span>` : `<span class="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">Pendiente</span>`}
          ${durBadge}
        </div>
        ${first ? `
        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
          <span class="font-mono">${_tsFmt(first.timestamp)}</span>
          ${unix ? `<span class="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">Unix: ${unix}</span>` : ''}
        </div>` : ''}
        ${rel.length > 0 ? `<div class="flex flex-wrap gap-1">${rel.slice(0,4).map(e => eventTypeBadge(e.event_type)).join('')}${rel.length > 4 ? `<span class="text-xs text-slate-400">+${rel.length-4}</span>` : ''}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // ── Tabla de auditoría ────────────────────────────────────
  const tableHtml = events.length > 0
    ? events.map(e => {
        const unix = e.unix_ts || Math.floor(new Date(e.timestamp).getTime() / 1000);
        return `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
          <td class="py-2 px-2 text-xs font-mono whitespace-nowrap">
            <div class="text-slate-700">${_tsFmt(e.timestamp)}</div>
            <div class="text-slate-400 text-xs">Unix: ${unix}</div>
          </td>
          <td class="py-2 px-2">${eventTypeBadge(e.event_type)}</td>
          <td class="py-2 px-2 text-xs text-slate-500 font-mono whitespace-nowrap">${e.ip}</td>
          <td class="py-2 px-2 text-xs text-slate-500 max-w-[180px]">
            <div class="truncate" title="${_fmtMeta(e.metadata)}">${_fmtMeta(e.metadata)}</div>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="4" class="text-center py-6 text-slate-400 text-sm">Sin eventos registrados</td></tr>`;

  const content = `
  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm text-slate-500 mb-4">
    <button onclick="Router.go('admin-alumnos')" class="hover:text-gms-teal transition-colors">Alumnos</button>
    <span class="text-slate-300">/</span>
    <span class="text-slate-800 font-semibold">${user.name}</span>
  </div>

  <!-- Header alumno -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4 flex flex-wrap items-center gap-4">
    <div class="w-14 h-14 rounded-full bg-gms-teal flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">${user.avatar}</div>
    <div class="flex-1 min-w-0">
      <h2 class="text-slate-800 font-extrabold text-lg leading-tight">${user.name}</h2>
      <div class="text-slate-500 text-sm">${user.email}</div>
      <div class="text-slate-400 text-xs">${user.empresa}</div>
    </div>
    <div class="grid grid-cols-4 gap-2 text-center">
      <div class="bg-slate-50 rounded-xl p-2.5">
        <div class="text-slate-400 text-xs">Progreso</div>
        <div class="font-extrabold text-gms-teal text-sm">${Math.round((prog.steps_done.length/6)*100)}%</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-2.5">
        <div class="text-slate-400 text-xs">Nota</div>
        <div class="font-extrabold text-sm ${examScore != null ? (examScore >= 60 ? 'text-green-600' : 'text-red-500') : 'text-slate-400'}">${examScore != null ? examScore + '%' : '—'}</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-2.5">
        <div class="text-slate-400 text-xs">Eventos</div>
        <div class="font-extrabold text-slate-700 text-sm">${events.length}</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-2.5">
        <div class="text-slate-400 text-xs">Certif.</div>
        <div class="font-extrabold text-xs ${prog.cert_code ? 'text-gms-teal' : 'text-slate-400'}">${prog.cert_code ? '✓' : '—'}</div>
      </div>
    </div>
  </div>

  <!-- Tiempos de sesión -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
    <h3 class="font-bold text-slate-700 text-sm mb-3">⏱ Tiempos de Sesión</h3>
    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">${timingHtml}</div>
  </div>

  <!-- Validación de cumplimiento -->
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <h3 class="font-bold text-slate-700 text-sm">🔍 Validación de Cumplimiento</h3>
        <p class="text-slate-400 text-xs mt-0.5">Reglas de integridad del flujo — APN / SUNAFIL / Normativa interna</p>
      </div>
      <span class="text-xs font-bold px-3 py-1 rounded-full ${passCount === rules.length ? 'bg-green-100 text-green-700' : passCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}">
        ${passCount}/${rules.length} reglas
      </span>
    </div>
    <div class="bg-slate-50 rounded-xl p-3 mb-3 text-xs text-slate-500">
      <strong class="text-slate-600">¿Para qué sirve esto?</strong> Permite demostrar ante la APN o SUNAFIL que el alumno
      completó los pasos en el orden correcto y en los tiempos esperados.
      Los timestamps ISO 8601 y Unix son la evidencia técnica del sistema.
    </div>
    <div>${compHtml}</div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Timeline -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <h3 class="font-bold text-slate-700 text-sm mb-3">📋 Timeline del Flujo</h3>
      <div>${timelineHtml}</div>
    </div>

    <!-- Historial de auditoría -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div class="flex items-center gap-2 mb-3">
        <h3 class="font-bold text-slate-700 text-sm">🗂 Log de Auditoría</h3>
        <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">${events.length} eventos</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-xs text-slate-400 border-b border-slate-100">
              <th class="text-left pb-2 font-semibold pr-2">Timestamp ISO 8601 / Unix</th>
              <th class="text-left pb-2 font-semibold pr-2">Evento</th>
              <th class="text-left pb-2 font-semibold pr-2">IP</th>
              <th class="text-left pb-2 font-semibold">Datos</th>
            </tr>
          </thead>
          <tbody>${tableHtml}</tbody>
        </table>
      </div>
    </div>
  </div>`;

  return renderAdminLayout('admin-alumnos', content);
}

// ── Helpers de formato ─────────────────────────────────────
function _tsFmt(isoStr) {
  try {
    return new Date(isoStr).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return isoStr; }
}
// Backward compat
function _formatTs(iso) { return _tsFmt(iso); }

function _adminFmtDur(secs) {
  if (!secs && secs !== 0) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function _fmtMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) return '—';
  return Object.entries(meta)
    .filter(([k, v]) => v !== undefined && v !== null && v !== '' && typeof v !== 'object')
    .map(([k, v]) => {
      if (k === 'duration_seconds') return `duración: ${_adminFmtDur(v)}`;
      if (k === 'unix_ts') return null;
      return `${k}: ${v}`;
    })
    .filter(Boolean)
    .slice(0, 4)
    .join(' · ') || JSON.stringify(meta).substring(0, 60);
}
