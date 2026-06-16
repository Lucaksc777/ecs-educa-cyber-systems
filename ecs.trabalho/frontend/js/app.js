// ═══════════════════════════════════════════════════════════════════
// ECS — Frontend Application
// Router, Portais, UI, Mentor IA, Matrícula
// ═══════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════
// ECS — FRONT-END (Router, UI, Portais)
// ═══════════════════════════════════════════════════════════════════

var N8N = localStorage.getItem('ecs_n8n') || 'https://SEU_N8N.com';
var SB_URL = 'https://vfxocmjcumjhrnahyoep.supabase.co';
var SB_KEY = localStorage.getItem('ecs_sb_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeG9jbWpjdW1qaHJuYWh5b2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTcyMTcsImV4cCI6MjA5NzA3MzIxN30.6l3x56XQF7Chruzikks5Ql6npzaM_ct3txxTXCFDq-k';

function getUser(){ try{ return JSON.parse(localStorage.getItem('ecs_user')||'null'); }catch(e){ return null; } }
function loggedIn(){ return getUser()!==null; }
function myRole(){ var u=getUser(); return u?u.role:''; }

function showT(msg,type){
  var c=document.getElementById('toasts');
  var t=document.createElement('div');
  t.className='t t'+(type||'i');
  t.textContent=msg;
  c.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); },4000);
}

// Router
function go(id){
  if(!id) id='home';
  var PORTAL=['painel-aluno','painel-professor','painel-admin'];
  if(PORTAL.indexOf(id)>=0 && !loggedIn()){ openLogin(); return; }
  if(id==='painel-aluno'){
    var r=myRole();
    if(r==='admin') id='painel-admin';
    else if(r==='professor') id='painel-professor';
  }
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var pg=document.getElementById('p-'+id);
  if(!pg){ id='home'; pg=document.getElementById('p-home'); }
  pg.classList.add('active'); pg.scrollTop=0;
  var nav=document.getElementById('nav');
  if(PORTAL.indexOf(id)>=0||id==='mentor-ia') nav.classList.add('off');
  else nav.classList.remove('off');
  document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('on'); });
  var lnk=document.querySelector('.nav-link[data-p="'+id+'"]');
  if(lnk) lnk.classList.add('on');
  history.pushState(null,'','#'+id);
  if(id==='painel-aluno') initAluno();
  if(id==='painel-professor') initProf();
  if(id==='painel-admin') initAdmin();
  if(id==='mentor-ia') initMentor();
  if(id==='matricula') initMat();
  if(id==='blue-team') initBluePage();
  if(id==='red-team') initRedPage();
  if(id==='home') initFAQ();
}
window.navigateTo=go;

