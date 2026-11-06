/* Área de práctica de cada perfil: pestañas, tareas, mensajes del simulador y panel de accesos.
   Los paneles viven en sim-grades.js y sim-attendance.js. */

const ui = {
  role: null, tab: null,
  subject: 0, stage: 0, dirSubject: 0,
  attDate: null, attClass: null, attDraft: [],
  message: null, fresh: false, tasksOpen: false
};

function downloadFile(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showSimMessage(text, kind = "ok") {
  ui.message = { text, kind };
  ui.fresh = true;
}

function renderAccessPanel(el) {
  const cells = allCells().filter(({ cell }) => !cell.exim);
  const withAverage = allCells().filter(({ cell }) => cell.exim || cell.e[0].avg !== null).length;
  const pending = cells.filter(({ cell }) => ["Inicial", "Parcial"].includes(stageState(cell, 0))).length;
  const rows = [
    { index: 0, name: "Comunidad docente", what: "Registrar calificaciones en su curso y espacio curricular" },
    { index: 1, name: "Personal de preceptoría", what: "Registrar la asistencia diaria (como personal autorizado)" }
  ];
  el.innerHTML = `
    <section class="sim-block" aria-labelledby="board-title">
      <div class="sim-block-head"><h3 id="board-title">Resumen del curso de práctica</h3><span class="demo-label">Calculado con tu práctica</span></div>
      <div class="metric-grid">
        <article class="metric-card"><span>Estudiantes del curso</span><strong>${demoStudents.length}</strong><small>${SIM_COURSE.name}, datos ficticios</small></article>
        <article class="metric-card"><span>Registros con promedio en la etapa 1</span><strong>${withAverage} de ${allCells().length}</strong><small>por estudiante y espacio curricular</small></article>
        <article class="metric-card"><span>En Inicial o Parcial, etapa 1</span><strong>${pending}</strong><small>no se pueden finalizar todavía</small></article>
        <article class="metric-card"><span>IPE del curso</span><strong>${portalState.sim.ipe.finalized ? "Finalizado" : "En preparación"}</strong><small>según los requisitos del manual</small></article>
      </div>
    </section>
    <section class="sim-block" aria-labelledby="access-title">
      <h3 id="access-title">Permisos de ejemplo por perfil</h3>
      <p class="sim-help">El equipo directivo registra a las personas con su rol y habilita el curso y el espacio curricular. Cambiá un permiso y mirá qué pasa en la práctica de ese perfil.</p>
      <div class="access-list">
        ${rows.map((row) => `<div class="access-row"><span><strong>${row.name}</strong><small>${row.what}</small></span>
          <button type="button" class="toggle-button ${portalState.accessEnabled[row.index] ? "is-enabled" : ""}" data-access-index="${row.index}" aria-pressed="${portalState.accessEnabled[row.index]}">${portalState.accessEnabled[row.index] ? "Habilitado" : "Deshabilitado"}</button></div>`).join("")}
        <div class="access-row"><span><strong>Equipo directivo</strong><small>Gestionar resolución, bloqueo, eximición y finalización</small></span><span class="sim-muted">Siempre habilitado</span></div>
      </div>
    </section>
    <section class="sim-block" aria-labelledby="period-title">
      <div class="sim-block-head"><h3 id="period-title">Estado del período</h3><span class="demo-label">Solo ilustrativo</span></div>
      <p class="sim-help">Los manuales del portal no describen la apertura y el cierre de períodos: este control es un ejemplo y no representa un procedimiento del SGE.</p>
      <div class="field sim-single"><label for="period-state">Estado del período (ejemplo)</label><select id="period-state">${PERIOD_STATES.map((s) => `<option ${s === portalState.periodState ? "selected" : ""}>${s}</option>`).join("")}</select></div>
    </section>`;
  el.querySelectorAll("[data-access-index]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.accessIndex);
    portalState.accessEnabled[index] = !portalState.accessEnabled[index];
    markPractice("access-toggle");
    const who = rows[index].name.toLowerCase();
    showSimMessage(portalState.accessEnabled[index]
      ? `Habilitaste el permiso de ${who}. Ya puede trabajar en su práctica.`
      : `Deshabilitaste el permiso de ${who}. Mirá qué ve esa persona en la práctica de su ruta: sin habilitación, el curso no aparece.`, "ok");
    savePortalState("");
    rerender(`[data-access-index="${index}"]`);
  }));
  el.querySelector("#period-state").addEventListener("change", (event) => {
    portalState.periodState = event.target.value;
    savePortalState("");
    showSimMessage(`Estado del período de ejemplo: ${portalState.periodState}.`, "ok");
    rerender("#period-state");
  });
}

const practiceTabs = {
  profesor: [
    { key: "planilla", label: "Planilla de calificaciones", render: renderTeacherPanel },
    { key: "directivo", label: "Acciones del equipo directivo", render: renderStagesPanel }
  ],
  preceptor: [
    { key: "asistencia", label: "Asistencia diaria", render: renderAttendancePanel },
    { key: "ipe", label: "Finalizar IPE", render: renderIpePanel }
  ],
  directivo: [
    { key: "etapas", label: "Etapas e IPE", render: (el) => { const a = document.createElement("div"); const b = document.createElement("div"); el.append(a, b); renderStagesPanel(a); renderIpePanel(b); } },
    { key: "accesos", label: "Accesos y resumen", render: renderAccessPanel },
    { key: "planilla", label: "Planilla docente", render: renderTeacherPanel }
  ]
};

