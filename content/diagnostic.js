/* Diagnóstico de entrada (informe, secciones 2.2 y 6): cuestionario sin nota, en tres ejes.
   Eje 1: competencias digitales previas. Eje 2: contexto tecnológico e infraestructura.
   Eje 3: barreras percibidas y expectativas. Más una parte inicial para saber con qué perfil trabaja la persona.
   Las respuestas quedan solo en este navegador y alimentan las sugerencias y el portafolio. */

const DIGITAL_LEVELS = [
  { value: "solo", label: "Lo hago sin ayuda" },
  { value: "ayuda", label: "Lo hago, pero a veces necesito ayuda" },
  { value: "acomp", label: "Necesito que me acompañen" },
  { value: "nunca", label: "Todavía no lo hice" }
];
const NET_LEVELS = [
  { value: "buena", label: "Buena y estable" },
  { value: "regular", label: "Regular: funciona pero es lenta" },
  { value: "intermitente", label: "Se corta seguido" },
  { value: "sin", label: "No tengo conexión" }
];

const diagnosticSteps = [
  {
    id: "perfil",
    title: "Tu trabajo en la escuela",
    intro: "Esto sirve para sugerirte por dónde empezar.",
    questions: [
      { id: "role", type: "single", required: true, text: "¿Con qué perfil trabajás en la Libreta Digital?", options: [
        { value: "profesor", label: "Comunidad docente" },
        { value: "preceptor", label: "Personal de preceptoría" },
        { value: "directivo", label: "Equipo directivo" },
        { value: "varios", label: "Con más de un perfil" }
      ] },
      { id: "sgeUse", type: "single", required: true, text: "¿Ya usaste la Libreta Digital SGE?", options: [
        { value: "frecuente", label: "Sí, la uso con frecuencia" },
        { value: "algunas", label: "La usé algunas veces" },
        { value: "no", label: "Todavía no la usé" }
      ] }
    ]
  },
  {
    id: "digital",
    title: "Competencias digitales",
    intro: "Contanos cómo te llevás con estas tareas. No hay respuestas buenas o malas.",
    questions: [
      { id: "cidi", type: "single", required: true, text: "Ingresar con Ciudadano Digital (CiDi)", options: DIGITAL_LEVELS },
      { id: "tramites", type: "single", required: true, text: "Hacer trámites en línea", options: DIGITAL_LEVELS },
      { id: "planillas", type: "single", required: true, text: "Usar planillas de cálculo, por ejemplo Excel", options: DIGITAL_LEVELS },
      { id: "web", type: "single", required: true, text: "Navegar por sitios web y usar el celular para tareas de trabajo", options: DIGITAL_LEVELS }
    ]
  },
  {
    id: "context",
    title: "Dispositivos y conexión",
    intro: "Para pensar en qué formato te conviene capacitarte.",
    questions: [
      { id: "devices", type: "multi", text: "¿Qué dispositivos usás para trabajar?", options: [
        { value: "escritorio", label: "Computadora de escritorio" },
        { value: "notebook", label: "Notebook" },
        { value: "celular", label: "Teléfono celular" },
        { value: "tablet", label: "Tablet" }
      ] },
      { id: "schoolNet", type: "single", required: true, text: "En la escuela, la conexión a internet es…", options: NET_LEVELS },
      { id: "homeNet", type: "single", required: true, text: "En tu casa, la conexión a internet es…", options: NET_LEVELS },
      { id: "where", type: "single", required: true, text: "¿Dónde pensás hacer la capacitación?", options: [
        { value: "escuela", label: "En la escuela, entre actividades" },
        { value: "casa", label: "En mi casa" },
        { value: "movimiento", label: "En movimiento, por ejemplo camino a la escuela" },
        { value: "varios", label: "En distintos lugares" }
      ] }
    ]
  },
  {
    id: "barriers",
    title: "Dudas y expectativas",
    intro: "Lo que cuentes acá nos ayuda a acompañarte mejor.",
    questions: [
      { id: "fears", type: "multi", exclusive: "ninguna", text: "¿Qué te preocupa al usar el sistema o al capacitarte?", options: [
        { value: "perder", label: "Perder datos o información cargada" },
        { value: "nota", label: "Equivocarme al cargar una nota o una asistencia" },
        { value: "reglamento", label: "No conocer bien los reglamentos de evaluación" },
        { value: "tiempo", label: "No tener tiempo" },
        { value: "experiencia", label: "Tener poca experiencia con sistemas digitales" },
        { value: "lectura", label: "Me cuesta leer textos en pantalla" },
        { value: "ninguna", label: "Nada en particular" }
      ] },
      { id: "format", type: "multi", text: "¿Cómo te gusta aprender?", options: [
        { value: "leer", label: "Leyendo" },
        { value: "escuchar", label: "Escuchando" },
        { value: "practicar", label: "Practicando" },
        { value: "mirar", label: "Mirando videos" }
      ] },
      { id: "expect", type: "text", text: "¿Qué te gustaría que esta capacitación te resuelva? (opcional)", max: 300 }
    ]
  }
];

