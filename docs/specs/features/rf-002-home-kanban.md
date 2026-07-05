# RF-002 - Home Kanban (colunas)

## Objetivo
Exibir o quadro principal com colunas fixas do fluxo de trabalho.

## Atores
- Usuário do time
- Admin

## Colunas obrigatórias
1. Backlog
2. A Fazer
3. Em Progresso
4. Em Revisão
5. Concluído
6. Cancelado

## Regras de negócio
1. As 6 colunas devem existir sempre na Home.
2. Todo card deve pertencer a exatamente uma coluna.
3. A ordenação das colunas deve seguir a sequência definida acima.

## Fluxo principal
1. Usuário autenticado acessa Home.
2. Sistema carrega colunas fixas.
3. Sistema carrega cards do período filtrado.
4. Cards são distribuídos por coluna/status.

## Critérios de aceite
- CA-002.1: Home exibe todas as 6 colunas.
- CA-002.2: ordem das colunas segue padrão definido.
- CA-002.3: cada card aparece em somente uma coluna.

## Observações de UX
- Exibir estado vazio por coluna quando não houver cards.
- Exibir contagem de cards por coluna (recomendado).
