/* ============================================================
   Victor Henrique Ramos — Portfolio · main.js
   i18n · nav · reveal · count-up · rotator · print
   + intro · canvas · parallax · tilt/spotlight · scramble · magnetic · cursor
   ============================================================ */
(function () {
  'use strict';

  // movimento: override do usuário (localStorage) > preferência do SO
  let motionPref = null;
  try { motionPref = localStorage.getItem('vhr-motion'); } catch (e) {}
  const osReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduceMotion = motionPref ? (motionPref === 'reduced') : osReduce;
  document.documentElement.classList.toggle('rm', reduceMotion);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const body = document.body;

  // botão "efeitos": alterna e recarrega (re-inicia os sistemas no modo escolhido)
  (function motionToggle() {
    const btn = document.getElementById('motion-toggle');
    if (!btn) return;
    const on = !reduceMotion;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? 'Efeitos: ligados' : 'Efeitos: reduzidos';
    btn.addEventListener('click', function () {
      try {
        const next = on ? 'reduced' : 'full';
        localStorage.setItem('vhr-motion', next);
        if (next === 'full') sessionStorage.removeItem('vhr-intro'); // toca a intro de novo
      } catch (e) {}
      location.reload();
    });
  })();

  /* ========================================================
     i18n (PT/EN)
     ======================================================== */
  const STORAGE_KEY = 'vhr-lang';
  const i18nNodes = document.querySelectorAll('[data-pt]');
  const rotatorWords = {
    pt: ['Arquitetura de Software', 'IA Aplicada', 'Agentes & MCP', 'DevOps & Automação'],
    en: ['Software Architecture', 'Applied AI', 'Agents & MCP', 'DevOps & Automation'],
  };
  let currentLang = 'pt';

  /* rotator (declarado ANTES de applyLang, que chama resetRotator) */
  const rotator = document.getElementById('rotator');
  if (rotator) rotator.style.transition = 'opacity .22s ease';
  let rotIdx = 0, rotTimer = null;
  function setRotator(t) { if (rotator) rotator.textContent = t; }
  function resetRotator() {
    const w = rotatorWords[currentLang];
    rotIdx = 0; setRotator(w[0]);
    if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
    if (reduceMotion) return;
    rotTimer = setInterval(function () {
      const ww = rotatorWords[currentLang];
      rotIdx = (rotIdx + 1) % ww.length;
      if (rotator) {
        rotator.style.opacity = '0';
        setTimeout(function () { setRotator(ww[rotIdx]); rotator.style.opacity = '1'; }, 220);
      }
    }, 2600);
  }

  function applyLang(lang) {
    currentLang = (lang === 'en') ? 'en' : 'pt';
    document.documentElement.lang = (currentLang === 'en') ? 'en' : 'pt-BR';
    i18nNodes.forEach(function (el) {
      const v = el.getAttribute('data-' + currentLang);
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      const on = b.dataset.lang === currentLang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {}
    resetRotator();
  }
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.dataset.lang); });
  });
  let savedLang = null;
  try { savedLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (!savedLang) savedLang = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'pt';
  applyLang(savedLang);

  /* ========================================================
     nav: scrolled + mobile menu
     ======================================================== */
  const nav = document.getElementById('nav');
  const onNavScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

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

  /* ========================================================
     reveal on scroll
     ======================================================== */
  const revealEls = Array.prototype.slice.call(document.querySelectorAll(
    '.section, .stat, .hero-card, .stack-card, .tl-item, .project-featured, .project-card'
  ));
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    let rvTick = false;
    function checkReveal() {
      const vh = window.innerHeight;
      for (let i = 0; i < revealEls.length; i++) {
        const el = revealEls[i];
        if (el.classList.contains('visible')) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('visible');
      }
      rvTick = false;
    }
    function queueReveal() { if (!rvTick) { rvTick = true; requestAnimationFrame(checkReveal); } }
    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    window.addEventListener('load', checkReveal);
    checkReveal();
    setTimeout(checkReveal, 300);   // recheck após a intro liberar o scroll
    // varredura de segurança: pega o que entrou no viewport sem disparar evento
    // (ex.: último bloco quando o scroll satura no fundo). Para quando tudo revelou.
    const settle = setInterval(function () {
      checkReveal();
      if (!document.querySelector('.reveal:not(.visible)')) clearInterval(settle);
    }, 300);
    setTimeout(function () { clearInterval(settle); }, 12000);
  }

  /* ========================================================
     count-up stats
     ======================================================== */
  const statNums = document.querySelectorAll('.stat-num');
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1300, start = performance.now();
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
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { sio.observe(el); });
  } else {
    statNums.forEach(function (el) { el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || ''); });
  }

  /* ========================================================
     magnetic buttons
     ======================================================== */
  if (!coarse && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)';
      el.addEventListener('pointermove', function (ev) {
        const r = el.getBoundingClientRect();
        const x = ev.clientX - (r.left + r.width / 2);
        const y = ev.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.28).toFixed(1) + 'px,' + (y * 0.38).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ========================================================
     tilt 3D + spotlight
     ======================================================== */
  if (!coarse && !reduceMotion) {
    const tiltEls = document.querySelectorAll('.hero-card, .stack-card, .project-card, .project-featured');
    tiltEls.forEach(function (el) {
      el.classList.add('tilt');
      const MAX = 8;
      el.addEventListener('pointerenter', function () { el.classList.add('tilting'); });
      el.addEventListener('pointermove', function (ev) {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width;
        const py = (ev.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((px - 0.5) * 2 * MAX).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((0.5 - py) * 2 * MAX).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ========================================================
     cursor glow
     ======================================================== */
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && !coarse && !reduceMotion) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy, raf = null;
    function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursorGlow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) { raf = requestAnimationFrame(loop); }
      else { raf = null; }
    }
    window.addEventListener('pointermove', function (ev) {
      tx = ev.clientX; ty = ev.clientY;
      if (!body.classList.contains('cursor-on')) body.classList.add('cursor-on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ========================================================
     parallax (scroll)
     ======================================================== */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let pTick = false;
    function applyParallax() {
      const y = window.scrollY;
      parallaxEls.forEach(function (el) {
        const s = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = 'translate3d(0,' + (y * s).toFixed(1) + 'px,0)';
      });
      pTick = false;
    }
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(applyParallax); }
    }, { passive: true });
    applyParallax();
  }

  /* ========================================================
     canvas — rede de partículas reativa ao mouse
     ======================================================== */
  (function canvasFX() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let parts = [], mouse = { x: -9999, y: -9999 }, anim = null, paused = false;

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(Math.round((w * h) / 19000), coarse ? 36 : 92));
      parts = [];
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    }

    const LINK = 130, LINK2 = LINK * LINK, MR = 150, MR2 = MR * MR;

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // repulsão suave do mouse
        const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm2 = dxm * dxm + dym * dym;
        if (dm2 < MR2) {
          const f = (1 - Math.sqrt(dm2) / MR) * 0.6;
          p.x += (dxm / (Math.sqrt(dm2) || 1)) * f;
          p.y += (dym / (Math.sqrt(dm2) || 1)) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150,200,255,.55)';
        ctx.fill();

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            const a = (1 - d2 / LINK2) * 0.5;
            ctx.strokeStyle = 'rgba(34,211,238,' + a.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        // linha até o mouse
        if (dm2 < MR2) {
          const a = (1 - dm2 / MR2) * 0.5;
          ctx.strokeStyle = 'rgba(167,139,250,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      if (!paused) anim = requestAnimationFrame(frame);
    }

    let rTick = false;
    window.addEventListener('resize', function () {
      if (!rTick) { rTick = true; requestAnimationFrame(function () { resize(); rTick = false; }); }
    });
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerout', function () { mouse.x = -9999; mouse.y = -9999; });
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
      if (!paused && !anim) anim = requestAnimationFrame(frame);
      if (paused && anim) { cancelAnimationFrame(anim); anim = null; }
    });

    resize();
    anim = requestAnimationFrame(frame);
  })();

  /* ========================================================
     scramble (nome do hero)
     ======================================================== */
  const GLYPHS = '!<>-_\\/[]{}=+*^?#________';
  function scrambleEl(el) {
    const finalText = el.dataset.final || el.textContent;
    if (reduceMotion) { el.textContent = finalText; return; }
    const len = finalText.length;
    const dur = 800 + len * 30, start = performance.now();
    el.classList.add('is-scrambling');
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const reveal = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        if (i < reveal || finalText[i] === ' ') out += finalText[i];
        else out += GLYPHS[(Math.floor(now / 40) + i) % GLYPHS.length];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick);
      else { el.textContent = finalText; el.classList.remove('is-scrambling'); }
    }
    requestAnimationFrame(tick);
  }
  function runScramble() { document.querySelectorAll('.scramble').forEach(scrambleEl); }

  /* ========================================================
     intro / abertura (com fail-safe)
     ======================================================== */
  (function intro() {
    const overlay = document.getElementById('intro');
    let done = false;
    let seen = false;
    try { seen = sessionStorage.getItem('vhr-intro') === '1'; } catch (e) {}

    function reveal() {
      body.classList.add('ready');
      runScramble();
    }
    function finish() {
      if (done) return; done = true;
      try { sessionStorage.setItem('vhr-intro', '1'); } catch (e) {}
      body.classList.remove('intro-active');
      if (overlay) {
        overlay.classList.add('done');
        const kill = function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
        overlay.addEventListener('transitionend', kill, { once: true });
        setTimeout(kill, 1200);
      }
      reveal();
    }

    // sem intro: reduced-motion, sem overlay, ou já visto nesta sessão
    if (!overlay || reduceMotion || seen) {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      reveal();
      return;
    }

    body.classList.add('intro-active');
    // pular ao interagir
    const skip = function () { finish(); };
    overlay.addEventListener('click', skip);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') skip(); }, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    window.addEventListener('touchstart', skip, { once: true, passive: true });

    // tempo natural + fail-safe duro
    setTimeout(finish, 1900);
    setTimeout(finish, 4000);
  })();

  /* ========================================================
     download CV (print -> PDF)
     ======================================================== */
  function printCV() { window.print(); }
  ['download-cv', 'download-cv-2'].forEach(function (id) {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', printCV);
  });

  /* ========================================================
     ano no rodapé
     ======================================================== */
  const yEl = document.getElementById('year');
  if (yEl) { const n = new Date(); if (!isNaN(n.getFullYear())) yEl.textContent = String(n.getFullYear()); }
})();
