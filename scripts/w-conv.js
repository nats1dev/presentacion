/* Widget: simulador interactivo de convolución con kernel.
   Muestra la operación de convolución 2D sobre un parche de imagen 7×7,
   con un kernel 3×3 deslizante, productos elemento a elemento y feature map. */
(function () {

  /* ── Datos ─────────────────────────────────────────────── */
  var IMG = [
    [ 10,  10,  10, 128, 200, 200, 200],
    [ 10,  10,  10, 128, 200, 200, 200],
    [ 10,  10,  30, 160, 210, 210, 200],
    [ 10,  10,  10, 128, 200, 200, 200],
    [ 10,   8,  10, 130, 202, 200, 200],
    [ 10,  10,  10, 128, 200, 200, 200],
    [ 10,  10,  10, 128, 200, 200, 200]
  ]; // 7×7 con borde vertical nítido en columna 3

  var KERNELS = {
    "Sobel V": { k: [[-1,0,1],[-2,0,2],[-1,0,1]], label: "Detecta bordes verticales" },
    "Sobel H": { k: [[-1,-2,-1],[0,0,0],[1,2,1]], label: "Detecta bordes horizontales" },
    "Sharpen": { k: [[0,-1,0],[-1,5,-1],[0,-1,0]], label: "Realza detalles (agudiza)" },
    "Blur":    { k: [[1,1,1],[1,1,1],[1,1,1]], div: 9, label: "Suaviza (promedio 3×3)" }
  };

  /* ── Helpers ────────────────────────────────────────────── */
  function pad(n) { return n >= 0 ? (n < 10 ? ' '+n : ''+n) : (n > -10 ? '-'+Math.abs(n) : ''+n); }
  function clamp(v,a,b){ return Math.min(b, Math.max(a, v)); }
  function relu(v){ return Math.max(0, v); }
  function textFor(bg) { var c=parseInt(bg,16); return c>100?'#1a1d1c':'#edf1ef'; }
  function grayHex(v){ var h=Math.round(clamp(v,0,255)).toString(16); return h.length===1?'0'+h:h; }
  function valColor(v, max) {
    if (v === 0) return '#888';
    if (v > 0) return 'var(--teal)'; return 'var(--rust)';
  }

  function computeConv(kernel, div) {
    var out = [], N = 5;
    for (var r = 0; r < N; r++) {
      out.push([]);
      for (var c = 0; c < N; c++) {
        var sum = 0;
        for (var kr = 0; kr < 3; kr++)
          for (var kc = 0; kc < 3; kc++)
            sum += IMG[r+kr][c+kc] * kernel[kr][kc];
        if (div) sum = sum / div;
        out[r].push(relu(sum));
      }
    }
    return out;
  }

  function normalize(map) {
    var max = 0.001;
    for (var r=0;r<map.length;r++) for (var c=0;c<map[r].length;c++) if(map[r][c]>max) max=map[r][c];
    return { map: map, max: max };
  }

  /* ── Render ─────────────────────────────────────────────── */
  function render(container, st) {
    var kdef = KERNELS[st.kname];
    var K = kdef.k, div = kdef.div || 1;
    var ri = st.pos % 5, ci = Math.floor(st.pos / 5);
    // actually pos is linear: row-major: r = floor(pos/5), c = pos%5
    var row = Math.floor(st.pos / 5), col = st.pos % 5;
    var convMap = computeConv(K, div);
    var norm = normalize(convMap);

    /* ── kernel tabs ── */
    var tabs = Object.keys(KERNELS).map(function(k){
      return '<button class="conv-ktab'+(k===st.kname?' is-on':'')+'" data-k="'+k+'">'+k+'</button>';
    }).join('');

    /* ── input grid ── */
    var inputCells = '';
    for (var r=0;r<7;r++) for(var c=0;c<7;c++){
      var v = IMG[r][c];
      var h = grayHex(v);
      var inPatch = (r>=row&&r<row+3&&c>=col&&c<col+3);
      var bg = '#'+h+h+h;
      var fg = v>110?'#111':'#eee';
      var cls = 'conv-cell'+( inPatch?' conv-in-patch':'');
      inputCells += '<div class="'+cls+'" style="background:'+bg+';color:'+fg+'">'+(st.showVals?v:'')+'</div>';
    }

    /* ── kernel grid ── */
    var kr_cells = '';
    for(var kr=0;kr<3;kr++) for(var kc=0;kc<3;kc++){
      var kv = K[kr][kc] / div;
      var kvFmt = div>1?(kv).toFixed(2):(kv>0?'+'+kv:''+kv);
      var bgk = kv>0?'color-mix(in srgb, var(--teal) 30%, transparent)':kv<0?'color-mix(in srgb, var(--rust) 30%, transparent)':'var(--surface-2)';
      kr_cells += '<div class="conv-cell conv-k-cell" style="background:'+bgk+'">'+kvFmt+'</div>';
    }

    /* ── computation ── */
    var products = [], sum = 0;
    for(var pr=0;pr<3;pr++) for(var pc=0;pc<3;pc++){
      var pv = IMG[row+pr][col+pc];
      var kval = K[pr][pc]/div;
      var prod = pv * kval;
      sum += prod;
      products.push({ pv:pv, kval:K[pr][pc], div:div, prod:prod });
    }
    var raw = sum;
    var activated = relu(raw);

    var compRows = '';
    for(var p=0;p<9;p+=3){
      var rowStr = products.slice(p, p+3).map(function(x){
        var sign = x.prod>=0?'<span class="cp-pos">+'+x.prod.toFixed(1)+'</span>':'<span class="cp-neg">'+x.prod.toFixed(1)+'</span>';
        return '<span class="cp-pair"><span class="cp-px">'+x.pv+'</span><span class="cp-op">×</span><span class="cp-kv">'+(x.div>1?(x.kval+'/'+x.div):(x.kval>0?'+'+x.kval:x.kval))+'</span><span class="cp-eq">=</span>'+sign+'</span>';
      }).join('<span class="cp-plus"> </span>');
      compRows += '<div class="cp-row">'+rowStr+'</div>';
    }

    /* ── output grid ── */
    var outCells = '';
    for(var or=0;or<5;or++) for(var oc=0;oc<5;oc++){
      var ov = convMap[or][oc];
      var isCurr = (or===row&&oc===col);
      var isDone = (or*5+oc < st.pos);
      var intensity = Math.round((ov/norm.max)*255);
      var obg = isDone||isCurr ? '#'+grayHex(intensity)+grayHex(intensity)+grayHex(intensity) : 'var(--surface-2)';
      var ofg = intensity>110?'#111':'#eee';
      var ocls = 'conv-cell conv-out-cell'+(isCurr?' conv-out-curr':'')+(isDone?' conv-out-done':'');
      outCells += '<div class="'+ocls+'" style="background:'+obg+';color:'+ofg+'">'+(st.showVals&&(isDone||isCurr)?Math.round(ov):'')+'</div>';
    }

    container.innerHTML =
      '<div class="conv-ktabs">'+tabs+
        '<div class="conv-klabel">'+kdef.label+'</div>'+
        '<label class="conv-toggle"><input type="checkbox" class="conv-chk"'+(st.showVals?' checked':'')+'>'+
        '<span>Mostrar valores</span></label>'+
      '</div>'+
      '<div class="conv-panels">'+
        '<div class="conv-block">'+
          '<div class="conv-blbl">Imagen de entrada <span class="conv-dim mono">7×7</span></div>'+
          '<div class="conv-grid conv-img-grid">'+inputCells+'</div>'+
          '<div class="conv-bsub">En gris: valor del píxel (0–255)</div>'+
        '</div>'+
        '<div class="conv-center">'+
          '<div class="conv-blbl">Filtro / Kernel <span class="conv-dim mono">3×3</span></div>'+
          '<div class="conv-grid conv-k-grid">'+kr_cells+'</div>'+
          '<div class="conv-blbl" style="margin-top:18px;">Productos en posición ('+row+','+col+')</div>'+
          '<div class="conv-comp">'+compRows+
            '<div class="conv-sum"><span class="cs-label">Suma bruta</span><span class="cs-v">'+(raw>=0?'+':'')+raw.toFixed(1)+'</span></div>'+
            '<div class="conv-relu"><span class="cs-label">ReLU('+raw.toFixed(1)+')</span><span class="cs-v relu-v">'+activated.toFixed(1)+'</span></div>'+
          '</div>'+
        '</div>'+
        '<div class="conv-block">'+
          '<div class="conv-blbl">Feature map <span class="conv-dim mono">5×5</span></div>'+
          '<div class="conv-grid conv-out-grid">'+outCells+'</div>'+
          '<div class="conv-bsub">Celda marcada = posición actual</div>'+
        '</div>'+
      '</div>'+
      '<div class="conv-ctrl">'+
        '<button class="conv-btn" data-a="prev">&#8592;</button>'+
        '<button class="conv-btn conv-play" data-a="play">'+(st.playing?'&#9646;&#9646;':'&#9654;')+'</button>'+
        '<button class="conv-btn" data-a="next">&#8594;</button>'+
        '<span class="conv-pos mono">paso '+(st.pos+1)+' / 25</span>'+
      '</div>';

    /* events */
    container.querySelectorAll('.conv-ktab').forEach(function(b){
      b.addEventListener('click', function(){ st.kname=b.getAttribute('data-k'); st.pos=0; if(st.timer)clearInterval(st.timer),st.timer=null,st.playing=false; render(container,st); });
    });
    container.querySelector('.conv-chk').addEventListener('change', function(e){ st.showVals=e.target.checked; render(container,st); });
    container.querySelectorAll('.conv-btn').forEach(function(b){
      b.addEventListener('click', function(){
        var a=b.getAttribute('data-a');
        if(a==='prev'){ if(st.timer)clearInterval(st.timer),st.timer=null,st.playing=false; st.pos=Math.max(0,st.pos-1); render(container,st); }
        if(a==='next'){ if(st.timer)clearInterval(st.timer),st.timer=null,st.playing=false; st.pos=Math.min(24,st.pos+1); render(container,st); }
        if(a==='play'){
          st.playing=!st.playing;
          if(st.playing){ if(st.pos>=24)st.pos=0; st.timer=setInterval(function(){ st.pos=st.pos<24?st.pos+1:0; render(container,st); },600); }
          else { clearInterval(st.timer);st.timer=null; }
          render(container,st);
        }
      });
    });
  }

  window.initConv = function(container){
    if(!container) return;
    render(container, { kname:'Sobel V', pos:0, showVals:true, playing:false, timer:null });
  };
})();
