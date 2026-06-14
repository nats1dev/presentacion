/* scripts/animations/transitions.js
   ------------------------------------------------------------------
   Fábricas de transiciones reutilizables. Construyen tweens de
   ENTRADA sobre una timeline existente y devuelven la misma timeline
   para encadenar. Toda la lógica de "cómo entra un elemento" vive
   aquí; las escenas (slideScenes.js) solo deciden QUÉ y EN QUÉ ORDEN.

   Reglas de rendimiento:
     · Solo se animan `transform` y `opacity`.
     · clearProps al terminar → el elemento vuelve a su estado base
       definido en CSS (queda usable, seleccionable y sin estilos
       inline que ensucien edición directa, impresión o PDF).

   Requiere window.gsap (lo carga gsapSetup.js antes de usar esto).
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var ns = (window.ThesisAnim = window.ThesisAnim || {});

  /* Estado inicial "desde" según el tipo elegido en el panel de Tweaks.
     `dist` es la distancia de desplazamiento en px (menor en mobile). */
  function fromVars(type, dist) {
    switch (type) {
      case 'fade':  return { opacity: 0 };
      case 'scale': return { opacity: 0, scale: 0.93, y: dist * 0.45 };
      case 'slide': return { opacity: 0, x: -dist * 1.3 };
      case 'rise':
      default:      return { opacity: 0, y: dist };
    }
  }

  function defaultPosition(tl, opts) {
    if (opts.position != null) return opts.position;
    /* First group starts immediately; subsequent groups overlap the end of the
       previous group slightly, so headings establish themselves before details. */
    return tl.duration() > 0 ? '>-0.16' : 0;
  }

  function willChangeFor(type) {
    return type === 'fade' ? 'opacity' : 'transform,opacity';
  }

  ns.transitions = {
    fromVars: fromVars,

    /**
     * Añade un stagger de entrada a `tl` para el conjunto `els`.
     * @param {gsap.core.Timeline} tl
     * @param {Element[]|NodeList} els
     * @param {Object} [opts] type, dist, duration, stagger, ease, position
     * @returns {gsap.core.Timeline} la misma timeline (encadenable)
     */
    enter: function (tl, els, opts) {
      var list = Array.prototype.filter.call(els || [], Boolean);
      if (!list.length || !window.gsap) return tl;
      opts = opts || {};

      var type = opts.type || 'rise';
      var dist = opts.dist != null ? opts.dist : 22;

      var vars = Object.assign({
        duration: opts.duration != null ? opts.duration : 0.6,
        stagger:  opts.stagger  != null ? opts.stagger  : 0.09,
        ease:     opts.ease || 'power3.out',
        overwrite: 'auto',
        force3D: true,
        willChange: willChangeFor(type),
        /* Devolver al estado base en CSS al terminar. */
        clearProps: 'transform,opacity,willChange'
      }, fromVars(type, dist));

      /* Posición por defecto: ligeramente solapada con el final del grupo
         previo. Antes era relativa al inicio (`<`), lo que hacía que tarjetas
         y widgets entraran casi junto con el encabezado. */
      var position = defaultPosition(tl, opts);
      tl.from(list, vars, position);
      return tl;
    }
  };
})();
