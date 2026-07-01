/* ============================================================
   ARQUIARTES — Painel de gerenciamento
   ------------------------------------------------------------
   100% no navegador (sem servidor). Edita o conteúdo, salva um
   rascunho local e exporta "conteudo.js" para publicar no site.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     1) ACESSOS  —  ALTERE AS SENHAS ABAIXO
     Atenção: por ser um painel sem servidor, isto é uma proteção
     leve (as senhas ficam no código). Para uso interno.
     ============================================================ */
  var USUARIOS = [
    { usuario: 'laisa', senha: 'arquiartes', papel: 'editor', nome: 'Laísa' },
    { usuario: 'admin', senha: 'bomjardim',  papel: 'admin',  nome: 'Administrador' }
  ];

  var STORAGE_KEY = 'arquiartes_content';
  var SESSION_KEY = 'arquiartes_sessao';
  var GH_CONFIG_KEY = 'arquiartes_github';   // { repo, branch, path }
  var GH_TOKEN_KEY = 'arquiartes_gh_token';  // token (fica só neste navegador)

  /* ============================================================
     2) ESTRUTURA DOS FORMULÁRIOS (o que aparece para editar)
     ============================================================ */
  var SCHEMA = [
    { id: 'hero', label: 'Início', hint: 'capa', fields: [
      { p: 'hero.eyebrow', l: 'Selo (linha pequena)', t: 'text' },
      { p: 'hero.title', l: 'Título principal', t: 'textarea', hint: 'Cada quebra de linha (Enter) vira uma nova linha no site.' },
      { p: 'hero.text', l: 'Parágrafo de apresentação', t: 'textarea' },
      { p: 'hero.name', l: 'Nome (sobre a foto)', t: 'text' },
      { p: 'hero.role', l: 'Função/legenda (sobre a foto)', t: 'text' },
      { p: 'hero.photo', l: 'Foto principal (retrato)', t: 'image' },
      { p: 'hero.btnPrimary', l: 'Texto do botão principal', t: 'text' },
      { p: 'hero.btnSecondary', l: 'Texto do botão secundário', t: 'text' }
    ]},
    { id: 'sobre', label: 'Sobre', hint: 'a empresa', fields: [
      { p: 'sobre.eyebrow', l: 'Selo', t: 'text' },
      { p: 'sobre.title', l: 'Título', t: 'textarea' },
      { p: 'sobre.p1', l: 'Parágrafo 1', t: 'textarea' },
      { p: 'sobre.p2', l: 'Parágrafo 2', t: 'textarea' },
      { p: 'sobre.itens', l: 'Lista de destaques', t: 'list' },
      { p: 'sobre.ano', l: 'Ano do selo "Desde"', t: 'text' },
      { p: 'sobre.imagem', l: 'Imagem da seção', t: 'image' }
    ]},
    { id: 'essencia', label: 'Essência', hint: 'missão·visão·valores', fields: [
      { p: 'essencia.eyebrow', l: 'Selo', t: 'text' },
      { p: 'essencia.title', l: 'Título', t: 'textarea' },
      { p: 'essencia.missao', l: 'Missão', t: 'textarea' },
      { p: 'essencia.visao', l: 'Visão', t: 'textarea' },
      { p: 'essencia.valores', l: 'Valores', t: 'items', addable: true,
        addLabel: '+ Adicionar valor',
        novo: { nome: 'Novo valor' },
        item: [ { k: 'nome', l: 'Valor', t: 'text' } ] }
    ]},
    { id: 'servicos', label: 'Serviços', hint: '6 itens', fields: [
      { p: 'servicos.eyebrow', l: 'Selo', t: 'text' },
      { p: 'servicos.title', l: 'Título', t: 'textarea' },
      { p: 'servicos.lead', l: 'Texto de apoio', t: 'textarea' },
      { p: 'servicos.itens', l: 'Serviços', t: 'items', addable: true,
        addLabel: '+ Adicionar serviço',
        novo: { titulo: 'Novo serviço', descricao: '', icone: '' },
        item: [
          { k: 'titulo', l: 'Título', t: 'text' },
          { k: 'icone', l: 'Ícone', t: 'select', opcoes: [
            { v: '', l: 'Ícone automático' },
            { v: 'arquitetura', l: 'Prédio' },
            { v: 'paisagismo', l: 'Folha' },
            { v: 'interiores', l: 'Janela' },
            { v: 'consultoria', l: 'Casa' },
            { v: 'obra', l: 'Bússola' },
            { v: 'sustentavel', l: 'Folha (gota)' },
            { v: 'generico', l: 'Losango' }
          ]},
          { k: 'descricao', l: 'Descrição', t: 'textarea', full: true }
        ]}
    ]},
    { id: 'portfolio', label: 'Projetos', hint: 'portfólio', fields: [
      { p: 'portfolio.eyebrow', l: 'Selo', t: 'text' },
      { p: 'portfolio.title', l: 'Título', t: 'textarea' },
      { p: 'portfolio.lead', l: 'Texto de apoio', t: 'textarea' },
      { p: 'portfolio.itens', l: 'Projetos', t: 'items', addable: true,
        addLabel: '+ Adicionar projeto',
        novo: { categoria: 'Categoria', titulo: 'Novo projeto', imagem: '' },
        item: [
          { k: 'categoria', l: 'Categoria', t: 'text' },
          { k: 'titulo', l: 'Nome do projeto', t: 'text' },
          { k: 'imagem', l: 'Foto do projeto', t: 'image', full: true }
        ]}
    ]},
    { id: 'diferenciais', label: 'Diferenciais', hint: 'e números', fields: [
      { p: 'diferenciais.eyebrow', l: 'Selo', t: 'text' },
      { p: 'diferenciais.title', l: 'Título', t: 'textarea' },
      { p: 'diferenciais.itens', l: 'Diferenciais', t: 'items', addable: true,
        addLabel: '+ Adicionar diferencial',
        novo: { titulo: 'Novo diferencial', texto: '' },
        item: [
          { k: 'titulo', l: 'Título', t: 'text' },
          { k: 'texto', l: 'Texto', t: 'textarea', full: true }
        ]},
      { p: 'diferenciais.estatisticas', l: 'Números (estatísticas)', t: 'items', addable: true,
        addLabel: '+ Adicionar número',
        novo: { numero: '0', sufixo: '', rotulo: 'Novo número' },
        item: [
          { k: 'numero', l: 'Número', t: 'text' },
          { k: 'sufixo', l: 'Sufixo (ex.: + ou %)', t: 'text' },
          { k: 'rotulo', l: 'Rótulo', t: 'text', full: true }
        ]}
    ]},
    { id: 'depoimentos', label: 'Depoimentos', hint: '3 clientes', fields: [
      { p: 'depoimentos.eyebrow', l: 'Selo', t: 'text' },
      { p: 'depoimentos.title', l: 'Título', t: 'textarea' },
      { p: 'depoimentos.itens', l: 'Depoimentos', t: 'items', addable: true,
        addLabel: '+ Adicionar depoimento',
        novo: { texto: '', nome: '', papel: '' },
        item: [
          { k: 'texto', l: 'Depoimento', t: 'textarea', full: true },
          { k: 'nome', l: 'Nome', t: 'text' },
          { k: 'papel', l: 'Descrição (ex.: cliente)', t: 'text' }
        ]}
    ]},
    { id: 'contato', label: 'Contato', hint: 'e redes', fields: [
      { p: 'contato.eyebrow', l: 'Selo', t: 'text' },
      { p: 'contato.title', l: 'Título', t: 'textarea' },
      { p: 'contato.intro', l: 'Texto de introdução', t: 'textarea' },
      { p: 'contato.whatsapp', l: 'WhatsApp (somente números, com DDI/DDD)', t: 'text', hint: 'Ex.: 5522991059221 (55 + 22 + número).' },
      { p: 'contato.whatsappTexto', l: 'WhatsApp (como aparece)', t: 'text' },
      { p: 'contato.instagram', l: 'Link do Instagram', t: 'text' },
      { p: 'contato.instagramTexto', l: 'Instagram (como aparece)', t: 'text' },
      { p: 'contato.threads', l: 'Link do Threads', t: 'text' },
      { p: 'contato.horario', l: 'Horário de atendimento', t: 'text' },
      { p: 'contato.email', l: 'E-mail (opcional)', t: 'text' },
      { p: 'footer.sobre', l: 'Texto do rodapé', t: 'textarea' }
    ]},
    { id: 'avancado', label: 'Avançado', hint: 'admin', adminOnly: true, fields: [] }
  ];

  /* ============================================================
     3) UTILITÁRIOS
     ============================================================ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function getPath(obj, path) {
    return path.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, obj);
  }
  function setPath(obj, path, val) {
    var keys = path.split('.');
    var last = keys.pop();
    var t = keys.reduce(function (a, k) {
      if (a[k] == null) a[k] = /^\d+$/.test(keys[keys.indexOf(k) + 1] || last) ? [] : {};
      return a[k];
    }, obj);
    t[last] = val;
  }

  var toastTimer;
  function toast(msg, isErr) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2800);
  }

  /* Compressão de imagem -> dataURL (jpeg) */
  function compressImage(file, maxW, quality) {
    return new Promise(function (resolve, reject) {
      if (!file.type || file.type.indexOf('image') !== 0) { reject(new Error('Arquivo não é imagem')); return; }
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxW / img.width);
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = el('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        try { resolve(canvas.toDataURL('image/jpeg', quality)); }
        catch (e) { reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Falha ao ler imagem')); };
      img.src = url;
    });
  }

  /* ============================================================
     4) ESTADO
     ============================================================ */
  var DEFAULTS = window.SITE_CONTENT ? clone(window.SITE_CONTENT) : {};
  var content = carregarRascunho() || clone(DEFAULTS);
  var sessao = null;
  var saveTimer;

  function carregarRascunho() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function salvarRascunho(silencioso) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      if (!silencioso) toast('Rascunho salvo no navegador.');
      return true;
    } catch (e) {
      toast('Não foi possível salvar (imagens grandes demais). Use fotos menores.', true);
      return false;
    }
  }
  function agendarSalvar() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { salvarRascunho(true); }, 800);
  }

  /* Gera o texto do arquivo conteudo.js */
  function gerarConteudoJs() {
    return '/* ARQUIARTES — conteúdo do site (gerado pelo painel) */\n' +
           'window.SITE_CONTENT = ' + JSON.stringify(content, null, 2) + ';\n';
  }
  function baixarConteudoJs() {
    var blob = new Blob([gerarConteudoJs()], { type: 'text/javascript' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'conteudo.js' });
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Publicação online via GitHub ---------- */
  function ghConfig() {
    try { return JSON.parse(localStorage.getItem(GH_CONFIG_KEY)) || {}; } catch (e) { return {}; }
  }
  function ghSalvarConfig(cfg) { localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(cfg)); }
  function ghToken() { try { return localStorage.getItem(GH_TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function b64utf8(str) { return btoa(unescape(encodeURIComponent(str))); }

  function publicarOnline() {
    var cfg = ghConfig();
    var token = ghToken();
    if (!cfg.repo || !token) {
      toast('Configure a publicação online em "Avançado" (repositório e token).', true);
      if (sessao && sessao.papel === 'admin') ativarSecao('avancado');
      return;
    }
    var branch = cfg.branch || 'main';
    var path = cfg.path || 'assets/conteudo.js';
    var apiBase = 'https://api.github.com/repos/' + cfg.repo + '/contents/' + path;
    var head = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' };
    var texto = gerarConteudoJs();

    if (texto.length > 950000) {
      toast('Conteúdo grande demais (fotos pesadas). Use menos/ menores imagens.', true);
      return;
    }
    toast('Publicando...');
    // 1) pega o sha atual (se existir)
    fetch(apiBase + '?ref=' + encodeURIComponent(branch), { headers: head })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (atual) {
        var body = {
          message: 'Atualiza conteúdo do site (painel ARQUIARTES)',
          content: b64utf8(texto),
          branch: branch
        };
        if (atual && atual.sha) body.sha = atual.sha;
        return fetch(apiBase, { method: 'PUT', headers: head, body: JSON.stringify(body) });
      })
      .then(function (r) {
        if (r.ok) {
          salvarRascunho(true);
          toast('✓ Publicado! O site atualiza em ~1 minuto.');
        } else {
          return r.json().then(function (e) {
            toast('Falha ao publicar: ' + (e.message || r.status), true);
          });
        }
      })
      .catch(function () { toast('Sem conexão ou token inválido.', true); });
  }

  function ghTestarConexao() {
    var cfg = ghConfig();
    var token = ghToken();
    if (!cfg.repo || !token) { toast('Preencha repositório e token primeiro.', true); return; }
    var head = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' };
    toast('Testando...');
    fetch('https://api.github.com/repos/' + cfg.repo, { headers: head })
      .then(function (r) {
        if (r.ok) toast('✓ Conexão OK com ' + cfg.repo);
        else if (r.status === 404) toast('Repositório não encontrado (verifique owner/nome).', true);
        else if (r.status === 401) toast('Token inválido ou sem permissão.', true);
        else toast('Erro ' + r.status, true);
      })
      .catch(function () { toast('Sem conexão.', true); });
  }

  /* ============================================================
     5) LOGIN
     ============================================================ */
  function iniciarLogin() {
    try {
      var s = sessionStorage.getItem(SESSION_KEY);
      if (s) { sessao = JSON.parse(s); abrirApp(); return; }
    } catch (e) {}

    $('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var u = $('#usuario').value.trim().toLowerCase();
      var p = $('#senha').value;
      var found = USUARIOS.filter(function (x) { return x.usuario === u && x.senha === p; })[0];
      if (!found) { $('#loginError').textContent = 'Usuário ou senha incorretos.'; return; }
      sessao = { usuario: found.usuario, papel: found.papel, nome: found.nome };
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao)); } catch (e) {}
      abrirApp();
    });
  }

  function abrirApp() {
    $('#login').hidden = true;
    $('#app').hidden = false;
    $('#whoami').textContent = sessao.nome + ' · ' + (sessao.papel === 'admin' ? 'Administrador' : 'Editora');
    renderTabs();
    ativarSecao(SCHEMA[0].id);
    ligarAcoes();
  }

  /* ============================================================
     6) NAVEGAÇÃO (abas)
     ============================================================ */
  var secaoAtiva = null;
  function secoesVisiveis() {
    return SCHEMA.filter(function (s) { return !s.adminOnly || sessao.papel === 'admin'; });
  }
  function renderTabs() {
    var nav = $('#tabs');
    nav.innerHTML = '';
    secoesVisiveis().forEach(function (s) {
      var b = el('button', { class: 'tab', 'data-sec': s.id });
      b.appendChild(el('span', { text: s.label }));
      if (s.hint) b.appendChild(el('span', { class: 'tab__hint', text: s.hint }));
      b.addEventListener('click', function () { ativarSecao(s.id); });
      nav.appendChild(b);
    });
  }
  function ativarSecao(id) {
    secaoAtiva = id;
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.classList.toggle('active', t.getAttribute('data-sec') === id);
    });
    renderForm(id);
  }

  /* ============================================================
     7) RENDER DOS FORMULÁRIOS
     ============================================================ */
  function renderForm(id) {
    var sec = SCHEMA.filter(function (s) { return s.id === id; })[0];
    var area = $('#formArea');
    area.innerHTML = '';

    if (sec.adminOnly) { renderAvancado(area); return; }

    area.appendChild(el('h2', { class: 'content__title', text: sec.label }));
    area.appendChild(el('p', { class: 'content__desc', text: 'Edite os textos e imagens desta seção. As alterações são salvas automaticamente como rascunho.' }));

    sec.fields.forEach(function (f) {
      if (f.t === 'items') area.appendChild(renderItems(f));
      else if (f.t === 'list') area.appendChild(renderList(f));
      else area.appendChild(renderField(f.p, f, getPath(content, f.p)));
    });
  }

  function renderField(path, f, value) {
    if (f.t === 'image') return renderImage(path, f, value);

    var wrap = el('div', { class: 'field' + (f.full ? ' full' : '') });
    wrap.appendChild(el('label', { text: f.l }));
    var input;
    if (f.t === 'select') {
      input = el('select');
      (f.opcoes || []).forEach(function (o) {
        input.appendChild(el('option', { value: o.v, text: o.l }));
      });
      input.value = value == null ? '' : value;
      input.addEventListener('change', function () {
        setPath(content, path, input.value);
        agendarSalvar();
      });
    } else if (f.t === 'textarea') {
      input = el('textarea');
      input.value = value == null ? '' : value;
      input.addEventListener('input', function () { setPath(content, path, input.value); agendarSalvar(); });
    } else {
      input = el('input', { type: 'text' });
      input.value = value == null ? '' : value;
      input.addEventListener('input', function () { setPath(content, path, input.value); agendarSalvar(); });
    }
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(el('p', { class: 'hint', text: f.hint }));
    return wrap;
  }

  function renderImage(path, f, value) {
    var wrap = el('div', { class: 'field' + (f.full ? ' full' : '') });
    wrap.appendChild(el('label', { text: f.l }));

    var ctrl = el('div', { class: 'imgctrl' });
    var preview = el('div', { class: 'imgctrl__preview' });
    function pintar(v) {
      if (v) { preview.style.backgroundImage = 'url("' + v + '")'; preview.textContent = ''; }
      else { preview.style.backgroundImage = 'none'; preview.textContent = 'Sem imagem'; }
    }
    pintar(value);

    var file = el('input', { type: 'file', accept: 'image/*' });
    file.style.display = 'none';
    var btnUp = el('button', { class: 'btn small', type: 'button', text: 'Enviar foto' });
    var btnDel = el('button', { class: 'btn small ghost', type: 'button', text: 'Remover' });
    btnUp.addEventListener('click', function () { file.click(); });
    btnDel.addEventListener('click', function () {
      setPath(content, path, '');
      pintar('');
      agendarSalvar();
    });
    file.addEventListener('change', function () {
      var f0 = file.files[0];
      if (!f0) return;
      compressImage(f0, 1500, 0.82).then(function (dataUrl) {
        setPath(content, path, dataUrl);
        pintar(dataUrl);
        agendarSalvar();
        toast('Foto carregada.');
      }).catch(function () { toast('Não foi possível processar a imagem.', true); });
      file.value = '';
    });

    var actions = el('div', { class: 'imgctrl__actions' });
    actions.appendChild(btnUp);
    actions.appendChild(btnDel);
    actions.appendChild(el('p', { class: 'hint', text: 'JPG ou PNG. A imagem é reduzida automaticamente para o site ficar leve.' }));
    actions.appendChild(file);

    ctrl.appendChild(preview);
    ctrl.appendChild(actions);
    wrap.appendChild(ctrl);
    return wrap;
  }

  function renderList(f) {
    var wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', { text: f.l }));
    var arr = getPath(content, f.p) || [];
    arr.forEach(function (val, i) {
      var row = el('div', { class: 'list-row' });
      var input = el('input', { type: 'text' });
      input.value = val == null ? '' : val;
      input.addEventListener('input', function () {
        var a = getPath(content, f.p) || [];
        a[i] = input.value;
        setPath(content, f.p, a);
        agendarSalvar();
      });
      row.appendChild(input);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderItems(f) {
    var wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', { text: f.l }));
    var arr = getPath(content, f.p) || [];
    arr.forEach(function (item, i) {
      var card = el('div', { class: 'item-card' });
      var head = el('div', { class: 'item-card__head' });
      head.appendChild(el('span', { text: (i + 1) + '.' }));
      if (f.addable) {
        var btnRem = el('button', { class: 'btn small danger', type: 'button', text: 'Remover' });
        btnRem.style.marginLeft = '0.8rem';
        btnRem.addEventListener('click', function () {
          if (confirm('Remover este item?')) {
            var a = getPath(content, f.p) || [];
            a.splice(i, 1);
            setPath(content, f.p, a);
            salvarRascunho(true);
            renderForm(secaoAtiva);
          }
        });
        head.appendChild(btnRem);
      }
      card.appendChild(head);
      var grid = el('div', { class: 'item-grid' });
      f.item.forEach(function (sub) {
        var subPath = f.p + '.' + i + '.' + sub.k;
        grid.appendChild(renderField(subPath, sub, getPath(content, subPath)));
      });
      card.appendChild(grid);
      wrap.appendChild(card);
    });
    if (f.addable) {
      var btnAdd = el('button', { class: 'btn', type: 'button', text: f.addLabel || '+ Adicionar' });
      btnAdd.addEventListener('click', function () {
        var a = getPath(content, f.p) || [];
        a.push(clone(f.novo || {}));
        setPath(content, f.p, a);
        salvarRascunho(true);
        renderForm(secaoAtiva);
      });
      wrap.appendChild(btnAdd);
    }
    return wrap;
  }

  /* ============================================================
     8) SEÇÃO AVANÇADA (admin)
     ============================================================ */
  function renderAvancado(area) {
    area.appendChild(el('h2', { class: 'content__title', text: 'Avançado' }));
    area.appendChild(el('p', { class: 'content__desc', text: 'Ferramentas administrativas. Use com cuidado.' }));

    // ---- Publicação online (GitHub) ----
    var cfg = ghConfig();
    var gh = el('div', { class: 'item-card' });
    gh.appendChild(el('div', { class: 'item-card__head', text: 'Publicação online (GitHub)' }));
    gh.appendChild(el('p', { class: 'hint', text: 'Conecta o painel ao repositório. O botão "Publicar no site" envia o conteúdo e a Netlify atualiza o site sozinha. O token fica salvo só neste navegador — nunca vai para o site público.' }));

    function inp(label, val, hint, type) {
      var w = el('div', { class: 'field' });
      w.appendChild(el('label', { text: label }));
      var i = el('input', { type: type || 'text' });
      i.value = val || '';
      w.appendChild(i);
      if (hint) w.appendChild(el('p', { class: 'hint', text: hint }));
      gh.appendChild(w);
      return i;
    }
    var iRepo = inp('Repositório (usuário/nome)', cfg.repo, 'Ex.: laisawermelinger/arquiartes');
    var iBranch = inp('Branch', cfg.branch || 'main', 'Normalmente "main".');
    var iPath = inp('Caminho do arquivo', cfg.path || 'assets/conteudo.js');
    var iToken = inp('Token de acesso (GitHub)', ghToken(), 'Token "fine-grained" com permissão de Conteúdo (leitura e escrita) só neste repositório.', 'password');

    var ghActions = el('div', { class: 'imgctrl__actions' });
    var btnGhSave = el('button', { class: 'btn', type: 'button', text: 'Salvar configuração' });
    btnGhSave.addEventListener('click', function () {
      ghSalvarConfig({ repo: iRepo.value.trim(), branch: iBranch.value.trim() || 'main', path: iPath.value.trim() || 'assets/conteudo.js' });
      try {
        if (iToken.value.trim()) localStorage.setItem(GH_TOKEN_KEY, iToken.value.trim());
      } catch (e) {}
      toast('Configuração de publicação salva.');
    });
    var btnGhTest = el('button', { class: 'btn ghost', type: 'button', text: 'Testar conexão' });
    btnGhTest.addEventListener('click', function () {
      ghSalvarConfig({ repo: iRepo.value.trim(), branch: iBranch.value.trim() || 'main', path: iPath.value.trim() || 'assets/conteudo.js' });
      if (iToken.value.trim()) { try { localStorage.setItem(GH_TOKEN_KEY, iToken.value.trim()); } catch (e) {} }
      ghTestarConexao();
    });
    var btnGhForget = el('button', { class: 'btn danger', type: 'button', text: 'Esquecer token' });
    btnGhForget.addEventListener('click', function () {
      try { localStorage.removeItem(GH_TOKEN_KEY); } catch (e) {}
      iToken.value = '';
      toast('Token removido deste navegador.');
    });
    ghActions.style.flexDirection = 'row';
    ghActions.style.flexWrap = 'wrap';
    ghActions.appendChild(btnGhSave);
    ghActions.appendChild(btnGhTest);
    ghActions.appendChild(btnGhForget);
    gh.appendChild(ghActions);
    area.appendChild(gh);

    // Importar
    var imp = el('div', { class: 'field' });
    imp.appendChild(el('label', { text: 'Importar conteúdo' }));
    var btnImp = el('button', { class: 'btn', type: 'button', text: 'Selecionar arquivo conteudo.js' });
    btnImp.addEventListener('click', function () { $('#fileImport').click(); });
    imp.appendChild(btnImp);
    imp.appendChild(el('p', { class: 'hint', text: 'Carrega um arquivo "conteudo.js" exportado anteriormente.' }));
    area.appendChild(imp);

    // Restaurar
    var res = el('div', { class: 'field' });
    res.appendChild(el('label', { text: 'Restaurar conteúdo publicado' }));
    var btnRes = el('button', { class: 'btn danger', type: 'button', text: 'Descartar rascunho e restaurar' });
    btnRes.addEventListener('click', function () {
      if (confirm('Isto descarta o rascunho atual e volta ao conteúdo publicado. Continuar?')) {
        content = clone(DEFAULTS);
        salvarRascunho(true);
        ativarSecao('hero');
        toast('Conteúdo restaurado.');
      }
    });
    res.appendChild(btnRes);
    area.appendChild(res);

    // JSON bruto
    var raw = el('div', { class: 'field raw' });
    raw.appendChild(el('label', { text: 'Conteúdo (JSON) — edição direta' }));
    var ta = el('textarea');
    ta.value = JSON.stringify(content, null, 2);
    var btnAplica = el('button', { class: 'btn', type: 'button', text: 'Aplicar JSON' });
    btnAplica.addEventListener('click', function () {
      try {
        content = JSON.parse(ta.value);
        salvarRascunho(true);
        toast('JSON aplicado.');
      } catch (e) { toast('JSON inválido.', true); }
    });
    raw.appendChild(ta);
    raw.appendChild(btnAplica);
    area.appendChild(raw);
  }

  /* ============================================================
     9) AÇÕES (topo)
     ============================================================ */
  function ligarAcoes() {
    $('#btnSave').addEventListener('click', function () { salvarRascunho(false); });

    $('#btnPreview').addEventListener('click', function () {
      salvarRascunho(true);
      window.open('index.html?preview=1', '_blank', 'noopener');
    });

    $('#btnPublishOnline').addEventListener('click', publicarOnline);

    $('#btnPublish').addEventListener('click', function () {
      salvarRascunho(true);
      baixarConteudoJs();
      toast('Arquivo "conteudo.js" baixado. Substitua o arquivo em assets/ para publicar.');
    });

    $('#btnLogout').addEventListener('click', function () {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      location.reload();
    });

    $('#fileImport').addEventListener('change', function () {
      var f0 = this.files[0];
      if (!f0) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var txt = String(reader.result);
          var ini = txt.indexOf('{');
          var fim = txt.lastIndexOf('}');
          content = JSON.parse(txt.slice(ini, fim + 1));
          salvarRascunho(true);
          ativarSecao('hero');
          toast('Conteúdo importado.');
        } catch (e) { toast('Não foi possível ler o arquivo.', true); }
      };
      reader.readAsText(f0);
      this.value = '';
    });
  }

  /* ============================================================
     10) START
     ============================================================ */
  iniciarLogin();
})();
