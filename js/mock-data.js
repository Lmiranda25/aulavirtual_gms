// =============================================
// mock-data.js — Datos simulados GMS MVP
// =============================================

const MOCK_USERS = [
  { id: 'u001', name: 'Carlos Mendoza Torres', email: 'cmendoza@empresa.pe', role: 'alumno', password: 'gms2024', avatar: 'CM', empresa: 'Transportadora Callao SAC' },
  { id: 'u002', name: 'Ana Lucía Paredes',    email: 'aparedes@empresa.pe',  role: 'alumno', password: 'gms2024', avatar: 'AL', empresa: 'DP World Callao' },
  { id: 'u003', name: 'Roberto Silva Vega',   email: 'rsilva@empresa.pe',    role: 'alumno', password: 'gms2024', avatar: 'RS', empresa: 'Repsol Perú' },
  { id: 'u004', name: 'María Fernanda Cruz',  email: 'mcruz@empresa.pe',     role: 'alumno', password: 'gms2024', avatar: 'MF', empresa: 'Antamina S.A.' },
  { id: 'admin', name: 'Admin GMS',           email: 'admin@gmsconsulting.pe', role: 'admin', password: 'admin2024', avatar: 'AG', empresa: 'GMS Consulting' },
];

// ── Catálogo de cursos ────────────────────────
const MOCK_COURSES = [
  {
    id: 'c001',
    title: 'Operaciones Portuarias Básicas',
    subtitle: 'Certificación APN — Nivel Inicial',
    description: 'Formación en normativa APN, procedimientos de embarque, desembarque y manejo seguro de cargas en terminales portuarios del Perú.',
    instructor: 'Ing. Jorge Huamán Quispe',
    duration: '8 horas',
    date: '25 de Abril, 2026',
    zoom_url: 'https://zoom.us/j/123456789',
    ppt_file: 'Operaciones_Portuarias_Basicas_v3.pptx',
    ppt_version: 'v3.0',
    certificate_code_prefix: 'GMS-APN-2026',
    category: 'Portuario',
    categoryColor: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-800 to-blue-950',
    icon: '⚓',
    enrolled: 28,
  },
  {
    id: 'c002',
    title: 'Seguridad y Salud en el Trabajo',
    subtitle: 'SST — Normativa SUNAFIL / D.S. 005-2012',
    description: 'Implementación del Sistema de Gestión de SST, identificación de peligros, evaluación de riesgos (Matriz IPER) y cumplimiento normativo ante SUNAFIL.',
    instructor: 'Lic. Patricia Rojas Flores',
    duration: '16 horas',
    date: '05 de Mayo, 2026',
    zoom_url: 'https://zoom.us/j/987654321',
    ppt_file: 'SST_Normativa_SUNAFIL_v2.pptx',
    ppt_version: 'v2.0',
    certificate_code_prefix: 'GMS-SST-2026',
    category: 'Seguridad',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-700 to-emerald-950',
    icon: '🦺',
    enrolled: 35,
  },
  {
    id: 'c003',
    title: 'Manejo de Materiales Peligrosos',
    subtitle: 'MATPEL — Gestión de Residuos y Emergencias',
    description: 'Identificación, clasificación y manejo correcto de MATPEL según normas ONU. Planes de contingencia, respuesta a emergencias y uso de fichas SDS.',
    instructor: 'Ing. Carlos Vega Montes',
    duration: '12 horas',
    date: '12 de Mayo, 2026',
    zoom_url: 'https://zoom.us/j/456789123',
    ppt_file: 'MATPEL_Materiales_Peligrosos_v1.pptx',
    ppt_version: 'v1.0',
    certificate_code_prefix: 'GMS-MATPEL-2026',
    category: 'MATPEL',
    categoryColor: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-700 to-red-900',
    icon: '☢',
    enrolled: 22,
  },
  {
    id: 'c004',
    title: 'Trabajos de Alto Riesgo',
    subtitle: 'PETAR — Permiso Especial para Tareas Críticas',
    description: 'Trabajos en altura, espacios confinados, excavaciones y trabajos en caliente. Procedimientos PETAR, bloqueo/etiquetado (LOTO) y armado de andamios.',
    instructor: 'Ing. Marco Torres Silva',
    duration: '10 horas',
    date: '19 de Mayo, 2026',
    zoom_url: 'https://zoom.us/j/741852963',
    ppt_file: 'PETAR_Alto_Riesgo_v2.pptx',
    ppt_version: 'v2.0',
    certificate_code_prefix: 'GMS-PETAR-2026',
    category: 'Alto Riesgo',
    categoryColor: 'bg-red-100 text-red-700',
    gradient: 'from-red-800 to-slate-900',
    icon: '⚠️',
    enrolled: 18,
  },
];

