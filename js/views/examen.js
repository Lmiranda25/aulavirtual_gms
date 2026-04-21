// =============================================
// views/examen.js — Examen dentro de la plataforma
// =============================================

function renderExamen() {
  if (!AppState.isStepAvailable('exam') && !AppState.isStepDone('exam')) {
    return renderAlumnoLayout('examen', _blockedStep('Debes asistir a la clase en vivo antes de rendir el examen.'), 'Examen');
  }

  const state = AppState.get();

  if (state.examSubmitted) {
    return _renderExamenResultado(state);
  }

  // Registrar inicio si no se había iniciado
  if (!state._examStarted) {
    const ts = Date.now();
    AuditLog.record('EXAM_STARTED', { attempt: 1, course_id: getCurrentCourse().id, unix_ts: Math.floor(ts/1000) });
    AppState.set({ _examStarted: true, examStartTimestamp: ts });
  }

  const questionsHtml = getExamQuestions().map((q, idx) => {
    const saved = state.examAnswers[q.id];
    const optionsHtml = q.options.map((opt, oi) => `
    <div class="exam-option">
      <input type="radio" name="q_${q.id}" id="q${q.id}_o${oi}" value="${oi}"
        class="sr-only" ${saved === oi ? 'checked' : ''}
        onchange="saveExamAnswer('${q.id}', ${oi})"/>
      <label for="q${q.id}_o${oi}"
        class="flex items-center gap-3 w-full cursor-pointer border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-gms-teal">
        <span class="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs flex-shrink-0 font-bold">
          ${String.fromCharCode(65 + oi)}
        </span>
        ${opt}
      </label>
    </div>`).join('');

    return `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4" id="question-${q.id}">
      <div class="flex items-start gap-3 mb-4">
        <span class="w-7 h-7 rounded-full bg-gms-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">${idx + 1}</span>
        <p class="text-slate-800 font-semibold text-sm">${q.text}</p>
      </div>
      <div class="space-y-2 ml-10">${optionsHtml}</div>
    </div>`;
  }).join('');

  const answered = Object.keys(state.examAnswers || {}).length;
  const total    = getExamQuestions().length;

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
        <h2 class="text-slate-800 font-bold text-lg">Examen de Evaluación</h2>
        <p class="text-slate-500 text-sm">Paso 3 de 5 — Dentro de la plataforma</p>
      </div>
      ${statusBadge('en-proceso')}
    </div>

    <!-- Info del examen -->
    <div class="bg-gms-800 text-white rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-gms-tealLight text-xs font-semibold uppercase">Examen Oficial</div>
        <div class="font-bold mt-0.5">${getCurrentCourse().title}</div>
        <div class="text-slate-400 text-sm mt-1">${total} preguntas — Opción múltiple</div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-center">
          <div id="exam-timer" class="text-lg font-mono font-extrabold text-amber-300">⏱ 00:00</div>
          <div class="text-slate-400 text-xs">tiempo</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-extrabold text-gms-tealLight">${answered}/${total}</div>
          <div class="text-slate-400 text-xs">respondidas</div>
        </div>
      </div>
    </div>

    <!-- Preguntas -->
    <div id="exam-questions">${questionsHtml}</div>

    <!-- Botón enviar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-slate-500">
          Respondidas: <span id="answered-count" class="font-bold text-slate-700">${answered}</span>/${total}
        </div>
        <button onclick="submitExamen()"
          class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-sm">
          Enviar Examen →
        </button>
      </div>
      <p class="text-slate-400 text-xs mt-3">
        Al enviar, tus respuestas quedarán guardadas permanentemente. No podrás modificarlas.
      </p>
    </div>
  </div>`;

  window._viewPostRender = startExamTimer;
  return renderAlumnoLayout('examen', content, 'Examen');
}

function saveExamAnswer(questionId, optionIndex) {
  const current = AppState.get().examAnswers || {};
  current[questionId] = optionIndex;
  AppState.set({ examAnswers: current });
  AuditLog.record('EXAM_ANSWER_SAVED', { question: questionId, answer: optionIndex });
  // Actualizar contador
  const el = document.getElementById('answered-count');
  if (el) el.textContent = Object.keys(current).length;
}

function submitExamen() {
  const state    = AppState.get();
  const answers  = state.examAnswers || {};
  const questions = getExamQuestions();
  const total    = questions.length;
  const answered = Object.keys(answers).length;

  if (answered < total) {
    showToast(`Debes responder todas las preguntas (${answered}/${total})`, 'warning');
    return;
  }

  // Detener cronómetro y calcular duración
  if (window._examTimerInterval) { clearInterval(window._examTimerInterval); window._examTimerInterval = null; }
  const examStart = state.examStartTimestamp;
  const duration_seconds = examStart ? Math.round((Date.now() - examStart) / 1000) : null;
  const duration_display = duration_seconds ? _fmtDurationLong(duration_seconds) : '—';

  let correct = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct) correct++;
  });

  const score   = Math.round((correct / total) * 100);
  const unix_ts = Math.floor(Date.now() / 1000);

  AuditLog.record('EXAM_SUBMITTED', { attempt: 1, duration_seconds, duration_display, unix_ts });
  AuditLog.record('EXAM_FINISHED',  { score, total, correct, duration_seconds, duration_display });
  AuditLog.record('EXAM_GRADED',    { score, status: score >= 60 ? 'APROBADO' : 'DESAPROBADO', passing_score: 60 });

  AppState.set({ examSubmitted: true, examScore: score, examCorrect: correct });
  AppState.completeStep('exam');

  showToast('Examen enviado. Calculando resultado...', 'info');
  setTimeout(() => Router.go('examen'), 600);
}

function startExamTimer() {
  const el    = document.getElementById('exam-timer');
  if (!el) return;
  const start = AppState.get().examStartTimestamp;
  if (!start) return;
  if (window._examTimerInterval) clearInterval(window._examTimerInterval);
  const update = () => {
    const secs = Math.floor((Date.now() - start) / 1000);
    el.textContent = '⏱ ' + _fmtDuration(secs);
  };
  update();
  window._examTimerInterval = setInterval(update, 1000);
}

function _fmtDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function _fmtDurationLong(secs) {
  if (!secs && secs !== 0) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function _renderExamenResultado(state) {
  const score   = state.examScore ?? 0;
  const correct = state.examCorrect ?? 0;
  const total   = getExamQuestions().length;
  const passed  = score >= 60;

  const content = `
  <div class="max-w-xl mx-auto">
    <!-- Resultado -->
    <div class="${passed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} rounded-2xl p-6 text-white text-center shadow-lg mb-6">
      <div class="text-5xl mb-3">${passed ? '🎉' : '😔'}</div>
      <div class="text-4xl font-extrabold mb-1">${score}%</div>
      <div class="text-xl font-bold mb-2">${passed ? 'APROBADO' : 'DESAPROBADO'}</div>
      <div class="text-white/80 text-sm">${correct} de ${total} respuestas correctas</div>
    </div>

    <!-- Detalle respuestas -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      <h4 class="font-bold text-slate-700 text-sm mb-4">Revisión de respuestas</h4>
      ${getExamQuestions().map((q, i) => {
        const userAnswer = state.examAnswers[q.id];
        const isCorrect  = userAnswer === q.correct;
        return `
        <div class="mb-4 last:mb-0 p-3 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
          <div class="text-sm font-semibold text-slate-700 mb-2">${i+1}. ${q.text}</div>
          <div class="text-xs space-y-1">
            <div class="${isCorrect ? 'text-green-700' : 'text-red-600'}">
              Tu respuesta: ${q.options[userAnswer]} ${isCorrect ? '✓' : '✗'}
            </div>
            ${!isCorrect ? `<div class="text-green-700">Correcta: ${q.options[q.correct]} ✓</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-5">
      Tu resultado ha sido registrado en el sistema de auditoría con timestamp exacto.
    </div>

    <div class="flex justify-end">
      <button onclick="Router.go('encuesta')" class="bg-gms-teal hover:bg-gms-tealDark text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
        Continuar → Encuesta de Satisfacción
      </button>
    </div>
  </div>`;

  return renderAlumnoLayout('examen', content, 'Resultado del Examen');
}
