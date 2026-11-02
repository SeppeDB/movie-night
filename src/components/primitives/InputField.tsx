import { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, fonts } from '../../theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  testID,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text size="sm" weight="medium" color={focused ? colors.primary : colors.textMuted}>
        {label.toLowerCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused, error !== undefined && styles.inputError]}
        testID={testID}
        autoCapitalize="none"
      />
      {error !== undefined && <Text size="sm" color={colors.danger}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  input: {
    backgroundColor: 'transparent',
    color: colors.text,
    fontFamily: fonts.body,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 18,
  },
  inputFocused: { borderBottomColor: colors.primary },
  inputError: { borderBottomColor: colors.danger },
});
