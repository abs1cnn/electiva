/* Evaluación final por perfil: preguntas por concepto, resultado por concepto, refuerzo y constancia.
   - Una evaluación completa tiene EXAM_LENGTH preguntas: una por concepto y el resto de los conceptos críticos.
   - Se aprueba con EXAM_PASS de aciertos y sin ningún concepto crítico en "A reforzar" (todas mal).
   - El refuerzo practica solo los conceptos que no están afianzados, con preguntas nuevas cuando las hay.
   - Los intentos son ilimitados. La constancia se emite con la evaluación aprobada y la ruta completa. */

const exam = { role: null, mode: "full", questions: [], index: 0, correct: 0, byConcept: {} };

const levelOf = (entry) => entry.correct === entry.total ? "Afianzado" : entry.correct === 0 ? FINAL_EXAM_RED_LABEL : "En proceso";
const levelClass = (level) => level === "Afianzado" ? "level-ok" : level === "En proceso" ? "level-mid" : "level-low";
const levelChip = (level) => `<span class="level-chip ${levelClass(level)}">${level}</span>`;
const percentText = (value) => `${Math.round(value * 100)} %`;

function examState(roleKey) { return portalState.finalExam[roleKey]; }

/* Nivel actual de cada concepto: el del último intento que lo incluyó. */
function currentLevels(roleKey) {
  const levels = {};
  examState(roleKey).attempts.forEach((attempt) => {
    Object.entries(attempt.byConcept || {}).forEach(([concept, entry]) => { levels[concept] = levelOf(entry); });
  });
  return levels;
}

function examStatus(roleKey) {
  const attempts = examState(roleKey).attempts;
  const fulls = attempts.filter((attempt) => attempt.mode === "full");
  const passed = fulls.filter((attempt) => attempt.passed);
  if (passed.length) return { state: "passed", pct: Math.max(...passed.map((attempt) => attempt.score / attempt.total)), at: passed[0].at };
  if (attempts.length) {
    const last = attempts.at(-1);
    return { state: "tried", pct: last.score / last.total, mode: last.mode };
  }
  return { state: "new" };
}

const certificateReady = (roleKey) => examStatus(roleKey).state === "passed" && completedModules(roleKey) === moduleContent[roleKey].length;

/* ---------- Armado de una evaluación ---------- */
const shuffleArray = (list) => { const copy = list.slice(); for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };

function questionsFor(roleKey, concept) {
  const seen = new Set(examState(roleKey).seen);
  const all = examBank[roleKey].filter((question) => question.concept === concept);
  return [...shuffleArray(all.filter((q) => !seen.has(q.id))), ...shuffleArray(all.filter((q) => seen.has(q.id)))];
}

function buildExam(roleKey, mode) {
  let concepts = Object.keys(conceptSources[roleKey]);
  if (mode === "refuerzo") {
    const levels = currentLevels(roleKey);
    concepts = concepts.filter((concept) => levels[concept] && levels[concept] !== "Afianzado");
    const picked = concepts.flatMap((concept) => questionsFor(roleKey, concept).slice(0, 2));
    return shuffleArray(picked).slice(0, EXAM_LENGTH);
  }
  const picked = concepts.map((concept) => questionsFor(roleKey, concept)[0]);
  const used = new Set(picked.map((question) => question.id));
  const extras = [...examCritical[roleKey], ...concepts].flatMap((concept) => questionsFor(roleKey, concept)).filter((question) => !used.has(question.id));
  for (const question of extras) { if (picked.length >= EXAM_LENGTH) break; if (!used.has(question.id)) { picked.push(question); used.add(question.id); } }
  return shuffleArray(picked);
}

/* ---------- Pantalla ---------- */
function renderExam(roleKey) {
  const role = roles[roleKey];
  if (!role) return false;
  currentRole = roleKey;
  exam.role = roleKey;
  const back = document.querySelector("#exam-back");
  back.href = `#${roleKey}`;
  back.textContent = `← ${role.routeTitle}`;
  document.querySelector("#exam-title").textContent = `Evaluación final: ${role.routeTitle}`;
  document.querySelector("#exam-summary").textContent = "Afianzá los conceptos de tu ruta y descubrí qué te conviene repasar.";
  showExamIntro();
  return true;
}

function examBody() { return document.querySelector("#exam-body"); }

