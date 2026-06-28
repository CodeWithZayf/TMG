import React, { type PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface CardProps {
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({
  children,
  style,
  variant = 'elevated',
}: PropsWithChildren<CardProps>) {
  return (
    <View style={[styles.base, styles[variant], style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  } as ViewStyle,
  elevated: {
    backgroundColor: COLORS.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  outlined: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  } as ViewStyle,
  filled: {
    backgroundColor: COLORS.background.tertiary,
  } as ViewStyle,
});
