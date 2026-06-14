# Arquitectura de animaciones (GSAP)

Capa de animación del deck de defensa de tesis. Es una **mejora progresiva**
sobre el sistema CSS existente (`.anim` / `.anim-N` en `styles/deck.css`): si
GSAP no carga, o el usuario pidió *reducir movimiento*, el deck sigue siendo
legible y usable con el respaldo CSS o con el contenido estático visible.

## Por qué no hay ScrollTrigger “de scroll”

El deck usa el componente `<deck-stage>`, que es `position:fixed` y **no tiene
scroll de página**: las diapositivas se apilan y se alternan con el atributo
`data-deck-active`, y se navegan por teclado/clic. Por eso el disparador de las
animaciones es el evento **`slidechange`**, no la posición de scroll.

ScrollTrigger se carga y se **registra de forma centralizada** (cumple el
requisito de tener los plugins listos en un solo sitio) y queda disponible por
si en el futuro se incrusta contenido scrolleable dentro de una diapositiva,
pero el deck **no hace scroll-jacking** ni anima en base a scroll.

## Archivos

| Archivo | Rol |
|---|---|
| `reducedMotion.js` | Estado de accesibilidad de movimiento + cadenas de media query (`ThesisAnim.MQ`). Sin dependencias. |
| `transitions.js` | Fábricas de transiciones reutilizables. `ThesisAnim.transitions.enter(tl, els, opts)` construye el stagger de entrada. Solo anima `transform` + `opacity`, y limpia props al terminar. |
| `slideScenes.js` | Registro de **escenas por diapositiva** (`ThesisAnim.SCENES`) + reproductor `ThesisAnim.playScene(slide, {isMobile})`. Indexa por `data-label`. |
| `gsapSetup.js` | **Punto de entrada.** Registra plugins, define `gsap.matchMedia()` (motion + desktop/mobile), conecta `slidechange`, cede `.anim` desde CSS y limpia para impresión/PDF. |

Orden de carga en `index.html` (ya configurado): GSAP core → ScrollTrigger →
`reducedMotion` → `transitions` → `slideScenes` → `gsapSetup`.

## Cómo se integra con lo existente

- **Tweaks**: las escenas leen `body[data-anim-type]` (rise/fade/scale/slide) y
  `body[data-anim-speed]` (fast/normal/slow) en cada `slidechange`, así que el
  panel de Tweaks sigue controlando el movimiento.
- **Cesión de CSS**: cuando GSAP se activa, `gsapSetup` pone
  `html[data-gsap="active"]` e inyecta una regla que desactiva el keyframe CSS
  de `.anim`, evitando doble animación. Si GSAP no se activa, esa regla nunca
  existe y manda el CSS.
- **Reduced-motion / impresión**: en `prefers-reduced-motion: reduce` no se
  anima nada. Antes de imprimir se completan las timelines y se limpian los
  estilos inline para que ninguna diapositiva salga a media entrada.

## Cómo agregar una escena nueva

1. Dale a la diapositiva un `data-label` único en `index.html` (el
   `<deck-stage>` ya lo usa para etiquetar).
2. En `slideScenes.js`, añade una entrada al objeto `SCENES`:

   ```js
   'Mi diapositiva': function (slide, tl, ctx) {
     // ctx.enter(timeline, elementos, opciones)
     ctx.enter(tl, slide.querySelectorAll('.kicker.anim, .title.anim'), { stagger: 0.08 });
     ctx.enter(tl, slide.querySelectorAll('.mi-tarjeta'), { stagger: 0.1 });
   }
   ```

   Para el patrón común “encabezados + grupo en cascada” usa la fábrica
   `cardsScene('.selector-del-grupo')`.

3. `ctx.enter` ya aplica el tipo, la distancia y la velocidad vigentes; no
   hardcodees duraciones salvo que una escena lo necesite. **No** pongas
   contenido de la tesis dentro de estos archivos: solo selectores.

Las diapositivas sin entrada en `SCENES` usan el reparto genérico de todos los
`.anim`, equivalente al stagger del CSS pero vía GSAP.

## Notas de rendimiento

- Solo se animan `transform` y `opacity`.
- Una sola timeline viva a la vez: `playScene` mata la anterior antes de crear
  la nueva (no se acumulan tweens entre navegaciones).
- `clearProps` al terminar deja el DOM limpio (edición directa, impresión, PDF).
