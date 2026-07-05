# Kamban

Plataforma de gestão visual de tarefas em modelo Kanban para times.

> Status: Implementação MVP + melhorias. Funcionalidades RF-001 até RF-011 implementadas e prontas para execução em Docker.

## Stack definida

### Backend
- Linguagem: Go (Golang)
- Framework HTTP: Fiber
- Banco de dados: PostgreSQL

### Frontend
- Framework: Angular 19

### Ambiente local
- Contêineres Docker
- Build com estratégia multi-stage
- Anexos salvos localmente em volume mapeado do container (MVP)

## Funcionalidades implementadas

1. ✅ Tela de login com usuário pré-cadastrado.
2. ✅ Tela Home com colunas:
   - Backlog
   - A Fazer
   - Em Progresso
   - Em Revisão
   - Concluído
   - Cancelado
3. ✅ Filtro de datas na Home:
   - Preenchido por padrão com os últimos 30 dias a partir da data atual.
4. ✅ Ação de cadastro de novo card.
5. ✅ Cada card suporta:
   - Título
   - Descrição
   - Anexos (imagens e vídeos)
   - Comentários
   - Responsável (membro do time)
6. ✅ Usuário admin pode cadastrar novos usuários no time.
7. ✅ Cada membro do time pode ser atribuído como responsável por cards.
8. ✅ Usuário autenticado (incluindo admin) pode alterar a própria senha.
9. ✅ Admin pode resetar senha de usuário para o email do usuário.
10. ✅ Admin pode visualizar dashboard de produtividade por período com:
  - Gráfico de pizza por status
  - Tarefas em andamento e concluídas por usuário
  - Destaque de usuário mais e menos produtivo

## Como executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Start

```bash
# Clonar e entrar no diretório
cd /home/paulo/projetos/kamban

# Subir os containers
docker compose up -d

# Aguardar inicialização (~30 segundos)
# Backend em http://localhost:8080
# Frontend em http://localhost:8081

# Credenciais iniciais:
# Email: admin@kamban.local
# Senha: admin123
```

> O admin padrão é provisionado via script SQL idempotente em `backend/internal/database/scripts/001_seed_admin.sql`.

### Parar

```bash
docker compose down
```

## Dashboard administrativo (produtividade)

- Rota frontend: `/admin/dashboard` (somente admin)
- API: `GET /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Métricas:
  - Quantidade de tarefas por status no período
  - Quantidade de tarefas `in_progress` e `done` por usuário

## Deploy (Docker)

### Build de imagens

```bash
cd /home/paulo/projetos/kamban
docker compose build backend frontend
```

### Subir serviços

```bash
docker compose up -d postgres backend db-seed frontend
```

### Verificar saúde

```bash
docker ps
curl -i http://localhost:8080/api/auth/login
```

## Configuração do banco de dados

### Variáveis principais

- `DATABASE_URL` (backend): conexão PostgreSQL no formato
  `postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=disable`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (serviço postgres no compose)

### Bootstrap e migração

- Ao iniciar, o backend executa `AutoMigrate` das tabelas.
- O serviço `db-seed` do Docker Compose executa seed SQL de admin padrão:
  - arquivo: `backend/internal/database/scripts/001_seed_admin.sql`
  - comportamento: idempotente (`WHERE NOT EXISTS`)

### Exemplo de conexão local

- Host: `localhost`
- Porta: `5432`
- Database: `kamban`
- Usuário: `postgres`
- Senha: `postgres`

### Aplicar/recriar banco do zero (ambiente local)

```bash
cd /home/paulo/projetos/kamban
docker compose down -v
docker compose up -d postgres backend db-seed frontend
```

## Testes End-to-End (Cypress)

Testes E2E com Cypress cobrem todas as funcionalidades do sistema, incluindo novas features de UX.

### Testes disponíveis

| Teste | Arquivo | Cobertura |
|-------|---------|-----------|
| RF-001 Login | `rf-001-login.cy.ts` | Autenticação, erro de credenciais, inatividade |
| RF-002 Home Kanban + Drag-Drop | `rf-002-home-kanban.cy.ts` | 6 colunas, ordem correta |
| RF-002 Drag-Drop com Justificativa | `rf-002-drag-drop-justificativa.cy.ts` | Movimento forward (sem justificativa), backward (com justificativa), cancelamento |
| RF-003 Filtro datas | `rf-003-filtro-datas.cy.ts` | Padrão 30 dias, alteração de período |
| RF-003 Filtro por Responsável | `rf-003-filtro-responsavel.cy.ts` | Dropdown de responsáveis, filtro dinâmico, combo com filtro de datas |
| RF-004 Cadastro card | `rf-004-cadastro-card.cy.ts` | Criação com título, validação, card em Backlog |
| **RF-004 Modal card (NOVO)** | `rf-004-cadastro-card-modal.cy.ts` | Modal form, validação, fechamento, atribuição de responsável |
| RF-005 Anexos | `rf-005-anexos.cy.ts` | Upload imagem, upload vídeo, validação tipo |
| RF-006 Comentários | `rf-006-comentarios.cy.ts` | Adicionar comentário, histórico, autor/data |
| RF-007 Responsável | `rf-007-atribuicao-responsavel.cy.ts` | Atribuir a membro, alterar responsável |
| RF-008 Gestão usuários | `rf-008-gestao-usuarios.cy.ts` | Criar usuário (admin), validar elegibilidade |
| **RF-009 Justificativa (NOVO)** | `rf-009-justificativa.cy.ts` | Modal justificativa, validação obrigatória, persistência, display |
| Fluxo integrado | `fluxo-integrado.cy.ts` | Happy path completo: login → card → anexo → comentário |
| **Fluxo integrado NOVO** | `fluxo-integrado-novo.cy.ts` | Modal → Drag-Drop → Filtro: criar card, filtrar, mover, justificar |

**Total: 14 suites de teste, 100+ casos de teste**

### Como executar

#### Pré-requisitos
- Sistema rodando em Docker: `docker compose up -d`
- Aguardar inicialização (~30 segundos)
- Frontend disponível em `http://localhost:8081`

