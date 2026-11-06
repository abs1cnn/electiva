/* Accesibilidad: tamaño de texto y narración de la página por párrafos.

   Narración: lee la pantalla actual párrafo por párrafo y se DETIENE al terminar cada uno.
   Con la narración activa:
     →  flecha derecha: sigue con el párrafo siguiente
     ←  flecha izquierda: vuelve al párrafo anterior
     Enter: entra a la pantalla (enlace) del párrafo actual; al llegar, sigue narrando esa pantalla
     M: salta a "Otras secciones del portal" (Podcasts, Recursos…) sin recorrer toda la pantalla
     Esc: detiene la narración
   Al final de la pantalla se leen las otras secciones del portal, para poder entrar a ellas con Enter. */

const textSizeValue = document.querySelector("#text-size-value");
const narrationStart = document.querySelector("#narration-start");
const narrationPause = document.querySelector("#narration-pause");
const narrationResume = document.querySelector("#narration-resume");
const narrationStop = document.querySelector("#narration-stop");
const narrationPrev = document.querySelector("#narration-prev");
const narrationNext = document.querySelector("#narration-next");
const narrationEnter = document.querySelector("#narration-enter");
const narrationStatus = document.querySelector("#narration-status");
const volumeDown = document.querySelector("#volume-down");
const volumeUp = document.querySelector("#volume-up");
const volumeValue = document.querySelector("#volume-value");
let textScale = 1;

/* Respeta "reducir movimiento": el desplazamiento programático no se anima si la persona lo pidió. */
const smoothBehavior = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/* Barra de accesibilidad plegable: la flechita muestra u oculta las herramientas (queda recordado en este navegador).
   El estado de la narración queda siempre visible al lado del botón. */
(() => {
  const toggle = document.querySelector("#accessibility-toggle");
  const panel = document.querySelector("#accessibility-panel");
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    try { localStorage.setItem("accessibility-open", open ? "1" : "0"); } catch (error) { /* sin almacenamiento */ }
  };
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  let saved = "0";
  try { saved = localStorage.getItem("accessibility-open") || "0"; } catch (error) { /* sin almacenamiento */ }
  setOpen(saved === "1");
})();

/* Las tablas anchas se desplazan de costado: cuando desbordan, reciben el foco del teclado y un nombre. */
function syncScrollRegions() {
  document.querySelectorAll(".table-wrap").forEach((wrap) => {
    const overflowing = wrap.scrollWidth > wrap.clientWidth + 1;
    if (overflowing) {
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", (wrap.querySelector("caption")?.textContent || "Tabla").trim() + " (se desplaza de costado)");
    } else {
      wrap.removeAttribute("tabindex");
      wrap.removeAttribute("role");
      wrap.removeAttribute("aria-label");
    }
  });
}
/* "Ir al contenido principal": mueve el foco sin tocar la dirección, que usa el portal para navegar. */
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  const main = document.querySelector("#main-content");
  main.focus({ preventScroll: true });
  main.scrollIntoView({ behavior: smoothBehavior() });
});

let scrollSyncQueued = false;
const queueScrollSync = () => { if (scrollSyncQueued) return; scrollSyncQueued = true; setTimeout(() => { scrollSyncQueued = false; syncScrollRegions(); }, 30); };
new MutationObserver(queueScrollSync).observe(document.querySelector("main"), { childList: true, subtree: true });
window.addEventListener("resize", queueScrollSync);
queueScrollSync();

function setTextScale(scale) {
  textScale = Math.max(0.8, Math.min(1.5, Number(scale.toFixed(1))));
  document.documentElement.dataset.textScale = Math.round(textScale * 100);
  document.documentElement.style.setProperty("--text-scale", textScale);
  textSizeValue.textContent = `${Math.round(textScale * 100)}%`;
  document.querySelector("#text-smaller").disabled = textScale <= 0.8;
  document.querySelector("#text-larger").disabled = textScale >= 1.5;
}

/* ───────────────────────── Narración por párrafos ───────────────────────── */

/* router.js consulta `activeUtterance` y llama a `stopNarration` al cambiar de sección:
   queda definido (no nulo) mientras la narración está activa, aunque esté esperando una flecha. */
let activeUtterance = null;

