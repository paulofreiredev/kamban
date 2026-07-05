# RF-008 - Gestão de usuários do time (admin)

## Objetivo
Permitir que usuário admin gerencie membros do time (cadastro, edição, ativação/desativação, exclusão e reset de senha).

## Atores
- Admin

## Regras de negócio
1. Apenas `admin` pode cadastrar usuários no time.
2. Usuário cadastrado deve ficar elegível para atribuição de cards.
3. Usuário comum não pode acessar tela/ação de cadastro de usuários.
4. Admin pode resetar a senha de um usuário para o email desse usuário.
5. Admin não pode resetar a própria senha por essa ação; deve usar fluxo de alteração de senha própria.

## Dados mínimos de cadastro
- Nome
- Identificador de login
- Perfil (member/admin, conforme política definida)

## Fluxo principal
1. Admin acessa gestão de usuários.
2. Preenche dados do novo usuário.
3. Confirma cadastro.
4. Sistema cria usuário no time.
5. Usuário passa a aparecer na lista de responsáveis possíveis.
6. Opcionalmente, admin pode executar reset de senha de um usuário existente.

## Fluxos alternativos e erros
- Usuário sem perfil admin tenta acessar gestão: acesso negado.
- Login já existente: impedir duplicidade.

## Critérios de aceite
- CA-008.1: admin consegue cadastrar novo usuário com sucesso.
- CA-008.2: usuário recém-cadastrado aparece como responsável elegível.
- CA-008.3: usuário não admin não consegue cadastrar membros.
- CA-008.4: admin consegue resetar senha de usuário existente para o email do próprio usuário.
