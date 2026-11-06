/* Navegación por hash, vistas, progreso, módulos, preguntas frecuentes y búsqueda.
   Rutas: #inicio · #profesor | #preceptor | #directivo · #<perfil>#modulo-N · #<perfil>#simulador
          #recursos · #podcasts · #videos · #ayuda */

const views = {
  inicio: document.querySelector(".home-view"),
  role: document.querySelector("#role-view"),
  module: document.querySelector("#module-view"),
  exam: document.querySelector("#exam-view"),
  diagnostico: document.querySelector("#diagnostico"),
  portafolio: document.querySelector("#portafolio"),
  recursos: document.querySelector("#recursos"),
  podcasts: document.querySelector("#podcasts"),
  videos: document.querySelector("#videos"),
  ayuda: document.querySelector("#ayuda")
};
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("#search-results");
const STATUS_LABEL = { pending: "Pendiente", review: "Para reforzar", practice: "Falta la práctica", done: "Completado" };
let currentModule = null;

function renderHomeProgress() {
  const container = document.querySelector("#home-progress-list");
  container.innerHTML = Object.entries(roles).map(([key, role]) => {
    const total = moduleContent[key].length;
    const done = completedModules(key);
    const percent = Math.round(done / total * 100);
    return `<a href="#${key}" class="home-progress-item" aria-label="${role.name}: ${done} de ${total} módulos completados">
      <span class="home-progress-title">${role.name}<b>${done}/${total}</b></span>
      <span class="progress-track" aria-hidden="true"><span style="width:${percent}%"></span></span>
    </a>`;
  }).join("");
}

function nextModuleIndex(roleKey) {
  const index = moduleContent[roleKey].findIndex((_, i) => moduleStatus(roleKey, i) !== "done");
  return index === -1 ? null : index;
}

function renderRoleProgress(roleKey) {
  const total = moduleContent[roleKey].length;
  const done = completedModules(roleKey);
  const percent = Math.round(done / total * 100);
  const next = nextModuleIndex(roleKey);
  const hint = next === null
    ? "Completaste todos los módulos de esta ruta."
    : `Siguiente: módulo ${next + 1}, ${moduleContent[roleKey][next].title}.`;
  document.querySelector("#role-progress").innerHTML = `
    <div class="role-progress-copy"><strong>${done} de ${total} módulos completados</strong><span>${hint}</span></div>
    <div class="role-progress-track" role="progressbar" aria-label="Progreso de la ruta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>
    <button type="button" class="text-button" id="reset-role-progress">Reiniciar ruta</button>`;
  const reset = document.querySelector("#reset-role-progress");
  reset.addEventListener("click", () => {
    if (reset.dataset.confirm !== "true") {
      reset.dataset.confirm = "true";
      reset.textContent = "Confirmar: reiniciar";
      setTimeout(() => { if (reset.isConnected) { reset.dataset.confirm = ""; reset.textContent = "Reiniciar ruta"; } }, 6000);
      return;
    }
    portalState.modules[roleKey] = [0, 1, 2].map(() => ({ quiz: null }));
    practiceTasks[roleKey].flat().forEach((task) => { delete portalState.practice[task.flag]; });
    savePortalState("Se reinició el progreso de esta ruta.");
    renderRole(roleKey);
  });
}

function statusBadge(status) {
  return `<span class="status-badge status-${status}">${STATUS_LABEL[status]}</span>`;
}

function renderModuleCards(roleKey) {
  const next = nextModuleIndex(roleKey);
  document.querySelector("#module-list").innerHTML = moduleContent[roleKey].map((module, index) => {
    const status = moduleStatus(roleKey, index);
    const action = status === "pending" ? (index === next ? "Empezar módulo" : "Ver módulo")
      : status === "review" ? "Repasar y repetir el chequeo" : status === "practice" ? "Terminar la práctica" : "Repasar módulo";
    return `<article class="module-card ${index === next ? "is-next" : ""}" id="modulo-${index + 1}">
      <div class="module-card-top"><span class="module-index" aria-hidden="true">${index + 1}</span>${statusBadge(status)}</div>
      <h3><span class="sr-only">Módulo ${index + 1}: </span>${escapeHTML(module.title)}</h3>
      <p>${escapeHTML(module.summary)}</p>
      <a class="module-open" href="#${roleKey}#modulo-${index + 1}">${action} <span aria-hidden="true">→</span></a>
    </article>`;
  }).join("");
  renderExamCard(roleKey);
}

