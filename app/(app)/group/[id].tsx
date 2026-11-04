import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroup, leaveGroup } from '../../../src/services/groupService';
import type { GroupDetails } from '../../../src/types/Group';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { IconButton } from '../../../src/components/IconButton';
import { StyledButton } from '../../../src/components/StyledButton';
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
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" onPress={goBack} accessibilityLabel="Back to your nights" testID="back-button" />
        </View>

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

            <StyledButton
              label={confirmLeave ? 'Tap again to leave' : 'Leave group'}
              variant="danger"
              onPress={handleLeave}
              testID="leave-group-button"
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl + 8 },
  topBar: { flexDirection: 'row', marginLeft: -12 },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: spacing.lg },
  title: { fontSize: 44, lineHeight: 54 },
  code: { fontSize: 44, lineHeight: 50, letterSpacing: 6, color: colors.primary },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  italic: { fontFamily: fonts.displayItalic },
});
