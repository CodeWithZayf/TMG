import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAppStore } from '@/store/app.store';

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚡ You're offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning.main,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  } as ViewStyle,
  text: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
});