// Helper: devuelve el curso actualmente seleccionado
function getCurrentCourse() {
  if (typeof AppState !== 'undefined') {
    const c = AppState.get().selectedCourse;
    if (c) return c;
  }
  return MOCK_COURSES[0];
}

// ── Preguntas de examen por curso ─────────────
const MOCK_EXAM_QUESTIONS_BY_COURSE = {
  c001: [
    {
      id: 'q1', text: '¿Cuál es el organismo regulador de las operaciones portuarias en el Perú?',
      options: ['SUNAT', 'APN (Autoridad Portuaria Nacional)', 'MTC', 'INDECOPI'], correct: 1,
    },
    {
      id: 'q2', text: '¿Qué documento regula el Sistema Nacional de Puertos?',
      options: ['D.S. 024-2016-EM', 'Ley N° 27943 — Ley del Sistema Portuario Nacional', 'ISO 9001:2015', 'Ley SUNAFIL'], correct: 1,
    },
    {
      id: 'q3', text: '¿Qué equipo de protección personal es obligatorio en zonas de operación portuaria?',
      options: ['Solo chaleco reflectivo', 'Solo casco', 'Casco, chaleco reflectivo, botas de seguridad y guantes', 'Solo botas de seguridad'], correct: 2,
    },
    {
      id: 'q4', text: '¿Cuál es el procedimiento correcto ante una emergencia de derrame de MATPEL en muelle?',
      options: ['Ignorar y continuar operaciones', 'Activar plan de contingencia, aislar zona y notificar al supervisor', 'Esperar 30 minutos antes de actuar', 'Solo notificar por WhatsApp'], correct: 1,
    },
    {
      id: 'q5', text: '¿Qué significa la sigla PETAR?',
      options: ['Permiso Especial de Trabajo de Alto Riesgo', 'Plan de Evacuación Técnica de Área de Riesgo', 'Protocolo de Emergencia para Trabajos en Altura y Riesgo', 'Ninguna de las anteriores'], correct: 0,
    },
  ],
  c002: [
    {
      id: 'q1', text: '¿Qué norma legal regula el Sistema de Gestión de SST en el Perú?',
      options: ['D.S. 024-2016-EM', 'Ley N° 29783 — Ley de Seguridad y Salud en el Trabajo', 'ISO 45001:2018', 'Ley N° 27943'], correct: 1,
    },
    {
      id: 'q2', text: '¿Qué es la Matriz IPER?',
      options: ['Una herramienta de control de calidad', 'Identificación de Peligros y Evaluación de Riesgos', 'Inspección Periódica de Equipos de Riesgo', 'Inventario de Procesos y Equipos Relevantes'], correct: 1,
    },
    {
      id: 'q3', text: '¿Cuál es la primera medida en la jerarquía de controles de riesgo?',
      options: ['Uso de EPP', 'Controles administrativos', 'Eliminación del peligro en origen', 'Sustitución del agente peligroso'], correct: 2,
    },
    {
      id: 'q4', text: '¿Cuántos trabajadores como mínimo requiere una empresa para conformar un Comité de SST?',
      options: ['5 trabajadores', '10 trabajadores', '20 trabajadores', '50 trabajadores'], correct: 2,
    },
    {
      id: 'q5', text: '¿Con qué frecuencia mínima debe realizarse el examen médico ocupacional según la Ley N° 29783?',
      options: ['Cada 6 meses', 'Anualmente', 'Cada 2 años', 'Solo al momento del ingreso'], correct: 1,
    },
  ],
  c003: [
    {
      id: 'q1', text: '¿Cuántas clases de materiales peligrosos existen según la clasificación de Naciones Unidas?',
      options: ['7 clases', '9 clases', '11 clases', '6 clases'], correct: 1,
    },
    {
      id: 'q2', text: '¿Qué información proporciona la Ficha de Datos de Seguridad (SDS/MSDS)?',
      options: ['Solo el precio del producto', 'Composición, riesgos, primeros auxilios, manejo y almacenamiento', 'Solo el método de disposición final', 'El número de registro de la empresa'], correct: 1,
    },
    {
      id: 'q3', text: '¿Cuál es el primer paso ante un derrame de material peligroso?',
      options: ['Limpiar inmediatamente con agua', 'Continuar la operación con cuidado', 'Evacuar y aislar la zona, activar el plan de contingencia', 'Notificar por WhatsApp al supervisor'], correct: 2,
    },
    {
      id: 'q4', text: '¿Qué color de etiqueta identifica a la Clase 3 (líquidos inflamables)?',
      options: ['Verde', 'Rojo', 'Naranja', 'Amarillo'], correct: 1,
    },
    {
      id: 'q5', text: '¿Qué EPP es obligatorio al manipular ácidos corrosivos?',
      options: ['Solo guantes de nitrilo', 'Lentes de seguridad únicamente', 'Guantes resistentes a químicos, lentes, delantal y botas', 'Solo mascarilla de media cara'], correct: 2,
    },
  ],
  c004: [
    {
      id: 'q1', text: '¿Qué significa la sigla PETAR?',
      options: ['Permiso Especial de Trabajo de Alto Riesgo', 'Plan de Evacuación para Trabajos en Área de Riesgo', 'Protocolo de Emergencia para Tareas de Alto Rendimiento', 'Programa de Entrenamiento en Trabajos de Alto Riesgo'], correct: 0,
    },
    {
      id: 'q2', text: '¿A qué altura mínima se exige el uso obligatorio de arnés de seguridad?',
      options: ['1.0 metro', '1.5 metros', '1.8 metros', '2.5 metros'], correct: 2,
    },
    {
      id: 'q3', text: '¿Cuántas personas como mínimo se requieren para un trabajo en espacio confinado?',
      options: ['1 persona (autorrescate)', '2 personas: un entrante y un vigía exterior', '3 personas siempre', '4 personas con supervisor'], correct: 1,
    },
    {
      id: 'q4', text: '¿En qué consiste el procedimiento LOTO (Lockout/Tagout)?',
      options: ['Un sistema de ventilación para espacios confinados', 'Un proceso de bloqueo y etiquetado para aislar energías peligrosas', 'Un tipo de extintor para trabajos en caliente', 'Un permiso para operar montacargas'], correct: 1,
    },
    {
      id: 'q5', text: '¿Quién es el responsable de autorizar y firmar el PETAR?',
      options: ['El mismo trabajador que ejecutará la tarea', 'El supervisor o jefe del área donde se realizará el trabajo', 'El proveedor de EPP de la empresa', 'El médico ocupacional de turno'], correct: 1,
    },
  ],
};

