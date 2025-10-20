-- V2 idempotente (seed base) compatible con esquemas existentes

-- 1) Asegurar índices únicos necesarios si no existían
CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_user_role_idx
  ON auth_user_role (auth_user_id, auth_role_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_role_module_idx
  ON auth_role_module (auth_role_id, auth_module_id);

-- 2) Catálogo de estados de usuario
INSERT INTO user_status (status_id, name, description)
VALUES
  ('6b393ccc-1eba-4075-9fb2-80091d80f87e', 'ACTIVE',   'Usuario activo'),
  ('1a83879d-b620-4226-bfa9-146a775183d2', 'INACTIVE', 'Usuario inactivo')
ON CONFLICT (status_id) DO NOTHING;

-- 3) Roles (idempotente por name: único)
INSERT INTO auth_role (id, name, description, status)
VALUES
  ('08b21056-7149-40bd-86f4-7be597071d55', 'USER',  'Rol por defecto para usuarios', 1),
  ('20bda0bd-c44b-4e46-af5f-d77697a2f7b2', 'ADMIN', 'Administrador del sistema',     1)
ON CONFLICT (name) DO NOTHING;

-- 4) Módulos (idempotente por name: único)
INSERT INTO auth_module (id, name, description, status)
VALUES
  ('de643ab2-478c-416f-a3a0-505ea7411a90', 'INVENTORY', 'Inventory Module', 1),
  ('1592960d-d418-447d-a4ee-59d5dcff4073', 'CLIENT',    'Client Module',    1),
  ('f789e8d9-e365-47a5-858f-03dc603a340c', 'PROVIDER',  'Provider Module',  1),
  ('54585042-0e09-4b82-a31a-524109e23894', 'QUOTE',     'Quote Module',     1),
  ('c789112c-0549-4b24-8566-5225a14fe271', 'PURCHASE',  'Purchase Module',  1)
ON CONFLICT (name) DO NOTHING;

-- 5) Rol ADMIN con todos los módulos (insert por join de nombres; evita duplicados)
--    Nota: omitimos la columna id para usar el DEFAULT uuid_generate_v4()
WITH r AS (
  SELECT id FROM auth_role WHERE name = 'ADMIN'
),
mods AS (
  SELECT id, name FROM auth_module WHERE name IN ('INVENTORY','CLIENT','PROVIDER','QUOTE','PURCHASE')
)
INSERT INTO auth_role_module (auth_role_id, auth_module_id, status)
SELECT r.id, m.id, 1
FROM r CROSS JOIN mods m
WHERE NOT EXISTS (
  SELECT 1
  FROM auth_role_module arm
  WHERE arm.auth_role_id = r.id AND arm.auth_module_id = m.id
);
