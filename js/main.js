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

    // Seções dinâmicas: reconstroem com a quantidade de itens existente
    renderServices(c);
    renderValores(c);
    renderPortfolio(c);
    renderDiferenciais(c);
    renderStats(c);
    renderDepoimentos(c);
  }

  /* ---------- Valores (chips dinâmicos) ---------- */
  function renderValores(c) {
    if (!c || !c.essencia || !Array.isArray(c.essencia.valores)) return;
    var grid = document.getElementById('valoresGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.essencia.valores.forEach(function (item) {
      var chip = document.createElement('span');
      chip.className = 'valor-chip';
      chip.textContent = (item && item.nome) ? item.nome : String(item || '');
      grid.appendChild(chip);
    });
  }

  /* ---------- Estatísticas (números animados, dinâmicos) ---------- */
  function renderStats(c) {
    if (!c || !c.diferenciais || !Array.isArray(c.diferenciais.estatisticas)) return;
    var grid = document.getElementById('statsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.diferenciais.estatisticas.forEach(function (item) {
      var stat = document.createElement('div');
      stat.className = 'stat';
      var num = document.createElement('span');
      num.className = 'stat__num';
      num.setAttribute('data-count', item.numero || '0');
      if (item.sufixo) num.setAttribute('data-suffix', item.sufixo);
      num.textContent = '0';
      var label = document.createElement('span');
      label.className = 'stat__label';
      label.textContent = item.rotulo || '';
      stat.appendChild(num); stat.appendChild(label);
      grid.appendChild(stat);
    });
  }

  /* ---------- Serviços (ícones + cards dinâmicos) ---------- */
  var SERVICO_ICONES = {
    arquitetura: '<path d="M6 42V20L24 6l18 14v22"/><path d="M18 42V28h12v14"/>',
    paisagismo: '<path d="M24 42c10-6 14-14 14-22a14 14 0 0 0-28 0c0 8 4 16 14 22Z"/><path d="M24 20v22M24 26l6-6M24 30l-6-6"/>',
    interiores: '<rect x="8" y="8" width="32" height="32" rx="2"/><path d="M8 20h32M20 8v32"/>',
    consultoria: '<path d="M6 38h36M10 38V18l14-10 14 10v20"/><path d="M20 38V26h8v12"/>',
    obra: '<circle cx="24" cy="24" r="16"/><path d="M24 8v8M24 32v8M8 24h8M32 24h8"/>',
    sustentavel: '<path d="M24 6c8 6 12 12 12 20a12 12 0 0 1-24 0c0-8 4-14 12-20Z"/><circle cx="24" cy="26" r="5"/>',
    generico: '<path d="M24 5l19 19-19 19L5 24z"/>'
  };
  var SERVICO_ORDEM = ['arquitetura', 'paisagismo', 'interiores', 'consultoria', 'obra', 'sustentavel'];
  function svgServico(key, i) {
    var k = key || SERVICO_ORDEM[i] || 'generico';
    var inner = SERVICO_ICONES[k] || SERVICO_ICONES.generico;
    return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2">' + inner + '</svg>';
  }
  function renderServices(c) {
    if (!c || !c.servicos || !Array.isArray(c.servicos.itens)) return;
    var grid = document.getElementById('servicosGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.servicos.itens.forEach(function (item, i) {
      var art = document.createElement('article');
      art.className = 'card reveal';
      var icon = document.createElement('span');
      icon.className = 'card__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = svgServico(item.icone, i);
      var h = document.createElement('h3');
      h.className = 'card__title';
      h.textContent = item.titulo || '';
      var p = document.createElement('p');
      p.textContent = item.descricao || '';
      art.appendChild(icon); art.appendChild(h); art.appendChild(p);
      grid.appendChild(art);
    });
  }

  function renderPortfolio(c) {
    if (!c || !c.portfolio || !Array.isArray(c.portfolio.itens)) return;
    var grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.portfolio.itens.forEach(function (item, i) {
      var fig = document.createElement('figure');
      fig.className = 'project reveal';
      var ph = document.createElement('div');
      ph.className = 'image-placeholder';
      ph.setAttribute('data-label', 'Projeto ' + (i + 1));
      if (item.imagem) {
        ph.style.backgroundImage = 'url("' + item.imagem + '")';
        ph.classList.add('has-image');
      }
      var cap = document.createElement('figcaption');
      cap.className = 'project__caption';
      var cat = document.createElement('span');
      cat.className = 'project__cat';
      cat.textContent = item.categoria || '';
      var tit = document.createElement('h3');
      tit.className = 'project__title';
      tit.textContent = item.titulo || '';
      cap.appendChild(cat); cap.appendChild(tit);
      fig.appendChild(ph); fig.appendChild(cap);
      grid.appendChild(fig);
    });
  }

  /* ---------- Diferenciais (cards numerados, dinâmicos) ---------- */
  function renderDiferenciais(c) {
    if (!c || !c.diferenciais || !Array.isArray(c.diferenciais.itens)) return;
    var grid = document.getElementById('diferenciaisGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.diferenciais.itens.forEach(function (item, i) {
      var div = document.createElement('div');
      div.className = 'feature reveal';
      var num = document.createElement('span');
      num.className = 'feature__num';
      num.textContent = ('0' + (i + 1)).slice(-2);
      var h = document.createElement('h3');
      h.className = 'feature__title';
      h.textContent = item.titulo || '';
      var p = document.createElement('p');
      p.textContent = item.texto || '';
      div.appendChild(num); div.appendChild(h); div.appendChild(p);
      grid.appendChild(div);
    });
  }

  /* ---------- Depoimentos (dinâmicos) ---------- */
  function renderDepoimentos(c) {
    if (!c || !c.depoimentos || !Array.isArray(c.depoimentos.itens)) return;
    var grid = document.getElementById('depoimentosGrid');
    if (!grid) return;
    grid.innerHTML = '';
    c.depoimentos.itens.forEach(function (item) {
      var bq = document.createElement('blockquote');
      bq.className = 'quote reveal';
      var p = document.createElement('p');
      p.textContent = item.texto || '';
      var foot = document.createElement('footer');
      var strong = document.createElement('strong');
      strong.textContent = item.nome || '';
      var span = document.createElement('span');
      span.textContent = item.papel || '';
      foot.appendChild(strong); foot.appendChild(span);
      bq.appendChild(p); bq.appendChild(foot);
      grid.appendChild(bq);
    });
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
