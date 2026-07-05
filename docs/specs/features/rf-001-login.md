# RF-001 - Login

## Objetivo
Permitir autenticação de usuário com credenciais válidas, incluindo usuário pré-cadastrado para bootstrap do sistema.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. O sistema deve possuir ao menos um usuário pré-cadastrado ativo.
2. Login exige credenciais válidas.
3. Usuário inativo não pode autenticar.
4. Após autenticação bem-sucedida, o usuário é direcionado para a Home.

## Fluxo principal
1. Usuário acessa a tela de login.
2. Informa credenciais.
3. Sistema valida credenciais.
4. Sistema cria sessão autenticada.
5. Usuário é redirecionado para a Home.

## Fluxos alternativos e erros
- Credenciais inválidas: exibir erro e não autenticar.
- Usuário inativo: bloquear acesso e exibir mensagem.

## Critérios de aceite
- CA-001.1: usuário pré-cadastrado autentica com sucesso.
- CA-001.2: credenciais inválidas não permitem acesso.
- CA-001.3: usuário inativo não consegue logar.

## Dados mínimos
- Identificador de login
- Senha

## Segurança
- Sessão autenticada deve ser validada no backend.
- Rotas protegidas não devem ser acessíveis sem autenticação.
