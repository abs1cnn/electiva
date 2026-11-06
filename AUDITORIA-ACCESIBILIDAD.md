# Auditoría de accesibilidad y usabilidad — Portal de capacitación SGE (Libreta Digital)

Estándar de referencia: **WCAG 2.1, nivel AA** (informe técnico-pedagógico, sección 5.2). Fecha de la auditoría: 6 de noviembre de 2026. Versión auditada: portal estático con las fases 1 a 6 del plan.

> **Alcance y honestidad del informe.** Esta auditoría combina herramientas automáticas y comprobaciones programáticas. **No incluye pruebas con lectores de pantalla reales (NVDA, JAWS, VoiceOver, TalkBack) ni con personas usuarias.** Esas pruebas están listadas al final como pendientes: sin ellas no se puede afirmar conformidad con WCAG 2.1 AA, solo que no se encontraron fallas con los métodos usados.

## 1. Método

| # | Prueba | Cómo se hizo |
|---|---|---|
| 1 | Reglas automáticas | axe-core 4.9.1 con las etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `best-practice`, cargado en el navegador del panel de Claude Code. |
| 2 | Contraste de texto | Script propio: para cada texto visible calcula el contraste entre el color del texto y el fondo efectivo (mezclando transparencias) y lo compara con 4,5:1 (3:1 en texto grande). |
| 3 | Foco visible | Se enfocó cada control de cada pantalla y se leyó el estilo calculado (contorno o sombra, o el del `label` que lo contiene). |
| 4 | Teclado real | Teclas reales (`Tab`, `Enter`) en el navegador para el enlace de salto; teclas simuladas (`ArrowLeft`, `ArrowRight`) para las pestañas. |
| 5 | Texto ampliado | Control del portal al 150 % y comprobación de que no hay desborde horizontal ni solapamientos. |
| 6 | Espaciado de texto (1.4.12) | Se inyectó interlineado 1,5, espaciado entre letras 0,12 em, entre palabras 0,16 em y entre párrafos 2 em, y se buscó desborde y recorte. |
| 7 | Reflujo (1.4.10) | Ancho de ventana de 309 px a 524 px, sin scroll horizontal de la página. |
| 8 | Revisión de contenido | Búsqueda de masculino genérico y de adjetivos con género en textos, preguntas y mensajes. |

**Pantallas y estados auditados con axe (todos sin infracciones al final):** inicio con y sin diagnóstico hecho; diagnóstico (partes, error de validación y resultado); portafolio vacío y con datos; las tres rutas; módulos con lección, recursos y chequeo (pregunta, respuesta incorrecta con explicación); evaluación final (introducción, pregunta, resultado con mini-lecciones); práctica de Docencia, Preceptoría y Directivo en todas sus pestañas, con datos cargados; panel de ayuda abierto; visor de PDF abierto; recursos; podcasts con transcripciones abiertas; videos; preguntas frecuentes; y las vistas principales con el texto al 150 %.

## 2. Resultados

### Hallazgos encontrados y corregidos durante la auditoría

| Hallazgo | Criterio WCAG | Corrección |
|---|---|---|
| Tablas anchas con desplazamiento horizontal sin acceso por teclado (regla `scrollable-region-focusable`, impacto serio, en 5 pantallas) | 2.1.1 Teclado | Cuando una tabla desborda, recibe `tabindex="0"`, `role="region"` y un nombre que dice que se desplaza de costado. Se actualiza al cambiar el contenido y el tamaño de la ventana (`js/a11y.js`). |
| El enlace "Ir al contenido principal" cambiaba la dirección a `#main-content`, que el portal interpretaba como una sección desconocida y volvía al inicio desde cualquier pantalla | 2.4.1 Saltar bloques, 3.2.2 | El enlace mueve el foco a `<main tabindex="-1">` sin tocar la dirección; el router ignora ese valor. Comprobado con teclas reales. |
| El desplazamiento programático animado ignoraba la preferencia "reducir movimiento" | 2.3.3 (AAA) y buena práctica | Todas las animaciones de desplazamiento pasan por `smoothBehavior()`, que respeta `prefers-reduced-motion`. |
| Texto de botones deshabilitados con contraste justo (4,49:1) | 1.4.3 (los controles deshabilitados están exentos) | Se oscureció igual, para que no quede en el límite. |
| Género gramatical: "un estudiante", "el estudiante", "los estudiantes", "todos presentes", "cuando te sientas listo", "Eximido" | Informe 5.1 y RA 3 | 55 reemplazos por "una persona estudiante", "las y los estudiantes", "presente por defecto", "cuando quieras", "con eximición", y concordancia de participios. |

