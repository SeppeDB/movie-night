import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuthStore } from '../src/state/useAuthStore';
import { InputField } from '../src/components/primitives/InputField';
import { StyledButton } from '../src/components/StyledButton';
import { Stack } from '../src/components/primitives/Stack';
import { Text } from '../src/components/primitives/Text';
import { colors, fonts, spacing } from '../src/theme';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { login, signUp, isLoading, isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Redirect href="/" />;

  const handleSubmit = async () => {
    setError('');
    setInfo('');
    if (email.trim() === '' || password === '' || (mode === 'signup' && name.trim() === '')) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        router.replace('/');
      } else {
        const loggedIn = await signUp(name.trim(), email.trim(), password);
        if (loggedIn) router.replace('/');
        else setInfo('Check your email to confirm your account, then log in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setInfo('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text size="display" font="display">Movie</Text>
          <Text size="display" font="display">
            Night<Text size="display" font="display" color={colors.primary}>.</Text>
          </Text>
          <View style={styles.rule} />
        </View>

        <Stack gap="lg">
          {mode === 'signup' && (
            <InputField label="Name" value={name} onChangeText={setName} testID="name-input" />
          )}
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            testID="email-input"
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
            error={error !== '' ? error : undefined}
          />
          {info !== '' && <Text color={colors.success}>{info}</Text>}
        </Stack>

        <Stack gap="md">
          <StyledButton
            label={mode === 'login' ? 'Log in' : 'Create account'}
            onPress={handleSubmit}
            isLoading={isLoading}
            testID="login-button"
          />
          <Pressable onPress={toggleMode} testID="toggle-mode" style={styles.toggle}>
            <Text color={colors.textMuted}>
              {mode === 'login' ? 'New here? ' : 'Already a member? '}
              <Text weight="medium" color={colors.text} style={styles.underline}>
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </Text>
            </Text>
          </Pressable>
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
  },
  content: { width: '100%', maxWidth: 420, gap: spacing.xl + 8 },
  rule: { width: 48, height: 3, backgroundColor: colors.primary, marginTop: spacing.lg, marginBottom: spacing.md },
  italic: { fontFamily: fonts.displayItalic, fontSize: 20 },
  underline: { textDecorationLine: 'underline' },
  toggle: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
});