function renderRole(roleKey) {
  const role = roles[roleKey];
  if (!role) return false;
  currentRole = roleKey;
  document.querySelector("#role-title").textContent = role.routeTitle;
  document.querySelector("#role-intro").textContent = role.intro;
  renderModuleCards(roleKey);
  renderRoleProgress(roleKey);
  renderWorkspace(roleKey);
  return true;
}

/* Transcripción completa de un podcast, plegada para no alargar la página. */
function transcriptHTML(key) {
  const text = (transcripts[key] || "").trim();
  const body = text
    ? text.split(/\n\s*\n/).map((paragraph) => `<p>${escapeHTML(paragraph.trim())}</p>`).join("")
    : "<p>La transcripción de este episodio todavía no está disponible.</p>";
  return `<details class="transcript"><summary>Transcripción del episodio</summary><div class="transcript-body" lang="es">${body}</div></details>`;
}

function renderPodcasts() {
  document.querySelector("#podcast-grid").innerHTML = Object.entries(podcasts).map(([key, podcast]) => {
    const href = encodeURI(podcast.file);
    return `<article class="podcast-card">
      <span class="podcast-icon" aria-hidden="true"><svg class="icon"><use href="#i-headphones"/></svg></span>
      <h2>${escapeHTML(podcast.title)}</h2>
      <p>${escapeHTML(podcast.summary)}</p>
      <audio controls preload="none" aria-label="Escuchar el podcast ${escapeHTML(podcast.title)}"><source src="${href}" type="audio/mp4">Tu navegador no puede reproducir este audio. <a href="${href}">Descargalo acá</a>.</audio>
      <a class="podcast-download" href="${href}" download>Descargar episodio <span aria-hidden="true">↓</span></a>
      ${transcriptHTML(key)}
    </article>`;
  }).join("");
}

function renderResource(resource) {
  if (resource.type === "doc") {
    return `<div class="module-resource">${renderDocCard(resource.key)}<p class="resource-hint">${escapeHTML(resource.note)}</p></div>`;
  }
  const podcast = podcasts[resource.key];
  const href = encodeURI(podcast.file);
  return `<div class="module-resource"><div class="doc-card podcast-inline">
    <span class="doc-icon" aria-hidden="true"><svg class="icon"><use href="#i-headphones"/></svg></span>
    <span class="doc-info"><span class="doc-type">Podcast</span><strong>${escapeHTML(podcast.title)}</strong></span>
    <audio controls preload="none" aria-label="Escuchar el podcast ${escapeHTML(podcast.title)}"><source src="${href}" type="audio/mp4">Tu navegador no puede reproducir este audio.</audio>
    <span class="doc-actions"><a class="doc-button" href="${href}" download>Descargar ↓</a></span>
  </div>${transcriptHTML(resource.key)}<p class="resource-hint">${escapeHTML(resource.note)}</p></div>`;
}

function refreshModuleHeader() {
  if (!currentModule) return;
  const { roleKey, index } = currentModule;
  document.querySelector("#module-status").outerHTML = statusBadge(moduleStatus(roleKey, index)).replace("<span", '<span id="module-status"');
}

