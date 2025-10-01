-- 1. Otorgar acceso al recurso '/invoicing' para los roles 'admin' y 'finanzas_senior'.
-- Este script utiliza una cláusula CTE (WITH) para obtener los IDs de los roles
-- y luego inserta o actualiza el permiso para asegurar que 'can_access' sea TRUE.

WITH target_roles AS (
    -- Selecciona los IDs de los roles que deben tener acceso
    SELECT id
    FROM roles
    WHERE role_name IN ('admin', 'finanzas_senior')
)
INSERT INTO resource_permissions (role_id, resource_path, can_access)
-- Inserta el ID del rol, la ruta del recurso y establece el acceso a TRUE
SELECT id, '/invoicing', TRUE
FROM target_roles
-- Si ya existe una entrada para ese rol y esa ruta, actualiza 'can_access' a TRUE
ON CONFLICT (role_id, resource_path) DO UPDATE
SET can_access = TRUE,
    updated_at = now();

-- Nota: Asegúrate de que tu tabla 'resource_permissions' tenga una restricción
-- UNIQUE en las columnas (role_id, resource_path) para que ON CONFLICT funcione correctamente.
