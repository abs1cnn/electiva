const roles = {
  profesor: {
    name: "Profesor/a",
    kicker: "RUTA DE APRENDIZAJE · DOCENCIA",
    intro: "Herramientas para registrar el progreso de tus estudiantes y acompañar sus trayectorias escolares.",
    modules: [
      ["Navegación y registro", "Conocé el recorrido de consulta de cursos y espacios curriculares. Identificá dónde se encuentra la información necesaria antes de iniciar una carga.", "Revisá que estés trabajando con el curso y el espacio curricular correctos. Consultá las pautas institucionales antes de registrar información.", "calificaciones"],
      ["Casos especiales", "Repasá situaciones que requieren atención, como Materias Previas, DAA y el seguimiento de trayectorias con información pendiente.", "Verificá los antecedentes y consultá al equipo institucional ante dudas. No des por cerrada una trayectoria sin corroborar los criterios vigentes."],
      ["Edición y cierre", "Practicá la revisión de una calificación antes del cierre y conocé qué tener en cuenta si necesitás solicitar una corrección posterior.", "Antes de confirmar, revisá estudiante, período y valor. Si el período está cerrado o la edición no está habilitada, seguí el circuito institucional de consulta.", "ipe"]
    ],
    simulator: {
      title: "Carga y revisión de calificación",
      description: "Completá el ejemplo con datos ficticios para practicar una revisión antes de confirmar.",
      fields: [
        ["student", "Estudiante de ejemplo", "input", "Lucía Martínez"],
        ["subject", "Espacio curricular", "input", "Matemática"],
        ["grade", "Calificación", "select", ["Seleccionar", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]],
        ["period", "Período", "select", ["Seleccionar", "Primer período", "Segundo período", "Tercer período"]]
      ],
      button: "Revisar carga",
      resultTitle: "Revisión previa",
      result: (values) => values.grade && values.period
        ? `Ejemplo listo: ${values.student || "Estudiante de ejemplo"} · ${values.subject || "Espacio curricular"} · ${values.grade}/10 · ${values.period}. En el sistema real, verificá los datos antes de guardar.`
        : "Completá la calificación y el período para revisar el ejemplo. En el sistema real, una modificación posterior puede requerir autorización o un circuito institucional."
    }
  },
  preceptor: {
    name: "Preceptor/a",
    kicker: "RUTA DE APRENDIZAJE · ACOMPAÑAMIENTO",
    intro: "Recorré conceptos para registrar la asistencia, atender situaciones complejas y acompañar a cada estudiante.",
    modules: [
      ["Registro diario", "Organizá la consulta del curso y el registro de asistencia del día. Reconocé por qué es importante verificar fecha, división y nómina.", "Antes de iniciar, confirmá el curso, la división y la fecha seleccionada. Seguí el procedimiento definido por tu institución para completar el registro.", "asistencias"],
      ["Inasistencias y justificaciones", "Considerá cómo dar seguimiento a inasistencias combinadas y documentación presentada fuera de término, sin perder de vista la trayectoria del estudiante.", "Registrá la información según los criterios institucionales. Si una justificación tardía modifica un dato ya consolidado, consultá el circuito de corrección."],
      ["Monitoreo de trayectorias", "Usá la información disponible para identificar alertas de asistencia y conversar con los equipos responsables del acompañamiento.", "Un indicador requiere contexto: contrastá la información y articulá con los referentes escolares antes de tomar decisiones sobre la trayectoria."]
    ],
    simulator: {
      title: "Seguimiento de asistencia",
      description: "Explorá un caso ficticio con inasistencias y documentación pendiente.",
      fields: [
        ["student", "Estudiante de ejemplo", "input", "Tomás Pérez"],
        ["absences", "Inasistencias registradas", "select", ["Seleccionar", "1", "2", "3", "5", "10"]],
        ["type", "Situación", "select", ["Seleccionar", "Inasistencias consecutivas", "Inasistencias alternadas", "Justificación presentada tarde"]],
        ["status", "Documentación", "select", ["Seleccionar", "Pendiente de revisión", "Presentada", "No corresponde"]]
      ],
      button: "Analizar caso",
      resultTitle: "Orientación para el seguimiento",
      result: (values) => values.absences && values.type
        ? `Caso de práctica: ${values.student || "Estudiante de ejemplo"} registra ${values.absences} inasistencia(s) (${values.type.toLowerCase()}). Documentación: ${(values.status || "sin indicar").toLowerCase()}. Contrastá los registros y consultá los criterios institucionales.`
        : "Seleccioná la cantidad y la situación para analizar el ejemplo. El sistema real puede aplicar criterios y circuitos institucionales específicos."
    }
  },
  directivo: {
    name: "Directivo/a",
    kicker: "RUTA DE APRENDIZAJE · GESTIÓN INSTITUCIONAL",
    intro: "Conocé herramientas de consulta y gestión para acompañar los procesos institucionales de manera informada.",
    modules: [
      ["Tablero de control", "Interpretá la información general disponible para orientar el seguimiento de cursos, asistencia y procesos pendientes.", "Tomá los indicadores como punto de partida. Verificá su alcance, fecha de actualización y contexto antes de comunicar conclusiones."],
      ["Gestión de accesos", "Revisá principios de gestión responsable de usuarios y permisos para que cada integrante acceda a las funciones que necesita.", "Asigná los permisos según el rol y las responsabilidades. Ante un acceso incorrecto, utilizá el canal institucional habilitado para solicitar asistencia."],
      ["Actas y períodos", "Acompañá la consulta de actas y comprendé qué implica un período cerrado y cuándo corresponde gestionar una solicitud de reapertura.", "Antes de gestionar una reapertura, verificá el período y la necesidad institucional. La habilitación depende de permisos y procedimientos vigentes."]
    ],
    simulator: {
      title: "Solicitud de revisión de período",
      description: "Practicá una verificación previa con datos de una institución ficticia.",
      fields: [
        ["school", "Institución de ejemplo", "input", "Escuela Provincial 123"],
        ["period", "Período", "select", ["Seleccionar", "Primer período", "Segundo período", "Cierre anual"]],
        ["reason", "Motivo de revisión", "select", ["Seleccionar", "Corrección de registro", "Carga pendiente", "Revisión de acta"]],
        ["confirmed", "¿Verificaste los datos?", "select", ["Seleccionar", "Sí, datos revisados", "Necesito verificar"]]
      ],
      button: "Revisar solicitud",
      resultTitle: "Control previo",
      result: (values) => values.period && values.reason
        ? `${values.confirmed === "Sí, datos revisados" ? "Verificación previa completa" : "Falta verificar los datos"} para ${values.school || "la institución de ejemplo"} · ${values.period} · ${values.reason.toLowerCase()}. La reapertura real depende de los permisos y del circuito institucional.`
        : "Elegí el período y el motivo para revisar el caso de práctica. Este formulario no modifica períodos ni solicita accesos en el SGE."
    }
  }
};

