-- SQL para Supabase: Otorgar acceso al recurso '/invoicing' a los roles 'admin' y 'finanzas_senior'

INSERT INTO resource_permissions (role_id, resource_path, can_access)
VALUES
    ((SELECT id FROM roles WHERE role_name = 'admin'), '/invoicing', TRUE),
    ((SELECT id FROM roles WHERE role_name = 'finanzas_senior'), '/invoicing', TRUE)
ON CONFLICT (role_id, resource_path) DO UPDATE SET can_access = EXCLUDED.can_access;

-- Nota: El contexto de usuario (UserContext.tsx) recargará automáticamente los permisos
-- después de que el usuario inicie sesión o si el estado de autenticación cambia.
