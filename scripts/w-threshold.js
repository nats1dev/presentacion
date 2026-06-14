/* Widget: simulador de umbral — trade-off falsos negativos vs falsas alarmas.
   Calibrado al punto operativo real (umbral 0.5) de cada modelo. */
(function () {
  var W = 1180, H = 360, PADX = 8;

  function pdf(x, mu, s) { return Math.exp(-0.5 * Math.pow((x - mu) / s, 2)); }

  function curve(mu, s, x0, x1, peak) {
    // path para una gaussiana entre x0..x1 (en proporción 0..1), peak = altura px
    var pts = [], N = 120;
    for (var i = 0; i <= N; i++) {
      var t = x0 + (x1 - x0) * (i / N);
      var y = pdf(t, mu, s);
      pts.push([PADX + t * (W - 2 * PADX), H - 46 - y * peak]);
    }
    return pts;
  }
  function toPath(pts, baseY) {
    var d = "M " + pts[0][0] + " " + baseY;
    pts.forEach(function (p) { d += " L " + p[0].toFixed(1) + " " + p[1].toFixed(1); });
    d += " L " + pts[pts.length - 1][0] + " " + baseY + " Z";
    return d;
  }

  function render(container, state) {
    var m = window.THESIS.models.find(function (x) { return x.id === state.model; });
    var d = window.STATS.dist(m);
    var c = window.STATS.counts(m, state.thr);
    var baseY = H - 46;
    var thrX = PADX + state.thr * (W - 2 * PADX);
    var peak = 250;

    var negAll = curve(d.muN, d.s, -0.15, 1.15, peak);
    var posAll = curve(d.muP, d.s, -0.15, 1.15, peak);

    var tabs = window.THESIS.models.map(function (mm) {
      return '<button class="ts-tab' + (mm.id === state.model ? ' is-on' : '') + '" data-m="' + mm.id + '" style="--col:' + mm.color + '">' + mm.label + '</button>';
    }).join("");

    container.innerHTML = '' +
      '<div class="ts-top">' +
        '<div class="ts-tabs">' + tabs + '</div>' +
        '<div class="ts-hint">Mueve el umbral y observa el costo del error</div>' +
      '</div>' +
      '<div class="ts-stage">' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="ts-svg">' +
          '<defs>' +
            '<clipPath id="ts-right"><rect x="' + thrX + '" y="0" width="' + (W - thrX) + '" height="' + H + '"/></clipPath>' +
            '<clipPath id="ts-left"><rect x="0" y="0" width="' + thrX + '" height="' + H + '"/></clipPath>' +
          '</defs>' +
          // negativos (sin corrosión) base
          '<path d="' + toPath(negAll, baseY) + '" class="ts-neg"/>' +
          // positivos (con corrosión) base
          '<path d="' + toPath(posAll, baseY) + '" class="ts-pos"/>' +
          // FP: negativos a la derecha del umbral
          '<path d="' + toPath(negAll, baseY) + '" class="ts-fp" clip-path="url(#ts-right)"/>' +
          // FN: positivos a la izquierda del umbral (CRÍTICO)
          '<path d="' + toPath(posAll, baseY) + '" class="ts-fn" clip-path="url(#ts-left)"/>' +
          // eje
          '<line x1="' + PADX + '" y1="' + baseY + '" x2="' + (W - PADX) + '" y2="' + baseY + '" class="ts-axis"/>' +
          // línea de umbral
          '<line x1="' + thrX + '" y1="18" x2="' + thrX + '" y2="' + baseY + '" class="ts-thr"/>' +
          '<text x="' + thrX + '" y="14" class="ts-thr-lbl" text-anchor="middle">umbral ' + state.thr.toFixed(2) + '</text>' +
        '</svg>' +
        '<div class="ts-legend">' +
          '<span class="ts-side ts-side-l">← predice SIN corrosión</span>' +
          '<span class="ts-keys"><span><i class="sw sw-pos"></i>Con corrosión (' + window.THESIS.test_pos + ')</span>' +
          '<span><i class="sw sw-neg"></i>Sin corrosión (' + window.THESIS.test_neg + ')</span></span>' +
          '<span class="ts-side ts-side-r">predice CON corrosión →</span>' +
        '</div>' +
      '</div>' +
      '<div class="ts-slider-wrap">' +
        '<input type="range" min="0.02" max="0.98" step="0.01" value="' + state.thr + '" class="ts-slider" aria-label="Umbral">' +
        '<button class="ts-reset" title="Volver al umbral operativo 0.5">⟲ 0.50</button>' +
      '</div>' +
      '<div class="ts-readout">' +
        '<div class="ts-stat ts-crit"><span class="ts-k">Falsos negativos</span><span class="ts-v">' + c.fn + '</span><span class="ts-sub">corrosión omitida</span></div>' +
        '<div class="ts-stat"><span class="ts-k">Falsos positivos</span><span class="ts-v">' + c.fp + '</span><span class="ts-sub">falsas alarmas</span></div>' +
        '<div class="ts-stat"><span class="ts-k">Recall</span><span class="ts-v">' + c.recall.toFixed(3) + '</span><span class="ts-sub">detección</span></div>' +
        '<div class="ts-stat"><span class="ts-k">Especificidad</span><span class="ts-v">' + c.specificity.toFixed(3) + '</span><span class="ts-sub">evita alarmas</span></div>' +
      '</div>' +
      '<div class="ts-foot mono">Simulación didáctica calibrada al punto operativo real de <b>' + m.label + '</b> en el umbral 0.50.</div>';

    var slider = container.querySelector(".ts-slider");
    slider.addEventListener("input", function () { state.thr = parseFloat(slider.value); render(container, state); });
    container.querySelector(".ts-reset").addEventListener("click", function () { state.thr = 0.5; render(container, state); });
    container.querySelectorAll(".ts-tab").forEach(function (b) {
      b.addEventListener("click", function () { state.model = b.getAttribute("data-m"); render(container, state); });
    });
  }

  window.initThreshold = function (container) {
    if (!container || !window.THESIS || !window.STATS) return;
    render(container, { model: "cnn", thr: 0.5 });
  };
})();
