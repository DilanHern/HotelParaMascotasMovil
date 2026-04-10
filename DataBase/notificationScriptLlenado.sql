-- ========================
-- TIPOS DE NOTIFICACIÓN
-- ========================

-- Insertar los tipos de notificación para los 6 eventos principales
INSERT INTO Pl_NotificationTypes (name, description) VALUES
  ('User-Registered', 'Notificación de registro de usuario'),
  ('Reservation-Confirmed', 'Notificación de confirmación de reserva'),
  ('Reservation-Modified', 'Notificación de modificación de reserva'),
  ('Lodging-Started', 'Notificación de inicio del hospedaje'),
  ('Lodging-Ended', 'Notificación de finalización del hospedaje'),
  ('Pet-Status-Update', 'Avisos personalizados del estado de la mascota')
ON CONFLICT (name) DO NOTHING;
