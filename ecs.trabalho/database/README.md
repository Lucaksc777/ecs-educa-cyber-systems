# Database — ECS Supabase

## Setup (executar em ordem)

```sql
-- 1. Schema completo
schema.sql

-- 2. Desabilitar RLS (permite anon key)
fix_rls.sql

-- 3. Tornar campos nullable (certificados)
fix_certificados.sql
```

## Tabelas

16 tabelas + 3 views + 8 triggers automáticos.

## Enums

- `user_role`: aluno, professor, admin
- `trilha_type`: blue_team, red_team, forense, full_cyber
- `mat_status`: pendente, aprovada, cancelada, expirada
- `plano_type`: mensal, trimestral, anual
- `chamado_status`: aberto, em_atendimento, resolvido, fechado
- `chamado_prio`: baixa, media, alta, critica
