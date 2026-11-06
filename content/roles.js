/* Contenido del portal: rutas por perfil, preguntas frecuentes y documentos.
   Se carga como script clásico: lo declarado acá queda disponible para el resto de los scripts. */

const roles = {
  profesor: {
    name: "Comunidad docente",
    routeTitle: "Ruta de Docencia",
    intro: "Herramientas para registrar el progreso de tus estudiantes y acompañar sus trayectorias escolares."
  },
  preceptor: {
    name: "Personal de preceptoría",
    routeTitle: "Ruta de Acompañamiento",
    intro: "Recorré conceptos para registrar la asistencia, atender situaciones complejas y acompañar a cada estudiante."
  },
  directivo: {
    name: "Equipo directivo",
    routeTitle: "Ruta de Gestión Institucional",
    intro: "Conocé herramientas de consulta y gestión para acompañar los procesos institucionales de manera informada."
  }
};

const faqItems = [
  ["¿Este portal es el sistema SGE?", "No. Es un espacio de capacitación y práctica orientativa. No inicia sesión, no consulta datos reales y no guarda ni modifica información del SGE."],
  ["¿Qué hago si no puedo ingresar a la Libreta Digital?", "Contactá al referente SGE de tu institución o utilizá los canales oficiales de soporte de la autoridad educativa. No compartas contraseñas por canales no verificados."],
  ["¿Puedo corregir una calificación o un registro después de guardarlo?", "La posibilidad de edición puede depender del estado del período, los permisos y el procedimiento vigente. Consultá a tu institución antes de realizar cambios."],
  ["¿Qué significan DAA y Materias Previas?", "Son términos utilizados en el contexto educativo local. Para su aplicación en un caso concreto, verificá las definiciones y criterios vigentes con tu equipo institucional."],
  ["¿Cuándo una persona estudiante puede quedar libre?", "La situación depende de criterios y normas vigentes y no debe determinarse únicamente a partir de un ejemplo del portal. Consultá a los referentes institucionales."],
  ["¿Dónde encuentro los instructivos del SGE?", "En la sección Recursos podés ver y descargar los instructivos del Ministerio de Educación de Córdoba que usa este portal, con su autoría indicada. Para la versión vigente de los manuales y para los videos oficiales, consultá cba.gov.ar/gestion-estudiantes o al referente SGE de tu escuela."],
  ["¿El simulador guarda lo que escribo?", "Los simuladores no envían información al SGE. El cuaderno de calificaciones y la asistencia de práctica sí se guardan localmente en este navegador para que puedas revisar los ejemplos; podés eliminarlos desde esta página. Usá únicamente datos ficticios."]
];

/* Instructivos del SGE. `source` indica la autoría tal como figura en cada PDF;
   `license` solo se completa cuando el propio documento declara una. */
const documents = {
  calificaciones: {
    title: "Registrar calificaciones",
    file: "public/309-Registrar-Calificaciones-2.pdf",
    source: "Instructivo del Sistema Gestión Estudiantes · Nivel Secundario",
    license: ""
  },
  ipe: {
    title: "Finalizar IPE",
    file: "public/303-Finalizar IPE.pdf",
    source: "Dirección de Sistemas y Modernización · Ministerio de Educación de Córdoba",
    license: "Licencia CC BY-NC-SA 4.0"
  },
  asistencias: {
    title: "Gestionar asistencias",
    file: "public/018-Gestionar-Asistencias.pdf",
    source: "Dirección de Sistemas · Ministerio de Educación de Córdoba",
    license: "",
    access: "Este PDF está hecho de imágenes: un lector de pantalla no puede leerlo. Lo que explica está resumido en las lecciones de la ruta de Preceptoría."
  }
};

const demoStudents = ["Lucía Martínez", "Tomás Pérez", "Sofía Gómez", "Mateo Rodríguez", "Valentina Díaz", "Joaquín López"];
const demoSubjects = ["Matemática", "Lengua y Literatura", "Ciencias Sociales", "Ciencias Naturales", "Inglés", "Educación Física"];