// Login
var DEMOS={
  aluno:{email:'aluno@ecs.com',pass:'123456',nome:'Lucas Pereira',role:'aluno'},
  professor:{email:'prof@ecs.com',pass:'prof123',nome:'Prof. Roberto',role:'professor'},
  admin:{email:'admin@ecs.com',pass:'admin123',nome:'Admin ECS',role:'admin'},
};
function openLogin(){ document.getElementById('lm').classList.add('on'); }
function closeLogin(){ document.getElementById('lm').classList.remove('on'); }
function setRole(btn,r){
  document.querySelectorAll('.lm-tab').forEach(function(t){ t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById('lm-role').value=r;
  var d=DEMOS[r];
  document.getElementById('lm-hint').innerHTML='<div class="lm-hint-ttl">DEMO — '+r.toUpperCase()+'</div><b>'+d.email+'</b> / <b>'+d.pass+'</b>';
  document.getElementById('lm-email').value='';
  document.getElementById('lm-pass').value='';
  document.getElementById('lm-err').textContent='';
}
function doLogin(){
  var email=document.getElementById('lm-email').value.trim();
  var pass=document.getElementById('lm-pass').value.trim();
  var role=document.getElementById('lm-role').value;
  var err=document.getElementById('lm-err');
  var btn=document.getElementById('lm-btn');
  err.textContent='';
  var m=null;
  for(var r in DEMOS){ if(DEMOS[r].email===email&&DEMOS[r].pass===pass){ m=DEMOS[r]; break; } }
  if(!m&&DEMOS[role]&&DEMOS[role].pass===pass) m=DEMOS[role];
  if(!m){ err.textContent='Credenciais invalidas.'; return; }
  btn.textContent='Autenticando...'; btn.disabled=true;
  setTimeout(function(){
    localStorage.setItem('ecs_user',JSON.stringify({nome:m.nome,email:m.email,role:m.role,trilha:m.role==='aluno'?'blue_team':'',id:'demo-'+m.role}));
    closeLogin(); showT('Bem-vindo(a), '+m.nome+'!','s');
    btn.textContent='Entrar no Sistema'; btn.disabled=false;
    if(m.role==='admin') go('painel-admin');
    else if(m.role==='professor') go('painel-professor');
    else go('painel-aluno');
  },700);
}
function logout(){
  localStorage.removeItem('ecs_user');
  showT('Ate logo!','i');
  setTimeout(function(){ go('home'); },600);
}

// Modal
var MODALS={
  'add-content':{title:'Nova Aula',body:'<div class="fg"><div class="fl">Titulo</div><input type="text" class="fi" placeholder="Titulo da aula"/></div><div class="fg"><div class="fl">Tipo</div><select class="fs"><option>Video</option><option>PDF</option></select></div><div style="display:flex;gap:9px;margin-top:14px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button><button class="btn btn-cy btn-sm" onclick="showT(\'Aula salva!\',\'s\');closeModal()">Salvar</button></div>'},
  'add-aluno':{title:'Novo Aluno',body:'<div class="fgrid"><div class="fg"><div class="fl">Nome</div><input type="text" class="fi" id="na-nome" placeholder="Nome completo"/></div><div class="fg"><div class="fl">E-mail</div><input type="email" class="fi" id="na-email" placeholder="email@..."/></div></div><div class="fg"><div class="fl">Trilha</div><select class="fs" id="na-trilha"><option value="blue_team">Blue Team</option><option value="red_team">Red Team</option><option value="forense">Forense</option><option value="full_cyber">Full Cyber</option></select></div><div style="display:flex;gap:9px;margin-top:14px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button><button class="btn btn-cy btn-sm" onclick="admAddAluno()">Adicionar</button></div>'},
  'add-prof':{title:'Novo Professor',body:'<div class="fg"><div class="fl">Nome</div><input type="text" class="fi" id="np-nome" placeholder="Prof. Nome Sobrenome"/></div><div class="fg"><div class="fl">E-mail</div><input type="email" class="fi" id="np-email" placeholder="prof@ecs.com"/></div><div style="display:flex;gap:9px;margin-top:14px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button><button class="btn btn-cy btn-sm" onclick="showT(\'Professor adicionado!\',\'s\');closeModal()">Adicionar</button></div>'},
  'add-turma':{title:'Nova Turma',body:'<div class="fg"><div class="fl">Nome</div><input type="text" class="fi" id="nt-nome" placeholder="Blue Team Turma A-2026"/></div><div class="fg"><div class="fl">Trilha</div><select class="fs" id="nt-trilha"><option value="blue_team">Blue Team</option><option value="red_team">Red Team</option><option value="forense">Forense</option><option value="full_cyber">Full Cyber</option></select></div><div class="fg"><div class="fl">Max Alunos</div><input type="number" class="fi" id="nt-max" value="30"/></div><div style="display:flex;gap:9px;margin-top:14px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button><button class="btn btn-cy btn-sm" onclick="admCriarTurma()">Criar</button></div>'},
};
function showModal(type){ var m=MODALS[type]; if(!m) return; document.getElementById('modal-title').textContent=m.title; document.getElementById('modal-body').innerHTML=m.body; document.getElementById('modal').classList.add('on'); }
function closeModal(){ document.getElementById('modal').classList.remove('on'); }

// Data
var CURSOS=[
  {id:1,title:'Blue Team Fundamentals',cat:'Blue Team',aulas:24,feitas:14,xp:420,cor:'#00e5d4',icon:'🛡️',desc:'SIEM, IDS/IPS, SOC e resposta a incidentes na pratica.',status:'ativo'},
  {id:2,title:'Pentest Web — OWASP Top 10',cat:'Red Team',aulas:18,feitas:18,xp:380,cor:'#ef4444',icon:'⚔️',desc:'SQL Injection, XSS, CSRF e toda a lista OWASP.',status:'concluido'},
  {id:3,title:'Analise de Malware',cat:'Forense',aulas:12,feitas:4,xp:120,cor:'#f59e0b',icon:'🔍',desc:'Analise estatica e dinamica com Volatility e Ghidra.',status:'ativo'},
];
var ALUNOS=[
  {id:1,nome:'Ana Lima',       email:'ana@m.com',    turma:'blue_team',prog:85,status:'ativo',  last:'ha 2h',   nota:9.2},
  {id:2,nome:'Carlos Souza',   email:'carlos@m.com', turma:'red_team', prog:60,status:'ativo',  last:'ha 5h',   nota:7.8},
  {id:3,nome:'Maria Oliveira', email:'maria@m.com',  turma:'forense',  prog:95,status:'ativo',  last:'ha 30min',nota:9.8},
  {id:4,nome:'Joao Santos',    email:'joao@m.com',   turma:'blue_team',prog:40,status:'ativo',  last:'ontem',   nota:6.5},
  {id:5,nome:'Pedro Costa',    email:'pedro@m.com',  turma:'red_team', prog:72,status:'ativo',  last:'ha 3h',   nota:8.1},
  {id:6,nome:'Beatriz Rocha',  email:'bea@m.com',    turma:'forense',  prog:30,status:'inativo',last:'3 dias',  nota:5.9},
];
var PROFS=[
  {id:1,nome:'Prof. Roberto Silva', disc:'Blue Team e SOC',  turmas:2,alunos:18,nota:4.8},
  {id:2,nome:'Profa. Camila Torres',disc:'Red Team Ofensivo',turmas:1,alunos:15,nota:4.9},
  {id:3,nome:'Prof. Diego Alves',   disc:'Forense Digital',  turmas:1,alunos:14,nota:4.7},
];
var TURMAS=[
  {id:'blue_team',nome:'Blue Team Defensivo', prof:'Prof. Roberto', trilha:'Blue Team',alunos:18,inicio:'2026-03-01',status:'ativo'},
  {id:'red_team', nome:'Red Team Ofensivo',   prof:'Profa. Camila', trilha:'Red Team', alunos:15,inicio:'2026-03-15',status:'ativo'},
  {id:'forense',  nome:'Forense e Analise',   prof:'Prof. Diego',   trilha:'Forense',  alunos:14,inicio:'2026-03-20',status:'ativo'},
];
var MATS=[
  {id:1,aluno:'Lucas Pereira', trilha:'blue_team',plano:'mensal',    valor:129.90,data:'2026-06-07',status:'pendente'},
  {id:2,aluno:'Fernanda Lima', trilha:'red_team', plano:'trimestral',valor:99.90, data:'2026-06-06',status:'aprovada'},
  {id:3,aluno:'Rafael Souza',  trilha:'forense',  plano:'anual',     valor:79.90, data:'2026-06-05',status:'pendente'},
  {id:4,aluno:'Juliana Costa', trilha:'blue_team',plano:'mensal',    valor:129.90,data:'2026-06-04',status:'aprovada'},
  {id:5,aluno:'Marcos Neto',   trilha:'red_team', plano:'mensal',    valor:129.90,data:'2026-06-03',status:'pendente'},
];
var CHAMS=[
  {id:'#001',aluno:'Ana Lima',    assunto:'Erro Docker install',prio:'alta', data:'2026-06-07',status:'aberto'},
  {id:'#002',aluno:'Carlos Souza',assunto:'Webhook nao responde',prio:'media',data:'2026-06-06',status:'aberto'},
  {id:'#003',aluno:'Pedro Costa', assunto:'Supabase RLS',       prio:'baixa',data:'2026-06-05',status:'aberto'},
  {id:'#004',aluno:'Beatriz Rocha',assunto:'Acesso ao material',prio:'baixa',data:'2026-06-04',status:'resolvido'},
];
var FIN=[
  {aluno:'Ana Lima',    plano:'Mensal',    valor:'R$129,90',venc:'2026-07-01',status:'pago'},
  {aluno:'Carlos Souza',plano:'Trimestral',valor:'R$99,90', venc:'2026-07-15',status:'pago'},
  {aluno:'Joao Santos', plano:'Mensal',    valor:'R$129,90',venc:'2026-07-10',status:'pago'},
  {aluno:'Pedro Costa', plano:'Mensal',    valor:'R$129,90',venc:'2026-07-22',status:'pago'},
  {aluno:'Beatriz Rocha',plano:'Mensal',   valor:'R$129,90',venc:'2026-06-01',status:'atraso'},
];
var KB_DB=[
  {id:1,prob:'SIEM nao correlaciona logs',cat:'defesa',  status:'resolvido'},
  {id:2,prob:'Metasploit exploit failed',  cat:'pentest', status:'em aberto'},
];

function tname(t){ return {blue_team:'Blue Team',red_team:'Red Team',forense:'Forense',full_cyber:'Full Cyber'}[t]||t; }
function sbadge(s){
  if(['ativo','aprovada','pago','resolvido'].indexOf(s)>=0) return '<span class="badge bg-gr">'+s+'</span>';
  if(['pendente','atraso','em aberto'].indexOf(s)>=0) return '<span class="badge bg-am">'+s+'</span>';
  return '<span class="badge bg-rd">'+s+'</span>';
}
function pbadge(p){ return p==='alta'?'<span class="badge bg-rd">alta</span>':p==='media'?'<span class="badge bg-am">media</span>':'<span class="badge bg-cy">baixa</span>'; }
function pbar(v,cls){
  cls=cls||'pf';
  return '<span style="display:inline-flex;align-items:center;gap:6px"><span class="pb" style="width:80px"><span class="'+cls+'" style="width:'+v+'%"></span></span><span style="font-size:10px;color:var(--t3);font-family:var(--mono)">'+v+'%</span></span>';
}

// ── PORTAL ALUNO ──
function initAluno(){
  var u=getUser()||{nome:'Aluno'};
  var pts=u.nome.split(' ');
  var av=pts.map(function(p){return p[0];}).join('').slice(0,2).toUpperCase();
  var el;
  el=document.getElementById('al-av'); if(el) el.textContent=av;
  el=document.getElementById('al-name'); if(el) el.textContent=u.nome;
  el=document.getElementById('al-role'); if(el) el.textContent=(u.role||'aluno')+' · '+(u.trilha||'blue_team');
  el=document.getElementById('al-first'); if(el) el.textContent=pts[0];
  loadCacheToArrays();
  renderAlCourses(); renderAlActivity(); renderAlProgress(); renderAlCerts();
}
var AL_TITLES={dashboard:'Dashboard',cursos:'Meus Cursos',mentor:'Mentor IA',progresso:'Meu Progresso',certificados:'Certificados',suporte:'Suporte'};
function alView(v){
  document.querySelectorAll('#p-painel-aluno .pv').forEach(function(e){ e.classList.remove('on'); });
  var el=document.getElementById('alv-'+v); if(el) el.classList.add('on');
  document.querySelectorAll('#p-painel-aluno .sb-item').forEach(function(i){ i.classList.remove('on'); });
  var itm=document.querySelector('#p-painel-aluno .sb-item[onclick*="\''+v+'\'"]'); if(itm) itm.classList.add('on');
  el=document.getElementById('al-ptb-t'); if(el) el.textContent=AL_TITLES[v]||v;
}
function renderAlCourses(){
  var html=CURSOS.map(function(c){
    var p=Math.round(c.feitas/c.aulas*100);
    return '<div class="cc"><div class="cc-thumb" style="background:radial-gradient(circle,'+c.cor+'22,'+c.cor+'08)">'+c.icon+'</div><div class="cc-body"><span class="badge bg-cy" style="margin-bottom:7px">'+c.cat+'</span><div class="cc-title">'+c.title+'</div><div class="cc-desc">'+c.desc+'</div>'+pbar(p)+'</div></div>';
  }).join('');
  var g=document.getElementById('al-courses'); if(g) g.innerHTML=html;
  var gf=document.getElementById('al-courses-full'); if(gf) gf.innerHTML=html;
}
function renderAlActivity(){
  var acts=[
    {ico:'🛡',bg:'rgba(0,229,212,.1)',txt:'<b>Aula concluida:</b> SIEM - Correlacao de Logs',time:'ha 2h'},
    {ico:'⭐',bg:'rgba(245,158,11,.1)',txt:'<b>+80 XP</b> ganhos hoje',time:'ha 3h'},
    {ico:'✅',bg:'rgba(34,197,94,.1)',txt:'<b>Lab completado:</b> Nmap Avancado',time:'ha 5h'},
    {ico:'🏆',bg:'rgba(239,68,68,.1)',txt:'<b>Badge:</b> Primeiro Pentest desbloqueada',time:'ontem'},
  ];
  var el=document.getElementById('al-activity'); if(!el) return;
  el.innerHTML=acts.map(function(a){ return '<div class="act-row"><div class="act-ico" style="background:'+a.bg+'">'+a.ico+'</div><div class="act-txt">'+a.txt+'</div><div class="act-time">'+a.time+'</div></div>'; }).join('');
}
function renderAlProgress(){
  var el=document.getElementById('al-prog-table'); if(!el) return;
  el.innerHTML=CURSOS.map(function(c){
    var p=Math.round(c.feitas/c.aulas*100);
    var st=c.status==='concluido'?'<span class="badge bg-gr">Concluido</span>':'<span class="badge bg-am">Em andamento</span>';
    return '<tr><td>'+c.title+'</td><td>'+c.cat+'</td><td>'+c.feitas+'/'+c.aulas+'</td><td>'+pbar(p)+'</td><td style="color:var(--am);font-family:var(--mono)">'+c.xp+' XP</td><td>'+st+'</td></tr>';
  }).join('');
}
function renderAlCerts(){
  var el=document.getElementById('al-certs'); if(!el) return;
  var done=CURSOS.filter(function(c){ return c.status==='concluido'; });
  if(!done.length){ el.innerHTML='<p style="color:var(--t2);padding:20px">Conclua um curso para receber seu certificado!</p>'; return; }
  el.innerHTML=done.map(function(c){
    var hash='ECS-'+Math.abs(c.id*31337).toString(16).toUpperCase().slice(0,8);
    return '<div class="cc"><div class="cc-thumb" style="background:radial-gradient(circle,rgba(34,197,94,.15),rgba(34,197,94,.04))">🏆</div><div class="cc-body"><span class="badge bg-gr" style="margin-bottom:7px">CERTIFICADO</span><div class="cc-title">'+c.title+'</div><div class="cc-desc">'+c.aulas+' aulas . '+c.xp+' XP . Hash: '+hash+'</div><button class="btn btn-cy btn-sm" style="width:100%;justify-content:center;margin-top:8px" onclick="genCert('+c.id+')">Baixar Certificado</button></div></div>';
  }).join('');
}
function genCert(id){
  var c=CURSOS.find(function(x){return x.id===id;});
  var u=getUser()||{nome:'Aluno'};
  var hash='ECS-'+Date.now().toString(36).toUpperCase();
  var css='body{font-family:sans-serif;background:#07090f;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.w{text-align:center;border:2px solid rgba(0,229,212,.3);border-radius:14px;padding:48px;max-width:600px}.n{font-size:30px;font-weight:800;color:#00e5d4;margin:12px 0}.h{font-family:monospace;font-size:10px;color:rgba(0,229,212,.35);margin-top:8px}';
  var nm=u.nome||'Aluno'; var cn=c?c.title:'Curso ECS';
  var body='<div class="w"><p style="font-size:11px;letter-spacing:.3em;color:rgba(0,229,212,.6)">ECS - EDUCA CYBER SYSTEMS</p><h2 style="font-size:10px;color:rgba(255,255,255,.35);margin:5px 0 24px;letter-spacing:.2em">CERTIFICADO DE CONCLUSAO</h2><p style="color:rgba(255,255,255,.45)">Certificamos que</p><div class="n">'+nm+'</div><p>concluiu o curso<br><strong>'+cn+'</strong></p><p style="font-size:11px;color:rgba(255,255,255,.35);margin-top:18px">'+new Date().toLocaleDateString('pt-BR')+'</p><div class="h">Verificacao: '+hash+'</div></div>';
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificado ECS</title><style>'+css+'</style></head><body>'+body+'</body></html>';
  var blob=new Blob([html],{type:'text/html'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Cert-ECS-'+hash+'.html';a.click();URL.revokeObjectURL(a.href);
  showT('Certificado gerado!','s');
  if(!N8N) return;
  fetch(N8N+'/webhook/ecs-certificado',{
    method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({hash:hash,valido:true,nome_aluno:nm,curso_nome:cn})
  }).then(function(r){return r.json();}).then(function(res){
    if(res&&res.success) showT('Certificado salvo!','s');
  }).catch(function(){});
}

function alEnviarChamado(){
  var sel=document.querySelector('[id^=alv-sup] select')||document.querySelector('.fs');
  var txt=document.querySelector('[id^=alv-sup] textarea')||document.querySelector('textarea');
  var assunto=sel?sel.value:'Suporte Geral';
  var desc=txt?txt.value:'';
  if(!desc){showT('Descreva o problema','e');return;}
  var u=getUser()||{};
  var novoCham={id:Date.now()+'',id_chamado:'#'+Date.now().toString().slice(-4),aluno:u.nome||'Aluno',assunto:assunto,descricao:desc,prio:'media',status:'aberto',data:new Date().toISOString().slice(0,10),created_at:new Date().toISOString()};
  CHAMS.unshift(novoCham); CACHE.push('chamados',novoCham);
  if(txt) txt.value='';
  showT('Enviando chamado...','i');
  if(N8N) fetch(N8N+'/webhook/ecs-chamado',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({action:'abrir', autor_id:u.id||null, assunto:assunto, descricao:desc, prioridade:'media'})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Chamado registrado no banco!':'Chamado enviado!','s');
  }).catch(function(){showT('Chamado enviado (offline)','i');});
}

function alChat(){
  var inp=document.getElementById('al-ci'); if(!inp) return;
  var msg=inp.value.trim(); if(!msg) return;
  var el=document.getElementById('al-chat-msgs'); if(!el) return;
  el.innerHTML+='<div style="align-self:flex-end;background:linear-gradient(135deg,rgba(0,229,212,.14),rgba(59,130,246,.09));border:1px solid rgba(0,229,212,.16);border-radius:11px;padding:9px 13px;font-size:13px;max-width:80%">'+msg+'</div>';
  inp.value='';
  var entry=findKB(msg);
  setTimeout(function(){
    var resp=entry?formatBubble(entry.r):'Boa pergunta! Acesse o <span style="color:var(--cy);cursor:pointer" onclick="go(\'mentor-ia\')">Mentor IA completo</span> para respostas detalhadas.';
    el.innerHTML+='<div style="align-self:flex-start;background:var(--s3);border:1px solid var(--b1);border-radius:11px;padding:9px 13px;font-size:12.5px;color:var(--t2);max-width:80%">🤖 '+resp+'</div>';
    el.scrollTop=el.scrollHeight;
  },700);
  el.scrollTop=el.scrollHeight;
}
function alSupSend(){
  var inp=document.getElementById('al-sup-inp'); if(!inp) return;
  var msg=inp.value.trim(); if(!msg) return;
  var msgs=document.getElementById('al-sup-msgs'); if(!msgs) return;
  msgs.innerHTML+='<div style="align-self:flex-end;background:linear-gradient(135deg,rgba(0,229,212,.14),rgba(59,130,246,.09));border:1px solid rgba(0,229,212,.16);border-radius:9px;padding:7px 11px;font-size:12.5px">'+msg+'</div>';
  inp.value='';
  sbAbrirChamado('Chat de Suporte', msg, 'media');
  setTimeout(function(){
    msgs.innerHTML+='<div style="align-self:flex-start;background:var(--s3);border:1px solid var(--b1);border-radius:9px;padding:7px 11px;font-size:12.5px;color:var(--t2)">Chamado registrado! Nossa equipe responderá em breve.</div>';
    msgs.scrollTop=msgs.scrollHeight;
  },800);
  msgs.scrollTop=msgs.scrollHeight;

  // Salvar chamado no Supabase via N8N
  var _u=getUser()||{};
  if(N8N&&msg) fetch(N8N+'/webhook/ecs-chamado',{method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({action:'abrir',autor_id:_u.id||null,assunto:'Chat de Suporte',descricao:msg,prioridade:'media'})
  }).catch(function(){});
}

// ── PORTAL PROFESSOR ──
function initProf(){
  var u=getUser()||{nome:'Professor'};
  var pts=u.nome.split(' ');
  var av=pts.slice(-2).map(function(p){return p[0];}).join('').toUpperCase();
  var el;
  el=document.getElementById('pr-av'); if(el) el.textContent=av;
  el=document.getElementById('pr-name'); if(el) el.textContent=u.nome;
  el=document.getElementById('pr-first'); if(el) el.textContent=pts.find(function(p){ return p!=='Prof.'&&p!=='Profa.'; })||pts[0];
  loadCacheToArrays();
  renderPrDash(); renderPrTurmas(); renderPrAlunos(); renderPrContent(); renderPrAval(); renderPrChams(); renderPrKB(); renderPrRel();
  // Sync em background
  syncFromSupabase();
}
var PR_TITLES={dashboard:'Dashboard',turmas:'Turmas',alunos:'Alunos',conteudo:'Conteudo',avaliacoes:'Avaliacoes',chamados:'Chamados',base:'Base de Conhecimento',relatorios:'Relatorios'};
function prView(v){
  document.querySelectorAll('#p-painel-professor .pv').forEach(function(e){ e.classList.remove('on'); });
  var el=document.getElementById('prv-'+v); if(el) el.classList.add('on');
  document.querySelectorAll('#p-painel-professor .sb-item').forEach(function(i){ i.classList.remove('on'); });
  var itm=document.querySelector('#p-painel-professor .sb-item[onclick*="\''+v+'\'"]'); if(itm) itm.classList.add('on');
  el=document.getElementById('pr-ptb-t'); if(el) el.textContent=PR_TITLES[v]||v;
}
function renderPrDash(){
  var el=document.getElementById('pr-turmas-t'); if(el) el.innerHTML=TURMAS.map(function(t){ return '<tr><td>'+t.nome+'</td><td>'+t.alunos+'</td><td>'+pbar(60+Math.floor(Math.random()*30))+'</td></tr>'; }).join('');
  var ce=document.getElementById('pr-cham-t'); if(ce) ce.innerHTML=CHAMS.filter(function(c){ return c.status==='aberto'; }).slice(0,3).map(function(c){ return '<tr><td>'+c.aluno+'</td><td>'+c.assunto.slice(0,28)+'</td><td><button class="btn btn-cy btn-sm" onclick="prAtender(\''+c.id+'\')">Responder</button></td></tr>'; }).join('');
  var ae=document.getElementById('pr-alunos-t'); if(ae) ae.innerHTML=ALUNOS.slice(0,5).map(function(a){ var st=a.prog>=80?'<span class="badge bg-gr">OK</span>':a.prog>=50?'<span class="badge bg-am">Regular</span>':'<span class="badge bg-rd">Atencao</span>'; return '<tr><td>'+a.nome+'</td><td>'+tname(a.turma)+'</td><td>'+pbar(a.prog)+'</td><td style="color:var(--t3)">'+a.last+'</td><td>'+st+'</td></tr>'; }).join('');
}
function renderPrTurmas(){
  var el=document.getElementById('pr-turmas-cards'); if(!el) return;
  el.innerHTML=TURMAS.map(function(t){
    var cor=t.id==='blue_team'?'var(--cy)':t.id==='red_team'?'var(--rd)':'var(--am)';
    return '<div class="card"><div style="height:4px;background:'+cor+';border-radius:12px 12px 0 0"></div><div class="card-hd"><div class="card-hd-t">'+t.nome+'</div><span class="badge bg-gr">Ativo</span></div><div class="card-bd" style="padding-top:6px"><div style="color:var(--t2);font-size:12px;margin-bottom:8px">'+t.prof+' · '+t.alunos+' alunos</div>'+pbar(60+Math.floor(Math.random()*30))+'<div style="display:flex;gap:7px;margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="prView(\'alunos\')">Alunos</button><button class="btn btn-cy btn-sm" onclick="prView(\'conteudo\')">Gerenciar</button></div></div></div>';
  }).join('');
}
var PF_NAME='',PF_TURMA='';
function prFilterAlunos(){ PF_NAME=(document.getElementById('pr-filter')||{}).value||''; PF_TURMA=(document.getElementById('pr-turma-filter')||{}).value||''; renderPrAlunos(); }
function renderPrAlunos(){
  var list=ALUNOS.filter(function(a){ return (!PF_NAME||a.nome.toLowerCase().includes(PF_NAME.toLowerCase()))&&(!PF_TURMA||a.turma===PF_TURMA); });
  var el=document.getElementById('pr-alunos-full'); if(!el) return;
  el.innerHTML=list.map(function(a){ return '<tr><td>'+a.nome+'</td><td style="font-family:var(--mono);font-size:11px">'+a.email+'</td><td>'+tname(a.turma)+'</td><td>'+pbar(a.prog)+'</td><td style="color:var(--t3)">'+a.last+'</td><td><button class="btn btn-ghost btn-sm">Ver</button></td></tr>'; }).join('');
}
var CONTENT=[{id:1,title:'Fundamentos SIEM',mod:'Mod.1',tipo:'video',dur:'45min',views:234},{id:2,title:'Regras Snort',mod:'Mod.1',tipo:'video',dur:'32min',views:189},{id:3,title:'MITRE ATT&CK Pratico',mod:'Mod.2',tipo:'video',dur:'58min',views:156},{id:4,title:'Guia IDS/IPS',mod:'Mod.2',tipo:'pdf',dur:'—',views:98}];
function renderPrContent(){ var el=document.getElementById('pr-content-t'); if(!el) return; el.innerHTML=CONTENT.map(function(c){ var t=c.tipo==='video'?'<span class="badge bg-cy">Video</span>':'<span class="badge bg-am">PDF</span>'; return '<tr><td>'+c.title+'</td><td>'+c.mod+'</td><td>'+t+'</td><td style="font-family:var(--mono)">'+c.dur+'</td><td style="font-family:var(--mono)">'+c.views+'</td><td><button class="btn btn-ghost btn-sm">Editar</button></td></tr>'; }).join(''); }
var AVALS=[{title:'Prova SIEM Mod.1',turma:'blue_team',prazo:'2026-06-15',ent:12,tot:15,media:7.8,status:'aberta'},{title:'Lab Pentest Web',turma:'red_team',prazo:'2026-06-25',ent:5,tot:14,media:9.1,status:'aberta'}];
function renderPrAval(){ var el=document.getElementById('pr-aval-t'); if(!el) return; el.innerHTML=AVALS.map(function(a){ var st=a.status==='aberta'?'<span class="badge bg-gr">Aberta</span>':'<span class="badge bg-am">Encerrada</span>'; return '<tr><td>'+a.title+'</td><td>'+tname(a.turma)+'</td><td style="font-family:var(--mono)">'+a.prazo+'</td><td style="font-family:var(--mono)">'+a.ent+'/'+a.tot+'</td><td style="color:var(--cy);font-family:var(--mono)">'+a.media.toFixed(1)+'</td><td>'+st+'</td></tr>'; }).join(''); }
function renderPrChams(){ var el=document.getElementById('pr-cham-full'); if(!el) return; el.innerHTML=CHAMS.map(function(c){ var st=c.status==='aberto'?'<span class="badge bg-rd">Aberto</span>':'<span class="badge bg-gr">Resolvido</span>'; var act=c.status==='aberto'?'<button class="btn btn-cy btn-sm" onclick="prAtender(\''+c.id+'\')">Atender</button>':'—'; return '<tr><td style="font-family:var(--mono)">'+c.id+'</td><td>'+c.aluno+'</td><td>'+c.assunto+'</td><td style="font-family:var(--mono)">'+c.data+'</td><td>'+st+'</td><td>'+act+'</td></tr>'; }).join(''); }
function prAtender(id){
  sbResolverChamado(id).then(function(){ renderPrChams(); renderPrDash(); showT('Chamado resolvido!','s'); });

  if(N8N) fetch(N8N+'/webhook/ecs-chamado',{method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({action:'resolver',id:id,ts:new Date().toISOString()})
  }).catch(function(){});
}
function renderPrKB(){ var el=document.getElementById('pr-kb-t'); if(!el) return; el.innerHTML=KB_DB.map(function(k){ return '<tr><td>'+k.prob+'</td><td>'+k.cat+'</td><td>'+sbadge(k.status)+'</td></tr>'; }).join(''); }
function prSaveKB(){
  var p=(document.getElementById('kb-prob')||{}).value||'';
  var s=(document.getElementById('kb-sol')||{}).value||'';
  var cat=(document.getElementById('kb-cat')||{}).value||'outro';
  if(!p||!s){showT('Preencha problema e solucao','e');return;}
  KB_DB.unshift({id:Date.now(),prob:p,cat:cat,status:'resolvido'});
  CACHE.push('kb',{id:Date.now()+'',prob:p,cat:cat,solucao:s,created_at:new Date().toISOString()});
  renderPrKB();
  if(document.getElementById('kb-prob')) document.getElementById('kb-prob').value='';
  if(document.getElementById('kb-sol')) document.getElementById('kb-sol').value='';
  if(!N8N){showT('Registrado (offline)','i');return;}
  fetch(N8N+'/webhook/ecs-aprender',{
    method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({problema:p,solucao:s,categoria:cat})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Salvo no banco!':'Registrado!','s');
  }).catch(function(){showT('Registrado (offline)','i');});
}

function renderPrRel(){ var el=document.getElementById('pr-rel-t'); if(!el) return; el.innerHTML=ALUNOS.map(function(a){ var tend=a.prog>=70?'<span style="color:var(--gr)">Positiva</span>':a.prog>=40?'<span style="color:var(--am)">Estavel</span>':'<span style="color:var(--rd)">Risco</span>'; return '<tr><td>'+a.nome+'</td><td>'+tname(a.turma)+'</td><td>'+pbar(a.prog)+'</td><td style="color:var(--cy);font-family:var(--mono)">'+a.nota.toFixed(1)+'</td><td>'+tend+'</td></tr>'; }).join(''); }

// ── PORTAL ADMIN ──
function initAdmin(){
  var u=getUser()||{nome:'Admin ECS'};
  var pts=u.nome.split(' ');
  var av=pts.slice(-2).map(function(p){return p[0];}).join('').slice(0,2).toUpperCase();
  var el;
  el=document.getElementById('adm-av'); if(el) el.textContent=av;
  el=document.getElementById('adm-name'); if(el) el.textContent=u.nome;
  loadCacheToArrays();
  renderAdmDash(); renderAdmAlunos(); renderAdmProfs(); renderAdmMats(); renderAdmTurmas(); renderAdmFin(); renderAdmChams(); renderAdmLogs();
  syncFromSupabase();
}
var ADM_TITLES={dashboard:'Dashboard',alunos:'Alunos',professores:'Professores',matriculas:'Matriculas',turmas:'Turmas',financeiro:'Financeiro',chamados:'Chamados',config:'Configuracoes',logs:'Logs'};
function admView(v){
  document.querySelectorAll('#p-painel-admin .pv').forEach(function(e){ e.classList.remove('on'); });
  var el=document.getElementById('admv-'+v); if(el) el.classList.add('on');
  document.querySelectorAll('#p-painel-admin .sb-item').forEach(function(i){ i.classList.remove('on'); });
  var itm=document.querySelector('#p-painel-admin .sb-item[onclick*="\''+v+'\'"]'); if(itm) itm.classList.add('on');
  el=document.getElementById('adm-ptb-t'); if(el) el.textContent=ADM_TITLES[v]||v;
}
function renderAdmDash(){
  var me=document.getElementById('adm-mat-t'); if(me) me.innerHTML=MATS.slice(0,4).map(function(m){ var act=m.status==='pendente'?'<button class="btn btn-cy btn-sm" onclick="admApprove('+m.id+')">Aprovar</button>':'—'; return '<tr><td>'+m.aluno+'</td><td>'+tname(m.trilha)+'</td><td>'+sbadge(m.status)+'</td><td>'+act+'</td></tr>'; }).join('');
  var ae=document.getElementById('adm-activity'); if(ae) ae.innerHTML=[
    {ico:'🎓',bg:'rgba(0,229,212,.1)',txt:'<b>Lucas Pereira</b> matriculou em Blue Team',time:'ha 2 min'},
    {ico:'⚙️',bg:'rgba(59,130,246,.1)',txt:'Webhook <b>/ecs-matricula</b> disparado',time:'ha 5 min'},
    {ico:'🧠',bg:'rgba(239,68,68,.1)',txt:'Base atualizada com <b>3 novos registros</b>',time:'ha 12 min'},
    {ico:'👤',bg:'rgba(167,139,250,.1)',txt:'Professor <b>Diego Alves</b> adicionado',time:'ha 1h'},
  ].map(function(a){ return '<div class="act-row"><div class="act-ico" style="background:'+a.bg+'">'+a.ico+'</div><div class="act-txt">'+a.txt+'</div><div class="act-time">'+a.time+'</div></div>'; }).join('');
  var te=document.getElementById('adm-turmas-t'); if(te) te.innerHTML=TURMAS.map(function(t){ return '<tr><td>'+t.nome+'</td><td>'+t.prof+'</td><td style="font-family:var(--mono)">'+t.alunos+'</td><td>'+pbar(60+Math.floor(Math.random()*30),'pf pf-gr')+'</td><td><span class="badge bg-gr">Ativo</span></td></tr>'; }).join('');
}
var AF_NAME='',AF_ST='';
function admFilterAlunos(){ AF_NAME=(document.getElementById('adm-search')||{}).value||''; AF_ST=(document.getElementById('adm-st-filter')||{}).value||''; renderAdmAlunos(); }
function renderAdmAlunos(){ var list=ALUNOS.filter(function(a){ return (!AF_NAME||a.nome.toLowerCase().includes(AF_NAME.toLowerCase()))&&(!AF_ST||a.status===AF_ST); }); var el=document.getElementById('adm-alunos-t'); if(!el) return; el.innerHTML=list.map(function(a){ return '<tr><td>'+a.nome+'</td><td style="font-family:var(--mono);font-size:11px">'+a.email+'</td><td>'+tname(a.turma)+'</td><td>'+pbar(a.prog)+'</td><td>'+sbadge(a.status)+'</td><td><button class="btn btn-ghost btn-sm">Editar</button></td></tr>'; }).join(''); }
function renderAdmProfs(){ var el=document.getElementById('adm-profs-t'); if(!el) return; el.innerHTML=PROFS.map(function(p){ return '<tr><td>'+p.nome+'</td><td>'+p.disc+'</td><td style="font-family:var(--mono)">'+p.turmas+'</td><td style="font-family:var(--mono)">'+p.alunos+'</td><td style="color:var(--am);font-family:var(--mono)">'+p.nota+'</td><td><button class="btn btn-ghost btn-sm">Editar</button></td></tr>'; }).join(''); }
function renderAdmMats(){
  var ap=MATS.filter(function(m){ return m.status==='aprovada'; }).length;
  var pe=MATS.filter(function(m){ return m.status==='pendente'; }).length;
  var ca=MATS.filter(function(m){ return m.status==='cancelada'; }).length;
  var e1=document.getElementById('mat-aprov'); if(e1) e1.textContent=ap;
  var e2=document.getElementById('mat-pend'); if(e2) e2.textContent=pe;
  var e3=document.getElementById('mat-canc'); if(e3) e3.textContent=ca;
  var el=document.getElementById('adm-mat-full'); if(!el) return;
  el.innerHTML=MATS.map(function(m){ var act=m.status==='pendente'?'<div style="display:flex;gap:4px"><button class="btn btn-cy btn-sm" onclick="admApprove('+m.id+')">Aprovar</button><button class="btn btn-ghost btn-sm" style="color:var(--rd)" onclick="admReject('+m.id+')">Rejeitar</button></div>':'—'; return '<tr><td>'+m.aluno+'</td><td>'+tname(m.trilha)+'</td><td>'+m.plano+'</td><td style="color:var(--gr);font-family:var(--mono)">R$'+m.valor.toFixed(2)+'</td><td style="font-family:var(--mono)">'+m.data+'</td><td>'+sbadge(m.status)+'</td><td>'+act+'</td></tr>'; }).join('');
}
function admApprove(id){
  sbAprovarMatricula(id).then(function(){
    renderAdmMats(); renderAdmDash(); showT('Matricula aprovada!','s');
  });
}
function admReject(id){
  CACHE.update('matriculas',id,{status:'cancelada'});
  var m=MATS.find(function(x){return x.id===id;}); if(m) m.status='cancelada';
  renderAdmMats(); showT('Matrícula cancelada','e');
  if(N8N) fetch(N8N+'/webhook/ecs-matricula-aprovada',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({id_local:id, status:'cancelada', ts:new Date().toISOString()})
  }).catch(function(){});
}

function renderAdmTurmas(){ var el=document.getElementById('adm-turmas-full'); if(!el) return; el.innerHTML=TURMAS.map(function(t){ return '<tr><td>'+t.nome+'</td><td>'+t.prof+'</td><td>'+t.trilha+'</td><td style="font-family:var(--mono)">'+t.alunos+'</td><td style="font-family:var(--mono)">'+t.inicio+'</td><td><span class="badge bg-gr">Ativo</span></td><td><button class="btn btn-ghost btn-sm">Editar</button></td></tr>'; }).join(''); }
function renderAdmFin(){ var el=document.getElementById('adm-fin-t'); if(!el) return; el.innerHTML=FIN.map(function(f){ var act=f.status!=='pago'?'<button class="btn btn-cy btn-sm" onclick="showT(\'Notificado!\',\'s\')">Notificar</button>':'—'; return '<tr><td>'+f.aluno+'</td><td>'+f.plano+'</td><td style="color:var(--gr);font-family:var(--mono)">'+f.valor+'</td><td style="font-family:var(--mono)">'+f.venc+'</td><td>'+sbadge(f.status)+'</td><td>'+act+'</td></tr>'; }).join(''); }
function renderAdmChams(){ var el=document.getElementById('adm-cham-t'); if(!el) return; el.innerHTML=CHAMS.map(function(c){ var act=c.status==='aberto'?'<button class="btn btn-cy btn-sm" onclick="admResolveCham(\''+c.id+'\')">Resolver</button>':'—'; return '<tr><td style="font-family:var(--mono)">'+c.id+'</td><td>'+c.aluno+'</td><td>'+c.assunto+'</td><td>'+pbadge(c.prio)+'</td><td style="font-family:var(--mono)">'+c.data+'</td><td>'+sbadge(c.status)+'</td><td>'+act+'</td></tr>'; }).join(''); }
function admResolveCham(id){
  sbResolverChamado(id).then(function(){ renderAdmChams(); showT('Chamado resolvido!','s'); });

  if(N8N) fetch(N8N+'/webhook/ecs-chamado',{method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({action:'resolver',id:id,ts:new Date().toISOString()})
  }).catch(function(){});
}
function renderAdmLogs(){
  var el=document.getElementById('adm-logs'); if(!el) return;
  var logs=[{ico:'🎓',bg:'rgba(0,229,212,.1)',txt:'<b>Lucas Pereira</b> matriculou em Blue Team',time:'ha 2 min'},{ico:'⚙️',bg:'rgba(59,130,246,.1)',txt:'Webhook disparado com sucesso',time:'ha 5 min'},{ico:'🧠',bg:'rgba(239,68,68,.1)',txt:'Base de conhecimento atualizada',time:'ha 12 min'},{ico:'👤',bg:'rgba(167,139,250,.1)',txt:'Professor <b>Diego Alves</b> adicionado',time:'ha 1h'},{ico:'📊',bg:'rgba(245,158,11,.1)',txt:'Relatorio mensal gerado',time:'ha 3h'},{ico:'⚠️',bg:'rgba(239,68,68,.1)',txt:'Tentativa de acesso invalida bloqueada',time:'ontem'}];
  el.innerHTML=logs.map(function(l){ return '<div class="act-row"><div class="act-ico" style="background:'+l.bg+'">'+l.ico+'</div><div class="act-txt">'+l.txt+'</div><div class="act-time">'+l.time+'</div></div>'; }).join('');
}
function admAddAluno(){
  var n=(document.getElementById('na-nome')||{}).value||'';
  var e=(document.getElementById('na-email')||{}).value||'';
  var t=(document.getElementById('na-trilha')||{}).value||'blue_team';
  if(!n||!e){showT('Preencha nome e e-mail','e');return;}
  var novoAluno={id:Date.now()+'',nome:n,email:e,turma:t,trilha:t,prog:0,status:'ativo',last:'agora',nota:0,created_at:new Date().toISOString()};
  ALUNOS.unshift(novoAluno); CACHE.push('usuarios',novoAluno);
  var matItem={id:novoAluno.id+'_m',aluno:n,nome:n,email:e,trilha:t,plano:'mensal',valor:129.90,status:'aprovada',data:new Date().toISOString().slice(0,10),created_at:new Date().toISOString()};
  MATS.unshift(matItem); CACHE.push('matriculas',matItem);
  closeModal(); renderAdmAlunos(); renderAdmMats(); renderAdmDash();
  showT('Adicionando aluno...','i');
  if(N8N) fetch(N8N+'/webhook/ecs-aluno',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({nome:n, email:e, role:'aluno', trilha:t})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Aluno salvo no banco!':'Aluno adicionado!','s');
    // Registrar financeiro
    if(N8N) fetch(N8N+'/webhook/ecs-financeiro',{
      method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
      body: JSON.stringify({descricao:'Mensalidade mensal', valor:129.90, tipo:'mensalidade', status:'pendente'})
    }).catch(function(){});
  }).catch(function(){showT('Aluno adicionado (offline)','i');});
}

function admSalvarFin(){
  var desc=(document.getElementById('nf-desc')||{}).value||'Mensalidade';
  var valor=parseFloat((document.getElementById('nf-valor')||{}).value||'129.90');
  var venc=(document.getElementById('nf-venc')||{}).value||null;
  if(!desc){showT('Informe a descrição','e');return;}
  closeModal(); showT('Registrando...','i');
  FIN.push({id:Date.now()+'',aluno:'—',plano:desc,valor:'R$'+valor.toFixed(2),venc:venc||'—',status:'pendente'});
  renderAdmFin();
  if(N8N) fetch(N8N+'/webhook/ecs-financeiro',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({descricao:desc, valor:valor, tipo:'mensalidade', status:'pendente', vencimento:venc||null})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Financeiro salvo no banco!':'Registrado!','s');
  }).catch(function(){showT('Registrado (offline)','i');});
}

