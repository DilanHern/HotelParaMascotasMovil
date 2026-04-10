-- =========================================================
-- Bucket: pet-profile-pictures
-- Ruta esperada del objeto: ownerId/petId/randomInt/image_name
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-profile-pictures',
  'pet-profile-pictures',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/jpg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Publico puede leer la imagen de perfil.
drop policy if exists "Public can read pet profile pictures" on storage.objects;
create policy "Public can read pet profile pictures"
on storage.objects
for select
to public
using (bucket_id = 'pet-profile-pictures');

-- Solo el owner autenticado puede insertar en su ruta ownerId/petId/*.
drop policy if exists "Owners can upload pet profile pictures" on storage.objects;
create policy "Owners can upload pet profile pictures"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'pet-profile-pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Solo el owner autenticado puede actualizar su propio archivo.
drop policy if exists "Owners can update pet profile pictures" on storage.objects;
create policy "Owners can update pet profile pictures"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'pet-profile-pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'pet-profile-pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Solo el owner autenticado puede borrar su propio archivo.
drop policy if exists "Owners can delete pet profile pictures" on storage.objects;
create policy "Owners can delete pet profile pictures"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'pet-profile-pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================
-- RLS para actualizacion de profile_picture_url en pl_pets
-- =========================================================

alter table public.pl_pets enable row level security;

drop policy if exists "Owners can select own pets" on public.pl_pets;
create policy "Owners can select own pets"
on public.pl_pets
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Owners can update own pets" on public.pl_pets;
create policy "Owners can update own pets"
on public.pl_pets
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Permisos SQL para que PostgREST pueda hacer SELECT/UPDATE bajo RLS.
grant usage on schema public to authenticated;
grant select, update on table public.pl_pets to authenticated;

-- =========================================================
-- Catalogo base de estados de reserva
-- =========================================================

insert into public.pl_reservationstatus (name)
select 'Pendiente'
where not exists (
  select 1 from public.pl_reservationstatus where name = 'Pendiente'
);

insert into public.pl_reservationstatus (name)
select 'Confirmada'
where not exists (
  select 1 from public.pl_reservationstatus where name = 'Confirmada'
);

insert into public.pl_reservationstatus (name)
select 'En curso'
where not exists (
  select 1 from public.pl_reservationstatus where name = 'En curso'
);

insert into public.pl_reservationstatus (name)
select 'Completada'
where not exists (
  select 1 from public.pl_reservationstatus where name = 'Completada'
);

-- =========================================================
-- Catalogo base de tipos de hospedaje
-- =========================================================

insert into public.pl_lodgingtypes (type)
select 'Estandar'
where not exists (
  select 1 from public.pl_lodgingtypes where lower(type) = 'estandar'
);

insert into public.pl_lodgingtypes (type)
select 'Especial'
where not exists (
  select 1 from public.pl_lodgingtypes where lower(type) = 'especial'
);

-- =========================================================
-- Catalogo base de servicios (para hospedaje especial)
-- =========================================================

insert into public.pl_services (name)
select 'Bano'
where not exists (
  select 1 from public.pl_services where lower(name) = 'bano'
);

insert into public.pl_services (name)
select 'Paseo'
where not exists (
  select 1 from public.pl_services where lower(name) = 'paseo'
);

insert into public.pl_services (name)
select 'Comida especial'
where not exists (
  select 1 from public.pl_services where lower(name) = 'comida especial'
);

insert into public.pl_services (name)
select 'Juegos'
where not exists (
  select 1 from public.pl_services where lower(name) = 'juegos'
);

insert into public.pl_services (name)
select 'Cuidado veterinario'
where not exists (
  select 1 from public.pl_services where lower(name) = 'cuidado veterinario'
);
