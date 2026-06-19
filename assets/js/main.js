/* ============================================================
   Victor Henrique Ramos — Portfolio · main.js
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n (PT/EN) ---------- */
  const STORAGE_KEY = 'vhr-lang';
  const i18nNodes = document.querySelectorAll('[data-pt]');
  const rotatorWords = {
    pt: ['Arquitetura de Software', 'IA Aplicada', 'Agentes & MCP', 'DevOps & Automação'],
    en: ['Software Architecture', 'Applied AI', 'Agents & MCP', 'DevOps & Automation'],
  };
  let currentLang = 'pt';

  function applyLang(lang) {
    currentLang = (lang === 'en') ? 'en' : 'pt';
    document.documentElement.lang = (currentLang === 'en') ? 'en' : 'pt-BR';

    i18nNodes.forEach(function (el) {
      const val = el.getAttribute('data-' + currentLang);
      if (val !== null) el.textContent = val;
    });

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      const active = b.dataset.lang === currentLang;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {}
    resetRotator();
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.dataset.lang); });
  });

  let savedLang = null;
  try { savedLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (!savedLang) {
    savedLang = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'pt';
  }
  applyLang(savedLang);

  /* ---------- nav: scrolled + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuToggle = document.getElementById('menu-toggle');
  menuToggle.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(
    '.section, .stat, .hero-card, .stack-card, .tl-item, .project-featured, .project-card'
  );
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1300; const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); sio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { sio.observe(el); });
  } else {
    statNums.forEach(function (el) { el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || ''); });
  }

  /* ---------- rotator (hero role) ---------- */
  const rotator = document.getElementById('rotator');
  let rotIdx = 0, rotTimer = null;
  function setRotator(text) { if (rotator) rotator.textContent = text; }
  function resetRotator() {
    const words = rotatorWords[currentLang];
    rotIdx = 0;
    setRotator(words[0]);
    if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
    if (reduceMotion) return;
    rotTimer = setInterval(function () {
      const w = rotatorWords[currentLang];
      rotIdx = (rotIdx + 1) % w.length;
      if (rotator) {
        rotator.style.opacity = '0';
        setTimeout(function () { setRotator(w[rotIdx]); rotator.style.opacity = '1'; }, 220);
      }
    }, 2600);
  }
  if (rotator) { rotator.style.transition = 'opacity .22s ease'; }

  /* ---------- download CV (print -> PDF) ---------- */
  function printCV() { window.print(); }
  ['download-cv', 'download-cv-2'].forEach(function (id) {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', printCV);
  });

  /* ---------- year ---------- */
  const y = document.getElementById('year');
  if (y) {
    const now = new Date();
    if (!isNaN(now.getFullYear())) y.textContent = String(now.getFullYear());
  }
})();