function admCriarTurma(){
  var n=(document.getElementById('nt-nome')||{}).value||'';
  var t=(document.getElementById('nt-trilha')||{}).value||'blue_team';
  var m=parseInt((document.getElementById('nt-max')||{}).value||'30');
  if(!n){showT('Informe o nome da turma','e');return;}
  var novaT={id:Date.now()+'',nome:n,prof:'—',trilha:t,alunos:0,inicio:new Date().toISOString().slice(0,10),status:'ativo'};
  TURMAS.push(novaT); CACHE.push('turmas_cache',novaT);
  renderAdmTurmas(); closeModal();
  if(!N8N){showT('Turma criada (offline)','i');return;}
  fetch(N8N+'/webhook/ecs-turma',{
    method:'POST',headers:{'Content-Type':'application/json'},mode:'cors',
    body:JSON.stringify({nome:n,trilha:t,max_alunos:m,data_inicio:new Date().toISOString().slice(0,10)})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Turma salva no banco!':'Turma criada!','s');
  }).catch(function(){showT('Turma criada (offline)','i');});
}

function prSalvarAula(){
  var titulo=(document.getElementById('na-titulo')||{}).value||'';
  var tipo=(document.getElementById('na-tipo')||{}).value||'video';
  var url=(document.getElementById('na-url')||{}).value||'';
  var dur=parseInt((document.getElementById('na-dur')||{}).value||'30');
  if(!titulo){showT('Informe o titulo da aula','e');return;}
  var u=getUser()||{};
  closeModal(); showT('Salvando aula...','i');
  if(N8N) fetch(N8N+'/webhook/ecs-aula',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({titulo:titulo, tipo:tipo, url:url, duracao_min:dur, xp:10, ordem:1, professor_id:u.id||null})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Aula salva no banco!':'Aula registrada!','s');
  }).catch(function(){showT('Aula salva (offline)','i');});
}

