# Backend — ECS Educa Cyber Systems

O backend do ECS é composto por **N8N** (automação/API) + **Supabase** (banco PostgreSQL).

## Tecnologias

| Tecnologia | Papel | URL |
|-----------|-------|-----|
| N8N | API / Webhooks / Automação | `http://177.8.224.178:5678` |
| Supabase | Banco de Dados (PostgreSQL) | `https://vfxocmjcumjhrnahyoep.supabase.co` |

## Fluxo Completo

### Escrita (POST)
```
Frontend → POST /webhook/ecs-matricula
              ↓
           N8N processa payload
           - Valida dados
           - Calcula valor com desconto
              ↓
           POST /rest/v1/usuarios (upsert por email)
              ↓
           POST /rest/v1/matriculas
              ↓
           POST /rest/v1/logs_sistema
              ↓
           Response { success: true }
              ↓
           Frontend atualiza localStorage + UI
```

### Leitura (GET)
```
Frontend → GET /webhook/ecs-painel?tipo=matriculas
              ↓
           N8N detecta tipo
              ↓
           Switch → GET Matrículas (Supabase com join)
              ↓
           Formata dados
              ↓
           Response { success, tipo, total, data: [...] }
              ↓
           Frontend merge com localStorage + renderiza tabela
```

## Variáveis de Configuração

Definidas em `frontend/js/backend.js`:

```javascript
var SB_URL = 'https://vfxocmjcumjhrnahyoep.supabase.co';
var SB_KEY = 'eyJhbGci...'; // Anon Key do Supabase
var N8N    = 'http://177.8.224.178:5678';
```

## Estratégia localStorage-First

Todo dado é salvo em dois lugares:

1. **localStorage** → imediato, sem rede, persiste refresh
2. **Supabase via N8N** → background, source of truth

No startup da página:
```javascript
loadCacheToArrays();   // restaura localStorage → arrays em memória
syncFromSupabase();    // busca Supabase via N8N → atualiza arrays + UI
```

## Módulos do Backend (backend.js)

| Função | Descrição |
|--------|-----------|
| `initSB()` | Inicializa o cliente Supabase (CDN) |
| `CACHE.get/set/push/update` | Gerencia o cache localStorage |
| `sbSaveMatricula(mat)` | Salva matrícula no cache + N8N → Supabase |
| `sbAprovarMatricula(id)` | Aprova matrícula no cache + N8N → Supabase |
| `sbAdicionarAluno(dados)` | Adiciona aluno via Admin |
| `sbSalvarKB(item)` | Salva na base de conhecimento |
| `sbAbrirChamado(...)` | Abre chamado de suporte |
| `sbResolverChamado(id)` | Resolve chamado |
| `syncFromSupabase()` | Sync completo: N8N → arrays → UI |
| `loadCacheToArrays()` | Restaura localStorage → arrays |
| `sbTestConnection()` | Testa se N8N está acessível |
| `sbSaveConfig(n8n, key)` | Salva configurações |
