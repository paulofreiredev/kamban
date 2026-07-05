# RF-002 - Home Kanban (colunas, drag-drop e filtros)

## Objetivo
Exibir quadro Kanban com colunas fixas, drag-drop de cards e filtros por período/responsável.

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
3. Ordenação das colunas segue sequência definida.
4. Cards podem ser arrastados entre colunas.
5. Drag-drop atualiza status do card em tempo real.
6. Ao mover para coluna anterior ou Cancelado, solicitar justificativa.
7. Filtro por período (padrão 30 dias).
8. Novo filtro por responsável (todos, específico).
9. Ao abrir detalhe do card, deve ser possível editar o responsável e salvar.
10. Cada card deve exibir tempo na coluna atual com granularidade progressiva:
	- até 59 minutos: exibir em minutos (ex.: 42min)
	- de 1h até 23h: exibir somente em horas (ex.: 3h)
	- a partir de 1 dia: exibir somente em dias (ex.: 2d)

## Fluxo principal
1. Usuário autenticado acessa Home.
2. Sistema exibe 6 colunas.
3. Sistema carrega cards do período e responsável selecionado.
4. Usuário arrasta card entre colunas.
5. Se movimento para trás ou Cancelado: modal de justificativa.
6. Card atualizado e redisponível.
7. Usuário abre detalhe de um card, altera responsável e salva.
8. Sistema atualiza responsável no detalhe e no board.

## Fluxos alternativos e erros
- Arrastar para coluna anterior sem justificativa: bloquear, solicitar modal.
- Arrastar para Cancelado sem justificativa: bloquear, solicitar modal.

## Critérios de aceite
- CA-002.1: Home exibe todas as 6 colunas.
- CA-002.2: ordem das colunas segue padrão.
- CA-002.3: cada card aparece em uma coluna.
- CA-002.4: drag-drop atualiza status.
- CA-002.5: movimento regressivo/cancelamento requer justificativa.
- CA-002.6: filtro por responsável funciona corretamente.
- CA-002.7: edição de responsável no detalhe do card é persistida.
- CA-002.8: card exibe tempo na coluna atual em minutos, horas ou dias conforme regra.
- CA-002.9: quando exibir horas, não exibir minutos; quando exibir dias, não exibir horas/minutos.

## Observações de UX
- Exibir estado vazio por coluna quando não houver cards.
- Contagem de cards por coluna.
- Visual feedback durante drag-drop (cursor, highlight).
- Exibir o tempo na coluna atual em formato compacto na área de rodapé do card.
