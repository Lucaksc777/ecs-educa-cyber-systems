# Documentação Técnica — ECS

## Decisões de Arquitetura

### Por que SPA (Single Page Application)?
- Projeto acadêmico que roda como `file://` no browser
- Sem necessidade de servidor web (Nginx/Apache)
- Zero dependências de instalação para o professor avaliar

### Por que N8N como backend?
- Empresa já possui N8N rodando (`http://177.8.224.178:5678`)
- Resolve o problema de CORS ao abrir `file:///` no browser
- Funciona como proxy: HTML → N8N → Supabase
- Workflow visual facilita entendimento e manutenção

### Por que localStorage-first?
- Garante que dados persistam mesmo sem conexão ao N8N
- Experiência instantânea: UI atualiza antes da resposta da rede
- Merge inteligente: dados do Supabase sobrescrevem cache na sincronização

### Por que Supabase?
- PostgreSQL gerenciado (sem servidor para manter)
- API REST automática
- Row Level Security (RLS) nativo
- Triggers e views SQL padrão
- Dashboard visual para gerenciar dados

## Fluxo de Dados Completo

```
Usuário preenche formulário
         ↓
    confirmMat()
         ↓
  ┌──────┴──────┐
  │             │
localStorage   fetch POST
(instantâneo)  /webhook/ecs-matricula
  │             │
  │        N8N processa
  │             │
  │        Supabase salva
  │             │
  │        response JSON
  │             │
  └──────┬──────┘
         ↓
    UI atualizada
```

## Padrões de Código

### Nomenclatura JS
- `sb*` → funções de integração backend (ex: `sbSaveMatricula`)
- `render*` → funções que atualizam o DOM (ex: `renderAdmAlunos`)
- `init*` → funções de inicialização de portal/página (ex: `initAdmin`)
- `adm*` → ações do portal admin (ex: `admApprove`)
- `pr*` → ações do portal professor (ex: `prSaveKB`)
- `al*` → ações do portal aluno (ex: `alChat`)
- `mat*` → ações de matrícula (ex: `matNext`)

### CSS
- Variáveis CSS Custom Properties para todo o design system
- BEM-like naming: `.sb-item`, `.sb-item.on`, `.pv.on`
- Dark theme nativo via variáveis (sem media query necessária)
- Animações com CSS (sem biblioteca)

## Funcionalidades por Portal

### Aluno
- Dashboard com estatísticas (cursos, horas, XP)
- Listagem de cursos com progresso
- Mentor IA integrado (KB local, 17 tópicos)
- Acompanhamento de progresso por curso
- Download de certificados (HTML gerado dinamicamente)
- Suporte via chamados + chat rápido

### Professor
- Dashboard com turmas e alertas
- Gestão de alunos com filtros
- Upload de conteúdo (aulas, PDFs)
- Base de Conhecimento para o Mentor IA
- Avaliações e notas
- Chamados dos alunos
- Relatórios de desempenho

### Admin
- Dashboard executivo com métricas
- Gestão de alunos (CRUD + CSV export)
- Gestão de professores
- Aprovação/rejeição de matrículas
- Gestão de turmas
- Financeiro (mensalidades, atrasos)
- Chamados de suporte
- Configurações (N8N URL, Supabase Key)
- Logs de auditoria do sistema
