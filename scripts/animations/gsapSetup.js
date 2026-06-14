/* scripts/animations/gsapSetup.js
   ------------------------------------------------------------------
   PUNTO DE ENTRADA Y CONFIGURACIÓN CENTRAL de GSAP para el deck.
   Único archivo donde se registran plugins y se conecta el motor de
   animación al ciclo de vida del <deck-stage>.

   Diseño:
     · Mejora progresiva — si GSAP no carga o el usuario pidió
       "reducir movimiento", NO se toca nada y queda el respaldo CSS
       (.anim) o el contenido estático visible. Nada se oculta de forma
       permanente con JS.
     · gsap.matchMedia() gobierna activación (motion + desktop/mobile)
       y revierte limpiamente al cambiar el ajuste del sistema.
     · Las animaciones se disparan con el evento `slidechange`. En el modo
       scrolleable, <deck-stage> emite ese evento desde ScrollTrigger al
       entrar cada diapositiva en vista.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var ns = (window.ThesisAnim = window.ThesisAnim || {});
  var root = document.documentElement;

  function activate() {
    if (!window.gsap) {
      /* GSAP no disponible (CDN bloqueado, offline…): respaldo CSS intacto. */
      console.warn('[ThesisAnim] GSAP no disponible — se conserva la animación CSS de respaldo.');
      return;
    }

    var gsap = window.gsap;

    /* ── Registro centralizado de plugins (único lugar) ───────────── */
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    gsap.defaults({ ease: 'power3.out', duration: 0.6 });

    /* Regla que cede el control de `.anim` desde CSS hacia GSAP. Solo se
       inserta cuando GSAP realmente se activa; si nunca se activa (sin JS
       o reduced-motion), el sistema CSS sigue siendo la fuente de verdad. */
    var cedeCss = document.createElement('style');
    cedeCss.id = 'thesis-anim-gsap-active';
    cedeCss.textContent =
      'html[data-gsap="active"] [data-deck-active] .anim{animation:none !important;}';

    var mm = gsap.matchMedia();
    ns._mm = mm;

    mm.add(
      { motionOK: ns.MQ.motionOK, isMobile: ns.MQ.mobile },
      function (c) {
        var cond = c.conditions;

        /* Reduced-motion → no animar. El contenido permanece visible
           (base CSS) y selectable. matchMedia revertirá si cambia. */
        if (!cond.motionOK) return;

        /* Activar GSAP: deshabilitar el keyframe CSS y marcar el estado. */
        if (!cedeCss.isConnected) document.head.appendChild(cedeCss);
        root.setAttribute('data-gsap', 'active');

        var onSlideChange = function (e) {
          var slide = e.detail && e.detail.slide;
          ns.playScene(slide, { isMobile: cond.isMobile });
        };
        document.addEventListener('slidechange', onSlideChange);

        /* La diapositiva inicial: si el `slidechange` de init YA se disparó
           antes de enganchar el listener, la reproducimos manualmente; si
           aún no, el propio evento se encargará (evita doble disparo). */
        var stage = document.querySelector('.scroll-root');
        var active = stage && stage.querySelector('[data-deck-active]');
        if (active) ns.playScene(active, { isMobile: cond.isMobile });

        /* Limpieza al revertir (cambio de prefers-reduced-motion o de
           breakpoint): quitar listener, marca, estilo y props inline. */
        return function () {
          document.removeEventListener('slidechange', onSlideChange);
          root.removeAttribute('data-gsap');
          if (cedeCss.isConnected) cedeCss.remove();
          if (ns._tl) { ns._tl.kill(); ns._tl = null; }
          gsap.set('.anim, [class*="anim"]', { clearProps: 'transform,opacity' });
        };
      }
    );

    /* Impresión / Guardar como PDF: completar la timeline y limpiar props
       inline, para que ninguna diapositiva se imprima a mitad de entrada
       ni con opacidad 0. (El propio deck-stage activa todas las slides.) */
    window.addEventListener('beforeprint', function () {
      if (ns._tl) ns._tl.progress(1);
      gsap.set('.anim', { clearProps: 'transform,opacity' });
    });
  }

  /* Los scripts del deck van al final del <body> sin defer, así que GSAP
     (etiqueta previa, síncrona) ya se evaluó cuando llega este archivo.
     Activamos de inmediato para fijar data-gsap ANTES del primer pintado
     y evitar que el keyframe CSS y GSAP compitan en la primera slide. */
  if (window.gsap) {
    activate();
  } else {
    /* Por si la etiqueta de GSAP fuese async o fallara temporalmente. */
    window.addEventListener('load', activate, { once: true });
  }
})();
