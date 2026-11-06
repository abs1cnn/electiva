/* Arranque del portal. Va al final: necesita todo lo definido en los otros scripts. */

window.addEventListener("hashchange", routeFromHash);
setTextScale(textScale);
renderFaq();
renderPodcasts();
renderHomeProgress();
renderDiagnosticBanner();
routeFromHash();
