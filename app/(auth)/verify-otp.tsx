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
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';

// ─── Schemas ────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number with country code'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

// ─── Component ──────────────────────────────────────────────

export default function VerifyOtpScreen() {
  const { isLoading, error, loginPhone, submitOtp } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Phone form
  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  // OTP form
  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onPhone = async (data: PhoneForm) => {
    const success = await loginPhone(data.phone);
    if (success) setStep('otp');
  };

  const onOtp = async (data: OtpForm) => {
    await submitOtp(data.otp);
    // Navigation happens in useAuth postLoginFlow
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
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>Phone Sign In</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your phone number to receive an OTP'
              : 'Enter the 6-digit code sent to your phone'}
          </Text>
        </View>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 'phone' ? (
          /* ─── Phone Input ────────────────────────────────── */
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={phoneControl}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, phoneErrors.phone && styles.inputError]}
                    placeholder="+91 9876543210"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {phoneErrors.phone && (
                <Text style={styles.fieldError}>{phoneErrors.phone.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handlePhoneSubmit(onPhone)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ─── OTP Input ──────────────────────────────────── */
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Verification Code</Text>
              <Controller
                control={otpControl}
                name="otp"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.otpInput, otpErrors.otp && styles.inputError]}
                    placeholder="000000"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {otpErrors.otp && (
                <Text style={styles.fieldError}>{otpErrors.otp.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleOtpSubmit(onOtp)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendLink}
              onPress={() => setStep('phone')}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Use a different number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to email login */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backText}>← Back to email login</Text>
        </TouchableOpacity>
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
    textAlign: 'center',
    paddingHorizontal: 16,
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
  otpInput: {
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    fontWeight: '700',
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
  resendLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: COLORS.primary[600],
    fontSize: 14,
    fontWeight: '500',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  backText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});
