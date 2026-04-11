-- Permisos mínimos para que HotelMascotasMovil pueda leer habitaciones
-- y manejar reservas del usuario autenticado.
--
-- Ejecutar en Supabase SQL Editor con un rol con privilegios (service role / postgres).

begin;

-- =========================
-- GRANTS (PostgREST)
-- =========================

grant usage on schema public to anon, authenticated;

-- Lectura de habitaciones (para selector / disponibilidad)
grant select on table public.pl_rooms to anon, authenticated;
grant select on table public.pl_lodgingtypes to anon, authenticated;
grant select on table public.pl_reservationstatus to anon, authenticated;
grant select, insert, update, delete on table public.pl_pets to authenticated;
grant select on table public.pl_services to anon, authenticated;
grant select, insert on table public.pl_reservationservices to authenticated;

-- ========================
-- PERMISOS PARA USUARIOS
-- ========================
grant select, update on table public.pl_users to authenticated;

-- ========================
-- PERMISOS PARA NOTIFICACIONES
-- ========================
grant select, insert on table public.pl_notifications to authenticated;
grant select on table public.pl_notificationtypes to anon, authenticated;

-- ========================
-- PERMISOS PARA DATOS GEOGRÁFICOS
-- ========================
grant select on table public.pl_countries to anon, authenticated;
grant select on table public.pl_provinces to anon, authenticated;
grant select on table public.pl_cantons to anon, authenticated;
grant select on table public.pl_districts to anon, authenticated;

-- Reservas: la app lee/crea/actualiza/elimina (controlado por RLS abajo)
grant select, insert, update, delete on table public.pl_reservations to authenticated;

-- Si existen secuencias por serial (rooms)
grant usage, select on all sequences in schema public to anon, authenticated;

