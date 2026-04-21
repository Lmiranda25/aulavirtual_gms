// =============================================
// state.js — Estado global de la aplicación
// =============================================

const AppState = (() => {
  const STORAGE_KEY = 'gms_app_state';

  const _defaults = {
    currentUser: null,
    sessionId: null,
    selectedCourse: null,
    progressByCourse: {},
    // Progreso del curso activo (se carga al seleccionar)
    currentStep: 0,
    stepsCompleted: [],
    examAnswers: {},
    examScore: null,
    examSubmitted: false,
    examStartTimestamp: null,
    surveyAnswers: {},
    surveySubmitted: false,
    certCode: null,
    certEnabled: false,
    _examStarted: false,
    _surveyStarted: false,
  };

  function _load() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ..._defaults, ...JSON.parse(saved) } : { ..._defaults };
    } catch { return { ..._defaults }; }
  }

  function _save(state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let _state = _load();

  function get() { return { ..._state }; }

  function set(partial) {
    _state = { ..._state, ...partial };
    _save(_state);
  }

  function reset() {
    _state = { ..._defaults };
    sessionStorage.removeItem(STORAGE_KEY);
    AuditLog.clear();
  }

  // ── Selección de curso con persistencia de progreso por curso ──
  const _COURSE_PROGRESS_KEYS = [
    'stepsCompleted','examAnswers','examScore','examSubmitted',
    'examStartTimestamp',
    'surveyAnswers','surveySubmitted','certCode','certEnabled',
    '_examStarted','_surveyStarted',
  ];

  function selectCourse(course) {
    // Guardar progreso del curso actual antes de cambiar
    if (_state.selectedCourse) {
      const prev = {};
      _COURSE_PROGRESS_KEYS.forEach(k => { prev[k] = _state[k]; });
      const byC = { ...(_state.progressByCourse || {}) };
      byC[_state.selectedCourse.id] = prev;
      _state = { ..._state, progressByCourse: byC };
    }
    // Cargar progreso guardado del nuevo curso (o defaults limpios)
    const byC = _state.progressByCourse || {};
    const saved = byC[course.id] || {};
    const fresh = {
      stepsCompleted: [], examAnswers: {}, examScore: null,
      examSubmitted: false, examStartTimestamp: null,
      surveyAnswers: {}, surveySubmitted: false,
      certCode: null, certEnabled: false, _examStarted: false, _surveyStarted: false,
    };
    _state = { ..._state, selectedCourse: course, ...fresh, ...saved };
    _save(_state);
  }

  // Paso completado: key es 'ppt', 'zoom', 'exam', 'encuesta', 'certificado'
  function completeStep(stepKey) {
    if (!_state.stepsCompleted.includes(stepKey)) {
      const done = [..._state.stepsCompleted, stepKey];
      set({ stepsCompleted: done });
    }
  }

  function isStepDone(stepKey) {
    return _state.stepsCompleted.includes(stepKey);
  }

  // Orden oficial de pasos (después del login)
  const STEP_ORDER = ['ppt', 'zoom', 'exam', 'encuesta', 'certificado'];

  // Determina si un paso está disponible (el anterior debe estar completado)
  function isStepAvailable(stepKey) {
    const idx = STEP_ORDER.indexOf(stepKey);
    if (idx === 0) return true; // ppt siempre disponible tras login
    const prev = STEP_ORDER[idx - 1];
    return isStepDone(prev);
  }

  return { get, set, reset, selectCourse, completeStep, isStepDone, isStepAvailable, STEP_ORDER };
})();
