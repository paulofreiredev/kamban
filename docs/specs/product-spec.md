# Especificação do Produto (MVP) - Visão consolidada

Este documento consolida escopo e rastreabilidade. Os detalhes por funcionalidade estão em [README.md](README.md).

## 1. Escopo

### 1.1 Em escopo
- Autenticação com login de usuário pré-cadastrado.
- Home com quadro Kanban de 6 colunas.
- Filtro de período com valor padrão dos últimos 30 dias.
- Cadastro de novo card.
- Card com título, descrição, anexos e comentários.
- Atribuição de card para responsável do time.
- Gestão de usuários do time por perfil admin.
- Gestão de senha própria para qualquer usuário autenticado.
- Reset de senha por admin para valor igual ao email do usuário alvo.
- Dashboard administrativo de produtividade por período.

### 1.2 Fora de escopo (nesta fase)
- Notificações em tempo real.
- Integrações externas.
- Relatórios avançados e dashboards.
- Aplicativo mobile nativo.

## 2. Perfis e permissões

### 2.1 Admin
- Pode cadastrar usuários no time.
- Pode atribuir responsável em cards.
- Pode resetar senha de usuários (exceto a própria conta via fluxo admin).
- Pode visualizar dashboard de produtividade por período.
- Pode utilizar todas as funcionalidades do usuário comum.

### 2.2 Usuário do time
- Pode acessar login e home.
- Pode criar cards e adicionar comentários/anexos.
- Pode ser definido como responsável.
- Pode alterar a própria senha.

## 3. Requisitos funcionais e rastreabilidade

- RF-001 Login: [features/rf-001-login.md](features/rf-001-login.md)
- RF-002 Home Kanban: [features/rf-002-home-kanban.md](features/rf-002-home-kanban.md)
- RF-003 Filtro de datas: [features/rf-003-filtro-datas.md](features/rf-003-filtro-datas.md)
- RF-004 Cadastro de card: [features/rf-004-cadastro-card.md](features/rf-004-cadastro-card.md)
- RF-005 Anexos: [features/rf-005-anexos.md](features/rf-005-anexos.md)
- RF-006 Comentários: [features/rf-006-comentarios.md](features/rf-006-comentarios.md)
- RF-007 Atribuição de responsável: [features/rf-007-atribuicao-responsavel.md](features/rf-007-atribuicao-responsavel.md)
- RF-008 Gestão de usuários do time (admin): [features/rf-008-gestao-usuarios-time.md](features/rf-008-gestao-usuarios-time.md)
- RF-009 Justificativa em regressão/cancelamento: [features/rf-009-justificativa.md](features/rf-009-justificativa.md)
- RF-010 Gestão de senhas: [features/rf-010-gestao-senhas.md](features/rf-010-gestao-senhas.md)
- RF-011 Dashboard de produtividade (admin): [features/rf-011-dashboard-produtividade-admin.md](features/rf-011-dashboard-produtividade-admin.md)

## 4. Requisitos não funcionais

### RNF-001 - Stack
- Backend em Go com Fiber.
- Frontend em Angular 19.
- Banco PostgreSQL.

### RNF-002 - Ambiente local
- Execução local em Docker com multi-stage build.

### RNF-003 - Segurança mínima
- Controle de acesso por perfil (admin e usuário).
- Proteção de rotas no frontend e validação de autorização no backend.

### RNF-004 - Armazenamento de anexos
- No MVP, anexos devem ser salvos localmente em pasta mapeada no container.
- Estratégia deve ser desacoplada por abstração de storage para futura migração para AWS S3.

## 5. Critérios de aceite (resumo)

- CA-001: usuário pré-cadastrado consegue autenticar com sucesso.
- CA-002: home exibe 6 colunas obrigatórias.
- CA-003: filtro inicial vem preenchido com últimos 30 dias.
- CA-004: novo card é criado com título e pode receber descrição, anexos e comentários.
- CA-005: card pode ser atribuído a membro do time.
- CA-006: admin consegue cadastrar novo usuário no time.
- CA-007: qualquer usuário autenticado consegue alterar a própria senha.
- CA-008: admin consegue resetar a senha de outro usuário para o email do usuário.
- CA-009: admin consegue visualizar distribuição de tarefas por status no período.
- CA-010: admin consegue visualizar produtividade por usuário (em andamento e concluídas).

## 6. Entidades de domínio (conceitual)

- Usuário
- Time
- Membro do time
- Card
- Comentário
- Anexo
- Coluna/Status

## 7. Dependências e premissas

- Existência de usuário admin pré-cadastrado no bootstrap inicial.
- Time inicial disponível para vincular usuários e responsáveis.
