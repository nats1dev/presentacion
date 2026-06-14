/* Widget: pipeline metodológico animado. Las etapas se encienden en secuencia;
   cada una es clicable para ver su detalle. Fuente: Tesis/Metodologia.md. */
(function () {
  var STEPS = [
    { n: "01", label: "Repositorio público", detail: "Imágenes fotográficas de conexiones estructurales de acero, etiquetadas en dos clases: corrosión / sin corrosión.", icon: "▤" },
    { n: "02", label: "Auditoría", detail: "Control de duplicados exactos por hash, trazabilidad con source_key y verificación de ausencia de solapamiento entre particiones.", icon: "◫" },
    { n: "03", label: "Preprocesamiento", detail: "Redimensión a 224×224 px, normalización con estadísticas de ImageNet y aumento de datos durante el entrenamiento.", icon: "⊞" },
    { n: "04", label: "Entrenamiento", detail: "CNN propia entrenada desde cero; MobileNetV2 y EfficientNet-B0 por transferencia de aprendizaje. Optimizador Adam, pérdida BCE.", icon: "◴" },
    { n: "05", label: "Evaluación", detail: "Métricas de clasificación, matrices de confusión, contraste estadístico (Q de Cochran), GradCAM++ y benchmark de inferencia en GPU.", icon: "◷" }
  ];

  function render(container, state) {
    var nodes = STEPS.map(function (s, i) {
      return '' +
        (i > 0 ? '<div class="pl-arrow" data-i="' + i + '"><svg viewBox="0 0 60 24"><path d="M2 12 H50 M44 6 L52 12 L44 18" fill="none"/></svg></div>' : '') +
        '<button class="pl-node' + (i === state.active ? ' is-active' : '') + '" data-i="' + i + '">' +
          '<span class="pl-ic">' + s.icon + '</span>' +
          '<span class="pl-n mono">' + s.n + '</span>' +
          '<span class="pl-lbl">' + s.label + '</span>' +
        '</button>';
    }).join("");

    var s = STEPS[state.active];
    container.innerHTML = '' +
      '<div class="pl-flow">' + nodes + '</div>' +
      '<div class="pl-detail">' +
        '<div class="pl-detail-n mono">Etapa ' + s.n + '</div>' +
        '<div class="pl-detail-t">' + s.label + '</div>' +
        '<div class="pl-detail-d">' + s.detail + '</div>' +
      '</div>';

    container.querySelectorAll(".pl-node").forEach(function (b) {
      b.addEventListener("click", function () {
        state.active = parseInt(b.getAttribute("data-i"), 10);
        if (state.timer) { clearInterval(state.timer); state.timer = null; }
        render(container, state);
      });
    });
  }

  window.initPipeline = function (container) {
    if (!container) return;
    var state = { active: 0, timer: null };
    render(container, state);
    // autoplay de la secuencia, una sola vez
    var i = 0;
    state.timer = setInterval(function () {
      i++;
      if (i >= STEPS.length) { clearInterval(state.timer); state.timer = null; return; }
      state.active = i; render(container, state);
    }, 1100);
  };
})();