const faqItems = [
  ["¿Este portal es el sistema SGE?", "No. Es un espacio de capacitación y práctica orientativa. No inicia sesión, no consulta datos reales y no guarda ni modifica información del SGE."],
  ["¿Qué hago si no puedo ingresar a la Libreta Digital?", "Contactá al referente SGE de tu institución o utilizá los canales oficiales de soporte de la autoridad educativa. No compartas contraseñas por canales no verificados."],
  ["¿Puedo corregir una calificación o un registro después de guardarlo?", "La posibilidad de edición puede depender del estado del período, los permisos y el procedimiento vigente. Consultá a tu institución antes de realizar cambios."],
  ["¿Qué significan DAA y Materias Previas?", "Son términos utilizados en el contexto educativo local. Para su aplicación en un caso concreto, verificá las definiciones y criterios vigentes con tu equipo institucional."],
  ["¿Cuándo un estudiante puede quedar libre?", "La situación depende de criterios y normas vigentes y no debe determinarse únicamente a partir de un ejemplo del portal. Consultá a los referentes institucionales."],
  ["¿Dónde encuentro los manuales y videos oficiales?", "Consultá los canales institucionales vigentes de la autoridad educativa o solicitá orientación al referente SGE de tu escuela. Este portal no aloja materiales oficiales."],
  ["¿El simulador guarda lo que escribo?", "Los simuladores no envían información al SGE. El cuaderno de calificaciones y la asistencia de práctica sí se guardan localmente en este navegador para que puedas revisar los ejemplos; podés eliminarlos desde esta página. Usá únicamente datos ficticios."],
];

