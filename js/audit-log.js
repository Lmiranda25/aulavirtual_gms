// =============================================
// audit-log.js — Sistema de trazabilidad/auditoría
// =============================================

const AuditLog = (() => {
  const SESSION_KEY = 'gms_audit_log';

  function _getLog() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); }
    catch { return []; }
  }

  function _saveLog(log) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(log));
  }

  /**
   * Registra un evento de auditoría
   * @param {string} eventType - Tipo de evento (ej: LOGIN_SUCCESS)
   * @param {object} metadata  - Datos adicionales del evento
   */
  function record(eventType, metadata = {}) {
    const state = AppState.get();
    const entry = {
      event_id:   'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
      user_id:    state.currentUser?.id || 'anonymous',
      course_id:  MOCK_COURSE.id,
      event_type: eventType,
      timestamp:  new Date().toISOString(),
      session_id: state.sessionId || 'sess_unknown',
      ip:         '(simulado)',
      user_agent: navigator.userAgent.substring(0, 80),
      metadata,
    };

    const log = _getLog();
    log.push(entry);
    _saveLog(log);

    console.info(`[AUDIT] ${eventType}`, entry);
    return entry;
  }

  function getAll() { return _getLog(); }

  function getByUser(userId) {
    return _getLog().filter(e => e.user_id === userId);
  }

  function clear() { sessionStorage.removeItem(SESSION_KEY); }

  return { record, getAll, getByUser, clear };
})();
