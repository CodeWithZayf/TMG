import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { COLORS } from '@/constants/colors';

export default function MoreScreen() {
  const { logout } = useAuth();
  const name = useAuthStore((s) => s.name);
  const role = useAuthStore((s) => s.role);

  return (
    <View style={styles.container}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>{name || 'Admin'}</Text>
          <Text style={styles.profileRole}>
            {role?.charAt(0)?.toUpperCase()}{role?.slice(1)}
          </Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={22} color={COLORS.text.secondary} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.text.secondary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error.main} />
          <Text style={[styles.menuText, { color: COLORS.error.main }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>TMG v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: 20,
  },
  profileCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  profileRole: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menu: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 32,
  },
});
