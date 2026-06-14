/* Widget interactivo: flujo CNN por etapas.
   Versión mejorada: bugs corregidos, mejor UX, accesibilidad básica,
   controles Anterior/Siguiente, reset único y animaciones más estables. */
(function () {
  'use strict';

  /* ── Datos de cada etapa ───────────────────────────────── */
  var STAGES = [
    {
      id: 'entrada',
      n: 'ENTRADA',
      t: 'Imagen 224×224',
      d: 'La fotografía se convierte en una matriz de píxeles. Cada celda contiene un valor numérico que representa la intensidad de luz.',
      headline: '1. La imagen se convierte en números'
    },
    {
      id: 'extraccion',
      n: 'EXTRACCIÓN',
      t: 'Convolución + pooling',
      d: 'Un kernel de 3×3 recorre la imagen, detecta patrones locales como bordes y texturas, y luego pooling reduce la dimensión.',
      headline: '2. La red detecta bordes, texturas y patrones'
    },
    {
      id: 'combinacion',
      n: 'COMBINACIÓN',
      t: 'Capas densas',
      d: 'Las características extraídas se combinan mediante neuronas conectadas. La red aprende qué evidencia indica corrosión.',
      headline: '3. La red combina la evidencia visual'
    },
    {
      id: 'salida',
      n: 'SALIDA',
      t: 'Probabilidad',
      d: 'La salida se transforma en una probabilidad entre 0 y 1. Si supera el umbral operativo, se clasifica como corrosión.',
      headline: '4. La red entrega una probabilidad de corrosión'
    }
  ];

  /* ── Pixel data for Stage 0 ────────────────────────────── */
  var PIX8 = [
    [12, 15, 10, 18, 180, 195, 200, 198],
    [10, 12, 18, 22, 175, 198, 200, 196],
    [18, 15, 10, 160, 210, 205, 198, 200],
    [12, 18, 15, 140, 200, 195, 200, 198],
    [15, 10, 18, 130, 198, 200, 205, 200],
    [10, 15, 12, 25, 195, 200, 198, 195],
    [18, 12, 20, 22, 200, 198, 200, 200],
    [12, 18, 15, 20, 198, 200, 195, 198]
  ];

  /* ── Mini conv data for Stage 1 ────────────────────────── */
  var MINI = [
    [10, 10, 10, 180, 200],
    [10, 10, 10, 180, 200],
    [10, 10, 30, 190, 200],
    [10, 10, 10, 180, 200],
    [10, 10, 10, 180, 200]
  ];

  var KSOBEL = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];

  /* ── Timer/RAF tracking ────────────────────────────────── */
  var _timers = [];
  var _rafs = [];

  function clearAll() {
    _timers.forEach(function (t) {
      clearTimeout(t);
      clearInterval(t);
    });
    _rafs.forEach(function (r) {
      cancelAnimationFrame(r);
    });
    _timers = [];
    _rafs = [];
  }

  function setTimer(fn, delay) {
    var id = setTimeout(fn, delay);
    _timers.push(id);
    return id;
  }

  function supportsReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Stage 0: Pixel grid ───────────────────────────────── */
  function runEntrada(hero, opts) {
    opts = opts || {};

    var N = 8;
    var filled = 0;
    var total = N * N;
    var cells = [];
    var wrap = document.createElement('div');
    wrap.className = 'cnna-pxgrid';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Matriz simplificada de píxeles de una imagen');

    for (var i = 0; i < total; i++) {
      var r = Math.floor(i / N);
      var c = i % N;
      var v = PIX8[r][c];
      var el = document.createElement('div');
      el.className = 'cnna-px';
      el.dataset.v = v;
      el.dataset.r = r;
      el.dataset.c = c;
      el.setAttribute('aria-label', 'Pixel fila ' + (r + 1) + ', columna ' + (c + 1) + ', valor ' + v);
      wrap.appendChild(el);
      cells.push(el);
    }

    hero.innerHTML = '';
    var lbl = document.createElement('div');
    lbl.className = 'cnna-lbl';
    lbl.textContent = 'Cada píxel = un número · 8×8 mostrado como ejemplo simplificado · imagen real: 224×224';
    hero.appendChild(wrap);
    hero.appendChild(lbl);

    if (opts.static || supportsReducedMotion()) {
      fillStaticPixels(cells);
      return;
    }

    function fillOne() {
      if (filled >= total) {
        cells.forEach(function (el) {
          var r = Number(el.dataset.r);
          var c = Number(el.dataset.c);
          el.classList.toggle('cnna-patch', r >= 1 && r < 4 && c >= 1 && c < 4);
        });

        setTimer(function () {
          cells.forEach(function (e) {
            e.classList.remove('cnna-patch');
            e.style.background = '';
            e.textContent = '';
            e.style.color = '';
          });
          filled = 0;
          setTimer(fillOne, 400);
        }, 2400);
        return;
      }

      var el = cells[filled];
      var v = Number(el.dataset.v);
      var h = v.toString(16).padStart(2, '0');
      el.style.background = '#' + h + h + h;
      el.textContent = v;
      el.style.color = v > 100 ? '#111' : '#eee';
      filled += 1;
      setTimer(fillOne, 55);
    }

    fillOne();
  }

  function fillStaticPixels(cells) {
    cells.forEach(function (el) {
      var v = Number(el.dataset.v);
      var h = v.toString(16).padStart(2, '0');
      el.style.background = '#' + h + h + h;
      el.textContent = v;
      el.style.color = v > 100 ? '#111' : '#eee';
    });
  }

  /* ── Stage 1: Convolución + Pooling en SVG ─────────────── */
  function runExtraccion(hero, opts) {
    opts = opts || {};

    hero.innerHTML =
      '<svg class="cnna-svg" viewBox="0 0 1200 380" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animación de convolución y pooling">' +
      '<defs>' +
      '<style>' +
      '.conv-cell{fill:var(--surface);stroke:var(--line-strong);stroke-width:1.5}' +
      '.conv-active{fill:var(--teal-soft)!important;stroke:var(--teal)!important;stroke-width:2.5}' +
      '.conv-text{font-family:var(--font-mono,monospace);font-size:13px;font-weight:700;text-anchor:middle;dominant-baseline:middle;fill:var(--ink)}' +
      '.conv-label{font-family:var(--font-mono,monospace);font-size:14px;fill:var(--muted);text-anchor:middle}' +
      '.conv-title{font-family:var(--font-mono,monospace);font-size:16px;fill:var(--ink);font-weight:700;text-anchor:middle}' +
      '</style>' +
      '</defs>' +
      _convSVGBody() +
      '</svg>' +
      '<div class="cnna-lbl"><b>Convolución:</b> el kernel detecta bordes · <b>Pooling:</b> conserva la señal más fuerte y reduce la dimensión</div>';

    if (opts.static || supportsReducedMotion()) {
      _convShowFinal(hero);
      return;
    }

    _convAnimate(hero);
  }

  function _convSVGBody() {
    var s = '';

    // ETAPA 1: ENTRADA 5x5
    s += '<text class="conv-title" x="140" y="20">ENTRADA 5×5</text>';
    var cellSize = 46;
    var gap = 4;
    var startX = 60;
    var startY = 50;

    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 5; c++) {
        var v = MINI[r][c];
        var x = startX + c * (cellSize + gap);
        var y = startY + r * (cellSize + gap);
        s += '<rect class="conv-cell" x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" id="input-' + r + '-' + c + '"/>';
        s += '<text class="conv-text" x="' + (x + cellSize / 2) + '" y="' + (y + cellSize / 2) + '">' + v + '</text>';
      }
    }

    // KERNEL 3x3
    s += '<text class="conv-title" x="420" y="20">KERNEL SOBEL</text>';
    var ks = 50;
    var kgap = 3;
    var kX = 360;
    var kY = 50;

    for (var kr = 0; kr < 3; kr++) {
      for (var kc = 0; kc < 3; kc++) {
        var kv = KSOBEL[kr][kc];
        var kbg = kv > 0 ? 'rgba(15,118,107,0.2)' : kv < 0 ? 'rgba(177,84,42,0.2)' : 'rgba(136,136,136,0.1)';
        var kx = kX + kc * (ks + kgap);
        var ky = kY + kr * (ks + kgap);
        var kCol = kv > 0 ? 'var(--teal)' : kv < 0 ? 'var(--rust)' : 'var(--faint)';
        s += '<rect class="conv-cell" style="fill:' + kbg + '" x="' + kx + '" y="' + ky + '" width="' + ks + '" height="' + ks + '"/>';
        s += '<text class="conv-text" style="fill:' + kCol + '" x="' + (kx + ks / 2) + '" y="' + (ky + ks / 2) + '">' + (kv > 0 ? '+' : '') + kv + '</text>';
      }
    }

    // FEATURE MAP 3x3
    s += '<text class="conv-title" x="800" y="20">FEATURE MAP 3×3</text>';
    var fcs = 50;
    var fcgap = 3;
    var fcX = 740;
    var fcY = 50;

    for (var fr = 0; fr < 3; fr++) {
      for (var fc = 0; fc < 3; fc++) {
        var fcx = fcX + fc * (fcs + fcgap);
        var fcy = fcY + fr * (fcs + fcgap);
        s += '<rect class="conv-cell" x="' + fcx + '" y="' + fcy + '" width="' + fcs + '" height="' + fcs + '" id="feat-' + fr + '-' + fc + '"/>';
        s += '<text class="conv-text" x="' + (fcx + fcs / 2) + '" y="' + (fcy + fcs / 2) + '" data-cell="feat-' + fr + '-' + fc + '">—</text>';
      }
    }

    // POOLING 2x2
    s += '<text class="conv-title" x="800" y="240">POOLING 2×2</text>';
    var ps = 50;
    var pgap = 3;
    var pX = 740;
    var pY = 270;

    for (var pr = 0; pr < 2; pr++) {
      for (var pc = 0; pc < 2; pc++) {
        var px = pX + pc * (ps + pgap);
        var py = pY + pr * (ps + pgap);
        s += '<rect class="conv-cell" x="' + px + '" y="' + py + '" width="' + ps + '" height="' + ps + '" id="pool-' + pr + '-' + pc + '"/>';
        s += '<text class="conv-text" x="' + (px + ps / 2) + '" y="' + (py + ps / 2) + '" data-cell="pool-' + pr + '-' + pc + '">—</text>';
      }
    }

    // Labels
    s += '<text class="conv-label" x="140" y="320">Píxeles de entrada</text>';
    s += '<text class="conv-label" x="420" y="320">Detecta bordes verticales</text>';
    s += '<text class="conv-label" x="800" y="140">Características activadas</text>';
    s += '<text class="conv-label" x="800" y="340">Dimensión reducida</text>';

    // Importante: no cerrar el SVG aquí. El contenedor padre ya lo cierra.
    return s;
  }

  function _computeFeature(row, col) {
    var sum = 0;
    for (var kr = 0; kr < 3; kr++) {
      for (var kc = 0; kc < 3; kc++) {
        sum += MINI[row + kr][col + kc] * KSOBEL[kr][kc];
      }
    }
    return Math.max(0, sum);
  }

  function _computePoolingValues() {
    var poolVals = [[0, 0], [0, 0]];

    for (var pr = 0; pr < 2; pr++) {
      for (var pc = 0; pc < 2; pc++) {
        var maxVal = 0;
        for (var r2 = 0; r2 < 2; r2++) {
          for (var c2 = 0; c2 < 2; c2++) {
            var ridx = pr * 2 + r2;
            var cidx = pc * 2 + c2;
            if (ridx < 3 && cidx < 3) {
              maxVal = Math.max(maxVal, _computeFeature(ridx, cidx));
            }
          }
        }
        poolVals[pr][pc] = maxVal;
      }
    }

    return poolVals;
  }

  function _convShowFinal(hero) {
    var svg = hero.querySelector('svg');
    if (!svg) return;

    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var value = Math.round(_computeFeature(r, c));
        var fText = svg.querySelector('[data-cell="feat-' + r + '-' + c + '"]');
        if (fText) fText.textContent = value;
      }
    }

    var poolVals = _computePoolingValues();
    for (var pr = 0; pr < 2; pr++) {
      for (var pc = 0; pc < 2; pc++) {
        var pText = svg.querySelector('[data-cell="pool-' + pr + '-' + pc + '"]');
        if (pText) pText.textContent = Math.round(poolVals[pr][pc]);
      }
    }
  }

  function _convAnimate(hero) {
    var step = 0;
    var maxSteps = 9; // 3x3 output

    function animate() {
      var row = Math.floor(step / 3);
      var col = step % 3;
      var svg = hero.querySelector('svg');
      if (!svg) return;

      // Reset visual state, but keep already calculated feature map cells visible.
      svg.querySelectorAll('.conv-active').forEach(function (el) {
        el.classList.remove('conv-active');
      });

      // Highlight input patch
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var id = 'input-' + (row + r) + '-' + (col + c);
          var inputEl = svg.getElementById(id);
          if (inputEl) inputEl.classList.add('conv-active');
        }
      }

      // Compute output
      var output = Math.round(_computeFeature(row, col));
      var fEl = svg.querySelector('[data-cell="feat-' + row + '-' + col + '"]');
      if (fEl) fEl.textContent = output;
      var featEl = svg.getElementById('feat-' + row + '-' + col);
      if (featEl) featEl.classList.add('conv-active');

      step += 1;

      if (step >= maxSteps) {
        setTimer(function () {
          var poolVals = _computePoolingValues();
          var svg2 = hero.querySelector('svg');
          if (svg2) {
            for (var pr = 0; pr < 2; pr++) {
              for (var pc = 0; pc < 2; pc++) {
                var pEl = svg2.querySelector('[data-cell="pool-' + pr + '-' + pc + '"]');
                var pRect = svg2.getElementById('pool-' + pr + '-' + pc);
                if (pEl) pEl.textContent = Math.round(poolVals[pr][pc]);
                if (pRect) pRect.classList.add('conv-active');
              }
            }
          }
        }, 800);

        setTimer(function () {
          var svg3 = hero.querySelector('svg');
          if (svg3) {
            svg3.querySelectorAll('.conv-active').forEach(function (el) {
              el.classList.remove('conv-active');
            });
            svg3.querySelectorAll('[data-cell]').forEach(function (el) {
              el.textContent = '—';
            });
          }
          step = 0;
          animate();
        }, 2800);
        return;
      }

      setTimer(animate, 700);
    }

    animate();
  }

  /* ── Stage 2: Fully-connected SVG ─────────────────────── */
  function runCombinacion(hero, opts) {
    opts = opts || {};

    hero.innerHTML =
      '<svg class="cnna-svg" viewBox="0 0 900 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animación de capas densas de una red neuronal">' +
      '<style>' +
      '.fc-line{stroke-width:1.5;stroke:var(--line-strong);opacity:0;transition:opacity .2s,stroke .2s}' +
      '.fc-active{stroke:var(--teal)!important;opacity:1!important}' +
      '.fc-node{fill:var(--surface);stroke:var(--line-strong);stroke-width:2;transition:fill .2s,stroke .2s}' +
      '.fc-lit{fill:var(--teal-soft)!important;stroke:var(--teal)!important}' +
      '.fc-out-lit{fill:var(--teal)!important;stroke:var(--teal-deep)!important}' +
      '.fc-lbl{font-family:var(--font-mono,monospace);font-size:11px;fill:var(--faint);text-anchor:middle}' +
      '.fc-out-lbl{font-family:var(--font-mono,monospace);font-size:13px;font-weight:700;fill:var(--teal);text-anchor:start}' +
      '</style>' +
      _fcSVGBody() +
      '</svg>' +
      '<div class="cnna-lbl">Cada conexión tiene un peso aprendido · la red integra la evidencia para decidir si existe corrosión</div>';

    if (opts.static || supportsReducedMotion()) {
      _fcShowFinal(hero);
      return;
    }

    _fcAnimate(hero);
  }

  function _layers() {
    return [
      { x: 120, nodes: [50, 90, 140, 190] },
      { x: 340, nodes: [30, 70, 110, 150, 185, 210] },
      { x: 560, nodes: [70, 170] },
      { x: 730, nodes: [70, 170] }
    ];
  }

  function _fcSVGBody() {
    var L = _layers();
    var s = '';

    // Connections between layers 0-1, 1-2
    for (var li = 0; li < 2; li++) {
      var from = L[li];
      var to = L[li + 1];
      from.nodes.forEach(function (fy, fi) {
        to.nodes.forEach(function (ty, ti) {
          s += '<line class="fc-line" data-l="' + li + '" data-i="' + (fi * to.nodes.length + ti) + '" x1="' + from.x + '" y1="' + fy + '" x2="' + to.x + '" y2="' + ty + '"/>';
        });
      });
    }

    // Connections layer 2 → output labels
    L[2].nodes.forEach(function (fy, fi) {
      s += '<line class="fc-line" data-l="2" data-i="' + fi + '" x1="' + L[2].x + '" y1="' + fy + '" x2="' + (L[3].x - 20) + '" y2="' + L[3].nodes[fi] + '"/>';
    });

    // Nodes
    [0, 1, 2].forEach(function (li) {
      L[li].nodes.forEach(function (y, i) {
        s += '<circle class="fc-node" data-l="' + li + '" data-i="' + i + '" cx="' + L[li].x + '" cy="' + y + '" r="18"/>';
      });
    });

    // Output labels
    s += '<text class="fc-out-lbl" x="740" y="75">Corrosión</text>';
    s += '<text class="fc-out-lbl" x="740" y="175">Sin corrosión</text>';

    // Layer labels
    s += '<text class="fc-lbl" x="120" y="225">Características</text>';
    s += '<text class="fc-lbl" x="340" y="225">Capa oculta</text>';
    s += '<text class="fc-lbl" x="560" y="225">Decisión</text>';

    return s;
  }

  function _fcShowFinal(hero) {
    var svg = hero.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('.fc-node').forEach(function (n) {
      n.classList.add('fc-lit');
    });
    svg.querySelectorAll('.fc-line').forEach(function (n) {
      n.classList.add('fc-active');
    });
  }

  function _fcAnimate(hero) {
    function wave() {
      var svg = hero.querySelector('svg');
      if (!svg) return;

      svg.querySelectorAll('.fc-node').forEach(function (n) {
        n.classList.remove('fc-lit', 'fc-out-lit');
      });
      svg.querySelectorAll('.fc-line').forEach(function (n) {
        n.classList.remove('fc-active');
      });

      var seq = [
        function () {
          svg.querySelectorAll('circle[data-l="0"]').forEach(function (n) {
            n.classList.add('fc-lit');
          });
        },
        function () {
          svg.querySelectorAll('line[data-l="0"]').forEach(function (n) {
            n.classList.add('fc-active');
          });
          svg.querySelectorAll('circle[data-l="1"]').forEach(function (n) {
            n.classList.add('fc-lit');
          });
        },
        function () {
          svg.querySelectorAll('line[data-l="1"]').forEach(function (n) {
            n.classList.add('fc-active');
          });
          svg.querySelectorAll('circle[data-l="2"]').forEach(function (n) {
            n.classList.add('fc-out-lit');
          });
        },
        function () {
          svg.querySelectorAll('line[data-l="2"]').forEach(function (n) {
            n.classList.add('fc-active');
          });
        }
      ];

      var si = 0;
      function next() {
        if (si >= seq.length) {
          setTimer(function () {
            svg.querySelectorAll('.fc-node,.fc-line').forEach(function (n) {
              n.classList.remove('fc-lit', 'fc-out-lit', 'fc-active');
            });
            setTimer(wave, 600);
          }, 1200);
          return;
        }
        seq[si]();
        si += 1;
        setTimer(next, 700);
      }

      next();
    }

    wave();
  }

  /* ── Stage 3: Sigmoid SVG ──────────────────────────────── */
  function runSalida(hero, opts) {
    opts = opts || {};

    var SX = 60;
    var SY = 10;
    var SW = 300;
    var SH = 200;
    var probCorrosion = 0.87;
    var probNoCorrosion = 1 - probCorrosion;
    var threshold = 0.50;

    function sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    var pts = [];
    for (var x = -6; x <= 6; x += 0.12) {
      var sx = SX + ((x + 6) / 12) * SW;
      var sy = SY + SH - sigmoid(x) * SH;
      pts.push(sx + ',' + sy);
    }

    var pathD = 'M' + pts.join(' L');
    var pathLen = 920; // approximate
    var animationCSS = supportsReducedMotion() || opts.static
      ? ''
      : '@keyframes drawSig{from{stroke-dashoffset:' + pathLen + '}to{stroke-dashoffset:0}}' +
        '@keyframes dotSlide{0%{transform:translateX(-230px) translateY(60px) scale(.5);opacity:0}60%{opacity:1}100%{transform:translateX(0) translateY(0) scale(1);opacity:1}}' +
        '@keyframes barFill{from{width:0}to{width:var(--bw)}}';

    var pathStyle = supportsReducedMotion() || opts.static
      ? 'stroke-dasharray:none;stroke-dashoffset:0;'
      : 'stroke-dasharray:' + pathLen + ';stroke-dashoffset:' + pathLen + ';animation:drawSig 2s ease forwards;';

    var dotStyle = supportsReducedMotion() || opts.static
      ? ''
      : 'animation:dotSlide 2s 1.8s ease both;';

    var barStyle = supportsReducedMotion() || opts.static
      ? 'width:var(--bw);'
      : 'width:0;animation:barFill 1s 2.5s ease both;';

    hero.innerHTML =
      '<svg class="cnna-svg" viewBox="0 0 900 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Curva sigmoide y probabilidad final de corrosión">' +
      '<style>' +
      animationCSS +
      '.sig-path{fill:none;stroke:var(--teal);stroke-width:3;' + pathStyle + '}' +
      '.sig-dot{fill:var(--rust);' + dotStyle + '}' +
      '.sig-axis-label{font-family:var(--font-mono,monospace);font-size:11px;fill:var(--faint)}' +
      '</style>' +
      '<line x1="' + SX + '" y1="' + (SY + SH / 2) + '" x2="' + (SX + SW) + '" y2="' + (SY + SH / 2) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3,4"/>' +
      '<text class="sig-axis-label" x="' + (SX + SW + 8) + '" y="' + (SY + SH / 2 + 4) + '">' + threshold.toFixed(2) + '</text>' +
      '<line x1="' + SX + '" y1="' + SY + '" x2="' + SX + '" y2="' + (SY + SH) + '" stroke="var(--line-strong)" stroke-width="1.5"/>' +
      '<line x1="' + SX + '" y1="' + (SY + SH) + '" x2="' + (SX + SW) + '" y2="' + (SY + SH) + '" stroke="var(--line-strong)" stroke-width="1.5"/>' +
      '<text class="sig-axis-label" x="' + (SX + SW / 2) + '" y="' + (SY + SH + 22) + '" text-anchor="middle">valor de entrada (logit)</text>' +
      '<text class="sig-axis-label" x="' + (SX - 8) + '" y="' + (SY + 8) + '" text-anchor="end">1</text>' +
      '<text class="sig-axis-label" x="' + (SX - 8) + '" y="' + (SY + SH + 4) + '" text-anchor="end">0</text>' +
      '<path class="sig-path" d="' + pathD + '"/>' +
      '<circle class="sig-dot" cx="' + (SX + ((2.1 + 6) / 12) * SW) + '" cy="' + (SY + SH - sigmoid(2.1) * SH) + '" r="8"/>' +
      '</svg>' +
      '<div class="cnna-bars">' +
        '<div class="cnna-bar-row"><span class="cnna-bar-lbl accent-rust">Con corrosión</span>' +
          '<div class="cnna-bar-track"><div class="sig-bar" style="background:var(--rust);--bw:' + Math.round(probCorrosion * 100) + '%;' + barStyle + '"></div></div>' +
          '<span class="cnna-bar-val">' + probCorrosion.toFixed(2) + '</span></div>' +
        '<div class="cnna-bar-row"><span class="cnna-bar-lbl">Sin corrosión</span>' +
          '<div class="cnna-bar-track"><div class="sig-bar" style="background:var(--line-strong);--bw:' + Math.round(probNoCorrosion * 100) + '%;' + barStyle + '"></div></div>' +
          '<span class="cnna-bar-val">' + probNoCorrosion.toFixed(2) + '</span></div>' +
      '</div>' +
      '<div class="cnna-lbl">La sigmoide convierte el resultado en probabilidad · ' + probCorrosion.toFixed(2) + ' &gt; ' + threshold.toFixed(2) + ' → corrosión detectada</div>';
  }

  /* ── Main render ───────────────────────────────────────── */
  var FNS = {
    entrada: runEntrada,
    extraccion: runExtraccion,
    combinacion: runCombinacion,
    salida: runSalida
  };

  function render(container, st, opts) {
    opts = opts || {};
    clearAll();

    var activeStage = STAGES[st.active];
    var btns = STAGES.map(function (s, i) {
      return '<button type="button" class="cnn-sb' + (i === st.active ? ' is-on' : '') + '" data-si="' + i + '" aria-current="' + (i === st.active ? 'step' : 'false') + '" aria-label="Ver etapa ' + escapeHTML(s.n) + ': ' + escapeHTML(s.t) + '">' +
        '<div class="cs-n">' + escapeHTML(s.n) + '</div>' +
        '<div class="cs-t">' + escapeHTML(s.t) + '</div>' +
        '<div class="cs-d">' + escapeHTML(s.d) + '</div>' +
      '</button>' + (i < STAGES.length - 1 ? '<div class="cnn-link" aria-hidden="true">→</div>' : '');
    }).join('');

    container.innerHTML =
      '<div class="cnna-panel" role="region" aria-label="Widget interactivo de flujo CNN">' +
        '<div class="cnna-stage-head">' +
          '<p class="cnna-eyebrow">Flujo de una CNN</p>' +
          '<h3 class="cnna-title">' + escapeHTML(activeStage.headline) + '</h3>' +
          '<p class="cnna-desc">' + escapeHTML(activeStage.d) + '</p>' +
        '</div>' +
        '<div class="cnna-wrapper">' +
          '<div class="cnna-hero" tabindex="0"></div>' +
          '<div class="cnna-flow-col" role="tablist" aria-label="Etapas de la CNN">' + btns + '</div>' +
        '</div>' +
        '<div class="cnna-actions">' +
          '<button type="button" class="cnn-nav-btn cnn-prev">← Anterior</button>' +
          '<button type="button" class="cnn-reset-btn">↺ Reset</button>' +
          '<button type="button" class="cnn-nav-btn cnn-next">Siguiente →</button>' +
        '</div>' +
        '<p class="cnn-note"><b>Transferencia de aprendizaje:</b> MobileNetV2 y EfficientNet-B0 reutilizan características aprendidas sobre millones de imágenes y se afinan a la tarea de corrosión. La CNN propia se entrena desde cero.</p>' +
      '</div>';

    var hero = container.querySelector('.cnna-hero');
    hero.dataset.st = activeStage.id;
    FNS[activeStage.id](hero, { static: opts.static === true });

    container.querySelector('.cnn-prev').disabled = st.active === 0;
    container.querySelector('.cnn-next').disabled = st.active === STAGES.length - 1;

    container.querySelector('.cnn-prev').addEventListener('click', function () {
      if (st.active > 0) {
        st.active -= 1;
        render(container, st);
      }
    });

    container.querySelector('.cnn-next').addEventListener('click', function () {
      if (st.active < STAGES.length - 1) {
        st.active += 1;
        render(container, st);
      }
    });

    container.querySelector('.cnn-reset-btn').addEventListener('click', function () {
      render(container, st, { static: true });
    });

    container.querySelectorAll('.cnn-sb').forEach(function (b) {
      b.addEventListener('click', function () {
        st.active = parseInt(b.getAttribute('data-si'), 10);
        render(container, st);
      });
    });

    container.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight' && st.active < STAGES.length - 1) {
        st.active += 1;
        render(container, st);
      }
      if (ev.key === 'ArrowLeft' && st.active > 0) {
        st.active -= 1;
        render(container, st);
      }
    }, { once: true });
  }

  window.initCNN = function (container) {
    if (!container) return;
    render(container, { active: 0 });
  };

  // Limpieza opcional para SPAs o presentaciones con navegación interna.
  window.destroyCNN = function () {
    clearAll();
  };
})();