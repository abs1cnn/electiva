# Plan de implementación — Portal de capacitación SGE (Libreta Digital)

Base: informe técnico-pedagógico del proyecto integrador (UTN-FRC, Comunicación Multimedial 2026), manuales 309 y 303 en `public/` y el portal actual (`index.html`, `app.js`, `styles.css`).

**Objetivo.** Que el personal de preceptoría, la comunidad docente y los equipos directivos aprendan a usar la Libreta Digital SGE con un recorrido didáctico, vean su progreso y cierren cada perfil con una evaluación final que afiance los conceptos y refuerce lo que quedó flojo (por ejemplo: *no se puede cerrar una etapa si hay estudiantes sin promedio calculado*).

---

## 1. Dónde estamos y qué falta

| Pauta del informe | Estado actual | Falta |
|---|---|---|
| Rutas por perfil (3 módulos c/u) | Existen, con texto breve | Lecciones reales, recursos embebidos por módulo, orden secuencial |
| Evaluación diagnóstica (§2.2, §6) | No existe | Cuestionario de entrada sin nota, 3 ejes, adapta la ruta |
| Evaluaciones formativas al final de cada unidad (§3.3) | No existe | Chequeo con retroalimentación inmediata |
| Progreso visible | Casilla manual "Marcar como completado" | Progreso ganado (chequeo + práctica), no autodeclarado |
| **Evaluación final por perfil** | No existe | Banco de preguntas por concepto, resultado por concepto, refuerzo |
| 3 simuladores (§4.2) | Existen, pero simplificados | Rehacerlos fieles al manual (etapas, 6 notas, estados, bloqueos) |
| Botón de ayuda permanente (§3.3) | Solo un enlace en el encabezado | Botón flotante en todas las pantallas |
| Subtítulos y transcripciones (§5.2) | No hay | `.vtt` para el video, transcripción de los 4 podcasts |
| Lenguaje no sexista (§5.1) | "Profesor/a", "Preceptor/a", "Directivo/a" | "Comunidad docente", "Personal de preceptoría", "Equipo directivo", "estudiantes" |
| Atención / TDAH: sin elementos distractores (§5.2) | Hero con órbitas y destellos decorativos | Quitar decoración animada, tarjetas parceladas |
| Portafolio digital (§6, §7) | No existe | Vista de avance + constancia imprimible |
| Texto legible (WCAG AA) | Hay fuentes de 9–11 px en `styles.css` | Base de 16 px mínimo, revisar contrastes |

Ya está bien resuelto y se conserva: tamaño de texto, narración, enlace de salto, `:focus-visible`, `prefers-reduced-motion`, vista previa de PDF, búsqueda, `localStorage` sin datos reales.

---

## 2. Reglas del dominio que sostienen la evaluación

Extraídas de los manuales del repositorio. La evaluación se construye **solo** sobre estas reglas; no se inventa normativa.

**Manual 309 · Registrar calificaciones (nivel secundario)**
- Las notas parciales se guardan solas. Hay seis columnas de notas por etapa (Etapa 1 y Etapa 2).
- Estados por estudiante y etapa: **Inicial, Parcial, Promedio, Resolución, Bloqueo, EXIM**. El directivo gestiona Resolución y Bloqueo; la comunidad docente, el resto.
- Calcular el promedio de la etapa es definitivo: bloquea la edición docente y habilita al equipo directivo a finalizar el IPE. Hasta que se finalice, el docente puede **eliminar el cálculo** y volver a editar. Con la etapa finalizada (candado) ya no.
- **No se puede finalizar una etapa si el estudiante está en Inicial o Parcial**; tiene que estar en Promedio.
- Promedios menores a 6 se ven en rojo. Estado final: Aprobado, Coloquio o, desde 4.º año con promedio general menor a 4, Complementario.
- Aprobar por resolución solo está disponible si **no hay** notas cargadas en esa etapa.
- La eximición la registra el equipo directivo, inhabilita al docente y **borra** las notas que se habían cargado.
- El acceso al curso y espacio curricular lo habilita el equipo directivo.