function admSalvarProf(){
  var n=(document.getElementById('np-nome')||{}).value||'';
  var e=(document.getElementById('np-email')||{}).value||'';
  var d=(document.getElementById('np-disc')||{}).value||'blue_team';
  if(!n||!e){showT('Preencha nome e e-mail','e');return;}
  closeModal(); showT('Adicionando professor...','i');
  PROFS.push({id:Date.now()+'',nome:n,email:e,disc:d,turmas:0,alunos:0,nota:5.0,status:'ativo'});
  renderAdmProfs();
  if(N8N) fetch(N8N+'/webhook/ecs-aluno',{
    method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
    body: JSON.stringify({nome:n, email:e, role:'professor', disciplina:d})
  }).then(function(r){return r.json();}).then(function(res){
    showT(res&&res.success?'Professor salvo no banco!':'Professor adicionado!','s');
  }).catch(function(){showT('Professor adicionado (offline)','i');});
}

function exportCSV(){
  var rows=['Nome,Email,Turma,Progresso,Status'];
  ALUNOS.forEach(function(a){ rows.push([a.nome,a.email,tname(a.turma),a.prog+'%',a.status].join(',')); });
  var b=new Blob([rows.join('\n')],{type:'text/csv'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='ecs-alunos.csv'; a.click(); URL.revokeObjectURL(a.href);
  showT('CSV exportado!','s');
}
function saveConfig(){
  var n=(document.getElementById('cfg-n8n')||{}).value||'';
  var su=(document.getElementById('cfg-sb-url')||{}).value||'';
  var sk=(document.getElementById('cfg-sb-key')||{}).value||'';
  sbSaveConfig(n, sk||null);
  if(su){ SB_URL=su; localStorage.setItem('ecs_sb_url',su); _sb=null; }
  sbTestConnection().then(function(ok){
    showT(ok ? '✓ Supabase conectado com sucesso!' : 'Configuracoes salvas (Supabase offline)', ok?'s':'i');
    if(ok) syncFromSupabase();
  });
}

// ── MATRICULA ──
var MAT={nome:'',email:'',tel:'',cidade:'',estado:'',nivel:'iniciante',trilha:'',plano:'mensal',cupom:'',desconto:0};
var M_STEP=1;
var CUPONS={'ECS2025':15,'CYBER25':15,'BLUETEAM':20,'REDTEAM':20,'PROMO30':30};
var PRECOS={mensal:129.90,trimestral:99.90,anual:79.90};
var TRACKS=[
  {id:'blue_team',  icon:'🛡️',name:'Blue Team Defensivo',  desc:'SIEM, SOC, Threat Hunting'},
  {id:'red_team',   icon:'⚔️', name:'Red Team Ofensivo',    desc:'Pentest, Metasploit, Web'},
  {id:'forense',    icon:'🔍', name:'Forense e Analise',    desc:'Forense Digital, Malware, IR'},
  {id:'full_cyber', icon:'🔐', name:'Ciberseguranca Completa',desc:'Blue + Red + Forense + Certs'},
];
var PLANS=[
  {id:'mensal',    name:'Mensal',    price:129.90,period:'mes',badge:'',econ:''},
  {id:'trimestral',name:'Trimestral',price:99.90, period:'mes',badge:'',econ:'Economize 23%'},
  {id:'anual',     name:'Anual',     price:79.90, period:'mes',badge:'POPULAR',econ:'Economize 38%'},
];
function initMat(){
  M_STEP=1; MAT.trilha=''; MAT.plano='mensal'; MAT.desconto=0; MAT.cupom='';
  [1,2,3].forEach(function(n){ var s=document.getElementById('ms'+n); if(s){s.classList.remove('active','done');if(n===1)s.classList.add('active');} });
  document.querySelectorAll('.mstep').forEach(function(s){ s.classList.remove('active'); });
  var s1=document.getElementById('mstep1'); if(s1) s1.classList.add('active');
  renderTracks(); renderPlans();
}
function renderTracks(){
  var el=document.getElementById('tracks-grid'); if(!el) return;
  el.innerHTML=TRACKS.map(function(t){ return '<div class="track-opt" id="to-'+t.id+'" onclick="selTrack(\''+t.id+'\')"><div class="to-icon">'+t.icon+'</div><div class="to-name">'+t.name+'</div><div class="to-desc">'+t.desc+'</div></div>'; }).join('');
}
function selTrack(id){ MAT.trilha=id; document.querySelectorAll('.track-opt').forEach(function(e){ e.classList.remove('sel'); }); var el=document.getElementById('to-'+id); if(el) el.classList.add('sel'); }
function renderPlans(){
  var el=document.getElementById('plans-grid'); if(!el) return;
  el.innerHTML=PLANS.map(function(p){ var mt=p.badge?'margin-top:16px':''; return '<div class="plan-opt'+(MAT.plano===p.id?' sel':'')+'" id="po-'+p.id+'" onclick="selPlan(\''+p.id+'\')">'+( p.badge?'<div class="plan-badge">'+p.badge+'</div>':'' )+'<div class="plan-name" style="'+mt+'">'+p.name+'</div><div class="plan-price">R$'+p.price.toFixed(2).replace('.',',')+'</div><div class="plan-period">/'+p.period+'</div>'+(p.econ?'<div class="plan-econ">'+p.econ+'</div>':'')+'</div>'; }).join('');
}
function selPlan(id){ MAT.plano=id; document.querySelectorAll('.plan-opt').forEach(function(e){ e.classList.remove('sel'); }); var el=document.getElementById('po-'+id); if(el) el.classList.add('sel'); updatePrice(); }
function applyCoupon(){
  var code=(document.getElementById('m-cupom')||{}).value||'';
  code=code.toUpperCase().trim();
  var msg=document.getElementById('coupon-msg');
  var disc=CUPONS[code];
  if(disc){ MAT.cupom=code; MAT.desconto=disc; if(msg){msg.style.color='var(--gr)';msg.textContent='Cupom '+code+' aplicado! '+disc+'% off';} showT('Cupom aplicado!','s'); }
  else { MAT.cupom=''; MAT.desconto=0; if(msg){msg.style.color='var(--rd)';msg.textContent='Cupom invalido';} showT('Cupom invalido','e'); }
  updatePrice();
}
function updatePrice(){ var p=PRECOS[MAT.plano]||129.90; if(MAT.desconto>0) p=p*(1-MAT.desconto/100); var el=document.getElementById('price-total'); if(el) el.innerHTML='R$'+p.toFixed(2).replace('.',',')+'/mes'; }
function maskPhone(inp){ var v=inp.value.replace(/\D/g,'').slice(0,11); if(v.length<=10) v=v.replace(/^(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'); else v=v.replace(/^(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3'); inp.value=v.replace(/-$/,''); }
function maskCEP(inp){ var v=inp.value.replace(/\D/g,'').slice(0,8); inp.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v; if(v.length===8) fetch('https://viacep.com.br/ws/'+v+'/json/').then(function(r){return r.json();}).then(function(d){ if(!d.erro){ var c=document.getElementById('m-cidade'); var e=document.getElementById('m-estado'); if(c) c.value=d.localidade||''; if(e) e.value=d.uf||''; } }).catch(function(){}); }
function matNext(s){
  if(s===2){
    var n=(document.getElementById('m-nome')||{}).value||'';
    var e=(document.getElementById('m-email')||{}).value||'';
    var t=(document.getElementById('m-tel')||{}).value||'';
    if(!n){ showT('Informe seu nome','e'); return; }
    if(!e||!e.includes('@')){ showT('E-mail invalido','e'); return; }
    if(t.length<14){ showT('Telefone invalido','e'); return; }
    MAT.nome=n; MAT.email=e; MAT.tel=t;
    MAT.cidade=(document.getElementById('m-cidade')||{}).value||'';
    MAT.estado=(document.getElementById('m-estado')||{}).value||'';
    MAT.nivel=(document.getElementById('m-nivel')||{}).value||'iniciante';
  }
  if(s===3){ if(!MAT.trilha){ showT('Selecione uma trilha','e'); return; } buildReview(); }
  M_STEP=s;
  document.querySelectorAll('.mstep').forEach(function(e){ e.classList.remove('active'); });
  var tgt=document.getElementById('mstep'+s); if(tgt) tgt.classList.add('active');
  [1,2,3].forEach(function(n){ var el=document.getElementById('ms'+n); if(!el) return; el.classList.remove('active','done'); if(n<s) el.classList.add('done'); else if(n===s) el.classList.add('active'); });
}
function buildReview(){
  var tr=TRACKS.find(function(t){ return t.id===MAT.trilha; });
  var pl=PLANS.find(function(p){ return p.id===MAT.plano; });
  var price=PRECOS[MAT.plano]||129.90;
  if(MAT.desconto>0) price=price*(1-MAT.desconto/100);
  var rows=[['Nome',MAT.nome],['E-mail',MAT.email],['Telefone',MAT.tel],['Cidade',MAT.cidade||'—'],['Nivel',MAT.nivel],['Trilha',tr?tr.icon+' '+tr.name:'—'],['Plano',pl?pl.name:'—'],['Cupom',MAT.cupom?MAT.cupom+' ('+MAT.desconto+'% off)':'Sem cupom']];
  var el=document.getElementById('rv-list'); if(el) el.innerHTML=rows.map(function(r){ return '<div class="rv-row"><span class="rv-lbl">'+r[0]+'</span><span class="rv-val">'+r[1]+'</span></div>'; }).join('');
  var pe=document.getElementById('price-total'); if(pe) pe.innerHTML='R$'+price.toFixed(2).replace('.',',')+'/mes';
}
function confirmMat(){
  var btn=document.getElementById('btn-confirm');
  if(btn){ btn.textContent='Salvando...'; btn.disabled=true; }
  var id_local='ECS-'+Math.random().toString(36).toUpperCase().slice(2,10);
  var payload=Object.assign({},MAT,{timestamp:new Date().toISOString(),id_local:id_local});

  sbSaveMatricula(payload)
  .then(function(result){
    // Atualizar usuário local
    localStorage.setItem('ecs_user',JSON.stringify({
      id: result.userId, nome:MAT.nome, email:MAT.email,
      role:'aluno', trilha:MAT.trilha, id:id_local
    }));
    document.querySelectorAll('.mstep').forEach(function(e){ e.classList.remove('active'); });
    var ok=document.getElementById('mstep-ok'); if(ok) ok.classList.add('active');
    var h=document.getElementById('mat-hash'); if(h) h.textContent='ID: #'+id_local;
    showT('Matricula confirmada e salva!','s');
  })
  .catch(function(err){
    // Fallback: salva localmente mesmo sem internet
    localStorage.setItem('ecs_user',JSON.stringify({
      nome:MAT.nome, email:MAT.email, role:'aluno', trilha:MAT.trilha, id:id_local
    }));
    document.querySelectorAll('.mstep').forEach(function(e){ e.classList.remove('active'); });
    var ok=document.getElementById('mstep-ok'); if(ok) ok.classList.add('active');
    var h=document.getElementById('mat-hash'); if(h) h.textContent='ID: #'+id_local;
    showT('Matricula registrada (offline)','i');
    console.warn('Supabase offline, dados salvos localmente:', err);
  })
  .finally(function(){
    if(btn){ btn.textContent='Confirmar Matricula'; btn.disabled=false; }
  });
}
function resetMat(){ initMat(); }

// ── HOME FAQ ──
var FAQS=[
  {q:'Preciso de experiencia para comecar?',a:'Nao! Temos trilhas para todos os niveis. O sistema identifica seu perfil e personaliza o conteudo.'},
  {q:'Qual a diferenca entre Blue Team e Red Team?',a:'Blue Team foca em defesa: monitorar, detectar e responder. Red Team foca em ataque etico: encontrar vulnerabilidades. Muitos profissionais dominam os dois.'},
  {q:'Os labs sao realmente praticos?',a:'Sim! Voce vai operar um SIEM real, executar scans com Nmap, explorar vulnerabilidades com Metasploit e resolver CTFs em ambientes isolados e seguros.'},
  {q:'O certificado ECS e reconhecido pelo mercado?',a:'Cada certificado tem hash unico verificavel. Mais de 80 empresas parceiras reconhecem a formacao ECS.'},
  {q:'Como funciona o Mentor IA?',a:'IA especializada em ciberseguranca disponivel 24/7. Responde sobre SIEM, pentest, MITRE ATT&CK e muito mais sem necessitar de API Key.'},
  {q:'Posso cancelar a matricula?',a:'Sim, cancele a qualquer momento sem multas dentro dos primeiros 30 dias.'},
];
function initFAQ(){
  var el=document.getElementById('faq-list'); if(!el) return;
  el.innerHTML=FAQS.map(function(f){ return '<div class="faq-item" onclick="toggleFAQ(this)"><div class="faq-q"><span>'+f.q+'</span><span class="faq-arr">+</span></div><div class="faq-a">'+f.a+'</div></div>'; }).join('');
}
function toggleFAQ(el){ var was=el.classList.contains('open'); document.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); }); if(!was) el.classList.add('open'); }

