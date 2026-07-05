# RF-003 - Filtro de datas e responsável

## Objetivo
Permitir recorte temporal e por responsável dos cards na Home.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Filtro de período deve estar na Home.
2. Filtro de responsável deve estar na Home.
3. Valor padrão período: últimos 30 dias até data atual.
4. Valor padrão responsável: "Todos".
5. Alteração de qualquer filtro recarrega cards.
6. Data inicial não pode ser maior que data final.
7. Responsável selecionado deve ser membro ativo do time.

## Filtros disponíveis
- **Período**: from/to em ISO date
- **Responsável**: dropdown com "Todos" + cada membro do time

## Fluxo principal
1. Usuário abre Home.
2. Sistema preenche período com padrão 30 dias.
3. Sistema preenche responsável com "Todos".
4. Sistema exibe cards dentro dos filtros.
5. Usuário altera período ou responsável.
6. Cards são refiltrados em tempo real.

## Fluxos alternativos e erros
- Intervalo inválido: impedir aplicação e exibir erro.
- Nenhum card no filtro: exibir estado vazio.

## Critérios de aceite
- CA-003.1: filtro período com padrão 30 dias.
- CA-003.2: filtro responsável com opção "Todos".
- CA-003.3: alterar período atualiza cards.
- CA-003.4: alterar responsável atualiza cards.
- CA-003.5: intervalo inválido é impedido.
