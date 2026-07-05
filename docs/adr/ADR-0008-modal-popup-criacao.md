# ADR-0008: Modal popup para todas as ações de criação

- Status: Aceito
- Data: 2026-07-05

## Contexto

Ações de criação (novo card, novo usuário, novo comentário) devem ter UI consistente e desacoplar do fluxo principal.

## Decisão

1. Todas as telas de cadastro são modals/popups.
2. Modal é sobreposta ao conteúdo.
3. Fechar modal sem salvar descarta dados.
4. Modal tem validação local antes de submeter ao backend.

## Consequências

### Positivas
- Consistência visual.
- Usuário mantém contexto da página principal.
- Facilita cancelamento.

### Negativas
- Requer componente de modal reutilizável.
- Validação duplicada (frontend + backend).
