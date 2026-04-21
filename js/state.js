// =============================================
// state.js — Estado global de la aplicación
// =============================================

const AppState = (() => {
  const STORAGE_KEY = 'gms_app_state';

  const _defaults = {
    currentUser: null,
    sessionId: null,
    // Flujo del alumno: índice del paso actual (0-based)
    // 0=login 1=ppt 2=zoom 3=exam 4=encuesta 5=certificado
    currentStep: 0,
    stepsCompleted: [],   // array de step keys completados
    examAnswers: {},
    examScore: null,
    examSubmitted: false,
    surveyAnswers: {},
    surveySubmitted: false,
    certCode: null,
    certEnabled: false,
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

  return { get, set, reset, completeStep, isStepDone, isStepAvailable, STEP_ORDER };
})();
