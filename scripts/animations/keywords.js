/* scripts/animations/keywords.js
   ------------------------------------------------------------------
   Animación de PALABRAS CLAVE ("ignite"): la palabra arranca en el
   color del texto que la rodea y se "enciende" hasta su color de
   acento (teal / óxido), con un fundido suave. Refuerza la narrativa
   de la investigación dirigiendo la mirada al concepto clave.

   · Solo anima `color` + `opacity` (sin layout).
   · clearProps al terminar → el color final lo define el CSS, así que
     los Tweaks de tema/acento siguen funcionando sobre la palabra.
   · Pensado para texto inline (`<b>`, `<span class="accent-*">`),
     donde animar color es fiable y transform no lo sería.

   Requiere window.gsap. Expone: window.ThesisAnim.keywords.ignite(tl, els, opts)
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var ns = (window.ThesisAnim = window.ThesisAnim || {});

  /* Color "de partida": el del texto que rodea a la palabra. Se lee del
     ancestro para no tener que hardcodear ningún color de la paleta. */
  function neutralColor(el, override) {
    if (override) return override;
    var host = el.parentElement || el;
    try { return getComputedStyle(host).color; } catch (e) { return 'currentColor'; }
  }

  ns.keywords = {
    /**
     * Enciende un conjunto de palabras clave sobre la timeline `tl`.
     * @param {gsap.core.Timeline} tl
     * @param {Element[]|NodeList} els  palabras (inline) a encender
     * @param {Object} [opts] from, duration, stagger, ease, fade, position
     */
    ignite: function (tl, els, opts) {
      var list = Array.prototype.filter.call(els || [], Boolean);
      if (!list.length || !window.gsap) return tl;
      opts = opts || {};

      var dur  = opts.duration != null ? opts.duration : 0.5;
      var stag = opts.stagger  != null ? opts.stagger  : 0.08;
      var ease = opts.ease || 'power2.out';
      var fade = opts.fade !== false; /* atenúa la palabra al partir */
      /* Por defecto se enciende justo cuando la línea termina de entrar. */
      var at   = opts.position != null ? opts.position : '>-0.3';

      /* Ancla la posición de inicio del grupo y reparte el stagger a mano,
         porque cada palabra tiene un color "de partida" distinto (no se
         puede expresar como un único tween con array). */
      var label = 'kw_' + (ns.keywords._n = (ns.keywords._n || 0) + 1);
      tl.addLabel(label, at);

      list.forEach(function (el, i) {
        tl.from(el, {
          color: neutralColor(el, opts.from),
          opacity: fade ? 0.35 : 1,
          duration: dur,
          ease: ease,
          clearProps: 'color,opacity'
        }, label + '+=' + (i * stag).toFixed(3));
      });
      return tl;
    }
  };
})();
