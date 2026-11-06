/* Simulador de calificaciones y cierre (manual 309) y de finalización del IPE (manual 303).
   Curso de práctica: SIM_COURSE × demoStudents. Reglas replicadas del manual:
   - 6 notas parciales por etapa; se guardan solas; la columna siguiente se habilita al cargar la anterior.
   - Estados por estudiante y etapa: Inicial, Parcial, Promedio, Resolución, Bloqueo, EXIM.
   - Calcular el promedio bloquea la edición docente; se puede eliminar el cálculo hasta que se finalice la etapa.
   - La etapa 2 solo se calcula si la etapa 1 ya tiene promedio.
   - Aprobar por resolución solo si no hay notas en la etapa. La eximición borra las notas cargadas.
   - No se puede finalizar una etapa con estudiantes en Inicial o Parcial.
   - Estado del espacio: Inscripto, Aprobado (PG y E2 mayores a 6), Coloquio (alguno menor a 6) y,
     desde 4.º año, Complementario (PG menor a 4). Un 6 exacto no está definido en el manual: se muestra "Consultar".
   - IPE: requiere calificaciones registradas en todos los espacios del curso e inasistencias registradas. */

const recentNotes = new Set(); // notas recién cargadas (se resaltan hasta salir de la práctica)
const round2 = (value) => Math.round(value * 100) / 100;
const fmt = (value) => Number(value).toLocaleString("es-AR", { maximumFractionDigits: 2 });

function simCell(studentIndex, subjectIndex) {
  const key = `${studentIndex}|${subjectIndex}`;
  const cells = portalState.sim.cells;
  if (!cells[key]) cells[key] = newCell();
  return cells[key];
}

function stageState(cell, k) {
  const stage = cell.e[k];
  if (cell.exim) return "EXIM";
  if (stage.closed) return "Bloqueo";
  if (stage.avg === "A") return "Resolución";
  if (stage.avg !== null) return "Promedio";
  if (stage.notes.some((note) => note !== null)) return "Parcial";
  return "Inicial";
}

function finalOutcome(cell) {
  if (cell.exim) return { pg: "EXIM", es: "Aprobado" };
  const [first, second] = cell.e;
  if (first.avg === null || second.avg === null) return { pg: "—", es: "Inscripto" };
  if (first.avg === "A" && second.avg === "A") return { pg: "A", es: "Aprobado" };
  if (first.avg === "A" || second.avg === "A") return { pg: "—", es: "Consultar" }; // el manual no detalla este caso
  const pg = round2((first.avg + second.avg) / 2);
  if (SIM_COURSE.year >= 4 && pg < 4) return { pg, es: "Complementario" };
  if (pg < 6 || second.avg < 6) return { pg, es: "Coloquio" };
  if (pg > 6 && second.avg > 6) return { pg, es: "Aprobado" };
  return { pg, es: "Consultar" };
}

const allCells = () => demoStudents.flatMap((_, si) => SIM_COURSE.subjects.map((__, ji) => ({ si, ji, cell: simCell(si, ji) })));
const stateClass = (state) => `state-${state.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}`;
const stateBadge = (state) => `<span class="sim-state ${stateClass(state)}">${state}</span>`;
const avgText = (avg) => avg === null ? "—" : avg === "A" ? "A" : `<span class="${avg < 6 ? "is-low" : ""}">${fmt(avg)}${avg < 6 ? '<span class="low-flag"> (menor a 6)</span>' : ""}</span>`;
const subjectOptions = (selected) => SIM_COURSE.subjects.map((name, i) => `<option value="${i}" ${i === selected ? "selected" : ""}>${name}</option>`).join("");

