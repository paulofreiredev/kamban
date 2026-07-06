-- Create default project for existing data if admin exists
INSERT INTO projects (title, description, owner_id, is_active, created_at, updated_at)
SELECT 
  'Projeto Padrão' as title,
  'Projeto padrão criado automaticamente para agrupar atividades existentes' as description,
  u.id as owner_id,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
WHERE u.role = 'admin'
  AND NOT EXISTS (SELECT 1 FROM projects WHERE owner_id = u.id)
LIMIT 1;

-- Migrate existing cards to the default project
UPDATE cards c
SET project_id = (
  SELECT p.id 
  FROM projects p
  WHERE p.title = 'Projeto Padrão'
  LIMIT 1
)
WHERE c.project_id IS NULL
  AND EXISTS (SELECT 1 FROM projects WHERE title = 'Projeto Padrão');

-- Add all existing users to the default project as members
INSERT INTO project_members (project_id, user_id, created_at)
SELECT DISTINCT
  p.id as project_id,
  u.id as user_id,
  NOW() as created_at
FROM projects p
CROSS JOIN users u
WHERE p.title = 'Projeto Padrão'
  AND NOT EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = p.id
      AND pm.user_id = u.id
  );
