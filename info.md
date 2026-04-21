# Aula Virtual GMS — Especificación Funcional MVP

## 1. Objetivo del MVP

Construir una **aula virtual web** para GMS orientada a cursos en vivo, con foco principal en:

- **trazabilidad total de acciones del alumno**
- **flujo secuencial y bloqueante**
- **auditoría completa para APN**
- **experiencia visual moderna tipo Platzi/Udemy**
- **panel administrativo simple con métricas clave**

El MVP no busca ser un LMS complejo ni una biblioteca de contenido.  
Debe resolver de forma sólida y auditable el flujo operativo actual de GMS.

---

## 2. Principios del producto

1. **Auditoría primero**
   - Cada acción importante del alumno debe quedar registrada.
   - No puede haber pasos “invisibles” o sin evidencia.

2. **Flujo rígido**
   - El alumno no avanza libremente.
   - Debe cumplir el orden definido por negocio.

3. **UX moderna**
   - La plataforma debe sentirse profesional, clara e interactiva.
   - Debe parecer un producto educativo moderno, no una intranet antigua.

4. **Bloqueos reales**
   - Las restricciones no deben depender solo del frontend.
   - Deben existir también a nivel lógico/funcional.

5. **MVP serio**
   - Aunque sea una primera versión, debe estar bien estructurada.
   - No se deben usar soluciones externas para examen ni encuesta.

---

## 3. Flujo oficial del alumno (orden estricto)

El flujo del alumno debe respetar exactamente esta secuencia:

1. **Login y entrada al curso**
2. **Descarga de PPT del curso**
3. **Ingreso a clase en vivo vía botón Zoom**
4. **Examen dentro de la plataforma**
5. **Encuesta de satisfacción obligatoria**
6. **Descarga automática del certificado**

### Regla general de flujo
Cada etapa debe tener estado visible:

- `Pendiente`
- `Disponible`
- `En proceso`
- `Completado`
- `Bloqueado`

### Regla de navegación
El alumno **no debe poder saltarse pasos**.

Ejemplo:
- No puede descargar certificado si no completó encuesta.
- No puede ir al siguiente paso si el anterior no cumple la condición requerida.

---

## 4. Funcionalidades del MVP

## 4.1. Login y acceso del alumno

### Funcionalidad
- Pantalla de inicio de sesión.
- Acceso al curso asignado o seleccionado.
- Vista principal del curso luego de autenticarse.

### Reglas
- Todo ingreso debe registrar evento.
- Debe quedar trazabilidad del acceso al curso.
- El sistema debe mostrar el progreso del alumno dentro del flujo.

### Eventos mínimos a registrar
- `LOGIN_SUCCESS`
- `COURSE_ACCESSED`

---

## 4.2. Descarga de PPT del curso

### Funcionalidad
- El alumno puede descargar directamente la PPT desde la plataforma.
- El archivo debe estar asociado al curso correspondiente.

### Reglas
- La descarga debe quedar registrada con timestamp exacto.
- Debe guardarse evidencia de qué archivo descargó.
- Puede mostrarse el botón como primer paso operativo del curso.

### Eventos mínimos a registrar
- `PPT_VIEWED`
- `PPT_DOWNLOADED`

### Datos recomendados del log
- usuario
- curso
- archivo
- versión del archivo
- fecha y hora exacta
- IP
- navegador / dispositivo

---

## 4.3. Botón de ingreso a Zoom

### Funcionalidad
- Botón visible dentro de la plataforma para ingresar a la clase en vivo.
- No habrá videos grabados en este MVP.

### Reglas
- El sistema debe registrar cuándo el alumno hizo clic en el botón de Zoom.
- Para MVP, se registra **el acceso al enlace**, no necesariamente la asistencia efectiva dentro de Zoom.
- El acceso debe mostrarse como parte del flujo del curso.

### Eventos mínimos a registrar
- `ZOOM_BUTTON_CLICKED`
- `LIVE_CLASS_ACCESS_ATTEMPTED`

### Nota funcional
En esta versión MVP, la evidencia principal será el **clic de acceso desde la plataforma**.

---

## 4.4. Examen dentro de la plataforma

### Funcionalidad
- El examen debe rendirse **dentro de la plataforma**.
- No se debe usar Typeform, Google Forms ni enlaces externos.
- El examen puede abrirse en una vista o módulo interno dedicado.

### Reglas
- El alumno solo puede rendir el examen dentro del flujo.
- Debe registrarse:
  - inicio del examen
  - guardado de respuestas
  - envío final
  - finalización
  - resultado o score si aplica
