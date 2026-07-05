# Validação de Segurança — Provisionamento de Admin

## Escopo
Mudança para remover credenciais padrão do backend via variáveis (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) e provisionar usuário admin por script SQL idempotente no banco.

## Resultado da validação (Agente de Segurança)
Aprovado com ressalvas operacionais.

## Boas práticas aplicadas
1. **Remoção de segredo em runtime do backend**
   - Backend não depende mais de variáveis de admin para criar conta padrão.
2. **Seed idempotente**
   - Script usa `WHERE NOT EXISTS` por email para evitar duplicação.
3. **Senha armazenada com hash bcrypt**
   - Script armazena hash (`password_hash`), sem senha em texto puro na tabela.
4. **Menor acoplamento de configuração sensível**
   - Reduz risco de erro de deploy por variáveis de admin em ambiente.

## Riscos residuais
1. **Credencial padrão conhecida**
   - A senha inicial (`admin123`) é previsível.
2. **Necessidade de rotação imediata**
   - Exigir troca de senha após primeiro login é recomendado.

## Recomendações adicionais
1. Implementar flag de `must_change_password` para admin inicial.
2. Bloquear login com senha padrão em produção.
3. Mover `JWT_SECRET` para secret manager do ambiente.
4. Ativar TLS e políticas de senha mínima.
