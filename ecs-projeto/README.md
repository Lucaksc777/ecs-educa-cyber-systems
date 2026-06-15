# 🛡 ECS — Educa Cyber Systems

Plataforma educacional completa de cibersegurança com trilhas Blue Team, Red Team, Forense, Mentor IA, sistema de matrículas e portais para Aluno, Professor e Admin.

![Stack](https://img.shields.io/badge/Frontend-HTML%20%2B%20CSS%20%2B%20JS-00e5d4?style=flat-square)
![DB](https://img.shields.io/badge/Banco-Supabase%20PostgreSQL-3ECF8E?style=flat-square)
![Auto](https://img.shields.io/badge/Automação-N8N-ea4b71?style=flat-square)

---

## 📁 Estrutura do Projeto

```
ecs-educa-cyber-systems/
│
├── frontend/                    # Interface da aplicação (SPA)
│   ├── index.html               # Arquivo principal (entry point)
│   ├── css/
│   │   └── styles.css           # Todos os estilos (38KB, 380 linhas)
│   ├── js/
│   │   ├── backend.js           # Integração Supabase + N8N + cache local
│   │   └── app.js               # Lógica da aplicação (router, portais, UI)
│   └── pages/                   # Componentes HTML de cada página
│       ├── modals.html          # Modal de login e modal genérico
│       ├── home.html            # Página inicial (hero, features, FAQ)
│       ├── blue-team.html       # Página do curso Blue Team
│       ├── red-team.html        # Página do curso Red Team
│       ├── mentor-ia.html       # Chat com IA (base de conhecimento local)
│       ├── matricula.html       # Formulário de matrícula (3 etapas)
│       ├── painel-aluno.html    # Portal do aluno
│       ├── painel-professor.html # Portal do professor
│       └── painel-admin.html    # Portal administrativo
│
├── backend/
│   └── README.md                # Documentação da arquitetura backend
│
├── database/
│   ├── schema.sql               # Schema completo Supabase (485 linhas)
│   └── README.md                # Documentação das tabelas e views
│
├── n8n/
│   ├── workflow_completo.json   # Workflow N8N unificado (46 nós)
│   └── README.md                # Documentação dos webhooks
│
└── docs/
    └── README.md                # Documentação técnica completa
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (SPA)                       │
│  index.html + css/styles.css + js/backend.js + js/app.js │
└───────────────────────┬────────────────────────┬────────┘
                        │                        │
              localStorage cache          N8N Webhooks
              (persiste refresh)    (intermediário sem CORS)
                        │                        │
                        └───────────┬────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │         N8N (Backend)          │
                    │  http://177.8.224.178:5678     │
                    │  7 webhooks POST + 1 GET       │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    Supabase (PostgreSQL)        │
                    │  16 tabelas + 3 views           │
                    │  RLS + Triggers + Indexes       │
                    └───────────────────────────────┘
```

---

## 🚀 Como Rodar

### 1. Banco de Dados
```sql
-- Supabase Dashboard → SQL Editor → New Query
-- Cole o conteúdo de database/schema.sql e execute
```

### 2. Automação N8N
```
N8N → Workflows → Import from file → n8n/workflow_completo.json
Ative o workflow (toggle verde)
```

### 3. Frontend
```
Abra frontend/index.html no browser
(duplo clique ou arraste para o browser)
```

---

## 🔐 Acessos Demo

| Portal | Email | Senha |
|--------|-------|-------|
| Aluno | `aluno@ecs.com` | `123456` |
| Professor | `prof@ecs.com` | `prof123` |
| Admin | `admin@ecs.com` | `admin123` |

---

## 📊 Banco de Dados — Supabase

**Projeto:** `vfxocmjcumjhrnahyoep`

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Alunos, professores e admins |
| `turmas` | Turmas por trilha |
| `matriculas` | Matrículas com fluxo de aprovação |
| `cursos` | Catálogo de cursos |
| `modulos` | Módulos por curso |
| `aulas` | Aulas e conteúdos |
| `progresso_aluno` | Progresso + XP por aula |
| `xp_historico` | Histórico de XP |
| `certificados` | Certificados com hash verificável |
| `avaliacoes` | Provas e avaliações |
| `notas` | Notas dos alunos |
| `chamados` | Tickets de suporte |
| `mensagens_chamado` | Mensagens dos chamados |
| `financeiro` | Pagamentos e mensalidades |
| `base_conhecimento` | KB do Mentor IA |
| `logs_sistema` | Auditoria de ações |

---

## ⚙️ Webhooks N8N

| Método | Endpoint | Função |
|--------|----------|--------|
| POST | `/webhook/ecs-matricula` | Nova matrícula |
| POST | `/webhook/ecs-matricula-aprovada` | Aprovar matrícula |
| POST | `/webhook/ecs-aluno` | Adicionar aluno |
| POST | `/webhook/ecs-aprender` | Salvar na KB |
| POST | `/webhook/ecs-chamado` | Abrir chamado |
| POST | `/webhook/ecs-progresso` | Registrar progresso |
| GET | `/webhook/ecs-painel?tipo=...` | Servir dados ao painel |

---

## 🛠️ Stack

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| Frontend | HTML5 + CSS3 + JS ES6 | SPA vanilla, sem framework |
| Estilo | CSS Custom Properties | Design system próprio, dark theme |
| Cache | localStorage | Offline-first, persiste refresh |
| Automação | N8N (self-hosted) | Backend visual, 46 nós |
| Banco | Supabase (PostgreSQL) | 16 tabelas, RLS, triggers |
| SDK | @supabase/supabase-js v2 | Via CDN jsdelivr |

---

## 📄 Licença

Projeto educacional — Educa Cyber Systems © 2026