**Manual 303 · Finalizar IPE**
- Requisitos: notas registradas en **todos** los espacios curriculares del curso, e inasistencias registradas por personal autorizado o preceptoría.
- La grilla muestra inasistencias justificadas, injustificadas, llegadas tarde, retiros y total acumulado. Hay un campo Observación; al finalizar el IPE pasa a "Finalizado".
- Licencia CC BY-NC-SA 4.0 (Dirección de Sistemas y Modernización, Gobierno de Córdoba): se pueden alojar con atribución, sin uso comercial y compartiendo igual.

**Manual 018 · Gestionar asistencias** (8 págs., leído página por página porque el PDF es una imagen sin texto)
- El SGE permite al **Director del establecimiento** registrar la asistencia diaria; también puede hacerlo el **personal autorizado por él**. El manual no nombra a preceptoría; se interpreta como personal autorizado, a confirmar (ver §6).
- Se busca un **curso** y una **fecha**. La grilla muestra documento, sexo, apellido y nombre, con **cinco** opciones: *Presente, Ausente, Ausente justificado, Llegada tarde, Inasistencia no computable*.
- **Por defecto todos figuran "Presente"**: solo se marca a quienes tienen otra condición. Los totales de cada opción se actualizan solos al final de la grilla.
- Para guardar: *Registrar Asistencia* → *Confirmar* en el cuadro de diálogo → mensaje "La asistencia se registró correctamente".
- *Imprimir listado* descarga un PDF con el listado y los totales por condición.
- Aviso del manual: **lo que se guarda en "Gestionar Asistencias" no se muestra en el IPE.**
- Autoría: Dirección de Sistemas del Ministerio de Educación. **No declara licencia** en el PDF.

---

## 3. Recorrido didáctico de cada perfil

```
Diagnóstico (una vez, sin nota)
   └─> Ruta del perfil: Módulo 1 → 2 → 3
          cada módulo:  Lección  →  Recurso (podcast/video/PDF)  →  Chequeo  →  Práctica guiada
   └─> Evaluación final del perfil (se habilita al completar los 3 módulos)
          └─> Resultado por concepto → Refuerzo de lo flojo → Reintento
   └─> Portafolio / constancia
```

**Módulo completado = chequeo aprobado + tarea de práctica hecha.** Desaparece la casilla manual. Cada módulo tiene un estado visible: *Pendiente, En curso, Para reforzar, Completado*. La home y la ruta muestran la barra de avance y "Siguiente paso".

**Lecciones.** Tarjetas cortas (una idea por tarjeta, en voseo y lenguaje no sexista), con un ejemplo de caso y la referencia a la página del manual. Sin muros de texto.

### Evaluación final por perfil
- 10–12 preguntas, extraídas de un banco más grande, con **al menos una pregunta por concepto** de la ruta.
- Formatos: opción múltiple, verdadero/falso con justificación, **escenarios** ("Hay un estudiante en estado Parcial y querés finalizar la etapa 1: ¿qué pasa y por qué?") y ordenar pasos.
- Cada respuesta devuelve explicación inmediata + enlace al módulo/manual de origen.
- **Resultado por concepto**, no solo un porcentaje: barras "Afianzado / En proceso / A reforzar".
- **Refuerzo**: para cada concepto flojo, una mini-lección y un reintento con preguntas nuevas solo de esos conceptos. Intentos ilimitados; se guarda el mejor resultado y el historial.
- Tono formativo: "Aún en proceso", nunca "reprobado".
- Aprobación: **90 % y ningún concepto crítico en rojo** (decidido, ver §6). Con 10–12 preguntas esto deja casi sin margen de error; por eso el refuerzo y el reintento sin límite son parte central y no un extra.

### Conceptos clave por perfil (base del banco de preguntas)

| Comunidad docente | Personal de preceptoría | Equipo directivo |
|---|---|---|
| Autoguardado de parciales | Las inasistencias registradas son requisito para finalizar el IPE (303) | Requisitos para finalizar el IPE |
| Etapas, 6 notas, E1/E2/PG | Las 5 condiciones: Presente, Ausente, Ausente justificado, Llegada tarde, Inasistencia no computable | Solo se finaliza una etapa con estudiantes en "Promedio" |
| Calcular promedio bloquea la edición | Por defecto todos "Presente": se marca solo la excepción | Gestión de Resolución, Bloqueo y EXIM |
| Eliminar el cálculo antes del cierre | Elegir curso y fecha correctos antes de registrar | Habilitar accesos por rol |
| Estados Inicial → Bloqueo | Registrar → Confirmar → mensaje de confirmación; sin confirmar no se guarda | Eximición borra notas previas |
| Rojo menor a 6; Aprobado / Coloquio / Complementario | Imprimir listado: PDF con totales por condición | Observación y estado "Finalizado" |
| Resolución solo sin notas cargadas | Lo de "Gestionar Asistencias" no se muestra en el IPE (a confirmar, ver §6) | Interpretar métricas del tablero (informe §2.1; sin manual) |
| Calcular recién al terminar de cargar todo | Quién puede registrar: Director o personal autorizado | Autorizar a quién registra asistencia |

