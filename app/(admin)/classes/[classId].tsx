import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getClassSubjects } from '@/services/assignment.service';
import { getClassRoster } from '@/services/class.service';
import { getUserProfile } from '@/services/user.service';
import { SubjectPill } from '@/components/ui/SubjectPill';
import { COLORS } from '@/constants/colors';
import { apiGet } from '@/services/api';
import type { Subject } from '@/constants/subjects';
import type { StudentSubject } from '@/types/user.types';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();

  const subjectsQuery = useQuery({
    queryKey: ['classSubjects', classId],
    queryFn: () => getClassSubjects(classId!),
    enabled: !!classId,
  });

  const rosterQuery = useQuery({
    queryKey: ['classRoster', classId],
    queryFn: () => getClassRoster(classId!),
    enabled: !!classId,
  });

  const isLoading = subjectsQuery.isLoading || rosterQuery.isLoading;

  const onRefresh = () => {
    subjectsQuery.refetch();
    rosterQuery.refetch();
  };

  const teacherAssignments = subjectsQuery.data?.items || [];
  const rosterMembers = rosterQuery.data?.items || [];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={[]}
      renderItem={null}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scroll}
      ListHeaderComponent={
        <>
          {/* Teachers Section */}
          <Text style={styles.sectionHeader}>
            Teachers ({teacherAssignments.length})
          </Text>
          {teacherAssignments.length === 0 ? (
            <Text style={styles.emptySection}>No teachers assigned yet</Text>
          ) : (
            teacherAssignments.map((a) => (
              <View key={`${a.teacherId}-${a.subject}`} style={styles.row}>
                <View style={styles.teacherIcon}>
                  <Ionicons name="school" size={18} color={COLORS.success.main} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowName}>
                    {a.teacherName || a.teacherId}
                  </Text>
                  <SubjectPill subject={a.subject as Subject} size="sm" />
                </View>
              </View>
            ))
          )}

          {/* Students Section */}
          <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
            Students ({rosterMembers.length})
          </Text>
          {rosterMembers.length === 0 ? (
            <Text style={styles.emptySection}>No students enrolled yet</Text>
          ) : (
            rosterMembers.map((m) => (
              <StudentRow key={m.userId} userId={m.userId} />
            ))
          )}
        </>
      }
    />
  );
}

/**
 * Student row — fetches user profile + enrolled subject count.
 */
function StudentRow({ userId }: { userId: string }) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserProfile(userId),
  });

  // Fetch student's enrolled subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['studentSubjects', userId],
    queryFn: () => apiGet<{ items: StudentSubject[] }>(`/assignments/student/${userId}`),
    enabled: !!userId,
  });

  const subjectCount = subjectsData?.items?.length;

  if (userLoading) {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color={COLORS.primary[400]} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{user?.name || userId}</Text>
        <Text style={styles.rowSub}>
          Roll #{user?.rollNo || '—'}
          {subjectCount !== undefined ? ` · ${subjectCount} subjects` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 12, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  emptySection: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  row: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  teacherIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.success.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  rowContent: { flex: 1, gap: 4 },
  rowName: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  rowSub: { fontSize: 12, color: COLORS.text.secondary },
});
