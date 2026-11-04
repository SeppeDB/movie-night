-- Movie Night: profiles, groups and group membership.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ─── Profiles ──────────────────────────────────────────────────────────────
-- Public display names, so group members can see each other.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Create a profile automatically for every new sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Movie fan'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for accounts that already exist
insert into public.profiles (id, name)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(email, '@', 1), ''),
    'Movie fan'
  )
from auth.users
on conflict (id) do nothing;

-- ─── Groups and members ────────────────────────────────────────────────────
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  invite_code text not null unique,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  -- References profiles (not auth.users) so the API can embed member names
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_id_idx on public.group_members (user_id);

-- Runs without RLS, so policies on group_members can use it without recursing into themselves
create or replace function public.is_group_member(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group
      and user_id = auth.uid()
  );
$$;

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "Read own profile and fellow members' profiles"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members mine
      join public.group_members theirs on theirs.group_id = mine.group_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
  );

create policy "Update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Members can read their groups"
  on public.groups for select to authenticated
  using (public.is_group_member(id));

create policy "Creator can rename the group"
  on public.groups for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creator can delete the group"
  on public.groups for delete to authenticated
  using (created_by = auth.uid());

create policy "Members can see who else is in the group"
  on public.group_members for select to authenticated
  using (public.is_group_member(group_id));

create policy "Members can leave a group"
  on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- No insert policies on groups/group_members: creating and joining only happen
-- through the create_group and join_group functions below.

grant select, update on public.profiles to authenticated;
grant select, update, delete on public.groups to authenticated;
grant select, delete on public.group_members to authenticated;

-- ─── Functions the app calls ───────────────────────────────────────────────
-- 6-character code without look-alike characters (no 0/O, 1/I/L)
create or replace function public.generate_invite_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  new_code text;
begin
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.groups where invite_code = new_code);
  end loop;
  return new_code;
end;
$$;

create or replace function public.create_group(group_name text)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group public.groups;
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.';
  end if;

  insert into public.groups (name, invite_code, created_by)
  values (trim(group_name), public.generate_invite_code(), auth.uid())
  returning * into new_group;

  insert into public.group_members (group_id, user_id)
  values (new_group.id, auth.uid());

  return new_group;
end;
$$;

-- Looks up a group by code; needs security definer because RLS hides groups you're not in yet
create or replace function public.join_group(code text)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.groups;
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.';
  end if;

  select * into target
  from public.groups
  where invite_code = upper(trim(code));

  if not found then
    raise exception 'No group found with code %.', upper(trim(code));
  end if;

  insert into public.group_members (group_id, user_id)
  values (target.id, auth.uid())
  on conflict do nothing;

  return target;
end;
$$;

-- Only logged-in users may call the app functions; the helpers stay internal
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.generate_invite_code() from public, anon, authenticated;
revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.create_group(text) from public, anon;
revoke execute on function public.join_group(text) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.create_group(text) to authenticated;
grant execute on function public.join_group(text) to authenticated;