const narration = {
  blocks: [],        // [{ el, text, action, cue }]
  index: 0,
  state: "idle",     // idle | speaking | paused | waiting (terminó un párrafo y espera una flecha)
  token: 0,          // invalida los callbacks de voz de un párrafo anterior
  keep: [],          // referencias a los utterances en curso (evita que el navegador los descarte)
  highlighted: null,
  audio: null        // <audio> iniciado con Enter desde la narración
};

/* Volumen de la voz: el navegador solo permite de 0 a 100 %; por encima de eso sube el volumen del dispositivo. */
let narrationVolume = 1;
try { const saved = parseFloat(localStorage.getItem("narration-volume")); if (saved >= 0.2 && saved <= 1) narrationVolume = saved; } catch (error) { /* sin almacenamiento */ }

const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
const NARRATION_SKIP = "script, style, svg, input, select, textarea, audio, video, iframe, dialog, template, noscript";
const BLOCK_TAGS = new Set(["DIV", "SECTION", "ARTICLE", "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "NAV", "HEADER", "FOOTER",
  "TABLE", "THEAD", "TBODY", "TR", "DETAILS", "SUMMARY", "FORM", "FIGURE", "DL", "DT", "DD", "MAIN", "ASIDE", "BLOCKQUOTE", "CAPTION", "FIELDSET"]);
const UNIT_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "LI", "SUMMARY", "CAPTION", "DT", "DD", "TR", "BLOCKQUOTE"]);
const SPACED_INLINE = new Set(["A", "BUTTON", "STRONG", "B", "SPAN", "SMALL", "EM"]);
const BLOCK_SELECTOR = "div, section, article, p, h1, h2, h3, h4, h5, h6, ul, ol, li, table, details, nav, form, figure, blockquote, fieldset";

function isNarrating() { return narration.state !== "idle"; }

function isNarrationHidden(el, ignoreSkip = false) {
  if (el.hidden || el.inert || el.getAttribute("aria-hidden") === "true" || (!ignoreSkip && el.matches(NARRATION_SKIP))) return true;
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden" || style.contentVisibility === "hidden";
}

function cleanNarrationText(text) {
  return text.replace(/[←→↑↓↗↵▸▾]/g, " ").replace(/\s*·\s*/g, ", ").replace(/\s+/g, " ").trim();
}

/* Texto que se lee de un nodo: respeta aria-label en enlaces y omite lo oculto. */
function narrationText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
  if (node.nodeType !== Node.ELEMENT_NODE || isNarrationHidden(node)) return "";
  if (node.tagName === "A" && node.getAttribute("aria-label")) return ` ${node.getAttribute("aria-label")} `;
  if (node.tagName === "DETAILS" && !node.open) {
    const summary = node.querySelector("summary");
    return summary ? narrationText(summary) : "";
  }
  let out = "";
  node.childNodes.forEach((child) => { out += narrationText(child); });
  if (node.tagName === "TD" || node.tagName === "TH") return `${out}, `;
  return BLOCK_TAGS.has(node.tagName) || SPACED_INLINE.has(node.tagName) ? ` ${out} ` : out;
}

/* Enlace al que "entra" Enter desde un párrafo: el propio enlace, el de su tarjeta o un resumen desplegable. */
function narrationAction(el) {
  if (!el) return null;
  if (el.tagName === "SUMMARY") return el;
  const link = el.closest("a[href]");
  if (link) return link;
  const card = el.closest("article, .home-progress-item");
  const inCard = card?.querySelector("a[href^='#']:not(.back-link)");
  if (inCard) return inCard;
  const own = el.querySelector("a[href]");
  return own && !own.hasAttribute("download") ? own : null;
}

function narrationActionLabel(action) {
  if (action.tagName === "SUMMARY" || action.tagName === "AUDIO") return "";
  if (action.matches(".role-card")) return cleanNarrationText(action.querySelector("h3")?.textContent || "");
  const label = cleanNarrationText(action.getAttribute("aria-label") || action.textContent || "");
  return label.length > 70 ? `${label.slice(0, 67)}…` : label;
}

