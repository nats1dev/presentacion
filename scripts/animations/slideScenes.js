/* scripts/animations/slideScenes.js
   ------------------------------------------------------------------
   Registro de ESCENAS por diapositiva. Cada escena es una secuencia
   (timeline GSAP) que se reproduce cuando la diapositiva se vuelve
   activa (evento `slidechange` del <deck-stage>).

   Análogo, en un deck sin scroll, a lo que en un sitio scrolleable
   serían las "scroll scenes": aquí el disparador es la NAVEGACIÓN
   entre diapositivas, no la posición de scroll.

   · Las escenas solo referencian SELECTORES de la diapositiva — nunca
     contenido de la tesis hardcodeado.
   · Diapositivas sin escena propia usan el reparto genérico de `.anim`,
     replicando el stagger del sistema CSS pero vía GSAP.
   · Respeta el tipo y la velocidad elegidos en el panel de Tweaks
     (body[data-anim-type] / body[data-anim-speed]).

   Expone: window.ThesisAnim.playScene(slideEl, { isMobile })
   Requiere: window.gsap, ThesisAnim.transitions (transitions.js)
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var ns = (window.ThesisAnim = window.ThesisAnim || {});

  /* ── Lectura de los Tweaks vigentes ─────────────────────────────── */
  function animType() {
    return (document.body.dataset && document.body.dataset.animType) || 'rise';
  }
  function speedScale() {
    var s = (document.body.dataset && document.body.dataset.animSpeed) || 'normal';
    return s === 'fast' ? 0.55 : s === 'slow' ? 1.7 : 1;
  }

  /* ── Utilidades de selección ────────────────────────────────────── */
  function $all(slide, sel) {
    return slide ? Array.prototype.slice.call(slide.querySelectorAll(sel)) : [];
  }
  /* Elementos de "encabezado" comunes (kicker + título), en orden DOM. */
  function heads(slide) {
    return $all(slide, '.kicker.anim, .title.anim, .big-statement.anim, .tag.anim');
  }

  /* ── Fábrica de escenas tipo "tarjetas": encabezados y luego un
        grupo de elementos en cascada. Cubre la mayoría de slides. ──── */
  function cardsScene(groupSel, groupOpts) {
    return function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, groupSel), Object.assign({ stagger: 0.09 }, groupOpts || {}));
    };
  }

  /* Widget slides: header first, then the interactive surface as one composed
     object. The widgets have their own internal state/animation, so the deck
     entrance should frame them without fighting their scripts. */
  function widgetScene(widgetSel, widgetOpts) {
    return function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.07 });
      ctx.enter(tl, $all(slide, widgetSel || '[data-widget]'), Object.assign({
        type: 'scale',
        duration: 0.62,
        stagger: 0.04
      }, widgetOpts || {}));
    };
  }

  /* ── Registro de escenas, indexado por data-label ───────────────── */
  var SCENES = {

    /* Portada (hero): entrada sutil del título, fade del subtítulo y
       ENCENDIDO de las dos frases clave (teal) sobre el título. */
    'Portada': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.cover-top'), { type: 'fade', duration: 0.7 });
      ctx.enter(tl, $all(slide, '.kicker'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.cover-title'), { type: 'rise', dist: ctx.dist * 1.15, duration: 0.85 });
      ctx.ignite(tl, $all(slide, '.cover-title b'), { stagger: 0.18, duration: 0.6, position: '>-0.4' });
      ctx.enter(tl, $all(slide, '.cover-sub'), { type: 'fade', duration: 0.7, position: '<0.15' });
      ctx.enter(tl, $all(slide, '.cover-foot .cf-block'), { stagger: 0.1 });
    },

    /* Agenda: los temas entran en cascada y su número (palabra clave
       visual) se enciende en el color de acento al aparecer. */
    'Agenda': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim, .title.anim'), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.ag-item'), { stagger: 0.075 });
      ctx.ignite(tl, $all(slide, '.ag-n'), { stagger: 0.075, position: '<0.1' });
    },

    /* Objetivos: aparición secuencial de los objetivos clave. */
    'Objetivos': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.obj-general'), {});
      ctx.enter(tl, $all(slide, '.obj-specs .obj-tag, .obj-list li'), { stagger: 0.11 });
    },

    /* Oportunidad: primero la idea, luego el respaldo visual. */
    'La oportunidad': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.big-statement'), { duration: 0.72 });
      ctx.ignite(tl, $all(slide, '.big-statement b'), { stagger: 0.1, position: '>-0.35' });
      ctx.enter(tl, $all(slide, 'p.anim'), { type: 'fade', duration: 0.62 });
      ctx.enter(tl, $all(slide, '.anim-4'), { type: 'scale', duration: 0.58 });
    },

    /* Contexto Guatemala: el dato local aparece como evidencia, no como bloque
       completo. Se separan los párrafos de las tarjetas laterales. */
    'Contexto Guatemala': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.big-statement'), { duration: 0.72 });
      ctx.ignite(tl, $all(slide, '.big-statement .accent-rust'), { position: '>-0.34' });
      ctx.enter(tl, $all(slide, '.big-statement + div p'), { type: 'fade', stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.big-statement + div > div:last-child > div'), {
        type: 'scale',
        stagger: 0.08
      });
    },

    /* Banco documental: revelado controlado del split y la composición. */
    'Banco documental': function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.ds-hero'), { type: 'scale', duration: 0.55 });
      ctx.enter(tl, $all(slide, '.ds-seg'), { stagger: 0.1 });
      ctx.enter(tl, $all(slide, '.ds-split > div:last-child'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.ds-test'), { type: 'fade' });
    },

    /* Conclusiones: revelado calmado, punto por punto. */
    'Conclusiones': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.concl li'), { stagger: 0.12, duration: 0.62 });
    },

    /* Cierre: transición final calmada y profesional. */
    'Gracias': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.closing-kicker'), { type: 'fade', duration: 0.7 });
      ctx.enter(tl, $all(slide, '.closing-title'), { type: 'rise', dist: ctx.dist, duration: 0.9 });
      ctx.enter(tl, $all(slide, '.closing-sub'), { type: 'fade', duration: 0.8 });
      ctx.enter(tl, $all(slide, '.closing-meta > div'), { stagger: 0.1, type: 'fade' });
    },

    /* El problema: el statement entra y se encienden las palabras óxido
       ("criterio humano", "falso negativo"); luego las tres tarjetas. */
    'El problema': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.big-statement'), {});
      ctx.ignite(tl, $all(slide, '.big-statement .accent-rust'), { stagger: 0.14, duration: 0.6, position: '>-0.35' });
      ctx.enter(tl, $all(slide, '.tu'), { stagger: 0.1, position: '<0.1' });
      ctx.ignite(tl, $all(slide, '.tu .accent-rust'), { stagger: 0.1, position: '<0.35' });
    },

    /* ── Slides "de tarjetas": encabezados + grupo en cascada ─────── */
    'Por qué importa': cardsScene('.col-lead, .flist li'),
    'Justificación':   cardsScene('.pillar'),
    'Marco teórico':   widgetScene('[data-widget="cnn"]'),
    'Convolución':     widgetScene('[data-widget="conv"]'),
    'Arquitecturas':   cardsScene('.arch-card'),
    'Metodología':     cardsScene('.col-lead, .flist li'),
    'Pipeline':        widgetScene('[data-widget="pipeline"]'),
    'Condiciones':     cardsScene('.spec-card', { stagger: 0.06 }),
    'Resultados':      widgetScene('[data-widget="metrics"]'),
    'Curva ROC':       widgetScene('[data-widget="roc"]'),
    'Matrices de confusión': widgetScene('[data-widget="confusion"]'),
    'Métricas': function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.why-row'), { stagger: 0.08 });
      ctx.ignite(tl, $all(slide, '.why-row .accent-rust'), { position: '<0.35' });
    },
    'Simulador de umbral': function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.07 });
      ctx.ignite(tl, $all(slide, '.title .accent-rust'), { position: '>-0.35' });
      ctx.enter(tl, $all(slide, '[data-widget="threshold"]'), { type: 'scale', duration: 0.62 });
    },
    'Eficiencia':      cardsScene('.eff-head, .eff-row, .eff-note', { stagger: 0.1 }),
    'Cochran Q · Método': function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.slide > .anim-3 > div > div'), {
        type: 'scale',
        stagger: 0.055,
        duration: 0.52
      });
    },
    'Contraste · Resultados': function (slide, tl, ctx) {
      ctx.enter(tl, heads(slide), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.stat-q'), { type: 'scale', duration: 0.58 });
      ctx.enter(tl, $all(slide, '.posthoc li'), { stagger: 0.08 });
      ctx.enter(tl, $all(slide, '.eff-note'), { type: 'fade', duration: 0.58 });
    },
    'Discusión': function (slide, tl, ctx) {
      ctx.enter(tl, $all(slide, '.kicker.anim'), { type: 'fade' });
      ctx.enter(tl, $all(slide, '.big-statement'), { duration: 0.72 });
      ctx.ignite(tl, $all(slide, '.big-statement b'), { position: '>-0.35' });
      ctx.enter(tl, $all(slide, '.bal-card'), { stagger: 0.1 });
      ctx.ignite(tl, $all(slide, '.bal-card .accent-rust'), { position: '<0.45' });
    },
    'Interpretabilidad': cardsScene('.gc-item, .gc-note'),
    'Recomendaciones': cardsScene('.rlf-col')
  };

  ns.SCENES = SCENES; /* expuesto para extensión externa */

  /* ── Reproductor de escena ──────────────────────────────────────── */
  ns.playScene = function (slide, opts) {
    if (!slide || !window.gsap) return null;
    var gsap = window.gsap;
    opts = opts || {};

    /* Matar la timeline anterior — nunca acumular tweens entre navegaciones. */
    if (ns._tl) {
      ns._tl.progress(1);
      ns._tl.kill();
      ns._tl = null;
    }

    var type = animType();
    var ts   = speedScale();
    var dist = opts.isMobile ? 14 : 22;

    /* `ctx.enter` envuelve transitions.enter aplicando tipo, distancia y
       escala de velocidad vigentes, para que las escenas no se repitan. */
    var ctx = {
      type: type,
      dist: dist,
      isMobile: !!opts.isMobile,
      enter: function (tl, els, o) {
        o = o || {};
        o.type     = o.type || type;
        o.dist     = o.dist != null ? o.dist : dist;
        o.duration = (o.duration != null ? o.duration : 0.6) * ts;
        o.stagger  = (o.stagger  != null ? o.stagger  : 0.09) * ts;
        return ns.transitions.enter(tl, els, o);
      },
      /* Encendido de palabras clave (color) — respeta la escala de velocidad. */
      ignite: function (tl, els, o) {
        if (!ns.keywords) return tl;
        o = o || {};
        o.duration = (o.duration != null ? o.duration : 0.5) * ts;
        o.stagger  = (o.stagger  != null ? o.stagger  : 0.08) * ts;
        return ns.keywords.ignite(tl, els, o);
      }
    };

    var tl = gsap.timeline();
    ns._tl = tl;

    var label = slide.getAttribute('data-label') || '';
    var scene = SCENES[label];

    if (scene) {
      scene(slide, tl, ctx);
    } else {
      /* Genérico: todos los `.anim` de la slide en orden DOM (= orden .anim-N). */
      ctx.enter(tl, $all(slide, '.anim'), { stagger: 0.085 });
    }

    /* Si la timeline quedó vacía (slide sin targets) la descartamos. */
    if (!tl.getChildren(false, true, true).length) { tl.kill(); ns._tl = null; }
    return tl;
  };
})();
