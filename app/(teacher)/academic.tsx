import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function AcademicScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="book-outline" size={56} color={COLORS.text.tertiary} />
      <Text style={styles.title}>Academic</Text>
      <Text style={styles.subtitle}>Assignments, grades, and notes coming soon.</Text>
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