function renderModule(roleKey, index) {
  const role = roles[roleKey];
  const module = moduleContent[roleKey]?.[index];
  if (!role || !module) return false;
  currentRole = roleKey;
  currentModule = { roleKey, index };
  const back = document.querySelector("#module-back");
  back.href = `#${roleKey}`;
  back.textContent = `← ${role.routeTitle}`;
  document.querySelector("#module-position").textContent = `Módulo ${index + 1} de ${moduleContent[roleKey].length}`;
  document.querySelector("#module-title").textContent = module.title;
  document.querySelector("#module-summary").textContent = module.summary;
  refreshModuleHeader();
  document.querySelector("#lesson-steps").innerHTML = module.lesson.map((card) => `
    <li class="lesson-card">
      <h3>${escapeHTML(card.title)}</h3>
      <p>${escapeHTML(card.text)}</p>
      ${card.remember ? `<p class="lesson-remember"><strong>Para recordar:</strong> ${escapeHTML(card.remember)}</p>` : ""}
    </li>`).join("");
  document.querySelector("#module-resources").innerHTML = module.resources.map(renderResource).join("");
  document.querySelector("#module-practice").innerHTML = renderModulePractice(roleKey, index);
  renderQuiz(document.querySelector("#module-quiz"), roleKey, index, refreshModuleHeader);
  const last = index === moduleContent[roleKey].length - 1;
  document.querySelector("#module-nav").innerHTML = `
    ${last ? `<a class="button button-dark" href="#${roleKey}#evaluacion">Ir a la evaluación final <span aria-hidden="true">→</span></a><a class="button button-light-outline" href="#${roleKey}">Volver a la ruta</a>`
      : `<a class="button button-light-outline" href="#${roleKey}#modulo-${index + 2}">Siguiente: ${escapeHTML(moduleContent[roleKey][index + 1].title)} <span aria-hidden="true">→</span></a>`}`;
  return true;
}

function renderModulePractice(roleKey, index) {
  const tasks = practiceTasks[roleKey][index];
  return `<p>Aplicá lo que viste en el simulador. Cuando termines el chequeo y estas tareas, el módulo queda completado.</p>
    <ul class="practice-list">${tasks.map((task) => `<li class="${portalState.practice[task.flag] ? "is-done" : ""}"><span class="task-mark">${portalState.practice[task.flag] ? "Hecha" : "Pendiente"}</span> ${escapeHTML(task.label)}</li>`).join("")}</ul>
    <a class="button button-dark" href="#${roleKey}#simulador">Ir al área de práctica <span aria-hidden="true">→</span></a>`;
}

function renderFaq() {
  document.querySelector("#faq-list").innerHTML = faqItems.map(([question, answer]) =>
    `<details class="faq-item"><summary>${question}</summary><p>${answer}</p></details>`).join("");
}

let hasNavigated = false;

function showView(viewName, roleKey = null, moduleIndex = null) {
  if (activeUtterance) stopNarration("Narración detenida al cambiar de sección.");
  Object.values(views).forEach((view) => { view.hidden = true; });
  currentModule = null;
  if (viewName === "diagnostico") { Object.assign(diag, { step: 0, redo: false, started: false, error: "" }); renderDiagnosticView(); }
  if (viewName === "portafolio") renderPortfolio();
  if (viewName === "exam" && !renderExam(roleKey)) viewName = "inicio";
  if (viewName === "role" && !renderRole(roleKey)) viewName = "inicio";
  if (viewName === "module" && !renderModule(roleKey, moduleIndex)) {
    viewName = roles[roleKey] && renderRole(roleKey) ? "role" : "inicio";
  }
  views[viewName].hidden = false;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === viewName) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const inRole = viewName === "role" || viewName === "module" || viewName === "exam";
  if (!inRole) currentRole = null;
  searchResults.hidden = true;
  if (viewName !== "inicio") window.scrollTo({ top: 0, behavior: smoothBehavior() });
  document.title = viewName === "module"
    ? `${moduleContent[roleKey][moduleIndex].title} | ${roles[roleKey].routeTitle} | SGE · Libreta Digital`
    : viewName === "exam" ? `Evaluación final | ${roles[roleKey].routeTitle} | SGE · Libreta Digital`
    : viewName === "role"
      ? `${roles[roleKey].routeTitle} | SGE · Libreta Digital`
      : "SGE · Libreta Digital | Portal de capacitación";
  // Al cambiar de sección, el foco pasa al título para que lectores de pantalla y teclado sepan dónde están.
  if (hasNavigated) {
    const heading = views[viewName].querySelector("h1");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  hasNavigated = true;
}

