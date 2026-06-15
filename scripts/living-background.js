const THEMES = [
  { match: /Portada|Gracias/, a: '#0f766b', b: '#b1542a', ink: '#111517', energy: 0.35 },
  { match: /problema|Guatemala|umbral|confusi/i, a: '#b1542a', b: '#0f766b', ink: '#2b1911', energy: 0.78 },
  { match: /Marco|Convoluci|Arquitecturas/i, a: '#3b6ea5', b: '#0f766b', ink: '#111927', energy: 0.62 },
  { match: /Metodolog|Pipeline|Condiciones|Banco/i, a: '#0f766b', b: '#c79023', ink: '#111c1b', energy: 0.5 },
  { match: /Resultados|ROC|Eficiencia|Contraste|Cochran/i, a: '#3b6ea5', b: '#c79023', ink: '#121923', energy: 0.72 },
  { match: /Conclusiones|Recomendaciones|Discusi/i, a: '#0f766b', b: '#3b6ea5', ink: '#101817', energy: 0.48 }
];

function themeFor(slide) {
  const label = `${slide?.dataset?.label || ''} ${slide?.querySelector('[data-screen-label]')?.dataset?.screenLabel || ''}`;
  return THEMES.find((theme) => theme.match.test(label)) || THEMES[3];
}

function setVars(root, vars) {
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

function activateBackground(event) {
  const { slide, index = 0, total = 1 } = event.detail || {};
  const theme = themeFor(slide);
  const progress = total > 1 ? index / (total - 1) : 0;
  const orbit = index * 37;
  const energy = theme.energy;

  setVars(document.documentElement, {
    '--living-a': theme.a,
    '--living-b': theme.b,
    '--living-ink': theme.ink,
    '--living-x': `${18 + ((index * 13) % 68)}%`,
    '--living-y': `${12 + ((index * 19) % 72)}%`,
    '--living-x2': `${82 - ((index * 17) % 64)}%`,
    '--living-y2': `${88 - ((index * 11) % 70)}%`,
    '--living-rot': `${orbit}deg`,
    '--living-shift': `${Math.round((progress - 0.5) * 120)}px`,
    '--living-energy': energy.toFixed(2),
    '--living-opacity': (0.2 + energy * 0.22).toFixed(2)
  });

  document.body.dataset.livingTone = energy > 0.7 ? 'critical' : 'calm';
}

function initLivingBackground() {
  if (!document.querySelector('.living-bg')) return;
  document.addEventListener('slidechange', activateBackground);

  const active = document.querySelector('[data-deck-active]') || document.querySelector('.scroll-root > section');
  activateBackground({
    detail: {
      slide: active,
      index: active ? Array.from(document.querySelectorAll('.scroll-root > section')).indexOf(active) : 0,
      total: document.querySelectorAll('.scroll-root > section').length || 1
    }
  });
}

initLivingBackground();
