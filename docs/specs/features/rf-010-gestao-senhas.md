# RF-010 - Gestão de senhas

## Objetivo
Permitir que qualquer usuário autenticado (incluindo admin) altere sua própria senha, e permitir que admin resete a senha de outro usuário para o valor do email desse usuário.

## Atores
- Admin
- Membro

## Regras de negócio
1. Usuário autenticado pode alterar apenas a própria senha.
2. Alteração de senha própria exige:
   - senha atual válida;
   - nova senha com no mínimo 8 caracteres;
   - nova senha diferente da atual.
3. Apenas `admin` pode resetar senha de outro usuário.
4. Reset administrativo define a senha temporária exatamente igual ao email do usuário alvo.
5. Admin não pode usar o fluxo de reset para a própria conta; deve usar alteração de senha própria.

## Endpoints
- `PATCH /api/users/me/password`
  - Body: `{ "currentPassword": "...", "newPassword": "..." }`
- `POST /api/users/:id/reset-password`
  - Restrito a admin
  - Sem body

## Fluxo principal (alteração própria)
1. Usuário abre ação "Alterar senha".
2. Informa senha atual e nova senha.
3. Sistema valida credencial atual e política mínima.
4. Sistema salva novo hash bcrypt.

## Fluxo principal (reset admin)
1. Admin acessa gestão de usuários.
2. Aciona "Resetar senha" no usuário alvo.
3. Sistema redefine hash com valor-base igual ao email do usuário.
4. Admin recebe confirmação do reset.

## Critérios de aceite
- CA-010.1: usuário autenticado altera própria senha com sucesso quando informa senha atual correta.
- CA-010.2: sistema rejeita nova senha menor que 8 caracteres.
- CA-010.3: admin consegue resetar senha de outro usuário para o email do usuário.
- CA-010.4: usuário não admin não consegue executar reset administrativo.
