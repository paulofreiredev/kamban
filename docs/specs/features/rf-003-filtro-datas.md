# RF-003 - Filtro de datas (padrão 30 dias)

## Objetivo
Permitir recorte temporal dos cards na Home, com preenchimento padrão de últimos 30 dias.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Filtro deve ser exibido na Home.
2. Valor padrão inicial: intervalo de 30 dias até a data atual.
3. Alteração do período deve recarregar a listagem de cards.
4. Data inicial não pode ser maior que data final.

## Definição do padrão
- Data final padrão: data atual.
- Data inicial padrão: data atual menos 30 dias.

## Fluxo principal
1. Usuário abre Home.
2. Sistema preenche filtro com padrão dos últimos 30 dias.
3. Sistema exibe cards dentro do intervalo.
4. Usuário altera período e atualiza resultados.

## Fluxos alternativos e erros
- Intervalo inválido (início > fim): bloquear aplicação e exibir erro.
- Período sem cards: exibir estado vazio.

## Critérios de aceite
- CA-003.1: filtro abre preenchido com últimos 30 dias.
- CA-003.2: alterar período atualiza cards exibidos.
- CA-003.3: intervalo inválido é impedido com feedback.
