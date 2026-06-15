-- ═══════════════════════════════════════════════════════════════════
-- ECS — Educa Cyber Systems
-- Schema Supabase completo
-- Projeto: qxhzegzlnmkabjheqftg
-- ═══════════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- busca textual

-- ─── ENUM TYPES ────────────────────────────────────────────────────
create type user_role       as enum ('aluno','professor','admin');
create type trilha_type     as enum ('blue_team','red_team','forense','full_cyber');
create type mat_status      as enum ('pendente','aprovada','cancelada','expirada');
create type plano_type      as enum ('mensal','trimestral','anual');
create type chamado_status  as enum ('aberto','em_atendimento','resolvido','fechado');
create type chamado_prio    as enum ('baixa','media','alta','critica');
create type conteudo_tipo   as enum ('video','pdf','texto','lab','quiz');
create type aula_status     as enum ('nao_iniciada','em_andamento','concluida');
create type pagamento_status as enum ('pendente','pago','atrasado','cancelado');

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: usuarios
-- ═══════════════════════════════════════════════════════════════════
create table if not exists usuarios (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  email       text not null unique,
  role        user_role not null default 'aluno',
  avatar_url  text,
  telefone    text,
  cidade      text,
  estado      char(2),
  nivel_exp   text default 'iniciante',
  ativo       boolean default true,
  ultimo_login timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
comment on table usuarios is 'Todos os usuários do sistema ECS';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: turmas
-- ═══════════════════════════════════════════════════════════════════
create table if not exists turmas (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  trilha       trilha_type not null,
  professor_id uuid references usuarios(id) on delete set null,
  descricao    text,
  max_alunos   int default 30,
  data_inicio  date,
  data_fim     date,
  ativa        boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
comment on table turmas is 'Turmas de cada trilha de aprendizado';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: matriculas
-- ═══════════════════════════════════════════════════════════════════
create table if not exists matriculas (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete cascade,
  turma_id    uuid references turmas(id) on delete set null,
  trilha      trilha_type not null,
  plano       plano_type not null default 'mensal',
  status      mat_status not null default 'pendente',
  valor       numeric(10,2) not null,
  desconto    numeric(5,2) default 0,
  cupom       text,
  aprovado_por uuid references usuarios(id) on delete set null,
  aprovado_em  timestamptz,
  obs         text,
  id_local    text unique, -- ID gerado no front-end
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
comment on table matriculas is 'Matrículas dos alunos — fluxo aprovação admin';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: cursos
-- ═══════════════════════════════════════════════════════════════════
create table if not exists cursos (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  descricao   text,
  trilha      trilha_type not null,
  thumbnail   text,
  carga_h     int default 0,        -- horas
  total_aulas int default 0,
  nivel       text default 'iniciante',
  professor_id uuid references usuarios(id) on delete set null,
  publicado   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
comment on table cursos is 'Catálogo de cursos por trilha';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: modulos
-- ═══════════════════════════════════════════════════════════════════
create table if not exists modulos (
  id          uuid primary key default uuid_generate_v4(),
  curso_id    uuid references cursos(id) on delete cascade,
  titulo      text not null,
  descricao   text,
  ordem       int not null default 1,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: aulas (conteúdo)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists aulas (
  id          uuid primary key default uuid_generate_v4(),
  modulo_id   uuid references modulos(id) on delete cascade,
  curso_id    uuid references cursos(id) on delete cascade,
  titulo      text not null,
  descricao   text,
  tipo        conteudo_tipo not null default 'video',
  url         text,
  duracao_min int default 0,
  ordem       int not null default 1,
  publicada   boolean default false,
  xp_recompensa int default 10,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
comment on table aulas is 'Aulas e conteúdos de cada módulo';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: progresso_aluno
-- ═══════════════════════════════════════════════════════════════════
create table if not exists progresso_aluno (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete cascade,
  aula_id     uuid references aulas(id) on delete cascade,
  curso_id    uuid references cursos(id) on delete cascade,
  status      aula_status not null default 'nao_iniciada',
  xp_ganho    int default 0,
  tempo_min   int default 0,  -- tempo assistido
  concluido_em timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(usuario_id, aula_id)
);
comment on table progresso_aluno is 'Rastreamento de progresso individual por aula';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: xp_historico
-- ═══════════════════════════════════════════════════════════════════
create table if not exists xp_historico (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete cascade,
  xp          int not null,
  motivo      text not null, -- 'aula_concluida', 'lab_completado', 'certificado', etc.
  ref_id      uuid,          -- ID da aula/lab/cert relacionada
  created_at  timestamptz default now()
);
comment on table xp_historico is 'Histórico de XP ganho por aluno';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: certificados
-- ═══════════════════════════════════════════════════════════════════
create table if not exists certificados (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete cascade,
  curso_id    uuid references cursos(id) on delete cascade,
  hash        text not null unique,  -- hash de verificação
  emitido_em  timestamptz default now(),
  valido      boolean default true
);
comment on table certificados is 'Certificados emitidos e verificáveis por hash';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: avaliacoes
-- ═══════════════════════════════════════════════════════════════════
create table if not exists avaliacoes (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  turma_id    uuid references turmas(id) on delete cascade,
  professor_id uuid references usuarios(id) on delete set null,
  prazo       timestamptz,
  total_pontos numeric(5,2) default 10,
  status      text default 'aberta',
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: notas
-- ═══════════════════════════════════════════════════════════════════
create table if not exists notas (
  id           uuid primary key default uuid_generate_v4(),
  avaliacao_id uuid references avaliacoes(id) on delete cascade,
  usuario_id   uuid references usuarios(id) on delete cascade,
  nota         numeric(5,2),
  feedback     text,
  entregue_em  timestamptz,
  created_at   timestamptz default now(),
  unique(avaliacao_id, usuario_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: chamados (suporte)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists chamados (
  id           uuid primary key default uuid_generate_v4(),
  autor_id     uuid references usuarios(id) on delete cascade,
  atendente_id uuid references usuarios(id) on delete set null,
  assunto      text not null,
  descricao    text,
  prioridade   chamado_prio not null default 'media',
  status       chamado_status not null default 'aberto',
  resolvido_em timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
comment on table chamados is 'Chamados de suporte aluno → professor/admin';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: mensagens_chamado
-- ═══════════════════════════════════════════════════════════════════
create table if not exists mensagens_chamado (
  id          uuid primary key default uuid_generate_v4(),
  chamado_id  uuid references chamados(id) on delete cascade,
  autor_id    uuid references usuarios(id) on delete cascade,
  mensagem    text not null,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: financeiro
-- ═══════════════════════════════════════════════════════════════════
create table if not exists financeiro (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete cascade,
  matricula_id uuid references matriculas(id) on delete set null,
  descricao   text not null,
  valor       numeric(10,2) not null,
  tipo        text not null,  -- 'mensalidade','estorno','desconto'
  status      pagamento_status not null default 'pendente',
  vencimento  date,
  pago_em     timestamptz,
  created_at  timestamptz default now()
);
comment on table financeiro is 'Registros financeiros e pagamentos';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: base_conhecimento (KB Mentor IA)
-- ═══════════════════════════════════════════════════════════════════
create table if not exists base_conhecimento (
  id          uuid primary key default uuid_generate_v4(),
  autor_id    uuid references usuarios(id) on delete set null,
  problema    text not null,
  solucao     text not null,
  categoria   text not null default 'outro',
  tags        text[],
  aprovado    boolean default false,
  views       int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
comment on table base_conhecimento is 'Base de conhecimento para o Mentor IA';

-- ═══════════════════════════════════════════════════════════════════
-- TABELA: logs_sistema
-- ═══════════════════════════════════════════════════════════════════
create table if not exists logs_sistema (
  id          uuid primary key default uuid_generate_v4(),
  usuario_id  uuid references usuarios(id) on delete set null,
  acao        text not null,
  detalhes    jsonb,
  ip          text,
  created_at  timestamptz default now()
);
comment on table logs_sistema is 'Auditoria de ações no sistema';

-- ═══════════════════════════════════════════════════════════════════
-- VIEWS ÚTEIS
-- ═══════════════════════════════════════════════════════════════════

-- View: progresso por aluno e curso
create or replace view v_progresso_curso as
select
  pa.usuario_id,
  u.nome as aluno_nome,
  u.email as aluno_email,
  c.id as curso_id,
  c.titulo as curso_titulo,
  c.trilha,
  c.total_aulas,
  count(pa.id) filter (where pa.status = 'concluida') as aulas_concluidas,
  round(
    count(pa.id) filter (where pa.status = 'concluida') * 100.0
    / nullif(c.total_aulas, 0), 1
  ) as percentual,
  coalesce(sum(pa.xp_ganho), 0) as xp_total,
  max(pa.updated_at) as ultima_atividade
from progresso_aluno pa
join usuarios u on u.id = pa.usuario_id
join aulas a on a.id = pa.aula_id
join cursos c on c.id = pa.curso_id
group by pa.usuario_id, u.nome, u.email, c.id, c.titulo, c.trilha, c.total_aulas;

-- View: resumo financeiro
create or replace view v_resumo_financeiro as
select
  date_trunc('month', f.created_at) as mes,
  count(*) filter (where f.status = 'pago') as pagamentos,
  sum(f.valor) filter (where f.status = 'pago') as receita,
  count(*) filter (where f.status = 'atrasado') as atrasados,
  sum(f.valor) filter (where f.status = 'atrasado') as valor_atrasado
from financeiro f
group by date_trunc('month', f.created_at)
order by mes desc;

-- View: dashboard admin
create or replace view v_dashboard_admin as
select
  (select count(*) from usuarios where role = 'aluno' and ativo) as total_alunos,
  (select count(*) from usuarios where role = 'professor' and ativo) as total_professores,
  (select count(*) from turmas where ativa) as total_turmas,
  (select count(*) from matriculas where status = 'pendente') as matriculas_pendentes,
  (select count(*) from matriculas where status = 'aprovada') as matriculas_aprovadas,
  (select count(*) from chamados where status = 'aberto') as chamados_abertos,
  (select coalesce(sum(valor),0) from financeiro where status='pago' and date_trunc('month', pago_em) = date_trunc('month', now())) as receita_mes;

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Atualizar updated_at automaticamente
create or replace function fn_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_usuarios_upd
  before update on usuarios
  for each row execute function fn_updated_at();

create or replace trigger trg_matriculas_upd
  before update on matriculas
  for each row execute function fn_updated_at();

create or replace trigger trg_turmas_upd
  before update on turmas
  for each row execute function fn_updated_at();

create or replace trigger trg_aulas_upd
  before update on aulas
  for each row execute function fn_updated_at();

create or replace trigger trg_progresso_upd
  before update on progresso_aluno
  for each row execute function fn_updated_at();

create or replace trigger trg_chamados_upd
  before update on chamados
  for each row execute function fn_updated_at();

-- Gerar hash de certificado
create or replace function fn_gen_cert_hash()
returns trigger language plpgsql as $$
begin
  if new.hash is null or new.hash = '' then
    new.hash = 'ECS-' || upper(substring(md5(new.usuario_id::text || new.curso_id::text || now()::text), 1, 8));
  end if;
  return new;
end;
$$;

create or replace trigger trg_cert_hash
  before insert on certificados
  for each row execute function fn_gen_cert_hash();

-- Log de ações importantes
create or replace function fn_log_matricula()
returns trigger language plpgsql as $$
begin
  insert into logs_sistema(usuario_id, acao, detalhes)
  values(
    new.usuario_id,
    case
      when TG_OP = 'INSERT' then 'matricula_criada'
      when new.status = 'aprovada' and old.status != 'aprovada' then 'matricula_aprovada'
      when new.status = 'cancelada' and old.status != 'cancelada' then 'matricula_cancelada'
      else 'matricula_atualizada'
    end,
    jsonb_build_object('matricula_id', new.id, 'trilha', new.trilha, 'status', new.status)
  );
  return new;
end;
$$;

create or replace trigger trg_log_matricula
  after insert or update on matriculas
  for each row execute function fn_log_matricula();

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════

alter table usuarios        enable row level security;
alter table matriculas      enable row level security;
alter table progresso_aluno enable row level security;
alter table chamados        enable row level security;
alter table financeiro      enable row level security;
alter table base_conhecimento enable row level security;
alter table certificados    enable row level security;

-- Políticas: usuário vê apenas seus próprios dados
-- (Admin via service role key bypassa RLS)

create policy "usuarios_self" on usuarios
  for all using (auth.uid() = id);

create policy "matriculas_self" on matriculas
  for all using (auth.uid() = usuario_id);

create policy "progresso_self" on progresso_aluno
  for all using (auth.uid() = usuario_id);

create policy "chamados_self" on chamados
  for all using (auth.uid() = autor_id or auth.uid() = atendente_id);

create policy "financeiro_self" on financeiro
  for all using (auth.uid() = usuario_id);

create policy "certificados_self" on certificados
  for all using (auth.uid() = usuario_id);

-- Base de conhecimento: leitura pública, escrita autenticada
create policy "kb_read_all" on base_conhecimento
  for select using (true);

create policy "kb_write_auth" on base_conhecimento
  for insert with check (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════
-- DADOS INICIAIS (SEED)
-- ═══════════════════════════════════════════════════════════════════

-- Cursos padrão
insert into cursos (titulo, descricao, trilha, carga_h, total_aulas, nivel, publicado) values
  ('Blue Team Fundamentals',    'SIEM, IDS/IPS, SOC e resposta a incidentes',          'blue_team', 80, 24, 'iniciante',    true),
  ('Threat Hunting Avançado',   'Caça proativa a ameaças com MITRE ATT&CK',             'blue_team', 40, 12, 'avancado',     true),
  ('Pentest Web — OWASP Top 10','SQL Injection, XSS, CSRF e toda a lista OWASP',        'red_team',  60, 18, 'intermediario',true),
  ('Metasploit e Exploits',     'Framework completo de exploração e pós-exploração',    'red_team',  50, 16, 'intermediario',true),
  ('Forense Digital',           'Análise de evidências, disco, memória e rede',         'forense',   45, 14, 'intermediario',true),
  ('Análise de Malware',        'Análise estática/dinâmica com Ghidra e Cuckoo',        'forense',   35, 12, 'avancado',     true),
  ('Cibersegurança Completa',   'Blue Team + Red Team + Forense + Certificações',       'full_cyber',200, 60, 'iniciante',    true)
on conflict do nothing;

-- Turmas padrão  
insert into turmas (nome, trilha, descricao, max_alunos, data_inicio, ativa) values
  ('Blue Team Turma A-2026',  'blue_team', 'Turma iniciante Blue Team — 2026',       30, '2026-03-01', true),
  ('Red Team Turma A-2026',   'red_team',  'Turma ofensiva Red Team — 2026',         25, '2026-03-15', true),
  ('Forense Turma A-2026',    'forense',   'Turma forense e análise — 2026',         20, '2026-03-20', true),
  ('Full Cyber Turma A-2026', 'full_cyber','Trilha completa integrada — 2026',       15, '2026-04-01', true)
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════
-- ÍNDICES para performance
-- ═══════════════════════════════════════════════════════════════════
create index if not exists idx_usuarios_email  on usuarios(email);
create index if not exists idx_usuarios_role   on usuarios(role);
create index if not exists idx_matriculas_uid  on matriculas(usuario_id);
create index if not exists idx_matriculas_st   on matriculas(status);
create index if not exists idx_progresso_uid   on progresso_aluno(usuario_id);
create index if not exists idx_progresso_cid   on progresso_aluno(curso_id);
create index if not exists idx_chamados_autor  on chamados(autor_id);
create index if not exists idx_chamados_st     on chamados(status);
create index if not exists idx_financeiro_uid  on financeiro(usuario_id);
create index if not exists idx_logs_uid        on logs_sistema(usuario_id);
create index if not exists idx_logs_acao       on logs_sistema(acao);
create index if not exists idx_kb_cat          on base_conhecimento(categoria);
create index if not exists idx_kb_tags         on base_conhecimento using gin(tags);

-- FIM DO SCHEMA