// Helper: devuelve las preguntas del curso activo
function getExamQuestions() {
  const course = getCurrentCourse();
  return MOCK_EXAM_QUESTIONS_BY_COURSE[course.id] || MOCK_EXAM_QUESTIONS_BY_COURSE['c001'];
}

// Preguntas de encuesta (comunes a todos los cursos)
const MOCK_SURVEY_QUESTIONS = [
  { id: 's1', text: '¿Cómo calificarías el contenido del curso?', type: 'rating' },
  { id: 's2', text: '¿Cómo calificarías al instructor?', type: 'rating' },
  { id: 's3', text: '¿La plataforma fue fácil de usar?', type: 'rating' },
  { id: 's4', text: '¿Recomendarías este curso a un colega?', type: 'yesno' },
  { id: 's5', text: '¿Qué mejorarías del curso? (opcional)', type: 'text' },
];

// Historial de eventos mock para admin (por alumno)
const MOCK_AUDIT_EVENTS = {
  u002: [
    { event_type: 'LOGIN_SUCCESS',               timestamp: '2026-04-25T08:02:11', ip: '190.40.12.88', metadata: { browser: 'Chrome 124', device: 'Desktop' } },
    { event_type: 'COURSE_ACCESSED',             timestamp: '2026-04-25T08:02:45', ip: '190.40.12.88', metadata: { course_id: 'c001' } },
    { event_type: 'PPT_VIEWED',                  timestamp: '2026-04-25T08:05:20', ip: '190.40.12.88', metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx' } },
    { event_type: 'PPT_DOWNLOADED',              timestamp: '2026-04-25T08:05:55', ip: '190.40.12.88', metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx', version: 'v3.0' } },
    { event_type: 'ZOOM_BUTTON_CLICKED',         timestamp: '2026-04-25T09:01:03', ip: '190.40.12.88', metadata: { zoom_url: 'https://zoom.us/j/123456789' } },
    { event_type: 'LIVE_CLASS_ACCESS_ATTEMPTED', timestamp: '2026-04-25T09:01:04', ip: '190.40.12.88', metadata: {} },
    { event_type: 'EXAM_STARTED',                timestamp: '2026-04-25T13:05:10', ip: '190.40.12.88', metadata: { attempt: 1 } },
    { event_type: 'EXAM_ANSWER_SAVED',           timestamp: '2026-04-25T13:08:44', ip: '190.40.12.88', metadata: { question: 'q1', answer: 1 } },
    { event_type: 'EXAM_SUBMITTED',              timestamp: '2026-04-25T13:15:30', ip: '190.40.12.88', metadata: {} },
    { event_type: 'EXAM_FINISHED',               timestamp: '2026-04-25T13:15:31', ip: '190.40.12.88', metadata: { score: 80, total: 5, correct: 4 } },
    { event_type: 'EXAM_GRADED',                 timestamp: '2026-04-25T13:15:32', ip: '190.40.12.88', metadata: { score: 80, status: 'APROBADO' } },
    { event_type: 'SURVEY_STARTED',              timestamp: '2026-04-25T13:16:00', ip: '190.40.12.88', metadata: {} },
    { event_type: 'SURVEY_SUBMITTED',            timestamp: '2026-04-25T13:19:22', ip: '190.40.12.88', metadata: {} },
    { event_type: 'CERTIFICATE_ENABLED',         timestamp: '2026-04-25T13:19:23', ip: '190.40.12.88', metadata: {} },
    { event_type: 'CERTIFICATE_GENERATED',       timestamp: '2026-04-25T13:20:05', ip: '190.40.12.88', metadata: { cert_code: 'GMS-APN-2026-0042' } },
    { event_type: 'CERTIFICATE_DOWNLOADED',      timestamp: '2026-04-25T13:20:08', ip: '190.40.12.88', metadata: { cert_code: 'GMS-APN-2026-0042' } },
  ],
  u003: [
    { event_type: 'LOGIN_SUCCESS',   timestamp: '2026-04-25T08:30:00', ip: '192.168.1.5', metadata: { browser: 'Firefox 125', device: 'Laptop' } },
    { event_type: 'COURSE_ACCESSED', timestamp: '2026-04-25T08:31:10', ip: '192.168.1.5', metadata: { course_id: 'c001' } },
    { event_type: 'PPT_VIEWED',      timestamp: '2026-04-25T08:32:00', ip: '192.168.1.5', metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx' } },
    { event_type: 'PPT_DOWNLOADED',  timestamp: '2026-04-25T08:33:20', ip: '192.168.1.5', metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx', version: 'v3.0' } },
    { event_type: 'ZOOM_BUTTON_CLICKED', timestamp: '2026-04-25T09:00:45', ip: '192.168.1.5', metadata: {} },
  ],
};

// Métricas admin
const MOCK_METRICS = {
  matriculados_mes: [18, 22, 15, 28, 31, 24],
  aprobados_mes:    [14, 19, 12, 25, 28, 21],
  examenes_mes:     [16, 20, 13, 26, 30, 23],
  encuestas_mes:    [15, 19, 12, 25, 28, 22],
  certificados_mes: [14, 19, 12, 24, 27, 21],
  meses: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
  totales: {
    matriculados: 138,
    aprobados: 113,
    certificados: 112,
    tasa_aprobacion: 82,
    tasa_finalizacion: 87,
  }
};

// Progreso mock de alumnos (para vistas admin)
const MOCK_STUDENT_PROGRESS = {
  u001: { step: 6, steps_done: ['login','ppt','zoom','exam','encuesta','certificado'], score: 100, cert_code: 'GMS-APN-2026-0041', completed: true },
  u002: { step: 6, steps_done: ['login','ppt','zoom','exam','encuesta','certificado'], score: 80,  cert_code: 'GMS-APN-2026-0042', completed: true },
  u003: { step: 3, steps_done: ['login','ppt','zoom'], score: null, cert_code: null, completed: false },
  u004: { step: 1, steps_done: ['login'], score: null, cert_code: null, completed: false },
};
