# RF-004 - Cadastro de card

## Objetivo
Permitir criação de novos cards por meio de ação dedicada na Home.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Deve existir botão/ação de “Novo card”.
2. Campo `título` é obrigatório.
3. Campo `descrição` é opcional.
4. Card criado deve entrar inicialmente em `Backlog` (padrão recomendado para MVP).

## Campos do cadastro
- Título (obrigatório)
- Descrição (opcional)

## Fluxo principal
1. Usuário aciona “Novo card”.
2. Preenche dados obrigatórios.
3. Salva cadastro.
4. Sistema persiste card e exibe no quadro.

## Fluxos alternativos e erros
- Título vazio: impedir salvamento e mostrar validação.

## Critérios de aceite
- CA-004.1: usuário consegue abrir formulário de novo card.
- CA-004.2: card com título válido é criado com sucesso.
- CA-004.3: título ausente impede criação.
