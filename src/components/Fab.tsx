import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from './primitives/Icon';
import { colors, radius, spacing } from '../theme';

interface FabProps {
  icon: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
}

export function Fab({ icon, onPress, accessibilityLabel, testID }: FabProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <Icon name={icon} size={28} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
  },
  pressed: { backgroundColor: colors.primaryPressed },
});
