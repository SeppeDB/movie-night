import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';
import { colors, spacing } from '../theme';

type IconName = ComponentProps<typeof Icon>['name'];

type TabButtonProps = TabTriggerSlotProps & {
  icon: IconName;
  activeIcon: IconName;
  label: string;
};

export function TabButton({ icon, activeIcon, label, isFocused = false, onPress }: TabButtonProps) {
  const color = isFocused ? colors.primary : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Icon name={isFocused ? activeIcon : icon} size={24} color={color} />
      <Text size="sm" weight={isFocused ? 'bold' : 'medium'} color={color}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    maxWidth: 200,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
});
