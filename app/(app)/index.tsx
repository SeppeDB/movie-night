import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/state/useAuthStore';
import { createGroup, getMyGroups, joinGroup } from '../../src/services/groupService';
import type { Group } from '../../src/types/Group';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { InputField } from '../../src/components/primitives/InputField';
import { Spinner } from '../../src/components/primitives/Spinner';
import { StyledButton } from '../../src/components/StyledButton';
import { IconButton } from '../../src/components/IconButton';
import { colors, fonts, spacing } from '../../src/theme';

type Panel = 'none' | 'create' | 'join';

export default function GroupsScreen() {
  const { user, logout } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [panel, setPanel] = useState<Panel>('none');
  const [value, setValue] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoadError('');
    try {
      setGroups(await getMyGroups());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load your groups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  const togglePanel = (next: Panel) => {
    setPanel(panel === next ? 'none' : next);
    setValue('');
    setFormError('');
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (trimmed === '') {
      setFormError(panel === 'create' ? 'Give your group a name.' : 'Enter an invite code.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      const group = panel === 'create' ? await createGroup(trimmed) : await joinGroup(trimmed);
      setPanel('none');
      setValue('');
      router.push({ pathname: '/group/[id]', params: { id: group.id } });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen padding="lg">
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Text color={colors.textMuted}>{user?.name ?? ''}</Text>
          <IconButton
            icon="log-out-outline"
            onPress={logout}
            accessibilityLabel="Log out"
            color={colors.textMuted}
            testID="logout-button"
          />
        </View>

        <View>
          <Text size="display" font="display">Your</Text>
          <Text size="display" font="display">
            nights<Text size="display" font="display" color={colors.primary}>.</Text>
          </Text>
          <View style={styles.rule} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <Spinner size="large" color={colors.primary} />
          </View>
        ) : loadError !== '' ? (
          <Stack gap="md">
            <Text color={colors.danger}>{loadError}</Text>
            <StyledButton label="Try again" variant="secondary" onPress={loadGroups} />
          </Stack>
        ) : groups.length === 0 ? (
          <Stack gap="sm">
            <Text size="lg" style={styles.italic}>No movie nights yet.</Text>
            <Text color={colors.textMuted}>Start one, or join a friend's with their invite code.</Text>
          </Stack>
        ) : (
          <View style={styles.list}>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                testID={`group-${group.id}`}
              >
                <View style={styles.rowText}>
                  <Text font="display" style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                  <Text size="sm" color={colors.textMuted}>
                    {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'} · code {group.inviteCode}
                  </Text>
                </View>
                <Text size="lg" color={colors.textMuted}>→</Text>
              </Pressable>
            ))}
          </View>
        )}

        {panel === 'none' ? (
          <Stack gap="md">
            <StyledButton label="Start a night" onPress={() => togglePanel('create')} testID="start-group-button" />
            <StyledButton
              label="Join with a code"
              variant="secondary"
              onPress={() => togglePanel('join')}
              testID="join-group-button"
            />
          </Stack>
        ) : (
          <Stack gap="lg">
            <InputField
              label={panel === 'create' ? 'Group name' : 'Invite code'}
              value={value}
              onChangeText={setValue}
              placeholder={panel === 'create' ? 'Friday film club' : 'KX7P2Q'}
              error={formError !== '' ? formError : undefined}
              testID="group-input"
            />
            <StyledButton
              label={panel === 'create' ? 'Create group' : 'Join group'}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              testID="group-submit-button"
            />
            <StyledButton label="Cancel" variant="ghost" onPress={() => togglePanel('none')} testID="cancel-button" />
          </Stack>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl + 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: -12 },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: spacing.lg },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surface },
  rowText: { flex: 1, gap: 4 },
  groupName: { fontSize: 26, lineHeight: 32 },
  italic: { fontFamily: fonts.displayItalic },
});