/* ---------- Diálogo de confirmación del simulador ---------- */
function simConfirm({ title, body, confirmLabel = "Confirmar", inputLabel = null }) {
  const dialog = document.querySelector("#sim-dialog");
  dialog.querySelector("#sim-dialog-title").textContent = title;
  dialog.querySelector("#sim-dialog-body").innerHTML = body;
  const field = dialog.querySelector("#sim-dialog-field");
  const input = dialog.querySelector("#sim-dialog-input");
  field.hidden = !inputLabel;
  input.value = "";
  input.required = Boolean(inputLabel);
  dialog.querySelector("#sim-dialog-label").textContent = inputLabel || "";
  dialog.querySelector("#sim-dialog-ok").textContent = confirmLabel;
  dialog.returnValue = "";
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok" ? (inputLabel ? input.value.trim() : true) : false), { once: true });
    dialog.showModal();
    (inputLabel ? input : dialog.querySelector("#sim-dialog-ok")).focus();
  });
}

/* ---------- Acciones (la lógica del manual) ---------- */
function setNote(si, ji, k, n, value) {
  const cell = simCell(si, ji);
  const stage = cell.e[k];
  if (cell.exim || stage.closed || stage.avg !== null) return false;
  stage.notes[n] = value;
  recentNotes.add(`${si}|${ji}|${k}|${n}`);
  if (k === 0 && stage.notes.filter((note) => note !== null).length >= 3) markPractice("doc-notes");
  persistState();
  return true;
}

async function calculateStage(si, ji, k) {
  const cell = simCell(si, ji);
  const stage = cell.e[k];
  const notes = stage.notes.filter((note) => note !== null);
  if (!notes.length || stage.avg !== null || stage.closed || cell.exim) return;
  if (k === 1 && cell.e[0].avg === null) {
    showSimMessage("La etapa 2 se puede calcular recién cuando ya calculaste el promedio de la etapa 1.", "warn");
    return;
  }
  const confirmed = await simConfirm({
    title: `Calcular el promedio de la etapa ${k + 1}`,
    body: `<p><strong>${demoStudents[si]}</strong> · ${SIM_COURSE.subjects[ji]}</p><p>Calificaciones registradas: ${notes.join(", ")}.</p><p>Al confirmar, el SGE hace el cálculo definitivo, te bloquea la edición de estas notas y habilita al equipo directivo a finalizar la etapa.</p>`,
    confirmLabel: "Confirmar cálculo"
  });
  if (!confirmed) return;
  stage.avg = round2(notes.reduce((sum, note) => sum + note, 0) / notes.length);
  markPractice(k === 0 ? "calc-e1" : "calc-e2");
  persistState();
  const outcome = finalOutcome(cell);
  showSimMessage(k === 0
    ? `Promedio de la etapa 1 calculado: ${fmt(stage.avg)}. Ya no podés editar estas notas; si hace falta, podés eliminar el cálculo hasta que el equipo directivo finalice la etapa.`
    : `Promedio de la etapa 2 calculado: ${fmt(stage.avg)}. Promedio general: ${outcome.pg === "—" ? "—" : fmt(outcome.pg)}. Estado del espacio curricular: ${outcome.es}.`, "ok");
}

function uncalculateStage(si, ji, k) {
  const stage = simCell(si, ji).e[k];
  if (stage.closed || stage.avg === null || stage.avg === "A") return;
  stage.avg = null;
  markPractice("uncalc");
  persistState();
  showSimMessage("Eliminaste el cálculo del promedio. Volvés a poder editar las notas de esta etapa.", "ok");
}

function clearStageNotes(si, ji, k) {
  const cell = simCell(si, ji);
  const stage = cell.e[k];
  if (stage.closed || stage.avg !== null || cell.exim) return;
  stage.notes = Array(NOTES_PER_STAGE).fill(null);
  [...recentNotes].filter((key) => key.startsWith(`${si}|${ji}|${k}|`)).forEach((key) => recentNotes.delete(key));
  persistState();
  showSimMessage("Se borraron las notas parciales de esta etapa.", "ok");
}