-- ========================
-- RPC: Guardar notificación
-- ========================
create or replace function public.save_notification(
  p_user_id uuid,
  p_notification_type_name text,
  p_name text,
  p_description text
)
returns table (
  id uuid,
  user_id uuid,
  notification_type_id int,
  name text,
  description text,
  date timestamp
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_type_id int;
begin
  -- Obtener el ID del tipo de notificación
  select pl_notificationtypes.id into v_notification_type_id
  from public.pl_notificationtypes
  where lower(public.pl_notificationtypes.name) = lower(p_notification_type_name)
  limit 1;

  -- Si no existe el tipo, crear uno
  if v_notification_type_id is null then
    insert into public.pl_notificationtypes (name, description)
    values (p_notification_type_name, 'Sistema de ' || p_notification_type_name)
    returning public.pl_notificationtypes.id into v_notification_type_id;
  end if;

  -- Insertar la notificación
  return query
  insert into public.pl_notifications (user_id, notification_type_id, name, description)
  values (p_user_id, v_notification_type_id, p_name, p_description)
  returning public.pl_notifications.id, public.pl_notifications.user_id, public.pl_notifications.notification_type_id, public.pl_notifications.name, public.pl_notifications.description, public.pl_notifications.date;
end;
$$;

revoke all on function public.save_notification(uuid, text, text, text) from public;
grant execute on function public.save_notification(uuid, text, text, text) to authenticated;

-- =========================
-- RPC: disponibilidad de habitaciones
-- =========================

-- Devuelve habitaciones que NO se traslapan con una reserva existente:
-- traslape si (r.check_in < p_check_out) AND (r.check_out > p_check_in)
create or replace function public.get_available_rooms(
  p_check_in timestamptz,
  p_check_out timestamptz,
  p_lodging_type text default null
)
returns table (
  id int,
  name text
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.name
  from public.pl_rooms r
  where
    -- filtro opcional por tipo (mantiene tu lógica actual por nombre)
    (
      p_lodging_type is null
      or p_lodging_type <> 'Especial'
      or lower(r.name) like '%suite%'
      or lower(r.name) like '%deluxe%'
    )
    and not exists (
      select 1
      from public.pl_reservations res
      where res.room_id = r.id
        and res.room_id is not null
        and res.check_in < p_check_out
        and res.check_out > p_check_in
    )
  order by r.name asc;
$$;

revoke all on function public.get_available_rooms(timestamptz, timestamptz, text) from public;
grant execute on function public.get_available_rooms(timestamptz, timestamptz, text) to anon, authenticated;

-- =========================
-- RLS
-- =========================

-- USUARIOS: Solo pueden ver/modificar su propio perfil
alter table public.pl_users enable row level security;

drop policy if exists "users_select_own" on public.pl_users;
create policy "users_select_own"
on public.pl_users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_update_own" on public.pl_users;
create policy "users_update_own"
on public.pl_users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- NOTIFICACIONES: Los usuarios pueden ver sus propias notificaciones
alter table public.pl_notifications enable row level security;

drop policy if exists "notifications_select_own" on public.pl_notifications;
create policy "notifications_select_own"
on public.pl_notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_insert_system" on public.pl_notifications;
create policy "notifications_insert_system"
on public.pl_notifications
for insert
to authenticated
with check (user_id = auth.uid());

-- NOTIFICACIÓN TYPES: Acceso público de lectura
alter table public.pl_notificationtypes enable row level security;

drop policy if exists "notificationtypes_select_all" on public.pl_notificationtypes;
create policy "notificationtypes_select_all"
on public.pl_notificationtypes
for select
to anon, authenticated
using (true);

-- DATOS GEOGRÁFICOS: Acceso público de lectura
alter table public.pl_countries enable row level security;

drop policy if exists "countries_select_all" on public.pl_countries;
create policy "countries_select_all"
on public.pl_countries
for select
to anon, authenticated
using (true);

alter table public.pl_provinces enable row level security;

drop policy if exists "provinces_select_all" on public.pl_provinces;
create policy "provinces_select_all"
on public.pl_provinces
for select
to anon, authenticated
using (true);

alter table public.pl_cantons enable row level security;

drop policy if exists "cantons_select_all" on public.pl_cantons;
create policy "cantons_select_all"
on public.pl_cantons
for select
to anon, authenticated
using (true);

alter table public.pl_districts enable row level security;

drop policy if exists "districts_select_all" on public.pl_districts;
create policy "districts_select_all"
on public.pl_districts
for select
to anon, authenticated
using (true);

-- Habitaciones: si quieres que cualquiera autenticado las lea
alter table public.pl_rooms enable row level security;

drop policy if exists "rooms_select_all" on public.pl_rooms;
create policy "rooms_select_all"
on public.pl_rooms
for select
to anon, authenticated
using (true);

-- Catálogos usados para crear reservas
alter table public.pl_lodgingtypes enable row level security;

drop policy if exists "lodgingtypes_select_all" on public.pl_lodgingtypes;
create policy "lodgingtypes_select_all"
on public.pl_lodgingtypes
for select
to anon, authenticated
using (true);

alter table public.pl_reservationstatus enable row level security;

drop policy if exists "reservationstatus_select_all" on public.pl_reservationstatus;
create policy "reservationstatus_select_all"
on public.pl_reservationstatus
for select
to anon, authenticated
using (true);

alter table public.pl_services enable row level security;

drop policy if exists "services_select_all" on public.pl_services;
create policy "services_select_all"
on public.pl_services
for select
to anon, authenticated
using (true);

alter table public.pl_reservationservices enable row level security;

drop policy if exists "reservationservices_select_own" on public.pl_reservationservices;
create policy "reservationservices_select_own"
on public.pl_reservationservices
for select
to authenticated
using (
  exists (
    select 1
    from public.pl_reservations r
    join public.pl_pets p on p.id = r.pet_id
    where r.id = pl_reservationservices.reservation_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "reservationservices_insert_own" on public.pl_reservationservices;
create policy "reservationservices_insert_own"
on public.pl_reservationservices
for insert
to authenticated
with check (
  exists (
    select 1
    from public.pl_reservations r
    join public.pl_pets p on p.id = r.pet_id
    where r.id = pl_reservationservices.reservation_id
      and p.owner_id = auth.uid()
  )
);

-- Mascotas del usuario autenticado (necesario para crear reserva)
alter table public.pl_pets enable row level security;

drop policy if exists "pets_select_own" on public.pl_pets;
create policy "pets_select_own"
on public.pl_pets
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "pets_insert_own" on public.pl_pets;
create policy "pets_insert_own"
on public.pl_pets
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "pets_update_own" on public.pl_pets;
create policy "pets_update_own"
on public.pl_pets
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "pets_delete_own" on public.pl_pets;
create policy "pets_delete_own"
on public.pl_pets
for delete
to authenticated
using (owner_id = auth.uid());

-- Reservas: solo las que pertenecen al usuario (por la mascota)
alter table public.pl_reservations enable row level security;

drop policy if exists "reservations_select_own" on public.pl_reservations;
create policy "reservations_select_own"
on public.pl_reservations
for select
to authenticated
using (
  exists (
    select 1
    from public.pl_pets p
    where p.id = pl_reservations.pet_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "reservations_insert_own" on public.pl_reservations;
create policy "reservations_insert_own"
on public.pl_reservations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.pl_pets p
    where p.id = pl_reservations.pet_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "reservations_update_own" on public.pl_reservations;
create policy "reservations_update_own"
on public.pl_reservations
for update
to authenticated
using (
  exists (
    select 1
    from public.pl_pets p
    where p.id = pl_reservations.pet_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.pl_pets p
    where p.id = pl_reservations.pet_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "reservations_delete_own" on public.pl_reservations;
create policy "reservations_delete_own"
on public.pl_reservations
for delete
to authenticated
using (
  exists (
    select 1
    from public.pl_pets p
    where p.id = pl_reservations.pet_id
      and p.owner_id = auth.uid()
  )
);

-- Tipos de mascota
ALTER TABLE pl_pettypes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to pettypes" ON pl_pettypes;

CREATE POLICY "Allow public read access to pettypes"
ON pl_pettypes
FOR SELECT
USING (true);

GRANT SELECT ON pl_pettypes TO authenticated;

commit;

