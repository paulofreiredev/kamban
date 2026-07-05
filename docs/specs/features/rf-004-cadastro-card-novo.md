# RF-004 - Cadastro de card (Modal/Popup)

## Objetivo
Permitir criação de novos cards por meio de modal popup na Home.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Deve existir botão/ação "Novo card" na Home.
2. Ação abre modal/popup com formulário.
3. Modal é sobreposto ao quadro Kanban.
4. Campo `título` é obrigatório.
5. Campo `descrição` é opcional.
6. Card criado deve entrar inicialmente em `Backlog`.
7. Fechar modal sem salvar descarta dados.

## Campos do cadastro (Modal)
- Título (obrigatório)
- Descrição (opcional)
- Responsável (opcional)

## Fluxo principal
1. Usuário clica em "Novo card".
2. Modal abre sobreposto ao quadro.
3. Preenche dados obrigatórios.
4. Clica "Salvar".
5. Modal fecha e card aparece em Backlog.

## Fluxos alternativos e erros
- Título vazio: impedir salvamento e mostrar validação na modal.
- Usuário clica "Cancelar" ou clica fora da modal: modal fecha sem salvar.

## Critérios de aceite
- CA-004.1: modal abre ao clicar "Novo card".
- CA-004.2: modal fecha ao clicar "Cancelar" ou fora dela.
- CA-004.3: card com título válido é criado e aparece em Backlog.
- CA-004.4: título ausente impede salvamento com feedback visual.
