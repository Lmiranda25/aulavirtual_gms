// =============================================
// views/encuesta.js — Encuesta de satisfacción obligatoria
// =============================================

function renderEncuesta() {
  if (!AppState.isStepAvailable('encuesta') && !AppState.isStepDone('encuesta')) {
    return renderAlumnoLayout('encuesta', _blockedStep('Debes completar el examen para acceder a la encuesta.'), 'Encuesta');
  }

  const state = AppState.get();

  if (state.surveySubmitted) {
    return _renderEncuestaCompletada();
  }

  // Registrar inicio
  if (!state._surveyStarted) {
    AuditLog.record('SURVEY_STARTED', { course_id: getCurrentCourse().id });
    AppState.set({ _surveyStarted: true });
  }

  const questionsHtml = MOCK_SURVEY_QUESTIONS.map((q, idx) => {
    let inputHtml = '';
    const saved = (state.surveyAnswers || {})[q.id];

    if (q.type === 'rating') {
      const stars = [1,2,3,4,5].map(n => `
        <button type="button" onclick="saveSurveyAnswer('${q.id}', ${n})"
          class="w-10 h-10 rounded-xl text-xl transition-all ${saved >= n ? 'bg-gms-teal text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-400'}">
          ★
        </button>`).join('');
      inputHtml = `<div class="flex gap-2 mt-2 flex-wrap" id="rating-${q.id}">${stars}</div>
        <div id="rating-label-${q.id}" class="text-xs text-gms-teal mt-1 font-semibold" ${saved ? '' : 'style="display:none"'}>${saved ? saved + '/5 ★' : ''}</div>`;
    } else if (q.type === 'yesno') {
      inputHtml = `
        <div class="flex gap-3 mt-2" id="yesno-${q.id}">
          <button type="button" onclick="saveSurveyAnswer('${q.id}','si')"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${saved === 'si' ? 'bg-gms-teal text-white border-gms-teal' : 'border-slate-200 text-slate-600 hover:border-gms-teal'}">
            👍 Sí
          </button>
          <button type="button" onclick="saveSurveyAnswer('${q.id}','no')"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${saved === 'no' ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 text-slate-600 hover:border-red-300'}">
            👎 No
          </button>
        </div>`;
    } else if (q.type === 'text') {
      inputHtml = `
        <textarea id="text-${q.id}" rows="3"
          class="w-full mt-2 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-gms-teal transition-all resize-none"
          placeholder="Escribe tu comentario aquí (opcional)..."
          onblur="saveSurveyAnswer('${q.id}', this.value)">${saved || ''}</textarea>`;
    }

    return `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      <div class="flex items-start gap-3">
        <span class="w-7 h-7 rounded-full bg-gms-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">${idx + 1}</span>
        <div class="flex-1">
          <p class="text-slate-800 font-semibold text-sm mb-1">${q.text}
            ${q.type !== 'text' ? '<span class="text-red-400 text-xs ml-1">*</span>' : ''}
          </p>
          ${inputHtml}
        </div>
      </div>
    </div>`;
  }).join('');

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
        <h2 class="text-slate-800 font-bold text-lg">Encuesta de Satisfacción</h2>
        <p class="text-slate-500 text-sm">Paso 4 de 5 — Obligatoria</p>
      </div>
      ${statusBadge('disponible')}
    </div>

    <!-- Aviso obligatoria -->
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 text-sm text-amber-800">
      <span class="text-xl flex-shrink-0">⚠</span>
      <div>
        <strong>Encuesta obligatoria.</strong> Debes completarla para habilitar la descarga de tu certificado.
        Tu opinión es importante para mejorar la formación en GMS.
      </div>
    </div>

    <!-- Preguntas -->
    <div id="survey-questions">${questionsHtml}</div>

    <!-- Enviar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-slate-500 text-xs">Los campos marcados con * son obligatorios.</p>
        <button onclick="submitEncuesta()" class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-sm">
          Enviar Encuesta →
        </button>
      </div>
    </div>
  </div>`;

  return renderAlumnoLayout('encuesta', content, 'Encuesta de Satisfacción');
}

function saveSurveyAnswer(questionId, value) {
  const current = AppState.get().surveyAnswers || {};
  current[questionId] = value;
  AppState.set({ surveyAnswers: current });

  // Actualizar stars en el DOM sin re-renderizar la vista
  const ratingEl = document.getElementById(`rating-${questionId}`);
  if (ratingEl) {
    ratingEl.querySelectorAll('button').forEach((btn, idx) => {
      const n = idx + 1;
      btn.className = `w-10 h-10 rounded-xl text-xl transition-all ${
        n <= Number(value) ? 'bg-gms-teal text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
      }`;
    });
    const labelEl = document.getElementById(`rating-label-${questionId}`);
    if (labelEl) { labelEl.textContent = `${value}/5 ★`; labelEl.style.display = ''; }
    return;
  }

  // Actualizar botones yes/no en el DOM sin re-renderizar
  const yesnoEl = document.getElementById(`yesno-${questionId}`);
  if (yesnoEl) {
    const [yesBtn, noBtn] = yesnoEl.querySelectorAll('button');
    const base = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ';
    if (yesBtn) yesBtn.className = base + (value === 'si' ? 'bg-gms-teal text-white border-gms-teal' : 'border-slate-200 text-slate-600 hover:border-gms-teal');
    if (noBtn)  noBtn.className  = base + (value === 'no' ? 'bg-red-500 text-white border-red-500'  : 'border-slate-200 text-slate-600 hover:border-red-300');
  }
}

function submitEncuesta() {
  const state = AppState.get();
  const answers = state.surveyAnswers || {};

  // Validar obligatorias (todas menos la de texto)
  const required = MOCK_SURVEY_QUESTIONS.filter(q => q.type !== 'text');
  const missing  = required.filter(q => !answers[q.id]);

  if (missing.length > 0) {
    showToast('Completa todas las preguntas obligatorias (*)', 'warning');
    return;
  }

  try {
    AuditLog.record('SURVEY_SUBMITTED', { course_id: getCurrentCourse().id });
    AppState.set({ surveySubmitted: true });
    AppState.completeStep('encuesta');

    const certCode = `${getCurrentCourse().certificate_code_prefix}-${String(Math.floor(Math.random() * 900) + 100).padStart(4,'0')}`;
    AppState.set({ certEnabled: true, certCode });
    AuditLog.record('CERTIFICATE_ENABLED', { cert_code: certCode });

    showToast('¡Encuesta enviada! Tu certificado está disponible.', 'success');
    Router.go('certificado');
  } catch (err) {
    console.error('[GMS] Error en submitEncuesta:', err);
    showToast('Error al procesar la encuesta. Intenta de nuevo.', 'error');
  }
}

function _renderEncuestaCompletada() {
  const content = `
  <div class="max-w-md mx-auto text-center mt-8">
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <div class="text-5xl mb-4">✅</div>
      <h3 class="text-slate-800 font-bold text-lg mb-2">Encuesta completada</h3>
      <p class="text-slate-500 text-sm mb-6">Gracias por tu opinión. Tu certificado ha sido habilitado.</p>
      <button onclick="Router.go('certificado')" class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
        Descargar Certificado →
      </button>
    </div>
  </div>`;
  return renderAlumnoLayout('encuesta', content, 'Encuesta');
}
