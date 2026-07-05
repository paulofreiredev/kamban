# Arquitetura - Visão Geral

## Objetivo

Documentar a arquitetura alvo do projeto Kamban, incluindo componentes, responsabilidades, integrações e decisões de alto nível.

## Contexto

Sistema web para controle de cards em fluxo Kanban com autenticação, gestão de time e atribuição de responsáveis.

## Componentes

### 1) Frontend (Angular 19)
Responsável por:
- Login
- Home Kanban
- Filtro de datas (30 dias por padrão)
- Criação/edição de cards
- Upload e visualização de anexos (imagem/vídeo)
- Comentários em cards
- Gestão de usuários (admin)

### 2) Backend API (Go + Fiber)
Responsável por:
- Autenticação e autorização
- Regras de negócio de cards e colunas
- Regras de time e usuários
- Exposição de endpoints REST
- Persistência e consulta no PostgreSQL

### 3) PostgreSQL
Responsável por:
- Persistência transacional
- Histórico básico de dados de cards/comentários/anexos
- Integridade relacional entre usuários, times e cards

### 4) Docker (ambiente local)
Responsável por:
- Subir frontend, backend e banco localmente
- Reprodutibilidade de ambiente
- Build otimizado via multi-stage

### 5) Storage de anexos (MVP local)
Responsável por:
- Persistir arquivos de anexos em pasta local do backend
- Manter persistência via volume mapeado do container
- Permitir troca futura para AWS S3 via abstração de provedor

## Fluxo de alto nível

1. Usuário acessa login no frontend.
2. Frontend autentica via backend.
3. Home carrega cards por período (padrão: últimos 30 dias).
4. Usuário cria/atualiza card, adiciona comentários e anexos.
5. Backend valida permissões e persiste no PostgreSQL.
6. Admin gerencia usuários do time para habilitar responsáveis.

## Estratégia de armazenamento de anexos

- Modelo atual: armazenamento local em diretório do backend com volume Docker.
- Metadados de anexos: PostgreSQL.
- Evolução planejada: troca para AWS S3 via implementação de novo provider, sem mudar regras de negócio.

## Segurança e acesso

- Usuário comum: interage com cards e comentários conforme permissões do time.
- Usuário admin: pode cadastrar usuários no time e administrar atribuições.
- Controle de acesso aplicado no backend.

## Escalabilidade inicial

- Monolito modular (frontend separado + backend API única).
- Evolução prevista para serviços separados conforme crescimento.

## Rastreabilidade

As decisões estruturais desta visão estão detalhadas em:
- [ADR-0001](../adr/ADR-0001-backend-go-fiber-postgres.md)
- [ADR-0002](../adr/ADR-0002-frontend-angular-19.md)
- [ADR-0003](../adr/ADR-0003-docker-multi-stage-local.md)
- [ADR-0004](../adr/ADR-0004-auth-and-roles.md)
- [ADR-0005](../adr/ADR-0005-kanban-domain-and-date-filter.md)
- [ADR-0006](../adr/ADR-0006-attachment-storage-local-first-s3-ready.md)
