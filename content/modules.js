/* Módulos de cada ruta: lección, recursos y chequeo.
   Todo el contenido normativo sale de los manuales del SGE incluidos en public/:
   309 (Registrar calificaciones, nivel secundario), 303 (Finalizar IPE) y 018 (Gestionar asistencias).
   Si un punto no está en esos manuales, no se afirma: se indica consultar al referente SGE.
   Cada pregunta lleva `concept` (para el refuerzo y la evaluación final) y `critical` cuando
   equivocarse implicaría un error grave en el sistema real. */

const podcasts = {
  cargaNotas: { title: "Carga de notas", file: "public/podscar_carga_notas_final.m4a", summary: "Un episodio sobre la carga de notas." },
  seguridad: { title: "Seguridad informática", file: "public/podcast_seguridad_informatica.m4a", summary: "Un episodio sobre seguridad informática." },
  genero: { title: "Género", file: "public/podcast_genero_final.m4a", summary: "Un episodio sobre género." },
  salaDeProfes: { title: "Sala de profes", file: "public/podcast_sala_de_profes.m4a", summary: "Un episodio para la sala de profes." }
};

const moduleContent = {
  profesor: [
    {
      title: "Acceso y carga de notas parciales",
      summary: "Cómo llegar a Registrar Calificaciones, leer la grilla y cargar las notas de cada etapa.",
      lesson: [
        { title: "Quién puede registrar calificaciones", text: "Tienen acceso quienes fueron registradas o registrados por el equipo directivo en el SGE con el rol de docente. Si al ingresar no encontrás el establecimiento, el espacio curricular o el curso donde necesitás cargar notas, pedile al equipo directivo o al personal autorizado que te habilite." },
        { title: "Cómo llegar", text: "En el menú elegí Progreso y Calificaciones, luego Nivel Secundario-Calificaciones y finalmente Registrar Calificaciones. Seleccioná el curso y el espacio curricular para ver el listado de estudiantes." },
        { title: "Cómo se lee la grilla", text: "Las y los estudiantes aparecen por apellido; si apoyás el cursor sobre uno ves el número de documento y el nombre, algo útil cuando hay apellidos repetidos. Hay dos secciones, Etapa 1 y Etapa 2, con seis columnas para notas parciales cada una. E1 y E2 muestran el promedio de cada etapa, PG el promedio general y ES el estado del espacio curricular." },
        { title: "Cargar una nota parcial", text: "En las columnas 1 a 6 elegís la calificación de la lista. La nota se guarda sola, se resalta con color y se habilita la columna siguiente. Al salir y volver a entrar, el resaltado desaparece. Mientras no calcules el promedio, podés cambiar cada nota las veces que haga falta.", remember: "Las notas parciales se guardan automáticamente: una caída de internet o de la sesión no hace perder lo que ya cargaste." }
      ],
      resources: [
        { type: "doc", key: "calificaciones", note: "Secciones 1 y 2.1 del manual." },
        { type: "podcast", key: "cargaNotas", note: "Para escuchar en el camino a la escuela." }
      ],
      check: [
        { id: "doc-m1-q1", concept: "acceso-docente", prompt: "Entrás al SGE como docente y no aparece el curso donde tenés que cargar notas. ¿Qué corresponde hacer?", options: ["Pedirle al equipo directivo o al personal autorizado que te habilite", "Crear el curso vos misma o mismo desde Registrar Calificaciones", "Cargar las notas en otro curso y pasarlas después", "Esperar: el curso aparece solo al cambiar de fecha"], answer: 0, explain: "El acceso al establecimiento, al espacio curricular y al curso lo habilita el equipo directivo o el personal autorizado.", source: "Manual 309, introducción" },
        { id: "doc-m1-q2", concept: "autoguardado", prompt: "Cargaste tres notas parciales y se cortó internet. ¿Qué pasó con esas notas?", options: ["Se perdieron: hay que cargarlas de nuevo", "Quedaron guardadas, porque las notas parciales se guardan automáticamente", "Quedaron guardadas solo si ya habías calculado el promedio", "Quedaron pendientes hasta que el equipo directivo las confirme"], answer: 1, explain: "En esta versión las notas parciales se guardan solas, así que una caída de internet o de la sesión no hace perder información.", source: "Manual 309, introducción" },
        { id: "doc-m1-q3", concept: "editar-parciales", prompt: "Todavía no calculaste el promedio de la etapa 1 y una nota parcial quedó mal cargada. ¿Podés corregirla?", options: ["No: una nota guardada no se puede modificar", "Solo con autorización del equipo directivo", "Sí: elegís otra calificación de la lista, las veces que haga falta", "Solo al día siguiente de cargarla"], answer: 2, explain: "Antes de calcular el promedio podés modificar las calificaciones registradas todas las veces que necesites, eligiendo otra de la lista desplegable.", source: "Manual 309, sección 2.1" }
      ]
    },
    {
      title: "Promedios y estado del espacio curricular",
      summary: "Cuándo calcular el promedio, qué se bloquea al hacerlo y cómo se define si queda aprobado, en coloquio o complementario.",
      lesson: [
        { title: "Calcular el promedio de la etapa", text: "Cuando terminás de registrar todas las notas de la etapa, calculás el promedio. El SGE te muestra las calificaciones y te pide confirmar. Al confirmar, hace el cálculo definitivo, te bloquea la edición de esas notas y habilita al equipo directivo, al personal autorizado o a la preceptoría a finalizar el IPE." },
        { title: "Por qué conviene calcular al final", text: "Vos decidís cuándo calcular el promedio de cada etapa. Calcularlo recién cuando cargaste todas las notas parciales evita que el equipo directivo cierre el IPE antes de que tu registro esté completo.", remember: "Calcular el promedio es lo que habilita el cierre del IPE: hacelo cuando la etapa esté completa." },
        { title: "Si hay que corregir", text: "Hasta que el equipo directivo, el personal autorizado o la preceptoría finalice la etapa, podés eliminar el cálculo del promedio y volver a habilitar el registro de notas. Cuando la etapa se finaliza, aparece un candado y ya no podés editar." },
        { title: "Etapa 2 y promedio general", text: "El botón para calcular la etapa 2 aparece recién cuando calculaste el promedio de la etapa 1. Al calcularla, el SGE obtiene el promedio general (PG) y asigna el estado del espacio curricular: queda Inscripto (en gris) mientras no se calculó la etapa 2; Aprobado cuando el promedio general y el de la etapa 2 son mayores a 6; Coloquio cuando alguno de los dos es menor a 6; y, desde 4.º año, Complementario si el promedio general es menor a 4. El manual no aclara qué pasa con un 6 exacto: ante un caso límite, consultá a tu referente SGE." },
        { title: "Los promedios menores a 6 se ven en rojo", text: "Cuando se calculan los promedios, las calificaciones menores a 6 (E1, E2 y PG) se muestran en rojo. Es una señal visual para detectar a quiénes hay que acompañar." }
      ],
      resources: [
        { type: "doc", key: "calificaciones", note: "Secciones 2.1 y 2.2 del manual." }
      ],
      check: [
        { id: "doc-m2-q1", concept: "eliminar-calculo", prompt: "Calculaste el promedio de la etapa 1, pero el equipo directivo todavía no finalizó la etapa, y te das cuenta de que falta cargar una nota. ¿Qué hacés?", options: ["Eliminás el cálculo del promedio, cargás la nota y volvés a calcular", "Nada: una vez calculado el promedio ya no se puede cambiar", "Cargás la nota en la etapa 2", "Pedís que el SGE reabra el curso"], answer: 0, explain: "Hasta que la etapa se finaliza podés eliminar el cálculo y habilitar de nuevo el registro. Después del candado ya no es posible.", source: "Manual 309, sección 2.1" },
        { id: "doc-m2-q2", concept: "calcular-bloquea", critical: true, prompt: "¿Por qué conviene calcular el promedio de una etapa recién cuando cargaste todas las notas parciales?", options: ["Porque el SGE no deja cargar notas después de las 18", "Porque calcular el promedio habilita el cierre del IPE: si calculás antes, pueden cerrarlo sin tu registro completo", "Porque el promedio se calcula solo a fin de año", "No hay diferencia: se puede calcular en cualquier momento sin consecuencias"], answer: 1, explain: "Calcular el promedio bloquea tu edición y habilita al equipo directivo a finalizar el IPE. Por eso elegís cuándo hacerlo: así no cierran antes de que termines de cargar.", source: "Manual 309, introducción y sección 2.1" },
        { id: "doc-m2-q3", concept: "estado-espacio", prompt: "Un o una estudiante de 2.º año tiene promedio de la etapa 2 menor a 6. ¿Qué estado muestra el espacio curricular?", options: ["Coloquio", "Complementario", "Aprobado", "Inscripto"], answer: 0, explain: "Cuando el promedio general o el de la etapa 2 es menor a 6, el estado es Coloquio. Complementario aparece desde 4.º año y con promedio general menor a 4.", source: "Manual 309, sección 2.2" }
      ]
    },
    {
      title: "Casos especiales: resolución y eximición",
      summary: "Los seis estados de cada estudiante, y qué pasa cuando una etapa se aprueba por resolución o se exime un espacio curricular.",
      lesson: [
        { title: "Los seis estados", text: "Cada estudiante, en cada etapa, está en uno de seis estados: Inicial (sin notas), Parcial (al menos una nota parcial), Promedio (hay promedio de la etapa), Resolución (etapa aprobada por resolución, se ve una A), Bloqueo (el equipo directivo finalizó la etapa) y EXIM (eximición). Según el estado se habilitan o no ciertas acciones. El manual indica que el equipo directivo gestiona Resolución y Bloqueo, y la comunidad docente el resto." },
        { title: "Aprobar una etapa por resolución", text: "Es posible aprobar una etapa, o las dos, por resolución. La opción solo aparece cuando no hay calificaciones registradas: si ya cargaste alguna, hay que eliminar ese registro para habilitarla. Se escribe el número de resolución y en E1 o E2 se muestra A. Si se aprueban ambas etapas por resolución, el espacio curricular queda Aprobado.", remember: "Aprobar por resolución y tener notas cargadas en la misma etapa no conviven: primero se eliminan las notas." },
        { title: "Eximición", text: "Cuando el equipo directivo, el personal autorizado o la preceptoría registra la eximición de un espacio curricular, se inhabilita el registro de calificaciones para la comunidad docente, en PG se muestra EXIM y el espacio queda Aprobado. Las calificaciones que habías registrado antes de la eximición ya no están disponibles.", remember: "Una eximición borra de la vista las notas cargadas antes." },
        { title: "Cuando no podés editar", text: "Si ves un candado (etapa finalizada) o EXIM, no es posible modificar. Si necesitás un cambio, consultá al equipo directivo. Debajo del listado, el SGE informa los totales de estudiantes inscriptos, aprobados y que deben rendir coloquio o examen complementario." }
      ],
      resources: [
        { type: "doc", key: "calificaciones", note: "Secciones 2.3, 2.4 y 2.5 del manual." }
      ],
      check: [
        { id: "doc-m3-q1", concept: "resolucion-sin-notas", prompt: "Querés aprobar la etapa 1 de una persona estudiante por resolución, pero ya le cargaste dos notas parciales. ¿Qué pasa con esa opción?", options: ["Se aplica igual y las notas quedan guardadas", "No aparece mientras haya notas: hay que eliminar el registro para habilitarla", "Aparece solo después de calcular el promedio", "Se habilita sola al día siguiente"], answer: 1, explain: "El botón de aprobar por resolución se muestra únicamente cuando no hay calificaciones registradas en esa etapa.", source: "Manual 309, sección 2.3" },
        { id: "doc-m3-q2", concept: "eximicion-borra", critical: true, prompt: "El equipo directivo registra la eximición de una persona estudiante en tu espacio curricular, donde ya habías cargado notas. ¿Qué pasa con esas notas?", options: ["Se promedian igual y se suman a la etapa 2", "Quedan visibles pero bloqueadas", "Dejan de estar disponibles", "Se archivan hasta que se levante la eximición"], answer: 2, explain: "Una vez que la persona estudiante queda aprobada por eximición, las calificaciones registradas antes ya no están disponibles, y tu registro de notas queda inhabilitado.", source: "Manual 309, sección 2.4" },
        { id: "doc-m3-q3", concept: "bloqueo", prompt: "Ves un candado en la etapa 1 de una persona estudiante. ¿Qué significa?", options: ["Que falta calcular el promedio", "Que tu acceso al curso venció", "Que el equipo directivo, el personal autorizado o la preceptoría finalizó la etapa y ya no podés modificar las notas", "Que la etapa está aprobada por resolución"], answer: 2, explain: "El candado indica que la etapa fue finalizada: la persona estudiante pasa al estado Bloqueo y no se permiten modificaciones.", source: "Manual 309, introducción y sección 2.1" }
      ]
    }
  ],

  preceptor: [
    {
      title: "Registrar la asistencia del día",
      summary: "Cómo llegar a Gestionar Asistencias, las cinco condiciones y cómo guardar el registro.",
      lesson: [
        { title: "Quién registra", text: "El SGE permite que la asistencia diaria la registre el equipo directivo del establecimiento o el personal que este autorice. Si te toca hacerlo, confirmá con tu equipo directivo que tenés la autorización." },
        { title: "Cómo llegar", text: "En el menú lateral, dentro de Institucional, elegí Gestionar Asistencias. También está en Accesos Directos, dentro de la misma opción." },
        { title: "Curso y fecha", text: "Buscás un curso y seleccionás la fecha de la inasistencia que querés registrar. Antes de seguir, comprobá que el curso y la fecha sean los correctos.", remember: "Curso y fecha primero: son lo que define a qué día pertenece el registro." },
        { title: "Las cinco condiciones", text: "La grilla muestra documento, sexo, apellido y nombre de cada estudiante, con cinco opciones: Presente, Ausente, Ausente justificado, Llegada tarde e Inasistencia no computable." },
        { title: "Presente por defecto", text: "El registro empieza con todas y todos como Presente. Solo tenés que marcar a quienes tienen otra condición. Al final de la grilla ves la cantidad de estudiantes en cada condición, y se actualiza a medida que cambiás las opciones." },
        { title: "Guardar", text: "Para guardar, seleccioná Registrar Asistencia y luego Confirmar en el cuadro que pregunta si querés registrar la asistencia para ese curso y fecha. El SGE muestra un mensaje confirmando que la asistencia se registró correctamente." }
      ],
      resources: [
        { type: "doc", key: "asistencias", note: "Secciones 1 y 2 del manual." }
      ],
      check: [
        { id: "pre-m1-q1", concept: "presente-por-defecto", prompt: "Tu curso tiene 30 estudiantes y faltó una sola persona. ¿Qué tenés que marcar?", options: ["Presente en las 29 personas restantes", "Solo la condición de la persona que faltó: el resto figura como Presente por defecto", "Nada: el SGE detecta quién faltó", "Ausente para todo el curso y corregir después"], answer: 1, explain: "Por defecto el registro está en Presente. Solo hace falta cambiar la condición de quienes no están presentes.", source: "Manual 018, sección 2" },
        { id: "pre-m1-q2", concept: "condiciones", prompt: "¿Cuál de estas es una condición que podés elegir al registrar la asistencia?", options: ["Suspendido", "Falta grave", "Inasistencia no computable", "Adelantado"], answer: 2, explain: "Las opciones son Presente, Ausente, Ausente justificado, Llegada tarde e Inasistencia no computable.", source: "Manual 018, sección 2" },
        { id: "pre-m1-q3", concept: "confirmar-registro", critical: true, prompt: "Marcaste las excepciones del día y seleccionaste Registrar Asistencia. ¿Qué falta para que quede guardada?", options: ["Nada: ya quedó guardada", "Imprimir el listado", "Confirmar en el cuadro de diálogo; después el SGE muestra que la asistencia se registró correctamente", "Avisar al equipo directivo"], answer: 2, explain: "Después de Registrar Asistencia aparece un cuadro para confirmar curso y fecha. Al confirmar, el SGE informa que se registró correctamente.", source: "Manual 018, sección 2" }
      ]
    },
    {
      title: "Revisar e imprimir el listado",
      summary: "Cómo usar los totales para controlar el registro y cómo descargar el listado en PDF.",
      lesson: [
        { title: "Controlá con los totales", text: "Al pie de la grilla el SGE cuenta cuántas personas hay en cada condición y actualiza los números mientras modificás las opciones. Sirven para controlar el registro antes de guardarlo." },
        { title: "Antes de guardar, revisá", text: "Comprobá cuatro cosas: que el curso sea el correcto, que la fecha sea la que querés registrar, que solo estén marcadas las excepciones y que los totales coincidan con lo que esperás." },
        { title: "Imprimir el listado", text: "Con el botón Imprimir Listado se habilita la descarga de un documento PDF en tu equipo. Al abrirlo ves el curso, la fecha, cada estudiante con su tipo de asistencia y los totales por condición." },
        { title: "Lo que guardás acá y el IPE", text: "El manual aclara que la información que se guarda en Gestionar Asistencias no se muestra en el IPE (Informe de Progreso Escolar).", remember: "Registrar acá no alcanza para completar lo que el IPE necesita: ver el módulo siguiente." }
      ],
      resources: [
        { type: "doc", key: "asistencias", note: "Secciones 2 y 3 del manual." }
      ],
      check: [
        { id: "pre-m2-q1", concept: "totales", prompt: "¿Para qué sirven los totales que aparecen al pie de la grilla de asistencia?", options: ["Para enviar un aviso a las familias", "Para ver cuántos estudiantes hay en cada condición; cambian a medida que modificás las opciones", "Para calcular el promedio de asistencia del año", "Para cerrar el mes"], answer: 1, explain: "Los totales se actualizan automáticamente con cada cambio y ayudan a revisar el registro.", source: "Manual 018, sección 2" },
        { id: "pre-m2-q2", concept: "imprimir-listado", prompt: "¿Qué obtenés al usar Imprimir Listado?", options: ["Un PDF para descargar con el curso, la fecha, cada estudiante y los totales", "El IPE del curso", "Una nota para las familias", "Un pedido de justificación"], answer: 0, explain: "Imprimir Listado habilita la descarga de un PDF con el listado de asistencia y los totales por condición.", source: "Manual 018, sección 3" },
        { id: "pre-m2-q3", concept: "asistencia-y-ipe", prompt: "¿Qué aclara el manual de Gestionar Asistencias sobre la información que guardás ahí y el IPE?", options: ["Que se copia automáticamente al IPE", "Que reemplaza al IPE", "Que no se muestra en el IPE", "Que solo se muestra en el IPE al final del ciclo"], answer: 2, explain: "El manual señala que lo que se guarda en Gestionar Asistencias no se muestra en el IPE.", source: "Manual 018, sección 1" }
      ]
    },
    {
      title: "Asistencia y finalización del IPE",
      summary: "Qué exige el SGE para finalizar el IPE de un curso y qué parte te corresponde.",
      lesson: [
        { title: "Qué es el IPE", text: "El Informe de Progreso Escolar se finaliza dentro del SGE al final del ciclo lectivo. Es el cierre del seguimiento de cada estudiante en el curso." },
        { title: "Quién puede finalizarlo", text: "Pueden finalizar el IPE el equipo directivo, el personal autorizado o la preceptoría. En las etapas de calificaciones, los manuales llaman \"directivo\" también al personal autorizado y a la preceptoría." },
        { title: "Qué tiene que estar completo", text: "Para finalizar un IPE es requisito que la comunidad docente haya registrado las calificaciones en todos los espacios curriculares del curso, y que el personal autorizado o la preceptoría haya registrado las inasistencias.", remember: "Sin notas en todos los espacios curriculares del curso, el IPE no se puede finalizar." },
        { title: "Qué muestra la grilla del IPE", text: "Al elegir el curso y aplicar filtros, el SGE lista a las y los estudiantes matriculados y sus inasistencias del ciclo actual: justificadas, injustificadas, llegadas tarde, retiros y el total acumulado. Hay un campo Observación para información relevante. Al finalizar, el IPE pasa al estado Finalizado." },
        { title: "Ante la duda, preguntá", text: "El manual de asistencias dice que lo guardado en Gestionar Asistencias no se muestra en el IPE. Si no tenés claro cómo se cargan las inasistencias que ve el IPE en tu institución, consultá a tu referente SGE antes de finalizarlo." }
      ],
      resources: [
        { type: "doc", key: "ipe", note: "Tutorial completo: requisitos y pasos." },
        { type: "doc", key: "asistencias", note: "Para repasar el registro diario." }
      ],
      check: [
        { id: "pre-m3-q1", concept: "requisitos-ipe", critical: true, prompt: "Querés finalizar el IPE de 2.º A, pero en un espacio curricular todavía no se registraron calificaciones. ¿Qué corresponde?", options: ["Finalizar igual: las notas se agregan después", "Esperar a que la comunidad docente registre las calificaciones en todos los espacios del curso", "Cargar vos las notas faltantes", "Dejar una Observación y finalizar"], answer: 1, explain: "Es requisito que se hayan registrado las calificaciones en todos los espacios curriculares del curso para finalizar el IPE.", source: "Manual 303, introducción" },
        { id: "pre-m3-q2", concept: "quien-finaliza", prompt: "¿Quién puede finalizar un IPE en el SGE?", options: ["Solo la comunidad docente", "Solo el equipo directivo", "El equipo directivo, el personal autorizado o la preceptoría", "Las familias"], answer: 2, explain: "El IPE puede finalizarlo el equipo directivo, el personal autorizado y/o la preceptoría.", source: "Manual 303, introducción" },
        { id: "pre-m3-q3", concept: "inasistencias-requisito", prompt: "Además de las calificaciones, ¿qué tiene que estar registrado para poder finalizar el IPE?", options: ["Las inasistencias, por el personal autorizado o la preceptoría", "El promedio general de la escuela", "La firma de las familias", "Nada más"], answer: 0, explain: "El segundo requisito es que el personal autorizado y/o la preceptoría haya registrado las inasistencias.", source: "Manual 303, introducción" }
      ]
    }
  ],

  directivo: [
    {
      title: "Habilitar accesos y autorizar al personal",
      summary: "A quién le corresponde habilitar el acceso a calificaciones y quién puede registrar la asistencia.",
      lesson: [
        { title: "Quién tiene acceso a calificaciones", text: "Acceden a Registrar Calificaciones las personas que el equipo directivo registró en el SGE con el rol de docente." },
        { title: "Habilitar curso y espacio curricular", text: "Si una persona de la comunidad docente no encuentra el establecimiento, el espacio curricular o el curso donde tiene que registrar notas, tiene que pedirle la habilitación al equipo directivo o al personal autorizado.", remember: "Un pedido de acceso de la comunidad docente llega a tu equipo: el sistema no lo resuelve solo." },
        { title: "Asistencia diaria", text: "El manual de Gestionar Asistencias establece que registra la asistencia el equipo directivo o el personal que autorice. Definir y comunicar esa autorización es parte de la gestión de accesos." },
        { title: "Personal autorizado y preceptoría", text: "En los manuales, las acciones del \"directivo\" (como finalizar una etapa o registrar una eximición) las pueden hacer también el personal autorizado y la preceptoría. Conviene tener claro a quién se autorizó." },
        { title: "Cuidá las credenciales", text: "El ingreso al SGE se hace con Ciudadano Digital (CiDi). Ninguna persona debería compartir su contraseña ni pedirla por canales no verificados; ante un problema de acceso, el canal es el referente SGE de la institución." }
      ],
      resources: [
        { type: "doc", key: "calificaciones", note: "Introducción: quién accede a Registrar Calificaciones." },
        { type: "podcast", key: "seguridad", note: "Para escuchar sobre el cuidado de las credenciales." }
      ],
      check: [
        { id: "dir-m1-q1", concept: "acceso-docente", prompt: "Una persona de la comunidad docente avisa que no ve su curso en Registrar Calificaciones. ¿A quién le corresponde habilitarlo?", options: ["Al equipo directivo o al personal autorizado", "A la propia persona docente, desde el SGE", "A las familias", "Se habilita solo con el inicio del ciclo"], answer: 0, explain: "El acceso al establecimiento, al espacio curricular y al curso lo habilita el equipo directivo o el personal autorizado.", source: "Manual 309, introducción" },
        { id: "dir-m1-q2", concept: "registro-docente", prompt: "¿Quiénes tienen acceso a Registrar Calificaciones?", options: ["Todo el personal de la escuela", "Quienes fueron registrados por el equipo directivo en el SGE con el rol de docente", "Solo la preceptoría", "Cualquier persona con CiDi"], answer: 1, explain: "El acceso es para los usuarios que el equipo directivo registró en el SGE con el rol de docente.", source: "Manual 309, introducción" },
        { id: "dir-m1-q3", concept: "quien-registra-asistencia", prompt: "Según el manual de Gestionar Asistencias, ¿quién registra la asistencia diaria?", options: ["Solo la comunidad docente", "El equipo directivo o el personal que autorice", "Las familias", "El sistema, automáticamente"], answer: 1, explain: "La asistencia diaria la registra el equipo directivo del establecimiento o el personal autorizado por este.", source: "Manual 018, sección 1" }
      ]
    },
    {
      title: "Finalizar una etapa: estados y bloqueo",
      summary: "Los estados de cada estudiante, cuándo se puede finalizar una etapa y qué cambia al hacerlo.",
      lesson: [
        { title: "Los seis estados", text: "Cada estudiante, en cada etapa, está en uno de seis estados: Inicial (sin notas), Parcial (al menos una nota parcial), Promedio (hay promedio de la etapa), Resolución, Bloqueo (etapa finalizada) y EXIM (eximido). El manual indica que el equipo directivo gestiona Resolución y Bloqueo." },
        { title: "Cuándo podés finalizar una etapa", text: "Solo cuando la persona estudiante está en estado Promedio. No se puede finalizar una etapa si está en estado Inicial o Parcial: todavía faltan notas o falta que la comunidad docente calcule el promedio.", remember: "Etapa finalizada solo con estudiantes en estado Promedio. Inicial y Parcial no se pueden cerrar." },
        { title: "Qué pasa al finalizar", text: "La etapa pasa a Bloqueo: la persona docente ya no puede modificar las calificaciones de esa etapa y se muestra un candado. Por eso la comunidad docente decide cuándo calcular el promedio: así no se cierra antes de tiempo." },
        { title: "Resolución y eximición", text: "Se puede aprobar una etapa por resolución indicando el número de resolución. En una eximición, se inhabilita el registro de notas para la comunidad docente, PG muestra EXIM y el espacio queda Aprobado; las calificaciones cargadas antes ya no están disponibles. Antes de eximir, conviene que la persona docente sepa que esas notas se van a perder de la vista." }
      ],
      resources: [
        { type: "doc", key: "calificaciones", note: "Introducción y secciones 2.3 y 2.4 del manual." }
      ],
      check: [
        { id: "dir-m2-q1", concept: "finalizar-solo-promedio", critical: true, prompt: "Una persona estudiante figura en estado Parcial en la etapa 1 de un espacio curricular. ¿Podés finalizar la etapa?", options: ["Sí: Parcial alcanza", "No: solo se puede finalizar cuando la persona estudiante está en estado Promedio", "Sí, si agregás una Observación", "Sí, pero queda en Bloqueo temporal"], answer: 1, explain: "No se pueden finalizar las etapas del IPE si la persona estudiante está en estado Inicial o Parcial. Tiene que haber un promedio calculado.", source: "Manual 309, introducción" },
        { id: "dir-m2-q2", concept: "bloqueo", prompt: "Finalizaste la etapa 1. ¿Qué cambia para la persona docente?", options: ["Nada, puede seguir editando", "La etapa pasa a Bloqueo: ya no puede modificar las calificaciones", "Puede editar solo los lunes", "Se borra el promedio"], answer: 1, explain: "Con la etapa finalizada el estado es Bloqueo y no se permiten modificaciones; se ve un candado.", source: "Manual 309, introducción" },
        { id: "dir-m2-q3", concept: "eximicion-borra", critical: true, prompt: "Vas a registrar la eximición de una persona estudiante en un espacio curricular que ya tiene notas cargadas. ¿Qué tenés que tener en cuenta?", options: ["Que esas notas se promedian igual", "Que esas notas ya no estarán disponibles", "Que la eximición se puede revertir sin consecuencias", "Que no pasa nada con las notas"], answer: 1, explain: "Tras la eximición, las calificaciones registradas antes ya no están disponibles y la persona docente no puede registrar más.", source: "Manual 309, sección 2.4" }
      ]
    },
    {
      title: "Finalizar el IPE",
      summary: "Requisitos, pasos y qué hacer cuando todavía faltan notas o inasistencias.",
      lesson: [
        { title: "Quién puede y cuándo", text: "El equipo directivo, el personal autorizado o la preceptoría pueden finalizar el Informe de Progreso Escolar al final del ciclo lectivo." },
        { title: "Requisitos", text: "Es requisito que la comunidad docente haya registrado las calificaciones en todos los espacios curriculares del curso y que el personal autorizado o la preceptoría haya registrado las inasistencias.", remember: "Si hay estudiantes sin notas en algún espacio curricular, el IPE de ese curso todavía no se puede finalizar." },
        { title: "Paso a paso", text: "En el menú, dentro de Progreso y Calificaciones, elegí Finalizar IPE (Nivel Secundario). Seleccioná un curso y aplicá filtros: el SGE lista a las y los estudiantes matriculados, con sus inasistencias del ciclo actual. Elegí Finalizar IPE; si necesitás dejar información relevante, completá el campo Observación, y seleccioná Finalizar. El IPE pasa al estado Finalizado." },
        { title: "Si faltan notas", text: "Coordiná con la comunidad docente para que registre las calificaciones y calcule los promedios de los espacios que faltan. No hay atajo en el sistema: sin esos registros no se puede finalizar." }
      ],
      resources: [
        { type: "doc", key: "ipe", note: "Tutorial para finalizar el IPE (nivel secundario)." }
      ],
      check: [
        { id: "dir-m3-q1", concept: "requisitos-ipe", critical: true, prompt: "Querés finalizar el IPE de un curso, pero en dos espacios curriculares hay estudiantes sin notas. ¿Qué corresponde?", options: ["Coordinar con la comunidad docente para que registre las calificaciones en todos los espacios del curso antes de finalizar", "Finalizar el IPE y cargar las notas después", "Dejar una Observación que diga que faltan notas y finalizar", "Pedirle a la preceptoría que cargue las notas"], answer: 0, explain: "Para finalizar un IPE es requisito que las calificaciones estén registradas en todos los espacios curriculares del curso.", source: "Manual 303, introducción" },
        { id: "dir-m3-q2", concept: "inasistencias-requisito", prompt: "Además de las calificaciones, ¿qué tiene que estar registrado para finalizar el IPE?", options: ["Las inasistencias, por el personal autorizado o la preceptoría", "El promedio general de la escuela", "La firma de las familias", "Nada más"], answer: 0, explain: "El otro requisito es que se hayan registrado las inasistencias.", source: "Manual 303, introducción" },
        { id: "dir-m3-q3", concept: "observacion-ipe", prompt: "Si necesitás dejar información relevante al finalizar el IPE de un curso, ¿dónde la escribís?", options: ["En el campo Observación", "En un mensaje a las familias", "En el cuaderno de calificaciones", "No se puede dejar información"], answer: 0, explain: "Antes de seleccionar Finalizar, hay un campo Observación para completar si se necesita. Al finalizar, el IPE pasa a Finalizado.", source: "Manual 303, sección 2" }
      ]
    }
  ]
};

