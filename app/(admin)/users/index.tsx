import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/services/user.service';
import { getTeacherAssignments } from '@/services/assignment.service';
import { SUBJECT_LABELS, type Subject } from '@/constants/subjects';
import { COLORS } from '@/constants/colors';
import type { User } from '@/types/user.types';

const ROLE_TABS = ['all', 'teacher', 'student'] as const;
type RoleTab = typeof ROLE_TABS[number];

const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:   { bg: '#8B5CF618', text: '#8B5CF6' },
  teacher: { bg: COLORS.success.light, text: COLORS.success.dark },
  student: { bg: COLORS.info.light, text: COLORS.info.dark },
};

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.student;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Text>
    </View>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <View style={[styles.row, !user.active && styles.rowInactive]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{user.name}</Text>
          <RoleBadge role={user.role} />
        </View>
        {user.role === 'teacher' ? (
          <TeacherSummary userId={user.userId} />
        ) : (
          <Text style={styles.rowSub} numberOfLines={1}>
            {user.email}
            {user.classId ? ` · ${user.classId}` : ''}
            {!user.active ? ' · Inactive' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Inline teacher assignment summary — shows subject names.
 */
function TeacherSummary({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['teacherAssignments', userId],
    queryFn: () => getTeacherAssignments(userId),
  });

  if (isLoading) {
    return <Text style={styles.rowSub}>Loading...</Text>;
  }

  const assignments = data?.items || [];
  if (assignments.length === 0) {
    return <Text style={styles.rowSub}>No assignments</Text>;
  }

  // Show unique subject labels
  const uniqueSubjects = [...new Set(assignments.map((a) => a.subject))];
  const summary = uniqueSubjects
    .slice(0, 3)
    .map((s) => SUBJECT_LABELS[s as Subject] || s)
    .join(', ');

  return (
    <Text style={styles.rowSub} numberOfLines={1}>
      {summary}
      {uniqueSubjects.length > 3 ? ` +${uniqueSubjects.length - 3} more` : ''}
      {` · ${assignments.length} assignments`}
    </Text>
  );
}

export default function UsersListScreen() {
  const [activeTab, setActiveTab] = useState<RoleTab>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['users', activeTab === 'all' ? undefined : activeTab],
    queryFn: () => listUsers(activeTab === 'all' ? undefined : activeTab),
  });

  const users = data?.items || [];

  return (
    <View style={styles.container}>
      {/* Role filter tabs */}
      <View style={styles.tabs}>
        {ROLE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User list */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <UserRow user={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )
        }
      />

      {/* FAB: Create user */}
      <View style={styles.fabContainer}>
        <Link href="/(admin)/users/create-teacher" asChild>
          <TouchableOpacity style={[styles.fab, styles.fabSecondary]} activeOpacity={0.8}>
            <Ionicons name="school" size={20} color={COLORS.primary[600]} />
            <Text style={styles.fabSecondaryText}>Teacher</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(admin)/users/create-student" asChild>
          <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.fabText}>Student</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
  },
  tabActive: {
    backgroundColor: COLORS.primary[600],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 12,
    paddingBottom: 100,
    gap: 8,
  },
  row: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  rowInactive: {
    opacity: 0.5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  rowSub: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    gap: 10,
    alignItems: 'flex-end',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabSecondary: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fabSecondaryText: {
    color: COLORS.primary[600],
    fontSize: 14,
    fontWeight: '700',
  },
});
