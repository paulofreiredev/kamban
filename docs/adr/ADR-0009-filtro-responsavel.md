# ADR-0009: Filtro por responsável na Home

- Status: Aceito
- Data: 2026-07-05

## Contexto

Home carrega cards por período. Necessário adicionar filtro por responsável para facilitar visualização de cards de um membro específico.

## Decisão

1. Adicionar dropdown de responsável na Home com filtros.
2. Opção "Todos" lista cards sem responsável atribuído ou com qualquer responsável.
3. Opção específica de membro lista apenas cards daquele responsável.
4. Query API: `GET /api/cards?from=...&to=...&assigneeId=...`

## Consequências

### Positivas
- Visualização segmentada por responsável.
- Dados pré-filtrados no backend.

### Negativas
- Query adicional a cada alteração de filtro.
