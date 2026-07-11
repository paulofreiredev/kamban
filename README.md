# Kamban - Plataforma de Gestão de Projetos em Kanban

Plataforma de gestão visual de tarefas em modelo Kanban para times, com suporte a múltiplos projetos, gerenciamento de membros e dashboard de produtividade.

## 📋 O que é Kamban?

Kamban é uma aplicação web de gestão visual de tarefas que permite:

- **Gestão de Projetos/Times**: Criar múltiplos projetos, cada um com seus próprios membros
- **Kanban Visual**: Organizar tarefas em colunas (Backlog, A Fazer, Em Progresso, Em Revisão, Concluído, Cancelado)
- **Colaboração**: Atribuir tarefas a membros, adicionar comentários e anexos
- **Filtering**: Filtrar tarefas por período e responsável
- **Dashboard Admin**: Visualizar produtividade do time com gráficos e métricas
- **Controle de Acesso**: Usuários veem apenas projetos que são membros; admins gerenciam tudo

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Angular 19)                │
│  - Standalone Components                                    │
│  - Signals para estado reativo                              │
│  - Guards de autenticação e autorização                     │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Go + Fiber v2)                  │
│  - RESTful API com 52 handlers                              │
│  - JWT Authentication                                       │
│  - Middleware de autenticação e autorização                 │
│  - Transaction-based delete cascade                         │
└─────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL 16 + GORM)                │
│  - users, projects, project_members                         │
│  - cards, comments, attachments                             │
│  - Índices para performance                                 │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principais

**Backend (Go + Fiber)**
- Framework: Fiber v2.52.5
- ORM: GORM
- Auth: JWT com Claims object
- Database: PostgreSQL 16

**Frontend (Angular)**
- Framework: Angular 19
- State: Signals-based
- Routing: Component guards
- HTTP: HttpClient service

**Database (PostgreSQL)**
- Migrations automáticas com GORM
- Seed de admin padrão
- Seed de projeto padrão
- Indexes em chaves estrangeiras

## 🚀 Como Subir o Projeto

### Pré-requisitos
- Docker e Docker Compose instalados

### Quick Start

```bash
# Clonar repositório
cd /home/paulo/projetos/kamban

# Subir todos os containers
docker compose up -d

# Aguardar inicialização (~30 segundos)
# - Backend: http://localhost:8080
# - Frontend: http://localhost:8081
# - Database: localhost:5432

# Credenciais iniciais:
# Email: admin@kamban.local
# Senha: admin123
```

### Parar

```bash
docker compose down
```

## 📂 Estrutura do Projeto

```
kamban/
├── backend/
│   ├── internal/
│   │   ├── handlers/         # HTTP handlers (RESTful)
│   │   ├── models/           # Domain models
│   │   ├── middleware/       # Auth middleware
│   │   ├── services/         # JWT service
│   │   ├── dto/              # Request/response DTOs
│   │   └── database/         # Database setup & migrations
│   ├── cmd/api/              # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── pages/            # Route components
│   │   ├── core/             # Services (API, Auth)
│   │   ├── guards/           # Route guards
│   │   └── models.ts         # Type definitions
│   └── Dockerfile
├── docker-compose.yml        # Orquestração
└── README.md
```

## 📊 Funcionalidades Principais

### 1️⃣ Autenticação
- Login com email/senha
- JWT token com role (admin/user)
- Autologout ao expirar token

### 2️⃣ Gestão de Projetos (Admin)
- ✅ Criar projetos com descrição
- ✅ Editar informações do projeto
- ✅ Adicionar/remover membros
- ✅ Inativar projetos
- ✅ **Deletar projetos** (com confirmação) - deleta também:
  - Todas as tarefas do projeto
  - Todos os comentários
  - Todos os anexos
  - Todas as atribuições de membros

### 3️⃣ Seleção de Projeto
- Usuários veem lista de projetos que são membros
- Clicam para selecionar qual projeto trabalhar
- Admins podem trabalhar sem selecionar (veem todos)
- Non-member users veem mensagem: "você não está em nenhum time"

