/* Widget: gráfica comparativa de métricas (barras agrupadas, métrica conmutable). */
(function () {
  function fmt(v, metric) {
    if (metric === "accuracy") return v.toFixed(2) + "%";
    return v.toFixed(4);
  }
  function val(m, metric) {
    if (metric === "accuracy") return m.accuracy;
    return m[metric];
  }
  function pct(m, metric) {
    if (metric === "accuracy") return m.accuracy / 100;
    return m[metric];
  }

  const METRICS = [
    { key: "accuracy", label: "Exactitud", note: "Aciertos totales" },
    { key: "recall", label: "Recall", note: "Detecta corrosión (1 − FN)" },
    { key: "specificity", label: "Especificidad", note: "Evita falsas alarmas" },
    { key: "f1", label: "F1", note: "Balance precisión / recall" },
    { key: "auc", label: "AUC-ROC", note: "Discriminación global" }
  ];

  function render(container, state) {
    const models = window.THESIS.models;
    const metric = state.metric;
    const md = METRICS.find(x => x.key === metric);

    const tabs = METRICS.map(m =>
      `<button class="mc-tab${m.key === metric ? " is-on" : ""}" data-metric="${m.key}">${m.label}</button>`
    ).join("");

    // leader for current metric
    let best = models[0];
    models.forEach(m => { if (val(m, metric) > val(best, metric)) best = m; });

    const bars = models.map((m, i) => {
      const h = pct(m, metric) * 100;
      const isBest = m.id === best.id;
      return `
        <div class="mc-col anim anim-${i+1}">
          <div class="mc-track">
            <div class="mc-bar" style="--h:${h}%; --col:${m.color}">
              <span class="mc-val">${fmt(val(m, metric), metric)}</span>
              ${isBest ? '<span class="mc-crown">líder</span>' : ''}
            </div>
          </div>
          <div class="mc-name" style="--col:${m.color}"><span class="mc-swatch"></span>${m.label}</div>
        </div>`;
    }).join("");

    container.innerHTML = `
      <div class="mc-head">
        <div class="mc-tabs">${tabs}</div>
        <div class="mc-note"><b>${md.label}</b> — ${md.note}</div>
      </div>
      <div class="mc-plot">
        <div class="mc-grid">
          ${[1,0.75,0.5,0.25,0].map(g => `<div class="mc-line" style="bottom:${g*100}%"><span>${metric==='accuracy'?(g*100).toFixed(0)+'%':g.toFixed(2)}</span></div>`).join("")}
        </div>
        <div class="mc-cols">${bars}</div>
      </div>`;

    container.querySelectorAll(".mc-tab").forEach(b => {
      b.addEventListener("click", () => {
        state.metric = b.getAttribute("data-metric");
        render(container, state);
      });
    });
  }

  window.initMetricsChart = function (container) {
    if (!container || !window.THESIS) return;
    const state = { metric: "accuracy" };
    render(container, state);
  };
})();
