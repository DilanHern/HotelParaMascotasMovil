-- ========================
-- TIPOS DE NOTIFICACIÓN
-- ========================

-- Insertar los tipos de notificación para los 6 eventos principales
INSERT INTO Pl_NotificationTypes (name, description) VALUES
  ('User-Registered', 'Notificación de registro de usuario'),
  ('Reservation-Created', 'Notificación de creación de reserva'),
  ('Reservation-Confirmed', 'Notificación de confirmación de reserva'),
  ('Reservation-Modified', 'Notificación de modificación de reserva'),
  ('Reservation-Deleted', 'Notificación de modificación de reserva'),
  ('Lodging-Started', 'Notificación de inicio del hospedaje'),
  ('Lodging-Ended', 'Notificación de finalización del hospedaje'),
  ('Pet-Status-Update', 'Avisos personalizados del estado de la mascota')
ON CONFLICT (name) DO NOTHING;
-- ========================
-- HABITACIONES
-- ========================

-- Insertar 10 habitaciones base (evita duplicar por nombre)
INSERT INTO Pl_Rooms (name)
SELECT 'Habitacion Estandar 1'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Habitacion Estandar 1');

INSERT INTO Pl_Rooms (name)
SELECT 'Habitacion Estandar 2'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Habitacion Estandar 2');

INSERT INTO Pl_Rooms (name)
SELECT 'Habitacion Estandar 3'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Habitacion Estandar 3');

INSERT INTO Pl_Rooms (name)
SELECT 'Habitacion Estandar 4'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Habitacion Estandar 4');

INSERT INTO Pl_Rooms (name)
SELECT 'Habitacion Estandar 5'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Habitacion Estandar 5');

INSERT INTO Pl_Rooms (name)
SELECT 'Suite Deluxe 1'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Suite Deluxe 1');

INSERT INTO Pl_Rooms (name)
SELECT 'Suite Deluxe 2'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Suite Deluxe 2');

INSERT INTO Pl_Rooms (name)
SELECT 'Suite Premium 1'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Suite Premium 1');

INSERT INTO Pl_Rooms (name)
SELECT 'Suite Premium 2'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Suite Premium 2');

INSERT INTO Pl_Rooms (name)
SELECT 'Suite Junior 1'
WHERE NOT EXISTS (SELECT 1 FROM Pl_Rooms WHERE name = 'Suite Junior 1');