const views = {
  inicio: document.querySelector(".home-view"),
  role: document.querySelector("#role-view"),
  recursos: document.querySelector("#recursos"),
  ayuda: document.querySelector("#ayuda")
};
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("#search-results");
const storageKey = "sge-portal-demo-v1";
const emptyState = () => ({
  completed: { profesor: [false, false, false], preceptor: [false, false, false], directivo: [false, false, false] },
  grades: [],
  attendance: [],
  periodOpen: false,
  accessEnabled: [true, true, true]
});
let portalState = loadPortalState();
let currentRole = null;

function loadPortalState() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return emptyState();
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") throw new Error("El contenido guardado no tiene un formato válido.");
    const defaults = emptyState();
    return {
      completed: Object.fromEntries(Object.keys(defaults.completed).map((role) => [
        role,
        Array.from({ length: 3 }, (_, index) => parsed.completed?.[role]?.[index] === true)
      ])),
      grades: Array.isArray(parsed.grades) ? parsed.grades : [],
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
      periodOpen: parsed.periodOpen === true,
      accessEnabled: Array.from({ length: 3 }, (_, index) => parsed.accessEnabled?.[index] !== false)
    };
  } catch (error) {
    showNotice(`No se pudo leer el progreso guardado: ${error.message} Se iniciará una sesión nueva.`);
    return emptyState();
  }
}

function savePortalState(message = "Cambios guardados en este navegador.") {
  try {
    localStorage.setItem(storageKey, JSON.stringify(portalState));
    showNotice(message);
    renderHomeProgress();
    if (currentRole) renderRoleProgress(currentRole);
    return true;
  } catch (error) {
    showNotice(`No se pudo guardar el cambio en este navegador: ${error.message}`);
    return false;
  }
}

let noticeTimer;
function showNotice(message) {
  const notice = document.querySelector("#site-notice");
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 5000);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

const documents = {
  calificaciones: { title: "Registrar calificaciones", file: "public/309-Registrar-Calificaciones-2.pdf" },
  ipe: { title: "Finalizar IPE", file: "public/303-Finalizar IPE.pdf" },
  asistencias: { title: "Gestionar asistencias", file: "public/018-Gestionar-Asistencias.pdf" }
};

function renderDocCard(key) {
  const doc = documents[key];
  if (!doc) return "";
  const href = encodeURI(doc.file);
  return `<div class="doc-card">
    <span class="doc-icon" aria-hidden="true"><svg viewBox="0 0 32 40"><path d="M3 1h18l8 8v28a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="#fff" stroke="#d7dcd4" stroke-width="1.5"/><path d="M21 1v6a2 2 0 0 0 2 2h6" fill="none" stroke="#d7dcd4" stroke-width="1.5"/><rect x="0" y="22" width="22" height="11" rx="2" fill="#c8483b"/><text x="11" y="30.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff" font-family="Arial, sans-serif">PDF</text></svg></span>
    <span class="doc-info"><span class="doc-kicker">INSTRUCTIVO</span><strong>${escapeHTML(doc.title)}</strong><small>${escapeHTML(doc.file.split("/").pop())}</small></span>
    <span class="doc-actions"><button type="button" class="doc-button" data-doc-preview="${key}">Vista previa</button><a class="doc-button doc-button-primary" href="${href}" download>Descargar ↓</a></span>
  </div>`;
}

function openDocViewer(key) {
  const doc = documents[key];
  const viewer = document.querySelector("#doc-viewer");
  document.querySelector("#doc-viewer-title").textContent = doc.title;
  document.querySelector("#doc-viewer-download").href = encodeURI(doc.file);
  document.querySelector("#doc-viewer-frame").src = encodeURI(doc.file);
  viewer.showModal();
}

