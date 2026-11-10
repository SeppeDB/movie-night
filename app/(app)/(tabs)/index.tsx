import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createGroup, getMyGroups, joinGroup } from '../../../src/services/groupService';
import type { Group } from '../../../src/types/Group';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Icon } from '../../../src/components/primitives/Icon';
import { InputField } from '../../../src/components/primitives/InputField';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { StyledButton } from '../../../src/components/StyledButton';
import { AppBar } from '../../../src/components/AppBar';
import { Fab } from '../../../src/components/Fab';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { SheetOption } from '../../../src/components/SheetOption';
import { colors, fonts, layout, spacing } from '../../../src/theme';

type Sheet = 'closed' | 'choose' | 'create' | 'join';

const sheetTitles: Record<Sheet, string | undefined> = {
  closed: undefined,
  choose: 'New group',
  create: 'Start a group',
  join: 'Join with a code',
};

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sheet, setSheet] = useState<Sheet>('closed');
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

  const openSheet = (next: Sheet) => {
    setSheet(next);
    setValue('');
    setFormError('');
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (trimmed === '') {
      setFormError(sheet === 'create' ? 'Give your group a name.' : 'Enter an invite code.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      const group = sheet === 'create' ? await createGroup(trimmed) : await joinGroup(trimmed);
      openSheet('closed');
      router.push({ pathname: '/group/[id]', params: { id: group.id } });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <AppBar title="Movie Night" />
      <Screen padding="lg">
        <View style={styles.content}>
          <View>
            <Text size="display" font="display">Your</Text>
            <Text size="display" font="display">
              groups<Text size="display" font="display" color={colors.primary}>.</Text>
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
              <Text size="lg" style={styles.italic}>No groups yet.</Text>
              <Text color={colors.textMuted}>Tap + to start one, or join a friend's with their invite code.</Text>
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
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Screen>

      <Fab icon="add" onPress={() => openSheet('choose')} accessibilityLabel="Start or join a group" testID="fab" />

      <BottomSheet visible={sheet !== 'closed'} onClose={() => openSheet('closed')} title={sheetTitles[sheet]}>
        {sheet === 'choose' ? (
          <View style={styles.options}>
            <SheetOption
              icon={<Icon name="add-circle-outline" size={28} color={colors.primary} />}
              title="Start a group"
              subtitle="Create a group and invite your friends"
              onPress={() => openSheet('create')}
              testID="start-group-option"
            />
            <SheetOption
              icon={<Icon name="enter-outline" size={28} color={colors.primary} />}
              title="Join with a code"
              subtitle="Got an invite code from a friend?"
              onPress={() => openSheet('join')}
              testID="join-group-option"
            />
          </View>
        ) : (
          <Stack gap="lg">
            <InputField
              label={sheet === 'create' ? 'Group name' : 'Invite code'}
              value={value}
              onChangeText={setValue}
              placeholder={sheet === 'create' ? 'Friday film club' : 'KX7P2Q'}
              error={formError !== '' ? formError : undefined}
              testID="group-input"
            />
            <Stack gap="sm">
              <StyledButton
                label={sheet === 'create' ? 'Create group' : 'Join group'}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                testID="group-submit-button"
              />
              <StyledButton label="Back" variant="ghost" onPress={() => openSheet('choose')} testID="sheet-back-button" />
            </Stack>
          </Stack>
        )}
      </BottomSheet>
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
    paddingBottom: 96,
  },
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
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1, gap: 4 },
  groupName: { fontSize: 26, lineHeight: 32 },
  italic: { fontFamily: fonts.displayItalic },
  options: { borderTopWidth: 1, borderTopColor: colors.border },
});
