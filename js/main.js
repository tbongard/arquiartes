/* ============================================================
   ARQUIARTES — Interações e animações
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     CONTEÚDO EDITÁVEL
     Preenche o site a partir de window.SITE_CONTENT (assets/conteudo.js).
     Com "?preview=1" na URL, usa o rascunho salvo no painel (localStorage).
     Se nada existir, mantém os textos padrão já escritos no HTML.
     ============================================================ */
  function resolvePath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function applyContent(c) {
    if (!c) return;

    // Texto simples
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var v = resolvePath(c, el.getAttribute('data-content'));
      if (v != null && v !== '') el.textContent = v;
    });
    // Texto com quebras de linha (título do hero)
    document.querySelectorAll('[data-content-html]').forEach(function (el) {
      var v = resolvePath(c, el.getAttribute('data-content-html'));
      if (v != null && v !== '') {
        el.innerHTML = String(v)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\n/g, '<br />');
      }
    });
    // Imagens (src)
    document.querySelectorAll('[data-content-src]').forEach(function (el) {
      var v = resolvePath(c, el.getAttribute('data-content-src'));
      if (v) el.setAttribute('src', v);
    });
    // Imagens de fundo (placeholders de projeto/sobre)
    document.querySelectorAll('[data-content-bg]').forEach(function (el) {
      var v = resolvePath(c, el.getAttribute('data-content-bg'));
      if (v) {
        el.style.backgroundImage = 'url("' + v + '")';
        el.classList.add('has-image');
      }
    });
    // Links (href)
    document.querySelectorAll('[data-content-href]').forEach(function (el) {
      var v = resolvePath(c, el.getAttribute('data-content-href'));
      if (v) el.setAttribute('href', v);
    });
    // Estatísticas (número + sufixo)
    document.querySelectorAll('[data-content-count]').forEach(function (el) {
      var item = resolvePath(c, el.getAttribute('data-content-count'));
      if (item && item.numero != null) {
        el.setAttribute('data-count', item.numero);
        el.setAttribute('data-suffix', item.sufixo || '');
      }
    });
    // Links de WhatsApp
    if (c.contato && c.contato.whatsapp) {
      document.querySelectorAll('[data-wa]').forEach(function (el) {
        el.setAttribute('href', 'https://wa.me/' + c.contato.whatsapp);
      });
    }
  }

  var CONTENT = window.SITE_CONTENT || null;
  try {
    if (new URLSearchParams(location.search).has('preview')) {
      var draft = localStorage.getItem('arquiartes_content');
      if (draft) CONTENT = JSON.parse(draft);
    }
  } catch (e) { /* ignora */ }
  applyContent(CONTENT);

  /* ---------- Cabeçalho: muda ao rolar ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    // Fecha ao clicar em um link
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Animações de entrada (reveal on scroll) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contadores animados (estatísticas) ---------- */
  var counters = document.querySelectorAll('.stat__num');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Formulário de contato (envio via WhatsApp) ---------- */
  var WHATSAPP_NUMERO = (CONTENT && CONTENT.contato && CONTENT.contato.whatsapp) || '5522991059221';
  var form = document.getElementById('contatoForm');
  var feedback = document.getElementById('formFeedback');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var telefone = form.telefone.value.trim();
      var mensagem = form.mensagem.value.trim();

      if (!nome || !mensagem) {
        feedback.style.color = '#a85a4a';
        feedback.textContent = 'Por favor, preencha ao menos o nome e a mensagem.';
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        feedback.style.color = '#a85a4a';
        feedback.textContent = 'Informe um e-mail válido (ou deixe em branco).';
        return;
      }

      // Monta a mensagem e abre a conversa no WhatsApp da ARQUIARTES
      var texto =
        'Olá, ARQUIARTES! Vim pelo site.%0A%0A' +
        '*Nome:* ' + encodeURIComponent(nome) + '%0A' +
        (email ? '*E-mail:* ' + encodeURIComponent(email) + '%0A' : '') +
        (telefone ? '*Telefone:* ' + encodeURIComponent(telefone) + '%0A' : '') +
        '*Mensagem:* ' + encodeURIComponent(mensagem);

      var url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + texto;
      window.open(url, '_blank', 'noopener');

      feedback.style.color = '';
      feedback.textContent = 'Abrindo o WhatsApp para enviar sua mensagem, ' + nome.split(' ')[0] + '...';
      form.reset();
    });
  }

  /* ---------- Ano atual no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
