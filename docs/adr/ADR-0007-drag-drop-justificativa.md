# ADR-0007: Drag-drop com justificativa para regressão/cancelamento

- Status: Aceito
- Data: 2026-07-05

## Contexto

O sistema precisa de forma intuitiva de mover cards entre estados. Há risco de perda de contexto ao regredir estado (voltar de Em Progresso para A Fazer) ou cancelar atividade.

## Decisão

1. Implementar drag-drop de cards entre colunas.
2. Movimentos avançados (Backlog → A Fazer → Em Progresso → ...) são imediatos.
3. Movimentos regressivos (Em Progresso → A Fazer, etc.) e para Cancelado requerem modal com justificativa.
4. Justificativa é persistida e visível no histórico do card.

## Consequências

### Positivas
- Interface intuitiva de drag-drop.
- Rastreabilidade de motivos de regressão/cancelamento.
- Contexto preservado para análise.

### Negativas
- Complexidade adicional na UX (modal de justificativa).
- Backend deve validar movimento e persistir justificativa.
