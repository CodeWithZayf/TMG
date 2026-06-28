import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? COLORS.primary[600] : COLORS.text.inverse}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  primary: {
    backgroundColor: COLORS.primary[600],
  } as ViewStyle,
  secondary: {
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  } as ViewStyle,
  danger: {
    backgroundColor: COLORS.error.main,
  } as ViewStyle,
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  } as ViewStyle,
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  } as ViewStyle,
  text: {
    fontWeight: '600',
  } as TextStyle,
  text_primary: {
    color: COLORS.text.inverse,
  } as TextStyle,
  text_secondary: {
    color: COLORS.primary[600],
  } as TextStyle,
  text_danger: {
    color: COLORS.text.inverse,
  } as TextStyle,
  text_ghost: {
    color: COLORS.primary[600],
  } as TextStyle,
  textSize_sm: {
    fontSize: 13,
  } as TextStyle,
  textSize_md: {
    fontSize: 15,
  } as TextStyle,
  textSize_lg: {
    fontSize: 17,
  } as TextStyle,
});
