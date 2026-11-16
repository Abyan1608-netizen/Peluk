create table if not exists public.peluk_sync (
  id text primary key check (char_length(id) between 32 and 128),
  data text not null check (char_length(data) <= 4000000),
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.peluk_sync enable row level security;

create or replace function public.get_blob(p_id text)
returns table(blob text, ver bigint)
language sql security definer set search_path = public as $$
  select data, version from public.peluk_sync where id = p_id;
$$;

create or replace function public.put_blob(p_id text, p_data text, p_expected bigint)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if p_expected = 0 then
    insert into public.peluk_sync(id, data, version) values (p_id, p_data, 1)
    on conflict do nothing returning version into v;
  else
    update public.peluk_sync set data = p_data, version = version + 1, updated_at = now()
    where id = p_id and version = p_expected returning version into v;
  end if;
  return coalesce(v, -1);
end $$;

revoke all on function public.get_blob(text) from public;
revoke all on function public.put_blob(text, text, bigint) from public;
grant execute on function public.get_blob(text) to anon, authenticated;
grant execute on function public.put_blob(text, text, bigint) to anon, authenticated;
