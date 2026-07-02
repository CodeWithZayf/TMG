import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface AttendanceSummaryProps {
  present: number;
  absent: number;
  late: number;
}

/**
 * Present/Absent/Late count bar with proportional color segments.
 */
export function AttendanceSummary({ present, absent, late }: AttendanceSummaryProps) {
  const total = present + absent + late;
  if (total === 0) return null;

  const pPct = (present / total) * 100;
  const aPct = (absent / total) * 100;
  const lPct = (late / total) * 100;

  return (
    <View style={styles.container}>
      {/* Proportion bar */}
      <View style={styles.bar}>
        {pPct > 0 && (
          <View style={[styles.segment, { flex: pPct, backgroundColor: COLORS.attendance.present, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
        )}
        {lPct > 0 && (
          <View style={[styles.segment, { flex: lPct, backgroundColor: COLORS.attendance.late }]} />
        )}
        {aPct > 0 && (
          <View style={[styles.segment, { flex: aPct, backgroundColor: COLORS.attendance.absent, borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.attendance.present }]} />
          <Text style={styles.legendText}>Present {present}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.attendance.late }]} />
          <Text style={styles.legendText}>Late {late}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.attendance.absent }]} />
          <Text style={styles.legendText}>Absent {absent}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.background.tertiary,
  },
  segment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