### 4️⃣ Kanban Board
- 6 colunas: Backlog, A Fazer, Em Progresso, Em Revisão, Concluído, Cancelado
- Drag-and-drop entre colunas
- Filtro por data (últimos 30 dias por padrão)
- Filtro por responsável

### 5️⃣ Gestão de Tarefas (Cards)
- Criar novas tarefas
- Adicionar descrição
- Anexar arquivos (imagens/vídeos)
- Adicionar comentários
- Atribuir responsável
- Editar/deletar tarefas

### 6️⃣ Gestão de Usuários (Admin)
- Criar novos usuários
- Editar informações
- Reset de senha (envia por email)
- Alterar própria senha

### 7️⃣ Dashboard Admin
- Gráfico pizza: distribuição de tarefas por status
- Tarefas em andamento e concluídas por usuário
- Usuário mais e menos produtivo
- Filtro por período

## 🔑 Rotas Principais

### Frontend
- `/login` - Página de login
- `/projects/select` - Seleção de projeto
- `/no-project` - Mensagem quando não é membro de nenhum projeto
- `/` - Home com Kanban board (protegido por projectAccessGuard)
- `/admin/dashboard` - Dashboard (admin only)
- `/admin/projects` - Gerenciamento de projetos (admin only)
- `/admin/users` - Gerenciamento de usuários (admin only)

### Backend API
```
Authentication:
  POST   /api/auth/login

Projects:
  GET    /api/projects                 # Listar projetos
  GET    /api/projects/:id             # Detalhes do projeto
  POST   /api/projects                 # Criar projeto
  PUT    /api/projects/:id             # Editar projeto
  DELETE /api/projects/:id             # Deletar projeto (cascata)
  POST   /api/projects/:id/members     # Adicionar membro
  DELETE /api/projects/:id/members/:memberId  # Remover membro
  POST   /api/projects/:id/deactivate  # Inativar projeto

Cards:
  GET    /api/cards?projectId=ID       # Listar cards
  POST   /api/cards                    # Criar card
  PUT    /api/cards/:id                # Atualizar card
  DELETE /api/cards/:id                # Deletar card
  
[... mais endpoints]
```

## 🛡️ Segurança

- JWT com claims armazenado em middleware
- Role-based access control (RBAC)
- Hash de senhas com bcrypt
- CORS habilitado
- Guards de rota no frontend
- Validação de autorização em todo endpoint

## 🐳 Docker Compose

Serviços:
- `kamban-postgres-1` - PostgreSQL 16
- `kamban-backend-1` - Backend Go/Fiber
- `kamban-frontend-1` - Frontend Angular + Nginx

Volumes:
- `postgres_data` - Dados do banco
- `uploads` - Arquivos anexados

Ports:
- `5432` - PostgreSQL
- `8080` - Backend
- `8081` - Frontend (via nginx)

## 📝 Variáveis de Ambiente

Backend (`.env` ou docker-compose):
```
DATABASE_URL=postgres://kamban:kamban@postgres:5432/kamban_db
JWT_SECRET=seu_secret_aqui
CORS_ORIGIN=http://localhost:8081
```

## 🔄 Fluxo de Uso

1. **Administrador** faz login
2. Admin acessa "Gerenciar projetos" e cria um novo projeto
3. Admin adiciona membros ao projeto
4. **Usuário membro** faz login
5. Sistema redireciona para seleção de projeto
6. Usuário seleciona projeto e acessa Kanban board
7. Usuário cria/atualiza tarefas, adiciona comentários
8. Admin monitora produtividade via Dashboard

## 🧪 Testes

Testes E2E com Cypress:
```bash
cd frontend
npx cypress open
```

Testes disponíveis:
- Login
- Fluxo integrado (criar tarefa, arrastar, comentar)
- Filtros de data e responsável
- Gerenciamento de projetos

## 📚 Documentação Adicional

- [ADR - Architecture Decision Records](./docs/adr/)
- [Feature Specs](./docs/specs/features/)
- [Screenshots](./docs/screenshots/)
- [Security Guidelines](./docs/security/)

---

**Última atualização:** Julho 2026  
**Versão:** MVP com Gerenciamento de Projetos

## Aparencia do projeto
!["HOME"](./docs/screenshots/home.png)
