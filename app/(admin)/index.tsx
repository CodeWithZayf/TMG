import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { listUsers } from '@/services/user.service';
import { listClasses } from '@/services/class.service';
import { COLORS } from '@/constants/colors';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  loading: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={[styles.iconBg, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Text style={[styles.cardValue, { color }]}>{value ?? '—'}</Text>
        )}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const name = useAuthStore((s) => s.name);

  const students = useQuery({
    queryKey: ['users', 'student'],
    queryFn: () => listUsers('student'),
  });

  const teachers = useQuery({
    queryKey: ['users', 'teacher'],
    queryFn: () => listUsers('teacher'),
  });

  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses(),
  });

  const isLoading = students.isLoading || teachers.isLoading || classes.isLoading;

  const onRefresh = () => {
    students.refetch();
    teachers.refetch();
    classes.refetch();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{name || 'Admin'} 👋</Text>
      </View>

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Students"
          value={students.data?.items.length}
          icon="people"
          color={COLORS.info.main}
          loading={students.isLoading}
        />
        <StatCard
          title="Total Teachers"
          value={teachers.data?.items.length}
          icon="school"
          color={COLORS.success.main}
          loading={teachers.isLoading}
        />
        <StatCard
          title="Total Classes"
          value={classes.data?.items.length}
          icon="library"
          color={COLORS.warning.main}
          loading={classes.isLoading}
        />
        <StatCard
          title="Active Users"
          value={
            students.data && teachers.data
              ? students.data.items.filter((u) => u.active).length +
                teachers.data.items.filter((u) => u.active).length
              : undefined
          }
          icon="checkmark-circle"
          color="#8B5CF6"
          loading={students.isLoading || teachers.isLoading}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error.main} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  statsGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error.light,
    backgroundColor: COLORS.error.light,
  },
  logoutText: {
    color: COLORS.error.main,
    fontSize: 15,
    fontWeight: '600',
  },
});
