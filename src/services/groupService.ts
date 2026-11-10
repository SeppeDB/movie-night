import { supabase } from './api';
import type { Group, GroupDetails } from '../types/Group';

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
  owner_id: string;
  group_members: { user_id: string; joined_at: string; profiles: { name: string } | null }[];
}

interface CreatedGroupRow {
  id: string;
  name: string;
  invite_code: string;
}

export async function getMyGroups(): Promise<Group[]> {
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
    .select('id, name, invite_code, owner_id, group_members(user_id, joined_at, profiles(name))')
    .eq('id', id)
    .single();
  if (error !== null) throw new Error('This group does not exist, or you are not a member.');

  const row = data as unknown as GroupDetailsRow;
  const members = [...row.group_members]
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map((member) => ({ id: member.user_id, name: member.profiles?.name ?? 'Unknown', joinedAt: member.joined_at }));

  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    ownerId: row.owner_id,
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
  return { id: row.id, name: row.name, inviteCode: row.invite_code, memberCount: 0 };
}

async function callGroupFunction(name: string, args: Record<string, string>): Promise<unknown> {
  const { data, error } = await supabase.rpc(name, args);
  if (error !== null) throw new Error(error.message);
  return data;
}

export async function leaveGroup(groupId: string): Promise<void> {
  await callGroupFunction('leave_group', { target_group: groupId });
}

export async function deleteGroup(groupId: string): Promise<void> {
  await callGroupFunction('delete_group', { target_group: groupId });
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  await callGroupFunction('rename_group', { target_group: groupId, new_name: name });
}

export async function transferOwnership(groupId: string, newOwnerId: string): Promise<void> {
  await callGroupFunction('transfer_ownership', { target_group: groupId, new_owner: newOwnerId });
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  await callGroupFunction('remove_member', { target_group: groupId, member_id: memberId });
}

export async function newInviteCode(groupId: string): Promise<string> {
  return (await callGroupFunction('new_invite_code', { target_group: groupId })) as string;
}
