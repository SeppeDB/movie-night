import { Pressable, StyleSheet } from 'react-native';
import { Spinner } from './primitives/Spinner';
import { Text } from './primitives/Text';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  isLoading?: boolean;
  testID?: string;
}

const contentColors: Record<Variant, string> = {
  primary: colors.onPrimary,
  secondary: colors.text,
  ghost: colors.textMuted,
  danger: colors.danger,
};

const pressedStyles = {
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.surfaceAlt },
  ghost: { backgroundColor: colors.surface },
  danger: { backgroundColor: colors.surface },
};

export function StyledButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  testID,
}: StyledButtonProps) {
  const contentColor = contentColors[variant];
  const showArrow = variant === 'primary' || variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        !showArrow && styles.centered,
        pressed && pressedStyles[variant],
        isLoading && styles.disabled,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <Spinner size="small" color={contentColor} />
      ) : (
        <>
          <Text size="lg" weight={variant === 'ghost' ? 'medium' : 'bold'} color={contentColor}>{label}</Text>
          {showArrow && <Text size="lg" weight="bold" color={contentColor}>→</Text>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md + 4,
    borderRadius: radius.sm,
  },
  centered: { justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', minHeight: 48 },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: 0.6, justifyContent: 'center' },
});
