-- Monitoreo de uso (cuándo se conectan y cuánto tiempo practican) y precertámenes.

-- Una fila por página vista con sesión iniciada; el navegador manda un "latido" cada minuto
-- mientras la pestaña está visible y hay actividad. El trigger fija la hora del servidor y
-- no deja que el tiempo activo crezca más que el tiempo real transcurrido.
create table public.econ_sesiones (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.econ_perfiles (id) on delete cascade,
  pagina text not null check (length(pagina) between 1 and 120),
  bloque smallint check (bloque in (1, 2, 3)),
  inicio timestamptz not null default now(),
  ultimo timestamptz not null default now(),
  activo_seg integer not null default 0 check (activo_seg between 0 and 21600)
);
create index econ_sesiones_user_inicio_idx on public.econ_sesiones (user_id, inicio);
create index econ_sesiones_inicio_idx on public.econ_sesiones (inicio);

create or replace function private.econ_sesion_latido()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.id := old.id; new.user_id := old.user_id; new.pagina := old.pagina; new.bloque := old.bloque; new.inicio := old.inicio;
  new.ultimo := now();
  new.activo_seg := greatest(old.activo_seg,
    least(new.activo_seg, old.activo_seg + ceil(extract(epoch from (now() - old.ultimo)))::int + 15, 21600));
  return new;
end
$$;
create trigger econ_sesiones_latido before update on public.econ_sesiones
  for each row execute function private.econ_sesion_latido();

alter table public.econ_sesiones enable row level security;
revoke all on public.econ_sesiones from anon, authenticated;
grant select on public.econ_sesiones to authenticated;
grant insert (pagina, bloque) on public.econ_sesiones to authenticated;
grant update (activo_seg) on public.econ_sesiones to authenticated;

create policy "sesiones propias o docente" on public.econ_sesiones
  for select to authenticated using (user_id = (select auth.uid()) or (select private.es_docente()));
create policy "insertar sesiones propias" on public.econ_sesiones
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "latido de sesiones propias" on public.econ_sesiones
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Precertámenes: un registro por intento terminado. "puntos" es el bono que suma al progreso.
create table public.econ_simulacros (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.econ_perfiles (id) on delete cascade,
  bloque smallint not null check (bloque in (1, 2, 3)),
  modo text not null check (modo in ('rapido', 'estandar', 'completo')),
  inicio timestamptz not null,
  fin timestamptz not null default now(),
  limite_min smallint not null check (limite_min between 5 and 120),
  preguntas smallint not null check (preguntas between 1 and 60),
  correctas smallint not null check (correctas between 0 and 60),
  logro numeric(5, 1) not null check (logro between 0 and 100),
  puntos smallint not null check (puntos between 0 and 200),
  detalle jsonb not null default '{}'::jsonb check (pg_column_size(detalle) < 16000),
  check (correctas <= preguntas),
  check (puntos <= 2 * correctas + 10),
  check (inicio <= fin and fin - inicio <= interval '3 hours')
);
create index econ_simulacros_user_idx on public.econ_simulacros (user_id, fin);

alter table public.econ_simulacros enable row level security;
revoke all on public.econ_simulacros from anon, authenticated;
grant select on public.econ_simulacros to authenticated;
grant insert (bloque, modo, inicio, limite_min, preguntas, correctas, logro, puntos, detalle) on public.econ_simulacros to authenticated;

create policy "simulacros propios o docente" on public.econ_simulacros
  for select to authenticated using (user_id = (select auth.uid()) or (select private.es_docente()));
create policy "insertar simulacros propios" on public.econ_simulacros
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Conexiones por estudiante (security invoker: el docente ve a todos, cada estudiante solo a sí mismo).
create or replace function public.econ_conexiones()
returns table (id uuid, sesiones int, minutos int, minutos7 int, ultima timestamptz, dias int, simulacros int, mejor_logro numeric)
language sql stable security invoker set search_path = ''
as $$
  select p.id,
    (select count(*) from public.econ_sesiones s where s.user_id = p.id)::int,
    ((select coalesce(sum(s.activo_seg), 0) from public.econ_sesiones s where s.user_id = p.id) / 60)::int,
    ((select coalesce(sum(s.activo_seg), 0) from public.econ_sesiones s where s.user_id = p.id and s.inicio > now() - interval '7 days') / 60)::int,
    (select max(s.ultimo) from public.econ_sesiones s where s.user_id = p.id),
    (select count(distinct (s.inicio at time zone 'America/Santiago')::date) from public.econ_sesiones s where s.user_id = p.id)::int,
    (select count(*) from public.econ_simulacros m where m.user_id = p.id)::int,
    (select max(m.logro) from public.econ_simulacros m where m.user_id = p.id)
  from public.econ_perfiles p
$$;
revoke all on function public.econ_conexiones() from public, anon;
grant execute on function public.econ_conexiones() to authenticated;

-- Horario de conexión (día de la semana × hora, hora de Chile) en los últimos `dias` días, sin quien consulta.
create or replace function public.econ_horario(dias int default 28)
returns table (dow int, hora int, estudiantes int, minutos int)
language sql stable security invoker set search_path = ''
as $$
  select extract(isodow from s.inicio at time zone 'America/Santiago')::int,
    extract(hour from s.inicio at time zone 'America/Santiago')::int,
    count(distinct s.user_id)::int, (sum(s.activo_seg) / 60)::int
  from public.econ_sesiones s
  where s.inicio > now() - make_interval(days => least(greatest(dias, 7), 180)) and s.user_id <> (select auth.uid())
  group by 1, 2
$$;
revoke all on function public.econ_horario(int) from public, anon;
grant execute on function public.econ_horario(int) to authenticated;

-- Minutos activos y estudiantes conectados por día.
create or replace function public.econ_minutos(dias int default 42)
returns table (dia date, estudiantes int, minutos int, sesiones int)
language sql stable security invoker set search_path = ''
as $$
  select g.dia::date, count(distinct s.user_id)::int, (coalesce(sum(s.activo_seg), 0) / 60)::int, count(s.id)::int
  from generate_series(((now() at time zone 'America/Santiago')::date - (least(greatest(dias, 7), 180) - 1)),
                       (now() at time zone 'America/Santiago')::date, interval '1 day') as g(dia)
  left join public.econ_sesiones s
    on (s.inicio at time zone 'America/Santiago')::date = g.dia::date and s.user_id <> (select auth.uid())
  group by g.dia
  order by g.dia
$$;
revoke all on function public.econ_minutos(int) from public, anon;
grant execute on function public.econ_minutos(int) to authenticated;

-- Páginas más visitadas (clases y prácticas) en los últimos `dias` días.
create or replace function public.econ_paginas(dias int default 28)
returns table (pagina text, visitas int, estudiantes int, minutos int)
language sql stable security invoker set search_path = ''
as $$
  select s.pagina, count(*)::int, count(distinct s.user_id)::int, (sum(s.activo_seg) / 60)::int
  from public.econ_sesiones s
  where s.inicio > now() - make_interval(days => least(greatest(dias, 7), 180)) and s.user_id <> (select auth.uid())
  group by 1
  order by 2 desc
  limit 60
$$;
revoke all on function public.econ_paginas(int) from public, anon;
grant execute on function public.econ_paginas(int) to authenticated;