---

## 4. Arquitectura (sin framework, sin build)

Decisión confirmada: HTML/CSS/JS estático. Dos ajustes para que se pueda abrir con doble clic (`file://`) y alojar en cualquier hosting:

- **Scripts clásicos, no módulos ES, y datos en archivos `.js`** (no `fetch` de JSON): los módulos y `fetch` fallan en `file://`.
- Partir `app.js` (627 líneas) en archivos con un espacio de nombres `SGE`:

```
index.html
styles.css                    (se parte en base / componentes / vistas)
js/
  state.js        estado v2 + migración desde "sge-portal-demo-v1"
  router.js       hash routing (ya existe la lógica)
  a11y.js         texto, narración, foco, anuncios aria-live
  ui-progress.js  progreso, portafolio
  quiz.js         motor de preguntas (chequeos, diagnóstico, final)
  sim-grades.js   simulador de calificaciones (etapas/estados)
  sim-attendance.js
  sim-direction.js
content/
  roles.js        lecciones por módulo
  questions.js    banco de preguntas con etiqueta de concepto
  glossary.js
media/            .vtt, transcripciones
```

**Estado v2** (`localStorage`, sin datos reales): `diagnostic`, `modules[perfil][n] = {quiz, practice, status}`, `finalExam[perfil] = {attempts[], best, byConcept}`, más lo que ya guarda hoy. La migración conserva el avance existente. Todo envuelto en `try/catch` y con botón "Borrar mis datos".

**Simulador de calificaciones fiel al manual** (el aporte didáctico principal): 6 notas por etapa, botones *Calcular promedio / Eliminar cálculo*, estados Inicial/Parcial/Promedio/Resolución/Bloqueo/EXIM y el panel del directivo con *Finalizar etapa* que **rechaza la acción con el motivo** si hay un estudiante en Inicial o Parcial. Se aprende por consecuencia, no por texto. Los tres simuladores comparten una lista de tareas ("Lograste: cargar notas ✓, calcular promedio ✓, intentar cerrar con un estudiante sin notas ✓") que alimenta el progreso.

**Ayuda permanente**: botón flotante (con etiqueta de texto, no solo ícono) que abre un panel con FAQ, manuales y contacto, operable por teclado y que devuelve el foco al cerrarse.

---

## 5. Fases

| Fase | Contenido | Entregable / criterio de listo |
|---|---|---|
| **0. Decisiones y contenido** | Resolver los puntos de §6. Transcribir manual 018. Pedir al equipo guiones de podcasts y video. Definir umbrales. | Lista de conceptos y reglas validada; PRODUCT.md actualizado |
| **1. Fundaciones** | Estado v2 + migración, división de archivos, nombres inclusivos en rutas y textos, botón de ayuda, base tipográfica ≥ 16 px, retirar decoración animada del hero | El portal actual funciona igual sobre la nueva base; sin regresiones |
| **2. Módulos didácticos** | Lecciones en tarjetas, recursos embebidos por módulo (PDF, podcast, video), motor de chequeos con retroalimentación, estados de módulo | Cada perfil recorre 3 módulos con chequeo y avance real |
| **3. Simuladores fieles** | Rehacer los 3 simuladores (§4), exportación CSV, gráfico de ausentismo por división, estados de período abierto/cerrado/en revisión, permisos por rol | Todas las reglas de §2 se pueden provocar y rechazar en pantalla |
| **4. Diagnóstico y portafolio** | Cuestionario de entrada (3 ejes), recomendaciones de ruta según respuestas (por ej. ofrecer audio si hay baja conectividad), vista de portafolio | Se ve punto de partida, avance y logros en un solo lugar |
| **5. Evaluación final** | Banco por concepto, motor de examen, resultado por concepto, refuerzo y reintento, constancia imprimible | Un perfil completo puede rendir, ver sus conceptos flojos, reforzar y mejorar |
| **6. Accesibilidad e inclusión** | Subtítulos `.vtt`, transcripciones, auditoría de contraste (≥ 4.5:1), teclado de punta a punta, lector de pantalla, textos alternativos, `prefers-reduced-motion`, pruebas a 150 % de texto | Informe de auditoría WCAG 2.1 AA (evidencia del §7 del informe) |
| **7. QA y entrega** | Pruebas en celular y notebook, `file://` y hosting, revisión de lenguaje, despliegue, repositorio ordenado | Enlace funcional + código fuente + reporte final |

