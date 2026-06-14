/* Widget: curvas ROC comparativas. Las curvas se reconstruyen del modelo calibrado
   y pasan por el punto operativo REAL (umbral 0.5) de cada arquitectura; el AUC
   mostrado es el reportado en la tesis. Toggle de modelos. */
(function () {
  var S = 520, PAD = 64;

  function xy(fpr, tpr) {
    return [PAD + fpr * (S - PAD - 24), (S - PAD) - tpr * (S - PAD - 24)];
  }

  function render(container, state) {
    var models = window.THESIS.models;
    var grid = [0, 0.25, 0.5, 0.75, 1];

    var gridLines = grid.map(function (g) {
      var p = xy(g, 0)[0], py = xy(0, g)[1];
      return '<line x1="' + p + '" y1="' + (S - PAD) + '" x2="' + p + '" y2="' + ((S - PAD) - (S - PAD - 24)) + '" class="roc-grid"/>' +
             '<line x1="' + PAD + '" y1="' + py + '" x2="' + (S - 24) + '" y2="' + py + '" class="roc-grid"/>' +
             '<text x="' + p + '" y="' + (S - PAD + 24) + '" class="roc-tick" text-anchor="middle">' + g + '</text>' +
             '<text x="' + (PAD - 12) + '" y="' + (py + 5) + '" class="roc-tick" text-anchor="end">' + g + '</text>';
    }).join("");

    var diag = '<line x1="' + xy(0, 0)[0] + '" y1="' + xy(0, 0)[1] + '" x2="' + xy(1, 1)[0] + '" y2="' + xy(1, 1)[1] + '" class="roc-diag"/>';

    var curves = models.map(function (m) {
      if (!state.on[m.id]) return "";
      var pts = window.STATS.roc(m, 160).map(function (p) { var c = xy(p[0], p[1]); return c[0].toFixed(1) + "," + c[1].toFixed(1); }).join(" ");
      var op = xy(1 - m.specificity, m.recall);
      return '<polyline points="' + pts + '" class="roc-curve" style="stroke:' + m.color + '"/>' +
             '<circle cx="' + op[0].toFixed(1) + '" cy="' + op[1].toFixed(1) + '" r="7" class="roc-op" style="fill:' + m.color + '"/>';
    }).join("");

    var legend = models.map(function (m) {
      return '<button class="roc-leg' + (state.on[m.id] ? "" : " is-off") + '" data-m="' + m.id + '" style="--col:' + m.color + '">' +
        '<span class="roc-sw"></span>' +
        '<span class="roc-leg-name">' + m.label + '</span>' +
        '<span class="roc-auc">AUC ' + m.auc.toFixed(4) + '</span>' +
      '</button>';
    }).join("");

    container.innerHTML = '' +
      '<div class="roc-wrap">' +
        '<svg viewBox="0 0 ' + S + ' ' + S + '" class="roc-svg">' +
          gridLines + diag + curves +
          '<text x="' + (S / 2 + 10) + '" y="' + (S - 8) + '" class="roc-axislbl" text-anchor="middle">Tasa de falsos positivos (1 − especificidad)</text>' +
          '<text x="18" y="' + (S / 2) + '" class="roc-axislbl" text-anchor="middle" transform="rotate(-90 18 ' + (S / 2) + ')">Tasa de verdaderos positivos (recall)</text>' +
        '</svg>' +
        '<div class="roc-side">' +
          '<div class="roc-leg-title mono">Modelos</div>' +
          legend +
          '<div class="roc-note mono">● marca el umbral operativo 0.50. La curva se reconstruye del punto real; el AUC es el reportado.</div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll(".roc-leg").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-m");
        var anyOther = Object.keys(state.on).some(function (k) { return k !== id && state.on[k]; });
        if (state.on[id] && !anyOther) return; // no apagar el último
        state.on[id] = !state.on[id];
        render(container, state);
      });
    });
  }

  window.initRoc = function (container) {
    if (!container || !window.THESIS || !window.STATS) return;
    render(container, { on: { cnn: true, mobilenet: true, efficientnet: true } });
  };
})();
