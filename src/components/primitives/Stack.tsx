import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

interface StackProps {
  children: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  flex?: number;
}

export function Stack({
  children,
  gap = 'none',
  align = 'stretch',
  justify = 'flex-start',
  padding = 'none',
  flex,
}: StackProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`gap_${gap}` as keyof typeof styles],
        styles[`padding_${padding}` as keyof typeof styles],
        alignments[align],
        justifications[justify],
        flex !== undefined && { flex },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'column' },
  gap_none: {},
  gap_sm: { gap: spacing.sm },
  gap_md: { gap: spacing.md },
  gap_lg: { gap: spacing.lg },
  padding_none: {},
  padding_sm: { padding: spacing.sm },
  padding_md: { padding: spacing.md },
  padding_lg: { padding: spacing.lg },
});

const alignments = StyleSheet.create({
  'flex-start': { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  'flex-end': { alignItems: 'flex-end' },
  stretch: { alignItems: 'stretch' },
});

const justifications = StyleSheet.create({
  'flex-start': { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  'flex-end': { justifyContent: 'flex-end' },
  'space-between': { justifyContent: 'space-between' },
});