### Avance

**Fase 1 (fundaciones): hecha, pendiente de tu revisión.**
- `app.js` se dividió en `content/roles.js` y `js/{state,docs,a11y,workspaces,router,help,main}.js`. Quedaron como scripts clásicos que comparten el ámbito global (sin objeto `SGE`): es más simple y abre con doble clic. El orden de carga está en `index.html`.
- Estado v2 (`sge-portal-v2`) con migración desde `sge-portal-demo-v1` (que no se borra). Ya incluye los campos de diagnóstico, chequeos y evaluación final, vacíos hasta las fases 2–5.
- Nombres inclusivos en rutas, tarjetas, permisos y textos ("Comunidad docente", "Personal de preceptoría", "Equipo directivo").
- Botón de ayuda flotante en todas las pantallas (con panel, descarga de avance y borrado de datos con confirmación).
- Tipografía: todo en `rem`, mínimo 14 px, cuerpo 16 px; el control de texto escala la página entera. Fuentes del sistema (antes se pedían "DM Sans" y "Manrope" sin cargarlas).
- Se quitó la decoración del hero (tarjetas y órbitas con un estudiante inventado), las etiquetas en mayúsculas sobre los títulos y los números 01/02/03 decorativos. Los íconos son SVG propios.
- Contrastes y foco: grises de texto oscurecidos, anillo de foco naranja oscuro (antes 2,2:1), objetivos táctiles de al menos 40–44 px.
- Textos de manuales corregidos (decisión 1): se muestran con autoría y licencia donde exista. El instructivo de IPE pasó a la ruta del equipo directivo (es "Tutorial para directores").
- Videos: se quitó de la navegación y queda como "Próximamente" (decisión 2).
- Verificado en el navegador a 309 px y 1280 px, con texto al 100 % y al 150 %: sin errores de consola ni scroll horizontal. No se probó con lector de pantalla real.

**Fase 2 (módulos didácticos): hecha, pendiente de tu revisión.**
- Cada módulo es una página propia (`#profesor#modulo-1`) con tres pasos: Lección (tarjetas cortas, con "Para recordar"), Recursos (instructivo PDF y podcast, con vista previa y descarga) y Chequeo.
- Chequeo: 3 preguntas por módulo, una por vez, con respuesta y explicación inmediatas, fuente en el manual y reintento sin límite. Las opciones se mezclan en cada intento. Cada pregunta lleva `concept` (y `critical` si equivocarse sería grave); los conceptos fallados en el primer intento quedan guardados en `quiz.weak` para el refuerzo de la Fase 5.
- Progreso ganado: se quitó la casilla "Marcar como completado". Estados: *Pendiente*, *Para reforzar* (hubo intento sin acierto total) y *Completado* (algún intento con todas bien). La práctica con simulador se suma al criterio en la Fase 3, cuando los simuladores tengan tareas medibles. Los módulos no se bloquean: se sugiere el siguiente, pero se puede entrar a cualquiera.
- El avance marcado a mano en la versión anterior no se migra (no era mérito comprobado).
- **Contenido reestructurado para ajustarse a las fuentes.** Los módulos viejos hablaban de Materias Previas, DAA, tablero de control, actas y reapertura de períodos, y de ninguno de esos temas hay manual. Los 9 módulos nuevos usan solo lo que dicen los manuales 309, 303 y 018 (más el informe para CiDi). Quedan **sin material**: tablero de control, actas, apertura/cierre de períodos, Materias Previas y DAA. Si los queremos como módulos, necesitamos esos manuales.
- Verificado en el navegador: los 9 módulos y sus 27 preguntas cargan y se pueden completar, el estado se guarda y se refleja en la ruta y en el inicio, sin scroll horizontal a 309 px con texto al 100 % y al 150 %. No se probó con lector de pantalla.