/* Nombre legible de cada concepto evaluado, para el portafolio y el refuerzo. */
const conceptLabels = {
  "acceso-docente": "Quién habilita el acceso al curso y al espacio curricular",
  "registro-docente": "Quiénes acceden a Registrar Calificaciones",
  "autoguardado": "Las notas parciales se guardan solas",
  "editar-parciales": "Corregir notas antes de calcular el promedio",
  "eliminar-calculo": "Eliminar el cálculo mientras la etapa no esté finalizada",
  "calcular-bloquea": "Calcular el promedio bloquea la edición y habilita el cierre",
  "estado-espacio": "Estados del espacio curricular: Aprobado, Coloquio y Complementario",
  "resolucion-sin-notas": "Aprobar por resolución solo sin notas cargadas",
  "eximicion-borra": "La eximición deja sin disponibilidad las notas cargadas",
  "bloqueo": "El candado y el estado Bloqueo",
  "presente-por-defecto": "Todas las personas figuran Presente por defecto",
  "condiciones": "Las cinco condiciones de asistencia",
  "confirmar-registro": "Registrar y confirmar la asistencia",
  "totales": "Totales de asistencia",
  "imprimir-listado": "Imprimir el listado de asistencia",
  "asistencia-y-ipe": "Lo guardado en Gestionar Asistencias no se muestra en el IPE",
  "requisitos-ipe": "Requisitos para finalizar el IPE (notas en todos los espacios)",
  "quien-finaliza": "Quién puede finalizar el IPE",
  "inasistencias-requisito": "Las inasistencias registradas como requisito del IPE",
  "quien-registra-asistencia": "Quién registra la asistencia diaria",
  "finalizar-solo-promedio": "Una etapa se finaliza solo con estudiantes en estado Promedio",
  "observacion-ipe": "El campo Observación al finalizar el IPE"
};
