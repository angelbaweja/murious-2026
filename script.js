/* ═══════════════════════════════════════════════════════
   MURIOUS 2026 — Script v3
   Magic Wand Cursor
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ──
  let windowH = window.innerHeight;

  // Wand state
  let mouseX = -100, mouseY = -100;
  let wandX = -100, wandY = -100;
  let trailCanvas, trailCtx;
  let trailPoints = [];


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
    if (!trailCanvas) return; // safeguard
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
      if (wand) wand.classList.add('casting');
      spawnSparkles(e.clientX, e.clientY, sparkleContainer);
      spawnBurst(e.clientX, e.clientY, sparkleContainer);
    });

    document.addEventListener('mouseup', () => {
      if (wand) setTimeout(() => wand.classList.remove('casting'), 150);
    });

    // Animate wand position smoothly
    function updateWand() {
      // Smooth follow
      wandX += (mouseX - wandX) * 0.35;
      wandY += (mouseY - wandY) * 0.35;

      if (wand) {
        wand.style.left = wandX + 'px';
        wand.style.top = wandY + 'px';
      }

      if (shadow) {
        shadow.style.left = (wandX + 12) + 'px';
        shadow.style.top = (wandY + 36) + 'px';
      }

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
    if (!container) return;
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
    if (!container) return;
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

    if (!navbar || !toggle || !links) return;

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
  // SCHEDULE TABS — MARAUDER'S MAP (2D Layout)
  // ════════════════════════════════════════════════════
  function initScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-tab');
    const items = document.querySelectorAll('.map-loc');
    const map = document.getElementById('marauderMap');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const day = tab.dataset.day;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Fade out all items
        items.forEach(item => {
          item.classList.remove('map-revealed');
        });

        // After brief fade, show correct day items with stagger
        setTimeout(() => {
          let delay = 0;
          items.forEach(item => {
            if (item.dataset.day === day) {
              item.style.display = '';
              setTimeout(() => {
                item.classList.add('map-revealed');
              }, delay);
              delay += 120;
            } else {
              item.style.display = 'none';
            }
          });
        }, 250);
      });
    });

    // Parchment unfold animation on scroll into view
    if (map) {
      const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            map.classList.add('map-visible');
            // Reveal day 1 items with stagger
            let delay = 400;
            items.forEach(item => {
              if (item.dataset.day === '1') {
                setTimeout(() => {
                  item.classList.add('map-revealed');
                }, delay);
                delay += 150;
              }
            });
            mapObserver.unobserve(map);
          }
        });
      }, { threshold: 0.1 });
      mapObserver.observe(map);
    }
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
  // SCROLL LOCK + CASTLE POP-UP 
  // ════════════════════════════════════════════════════
  function initScrollBehavior() {
    const castle = document.querySelector('.hero-castle');
    const heroContent = document.querySelector('.hero-content');

    const sections = Array.from(document.querySelectorAll('.section'));
    let step = 0;
    let isLocked = false;
    let scrollLockActive = true;

    function lockFor(ms) {
      isLocked = true;
      setTimeout(() => { isLocked = false; }, ms);
    }

    function setCastleState(risen) {
      if (!castle || !heroContent) return;
      const ltree = document.querySelector('.hero-tree-left');
      const rtree = document.querySelector('.hero-tree-right');
      const lclif = document.querySelector('.hero-clif-left');
      const rclif = document.querySelector('.hero-clif-right');
      if (risen) {
        const moveUp = windowH * 0.8;
        castle.style.transform = `translateX(-50%) translateY(-${moveUp}px) scale(2.8)`;
        heroContent.style.filter = 'blur(0px)';
        heroContent.style.opacity = '0';

        if (ltree) ltree.style.transform = 'translateX(0)';
        if (rtree) rtree.style.transform = 'translateX(0)';

        if (lclif) lclif.style.transform = 'translateX(0)';
        if (rclif) rclif.style.transform = 'translateX(0)';
      } else {
        castle.style.transform = 'translateX(-50%) translateY(0) scale(1)';
        heroContent.style.filter = 'blur(0px)';
        heroContent.style.opacity = '1';

        if (ltree) ltree.style.transform = 'translateX(-110%)';
        if (rtree) rtree.style.transform = 'translateX(110%)';

        if (lclif) lclif.style.transform = 'translateX(-110%)';
        if (rclif) rclif.style.transform = 'translateX(110%)';
      }
    }

    function goTo(newStep) {
      if (isLocked) return;
      newStep = Math.max(0, Math.min(2, newStep));
      if (newStep === step) return;
      step = newStep;

      if (step === 0) {
        // Home — castle down, hero visible
        setCastleState(false);
        window.scrollTo({ top: 0 });
        lockFor(900);
        scrollLockActive = true;
      } else if (step === 1) {
        // Castle rises, hero text fades
        setCastleState(true);
        window.scrollTo({ top: 0 });
        lockFor(900);
        scrollLockActive = true;
      } else {
        const target = sections[1];
        if (target) {
          const container = target.querySelector('.section-container');
          if (container) {
            container.classList.add('section-entering');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => container.classList.remove('section-entering'), 350);
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        lockFor(900);
        setTimeout(() => { scrollLockActive = false; }, 900);
      }
    }


    // ════════════════════════════════════════════════════
    // SCROLL LOCK
    // ════════════════════════════════════════════════════

    window.addEventListener('wheel', (e) => {
      if (!scrollLockActive) return;
      e.preventDefault();
      if (e.deltaY > 8) goTo(step + 1);
      else if (e.deltaY < -8) goTo(step - 1);
    }, { passive: false });

    // ── Keyboard ──
    window.addEventListener('keydown', (e) => {
      if (!scrollLockActive) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goTo(step + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(step - 1);
      }
    });

    // ── Touch ──
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (!scrollLockActive) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (delta > 40) goTo(step + 1);
      else if (delta < -40) goTo(step - 1);
    });

    // ── Re-engage lock for castle animation 
    window.addEventListener('scroll', () => {
      if (!scrollLockActive && window.scrollY < 10) {
        step = 1;
        scrollLockActive = true;
        setCastleState(true);
      }
    }, { passive: true });

    // Init: castle hidden
    setCastleState(false);
  }



  // ════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════
  function init() {
    windowH = window.innerHeight;

    // Hides the loading screen safely after 1.5 seconds 
    // since we removed the 192-frame loading logic.
    setTimeout(() => {
      const loader = document.getElementById('pageLoader');
      if (loader) loader.classList.add('hidden');
    }, 1500);

    createParticles();
    initWandCursor();
    initScrollBehavior();
    initNavbar();
    initReveal();
    initScheduleTabs();
    initForms();
    initSmoothScroll();

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        windowH = window.innerHeight;
        resizeTrailCanvas();
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

