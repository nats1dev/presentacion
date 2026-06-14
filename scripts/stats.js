/* Motor estadístico compartido para el simulador de umbral y la curva ROC.
   Modelo didáctico: para cada arquitectura se ajustan dos gaussianas (positivos /
   negativos) de modo que en el umbral 0.5 reproducen EXACTAMENTE el punto operativo
   real (recall y especificidad reportados). Al mover el umbral se recalculan los
   conteos. Es una simulación calibrada al dato real, no las probabilidades crudas. */
(function () {
  function erf(x) {
    // Abramowitz & Stegun 7.1.26
    var sign = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  }
  function normCDF(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function normINV(p) {
    // Acklam's inverse normal CDF
    if (p <= 0) return -6; if (p >= 1) return 6;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var pl = 0.02425, ph = 1 - pl, q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= ph) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  var SIGMA = 0.165;

  function dist(m) {
    var muP = 0.5 - SIGMA * normINV(1 - m.recall);       // positivos (con corrosión) centrados alto
    var muN = 0.5 - SIGMA * normINV(m.specificity);       // negativos centrados bajo
    return { muP: muP, muN: muN, s: SIGMA };
  }

  // conteos en un umbral dado, escalados al tamaño real de clases
  function counts(m, thr) {
    var d = dist(m);
    var P = window.THESIS.test_pos, N = window.THESIS.test_neg;
    var recallAt = 1 - normCDF((thr - d.muP) / d.s);   // TP / P
    var specAt = normCDF((thr - d.muN) / d.s);          // TN / N
    recallAt = Math.min(1, Math.max(0, recallAt));
    specAt = Math.min(1, Math.max(0, specAt));
    var tp = Math.round(recallAt * P), fn = P - tp;
    var tn = Math.round(specAt * N), fp = N - tn;
    return { tp: tp, fn: fn, tn: tn, fp: fp, recall: tp / P, specificity: tn / N };
  }

  // curva ROC barriendo el umbral
  function roc(m, steps) {
    steps = steps || 160;
    var d = dist(m), pts = [];
    for (var i = 0; i <= steps; i++) {
      var thr = i / steps;
      var tpr = 1 - normCDF((thr - d.muP) / d.s);
      var fpr = 1 - normCDF((thr - d.muN) / d.s);
      pts.push([Math.min(1, Math.max(0, fpr)), Math.min(1, Math.max(0, tpr))]);
    }
    return pts; // ordenado de thr 0 (esquina sup-der) a thr 1 (origen)
  }

  window.STATS = { normCDF: normCDF, normINV: normINV, counts: counts, roc: roc, dist: dist };
})();
