# Backend — ECS

O backend é composto por **N8N** (webhooks/automação) + **Supabase** (PostgreSQL).

## Fluxo

```
HTML → POST /webhook/ecs-* → N8N processa → Supabase salva
HTML ← GET  /webhook/ecs-painel?tipo=* ← N8N busca ← Supabase retorna
```

## Funções do backend.js

| Função | Webhook N8N | Tabela |
|--------|-------------|--------|
| `sbSaveMatricula()` | POST ecs-matricula | usuarios + matriculas |
| `sbAprovarMatricula()` | POST ecs-matricula-aprovada | matriculas |
| `sbCancelarMatricula()` | POST ecs-matricula-aprovada | matriculas |
| `sbAdicionarUsuario()` | POST ecs-aluno | usuarios |
| `sbSalvarProgresso()` | POST ecs-progresso | progresso_aluno + xp_historico |
| `sbSalvarCertificado()` | POST ecs-certificado | logs_sistema |
| `sbAbrirChamado()` | POST ecs-chamado | chamados |
| `sbResolverChamado()` | POST ecs-chamado | chamados |
| `sbEnviarMensagem()` | POST ecs-mensagem | mensagens_chamado |
| `sbSalvarKB()` | POST ecs-aprender | base_conhecimento |
| `sbCriarTurma()` | POST ecs-turma | turmas |
| `sbCriarAula()` | POST ecs-aula | aulas |
| `sbCriarAvaliacao()` | POST ecs-avaliacao | avaliacoes |
| `sbLancarNota()` | POST ecs-avaliacao | notas |
| `sbRegistrarFinanceiro()` | POST ecs-financeiro | financeiro |
| `syncFromSupabase()` | GET ecs-painel | todas |