// ── TEAM PAGES ──
var BL_MODS=[
  {num:'MOD 01',title:'Fundamentos de Redes',desc:'TCP/IP, OSI, DNS, HTTP/S e Wireshark na pratica.',tags:['TCP/IP','Wireshark','OSI','DNS']},
  {num:'MOD 02',title:'Linux para Seguranca',desc:'CLI, logs, hardening e scripting Bash.',tags:['Bash','Logs','Hardening','Cron']},
  {num:'MOD 03',title:'SIEM — Splunk e ELK',desc:'Coleta, correlacao e alertas em tempo real.',tags:['Splunk','ELK','Correlacao','SPL']},
  {num:'MOD 04',title:'IDS/IPS — Snort e Suricata',desc:'Deteccao de intrusoes e regras customizadas.',tags:['Snort','Suricata','Rules','NIDS']},
  {num:'MOD 05',title:'MITRE ATT&CK Framework',desc:'TTPs, deteccoes e caca a ameacas.',tags:['TTPs','ATT&CK','Sigma','Navigator']},
  {num:'MOD 06',title:'Threat Hunting',desc:'Metodologias proativas de caca a ameacas.',tags:['Velociraptor','YARA','EDR','Hunting']},
  {num:'MOD 07',title:'Resposta a Incidentes',desc:'Playbooks, contencao, erradicacao e recuperacao.',tags:['IR','Playbooks','Containment','RCA']},
  {num:'MOD 08',title:'Analise de Malware',desc:'Analise estatica e dinamica com sandboxing.',tags:['Ghidra','Cuckoo','Static','Dynamic']},
  {num:'MOD 09',title:'Forense Digital',desc:'Coleta de evidencias, disco e memoria.',tags:['Autopsy','Volatility','MFT','Chain']},
  {num:'MOD 10',title:'SOC Operations',desc:'Triagem de alertas, SOAR e metricas.',tags:['SOC','SOAR','Triage','SLA']},
  {num:'MOD 11',title:'Threat Intelligence',desc:'CTI, feeds de IOCs e analise de APTs.',tags:['MISP','OpenCTI','IOC','APT']},
  {num:'MOD 12',title:'Lab Final e CTF',desc:'Simulacao de SOC real e exercicios praticos.',tags:['CTF','Lab','SOC Sim','Cert']},
];
var RD_MODS=[
  {num:'MOD 01',title:'Hacking Etico — Fundamentos',desc:'Metodologia, legislacao e escopo de pentest.',tags:['Legal','Scope','Methodology','Report']},
  {num:'MOD 02',title:'Reconhecimento e OSINT',desc:'Shodan, Maltego, Google Dorking.',tags:['OSINT','Shodan','Maltego','Recon']},
  {num:'MOD 03',title:'Varredura — Nmap Avancado',desc:'Scripts NSE, fingerprinting e enumeracao.',tags:['Nmap','NSE','Enum','Masscan']},
  {num:'MOD 04',title:'Exploracao Web — OWASP Top 10',desc:'SQL Injection, XSS, CSRF, IDOR e mais.',tags:['SQLi','XSS','CSRF','IDOR']},
  {num:'MOD 05',title:'Metasploit Framework',desc:'Exploits, payloads e pos-exploracao.',tags:['MSF','Meterpreter','Payload','Post']},
  {num:'MOD 06',title:'Active Directory Attacks',desc:'Kerberoasting, BloodHound, Pass-the-Hash.',tags:['AD','BloodHound','Kerb','PTH']},
  {num:'MOD 07',title:'Escalacao de Privilegios',desc:'Linux e Windows privesc.',tags:['PrivEsc','SUID','DLL','Token']},
  {num:'MOD 08',title:'Engenharia Social',desc:'Phishing avancado, SET e pretexting.',tags:['Phishing','SET','Vishing','Pretxt']},
  {num:'MOD 09',title:'Analise de Malware Ofensiva',desc:'Criacao, evasao de AV e C2.',tags:['Malware','AV Evasion','C2','Obfsc']},
  {num:'MOD 10',title:'Wireless Hacking',desc:'WPA/WPA2 cracking e MITM wireless.',tags:['Aircrack','WPA','Evil Twin','MITM']},
  {num:'MOD 11',title:'CTF e Bug Bounty',desc:'HackTheBox, TryHackMe e bug bounty.',tags:['HTB','THM','Bug Bounty','CTF']},
  {num:'MOD 12',title:'Preparacao OSCP',desc:'Simulados e buffer overflow.',tags:['OSCP','BOF','PWK','Report']},
];
var BL_TOOLS=[{i:'🔍',n:'Splunk',c:'SIEM'},{i:'🦌',n:'Elastic/ELK',c:'SIEM'},{i:'📡',n:'Snort',c:'IDS/IPS'},{i:'🦈',n:'Wireshark',c:'Network'},{i:'🛡',n:'Suricata',c:'IDS/IPS'},{i:'🔬',n:'Volatility',c:'Forense'},{i:'🗃',n:'Autopsy',c:'Forense'},{i:'🎯',n:'YARA',c:'Malware'},{i:'🦎',n:'Velociraptor',c:'Hunting'},{i:'📊',n:'Sigma',c:'Rules'},{i:'🧪',n:'Cuckoo',c:'Sandbox'},{i:'🔭',n:'OpenCTI',c:'CTI'},{i:'🗺',n:'MISP',c:'CTI'},{i:'⚙',n:'TheHive',c:'IR'}];
var RD_TOOLS=[{i:'💥',n:'Metasploit',c:'Exploit'},{i:'🌐',n:'Burp Suite',c:'Web Proxy'},{i:'🗺',n:'Nmap',c:'Scanning'},{i:'🐉',n:'Kali Linux',c:'Platform'},{i:'🐺',n:'BloodHound',c:'AD Enum'},{i:'🎭',n:'SET',c:'Social Eng'},{i:'🕷',n:'OWASP ZAP',c:'Web Scan'},{i:'🔑',n:'Hashcat',c:'Password'},{i:'💻',n:'SQLMap',c:'SQL'},{i:'📡',n:'Aircrack-ng',c:'Wireless'},{i:'🦅',n:'Mimikatz',c:'Creds'},{i:'🔵',n:'Cobalt Strike',c:'C2'},{i:'🧨',n:'John/Ripper',c:'Password'},{i:'🕵',n:'Maltego',c:'OSINT'}];
var BL_CAREERS=[{i:'🖥',t:'SOC Analyst Nivel 1',s:'R$4k-R$7k',d:'Monitoramento 24/7 e triagem de alertas.'},{i:'🔎',t:'Threat Hunter',s:'R$8k-R$14k',d:'Busca proativa de ameacas avancadas.'},{i:'🚨',t:'Incident Responder',s:'R$9k-R$16k',d:'Contencao e erradicacao de incidentes.'},{i:'🧩',t:'Malware Analyst',s:'R$10k-R$18k',d:'Analise e engenharia reversa de malware.'},{i:'📊',t:'Security Engineer',s:'R$12k-R$22k',d:'Arquitetura de controles defensivos.'},{i:'🏆',t:'CISO',s:'R$20k-R$40k',d:'Lideranca estrategica de seguranca.'}];
var RD_CAREERS=[{i:'🎯',t:'Pentester Jr.',s:'R$5k-R$9k',d:'Testes de invasao em aplicacoes e redes.'},{i:'🔴',t:'Red Team Operator',s:'R$10k-R$18k',d:'Simula APTs avancados em grandes corporacoes.'},{i:'🐛',t:'Bug Bounty Hunter',s:'R$8k-R$30k+',d:'Encontra vulnerabilidades por recompensas.'},{i:'🔓',t:'Exploit Developer',s:'R$15k-R$35k',d:'Desenvolve exploits e pesquisa zero-days.'},{i:'🕵',t:'Threat Intel Analyst',s:'R$9k-R$16k',d:'Analisa APTs e produz inteligencia estrategica.'},{i:'🏴',t:'Lead Pentester',s:'R$18k-R$40k',d:'Lidera times de red team em contratos.'}];

