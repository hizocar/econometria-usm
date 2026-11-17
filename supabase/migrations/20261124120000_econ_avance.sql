-- Tercer bloque, tema de cada respuesta y funciones para el panel /admin (avance en el tiempo y por tema).

alter table public.econ_respuestas add column if not exists tema text check (tema is null or length(tema) between 1 and 30);

-- Resumen por estudiante con el bloque 3 (nombre nuevo: econ_resumen() queda sin uso). Security invoker: RLS decide qué filas ve cada quien.
create or replace function public.econ_resumen3()
returns table (
  id uuid, email text, nombre text, apellido text, registrado timestamptz, ultima timestamptz,
  resp_b1 int, ok_b1 int, pts_b1 int, resp_b2 int, ok_b2 int, pts_b2 int, resp_b3 int, ok_b3 int, pts_b3 int,
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
    (count(r.id) filter (where r.bloque = 3 and r.tipo <> 'solucion'))::int,
    (count(r.id) filter (where r.bloque = 3 and r.correcta))::int,
    coalesce(sum(r.puntos) filter (where r.bloque = 3), 0)::int,
    (count(r.id) filter (where r.tipo = 'solucion'))::int,
    (count(r.id) filter (where r.creado > now() - interval '7 days'))::int,
    (count(distinct (r.creado at time zone 'America/Santiago')::date))::int
  from public.econ_perfiles p
  left join public.econ_respuestas r on r.user_id = p.id
  group by p.id
  order by p.apellido, p.nombre
$$;
revoke all on function public.econ_resumen3() from public, anon;
grant execute on function public.econ_resumen3() to authenticated;

-- Actividad diaria de los últimos `dias` días (hora de Chile), sin contar a quien consulta.
create or replace function public.econ_actividad(dias int default 42)
returns table (dia date, estudiantes int, respuestas int, aciertos int)
language sql stable security invoker set search_path = ''
as $$
  select g.dia::date,
    (count(distinct r.user_id))::int, (count(r.id))::int, (count(r.id) filter (where r.correcta))::int
  from generate_series(((now() at time zone 'America/Santiago')::date - (least(greatest(dias, 7), 180) - 1)),
                       (now() at time zone 'America/Santiago')::date, interval '1 day') as g(dia)
  left join public.econ_respuestas r
    on (r.creado at time zone 'America/Santiago')::date = g.dia::date and r.user_id <> (select auth.uid())
  group by g.dia
  order by g.dia
$$;
revoke all on function public.econ_actividad(int) from public, anon;
grant execute on function public.econ_actividad(int) to authenticated;

-- Avance por estudiante y tema: una fila por estudiante, con un objeto {"bloque:tema": [respuestas, aciertos, puntos]}.
-- (Una fila por estudiante evita el tope de filas de la API aunque haya muchos temas.)
create or replace function public.econ_avance()
returns table (id uuid, temas jsonb, semanas jsonb)
language sql stable security invoker set search_path = ''
as $$
  with t as (
    select r.user_id, r.bloque || ':' || coalesce(r.tema, '?') as clave,
      count(*) filter (where r.tipo <> 'solucion') as n, count(*) filter (where r.correcta) as ok, sum(r.puntos) as pts
    from public.econ_respuestas r group by 1, 2
  ), s as (
    select r.user_id, to_char(date_trunc('week', r.creado at time zone 'America/Santiago'), 'YYYY-MM-DD') as semana, count(*) as n
    from public.econ_respuestas r group by 1, 2
  )
  select p.id,
    coalesce((select jsonb_object_agg(t.clave, jsonb_build_array(t.n, t.ok, t.pts)) from t where t.user_id = p.id), '{}'::jsonb),
    coalesce((select jsonb_object_agg(s.semana, s.n) from s where s.user_id = p.id), '{}'::jsonb)
  from public.econ_perfiles p
$$;
revoke all on function public.econ_avance() from public, anon;
grant execute on function public.econ_avance() to authenticated;

-- (migración aparte) permitir el bloque 3
alter table public.econ_respuestas drop constraint econ_respuestas_bloque_check;
alter table public.econ_respuestas add constraint econ_respuestas_bloque_check check (bloque in (1, 2, 3));
