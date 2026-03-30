-- ========================
-- EXTENSIONES
-- ========================
create extension if not exists "uuid-ossp";

-- ========================
-- UBICACIÓN
-- ========================

create table Pl_Countries (
  id serial primary key,
  name text not null
);

create table Pl_Provinces (
  id serial primary key,
  name text not null,
  country_id int not null references Pl_Countries(id)
);

create table Pl_Cantons (
  id serial primary key,
  name text not null,
  province_id int not null references Pl_Provinces(id)
);

create table Pl_Districts (
  id serial primary key,
  name text not null,
  canton_id int not null references Pl_Cantons(id)
);

-- ========================
-- USUARIOS (PERFIL)
-- ========================

create table Pl_UserStatus (
  id serial primary key,
  name text not null unique,
  -- Nombres de estados de usuario: alfanumérico, espacios y guiones
  constraint userstatus_name_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

create table Pl_Users (
  id uuid primary key references auth.users(id) on delete cascade,
  firstname text not null,
  lastname text not null,
  email text unique,
  cellphone text,
  district_id int references Pl_Districts(id),
  line1 text,
  line2 text,
  cedula text,
  gender boolean,
  status_id int references Pl_UserStatus(id),
  created_at timestamp default now(),
  -- Validación: nombres solo con caracteres alfabéticos y espacios
  constraint firstname_alpha_only check (firstname ~ '^[a-zA-Z\s]+$'),
  constraint lastname_alpha_only check (lastname ~ '^[a-zA-Z\s]+$'),
  -- Validación: email válido (formato básico RFC 5322 simplificado)
  constraint email_format check (email is null or email ~ '^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'),
  -- Validación: cédula exactamente 9 dígitos
  constraint cedula_format check (cedula is null or (cedula ~ '^\d+$' and length(cedula) = 9)),
  -- Validación: celular exactamente 8 dígitos
  constraint cellphone_format check (cellphone is null or (cellphone ~ '^\d+$' and length(cellphone) = 8))
);

-- ========================
-- EMPLEADOS
-- ========================

create table Pl_Employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cellphone text,
  cedula text,
  password text not null,
  district_id int references Pl_Districts(id),
  line1 text,
  line2 text,
  created_at timestamp default now(),
  -- Validación: nombre solo con caracteres alfabéticos y espacios
  constraint employee_name_alpha_only check (name ~ '^[a-zA-Z\s]+$'),
  -- Validación: cédula exactamente 9 dígitos
  constraint employee_cedula_format check (cedula is null or (cedula ~ '^\d+$' and length(cedula) = 9)),
  -- Validación: celular exactamente 8 dígitos
  constraint employee_cellphone_format check (cellphone is null or (cellphone ~ '^\d+$' and length(cellphone) = 8))
);

-- ========================
-- MASCOTAS
-- ========================

create table Pl_PetTypes (
  id serial primary key,
  name text not null,
  -- Nombres de tipos de mascota: alfanumérico, espacios y guiones
  constraint pettype_name_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

create table Pl_Pets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  race text not null,
  birthdate date not null,
  pet_type_id int references Pl_PetTypes(id),
  profile_picture_url text,
  veterinarian_name text,
  veterinarian_cellphone text,
  vaccines text,
  medical_conditions text,
  owner_id uuid not null references Pl_Users(id) on delete cascade,
  special_care_needs text,
  weight numeric,
  gender boolean,
  created_at timestamp default now(),
  -- Validación: nombre solo con caracteres alfabéticos y espacios
  constraint pet_name_alpha_only check (name ~ '^[a-zA-Z\s]+$'),
  -- Validación: raza permite alfanuméricos, espacios y guiones (ej: "Caniche-Toy")
  constraint pet_race_format check (race ~ '^[a-zA-Z0-9\s\-]+$'),
  -- Validación: fecha de nacimiento no puede ser en el futuro
  constraint birthdate_not_future check (birthdate <= current_date),
  -- Validación: fecha de nacimiento no puede ser más de 70 años atrás (edad máxima realista de mascota)
  constraint birthdate_not_too_old check (birthdate >= current_date - interval '70 years'),
  -- Validación: peso debe ser positivo si está definido
  constraint weight_positive check (weight is null or weight > 0),
  -- Validación: URL de foto de perfil en formato http/https (ej: Supabase Storage)
  constraint pet_profile_picture_url_format check (
    profile_picture_url is null
    or profile_picture_url ~* '^https?://.+'
  ),
  -- Validación: peso no debe exceder 300 kg (límite realista)
  constraint weight_reasonable check (weight is null or weight <= 300)
);

