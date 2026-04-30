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

  // ── Timeline (rediseño premium) ───────────────────────────
  const flowSteps = [
    { key: 'login',       label: 'Ingreso al sistema', cat: 'login',  types: ['LOGIN_SUCCESS','COURSE_ACCESSED'] },
    { key: 'ppt',         label: 'Material PPT',       cat: 'ppt',    types: ['PPT_VIEWED','PPT_DOWNLOADED'] },
    { key: 'zoom',        label: 'Clase en Vivo',      cat: 'zoom',   types: ['ZOOM_BUTTON_CLICKED','LIVE_CLASS_ACCESS_ATTEMPTED','ZOOM_SESSION_JOINED','ZOOM_SESSION_LEFT'] },
    { key: 'exam',        label: 'Examen',             cat: 'exam',   types: ['EXAM_STARTED','EXAM_ANSWER_SAVED','EXAM_SUBMITTED','EXAM_FINISHED','EXAM_GRADED'] },
    { key: 'encuesta',    label: 'Encuesta',           cat: 'survey', types: ['SURVEY_STARTED','SURVEY_SUBMITTED'] },
    { key: 'certificado', label: 'Certificado',        cat: 'cert',   types: ['CERTIFICATE_ENABLED','CERTIFICATE_GENERATED','CERTIFICATE_DOWNLOADED'] },
  ];
  const doneCount = flowSteps.filter(s => prog.steps_done.includes(s.key)).length;
  const progressPct = Math.round((doneCount / flowSteps.length) * 100);

  const timelineHtml = flowSteps.map((s, idx) => {
    const done   = prog.steps_done.includes(s.key);
    const isLst  = idx === flowSteps.length - 1;
    const nextDone = !isLst && prog.steps_done.includes(flowSteps[idx + 1].key);
    const rel    = events.filter(e => s.types.includes(e.event_type));
    const first  = rel.find(e => e.event_type !== 'EXAM_ANSWER_SAVED') || rel[0];
    const unix   = tsUnix(first);
    let durSecs = null;
    if (s.key === 'zoom') durSecs = zoomDur;
    else if (s.key === 'exam') durSecs = examDur;
    else if (s.key === 'encuesta') durSecs = survDur;
    const durBadge = durSecs ? `<span class="audit-duration" title="Duración total de la fase">${_iconClock()} ${_adminFmtDur(durSecs)}</span>` : '';
    const grouped = _groupEvents(rel);
    const visibleChips = grouped.slice(0, 4).map(g => _chipFromEvent(g.type, g.count)).join('');
    const moreChip = grouped.length > 4
      ? `<span class="audit-chip" style="background:#f1f5f9;color:#64748b" title="${grouped.slice(4).map(g => g.type).join(', ')}">+${grouped.length - 4}</span>`
      : '';

    const nodeClass = done ? 'audit-phase__node--done' : 'audit-phase__node--pending';
    const nodeContent = done ? _iconCheck() : (idx + 1);
    const connectorClass = done && nextDone ? 'audit-phase__connector audit-phase__connector--done' : 'audit-phase__connector';

    const titleAttr = first ? `Fase ${idx + 1} · ${done ? 'Completada' : 'Pendiente'}${durSecs ? ' · Duración ' + _adminFmtDur(durSecs) : ''}` : `Fase ${idx + 1} · Pendiente`;

    return `
    <div class="audit-phase" style="animation-delay:${idx * 60}ms" title="${titleAttr}">
      <div class="audit-phase__rail">
        <div class="audit-phase__node ${nodeClass}">${nodeContent}</div>
        ${!isLst ? `<div class="${connectorClass}"></div>` : ''}
      </div>
      <div class="audit-phase__body">
        <div class="audit-phase__title-row">
          <span class="audit-phase__title">${s.label}</span>
          <span class="audit-status audit-status--${done ? 'done' : 'pending'}">${done ? 'Completado' : 'Pendiente'}</span>
          ${durBadge}
        </div>
        ${first ? `
        <div class="audit-phase__time">
          <span class="audit-phase__time-rel">${_relTime(first.timestamp)}</span>
          <span class="audit-phase__time-iso" title="Fecha y hora exacta">${_tsFmt(first.timestamp)}</span>
        </div>` : ''}
        ${grouped.length ? `<div class="audit-phase__chips">${visibleChips}${moreChip}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // ── Log de Auditoría (rediseño + interactividad) ──────────
  const logCategories = [
    { key: 'login',  label: 'Login',       types: ['LOGIN_SUCCESS','COURSE_ACCESSED'] },
    { key: 'ppt',    label: 'Material',    types: ['PPT_VIEWED','PPT_DOWNLOADED'] },
    { key: 'zoom',   label: 'Clase',       types: ['ZOOM_BUTTON_CLICKED','LIVE_CLASS_ACCESS_ATTEMPTED','ZOOM_SESSION_JOINED','ZOOM_SESSION_LEFT'] },
    { key: 'exam',   label: 'Examen',      types: ['EXAM_STARTED','EXAM_ANSWER_SAVED','EXAM_SUBMITTED','EXAM_FINISHED','EXAM_GRADED'] },
    { key: 'survey', label: 'Encuesta',    types: ['SURVEY_STARTED','SURVEY_SUBMITTED'] },
    { key: 'cert',   label: 'Certificado', types: ['CERTIFICATE_ENABLED','CERTIFICATE_GENERATED','CERTIFICATE_DOWNLOADED'] },
    { key: 'system', label: 'Sistema',     types: ['SESSION_TIMEOUT','SESSION_ENDED'] },
  ];
  const catCounts = logCategories.map(c => ({
    ...c,
    count: events.filter(e => c.types.includes(e.event_type)).length,
  }));

  const filtersHtml = `
    <button type="button" class="audit-filter-chip is-active" data-filter="__all">
      Todos <span class="audit-filter-chip__count">${events.length}</span>
    </button>
    ${catCounts.filter(c => c.count > 0).map(c => `
      <button type="button" class="audit-filter-chip" data-filter="${c.key}">
        ${c.label} <span class="audit-filter-chip__count">${c.count}</span>
      </button>`).join('')}
  `;

  const tableRowsHtml = events.length > 0
    ? events.map((e, i) => {
        const unix = e.unix_ts || Math.floor(new Date(e.timestamp).getTime() / 1000);
        const cat = _eventCategory(e.event_type);
        const labelMap = _eventLabel(e.event_type);
        const ip = e.ip || '—';
        const detailPreview = _fmtMeta(e.metadata);
        const searchHay = `${labelMap} ${e.event_type} ${ip} ${detailPreview} ${unix}`.toLowerCase();
        return `
        <tr class="audit-row" data-row="${i}" data-category="${cat}" data-search="${_escAttr(searchHay)}" tabindex="0">
          <td>
            <div class="audit-row__when">
              ${_chipFromEvent(e.event_type, 1, true)}
              <span class="audit-row__time-rel">${_relTime(e.timestamp)}</span>
            </div>
            <div class="audit-row__time-iso" title="Fecha y hora exacta">${_tsFmt(e.timestamp)}</div>
          </td>
          <td class="audit-col--ip"><span class="audit-row__ip">${ip}</span></td>
          <td class="audit-col--detail"><div class="audit-row__detail-preview">${detailPreview}</div></td>
          <td style="text-align:right;width:36px;padding-right:14px;">
            <span class="audit-row__caret">${_iconChevron()}</span>
          </td>
        </tr>
        <tr class="audit-row__detail-row is-hidden" data-detail-for="${i}">
          <td colspan="4">
            <div class="audit-row__detail-card">
              ${_detailCardHtml(e, unix)}
            </div>
          </td>
        </tr>`;
      }).join('')
    : '';

  const emptyStateHtml = events.length === 0
    ? `<div class="audit-empty">
        ${_iconInbox()}
        <div class="audit-empty__title">Sin eventos registrados</div>
        <div class="audit-empty__hint">Aún no se ha generado actividad para este alumno.</div>
       </div>`
    : '';

  const noResultsHtml = events.length > 0
    ? `<div class="audit-empty audit-no-results is-hidden" style="display:none">
        ${_iconSearch()}
        <div class="audit-empty__title">Sin resultados</div>
        <div class="audit-empty__hint">Prueba con otro término o limpia los filtros.</div>
        <button type="button" class="audit-empty__reset" data-audit-reset>Limpiar filtros</button>
       </div>`
    : '';

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

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <!-- Timeline -->
    <section class="audit-card" aria-label="Timeline del Flujo">
      <header class="audit-card__header">
        <div class="audit-card__title">
          <span class="audit-card__title-icon">${_iconTimeline()}</span>
          <span>Timeline del Flujo</span>
          <span class="audit-count" style="margin-left:auto">${doneCount}/${flowSteps.length} fases</span>
        </div>
        <div class="audit-card__subtitle">Recorrido del alumno · ${progressPct}% completado</div>
        <div class="audit-progress" aria-hidden="true">
          <div class="audit-progress__fill" style="width:${progressPct}%"></div>
        </div>
      </header>
      <div class="audit-card__body">
        <div class="audit-rail">${timelineHtml}</div>
      </div>
    </section>

    <!-- Log de Auditoría -->
    <section class="audit-card" aria-label="Log de Auditoría" data-audit-log>
      <header class="audit-card__header">
        <div class="audit-card__title">
          <span class="audit-card__title-icon">${_iconLog()}</span>
          <span>Log de Auditoría</span>
          <span class="audit-count" style="margin-left:auto" data-audit-count>${events.length} eventos</span>
        </div>
        <div class="audit-card__subtitle">Registro completo de la actividad del alumno</div>
        ${events.length > 0 ? `
        <div class="audit-toolbar">
          <div class="audit-search">
            <span class="audit-search__icon">${_iconSearch()}</span>
            <input type="text" class="audit-search__input" data-audit-search placeholder="Buscar por evento, dispositivo o información…" aria-label="Buscar en el log" />
            <button type="button" class="audit-search__clear" data-audit-search-clear aria-label="Limpiar búsqueda">${_iconX()}</button>
          </div>
          <div class="audit-filters" role="group" aria-label="Filtros por categoría">${filtersHtml}</div>
        </div>` : ''}
      </header>
      <div class="audit-card__body" style="padding-top:0">
        ${events.length > 0 ? `
        <div class="audit-log__scroll">
          <table class="audit-log__table">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th class="audit-col--ip">Dirección IP</th>
                <th class="audit-col--detail">Información</th>
                <th></th>
              </tr>
            </thead>
            <tbody data-audit-tbody>${tableRowsHtml}</tbody>
          </table>
          ${noResultsHtml}
        </div>` : emptyStateHtml}
      </div>
    </section>
  </div>`;

  // Wire-up post-render (vanilla, scoped to the just-rendered card)
  window._viewPostRender = _setupAuditLogInteractions;

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
  const parts = Object.entries(meta)
    .filter(([k, v]) => v !== undefined && v !== null && v !== '' && typeof v !== 'object')
    .filter(([k]) => !['unix_ts','session_id','event_id','user_id'].includes(k))
    .map(([k, v]) => {
      const label = (typeof _FRIENDLY_KEYS !== 'undefined' && _FRIENDLY_KEYS[k]) || k.replace(/_/g, ' ');
      let val = v;
      if (k === 'duration_seconds') val = _adminFmtDur(v);
      if (k === 'status') val = String(v).toLowerCase();
      return `${label}: ${val}`;
    })
    .slice(0, 3);
  return parts.length ? parts.join(' · ') : '—';
}

// ── Helpers nuevos para Audit UI premium ──────────────────
function _escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _relTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.round(diffMs / 60000);
    const diffH = Math.round(diffMs / 3600000);
    const sameDay = d.toDateString() === now.toDateString();
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    const isYest = d.toDateString() === yest.toDateString();
    const hm = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    if (Math.abs(diffMin) < 1) return 'hace instantes';
    if (diffMin > 0 && diffMin < 60) return `hace ${diffMin} min`;
    if (sameDay) return `hoy ${hm}`;
    if (isYest) return `ayer ${hm}`;
    if (diffH < 0 && diffH > -24) return `en ${Math.abs(diffH)}h`;
    const dm = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    return `${dm} ${hm}`;
  } catch { return iso; }
}

function _eventCategory(type) {
  if (['LOGIN_SUCCESS','COURSE_ACCESSED'].includes(type)) return 'login';
  if (['PPT_VIEWED','PPT_DOWNLOADED'].includes(type)) return 'ppt';
  if (['ZOOM_BUTTON_CLICKED','LIVE_CLASS_ACCESS_ATTEMPTED','ZOOM_SESSION_JOINED','ZOOM_SESSION_LEFT'].includes(type)) return 'zoom';
  if (['EXAM_STARTED','EXAM_ANSWER_SAVED','EXAM_SUBMITTED','EXAM_FINISHED','EXAM_GRADED'].includes(type)) return 'exam';
  if (['SURVEY_STARTED','SURVEY_SUBMITTED'].includes(type)) return 'survey';
  if (['CERTIFICATE_ENABLED','CERTIFICATE_GENERATED','CERTIFICATE_DOWNLOADED'].includes(type)) return 'cert';
  return 'system';
}

const _EVENT_STYLE = {
  LOGIN_SUCCESS:               { bg: '#dbeafe', fg: '#1d4ed8', label: 'Login' },
  COURSE_ACCESSED:             { bg: '#e0e7ff', fg: '#4338ca', label: 'Acceso Curso' },
  PPT_VIEWED:                  { bg: '#f3e8ff', fg: '#7e22ce', label: 'PPT Vista' },
  PPT_DOWNLOADED:              { bg: '#e9d5ff', fg: '#6b21a8', label: 'PPT Descarga' },
  ZOOM_BUTTON_CLICKED:         { bg: '#cffafe', fg: '#0e7490', label: 'Zoom Clic' },
  LIVE_CLASS_ACCESS_ATTEMPTED: { bg: '#a5f3fc', fg: '#155e75', label: 'Clase Acceso' },
  ZOOM_SESSION_JOINED:         { bg: '#cffafe', fg: '#0e7490', label: 'Zoom Ingreso' },
  ZOOM_SESSION_LEFT:           { bg: '#cffafe', fg: '#155e75', label: 'Zoom Salida' },
  EXAM_STARTED:                { bg: '#fef3c7', fg: '#b45309', label: 'Examen Inicio' },
  EXAM_ANSWER_SAVED:           { bg: '#fef3c7', fg: '#92400e', label: 'Resp. Guardada' },
  EXAM_SUBMITTED:              { bg: '#ffedd5', fg: '#c2410c', label: 'Exam. Enviado' },
  EXAM_FINISHED:               { bg: '#fed7aa', fg: '#9a3412', label: 'Exam. Finalizado' },
  EXAM_GRADED:                 { bg: '#dcfce7', fg: '#15803d', label: 'Exam. Calificado' },
  SURVEY_STARTED:              { bg: '#ccfbf1', fg: '#0f766e', label: 'Encuesta Inicio' },
  SURVEY_SUBMITTED:            { bg: '#99f6e4', fg: '#115e59', label: 'Encuesta Enviada' },
  CERTIFICATE_ENABLED:         { bg: '#fef9c3', fg: '#a16207', label: 'Cert. Habilitado' },
  CERTIFICATE_GENERATED:       { bg: '#fef08a', fg: '#854d0e', label: 'Cert. Generado' },
  CERTIFICATE_DOWNLOADED:      { bg: '#bbf7d0', fg: '#166534', label: 'Cert. Descargado' },
  SESSION_TIMEOUT:             { bg: '#fee2e2', fg: '#b91c1c', label: 'Sesión Expirada' },
  SESSION_ENDED:               { bg: '#e2e8f0', fg: '#334155', label: 'Sesión Finalizada' },
};

function _eventLabel(type) {
  return (_EVENT_STYLE[type] && _EVENT_STYLE[type].label) || type;
}

function _chipFromEvent(type, count = 1, isLog = false) {
  const s = _EVENT_STYLE[type] || { bg: '#f1f5f9', fg: '#475569', label: type };
  const cnt = count > 1 ? `<span class="audit-chip__count">×${count}</span>` : '';
  return `<span class="audit-chip" style="background:${s.bg};color:${s.fg}" title="${type}">${s.label}${cnt}</span>`;
}

function _groupEvents(arr) {
  const out = [];
  const seen = new Map();
  arr.forEach(e => {
    if (seen.has(e.event_type)) {
      const idx = seen.get(e.event_type);
      out[idx].count += 1;
    } else {
      seen.set(e.event_type, out.length);
      out.push({ type: e.event_type, count: 1 });
    }
  });
  return out;
}

function _detailCardHtml(e, unix) {
  const meta = e.metadata || {};
  const items = Object.entries(meta)
    .filter(([k, v]) => v !== undefined && v !== null && v !== '')
    .filter(([k]) => !_HIDDEN_KEYS.has(k))
    .map(([k, v]) => {
      const label = _FRIENDLY_KEYS[k] || _humanizeKey(k);
      const val = _friendlyValue(k, v);
      return `<div class="audit-row__detail-item">
        <span class="audit-row__detail-key">${_escAttr(label)}</span>
        <span class="audit-row__detail-val">${val}</span>
      </div>`;
    }).join('');
  if (!items) {
    return `<div class="audit-row__detail-grid"><div class="audit-row__detail-item"><span class="audit-row__detail-val" style="color:#94a3b8">Sin información adicional registrada</span></div></div>`;
  }
  return `<div class="audit-row__detail-grid">${items}</div>`;
}

// Diccionario español amigable para metadata (oculta jerga técnica)
const _FRIENDLY_KEYS = {
  browser: 'Navegador',
  device: 'Dispositivo',
  os: 'Sistema operativo',
  course_id: 'Código del curso',
  course_title: 'Curso',
  file: 'Archivo',
  file_name: 'Archivo',
  version: 'Versión',
  meeting_id: 'Sala de la clase',
  participant: 'Participante',
  host: 'Instructor',
  duration_seconds: 'Duración',
  duration_display: 'Duración',
  question: 'Pregunta',
  answer: 'Respuesta',
  answer_text: 'Respuesta del alumno',
  score: 'Calificación',
  status: 'Resultado',
  passing_score: 'Nota mínima para aprobar',
  ratings: 'Valoraciones',
  recomendaria: '¿Recomendaría el curso?',
  cert_code: 'Código de certificado',
  reason: 'Motivo',
  exam_in_progress: 'Examen en curso',
  answers_saved: 'Respuestas guardadas',
};

// Estos campos se ocultan: identificadores internos, datos técnicos sin valor para no técnicos
const _HIDDEN_KEYS = new Set(['unix_ts', 'session_id', 'event_id', 'user_id', 'timestamp']);

function _humanizeKey(k) {
  return k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
}

function _friendlyValue(key, v) {
  if (v === null || v === undefined) return '—';
  if (key === 'duration_seconds' || key === 'duration_display') {
    if (typeof v === 'number') return _escAttr(_adminFmtDur(v));
    return _escAttr(String(v));
  }
  if (key === 'score' || key === 'passing_score') {
    return `${_escAttr(String(v))}<span style="color:#94a3b8">/100</span>`;
  }
  if (key === 'status') {
    const s = String(v).toUpperCase();
    if (s === 'APROBADO') return `<span style="color:#15803d;font-weight:700">✓ Aprobado</span>`;
    if (s === 'DESAPROBADO' || s === 'REPROBADO') return `<span style="color:#b91c1c;font-weight:700">✗ Desaprobado</span>`;
    return _escAttr(String(v));
  }
  if (key === 'recomendaria') {
    if (String(v).toLowerCase() === 'si' || String(v).toLowerCase() === 'sí') return '✓ Sí, lo recomendaría';
    if (String(v).toLowerCase() === 'no') return '✗ No lo recomendaría';
    return _escAttr(String(v));
  }
  if (key === 'exam_in_progress') {
    return v ? 'Sí' : 'No';
  }
  if (key === 'ratings' && typeof v === 'object') {
    return Object.entries(v).map(([k, val]) =>
      `<span style="display:inline-block;margin-right:10px"><span style="color:#94a3b8;font-size:11px">${_escAttr(_humanizeKey(k))}:</span> <strong>${_escAttr(String(val))}/5</strong></span>`
    ).join('');
  }
  if (typeof v === 'object') {
    return Object.entries(v).map(([k, val]) => `${_escAttr(k)}: ${_escAttr(String(val))}`).join(' · ');
  }
  return _escAttr(String(v));
}

// ── Iconos SVG inline (Heroicons-style, currentColor) ─────
function _iconCheck()    { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 10 8.5 14.5 16 6.5"/></svg>`; }
function _iconClock()    { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><polyline points="10 5.5 10 10 13 12"/></svg>`; }
function _iconChevron()  { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 8 10 13 15 8"/></svg>`; }
function _iconSearch()   { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6"/><line x1="13.5" y1="13.5" x2="17" y2="17"/></svg>`; }
function _iconX()        { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>`; }
function _iconTimeline() { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="1.6"/><circle cx="6" cy="10" r="1.6"/><circle cx="6" cy="15" r="1.6"/><line x1="10" y1="5" x2="16" y2="5"/><line x1="10" y1="10" x2="16" y2="10"/><line x1="10" y1="15" x2="16" y2="15"/></svg>`; }
function _iconLog()      { return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="13" height="13" rx="2.5"/><line x1="6.5" y1="7.5" x2="13.5" y2="7.5"/><line x1="6.5" y1="10" x2="13.5" y2="10"/><line x1="6.5" y1="12.5" x2="11" y2="12.5"/></svg>`; }
function _iconInbox()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 13 8 13 9.5 16 14.5 16 16 13 21 13"/><path d="M5 6l1.5-2h11L19 6v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/></svg>`; }

// ── Wire-up: search + filter chips + expand row + copy unix
function _setupAuditLogInteractions() {
  const root = document.querySelector('[data-audit-log]');
  if (!root) return;
  const tbody = root.querySelector('[data-audit-tbody]');
  const search = root.querySelector('[data-audit-search]');
  const searchWrap = root.querySelector('.audit-search');
  const searchClear = root.querySelector('[data-audit-search-clear]');
  const filterBtns = Array.from(root.querySelectorAll('.audit-filter-chip'));
  const countBadge = root.querySelector('[data-audit-count]');
  const noResults = root.querySelector('.audit-no-results');
  const totalEvents = tbody ? tbody.querySelectorAll('tr.audit-row').length : 0;

  let activeFilters = new Set(['__all']);
  let query = '';
  let debounceId = null;

  function applyFilters() {
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr.audit-row');
    let visible = 0;
    rows.forEach(row => {
      const cat = row.dataset.category;
      const hay = row.dataset.search || '';
      const catOk = activeFilters.has('__all') || activeFilters.has(cat);
      const qOk = !query || hay.includes(query);
      const show = catOk && qOk;
      row.classList.toggle('is-hidden', !show);
      const detail = tbody.querySelector(`tr.audit-row__detail-row[data-detail-for="${row.dataset.row}"]`);
      if (!show && detail) {
        row.classList.remove('is-expanded');
        detail.classList.add('is-hidden');
      } else if (detail && !row.classList.contains('is-expanded')) {
        detail.classList.add('is-hidden');
      }
      if (show) visible++;
    });
    if (countBadge) {
      if (visible === totalEvents) {
        countBadge.textContent = `${totalEvents} eventos`;
        countBadge.classList.remove('audit-count--filtered');
      } else {
        countBadge.textContent = `${visible} de ${totalEvents}`;
        countBadge.classList.add('audit-count--filtered');
      }
    }
    if (noResults) {
      const empty = visible === 0 && totalEvents > 0;
      noResults.style.display = empty ? '' : 'none';
      noResults.classList.toggle('is-hidden', !empty);
    }
  }

  // Search input
  if (search) {
    search.addEventListener('input', () => {
      const v = search.value.trim().toLowerCase();
      query = v;
      searchWrap.classList.toggle('has-value', v.length > 0);
      clearTimeout(debounceId);
      debounceId = setTimeout(applyFilters, 120);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (!search) return;
      search.value = '';
      query = '';
      searchWrap.classList.remove('has-value');
      applyFilters();
      search.focus();
    });
  }

  // Filter chips
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      if (f === '__all') {
        activeFilters = new Set(['__all']);
      } else {
        activeFilters.delete('__all');
        if (activeFilters.has(f)) activeFilters.delete(f);
        else activeFilters.add(f);
        if (activeFilters.size === 0) activeFilters.add('__all');
      }
      filterBtns.forEach(b => b.classList.toggle('is-active', activeFilters.has(b.dataset.filter)));
      applyFilters();
    });
  });

  // Expand row
  if (tbody) {
    tbody.addEventListener('click', (ev) => {
      const copyBtn = ev.target.closest('.audit-unix');
      if (copyBtn) { ev.stopPropagation(); _copyToClipboard(copyBtn); return; }
      const row = ev.target.closest('tr.audit-row');
      if (!row) return;
      const id = row.dataset.row;
      const detail = tbody.querySelector(`tr.audit-row__detail-row[data-detail-for="${id}"]`);
      if (!detail) return;
      const open = row.classList.toggle('is-expanded');
      detail.classList.toggle('is-hidden', !open);
    });
    tbody.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const row = ev.target.closest('tr.audit-row');
      if (!row) return;
      ev.preventDefault();
      row.click();
    });
  }

  // Reset filters from empty state
  const resetBtn = root.querySelector('[data-audit-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeFilters = new Set(['__all']);
      query = '';
      if (search) search.value = '';
      if (searchWrap) searchWrap.classList.remove('has-value');
      filterBtns.forEach(b => b.classList.toggle('is-active', b.dataset.filter === '__all'));
      applyFilters();
    });
  }

  // Copy Unix from timeline
  document.querySelectorAll('.audit-rail .audit-unix').forEach(btn => {
    btn.addEventListener('click', () => _copyToClipboard(btn));
  });
}

function _copyToClipboard(btn) {
  const val = btn.dataset.copy || btn.textContent.replace(/^Unix:\s*/, '').trim();
  const done = () => {
    btn.classList.add('is-copied');
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.classList.remove('is-copied'); btn.textContent = orig; }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val).then(done).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = val; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch {}
    document.body.removeChild(ta);
  }
}
