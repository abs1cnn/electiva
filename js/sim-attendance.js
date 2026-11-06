/* Simulador de asistencia diaria (manual 018).
   Reglas replicadas: se busca curso y fecha; la grilla ofrece cinco condiciones; todos empiezan como "Presente"
   y solo se marca la excepción; los totales se actualizan al modificar; Registrar Asistencia pide Confirmar y
   muestra un mensaje de éxito; Imprimir Listado genera el documento con totales.
   El manual aclara que lo guardado acá no se muestra en el IPE: el simulador no lo conecta con el IPE. */

function localDateValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const attendanceCounts = (statuses) => Object.fromEntries(ATTENDANCE_CONDITIONS.map((c) => [c, statuses.filter((s) => s === c).length]));
const savedDay = (date, classroom) => portalState.attendance.find((day) => day.date === date && day.classroom === classroom);

function loadAttendanceDraft() {
  const saved = savedDay(ui.attDate, ui.attClass);
  ui.attDraft = demoStudents.map((_, i) => saved?.statuses?.[i] || "Presente");
}

function totalsLine(statuses) {
  const counts = attendanceCounts(statuses);
  return ATTENDANCE_CONDITIONS.map((c) => `<span>${c} (${counts[c]})</span>`).join("");
}

function absenteeismByClass() {
  return ATTENDANCE_CLASSES.map((classroom) => {
    const days = portalState.attendance.filter((day) => day.classroom === classroom);
    const counts = days.reduce((acc, day) => { ATTENDANCE_CONDITIONS.forEach((c) => { acc[c] += day.counts[c] || 0; }); return acc; }, Object.fromEntries(ATTENDANCE_CONDITIONS.map((c) => [c, 0])));
    const base = days.length * demoStudents.length - counts["Inasistencia no computable"];
    const absent = counts["Ausente"] + counts["Ausente justificado"];
    return { classroom, days: days.length, absent, base, percent: base > 0 ? Math.round(absent / base * 100) : null };
  }).filter((row) => row.days > 0);
}

function printAttendance() {
  const statuses = ui.attDraft;
  const counts = attendanceCounts(statuses);
  const [year, month, day] = ui.attDate.split("-");
  document.querySelector("#print-area").innerHTML = `
    <h1>Listado de Asistencias</h1>
    <p><strong>Curso:</strong> ${escapeHTML(ui.attClass)}<br><strong>Fecha:</strong> ${day}/${month}/${year}<br><em>Listado de práctica con estudiantes ficticios. No corresponde a un registro real del SGE.</em></p>
    <table><thead><tr><th>N.º</th><th>Apellido y nombre</th><th>Tipo de asistencia</th></tr></thead>
      <tbody>${demoStudents.map((name, i) => `<tr><td>${i + 1}</td><td>${escapeHTML(name)}</td><td>${escapeHTML(statuses[i])}</td></tr>`).join("")}</tbody></table>
    <p><strong>Totales:</strong> ${ATTENDANCE_CONDITIONS.map((c) => `${c}: ${counts[c]}`).join(" · ")}</p>`;
  markPractice("att-print");
  showSimMessage("Se abrió el listado para imprimir o guardar como PDF.", "ok");
  window.print();
}

