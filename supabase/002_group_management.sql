-- Movie Night: group ownership, leaving, deleting and member management.
-- Run this once in the Supabase dashboard (SQL Editor -> New query -> paste -> Run), after 001_groups.sql.

-- ─── Owner column ──────────────────────────────────────────────────────────
alter table public.groups
  add column owner_id uuid default auth.uid() references public.profiles (id);

update public.groups g
set owner_id = coalesce(
  (select m.user_id from public.group_members m where m.group_id = g.id and m.user_id = g.created_by),
  (select m.user_id from public.group_members m where m.group_id = g.id order by m.joined_at, m.user_id limit 1)
);

delete from public.groups g
where not exists (select 1 from public.group_members m where m.group_id = g.id);

alter table public.groups alter column owner_id set not null;

-- ─── Changes now only go through the functions below ───────────────────────
drop policy "Creator can rename the group" on public.groups;
drop policy "Creator can delete the group" on public.groups;
drop policy "Members can leave a group" on public.group_members;

revoke update, delete on public.groups from authenticated;
revoke delete on public.group_members from authenticated;

-- ─── Helpers ───────────────────────────────────────────────────────────────
create or replace function public.require_group_owner(target_group uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.';
  end if;
  if not exists (select 1 from public.groups where id = target_group and owner_id = auth.uid()) then
    raise exception 'Only the owner of this group can do that.';
  end if;
end;
$$;

-- ─── Creating a group now also sets the owner ──────────────────────────────
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

  insert into public.groups (name, invite_code, created_by, owner_id)
  values (trim(group_name), public.generate_invite_code(), auth.uid(), auth.uid())
  returning * into new_group;

  insert into public.group_members (group_id, user_id)
  values (new_group.id, auth.uid());

  return new_group;
end;
$$;

-- ─── Leaving ───────────────────────────────────────────────────────────────
-- Last member: the group is deleted. Owner: ownership moves to the member who joined earliest.
create or replace function public.leave_group(target_group uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_owner uuid;
  next_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.';
  end if;

  select owner_id into current_owner
  from public.groups
  where id = target_group
  for update;

  if not found or not public.is_group_member(target_group) then
    raise exception 'You are not a member of this group.';
  end if;

  delete from public.group_members
  where group_id = target_group and user_id = auth.uid();

  select user_id into next_owner
  from public.group_members
  where group_id = target_group
  order by joined_at, user_id
  limit 1;

  if next_owner is null then
    delete from public.groups where id = target_group;
  elsif current_owner = auth.uid() then
    update public.groups set owner_id = next_owner where id = target_group;
  end if;
end;
$$;

-- ─── Owner actions ─────────────────────────────────────────────────────────
create or replace function public.delete_group(target_group uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_group_owner(target_group);
  delete from public.groups where id = target_group;
end;
$$;

create or replace function public.rename_group(target_group uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_group_owner(target_group);
  if char_length(trim(new_name)) not between 1 and 60 then
    raise exception 'Group names need 1 to 60 characters.';
  end if;
  update public.groups set name = trim(new_name) where id = target_group;
end;
$$;

create or replace function public.transfer_ownership(target_group uuid, new_owner uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_group_owner(target_group);
  if not exists (select 1 from public.group_members where group_id = target_group and user_id = new_owner) then
    raise exception 'That person is not a member of this group.';
  end if;
  update public.groups set owner_id = new_owner where id = target_group;
end;
$$;

create or replace function public.remove_member(target_group uuid, member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_group_owner(target_group);
  if member_id = auth.uid() then
    raise exception 'Use Leave group to remove yourself.';
  end if;
  delete from public.group_members where group_id = target_group and user_id = member_id;
end;
$$;

create or replace function public.new_invite_code(target_group uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  code text;
begin
  perform public.require_group_owner(target_group);
  code := public.generate_invite_code();
  update public.groups set invite_code = code where id = target_group;
  return code;
end;
$$;

-- ─── Permissions ───────────────────────────────────────────────────────────
revoke execute on function public.require_group_owner(uuid) from public, anon, authenticated;

revoke execute on function public.leave_group(uuid) from public, anon;
revoke execute on function public.delete_group(uuid) from public, anon;
revoke execute on function public.rename_group(uuid, text) from public, anon;
revoke execute on function public.transfer_ownership(uuid, uuid) from public, anon;
revoke execute on function public.remove_member(uuid, uuid) from public, anon;
revoke execute on function public.new_invite_code(uuid) from public, anon;

grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.delete_group(uuid) to authenticated;
grant execute on function public.rename_group(uuid, text) to authenticated;
grant execute on function public.transfer_ownership(uuid, uuid) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;
grant execute on function public.new_invite_code(uuid) to authenticated;
