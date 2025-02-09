-- Crear la base de datos
CREATE DATABASE tortillapp_db;

-- Crear el usuario y asignarle una contraseña
CREATE USER 'tortillappdb'@'localhost' IDENTIFIED BY 'Javier117';

-- Otorgar todos los privilegios sobre la base de datos
GRANT ALL PRIVILEGES ON tortillapp_db.* TO 'tortillappdb'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- Seleccionar la base de datos
USE tortillapp_db;


--Tabla de roles en la app
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(500)
);
-- Tabla para cuentas de usuario
CREATE TABLE cuenta (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL,
    activated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla para las suscripciones
CREATE TABLE suscripciones (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    precio DOUBLE NOT NULL,
    descuento DOUBLE DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE
);
CREATE TABLE suscripciones_detalles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_suscripcion INTEGER NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);
-- Tabla para las relaciones entre cuentas y suscripciones
CREATE TABLE cuentas_suscripciones (
    id_cuenta INTEGER NOT NULL,
    id_suscripcion INTEGER NOT NULL,
    PRIMARY KEY (id_cuenta, id_suscripcion),
    FOREIGN KEY (id_cuenta) REFERENCES cuenta(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_suscripcion) REFERENCES suscripciones(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla para los negocios
CREATE TABLE negocio (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  dominio VARCHAR(255) NOT NULL,
  id_cuenta INTEGER NOT NULL,
  FOREIGN KEY (id_cuenta) REFERENCES cuenta(id) ON DELETE CASCADE
);

-- Tabla para las sucursales
CREATE TABLE sucursales (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  longitude DOUBLE NOT NULL,
  latitude DOUBLE NOT NULL,
  id_negocio INTEGER NOT NULL,
  FOREIGN KEY (id_negocio) REFERENCES negocio(id) ON DELETE CASCADE
);

CREATE TABLE cuenta_sucursal (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  id_cuenta INTEGER NOT NULL,
  id_sucursal INTEGER NOT NULL,
  FOREIGN KEY (id_cuenta) REFERENCES cuenta(id) ON DELETE CASCADE,
  FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE,
  UNIQUE (id_cuenta, id_sucursal)  -- Asegura que no haya duplicados en la relación
);

CREATE TABLE adminConfig (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    negocio BOOLEAN NOT NULL DEFAULT FALSE,
    sucursal BOOLEAN NOT NULL DEFAULT FALSE,
    precio BOOLEAN NOT NULL DEFAULT FALSE,
    productos BOOLEAN NOT NULL DEFAULT FALSE,
    gastos BOOLEAN NOT NULL DEFAULT FALSE,
    empleados BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_admin FOREIGN KEY (id_admin) REFERENCES cuenta(id) ON DELETE CASCADE
);

-- Crear tabla 'precio_kilo_tortilla'
CREATE TABLE precio_kilo_tortilla (
  id INT PRIMARY KEY AUTO_INCREMENT,          -- ID de la tabla (auto incremental)
  id_sucursal INT NOT NULL,                   -- ID de la sucursal
  precio_publico DOUBLE NOT NULL,             -- Precio público
  precio_cliente DOUBLE NOT NULL              -- Precio para las tiendas
);

-- Crear tabla 'productos'
CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,          -- ID autoincremental
  id_sucursal INT NOT NULL,                   -- ID de la sucursal
  nombre VARCHAR(255) NOT NULL,                -- Nombre del producto
  precio DECIMAL(10, 2) NOT NULL,             -- Precio del producto (hasta 10 dígitos, 2 decimales)
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Fecha y hora de inserción (por defecto la fecha actual)
);

-- Crear tabla 'gastos_personalizados'
CREATE TABLE gastos_personalizados (
  id INT PRIMARY KEY AUTO_INCREMENT,          -- ID autoincremental
  id_cuenta INT NOT NULL,                     -- ID de cuenta
  id_negocio INT NOT NULL,                    -- ID del negocio
  tipo_gasto INT CHECK (tipo_gasto IN (1, 2)), -- Tipo de gasto (1: fijo, 2: variable)
  nombre VARCHAR(255) NOT NULL,                -- Nombre del gasto
  descripcion VARCHAR(255)                    -- Descripción del gasto
);

--- Tabla de insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema, con acceso completo a todas las funcionalidades.'),
('molino', 'Empleado encargado de la operación y mantenimiento del molino.'),
('mostrador', 'Empleado que gestiona las ventas y atención al cliente en el mostrador.'),
('repartidor', 'Empleado responsable de realizar entregas de productos a los clientes.');

--- tabla de insertar suscripciones
INSERT INTO suscripciones (nombre, precio, descuento, estado) VALUES
('Básica', 0, 0, TRUE)

-- Tabla para la configuración de los administradores
