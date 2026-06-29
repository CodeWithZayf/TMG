import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { COLORS } from '@/constants/colors';

/**
 * Student dashboard placeholder — full version in Milestone 6.
 */
export default function StudentDashboard() {
  const { logout, isLoading } = useAuth();
  const name = useAuthStore((s) => s.name);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎒</Text>
        <Text style={styles.title}>Student Dashboard</Text>
        <Text style={styles.welcome}>Welcome, {name || 'Student'}!</Text>
        <Text style={styles.info}>
          Full dashboard coming in Milestone 6.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoading && styles.logoutDisabled]}
        onPress={logout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary[600],
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: COLORS.error.main,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