- El examen debe quedar vinculado al alumno y al curso.
- El envío final debe bloquear cambios posteriores si así se define para el MVP.

### Eventos mínimos a registrar
- `EXAM_STARTED`
- `EXAM_ANSWER_SAVED`
- `EXAM_SUBMITTED`
- `EXAM_FINISHED`
- `EXAM_GRADED`

### Datos recomendados del log
- intento
- puntaje
- duración
- fecha de inicio
- fecha de fin
- total de preguntas
- respuestas guardadas
- estado final

---

## 4.5. Encuesta de satisfacción obligatoria

### Funcionalidad
- Al finalizar el examen, el sistema debe mostrar automáticamente la encuesta.
- La encuesta debe rendirse dentro de la misma plataforma.

### Reglas
- Es **obligatoria**.
- Si el alumno no la completa, **no puede pasar al certificado**.
- El sistema no debe permitir descargar el certificado sin este paso.
- El bloqueo debe ser funcional, no solo visual.

### Eventos mínimos a registrar
- `SURVEY_STARTED`
- `SURVEY_SUBMITTED`

### Regla crítica
`Si encuesta != completada → certificado bloqueado`

---

## 4.6. Certificado automático en PDF

### Funcionalidad
- Al completar la encuesta, el sistema habilita la descarga del certificado.
- El certificado debe descargarse en PDF.

### Reglas
- El certificado solo se habilita al completar el flujo requerido.
- La generación y descarga del certificado deben quedar auditadas.
- El sistema debe registrar quién lo generó, cuándo y para qué curso.

### Eventos mínimos a registrar
- `CERTIFICATE_ENABLED`
- `CERTIFICATE_GENERATED`
- `CERTIFICATE_DOWNLOADED`

### Recomendación MVP
El certificado debe incluir:
- nombre del alumno
- nombre del curso
- fecha
- código único o correlativo de certificado

---

## 5. Core técnico de trazabilidad (requisito crítico)

La plataforma debe tener un sistema de **logs exhaustivo** para auditoría.

## 5.1. Regla principal
Cada clic o acción relevante del alumno debe guardar **timestamp exacto**.

Ejemplos mínimos:
- cuándo ingresó al curso
- cuándo descargó la PPT
- cuándo hizo clic en Zoom
- cuándo inició el examen
- cuándo terminó el examen
- cuándo respondió la encuesta
- cuándo descargó el certificado

## 5.2. Estructura esperada del log
Cada evento debería registrar, como mínimo:

- `event_id`
- `user_id`
- `course_id`
- `event_type`
- `timestamp`
- `session_id`
- `ip`
- `user_agent`
- `metadata`

## 5.3. Reglas del log
- Los logs deben ser persistentes.
- No deben perderse por refresh o navegación.
- Deben poder consultarse en admin.
- Deben servir como evidencia ante auditoría APN.

## 5.4. Eventos mínimos del sistema
- `LOGIN_SUCCESS`
- `COURSE_ACCESSED`
- `PPT_VIEWED`
- `PPT_DOWNLOADED`
- `ZOOM_BUTTON_CLICKED`
- `LIVE_CLASS_ACCESS_ATTEMPTED`
- `EXAM_STARTED`
- `EXAM_ANSWER_SAVED`
- `EXAM_SUBMITTED`
- `EXAM_FINISHED`
- `EXAM_GRADED`
- `SURVEY_STARTED`
- `SURVEY_SUBMITTED`
- `CERTIFICATE_ENABLED`
- `CERTIFICATE_GENERATED`
- `CERTIFICATE_DOWNLOADED`

---

## 6. Panel Administrativo (MVP)

El admin debe tener un dashboard simple, claro y útil.

## 6.1. Métricas obligatorias
- **matriculados por mes**
- **aprobados por mes**

## 6.2. Métricas recomendadas para enriquecer el MVP
- exámenes rendidos por mes
- encuestas completadas por mes
- certificados emitidos por mes
- tasa de aprobación
- tasa de finalización

## 6.3. Vistas mínimas del admin
- dashboard general
- listado de alumnos
- detalle por alumno
- historial de eventos / trazabilidad

## 6.4. Vista de detalle por alumno
Debe mostrar idealmente un timeline como:

- ingreso al curso
- descarga de PPT
- clic en Zoom
- inicio de examen
- fin de examen
- envío de encuesta
- generación de certificado
- descarga de certificado

Esto permite responder rápido ante auditorías.

