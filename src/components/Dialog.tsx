import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { StyledButton } from './StyledButton';
import { Text } from './primitives/Text';
import { colors, radius, spacing } from '../theme';

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close" />
        <View style={styles.card} accessibilityRole="alert" testID="dialog">
          <Text font="display" style={styles.title}>{title}</Text>
          {message !== undefined && <Text color={colors.textMuted}>{message}</Text>}
          <View style={styles.actions}>
            <View style={styles.action}>
              <StyledButton label={cancelLabel} variant="ghost" onPress={onCancel} testID="dialog-cancel" />
            </View>
            <View style={styles.action}>
              <StyledButton
                label={confirmLabel}
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onPress={onConfirm}
                isLoading={isLoading}
                testID="dialog-confirm"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.overlay },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: 26, lineHeight: 32 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1 },
});
