
-- El proyecto trae public.rls_auto_enable() (disparador de eventos) expuesto por RPC; no debe ser invocable desde la API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
