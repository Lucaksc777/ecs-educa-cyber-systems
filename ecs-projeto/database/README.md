# Database — ECS Educa Cyber Systems

**Supabase (PostgreSQL)** — projeto `vfxocmjcumjhrnahyoep`

## Como Instalar

```sql
-- 1. Acesse: https://supabase.com/dashboard/project/vfxocmjcumjhrnahyoep
-- 2. SQL Editor → New Query
-- 3. Cole o conteúdo de schema.sql
-- 4. Run (Ctrl+Enter)
-- Resultado esperado: "Success. No rows returned"
```

## Tabelas (16)

| Tabela | Chave Primária | Relações |
|--------|---------------|---------|
| `usuarios` | `uuid` | base de tudo |
| `turmas` | `uuid` | professor_id → usuarios |
| `matriculas` | `uuid` | usuario_id, turma_id, aprovado_por |
| `cursos` | `uuid` | professor_id → usuarios |
| `modulos` | `uuid` | curso_id → cursos |
| `aulas` | `uuid` | modulo_id, curso_id |
| `progresso_aluno` | `uuid` | usuario_id, aula_id, curso_id |
| `xp_historico` | `uuid` | usuario_id |
| `certificados` | `uuid` | usuario_id, curso_id |
| `avaliacoes` | `uuid` | turma_id, professor_id |
| `notas` | `uuid` | avaliacao_id, usuario_id |
| `chamados` | `uuid` | autor_id, atendente_id |
| `mensagens_chamado` | `uuid` | chamado_id, autor_id |
| `financeiro` | `uuid` | usuario_id, matricula_id |
| `base_conhecimento` | `uuid` | autor_id |
| `logs_sistema` | `uuid` | usuario_id |

## Views (3)

| View | Retorna |
|------|---------|
| `v_dashboard_admin` | Contadores executivos |
| `v_progresso_curso` | Progresso aluno × curso |
| `v_resumo_financeiro` | Receita por mês |

## Triggers (8)

| Trigger | Tabela | Função |
|---------|--------|--------|
| `trg_*_upd` | 6 tabelas | Auto-atualiza `updated_at` |
| `trg_cert_hash` | certificados | Gera hash MD5 único |
| `trg_log_matricula` | matriculas | Log automático de status |

## Enums (9)

```sql
user_role:        aluno | professor | admin
trilha_type:      blue_team | red_team | forense | full_cyber
mat_status:       pendente | aprovada | cancelada | expirada
plano_type:       mensal | trimestral | anual
chamado_status:   aberto | em_atendimento | resolvido | fechado
chamado_prio:     baixa | media | alta | critica
conteudo_tipo:    video | pdf | texto | lab | quiz
aula_status:      nao_iniciada | em_andamento | concluida
pagamento_status: pendente | pago | atrasado | cancelado
```
