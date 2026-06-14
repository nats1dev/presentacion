/* scripts/animations/reducedMotion.js
   ------------------------------------------------------------------
   Estado centralizado de accesibilidad de movimiento.
   Sin dependencias. Lo consume gsapSetup.js para decidir si GSAP
   toma el control de las animaciones o si se respeta el respaldo
   estático/CSS.

   No anima nada por sí mismo: solo expone consultas y constantes.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var ns = (window.ThesisAnim = window.ThesisAnim || {});

  /* Cadenas de media query reutilizadas por gsap.matchMedia() en gsapSetup.
     Un único lugar donde viven los breakpoints de animación. */
  ns.MQ = {
    motionOK: '(prefers-reduced-motion: no-preference)',
    motionReduce: '(prefers-reduced-motion: reduce)',
    mobile: '(max-width: 768px)'
  };

  var mq = window.matchMedia(ns.MQ.motionReduce);

  /* ¿El usuario pidió menos movimiento a nivel de sistema operativo? */
  ns.prefersReducedMotion = function () {
    return mq.matches;
  };

  /* Suscripción a cambios en vivo del ajuste del SO (compat. Safari viejo). */
  ns.onReducedMotionChange = function (cb) {
    if (typeof cb !== 'function') return;
    if (mq.addEventListener) mq.addEventListener('change', cb);
    else if (mq.addListener) mq.addListener(cb);
  };
})();
