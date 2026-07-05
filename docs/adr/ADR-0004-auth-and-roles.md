# ADR-0004: Autenticação com usuário pré-cadastrado e perfil Admin

- Status: Aceito
- Data: 2026-07-05

## Contexto

O sistema deve iniciar com acesso imediato e ter controle de permissões para gestão de time.

## Decisão

- Incluir usuário pré-cadastrado para bootstrap inicial.
- Definir dois perfis de acesso iniciais: `admin` e `member`.
- Permitir que apenas `admin` cadastre usuários do time.

## Consequências

### Positivas
- Onboarding inicial simples.
- Modelo de autorização claro para o MVP.

### Negativas
- Gestão de credencial inicial exige cuidado operacional.
- Evolução futura pode demandar papéis granulares.
