// ═══════════════════════════════════════════════════════════════════
// ECS — Backend Integration
// Supabase + N8N + localStorage cache
// N8N: http://177.8.224.178:5678
// Supabase: https://vfxocmjcumjhrnahyoep.supabase.co
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// ECS v5 — BACKEND: localStorage + N8N → Supabase
// Fluxo: HTML → N8N :5678 (sem CORS) → Supabase
// localStorage = cache local (persiste refresh)
// ═══════════════════════════════════════════════════════════════════

var SB_URL = 'https://vfxocmjcumjhrnahyoep.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeG9jbWpjdW1qaHJuYWh5b2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTcyMTcsImV4cCI6MjA5NzA3MzIxN30.6l3x56XQF7Chruzikks5Ql6npzaM_ct3txxTXCFDq-k';
var N8N = localStorage.getItem('ecs_n8n') || 'http://177.8.224.178:5678';
var _sb = null;

// ── Supabase SDK init ────────────────────────────────────────────────
function initSB() {
  if (_sb) return _sb;
  try { _sb = window.supabase.createClient(SB_URL, SB_KEY); } catch(e) {}
  return _sb;
}

// ── localStorage cache ───────────────────────────────────────────────
var CACHE = {
  get: function(k) { try { return JSON.parse(localStorage.getItem('ecs_cache_'+k)||'[]'); } catch(e){ return []; } },
  set: function(k,d) { try { localStorage.setItem('ecs_cache_'+k, JSON.stringify(d)); } catch(e){} },
  push: function(k,item) {
    var a=CACHE.get(k); var i=a.findIndex(function(x){return x.id===item.id;});
    if(i>=0) a[i]=item; else a.unshift(item); CACHE.set(k,a); return a;
  },
  update: function(k,id,ch) {
    var a=CACHE.get(k); var i=a.findIndex(function(x){return x.id===id;});
    if(i>=0){ a[i]=Object.assign({},a[i],ch); CACHE.set(k,a); } return a;
  }
};

// ── N8N fetch helper ────────────────────────────────────────────────
function n8n(path, body) {
  if(!N8N) return Promise.resolve(null);
  return fetch(N8N+'/webhook/'+path, {
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify(body)
  }).then(function(r){ return r.ok ? r.json() : null; })
  .catch(function(e){ console.warn('N8N '+path+':', e.message||e); return null; });
}

// ── MATRÍCULA ────────────────────────────────────────────────────────
function sbSaveMatricula(mat) {
  var id_local = mat.id_local || ('ECS-'+Math.random().toString(36).toUpperCase().slice(2,10));
  var precos = {mensal:129.90, trimestral:99.90, anual:79.90};
  var valor = precos[mat.plano] || 129.90;
  if(mat.desconto>0) valor = valor*(1-mat.desconto/100);
  valor = Math.round(valor*100)/100;
  var reg = {id:id_local, id_local:id_local, aluno:mat.nome, nome:mat.nome, email:mat.email,
    telefone:mat.tel||'', cidade:mat.cidade||'', estado:mat.estado||'', nivel:mat.nivel||'iniciante',
    trilha:mat.trilha, plano:mat.plano, valor:valor, desconto:mat.desconto||0, cupom:mat.cupom||'',
    status:'pendente', data:new Date().toISOString().slice(0,10), created_at:new Date().toISOString()};
  CACHE.push('matriculas', reg); MATS.unshift(reg);
  var uReg = {id:id_local, nome:mat.nome, email:mat.email, role:'aluno', trilha:mat.trilha,
    status:'ativo', prog:0, last:'agora', nota:0, turma:mat.trilha, created_at:new Date().toISOString()};
  CACHE.push('usuarios', uReg); ALUNOS.unshift(uReg);
  n8n('ecs-matricula', Object.assign({}, mat, {id_local:id_local, valor:valor}));
  return Promise.resolve({userId:id_local, success:true});
}

// ── APROVAR MATRÍCULA ────────────────────────────────────────────────
function sbAprovarMatricula(id) {
  CACHE.update('matriculas',id,{status:'aprovada'});
  var m=MATS.find(function(x){return x.id===id;}); if(m) m.status='aprovada';
  return n8n('ecs-matricula-aprovada', {id_local:id, status:'aprovada', ts:new Date().toISOString()});
}

