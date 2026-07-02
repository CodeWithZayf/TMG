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
import { useAuthStore } from '@/store/auth.store';
import { getTeacherAssignments } from '@/services/assignment.service';
import { SUBJECT_LABELS, type Subject } from '@/constants/subjects';
import { SubjectPill } from '@/components/ui/SubjectPill';
import { COLORS } from '@/constants/colors';

export default function TeacherDashboard() {
  const userId = useAuthStore((s) => s.userId);
  const name = useAuthStore((s) => s.name);

  const assignmentsQuery = useQuery({
    queryKey: ['teacherAssignments', userId],
    queryFn: () => getTeacherAssignments(userId!),
    enabled: !!userId,
  });

  const assignments = assignmentsQuery.data?.items || [];

  // Group assignments by classId
  const classesByClass = assignments.reduce<Record<string, { classId: string; subjects: string[] }>>((acc, a) => {
    if (!acc[a.classId]) acc[a.classId] = { classId: a.classId, subjects: [] };
    acc[a.classId].subjects.push(a.subject);
    return acc;
  }, {});

  const classGroups = Object.values(classesByClass);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={assignmentsQuery.isRefetching}
          onRefresh={() => assignmentsQuery.refetch()}
        />
      }
    >
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Good morning,</Text>
        <Text style={styles.nameText}>{name || 'Teacher'} 👋</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.info.main }]}>
          <Text style={[styles.statValue, { color: COLORS.info.main }]}>
            {assignmentsQuery.isLoading ? '…' : classGroups.length}
          </Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.success.main }]}>
          <Text style={[styles.statValue, { color: COLORS.success.main }]}>
            {assignmentsQuery.isLoading ? '…' : assignments.length}
          </Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
      </View>

      {/* Pending Attendance Alert */}
      <TouchableOpacity style={styles.alertCard} activeOpacity={0.8}>
        <View style={styles.alertIcon}>
          <Ionicons name="alert-circle" size={24} color={COLORS.warning.main} />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>Mark Today's Attendance</Text>
          <Text style={styles.alertSub}>
            Tap Attendance tab to mark for your classes
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
      </TouchableOpacity>

      {/* Assigned Classes */}
      <Text style={styles.sectionTitle}>Your Classes</Text>
      {assignmentsQuery.isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginTop: 24 }} />
      ) : classGroups.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="school-outline" size={40} color={COLORS.text.tertiary} />
          <Text style={styles.emptyText}>No classes assigned yet</Text>
        </View>
      ) : (
        classGroups.map((group) => (
          <View key={group.classId} style={styles.classCard}>
            <View style={styles.classHeader}>
              <Ionicons name="school" size={20} color={COLORS.primary[600]} />
              <Text style={styles.classTitle}>{group.classId}</Text>
            </View>
            <View style={styles.subjectPills}>
              {group.subjects.map((s) => (
                <SubjectPill key={s} subject={s as Subject} size="sm" />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scroll: { padding: 20, paddingBottom: 40 },
  welcomeSection: { marginBottom: 20 },
  welcomeText: { fontSize: 15, color: COLORS.text.secondary },
  nameText: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  alertCard: {
    backgroundColor: COLORS.warning.light,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.warning.main + '30',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: COLORS.warning.dark },
  alertSub: { fontSize: 12, color: COLORS.warning.dark, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 12 },
  classCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  classHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  classTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  subjectPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empty: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyText: { fontSize: 15, color: COLORS.text.secondary },
});