function renderMods(elId,mods,cls){ var el=document.getElementById(elId); if(!el) return; el.innerHTML=mods.map(function(m){ return '<div class="mod '+cls+'"><div class="mod-num">'+m.num+'</div><div class="mod-title">'+m.title+'</div><div class="mod-desc">'+m.desc+'</div><div class="mod-tags">'+m.tags.map(function(t){ return '<span class="mt mt-'+(cls==='bl-m'?'bl':'rd')+'">'+t+'</span>'; }).join('')+'</div></div>'; }).join(''); }
function renderTools(elId,tools){ var el=document.getElementById(elId); if(!el) return; el.innerHTML=tools.map(function(t){ return '<div class="tool"><div class="tool-ico">'+t.i+'</div><div class="tool-nm">'+t.n+'</div><div class="tool-ct">'+t.c+'</div></div>'; }).join(''); }
function renderCareers(elId,careers){ var el=document.getElementById(elId); if(!el) return; el.innerHTML=careers.map(function(c){ return '<div class="career"><div class="career-ico">'+c.i+'</div><div class="career-title">'+c.t+'</div><div class="career-sal">'+c.s+'/mes</div><div class="career-desc">'+c.d+'</div></div>'; }).join(''); }
function initBluePage(){ renderMods('bl-mods',BL_MODS,'bl-m'); renderTools('bl-tools',BL_TOOLS); renderCareers('bl-careers',BL_CAREERS); }
function initRedPage(){ renderMods('rd-mods',RD_MODS,'rd-m'); renderTools('rd-tools',RD_TOOLS); renderCareers('rd-careers',RD_CAREERS); }

