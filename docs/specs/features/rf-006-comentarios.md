# RF-006 - Comentários em card

## Objetivo
Registrar comunicação contextual e histórico de colaboração em cada card.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Card deve permitir inclusão de comentários.
2. Comentário deve ficar vinculado ao card e ao autor.
3. Comentários devem ser exibidos em ordem cronológica.

## Fluxo principal
1. Usuário acessa detalhe do card.
2. Digita comentário.
3. Salva comentário.
4. Sistema persiste e exibe no histórico.

## Fluxos alternativos e erros
- Comentário vazio: bloquear submissão.

## Critérios de aceite
- CA-006.1: comentário válido é salvo e exibido no card.
- CA-006.2: comentário vazio não é aceito.
- CA-006.3: histórico exibe autor e data/hora.