async function approveByResolution(si, ji, k) {
  const cell = simCell(si, ji);
  const stage = cell.e[k];
  if (stage.closed || cell.exim) return;
  const hasGrades = stage.notes.some((note) => note !== null) || (stage.avg !== null && stage.avg !== "A");
  if (hasGrades) {
    markPractice("res-blocked");
    persistState();
    showSimMessage(`No se puede aprobar la etapa ${k + 1} por resolución: la opción solo está disponible cuando no hay calificaciones registradas. Primero hay que eliminar el registro de ${demoStudents[si]} en ${SIM_COURSE.subjects[ji]}.`, "warn");
    return;
  }
  const number = await simConfirm({
    title: `Aprobar la etapa ${k + 1} por resolución`,
    body: `<p><strong>${demoStudents[si]}</strong> · ${SIM_COURSE.subjects[ji]}</p><p>Escribí el número de resolución. En la planilla se va a mostrar una A (aprobado).</p>`,
    confirmLabel: "Aprobar por resolución",
    inputLabel: "Número de resolución"
  });
  if (!number) return;
  stage.avg = "A";
  stage.res = number;
  persistState();
  showSimMessage(`Etapa ${k + 1} aprobada por resolución n.º ${number}.${finalOutcome(cell).es === "Aprobado" ? " Con las dos etapas aprobadas por resolución, el espacio curricular queda Aprobado." : ""}`, "ok");
}

function removeResolution(si, ji, k) {
  const stage = simCell(si, ji).e[k];
  if (stage.closed || stage.avg !== "A") return;
  stage.avg = null;
  stage.res = "";
  persistState();
  showSimMessage("Se eliminó la resolución. La etapa vuelve al estado Inicial.", "ok");
}

async function registerExemption(si, ji) {
  const cell = simCell(si, ji);
  if (cell.exim) return;
  const hasNotes = cell.e.some((stage) => stage.notes.some((note) => note !== null) || stage.avg !== null);
  const confirmed = await simConfirm({
    title: "Registrar la eximición",
    body: `<p><strong>${demoStudents[si]}</strong> · ${SIM_COURSE.subjects[ji]}</p><p>Se inhabilita el registro de calificaciones para la comunidad docente, en PG se muestra EXIM y el espacio queda Aprobado.</p>${hasNotes ? "<p><strong>Las calificaciones que ya estaban cargadas dejan de estar disponibles.</strong></p>" : ""}`,
    confirmLabel: "Registrar eximición"
  });
  if (!confirmed) return;
  cell.e = [newStage(), newStage()];
  cell.exim = true;
  [...recentNotes].filter((key) => key.startsWith(`${si}|${ji}|`)).forEach((key) => recentNotes.delete(key));
  markPractice("exim");
  persistState();
  showSimMessage(`Eximición registrada para ${demoStudents[si]} en ${SIM_COURSE.subjects[ji]}.${hasNotes ? " Las notas que tenía cargadas ya no están disponibles." : ""}`, "ok");
}

function finalizeStage(k) {
  const pending = allCells().filter(({ cell }) => !cell.exim && ["Inicial", "Parcial"].includes(stageState(cell, k)));
  if (pending.length) {
    markPractice("finalize-blocked");
    persistState();
    const examples = pending.slice(0, 3).map(({ si, ji, cell }) => `${demoStudents[si]} en ${SIM_COURSE.subjects[ji]} (${stageState(cell, k)})`).join("; ");
    showSimMessage(`No se puede finalizar la etapa ${k + 1}: ${pending.length} ${pending.length === 1 ? "registro está" : "registros están"} en estado Inicial o Parcial. Solo se puede finalizar cuando cada estudiante tiene promedio. Por ejemplo: ${examples}.`, "warn");
    return;
  }
  const open = allCells().filter(({ cell }) => !cell.exim && !cell.e[k].closed);
  if (!open.length) { showSimMessage(`La etapa ${k + 1} ya estaba finalizada.`, "ok"); return; }
  open.forEach(({ cell }) => { cell.e[k].closed = true; });
  markPractice("finalize-ok");
  persistState();
  showSimMessage(`Etapa ${k + 1} finalizada. Los registros pasaron a estado Bloqueo: la comunidad docente ya no puede modificar esas calificaciones.`, "ok");
}

