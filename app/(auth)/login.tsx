import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';

// ─── Schemas ────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/\d/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type NewPasswordForm = z.infer<typeof newPasswordSchema>;

// ─── Component ──────────────────────────────────────────────

export default function LoginScreen() {
  const { isLoading, error, login, submitNewPassword } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Login form
  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // New password form
  const {
    control: pwControl,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onLogin = async (data: LoginForm) => {
    const result = await login(data.email, data.password);
    if (result === 'NEW_PASSWORD_REQUIRED') {
      setShowNewPassword(true);
    }
  };

  const onNewPassword = async (data: NewPasswordForm) => {
    await submitNewPassword(data.newPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>The Modern Gurukul</Text>
          <Text style={styles.subtitle}>
            {showNewPassword ? 'Set your new password' : 'Sign in to continue'}
          </Text>
        </View>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {showNewPassword ? (
          /* ─── New Password Form ──────────────────────────── */
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <Controller
                control={pwControl}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, pwErrors.newPassword && styles.inputError]}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={COLORS.text.tertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {pwErrors.newPassword && (
                <Text style={styles.fieldError}>{pwErrors.newPassword.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={pwControl}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, pwErrors.confirmPassword && styles.inputError]}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.text.tertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {pwErrors.confirmPassword && (
                <Text style={styles.fieldError}>{pwErrors.confirmPassword.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handlePwSubmit(onNewPassword)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Set Password</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ─── Login Form ─────────────────────────────────── */
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={loginControl}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, loginErrors.email && styles.inputError]}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {loginErrors.email && (
                <Text style={styles.fieldError}>{loginErrors.email.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={loginControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, loginErrors.password && styles.inputError]}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.text.tertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {loginErrors.password && (
                <Text style={styles.fieldError}>{loginErrors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLoginSubmit(onLogin)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Phone OTP link */}
            <Link href="/(auth)/verify-otp" asChild>
              <TouchableOpacity style={styles.otpLink} disabled={isLoading}>
                <Text style={styles.otpLinkText}>Sign in with phone number instead</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary[600],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  errorBanner: {
    backgroundColor: COLORS.error.light,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error.main,
  },
  errorText: {
    color: COLORS.error.dark,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  input: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error.main,
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error.main,
    marginTop: 2,
  },
  button: {
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  otpLinkText: {
    color: COLORS.primary[600],
    fontSize: 14,
    fontWeight: '500',
  },
});
