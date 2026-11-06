/* Estado del portal (localStorage). Versión 2.
   Lee también el formato de la versión 1 sin borrarlo. */

const storageKey = "sge-portal-v2";
const legacyStorageKey = "sge-portal-demo-v1";
const ROLE_KEYS = ["profesor", "preceptor", "directivo"];
const PERIOD_STATES = ["abierto", "en revisión", "cerrado"];

const newStage = () => ({ notes: Array(NOTES_PER_STAGE).fill(null), avg: null, res: "", closed: false });
const newCell = () => ({ e: [newStage(), newStage()], exim: false });
const newSim = () => ({ cells: {}, ipe: { finalized: false, observation: "", absencesRegistered: false } });

const emptyState = () => ({
  version: 2,
  // quiz: { attempts: [{ score, total, missed: [concepto], at }], passed, weak: [concepto] } | null
  modules: Object.fromEntries(ROLE_KEYS.map((role) => [role, [0, 1, 2].map(() => ({ quiz: null }))])),
  practice: {},          // { [flag]: true } acciones realizadas en los simuladores
  diagnostic: null,
  // finalExam: attempts [{ at, mode: "full"|"refuerzo", score, total, byConcept: { concepto: { correct, total } }, passed }], seen: [ids de preguntas ya vistas]
  finalExam: Object.fromEntries(ROLE_KEYS.map((role) => [role, { attempts: [], seen: [] }])),
  learnerName: "",       // nombre opcional para la constancia (solo en este navegador)
  sim: newSim(),         // curso de práctica compartido (calificaciones, estados, IPE)
  attendance: [],        // registros de asistencia de práctica
  periodState: "cerrado",
  accessEnabled: [true, true, true]
});

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

function normalizeStage(saved) {
  const stage = newStage();
  if (!isObject(saved)) return stage;
  if (Array.isArray(saved.notes)) {
    stage.notes = Array.from({ length: NOTES_PER_STAGE }, (_, i) => {
      const n = saved.notes[i];
      return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
    });
  }
  stage.avg = saved.avg === "A" ? "A" : (typeof saved.avg === "number" && Number.isFinite(saved.avg) ? saved.avg : null);
  stage.res = typeof saved.res === "string" ? saved.res.slice(0, 40) : "";
  stage.closed = saved.closed === true;
  return stage;
}

function normalizeSim(saved) {
  const sim = newSim();
  if (!isObject(saved)) return sim;
  if (isObject(saved.cells)) {
    Object.entries(saved.cells).forEach(([key, cell]) => {
      if (!/^\d+\|\d+$/.test(key) || !isObject(cell)) return;
      sim.cells[key] = { e: [normalizeStage(cell.e?.[0]), normalizeStage(cell.e?.[1])], exim: cell.exim === true };
    });
  }
  if (isObject(saved.ipe)) {
    sim.ipe = {
      finalized: saved.ipe.finalized === true,
      observation: typeof saved.ipe.observation === "string" ? saved.ipe.observation.slice(0, 300) : "",
      absencesRegistered: saved.ipe.absencesRegistered === true
    };
  }
  return sim;
}