function ipeStatus() {
  const cells = allCells().filter(({ cell }) => !cell.exim);
  const exempt = allCells().length - cells.length;
  const registered = cells.filter(({ cell }) => cell.e.every((stage) => stage.avg !== null)).length + exempt;
  return { registered, total: allCells().length, gradesOk: registered === allCells().length, absencesOk: portalState.sim.ipe.absencesRegistered };
}

function finalizeIpe(observation) {
  const ipe = portalState.sim.ipe;
  if (ipe.finalized) { showSimMessage("El IPE de este curso ya está Finalizado.", "ok"); return; }
  const status = ipeStatus();
  if (!status.gradesOk || !status.absencesOk) {
    markPractice("ipe-blocked");
    persistState();
    const missing = [];
    if (!status.gradesOk) missing.push(`faltan calificaciones: solo ${status.registered} de ${status.total} registros del curso tienen las dos etapas completas`);
    if (!status.absencesOk) missing.push("falta registrar las inasistencias");
    showSimMessage(`No se puede finalizar el IPE: ${missing.join(" y ")}. Es requisito que la comunidad docente haya registrado las calificaciones en todos los espacios curriculares del curso y que el personal autorizado o la preceptoría haya registrado las inasistencias.`, "warn");
    return;
  }
  ipe.finalized = true;
  ipe.observation = observation.slice(0, 300);
  markPractice("ipe-finalized");
  persistState();
  showSimMessage("El IPE pasó al estado Finalizado.", "ok");
}

function fillSampleGrades() {
  const bases = [8, 7, 5, 9, 6, 3];
  const wobble = [0, 1, -1, 0, 1, -1];
  allCells().forEach(({ si, ji, cell }) => {
    if (cell.exim) return;
    cell.e.forEach((stage, k) => {
      if (stage.closed || stage.avg === "A") return;
      stage.notes = stage.notes.map((_, n) => Math.max(1, Math.min(10, bases[si] + wobble[(n + ji + k) % 6])));
      stage.avg = round2(stage.notes.reduce((sum, note) => sum + note, 0) / stage.notes.length);
    });
  });
  persistState();
  showSimMessage("Se cargaron notas de ejemplo y se calcularon los promedios de las dos etapas en todo el curso.", "ok");
}