-- ========================
-- SERVICIOS
-- ========================

create table Pl_Services (
  id serial primary key,
  name text not null,
  -- Nombres de servicios: alfanumérico, espacios y guiones
  constraint service_name_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

-- ========================
-- HOSPEDAJE
-- ========================

create table Pl_LodgingTypes (
  id serial primary key,
  type text not null,
  -- Nombres de tipos de hospedaje: alfanumérico, espacios y guiones
  constraint lodging_type_format check (type ~ '^[a-zA-Z0-9\s\-]+$')
);

create table Pl_Rooms (
  id serial primary key,
  name text not null,
  -- Nombres de habitaciones: alfanumérico, espacios y guiones
  constraint room_name_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

-- ========================
-- RESERVAS
-- ========================

create table Pl_ReservationStatus (
  id serial primary key,
  name text not null,
  -- Nombres de estados: alfanumérico, espacios y guiones
  constraint reservation_status_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

create table Pl_Reservations (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid not null references Pl_Pets(id) on delete cascade,
  room_id int references Pl_Rooms(id),
  check_in timestamp not null,
  check_out timestamp not null,
  status_id int references Pl_ReservationStatus(id),
  lodging_type_id int references Pl_LodgingTypes(id),
  created_at timestamp default now(),
  -- Validaciones de fechas de reserva
  -- El check-in debe ser a partir de hoy
  constraint check_in_not_past check (check_in::date >= current_date),
  -- El check-out debe ser después del check-in más de 1 día (requiere al menos 2 días de hospedaje)
  constraint checkout_after_checkin check (check_out > check_in + interval '1 day'),
  -- Validación: no se permite reservar más de 365 días en avance (máximo 1 año)
  constraint checkout_not_too_far check (check_out <= check_in + interval '365 days'),
  -- Ambas fechas deben estar definidas
  constraint dates_not_null check (check_in is not null and check_out is not null)
);

create table Pl_ReservationServices (
  id serial primary key,
  reservation_id uuid references Pl_Reservations(id) on delete cascade,
  service_id int references Pl_Services(id),
  -- Validación: no se puede añadir el mismo servicio dos veces a la misma reserva
  unique(reservation_id, service_id)
);

-- ========================
-- NOTIFICACIONES
-- ========================

create table Pl_NotificationTypes (
  id serial primary key,
  name text not null unique,
  description text,
  -- Nombres de tipos de notificación: alfanumérico, espacios y guiones
  constraint notification_type_name_format check (name ~ '^[a-zA-Z0-9\s\-]+$')
);

create table Pl_Notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references Pl_Users(id) on delete cascade,
  notification_type_id int references Pl_NotificationTypes(id),
  name text not null,
  description text not null,
  date timestamp default now(),
  -- Validación: nombre solo con caracteres alfabéticos y espacios
  constraint notification_name_alpha_only check (name ~ '^[a-zA-Z\s]+$'),
  -- Validación: nombre no puede tener solo espacios
  constraint notification_name_not_only_spaces check (trim(name) != ''),
  -- Validación: descripción no puede estar vacía
  constraint description_not_empty check (description != ''),
  -- Validación: descripción no puede tener solo espacios
  constraint description_not_only_spaces check (trim(description) != ''),
  -- Validación: el nombre y descripción no pueden ser idénticos (evita duplicados obvios)
  constraint name_description_different check (lower(trim(name)) != lower(trim(description))),
  -- Validación: ambos campos de texto están definidos
  constraint notification_fields_not_null check (name is not null and description is not null),
  -- Validación: la fecha de notificación no puede ser en el futuro
  constraint notification_date_not_future check (date <= now())
);

-- ========================
-- ÍNDICES PARA OPTIMIZACIÓN Y VALIDACIÓN
-- ========================

-- Índice para búsquedas rápidas de reservas activas por mascota
create index idx_reservations_pet_status on Pl_Reservations(pet_id, status_id, check_in, check_out);

-- Índice para búsquedas por usuario
create index idx_notifications_user on Pl_Notifications(user_id, date desc);

-- Índice para búsquedas de mascotas por propietario
create index idx_pets_owner on Pl_Pets(owner_id);

-- Índice para búsquedas de reservas por estado
create index idx_reservations_status on Pl_Reservations(status_id, created_at desc);

-- Índice para validar disponibilidad de habitaciones
create index idx_reservations_room on Pl_Reservations(room_id, check_in, check_out);
