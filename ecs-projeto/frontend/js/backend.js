// ═══════════════════════════════════════════════════════════════════
// ECS — Backend Integration (Supabase + N8N)
// Configuração, cache localStorage e funções de persistência
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// ECS v5 — BACKEND: localStorage + N8N → Supabase
// Fluxo: HTML → N8N webhook (sem CORS) → Supabase
// localStorage = cache local (persiste refresh)
// N8N = intermediário que salva no Supabase
// ═══════════════════════════════════════════════════════════════════

var SB_URL = 'https://vfxocmjcumjhrnahyoep.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeG9jbWpjdW1qaHJuYWh5b2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTcyMTcsImV4cCI6MjA5NzA3MzIxN30.6l3x56XQF7Chruzikks5Ql6npzaM_ct3txxTXCFDq-k';
var N8N = localStorage.getItem('ecs_n8n') || 'http://177.8.224.178:5678';
var _sb = null; // Supabase client

// Init Supabase client (from CDN)
function initSB() {
  if (_sb) return _sb;
  try {
    _sb = window.supabase.createClient(SB_URL, SB_KEY);
  } catch(e) {
    console.warn('Supabase SDK not loaded, using fetch fallback');
  }
  return _sb;
}

// ── LOCAL STORAGE CACHE ─────────────────────────────────────────────
// Keys: ecs_matriculas | ecs_usuarios | ecs_chamados | ecs_logs | ecs_kb | ecs_fin
var CACHE = {
  get: function(key) {
    try { return JSON.parse(localStorage.getItem('ecs_cache_'+key) || '[]'); } catch(e) { return []; }
  },
  set: function(key, data) {
    try { localStorage.setItem('ecs_cache_'+key, JSON.stringify(data)); } catch(e) {}
  },
  push: function(key, item) {
    var arr = CACHE.get(key);
    // Avoid duplicates by id
    var idx = arr.findIndex(function(x){ return x.id === item.id; });
    if (idx >= 0) arr[idx] = item; else arr.unshift(item);
    CACHE.set(key, arr);
    return arr;
  },
  update: function(key, id, changes) {
    var arr = CACHE.get(key);
    var idx = arr.findIndex(function(x){ return x.id === id; });
    if (idx >= 0) { arr[idx] = Object.assign({}, arr[idx], changes); CACHE.set(key, arr); }
    return arr;
  }
};

// ── SUPABASE REST (direct fetch, works from file://) ────────────────
function sbQ(table, opts) {
  var sb = initSB();
  if (!sb) return Promise.resolve([]);
  opts = opts || {};
  var q = sb.from(table);
  if (opts.select) q = q.select(opts.select); else q = q.select('*');
  if (opts.eq)     { Object.keys(opts.eq).forEach(function(k){ q = q.eq(k, opts.eq[k]); }); }
  if (opts.order)  q = q.order(opts.order, { ascending: false });
  if (opts.limit)  q = q.limit(opts.limit);
  return q.then(function(r){ return r.data || []; }).catch(function(){ return []; });
}

function sbInsert(table, row) {
  var sb = initSB();
  if (!sb) return Promise.resolve(null);
  return sb.from(table).insert(row).select().then(function(r){ return r.data; }).catch(function(e){ console.warn('SB insert error:', e); return null; });
}

function sbUpdate(table, id, changes) {
  var sb = initSB();
  if (!sb) return Promise.resolve(null);
  return sb.from(table).update(changes).eq('id', id).then(function(r){ return r.data; }).catch(function(e){ console.warn('SB update error:', e); return null; });
}

// ── SAVE FUNCTIONS (localStorage first, then Supabase) ──────────────

