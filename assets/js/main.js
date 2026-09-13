/* ============================================================
   Parque Cândia — Butantã | interações

   Eventos enviados ao dataLayer/GA4 (não duplicar — reusar estes nomes):
   page_view, cta_click{action}, view_plant{plant,area}, select_plant{plant},
   amenity_view{amenity}, morar_click, investment_click, faq_open{question},
   simulator_start, simulator_step{step,field,value}, simulator_complete{objective},
   form_start, form_submit, lead_generated{objective,property} (conversão principal),
   whatsapp_click{location}. "scroll" não é enviado daqui: vem do Enhanced
   Measurement do GA4 quando a propriedade real estiver configurada (Fase 2).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONFIGURAÇÃO (ajuste aqui) ---------- */
  var CONFIG = {
    whatsapp: '5511963055700',           // número do Bruno (DDI+DDD+número)
    // URL do app da Web do Google Apps Script (termina em /exec).
    // É o que grava o lead na planilha. Vazio = o lead só segue pelo WhatsApp.
    // Passo a passo em integracao/README-planilha.md
    leadEndpoint: '',
    adsConversionLabel: ''               // ex.: 'AW-123456789/AbC-D_efGh' para conversão do Google Ads
  };

  /* ---------- Analytics ---------- */
  function track(name, params) {
    params = params || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }
  function trackConversion() {
    if (CONFIG.adsConversionLabel && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: CONFIG.adsConversionLabel });
    }
  }

  /* ---------- Origem da visita (UTM / Google Ads) ----------
     Guarda na sessão para não se perder se a pessoa navegar antes de converter. */
  var CHAVE_ORIGEM = 'pc_origem';

  function capturarOrigem() {
    var salvo = {};
    try { salvo = JSON.parse(sessionStorage.getItem(CHAVE_ORIGEM) || '{}'); } catch (e) {}

    var q = new URLSearchParams(location.search);
    var campos = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
    var achou = false;

    campos.forEach(function (c) {
      var v = q.get(c);
      if (v) { salvo[c] = v; achou = true; }
    });

    if (achou || !salvo.referencia) {
      salvo.referencia = document.referrer || 'direto';
      salvo.primeira_pagina = salvo.primeira_pagina || location.pathname + location.search;
    }

    try { sessionStorage.setItem(CHAVE_ORIGEM, JSON.stringify(salvo)); } catch (e) {}
    return salvo;
  }

  var origem = capturarOrigem();

  /* ---------- Envio do lead com fila de reenvio ----------
     Se a internet cair ou o endpoint falhar, o lead fica guardado no navegador
     e é reenviado na próxima visita — em vez de simplesmente se perder. */
  var FILA = 'pc_leads_pendentes';

  function lerFila() {
    try { return JSON.parse(localStorage.getItem(FILA) || '[]'); } catch (e) { return []; }
  }
  function gravarFila(lista) {
    try { localStorage.setItem(FILA, JSON.stringify(lista.slice(-20))); } catch (e) {}
  }

  function postarLead(dados) {
    // Sem cabeçalho Content-Type de propósito: o corpo em texto evita o preflight
    // CORS, que o Apps Script não responde.
    return fetch(CONFIG.leadEndpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
      keepalive: true
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  }

  function enviarLead(dados) {
    if (!CONFIG.leadEndpoint) return;
    postarLead(dados).catch(function () {
      var fila = lerFila();
      fila.push(dados);
      gravarFila(fila);
    });
  }

  function reenviarPendentes() {
    if (!CONFIG.leadEndpoint) return;
    var fila = lerFila();
    if (!fila.length) return;
    gravarFila([]);
    fila.forEach(function (d) {
      postarLead(d).catch(function () {
        var atual = lerFila();
        atual.push(d);
        gravarFila(atual);
      });
    });
  }

  function openWhatsApp(msg, loc) {
    track('whatsapp_click', { location: loc || 'outro' });
    var text = encodeURIComponent(msg || 'Olá! Vim pelo site do Parque Cândia e gostaria de receber uma simulação.');
    window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + text, '_blank', 'noopener,noreferrer');
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Botões de WhatsApp e de tracking ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openWhatsApp(btn.getAttribute('data-wa'), btn.getAttribute('data-wa-loc'));
    });
  });
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-track'), { action: el.getAttribute('data-track-action') || '' });
    });
  });

  /* ---------- Plantas ---------- */
  var PLANTAS = [
    { tab: '26 m²', area: '26,14 m²',        type: '1 dormitório',          detail: 'Suíte e varanda', image: 'assets/img/planta-26.webp', w: 1500, h: 1374 },
    { tab: '30 m²', area: 'até 30,88 m²',    type: '1 dormitório',          detail: 'Suíte e varanda', image: 'assets/img/planta-26.webp', w: 1500, h: 1374 },
    { tab: '35 m²', area: '35,00 a 36,22 m²',type: '2 dormitórios',         detail: 'Com varanda',     image: 'assets/img/planta-35.webp', w: 1500, h: 1193 },
    { tab: '39 m²', area: '39,28 m²',        type: '1 dormitório + office', detail: 'Suíte e varanda', image: 'assets/img/planta-39.webp', w: 1500, h: 1270 },
    { tab: '41 m²', area: '41,60 m²',        type: '2 dormitórios',         detail: 'Suíte e varanda', image: 'assets/img/planta-42.webp', w: 1500, h: 1567 },
    { tab: '43 m²', area: '43,35 m²',        type: '2 dormitórios',         detail: 'Suíte e varanda', image: 'assets/img/planta-42.webp', w: 1500, h: 1567 }
  ];

  var plantaIndex = 0;
  var plantaTabs = document.getElementById('plantaTabs');
  var plantaImg = document.getElementById('plantaImg');
  var plantaArea = document.getElementById('plantaArea');
  var plantaType = document.getElementById('plantaType');
  var plantaDetail = document.getElementById('plantaDetail');

  function renderPlanta(i) {
    var p = PLANTAS[i];
    plantaIndex = i;
    plantaImg.src = p.image;
    plantaImg.width = p.w;
    plantaImg.height = p.h;
    plantaImg.alt = 'Planta de ' + p.area + ' do Parque Cândia';
    plantaImg.style.animation = 'none';
    void plantaImg.offsetWidth;
    plantaImg.style.animation = '';
    plantaArea.textContent = p.area;
    plantaType.textContent = p.type;
    plantaDetail.textContent = p.detail;
    plantaTabs.querySelectorAll('.tab').forEach(function (b, idx) {
      b.classList.toggle('is-active', idx === i);
      b.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    track('view_plant', { plant: p.tab, area: p.area });
  }

  if (plantaTabs) {
    PLANTAS.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'tab' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.textContent = p.tab;
      b.addEventListener('click', function () {
        renderPlanta(i);
        track('select_plant', { plant: p.tab });
      });
      plantaTabs.appendChild(b);
    });
    renderPlanta(0);
  }

  var plantaCta = document.getElementById('plantaCta');
  if (plantaCta) {
    plantaCta.addEventListener('click', function () {
      answers.property = PLANTAS[plantaIndex].type;
      track('cta_click', { action: 'ver_planta', plant: PLANTAS[plantaIndex].tab });
      scrollToId('simulador');
    });
  }

  /* ---------- Lazer ---------- */
  var LAZER = [
    { category: 'Lazer',       title: 'Piscina com borda infinita', image: 'assets/img/piscina.webp' },
    { category: 'Bem-estar',   title: 'Fitness',                    image: 'assets/img/fitness.webp' },
    { category: 'Esportes',    title: 'Quadra poliesportiva',       image: 'assets/img/quadra.jpg' },
    { category: 'Convivência', title: 'Espaço gourmet',             image: 'assets/img/gourmet.webp' },
    { category: 'Praticidade', title: 'Coworking',                  image: 'assets/img/coworking.webp' },
    { category: 'Rooftop',     title: 'Mirante no rooftop',         image: 'assets/img/rooftop.webp' }
  ];

  var lazerTabs = document.getElementById('lazerTabs');
  var lazerImg = document.getElementById('lazerImg');
  var lazerCat = document.getElementById('lazerCat');
  var lazerTitle = document.getElementById('lazerTitle');

  function renderLazer(i) {
    var a = LAZER[i];
    lazerImg.src = a.image;
    lazerImg.alt = a.title;
    lazerImg.style.animation = 'none';
    void lazerImg.offsetWidth;
    lazerImg.style.animation = '';
    lazerCat.textContent = a.category;
    lazerTitle.textContent = a.title;
    lazerTabs.querySelectorAll('.tab').forEach(function (b, idx) {
      b.classList.toggle('is-active', idx === i);
      b.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
  }

  if (lazerTabs) {
    LAZER.forEach(function (a, i) {
      var b = document.createElement('button');
      b.className = 'tab' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.textContent = a.category;
      b.addEventListener('click', function () {
        renderLazer(i);
        track('amenity_view', { amenity: a.category });
      });
      lazerTabs.appendChild(b);
    });
    renderLazer(0);
  }

  /* ---------- Momento (morar / investir) ---------- */
  var MOMENTO = {
    morar: [
      { t: 'Possibilidade MCMV',  d: 'Unidades HIS-2 e HMP, conforme regras e critérios aplicáveis.' },
      { t: 'Mobilidade diária',   d: 'Metrô em frente e conexões rápidas com diferentes pontos da cidade.' },
      { t: 'Planejamento',        d: 'Uma simulação individual ajuda a entender o cenário de compra.' }
    ],
    investir: [
      { t: 'Compra na planta',    d: 'Conheça as tipologias e avalie o momento do empreendimento.' },
      { t: 'Endereço estratégico',d: 'Butantã, metrô em frente e proximidade de polos relevantes.' },
      { t: 'Visão patrimonial',   d: 'Analise individualmente seu cenário, objetivos e possibilidades.' }
    ]
  };

  var CHECK_SVG = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 13 4 4 10-10"/></svg>';
  var momentoCards = document.getElementById('momentoCards');

  function renderMomento(key) {
    if (!momentoCards) return;
    momentoCards.innerHTML = MOMENTO[key].map(function (c) {
      return '<article class="momento-card">' + CHECK_SVG +
             '<h3>' + c.t + '</h3><p>' + c.d + '</p></article>';
    }).join('');
  }

  document.querySelectorAll('[data-momento]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-momento');
      document.querySelectorAll('[data-momento]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderMomento(key);
      track(key === 'morar' ? 'morar_click' : 'investment_click');
    });
  });
  renderMomento('morar');

  /* ---------- Simulador (Match Imobiliário) ---------- */
  var answers = { objective: '', property: '', priority: '' };
  var step = 0;
  var quiz = document.getElementById('quiz');
  var quizDone = document.getElementById('quizDone');
  var quizBack = document.getElementById('quizBack');
  var progress = quiz ? quiz.querySelectorAll('.quiz__progress span') : [];

  function renderStep() {
    quiz.querySelectorAll('.quiz__step').forEach(function (s) {
      s.hidden = Number(s.getAttribute('data-step')) !== step;
    });
    progress.forEach(function (p, i) { p.classList.toggle('is-on', i <= step); });
    quizBack.hidden = step === 0;
  }

  quiz && quiz.querySelectorAll('.opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      if (step === 0) track('simulator_start');
      var field = opt.getAttribute('data-field');
      var value = opt.getAttribute('data-value');
      answers[field] = value;
      track('simulator_step', { step: step + 1, field: field, value: value });
      setTimeout(function () { step = Math.min(step + 1, 3); renderStep(); }, 160);
    });
  });

  quizBack && quizBack.addEventListener('click', function () {
    step = Math.max(step - 1, 0);
    renderStep();
  });

  function waMessage(nome) {
    return 'Olá! Vim pelo site do Parque Cândia e gostaria de receber uma simulação. ' +
           'Meu objetivo é ' + (answers.objective || 'conhecer o empreendimento') + ' e tenho interesse em ' +
           (answers.property || 'entender as opções de imóvel') + '. ' +
           (answers.priority ? 'O que mais importa para mim é: ' + answers.priority + '. ' : '') +
           'Meu nome é ' + nome + '.';
  }

  var leadForm = document.getElementById('leadForm');
  if (leadForm) {
    var formStarted = false;
    leadForm.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('focus', function () {
        if (formStarted) return;
        formStarted = true;
        track('form_start');
      });
    });

    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('leadNome').value.trim();
      var tel = document.getElementById('leadTel').value;
      var erro = document.getElementById('leadError');
      var digits = tel.replace(/\D/g, '');

      if (!nome || digits.length < 10) { erro.hidden = false; return; }
      erro.hidden = true;

      var payload = {
        nome: nome,
        whatsapp: tel,
        whatsapp_numeros: digits,
        objetivo: answers.objective,
        imovel: answers.property,
        prioridade: answers.priority,
        utm_source: origem.utm_source || '',
        utm_medium: origem.utm_medium || '',
        utm_campaign: origem.utm_campaign || '',
        utm_term: origem.utm_term || '',
        utm_content: origem.utm_content || '',
        gclid: origem.gclid || '',
        referencia: origem.referencia || 'direto',
        pagina: location.href,
        enviado_em: new Date().toISOString()
      };

      // Grava na planilha ANTES e INDEPENDENTE do WhatsApp: quem preenche o
      // formulário e não clica em "Falar pelo WhatsApp" também é registrado.
      enviarLead(payload);

      track('form_submit');
      track('simulator_complete', { objective: answers.objective });
      track('lead_generated', { objective: answers.objective, property: answers.property });
      trackConversion();

      quiz.hidden = true;
      quizDone.hidden = false;
      document.getElementById('quizDoneTitle').textContent = 'Perfeito, ' + nome.split(' ')[0] + '.';
      document.getElementById('quizWa').onclick = function () { openWhatsApp(waMessage(nome), 'quiz_result'); };
      quizDone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Máscara simples de telefone ---------- */
  var tel = document.getElementById('leadTel');
  if (tel) {
    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) tel.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4);
      else if (v.length > 2) tel.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else tel.value = v;
    });
  }

  /* ---------- FAQ: tracking + um aberto por vez ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      track('faq_open', { question: item.querySelector('summary').textContent.trim() });
      faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Page view + reenvio de leads pendentes ---------- */
  track('page_view');
  reenviarPendentes();
})();