#### Opção 1: Modo interativo (UI Cypress)

```bash
cd frontend

# Abre o Cypress com interface gráfica
npm run cy:open

# Na interface:
# 1. Selecionar "E2E Testing"
# 2. Selecionar navegador (Chrome/Firefox/Edge)
# 3. Selecionar teste a rodar
```

#### Opção 2: Modo headless (CI/CD)

```bash
cd frontend

# Rodar todos os testes
npm run cy:run

# Rodar teste específico
npm run cy:run -- --spec "cypress/e2e/rf-001-login.cy.ts"

# Rodar em navegador específico
npm run cy:run -- --browser chrome
```

#### Opção 3: Modo watch (desenvolvimento)

```bash
cd frontend

# Roda testes em modo watch com reload
npm run cy:watch
```

### Scripts Cypress no package.json

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:watch": "cypress run --watch"
  }
}
```

### Configuração Cypress

Arquivo: `frontend/cypress.config.ts`

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    setupNodeEvents(on, config) { /* ... */ }
  }
});
```

### Estrutura dos testes

Cada teste segue o padrão:

```typescript
describe('RF-XXX - Descrição', () => {
  beforeEach(() => {
    cy.login('admin@kamban.local', 'admin123');
    cy.visit('/');
  });

  it('CA-XXX.1 - Descrição do caso', () => {
    // Arrange, Act, Assert
  });
});
```

### Helpers Cypress

Arquivo: `frontend/cypress/support/commands.ts`

Comandos customizados disponíveis:

```typescript
cy.login(email, password)        // Efetua login
cy.logout()                      // Faz logout
cy.createCard(title, desc)       // Cria card
cy.openCardDetail(cardTitle)     // Abre detalhe do card
cy.addComment(cardId, content)   // Adiciona comentário
cy.uploadAttachment(cardId, file) // Faz upload de arquivo
```

### Interpretando resultados

Após rodar os testes:

1. **Verde (✓)**: Teste passou
2. **Vermelho (✗)**: Teste falhou
3. **Amarelo (⚠)**: Warning/pendente

Consulte `frontend/cypress/videos/` para gravação de testes falhados.

## 📊 Diagramas e Screenshots das Funcionalidades

Documentação visual completa das features implementadas com testes E2E:

### 🖼️ Diagramas SVG Interativos

#### 1. **Board Kanban Completo** - Visão Geral
[01-kanban-board-novo.svg](docs/screenshots/01-kanban-board-novo.svg)

Mostra todas as colunas com cards, filtros, contadores e integração de todas as features:
- 6 colunas: Backlog, A Fazer, Em Progresso, Em Revisão, Concluído, Cancelado
- Cards com informações de responsável
- Filtros de data e responsável funcionando
- Cards com justificativa visíveis

**Testes**: RF-001, fluxo-integrado-novo

---

#### 2. **Modal de Criar Atividade** - Formulário
[02-modal-criar-atividade.svg](docs/screenshots/02-modal-criar-atividade.svg)

Formulário completo para criação de nova atividade com campos:
- Título (obrigatório)
- Descrição (Markdown)
- Responsável (dropdown)
- Prioridade (radio buttons)
- Data de Vencimento

**Testes**: rf-004-cadastro-card-modal.cy.ts (7 test cases)

