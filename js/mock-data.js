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

const MOCK_COURSE = {
  id: 'c001',
  title: 'Operaciones Portuarias Básicas — APN',
  subtitle: 'Certificación de Operadores | Autorizado por APN',
  description: 'Curso oficial de operaciones portuarias básicas, con enfoque en normativa APN, manejo seguro de cargas y procedimientos de embarque y desembarque.',
  instructor: 'Ing. Jorge Huamán Quispe',
  duration: '8 horas',
  date: '25 de Abril, 2026',
  zoom_url: 'https://zoom.us/j/123456789',
  ppt_file: 'Operaciones_Portuarias_Basicas_v3.pptx',
  ppt_version: 'v3.0',
  certificate_code_prefix: 'GMS-APN-2026',
};

const MOCK_EXAM_QUESTIONS = [
  {
    id: 'q1',
    text: '¿Cuál es el organismo regulador de las operaciones portuarias en el Perú?',
    options: ['SUNAT', 'APN (Autoridad Portuaria Nacional)', 'MTC', 'INDECOPI'],
    correct: 1,
  },
  {
    id: 'q2',
    text: '¿Qué documento regula el Sistema Nacional de Puertos?',
    options: ['D.S. 024-2016-EM', 'Ley N° 27943 — Ley del Sistema Portuario Nacional', 'ISO 9001:2015', 'Ley SUNAFIL'],
    correct: 1,
  },
  {
    id: 'q3',
    text: '¿Qué equipo de protección personal es obligatorio en zonas de operación portuaria?',
    options: ['Solo chaleco reflectivo', 'Solo casco', 'Casco, chaleco reflectivo, botas de seguridad y guantes', 'Solo botas de seguridad'],
    correct: 2,
  },
  {
    id: 'q4',
    text: '¿Cuál es el procedimiento correcto ante una emergencia de derrame de MATPEL en muelle?',
    options: ['Ignorar y continuar operaciones', 'Activar plan de contingencia, aislar zona y notificar al supervisor', 'Esperar 30 minutos antes de actuar', 'Solo notificar por WhatsApp'],
    correct: 1,
  },
  {
    id: 'q5',
    text: '¿Qué significa la sigla PETAR?',
    options: ['Permiso Especial de Trabajo de Alto Riesgo', 'Plan de Evacuación Técnica de Área de Riesgo', 'Protocolo de Emergencia para Trabajos en Altura y Riesgo', 'Ninguna de las anteriores'],
    correct: 0,
  },
];

const MOCK_SURVEY_QUESTIONS = [
  { id: 's1', text: '¿Cómo calificarías el contenido del curso?', type: 'rating' },
  { id: 's2', text: '¿Cómo calificarías al instructor?', type: 'rating' },
  { id: 's3', text: '¿La plataforma fue fácil de usar?', type: 'rating' },
  { id: 's4', text: '¿Recomendarías este curso a un colega?', type: 'yesno' },
  { id: 's5', text: '¿Qué mejorarías del curso? (opcional)', type: 'text' },
];

// Historial de eventos mock para admin
const MOCK_AUDIT_EVENTS = {
  u002: [
    { event_type: 'LOGIN_SUCCESS',              timestamp: '2026-04-25T08:02:11', ip: '190.40.12.88',  metadata: { browser: 'Chrome 124', device: 'Desktop' } },
    { event_type: 'COURSE_ACCESSED',            timestamp: '2026-04-25T08:02:45', ip: '190.40.12.88',  metadata: { course_id: 'c001' } },
    { event_type: 'PPT_VIEWED',                 timestamp: '2026-04-25T08:05:20', ip: '190.40.12.88',  metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx' } },
    { event_type: 'PPT_DOWNLOADED',             timestamp: '2026-04-25T08:05:55', ip: '190.40.12.88',  metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx', version: 'v3.0' } },
    { event_type: 'ZOOM_BUTTON_CLICKED',        timestamp: '2026-04-25T09:01:03', ip: '190.40.12.88',  metadata: { zoom_url: 'https://zoom.us/j/123456789' } },
    { event_type: 'LIVE_CLASS_ACCESS_ATTEMPTED',timestamp: '2026-04-25T09:01:04', ip: '190.40.12.88',  metadata: {} },
    { event_type: 'EXAM_STARTED',               timestamp: '2026-04-25T13:05:10', ip: '190.40.12.88',  metadata: { attempt: 1 } },
    { event_type: 'EXAM_ANSWER_SAVED',          timestamp: '2026-04-25T13:08:44', ip: '190.40.12.88',  metadata: { question: 'q1', answer: 1 } },
    { event_type: 'EXAM_SUBMITTED',             timestamp: '2026-04-25T13:15:30', ip: '190.40.12.88',  metadata: {} },
    { event_type: 'EXAM_FINISHED',              timestamp: '2026-04-25T13:15:31', ip: '190.40.12.88',  metadata: { score: 80, total: 5, correct: 4 } },
    { event_type: 'EXAM_GRADED',                timestamp: '2026-04-25T13:15:32', ip: '190.40.12.88',  metadata: { score: 80, status: 'APROBADO' } },
    { event_type: 'SURVEY_STARTED',             timestamp: '2026-04-25T13:16:00', ip: '190.40.12.88',  metadata: {} },
    { event_type: 'SURVEY_SUBMITTED',           timestamp: '2026-04-25T13:19:22', ip: '190.40.12.88',  metadata: {} },
    { event_type: 'CERTIFICATE_ENABLED',        timestamp: '2026-04-25T13:19:23', ip: '190.40.12.88',  metadata: {} },
    { event_type: 'CERTIFICATE_GENERATED',      timestamp: '2026-04-25T13:20:05', ip: '190.40.12.88',  metadata: { cert_code: 'GMS-APN-2026-0042' } },
    { event_type: 'CERTIFICATE_DOWNLOADED',     timestamp: '2026-04-25T13:20:08', ip: '190.40.12.88',  metadata: { cert_code: 'GMS-APN-2026-0042' } },
  ],
  u003: [
    { event_type: 'LOGIN_SUCCESS',   timestamp: '2026-04-25T08:30:00', ip: '192.168.1.5',  metadata: { browser: 'Firefox 125', device: 'Laptop' } },
    { event_type: 'COURSE_ACCESSED', timestamp: '2026-04-25T08:31:10', ip: '192.168.1.5',  metadata: { course_id: 'c001' } },
    { event_type: 'PPT_VIEWED',      timestamp: '2026-04-25T08:32:00', ip: '192.168.1.5',  metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx' } },
    { event_type: 'PPT_DOWNLOADED',  timestamp: '2026-04-25T08:33:20', ip: '192.168.1.5',  metadata: { file: 'Operaciones_Portuarias_Basicas_v3.pptx', version: 'v3.0' } },
    { event_type: 'ZOOM_BUTTON_CLICKED', timestamp: '2026-04-25T09:00:45', ip: '192.168.1.5', metadata: {} },
  ],
};

// Métricas admin mock
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

// Progreso mock de todos los alumnos
const MOCK_STUDENT_PROGRESS = {
  u001: { step: 2, steps_done: ['login','ppt','zoom','exam','encuesta','certificado'], score: 100, cert_code: 'GMS-APN-2026-0041', completed: true },
  u002: { step: 6, steps_done: ['login','ppt','zoom','exam','encuesta','certificado'], score: 80,  cert_code: 'GMS-APN-2026-0042', completed: true },
  u003: { step: 3, steps_done: ['login','ppt','zoom'], score: null, cert_code: null, completed: false },
  u004: { step: 1, steps_done: ['login'], score: null, cert_code: null, completed: false },
};