function closeDocViewer() {
  document.querySelector("#doc-viewer").close();
}

document.querySelectorAll("[data-docs]").forEach((list) => {
  list.innerHTML = list.dataset.docs.split(" ").map(renderDocCard).join("");
});
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-doc-preview]");
  if (trigger) openDocViewer(trigger.dataset.docPreview);
});
document.querySelector("#doc-viewer-close").addEventListener("click", closeDocViewer);
document.querySelector("#doc-viewer").addEventListener("click", (event) => {
  if (event.target.id === "doc-viewer") closeDocViewer();
});
document.querySelector("#doc-viewer").addEventListener("close", () => {
  document.querySelector("#doc-viewer-frame").src = "about:blank";
});

function renderHomeProgress() {
  const container = document.querySelector("#home-progress-list");
  container.innerHTML = Object.entries(roles).map(([key, role]) => {
    const done = portalState.completed[key].filter(Boolean).length;
    const percent = Math.round(done / role.modules.length * 100);
    return `<a href="#${key}" class="home-progress-item">
      <span class="home-progress-title">${role.name}<b>${done}/${role.modules.length}</b></span>
      <span class="progress-track"><span style="width:${percent}%"></span></span>
    </a>`;
  }).join("");
}

function renderRoleProgress(roleKey) {
  const done = portalState.completed[roleKey].filter(Boolean).length;
  const percent = Math.round(done / roles[roleKey].modules.length * 100);
  document.querySelector("#role-progress").innerHTML = `
    <div class="role-progress-copy"><strong>${done} de 3 módulos completados</strong><span>Tu avance se conserva en este navegador.</span></div>
    <div class="role-progress-track" role="progressbar" aria-label="Progreso de la ruta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>
    <button type="button" class="text-button" id="reset-role-progress">Reiniciar ruta</button>`;
}

function renderRole(roleKey) {
  const role = roles[roleKey];
  if (!role) return false;
  currentRole = roleKey;
  document.querySelector("#role-banner-kicker").textContent = role.kicker;
  document.querySelector("#role-title").textContent = `Ruta para ${role.name}`;
  document.querySelector("#role-intro").textContent = role.intro;
  document.querySelector("#module-list").innerHTML = role.modules.map((module, index) => `
    <article class="module-card" id="modulo-${index + 1}">
      <div class="module-top"><span class="module-index">0${index + 1}</span><span class="module-tag">MÓDULO ${index + 1}</span></div>
      <h3>${module[0]}</h3><p>${module[1]}</p>
      <details><summary>Ver recomendación</summary><p>${module[2]}</p></details>
      ${module[3] ? renderDocCard(module[3]) : ""}
      <label class="module-complete"><input type="checkbox" data-module-complete="${index}" ${portalState.completed[roleKey][index] ? "checked" : ""}><span>Marcar como completado</span></label>
    </article>`).join("");
  renderRoleProgress(roleKey);
  renderWorkspace(roleKey);
  document.querySelectorAll("[data-module-complete]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    portalState.completed[roleKey][Number(checkbox.dataset.moduleComplete)] = checkbox.checked;
    savePortalState(checkbox.checked ? "Módulo marcado como completado." : "Módulo quitado de completados.");
  }));
  document.querySelector("#reset-role-progress").addEventListener("click", () => {
    portalState.completed[roleKey] = [false, false, false];
    savePortalState("Se reinició el progreso de esta ruta.");
    renderRole(roleKey);
  });
  document.querySelector("#simulator-title").textContent = role.simulator.title;
  document.querySelector("#simulator-description").textContent = role.simulator.description;
  renderSimulator(role.simulator);
  return true;
}

const demoStudents = ["Lucía Martínez", "Tomás Pérez", "Sofía Gómez", "Mateo Rodríguez", "Valentina Díaz", "Joaquín López"];
const demoSubjects = ["Matemática", "Lengua y Literatura", "Ciencias Sociales", "Ciencias Naturales", "Inglés", "Educación Física"];