/* La versión anterior guardaba tres condiciones ("Tarde"); ahora son las cinco del manual 018. */
function normalizeAttendance(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(isObject).map((day) => {
    const statuses = (Array.isArray(day.statuses) ? day.statuses : []).map((s) => s === "Tarde" ? "Llegada tarde" : (ATTENDANCE_CONDITIONS.includes(s) ? s : "Presente"));
    const counts = Object.fromEntries(ATTENDANCE_CONDITIONS.map((c) => [c, statuses.filter((s) => s === c).length]));
    return { id: String(day.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`), date: String(day.date || ""), classroom: String(day.classroom || ATTENDANCE_CLASSES[0]), statuses, counts };
  });
}

/* Diagnóstico: solo se aceptan las preguntas conocidas, con valores cortos. */
function normalizeDiagnostic(saved) {
  if (!isObject(saved) || !["done", "skipped"].includes(saved.status)) return null;
  const answers = {};
  if (saved.status === "done" && isObject(saved.answers)) {
    diagnosticSteps.flatMap((step) => step.questions).forEach((question) => {
      const value = saved.answers[question.id];
      const allowed = (question.options || []).map((option) => option.value);
      if (question.type === "text") { if (typeof value === "string") answers[question.id] = value.slice(0, question.max); }
      else if (question.type === "single") { if (allowed.includes(value)) answers[question.id] = value; }
      else if (Array.isArray(value)) answers[question.id] = value.filter((v) => allowed.includes(v));
    });
  }
  return { status: saved.status, at: typeof saved.at === "string" ? saved.at : new Date().toISOString(), answers };
}

function normalizeExam(saved) {
  const attempts = (Array.isArray(saved?.attempts) ? saved.attempts : []).filter(isObject).map((attempt) => ({
    at: typeof attempt.at === "string" ? attempt.at : new Date().toISOString(),
    mode: attempt.mode === "refuerzo" ? "refuerzo" : "full",
    score: Number.isInteger(attempt.score) ? attempt.score : 0,
    total: Number.isInteger(attempt.total) && attempt.total > 0 ? attempt.total : 1,
    passed: attempt.passed === true,
    byConcept: isObject(attempt.byConcept) ? Object.fromEntries(Object.entries(attempt.byConcept)
      .filter(([, entry]) => isObject(entry) && Number.isInteger(entry.correct) && Number.isInteger(entry.total) && entry.total > 0)
      .map(([concept, entry]) => [concept, { correct: Math.min(entry.correct, entry.total), total: entry.total }])) : {}
  }));
  const seen = Array.isArray(saved?.seen) ? saved.seen.filter((id) => typeof id === "string").slice(-200) : [];
  return { attempts: attempts.slice(-50), seen };
}

function normalizeState(parsed) {
  if (!isObject(parsed)) throw new Error("El contenido guardado no tiene un formato válido.");
  return {
    version: 2,
    // El avance se gana con los chequeos y la práctica: lo marcado a mano en la versión 1 no se migra.
    modules: Object.fromEntries(ROLE_KEYS.map((role) => [
      role,
      Array.from({ length: 3 }, (_, index) => {
        const saved = parsed.modules?.[role]?.[index];
        const quiz = isObject(saved?.quiz) && Array.isArray(saved.quiz.attempts) ? {
          attempts: saved.quiz.attempts.filter(isObject),
          passed: saved.quiz.passed === true,
          weak: Array.isArray(saved.quiz.weak) ? saved.quiz.weak : []
        } : null;
        return { quiz };
      })
    ])),
    practice: isObject(parsed.practice) ? Object.fromEntries(Object.entries(parsed.practice).filter(([, v]) => v === true)) : {},
    diagnostic: normalizeDiagnostic(parsed.diagnostic),
    finalExam: Object.fromEntries(ROLE_KEYS.map((role) => [role, normalizeExam(parsed.finalExam?.[role])])),
    learnerName: typeof parsed.learnerName === "string" ? parsed.learnerName.slice(0, 80) : "",
    sim: normalizeSim(parsed.sim),
    attendance: normalizeAttendance(parsed.attendance),
    periodState: PERIOD_STATES.includes(parsed.periodState) ? parsed.periodState : (parsed.periodOpen === true ? "abierto" : "cerrado"),
    accessEnabled: Array.from({ length: 3 }, (_, index) => parsed.accessEnabled?.[index] !== false)
  };
}

/* Práctica de un módulo: todas sus tareas hechas. */
function modulePracticeDone(roleKey, index) {
  return practiceTasks[roleKey][index].every((task) => portalState.practice[task.flag] === true);
}

/* Estado de un módulo:
   "pending"  sin chequeo
   "review"   chequeo hecho pero sin aprobar
   "practice" chequeo aprobado, falta la práctica
   "done"     chequeo aprobado y práctica hecha */
function moduleStatus(roleKey, index) {
  const quiz = portalState.modules[roleKey][index].quiz;
  if (!quiz || !quiz.attempts.length) return "pending";
  if (!quiz.passed) return "review";
  return modulePracticeDone(roleKey, index) ? "done" : "practice";
}

function completedModules(roleKey) {
  return portalState.modules[roleKey].filter((_, index) => moduleStatus(roleKey, index) === "done").length;
}

/* Marca una acción de práctica. Se guarda sin aviso para no tapar los mensajes del simulador. */
function markPractice(flag) {
  if (portalState.practice[flag]) return;
  portalState.practice[flag] = true;
  persistState();
}

function persistState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(portalState));
    return true;
  } catch (error) {
    showNotice(`No se pudo guardar el cambio en este navegador: ${error.message}`);
    return false;
  }
}

function loadPortalState() {
  try {
    const saved = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    if (!saved) return emptyState();
    return normalizeState(JSON.parse(saved));
  } catch (error) {
    showNotice(`No se pudo leer el progreso guardado: ${error.message} Se iniciará una sesión nueva.`);
    return emptyState();
  }
}

function savePortalState(message = "Cambios guardados en este navegador.") {
  if (!persistState()) return false;
  if (message) showNotice(message);
  renderHomeProgress();
  if (currentRole && document.querySelector("#role-progress")) renderRoleProgress(currentRole);
  return true;
}

/* Reemplaza el avance actual por el de un archivo descargado con "Descargar mi avance". */
function importPortalState(text) {
  let next;
  try {
    const parsed = JSON.parse(text);
    // Solo se acepta un archivo que parezca una copia de avance: así un JSON cualquiera no borra lo que ya tenés.
    if (!isObject(parsed) || parsed.version !== 2 || !isObject(parsed.modules) || !isObject(parsed.sim)) throw new Error("formato");
    next = normalizeState(parsed);
  } catch (error) { showNotice("No se pudo importar el archivo: no es una copia de avance válida. No se cambió nada."); return false; }
  portalState = next;
  if (!persistState()) return false;
  renderHomeProgress();
  renderDiagnosticBanner();
  if (currentRole) renderRole(currentRole);
  showNotice("Se importó tu avance.");
  return true;
}

function resetPortalState() {
  try {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(legacyStorageKey);
  } catch (error) {
    showNotice(`No se pudieron borrar los datos: ${error.message}`);
    return false;
  }
  portalState = emptyState();
  renderHomeProgress();
  renderDiagnosticBanner();
  if (currentRole) renderRole(currentRole);
  showNotice("Se borraron tu avance y tus prácticas de este navegador.");
  return true;
}

let noticeTimer;
function showNotice(message) {
  const notice = document.querySelector("#site-notice");
  if (!notice) return;
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

let portalState = loadPortalState();
let currentRole = null;