/* Etiquetas legibles de cada respuesta, para el resumen del portafolio. */
const diagnosticLabels = Object.fromEntries(diagnosticSteps.flatMap((step) => step.questions.map((question) => [
  question.id, { text: question.text, options: Object.fromEntries((question.options || []).map((option) => [option.value, option.label])) }
])));

/* Sugerencias a partir de las respuestas. Son reglas simples: no califican, orientan. */
function buildRecommendations(answers) {
  const picks = [];
  const has = (id, value) => (Array.isArray(answers[id]) ? answers[id].includes(value) : answers[id] === value);
  const lowDigital = ["cidi", "tramites", "planillas", "web"].filter((id) => ["acomp", "nunca"].includes(answers[id])).length;
  const net = [answers.schoolNet, answers.homeNet];

  if (["profesor", "preceptor", "directivo"].includes(answers.role)) {
    picks.push({ title: `Empezá por la ${roles[answers.role].routeTitle}`, text: `Es la ruta de tu perfil: ${roles[answers.role].name.toLowerCase()}.`, href: `#${answers.role}`, action: "Ir a la ruta" });
  } else if (answers.role === "varios") {
    picks.push({ title: "Elegí la ruta que más usás", text: "Podés recorrer más de una. Empezá por la tarea que más tiempo te lleva en el sistema.", href: "#inicio", action: "Ver las rutas" });
  }
  if (answers.sgeUse === "no") {
    picks.push({ title: "Seguí los módulos en orden", text: "Cada módulo empieza por lo básico: cómo llegar a la pantalla y qué significa cada cosa.", href: null });
  } else if (answers.sgeUse === "frecuente") {
    picks.push({ title: "Probá primero los chequeos", text: "Si ya conocés el sistema, los chequeos te muestran rápido qué reglas te conviene repasar.", href: null });
  }
  if (lowDigital >= 2) {
    picks.push({ title: "Avanzá con calma y pedí ayuda", text: "Usá el botón Ayuda en cualquier pantalla y, ante un problema de acceso, escribile al referente SGE de tu institución. En la barra de arriba podés agrandar el texto.", href: null });
  }
  if (net.some((value) => ["intermitente", "sin"].includes(value))) {
    picks.push({ title: "Descargá los materiales con buena conexión", text: "Los instructivos y los podcasts se pueden descargar para usarlos sin conexión.", href: "#recursos", action: "Ver instructivos" });
  }
  if (has("devices", "celular") && !has("devices", "escritorio") && !has("devices", "notebook")) {
    picks.push({ title: "Desde el celular", text: "Las lecciones y los chequeos se ven bien en el teléfono. Las planillas de práctica son anchas: deslizalas hacia los costados.", href: null });
  }
  if (has("format", "escuchar") || answers.where === "movimiento") {
    picks.push({ title: "Escuchá los podcasts", text: "Podés escucharlos en el camino. Además, el botón \"Leer página\" de la barra superior lee en voz alta el contenido de cada sección.", href: "#podcasts", action: "Ir a los podcasts" });
  }
  if (has("format", "practicar")) {
    picks.push({ title: "Practicá en el simulador", text: "Cada ruta tiene un área de práctica con datos ficticios donde podés equivocarte sin consecuencias.", href: null });
  }
  if (has("format", "mirar")) {
    picks.push({ title: "Videos", text: "Estamos preparando videos breves para el nivel secundario. Mientras tanto, las lecciones y los podcasts cubren los mismos temas.", href: null });
  }
  if (has("fears", "perder") || has("fears", "nota")) {
    picks.push({ title: "Practicar no toca datos reales", text: "Los simuladores trabajan con un curso ficticio y se pueden reiniciar cuando quieras. Equivocarte acá no afecta al SGE.", href: null });
  }
  if (has("fears", "reglamento")) {
    picks.push({ title: "Cada respuesta cita su fuente", text: "En los chequeos, la explicación indica de qué manual sale la regla, para que puedas leerla completa.", href: "#recursos", action: "Ver instructivos" });
  }
  if (has("fears", "lectura")) {
    picks.push({ title: "Texto más grande y lectura en voz alta", text: "En la barra superior podés cambiar el tamaño del texto y usar \"Leer página\".", href: null });
  }
  if (has("fears", "tiempo")) {
    picks.push({ title: "De a poco", text: "Los módulos son cortos y tu avance queda guardado: podés retomar donde dejaste.", href: null });
  }
  return picks;
}