function renderWorkspace(roleKey) {
  const workspace = document.querySelector("#workspace-section");
  if (roleKey === "profesor") renderGradebook(workspace);
  if (roleKey === "preceptor") renderAttendance(workspace);
  if (roleKey === "directivo") renderManagement(workspace);
}

function renderGradebook(workspace) {
  const rows = portalState.grades.slice().reverse();
  workspace.innerHTML = `
    <div class="workspace-heading"><div><span class="section-kicker">REGISTRO DE PRÁCTICA</span><h2>Cuaderno de calificaciones</h2><p>Agregá calificaciones ficticias y revisá el historial que guardaste localmente.</p></div>
      <button type="button" class="secondary-button" id="export-grades" ${rows.length ? "" : "disabled"}>Descargar CSV ↓</button>
    </div>
    <form id="gradebook-form" class="workspace-form">
      <div class="field"><label for="grade-student">Estudiante</label><select id="grade-student" name="student" required>${demoStudents.map((name) => `<option>${name}</option>`).join("")}</select></div>
      <div class="field"><label for="grade-subject">Espacio curricular</label><select id="grade-subject" name="subject" required>${demoSubjects.map((name) => `<option>${name}</option>`).join("")}</select></div>
      <div class="field"><label for="grade-period">Período</label><select id="grade-period" name="period" required><option value="">Seleccionar</option><option>Primer período</option><option>Segundo período</option><option>Tercer período</option></select></div>
      <div class="field"><label for="grade-value">Calificación</label><select id="grade-value" name="grade" required><option value="">Seleccionar</option>${Array.from({ length: 10 }, (_, index) => `<option>${index + 1}</option>`).join("")}</select></div>
      <button class="simulator-submit" type="submit">Guardar en mi práctica <span aria-hidden="true">→</span></button>
    </form>
    <div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Espacio curricular</th><th>Período</th><th>Nota</th><th></th></tr></thead>
      <tbody>${rows.length ? rows.map((item) => `<tr><td>${escapeHTML(item.student)}</td><td>${escapeHTML(item.subject)}</td><td>${escapeHTML(item.period)}</td><td><span class="grade-chip">${escapeHTML(item.grade)}</span></td><td><button type="button" class="row-action" data-delete-grade="${escapeHTML(item.id)}" aria-label="Eliminar registro de ${escapeHTML(item.student)}">Eliminar</button></td></tr>`).join("") : '<tr><td colspan="5" class="empty-row">Todavía no agregaste registros de práctica.</td></tr>'}</tbody></table></div>
    <p class="workspace-note">Estudiantes y registros son ficticios. Los cambios no se envían al sistema SGE.</p>`;
  workspace.querySelector("#gradebook-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    portalState.grades.push({ ...data, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
    savePortalState("Calificación agregada a tu cuaderno local.");
    renderGradebook(workspace);
  });
  workspace.querySelectorAll("[data-delete-grade]").forEach((button) => button.addEventListener("click", () => {
    portalState.grades = portalState.grades.filter((item) => item.id !== button.dataset.deleteGrade);
    savePortalState("Registro eliminado del cuaderno local.");
    renderGradebook(workspace);
  }));
  workspace.querySelector("#export-grades").addEventListener("click", exportGrades);
}