**Fase 3 (simuladores fieles): hecha, pendiente de tu revisión.**
- Un solo **curso de práctica compartido** (4.º año · División A, 6 estudiantes ficticios, 3 espacios curriculares). Lo que hace el equipo directivo se ve en la planilla docente y al revés. Se eligió 4.º año para que aparezca el estado Complementario.
- **Planilla (manual 309):** 6 notas por etapa que se guardan solas y habilitan la siguiente, resaltado de las recién cargadas, Calcular promedio con confirmación, Eliminar cálculo, Borrar notas, etapa 2 bloqueada hasta calcular la 1, promedios menores a 6 en rojo (con texto, no solo color), estados Inicial/Parcial/Promedio/Resolución/Bloqueo/EXIM, PG y estado del espacio (Inscripto/Aprobado/Coloquio/Complementario) y descarga CSV.
- **Equipo directivo:** finalizar etapa (rechaza con el motivo y ejemplos si hay estudiantes en Inicial o Parcial), aprobar por resolución (rechaza si hay notas), eximición (avisa que borra las notas), cierre del IPE con los dos requisitos del manual 303.
- **Asistencia (manual 018):** cinco condiciones, todos Presente por defecto, totales en vivo, Registrar → Confirmar → mensaje, imprimir listado, historial y ausentismo por curso (cálculo propio, rotulado). No conecta la asistencia con el IPE.
- **Accesos:** deshabilitar el permiso docente o de preceptoría hace que ese perfil no encuentre el curso en su práctica.
- **La práctica cuenta para completar el módulo** (chequeo aprobado + todas las tareas). Estado nuevo: *Falta la práctica*. Cada ruta lista sus tareas y cada módulo muestra las suyas.
- Reglas sin respaldo en los manuales quedaron rotuladas: el estado del período (abierto / en revisión / cerrado) figura como "Solo ilustrativo", y un 6 exacto o la mezcla de resolución con promedio muestran "Consultar". Se quitaron los números inventados del tablero (384 estudiantes, 92 %): ahora se calcula con la práctica.
- Se quitaron los simuladores genéricos anteriores y el cuaderno de calificaciones simple (sus datos no se migran).
- Verificado en el navegador: carga de notas, cálculo y eliminación, rechazos del directivo, resolución, eximición, IPE, asistencia completa, permisos y estados de módulo; sin errores de consola ni scroll horizontal con texto al 100 % y 150 %. No se probó con lector de pantalla ni la impresión real (se simuló `window.print`).

**Fase 4 (diagnóstico y portafolio): hecha, pendiente de tu revisión.**
- **Diagnóstico de entrada** (`#diagnostico`): 4 partes, sin nota. Perfil y uso previo del SGE; los 3 ejes del informe (competencias digitales, dispositivos y conexión, dudas y expectativas). Se puede omitir o rehacer. Las preguntas están en `content/diagnostic.js`.
- **Sugerencias** por reglas simples (no califican): ruta del perfil, descargar materiales si la conexión es mala, podcasts y "Leer página" si prefiere escuchar, texto grande si le cuesta leer en pantalla, etc. El inicio marca la ruta recomendada con una etiqueta y muestra un aviso para quien aún no lo hizo.
- **Mi portafolio** (`#portafolio`, en el menú): punto de partida, avance por ruta (estado, mejor resultado y tareas de práctica por módulo), "Para repasar" (conceptos fallados en el primer intento, con enlace a la lección), historial de chequeos con fecha, e impresión del portafolio.
- **Mis datos:** descargar e **importar** el avance (valida el formato y pide confirmar antes de reemplazar; un archivo cualquiera no borra nada). Disponible en el portafolio y en el panel de ayuda.
- Pendiente a propósito: la constancia y la evaluación final (Fase 5).
- **Ojo con el informe (§2.2):** el informe describe la encuesta como formulario institucional con resultados para el equipo. Este diagnóstico guarda las respuestas **solo en el navegador de cada persona**: nadie las recibe. Si la cátedra necesita resultados agregados (para el RA 1), hace falta un formulario externo (por ejemplo un Google Form) o un servidor; el portal estático no puede juntarlas.
- Verificado en el navegador: cuestionario completo (validación, volver atrás, opción exclusiva), resultado, etiqueta de ruta, omitir, portafolio con datos, exportar/importar con archivo válido, JSON inválido y texto basura, e impresión simulada; sin errores de consola ni scroll horizontal al 100 % y 150 %. Sin lector de pantalla.

