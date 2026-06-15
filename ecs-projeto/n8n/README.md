# N8N — Workflow ECS

Workflow único com **46 nós** que substitui um servidor backend tradicional.

## Como Importar

```
1. Acesse http://177.8.224.178:5678
2. Workflows → botão ⋯ → Import from file
3. Selecione: n8n/workflow_completo.json
4. Clique no toggle "Inactive" → vira "Active" (verde)
```

## Endpoints

### POST — Salvar dados no Supabase

| Endpoint | Body | Supabase |
|----------|------|---------|
| `/webhook/ecs-matricula` | `{nome,email,tel,trilha,plano,desconto,cupom,id_local}` | INSERT usuarios + matriculas + logs |
| `/webhook/ecs-matricula-aprovada` | `{id_local,aprovado_por,ts}` | PATCH matriculas.status='aprovada' |
| `/webhook/ecs-aluno` | `{nome,email,trilha}` | INSERT usuarios |
| `/webhook/ecs-aprender` | `{problema,solucao,categoria}` | INSERT base_conhecimento |
| `/webhook/ecs-chamado` | `{assunto,descricao,prioridade}` | INSERT chamados |
| `/webhook/ecs-progresso` | `{usuario_id,aula_id,curso_id,xp}` | INSERT progresso_aluno |

### GET — Servir dados ao painel HTML

| Endpoint | Retorna |
|----------|---------|
| `/webhook/ecs-painel?tipo=matriculas` | Lista com join usuarios |
| `/webhook/ecs-painel?tipo=alunos` | Usuários role=aluno |
| `/webhook/ecs-painel?tipo=professores` | Usuários role=professor |
| `/webhook/ecs-painel?tipo=chamados` | Chamados com join usuario |
| `/webhook/ecs-painel?tipo=logs` | Logs com join usuario |
| `/webhook/ecs-painel?tipo=financeiro` | Financeiro com join usuario |
| `/webhook/ecs-painel?tipo=kb` | Base de conhecimento |

### OPTIONS — CORS Preflight

```
OPTIONS /webhook/ecs-matricula  → 204 + CORS headers
OPTIONS /webhook/ecs-painel     → 204 + CORS headers
```

## Fluxo da Matrícula (nós envolvidos)

```
WH POST Matrícula
  → Parse Matrícula        (JS: calcula valor com desconto)
  → SB Upsert Usuário      (HTTP: POST /rest/v1/usuarios)
  → Extrair ID Usuário     (JS: pega o UUID gerado)
  → SB Insert Matrícula    (HTTP: POST /rest/v1/matriculas)
  → SB Log Matrícula       (HTTP: POST /rest/v1/logs_sistema)
  → Resp Matrícula         (JSON: {success:true, id_local})
```
