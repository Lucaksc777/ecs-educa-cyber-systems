# N8N — Workflow ECS

## Import

```
1. http://177.8.224.178:5678
2. Workflows → Import from file → workflow_completo.json
3. Toggle → Active (verde)
```

## Estrutura (79 nós)

- 2 CORS handlers (OPTIONS)
- 12 fluxos POST (salvar dados)
- 1 fluxo GET com Switch (servir painel)
- Filtros para prevenir _skip no Supabase
