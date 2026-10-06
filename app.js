/* =====================================================================
   AUTO NÉRON IMPERIUM — app.js
   Moteur du site : hydratation du contenu (content.js), animations,
   parallaxe, lightbox, menu mobile, scrollspy, flottants.
   ===================================================================== */
(function () {
  'use strict';

  var C = window.CONTENT || {};
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.remove('no-js');

  /* ---------------------------------------------------------------
     1. HYDRATATION DU CONTENU (tout vient de content.js)
     --------------------------------------------------------------- */
  function setTxt(sel, val) { var el = q(sel); if (el && val) el.textContent = val; }

  function hydrateTexts() {
    var a = C.accueil || {};
    setTxt('#hero-titre', a.titre);
    setTxt('#hero-slogan', a.slogan);
    setTxt('#hero-presentation', a.presentation);
    if (a.heroImage) {
      var hi = q('#hero-img');
      if (hi) { hi.src = a.heroImage.image; hi.alt = a.heroImage.details || a.heroImage.image; }
      setTxt('#hero-caption', a.heroImage.details);
    }
    setTxt('#apropos-valeurs', (C.apropos || {}).valeurs);
    setTxt('#cta-text', C.cta);

    var ct = C.contact || {};
    if (ct.telephone) {
      var box = q('#telephones');
      if (box) {
        box.innerHTML = ct.telephone.split('|').map(function (t) {
          var label = t.trim();
          var tel = '+225' + label.replace(/\D/g, '');
          return '<a href="tel:' + tel + '">' + esc(label) + '</a>';
        }).join('');
      }
    }
    if (ct.email) {
      var em = q('#email-link');
      if (em) { em.textContent = ct.email; em.href = 'mailto:' + ct.email; }
    }
    setTxt('#adresse', ct.adresse);

    if (ct.banniere) {
      var bi = q('#contact-banniere img');
      if (bi) { bi.src = ct.banniere.image; bi.alt = ct.banniere.details || 'Bannière Auto Néron Imperium'; }
      setTxt('#contact-banniere .legende', ct.banniere.details);
    }
    var an = q('#annee');
    if (an) an.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------
     2. RENDU DES LISTES (services, galerie, visuels, réseaux)
     --------------------------------------------------------------- */
  function renderServices() {
    var grid = q('#services-grid');
    var list = C.services;
    if (!grid || !Array.isArray(list) || !list.length) return;
    grid.innerHTML = list.map(function (s, i) {
      return '' +
        '<article class="service-card" data-reveal style="--d:' + ((i % 3) * 0.08) + 's">' +
          '<div class="fig-img"><span class="service-num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<img src="' + esc(s.image) + '" alt="' + esc(s.details || s.titre) + '" loading="lazy"></div>' +
          '<div class="service-body">' +
            '<h3>' + esc(s.titre) + '</h3>' +
            '<p class="desc">' + esc(s.description) + '</p>' +
            '<figcaption class="legende">' + esc(s.details) + '</figcaption>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function renderGallery() {
    var grid = q('#galerie-grid');
    var list = (C.catalogue || {}).galerie;
    if (!grid || !Array.isArray(list) || !list.length) return;
    grid.innerHTML = list.map(function (g, i) {
      return '' +
        '<figure class="gal-card" data-reveal style="--d:' + ((i % 3) * 0.07) + 's" tabindex="0" role="button" ' +
          'aria-label="Agrandir : ' + esc(g.details) + '">' +
          '<div class="zoom-wrap"><img src="' + esc(g.image) + '" alt="' + esc(g.details) + '" loading="lazy"></div>' +
          '<figcaption class="legende">' + esc(g.details) + '</figcaption>' +
        '</figure>';
    }).join('');
  }

  function renderAboutVisuals() {
    var wrap = q('#apropos-visuels');
    var list = (C.apropos || {}).visuels;
    if (!wrap || !Array.isArray(list) || !list.length) return;
    wrap.innerHTML = list.map(function (v, i) {
      return '' +
        '<figure data-reveal="right" style="--d:' + (i * 0.15) + 's">' +
          '<img src="' + esc(v.image) + '" alt="' + esc(v.details) + '" loading="lazy">' +
          '<figcaption class="legende">' + esc(v.details) + '</figcaption>' +
        '</figure>';
    }).join('');
  }

  function renderSocials() {
    var list = (C.contact || {}).reseaux;
    if (!Array.isArray(list) || !list.length) return;
    var main = q('#reseaux');
    if (main) {
      main.innerHTML = list.map(function (r) {
        return '<a class="reseau" style="background:' + esc(r.couleur) + '" href="' + esc(r.lien) +
          '" target="_blank" rel="noopener"><img src="' + esc(r.logo) + '" alt="">' + esc(r.nom) + '</a>';
      }).join('');
    }
    var foot = q('#footer-reseaux');
    if (foot) {
      foot.innerHTML = list.map(function (r) {
        return '<a style="background:' + esc(r.couleur) + '" href="' + esc(r.lien) +
          '" target="_blank" rel="noopener" aria-label="' + esc(r.nom) + '"><img src="' + esc(r.logo) + '" alt=""></a>';
      }).join('');
    }
    var wa = list.filter(function (r) { return /whatsapp/i.test(r.nom); })[0];
    var fl = q('#wa-float');
    if (wa && fl) fl.href = wa.lien;
  }

  /* ---------------------------------------------------------------
     3. ANIMATIONS D'APPARITION (IntersectionObserver)
     --------------------------------------------------------------- */
  function initReveals() {
    var els = qa('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     4. HEADER, SCROLLSPY, MENU MOBILE
     --------------------------------------------------------------- */
  function initHeader() {
    var header = q('#header');
    var burger = q('#burger');
    var btnTop = q('#btn-top');

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 30);
      if (btnTop) btnTop.classList.toggle('show', y > 650);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger && header) {
      burger.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      });
      qa('#nav a').forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('menu-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    if (btnTop) {
      btnTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    /* Scrollspy : lien actif dans le nav */
    var links = qa('#nav a.nav-link');
    var sections = links.map(function (a) { return q(a.getAttribute('href')); }).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (a) {
              a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
            });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------------------------------------------------------------
     5. PARALLAXE (bandeau central)
     --------------------------------------------------------------- */
  function initParallax() {
    var els = qa('[data-parallax]');
    if (!els.length || reduceMotion) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var host = el.parentElement.getBoundingClientRect();
        if (host.bottom < -100 || host.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        var delta = (host.top + host.height / 2 - vh / 2) * speed;
        el.style.setProperty('--py', delta.toFixed(1) + 'px');
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------
     6. LIGHTBOX GALERIE
     --------------------------------------------------------------- */
  function initLightbox() {
    var lb = q('#lightbox');
    var lbImg = q('#lb-img');
    var lbCap = q('#lb-cap');
    if (!lb || !lbImg) return;
    var items = [];
    var current = 0;

    function collect() {
      items = qa('#galerie-grid .gal-card').map(function (card) {
        var img = q('img', card);
        var cap = q('figcaption', card);
        return { src: img ? img.getAttribute('src') : '', cap: cap ? cap.textContent : '' };
      });
    }

    function show(i) {
      if (!items.length) return;
      current = (i + items.length) % items.length;
      lbImg.src = items[current].src;
      lbImg.alt = items[current].cap;
      lbCap.textContent = items[current].cap;
    }
    function open(i) {
      collect();
      show(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      var c = q('.lb-close', lb);
      if (c) c.focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
    }

    qa('#galerie-grid .gal-card').forEach(function (card, i) {
      card.addEventListener('click', function () { open(i); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    var prev = q('.lb-prev', lb), next = q('.lb-next', lb), clos = q('.lb-close', lb);
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    if (clos) clos.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------------------------------------------------------------
     7. PRELOADER
     --------------------------------------------------------------- */
  function initPreloader() {
    var pre = q('#preloader');
    if (!pre) return;
    var done = function () { pre.classList.add('done'); };
    window.addEventListener('load', done);
    setTimeout(done, 2600); /* filet de sécurité */
  }

  /* ---------------------------------------------------------------
     INIT
     --------------------------------------------------------------- */
    function init() {
    hydrateTexts();
    renderServices();
    renderGallery();
    renderAboutVisuals();
    renderSocials();
    initReveals();
    initHeader();
    initParallax();
    initLightbox();
    initPreloader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
