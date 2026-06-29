import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

/**
 * Root index — loading/splash screen.
 * Auth guard in _layout.tsx handles all routing decisions.
 * This screen just shows a spinner while the guard resolves.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary[600]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
});
