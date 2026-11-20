-- Quiz de fin de clase: preguntas con pauta guardadas solo en la base (nunca en el sitio público).
-- Los estudiantes no leen estas tablas directamente: la Edge Function "quiz" (clave secreta) entrega
-- las preguntas sin respuestas mientras el quiz está abierto, controla el tiempo y corrige.

create table public.econ_quizzes (
  id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'),
  titulo text not null check (length(titulo) between 1 and 120),
  clase smallint,
  duracion_min smallint not null default 20 check (duracion_min between 5 and 120),
  abierto boolean not null default false,
  abierto_en timestamptz,
  cerrado_en timestamptz,
  preguntas jsonb not null,
  creado timestamptz not null default now()
);

create table public.econ_quiz_intentos (
  id bigint generated always as identity primary key,
  quiz_id text not null references public.econ_quizzes (id) on delete cascade,
  user_id uuid not null references public.econ_perfiles (id) on delete cascade,
  inicio timestamptz not null default now(),
  limite timestamptz not null,
  entregado timestamptz,
  orden jsonb not null,
  respuestas jsonb,
  correctas smallint,
  total smallint,
  logro numeric(5, 1),
  fuera_de_tiempo boolean not null default false,
  detalle jsonb,
  unique (quiz_id, user_id)
);
create index econ_quiz_intentos_quiz_idx on public.econ_quiz_intentos (quiz_id);

alter table public.econ_quizzes enable row level security;
alter table public.econ_quiz_intentos enable row level security;
revoke all on public.econ_quizzes, public.econ_quiz_intentos from anon, authenticated;

-- Quizzes: solo el docente los ve (incluyen la pauta) y solo puede abrirlos o cerrarlos.
grant select on public.econ_quizzes to authenticated;
grant update (abierto, abierto_en, cerrado_en) on public.econ_quizzes to authenticated;
create policy "quizzes: solo docente" on public.econ_quizzes
  for select to authenticated using ((select private.es_docente()));
create policy "quizzes: docente abre y cierra" on public.econ_quizzes
  for update to authenticated using ((select private.es_docente())) with check ((select private.es_docente()));

-- Intentos: cada estudiante ve el suyo, el docente ve todos y puede borrar uno para permitir repetir.
-- Nadie los crea ni modifica desde el navegador: solo la Edge Function.
grant select, delete on public.econ_quiz_intentos to authenticated;
create policy "intentos propios o docente" on public.econ_quiz_intentos
  for select to authenticated using (user_id = (select auth.uid()) or (select private.es_docente()));
create policy "docente permite repetir" on public.econ_quiz_intentos
  for delete to authenticated using ((select private.es_docente()));
