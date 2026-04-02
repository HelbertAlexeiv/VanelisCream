BEGIN;

-- ========================================
-- 1. TRUNCATE todas las tablas y reiniciar secuencias
-- ========================================
TRUNCATE TABLE detalle_pedido RESTART IDENTITY CASCADE;
TRUNCATE TABLE pedido RESTART IDENTITY CASCADE;
TRUNCATE TABLE pedidos_auditoriapedido RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuario RESTART IDENTITY CASCADE;
TRUNCATE TABLE rol RESTART IDENTITY CASCADE;
TRUNCATE TABLE producto RESTART IDENTITY CASCADE;
TRUNCATE TABLE presentacion RESTART IDENTITY CASCADE;
TRUNCATE TABLE marca RESTART IDENTITY CASCADE;
TRUNCATE TABLE estado_pedido RESTART IDENTITY CASCADE;

-- ========================================
-- 2. Insertar Roles
-- ========================================
INSERT INTO rol (nombre)
VALUES
('Cliente'),
('Administrador');

-- ========================================
-- 3. Insertar Usuarios
-- ========================================
INSERT INTO usuario (
    username,
    email,
    first_name,
    last_name,
    password,
    is_staff,
    is_active,
    is_superuser,
    telefono,
    direccion,
    rol_id,
    date_joined,
    last_login
)
VALUES
-- Usuario Administrador
(
    'admin',
    'admin@vanelis.com',
    'Admin',
    'Vanelis',
    'pbkdf2_sha256$1200000$wz29jNdC65RIvd4WlcLuiY$LX5oFRTQrlbSqR0Qvde0slqtk7aHUdAcR88dXl14msY=',
    true,
    true,
    true,
    '3001234567',
    'Calle 1 #1-1',
    2,
    CURRENT_TIMESTAMP,
    NULL
),
-- Usuario Cliente
(
    'cliente',
    'cliente@example.com',
    'Juan',
    'García',
    'pbkdf2_sha256$1200000$aNN5iv3FA6oOVOD1eamPFJ$Y8pw1WBL+Gex59928ytUqiSaBrPzwWLBibg3PuknYDQ=',
    false,
    true,
    false,
    '3007654321',
    'Calle 10 #5-50',
    1,
    CURRENT_TIMESTAMP,
    NULL
);

-- ========================================
-- 4. Insertar Estados de Pedido
-- ========================================
INSERT INTO estado_pedido (nombre, descripcion)
VALUES
('recibido', 'Pedido recibido y en espera de confirmación'),
('preparando', 'El pedido está siendo preparado'),
('en camino', 'El pedido está en camino hacia el cliente'),
('entregado', 'El pedido ha sido entregado'),
('cancelado', 'El pedido ha sido cancelado');

-- ========================================
-- 5. Ajustar campo imagen de producto
-- ========================================
ALTER TABLE producto
ALTER COLUMN imagen TYPE character varying(500);

-- ========================================
-- 6. Insertar Marcas
-- ========================================
INSERT INTO marca (nombre)
VALUES
('Crem Helado'),
('Popsy'),
('Colombina'),
('Colanta')
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- 7. Insertar Presentaciones
-- ========================================
INSERT INTO presentacion (nombre, descripcion)
VALUES
('Paleta', 'Helado en paleta'),
('Cono', 'Helado servido en cono'),
('Galleta', 'Helado tipo sandwich o galleta'),
('Vasito', 'Helado en vaso'),
('Torta', 'Torta de helado'),
('Combo', 'Combinacion promocional de productos'),
('Litro', 'Helado en presentacion de litro'),
('Tarrina', 'Helado en tarrina')
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

-- ========================================
-- 8. Insertar Productos
-- ========================================
DELETE FROM producto
WHERE nombre IN (
'Tarrina Yogo Yogo Fresa Gourmet',
'Combo 1 Tarrina con Helado + 1 Popsy Toy Mochi',
'Combo paletas + litro Helado',
'Malteada 16 Oz + Banana Split',
'Malteada 16 Oz + Charlie Brownie',
'Combo Litro + Caja Cono + 2 Toppings',
'2 Litros de Helado + Caja Cono + Brownie x 8 unidades',
'Combo 2 Tarrinas + Caja de Cono',
'Combo Litro de helado + Brownie (8 Und)',
'Charlie Brownie + Banana Split'
);