/* Recorre la pantalla en orden y arma la lista de párrafos (bloques) a narrar. */
function collectNarrationBlocks(root) {
  const blocks = [];
  const add = (el, text, action) => {
    const clean = cleanNarrationText(text);
    if (clean) blocks.push({ el, text: clean, action: action === undefined ? narrationAction(el) : action, cue: false });
  };
  const hasBlockChild = (el) => Boolean(el.querySelector(BLOCK_SELECTOR));

  const walk = (container) => {
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const nodes = run;
      run = [];
      const text = nodes.map(narrationText).join("");
      const elements = nodes.filter((n) => n.nodeType === Node.ELEMENT_NODE);
      const onlyElement = elements.length === 1 && nodes.every((n) => n.nodeType === Node.ELEMENT_NODE || !n.nodeValue.trim());
      const link = elements.map((n) => (n.matches("a[href]") ? n : n.querySelector("a[href]"))).find(Boolean) || null;
      add(onlyElement ? elements[0] : container, text, link && !link.hasAttribute("download") ? link : null);
    };
    container.childNodes.forEach((child) => {
      if (container.tagName === "DETAILS" && !container.open && child.tagName !== "SUMMARY") return;
      if (child.nodeType === Node.TEXT_NODE) { run.push(child); return; }
      if (child.tagName === "AUDIO" && !isNarrationHidden(child, true)) {
        flush();
        const label = cleanNarrationText(child.getAttribute("aria-label") || "Reproductor de audio");
        blocks.push({ el: child, text: `${label}. Reproductor de audio`, action: child, cue: true });
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE || isNarrationHidden(child)) return;
      const isAnchorCard = child.tagName === "A" && hasBlockChild(child);
      if (UNIT_TAGS.has(child.tagName) && !hasBlockChild(child)) { flush(); add(child, narrationText(child)); }
      else if (isAnchorCard) { flush(); add(child, narrationText(child), child); }
      else if (BLOCK_TAGS.has(child.tagName)) { flush(); walk(child); }
      else run.push(child);
    });
    flush();
  };
  walk(root);

  // El aviso "Enter para entrar" se dice una sola vez por destino: en el último párrafo que lo comparte.
  const seen = new Set();
  for (let i = blocks.length - 1; i >= 0; i -= 1) {
    const action = blocks[i].action;
    if (action && !seen.has(action)) { seen.add(action); blocks[i].cue = true; }
  }

  // Otras secciones del portal, para poder entrar a ellas.
  const links = [...document.querySelectorAll(".main-nav a[href]")].filter((link) => !link.hasAttribute("aria-current"));
  if (links.length) {
    blocks.push({ el: document.querySelector(".main-nav"), text: "Otras secciones del portal.", action: null, cue: false });
    links.forEach((link) => blocks.push({ el: link, text: cleanNarrationText(link.textContent), action: link, cue: true }));
  }
  return blocks;
}

function currentNarrationView() { return document.querySelector("main .view:not([hidden])"); }

