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

   Requiere window.gsap. Expone:
     window.ThesisAnim.keywords.ignite(tl, els, opts)
     window.ThesisAnim.keywords.emphasize(tl, slide, opts)
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

  function accentGlow(el) {
    var color = 'var(--teal)';
    try {
      var cs = getComputedStyle(el);
      color = cs.color || color;
    } catch (e) {}
    return '0 0 0 rgba(0,0,0,0), 0 0 18px ' + color;
  }

  function importantTargets(slide, selector) {
    if (!slide) return [];
    selector = selector || [
      '.title b',
      '.big-statement b',
      '.col-lead b',
      '.col-lead .accent-teal',
      '.col-lead .accent-rust',
      '.obj-gen-text b',
      '.obj-list b',
      '.flist b',
      '.pillar-t',
      '.arch-name',
      '.why-name',
      '.eff-note b',
      '.posthoc .ph-pair b',
      '.gc-note b',
      '.bal-list b',
      '.concl b',
      '.rlf-col h3',
      '.closing-title b'
    ].join(',');
    return Array.prototype.filter.call(slide.querySelectorAll(selector), function (el) {
      return !el.closest('[data-widget]') && !el.closest('.foot') && !el.closest('.overlay');
    });
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
    },

    /**
     * Subraya narrativamente los textos importantes de una slide.
     * Mantiene el layout intacto: solo usa transform, color, opacity y sombra.
     * @param {gsap.core.Timeline} tl
     * @param {Element} slide
     * @param {Object} [opts] selector, position, duration, stagger, from
     */
    emphasize: function (tl, slide, opts) {
      if (!slide || !window.gsap) return tl;
      opts = opts || {};
      var list = importantTargets(slide, opts.selector);
      if (!list.length) return tl;

      var dur = opts.duration != null ? opts.duration : 0.62;
      var stag = opts.stagger != null ? opts.stagger : 0.045;
      var at = opts.position != null ? opts.position : 0.22;
      var finalColors = list.map(function (el) {
        try { return getComputedStyle(el).color; } catch (e) { return 'currentColor'; }
      });

      window.gsap.set(list, {
        display: 'inline-block',
        transformOrigin: '50% 80%'
      });

      tl.fromTo(list, {
        color: function (i, el) { return neutralColor(el, opts.from); },
        opacity: 0.72,
        y: 5,
        scale: 0.985,
        textShadow: '0 0 0 rgba(0,0,0,0)'
      }, {
        color: function (i) { return finalColors[i] || 'currentColor'; },
        opacity: 1,
        y: 0,
        scale: 1,
        textShadow: function (i, el) { return accentGlow(el); },
        duration: dur,
        stagger: stag,
        ease: opts.ease || 'back.out(1.25)',
        clearProps: 'color,opacity,transform,textShadow,display,transformOrigin'
      }, at);

      return tl;
    }
  };
})();
