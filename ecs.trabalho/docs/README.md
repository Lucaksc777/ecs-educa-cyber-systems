# Documentação Técnica — ECS

## Arquitetura localStorage-first

1. Ação do usuário → localStorage atualizado INSTANTANEAMENTE
2. UI renderiza imediatamente (sem esperar rede)
3. fetch() para N8N em background
4. N8N salva no Supabase
5. No próximo refresh → syncFromSupabase() busca dados reais

## CORS

O HTML roda como `file:///` — browsers bloqueiam fetch() para domínios externos.
O N8N resolve isso: aceita requisições de qualquer origem (CORS *) e repassa ao Supabase.

## Credenciais

- N8N: `http://177.8.224.178:5678`
- Supabase URL: `https://vfxocmjcumjhrnahyoep.supabase.co`
- Anon Key: configurada no `backend.js` e no `workflow_completo.json`
