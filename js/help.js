/* Botón de ayuda permanente y gestión de "Mis datos". */

const helpToggle = document.querySelector("#help-toggle");
const helpPanel = document.querySelector("#help-panel");

function setHelpOpen(open, { restoreFocus = false } = {}) {
  helpPanel.hidden = !open;
  helpToggle.setAttribute("aria-expanded", String(open));
  if (open) helpPanel.querySelector("a, button")?.focus();
  else if (restoreFocus) helpToggle.focus();
}

helpToggle.addEventListener("click", () => setHelpOpen(helpPanel.hidden));
document.querySelector("#help-close").addEventListener("click", () => setHelpOpen(false, { restoreFocus: true }));
helpPanel.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setHelpOpen(false, { restoreFocus: true });
});
// Los enlaces internos del panel cambian de sección: se cierra el panel para no tapar el contenido.
helpPanel.addEventListener("click", (event) => {
  if (event.target.closest("a[href^='#']")) setHelpOpen(false);
});

document.querySelector("#data-export").addEventListener("click", exportProgress);
document.querySelector("#data-import").addEventListener("change", importFromInput);

const resetButton = document.querySelector("#data-reset");
let resetTimer;
resetButton.addEventListener("click", () => {
  if (resetButton.dataset.confirm === "true") {
    clearTimeout(resetTimer);
    resetButton.dataset.confirm = "";
    resetButton.textContent = "Borrar mis datos";
    resetPortalState();
    return;
  }
  resetButton.dataset.confirm = "true";
  resetButton.textContent = "Confirmar: borrar todo";
  resetTimer = setTimeout(() => {
    resetButton.dataset.confirm = "";
    resetButton.textContent = "Borrar mis datos";
  }, 6000);
});
