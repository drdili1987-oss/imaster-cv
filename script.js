/* ============================================
   imaster Portfolio — script.js
   Dilmurod | AI Ijodkor
   ============================================ */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // ===== INTRO: preloader → curtain lifts → hero rises from bottom =====
  const afterIntro = [];
  const onIntroDone = (fn) => (root.classList.contains('intro-done') ? fn() : afterIntro.push(fn));
  const finishIntro = () => {
    root.classList.add('intro-done');
    afterIntro.splice(0).forEach((fn) => fn());
  };

  if (reduceMotion) {
    root.classList.add('loaded');
    finishIntro();
  } else {
    const bar = $('#plBar');
    const count = $('#plCount');
    const MIN_MS = 1500;   // let the logo animation play
    const MAX_MS = 4500;   // don't hold visitors hostage on slow networks
    const t0 = performance.now();
    let pageLoaded = document.readyState === 'complete';
    let shown = 0;
    window.addEventListener('load', () => { pageLoaded = true; }, { once: true });

    const step = (now) => {
      const elapsed = now - t0;
      const done = (pageLoaded && elapsed >= MIN_MS) || elapsed >= MAX_MS;
      const target = done ? 100 : Math.min(90, (elapsed / MIN_MS) * 90);
      shown += (target - shown) * (done ? 0.25 : 0.12);
      if (done && shown > 99.5) shown = 100;
      bar.style.transform = `scaleX(${shown / 100})`;
      count.textContent = Math.round(shown);
      if (shown < 100) { requestAnimationFrame(step); return; }
      setTimeout(() => {
        root.classList.add('loaded');
        setTimeout(finishIntro, 1400);
      }, 200);
    };
    requestAnimationFrame(step);
  }

  // ===== NAVBAR SCROLL STATE =====
  const navbar = $('#navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== HAMBURGER MENU =====
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  $$('.nav-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  // ===== ACTIVE NAV LINK =====
  const navMap = new Map($$('.nav-link').map((a) => [a.getAttribute('href').slice(1), a]));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove('active'));
      const link = navMap.get(entry.target.id);
      if (link) link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => navObserver.observe(s));

  // ===== TYPEWRITER =====
  const typewriter = $('#typewriter');
  const texts = ['AI Ijodkor', 'Prompt Engineer', 'Video Yaratuvchi', 'Veb Dasturchi', 'Musiqa Yaratuvchi'];
  if (typewriter && !reduceMotion) {
    let textIndex = 0, charIndex = 0, deleting = false;
    const tick = () => {
      const current = texts[textIndex];
      charIndex += deleting ? -1 : 1;
      typewriter.textContent = current.slice(0, charIndex);
      let delay = deleting ? 60 : 90;
      if (!deleting && charIndex === current.length) { deleting = true; delay = 2000; }
      else if (deleting && charIndex === 0) { deleting = false; textIndex = (textIndex + 1) % texts.length; delay = 400; }
      setTimeout(tick, delay);
    };
    onIntroDone(() => { typewriter.textContent = ''; tick(); });
  }

  // ===== COUNTERS =====
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const duration = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.stat-num', entry.target).forEach(animateCount);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  onIntroDone(() => $$('.hero-stats').forEach((el) => statObserver.observe(el)));

  // ===== PARTICLE CANVAS (pauses when hero is off-screen) =====
  const canvas = $('#particleCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const hero = $('#home');
    const COUNT = window.innerWidth < 640 ? 30 : 60;
    const LINK = 120;
    let particles = [];
    let running = false;
    let rafId = 0;

    const resize = () => {
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
    };
    const makeParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '136,63,255' : '0,212,255',
    });

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) Object.assign(p, makeParticle());
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      }
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(136,63,255,${(1 - Math.sqrt(d2) / LINK) * 0.15})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      if (running) rafId = requestAnimationFrame(frame);
    };

    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
    window.addEventListener('resize', resize, { passive: true });
    new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      cancelAnimationFrame(rafId);
      if (running) rafId = requestAnimationFrame(frame);
    }).observe(hero);
  }

  // ===== SCROLL REVEAL =====
  const revealEls = $$('.section-tag, .section-title, .section-desc, .gallery-subtitle, .filter-tabs, .skill-card, .project-card, .timeline-item, .contact-card, .tool-card, .highlight-item, .about-lead, .about-text > p, .compare, .photo-item, .contact-form');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('visible'));
  } else {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`;
        el.classList.add('visible');
        // drop the stagger delay so hover effects stay instant afterwards
        setTimeout(() => { el.style.transitionDelay = ''; }, 1400);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ===== PROJECT FILTER =====
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hide', !show);
        if (show) card.classList.add('visible');
      });
    });
  });

  // ===== SLIDERS (run only while visible) =====
  $$('.slider').forEach((slider) => {
    const slides = $$('.slide-img', slider);
    if (slides.length < 2 || reduceMotion) return;
    const interval = parseInt(slider.dataset.interval, 10) || 2500;
    let index = 0;
    let timer = null;
    const next = () => {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    };
    new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      timer = entry.isIntersecting ? setInterval(next, interval) : null;
    }).observe(slider);
  });

  // ===== AUDIO PLAYER =====
  const audio = $('#sunoAudio');
  const audioBtn = $('#audioPlayBtn');
  const audioBar = $('#audioBar');
  const audioProgress = $('#audioProgress');
  if (audio && audioBtn) {
    const sync = () => { audioBtn.textContent = audio.paused ? '▶ Tinglash' : '⏸ Pauza'; };
    audioBtn.addEventListener('click', () => {
      if (audio.paused) audio.play().catch(() => { audioBtn.textContent = '⚠ Xatolik'; });
      else audio.pause();
    });
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) audioBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });
    audio.addEventListener('ended', () => { audioBar.style.width = '0%'; sync(); });
    audioProgress.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = audioProgress.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  }

  // ===== BEFORE / AFTER COMPARE =====
  $$('.compare').forEach((fig) => {
    const range = $('.compare-range', fig);
    const update = () => fig.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  // ===== LIGHTBOX (images + videos) =====
  const lightbox = $('#lightbox');
  const lbBody = $('#lbBody');
  const lbCaption = $('#lbCaption');
  const lbClose = $('#lbClose');
  let lastFocus = null;

  const openLightbox = (node, caption) => {
    lastFocus = document.activeElement;
    lbBody.replaceChildren(node);
    lbCaption.textContent = caption || '';
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    if (audio && !audio.paused && node.tagName === 'VIDEO') audio.pause();
    lbClose.focus();
  };
  const closeLightbox = () => {
    const media = $('video', lbBody);
    if (media) { media.pause(); media.removeAttribute('src'); media.load(); }
    lbBody.replaceChildren();
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  };

  document.addEventListener('click', (e) => {
    const imgTrigger = e.target.closest('[data-lightbox]');
    if (imgTrigger) {
      const img = document.createElement('img');
      img.src = imgTrigger.dataset.lightbox;
      img.alt = imgTrigger.dataset.caption || '';
      openLightbox(img, imgTrigger.dataset.caption);
      return;
    }
    const videoTrigger = e.target.closest('[data-video]');
    if (videoTrigger) {
      const video = document.createElement('video');
      video.src = videoTrigger.dataset.video;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      const poster = $('img', videoTrigger);
      if (poster) video.poster = poster.src;
      openLightbox(video, videoTrigger.dataset.caption);
    }
  });
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  // ===== CONTACT FORM → mailto (no backend) =====
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = 'Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring.';
      status.className = 'form-status error';
      form.reportValidity();
      return;
    }
    // form.name is the <form>'s own name attribute, so read fields via elements.namedItem
    const field = (n) => form.elements.namedItem(n).value.trim();
    const name = field('name');
    const email = field('email');
    const message = field('message');
    const subject = `Portfolio orqali xabar — ${name}`;
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:drdili1987@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Pochta ilovangiz ochildi — xatni u yerdan yuboring.';
    status.className = 'form-status ok';
  });

  // ===== FOOTER YEAR =====
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
