import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroup, leaveGroup } from '../../../src/services/groupService';
import type { GroupDetails } from '../../../src/types/Group';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { colors, fonts, spacing } from '../../../src/theme';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [error, setError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);

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

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleLeave = async () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      return;
    }
    try {
      await leaveGroup(id);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not leave this group.');
      setConfirmLeave(false);
    }
  };

  return (
    <Screen padding="lg">
      <View style={styles.content}>
        <Pressable onPress={goBack} style={styles.back} testID="back-button">
          <Text size="sm" color={colors.textMuted}>← all nights</Text>
        </Pressable>

        {error !== '' ? (
          <Text color={colors.danger}>{error}</Text>
        ) : group === null ? (
          <View style={styles.centered}>
            <Spinner size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View>
              <Text font="display" style={styles.title}>
                {group.name}<Text font="display" style={styles.title} color={colors.primary}>.</Text>
              </Text>
              <View style={styles.rule} />
            </View>

            <Stack gap="sm">
              <Text size="sm" weight="medium" color={colors.textMuted}>invite code</Text>
              <Text font="display" style={styles.code} testID="invite-code">{group.inviteCode}</Text>
              <Text color={colors.textMuted}>Share this code so friends can join.</Text>
            </Stack>

            <Stack gap="sm">
              <Text size="sm" weight="medium" color={colors.textMuted}>
                {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
              </Text>
              <View style={styles.list}>
                {group.members.map((member) => (
                  <View key={member.id} style={styles.row}>
                    <Text size="lg">{member.name}</Text>
                  </View>
                ))}
              </View>
            </Stack>

            <Stack gap="sm">
              <Text size="lg" style={styles.italic}>Suggestions are coming soon.</Text>
              <Text color={colors.textMuted}>Next up: search a film and put it to the vote.</Text>
            </Stack>

            <Pressable onPress={handleLeave} style={styles.leave} testID="leave-group-button">
              <Text color={confirmLeave ? colors.danger : colors.textMuted} style={styles.underline}>
                {confirmLeave ? 'Tap again to leave this group' : 'Leave group'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl + 8 },
  back: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  title: { fontSize: 52, lineHeight: 64 },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: spacing.lg },
  code: { fontSize: 44, lineHeight: 50, letterSpacing: 6, color: colors.primary },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  italic: { fontFamily: fonts.displayItalic },
  underline: { textDecorationLine: 'underline' },
  leave: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
});