---

#### 3. **Modal de Justificativa** - Retrocesso
[03-modal-justificativa-retrocesso.svg](docs/screenshots/03-modal-justificativa-retrocesso.svg)

Modal que aparece ao retroceder uma atividade com:
- Informações de movimento (de/para status)
- Campo obrigatório de justificativa (min 10 chars)
- Categoria de problema (opcional)
- Validação e persistência

**Testes**: rf-009-justificativa.cy.ts (10 test cases)

---

#### 4. **Filtro por Responsável** - Dropdown Dinâmico
[04-filtro-responsavel.svg](docs/screenshots/04-filtro-responsavel.svg)

Dropdown no header com:
- Lista de responsáveis do time
- Avatares com cores
- Contadores de atividades por responsável
- Filtro em tempo real no board
- Ordenação alfabética

**Testes**: rf-003-filtro-responsavel.cy.ts (12 test cases)

---

#### 5. **Fluxo de Drag-Drop** - Forward vs Backward
[05-fluxo-drag-drop.svg](docs/screenshots/05-fluxo-drag-drop.svg)

Dois cenários de movimento:
- **Forward** (→): Sem modal, movimento automático
- **Backward** (←): Com modal obrigatória de justificativa

**Testes**: rf-002-drag-drop-justificativa.cy.ts (7 test cases)

---

#### 6. **Infográfico Visual** - Guia Completo
[INFOGRAFICO_VISUAL.svg](docs/screenshots/INFOGRAFICO_VISUAL.svg)

Guia visual one-pager com todas as funcionalidades explicadas:
- Como criar atividade
- Movimentos forward/backward
- Modal de justificativa
- Filtro por responsável
- Visão do board

---

### 📚 Documentação Associada

| Documento | Descrição | Conteúdo |
|-----------|-----------|----------|
| [INDEX.md](docs/screenshots/INDEX.md) | 📇 Índice Completo | Matriz de testes, legendas, checklist |
| [VISUAL_GUIDE.md](docs/screenshots/VISUAL_GUIDE.md) | 👁️ Guia Visual Rápido | Como usar cada funcionalidade, exemplos |
| [SCREENSHOTS_DIAGRAMS.md](SCREENSHOTS_DIAGRAMS.md) | 🎨 ASCII Diagrams | Diagramas em arte ASCII de cada feature |
| [INFOGRAFICO_VISUAL.svg](docs/screenshots/INFOGRAFICO_VISUAL.svg) | 📊 One-Pager | Resumo visual de todas as funções |

---

### 🧪 Cobertura de Testes por Diagrama

| Feature | Diagrama | Suite de Testes | Cases |
|---------|----------|-----------------|-------|
| Modal Criar | 02-modal-criar-atividade.svg | rf-004-cadastro-card-modal.cy.ts | 7 |
| Justificativa | 03-modal-justificativa-retrocesso.svg | rf-009-justificativa.cy.ts | 10 |
| Filtro Responsável | 04-filtro-responsavel.svg | rf-003-filtro-responsavel.cy.ts | 12 |
| Drag-Drop | 05-fluxo-drag-drop.svg | rf-002-drag-drop-justificativa.cy.ts | 7 |
| Board Completo | 01-kanban-board-novo.svg | fluxo-integrado-novo.cy.ts | 10 |
| **TOTAL** | **6 diagramas** | **5 suites novas** | **46+ casos** |

---

## Novas Features com Testes (Atualização UX)

### 1. Modal de Criação de Card (RF-004)

**Teste**: `rf-004-cadastro-card-modal.cy.ts`

**Casos cobertos:**
- ✅ Abrir/fechar modal
- ✅ Validação de formulário (título obrigatório)
- ✅ Criação com título e descrição
- ✅ Atribuição de responsável
- ✅ Múltiplas criações em sequência
- ✅ Fechar com ESC/backdrop
- ✅ Card aparece no Backlog

**Como testar manualmente:**
1. Clique em "+ Nova Atividade"
2. Preencha título (obrigatório)
3. Opcionalmente: descrição e responsável
4. Clique em "Criar"
5. Modal fecha e card aparece em Backlog

### 2. Drag-Drop com Justificativa (RF-002 + RF-009)

**Teste**: `rf-002-drag-drop-justificativa.cy.ts`

**Casos cobertos:**
- ✅ Movimento forward (Backlog → Todo) sem justificativa
- ✅ Movimento backward (In Progress → Todo) com justificativa obrigatória
- ✅ Cancelamento (qualquer status → Cancelled) com justificativa
- ✅ Rejeição sem justificativa
- ✅ Persistência de justificativa no card

