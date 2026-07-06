# Implementação do Sistema de Projetos (Times)

## Resumo das Mudanças

Este documento descreve as mudanças implementadas para transformar o Kamban de um board único para um sistema de **Projetos** (times), onde cada projeto agrupa membros e atividades.

## Arquitetura

### Backend (Go)

#### Novos Modelos
- `Project`: Representa um projeto/time com proprietário, título, descrição e status ativo/inativo
- `ProjectMember`: Associação muitos-para-muitos entre usuários e projetos
- `Card`: Agora incluiu `ProjectID` como foreign key obrigatória

#### Novos Endpoints

**Sem autenticação:**
- `POST /api/auth/login` (existente)

**Com autenticação:**

**Projetos:**
- `GET /api/projects` - Lista projetos do usuário (ou todos se admin)
- `GET /api/projects/:projectId` - Detalhes do projeto
- `POST /api/projects` - Cria novo projeto (admin only)
- `PUT /api/projects/:projectId` - Edita projeto (admin only)
- `DELETE /api/projects/:projectId` - Deleta projeto (admin only)
- `PATCH /api/projects/:projectId/deactivate` - Inativa projeto (admin only)
- `POST /api/projects/:projectId/members` - Adiciona membro (admin only)
- `DELETE /api/projects/:projectId/members/:memberId` - Remove membro (admin only)

**Cards (modificados):**
- `GET /api/cards?projectId=X&from=...&to=...&assigneeId=...` - Requer `projectId`
- `POST /api/cards` - Requer `projectId` no payload

### Frontend (Angular 19)

#### Novos Componentes
- `ProjectSelectComponent` - Página para usuário escolher qual projeto quer acessar
- `NoProjectComponent` - Mensagem para usuários sem projeto
- `AdminProjectsComponent` - Gerenciamento completo de projetos (CRUD)

#### Novos Guards
- `projectAccessGuard` - Garante que usuário tem um projeto selecionado antes de acessar o board
- `projectSelectionGuard` - Redireciona para seleção de projeto se necessário

#### Atualizações em Componentes Existentes
- `HomeComponent` - Agora filtra cards por projeto selecionado, inclui botão "Trocar Projeto"
- `AuthService` - Armazena projeto selecionado em localStorage
- `ApiService` - Todos os métodos de card agora recebem `projectId`

#### Novas Rotas
- `/projects/select` - Seleção de projeto após login
- `/no-project` - Mensagem para usuários sem projeto
- `/admin/projects` - Gerenciamento de projetos (admin only)

## Fluxo de Usuário

### Usuário Comum
1. Faz login
2. Sistema redireciona para `/projects/select`
3. Usuário seleciona um projeto
4. Acessa o board do projeto
5. Pode clicar em "Trocar Projeto" para voltar à seleção
6. Se não tem nenhum projeto, vê mensagem e é redirecionado para `/no-project`

### Administrador
1. Faz login
2. Pode ir direto para o board (se tiver projeto) ou para gerenciamento
3. Tem acesso a `/admin/projects` para:
   - Criar novos projetos
   - Editar título/descrição
   - Adicionar/remover membros
   - Inativar ou deletar projetos
   - Ver estatísticas (membros, tarefas)

## Migrações de Dados

### Seed Script

Ao iniciar o backend pela primeira vez, o script `002_seed_default_project.sql` será executado e:

1. **Cria um projeto default** chamado "Projeto Padrão" de propriedade do primeiro admin
2. **Migra todos os cards existentes** para este projeto
3. **Adiciona todos os usuários como membros** do projeto default

Isso garante que:
- Dados existentes não são perdidos
- Usuários podem acessar o board normalmente
- Admin pode reorganizar usuários em projetos depois

### Comandos Úteis

```bash
# Limpar e recriarbanco do zero
docker compose down -v
docker compose up -d postgres backend db-seed frontend

# Verificar migrações
docker compose logs backend | grep -i migration

# Acessar banco para verificar
docker compose exec postgres psql -U postgres -d kamban \
  -c "SELECT * FROM projects;"
```

## Estados do Projeto

### Ativo (`isActive = true`)
- Projeto visível para membros
- Membros podem criar/editar cards
- Projeto aparece na lista de seleção

### Inativo (`isActive = false`)
- Projeto **não** aparece na lista de seleção
- Cards continuam no banco (não deletados)
- Admin ainda pode ativar ou deletar o projeto
- Útil para arquivar projetos sem perder dados

## Controle de Acesso

### Por Página

| Página | Quem pode acessar | Validações |
|--------|------------------|-----------|
| `/login` | Público | - |
| `/projects/select` | Autenticado | Mostra apenas projetos ativos que usuário participa |
| `/no-project` | Autenticado sem projeto | - |
| `/` (board) | Autenticado + com projeto | Requer `projectAccessGuard` |
| `/admin/users` | Admin | - |
| `/admin/dashboard` | Admin | - |
| `/admin/projects` | Admin | - |

### Por Projeto

- **Usuário comum**: Vê e acessa apenas projetos que é membro
- **Admin**: Vê todos os projetos (ativos e inativos)
- **Criação de cards**: Apenas membros do projeto podem criar

## Banco de Dados

### Novas Tabelas

```sql
-- Projetos
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Membros do projeto
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id),
  user_id INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP
);

-- Alteração em cards
ALTER TABLE cards ADD COLUMN project_id INT NOT NULL REFERENCES projects(id);
```

## Testes E2E

### Novos Testes Sugeridos

- `project-selection.cy.ts` - Fluxo de login e seleção de projeto
- `project-no-access.cy.ts` - Usuário sem projeto
- `admin-projects.cy.ts` - CRUD de projetos
- `admin-project-members.cy.ts` - Gerenciamento de membros

### Alterações em Testes Existentes

Todos os testes que criam cards precisam ser atualizados para incluir `projectId`:

```typescript
// Antes
cy.createCard('Título', 'Descrição');

// Depois
cy.createCard('Título', 'Descrição', projectId);
```

## Variáveis de Ambiente

Nenhuma nova variável de ambiente é necessária. O sistema continua usando as mesmas configurações.

## Compatibilidade

### Clientes Legados
Se houver clientes antigos que chamam a API sem `projectId`, receberão erro `400 - projectId is required`.

Para manter compatibilidade, pode-se:
1. Criar uma migração que associa requests sem projectId ao projeto default
2. Ou documentar o breaking change e versionar a API

### Banco de Dados
Todas as migrations são idempotentes. Rodar `MigrateAndSeed` múltiplas vezes é seguro.

## Troubleshooting

### Erro: "you don't have access to this project"
- Usuário não é membro do projeto
- Solução: Admin adiciona usuário em `/admin/projects`

### Erro: "projectId is required"
- API foi chamada sem `projectId`
- Solução: Adicionar `projectId` na query string ou no payload

### Usuário vê tela "Sem Acesso a Projetos"
- Usuário não é membro de nenhum projeto
- Solução: Admin adiciona usuário a um projeto em `/admin/projects`

### Carregar projeto padrão não funcionou
- Verificar se admin foi criado antes da migração
- Consultar logs: `docker compose logs backend`
- Verificar banco: `docker compose exec postgres psql -U postgres -d kamban -c "SELECT * FROM projects;"`

## Roadmap Futuro

- [ ] Roles/permissões por projeto (project owner, project member)
- [ ] Convites para projetos
- [ ] Arquivo de projetos
- [ ] Template de projetos
- [ ] Integração com Git (labels/branches)
- [ ] API webhook para projetos