---

## 7. Reglas funcionales del flujo

## 7.1. Reglas de secuencia
- No se permite avanzar sin cumplir el orden.
- El sistema debe habilitar y bloquear pasos según estado.

## 7.2. Reglas de encuesta
- La encuesta es obligatoria.
- Sin encuesta completada, no hay certificado.

## 7.3. Reglas de certificado
- El certificado solo aparece al final del flujo permitido.
- La descarga debe registrarse sí o sí.

## 7.4. Reglas de examen
- Debe estar dentro de plataforma.
- No se permiten soluciones externas.
- El examen debe generar trazabilidad completa.

## 7.5. Reglas de visibilidad
El alumno siempre debe ver:
- en qué paso está
- qué completó
- qué tiene bloqueado
- qué le falta para finalizar

---

## 8. Diseño e interfaz (estilo Platzi/Udemy con branding GMS)

## 8.1. Objetivo visual
La interfaz debe sentirse como una **plataforma educativa moderna**, inspirada en experiencias tipo **Platzi/Udemy**, pero aplicada al branding de GMS.

Debe transmitir:
- profesionalismo
- claridad
- confianza
- orden
- avance guiado
- sensación de producto serio y corporativo

## 8.2. Referencia de branding GMS
La web institucional de GMS comunica una identidad centrada en:
- consultoría
- cumplimiento normativo
- formación técnica
- operaciones, minería, puertos y seguridad
- una imagen corporativa sobria y profesional :contentReference[oaicite:0]{index=0}

Además, el sitio usa una identidad visual con logo corporativo, navegación limpia, secciones de servicios, cursos y acceso directo al Aula Virtual, lo que refuerza un estilo de marca técnico-corporativo y orientado a capacitación. :contentReference[oaicite:1]{index=1}

## 8.3. Línea visual recomendada
Usar una estética:
- moderna
- limpia
- corporativa
- con cards bien definidas
- espaciado generoso
- iconografía clara
- sensación de dashboard educativo

## 8.4. Paleta visual
Tomar como base el branding visual actual de GMS y aterrizarlo a una interfaz LMS con:

- **azul corporativo oscuro** como color principal
- **verde/teal** como color de acento o confirmación
- **blanco y grises muy suaves** como fondo base
- contrastes limpios y profesionales
- evitar colores chillones o demasiado juveniles

## 8.5. Componentes visuales recomendados
- sidebar izquierda
- topbar superior
- cards de progreso
- stepper visual del curso
- badges de estado
- botones grandes y claros
- timeline de avance
- tablas limpias en admin
- paneles con bordes suaves y sombra ligera
- experiencia responsive

## 8.6. Estilo del alumno
La vista del alumno debe incluir:
- título del curso
- progreso general
- pasos del flujo visibles
- estado actual
- botones de acción claros
- feedback visual inmediato al completar cada etapa

## 8.7. Estilo del admin
La vista admin debe incluir:
- tarjetas KPI arriba
- métricas mensuales
- tabla de alumnos
- detalle de auditoría
- timeline de eventos por usuario

## 8.8. Sensación general deseada
La plataforma no debe verse:
- improvisada
- rígida
- vieja
- burocrática

Debe verse:
- interactiva
- elegante
- moderna
- robusta
- orientada a formación profesional

---

## 9. Pantallas mínimas del MVP

## Alumno
1. Login
2. Selección / entrada al curso
3. Vista principal del curso
4. Descarga de PPT
5. Acceso a Zoom
6. Examen dentro de plataforma
7. Encuesta obligatoria
8. Descarga de certificado
9. Resumen de progreso

## Admin
1. Login admin
2. Dashboard de métricas
3. Lista de alumnos
4. Vista detalle de alumno
5. Historial auditable de eventos

---

## 10. Resultado esperado del MVP

El MVP debe permitir que GMS tenga un aula virtual que:

- siga un flujo controlado
- registre toda la trazabilidad relevante
- cumpla con la necesidad de auditoría APN
- tenga una experiencia visual moderna
- muestre métricas básicas de gestión
- sirva como base sólida para crecer luego a versiones más completas

---

## 11. Resumen ejecutivo

Este MVP no debe pensarse como “solo una web de cursos”.  
Debe pensarse como una **plataforma de formación con control de flujo y evidencia auditable**.

Su valor principal está en combinar:

- experiencia moderna tipo LMS
- branding corporativo GMS
- bloqueos funcionales
- trazabilidad total
- visibilidad operativa para administración