function exportGrades() {
  if (!portalState.grades.length) return;
  const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [["Estudiante", "Espacio curricular", "Período", "Calificación"], ...portalState.grades.map(({ student, subject, period, grade }) => [student, subject, period, grade])]
    .map((row) => row.map(quote).join(";"));
  const url = URL.createObjectURL(new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "cuaderno-de-practica-sge.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function localDateValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderAttendance(workspace) {
  const recent = portalState.attendance.slice().reverse().slice(0, 12);
  const latestDay = portalState.attendance.at(-1);
  const practiceDate = latestDay?.date || localDateValue();
  const practiceClass = latestDay?.classroom || "3.º año · División A";
  const draftDay = portalState.attendance.find((item) => item.date === practiceDate && item.classroom === practiceClass);
  workspace.innerHTML = `
    <div class="workspace-heading"><div><span class="section-kicker">REGISTRO DE PRÁCTICA</span><h2>Asistencia del curso</h2><p>Seleccioná la condición de cada estudiante y guardá el registro de ejemplo.</p></div></div>
    <form id="attendance-form" class="attendance-form">
      <div class="attendance-controls">
        <div class="field"><label for="attendance-date">Fecha</label><input id="attendance-date" name="date" type="date" value="${escapeHTML(practiceDate)}" required></div>
        <div class="field"><label for="attendance-class">Curso y división</label><select id="attendance-class" name="classroom"><option ${practiceClass === "3.º año · División A" ? "selected" : ""}>3.º año · División A</option><option ${practiceClass === "2.º año · División B" ? "selected" : ""}>2.º año · División B</option><option ${practiceClass === "4.º año · División A" ? "selected" : ""}>4.º año · División A</option></select></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Estudiante de ejemplo</th><th>Condición</th></tr></thead><tbody>
        ${demoStudents.map((name, index) => `<tr><td>${name}</td><td><select name="student-${index}" aria-label="Condición de ${name}"><option ${draftDay?.statuses?.[index] === "Presente" ? "selected" : ""}>Presente</option><option ${draftDay?.statuses?.[index] === "Ausente" ? "selected" : ""}>Ausente</option><option ${draftDay?.statuses?.[index] === "Tarde" ? "selected" : ""}>Tarde</option></select></td></tr>`).join("")}
      </tbody></table></div>
      <button class="simulator-submit" type="submit">Guardar asistencia de práctica <span aria-hidden="true">→</span></button>
    </form>
    <div class="attendance-summary" id="attendance-summary">${attendanceSummary(null, draftDay?.statuses)}</div>
    <h3 class="history-heading">Últimos registros guardados</h3>
    <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Curso</th><th>Presentes</th><th>Ausentes</th><th>Tarde</th><th></th></tr></thead><tbody>
      ${recent.length ? recent.map((day) => `<tr><td>${escapeHTML(day.date)}</td><td>${escapeHTML(day.classroom)}</td><td>${day.counts.Presente}</td><td>${day.counts.Ausente}</td><td>${day.counts.Tarde}</td><td><button type="button" class="row-action" data-delete-attendance="${escapeHTML(day.id || "")}" aria-label="Eliminar registro de asistencia del ${escapeHTML(day.date)}">Eliminar</button></td></tr>`).join("") : '<tr><td colspan="6" class="empty-row">Todavía no guardaste registros de práctica.</td></tr>'}
    </tbody></table></div>
    <p class="workspace-note">Nómina ficticia de ejemplo. No se registra asistencia real ni se sincroniza con el SGE.</p>`;
  workspace.querySelectorAll('#attendance-form select[name^="student-"]').forEach((select) => select.addEventListener("change", () => {
    document.querySelector("#attendance-summary").innerHTML = attendanceSummary(new FormData(workspace.querySelector("#attendance-form")));
  }));
  workspace.querySelector("#attendance-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const statuses = demoStudents.map((_, index) => formData.get(`student-${index}`));
    const day = { date: formData.get("date"), classroom: formData.get("classroom"), statuses, counts: { Presente: 0, Ausente: 0, Tarde: 0 } };
    statuses.forEach((status) => { day.counts[status] += 1; });
    portalState.attendance = portalState.attendance.filter((item) => item.date !== day.date || item.classroom !== day.classroom);
    day.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    portalState.attendance.push(day);
    savePortalState("Asistencia de ejemplo guardada en este navegador.");
    renderAttendance(workspace);
  });
  workspace.querySelectorAll("[data-delete-attendance]").forEach((button) => button.addEventListener("click", () => {
    portalState.attendance = portalState.attendance.filter((item) => item.id !== button.dataset.deleteAttendance);
    savePortalState("Registro de asistencia eliminado.");
    renderAttendance(workspace);
  }));
}

