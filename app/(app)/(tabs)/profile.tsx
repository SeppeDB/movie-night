import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { Avatar } from '../../../src/components/primitives/Avatar';
import { InputField } from '../../../src/components/primitives/InputField';
import { Toast } from '../../../src/components/primitives/Toast';
import { StyledButton } from '../../../src/components/StyledButton';
import { AppBar } from '../../../src/components/AppBar';
import { colors, layout, spacing } from '../../../src/theme';

const MAX_NAME_LENGTH = 40;

export default function ProfileScreen() {
  const { user, logout, updateName } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  useEffect(() => () => {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
  }, []);

  const trimmed = name.trim();
  const hasChanges = trimmed !== (user?.name ?? '');

  const handleSave = async () => {
    if (trimmed === '') {
      setError('Your name cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Keep it under ${MAX_NAME_LENGTH} characters.`);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await updateName(trimmed);
      if (toastTimer.current !== null) clearTimeout(toastTimer.current);
      setToast('Name saved');
      toastTimer.current = setTimeout(() => setToast(''), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <AppBar title="Movie Night" />
      <Screen padding="lg">
        <View style={styles.content}>
          <View style={styles.header}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.headerText}>
              <Text font="display" style={styles.name} numberOfLines={2}>{user?.name ?? ''}</Text>
              <Text color={colors.textMuted} numberOfLines={1}>{user?.email ?? ''}</Text>
            </View>
          </View>

          <Stack gap="md">
            <InputField
              label="Display name"
              value={name}
              onChangeText={setName}
              error={error !== '' ? error : undefined}
              testID="name-input"
            />
            <Text size="sm" color={colors.textMuted}>This is the name the other members of your groups see.</Text>
            {hasChanges && (
              <StyledButton label="Save name" onPress={handleSave} isLoading={isSaving} testID="save-name-button" />
            )}
          </Stack>

          <StyledButton label="Log out" variant="secondary" onPress={logout} testID="logout-button" />
        </View>
      </Screen>

      <Toast visible={toast !== ''} message={toast} variant="success" />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md + 4 },
  headerText: { flex: 1, gap: 4 },
  name: { fontSize: 32, lineHeight: 40 },
});
