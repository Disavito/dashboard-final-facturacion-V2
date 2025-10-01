-- 1. Agregar la restricción UNIQUE a la tabla resource_permissions.
-- Esto es necesario para que la cláusula ON CONFLICT (upsert) funcione correctamente.
-- La combinación de un rol y una ruta de recurso debe ser única.

ALTER TABLE public.resource_permissions
ADD CONSTRAINT unique_role_resource UNIQUE (role_id, resource_path);

-- Nota: Si la tabla ya contiene datos duplicados (mismo role_id y resource_path),
-- esta operación fallará. Si ese es el caso, primero deberá limpiar los duplicados.