**Fase 5 (evaluación final): hecha, pendiente de tu revisión.**
- Cada ruta tiene su **evaluación final** (`#profesor#evaluacion`, etc.), enlazada desde la ruta, desde el último módulo y desde el portafolio. Banco en `content/exam.js`: **18 preguntas por perfil, 2 por cada uno de los 9 conceptos**, de tres tipos (opción múltiple, verdadero o falso y situación a resolver), todas con explicación y fuente en el manual.
- Una evaluación completa tiene **10 preguntas**: una por concepto más una segunda de un concepto crítico. Usa primero las preguntas que la persona no vio, así que cada intento es distinto mientras haya disponibles. Opciones mezcladas.
- **Aprobación (decisión 3):** 9 de 10 o más (90 %) y ningún concepto crítico con todas las respuestas mal. Conceptos críticos: Docencia, calcular bloquea y eximición; Preceptoría, confirmar el registro y requisitos del IPE; Directivo, finalizar solo con estudiantes en Promedio, eximición y requisitos del IPE.
- **Resultado por concepto** (Afianzado / En proceso / A reforzar), con mini-lección de cada punto flojo (el texto de la lección original) y enlace al módulo.
- **Refuerzo:** practica solo los conceptos no afianzados, 2 preguntas por concepto, sin penalización. No cuenta para aprobar: hay que rendir una evaluación completa.
- **Constancia imprimible**, con nombre opcional, cuando están aprobadas la evaluación y los 3 módulos. Lleva la leyenda de que es de práctica y no un certificado oficial.
- **Decisión que tomé yo:** la evaluación se puede rendir sin haber completado la ruta (con un aviso), pero la constancia exige las dos cosas. Si se prefiere bloquearla hasta completar los módulos, es un cambio chico.
- **No hecho:** el formato "ordenar los pasos" del plan original (requiere un control de arrastre accesible con teclado, que conviene hacer aparte).
- Portafolio: estado de la evaluación por ruta y conceptos flojos de la evaluación en "Para repasar".
- Verificado en el navegador: integridad del banco (conceptos, respuestas, ids), armado de 10 preguntas sin repetir ni omitir conceptos, intento reprobado con conceptos críticos en rojo, refuerzo de 6 preguntas, aprobación, 8 de 10 no aprueba, constancia con nombre, importación y exportación; sin errores de consola ni scroll horizontal al 100 % y 150 %. Sin lector de pantalla.

**Fase 6 (accesibilidad e inclusión): hecha en lo que se puede automatizar; faltan pruebas humanas y contenido.** Informe completo en [AUDITORIA-ACCESIBILIDAD.md](AUDITORIA-ACCESIBILIDAD.md).
- Auditoría con **axe-core 4.9.1** (WCAG 2.1 A y AA más buenas prácticas) sobre unas 40 pantallas y estados: 0 infracciones al final. Contraste de texto 0 fallas en 14 pantallas, 0 controles sin foco visible, sin desborde ni recorte con el espaciado de texto del criterio 1.4.12, y sin desborde con texto al 150 %.
- **Corregido:** tablas con scroll horizontal sin acceso por teclado; enlace de salto que rompía la navegación; desplazamiento animado que ignoraba "reducir movimiento"; contraste justo en botones deshabilitados.
- **Lenguaje inclusivo:** 55 reemplazos ("una persona estudiante", "las y los estudiantes") y concordancia de participios.
- **Mecanismo de transcripciones** de los 4 podcasts (`content/transcripts.js`, bloque plegable en cada episodio y en los módulos). **Los textos no están cargados.** Hace falta que el equipo los pegue.
- Aviso de accesibilidad en la tarjeta del manual 018, que es un PDF de imágenes.
- **Pendiente humano:** pruebas con NVDA, JAWS, VoiceOver y TalkBack (guion en el informe), pruebas con personas usuarias y subtítulos del video cuando haya videos de secundaria. Sin eso no se puede afirmar conformidad AA.

Orden sugerido para llegar a algo demostrable rápido: 0 → 1 → 2 con el perfil Docencia de punta a punta (módulos + simulador + evaluación final) y recién después replicar en Preceptoría y Directivo.