**Como testar manualmente:**
1. Crie um card
2. Mova para frente (nenhuma modal aparece)
3. Mova para trás → modal de justificativa aparece
4. Preencha razão da regressão
5. Clique "Confirmar" para mover
6. Abra card → veja justificativa persistida

### 3. Filtro por Responsável (RF-003)

**Teste**: `rf-003-filtro-responsavel.cy.ts`

**Casos cobertos:**
- ✅ Dropdown de responsáveis na header
- ✅ Filtrar por "Todos" (padrão)
- ✅ Filtrar por responsável específico
- ✅ Combinação com filtro de datas
- ✅ Atualização ao criar card com assignee
- ✅ Ordenação alfabética

**Como testar manualmente:**
1. Crie vários cards com responsáveis diferentes
2. Use dropdown "Responsável" na header
3. Selecione "Todos" ou um responsável
4. Board filtra em tempo real
5. Combine com filtro de datas se necessário

### 4. Justificativa em Card (RF-009)

**Teste**: `rf-009-justificativa.cy.ts`

**Casos cobertos:**
- ✅ Modal obrigatória ao mover para trás
- ✅ Validação de texto não vazio
- ✅ Persistência no banco
- ✅ Display no drawer do card
- ✅ Suporte a caracteres especiais
- ✅ Histórico (se implementado)

### 5. Fluxo Integrado Completo

**Teste**: `fluxo-integrado-novo.cy.ts`

**Cenários:**
- ✅ Criar card → Filtrar por responsável → Abrir drawer → Fechar
- ✅ Múltiplas criações e filtragens
- ✅ Alternância de filtros
- ✅ Validação de contagens por filtro
- ✅ Edição após criação
- ✅ Persistência após refresh

**Cenário completo:**
```
1. Login (admin@example.com / admin123)
2. Clica "+ Nova Atividade"
3. Preenche: "Implementar Feature X" + seleciona João
4. Clica "Criar" → card aparece em Backlog
5. Filtra por "Responsável: João"
6. Clica no card → abre drawer
7. Vê informações e comentários
8. Fecha drawer
9. Reseta filtro para "Todos"
10. Cria mais um card para Maria
11. Filtra por Maria
12. Volta para "Todos"
```

### Troubleshooting

**Erro: "Cannot find module cypress"**
```bash
cd frontend
npm install --save-dev cypress
```

**Erro: "Connection refused" ao acessar localhost:8081**
- Verificar se Docker Compose está rodando: `docker compose ps`
- Aguardar inicialização completa (~30 segundos)

**Erro: "Element not found"**
- Sistema pode estar carregando ainda
- Cypress aguarda automático (timeout 5000ms por padrão)
- Verificar logs em `cypress/videos/`

## Documentação

- **Resumo de implementação**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Arquitetura**: [docs/architecture/overview.md](docs/architecture/overview.md)
- **Especificação funcional (visão consolidada)**: [docs/specs/product-spec.md](docs/specs/product-spec.md)
- **Especificações por funcionalidade**: [docs/specs/README.md](docs/specs/README.md)
- **ADRs**:
  - [docs/adr/ADR-0001-backend-go-fiber-postgres.md](docs/adr/ADR-0001-backend-go-fiber-postgres.md)
  - [docs/adr/ADR-0002-frontend-angular-19.md](docs/adr/ADR-0002-frontend-angular-19.md)
  - [docs/adr/ADR-0003-docker-multi-stage-local.md](docs/adr/ADR-0003-docker-multi-stage-local.md)
  - [docs/adr/ADR-0004-auth-and-roles.md](docs/adr/ADR-0004-auth-and-roles.md)
  - [docs/adr/ADR-0005-kanban-domain-and-date-filter.md](docs/adr/ADR-0005-kanban-domain-and-date-filter.md)
  - [docs/adr/ADR-0006-attachment-storage-local-first-s3-ready.md](docs/adr/ADR-0006-attachment-storage-local-first-s3-ready.md)

## Estrutura do projeto

```
kamban/
├── backend/                     # API em Go
│   ├── cmd/api/main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── storage/
│   │   └── dto/
│   ├── Dockerfile
│   ├── go.mod
│   └── .env.example
├── frontend/                    # App Angular 19
│   ├── src/app/
│   │   ├── core/
│   │   ├── pages/
│   │   ├── models.ts
│   │   └── app.config.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── angular.json
├── docs/
│   ├── architecture/
│   ├── adr/
│   └── specs/
├── .github/agents/              # Agentes BMAD
├── docker-compose.yml
└── README.md
```

## Agentes BMAD

Configurationados em `.github/agents/`:
- Project Manager
- Developer
- QA
- Security
- Code Reviewer

Vide `.bmad/README.md`.
