// =============================================
// views/admin-dashboard.js — Dashboard de métricas
// =============================================

function renderAdminDashboard() {
  const m = MOCK_METRICS;
  const t = m.totales;

  // Mini bar chart SVG
  function miniBarChart(data, color) {
    const max  = Math.max(...data);
    const w    = 220;
    const h    = 56;
    const bw   = 28;
    const gap  = 8;
    const bars = data.map((v, i) => {
      const bh = max ? Math.round((v / max) * h) : 0;
      const x  = i * (bw + gap);
      const y  = h - bh;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="${0.5 + (v/max)*0.5}"/>`;
    }).join('');
    const labels = m.meses.map((mes, i) => {
      const x = i * (bw + gap) + bw / 2;
      return `<text x="${x}" y="${h + 14}" text-anchor="middle" font-size="9" fill="#94a3b8">${mes}</text>`;
    }).join('');
    return `<svg width="${w}" height="${h + 18}" viewBox="0 0 ${w} ${h + 18}">${bars}${labels}</svg>`;
  }

  const content = `
  <!-- Page header -->
  <div class="mb-6">
    <h2 class="text-slate-800 font-extrabold text-xl">Dashboard General</h2>
    <p class="text-slate-500 text-sm">Métricas operativas del Aula Virtual GMS — Abril 2026</p>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
    ${kpiCard(t.matriculados,  'Matriculados',         'Total acumulado',     'text-gms-600')}
    ${kpiCard(t.aprobados,     'Aprobados',            'Total acumulado',     'text-green-600')}
    ${kpiCard(t.certificados,  'Certificados emitidos','Total acumulado',     'text-gms-teal')}
    ${kpiCard(t.tasa_aprobacion + '%', 'Tasa de aprobación', 'Promedio general', 'text-amber-600')}
  </div>

  <!-- Segunda fila métricas -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
    <!-- Matriculados por mes -->
    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm col-span-2">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="font-bold text-slate-700 text-sm">Matriculados vs Aprobados</div>
          <div class="text-slate-400 text-xs">Últimos 6 meses</div>
        </div>
        <div class="flex gap-4 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-gms-600 inline-block"></span>Matriculados</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Aprobados</span>
        </div>
      </div>
      <!-- Tabla simple -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-slate-400 text-xs">
              <th class="text-left pb-2 font-semibold">Mes</th>
              ${m.meses.map(mes => `<th class="text-center pb-2 font-semibold">${mes}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-1 text-slate-600 font-medium">Matriculados</td>
              ${m.matriculados_mes.map(v => `<td class="text-center font-bold text-gms-600">${v}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-1 text-slate-600 font-medium">Aprobados</td>
              ${m.aprobados_mes.map(v => `<td class="text-center font-bold text-green-600">${v}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-1 text-slate-600 font-medium">Certificados</td>
              ${m.certificados_mes.map(v => `<td class="text-center font-bold text-gms-teal">${v}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mini chart barras -->
      <div class="mt-4 flex gap-4 flex-wrap">
        <div>
          <div class="text-xs text-slate-400 mb-1">Matriculados</div>
          ${miniBarChart(m.matriculados_mes, '#1a3a6b')}
        </div>
        <div>
          <div class="text-xs text-slate-400 mb-1">Aprobados</div>
          ${miniBarChart(m.aprobados_mes, '#16a34a')}
        </div>
      </div>
    </div>

    <!-- Métricas rápidas -->
    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div class="font-bold text-slate-700 text-sm mb-4">Resumen Operativo</div>
      <div class="space-y-3">
        ${[
          ['Exámenes rendidos', m.examenes_mes.reduce((a,b) => a+b,0), 'text-amber-600'],
          ['Encuestas completadas', m.encuestas_mes.reduce((a,b) => a+b,0), 'text-indigo-600'],
          ['Tasa finalización', t.tasa_finalizacion + '%', 'text-gms-teal'],
        ].map(([label, value, color]) => `
        <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
          <span class="text-slate-600 text-sm">${label}</span>
          <span class="font-extrabold text-sm ${color}">${value}</span>
        </div>`).join('')}
      </div>

      <!-- Curso activo -->
      <div class="mt-4 bg-gms-50 border border-gms-100 rounded-xl p-3 bg-slate-50">
        <div class="text-xs text-slate-400 mb-1">Curso activo</div>
        <div class="text-slate-700 font-semibold text-xs leading-snug">${MOCK_COURSES[0].title}</div>
        <div class="text-slate-400 text-xs mt-1">${MOCK_COURSES[0].date}</div>
      </div>
    </div>
  </div>

  <!-- Accesos rápidos -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <button onclick="Router.go('admin-alumnos')"
      class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left hover:border-gms-teal transition-all card-hover">
      <div class="text-2xl mb-2">👥</div>
      <div class="font-bold text-slate-700 text-sm">Ver Alumnos</div>
      <div class="text-slate-400 text-xs mt-1">Listado completo con estado de progreso</div>
    </button>
    <button onclick="Router.go('admin-alumnos')"
      class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left hover:border-gms-teal transition-all card-hover">
      <div class="text-2xl mb-2">📋</div>
      <div class="font-bold text-slate-700 text-sm">Trazabilidad / Auditoría</div>
      <div class="text-slate-400 text-xs mt-1">Timeline de eventos por alumno</div>
    </button>
  </div>`;

  return renderAdminLayout('admin-dashboard', content);
}
