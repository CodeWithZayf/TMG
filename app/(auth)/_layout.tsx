import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth group layout — headerless stack for login and OTP screens.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
