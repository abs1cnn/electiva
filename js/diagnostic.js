/* Diagnóstico de entrada: cuestionario por partes, resultado con sugerencias y aviso en el inicio.
   No tiene nota. Las respuestas se guardan en portalState.diagnostic y solo viven en este navegador. */

const diag = { step: 0, answers: {}, error: "" };

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function answerText(id, value) {
  const labels = diagnosticLabels[id];
  if (Array.isArray(value)) return value.map((v) => labels.options[v] || v).join(", ");
  return labels.options?.[value] || value;
}

function diagnosticSummaryHTML(answers) {
  const items = diagnosticSteps.flatMap((step) => step.questions)
    .filter((question) => answers[question.id] && answers[question.id].length)
    .map((question) => `<div><dt>${escapeHTML(question.text.replace(/\s*\(opcional\)$/, ""))}</dt><dd>${escapeHTML(answerText(question.id, answers[question.id]))}</dd></div>`);
  return `<dl class="summary-list">${items.join("")}</dl>`;
}

function recommendationsHTML(answers) {
  const picks = buildRecommendations(answers);
  if (!picks.length) return "<p>Con lo que contaste, no hace falta ningún ajuste: podés empezar por cualquier ruta.</p>";
  return `<ul class="reco-list">${picks.map((pick) => `<li><h3>${escapeHTML(pick.title)}</h3><p>${escapeHTML(pick.text)}</p>${pick.href ? `<a class="inline-link" href="${pick.href}">${escapeHTML(pick.action)} →</a>` : ""}</li>`).join("")}</ul>`;
}

function saveDiagnostic(status, answers = {}) {
  portalState.diagnostic = { status, at: new Date().toISOString(), answers };
  savePortalState("");
  renderDiagnosticBanner();
}

/* ---------- Pantalla del cuestionario ---------- */
function renderDiagnosticView() {
  const container = document.querySelector("#diagnostic-body");
  const saved = portalState.diagnostic;
  if (saved?.status === "done" && !diag.redo) {
    container.innerHTML = `<section class="diag-result" aria-labelledby="diag-result-title">
      <h2 id="diag-result-title" tabindex="-1">Tu punto de partida</h2>
      <p>Hiciste el diagnóstico el ${formatDate(saved.at)}. No tiene nota: sirve para orientarte.</p>
      <h3 class="diag-sub">Lo que contaste</h3>${diagnosticSummaryHTML(saved.answers)}
      <h3 class="diag-sub">Sugerencias para vos</h3>${recommendationsHTML(saved.answers)}
      <div class="quiz-actions"><a class="button button-dark" href="#portafolio">Ver mi portafolio <span aria-hidden="true">→</span></a><button type="button" class="secondary-button" id="diag-redo">Rehacer el diagnóstico</button></div>
    </section>`;
    container.querySelector("#diag-redo").addEventListener("click", () => { diag.redo = true; diag.step = 0; diag.answers = { ...saved.answers }; diag.error = ""; renderDiagnosticView(); container.querySelector("#diag-step-title")?.focus(); });
    return;
  }
  if (diag.step === 0 && !diag.started) { diag.answers = diag.redo ? diag.answers : { ...(saved?.answers || {}) }; diag.started = true; }
  const step = diagnosticSteps[diag.step];
  const last = diag.step === diagnosticSteps.length - 1;
  container.innerHTML = `
    <form id="diag-form" novalidate>
      <p class="diag-progress" id="diag-progress">Parte ${diag.step + 1} de ${diagnosticSteps.length}</p>
      <div class="track" role="progressbar" aria-labelledby="diag-progress" aria-valuemin="1" aria-valuemax="${diagnosticSteps.length}" aria-valuenow="${diag.step + 1}"><span style="width:${(diag.step + 1) / diagnosticSteps.length * 100}%"></span></div>
      <h2 id="diag-step-title" tabindex="-1">${escapeHTML(step.title)}</h2>
      <p class="diag-intro">${escapeHTML(step.intro)}</p>
      ${step.questions.map(renderQuestion).join("")}
      <div class="diag-error" id="diag-error" role="alert">${escapeHTML(diag.error)}</div>
      <div class="quiz-actions">
        ${diag.step > 0 ? '<button type="button" class="secondary-button" id="diag-back">Atrás</button>' : ""}
        <button type="submit" class="simulator-submit">${last ? "Ver mis sugerencias" : "Siguiente"}</button>
        <button type="button" class="text-button" id="diag-skip">Omitir por ahora</button>
      </div>
    </form>`;
  const form = container.querySelector("#diag-form");
  form.addEventListener("change", (event) => collect(form, event.target));
  form.addEventListener("input", (event) => { if (event.target.matches("textarea")) collect(form, event.target); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    collect(form);
    const missing = step.questions.filter((question) => question.required && !diag.answers[question.id]);
    if (missing.length) {
      diag.error = `Falta responder: ${missing.map((question) => `“${question.text.replace(/[….]+$/, "")}”`).join(", ")}.`;
      container.querySelector("#diag-error").textContent = diag.error;
      form.querySelector(`[data-question="${missing[0].id}"] input`)?.focus();
      return;
    }
    diag.error = "";
    if (!last) { diag.step += 1; renderDiagnosticView(); container.querySelector("#diag-step-title").focus(); window.scrollTo({ top: 0 }); return; }
    saveDiagnostic("done", { ...diag.answers });
    Object.assign(diag, { step: 0, redo: false, started: false });
    renderDiagnosticView();
    container.querySelector("#diag-result-title")?.focus();
  });
  form.querySelector("#diag-back")?.addEventListener("click", () => { collect(form); diag.step -= 1; diag.error = ""; renderDiagnosticView(); container.querySelector("#diag-step-title").focus(); });
  form.querySelector("#diag-skip").addEventListener("click", () => {
    if (portalState.diagnostic?.status !== "done") saveDiagnostic("skipped");
    Object.assign(diag, { step: 0, redo: false, started: false, answers: {} });
    location.hash = "inicio";
  });
}

