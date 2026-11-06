/* Práctica con simuladores.
   Un único curso de práctica compartido por los tres perfiles: lo que hace el equipo directivo
   se ve en la planilla docente, y al revés. Todo con datos ficticios y guardado solo en el navegador.
   Las reglas replican los manuales 309 (calificaciones), 303 (IPE) y 018 (asistencias). */

const SIM_COURSE = {
  name: "4.º año · División A",
  year: 4, // desde 4.º año aplica el estado Complementario (manual 309, sección 2.2)
  subjects: ["Matemática", "Lengua y Literatura", "Ciencias Sociales"]
};
const NOTES_PER_STAGE = 6;

const ATTENDANCE_CONDITIONS = ["Presente", "Ausente", "Ausente justificado", "Llegada tarde", "Inasistencia no computable"];
const ATTENDANCE_CLASSES = ["3.º año · División A", "2.º año · División B", "4.º año · División A"];

/* Tareas de práctica por perfil y módulo. `flag` se marca cuando la acción ocurre en el simulador;
   dos tareas pueden compartir flag si miden la misma acción. */
const practiceTasks = {
  profesor: [
    [
      { flag: "doc-notes", label: "Cargá tres notas parciales a una persona estudiante en la etapa 1." }
    ],
    [
      { flag: "calc-e1", label: "Calculá el promedio de la etapa 1 de una persona estudiante." },
      { flag: "uncalc", label: "Eliminá ese cálculo mientras la etapa no esté finalizada." },
      { flag: "calc-e2", label: "Calculá la etapa 2 de una persona estudiante y mirá su estado final." }
    ],
    [
      { flag: "res-blocked", label: "Intentá aprobar por resolución una etapa que tiene notas y leé el motivo del rechazo (desde la pestaña del equipo directivo)." },
      { flag: "exim", label: "Registrá una eximición y fijate qué pasa con las notas cargadas." }
    ]
  ],
  preceptor: [
    [
      { flag: "att-saved", label: "Dejá a una persona como Ausente y guardá la asistencia: Registrar y Confirmar." }
    ],
    [
      { flag: "att-totals", label: "Cambiá una condición y mirá cómo se actualizan los totales." },
      { flag: "att-print", label: "Imprimí el listado de asistencia." }
    ],
    [
      { flag: "ipe-blocked", label: "Intentá finalizar el IPE con el curso incompleto y leé qué falta." },
      { flag: "ipe-finalized", label: "Completá los requisitos y finalizá el IPE." }
    ]
  ],
  directivo: [
    [
      { flag: "access-toggle", label: "Cambiá un permiso (por ejemplo el de la comunidad docente) y comprobá el efecto en la práctica de ese perfil." }
    ],
    [
      { flag: "finalize-blocked", label: "Intentá finalizar la etapa 1 con estudiantes en Inicial o Parcial y leé el motivo." },
      { flag: "finalize-ok", label: "Finalizá la etapa 1 cuando todas las personas tengan promedio." }
    ],
    [
      { flag: "ipe-blocked", label: "Intentá finalizar el IPE con requisitos faltantes y leé qué falta." },
      { flag: "ipe-finalized", label: "Completá los requisitos y finalizá el IPE." }
    ]
  ]
};

/* Cada perfil tiene un área de práctica con pestañas. */
const practiceAreas = {
  profesor: { title: "Práctica: planilla de calificaciones", description: "Cargá notas, calculá promedios y mirá cómo responde el sistema. Desde la otra pestaña podés actuar como equipo directivo para ver sus efectos." },
  preceptor: { title: "Práctica: asistencia e IPE", description: "Registrá la asistencia del día y probá qué exige el sistema para finalizar el IPE del curso." },
  directivo: { title: "Práctica: etapas, IPE y accesos", description: "Finalizá etapas, registrá resoluciones y eximiciones, cerrá el IPE y habilitá o quitá permisos." }
};
