/* Widget: matrices de confusión de los 3 modelos (datos reales del test oficial).
   Toggle conteos / tasas. La celda de falsos negativos se resalta como crítica. */
(function () {
  function cellRate(v, total) { return total ? (v / total * 100).toFixed(1) + "%" : "0%"; }

  function render(container, state) {
    var P = window.THESIS.test_pos, N = window.THESIS.test_neg;
    var cards = window.THESIS.models.map(function (m) {
      var cm = m.cm;
      function fmt(v, base) { return state.mode === "rate" ? cellRate(v, base) : v; }
      return '' +
        '<div class="cmx-card">' +
          '<div class="cmx-name"><span class="sw" style="background:' + m.color + '"></span>' + m.label + '</div>' +
          '<div class="cmx-grid">' +
            '<div class="cmx-axis cmx-axis-top">Predicción</div>' +
            '<div class="cmx-col cmx-col-neg">sin corr.</div>' +
            '<div class="cmx-col cmx-col-pos">con corr.</div>' +
            '<div class="cmx-rowlbl cmx-row-neg">real<br>sin corr.</div>' +
            '<div class="cmx-cell ok"><b>' + fmt(cm.tn, N) + '</b><span>VN</span></div>' +
            '<div class="cmx-cell warn"><b>' + fmt(cm.fp, N) + '</b><span>FP · falsa alarma</span></div>' +
            '<div class="cmx-rowlbl cmx-row-pos">real<br>con corr.</div>' +
            '<div class="cmx-cell crit"><b>' + fmt(cm.fn, P) + '</b><span>FN · omisión</span></div>' +
            '<div class="cmx-cell ok"><b>' + fmt(cm.tp, P) + '</b><span>VP</span></div>' +
          '</div>' +
          '<div class="cmx-sum"><b class="accent-rust">' + cm.fn + '</b> omisiones · <b>' + cm.fp + '</b> falsas alarmas</div>' +
        '</div>';
    }).join("");

    container.innerHTML = '' +
      '<div class="cmx-top">' +
        '<div class="cmx-toggle">' +
          '<button class="cmx-tg' + (state.mode === "count" ? " is-on" : "") + '" data-mode="count">Conteos</button>' +
          '<button class="cmx-tg' + (state.mode === "rate" ? " is-on" : "") + '" data-mode="rate">Tasas</button>' +
        '</div>' +
        '<div class="cmx-key"><span><i class="sw sw-ok"></i>Acierto</span><span><i class="sw sw-warn"></i>Falsa alarma</span><span><i class="sw sw-crit"></i>Omisión (crítico)</span></div>' +
      '</div>' +
      '<div class="cmx-row">' + cards + '</div>';

    container.querySelectorAll(".cmx-tg").forEach(function (b) {
      b.addEventListener("click", function () { state.mode = b.getAttribute("data-mode"); render(container, state); });
    });
  }

  window.initConfusion = function (container) {
    if (!container || !window.THESIS) return;
    render(container, { mode: "count" });
  };
})();