function exportPlanilla() {
  const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["Estudiante", "Espacio curricular", ...[1, 2].flatMap((k) => [1, 2, 3, 4, 5, 6].map((n) => `E${k} nota ${n}`)), "Promedio E1", "Promedio E2", "PG", "Estado"];
  const rows = allCells().map(({ si, ji, cell }) => {
    const outcome = finalOutcome(cell);
    return [demoStudents[si], SIM_COURSE.subjects[ji], ...cell.e.flatMap((stage) => stage.notes.map((note) => note ?? "")), ...cell.e.map((stage) => stage.avg ?? ""), outcome.pg === "—" ? "" : outcome.pg, outcome.es];
  });
  downloadFile("planilla-de-practica-sge.csv", new Blob(["﻿", [header, ...rows].map((row) => row.map(quote).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
}

/* ---------- Paneles ---------- */
function renderTeacherPanel(el) {
  if (!portalState.accessEnabled[0]) {
    el.innerHTML = `<div class="sim-blocked"><h3>No encontrás el curso</h3><p>El acceso al establecimiento, al espacio curricular y al curso lo habilita el equipo directivo o el personal autorizado. Pedí que te habiliten.</p><p class="sim-hint">En esta práctica, el permiso de la comunidad docente está deshabilitado: se cambia desde la ruta del equipo directivo, en la pestaña de accesos.</p></div>`;
    return;
  }
  const j = ui.subject;
  const k = ui.stage;
  const header = ["Estudiante", ...Array.from({ length: NOTES_PER_STAGE }, (_, n) => `Nota ${n + 1}`), `Promedio E${k + 1}`, "Estado", "Acciones", "PG", "Estado del espacio"];
  const rows = demoStudents.map((student, si) => {
    const cell = simCell(si, j);
    const stage = cell.e[k];
    const state = stageState(cell, k);
    const editable = !cell.exim && !stage.closed && stage.avg === null;
    const noteCells = stage.notes.map((note, n) => {
      const enabled = editable && (n === 0 || stage.notes[n - 1] !== null);
      return `<td><select class="note-select ${recentNotes.has(`${si}|${j}|${k}|${n}`) ? "is-new" : ""}" data-student="${si}" data-note="${n}" aria-label="Nota ${n + 1} de ${student}, etapa ${k + 1}" ${enabled ? "" : "disabled"}>
        ${note === null ? '<option value="" selected>—</option>' : ""}${Array.from({ length: 10 }, (_, v) => `<option value="${v + 1}" ${note === v + 1 ? "selected" : ""}>${v + 1}</option>`).join("")}</select></td>`;
    }).join("");
    let actions = '<span class="sim-muted">Sin notas</span>';
    if (state === "Parcial") {
      const blocked = k === 1 && cell.e[0].avg === null;
      actions = `<button type="button" class="sim-action" data-act="calc" data-student="${si}" ${blocked ? 'aria-disabled="true" title="Primero calculá la etapa 1"' : ""}>Calcular promedio</button><button type="button" class="sim-action" data-act="clear" data-student="${si}">Borrar notas</button>${blocked ? '<span class="sim-hint">Primero la etapa 1</span>' : ""}`;
    } else if (state === "Promedio") {
      actions = `<button type="button" class="sim-action" data-act="uncalc" data-student="${si}">Eliminar cálculo</button>`;
    } else if (state === "Resolución") {
      actions = `<span class="sim-muted">Resolución n.º ${escapeHTML(stage.res)}</span>`;
    } else if (state === "Bloqueo") {
      actions = '<span class="sim-lock"><svg class="icon" aria-hidden="true"><use href="#i-lock"/></svg> Etapa finalizada</span>';
    } else if (state === "EXIM") {
      actions = '<span class="sim-muted">Con eximición: sin registro</span>';
    }
    const outcome = finalOutcome(cell);
    return `<tr><th scope="row">${student}</th>${noteCells}<td>${avgText(stage.avg)}</td><td>${stateBadge(state)}</td><td class="sim-actions">${actions}</td><td>${outcome.pg === "—" || outcome.pg === "A" || outcome.pg === "EXIM" ? outcome.pg : avgText(outcome.pg)}</td><td>${stateBadge(outcome.es)}</td></tr>`;
  }).join("");
  el.innerHTML = `
    <div class="sim-controls">
      <div class="field"><label for="sim-subject">Espacio curricular</label><select id="sim-subject">${subjectOptions(j)}</select></div>
      <div class="field"><span class="field-label" id="stage-label">Etapa</span><div class="stage-toggle" role="group" aria-labelledby="stage-label">
        ${[0, 1].map((s) => `<button type="button" class="stage-button" data-stage="${s}" aria-pressed="${s === k}">Etapa ${s + 1}</button>`).join("")}</div></div>
      <button type="button" class="secondary-button" id="export-planilla">Descargar planilla CSV ↓</button>
    </div>
    <div class="table-wrap sim-table"><table><caption class="sr-only">Planilla de calificaciones de ${SIM_COURSE.subjects[j]}, etapa ${k + 1}</caption>
      <thead><tr>${header.map((h, i) => `<th scope="col" ${i === 0 ? 'class="sticky-col"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="workspace-note">Las notas se guardan solas. Un promedio menor a 6 se muestra en rojo. El promedio de este simulador es un promedio simple, ilustrativo. Los 6 exactos no están definidos en el manual: se muestran como "Consultar".</p>`;
  el.querySelector("#sim-subject").addEventListener("change", (event) => { ui.subject = Number(event.target.value); rerender(); });
  el.querySelectorAll(".stage-button").forEach((button) => button.addEventListener("click", () => { ui.stage = Number(button.dataset.stage); rerender(`.stage-button[data-stage="${ui.stage}"]`); }));
  el.querySelector("#export-planilla").addEventListener("click", exportPlanilla);
  el.querySelectorAll(".note-select").forEach((select) => select.addEventListener("change", () => {
    const si = Number(select.dataset.student);
    const n = Number(select.dataset.note);
    if (setNote(si, j, k, n, Number(select.value))) {
      showSimMessage(`Nota guardada automáticamente: ${demoStudents[si]}, nota ${n + 1}, ${select.value}.`, "ok");
      const next = n + 1 < NOTES_PER_STAGE ? `.note-select[data-student="${si}"][data-note="${n + 1}"]` : `.note-select[data-student="${si}"][data-note="${n}"]`;
      rerender(next);
    }
  }));
  el.querySelectorAll("[data-act]").forEach((button) => button.addEventListener("click", async () => {
    const si = Number(button.dataset.student);
    if (button.getAttribute("aria-disabled") === "true") { showSimMessage("La etapa 2 se puede calcular recién cuando ya calculaste el promedio de la etapa 1.", "warn"); rerender(); return; }
    if (button.dataset.act === "calc") await calculateStage(si, j, k);
    if (button.dataset.act === "uncalc") uncalculateStage(si, j, k);
    if (button.dataset.act === "clear") clearStageNotes(si, j, k);
    rerender(`.sim-actions button[data-student="${si}"]`, `.note-select[data-student="${si}"]:not(:disabled)`);
  }));
}

function renderStagesPanel(el) {
  const k = ui.stage;
  const j = ui.dirSubject;
  const closedFor = (s) => allCells().filter(({ cell }) => !cell.exim).every(({ cell }) => cell.e[s].closed);
  const matrix = demoStudents.map((student, si) => `<tr><th scope="row">${student}</th>${SIM_COURSE.subjects.map((_, ji) => `<td>${stateBadge(stageState(simCell(si, ji), k))}</td>`).join("")}</tr>`).join("");
  const rows = demoStudents.map((student, si) => {
    const cell = simCell(si, j);
    const resBtn = (s) => {
      const state = stageState(cell, s);
      if (state === "Resolución") return `<button type="button" class="sim-action" data-act="unres" data-student="${si}" data-stage="${s}">Quitar resolución de la etapa ${s + 1}</button>`;
      if (cell.exim || state === "Bloqueo") return "";
      return `<button type="button" class="sim-action" data-act="res" data-student="${si}" data-stage="${s}">Aprobar etapa ${s + 1} por resolución</button>`;
    };
    return `<tr><th scope="row">${student}</th><td>${stateBadge(stageState(cell, 0))}</td><td>${stateBadge(stageState(cell, 1))}</td><td class="sim-actions">${resBtn(0)}${resBtn(1)}${cell.exim ? '<span class="sim-muted">Con eximición</span>' : `<button type="button" class="sim-action" data-act="exim" data-student="${si}">Registrar eximición</button>`}</td></tr>`;
  }).join("");
  el.innerHTML = `
    <section class="sim-block" aria-labelledby="finalize-title">
      <h3 id="finalize-title">Finalizar una etapa del curso</h3>
      <p class="sim-help">Solo se puede finalizar cuando cada estudiante está en estado Promedio. Al finalizar, los registros pasan a Bloqueo y la comunidad docente ya no puede editarlos.</p>
      <div class="sim-controls">
        <div class="field"><span class="field-label" id="stage-label-d">Etapa</span><div class="stage-toggle" role="group" aria-labelledby="stage-label-d">
          ${[0, 1].map((s) => `<button type="button" class="stage-button" data-stage="${s}" aria-pressed="${s === k}">Etapa ${s + 1}${closedFor(s) ? " · finalizada" : ""}</button>`).join("")}</div></div>
        <button type="button" class="simulator-submit" id="finalize-stage">Finalizar etapa ${k + 1}</button>
      </div>
      <div class="table-wrap"><table><caption>Estado de cada estudiante en la etapa ${k + 1}, por espacio curricular</caption>
        <thead><tr><th scope="col">Estudiante</th>${SIM_COURSE.subjects.map((s) => `<th scope="col">${s}</th>`).join("")}</tr></thead><tbody>${matrix}</tbody></table></div>
    </section>
    <section class="sim-block" aria-labelledby="special-title">
      <h3 id="special-title">Resolución y eximición</h3>
      <p class="sim-help">Aprobar por resolución solo es posible si no hay notas en la etapa. Una eximición borra las notas cargadas.</p>
      <div class="field sim-single"><label for="dir-subject">Espacio curricular</label><select id="dir-subject">${subjectOptions(j)}</select></div>
      <div class="table-wrap sim-table"><table><caption class="sr-only">Estado y acciones por estudiante en ${SIM_COURSE.subjects[j]}</caption>
        <thead><tr><th scope="col">Estudiante</th><th scope="col">Etapa 1</th><th scope="col">Etapa 2</th><th scope="col">Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  el.querySelectorAll(".stage-button").forEach((button) => button.addEventListener("click", () => { ui.stage = Number(button.dataset.stage); rerender(`.stage-button[data-stage="${ui.stage}"]`); }));
  el.querySelector("#finalize-stage").addEventListener("click", () => { finalizeStage(k); rerender("#finalize-stage"); });
  el.querySelector("#dir-subject").addEventListener("change", (event) => { ui.dirSubject = Number(event.target.value); rerender("#dir-subject"); });
  el.querySelectorAll("[data-act]").forEach((button) => button.addEventListener("click", async () => {
    const si = Number(button.dataset.student);
    const s = Number(button.dataset.stage);
    if (button.dataset.act === "res") await approveByResolution(si, j, s);
    if (button.dataset.act === "unres") removeResolution(si, j, s);
    if (button.dataset.act === "exim") await registerExemption(si, j);
    rerender(`.sim-actions button[data-student="${si}"]`);
  }));
}

function renderIpePanel(el) {
  const ipe = portalState.sim.ipe;
  const status = ipeStatus();
  el.innerHTML = `
    <section class="sim-block" aria-labelledby="ipe-title">
      <div class="sim-block-head"><h3 id="ipe-title">Finalizar el IPE de ${SIM_COURSE.name}</h3>${stateBadge(ipe.finalized ? "Finalizado" : "En preparación")}</div>
      <p class="sim-help">Pueden hacerlo el equipo directivo, el personal autorizado o la preceptoría, cuando se cumplen los dos requisitos.</p>
      <ul class="ipe-requirements">
        <li class="${status.gradesOk ? "is-met" : "is-missing"}"><strong>${status.gradesOk ? "Cumplido" : "Falta"}:</strong> calificaciones registradas en todos los espacios curriculares del curso (${status.registered} de ${status.total} registros completos).</li>
        <li class="${status.absencesOk ? "is-met" : "is-missing"}"><strong>${status.absencesOk ? "Cumplido" : "Falta"}:</strong> inasistencias registradas por el personal autorizado o la preceptoría.
          <label class="ipe-toggle"><input type="checkbox" id="ipe-absences" ${status.absencesOk ? "checked" : ""} ${ipe.finalized ? "disabled" : ""}> Simular que ya se registraron</label></li>
      </ul>
      <div class="field"><label for="ipe-observation">Observación (opcional)</label><textarea id="ipe-observation" rows="2" maxlength="300" ${ipe.finalized ? "disabled" : ""}>${escapeHTML(ipe.observation)}</textarea></div>
      <div class="sim-controls">
        <button type="button" class="secondary-button" id="ipe-fill" ${ipe.finalized ? "disabled" : ""}>Simular que la comunidad docente completó las notas</button>
        <button type="button" class="simulator-submit" id="ipe-finalize" ${ipe.finalized ? "disabled" : ""}>Finalizar IPE</button>
      </div>
    </section>`;
  el.querySelector("#ipe-absences").addEventListener("change", (event) => { ipe.absencesRegistered = event.target.checked; persistState(); rerender("#ipe-absences"); });
  el.querySelector("#ipe-fill").addEventListener("click", () => { fillSampleGrades(); rerender("#ipe-fill"); });
  el.querySelector("#ipe-finalize").addEventListener("click", () => { finalizeIpe(el.querySelector("#ipe-observation").value); rerender("#ipe-finalize"); });
}
