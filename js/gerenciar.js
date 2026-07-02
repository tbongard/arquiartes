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
    { usuario: 'laisa', senha: 'arquiartes', papel: 'editor', nome: 'Laisa' },
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
      { p: 'hero.photo', l: 'Foto principal (retrato)', t: 'image', aspect: 0.72 },
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
      { p: 'sobre.imagem', l: 'Imagem da seção', t: 'image', aspect: 0.75 }
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
        novo: { categoria: 'Categoria', titulo: 'Novo projeto', imagem: '', galeria: [] },
        item: [
          { k: 'categoria', l: 'Categoria', t: 'text' },
          { k: 'titulo', l: 'Nome do projeto', t: 'text' },
          { k: 'imagem', l: 'Foto de capa', t: 'image', full: true, aspect: 1.4 },
          { k: 'galeria', l: 'Mais fotos do projeto (galeria)', t: 'galeria', full: true }
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
    { id: 'publicacao', label: 'Publicação', hint: 'colocar no ar', fields: [] },
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

  /* Editor de recorte: arrastar + zoom, com proporção fixa. Chama onDone(dataUrl). */
  function abrirCropper(file, aspect, onDone) {
    if (!file.type || file.type.indexOf('image') !== 0) { toast('Arquivo não é imagem.', true); return; }
    aspect = aspect || 1.4; // largura / altura
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var maxW = Math.min(window.innerWidth * 0.82, 560);
      var maxH = window.innerHeight * 0.6;
      var vw, vh;
      if (aspect >= 1) { vw = maxW; vh = maxW / aspect; if (vh > maxH) { vh = maxH; vw = maxH * aspect; } }
      else { vh = maxH; vw = maxH * aspect; if (vw > maxW) { vw = maxW; vh = maxW / aspect; } }
      vw = Math.round(vw); vh = Math.round(vh);

      var overlay = el('div', { class: 'cropper' });
      var view = el('div', { class: 'cropper__view' });
      view.style.width = vw + 'px'; view.style.height = vh + 'px';
      var pic = document.createElement('img'); pic.src = url; pic.alt = '';
      view.appendChild(pic);
      overlay.appendChild(view);

      var bar = el('div', { class: 'cropper__bar' });
      bar.appendChild(el('span', { text: 'Zoom' }));
      var zoom = document.createElement('input'); zoom.type = 'range'; zoom.min = '1'; zoom.max = '3'; zoom.step = '0.01'; zoom.value = '1';
      bar.appendChild(zoom);
      var btnOk = el('button', { class: 'btn primary', type: 'button', text: 'Aplicar' });
      var btnCancel = el('button', { class: 'btn ghost', type: 'button', text: 'Cancelar' });
      bar.appendChild(btnOk); bar.appendChild(btnCancel);
      overlay.appendChild(bar);
      overlay.appendChild(el('div', { class: 'cropper__hint', text: 'Arraste a imagem para enquadrar e use o zoom.' }));
      document.body.appendChild(overlay);

      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scaleCover = Math.max(vw / iw, vh / ih);
      var z = 1, tx = 0, ty = 0;
      function dw() { return iw * scaleCover * z; }
      function dh() { return ih * scaleCover * z; }
      function render() {
        tx = Math.min(0, Math.max(vw - dw(), tx));
        ty = Math.min(0, Math.max(vh - dh(), ty));
        pic.style.width = dw() + 'px'; pic.style.height = dh() + 'px';
        pic.style.left = tx + 'px'; pic.style.top = ty + 'px';
      }
      tx = (vw - dw()) / 2; ty = (vh - dh()) / 2; render();

      zoom.addEventListener('input', function () {
        var cx = vw / 2, cy = vh / 2, oldz = z;
        z = parseFloat(zoom.value);
        tx = cx - (cx - tx) * (z / oldz);
        ty = cy - (cy - ty) * (z / oldz);
        render();
      });
      view.addEventListener('wheel', function (e) {
        e.preventDefault();
        var nz = Math.min(3, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 0.92)));
        zoom.value = nz; zoom.dispatchEvent(new Event('input'));
      }, { passive: false });

      var dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;
      view.addEventListener('pointerdown', function (e) {
        dragging = true; view.classList.add('dragging');
        sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;
        try { view.setPointerCapture(e.pointerId); } catch (err) {}
      });
      view.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        tx = stx + (e.clientX - sx); ty = sty + (e.clientY - sy); render();
      });
      view.addEventListener('pointerup', function () { dragging = false; view.classList.remove('dragging'); });

      function fechar() { URL.revokeObjectURL(url); overlay.remove(); }
      btnCancel.addEventListener('click', fechar);
      btnOk.addEventListener('click', function () {
        var cw, ch;
        if (aspect >= 1) { cw = 1400; ch = Math.round(1400 / aspect); }
        else { ch = 1400; cw = Math.round(1400 * aspect); }
        var k = cw / vw;
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, iw, ih, tx * k, ty * k, dw() * k, dh() * k);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        fechar();
        onDone(dataUrl);
      });
    };
    img.onerror = function () { URL.revokeObjectURL(url); toast('Não foi possível ler a imagem.', true); };
    img.src = url;
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

  /* Publica: sobe as fotos novas como arquivos separados e depois o conteudo.js (leve) */
  async function publicarOnline() {
    var cfg = ghConfig();
    var token = ghToken();
    if (!cfg.repo || !token) {
      toast('Configure a publicação na aba "Publicação" (repositório e token).', true);
      ativarSecao('publicacao');
      return;
    }
    var branch = cfg.branch || 'main';
    var path = cfg.path || 'assets/conteudo.js';
    var head = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' };

    try {
      // 1) sobe cada imagem embutida (data URL) como um arquivo e troca pelo caminho
      var pendentes = coletarImagensBase64(content);
      for (var i = 0; i < pendentes.length; i++) {
        var p = pendentes[i];
        toast('Enviando foto ' + (i + 1) + ' de ' + pendentes.length + '...');
        var nome = await ghCommitBinario(cfg, branch, head, p.b64, p.ext);
        p.obj[p.key] = nome;
        salvarRascunho(true); // guarda o caminho já publicado (evita reenviar)
      }
      // 2) sobe o conteudo.js (agora leve, só com os caminhos das fotos)
      toast('Publicando...');
      await ghCommitTexto(cfg, branch, head, path, gerarConteudoJs());
      salvarRascunho(true);
      toast('✓ Publicado! O site atualiza em ~1 minuto.');
    } catch (e) {
      toast('Falha ao publicar: ' + (e && e.message ? e.message : e), true);
    }
  }

  /* Encontra todos os valores que são imagens embutidas (data URL) no conteúdo */
  function coletarImagensBase64(raiz) {
    var achados = [];
    (function walk(node) {
      if (!node || typeof node !== 'object') return;
      Object.keys(node).forEach(function (k) {
        var v = node[k];
        if (typeof v === 'string' && v.indexOf('data:image') === 0) {
          var m = /^data:(image\/[\w+.-]+);base64,([\s\S]*)$/.exec(v);
          if (m) {
            var ext = m[1].indexOf('png') >= 0 ? 'png' : (m[1].indexOf('webp') >= 0 ? 'webp' : 'jpg');
            achados.push({ obj: node, key: k, b64: m[2], ext: ext });
          }
        } else if (v && typeof v === 'object') {
          walk(v);
        }
      });
    })(raiz);
    return achados;
  }

  /* Sobe uma imagem como arquivo no repositório e devolve o caminho */
  async function ghCommitBinario(cfg, branch, head, b64, ext) {
    var nome = 'assets/img/foto-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.' + ext;
    var url = 'https://api.github.com/repos/' + cfg.repo + '/contents/' + nome;
    var r = await fetch(url, { method: 'PUT', headers: head, body: JSON.stringify({
      message: 'Adiciona imagem (painel ARQUIARTES)', content: b64, branch: branch
    }) });
    if (!r.ok) { var e = await r.json().catch(function () { return {}; }); throw new Error(e.message || ('HTTP ' + r.status)); }
    return nome;
  }

  /* Sobe/atualiza um arquivo de texto (conteudo.js) */
  async function ghCommitTexto(cfg, branch, head, path, texto) {
    var base = 'https://api.github.com/repos/' + cfg.repo + '/contents/' + path;
    var sha = null;
    var g = await fetch(base + '?ref=' + encodeURIComponent(branch), { headers: head });
    if (g.ok) { var j = await g.json(); sha = j.sha; }
    var body = { message: 'Atualiza conteúdo do site (painel ARQUIARTES)', content: b64utf8(texto), branch: branch };
    if (sha) body.sha = sha;
    var r = await fetch(base, { method: 'PUT', headers: head, body: JSON.stringify(body) });
    if (!r.ok) { var e = await r.json().catch(function () { return {}; }); throw new Error(e.message || ('HTTP ' + r.status)); }
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
    if (sec.id === 'publicacao') { renderPublicacao(area); return; }

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
    if (f.t === 'galeria') return renderGaleria(path, f, value);

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
      file.value = '';
      if (!f0) return;
      abrirCropper(f0, f.aspect || 1.4, function (dataUrl) {
        setPath(content, path, dataUrl);
        pintar(dataUrl);
        agendarSalvar();
        toast('Foto ajustada.');
      });
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

  function renderGaleria(path, f, value) {
    var wrap = el('div', { class: 'field' + (f.full ? ' full' : '') });
    wrap.appendChild(el('label', { text: f.l }));
    var arr = Array.isArray(value) ? value : [];

    var grid = el('div', { class: 'galeria-grid' });
    arr.forEach(function (foto, i) {
      var thumb = el('div', { class: 'galeria-thumb' });
      thumb.style.backgroundImage = 'url("' + foto + '")';
      var rm = el('button', { class: 'galeria-rm', type: 'button', 'aria-label': 'Remover foto', text: '×' });
      rm.addEventListener('click', function () {
        var a = getPath(content, path) || [];
        a.splice(i, 1);
        setPath(content, path, a);
        salvarRascunho(true);
        renderForm(secaoAtiva);
      });
      thumb.appendChild(rm);
      grid.appendChild(thumb);
    });
    wrap.appendChild(grid);

    var file = el('input', { type: 'file', accept: 'image/*', multiple: 'multiple' });
    file.style.display = 'none';
    var btn = el('button', { class: 'btn small', type: 'button', text: '+ Adicionar foto(s)' });
    btn.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var arquivos = [].slice.call(file.files);
      file.value = '';
      if (!arquivos.length) return;
      toast('Processando ' + arquivos.length + ' foto(s)...');
      var a = getPath(content, path) || [];
      var pend = arquivos.length;
      arquivos.forEach(function (f0) {
        compressImage(f0, 1500, 0.82).then(function (dataUrl) {
          a.push(dataUrl); setPath(content, path, a); salvarRascunho(true);
          if (--pend === 0) renderForm(secaoAtiva);
        }).catch(function () { if (--pend === 0) renderForm(secaoAtiva); });
      });
    });
    wrap.appendChild(btn);
    wrap.appendChild(file);
    if (f.hint) wrap.appendChild(el('p', { class: 'hint', text: f.hint }));
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
  /* Aba "Publicação" (visível a todos): configura o GitHub */
  function renderPublicacao(area) {
    area.appendChild(el('h2', { class: 'content__title', text: 'Publicação' }));
    area.appendChild(el('p', { class: 'content__desc', text: 'Conecte ao GitHub uma vez neste navegador. Depois, o botão "Publicar no site" (no topo) coloca suas alterações no ar em ~1 minuto.' }));
    buildGithubConfig(area);
  }

  /* Bloco de configuração do GitHub (usado na aba Publicação) */
  function buildGithubConfig(area) {
    var cfg = ghConfig();
    var gh = el('div', { class: 'item-card' });
    gh.appendChild(el('div', { class: 'item-card__head', text: 'Publicação online (GitHub)' }));
    gh.appendChild(el('p', { class: 'hint', text: 'Conecta o painel ao repositório. O token fica salvo só neste navegador — nunca vai para o site público.' }));

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
    var iRepo = inp('Repositório (usuário/nome)', cfg.repo, 'Ex.: tbongard/arquiartes');
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
  }

  /* ============================================================
     8) SEÇÃO AVANÇADA (admin)
     ============================================================ */
  function renderAvancado(area) {
    area.appendChild(el('h2', { class: 'content__title', text: 'Avançado' }));
    area.appendChild(el('p', { class: 'content__desc', text: 'Ferramentas administrativas. Use com cuidado.' }));

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
