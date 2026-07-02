import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/app.store';
import { getTeacherAssignments } from '@/services/assignment.service';
import { getClassRoster } from '@/services/class.service';
import { getUserProfile } from '@/services/user.service';
import { useClassAttendance } from '@/hooks/useAttendance';
import { AttendanceStudentRow } from '@/components/attendance/StudentRow';
import { AttendanceSummary } from '@/components/attendance/AttendanceSummary';
import { COLORS } from '@/constants/colors';
import type { AttendanceStatus } from '@/types/attendance.types';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function AttendanceMarkScreen() {
  const userId = useAuthStore((s) => s.userId);
  const isOnline = useAppStore((s) => s.isOnline);
  const [selectedClassId, setSelectedClassId] = useState('');
  const today = getTodayDate();

  // Teacher's assignments
  const assignmentsQuery = useQuery({
    queryKey: ['teacherAssignments', userId],
    queryFn: () => getTeacherAssignments(userId!),
    enabled: !!userId,
  });

  // Unique classes from assignments
  const uniqueClasses = useMemo(() => {
    const items = assignmentsQuery.data?.items || [];
    const seen = new Set<string>();
    return items.filter((a) => {
      if (seen.has(a.classId)) return false;
      seen.add(a.classId);
      return true;
    });
  }, [assignmentsQuery.data]);

  // Class roster
  const rosterQuery = useQuery({
    queryKey: ['classRoster', selectedClassId],
    queryFn: () => getClassRoster(selectedClassId),
    enabled: !!selectedClassId,
  });

  // Existing attendance for today
  const {
    records: existingRecords,
    alreadySubmitted,
    submit,
    isSubmitting,
    submitSuccess,
    isLoading: attendanceLoading,
  } = useClassAttendance(selectedClassId || undefined, today);

  // Local status map: studentId → status
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const isLocked = alreadySubmitted || submitSuccess;

  // Initialize status map when roster loads
  const rosterMembers = rosterQuery.data?.items || [];
  useMemo(() => {
    if (rosterMembers.length === 0) return;

    const initial: Record<string, AttendanceStatus> = {};
    rosterMembers.forEach((m) => {
      // If already submitted, use existing records
      const existing = existingRecords.find((r) => r.studentId === m.userId);
      initial[m.userId] = existing?.status || 'present';
    });
    setStatusMap(initial);
  }, [rosterMembers, existingRecords]);

  const toggleStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    if (isLocked) return;
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  }, [isLocked]);

  const markAllPresent = useCallback(() => {
    if (isLocked) return;
    setStatusMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { next[k] = 'present'; });
      return next;
    });
  }, [isLocked]);

  const handleSubmit = () => {
    if (!selectedClassId || isLocked) return;

    const count = Object.keys(statusMap).length;
    Alert.alert(
      'Submit Attendance',
      `Submit attendance for ${count} students? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => submit(statusMap, {
            onError: (err: any) => Alert.alert('Error', err.message || 'Submission failed'),
          }),
        },
      ]
    );
  };

  // Summary counts
  const summary = useMemo(() => {
    const values = Object.values(statusMap);
    return {
      present: values.filter((s) => s === 'present').length,
      absent: values.filter((s) => s === 'absent').length,
      late: values.filter((s) => s === 'late').length,
    };
  }, [statusMap]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Date display */}
      <View style={styles.dateBar}>
        <Ionicons name="calendar" size={18} color={COLORS.primary[600]} />
        <Text style={styles.dateText}>
          {new Date(today).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
      </View>

      {/* Class picker */}
      <Text style={styles.label}>Select Class</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {assignmentsQuery.isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary[600]} />
        ) : uniqueClasses.length === 0 ? (
          <Text style={styles.hint}>No classes assigned</Text>
        ) : (
          uniqueClasses.map((a) => (
            <TouchableOpacity
              key={a.classId}
              style={[styles.chip, selectedClassId === a.classId && styles.chipActive]}
              onPress={() => setSelectedClassId(a.classId)}
            >
              <Text style={[
                styles.chipText,
                selectedClassId === a.classId && styles.chipTextActive,
              ]}>
                {a.classId}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Already submitted banner */}
      {isLocked && (
        <View style={styles.submittedBanner}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
          <Text style={styles.submittedText}>
            {submitSuccess ? 'Attendance submitted successfully!' : 'Already submitted for today'}
          </Text>
        </View>
      )}

      {/* Student roster */}
      {selectedClassId && (
        <>
          {rosterQuery.isLoading || attendanceLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginTop: 40 }} />
          ) : rosterMembers.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={COLORS.text.tertiary} />
              <Text style={styles.emptyText}>No students in this class</Text>
            </View>
          ) : (
            <>
              {/* Summary bar */}
              <AttendanceSummary
                present={summary.present}
                absent={summary.absent}
                late={summary.late}
              />

              {/* Mark all present */}
              {!isLocked && (
                <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
                  <Ionicons name="checkmark-done" size={18} color={COLORS.success.main} />
                  <Text style={styles.markAllText}>Mark all present</Text>
                </TouchableOpacity>
              )}

              {/* Student rows */}
              {rosterMembers.map((m) => (
                <StudentRowWrapper
                  key={m.userId}
                  userId={m.userId}
                  status={statusMap[m.userId] || 'present'}
                  onToggle={(s) => toggleStatus(m.userId, s)}
                  disabled={isLocked}
                />
              ))}

              {/* Submit button */}
              {!isLocked && (
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!isOnline || isSubmitting) && styles.submitDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isOnline || isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                      <Text style={styles.submitText}>
                        {isOnline ? 'Submit Attendance' : 'Offline — Submit disabled'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}

      {/* History link */}
      <Link href="/(teacher)/attendance/history" asChild>
        <TouchableOpacity style={styles.historyLink}>
          <Ionicons name="time-outline" size={18} color={COLORS.primary[600]} />
          <Text style={styles.historyText}>View attendance history</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

/**
 * Wrapper that fetches user profile for the StudentRow component.
 */
function StudentRowWrapper({
  userId,
  status,
  onToggle,
  disabled,
}: {
  userId: string;
  status: AttendanceStatus;
  onToggle: (s: AttendanceStatus) => void;
  disabled: boolean;
}) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserProfile(userId),
  });

  return (
    <AttendanceStudentRow
      name={user?.name || userId}
      rollNo={user?.rollNo}
      status={status}
      onToggle={onToggle}
      disabled={disabled}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scroll: { padding: 16, paddingBottom: 40 },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary[50],
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateText: { fontSize: 14, fontWeight: '600', color: COLORS.primary[700] },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.background.tertiary,
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primary[600] },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  chipTextActive: { color: '#FFFFFF' },
  hint: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic' },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.success.light,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.success.main + '30',
  },
  submittedText: { fontSize: 14, fontWeight: '600', color: COLORS.success.dark },
  empty: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyText: { fontSize: 15, color: COLORS.text.secondary },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success.main + '40',
    backgroundColor: COLORS.success.light,
  },
  markAllText: { fontSize: 14, fontWeight: '600', color: COLORS.success.dark },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 20,
  },
  historyText: { fontSize: 14, fontWeight: '500', color: COLORS.primary[600] },
});
