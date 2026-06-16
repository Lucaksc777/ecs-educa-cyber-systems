# 🛡 ECS — Educa Cyber Systems

Plataforma educacional completa de cibersegurança com trilhas Blue Team, Red Team, Forense e Full Cyber. Inclui portais para Aluno, Professor e Admin, Mentor IA, sistema de matrículas e integração completa com Supabase via N8N.

![HTML](https://img.shields.io/badge/Frontend-HTML%20%2B%20CSS%20%2B%20JS-00e5d4?style=flat-square)
![Supabase](https://img.shields.io/badge/Banco-Supabase%20PostgreSQL-3ECF8E?style=flat-square)
![N8N](https://img.shields.io/badge/Backend-N8N%20Webhooks-ea4b71?style=flat-square)

---

## 📁 Estrutura

```
ecs-educa-cyber-systems/
│
├── frontend/
│   ├── ECS_Sistema_Completo.html   ← Arquivo único (abrir direto no browser)
│   ├── index.html                  ← Versão com arquivos separados
│   ├── css/
│   │   └── styles.css              ← Design system completo (38KB)
│   ├── js/
│   │   ├── backend.js              ← Integração N8N + Supabase + cache
│   │   └── app.js                  ← Router, portais, UI (72KB)
│   └── pages/                      ← HTML de cada página
│       ├── home.html
│       ├── blue-team.html
│       ├── red-team.html
│       ├── mentor-ia.html
│       ├── matricula.html
│       ├── painel-aluno.html
│       ├── painel-professor.html
│       └── painel-admin.html
│
├── backend/
│   └── README.md                   ← Documentação da arquitetura
│
├── database/
│   ├── schema.sql                  ← Schema completo (16 tabelas)
│   ├── fix_rls.sql                 ← Desabilitar RLS (anon key)
│   └── fix_certificados.sql       ← Tornar campos nullable
│
├── n8n/
│   ├── workflow_completo.json      ← Workflow único (79 nós)
│   └── README.md
│
└── docs/
    └── README.md
```

---

## 🚀 Como Rodar

### 1. Banco de Dados (Supabase)
```
1. Acesse: supabase.com/dashboard/project/vfxocmjcumjhrnahyoep
2. SQL Editor → New Query
3. Cole database/schema.sql → Run
4. Cole database/fix_rls.sql → Run
5. Cole database/fix_certificados.sql → Run
```

### 2. N8N
```
1. Acesse: http://177.8.224.178:5678
2. Workflows → Import from file → n8n/workflow_completo.json
3. Ative o toggle (Active verde)
```

### 3. Frontend
```
Abra frontend/ECS_Sistema_Completo.html no browser
(duplo clique ou arraste para o Edge/Chrome)
```

---

## 🔐 Acessos Demo

| Portal | Email | Senha |
|--------|-------|-------|
| Aluno | `aluno@ecs.com` | `123456` |
| Professor | `prof@ecs.com` | `prof123` |
| Admin | `admin@ecs.com` | `admin123` |

---

## 🗄️ Banco de Dados

**Projeto Supabase:** `vfxocmjcumjhrnahyoep`

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Alunos, professores e admins |
| `matriculas` | Matrículas com fluxo de aprovação |
| `turmas` | Turmas por trilha |
| `cursos` | Catálogo de cursos |
| `modulos` | Módulos por curso |
| `aulas` | Aulas criadas por professores |
| `progresso_aluno` | Progresso + XP por aula |
| `xp_historico` | Histórico de XP ganho |
| `certificados` | Certificados emitidos |
| `avaliacoes` | Provas e avaliações |
| `notas` | Notas dos alunos |
| `chamados` | Tickets de suporte |
| `mensagens_chamado` | Chat dos chamados |
| `financeiro` | Pagamentos e mensalidades |
| `base_conhecimento` | KB do Mentor IA |
| `logs_sistema` | Auditoria completa |

---

## ⚙️ N8N — Webhooks

### Salvar dados (POST)

| Endpoint | Ação | Tabela |
|----------|------|--------|
| `/webhook/ecs-matricula` | Nova matrícula | `usuarios` + `matriculas` |
| `/webhook/ecs-matricula-aprovada` | Aprovar/cancelar | `matriculas` |
| `/webhook/ecs-aluno` | Adicionar aluno/prof | `usuarios` |
| `/webhook/ecs-progresso` | Aula concluída | `progresso_aluno` + `xp_historico` |
| `/webhook/ecs-certificado` | Emitir certificado | `logs_sistema` |
| `/webhook/ecs-chamado` | Abrir/resolver chamado | `chamados` |
| `/webhook/ecs-mensagem` | Mensagem no chamado | `mensagens_chamado` |
| `/webhook/ecs-aprender` | Salvar KB | `base_conhecimento` |
| `/webhook/ecs-turma` | Criar turma | `turmas` |
| `/webhook/ecs-aula` | Criar aula | `aulas` |
| `/webhook/ecs-avaliacao` | Criar avaliação/nota | `avaliacoes` + `notas` |
| `/webhook/ecs-financeiro` | Registrar pagamento | `financeiro` |

### Servir dados ao painel (GET)

| Endpoint | Retorna |
|----------|---------|
| `/webhook/ecs-painel?tipo=matriculas` | Lista de matrículas |
| `/webhook/ecs-painel?tipo=alunos` | Lista de alunos |
| `/webhook/ecs-painel?tipo=professores` | Lista de professores |
| `/webhook/ecs-painel?tipo=chamados` | Chamados abertos |
| `/webhook/ecs-painel?tipo=logs` | Logs do sistema |
| `/webhook/ecs-painel?tipo=financeiro` | Financeiro |
| `/webhook/ecs-painel?tipo=kb` | Base de conhecimento |

---

## 🏗️ Arquitetura

```
Browser (file://)
    │
    ├── localStorage (cache offline-first)
    │         ↑ restaura no refresh
    │
    └── N8N :5678 (backend — sem CORS)
              │
              ├── POST webhooks → Supabase (salvar)
              └── GET  webhooks → Supabase (carregar)
```

---

## 💼 Funcionalidades por Portal

### 👨‍🎓 Aluno
- Dashboard com XP, cursos e progresso
- Trilhas Blue Team, Red Team, Forense
- Mentor IA com base de conhecimento
- Certificados verificáveis (hash único)
- Chamados de suporte + chat

### 👨‍🏫 Professor
- Dashboard com turmas e alertas
- Criar e gerenciar aulas
- Avaliações e notas
- Base de Conhecimento (KB)
- Atender chamados dos alunos
- Relatórios de desempenho

### 👨‍💼 Admin
- Dashboard executivo com métricas
- Aprovar/cancelar matrículas
- Adicionar alunos e professores
- Criar turmas
- Gestão financeira
- Logs de auditoria completos
- Configurações do sistema

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript ES6 (SPA) |
| Design | CSS Custom Properties (dark theme) |
| Cache | localStorage (offline-first) |
| Backend | N8N self-hosted (http://177.8.224.178:5678) |
| Banco | Supabase PostgreSQL (16 tabelas + triggers + views) |

---

© 2026 Educa Cyber Systems
