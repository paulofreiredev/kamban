-- Seed padrão de administrador (idempotente)
-- Senha padrão: admin123
-- IMPORTANTE: altere essa senha imediatamente após o primeiro login.

INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
SELECT
  'Admin',
  'admin@kamban.local',
  '$2a$10$02Uz2jjnpyfuDJJU/x3Y7upBp2oDPHWTzvKHTmcNwINiBiifAFO5K',
  'admin',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@kamban.local'
);