function renderAttendancePanel(el) {
  if (!portalState.accessEnabled[1]) {
    el.innerHTML = `<div class="sim-blocked"><h3>No tenés autorización para registrar asistencia</h3><p>La asistencia diaria la registra el equipo directivo o el personal que este autorice. Pedí la autorización a tu equipo directivo.</p><p class="sim-hint">En esta práctica, el permiso del personal de preceptoría está deshabilitado: se cambia desde la ruta del equipo directivo, en la pestaña de accesos.</p></div>`;
    return;
  }
  if (!ui.attDate) { ui.attDate = localDateValue(); ui.attClass = ATTENDANCE_CLASSES[0]; loadAttendanceDraft(); }
  const recent = portalState.attendance.slice().reverse().slice(0, 8);
  const chart = absenteeismByClass();
  el.innerHTML = `
    <form id="attendance-form" class="attendance-form" novalidate>
      <div class="sim-controls">
        <div class="field"><label for="attendance-date">Fecha</label><input id="attendance-date" name="date" type="date" value="${escapeHTML(ui.attDate)}" required></div>
        <div class="field"><label for="attendance-class">Curso y división</label><select id="attendance-class" name="classroom">${ATTENDANCE_CLASSES.map((c) => `<option ${c === ui.attClass ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      </div>
      <p class="sim-help">Por defecto todas las personas figuran como Presente: marcá solo las excepciones.</p>
      <div class="table-wrap sim-table"><table><caption class="sr-only">Condición de asistencia de cada estudiante de ejemplo</caption>
        <thead><tr><th scope="col">Estudiante de ejemplo</th>${ATTENDANCE_CONDITIONS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
        <tbody>${demoStudents.map((name, i) => `<tr><th scope="row">${name}</th>${ATTENDANCE_CONDITIONS.map((c) => `<td class="radio-cell"><input type="radio" name="student-${i}" value="${c}" aria-label="${c}: ${name}" ${ui.attDraft[i] === c ? "checked" : ""}></td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="attendance-summary" id="attendance-summary" aria-live="polite">${totalsLine(ui.attDraft)}</div>
      <div class="sim-controls">
        <button type="submit" class="simulator-submit">Registrar asistencia</button>
        <button type="button" class="secondary-button" id="print-attendance">Imprimir listado</button>
      </div>
    </form>
    <section class="sim-block" aria-labelledby="att-history-title">
      <h3 id="att-history-title">Registros guardados</h3>
      <div class="table-wrap"><table><caption class="sr-only">Últimos registros de asistencia de práctica</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Curso</th>${ATTENDANCE_CONDITIONS.map((c) => `<th scope="col">${c}</th>`).join("")}<th scope="col"><span class="sr-only">Acciones</span></th></tr></thead><tbody>
        ${recent.length ? recent.map((day) => `<tr><td>${escapeHTML(day.date)}</td><td>${escapeHTML(day.classroom)}</td>${ATTENDANCE_CONDITIONS.map((c) => `<td>${day.counts[c]}</td>`).join("")}<td><button type="button" class="row-action" data-delete-attendance="${escapeHTML(day.id)}" aria-label="Eliminar registro de asistencia del ${escapeHTML(day.date)}, ${escapeHTML(day.classroom)}">Eliminar</button></td></tr>`).join("") : `<tr><td colspan="${ATTENDANCE_CONDITIONS.length + 3}" class="empty-row">Todavía no guardaste registros de práctica.</td></tr>`}
      </tbody></table></div>
      ${chart.length ? `<h3 class="history-heading">Ausentismo por curso (ejemplo)</h3>
        <ul class="absence-chart">${chart.map((row) => `<li><span class="absence-name">${escapeHTML(row.classroom)}</span><span class="absence-bar" aria-hidden="true"><span style="width:${row.percent}%"></span></span><span class="absence-value">${row.percent} % · ${row.absent} de ${row.base}</span></li>`).join("")}</ul>
        <p class="workspace-note">Cálculo propio del simulador: ausentes y ausentes justificados sobre el total de registros, sin contar las inasistencias no computables.</p>` : ""}
    </section>
    <p class="workspace-note">Nómina ficticia. No se registra asistencia real ni se sincroniza con el SGE. Como indica el manual, lo que se guarda acá no se muestra en el IPE.</p>`;

  const form = el.querySelector("#attendance-form");
  form.addEventListener("change", (event) => {
    if (event.target.name === "date" || event.target.name === "classroom") {
      ui.attDate = form.elements.date.value || localDateValue();
      ui.attClass = form.elements.classroom.value;
      loadAttendanceDraft();
      rerender("#attendance-date");
      return;
    }
    if (event.target.name?.startsWith("student-")) {
      ui.attDraft = demoStudents.map((_, i) => form.elements[`student-${i}`].value);
      el.querySelector("#attendance-summary").innerHTML = totalsLine(ui.attDraft);
      markPractice("att-totals");
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const [year, month, day] = ui.attDate.split("-");
    const confirmed = await simConfirm({
      title: "¿Registrar asistencia para curso y fecha indicada?",
      body: `<p><strong>Curso:</strong> ${escapeHTML(ui.attClass)}</p><p><strong>Fecha:</strong> ${day}/${month}/${year}</p>`,
      confirmLabel: "Confirmar"
    });
    if (!confirmed) { showSimMessage("No se registró la asistencia: cancelaste la confirmación.", "warn"); rerender(".attendance-form .simulator-submit"); return; }
    const statuses = ui.attDraft.slice();
    portalState.attendance = portalState.attendance.filter((item) => item.date !== ui.attDate || item.classroom !== ui.attClass);
    portalState.attendance.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, date: ui.attDate, classroom: ui.attClass, statuses, counts: attendanceCounts(statuses) });
    if (statuses.some((s) => s !== "Presente")) markPractice("att-saved");
    savePortalState("");
    showSimMessage("La asistencia se registró correctamente.", "ok");
    rerender(".attendance-form .simulator-submit");
  });
  el.querySelector("#print-attendance").addEventListener("click", printAttendance);
  el.querySelectorAll("[data-delete-attendance]").forEach((button) => button.addEventListener("click", () => {
    portalState.attendance = portalState.attendance.filter((item) => item.id !== button.dataset.deleteAttendance);
    savePortalState("");
    showSimMessage("Registro de asistencia eliminado.", "ok");
    loadAttendanceDraft();
    rerender("#att-history-title");
  }));
}
