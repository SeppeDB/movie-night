import { useCallback, useEffect, useRef, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroup, leaveGroup } from '../../../src/services/groupService';
import { useAuthStore } from '../../../src/state/useAuthStore';
import type { GroupDetails } from '../../../src/types/Group';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { Avatar } from '../../../src/components/primitives/Avatar';
import { Menu } from '../../../src/components/primitives/Menu';
import { Toast } from '../../../src/components/primitives/Toast';
import { AppBar } from '../../../src/components/AppBar';
import { IconButton } from '../../../src/components/IconButton';
import { Dialog } from '../../../src/components/Dialog';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { StyledButton } from '../../../src/components/StyledButton';
import { colors, layout, spacing } from '../../../src/theme';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
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

  const shareInvite = async () => {
    if (group === null) return;
    const url = typeof window !== 'undefined' ? `${window.location.href.split('/group/')[0]}/` : '';
    const message = `Join "${group.name}" on Movie Night with code ${group.inviteCode}`;
    try {
      await Share.share({ title: 'Movie Night', message, url });
      setInviteOpen(false);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setInviteOpen(false);
      try {
        await navigator.clipboard.writeText(`${message}\n${url}`);
        showToast('Invite copied to clipboard');
      } catch {
        showToast(`Invite code: ${group.inviteCode}`);
      }
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup(id);
      setConfirmLeave(false);
      router.replace('/');
    } catch (e) {
      setConfirmLeave(false);
      showToast(e instanceof Error ? e.message : 'Could not leave this group.');
    } finally {
      setIsLeaving(false);
    }
  };

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
                  {group.members.map((member) => (
                    <View key={member.id} style={styles.row}>
                      <Avatar name={member.name} size="sm" />
                      <Text size="lg" style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                      {member.id === currentUserId && <Text size="sm" color={colors.textMuted}>you</Text>}
                    </View>
                  ))}
                </View>
              </Stack>
            </>
          )}
        </View>
      </Screen>

      <Menu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Invite friends', onPress: () => setInviteOpen(true) },
          { label: 'Leave group', variant: 'danger', onPress: () => setConfirmLeave(true) },
        ]}
      />

      <BottomSheet visible={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite friends">
        <Text color={colors.textMuted}>Friends join this group with the invite code.</Text>
        <Text font="display" style={styles.code} testID="invite-code">{group?.inviteCode ?? ''}</Text>
        <StyledButton label="Share invite" onPress={shareInvite} testID="share-button" />
      </BottomSheet>

      <Dialog
        visible={confirmLeave}
        title={group !== null ? `Leave ${group.name}?` : 'Leave group?'}
        message="You can rejoin later with the invite code."
        confirmLabel="Leave"
        variant="danger"
        isLoading={isLeaving}
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
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
  memberName: { flex: 1 },
});
