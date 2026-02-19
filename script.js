/* ═══════════════════════════════════════════════════════
   MURIOUS 2026 — Script v2
   Scroll-controlled animation + Magic Wand Cursor
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Config ──
  const TOTAL_FRAMES = 192;
  const FRAME_PATH = 'animation/';

  // ── State ──
  const frames = [];
  let loadedCount = 0;
  let loaderDismissed = false;
  const pageLoadTime = Date.now();
  let currentFrame = 0;
  let targetFrame = 0;
  let canvas, ctx;
  let docHeight = 0;
  let windowH = window.innerHeight;

  // Wand state
  let mouseX = -100, mouseY = -100;
  let wandX = -100, wandY = -100;
  let trailCanvas, trailCtx;
  let trailPoints = [];

  // ════════════════════════════════════════════════════
  // FRAME PRELOADER
  // ════════════════════════════════════════════════════
  function getDelayForFrame(i) {
    const mod = i % 5;
    return (mod === 1 || mod === 4) ? '0.041s' : '0.042s';
  }

  function preloadFrames() {
    let batchIndex = 0;
    const BATCH_SIZE = 24;

    function loadBatch() {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);

      for (let i = start; i < end; i++) {
        const img = new Image();
        const padded = String(i).padStart(3, '0');
        const delay = getDelayForFrame(i);
        img.src = `${FRAME_PATH}frame_${padded}_delay-${delay}.jpg`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 1) drawFrame(0);
          // Dismiss loader once first batch is ready AND at least 3s have passed
          if (loadedCount >= 24 && !loaderDismissed) {
            loaderDismissed = true;
            const elapsed = Date.now() - pageLoadTime;
            const remaining = Math.max(0, 3000 - elapsed);
            setTimeout(() => {
              const loader = document.getElementById('pageLoader');
              if (loader) loader.classList.add('hidden');
            }, remaining);
          }
        };
        img.onerror = () => {
          // Try alternate delay
          const alt = delay === '0.042s' ? '0.041s' : '0.042s';
          img.src = `${FRAME_PATH}frame_${padded}_delay-${alt}.jpg`;
        };
        frames[i] = img;
      }

      batchIndex++;
      if (end < TOTAL_FRAMES) {
        requestAnimationFrame(loadBatch);
      }
    }

    loadBatch();
  }

  // ════════════════════════════════════════════════════
  // CANVAS RENDERING
  // ════════════════════════════════════════════════════
  function initCanvas() {
    canvas = document.getElementById('heroCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }

  function drawFrame(index) {
    if (!ctx) return;
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover fit
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ════════════════════════════════════════════════════
  // SCROLL-CONTROLLED ANIMATION (forward + reverse)
  // ════════════════════════════════════════════════════
  function updateDocHeight() {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  }

  function handleScroll() {
    const scrollY = window.scrollY;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;
    targetFrame = Math.min(
      Math.round(progress * (TOTAL_FRAMES - 1)),
      TOTAL_FRAMES - 1
    );
  }

  // Smooth interpolation loop for animation frames
  function animationLoop() {
    // Smoothly interpolate towards target frame
    if (currentFrame !== targetFrame) {
      const diff = targetFrame - currentFrame;
      // Move at least 1 frame, but smooth for large jumps
      const step = Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.15);
      currentFrame = Math.round(currentFrame + step);
      currentFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, currentFrame));
      drawFrame(currentFrame);
    }

    requestAnimationFrame(animationLoop);
  }

  // ════════════════════════════════════════════════════
  // PARALLAX FOG LAYERS
  // ════════════════════════════════════════════════════
  function updateParallax() {
    const scrollY = window.scrollY;
    const fogBack = document.querySelector('.bg-fog-back');
    const fogFront = document.querySelector('.bg-fog-front');

    if (fogBack) {
      fogBack.style.transform = `translateY(${scrollY * -0.15}px)`;
    }
    if (fogFront) {
      fogFront.style.transform = `translateY(${scrollY * -0.25}px)`;
    }

    // Hero content parallax
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrollY < windowH) {
      const p = scrollY / (windowH * 0.6);
      heroContent.style.opacity = Math.max(0, 1 - p);
      heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
    }
  }

  // ════════════════════════════════════════════════════
  // FLOATING PARTICLES
  // ════════════════════════════════════════════════════
  function createParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;

    for (let i = 0; i < 39; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      const size = Math.random() * 4.2 + 2.1;
      const isGold = Math.random() > 0.4;
      const color = isGold
        ? 'rgba(212,168,83,0.7)'
        : 'rgba(139,92,246,0.6)';
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:-10px;
        background:${color};
        box-shadow:0 0 ${size * 3}px ${color};
        animation-duration:${Math.random() * 12 + 8}s;
        animation-delay:${Math.random() * 12}s;
      `;
      container.appendChild(p);
    }
  }

  // ════════════════════════════════════════════════════
  // MAGIC WAND CURSOR
  // ════════════════════════════════════════════════════
  function initWandCursor() {
    const wand = document.getElementById('wandCursor');
    const shadow = document.getElementById('wandShadow');
    const sparkleContainer = document.getElementById('sparkleContainer');

    // Trail canvas
    trailCanvas = document.getElementById('wandTrail');
    trailCtx = trailCanvas.getContext('2d');
    resizeTrailCanvas();

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add trail point
      trailPoints.push({
        x: mouseX,
        y: mouseY,
        alpha: 0.6,
        size: 3 + Math.random() * 2,
        color: Math.random() > 0.5
          ? `rgba(212,168,83,${0.3 + Math.random() * 0.3})`
          : `rgba(139,92,246,${0.2 + Math.random() * 0.2})`
      });

      // Limit trail length
      if (trailPoints.length > 20) {
        trailPoints.shift();
      }
    }, { passive: true });

    // Click — switch to casting wand + spawn sparkles
    document.addEventListener('mousedown', (e) => {
      wand.classList.add('casting');
      spawnSparkles(e.clientX, e.clientY, sparkleContainer);
      spawnBurst(e.clientX, e.clientY, sparkleContainer);
    });

    document.addEventListener('mouseup', () => {
      setTimeout(() => wand.classList.remove('casting'), 150);
    });

    // Animate wand position smoothly
    function updateWand() {
      // Smooth follow
      wandX += (mouseX - wandX) * 0.35;
      wandY += (mouseY - wandY) * 0.35;

      wand.style.left = wandX + 'px';
      wand.style.top = wandY + 'px';

      shadow.style.left = (wandX + 12) + 'px';
      shadow.style.top = (wandY + 36) + 'px';

      // Draw trail
      drawTrail();

      requestAnimationFrame(updateWand);
    }

    updateWand();
  }

  function resizeTrailCanvas() {
    if (trailCanvas) {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
  }

  function drawTrail() {
    if (!trailCtx) return;

    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = trailPoints.length - 1; i >= 0; i--) {
      const pt = trailPoints[i];
      pt.alpha -= 0.03;
      pt.size *= 0.96;

      if (pt.alpha <= 0) {
        trailPoints.splice(i, 1);
        continue;
      }

      trailCtx.beginPath();
      trailCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      trailCtx.fillStyle = pt.color;
      trailCtx.globalAlpha = pt.alpha;
      trailCtx.fill();

      // Glow
      trailCtx.shadowBlur = pt.size * 4;
      trailCtx.shadowColor = pt.color;
    }

    trailCtx.globalAlpha = 1;
    trailCtx.shadowBlur = 0;
  }

  function spawnSparkles(x, y, container) {
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.classList.add('sparkle');

      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
      const dist = 30 + Math.random() * 50;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;
      const size = 3 + Math.random() * 5;

      const isGold = Math.random() > 0.3;
      const color = isGold
        ? `rgba(255,${190 + Math.random() * 60},${50 + Math.random() * 50},1)`
        : `rgba(${120 + Math.random() * 40},${80 + Math.random() * 30},246,1)`;

      spark.style.cssText = `
        left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        background:${color};
        box-shadow: 0 0 ${size * 2}px ${color};
        --sx:${sx}px; --sy:${sy}px;
      `;

      container.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }
  }

  function spawnBurst(x, y, container) {
    const burst = document.createElement('div');
    burst.classList.add('spell-burst');
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 500);
  }

  // ════════════════════════════════════════════════════
  // NAVBAR
  // ════════════════════════════════════════════════════
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const navAnchors = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });

    navAnchors.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });

    // Active link tracking
    const sections = document.querySelectorAll('.section');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -70% 0px' });

    sections.forEach(s => obs.observe(s));
  }

  // ════════════════════════════════════════════════════
  // SCROLL REVEAL
  // ════════════════════════════════════════════════════
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => obs.observe(el));
  }

  // ════════════════════════════════════════════════════
  // SCHEDULE TABS
  // ════════════════════════════════════════════════════
  function initScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-tab');
    const items = document.querySelectorAll('.timeline-item');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const day = tab.dataset.day;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        items.forEach(item => {
          if (item.dataset.day === day) {
            item.style.display = '';
            item.classList.remove('active');
            setTimeout(() => item.classList.add('active'), 50);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ════════════════════════════════════════════════════
  // FORMS
  // ════════════════════════════════════════════════════
  function initForms() {
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        const inputs = regForm.querySelectorAll('input, select');
        let valid = true;
        inputs.forEach(inp => {
          if (!inp.value.trim()) { inp.classList.add('invalid'); valid = false; }
          else inp.classList.remove('invalid');
        });
        if (valid) {
          btn.classList.add('submitted');
          btn.disabled = true;
          // Sparkle on button
          const rect = btn.getBoundingClientRect();
          const container = document.getElementById('sparkleContainer');
          spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, container);
          setTimeout(() => {
            btn.classList.remove('submitted');
            btn.disabled = false;
            regForm.reset();
          }, 3000);
        }
      });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const inputs = contactForm.querySelectorAll('input, textarea');
        let valid = true;
        inputs.forEach(inp => {
          if (!inp.value.trim()) { inp.classList.add('invalid'); valid = false; }
          else inp.classList.remove('invalid');
        });
        if (valid) {
          const orig = btn.textContent;
          btn.textContent = '✦ Message Sent! ✦';
          btn.disabled = true;
          const rect = btn.getBoundingClientRect();
          const container = document.getElementById('sparkleContainer');
          spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, container);
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; contactForm.reset(); }, 3000);
        }
      });
    }

    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
      .forEach(inp => {
        inp.addEventListener('input', () => inp.classList.remove('invalid'));
      });
  }

  // ════════════════════════════════════════════════════
  // SMOOTH SCROLL FOR ALL ANCHORS
  // ════════════════════════════════════════════════════
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      if (a.classList.contains('nav-link')) return;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════
  function init() {
    windowH = window.innerHeight;

    initCanvas();
    preloadFrames();
    createParticles();
    initWandCursor();
    initNavbar();
    initReveal();
    initScheduleTabs();
    initForms();
    initSmoothScroll();

    updateDocHeight();

    // Start animation interpolation loop
    animationLoop();

    // Scroll handler (throttled via rAF)
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          handleScroll();
          updateParallax();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        windowH = window.innerHeight;
        resizeCanvas();
        resizeTrailCanvas();
        updateDocHeight();
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
