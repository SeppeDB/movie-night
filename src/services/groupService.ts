import { supabase } from './api';
import type { Group, GroupDetails } from '../types/Group';

// Shapes of the rows Supabase returns for the selects below
interface GroupRow {
  id: string;
  name: string;
  invite_code: string;
  group_members: { count: number }[];
}

interface GroupDetailsRow {
  id: string;
  name: string;
  invite_code: string;
  group_members: { user_id: string; joined_at: string; profiles: { name: string } | null }[];
}

interface CreatedGroupRow {
  id: string;
  name: string;
  invite_code: string;
}

export async function getMyGroups(): Promise<Group[]> {
  // RLS only returns groups the current user is a member of
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, group_members(count)')
    .order('created_at', { ascending: false });
  if (error !== null) throw new Error(error.message);

  return (data as GroupRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    memberCount: row.group_members[0]?.count ?? 0,
  }));
}

export async function getGroup(id: string): Promise<GroupDetails> {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, group_members(user_id, joined_at, profiles(name))')
    .eq('id', id)
    .single();
  if (error !== null) throw new Error('This group does not exist, or you are not a member.');

  const row = data as unknown as GroupDetailsRow;
  const members = [...row.group_members]
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map((member) => ({ id: member.user_id, name: member.profiles?.name ?? 'Unknown' }));

  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    memberCount: members.length,
    members,
  };
}

export async function createGroup(name: string): Promise<Group> {
  const { data, error } = await supabase.rpc('create_group', { group_name: name });
  if (error !== null) throw new Error(error.message);
  const row = data as CreatedGroupRow;
  return { id: row.id, name: row.name, inviteCode: row.invite_code, memberCount: 1 };
}

export async function joinGroup(code: string): Promise<Group> {
  const { data, error } = await supabase.rpc('join_group', { code });
  if (error !== null) throw new Error(error.message);
  const row = data as CreatedGroupRow;
  // The member count isn't known from the join itself; the list reloads it
  return { id: row.id, name: row.name, inviteCode: row.invite_code, memberCount: 0 };
}

export async function leaveGroup(groupId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (userId === undefined) throw new Error('You need to be logged in.');

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error !== null) throw new Error(error.message);
}
