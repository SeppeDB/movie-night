import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '../../theme';

interface ToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error';
  visible: boolean;
}

export function Toast({ message, variant = 'default', visible }: ToastProps) {
  if (!visible) return null;

  return (
    <View style={styles.wrap} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={[styles.base, styles[variant]]}>
        <Text size="md">{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  base: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  default: {},
  success: { borderColor: colors.success },
  error: { borderColor: colors.danger },
});