### Trazabilidad con la cátedra

| RA | Dónde se cumple |
|---|---|
| RA 1 Diagnóstico | Fase 4 (diagnóstica, 3 ejes) |
| RA 2 Arquitectura de interacción | Fases 1–2 (rutas, estados de módulo, navegación) |
| RA 3 Comunicación para públicos no técnicos | Fases 1–2 (lenguaje claro e inclusivo) |
| RA 4 Recursos multimediales | Fases 2–3 (podcast, video, simuladores) |
| RA 5 Accesibilidad | Fase 6 (informe WCAG 2.1) |

---

## 6. Decisiones

### Tomadas (2026-11-06)
1. **Manuales oficiales: se alojan con atribución.** Cada PDF muestra autoría (Dirección de Sistemas y Modernización, Ministerio de Educación, Gobierno de Córdoba) y, donde la declare, su licencia. Hay que reescribir los textos que hoy dicen "no aloja material oficial" (FAQ, Recursos, `PRODUCT.md`). **Matiz:** solo el 303 declara licencia (CC BY-NC-SA 4.0). El 018 no declara ninguna y en el 309 no encontré una. Para esos dos se aloja con atribución completa y se avisa en el informe que no hay licencia explícita; lo seguro es pedir autorización por el formulario de www.cba.gov.ar/gestion-estudiantes.
2. **Alcance: solo nivel secundario.** Reglas, preguntas y simuladores se basan en los manuales 309 y 303. El video 408 (nivel superior) sale del recorrido. Consecuencia: la sección Videos queda sin contenido hasta que haya un video de secundario; mientras tanto se oculta o se marca "Próximamente" (el archivo se conserva en `public/`).
3. **Aprobación de la evaluación final: 90 % y ningún concepto crítico en rojo.** Cada pregunta del banco declara si su concepto es crítico (p. ej. "no se puede finalizar una etapa con estudiantes en Inicial o Parcial").
4. **Manual 018: leído** (ver §2). El módulo de Preceptoría ya tiene base propia. Sigue siendo una imagen sin texto: conviene que el equipo tenga una transcripción para los subtítulos y las alternativas de texto del recurso.

### Siguen abiertas
0. **¿Quién registra la asistencia y qué llega al IPE?** El 018 dice que registra el Director o el personal autorizado y que lo guardado en "Gestionar Asistencias" **no se muestra en el IPE**. El 303 exige para finalizar el IPE que "personal autorizado y/o preceptor" haya registrado las inasistencias, y su grilla las muestra. Parece que son dos cargas distintas (o manuales de fechas distintas); no lo puedo resolver con los PDF. Hasta confirmarlo con el equipo, el simulador de asistencia **no afirma** que la asistencia diaria alimenta el IPE, y no se escriben preguntas sobre ese vínculo. (El simulador actual sí lo insinúa y solo tiene 3 condiciones, no 5.)
5. **"Mayor a 6".** El manual 309 pinta en rojo lo menor a 6 pero dice "Aprobado" con promedio *mayor* a 6; no define el 6 exacto. Se verifica con el manual/equipo antes de escribir preguntas sobre ese borde.
6. **Ponderaciones.** El informe menciona "ponderaciones vigentes"; los manuales leídos describen promedios sin ponderaciones. No se inventan: promedio simple, rotulado como ilustrativo.
7. **Podcasts sin guion.** Los episodios tienen descripciones genéricas. Para transcripciones y subtítulos hacen falta los guiones del equipo (el informe dice que existen). Además hay que decidir qué podcasts quedan en el recorrido: "Género" y "Seguridad informática" pueden ser transversales, no solo de calificaciones.
8. **Dos "evaluaciones finales" distintas.** La del informe (§6, rúbrica con presentación oral) es de la cátedra; la de este plan es del portal, para quienes se capacitan. Son entregables separados.
9. **Diseño visual.** Se extiende el sistema actual, pero el pedido de "sin banners ni elementos distractores" (TDAH) obliga a simplificar el hero. Las pantallas nuevas importantes (evaluación, resultados, portafolio) conviene diseñarlas con `/impeccable shape` antes de codificarlas.
10. **Datos en `localStorage`.** Se pierden si se borra el navegador o se cambia de equipo. Se avisa en pantalla y se ofrece exportar/importar el avance como archivo.
