import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';
import { colors, spacing } from '../theme';

interface SheetOptionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  variant?: 'default' | 'danger';
  onPress: () => void;
  testID?: string;
}

export function SheetOption({ icon, title, subtitle, variant = 'default', onPress, testID }: SheetOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      testID={testID}
    >
      {icon}
      <View style={styles.text}>
        <Text size="lg" weight="bold" color={variant === 'danger' ? colors.danger : colors.text}>{title}</Text>
        {subtitle !== undefined && <Text size="sm" color={colors.textMuted}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  text: { flex: 1, gap: 4 },
});