function showExamIntro() {
  const roleKey = exam.role;
  const status = examStatus(roleKey);
  const attempts = examState(roleKey).attempts;
  const levels = currentLevels(roleKey);
  const weak = Object.keys(levels).filter((concept) => levels[concept] !== "Afianzado");
  const done = completedModules(roleKey);
  const total = moduleContent[roleKey].length;
  const statusLine = status.state === "passed" ? `<p class="quiz-status quiz-status-ok">Aprobaste la evaluación con ${percentText(status.pct)}.</p>`
    : status.state === "tried" ? `<p class="quiz-status quiz-status-warn">Tu último intento fue de ${percentText(status.pct)}. Todavía no alcanzaste el nivel para aprobar.</p>` : "";
  const routeNote = done < total ? `<p class="quiz-status quiz-status-warn">Todavía te faltan módulos de la ruta (${done} de ${total} completados). Podés rendir igual, pero te va a servir más después de recorrerlos, y la constancia se emite cuando completes los ${total}.</p>` : "";
  examBody().innerHTML = `
    <section class="exam-card" aria-labelledby="exam-how">
      <h2 id="exam-how" tabindex="-1">Cómo funciona</h2>
      <ul class="exam-rules">
        <li>Son ${EXAM_LENGTH} preguntas sobre los conceptos de tu ruta, con situaciones y verdadero o falso. Después de cada respuesta ves la explicación y de qué manual sale.</li>
        <li>Se aprueba con ${Math.ceil(EXAM_LENGTH * EXAM_PASS)} aciertos o más, y sin ningún concepto crítico en rojo.</li>
        <li>Al final ves tu resultado por concepto y qué te conviene repasar. Podés reforzar solo lo que quedó flojo.</li>
        <li>No hay límite de intentos y cada intento usa preguntas distintas siempre que haya disponibles. No hay penalización.</li>
      </ul>
      ${statusLine}${routeNote}
      <div class="quiz-actions">
        <button type="button" class="simulator-submit" id="exam-start">${attempts.length ? "Rendir una evaluación completa" : "Empezar la evaluación"}</button>
        ${weak.length ? `<button type="button" class="secondary-button" id="exam-reinforce">Reforzar solo lo flojo (${weak.length} ${weak.length === 1 ? "concepto" : "conceptos"})</button>` : ""}
      </div>
    </section>
    ${attempts.length ? `<section class="exam-card" aria-labelledby="exam-levels"><h2 id="exam-levels">Tus conceptos hoy</h2>${conceptTableHTML(roleKey, levels)}</section>` : ""}
    <div id="exam-certificate"></div>
    ${attempts.length ? `<section class="exam-card" aria-labelledby="exam-history"><h2 id="exam-history">Tus intentos</h2>${attemptsTableHTML(roleKey)}</section>` : ""}`;
  examBody().querySelector("#exam-start").addEventListener("click", () => startExam("full"));
  examBody().querySelector("#exam-reinforce")?.addEventListener("click", () => startExam("refuerzo"));
  renderCertificateBox(roleKey);
}

function conceptTableHTML(roleKey, levels) {
  const critical = new Set(examCritical[roleKey]);
  return `<div class="table-wrap"><table><caption class="sr-only">Nivel de cada concepto</caption>
    <thead><tr><th scope="col">Concepto</th><th scope="col">Nivel</th></tr></thead>
    <tbody>${Object.keys(conceptSources[roleKey]).map((concept) => `<tr><th scope="row">${escapeHTML(conceptLabels[concept] || concept)}${critical.has(concept) ? ' <span class="critical-tag">crítico</span>' : ""}</th><td>${levels[concept] ? levelChip(levels[concept]) : '<span class="sim-muted">Sin evaluar</span>'}</td></tr>`).join("")}</tbody></table></div>`;
}