WITH data (nombre, descripcion, precio, imagen, stock, marca_nombre, presentacion_nombre) AS (
    VALUES
    ('Paleta Aloha Limón', 'Paleta sabor limón', 2000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-aloha-limon-3.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta Aloha Mango biche', 'Paleta sabor mango biche', 3000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-aloha-mango-biche-2.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta Aloha Naranja', 'Paleta sabor naranja', 2000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-aloha-naranja-3.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta CHOCOLISTO Chocolate', 'Paleta sabor chocolate', 2500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-chocolisto-chocolate-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta JET Vainilla-Chocolate', 'Paleta de vainilla y chocolate', 5000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-jet-vainilla_-chocolate-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta POLET Caramelo Crocante', 'Paleta sabor caramelo crocante', 7000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-polet-caramelo-crocante-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta Polet Chocoavellana', 'Paleta sabor chocoavellana', 7000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-polet-chocoavellana-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta Polet Cookies & Cream', 'Paleta sabor cookies and cream', 6000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-polet-cookies-%26-cream-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta Polet Frutos Rojos', 'Paleta sabor frutos rojos', 6000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-polet-frutos-rojos-2.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta TOSH Fresa', 'Paleta sabor fresa', 3500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-tosh-fresa-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta TOSH Pasión', 'Paleta sabor pasión', 3700.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/paleta-tosh-pasion-1.webp', 50, 'Crem Helado', 'Paleta'),
    ('Paleta TOSH Piña', 'Paleta sabor piña', 3500.00, 'https://appmedifarma.com/wp-content/uploads/2023/03/643971.jpg', 50, 'Crem Helado', 'Paleta'),
    ('Cono Bocatto Brownie Caramelo', 'Cono sabor brownie caramelo', 5700.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-bocatto-brownie-caramelo-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono Bocatto Fresa', 'Cono sabor fresa', 5700.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-bocatto-fresa-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono Bocatto Tres Leches', 'Cono sabor tres leches', 5700.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-bocatto-tres-leches-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono Chococono', 'Cono clásico de chocolate', 3500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-chococono-2.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono CHOCOCONO CHOCOKRISPIS', 'Cono con chocokrispis', 4500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-chococono-chocokrispis-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono CHOCOCONO FLOW', 'Cono flow', 4000.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-chococono-flow-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Cono CHOCOCONO MINI', 'Cono mini', 2500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/cono-chococono-mini-1.webp', 50, 'Crem Helado', 'Cono'),
    ('Galleta con Helado Arequipe', 'Galleta con helado sabor arequipe', 3500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/galleta-con-helado-arequipe-1.webp', 50, 'Crem Helado', 'Galleta'),
    ('Galleta con Helado NI Napolitano', 'Galleta con helado napolitano', 3500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/galleta-con-helado-ni-napolitano-1.webp', 50, 'Crem Helado', 'Galleta'),
    ('Galleta con Helado Vainilla Pasas', 'Galleta con helado sabor vainilla pasas', 3500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/galleta-con-helado-vainilla.pasas-1.webp', 50, 'Crem Helado', 'Galleta'),
    ('Vaso KIDS Nube Colorida', 'Helado en vaso infantil', 3200.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/vaso-kids-nube-colorida-1.webp', 50, 'Crem Helado', 'Vasito'),
    ('Vaso Kola Aloha', 'Helado en vaso sabor kola', 4500.00, 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/vaso-kola-aloha-1.webp', 50, 'Crem Helado', 'Vasito'),
    ('Torta Juan Valdez', 'Torta de helado de 8 porciones', 48900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/TORTA-JUAN-VALDEZ-400X400.png.webp', 50, 'Popsy', 'Torta'),
    ('Torta Crema de Limón', 'Torta de helado de 8 porciones', 48900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/TORTA-LIMON-400X400.png.webp', 50, 'Popsy', 'Torta'),
    ('Postre Milky Way', 'Postre de helado de 6 porciones', 48900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/torta.png.webp', 50, 'Popsy', 'Torta'),
    ('Torta de Helado Frutos del Bosque', 'Torta de helado de 12 porciones', 61900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/TORTA-FRUTOS-DEL-BOSQUE-400X400.png.webp', 50, 'Popsy', 'Torta'),
    ('Torta de Helado Oreo', 'Torta de helado de 12 porciones', 61900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/TORTA-OREO-400X400.png.webp', 50, 'Popsy', 'Torta'),
    ('Paleta Mandarina Agua Pack x 4 Und', 'Paleta de agua sabor mandarina pack por 4 unidades', 25900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/multipackagua.png.webp', 50, 'Popsy', 'Paleta'),
    ('Paleta Gourmet Selecta Juan Valdez pack x 4 und', 'Paleta gourmet con café y salsa de caramelo', 35900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/mjuan.png.webp', 50, 'Popsy', 'Paleta'),
    ('Paleta Gourmet Selecta Oreo pack x 4 und', 'Paleta gourmet con galleta Oreo', 35900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/moreo.png.webp', 50, 'Popsy', 'Paleta'),
    ('Paleta Cremosa Cereza Italiana Pack x 4 Und', 'Paleta cremosa sabor cereza italiana', 35900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/06/Proyecto-nuevo-2.png.webp', 50, 'Popsy', 'Paleta'),
    ('Paleta Cremosa Vainilla', 'Paleta cremosa sabor vainilla', 35900.00, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTq7sYs65VpFeOmnKTyCUVe95GWOCm7MlRqH-sWNfNNtFiEE0dwhJ4KrF8Bl91QdEHcRj3NPQyk3TVtDUlQUuYsm9D39fFd5azyOQf7aviH7TIEVyOjo7jp1Q', 50, 'Popsy', 'Paleta'),
    ('Tarrina Maracuyá Nieve', 'Tarrina sabor maracuyá', 39900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/03/MaracuyaNieve-min.png.webp', 50, 'Popsy', 'Tarrina'),
    ('Tarrina Ron con Pasas', 'Tarrina sabor ron con pasas', 39900.00, 'https://megatiendas.vtexassets.com/arquivos/ids/171805-1600-auto?v=638609916841370000&width=1600&height=auto&aspect=true', 50, 'Popsy', 'Tarrina'),
    ('Tarrina Arequipe Gourmet', 'Tarrina gourmet sabor arequipe', 39900.00, 'https://heladospopsy.com/storage/products/955/a0382ba58fbda20114b8222419aea936.png', 50, 'Popsy', 'Tarrina'),
    ('Tarrina Chocolate Belga', 'Tarrina sabor chocolate belga', 39900.00, 'https://carulla.vteximg.com.br/arquivos/ids/24770405/Helado-Cremoso-Chocolate-Belga-Gourmet-X-1-lt-644685_a.jpg?v=639100394618200000', 50, 'Popsy', 'Tarrina'),
    ('Extra Litro Frutos del Bosque Gourmet', 'Helado litro sabor frutos del bosque', 39900.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmnM6l6jrBBJHA7fwB-ANu18xDBQe3TEQYG_HfOnwXOA&s', 50, 'Popsy', 'Litro'),
    ('Extra Litro Oreo Gourmet', 'Helado litro sabor Oreo', 46900.00, 'https://prodcdnmobisoft.oxxodomicilios.com/01J1YA39EGNMVZ49766ACY06HR.png', 50, 'Popsy', 'Litro'),
    ('Litro Arequipe Gourmet', 'Helado litro sabor arequipe', 39900.00, 'https://scontent.fbga4-1.fna.fbcdn.net/v/t39.30808-6/481448414_9606056282791935_1487130749462475417_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=7b2446&_nc_ohc=GbyouCDH7-kQ7kNvwFCng8y&_nc_oc=AdpWAeqRu6l0YhO7i5GQK-o73rPGTi5LwaI4NgGIdSBPJt18RCk6-rOMIjVVXoQWtoM&_nc_zt=23&_nc_ht=scontent.fbga4-1.fna&_nc_gid=TrG-KhfefWDou1yBQoz7oA&_nc_ss=7a389&oh=00_Af0mdwo-bXvvTKOg4XdjulaC4Bx1WmAWYqvgKxGO5KjgAA&oe=69D4679C', 50, 'Popsy', 'Litro'),
    ('Litro Chocolate Gourmet', 'Helado litro sabor chocolate', 39900.00, 'https://exitocol.vtexassets.com/arquivos/ids/32877573/Helado-Cremoso-De-Chocolate-Gourmet-X-1-lt-598342_a.jpg?v=639100394584030000', 50, 'Popsy', 'Litro'),
    ('Litro Chocolate Belga Gourmet', 'Helado litro sabor chocolate belga', 39900.00, 'https://carulla.vteximg.com.br/arquivos/ids/24770405/Helado-Cremoso-Chocolate-Belga-Gourmet-X-1-lt-644685_a.jpg?v=639100394618200000', 50, 'Popsy', 'Litro'),
    ('1/2 Litro Vainilla Gourmet', 'Helado medio litro sabor vainilla', 24900.00, 'https://mercacentro.vtexassets.com/arquivos/ids/162663-1200-auto?v=638932264501300000&width=1200&height=auto&aspect=true', 50, 'Popsy', 'Litro'),
    ('1/2 Litro Mandarina Gourmet', 'Helado medio litro sabor mandarina', 24900.00, 'https://corporativo.heladospopsy.com/wp-content/uploads/2023/03/MandarinaNieve-min.png.webp', 50, 'Popsy', 'Litro'),
    ('Helado COLOMBINA vainilla x 2500g', 'Helado sabor vainilla', 52800.00, 'https://exitocol.vtexassets.com/arquivos/ids/32876538/Helado-Vainilla-COLOMBINA-2200-gr-3469532_a.jpg?v=639100386750270000', 50, 'Colombina', 'Litro'),
    ('Helado COLOMBINA frutos rojos x 2500g', 'Helado sabor frutos rojos', 56000.00, 'https://exitocol.vtexassets.com/arquivos/ids/32876537/Helado-Frutos-Rojos-COLOMBINA-2200-gr-3470306_a.jpg?v=639100386738300000', 50, 'Colombina', 'Litro'),
    ('Helado BON BON BUM fresa x 300g', 'Helado sabor fresa de la linea Bon Bon Bum', 21950.00, 'https://prodcdnmobisoft.oxxodomicilios.com/01J1Y9PANMVZSSD2DEH5ZZ5XQT.png', 50, 'Colombina', 'Litro'),
    ('Helado Nucita sabor Avellana y crema x 600g', 'Helado sabor avellana y crema', 23900.00, 'https://olimpica.vtexassets.com/arquivos/ids/1833839-800-auto?aspect=true&height=auto&v=638791175928330000&width=800', 50, 'Colombina', 'Litro'),
    ('Helado COLOMBINA ron pasas x 300g', 'Helado sabor ron con pasas', 22700.00, 'https://exitocol.vtexassets.com/arquivos/ids/32876425/HELADO-RON-PASAS-COLOMBINA-300-Gramo-3003301_a.jpg?v=639100386329200000', 50, 'Colombina', 'Litro'),
    ('Helado COLOMBINA chocolate x 300g', 'Helado sabor chocolate', 22550.00, 'https://exitocol.vtexassets.com/arquivos/ids/32876428/HELADO-CHOCOLATE-COLOMBINA-300-Gramo-3003304_a.jpg?v=639100386346570000', 50, 'Colombina', 'Litro'),
    ('Helado Chocoramo x 600g', 'Helado sabor Chocoramo', 41000.00, 'https://megatiendas.vtexassets.com/arquivos/ids/177190-800-auto?aspect=true&height=auto&v=638956225755200000&width=800', 50, 'Colombina', 'Litro'),
    ('Postre de helado COLOMBINA torta frutos del bosque x 900g', 'Torta de helado frutos del bosque', 55600.00, 'https://exitocol.vtexassets.com/arquivos/ids/32876353/Torta-Frutos-Del-Bosque-900g-102257_a.jpg?v=639100385900600000', 50, 'Colombina', 'Torta'),
    ('Helado Vainilla Colanta X 0.5 Lt', 'Helado de vainilla elaborado principalmente con leche entera', 14400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2020/01/Helado-Colanta-Vainilla-0.5-Litros.png', 50, 'Colanta', 'Litro'),
    ('Helado Brownie Colanta X 0.5 Lt', 'Helado de brownie elaborado principalmente con leche entera', 14400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2020/01/05-Litro-Helado-Colanta-de-BROWNIE-PRESENTACIONES-1000x1000.png', 50, 'Colanta', 'Litro'),
    ('Helado Vainilla Chips Colanta X 0.5 Lt', 'Helado de vainilla chips elaborado principalmente con leche entera', 14400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2021/10/Vainilla-chips-medio-L.jpg', 50, 'Colanta', 'Litro'),
    ('Helado Vainilla Colanta X 1 Lt', 'Helado de vainilla elaborado principalmente con leche entera', 24400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2020/01/Helado-Colanta-Vainilla-1-Litro.jpg', 50, 'Colanta', 'Litro'),
    ('Helado Brownie Colanta X 1 Lt', 'Helado de brownie elaborado principalmente con leche entera', 24400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2020/01/1-Litro-Helado-Colanta-de-BROWNIE-PRESENTACIONES-1000x1000.png', 50, 'Colanta', 'Litro'),
    ('Helado Chocolate Colanta X 1 Lt', 'Helado de chocolate elaborado principalmente con leche entera', 24400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2020/01/1-Litro-Helado-Colanta-de-CHOCOLATE-1000x1000.jpg', 50, 'Colanta', 'Litro'),
    ('Helado Vainilla Chips Colanta X 1 Lt', 'Helado de vainilla chips elaborado principalmente con leche entera', 24400.00, 'https://colanta.com/sabe-mas/wp-content/uploads/2021/10/Vainilla-chips-1L.jpg', 50, 'Colanta', 'Litro'),
    ('Helado Chocolate Colanta X 5 Lt', 'Helado de chocolate elaborado principalmente con leche entera', 45900.00, 'https://colanta.com/sabe-mas/wp-content/uploads/Chocolate-5L-informacion-nutricional.png', 50, 'Colanta', 'Litro'),
    ('Helado Brownie Colanta X 5 Lt', 'Helado de brownie elaborado principalmente con leche entera', 45900.00, 'https://colanta.com/sabe-mas/wp-content/uploads/Brownie-5L-informacion-nutricional-1.png', 50, 'Colanta', 'Litro'),
    ('Helado Vainilla Chips Colanta X 5 Lt', 'Helado de vainilla chips elaborado principalmente con leche entera', 45900.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3kgDJI7uLlre0JtisAPsFkq1vooMSZ752OpJEbQCcJQ&s', 50, 'Colanta', 'Litro')
)
INSERT INTO producto (nombre, descripcion, precio, imagen, stock, marca_id, presentacion_id)
SELECT
    d.nombre,
    d.descripcion,
    d.precio,
    d.imagen,
    d.stock,
    m.id,
    p.id
FROM data d
JOIN marca m ON m.nombre = d.marca_nombre
JOIN presentacion p ON p.nombre = d.presentacion_nombre
ON CONFLICT (nombre) DO UPDATE
SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    imagen = EXCLUDED.imagen,
    stock = EXCLUDED.stock,
    marca_id = EXCLUDED.marca_id,
    presentacion_id = EXCLUDED.presentacion_id;

-- ========================================
-- 9. Insertar Pedidos de ejemplo (cliente)
-- ========================================
INSERT INTO pedido (
    cliente_id,
    empleado_id,
    estado_id,
    fecha_creacion,
    fecha_limite_cancelacion,
    direccion_entrega,
    total_pedido
)
SELECT
    u.id AS cliente_id,
    NULL::bigint AS empleado_id,
    e.id AS estado_id,
    CURRENT_TIMESTAMP - INTERVAL '2 hours' AS fecha_creacion,
    CURRENT_TIMESTAMP + INTERVAL '1 hour' AS fecha_limite_cancelacion,
    'Calle 10 #5-50, Barrio Centro' AS direccion_entrega,
    12500.00 AS total_pedido
FROM usuario u
JOIN estado_pedido e ON e.nombre = 'recibido'
WHERE u.username = 'cliente'

UNION ALL

SELECT
    u.id AS cliente_id,
    NULL::bigint AS empleado_id,
    e.id AS estado_id,
    CURRENT_TIMESTAMP - INTERVAL '1 day' AS fecha_creacion,
    NULL::timestamp with time zone AS fecha_limite_cancelacion,
    'Cra 15 #24-33, Apto 203' AS direccion_entrega,
    38900.00 AS total_pedido
FROM usuario u
JOIN estado_pedido e ON e.nombre = 'en camino'
WHERE u.username = 'cliente'

UNION ALL

SELECT
    u.id AS cliente_id,
    NULL::bigint AS empleado_id,
    e.id AS estado_id,
    CURRENT_TIMESTAMP - INTERVAL '3 days' AS fecha_creacion,
    NULL::timestamp with time zone AS fecha_limite_cancelacion,
    'Calle 8 #12-90, Casa 4' AS direccion_entrega,
    61900.00 AS total_pedido
FROM usuario u
JOIN estado_pedido e ON e.nombre = 'entregado'
WHERE u.username = 'cliente';

COMMIT;