// ── MENTOR IA ──
var KB=[
  {id:'siem',group:'Blue Team',k:['siem','splunk','qradar','elastic'],q:'O que e SIEM?',r:'**SIEM** (Security Information & Event Management) coleta, normaliza e correlaciona logs para detectar ameacas em tempo real.\n\n**Ferramentas:** Splunk, IBM QRadar, Elastic/ELK, Microsoft Sentinel\n\n`Splunk SPL:` index=main source=firewall action=blocked | stats count by src_ip',chips:['Como usar Splunk SPL?','SIEM vs SOAR?','Como criar alertas?']},
  {id:'nmap',group:'Red Team',k:['nmap','varredura','scan','port scan'],q:'Como usar o Nmap?',r:'**Nmap** - Scans essenciais:\n\n`# SYN Scan (furtivo)`\nnmap -sS -p- -T4 192.168.1.1\n\n`# Detectar versoes e SO`\nnmap -sV -O 192.168.1.1\n\n`# Scripts de vulnerabilidade`\nnmap --script vuln 192.168.1.1\n\n`# Descoberta de hosts`\nnmap -sn 192.168.1.0/24',chips:['Nmap vs Masscan?','Scripts NSE?','Como detectar scan?']},
  {id:'sqli',group:'Red Team',k:['sql injection','sqli','sqlmap','injecao sql'],q:'O que e SQL Injection?',r:'**SQL Injection** injeta comandos SQL em queries nao sanitizadas.\n\nPayloads basicos:\n` OR 1=1 --`\n` UNION SELECT NULL--`\n`admin --`\n\n**SQLMap:**\n`sqlmap -u "http://site.com?id=1"`\n`sqlmap -u "http://site.com?id=1" --dbs`\n\n**Prevencao:** Prepared Statements',chips:['SQLMap avancado?','Blind SQL Injection?','O que e XSS?']},
  {id:'xss',group:'Red Team',k:['xss','cross site scripting','cross-site'],q:'O que e XSS?',r:'**XSS** injeta scripts maliciosos em paginas web.\n\n**Tipos:** Reflected, Stored, DOM-based\n\n**Payloads de teste:**\n`&lt;script&gt;alert(1)&lt;/script&gt;`\n`&lt;img src=x onerror=alert(1)&gt;`\n`&lt;svg onload=alert(1)&gt;`\n\n**Prevencao:** CSP, HttpOnly cookies, sanitizacao',chips:['XSS vs CSRF?','Como usar CSP?','OWASP Top 10?']},
  {id:'mitre',group:'Blue Team',k:['mitre','att&ck','attck','ttp','kill chain'],q:'O que e MITRE ATT&CK?',r:'**MITRE ATT&CK** cataloga Taticas, Tecnicas e Procedimentos (TTPs) de adversarios reais.\n\n**14 Taticas:**\n`01. Reconhecimento    08. Descoberta`\n`02. Desenvolvimento   09. Mov. Lateral`\n`03. Acesso Inicial    10. Coleta`\n`04. Execucao          11. C2`\n`05. Persistencia      12. Exfiltracao`\n`06. Escalacao Priv.   13. Impacto`\n`07. Evasao            14. Credenciais`',chips:['ATT&CK Navigator?','O que e Sigma Rule?','MITRE no SOC?']},
  {id:'pentest',group:'Red Team',k:['pentest','teste de invasao','ethical hacking','hacking etico'],q:'Como funciona um Pentest?',r:'**5 Fases do Pentest:**\n`1. RECONHECIMENTO → OSINT, Shodan`\n`2. SCANNING       → Nmap, Nessus`\n`3. EXPLORACAO     → Metasploit, Burp`\n`4. POS-EXPLOIT    → Persistencia`\n`5. RELATORIO      → CVSS, Evidencias`\n\n**Tipos:** Black Box / White Box / Grey Box',chips:['O que e Metasploit?','Como fazer OSINT?','Black vs White Box?']},
  {id:'msf',group:'Red Team',k:['metasploit','msfconsole','meterpreter','exploit'],q:'Como usar o Metasploit?',r:'**Metasploit Framework:**\n`msfconsole`\n`msf6 > search eternalblue`\n`msf6 > use exploit/windows/smb/ms17_010_eternalblue`\n`msf6 exploit > set RHOSTS 192.168.1.10`\n`msf6 exploit > run`\n`meterpreter > sysinfo`\n`meterpreter > getsystem`\n`meterpreter > hashdump`',chips:['msfvenom payload?','Pos-exploitacao?','Escalacao de privilegios?']},
  {id:'owasp',group:'Red Team',k:['owasp','owasp top 10','vulnerabilidades web'],q:'O que e OWASP Top 10?',r:'**OWASP Top 10 — 2021:**\n`A01 Broken Access Control`\n`A02 Cryptographic Failures`\n`A03 Injection (SQL, XSS)`\n`A04 Insecure Design`\n`A05 Security Misconfiguration`\n`A06 Vulnerable Components`\n`A07 Auth Failures`\n`A08 Software Integrity`\n`A09 Logging Failures`\n`A10 SSRF`',chips:['O que e SSRF?','Broken Access Control?','IDOR na pratica?']},
  {id:'cripto',group:'Fundamentos',k:['criptografia','hash','md5','sha','aes','rsa','tls','ssl'],q:'Como funciona a criptografia?',r:'**Criptografia:**\n\n**Simetrica:** AES-256-GCM (recomendado)\n**Assimetrica:** RSA-4096, ECDSA, Ed25519\n**Hash:** SHA-256 (ok), MD5/SHA-1 (quebrados)\n\n**TLS 1.3 — HTTPS:**\n`1. Client Hello → cipher suites`\n`2. Server Hello + Certificado`\n`3. Key Exchange (ECDH)`\n`4. Dados cifrados com AES-256`',chips:['O que e PKI?','TLS 1.2 vs 1.3?','Ataques a criptografia?']},
  {id:'soc',group:'Blue Team',k:['soc','security operations center','analista soc'],q:'Como funciona um SOC?',r:'**SOC — Security Operations Center**\n\n**Niveis:**\n`Nivel 1 → Triagem de alertas`\n`Nivel 2 → Investigacao, threat hunting`\n`Nivel 3 → IR critico, analise malware`\n\n**Ferramentas:** SIEM (Splunk), SOAR (XSOAR), EDR (CrowdStrike), CTI (MISP)',chips:['SOAR vs SIEM?','EDR vs AV?','Como entrar no SOC?']},
  {id:'forense',group:'Blue Team',k:['forense','digital forensics','autopsy','volatility'],q:'O que e Forense Digital?',r:'**Forense Digital — Volatility:**\n`volatility -f memory.dmp imageinfo`\n`volatility -f memory.dmp --profile=Win10x64 pslist`\n`volatility -f memory.dmp --profile=Win10x64 netscan`\n`volatility -f memory.dmp --profile=Win10x64 malfind`\n\n**Artefatos Windows:** Prefetch, Registry, Event Logs, MFT',chips:['Volatility na pratica?','Criar imagem forense?','Forense em Linux?']},
  {id:'certs',group:'Fundamentos',k:['certificacao','ceh','oscp','security+','btl1','preparacao'],q:'Quais certificacoes tirar?',r:'**Roadmap de Certificacoes:**\n\n**Blue Team:**\n`Security+ → CySA+ → BTL1 → GCIH`\n\n**Red Team:**\n`eJPT → CEH → OSCP → CRTE`\n\n**Precos (2026):**\n`Security+: ~R$1.800`\n`CEH: ~R$3.500`\n`OSCP: ~R$2.500`\n`BTL1: ~R$1.200`',chips:['Como se preparar para OSCP?','Security+ vale a pena?','BTL1 vs CEH?']},
  {id:'hunting',group:'Blue Team',k:['threat hunting','caca a ameacas','proativo','hipotese'],q:'O que e Threat Hunting?',r:'**Threat Hunting** e busca proativa por ameacas que passaram pelos controles automaticos.\n\n**Processo:**\n`1. HIPOTESE  → Ha attacker usando PowerShell?`\n`2. COLETA    → Logs EDR, SIEM, DNS`\n`3. ANALISE   → Padroes anomalos`\n`4. DESCOBERTA→ Confirmar hipotese`\n`5. MELHORIA  → Nova regra automatica`',chips:['YARA rules?','Como detectar beaconing?','MITRE no hunting?']},
  {id:'ad',group:'Red Team',k:['active directory','kerberoasting','pass the hash','bloodhound'],q:'Ataques no Active Directory?',r:'**Active Directory Attacks:**\n\n**Kerberoasting:**\n`Invoke-Kerberoast | Export-CSV hashes.csv`\n`hashcat -m 13100 hashes.txt wordlist.txt`\n\n**Pass-the-Hash:**\n`mimikatz# sekurlsa::logonpasswords`\n`impacket-psexec -hashes :HASH admin@192.168.1.10`\n\n**BloodHound:**\n`SharpHound.exe --CollectionMethods All`',chips:['BloodHound setup?','Mimikatz?','Proteger o AD?']},
  {id:'burp',group:'Red Team',k:['burp suite','burp','proxy','interceptar'],q:'Como usar o Burp Suite?',r:'**Burp Suite — Modulos:**\n- **Proxy** → intercepta requisicoes HTTP\n- **Repeater** → reenvia manualmente\n- **Intruder** → fuzzing e brute force\n- **Scanner** → automatico (Pro)\n\n**Setup:**\n`1. Proxy: 127.0.0.1:8080`\n`2. Instalar CA cert no browser`\n`3. Interceptar e manipular requests`',chips:['Burp Free vs Pro?','Fuzzing?','Burp vs OWASP ZAP?']},
  {id:'ids',group:'Blue Team',k:['ids','ips','snort','suricata','deteccao de intrusao'],q:'IDS vs IPS — qual a diferenca?',r:'**IDS** detecta e alerta. **IPS** detecta e bloqueia.\n\n**Snort — regra basica:**\n`alert tcp any any -> 192.168.1.0/24 22 (`\n`  msg:"SSH Brute Force";`\n`  detection_filter:track by_src,count 5,seconds 60;`\n`  sid:100001;`\n`)`',chips:['Como instalar Snort?','Suricata vs Snort?','O que e NIDS?']},
  {id:'ecs',group:'ECS',k:['ecs','educa cyber','plataforma','matricula'],q:'Como funciona o ECS?',r:'**ECS — Educa Cyber Systems**\n\n**Trilhas:**\n- Blue Team Defensivo\n- Red Team Ofensivo\n- Forense e Analise\n- Ciberseguranca Completa\n\n**Planos:**\n`Mensal:     R$129,90/mes`\n`Trimestral: R$99,90/mes`\n`Anual:      R$79,90/mes`\n\n**Cupons:** ECS2025 · CYBER25 · BLUETEAM · REDTEAM',chips:['Como me matricular?','Qual trilha escolher?','Quais certificados emite?']},
];

