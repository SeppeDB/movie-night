import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, layout, radius, spacing } from '../../theme';

interface MenuItem {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

interface MenuProps {
  items: MenuItem[];
  visible: boolean;
  onClose: () => void;
}

export function Menu({ items, visible, onClose }: MenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.overlay} accessibilityLabel="Close menu" />
      <View style={styles.anchor}>
        <View style={styles.menu} accessibilityRole="menu">
          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              accessibilityRole="menuitem"
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Text size="md" weight="medium" color={item.variant === 'danger' ? colors.danger : colors.text}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  anchor: {
    position: 'absolute',
    top: layout.appBarHeight - 4,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: layout.maxBarWidth,
    alignSelf: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    pointerEvents: 'box-none',
  },
  menu: {
    minWidth: 200,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  menuItem: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md },
  menuItemPressed: { backgroundColor: colors.border },
});