function routeFromHash() {
  const parts = decodeURIComponent(location.hash.slice(1)).split("#");
  const route = parts[0] || "inicio";
  if (route === "main-content") return; // enlace de salto: no es una sección del portal
  const moduleMatch = /^modulo-([1-9])$/.exec(parts[1] || "");
  if (roles[route] && parts[1] === "evaluacion") {
    showView("exam", route);
  } else if (roles[route] && moduleMatch) {
    showView("module", route, Number(moduleMatch[1]) - 1);
  } else if (roles[route]) {
    showView("role", route);
    if (parts[1]) requestAnimationFrame(() => document.getElementById(parts[1])?.scrollIntoView({ behavior: smoothBehavior() }));
  } else if (["recursos", "podcasts", "videos", "ayuda", "diagnostico", "portafolio"].includes(route)) showView(route);
  else showView("inicio");
}

function buildSearchIndex() {
  const entries = [];
  Object.entries(roles).forEach(([roleKey, role]) => {
    moduleContent[roleKey].forEach((module, index) => entries.push({
      title: module.title,
      description: `${role.name} · ${module.summary} ${module.lesson.map((card) => `${card.title} ${card.text}`).join(" ")}`,
      href: `#${roleKey}#modulo-${index + 1}`, category: role.name
    }));
    entries.push({ title: `Evaluación final: ${role.routeTitle}`, description: `${role.name} · Preguntas por concepto, resultado por concepto, refuerzo y constancia de la ruta.`, href: `#${roleKey}#evaluacion`, category: "Evaluación final" });
    entries.push({ title: practiceAreas[roleKey].title, description: `${role.name} · ${practiceAreas[roleKey].description}`, href: `#${roleKey}#simulador`, category: "Simulador" });
  });
  faqItems.forEach(([title, description]) => entries.push({ title, description, href: "#ayuda", category: "Preguntas frecuentes" }));
  entries.push({ title: "Diagnóstico de entrada", description: "Cuestionario sin nota sobre tu perfil, tus herramientas digitales, tu conexión y tus dudas, con sugerencias para empezar.", href: "#diagnostico", category: "Diagnóstico" });
  entries.push({ title: "Mi portafolio", description: "Tu avance, los módulos completados, los puntos para repasar y el historial de chequeos.", href: "#portafolio", category: "Portafolio" });
  entries.push({ title: "Centro de recursos", description: "Instructivos de calificaciones, asistencia y finalización del IPE.", href: "#recursos", category: "Recursos" });
  entries.push(
    { title: "Carga de notas", description: "Podcast sobre carga de notas.", href: "#podcasts", category: "Podcast" },
    { title: "Seguridad informática", description: "Podcast sobre seguridad informática.", href: "#podcasts", category: "Podcast" },
    { title: "Género", description: "Podcast sobre género.", href: "#podcasts", category: "Podcast" },
    { title: "Sala de profes", description: "Podcast para la sala de profes.", href: "#podcasts", category: "Podcast" }
  );
  return entries;
}
const searchIndex = buildSearchIndex();

function runSearch() {
  const normalize = (text) => text.toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "");
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
      : '<div class="search-empty">No encontramos resultados. Probá con “asistencia”, “calificación” o “IPE”.</div>';
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
document.querySelectorAll("[data-role], [data-resource-role]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = link.getAttribute("href");
}));
document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => {
  const target = document.getElementById(button.dataset.scroll);
  target?.scrollIntoView({ behavior: smoothBehavior() });
  target?.focus({ preventScroll: true });
}));