function attemptsTableHTML(roleKey) {
  const rows = examState(roleKey).attempts.slice().reverse().slice(0, 10).map((attempt) =>
    `<tr><td>${formatDate(attempt.at)}</td><td>${attempt.mode === "full" ? "Evaluación completa" : "Refuerzo"}</td><td>${attempt.score} de ${attempt.total} (${percentText(attempt.score / attempt.total)})</td><td>${attempt.mode === "full" ? (attempt.passed ? "Aprobada" : "Todavía no") : "—"}</td></tr>`).join("");
  return `<div class="table-wrap"><table><caption class="sr-only">Intentos de la evaluación final</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Tipo</th><th scope="col">Aciertos</th><th scope="col">Resultado</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ---------- Preguntas ---------- */
function startExam(mode) {
  const questions = buildExam(exam.role, mode);
  if (!questions.length) { showNotice("No hay conceptos para reforzar: completá primero una evaluación."); return; }
  Object.assign(exam, { mode, questions, index: 0, correct: 0, byConcept: {} });
  showExamQuestion();
  examBody().querySelector("legend")?.focus();
}

function showExamQuestion() {
  const question = exam.questions[exam.index];
  const order = question.type === "tf" ? question.options.map((_, i) => i) : shuffleArray(question.options.map((_, i) => i));
  const label = question.type === "scenario" ? "Situación" : question.type === "tf" ? "Verdadero o falso" : "Opción múltiple";
  examBody().innerHTML = `
    <section class="exam-card">
      <p class="quiz-count-line"><strong>${exam.mode === "full" ? "Evaluación final" : "Refuerzo"}</strong> · Pregunta ${exam.index + 1} de ${exam.questions.length} · ${label}</p>
      <div class="track" role="progressbar" aria-label="Avance de la evaluación" aria-valuemin="0" aria-valuemax="${exam.questions.length}" aria-valuenow="${exam.index + 1}"><span style="width:${(exam.index + 1) / exam.questions.length * 100}%"></span></div>
      <div class="quiz"><form class="quiz-question" novalidate>
        <fieldset><legend tabindex="-1">${escapeHTML(question.prompt)}</legend>
          <div class="quiz-options">${order.map((optionIndex, position) => `<label class="quiz-option" data-option="${optionIndex}"><input type="radio" name="answer" value="${optionIndex}" ${position === 0 ? "required" : ""}><span class="quiz-option-text">${escapeHTML(question.options[optionIndex])}</span><span class="quiz-option-flag"></span></label>`).join("")}</div>
        </fieldset>
        <button type="submit" class="simulator-submit">Responder</button>
      </form><div class="quiz-feedback" role="status" aria-live="polite"></div></div>
      <button type="button" class="text-button" id="exam-leave">Salir de la evaluación</button>
    </section>`;
  const form = examBody().querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const chosen = form.querySelector("input:checked");
    if (!chosen) { examBody().querySelector(".quiz-feedback").innerHTML = '<p class="quiz-hint">Elegí una opción para responder.</p>'; return; }
    answerExamQuestion(question, Number(chosen.value), form);
  });
  examBody().querySelector("#exam-leave").addEventListener("click", showExamIntro);
}

function answerExamQuestion(question, chosenIndex, form) {
  const isCorrect = chosenIndex === question.answer;
  const entry = exam.byConcept[question.concept] || { correct: 0, total: 0 };
  entry.total += 1;
  if (isCorrect) { entry.correct += 1; exam.correct += 1; }
  exam.byConcept[question.concept] = entry;
  form.querySelectorAll("input").forEach((input) => { input.disabled = true; });
  form.querySelectorAll(".quiz-option").forEach((label) => {
    const index = Number(label.dataset.option);
    const flag = label.querySelector(".quiz-option-flag");
    if (index === question.answer) { label.classList.add("is-correct"); flag.textContent = "Respuesta correcta"; }
    else if (index === chosenIndex) { label.classList.add("is-wrong"); flag.textContent = "Tu respuesta"; }
  });
  form.querySelector("button[type=submit]").remove();
  const isLast = exam.index === exam.questions.length - 1;
  const feedback = examBody().querySelector(".quiz-feedback");
  feedback.className = `quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.innerHTML = `
    <p class="quiz-verdict">${isCorrect ? "Correcto." : "Todavía no."}</p>
    <p>${escapeHTML(question.explain)}</p>
    <p class="quiz-source">Fuente: ${escapeHTML(question.source)}</p>
    <button type="button" class="simulator-submit" id="exam-next">${isLast ? "Ver mi resultado" : "Siguiente pregunta"}</button>`;
  const next = feedback.querySelector("#exam-next");
  next.focus();
  next.addEventListener("click", () => {
    if (isLast) finishExam();
    else { exam.index += 1; showExamQuestion(); examBody().querySelector("legend").focus(); }
  });
}

