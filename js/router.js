// =============================================
// router.js — Enrutador simple SPA
// =============================================

const Router = (() => {
  let _currentView  = null;
  let _currentParam = null;

  /**
   * Navega a una vista.
   * @param {string} view  - Nombre de la vista
   * @param {string} param - Parámetro opcional (ej: userId)
   */
  function go(view, param = null) {
    _currentView  = view;
    _currentParam = param;
    _render();
  }

  function _render() {
    const app   = document.getElementById('app');
    const state = AppState.get();

    // Rutas de acceso
    const publicRoutes  = ['login', 'admin-login'];
    const alumnoRoutes  = ['course-selection', 'dashboard-alumno', 'ppt', 'zoom', 'examen', 'encuesta', 'certificado'];
    const adminRoutes   = ['admin-dashboard', 'admin-alumnos', 'admin-detalle'];

    const view = _currentView || 'login';

    // Logout
    if (view === 'logout') {
      AppState.reset();
      app.innerHTML = renderLogin();
      return;
    }

    // Guard: alumno rutas requieren sesión de alumno
    if (alumnoRoutes.includes(view)) {
      if (!state.currentUser || state.currentUser.role !== 'alumno') {
        app.innerHTML = renderLogin();
        return;
      }
    }

    // Guard: admin rutas requieren sesión de admin
    if (adminRoutes.includes(view)) {
      if (!state.currentUser || state.currentUser.role !== 'admin') {
        app.innerHTML = renderAdminLogin();
        return;
      }
    }

    let html = '';
    switch (view) {
      case 'login':            html = renderLogin();                         break;
      case 'admin-login':      html = renderAdminLogin();                   break;
      case 'course-selection': html = renderCourseSelection();              break;
      case 'dashboard-alumno': html = renderDashboardAlumno();              break;
      case 'ppt':              html = renderPPT();                          break;
      case 'zoom':             html = renderZoom();                         break;
      case 'examen':           html = renderExamen();                       break;
      case 'encuesta':         html = renderEncuesta();                     break;
      case 'certificado':      html = renderCertificado();                  break;
      case 'admin-dashboard':  html = renderAdminDashboard();               break;
      case 'admin-alumnos':    html = renderAdminAlumnos();                 break;
      case 'admin-detalle':    html = renderAdminDetalle(_currentParam);    break;
      default:                 html = renderLogin();
    }

    app.innerHTML = html;
    window.scrollTo(0, 0);
    if (typeof window._viewPostRender === 'function') {
      const fn = window._viewPostRender; window._viewPostRender = null;
      setTimeout(fn, 50);
    }
  }

  function init() {
    const state = AppState.get();
    if (state.currentUser?.role === 'admin') {
      go('admin-dashboard');
    } else if (state.currentUser?.role === 'alumno') {
      go('course-selection');
    } else {
      go('login');
    }
  }

  return { go, init };
})();
