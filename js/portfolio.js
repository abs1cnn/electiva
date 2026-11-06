/* Mi portafolio: punto de partida, avance por ruta, conceptos para repasar e historial de chequeos.
   Todo sale de lo que ya guarda el portal en este navegador. */

function moduleQuizSummary(roleKey, index) {
  const quiz = portalState.modules[roleKey][index].quiz;
  if (!quiz?.attempts.length) return "Sin intentos";
  const best = Math.max(...quiz.attempts.map((attempt) => attempt.score));
  const total = quiz.attempts.at(-1).total;
  return `Mejor resultado ${best} de ${total} · ${quiz.attempts.length} ${quiz.attempts.length === 1 ? "intento" : "intentos"}`;
}

function portfolioProgressHTML() {
  return ROLE_KEYS.map((roleKey) => {
    const role = roles[roleKey];
    const total = moduleContent[roleKey].length;
    const done = completedModules(roleKey);
    const percent = Math.round(done / total * 100);
    const rows = moduleContent[roleKey].map((module, index) => {
      const tasks = practiceTasks[roleKey][index];
      const tasksDone = tasks.filter((task) => portalState.practice[task.flag]).length;
      return `<tr><th scope="row"><a class="inline-link" href="#${roleKey}#modulo-${index + 1}">${index + 1}. ${escapeHTML(module.title)}</a></th>
        <td>${statusBadge(moduleStatus(roleKey, index))}</td><td>${moduleQuizSummary(roleKey, index)}</td><td>${tasksDone} de ${tasks.length}</td></tr>`;
    }).join("");
    return `<section class="portfolio-route" aria-labelledby="pf-${roleKey}">
      <div class="portfolio-route-head"><h3 id="pf-${roleKey}">${role.routeTitle}</h3><span>${done} de ${total} módulos completados</span></div>
      <div class="role-progress-track" role="progressbar" aria-labelledby="pf-${roleKey}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>
      <p class="portfolio-exam"><strong>Evaluación final:</strong> ${examStatusText(roleKey)} <a class="inline-link" href="#${roleKey}#evaluacion">Abrir la evaluación</a></p>
      <div class="table-wrap"><table><caption class="sr-only">Avance en la ${role.routeTitle}</caption>
        <thead><tr><th scope="col">Módulo</th><th scope="col">Estado</th><th scope="col">Chequeo</th><th scope="col">Práctica</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  }).join("");
}

function portfolioReviewHTML() {
  const items = [];
  ROLE_KEYS.forEach((roleKey) => moduleContent[roleKey].forEach((module, index) => {
    const quiz = portalState.modules[roleKey][index].quiz;
    (quiz?.weak || []).forEach((concept) => {
      const solved = quiz.passed;
      items.push(`<li><span>${escapeHTML(conceptLabels[concept] || concept)}</span>
        <small>${roles[roleKey].routeTitle}, módulo ${index + 1}${solved ? " · ya lo resolviste en un intento posterior, conviene repasarlo igual" : ""}</small>
        <a class="inline-link" href="#${roleKey}#modulo-${index + 1}">Repasar la lección →</a></li>`);
    });
  }));
  ROLE_KEYS.forEach((roleKey) => {
    const levels = currentLevels(roleKey);
    Object.keys(levels).filter((concept) => levels[concept] !== "Afianzado").forEach((concept) => {
      items.push(`<li><span>${escapeHTML(conceptLabels[concept] || concept)}</span>
        <small>${roles[roleKey].routeTitle}, evaluación final · ${levels[concept]}</small>
        <a class="inline-link" href="#${roleKey}#evaluacion">Reforzar en la evaluación →</a></li>`);
    });
  });
  return items.length
    ? `<p>Estos puntos se te complicaron en un chequeo o en la evaluación final.</p><ul class="review-list">${items.join("")}</ul>`
    : "<p>Todavía no hay puntos para repasar. Aparecen cuando una respuesta de un chequeo no sale bien en el primer intento, o cuando un concepto no queda afianzado en la evaluación final.</p>";
}

function portfolioHistoryHTML() {
  const attempts = ROLE_KEYS.flatMap((roleKey) => moduleContent[roleKey].flatMap((module, index) =>
    (portalState.modules[roleKey][index].quiz?.attempts || []).map((attempt) => ({ ...attempt, roleKey, index, module }))))
    .sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 12);
  if (!attempts.length) return "<p>Todavía no hiciste ningún chequeo.</p>";
  return `<div class="table-wrap"><table><caption class="sr-only">Últimos chequeos realizados</caption>
    <thead><tr><th scope="col">Fecha</th><th scope="col">Módulo</th><th scope="col">Resultado</th></tr></thead>
    <tbody>${attempts.map((attempt) => `<tr><td>${formatDate(attempt.at)}</td><td>${escapeHTML(roles[attempt.roleKey].routeTitle)}, módulo ${attempt.index + 1}: ${escapeHTML(attempt.module.title)}</td><td>${attempt.score} de ${attempt.total}</td></tr>`).join("")}</tbody></table></div>`;
}

function portfolioStartHTML() {
  const saved = portalState.diagnostic;
  if (saved?.status === "done") {
    return `<p>Diagnóstico hecho el ${formatDate(saved.at)}. No tiene nota: sirve para orientarte.</p>
      <h3 class="diag-sub">Lo que contaste</h3>${diagnosticSummaryHTML(saved.answers)}
      <h3 class="diag-sub">Sugerencias para vos</h3>${recommendationsHTML(saved.answers)}
      <a class="secondary-button link-button" href="#diagnostico">Ver o rehacer el diagnóstico</a>`;
  }
  return `<p>${saved?.status === "skipped" ? "Elegiste omitir el diagnóstico de entrada." : "Todavía no hiciste el diagnóstico de entrada."} Son pocas preguntas, sin nota, y te sirven para recibir sugerencias.</p>
    <a class="button button-dark" href="#diagnostico">Hacer el diagnóstico</a>`;
}

function renderPortfolio() {
  const hasActivity = ROLE_KEYS.some((roleKey) => portalState.modules[roleKey].some((m) => m.quiz)) || Object.keys(portalState.practice).length > 0;
  document.querySelector("#portfolio-body").innerHTML = `
    <section class="portfolio-section" aria-labelledby="pf-start"><h2 id="pf-start">Tu punto de partida</h2>${portfolioStartHTML()}</section>
    <section class="portfolio-section" aria-labelledby="pf-progress"><h2 id="pf-progress">Tu avance</h2>
      ${hasActivity ? "" : '<p>Todavía no empezaste ningún módulo. Elegí una ruta desde el inicio.</p>'}
      ${portfolioProgressHTML()}</section>
    <section class="portfolio-section" aria-labelledby="pf-review"><h2 id="pf-review">Para repasar</h2>${portfolioReviewHTML()}</section>
    <section class="portfolio-section" aria-labelledby="pf-history"><h2 id="pf-history">Historial de chequeos</h2>${portfolioHistoryHTML()}</section>
    <section class="portfolio-section no-print" aria-labelledby="pf-data"><h2 id="pf-data">Mis datos</h2>
      <p>Tu avance, tus prácticas y tus respuestas se guardan solo en este navegador. Descargá una copia para guardarla o para llevarla a otro equipo.</p>
      <div class="help-data-actions">
        <button type="button" class="secondary-button" id="pf-print">Imprimir mi portafolio</button>
        <button type="button" class="secondary-button" id="pf-export">Descargar mi avance</button>
        <label class="secondary-button file-button" for="pf-import">Importar un avance<input id="pf-import" type="file" accept="application/json,.json" class="sr-only"></label>
      </div>
      <p class="workspace-note">Al importar, se reemplaza el avance que tenés ahora en este navegador.</p></section>`;
  document.querySelector("#pf-export").addEventListener("click", exportProgress);
  document.querySelector("#pf-print").addEventListener("click", printPortfolio);
  document.querySelector("#pf-import").addEventListener("change", importFromInput);
}

function printPortfolio() {
  const clone = document.querySelector("#portfolio-body").cloneNode(true);
  clone.querySelectorAll(".no-print, a.button, a.link-button").forEach((element) => element.remove());
  document.querySelector("#print-area").innerHTML = `<h1>Mi portafolio · SGE Libreta Digital</h1><p>Portal de capacitación. Registro de práctica con datos ficticios, guardado en este navegador. Impreso el ${formatDate(new Date().toISOString())}.</p>${clone.innerHTML}`;
  window.print();
}

function exportProgress() {
  downloadFile("avance-portal-sge.json", new Blob([JSON.stringify(portalState, null, 2)], { type: "application/json" }));
  showNotice("Se descargó una copia de tu avance.");
}

function importFromInput(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 2_000_000) { showNotice("El archivo es demasiado grande para ser una copia de avance."); return; }
  const reader = new FileReader();
  reader.onload = async () => {
    const confirmed = await simConfirm({
      title: "Importar un avance",
      body: "<p>Se reemplaza el avance que tenés ahora en este navegador (módulos, prácticas, diagnóstico y registros) por el del archivo.</p>",
      confirmLabel: "Importar y reemplazar"
    });
    if (confirmed && importPortalState(String(reader.result)) && !document.querySelector("#portafolio").hidden) renderPortfolio();
  };
  reader.onerror = () => showNotice("No se pudo leer el archivo.");
  reader.readAsText(file);
}