/* ---------- Resultado ---------- */
function finishExam() {
  const roleKey = exam.role;
  const total = exam.questions.length;
  const critical = new Set(examCritical[roleKey]);
  const criticalRed = Object.entries(exam.byConcept).filter(([concept, entry]) => critical.has(concept) && levelOf(entry) === FINAL_EXAM_RED_LABEL).map(([concept]) => concept);
  const passed = exam.mode === "full" && exam.correct / total >= EXAM_PASS && criticalRed.length === 0;
  const attempt = { at: new Date().toISOString(), mode: exam.mode, score: exam.correct, total, byConcept: exam.byConcept, passed };
  const state = examState(roleKey);
  state.attempts.push(attempt);
  state.seen = [...new Set([...state.seen, ...exam.questions.map((question) => question.id)])];
  savePortalState(passed ? "Evaluación aprobada. Tu resultado quedó guardado." : "Resultado guardado.");

  const levels = Object.fromEntries(Object.entries(exam.byConcept).map(([concept, entry]) => [concept, levelOf(entry)]));
  const weak = Object.keys(levels).filter((concept) => levels[concept] !== "Afianzado");
  const pct = exam.correct / total;
  const reinforce = exam.mode === "refuerzo";
  const headline = reinforce ? `Refuerzo: acertaste ${exam.correct} de ${total}`
    : passed ? "Aprobaste la evaluación final" : `Acertaste ${exam.correct} de ${total}`;
  const message = reinforce ? (weak.length ? "Todavía quedan conceptos por afianzar. Repasalos y volvé a reforzar." : "Todos los conceptos reforzados quedaron afianzados. Cuando quieras, rendí una evaluación completa.")
    : passed ? `Lograste ${percentText(pct)} y ningún concepto crítico quedó en rojo.`
      : criticalRed.length ? `Para aprobar hacen falta ${Math.ceil(EXAM_LENGTH * EXAM_PASS)} aciertos y ningún concepto crítico en rojo. En este intento, ${criticalRed.length === 1 ? "un concepto crítico quedó" : "algunos conceptos críticos quedaron"} sin respuestas correctas.`
        : `Para aprobar hacen falta ${Math.ceil(EXAM_LENGTH * EXAM_PASS)} aciertos. Mirá qué conviene repasar y volvé a intentarlo cuando quieras.`;
  examBody().innerHTML = `
    <section class="exam-card exam-result ${passed || (reinforce && !weak.length) ? "is-correct" : "is-wrong"}" aria-labelledby="exam-result-title">
      <h2 id="exam-result-title" tabindex="-1">${headline}</h2><p>${message}</p></section>
    <section class="exam-card" aria-labelledby="exam-levels"><h2 id="exam-levels">Tu resultado por concepto</h2>${conceptTableHTML(roleKey, { ...currentLevels(roleKey), ...levels })}</section>
    ${weak.length ? `<section class="exam-card" aria-labelledby="exam-review"><h2 id="exam-review">Para reforzar</h2><p>Repasá estos puntos antes del próximo intento.</p>${miniLessonsHTML(roleKey, weak)}</section>` : ""}
    <div id="exam-certificate"></div>
    <div class="quiz-actions">
      ${weak.length ? '<button type="button" class="simulator-submit" id="exam-reinforce">Reforzar solo lo flojo</button>' : ""}
      <button type="button" class="${weak.length ? "secondary-button" : "simulator-submit"}" id="exam-again">Rendir una evaluación completa</button>
      <a class="text-button" href="#${roleKey}">Volver a la ruta</a>
    </div>`;
  examBody().querySelector("#exam-again").addEventListener("click", () => startExam("full"));
  examBody().querySelector("#exam-reinforce")?.addEventListener("click", () => startExam("refuerzo"));
  renderCertificateBox(roleKey);
  examBody().querySelector("#exam-result-title").focus();
  window.scrollTo({ top: 0 });
}

function miniLessonsHTML(roleKey, concepts) {
  return `<div class="mini-lessons">${concepts.map((concept) => {
    const [moduleIndex, cardIndex] = conceptSources[roleKey][concept];
    const card = moduleContent[roleKey][moduleIndex].lesson[cardIndex];
    return `<article class="mini-lesson"><h3>${escapeHTML(conceptLabels[concept] || concept)}</h3>
      <p>${escapeHTML(card.text)}</p>${card.remember ? `<p class="lesson-remember"><strong>Para recordar:</strong> ${escapeHTML(card.remember)}</p>` : ""}
      <a class="inline-link" href="#${roleKey}#modulo-${moduleIndex + 1}">Ir al módulo ${moduleIndex + 1}: ${escapeHTML(moduleContent[roleKey][moduleIndex].title)} →</a></article>`;
  }).join("")}</div>`;
}

