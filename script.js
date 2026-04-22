/* ============================================================
   JULIANA APONTE STUDIO & ACADEMY — Scroll & Interaction Logic
   ============================================================ */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Current year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('navMobile');
  if (burger && navMobile) {
    const closeMenu = () => {
      burger.classList.remove('is-open');
      navMobile.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      navMobile.setAttribute('aria-hidden', 'true');
    };
    burger.addEventListener('click', () => {
      const open = !burger.classList.contains('is-open');
      burger.classList.toggle('is-open', open);
      navMobile.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      navMobile.setAttribute('aria-hidden', String(!open));
    });
    navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  const cursor = document.getElementById('cursor');
  if (cursor && !isTouch && !prefersReduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-active');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    const animateCursor = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
    document.querySelectorAll('a, button, .mod-card, .pillar, .btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Hero title word-by-word reveal ---------- */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const words = heroTitle.querySelectorAll('[data-word]');
    words.forEach((w, i) => {
      w.style.transitionDelay = `${0.2 + i * 0.06}s`;
    });
    requestAnimationFrame(() => {
      setTimeout(() => heroTitle.classList.add('is-in'), 150);
    });
  }

  /* ---------- IntersectionObserver: reveal + timeline + space clip ---------- */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    // Stagger for pillar cards & counters
    const staggerGroups = [
      { selector: '.pillars__grid [data-reveal]', step: 0.12 },
      { selector: '.counters .counter', step: 0.15 }
    ];
    staggerGroups.forEach(({ selector, step }) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.style.transitionDelay = `${i * step}s`;
      });
    });

    // Module cards reveal one by one with stronger 3D effect
    const modCards = document.querySelectorAll('.mod-card');
    const modObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          modObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -80px 0px' });
    modCards.forEach(el => modObserver.observe(el));

    // Space image clip-path reveal
    const spaceImg = document.querySelector('.space__image');
    if (spaceImg) {
      const spaceObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            spaceImg.classList.add('in-view');
            spaceObs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      spaceObs.observe(spaceImg);
    }
  } else {
    document.querySelectorAll('[data-reveal], .mod-card, .space__image').forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Animated counters ---------- */
  const counterEls = document.querySelectorAll('.counter__num');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        if (prefersReduced) {
          el.textContent = target + suffix;
        } else {
          const duration = 1800;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => countObserver.observe(el));
  }

  /* ---------- Hero PNG parallax (subtle, doesn't scale away) ---------- */
  const heroPng = document.getElementById('heroPng');
  const hero = document.querySelector('.hero');
  if (heroPng && hero && !prefersReduced) {
    let ticking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const scrolled = Math.max(0, -rect.top);
        const y = scrolled * 0.18;
        heroPng.style.transform = `translateY(${y}px)`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------- Generic data-parallax elements ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !prefersReduced) {
    let ticking = false;
    const move = () => {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translateY(${sy * speed}px)`;
      });
      ticking = false;
    };
    move();
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(move); ticking = true; }
    }, { passive: true });
  }

  /* ---------- 3D Tilt for module cards (mouse + scroll-based) ---------- */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (tiltCards.length && !prefersReduced) {

    // Mouse tilt (desktop only)
    if (!isTouch) {
      tiltCards.forEach(card => {
        const inner = card.querySelector('.mod-card__inner');
        const shine = card.querySelector('.mod-card__shine');

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const px = x / rect.width;
          const py = y / rect.height;
          const rotY = (px - 0.5) * 14;
          const rotX = (0.5 - py) * 12;
          card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0) scale(1.02)`;
          if (inner) inner.style.transform = `translateZ(30px)`;
          if (shine) {
            shine.style.setProperty('--mx', `${px * 100}%`);
            shine.style.setProperty('--my', `${py * 100}%`);
          }
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          if (inner) inner.style.transform = '';
        });
      });
    }

    // Scroll-based parallax: each card drifts slightly relative to scroll
    let ticking = false;
    const updateScrollTilt = () => {
      const vh = window.innerHeight;
      tiltCards.forEach((card) => {
        if (!card.classList.contains('in-view')) return;
        // Skip mouse-controlled state
        if (card.matches(':hover')) return;
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) / vh; // -1 .. 1
        const rotX = offset * -4;
        const translateY = offset * 18;
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) translateY(${translateY * -1}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateScrollTilt); ticking = true; }
    }, { passive: true });
    updateScrollTilt();
  }

  /* ---------- Hero gold particles ---------- */
  const particlesCanvas = document.getElementById('heroParticles');
  if (particlesCanvas && !prefersReduced) {
    const ctx = particlesCanvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let rafId = null;
    let visible = true;

    const resize = () => {
      const rect = particlesCanvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      particlesCanvas.width = w * dpr;
      particlesCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density adapts to viewport
      const target = Math.round((w * h) / 14000);
      const count = Math.max(40, Math.min(140, target));
      particles = [];
      for (let i = 0; i < count; i++) particles.push(makeParticle(true));
    };

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeParticle = (initial = false) => {
      const isBig = Math.random() < 0.18;
      const size = isBig ? rand(1.8, 3.2) : rand(0.4, 1.4);
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        size,
        vy: -rand(0.05, 0.35),
        vx: rand(-0.08, 0.08),
        life: 0,
        maxLife: rand(600, 1400),
        twinkleSpeed: rand(0.01, 0.04),
        twinklePhase: Math.random() * Math.PI * 2,
        // Gold tints — light gold to deep gold
        hue: rand(36, 44),
        sat: rand(60, 85),
        light: rand(60, 80),
        baseAlpha: rand(0.35, 0.95),
        glow: isBig
      };
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = 0.55 + 0.45 * Math.sin(p.twinklePhase);
        const lifeFade = p.life < 60 ? p.life / 60 : (p.life > p.maxLife - 80 ? Math.max(0, (p.maxLife - p.life) / 80) : 1);
        const alpha = p.baseAlpha * twinkle * lifeFade;

        if (p.glow) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
          grd.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`);
          grd.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha * 0.25})`);
          grd.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.y < -10 || p.x < -20 || p.x > w + 20 || p.life > p.maxLife) {
          particles[i] = makeParticle(false);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => { if (!rafId && visible) rafId = requestAnimationFrame(tick); };
    const stop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };

    resize();
    start();

    window.addEventListener('resize', () => {
      stop(); resize(); start();
    });

    // Pause when hero is offscreen
    if ('IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          visible = e.isIntersecting;
          if (visible) start(); else stop();
        });
      }, { threshold: 0 });
      heroObs.observe(particlesCanvas);
    }
  }

  /* ---------- Smooth anchor scroll with navbar offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 4;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
})();
