-- ═══════════════════════════════════════════════════════════════════
-- ECS — FIX RLS: Permitir anon key nas tabelas principais
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. DESABILITAR RLS nas tabelas que o N8N precisa escrever
alter table usuarios          disable row level security;
alter table matriculas        disable row level security;
alter table progresso_aluno   disable row level security;
alter table chamados          disable row level security;
alter table financeiro        disable row level security;
alter table base_conhecimento disable row level security;
alter table certificados      disable row level security;
alter table logs_sistema      disable row level security;
alter table xp_historico      disable row level security;
alter table notas             disable row level security;
alter table avaliacoes        disable row level security;
alter table turmas            disable row level security;
alter table cursos            disable row level security;
alter table modulos           disable row level security;
alter table aulas             disable row level security;
alter table mensagens_chamado disable row level security;

-- 2. GARANTIR que a anon key pode fazer INSERT/UPDATE/SELECT em tudo
grant usage  on schema public to anon;
grant all    on all tables    in schema public to anon;
grant all    on all sequences in schema public to anon;
grant execute on all functions in schema public to anon;

-- 3. Verificar se funcionou
select schemaname, tablename, rowsecurity 
from pg_tables 
where schemaname = 'public'
order by tablename;
