-- Cuentas de la Práctica: perfiles de estudiantes, respuestas y rol docente.
-- Proyecto Supabase dedicado al curso (no compartir con otras apps: "authenticated" = estudiante del curso).

create schema if not exists private;

-- Perfiles: los crea la Edge Function "registro" (clave secreta). Los usuarios no pueden escribirlos.
create table public.econ_perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (email = lower(email)),
  nombre text not null check (length(nombre) between 1 and 60),
  apellido text not null check (length(apellido) between 1 and 60),
  creado timestamptz not null default now()
);

-- Respuestas: solo el primer intento de cada pregunta (unique por usuario, bloque e ítem).
create table public.econ_respuestas (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.econ_perfiles (id) on delete cascade,
  bloque smallint not null check (bloque in (1, 2)),
  tipo text not null check (tipo in ('comente', 'ejercicio', 'solucion')),
  item text not null check (length(item) between 1 and 40),
  correcta boolean not null,
  puntos smallint not null check (puntos between 0 and 300),
  creado timestamptz not null default now(),
  unique (user_id, bloque, item)
);
create index econ_respuestas_creado_idx on public.econ_respuestas (creado);

-- Docentes: ligados a un user_id concreto (no a un correo que cualquiera podría registrar).
create table private.docentes (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function private.es_docente()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from private.docentes d where d.user_id = (select auth.uid())) $$;
revoke all on function private.es_docente() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.es_docente() to authenticated;

alter table public.econ_perfiles enable row level security;
alter table public.econ_respuestas enable row level security;

revoke all on public.econ_perfiles, public.econ_respuestas from anon, authenticated;
grant select on public.econ_perfiles to authenticated;
grant select, insert on public.econ_respuestas to authenticated;

create policy "perfil propio o docente" on public.econ_perfiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.es_docente()));

create policy "respuestas propias o docente" on public.econ_respuestas
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.es_docente()));

create policy "insertar solo respuestas propias" on public.econ_respuestas
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- ¿Soy docente? (para la página del panel y la Edge Function "docente")
create or replace function public.econ_soy_docente()
returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.es_docente() $$;
revoke all on function public.econ_soy_docente() from public, anon;
grant execute on function public.econ_soy_docente() to authenticated;

-- Resumen por estudiante, agregado en el servidor (security invoker: aplica RLS;
-- un estudiante solo ve su fila, el docente ve a todos).
create or replace function public.econ_resumen()
returns table (
  id uuid, email text, nombre text, apellido text, registrado timestamptz, ultima timestamptz,
  resp_b1 int, ok_b1 int, pts_b1 int, resp_b2 int, ok_b2 int, pts_b2 int,
  soluciones int, ultimos7 int, dias_activos int
)
language sql stable security invoker set search_path = ''
as $$
  select p.id, p.email, p.nombre, p.apellido, p.creado, max(r.creado),
    (count(r.id) filter (where r.bloque = 1 and r.tipo <> 'solucion'))::int,
    (count(r.id) filter (where r.bloque = 1 and r.correcta))::int,
    coalesce(sum(r.puntos) filter (where r.bloque = 1), 0)::int,
    (count(r.id) filter (where r.bloque = 2 and r.tipo <> 'solucion'))::int,
    (count(r.id) filter (where r.bloque = 2 and r.correcta))::int,
    coalesce(sum(r.puntos) filter (where r.bloque = 2), 0)::int,
    (count(r.id) filter (where r.tipo = 'solucion'))::int,
    (count(r.id) filter (where r.creado > now() - interval '7 days'))::int,
    (count(distinct (r.creado at time zone 'America/Santiago')::date))::int
  from public.econ_perfiles p
  left join public.econ_respuestas r on r.user_id = p.id
  group by p.id
  order by p.apellido, p.nombre
$$;
revoke all on function public.econ_resumen() from public, anon;
grant execute on function public.econ_resumen() to authenticated;