// Salvar matrícula
function sbSaveMatricula(mat) {
  var id_local = mat.id_local || ('ECS-'+Math.random().toString(36).toUpperCase().slice(2,10));
  var preco = { mensal:129.90, trimestral:99.90, anual:79.90 };
  var valor = preco[mat.plano] || 129.90;
  if (mat.desconto > 0) valor = valor * (1 - mat.desconto/100);
  valor = Math.round(valor * 100) / 100;

  var registro = {
    id:         id_local,
    id_local:   id_local,
    aluno:      mat.nome,
    nome:       mat.nome,
    email:      mat.email,
    telefone:   mat.tel || '',
    cidade:     mat.cidade || '',
    estado:     mat.estado || '',
    nivel:      mat.nivel || 'iniciante',
    trilha:     mat.trilha,
    plano:      mat.plano,
    valor:      valor,
    desconto:   mat.desconto || 0,
    cupom:      mat.cupom || '',
    status:     'pendente',
    data:       new Date().toISOString().slice(0,10),
    created_at: new Date().toISOString()
  };

  // 1. Salvar no localStorage IMEDIATAMENTE
  CACHE.push('matriculas', registro);
  // Também atualizar array MATS em memória
  MATS.unshift(registro);

  // 2. Salvar usuario no cache
  var userCache = {
    id:     id_local,
    nome:   mat.nome,
    email:  mat.email,
    role:   'aluno',
    trilha: mat.trilha,
    status: 'ativo',
    prog:   0,
    last:   'agora',
    nota:   0,
    turma:  mat.trilha,
    created_at: new Date().toISOString()
  };
  CACHE.push('usuarios', userCache);
  ALUNOS.unshift(userCache);

  // 3. Log
  var logItem = { id: Date.now()+'', acao:'matricula_criada', usuario_nome:mat.nome, detalhes:{trilha:mat.trilha,plano:mat.plano}, created_at:new Date().toISOString() };
  CACHE.push('logs', logItem);

  // 4. Enviar para N8N (que salva no Supabase) — funciona de file:// sem CORS
  function enviarN8N() {
    if (!N8N) { console.info('N8N não configurado — dados salvos localmente'); return; }
    fetch(N8N+'/webhook/ecs-matricula', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      mode: 'cors',
      body: JSON.stringify(Object.assign({}, mat, {id_local:id_local, valor:valor}))
    })
    .then(function(r){ return r.json(); })
    .then(function(resp){
      if(resp && resp.success) console.info('✓ Matrícula salva no Supabase via N8N');
    })
    .catch(function(e){ console.warn('N8N não alcançado (dados no localStorage):', e.message||e); });
  }
  enviarN8N();

  return Promise.resolve({ userId: id_local, success: true });
}

// Aprovar matrícula
function sbAprovarMatricula(id, adminId) {
  CACHE.update('matriculas', id, { status: 'aprovada' });
  var idx = MATS.findIndex(function(x){ return x.id===id; });
  if (idx>=0) MATS[idx].status = 'aprovada';

  if (N8N) fetch(N8N+'/webhook/ecs-matricula-aprovada', {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({id_local:id, aprovado:true, aprovado_por:adminId, ts:new Date().toISOString()})
  }).catch(function(){});
  return Promise.resolve();
}

// Adicionar aluno (admin)
function sbAdicionarAluno(dados, adminId) {
  var id_local = 'USR-'+Math.random().toString(36).toUpperCase().slice(2,10);
  var novoAluno = {
    id: id_local, nome: dados.nome, email: dados.email,
    turma: dados.trilha||'blue_team', trilha: dados.trilha||'blue_team',
    prog: 0, status: 'ativo', last: 'agora', nota: 0,
    created_at: new Date().toISOString()
  };
  CACHE.push('usuarios', novoAluno);
  ALUNOS.unshift(novoAluno);

  // Mat aprovada automática
  var matItem = { id:id_local+'_m', id_local:id_local+'_m', aluno:dados.nome, nome:dados.nome, email:dados.email, trilha:dados.trilha||'blue_team', plano:'mensal', valor:129.90, status:'aprovada', data:new Date().toISOString().slice(0,10), created_at:new Date().toISOString() };
  CACHE.push('matriculas', matItem);
  MATS.unshift(matItem);

  if (N8N) fetch(N8N+'/webhook/ecs-aluno', {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({nome:dados.nome, email:dados.email, trilha:dados.trilha||'blue_team', origem:'admin'})
  }).catch(function(){});

  return Promise.resolve([novoAluno]);
}

// Salvar KB
function sbSalvarKB(item, autorId) {
  var kbItem = { id: Date.now()+'', problema:item.problema, solucao:item.solucao, categoria:item.categoria||'outro', status:'resolvido', created_at:new Date().toISOString() };
  CACHE.push('kb', kbItem);

  if (N8N) fetch(N8N+'/webhook/ecs-aprender', {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify(item)
  }).catch(function(){});
  return Promise.resolve();
}

// Abrir chamado
function sbAbrirChamado(userId, assunto, descricao) {
  var c = { id: Date.now()+'', id_chamado:'#'+Date.now(), aluno:'Eu', assunto:assunto, descricao:descricao, prio:'media', status:'aberto', data:new Date().toISOString().slice(0,10), created_at:new Date().toISOString() };
  CACHE.push('chamados', c);
  if (N8N) fetch(N8N+'/webhook/ecs-chamado', {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({assunto:assunto, descricao:descricao, prioridade:'media', autor_email:userId||''})
  }).catch(function(){});
  return Promise.resolve(c);
}