// ── CANCELAR MATRÍCULA ───────────────────────────────────────────────
function sbCancelarMatricula(id){
  CACHE.update('matriculas',id,{status:'cancelada'});
  var m=MATS.find(function(x){return x.id===id;}); if(m) m.status='cancelada';
  if(N8N) fetch(N8N+'/webhook/ecs-matricula-aprovada',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({id_local:id, status:'cancelada', ts:new Date().toISOString()})
  }).catch(function(){});
  return Promise.resolve();
}

function sbAdicionarUsuario(dados, role) {
  var id_local = 'USR-'+Math.random().toString(36).toUpperCase().slice(2,10);
  var reg = {id:id_local, nome:dados.nome, email:dados.email, role:role||'aluno',
    turma:dados.trilha||'blue_team', prog:0, status:'ativo', last:'agora', nota:0,
    created_at:new Date().toISOString()};
  if(role==='aluno') { CACHE.push('usuarios',reg); ALUNOS.unshift(reg); }
  if(role==='professor') { PROFS.unshift(Object.assign({},reg,{disc:dados.disc||'Cibersegurança',turmas:0,alunos:0,nota:4.8})); }
  return n8n('ecs-aluno', Object.assign({},dados,{role:role||'aluno'}));
}

// ── CERTIFICADO ──────────────────────────────────────────────────────
function sbSalvarCertificado(hash, nomeAluno, cursoNome) {
  var u = getUser()||{};
  return n8n('ecs-certificado', {
    usuario_id: u.id&&u.id.length===36 ? u.id : null,
    curso_id: null,
    hash: hash,
    nome_aluno: nomeAluno||u.nome||'',
    email: u.email||''
  });
}

// ── CHAMADO ──────────────────────────────────────────────────────────
function sbAbrirChamado(assunto, descricao, prioridade) {
  var u=getUser()||{};
  var id=Date.now()+'';
  var reg={id:id, id_chamado:'#'+id.slice(-4), aluno:u.nome||'Aluno', assunto:assunto,
    descricao:descricao, prio:prioridade||'media', status:'aberto',
    data:new Date().toISOString().slice(0,10), created_at:new Date().toISOString()};
  CACHE.push('chamados',reg); CHAMS.unshift(reg);
  return n8n('ecs-chamado', {action:'abrir', autor_id:u.id&&u.id.length===36?u.id:null,
    assunto:assunto, descricao:descricao||'', prioridade:prioridade||'media'});
}

function sbResolverChamado(id) {
  CACHE.update('chamados',id,{status:'resolvido'});
  var c=CHAMS.find(function(x){return x.id===id;}); if(c) c.status='resolvido';
  return n8n('ecs-chamado', {action:'resolver', id:id, ts:new Date().toISOString()});
}

function sbEnviarMensagem(chamadoId, mensagem) {
  var u=getUser()||{};
  return n8n('ecs-mensagem', {chamado_id:chamadoId, autor_id:u.id||null, mensagem:mensagem});
}

// ── PROGRESSO ────────────────────────────────────────────────────────
function sbSalvarProgresso(aulaId, cursoId, xp) {
  var u=getUser()||{};
  return n8n('ecs-progresso', {usuario_id:u.id||null, aula_id:aulaId, curso_id:cursoId, xp:xp||10});
}

// ── BASE DE CONHECIMENTO ─────────────────────────────────────────────
function sbSalvarKB(item) {
  CACHE.push('kb',{id:Date.now()+'', prob:item.problema, cat:item.categoria||'outro',
    status:'resolvido', created_at:new Date().toISOString()});
  return n8n('ecs-aprender', {problema:item.problema, solucao:item.solucao, categoria:item.categoria||'outro'});
}

// ── TURMA ────────────────────────────────────────────────────────────
function sbCriarTurma(dados) {
  var id=Date.now()+'';
  var reg={id:id, nome:dados.nome, trilha:dados.trilha, prof:'—', alunos:0,
    inicio:new Date().toISOString().slice(0,10), status:'ativo'};
  TURMAS.unshift(reg);
  return n8n('ecs-turma', dados);
}

// ── AULA ─────────────────────────────────────────────────────────────
function sbCriarAula(dados) {
  return n8n('ecs-aula', dados);
}