function renderQuestion(question) {
  const value = diag.answers[question.id];
  if (question.type === "text") {
    return `<fieldset class="diag-question" data-question="${question.id}"><legend>${escapeHTML(question.text)}</legend>
      <textarea name="${question.id}" rows="3" maxlength="${question.max}">${escapeHTML(value || "")}</textarea></fieldset>`;
  }
  const isMulti = question.type === "multi";
  return `<fieldset class="diag-question" data-question="${question.id}"><legend>${escapeHTML(question.text)}${question.required ? "" : ""}</legend>
    <div class="choice-list">${question.options.map((option) => {
      const checked = isMulti ? (value || []).includes(option.value) : value === option.value;
      return `<label class="choice"><input type="${isMulti ? "checkbox" : "radio"}" name="${question.id}" value="${option.value}" ${checked ? "checked" : ""}><span>${escapeHTML(option.label)}</span></label>`;
    }).join("")}</div></fieldset>`;
}

/* Lee el formulario y aplica la opción exclusiva ("Nada en particular") de las preguntas múltiples. */
function collect(form, changed = null) {
  diagnosticSteps[diag.step].questions.forEach((question) => {
    if (question.type === "text") { diag.answers[question.id] = form.elements[question.id].value.slice(0, question.max).trim(); return; }
    if (question.type === "single") { const checked = form.querySelector(`input[name="${question.id}"]:checked`); if (checked) diag.answers[question.id] = checked.value; return; }
    let values = [...form.querySelectorAll(`input[name="${question.id}"]:checked`)].map((input) => input.value);
    if (question.exclusive) {
      if (changed?.name === question.id && changed.value === question.exclusive && changed.checked) values = [question.exclusive];
      else if (changed?.name === question.id) values = values.filter((v) => v !== question.exclusive);
      form.querySelectorAll(`input[name="${question.id}"]`).forEach((input) => { input.checked = values.includes(input.value); });
    }
    diag.answers[question.id] = values;
  });
}

/* ---------- Inicio: aviso y ruta sugerida ---------- */
function renderDiagnosticBanner() {
  const slot = document.querySelector("#diagnostic-banner");
  const saved = portalState.diagnostic;
  if (!saved) {
    slot.innerHTML = `<section class="diag-banner" aria-labelledby="diag-banner-title">
      <div><h2 id="diag-banner-title">Antes de empezar: un diagnóstico de entrada</h2><p>Son pocas preguntas y no tienen nota. Sirven para sugerirte por dónde empezar y qué formatos te convienen.</p></div>
      <div class="diag-banner-actions"><a class="button button-dark" href="#diagnostico">Hacer el diagnóstico</a><button type="button" class="text-button" id="diag-dismiss">Ahora no</button></div>
    </section>`;
    slot.querySelector("#diag-dismiss").addEventListener("click", () => { saveDiagnostic("skipped"); });
  } else if (saved.status === "skipped") {
    slot.innerHTML = `<p class="diag-line">Todavía no hiciste el diagnóstico de entrada. <a class="inline-link" href="#diagnostico">Hacerlo ahora</a></p>`;
  } else {
    slot.innerHTML = `<p class="diag-line">Diagnóstico hecho el ${formatDate(saved.at)}. <a class="inline-link" href="#portafolio">Ver mi portafolio</a></p>`;
  }
  document.querySelectorAll(".role-tag").forEach((tag) => tag.remove());
  const role = saved?.status === "done" ? saved.answers.role : null;
  const card = role && document.querySelector(`.role-card[data-role="${role}"]`);
  if (card) card.querySelector("h3").insertAdjacentHTML("afterend", '<span class="role-tag">Recomendada para vos</span>');
}