// Resolver chamado
function sbResolverChamado(id, profId) {
  CACHE.update('chamados', id, { status: 'resolvido' });
  CHAMS.forEach(function(c){ if(c.id===id) c.status='resolvido'; });
  if (N8N) fetch(N8N+'/webhook/ecs-chamado', {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({action:'resolver', id:id, resolvido_por:profId, ts:new Date().toISOString()})
  }).catch(function(){});
  return Promise.resolve();
}

// Salvar configurações
function sbSaveConfig(n8nUrl, sbKey) {
  if (n8nUrl) { N8N = n8nUrl; localStorage.setItem('ecs_n8n', n8nUrl); }
  if (sbKey)  { SB_KEY = sbKey; localStorage.setItem('ecs_sb_key', sbKey); _sb = null; }
}

// Testar conexão
function sbTestConnection() {
  if (!N8N) return Promise.resolve(false);
  return fetch(N8N+'/webhook/ecs-painel?tipo=alunos', {
    method:'GET', mode:'cors'
  })
  .then(function(r){ return r.ok; })
  .catch(function(){ return false; });
}

// ── CARREGAR DADOS VIA N8N Painel → Supabase ───────────────────────
function syncFromSupabase() {
  if (!N8N) return;

  function loadTipo(tipo, callback) {
    fetch(N8N+'/webhook/ecs-painel?tipo='+tipo, {method:'GET', mode:'cors'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(resp){ if(resp && resp.data) callback(resp.data); })
    .catch(function(e){ console.warn('sync '+tipo+':', e.message||e); });
  }

  // Matrículas
  loadTipo('matriculas', function(data) {
    var localOnly = CACHE.get('matriculas').filter(function(local){
      return !data.find(function(sb){ return sb.id===local.id || sb.id_supabase===local.id; });
    });
    var merged = data.concat(localOnly);
    CACHE.set('matriculas', merged);
    MATS.length=0; merged.forEach(function(m){ MATS.push(m); });
    renderAdmMats(); renderAdmDash();
  });

  // Alunos
  loadTipo('alunos', function(data) {
    var localOnly = CACHE.get('usuarios').filter(function(local){
      return !data.find(function(sb){ return sb.email===local.email; });
    });
    var merged = data.concat(localOnly);
    CACHE.set('usuarios', merged);
    ALUNOS.length=0; merged.forEach(function(u){ ALUNOS.push(u); });
    renderAdmAlunos();
  });

  // Chamados
  loadTipo('chamados', function(data) {
    CACHE.set('chamados', data);
    CHAMS.length=0; data.forEach(function(c){ CHAMS.push(c); });
    renderAdmChams();
  });

  // Logs
  loadTipo('logs', function(data) {
    CACHE.set('logs', data);
    var el=document.getElementById('adm-logs'); if(!el) return;
    el.innerHTML=data.map(function(l){
      var bg=l.acao&&l.acao.includes('matricula')?'rgba(0,229,212,.1)':l.acao&&l.acao.includes('erro')?'rgba(239,68,68,.1)':'rgba(59,130,246,.1)';
      return '<div class="act-row"><div class="act-ico" style="background:'+bg+'">📋</div><div class="act-txt"><b>'+l.acao+'</b>'+(l.usuario_nome&&l.usuario_nome!=='—'?' — '+l.usuario_nome:'')+'</div><div class="act-time">'+(l.created_at||'').slice(0,16).replace('T',' ')+'</div></div>';
    }).join('');
  });

  // Financeiro
  loadTipo('financeiro', function(data) {
    CACHE.set('financeiro', data);
    FIN.length=0; data.forEach(function(f){ FIN.push(f); });
    renderAdmFin();
  });

  // KB do Professor
  loadTipo('kb', function(data) {
    CACHE.set('kb', data);
    KB_DB.length=0; data.forEach(function(k){ KB_DB.push({id:k.id,prob:k.prob,cat:k.cat,status:k.status}); });
    renderPrKB();
  });
}

// ── LOAD CACHE into runtime arrays on page start ─────────────────────
function loadCacheToArrays() {
  var mats = CACHE.get('matriculas');
  if (mats.length) { MATS.length=0; mats.forEach(function(m){ MATS.push(m); }); }

  var users = CACHE.get('usuarios');
  if (users.length) { ALUNOS.length=0; users.forEach(function(u){ ALUNOS.push(u); }); }

  var chams = CACHE.get('chamados');
  if (chams.length) { CHAMS.length=0; chams.forEach(function(c){ CHAMS.push(c); }); }
}


// ═══════════════════════════════════════════════════════════════════
// ECS — BACKEND SUPABASE (integração completa)
// Substitui todas as funções mock por chamadas reais ao Supabase REST API
// ═══════════════════════════════════════════════════════════════════
