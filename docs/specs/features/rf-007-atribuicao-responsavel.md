# RF-007 - Atribuição de responsável

## Objetivo
Permitir associar e reatribuir um card a um responsável pertencente ao time diretamente na visualização de detalhe do card.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Responsável selecionado deve ser membro do time.
2. Card pode ter zero ou um responsável no MVP.
3. Alteração de responsável deve ficar refletida imediatamente no card.
4. Edição do responsável deve ocorrer na tela de detalhe (drawer/modal) do card.
5. Ao salvar, atualização deve persistir no backend e refletir no board sem recarregar a página.

## Fluxo principal
1. Usuário abre card.
2. Sistema exibe responsável atual no detalhe do card.
3. Usuário seleciona outro responsável na lista de membros do time.
4. Usuário aciona "Salvar responsável".
5. Sistema persiste vínculo e atualiza visualização no detalhe e no card do board.

## Fluxos alternativos e erros
- Usuário não pertence ao time: impedir atribuição.

## Critérios de aceite
- CA-007.1: sistema lista membros elegíveis do time.
- CA-007.2: card é atribuído corretamente a membro válido.
- CA-007.3: tentativa de atribuir usuário fora do time é bloqueada.
- CA-007.4: usuário consegue reatribuir responsável no detalhe do card.
- CA-007.5: após salvar, nome do responsável atualizado aparece no board sem refresh manual.
