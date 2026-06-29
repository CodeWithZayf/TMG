import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

/**
 * Admin role layout — placeholder until Milestone 4 adds tab navigation.
 */
export default function AdminLayout() {
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
