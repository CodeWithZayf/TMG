import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { SUBJECT_LABELS, type Subject } from '@/constants/subjects';
import { getSubjectColor } from '@/constants/colors';

interface SubjectPillProps {
  subject: Subject;
  size?: 'sm' | 'md';
}

export function SubjectPill({ subject, size = 'sm' }: SubjectPillProps) {
  const color = getSubjectColor(subject);
  const label = SUBJECT_LABELS[subject] ?? subject;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `${color}18` }, // 10% opacity
        size === 'md' && styles.containerMd,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color },
          size === 'md' && styles.labelMd,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  } as ViewStyle,
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  } as ViewStyle,
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  } as ViewStyle,
  label: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  labelMd: {
    fontSize: 14,
  } as TextStyle,
});
