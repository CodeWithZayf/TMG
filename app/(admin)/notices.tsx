import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function NoticesScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="megaphone-outline" size={56} color={COLORS.text.tertiary} />
      <Text style={styles.title}>Notices</Text>
      <Text style={styles.subtitle}>Global and subject notices coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: 32,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary },
  subtitle: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
});
