/* Chequeos formativos de cada módulo: una pregunta por vez, con respuesta y explicación inmediatas.
   El resultado se guarda en portalState.modules[perfil][n].quiz. Se puede repetir sin límite. */

function shuffled(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function renderQuiz(container, roleKey, moduleIndex, onSaved = () => {}) {
  const questions = moduleContent[roleKey][moduleIndex].check;
  const total = questions.length;
  let current = 0;
  let missed = [];
  let correctCount = 0;

  function showIntro() {
    const quiz = portalState.modules[roleKey][moduleIndex].quiz;
    const last = quiz?.attempts.at(-1);
    const summary = !last ? `<p>Son ${total} preguntas. Después de cada respuesta vas a ver por qué es correcta o no. Podés repetirlo todas las veces que quieras.</p>`
      : quiz.passed
        ? `<p class="quiz-status quiz-status-ok">Chequeo aprobado. Si querés repasar, podés repetirlo cuando quieras.</p>`
        : `<p class="quiz-status quiz-status-warn">En tu último intento acertaste ${last.score} de ${last.total}. Repasá la lección y volvé a intentarlo.</p>`;
    container.innerHTML = `${summary}<button type="button" class="simulator-submit" id="quiz-start">${last ? "Repetir el chequeo" : "Empezar el chequeo"}</button>`;
    container.querySelector("#quiz-start").addEventListener("click", () => { current = 0; missed = []; correctCount = 0; showQuestion(); container.querySelector("legend")?.focus(); });
  }

  function showQuestion() {
    const question = questions[current];
    const order = shuffled(question.options.length);
    container.innerHTML = `
      <form class="quiz-question" novalidate>
        <fieldset>
          <legend tabindex="-1"><span class="quiz-count">Pregunta ${current + 1} de ${total}</span>${escapeHTML(question.prompt)}</legend>
          <div class="quiz-options">
            ${order.map((optionIndex, position) => `
              <label class="quiz-option" data-option="${optionIndex}">
                <input type="radio" name="answer" value="${optionIndex}" ${position === 0 ? "required" : ""}>
                <span class="quiz-option-text">${escapeHTML(question.options[optionIndex])}</span>
                <span class="quiz-option-flag"></span>
              </label>`).join("")}
          </div>
        </fieldset>
        <button type="submit" class="simulator-submit">Responder</button>
      </form>
      <div class="quiz-feedback" role="status" aria-live="polite"></div>`;
    const form = container.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const chosen = form.querySelector("input:checked");
      if (!chosen) {
        container.querySelector(".quiz-feedback").innerHTML = '<p class="quiz-hint">Elegí una opción para responder.</p>';
        return;
      }
      answer(question, Number(chosen.value), form);
    });
  }

  function answer(question, chosenIndex, form) {
    const isCorrect = chosenIndex === question.answer;
    if (isCorrect) correctCount += 1; else missed.push(question);
    form.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    form.querySelectorAll(".quiz-option").forEach((label) => {
      const index = Number(label.dataset.option);
      const flag = label.querySelector(".quiz-option-flag");
      if (index === question.answer) { label.classList.add("is-correct"); flag.textContent = "Respuesta correcta"; }
      else if (index === chosenIndex) { label.classList.add("is-wrong"); flag.textContent = "Tu respuesta"; }
    });
    form.querySelector("button[type=submit]").remove();
    const isLast = current === total - 1;
    const feedback = container.querySelector(".quiz-feedback");
    feedback.className = `quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
    feedback.innerHTML = `
      <p class="quiz-verdict">${isCorrect ? "Correcto." : "Todavía no."}</p>
      <p>${escapeHTML(question.explain)}</p>
      <p class="quiz-source">Fuente: ${escapeHTML(question.source)}</p>
      <button type="button" class="simulator-submit" id="quiz-next">${isLast ? "Ver resultado" : "Siguiente pregunta"}</button>`;
    const next = feedback.querySelector("#quiz-next");
    next.focus();
    next.addEventListener("click", () => {
      if (isLast) finish(); else { current += 1; showQuestion(); container.querySelector("legend").focus(); }
    });
  }

  function finish() {
    const entry = portalState.modules[roleKey][moduleIndex];
    const quiz = entry.quiz || { attempts: [], passed: false, weak: [] };
    const missedConcepts = [...new Set(missed.map((question) => question.concept))];
    if (!quiz.attempts.length) quiz.weak = missedConcepts;
    quiz.attempts.push({ score: correctCount, total, missed: missedConcepts, at: new Date().toISOString() });
    if (correctCount === total) quiz.passed = true;
    entry.quiz = quiz;
    savePortalState(correctCount === total ? "Chequeo aprobado. Tu avance quedó guardado." : "Resultado guardado. Podés repetir el chequeo cuando quieras.");

    const perfect = correctCount === total;
    container.innerHTML = `
      <div class="quiz-result ${perfect ? "is-correct" : "is-wrong"}" tabindex="-1">
        <h3>${perfect ? "Chequeo aprobado" : `Acertaste ${correctCount} de ${total}`}</h3>
        <p>${perfect ? "Respondiste bien todas las preguntas. El módulo queda completado." : "Para completar el módulo hace falta responder bien todas las preguntas. Estos son los puntos para repasar:"}</p>
        ${perfect ? "" : `<ul class="quiz-review">${missed.map((question) => `<li><strong>${escapeHTML(question.prompt)}</strong><span>${escapeHTML(question.explain)}</span></li>`).join("")}</ul>`}
        <div class="quiz-actions">
          <button type="button" class="simulator-submit" id="quiz-retry">${perfect ? "Repetir el chequeo" : "Intentar de nuevo"}</button>
          <button type="button" class="text-button" id="quiz-lesson">Volver a la lección</button>
        </div>
      </div>`;
    container.querySelector(".quiz-result").focus();
    container.querySelector("#quiz-retry").addEventListener("click", () => { current = 0; missed = []; correctCount = 0; showQuestion(); container.querySelector("legend").focus(); });
    container.querySelector("#quiz-lesson").addEventListener("click", (event) => {
      event.preventDefault();
      const heading = document.querySelector("#lesson-start");
      heading?.scrollIntoView({ behavior: smoothBehavior() });
      heading?.focus({ preventScroll: true });
    });
    onSaved();
  }

  showIntro();
}
