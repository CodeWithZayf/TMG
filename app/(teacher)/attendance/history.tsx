import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getTeacherAssignments } from '@/services/assignment.service';
import { getClassAttendance } from '@/services/attendance.service';
import { AttendanceSummary } from '@/components/attendance/AttendanceSummary';
import { COLORS } from '@/constants/colors';
import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance.types';

/**
 * Generate last 30 days as YYYY-MM-DD strings.
 */
function getLast30Days(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

interface DateRowProps {
  date: string;
  classId: string;
}

function DateRow({ date, classId }: DateRowProps) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: () => getClassAttendance(classId, date),
    enabled: expanded,
  });

  const records = data?.items || [];
  const summary = useMemo(() => {
    return {
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
    };
  }, [records]);

  const total = summary.present + summary.absent + summary.late;
  const dateObj = new Date(date + 'T00:00:00');

  return (
    <View style={styles.dateCard}>
      <TouchableOpacity
        style={styles.dateHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.dateInfo}>
          <Text style={styles.dateDay}>
            {dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}
          </Text>
          <Text style={styles.dateLabel}>
            {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.text.tertiary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dateExpanded}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary[600]} style={{ padding: 12 }} />
          ) : total === 0 ? (
            <Text style={styles.noData}>No attendance recorded</Text>
          ) : (
            <AttendanceSummary
              present={summary.present}
              absent={summary.absent}
              late={summary.late}
            />
          )}
        </View>
      )}
    </View>
  );
}

export default function AttendanceHistoryScreen() {
  const userId = useAuthStore((s) => s.userId);
  const [selectedClassId, setSelectedClassId] = useState('');

  const assignmentsQuery = useQuery({
    queryKey: ['teacherAssignments', userId],
    queryFn: () => getTeacherAssignments(userId!),
    enabled: !!userId,
  });

  const uniqueClasses = useMemo(() => {
    const items = assignmentsQuery.data?.items || [];
    const seen = new Set<string>();
    return items.filter((a) => {
      if (seen.has(a.classId)) return false;
      seen.add(a.classId);
      return true;
    });
  }, [assignmentsQuery.data]);

  const dates = useMemo(() => getLast30Days(), []);

  return (
    <View style={styles.container}>
      {/* Class picker */}
      <View style={styles.pickerSection}>
        <Text style={styles.label}>Select Class</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={uniqueClasses}
          keyExtractor={(item) => item.classId}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item: a }) => (
            <TouchableOpacity
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
          )}
          ListEmptyComponent={
            assignmentsQuery.isLoading
              ? <ActivityIndicator size="small" color={COLORS.primary[600]} />
              : <Text style={styles.hint}>No classes assigned</Text>
          }
        />
      </View>

      {/* Date list */}
      {selectedClassId ? (
        <FlatList
          data={dates}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <DateRow date={item} classId={selectedClassId} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.noData}>No dates to show</Text>
          }
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.text.tertiary} />
          <Text style={styles.emptyText}>Select a class to view history</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  pickerSection: { padding: 16, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 8 },
  chipRow: { gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.background.tertiary,
  },
  chipActive: { backgroundColor: COLORS.primary[600] },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },
  chipTextActive: { color: '#FFFFFF' },
  hint: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic' },
  list: { padding: 12, paddingBottom: 40, gap: 8 },
  dateCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  dateInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  dateDay: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, width: 36 },
  dateLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  dateExpanded: { paddingHorizontal: 14, paddingBottom: 14 },
  noData: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic', padding: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.text.secondary },
});
