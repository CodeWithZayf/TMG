import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import type { AttendanceStatus } from '@/types/attendance.types';

interface StudentRowProps {
  name: string;
  rollNo?: string;
  status: AttendanceStatus;
  onToggle: (status: AttendanceStatus) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  present: { label: 'P', color: COLORS.attendance.present, bg: '#D1FAE5' },
  absent:  { label: 'A', color: COLORS.attendance.absent,  bg: '#FEE2E2' },
  late:    { label: 'L', color: COLORS.attendance.late,    bg: '#FEF3C7' },
};

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

/**
 * Student row with 3-way status toggle: Present / Absent / Late.
 */
export function AttendanceStudentRow({ name, rollNo, status, onToggle, disabled }: StudentRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {rollNo && <Text style={styles.roll}>Roll #{rollNo}</Text>}
      </View>
      <View style={styles.toggles}>
        {STATUSES.map((s) => {
          const config = STATUS_CONFIG[s];
          const isActive = status === s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.toggle,
                isActive && { backgroundColor: config.bg, borderColor: config.color },
              ]}
              onPress={() => onToggle(s)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.toggleText,
                isActive && { color: config.color, fontWeight: '800' },
              ]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  info: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  roll: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  toggles: {
    flexDirection: 'row',
    gap: 6,
  },
  toggle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.tertiary,
  },
});
