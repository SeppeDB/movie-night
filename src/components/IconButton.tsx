import { Pressable, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';
import { Icon } from './primitives/Icon';
import { colors, radius } from '../theme';

interface IconButtonProps {
  icon: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  testID?: string;
}

export function IconButton({ icon, onPress, accessibilityLabel, color = colors.text, testID }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <Icon name={icon} size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
});
