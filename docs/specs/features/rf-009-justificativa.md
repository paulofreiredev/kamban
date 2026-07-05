# RF-009 - Justificativa para regressão/cancelamento de cards

## Objetivo
Registrar justificativa quando card é movido para coluna anterior ou para Cancelado.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Movimentos avançados (Backlog → A Fazer, A Fazer → Em Progresso, etc.) não requerem justificativa.
2. Movimentos regressivos (Em Progresso → A Fazer, etc.) requerem justificativa.
3. Movimento para Cancelado requer justificativa.
4. Justificativa é campo de texto livre.
5. Justificativa é registrada na base e visível no histórico do card.
6. Sem justificativa: bloquear movimento com modal.

## Fluxo principal
1. Usuário arrasta card para coluna anterior.
2. Sistema detecta movimento regressivo.
3. Modal abre solicitando justificativa.
4. Usuário preenche justificativa.
5. Clica "Confirmar".
6. Card atualizado com novo status e justificativa persistida.

## Fluxo para Cancelado
1. Usuário arrasta card para coluna Cancelado.
2. Modal abre solicitando motivo do cancelamento.
3. Usuário preenche motivo.
4. Clica "Cancelar card".
5. Card movido para Cancelado com motivo persistido.

## Fluxos alternativos e erros
- Usuário clica "Fechar" sem preencher: modal fecha, card não é movido.
- Justificativa vazia: impedir confirmação e exibir erro.

## Critérios de aceite
- CA-009.1: movimento regressivo abre modal de justificativa.
- CA-009.2: movimento para Cancelado abre modal de justificativa.
- CA-009.3: justificativa vazia impede movimento.
- CA-009.4: justificativa é persistida e visível no card.

## Entidade de dados
- Campo `justificativa` em Card (nullable string)
- Registra motivo de regressão ou cancelamento
