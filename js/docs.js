/* Instructivos en PDF: tarjetas y vista previa. */

function renderDocCard(key) {
  const doc = documents[key];
  if (!doc) return "";
  const href = encodeURI(doc.file);
  const credit = [doc.source, doc.license].filter(Boolean).map(escapeHTML).join(" · ");
  return `<div class="doc-card">
    <span class="doc-icon" aria-hidden="true"><svg class="icon"><use href="#i-doc"/></svg></span>
    <span class="doc-info"><span class="doc-type">Instructivo en PDF</span><strong>${escapeHTML(doc.title)}</strong><small>${credit}</small>${doc.access ? `<small class="doc-access">${escapeHTML(doc.access)}</small>` : ""}</span>
    <span class="doc-actions"><button type="button" class="doc-button" data-doc-preview="${key}">Vista previa</button><a class="doc-button doc-button-primary" href="${href}" download>Descargar ↓</a></span>
  </div>`;
}

function openDocViewer(key) {
  const doc = documents[key];
  const viewer = document.querySelector("#doc-viewer");
  document.querySelector("#doc-viewer-title").textContent = doc.title;
  document.querySelector("#doc-viewer-source").textContent = [doc.source, doc.license, doc.access].filter(Boolean).join(" · ");
  document.querySelector("#doc-viewer-download").href = encodeURI(doc.file);
  document.querySelector("#doc-viewer-frame").src = encodeURI(doc.file);
  viewer.showModal();
}

function closeDocViewer() {
  document.querySelector("#doc-viewer").close();
}

document.querySelectorAll("[data-docs]").forEach((list) => {
  list.innerHTML = list.dataset.docs.split(" ").map(renderDocCard).join("");
});
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-doc-preview]");
  if (trigger) openDocViewer(trigger.dataset.docPreview);
});
document.querySelector("#doc-viewer-close").addEventListener("click", closeDocViewer);
document.querySelector("#doc-viewer").addEventListener("click", (event) => {
  if (event.target.id === "doc-viewer") closeDocViewer();
});
document.querySelector("#doc-viewer").addEventListener("close", () => {
  document.querySelector("#doc-viewer-frame").src = "about:blank";
});