### Hallazgos de fases anteriores que ya estaban resueltos (Fase 1)

Texto de 7 a 11 px (ahora todo en `rem`, mínimo 14 px); anillo de foco con contraste insuficiente (ahora 5:1 sobre blanco, blanco sobre fondos oscuros); grises de texto bajo 4,5:1; decoración animada del hero; íconos como caracteres sueltos (ahora SVG con `aria-hidden`); etiquetas en mayúsculas y números decorativos; objetivos táctiles menores a 40 px.

### Cumplimiento por principio

| Principio | Criterios revisados | Resultado |
|---|---|---|
| **Perceptible** | 1.1.1 contenido no textual; 1.3.1 información y relaciones; 1.3.2 secuencia con sentido; 1.3.5 propósito de los campos; 1.4.1 uso del color; 1.4.3 contraste mínimo; 1.4.4 cambio de tamaño del texto; 1.4.10 reflujo; 1.4.11 contraste no textual; 1.4.12 espaciado del texto | **Sin fallas halladas.** No hay imágenes (los íconos son decorativos y están ocultos a lectores de pantalla). Los estados nunca dependen solo del color: llevan texto ("Respuesta correcta", "Tu respuesta", "menor a 6", "Completado"). Contraste de texto: 0 fallas en 14 pantallas y estados. |
| **Perceptible: medios** | 1.2.1 audio grabado; 1.2.2 subtítulos; 1.2.3 audiodescripción | **Incumplido hasta que se carguen las transcripciones.** Los podcasts tienen el mecanismo de transcripción listo (ver sección 3) pero el texto de los 4 episodios no está cargado. El único video quedó fuera del recorrido y la sección de videos dice "Próximamente"; cuando haya videos hará falta subtitulado sincronizado. |
| **Operable** | 2.1.1 teclado; 2.1.2 sin trampas de teclado; 2.4.1 saltar bloques; 2.4.2 título de página; 2.4.3 orden del foco; 2.4.4 propósito de los enlaces; 2.4.6 encabezados y etiquetas; 2.4.7 foco visible; 2.5.3 etiqueta en el nombre; 2.5.5 tamaño del objetivo | **Sin fallas halladas.** Todos los controles se alcanzan por teclado; las pestañas usan el patrón de flechas con tabulación única; los diálogos son nativos (el foco queda dentro y `Esc` los cierra); el panel de ayuda cierra con `Esc` y devuelve el foco; al cambiar de sección el foco pasa al título y cambia el título de la pestaña. 0 controles sin foco visible (el campo de búsqueda muestra el foco en su contenedor). Objetivos de 40 px o más. |
| **Comprensible** | 3.1.1 idioma de la página; 3.1.2 idioma de las partes; 3.2.1 al recibir el foco; 3.2.2 al introducir datos; 3.3.1 identificación de errores; 3.3.2 etiquetas o instrucciones; 3.3.3 sugerencia ante errores | **Sin fallas halladas.** `lang="es"`. Cada campo tiene `label` o `legend`. El diagnóstico anuncia los errores con `role="alert"` y nombra las preguntas faltantes; los simuladores explican por qué rechazan una acción y qué hacer. Los chequeos devuelven la explicación y la fuente. |
| **Robusto** | 4.1.1 procesamiento; 4.1.2 nombre, función, valor; 4.1.3 mensajes de estado | **Sin fallas halladas por axe.** Regiones `aria-live` para tamaño de texto, narración, resultados de chequeos y mensajes de los simuladores. |

