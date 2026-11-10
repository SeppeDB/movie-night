import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton } from './IconButton';
import { Text } from './primitives/Text';
import { colors, layout, spacing } from '../theme';

interface AppBarProps {
  title?: string;
  showBack?: boolean;
  actions?: ReactNode;
}

export function AppBar({ title, showBack = false, actions }: AppBarProps) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        {showBack && (
          <IconButton icon="arrow-back" onPress={goBack} accessibilityLabel="Back" testID="back-button" />
        )}
        <View style={[styles.titleWrap, !showBack && styles.titleInset]}>
          {title !== undefined && (
            <Text font="display" style={styles.title} numberOfLines={1}>{title}</Text>
          )}
        </View>
        {actions !== undefined && <View style={styles.actions}>{actions}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.appBarHeight,
    width: '100%',
    maxWidth: layout.maxBarWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
  },
  titleWrap: { flex: 1 },
  titleInset: { paddingLeft: spacing.md },
  title: { fontSize: 22, lineHeight: 28 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