/* Partes cortas para que el navegador no corte los textos largos a mitad de la lectura. */
function speechChunks(text) {
  const sentences = text.match(/[^.!?…;:]+[.!?…;:]*\s*/g) || [text];
  const chunks = [];
  let current = "";
  sentences.forEach((sentence) => {
    if (current && (current + sentence).length > 180) { chunks.push(current.trim()); current = sentence; }
    else current += sentence;
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks.flatMap((chunk) => (chunk.length > 260 ? chunk.match(/.{1,240}(\s|$)/g).map((part) => part.trim()) : [chunk]));
}

function pickVoice() {
  const voices = synth ? synth.getVoices() : [];
  return voices.find((v) => /^es[-_]AR/i.test(v.lang)) || voices.find((v) => /^es[-_](419|MX|US)/i.test(v.lang)) || voices.find((v) => /^es/i.test(v.lang)) || null;
}

/* Aviso sonoro corto al terminar un párrafo, para saber que la narración está esperando. */
let cueContext = null;
function playPauseCue() {
  try {
    cueContext = cueContext || new (window.AudioContext || window.webkitAudioContext)();
    const now = cueContext.currentTime;
    const osc = cueContext.createOscillator();
    const gain = cueContext.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 * narrationVolume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(cueContext.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (error) { /* sin audio disponible: queda el aviso escrito */ }
}

function setNarrationStatus(message) { narrationStatus.textContent = message; }

function updateNarrationControls() {
  const state = narration.state;
  const active = state !== "idle";
  narrationStart.disabled = active || !synth;
  narrationPause.disabled = state !== "speaking";
  narrationResume.disabled = state !== "paused";
  narrationStop.disabled = !active;
  [narrationPrev, narrationNext, narrationEnter].forEach((button) => { button.disabled = !active; });
}

function highlightNarrationBlock(block) {
  narration.highlighted?.classList.remove("narration-current");
  narration.highlighted = block ? block.el : null;
  if (!block) return;
  block.el.classList.add("narration-current");
  const rect = block.el.getBoundingClientRect();
  const visible = rect.top >= 80 && rect.bottom <= window.innerHeight - 20;
  if (!visible) block.el.scrollIntoView({ behavior: smoothBehavior(), block: "center" });
}

/* El episodio que se reprodujo desde la narración se pausa al moverse a otro párrafo o al detener, para que no se pisen las voces. */
function pauseNarrationAudio() {
  const audio = narration.audio;
  if (audio && !audio.paused) audio.pause();
}

function stopNarration(message = "Narración detenida.") {
  pauseNarrationAudio();
  narration.token += 1;
  if (synth) { synth.cancel(); synth.resume(); }
  narration.state = "idle";
  narration.keep = [];
  activeUtterance = null;
  highlightNarrationBlock(null);
  updateNarrationControls();
  setNarrationStatus(message);
}

function waitingMessage(block, last) {
  const base = last
    ? "Fin de la pantalla. Flecha izquierda para volver."
    : "Flecha derecha para seguir, flecha izquierda para volver.";
  const verb = !block.action ? "" : block.action.tagName === "SUMMARY" ? "desplegar o plegar" : block.action.tagName === "AUDIO" ? "reproducir o pausar el episodio" : "entrar";
  return verb ? `${base} Enter para ${verb}.` : base;
}

/* Termina un párrafo: la narración se detiene y espera una flecha. */
function finishNarrationBlock(token) {
  if (token !== narration.token) return;
  narration.state = "waiting";
  narration.keep = [];
  updateNarrationControls();
  playPauseCue();
  const last = narration.index >= narration.blocks.length - 1;
  setNarrationStatus(`Pausa en el párrafo ${narration.index + 1} de ${narration.blocks.length}. ${waitingMessage(narration.blocks[narration.index], last)}`);
}

/* Lee un párrafo (con aviso previo opcional) y se detiene al terminarlo. */
function speakNarrationBlock(index, preface = "") {
  if (!synth) return;
  const blocks = narration.blocks;
  narration.index = Math.max(0, Math.min(blocks.length - 1, index));
  const block = blocks[narration.index];
  const token = ++narration.token;
  pauseNarrationAudio();
  synth.cancel();
  synth.resume();
  narration.state = "speaking";
  activeUtterance = narration;
  narration.keep = [];
  highlightNarrationBlock(block);
  updateNarrationControls();
  setNarrationStatus(`Párrafo ${narration.index + 1} de ${blocks.length}.`);

  const parts = [];
  if (preface) parts.push(preface);
  parts.push(...speechChunks(block.text));
  if (block.cue && block.action) {
    const label = narrationActionLabel(block.action);
    parts.push(block.action.tagName === "SUMMARY" ? "Enter para desplegar o plegar."
      : block.action.tagName === "AUDIO" ? "Enter para reproducir o pausar el episodio."
      : `Enter para entrar${label ? `: ${label}` : ""}.`);
  }

  const voice = pickVoice();
  let next = 0;
  const speakNext = () => {
    if (token !== narration.token) return;
    if (next >= parts.length) { finishNarrationBlock(token); return; }
    const utterance = new SpeechSynthesisUtterance(parts[next]);
    next += 1;
    utterance.lang = "es-AR";
    utterance.volume = narrationVolume;
    if (voice) utterance.voice = voice;
    utterance.onend = speakNext;
    utterance.onerror = (event) => {
      if (token !== narration.token || event.error === "interrupted" || event.error === "canceled") return;
      stopNarration(`No se pudo reproducir la narración: ${event.error}.`);
    };
    narration.keep.push(utterance);
    synth.speak(utterance);
  };
  // Un instante después de cancelar: algunos navegadores descartan lo que se encola en el mismo momento.
  setTimeout(speakNext, 40);
}

function startNarration({ index = 0, preface = true } = {}) {
  const view = currentNarrationView();
  narration.blocks = view ? collectNarrationBlocks(view) : [];
  if (!narration.blocks.length) { setNarrationStatus("No hay contenido disponible para leer."); return; }
  speakNarrationBlock(index, preface
    ? "Narración por párrafos. Al terminar cada párrafo me detengo: flecha derecha para seguir, flecha izquierda para volver, Enter para entrar a una pantalla, M para ir al menú de secciones, Escape para salir."
    : "");
}

/* Si el contenido cambió mientras se narraba (por ejemplo, se desplegó algo), vuelve a armar la lista. */
function refreshNarrationBlocks() {
  if (narration.blocks.every((block) => block.el.isConnected)) return;
  const view = currentNarrationView();
  const current = narration.blocks[narration.index]?.el;
  narration.blocks = view ? collectNarrationBlocks(view) : [];
  const found = narration.blocks.findIndex((block) => block.el === current);
  narration.index = found === -1 ? Math.min(narration.index, Math.max(0, narration.blocks.length - 1)) : found;
}

function narrationNextBlock() {
  if (!isNarrating()) return;
  refreshNarrationBlocks();
  if (narration.index >= narration.blocks.length - 1) {
    if (narration.state === "waiting") setNarrationStatus("Es el último párrafo de la pantalla. Flecha izquierda para volver.");
    else finishNarrationBlock(narration.token);
    return;
  }
  speakNarrationBlock(narration.index + 1);
}

function narrationPreviousBlock() {
  if (!isNarrating()) return;
  refreshNarrationBlocks();
  if (narration.index === 0) setNarrationStatus("Es el primer párrafo de la pantalla. Lo repito.");
  speakNarrationBlock(narration.index - 1);
}

/* Enter: entra a la pantalla del párrafo actual y sigue narrándola desde el principio (o desde la sección enlazada). */
function narrationEnterScreen() {
  if (!isNarrating()) return;
  refreshNarrationBlocks();
  const action = narration.blocks[narration.index]?.action;
  if (!action) { setNarrationStatus("Este párrafo no tiene una pantalla para entrar. Flecha derecha para seguir."); return; }

  if (action.tagName === "AUDIO") {
    if (action.paused) {
      narration.audio = action;
      action.addEventListener("ended", () => { if (isNarrating()) setNarrationStatus("Terminó el episodio. Flecha derecha para seguir, flecha izquierda para volver."); }, { once: true });
      action.play().then(
        () => setNarrationStatus("Reproduciendo el episodio. Enter para pausar. Flecha derecha o izquierda pausan el episodio y siguen con la narración."),
        () => setNarrationStatus("No se pudo reproducir el episodio. Probá con el botón de reproducción del reproductor o descargalo.")
      );
    } else {
      action.pause();
      setNarrationStatus("Episodio en pausa. Enter para reanudar.");
    }
    return;
  }

  if (action.tagName === "SUMMARY") {
    const details = action.parentElement;
    details.open = !details.open;
    const view = currentNarrationView();
    narration.blocks = view ? collectNarrationBlocks(view) : narration.blocks;
    narration.index = Math.max(0, narration.blocks.findIndex((block) => block.el === action));
    highlightNarrationBlock(narration.blocks[narration.index]);
    setNarrationStatus(details.open ? "Desplegado. Flecha derecha para leerlo." : "Plegado. Flecha derecha para seguir.");
    return;
  }

  const before = location.hash;
  const href = action.getAttribute("href") || "";
  const anchorId = href.includes("#") ? decodeURIComponent(href.slice(href.lastIndexOf("#") + 1)) : "";
  if (action.target === "_blank") { setNarrationStatus("Se abre en otra pestaña. La narración sigue en esta pantalla."); action.click(); return; }
  action.click();
  if (location.hash === before) { setNarrationStatus("Ya estás en esa pantalla. Flecha derecha para seguir."); return; }

  // La navegación detiene la narración (router.js); cuando cambia la pantalla se retoma desde el principio.
  const resume = () => {
    window.removeEventListener("hashchange", resume);
    const view = currentNarrationView();
    const blocks = view ? collectNarrationBlocks(view) : [];
    const target = anchorId ? document.getElementById(anchorId) : null;
    let start = 0;
    if (target && view && view.contains(target)) {
      const found = blocks.findIndex((block) => target === block.el || target.contains(block.el) ||
        Boolean(target.compareDocumentPosition(block.el) & Node.DOCUMENT_POSITION_FOLLOWING));
      if (found > 0) start = found;
    }
    narration.blocks = blocks;
    if (!blocks.length) return;
    speakNarrationBlock(start);
  };
  window.addEventListener("hashchange", resume);
  setTimeout(() => window.removeEventListener("hashchange", resume), 1500);
}

/* Atajo global para encender o apagar la narración: Alt+T.
   Ctrl+T también se escucha, pero los navegadores lo reservan para "nueva pestaña" y casi nunca lo entregan a la página. */
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "t" || event.shiftKey || event.metaKey || (!event.altKey && !event.ctrlKey)) return;
  if (event.altKey && event.ctrlKey) return;
  if (!synth || narrationStart.hasAttribute("data-unavailable")) return;
  event.preventDefault();
  if (isNarrating()) stopNarration();
  else startNarration();
});

document.addEventListener("keydown", (event) => {
  if (!isNarrating() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target instanceof Element ? event.target : document.body;
  const inControl = target.closest("input, select, textarea, audio, video, [contenteditable='true'], [role='slider'], [role='tablist'], [role='listbox'], [role='menu']");
  if (event.key === "Escape") {
    if (target.closest("dialog, [role='dialog']")) return;
    event.preventDefault();
    stopNarration();
  } else if (event.key === "ArrowRight" && !inControl) {
    event.preventDefault();
    narrationNextBlock();
  } else if (event.key === "ArrowLeft" && !inControl) {
    event.preventDefault();
    narrationPreviousBlock();
  } else if ((event.key === "m" || event.key === "M") && !inControl) {
    // M: salta al menú de otras secciones del portal (Podcasts, Recursos, etc.) sin recorrer toda la pantalla.
    event.preventDefault();
    refreshNarrationBlocks();
    const menu = narration.blocks.findIndex((block) => block.text === "Otras secciones del portal.");
    if (menu !== -1) speakNarrationBlock(menu);
  } else if (event.key === "Enter" && !target.closest("a[href], button, summary, input, select, textarea, [role='button'], [role='link'], audio, video")) {
    // Si el foco está en un control, Enter conserva su función normal.
    event.preventDefault();
    narrationEnterScreen();
  }
});

document.querySelector("#text-smaller").addEventListener("click", () => setTextScale(textScale - 0.1));
document.querySelector("#text-larger").addEventListener("click", () => setTextScale(textScale + 0.1));
document.querySelector("#text-reset").addEventListener("click", () => setTextScale(1));
narrationStart.addEventListener("click", () => startNarration());
narrationPause.addEventListener("click", () => {
  if (narration.state !== "speaking") return;
  synth.pause();
  narration.state = "paused";
  updateNarrationControls();
  setNarrationStatus("Narración pausada.");
});
narrationResume.addEventListener("click", () => {
  if (narration.state !== "paused") return;
  synth.resume();
  narration.state = "speaking";
  updateNarrationControls();
  setNarrationStatus(`Párrafo ${narration.index + 1} de ${narration.blocks.length}.`);
});
narrationStop.addEventListener("click", () => stopNarration());
narrationPrev.addEventListener("click", narrationPreviousBlock);
narrationNext.addEventListener("click", narrationNextBlock);
narrationEnter.addEventListener("click", narrationEnterScreen);

function setNarrationVolume(volume, announce = true) {
  narrationVolume = Math.max(0.2, Math.min(1, Math.round(volume * 10) / 10));
  const percent = Math.round(narrationVolume * 100);
  volumeValue.textContent = `${percent}%`;
  try { localStorage.setItem("narration-volume", String(narrationVolume)); } catch (error) { /* sin almacenamiento */ }
  if (announce) setNarrationStatus(narrationVolume >= 1 ? "Volumen de la voz al máximo (100 %). Para más, subí el volumen del dispositivo." : `Volumen de la voz: ${percent} %. Se aplica desde la próxima frase.`);
}
volumeDown.addEventListener("click", () => setNarrationVolume(narrationVolume - 0.1));
volumeUp.addEventListener("click", () => setNarrationVolume(narrationVolume + 0.1));
setNarrationVolume(narrationVolume, false);
updateNarrationControls();
if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
  narrationStart.disabled = true;
  narrationStart.setAttribute("data-unavailable", "");
  setNarrationStatus("La narración no está disponible en este navegador. Podés usar el lector de pantalla de tu dispositivo.");
}
