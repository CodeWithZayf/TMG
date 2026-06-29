import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

/**
 * Teacher role layout — placeholder until Milestone 5 adds tab navigation.
 */
export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary[600] },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}