var MENTOR_INIT=false, MSG_COUNT=0;
var WCHIPS=['O que e SIEM?','Como fazer Pentest?','MITRE ATT&CK na pratica','SQL Injection passo a passo','Certificacoes — por onde comecar?','O que e Threat Hunting?','Nmap avancado?','XSS e OWASP Top 10'];
var TOPIC_GROUPS=[
  {label:'Blue Team',color:'#00e5d4',items:['O que e SIEM?','IDS vs IPS?','MITRE ATT&CK?','Como funciona SOC?','Threat Hunting?','Forense Digital?']},
  {label:'Red Team',color:'#ef4444',items:['Como usar Nmap?','SQL Injection?','O que e XSS?','Metasploit basico?','OWASP Top 10?','Active Directory?']},
  {label:'Ferramentas',color:'#a78bfa',items:['Como usar Burp Suite?','Splunk SPL?','Volatility forense?','BloodHound AD?']},
  {label:'Carreira',color:'#22c55e',items:['Certificacoes recomendadas?','Salario em ciberseguranca?','OSCP vale a pena?','Bug Bounty iniciante?']},
];

function initMentor(){
  if(!MENTOR_INIT){
    MENTOR_INIT=true;
    renderMentorTopics(); renderWelcomeChips();
    var ks=document.getElementById('kb-size'); if(ks) ks.textContent=KB.length;
  }
}
function renderMentorTopics(){
  var el=document.getElementById('mn-topics'); if(!el) return;
  el.innerHTML=TOPIC_GROUPS.map(function(g){
    return '<div class="mn-sec">'+g.label+'</div>'+g.items.map(function(item){ return '<div class="mn-item" onclick="askChat(\''+item.replace(/'/g,"\\'")+'\')" ><div class="mn-dot" style="background:'+g.color+'"></div>'+item+'</div>'; }).join('');
  }).join('');
}
function renderWelcomeChips(){
  var el=document.getElementById('ws-chips'); if(!el) return;
  el.innerHTML=WCHIPS.map(function(t){ return '<div class="wchip" onclick="askChat(\''+t.replace(/'/g,"\\'")+'\')" >'+t+'</div>'; }).join('');
}
function findKB(query){
  var q=query.toLowerCase().trim(); var best=null, bestScore=0;
  KB.forEach(function(entry){ var score=0; entry.k.forEach(function(kw){ if(q.includes(kw)) score+=kw.length; }); if(score>bestScore){ bestScore=score; best=entry; } });
  return bestScore>0?best:null;
}
function formatBubble(text){
  return text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\n/g,'<br>');
}
function nowTime(){ return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function addMsg(role,html){
  var msgs=document.getElementById('chat-msgs'); if(!msgs) return;
  var ws=document.getElementById('welcome-screen'); if(ws) ws.remove();
  var d=document.createElement('div');
  d.className='msg-row'+(role==='me'?' me':'');
  var u=getUser()||{nome:'U'};
  var av=role==='me'?'<div class="mav mav-me">'+u.nome.charAt(0).toUpperCase()+'</div>':'<div class="mav mav-ai">🤖</div>';
  d.innerHTML=av+'<div><div class="bubble">'+html+'</div><div class="mtime">'+nowTime()+'</div></div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
  MSG_COUNT++;
  var mc=document.getElementById('msg-count'); if(mc) mc.textContent=MSG_COUNT;
}
function addChips(chips){
  var msgs=document.getElementById('chat-msgs'); if(!msgs) return;
  var d=document.createElement('div'); d.className='chips-fl';
  chips.forEach(function(c){ var btn=document.createElement('button'); btn.className='chip-f'; btn.textContent=c; btn.onclick=function(){ d.remove(); askChat(c); }; d.appendChild(btn); });
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  var msgs=document.getElementById('chat-msgs'); if(!msgs) return null;
  var id='typ-'+Date.now();
  var d=document.createElement('div'); d.id=id; d.className='typing-row';
  d.innerHTML='<div class="mav mav-ai">🤖</div><div class="typing-bub"><div class="td"></div><div class="td"></div><div class="td"></div></div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; return id;
}
function sendChat(){
  var inp=document.getElementById('ci-input'); if(!inp) return;
  var msg=inp.value.trim(); if(!msg) return;
  inp.value=''; inp.style.height='auto';
  addMsg('me',msg);
  var tid=showTyping();
  setTimeout(function(){
    if(tid){ var el=document.getElementById(tid); if(el) el.remove(); }
    var entry=findKB(msg);
    if(entry){
      var ct=document.getElementById('cur-topic'); if(ct) ct.textContent=entry.q;
      addMsg('ai',formatBubble(entry.r));
      if(entry.chips&&entry.chips.length) addChips(entry.chips);
    } else {
      addMsg('ai','Boa pergunta! Nosso KB cobre:<br><strong>Blue Team:</strong> SIEM, IDS/IPS, SOC, Forense, Threat Hunting<br><strong>Red Team:</strong> Nmap, SQLi, XSS, Metasploit, AD<br><strong>Carreira:</strong> Certs, salarios, roadmap<br><br>Tente reformular ou clique em um topico.');
      addChips(['O que e SIEM?','Como fazer Pentest?','MITRE ATT&CK?','Certificacoes?']);
    }
  },700+Math.random()*500);
}
function askChat(q){ var inp=document.getElementById('ci-input'); if(inp){ inp.value=q; } sendChat(); }
function clearChat(){
  var msgs=document.getElementById('chat-msgs'); if(!msgs) return;
  msgs.innerHTML='';
  var ws=document.createElement('div'); ws.className='welcome'; ws.id='welcome-screen';
  ws.innerHTML='<div class="wi">🤖</div><h2 class="wh2">Chat reiniciado</h2><p class="wp">Sobre o que voce quer aprender?</p><div class="wchips" id="ws-chips"></div>';
  msgs.appendChild(ws); renderWelcomeChips();
  MSG_COUNT=0;
  var mc=document.getElementById('msg-count'); if(mc) mc.textContent='0';
  var ct=document.getElementById('cur-topic'); if(ct) ct.textContent='—';
}

// Init
window.addEventListener('load',function(){
  // Init Supabase SDK
  initSB();
  // Load persisted data from localStorage cache
  loadCacheToArrays();
  var hash=window.location.hash.replace('#','');
  var valid=['home','blue-team','red-team','mentor-ia','matricula','painel-aluno','painel-professor','painel-admin'];
  go(valid.indexOf(hash)>=0?hash:'home');
  initFAQ();
  setTimeout(function(){
    var l=document.getElementById('loader'); if(l){ l.classList.add('out'); setTimeout(function(){ l.style.display='none'; },450); }
  },500);
});
window.addEventListener('popstate',function(){
  var hash=window.location.hash.replace('#','');
  if(hash) go(hash);
});