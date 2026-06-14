import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

class ScrollStage {
  constructor(root) {
    this.root = root;
    this.slides = Array.from(root.querySelectorAll('section'));
    this.currentIndex = -1;
    
    this.initOverlay();
    this.initScrollTriggers();
    this.initKeyboardNav();
    
    // Jump to slide based on hash
    this.restoreIndex();
  }

  restoreIndex() {
    const h = (location.hash || '').match(/^#(\d+)$/);
    if (h) {
      const n = parseInt(h[1], 10) - 1;
      if (n >= 0 && n < this.slides.length) {
        this.goTo(n, false);
      }
    }
  }

  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay export-hidden';
    this.overlay.setAttribute('role', 'toolbar');
    this.overlay.setAttribute('aria-label', 'Deck controls');
    this.overlay.innerHTML = `
      <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
      </button>
      <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">${this.slides.length}</span></span>
      <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
      </button>
      <span class="divider"></span>
      <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
    `;

    document.body.appendChild(this.overlay);

    this.countEl = this.overlay.querySelector('.current');

    this.overlay.querySelector('.prev').addEventListener('click', () => this.advance(-1));
    this.overlay.querySelector('.next').addEventListener('click', () => this.advance(1));
    this.overlay.querySelector('.reset').addEventListener('click', () => this.goTo(0));

    this.hideTimer = null;
    window.addEventListener('mousemove', () => this.flashOverlay(), { passive: true });
    
    // Inject overlay styles
    if (!document.getElementById('deck-stage-styles')) {
      const style = document.createElement('style');
      style.id = 'deck-stage-styles';
      style.textContent = `
        .overlay {
          position: fixed;
          left: 50%;
          bottom: 22px;
          transform: translate(-50%, 6px) scale(0.92);
          filter: blur(6px);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          background: #000;
          color: #fff;
          border-radius: 999px;
          font-size: 12px;
          font-feature-settings: "tnum" 1;
          letter-spacing: 0.01em;
          opacity: 0;
          pointer-events: none;
          transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
          transform-origin: center bottom;
          z-index: 2147483000;
          user-select: none;
        }
        .overlay[data-visible] {
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0) scale(1);
          filter: blur(0);
        }
        .btn {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: 0;
          margin: 0;
          padding: 0;
          color: inherit;
          font: inherit;
          cursor: default;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          min-width: 28px;
          border-radius: 999px;
          color: rgba(255,255,255,0.72);
          transition: background 140ms ease, color 140ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .btn:active { background: rgba(255,255,255,0.18); }
        .btn:focus, .btn:focus-visible { outline: none; }
        .btn svg { width: 14px; height: 14px; display: block; }
        .btn.reset {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 0 10px 0 12px;
          gap: 6px;
          color: rgba(255,255,255,0.72);
        }
        .btn.reset .kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 10px;
          line-height: 1;
          color: rgba(255,255,255,0.88);
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
        }
        .count {
          font-variant-numeric: tabular-nums;
          color: #fff;
          font-weight: 500;
          padding: 0 8px;
          min-width: 42px;
          text-align: center;
          font-size: 12px;
        }
        .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
        .count .total { color: rgba(255,255,255,0.55); }
        .divider {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.18);
          margin: 0 2px;
        }
        @media print {
          .export-hidden { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  flashOverlay() {
    this.overlay.setAttribute('data-visible', '');
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.overlay.removeAttribute('data-visible');
    }, 1800);
  }

  initScrollTriggers() {
    this.slides.forEach((slide, i) => {
      ScrollTrigger.create({
        trigger: slide,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => this.activateSlide(i, slide),
        onEnterBack: () => this.activateSlide(i, slide)
      });
    });
  }

  activateSlide(index, slide) {
    if (this.currentIndex === index && slide.hasAttribute('data-deck-active')) return;
    
    this.currentIndex = index;
    if (this.countEl) this.countEl.textContent = String(index + 1);

    this.slides.forEach(s => {
      if (s !== slide) s.removeAttribute('data-deck-active');
    });

    slide.setAttribute('data-deck-active', '');

    // Dispatch event for gsapSetup and widgets
    document.dispatchEvent(new CustomEvent('slidechange', {
      detail: { slide, index, total: this.slides.length }
    }));
    
    // Hash update
    try { history.replaceState(null, '', '#' + (index + 1)); } catch (e) {}
  }

  initKeyboardNav() {
    window.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      let handled = true;
      const key = e.key;

      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this.advance(1);
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this.advance(-1);
      } else if (key === 'Home') {
        this.goTo(0);
      } else if (key === 'End') {
        this.goTo(this.slides.length - 1);
      } else if (key === 'r' || key === 'R') {
        this.goTo(0);
      } else if (/^[0-9]$/.test(key)) {
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        this.goTo(n);
      } else {
        handled = false;
      }

      if (handled) {
        e.preventDefault();
        this.flashOverlay();
      }
    });
  }

  advance(dir) {
    const next = Math.max(0, Math.min(this.slides.length - 1, this.currentIndex + dir));
    if (next !== this.currentIndex) {
      this.goTo(next);
    } else {
      this.flashOverlay();
    }
  }

  goTo(index, animate = true) {
    if (index < 0 || index >= this.slides.length) return;
    const slide = this.slides[index];
    const motionOK = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (animate && motionOK) {
      gsap.to(window, {
        scrollTo: { y: slide, autoKill: true },
        duration: 0.72,
        ease: 'power2.inOut',
        overwrite: true
      });
    } else {
      window.scrollTo(0, slide.offsetTop);
    }
  }
}

export function initDeckStage() {
  const root = document.querySelector('.scroll-root');
  if (root && !window.deckStage) {
    window.deckStage = new ScrollStage(root);
  }
}