/* ---------- Constancia ---------- */
function renderCertificateBox(roleKey) {
  const slot = document.querySelector("#exam-certificate");
  if (!slot) return;
  const status = examStatus(roleKey);
  if (status.state !== "passed") { slot.innerHTML = ""; return; }
  if (!certificateReady(roleKey)) {
    slot.innerHTML = `<section class="exam-card"><h2>Tu constancia</h2><p>Aprobaste la evaluación. La constancia se emite cuando completás los ${moduleContent[roleKey].length} módulos de la ruta (${completedModules(roleKey)} completados). <a class="inline-link" href="#${roleKey}">Ir a la ruta</a></p></section>`;
    return;
  }
  slot.innerHTML = `<section class="exam-card" aria-labelledby="cert-title"><h2 id="cert-title">Tu constancia</h2>
    <p>Completaste la ${roles[roleKey].routeTitle} y aprobaste la evaluación final. Escribí tu nombre si querés que figure en la constancia; queda solo en este navegador.</p>
    <div class="field cert-field"><label for="cert-name">Nombre y apellido (opcional)</label><input id="cert-name" type="text" maxlength="80" autocomplete="name" value="${escapeHTML(portalState.learnerName)}"></div>
    <button type="button" class="simulator-submit" id="cert-print">Imprimir constancia</button>
    <p class="workspace-note">Es una constancia de práctica generada por este portal. No es un certificado oficial.</p></section>`;
  slot.querySelector("#cert-name").addEventListener("input", (event) => { portalState.learnerName = event.target.value.slice(0, 80); persistState(); });
  slot.querySelector("#cert-print").addEventListener("click", () => printCertificate(roleKey));
}

function printCertificate(roleKey) {
  const status = examStatus(roleKey);
  const name = portalState.learnerName.trim();
  document.querySelector("#print-area").innerHTML = `
    <div class="certificate">
      <p class="cert-kicker">SGE · Libreta Digital · Portal de capacitación</p>
      <h1>Constancia de práctica</h1>
      <p>Se deja constancia de que</p>
      <p class="cert-name">${name ? escapeHTML(name) : "&nbsp;"}</p>
      <p>completó la <strong>${escapeHTML(roles[roleKey].routeTitle)}</strong> (${moduleContent[roleKey].length} módulos con chequeo y práctica) y aprobó la evaluación final con <strong>${percentText(status.pct)}</strong> de aciertos, el ${formatDate(status.at)}.</p>
      <p class="cert-note">Documento generado por un portal de práctica con datos ficticios. No es un certificado oficial ni reemplaza la capacitación o las indicaciones del Ministerio de Educación.</p>
    </div>`;
  window.print();
}

/* ---------- En la ruta y en el portafolio ---------- */
function examStatusText(roleKey) {
  const status = examStatus(roleKey);
  if (status.state === "passed") return `Aprobada con ${percentText(status.pct)}${certificateReady(roleKey) ? ". Constancia disponible." : "."}`;
  if (status.state === "tried") return `Último intento: ${percentText(status.pct)}. Todavía no alcanzaste el nivel para aprobar.`;
  return "Todavía no la rendiste.";
}

function renderExamCard(roleKey) {
  const slot = document.querySelector("#exam-card");
  if (!slot) return;
  const done = completedModules(roleKey);
  const total = moduleContent[roleKey].length;
  const status = examStatus(roleKey);
  slot.innerHTML = `<section class="exam-entry" aria-labelledby="exam-entry-title">
    <div><h2 id="exam-entry-title">Evaluación final</h2>
      <p>${EXAM_LENGTH} preguntas sobre los conceptos de la ruta, con resultado por concepto y refuerzo de lo que quede flojo.</p>
      <p class="exam-entry-status">${examStatusText(roleKey)}${done < total ? ` Te faltan módulos: ${done} de ${total} completados.` : ""}</p></div>
    <a class="button ${status.state === "passed" ? "button-light-outline" : "button-dark"}" href="#${roleKey}#evaluacion">${status.state === "new" ? "Ir a la evaluación" : "Abrir la evaluación"} <span aria-hidden="true">→</span></a>
  </section>`;
}
