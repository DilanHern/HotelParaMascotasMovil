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

INSERT INTO pl_rooms (name) values
('Room 1'),
('Room 2'),
('Room 3'),
('Room 4'),
('Room 5'),
('Room 6'),
('Room 7'),
('Room 8'),
('Room 9'),
('Suite 1'),
('Suite 2'),
('Suite 3'),
('Suite 4'),
('Suite 5');
