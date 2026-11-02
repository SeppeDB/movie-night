import { Text as RNText, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { colors, fonts } from '../../theme';

interface TextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  weight?: 'normal' | 'medium' | 'bold';
  font?: 'body' | 'display';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function Text({
  children,
  size = 'md',
  weight = 'normal',
  font = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
  testID,
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        sizes[size],
        font === 'display' ? styles.serif : weights[weight],
        { textAlign: align },
        color !== undefined && { color },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text },
  serif: { fontFamily: fonts.display, letterSpacing: -0.5 },
});

const sizes = StyleSheet.create({
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 22 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 32, lineHeight: 36 },
  display: { fontSize: 72, lineHeight: 70 },
});

// Custom fonts carry their own weight, so each weight maps to a font file instead of fontWeight
const weights = StyleSheet.create({
  normal: { fontFamily: fonts.body },
  medium: { fontFamily: fonts.bodyMedium },
  bold: { fontFamily: fonts.bodyBold },
});