function attendanceSummary(formData = null, savedStatuses = null) {
  const counts = { Presente: 0, Ausente: 0, Tarde: 0 };
  demoStudents.forEach((_, index) => {
    const status = formData?.get(`student-${index}`) || savedStatuses?.[index] || "Presente";
    counts[status] += 1;
  });
  return `<span>${counts.Presente} presentes</span><span>${counts.Ausente} ausentes</span><span>${counts.Tarde} tarde</span>`;
}

function renderManagement(workspace) {
  const accessRows = ["Profesor/a", "Preceptor/a", "Equipo directivo"];
  workspace.innerHTML = `
    <div class="workspace-heading"><div><span class="section-kicker">PANEL DE PRÁCTICA</span><h2>Resumen institucional de ejemplo</h2><p>Explorá indicadores ficticios y practicá acciones de gestión sin afectar datos reales.</p></div><span class="demo-label">DATOS DE DEMOSTRACIÓN</span></div>
    <div class="metric-grid">
      <article class="metric-card"><span>Estudiantes</span><strong>384</strong><small>matrícula ilustrativa</small></article>
      <article class="metric-card"><span>Asistencia del mes</span><strong>92%</strong><small>indicador ilustrativo</small></article>
      <article class="metric-card"><span>Registros pendientes</span><strong>12</strong><small>requieren revisión de ejemplo</small></article>
      <article class="metric-card"><span>Período</span><strong>${portalState.periodOpen ? "Abierto" : "Cerrado"}</strong><small>estado local del simulador</small></article>
    </div>
    <div class="management-grid">
      <section class="management-panel"><div class="panel-heading"><div><span class="section-kicker">PERÍODO ACADÉMICO</span><h3>Control de apertura</h3></div><span class="state-pill ${portalState.periodOpen ? "state-open" : ""}">${portalState.periodOpen ? "Abierto" : "Cerrado"}</span></div>
        <p>Practicá el cambio de estado local. En un sistema real, la apertura depende de permisos y circuitos autorizados.</p>
        <button type="button" class="secondary-button" id="toggle-period">${portalState.periodOpen ? "Simular cierre de período" : "Simular apertura de período"}</button>
      </section>
      <section class="management-panel"><div class="panel-heading"><div><span class="section-kicker">ACCESOS POR ROL</span><h3>Permisos de ejemplo</h3></div></div>
        <div class="access-list">${accessRows.map((role, index) => `<div class="access-row"><span>${role}</span><button type="button" class="toggle-button ${portalState.accessEnabled[index] ? "is-enabled" : ""}" data-access-index="${index}" aria-pressed="${portalState.accessEnabled[index]}">${portalState.accessEnabled[index] ? "Habilitado" : "Deshabilitado"}</button></div>`).join("")}</div>
      </section>
    </div>
    <p class="workspace-note">Los indicadores son inventados para la práctica. Los controles modifican únicamente el estado local de esta demostración.</p>`;
  workspace.querySelector("#toggle-period").addEventListener("click", () => {
    portalState.periodOpen = !portalState.periodOpen;
    savePortalState("Estado de período de demostración actualizado.");
    renderManagement(workspace);
  });
  workspace.querySelectorAll("[data-access-index]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.accessIndex);
    portalState.accessEnabled[index] = !portalState.accessEnabled[index];
    savePortalState("Permiso de demostración actualizado.");
    renderManagement(workspace);
  }));
}

function renderSimulator(simulator) {
  const fields = simulator.fields.map(([name, label, type, value]) => {
    const control = type === "select"
      ? `<select name="${name}" id="sim-${name}">${value.map((option, index) => `<option value="${index === 0 ? "" : option}">${option}</option>`).join("")}</select>`
      : `<input name="${name}" id="sim-${name}" type="text" value="${value}" maxlength="80">`;
    return `<div class="field"><label for="sim-${name}">${label}</label>${control}</div>`;
  }).join("");
  document.querySelector("#simulator-content").innerHTML = `
    <form class="simulator-layout" id="simulator-form" novalidate>
      <div class="simulator-fields">${fields}<button class="simulator-submit" type="submit">${simulator.button} <span aria-hidden="true">→</span></button></div>
      <div class="simulator-result" id="simulator-result" role="status" aria-live="polite"><strong>${simulator.resultTitle}</strong><p>Completá los datos para ver una orientación sobre este caso de ejemplo.</p></div>
    </form>`;
  document.querySelector("#simulator-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = document.querySelector("#simulator-result");
    result.classList.add("is-active");
    result.querySelector("p").textContent = simulator.result(values);
  });
}

