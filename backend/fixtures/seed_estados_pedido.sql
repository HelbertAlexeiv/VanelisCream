BEGIN;

-- Reinicia la tabla y su secuencia para que los IDs comiencen desde 1.
-- CASCADE elimina tambien registros dependientes (por ejemplo, pedidos que referencian estado_pedido).
TRUNCATE TABLE estado_pedido RESTART IDENTITY CASCADE;

INSERT INTO estado_pedido (nombre, descripcion)
VALUES
('recibido', NULL),
('preparando', NULL),
('en camino', NULL),
('entregado', NULL),
('cancelado', NULL);

COMMIT;
