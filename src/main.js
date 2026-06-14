import '../styles/deck.css';
import '../styles/slides.css';
import '../styles/widgets.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import metricsData from '../data/model-metrics.json';
import deckHtml from './deck.html?raw';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

const WIDGETS = {
  metrics: 'initMetricsChart',
  threshold: 'initThreshold',
  confusion: 'initConfusion',
  roc: 'initRoc',
  pipeline: 'initPipeline',
  conv: 'initConv',
  cnn: 'initCNN'
};

function modelColor(id) {
  return {
    cnn: 'var(--c-cnn)',
    mobilenet: 'var(--c-mobilenet)',
    efficientnet: 'var(--c-efficientnet)'
  }[id] || 'var(--teal)';
}

function modelShort(id, label) {
  return {
    cnn: 'CNN',
    mobilenet: 'MobileNet',
    efficientnet: 'EfficientNet'
  }[id] || label;
}

function loadThesisData() {
  const data = metricsData;
  const models = data.models.map((m) => ({
    id: m.id,
    label: m.label,
    short: modelShort(m.id, m.label),
    color: modelColor(m.id),
    accuracy: m.accuracy_percent,
    recall: m.recall,
    specificity: m.specificity,
    f1: m.f1,
    auc: m.auc_roc,
    latency: m.latency_ms,
    fps: m.fps,
    params: m.parameters,
    mb: m.size_mb,
    cm: m.confusion
  }));
  const first = models[0] && models[0].cm;
  window.THESIS = {
    test_size: data.test_size,
    test_pos: first ? first.fn + first.tp : 107,
    test_neg: first ? first.tn + first.fp : 160,
    threshold: data.threshold,
    models,
    dataset: { total: 2667, train: 2133, val: 267, test: data.test_size }
  };
}

function loadDeckMarkup() {
  const root = document.getElementById('deck-root');
  root.innerHTML = deckHtml;
}

function hydrate(slide) {
  if (!slide) return;
  slide.querySelectorAll('[data-widget]').forEach((el) => {
    if (el.dataset.ready) return;
    const fn = WIDGETS[el.getAttribute('data-widget')];
    if (fn && typeof window[fn] === 'function') {
      window[fn](el);
      el.dataset.ready = '1';
    }
  });
}

function numberFooters() {
  const sections = document.querySelectorAll('.scroll-root > section');
  const total = sections.length;
  sections.forEach((sec, i) => {
    const fn = sec.querySelector('.foot-num');
    if (fn) fn.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${total}`;
  });
}

import { initDeckStage } from '../deck-stage.js';

function hydrateActiveSlide() {
  numberFooters();
  const stage = document.querySelector('.scroll-root');
  if (stage) {
    stage.querySelectorAll('section').forEach(sec => hydrate(sec));
    initDeckStage();
  }
}

async function loadLegacyRuntime() {
  await import('../scripts/stats.js');
  await import('../scripts/w-metrics.js');
  await import('../scripts/w-threshold.js');
  await import('../scripts/w-confusion.js');
  await import('../scripts/w-roc.js');
  await import('../scripts/w-pipeline.js');
  await import('../scripts/w-conv.js');
  await import('../scripts/w-cnn.js');
  await import('../scripts/theme.js');
  await import('../image-slot.js');
  await import('../scripts/anim-enhance.js');
  await import('../scripts/animations/reducedMotion.js');
  await import('../scripts/animations/transitions.js');
  await import('../scripts/animations/keywords.js');
  await import('../scripts/animations/slideScenes.js');
  await import('../scripts/animations/gsapSetup.js');
  await import('../scripts/tweaks.jsx');
}

async function boot() {
  loadThesisData();
  loadDeckMarkup();
  await loadLegacyRuntime();

  document.addEventListener('slidechange', (e) => hydrate(e.detail.slide));
  hydrateActiveSlide();
}

boot().catch((error) => {
  console.error(error);
  const root = document.getElementById('deck-root') || document.body;
  root.innerHTML = `<pre style="padding:24px;color:#b3261e;white-space:pre-wrap">${error.message}</pre>`;
});
