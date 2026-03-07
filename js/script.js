/* ═══════════════════════════════════════════════════════
   MURIOUS 2026 — Script v3
   Magic Wand Cursor + Registration System
   ═══════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════
// FIREBASE CONFIG — Replace with your real credentials
// ════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyDFt5T1GCewg1Ai5PF6l3YG8y26dIEZ7Ug",
  authDomain: "techfest-registration-eace0.firebaseapp.com",
  projectId: "techfest-registration-eace0",
  storageBucket: "techfest-registration-eace0.firebasestorage.app",
  messagingSenderId: "1094190297812",
  appId: "1:1094190297812:web:007376a2e08b4ff7fb4141",
  measurementId: "G-36RTV9Y354"
};

// Razorpay Key — Replace with your real key
const RAZORPAY_KEY = "YOUR_RAZORPAY_KEY_ID";

let db = null;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    }
  } catch (e) {
    console.warn('Firebase init error:', e);
  }
}

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
  // FORMS (Registration + Contact)
  // ════════════════════════════════════════════════════
  function initForms() {
    // ── Registration Form ──
    const regForm = document.getElementById('registerForm');
    const regEvent = document.getElementById('regEvent');
    const feeDisplay = document.getElementById('feeDisplay');
    const feeAmount = document.getElementById('feeAmount');
    const regLoading = document.getElementById('regLoading');
    const regSuccess = document.getElementById('regSuccess');
    const regError = document.getElementById('regError');
    const regErrorMsg = document.getElementById('regErrorMsg');
    const registerBtn = document.getElementById('registerBtn');

    // Dynamic fee display on event change
    if (regEvent) {
      regEvent.addEventListener('change', function () {
        const sel = this.options[this.selectedIndex];
        const fee = sel.getAttribute('data-fee');
        if (fee) {
          feeAmount.textContent = '₹' + fee;
          feeDisplay.style.display = 'flex';
          feeDisplay.style.animation = 'none';
          feeDisplay.offsetHeight;
          feeDisplay.style.animation = 'feeSlideIn 0.4s ease forwards';
        } else {
          feeDisplay.style.display = 'none';
        }
      });
    }

    // Registration form submit
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const college = document.getElementById('regCollege').value.trim();
        const eventSel = regEvent ? regEvent.options[regEvent.selectedIndex] : null;
        const eventName = regEvent ? regEvent.value : '';
        const eventFee = eventSel ? parseInt(eventSel.getAttribute('data-fee')) : 0;

        // Validate fields
        let valid = true;
        const fields = regForm.querySelectorAll('input, select');
        fields.forEach(inp => {
          if (!inp.value || !inp.value.trim()) { inp.classList.add('invalid'); valid = false; }
          else inp.classList.remove('invalid');
        });

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
          document.getElementById('regEmail').classList.add('invalid');
          showError('Please enter a valid email address.');
          return;
        }

        // Phone length
        if (phone && !/^\d{10}$/.test(phone)) {
          document.getElementById('regPhone').classList.add('invalid');
          showError('Phone number must be exactly 10 digits.');
          return;
        }

        if (!valid || !eventName || eventFee <= 0) {
          showError('Please fill in all fields and select an event.');
          return;
        }

        // Check duplicate registration
        if (db) {
          try {
            showLoading(true);
            const snapshot = await db.collection('registrations')
              .where('email', '==', email)
              .where('event', '==', eventName)
              .get();
            if (!snapshot.empty) {
              showLoading(false);
              showError('You have already registered for this event with this email.');
              return;
            }
          } catch (err) {
            console.error('Duplicate check error:', err);
            showLoading(false);
            showError('Could not verify registration. Please try again.');
            return;
          }
        }

        // Open Razorpay
        showLoading(true);
        const options = {
          key: RAZORPAY_KEY,
          amount: eventFee * 100,
          currency: "INR",
          name: "Murious 20.0",
          description: eventName + " Registration",
          handler: async function (response) {
            const paymentId = response.razorpay_payment_id;
            if (db) {
              try {
                await db.collection('registrations').add({
                  name: name,
                  email: email,
                  phone: phone,
                  college: college,
                  event: eventName,
                  fee: eventFee,
                  paymentId: paymentId,
                  paymentStatus: "Success",
                  timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
              } catch (err) {
                console.error('Firestore save error:', err);
              }
            }
            showLoading(false);
            regForm.reset();
            feeDisplay.style.display = 'none';
            registerBtn.classList.add('submitted');
            const rect = registerBtn.getBoundingClientRect();
            const container = document.getElementById('sparkleContainer');
            spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, container);
            showSuccess();
            setTimeout(() => { registerBtn.classList.remove('submitted'); }, 3000);
          },
          modal: {
            ondismiss: function () {
              showLoading(false);
              showError('Payment was cancelled. Registration not completed.');
            }
          },
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: "#d4a853"
          }
        };

        try {
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            showLoading(false);
            showError('Payment failed: ' + (resp.error.description || 'Unknown error.'));
          });
          rzp.open();
        } catch (err) {
          showLoading(false);
          showError('Could not open payment gateway. Please try again.');
          console.error('Razorpay error:', err);
        }
      });
    }

    // ── Contact Form ──
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

    // Clear invalid on input
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
      .forEach(inp => {
        inp.addEventListener('input', () => inp.classList.remove('invalid'));
      });

    // Helper functions
    function showLoading(show) {
      if (regLoading) regLoading.classList.toggle('active', show);
    }

    function hideMessages() {
      if (regSuccess) regSuccess.classList.remove('active');
      if (regError) regError.classList.remove('active');
    }

    function showSuccess() {
      hideMessages();
      if (regSuccess) regSuccess.classList.add('active');
      setTimeout(() => { if (regSuccess) regSuccess.classList.remove('active'); }, 8000);
    }

    function showError(msg) {
      hideMessages();
      if (regErrorMsg) regErrorMsg.textContent = msg;
      if (regError) regError.classList.add('active');
      setTimeout(() => { if (regError) regError.classList.remove('active'); }, 8000);
    }
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
        castle.style.transform = `translateX(-50%) translateY(-${moveUp}px) scale(2.2)`;
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
  // EVENT SCROLL GALLERY
  // ════════════════════════════════════════════════════
  function initEventGallery() {
    const scrollContainer = document.querySelector('.event-scroll-container');
    if (!scrollContainer) return;

    const evtCardData = [
{
title: "THE TRIWIZARD QUEST",
img: "images/TREASURE.png",
desc: "The Triwizard Quest is a treasure hunt where wit, courage, and teamwork decide the ultimate champions. Participants face a series of clues, mysterious challenges, and hidden tasks scattered across the grounds."
},

{
title: "E-SPORTS",
img: "images/console.png",
desc: "Step into the ultimate digital battlefield where strategy, precision, and reflexes define true champions. Our Esports Championship brings together the fiercest gamers on campus to compete in electrifying titles like Valorant, FIFA, Clash Royale, and Tekken."
},

{
title: "REEL RUMBLE",
img: "images/reel.png",
desc: "Create a compelling reel around a surprise theme. Use visuals, music, and effects to engage and captivate your audience. Judged on creativity, relevance, and impact. Grab your camera and let your imagination flow!"
},

{
title: "FRAME IT",
img: "images/camera.png",
desc: "Participants are required to roam around the campus and capture the best photograph based on the theme provided to them, ensuring it is visually appealing to everyone. The best shot wins!"
},

{
title: "CODE ROYALE",
img: "images/laptop.png",
desc: "Code Royale is a high-intensity 1v1 coding battle where participants compete in knockout rounds to prove their dominance. With limited time and rising pressure, only the fastest and most accurate coder survives each round."
},

{
title: "PROMPT TO DESIGN",
img: "images/cloud.png",
desc: "Prompt to Design is an AI-based challenge where participants recreate a given image using only text prompts. Contestants observe the reference image and generate it through an AI tool."
},

{
title: "STORAGE WARS",
img: "images/sword.png",
desc: "Students engage in bidding on storage containers using fake currency, inspecting only the exterior. Teams of 2–4 collaborate, emphasizing strategic thinking and resource management."
},

{
title: "CODE IN DARK",
img: "images/codeinblack.png",
desc: "Code in Dark is a two-person team event that tests coding skills and communication. One teammate reads the problem and dictates the code, while the other, blindfolded, types it exactly as instructed."
},

{
title: "TECH TRIVIA",
img: "images/QUIZ.png",
desc: "A fast-paced quiz game inspired by the KBC format, featuring multiple rounds of coding, general knowledge, and tech current affairs. Participants earn points each round, with a leaderboard deciding the ultimate winner."
},

{
title: "OPEN MIC",
img: "images/openmic1.png",
desc: "In collaboration with the Theatre and Music Club, this stage welcomes poetry, storytelling, monologues, music, and everything in between. Step into the spotlight, share your story, and let your art be heard."
}
];


    const EVT_TOTAL = evtCardData.length;

    // Create card elements dynamically
    const gallery = document.getElementById('evtCardGallery');
    const evtCards = [];
    for (let i = 0; i < EVT_TOTAL; i++) {
      const card = document.createElement('div');
      card.className = 'evt-card';
      card.id = 'evtCard' + i;
      card.innerHTML = `
<div class="evt-card-inner glass-card">

<div class="magic-grid"></div>

<div class="spell-glow"></div>
<div class="magic-particles"></div>

<img src="${evtCardData[i].img}" class="evt-card-img">

<div class="evt-card-label">
${evtCardData[i].title}
</div>

</div>
`;
      
      gallery.appendChild(card);
      evtCards.push(card);
    }

    // DOM references
    const evtTextPanel = document.getElementById('evtTextPanel');
    const evtTextTitle = document.getElementById('evtTextTitle');
    const evtTextDesc = document.getElementById('evtTextDesc');
    const evtTextType = document.getElementById('evtTextType');
    const evtCounterCurrent = document.getElementById('evtCounterCurrent');
    const evtCounterTotal = document.getElementById('evtCounterTotal');
    const evtProgressFill = document.getElementById('evtProgressFill');
    const evtDotContainer = document.getElementById('evtDotIndicators');

    // Set counter total
    if (evtCounterTotal) evtCounterTotal.textContent = ' / ' + String(EVT_TOTAL).padStart(2, '0');

    // Set initial text
    if (evtTextTitle) evtTextTitle.textContent = evtCardData[0].title;
    if (evtTextDesc) evtTextDesc.textContent = evtCardData[0].desc;
    if (evtTextType) evtTextType.textContent = evtCardData[0].type;

    // Create dot indicators
    const evtDots = [];
    for (let i = 0; i < EVT_TOTAL; i++) {
      const d = document.createElement('div');
      d.className = 'evt-dot' + (i === 0 ? ' active' : '');
      evtDotContainer.appendChild(d);
      evtDots.push(d);
    }

    // Helpers
    function evtClamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function evtLerp(a, b, t) { return a + (b - a) * t; }
    function evtEaseInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function getEvtSlotStyle(offset) {
  switch (offset) {

    case 0:  
      return { x: 0, y: -2, r: 0, s: 1.08, o: 1, z: 10 };

    case -1: 
      return { x: -55, y: 0, r: -10, s: 0.82, o: 0.85, z: 6 };

    case 1:  
      return { x: 55, y: 0, r: 10, s: 0.82, o: 0.85, z: 6 };

    case -2: 
      return { x: -95, y: 4, r: -18, s: 0.65, o: 0.5, z: 3 };

    case 2:  
      return { x: 95, y: 4, r: 18, s: 0.65, o: 0.5, z: 3 };

    default:
      if (offset < 0) return { x: -140, y: 10, r: -25, s: 0.5, o: 0, z: 1 };
      else return { x: 140, y: 10, r: 25, s: 0.5, o: 0, z: 1 };
  }
}

    function lerpEvtSlot(a, b, t) {
      return {
        x: evtLerp(a.x, b.x, t),
        y: evtLerp(a.y, b.y, t),
        r: evtLerp(a.r, b.r, t),
        s: evtLerp(a.s, b.s, t),
        o: evtLerp(a.o, b.o, t),
        z: t < 0.5 ? a.z : b.z,
      };
    }

    let evtPrevActive = -1;

    function animateEvtGallery()
     {
         const rect = scrollContainer.getBoundingClientRect();

      // Stronger optimization for mobile
      if (rect.bottom < -400 || rect.top > window.innerHeight + 400) return;
      const containerHeight = scrollContainer.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = containerHeight - viewportHeight;
      const scrolled = -rect.top;
      const rawProgress = evtClamp(scrolled / scrollableDistance, 0, 1);

      const floatIndex = rawProgress * (EVT_TOTAL - 1);
      const baseIndex = Math.floor(floatIndex);
      const fractional = floatIndex - baseIndex;
      const easedFrac = evtEaseInOut(fractional);
      const activeIndex = Math.round(floatIndex);

      // Position each card
      evtCards.forEach((card, i) => {

const offsetA = i - baseIndex;
const offsetB = i - (baseIndex + 1);

const slotA = getEvtSlotStyle(offsetA);
const slotB = getEvtSlotStyle(offsetB);

const slot = lerpEvtSlot(slotA, slotB, easedFrac);

card.style.transform = `translate(${slot.x}vw, ${slot.y}vh) rotate(${slot.r}deg) scale(${slot.s})`;
card.style.opacity = slot.o;
card.style.zIndex = slot.z;

});
      
      // Update text panel on active card change
      if (activeIndex !== evtPrevActive) {
        evtPrevActive = activeIndex;
        const safeIndex = evtClamp(activeIndex, 0, EVT_TOTAL - 1);

        evtTextPanel.style.transition = 'opacity 0.25s, transform 0.25s';
        evtTextPanel.style.opacity = '0';
        evtTextPanel.style.transform = 'translateY(20px)';

        setTimeout(() => {
          evtTextTitle.textContent = evtCardData[safeIndex].title;
          evtTextDesc.textContent = evtCardData[safeIndex].desc;
          evtTextType.textContent = evtCardData[safeIndex].type;
          evtCounterCurrent.textContent = String(safeIndex + 1).padStart(2, '0');

          evtDots.forEach((d, di) => d.classList.toggle('active', di === safeIndex));

          evtTextPanel.style.opacity = '1';
          evtTextPanel.style.transform = 'translateY(0)';
        }, 250);
      }

      // Micro parallax on text
      const microShift = (easedFrac - 0.5) * 10;
      if (activeIndex === evtPrevActive) {
        evtTextPanel.style.transition = 'none';
        evtTextPanel.style.transform = `translateY(${microShift}px)`;
      }

      // Progress bar
      evtProgressFill.style.width = `${rawProgress * 100}%`;
    }

    window.addEventListener('scroll', () => requestAnimationFrame(animateEvtGallery), { passive: true });
    animateEvtGallery();
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
    initFirebase();
    initForms();
    initSmoothScroll();
    initEventGallery();
    document.querySelectorAll(".magic-particles").forEach(container=>{

for(let i=0;i<6;i++){

const p=document.createElement("span");

p.style.left=Math.random()*100+"%";
p.style.top=Math.random()*100+"%";
p.style.animationDelay=Math.random()*4+"s";

container.appendChild(p);

}
});

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

// ════════════════════════════════════════════════════
// ADMIN: EXPORT REGISTRATIONS TO CSV
// Call exportRegistrationsToCSV() from browser console
// ════════════════════════════════════════════════════
async function exportRegistrationsToCSV() {
  if (!db) {
    alert('Firebase is not initialized. Please check your config.');
    return;
  }
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp', 'desc').get();
    if (snapshot.empty) {
      alert('No registrations found.');
      return;
    }
    const rows = [['Name', 'Email', 'Phone', 'College', 'Event', 'Fee', 'Payment ID', 'Timestamp']];
    snapshot.forEach(doc => {
      const d = doc.data();
      const ts = d.timestamp ? d.timestamp.toDate().toISOString() : '';
      rows.push([d.name, d.email, d.phone, d.college, d.event, d.fee, d.paymentId, ts]);
    });
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'murious_registrations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export error:', err);
    alert('Failed to export registrations: ' + err.message);
  }
}
