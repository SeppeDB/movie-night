import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  deleteGroup,
  getGroup,
  leaveGroup,
  newInviteCode,
  removeMember,
  renameGroup,
  transferOwnership,
} from '../../../src/services/groupService';
import { useAuthStore } from '../../../src/state/useAuthStore';
import type { GroupDetails, GroupMember } from '../../../src/types/Group';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Icon } from '../../../src/components/primitives/Icon';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { Avatar } from '../../../src/components/primitives/Avatar';
import { InputField } from '../../../src/components/primitives/InputField';
import { Menu } from '../../../src/components/primitives/Menu';
import { Toast } from '../../../src/components/primitives/Toast';
import { AppBar } from '../../../src/components/AppBar';
import { IconButton } from '../../../src/components/IconButton';
import { Dialog } from '../../../src/components/Dialog';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { SheetOption } from '../../../src/components/SheetOption';
import { StyledButton } from '../../../src/components/StyledButton';
import { colors, layout, spacing } from '../../../src/theme';

type Sheet = 'none' | 'invite' | 'rename' | 'member';
type Confirm = 'none' | 'leave' | 'delete' | 'transfer' | 'remove';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [confirm, setConfirm] = useState<Confirm>('none');
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState('');
  const [codeRenewed, setCodeRenewed] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setGroup(await getGroup(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this group.');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => () => {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  const isOwner = group !== null && group.ownerId === currentUserId;
  const otherMembers = group?.members.filter((member) => member.id !== currentUserId) ?? [];
  const nextOwner = otherMembers[0];

  const openInvite = () => {
    setCodeRenewed(false);
    setSheet('invite');
  };

  const openRename = () => {
    setNewName(group?.name ?? '');
    setRenameError('');
    setSheet('rename');
  };

  const openMember = (member: GroupMember) => {
    setSelectedMember(member);
    setSheet('member');
  };

  const askConfirm = (next: Confirm) => {
    setSheet('none');
    setConfirm(next);
  };

  const shareInvite = async () => {
    if (group === null) return;
    const url = typeof window !== 'undefined' ? `${window.location.href.split('/group/')[0]}/` : '';
    const message = `Join "${group.name}" on Movie Night with code ${group.inviteCode}`;
    try {
      await Share.share({ title: 'Movie Night', message, url });
      setSheet('none');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setSheet('none');
      try {
        await navigator.clipboard.writeText(`${message}\n${url}`);
        showToast('Invite copied to clipboard');
      } catch {
        showToast(`Invite code: ${group.inviteCode}`);
      }
    }
  };

  const handleNewCode = async () => {
    if (group === null) return;
    setIsBusy(true);
    try {
      const code = await newInviteCode(group.id);
      setGroup({ ...group, inviteCode: code });
      setCodeRenewed(true);
    } catch (e) {
      setSheet('none');
      showToast(e instanceof Error ? e.message : 'Could not make a new code.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRename = async () => {
    if (group === null) return;
    const trimmed = newName.trim();
    if (trimmed === '' || trimmed.length > 60) {
      setRenameError('Group names need 1 to 60 characters.');
      return;
    }
    setIsBusy(true);
    try {
      await renameGroup(group.id, trimmed);
      setGroup({ ...group, name: trimmed });
      setSheet('none');
      showToast('Group renamed');
    } catch (e) {
      setRenameError(e instanceof Error ? e.message : 'Could not rename the group.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (group === null) return;
    setIsBusy(true);
    try {
      if (confirm === 'leave') {
        await leaveGroup(group.id);
        setConfirm('none');
        router.replace('/');
      } else if (confirm === 'delete') {
        await deleteGroup(group.id);
        setConfirm('none');
        router.replace('/');
      } else if (confirm === 'transfer' && selectedMember !== null) {
        await transferOwnership(group.id, selectedMember.id);
        setConfirm('none');
        showToast(`${selectedMember.name} is now the owner`);
        await load();
      } else if (confirm === 'remove' && selectedMember !== null) {
        await removeMember(group.id, selectedMember.id);
        setConfirm('none');
        showToast(`${selectedMember.name} was removed`);
        await load();
      }
    } catch (e) {
      setConfirm('none');
      showToast(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsBusy(false);
    }
  };

  const leaveMessage =
    otherMembers.length === 0
      ? "You're the last member. Leaving deletes the group."
      : isOwner && nextOwner !== undefined
        ? `${nextOwner.name} becomes the owner.`
        : 'You can rejoin later with the invite code.';

  const dialogs: Record<Exclude<Confirm, 'none'>, { title: string; message: string; label: string; danger: boolean }> = {
    leave: { title: `Leave ${group?.name ?? 'group'}?`, message: leaveMessage, label: 'Leave', danger: true },
    delete: { title: `Delete ${group?.name ?? 'group'}?`, message: "This can't be undone.", label: 'Delete', danger: true },
    transfer: {
      title: `Make ${selectedMember?.name ?? 'them'} the owner?`,
      message: "You won't be able to manage this group anymore.",
      label: 'Make owner',
      danger: false,
    },
    remove: {
      title: `Remove ${selectedMember?.name ?? 'member'}?`,
      message: 'They can rejoin with the invite code.',
      label: 'Remove',
      danger: true,
    },
  };
  const dialog = confirm !== 'none' ? dialogs[confirm] : null;

  const menuItems = [
    { label: 'Invite friends', onPress: openInvite },
    ...(isOwner ? [{ label: 'Rename group', onPress: openRename }] : []),
    { label: 'Leave group', variant: 'danger' as const, onPress: () => setConfirm('leave') },
    ...(isOwner ? [{ label: 'Delete group', variant: 'danger' as const, onPress: () => setConfirm('delete') }] : []),
  ];

  return (
    <View style={styles.page}>
      <AppBar
        showBack
        actions={
          group !== null ? (
            <IconButton
              icon="ellipsis-vertical"
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="More options"
              testID="group-menu-button"
            />
          ) : undefined
        }
      />
      <Screen padding="lg">
        <View style={styles.content}>
          {error !== '' ? (
            <Text color={colors.danger}>{error}</Text>
          ) : group === null ? (
            <View style={styles.centered}>
              <Spinner size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <View>
                <Text font="display" style={styles.title} testID="group-title">
                  {group.name}{'⁠'}<Text font="display" style={styles.title} color={colors.primary}>.</Text>
                </Text>
                <View style={styles.rule} />
              </View>

              <Stack gap="sm">
                <Text size="sm" weight="medium" color={colors.textMuted}>
                  {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                </Text>
                <View style={styles.list}>
                  {group.members.map((member) => {
                    const canManage = isOwner && member.id !== currentUserId;
                    return (
                      <Pressable
                        key={member.id}
                        onPress={canManage ? () => openMember(member) : undefined}
                        disabled={!canManage}
                        accessibilityRole={canManage ? 'button' : undefined}
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        testID={`member-${member.id}`}
                      >
                        <Avatar name={member.name} size="sm" />
                        <View style={styles.memberName}>
                          <Text size="lg" numberOfLines={1} style={styles.nameText}>{member.name}</Text>
                          {member.id === group.ownerId && (
                            <MaterialCommunityIcons
                              name="crown"
                              size={18}
                              color={colors.primary}
                              accessibilityLabel="Owner"
                              testID="owner-crown"
                            />
                          )}
                        </View>
                        {member.id === currentUserId && <Text size="sm" color={colors.textMuted}>you</Text>}
                        {canManage && <Icon name="chevron-forward" size={20} color={colors.textMuted} />}
                      </Pressable>
                    );
                  })}
                </View>
              </Stack>
            </>
          )}
        </View>
      </Screen>

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />

      <BottomSheet visible={sheet === 'invite'} onClose={() => setSheet('none')} title="Invite friends">
        <Text font="display" style={styles.code} testID="invite-code">{group?.inviteCode ?? ''}</Text>
        {codeRenewed && <Text size="sm" color={colors.success}>New code made. The old code no longer works.</Text>}
        <Stack gap="sm">
          <StyledButton label="Share invite" onPress={shareInvite} testID="share-button" />
          {isOwner && (
            <StyledButton
              label="Make a new code"
              variant="ghost"
              onPress={handleNewCode}
              isLoading={isBusy}
              testID="new-code-button"
            />
          )}
        </Stack>
      </BottomSheet>

      <BottomSheet visible={sheet === 'rename'} onClose={() => setSheet('none')} title="Rename group">
        <InputField
          label="Group name"
          value={newName}
          onChangeText={setNewName}
          error={renameError !== '' ? renameError : undefined}
          testID="rename-input"
        />
        <StyledButton label="Save" onPress={handleRename} isLoading={isBusy} testID="rename-save-button" />
      </BottomSheet>

      <BottomSheet visible={sheet === 'member'} onClose={() => setSheet('none')} title={selectedMember?.name}>
        <View style={styles.options}>
          <SheetOption
            icon={<MaterialCommunityIcons name="crown-outline" size={26} color={colors.primary} />}
            title="Make owner"
            onPress={() => askConfirm('transfer')}
            testID="make-owner-option"
          />
          <SheetOption
            icon={<Icon name="person-remove-outline" size={26} color={colors.danger} />}
            title="Remove from group"
            variant="danger"
            onPress={() => askConfirm('remove')}
            testID="remove-member-option"
          />
        </View>
      </BottomSheet>

      <Dialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        confirmLabel={dialog?.label ?? ''}
        variant={dialog?.danger === true ? 'danger' : 'default'}
        isLoading={isBusy}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm('none')}
      />

      <Toast visible={toast !== ''} message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.xl + 8,
    paddingBottom: spacing.xl,
  },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: spacing.lg },
  title: { fontSize: 44, lineHeight: 54 },
  code: { fontSize: 44, lineHeight: 54, letterSpacing: 6, color: colors.primary, paddingVertical: spacing.sm },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  memberName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nameText: { flexShrink: 1 },
  options: { borderTopWidth: 1, borderTopColor: colors.border },
});
