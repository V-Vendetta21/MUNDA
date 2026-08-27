/* ============================================================
   MUNDA — Official Website · main.js
   Navigation, scroll animations, counters, timeline, explorer,
   and the configurable game launcher.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Configurable game launcher ----------
     GAME_URL and USE_EMBEDDED_GAME are defined in index.html.
     The game plays in a full-screen overlay; cross-origin URLs
     fall back to opening in a new tab. */
  function isSameOrigin(url) {
    if (!url || url === 'YOUR_GAME_URL_HERE') return false;
    if (url.charAt(0) === '/' || url.indexOf('./') === 0 || url.indexOf('../') === 0 || !/^https?:/.test(url)) return true;
    try { return new URL(url, location.href).origin === location.origin; }
    catch (e) { return false; }
  }

  var overlay = document.getElementById('game-overlay');
  var overlayBody = document.getElementById('game-overlay-body');
  var gameExit = document.getElementById('game-exit');
  var gameLoaded = false;
  var lastTrigger = null;

  function enterGame(e) {
    if (e && e.preventDefault) e.preventDefault();
    var url = window.GAME_URL;
    if (!url || url === 'YOUR_GAME_URL_HERE') return;
    if (!window.USE_EMBEDDED_GAME || !isSameOrigin(url)) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    lastTrigger = (e && e.currentTarget) ? e.currentTarget : null;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('game-open');
    if (!gameLoaded) {
      var f = document.createElement('iframe');
      f.setAttribute('src', url);
      f.setAttribute('title', 'MUNDA wire-assembly game');
      f.setAttribute('allow', 'fullscreen');
      overlayBody.appendChild(f);
      gameLoaded = true;
    }
    if (gameExit) gameExit.focus();
  }

  function exitGame() {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('game-open');
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  }

  var playTriggers = document.querySelectorAll('#nav-play, #gp-launch, #cta-play, #game-fab');
  Array.prototype.slice.call(playTriggers).forEach(function (b) {
    b.addEventListener('click', enterGame);
  });
  if (gameExit) gameExit.addEventListener('click', exitGame);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) exitGame();
  });

  /* ---------- Navigation ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('nav-burger');
  var navLinks = document.getElementById('nav-links');

  function onScrollNav() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  Array.prototype.slice.call(navLinks.querySelectorAll('a')).forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll spy ---------- */
  var sections = ['home', 'technology', 'manufacturing', 'kosova', 'innovation', 'game'];
  var linkBySection = {};
  sections.forEach(function (id) {
    var link = navLinks.querySelector('[data-nav="' + id + '"]');
    if (link) linkBySection[id] = link;
  });
  function spy() {
    var vh = window.innerHeight * 0.4;
    var current = 'home';
    var best = -1;
    sections.forEach(function (id) {
      var el = document.getElementById(id === 'home' ? 'top' : id);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top <= vh && r.top > best) { best = r.top; current = id; }
    });
    sections.forEach(function (id) {
      if (linkBySection[id]) linkBySection[id].classList.toggle('active', id === current);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // reveal on intersection, or if the element has been scrolled above the
        // viewport (robust to anchor jumps / instant scrolls)
        if (en.isIntersecting || en.boundingClientRect.top < 0) {
          var delay = parseInt(en.target.getAttribute('data-reveal-delay') || '0', 10);
          en.target.style.transitionDelay = (reduceMotion ? 0 : delay) + 'ms';
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counted = false;
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = reduceMotion ? 1 : 1100;
    var start = performance.now();
    function fmt(v) { return prefix + v.toLocaleString('en-US') + suffix; }
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
  }
  var statNums = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !counted) {
          counted = true;
          statNums.forEach(animateCount);
          statIO.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { statIO.observe(el); });
  }

  /* ---------- Process timeline illumination ---------- */
  var timeline = document.querySelector('.timeline');
  var tlProgress = document.getElementById('tl-progress');
  var stages = Array.prototype.slice.call(document.querySelectorAll('.tstage[data-stage]'));
  if (timeline && tlProgress && 'IntersectionObserver' in window) {
    var tlIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tlIO.disconnect();
        var started = false;
        function update() {
          var rect = timeline.getBoundingClientRect();
          var vh = window.innerHeight;
          var total = rect.height;
          var traveled = Math.max(0, Math.min(1, (vh * 0.55 - rect.top) / total));
          var pct = Math.max(0, Math.min(1, traveled * 1.15));
          if (!started && pct > 0.02) { started = true; }
          if (tlProgress) tlProgress.style.width = (pct * 100).toFixed(1) + '%';
          var activeIndex = Math.min(stages.length - 1, Math.floor(pct * stages.length));
          stages.forEach(function (s, i) {
            s.classList.toggle('active', i <= activeIndex);
          });
          if (pct >= 1) { window.removeEventListener('scroll', update); }
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
      });
    }, { threshold: 0.05 });
    tlIO.observe(timeline);
  }

  /* ---------- Technology explorer ---------- */
  var xDesc = document.getElementById('x-desc');
  var xInfo = {
    textile: '<b>TEXTILE</b> — Technical fabrics form the flexible substrate that carries light across the interior.',
    led: '<b>LED</b> — Miniature LEDs are embedded directly into the textile structure to emit light.',
    flexible: '<b>FLEXIBLE STRUCTURE</b> — Unlike conventional rigid lighting components, textile lighting can be integrated into flexible interior structures.',
    electronics: '<b>ELECTRONICS</b> — Electronic integration connects power and control to the lighting elements.'
  };
  function selectExplorer(name) {
    var nodes = document.querySelectorAll('.xnode');
    var btns = document.querySelectorAll('.x-btn');
    nodes.forEach(function (n) { n.classList.toggle('sel', n.getAttribute('data-xn') === name); });
    btns.forEach(function (b) { b.classList.toggle('sel', b.getAttribute('data-xn') === name); });
    if (xDesc && xInfo[name]) xDesc.innerHTML = xInfo[name];
  }
  var xnNodes = document.querySelectorAll('.xnode');
  xnNodes.forEach(function (n) {
    var click = function () { selectExplorer(n.getAttribute('data-xn')); };
    n.addEventListener('click', click);
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(); } });
    n.setAttribute('tabindex', '0');
    n.setAttribute('role', 'button');
  });
  document.querySelectorAll('.x-btn').forEach(function (b) {
    b.addEventListener('click', function () { selectExplorer(b.getAttribute('data-xn')); });
  });

  /* ---------- Loom private AI guide ---------- */
  var loomToggle = document.getElementById('loom-toggle');
  var loomPanel = document.getElementById('loom-panel');
  var loomClose = document.getElementById('loom-close');
  var loomForm = document.getElementById('loom-form');
  var loomInput = document.getElementById('loom-input');
  var loomSend = document.getElementById('loom-send');
  var loomMessages = document.getElementById('loom-messages');
  var loomHistory = [];

  function setLoomOpen(open) {
    if (!loomPanel || !loomToggle) return;
    loomPanel.hidden = !open;
    loomToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && loomInput) setTimeout(function () { loomInput.focus(); }, 40);
  }
  function appendLoomMessage(role, text, typing) {
    var item = document.createElement('div');
    item.className = 'loom-message loom-message--' + role + (typing ? ' loom-message--typing' : '');
    var label = document.createElement('b');
    label.textContent = role === 'user' ? 'YOU' : 'LOOM';
    var copy = document.createElement('p');
    copy.textContent = text;
    item.appendChild(label); item.appendChild(copy);
    loomMessages.appendChild(item);
    loomMessages.scrollTop = loomMessages.scrollHeight;
    return item;
  }
  async function askLoom(question) {
    var message = String(question || '').trim();
    if (!message || !loomForm || loomForm.dataset.busy === 'true') return;
    loomForm.dataset.busy = 'true'; loomSend.disabled = true;
    appendLoomMessage('user', message);
    loomInput.value = '';
    var typing = appendLoomMessage('assistant', 'Thinking', true);
    try {
      var response = await fetch('/api/loom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ message: message, history: loomHistory.slice(-8) })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || 'Loom is unavailable.');
      typing.remove();
      appendLoomMessage('assistant', data.reply);
      loomHistory.push({ role: 'user', content: message }, { role: 'assistant', content: data.reply });
      loomHistory = loomHistory.slice(-8);
    } catch (error) {
      typing.remove();
      appendLoomMessage('assistant', error.message || 'Loom is temporarily unavailable.');
    } finally {
      loomForm.dataset.busy = 'false'; loomSend.disabled = false; loomInput.focus();
    }
  }
  if (loomToggle) loomToggle.addEventListener('click', function () { setLoomOpen(loomPanel.hidden); });
  if (loomClose) loomClose.addEventListener('click', function () { setLoomOpen(false); loomToggle.focus(); });
  if (loomForm) loomForm.addEventListener('submit', function (e) { e.preventDefault(); askLoom(loomInput.value); });
  if (loomInput) loomInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askLoom(loomInput.value); }
  });
  document.querySelectorAll('[data-loom-question]').forEach(function (button) {
    button.addEventListener('click', function () { askLoom(button.getAttribute('data-loom-question')); });
  });
  document.addEventListener('click', function (e) {
    if (loomPanel && !loomPanel.hidden && !loomPanel.contains(e.target) && !loomToggle.contains(e.target)) setLoomOpen(false);
  });

  /* ---------- Hero cursor parallax ---------- */
  var hero = document.querySelector('.hero');
  var heroWave = document.querySelector('.hero-wave--persp');
  if (hero && heroWave && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var raf = null;
    hero.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        heroWave.style.transform = 'perspective(1300px) rotateX(' + (7 - ny * 3).toFixed(2) + 'deg) rotateY(' + (-6 + nx * 4).toFixed(2) + 'deg) scale(1.12) translate(' + (nx * 14).toFixed(1) + 'px,' + (ny * 10).toFixed(1) + 'px)';
      });
    });
  }

  /* ---------- Smooth anchor scroll fallback for older browsers ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); el.scrollIntoView(); }
      });
    });
  }
})();
