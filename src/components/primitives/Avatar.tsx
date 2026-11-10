import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (uri !== undefined) {
    return <Image source={{ uri }} style={[styles.base, styles[size]]} />;
  }

  return (
    <View style={[styles.base, styles[size], styles.fallback]}>
      <Text size={textSizes[size]} weight="bold" color={colors.primary}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fallback: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  sm: { width: 36, height: 36 },
  md: { width: 48, height: 48 },
  lg: { width: 88, height: 88 },
});

const textSizes = { sm: 'sm', md: 'md', lg: 'xl' } as const;
