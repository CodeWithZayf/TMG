import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: COLORS.success.light, text: COLORS.success.dark },
  warning: { bg: COLORS.warning.light, text: COLORS.warning.dark },
  error:   { bg: COLORS.error.light,   text: COLORS.error.dark },
  info:    { bg: COLORS.info.light,     text: COLORS.info.dark },
  neutral: { bg: COLORS.neutral[100],   text: COLORS.neutral[700] },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg },
        size === 'md' && styles.containerMd,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: colors.text },
          size === 'md' && styles.labelMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  } as ViewStyle,
  containerMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  } as ViewStyle,
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
  labelMd: {
    fontSize: 13,
  } as TextStyle,
});
