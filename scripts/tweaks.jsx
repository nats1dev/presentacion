/* scripts/tweaks.jsx — Panel de tweaks para la defensa de tesis CNN */
import React from 'react';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio
} from '../tweaks-panel.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  animType:  "rise",
  animSpeed: "normal",
  density:   "normal",
  accent:    "teal",
  theme:     "light"
}/*EDITMODE-END*/;

export default function DeckTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;
  const syncedRef = React.useRef(false);

  /* Sync inicial: lee el tema guardado por theme.js en la misma key */
  React.useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    try {
      const saved = localStorage.getItem("tesis-theme");
      if (saved && saved !== t.theme) setTweak("theme", saved);
    } catch (e) {}
  }, []);

  /* Aplica tweaks al DOM en cada cambio */
  React.useEffect(() => {
    const body = document.body;

    body.dataset.animType  = t.animType;
    body.dataset.animSpeed = t.animSpeed;
    body.dataset.density   = t.density;
    body.dataset.accent    = t.accent;

    /* Tema — sincronizar con theme.js */
    root.setAttribute("data-theme", t.theme);
    try { localStorage.setItem("tesis-theme", t.theme); } catch (e) {}
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = t.theme === "dark" ? "☀" : "☾";
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t.theme } }));
  }, [t.animType, t.animSpeed, t.density, t.accent, t.theme]);

  return (
    <TweaksPanel>
      <TweakSection label="Animaciones" />
      <TweakRadio
        label="Tipo"
        value={t.animType}
        options={["rise", "fade", "scale", "slide"]}
        onChange={v => setTweak("animType", v)}
      />
      <TweakRadio
        label="Velocidad"
        value={t.animSpeed}
        options={["fast", "normal", "slow"]}
        onChange={v => setTweak("animSpeed", v)}
      />
      <TweakSection label="Composición" />
      <TweakRadio
        label="Densidad"
        value={t.density}
        options={["compact", "normal", "spacious"]}
        onChange={v => setTweak("density", v)}
      />
      <TweakSection label="Visual" />
      <TweakRadio
        label="Acento"
        value={t.accent}
        options={["teal", "azul", "pizarra"]}
        onChange={v => setTweak("accent", v)}
      />
      <TweakRadio
        label="Tema"
        value={t.theme}
        options={["light", "dark"]}
        onChange={v => setTweak("theme", v)}
      />
    </TweaksPanel>
  );
}
