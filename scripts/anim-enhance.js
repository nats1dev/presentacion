/* scripts/anim-enhance.js
   Mejoras de animación: count-up numérico para estadísticas clave.
   Se engancha en slidechange y window.load sin tocar los widgets. */
(function () {
  'use strict';

  /* ── Utilidades ──────────────────────────────────────────── */

  function parseNum(str) {
    return parseFloat(str.replace(/,/g, ''));
  }

  function formatLike(val, original) {
    var hasComma  = original.indexOf(',') !== -1;
    var decMatch  = original.match(/\.(\d+)$/);
    var decimals  = decMatch ? decMatch[1].length : 0;
    if (hasComma && val >= 1000) {
      return Math.round(val).toLocaleString('en-US');
    }
    if (decimals > 0) return val.toFixed(decimals);
    return String(Math.round(val));
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Count-up para un elemento ───────────────────────────── */

  function countUp(el) {
    var original = el.dataset.cuOrig;
    if (!original) {
      original = el.textContent.trim();
      el.dataset.cuOrig = original;
    }
    var target = parseNum(original);
    if (isNaN(target) || target === 0) return;

    var speed = (document.body.dataset && document.body.dataset.animSpeed) || 'normal';
    var dur   = speed === 'fast' ? 480 : speed === 'slow' ? 1700 : 980;

    var startTs = null;

    function tick(ts) {
      if (!startTs) startTs = ts;
      var progress = Math.min((ts - startTs) / dur, 1);
      var eased    = easeOutCubic(progress);
      el.textContent = formatLike(target * eased, original);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = original; /* restaurar exacto */
      }
    }
    requestAnimationFrame(tick);
  }

  /* ── Ejecutar en el slide activo ─────────────────────────── */

  function enhanceSlide(slide) {
    if (!slide) return;

    /* Resetear estado para que vuelva a animar si revisitamos el slide */
    slide.querySelectorAll('.dsh-num, .sq-v').forEach(function (el) {
      delete el.dataset.cuOrig;
    });

    /* Esperar a que la animación de entrada haya comenzado */
    var speed = (document.body.dataset && document.body.dataset.animSpeed) || 'normal';
    var delay = speed === 'fast' ? 140 : speed === 'slow' ? 560 : 300;

    setTimeout(function () {
      slide.querySelectorAll('.dsh-num, .sq-v').forEach(countUp);
    }, delay);
  }

  /* ── Hooks ───────────────────────────────────────────────── */

  document.addEventListener('slidechange', function (e) {
    enhanceSlide(e.detail && e.detail.slide);
  });

  window.addEventListener('load', function () {
    var stage  = document.querySelector('deck-stage');
    var active = stage && stage.querySelector('[data-deck-active]');
    enhanceSlide(active || (stage && stage.children[0]));
  });

}());