// ── AVALIAÇÃO ────────────────────────────────────────────────────────
function sbCriarAvaliacao(dados) {
  return n8n('ecs-avaliacao', Object.assign({action:'criar'}, dados));
}

function sbLancarNota(avalId, userId, nota, feedback) {
  return n8n('ecs-avaliacao', {action:'nota', avaliacao_id:avalId, usuario_id:userId, nota:nota, feedback:feedback||''});
}

// ── FINANCEIRO ───────────────────────────────────────────────────────
function sbRegistrarFinanceiro(userId, matriculaId, descricao, valor) {
  var reg={id:Date.now()+'', usuario_id:userId, matricula_id:matriculaId,
    descricao:descricao||'Mensalidade', valor:valor||129.90, status:'pendente',
    created_at:new Date().toISOString()};
  CACHE.push('financeiro',reg);
  return n8n('ecs-financeiro', reg);
}

// ── CONFIG & SYNC ────────────────────────────────────────────────────
function sbSaveConfig(n8nUrl, sbKey) {
  if(n8nUrl){ N8N=n8nUrl; localStorage.setItem('ecs_n8n',n8nUrl); }
  if(sbKey){ SB_KEY=sbKey; localStorage.setItem('ecs_sb_key',sbKey); _sb=null; }
}

function sbTestConnection() {
  if(!N8N) return Promise.resolve(false);
  return fetch(N8N+'/webhook/ecs-painel?tipo=alunos',{method:'GET',mode:'cors'})
    .then(function(r){ return r.ok; }).catch(function(){ return false; });
}

function loadCacheToArrays() {
  var m=CACHE.get('matriculas'); if(m.length){ MATS.length=0; m.forEach(function(x){MATS.push(x);}); }
  var u=CACHE.get('usuarios');   if(u.length){ ALUNOS.length=0; u.forEach(function(x){ALUNOS.push(x);}); }
  var c=CACHE.get('chamados');   if(c.length){ CHAMS.length=0; c.forEach(function(x){CHAMS.push(x);}); }
}

function syncFromSupabase() {
  if(!N8N) return;
  function load(tipo, cb) {
    fetch(N8N+'/webhook/ecs-painel?tipo='+tipo,{method:'GET',mode:'cors'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(resp){ if(resp&&resp.data) cb(resp.data); })
    .catch(function(){});
  }
  load('matriculas',function(d){
    var local=CACHE.get('matriculas').filter(function(l){return !d.find(function(s){return s.id===l.id||s.id_supabase===l.id;});});
    var merged=d.concat(local); CACHE.set('matriculas',merged);
    MATS.length=0; merged.forEach(function(m){MATS.push(m);}); renderAdmMats(); renderAdmDash();
  });
  load('alunos',function(d){
    var local=CACHE.get('usuarios').filter(function(l){return !d.find(function(s){return s.email===l.email;});});
    var merged=d.concat(local); CACHE.set('usuarios',merged);
    ALUNOS.length=0; merged.forEach(function(u){ALUNOS.push(u);}); renderAdmAlunos();
  });
  load('chamados',function(d){
    CACHE.set('chamados',d); CHAMS.length=0; d.forEach(function(c){CHAMS.push(c);}); renderAdmChams();
  });
  load('logs',function(d){
    CACHE.set('logs',d);
    var el=document.getElementById('adm-logs'); if(!el) return;
    el.innerHTML=d.map(function(l){
      var bg=l.acao&&l.acao.includes('matricula')?'rgba(0,229,212,.1)':'rgba(59,130,246,.1)';
      return '<div class="act-row"><div class="act-ico" style="background:'+bg+'">📋</div><div class="act-txt"><b>'+l.acao+'</b>'+(l.usuario_nome&&l.usuario_nome!=='—'?' — '+l.usuario_nome:'')+'</div><div class="act-time">'+(l.created_at||'').slice(0,16).replace('T',' ')+'</div></div>';
    }).join('');
  });
  load('financeiro',function(d){ CACHE.set('financeiro',d); FIN.length=0; d.forEach(function(f){FIN.push(f);}); renderAdmFin(); });
  load('kb',function(d){ CACHE.set('kb',d); KB_DB.length=0; d.forEach(function(k){KB_DB.push(k);}); renderPrKB(); });
}
