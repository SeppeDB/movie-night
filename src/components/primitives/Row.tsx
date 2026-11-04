import { View, StyleSheet } from 'react-native';

interface RowProps {
  children: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  wrap?: boolean;
}

export function Row({
  children,
  gap = 'none',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
}: RowProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`gap_${gap}` as keyof typeof styles],
        alignments[align],
        justifications[justify],
        wrap && styles.wrap,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row' },
  wrap: { flexWrap: 'wrap' },
  gap_none: {},
  gap_sm: {},
  gap_md: {},
  gap_lg: {},
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