function renderPracticeTasks(roleKey) {
  const total = practiceTasks[roleKey].flat().length;
  const done = practiceTasks[roleKey].flat().filter((task) => portalState.practice[task.flag]).length;
  return `<details class="practice-tasks" ${ui.tasksOpen ? "open" : ""}>
    <summary>Tareas de práctica de la ruta: ${done} de ${total} hechas</summary>
    ${practiceTasks[roleKey].map((tasks, index) => `<div class="practice-module"><h3>Módulo ${index + 1}: ${escapeHTML(moduleContent[roleKey][index].title)}</h3>
      <ul>${tasks.map((task) => `<li class="${portalState.practice[task.flag] ? "is-done" : ""}"><span class="task-mark">${portalState.practice[task.flag] ? "Hecha" : "Pendiente"}</span> ${escapeHTML(task.label)}</li>`).join("")}</ul></div>`).join("")}
  </details>`;
}

function renderWorkspace(roleKey) {
  const workspace = document.querySelector("#workspace-section");
  const tabs = practiceTabs[roleKey];
  if (ui.role !== roleKey) {
    Object.assign(ui, { role: roleKey, tab: tabs[0].key, subject: 0, stage: 0, dirSubject: 0, attDate: null, message: null, fresh: false });
    recentNotes.clear();
  }
  const active = tabs.find((tab) => tab.key === ui.tab) || tabs[0];
  const area = practiceAreas[roleKey];
  workspace.innerHTML = `
    <div class="workspace-heading"><div><h2>${area.title}</h2><p>${area.description}</p></div>
      <div class="workspace-heading-actions"><span class="demo-label">Datos ficticios</span><button type="button" class="secondary-button" id="reset-sim">Reiniciar el curso de práctica</button></div></div>
    ${renderPracticeTasks(roleKey)}
    <div class="tabs" role="tablist" aria-label="Áreas de práctica">
      ${tabs.map((tab) => `<button type="button" role="tab" class="tab" id="tab-${tab.key}" aria-selected="${tab.key === active.key}" aria-controls="sim-panel" tabindex="${tab.key === active.key ? 0 : -1}" data-tab="${tab.key}">${tab.label}</button>`).join("")}
    </div>
    <div id="sim-message" class="sim-message" role="status" aria-live="polite"></div>
    <div id="sim-panel" class="tab-panel" role="tabpanel" aria-labelledby="tab-${active.key}"></div>
    <p class="simulator-disclaimer">Este simulador es ilustrativo y no se conecta al sistema SGE. Todo lo que hacés se guarda solo en este navegador y no representa información real.</p>`;
  workspace.querySelector(".practice-tasks").addEventListener("toggle", (event) => { ui.tasksOpen = event.target.open; });
  const panel = workspace.querySelector("#sim-panel");
  active.render(panel);

  const region = workspace.querySelector("#sim-message");
  if (ui.message) {
    const message = ui.message;
    const show = () => { if (!region.isConnected) return; region.className = `sim-message is-${message.kind}`; region.textContent = message.text; };
    if (ui.fresh) { ui.fresh = false; region.className = `sim-message is-${message.kind}`; setTimeout(show, 40); } else show();
  }

  const tabButtons = [...workspace.querySelectorAll("[role=tab]")];
  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => { ui.tab = button.dataset.tab; ui.message = null; rerender(`#tab-${ui.tab}`); });
    button.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabButtons[(index + step + tabButtons.length) % tabButtons.length];
      ui.tab = next.dataset.tab; ui.message = null; rerender(`#tab-${ui.tab}`);
    });
  });
  workspace.querySelector("#reset-sim").addEventListener("click", async () => {
    const confirmed = await simConfirm({
      title: "Reiniciar el curso de práctica",
      body: "<p>Se borran las notas, los estados, el IPE y los registros de este curso de práctica. Tu avance en los módulos y las tareas ya hechas se conservan.</p>",
      confirmLabel: "Reiniciar"
    });
    if (!confirmed) return;
    portalState.sim = newSim();
    recentNotes.clear();
    persistState();
    showSimMessage("El curso de práctica volvió al comienzo.", "ok");
    rerender("#reset-sim");
  });
}

/* Vuelve a dibujar el área de práctica y deja el foco en el primer elemento que exista de la lista. */
function rerender(...focusSelectors) {
  if (!currentRole) return;
  const scrollY = window.scrollY;
  renderWorkspace(currentRole);
  if (currentRole && document.querySelector("#role-progress")) { renderRoleProgress(currentRole); renderModuleCards(currentRole); }
  window.scrollTo({ top: scrollY });
  for (const selector of focusSelectors) {
    const target = document.querySelector(`#workspace-section ${selector}`);
    if (target) { target.focus({ preventScroll: true }); break; }
  }
}