function renderFaq() {
  document.querySelector("#faq-list").innerHTML = faqItems.map(([question, answer]) =>
    `<details class="faq-item"><summary>${question}</summary><p>${answer}</p></details>`).join("");
}

function showView(viewName, roleKey = null) {
  Object.values(views).forEach((view) => { view.hidden = true; });
  if (viewName === "role" && !renderRole(roleKey)) viewName = "inicio";
  views[viewName].hidden = false;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === viewName) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  currentRole = viewName === "role" ? roleKey : null;
  searchResults.hidden = true;
  if (viewName !== "inicio") window.scrollTo({ top: 0, behavior: "smooth" });
}

function routeFromHash() {
  const parts = decodeURIComponent(location.hash.slice(1)).split("#");
  const route = parts[0] || "inicio";
  if (roles[route]) {
    showView("role", route);
    if (parts[1]) requestAnimationFrame(() => document.getElementById(parts[1])?.scrollIntoView({ behavior: "smooth" }));
  } else if (route === "recursos" || route === "ayuda") showView(route);
  else showView("inicio");
}

function buildSearchIndex() {
  const entries = [];
  Object.entries(roles).forEach(([roleKey, role]) => {
    role.modules.forEach((module, index) => entries.push({
      title: module[0],
      description: `${role.name} · ${module[1]} ${module[2]} ${roleKey === "profesor" ? "nota notas calificacion calificaciones" : ""} ${roleKey === "preceptor" ? "inasistencia ausencias asistencia justificacion" : ""} ${roleKey === "directivo" ? "tablero accesos actas periodos" : ""}`,
      href: `#${roleKey}#modulo-${index + 1}`, category: role.name
    }));
    entries.push({ title: role.simulator.title, description: `${role.name} · ${role.simulator.description}`, href: `#${roleKey}#simulador`, category: "Simulador" });
  });
  faqItems.forEach(([title, description]) => entries.push({ title, description, href: "#ayuda", category: "Preguntas frecuentes" }));
  entries.push({ title: "Centro de recursos", description: "Microguías de calificaciones, asistencia y tablero institucional.", href: "#recursos", category: "Recursos" });
  return entries;
}
const searchIndex = buildSearchIndex();

function runSearch() {
  const normalize = (text) => text.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const query = normalize(searchInput.value.trim());
  if (!query) {
    searchResults.innerHTML = '<div class="search-empty">Escribí una palabra o tema para buscar.</div>';
  } else {
    const terms = query.split(/\s+/);
    const matches = searchIndex.filter((item) => {
      const text = normalize(`${item.title} ${item.description} ${item.category}`);
      return terms.every((term) => text.includes(term));
    }).slice(0, 6);
    searchResults.innerHTML = matches.length
      ? matches.map((item, index) => `<button type="button" class="search-result" data-result="${index}"><strong>${item.title}</strong><span>${item.category}</span></button>`).join("")
      : '<div class="search-empty">No encontramos resultados. Probá con “asistencia”, “calificación” o “actas”.</div>';
    searchResults.querySelectorAll("[data-result]").forEach((button, index) => {
      button.addEventListener("click", () => {
        const chosen = matches[index];
        location.hash = chosen.href;
      });
    });
  }
  searchResults.hidden = false;
}

document.querySelector("#search-button").addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") { event.preventDefault(); runSearch(); }
  if (event.key === "Escape") searchResults.hidden = true;
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-control")) searchResults.hidden = true;
});
document.querySelectorAll("[data-role]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = link.getAttribute("href");
}));
document.querySelectorAll("[data-resource-role]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = link.getAttribute("href");
}));
window.addEventListener("hashchange", routeFromHash);
renderFaq();
renderHomeProgress();
routeFromHash();
