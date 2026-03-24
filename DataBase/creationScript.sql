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
  name text
);

create table Pl_Users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique,
  cellphone text,
  district_id int references Pl_Districts(id),
  line1 text,
  line2 text,
  cedula text,
  gender boolean,
  status_id int references Pl_UserStatus(id),
  created_at timestamp default now()
);

-- ========================
-- EMPLEADOS
-- ========================

create table Pl_Employees (
  id uuid primary key default uuid_generate_v4(),
  name text,
  cellphone text,
  cedula text,
  password text,
  district_id int references Pl_Districts(id),
  line1 text,
  line2 text,
  created_at timestamp default now()
);

-- ========================
-- MASCOTAS
-- ========================

create table Pl_PetTypes (
  id serial primary key,
  name text not null
);

create table Pl_Pets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  race text not null,
  birthdate date not null,
  pet_type_id int references Pl_PetTypes(id),
  veterinarian_name text,
  veterinarian_cellphone text,
  vaccines text,
  medical_conditions text,
  owner_id uuid not null references Pl_Users(id) on delete cascade,
  special_care_needs text,
  weight numeric,
  gender boolean,
  created_at timestamp default now()
);

-- ========================
-- SERVICIOS
-- ========================

create table Pl_Services (
  id serial primary key,
  name text
);

-- ========================
-- HOSPEDAJE
-- ========================

create table Pl_LodgingTypes (
  id serial primary key,
  type text
);

create table Pl_Rooms (
  id serial primary key,
  name text not null
);

-- ========================
-- RESERVAS
-- ========================

create table Pl_ReservationStatus (
  id serial primary key,
  name text not null
);

create table Pl_Reservations (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid not null references Pl_Pets(id) on delete cascade,
  room_id int references Pl_Rooms(id),
  check_in timestamp,
  check_out timestamp,
  status_id int references Pl_ReservationStatus(id),
  lodging_type_id int references Pl_LodgingTypes(id),
  created_at timestamp default now()
);

create table Pl_ReservationServices (
  id serial primary key,
  reservation_id uuid references Pl_Reservations(id) on delete cascade,
  service_id int references Pl_Services(id)
);

-- ========================
-- NOTIFICACIONES
-- ========================

create table Pl_Notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references Pl_Users(id) on delete cascade,
  name text,
  description text,
  date timestamp default now()
);