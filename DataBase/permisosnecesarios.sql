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
grant select on table public.pl_pets to authenticated;
grant select on table public.pl_services to anon, authenticated;
grant select, insert on table public.pl_reservationservices to authenticated;

-- Reservas: la app lee/crea/actualiza/elimina (controlado por RLS abajo)
grant select, insert, update, delete on table public.pl_reservations to authenticated;

-- Si existen secuencias por serial (rooms)
grant usage, select on all sequences in schema public to anon, authenticated;

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

commit;