### Inclusión (informe 5.1 y 5.2)

- **Lenguaje sustantivo e inclusivo:** "comunidad docente", "equipo directivo", "personal de preceptoría", "personas estudiantes" en rutas, lecciones, preguntas, mensajes y constancia. Los ejemplos usan nombres ficticios equilibrados (tres femeninos y tres masculinos). Persisten en el portal los nombres de roles del propio manual en su cita ("directivo" cuando se explica qué incluye el término).
- **Neurodivergencia y atención:** sin banners animados ni decoración; contenido parcelado en tarjetas cortas; una pregunta por vez; sin límite de tiempo; sin penalización por reintentar.
- **Baja alfabetización digital y poca conexión:** diagnóstico que sugiere materiales descargables y formatos; botón de ayuda siempre visible; todo funciona sin servidor y sin instalar nada.
- **Lectura en voz alta:** el botón "Leer página" usa la voz del navegador; depende de que el dispositivo tenga una voz en español.

## 3. Lo que falta (decisiones y trabajo humano)

1. **Transcripciones de los 4 podcasts.** El portal ya muestra, bajo cada episodio y en los módulos, un bloque plegable "Transcripción del episodio". Hay que pegar el texto completo de cada uno en `content/transcripts.js`. Este informe no puede darse por cumplido en 1.2.1 hasta entonces. No se pueden generar desde el código: se necesitan los guiones del equipo.
2. **Subtítulos del video** (formato WebVTT, `<track kind="captions" srclang="es">`), recién cuando haya videos de nivel secundario. El video del repositorio es de nivel superior y está fuera del alcance decidido.
3. **Manual 018 (asistencias):** el PDF es una imagen, sin texto que pueda leer un lector de pantalla. El portal lo avisa en la tarjeta del documento y resume su contenido en las lecciones. Lo ideal es pedir al Ministerio una versión con texto o transcribirla.
4. **Pruebas con lectores de pantalla** (obligatorias para certificar, informe 5.2). Guion mínimo, por cada lector y navegador (NVDA con Firefox o Chrome, JAWS, VoiceOver con Safari, TalkBack con Chrome):
   - Navegar por encabezados y por regiones (`H`, `D` o rotor): ¿el orden tiene sentido?
   - Abrir el diagnóstico, completarlo con teclado y escuchar el error al dejar una pregunta vacía.
   - Hacer un chequeo: ¿se anuncian la respuesta correcta o incorrecta y la explicación?
   - Planilla de calificaciones: ¿se anuncia el estudiante y la nota de cada selector? ¿se anuncian los mensajes tras calcular o rechazar?
   - Abrir y cerrar el panel de ayuda y un diálogo de confirmación: ¿el foco entra y vuelve?
   - Usar "Leer página" y comparar con el lector del sistema.
5. **Pruebas de usabilidad con personas del público** (docentes, preceptoría y equipo directivo), idealmente con alguna persona usuaria de lector de pantalla, ampliador o solo teclado.
6. **Pruebas en dispositivos reales**: celular con TalkBack o VoiceOver, y con conexión lenta.

## 4. Cómo repetir la auditoría

- axe-core: abrir el portal, cargar `axe.min.js` desde cdnjs en la consola y ejecutar `axe.run()` en cada pantalla y estado listado.
- Contraste y foco: los scripts usados están descritos en la sección 1; son comprobaciones programáticas de unas 40 líneas.
- Detector de diseño del repositorio: `.claude/skills/impeccable/scripts/impeccable detect --json index.html styles.css`. Hoy informa 6 avisos de "relleno justo" en franjas de ancho completo, que son falsos positivos (el contenido tiene márgenes laterales de 18 a 24 px).
