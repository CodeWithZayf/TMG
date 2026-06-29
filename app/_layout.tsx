import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { getCurrentSession } from '@/services/auth.service';
import { getCurrentRole } from '@/utils/auth';
import { apiGet } from '@/services/api';
import { COLORS } from '@/constants/colors';
import { logError } from '@/utils/log';
import type { User } from '@/types/user.types';

// Import Amplify config to ensure it runs on app start
import '@/services/aws-config';

// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Auth guard — protects role routes from unauthenticated deep-link access.
 * Runs on every navigation segment change.
 */
function useProtectedRoute() {
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (session) {
          const userRole = await getCurrentRole();
          const user = await apiGet<User>('/users/me');
          setUser(user.userId, user.name, userRole);
        }
      } catch {
        // No valid session — that's fine, guard will redirect
      } finally {
        setIsReady(true);
      }
    }

    if (!isAuthenticated) {
      checkSession();
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, setUser]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inTeacherGroup = segments[0] === '(teacher)';
    const inStudentGroup = segments[0] === '(student)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated and trying to access protected route → redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but on auth screen → redirect to correct role
      if (role === 'admin') router.replace('/(admin)');
      else if (role === 'teacher') router.replace('/(teacher)');
      else router.replace('/(student)');
    } else if (isAuthenticated) {
      // Authenticated — verify they're in the correct role group
      if (role === 'admin' && !inAdminGroup && segments[0] !== undefined) {
        router.replace('/(admin)');
      } else if (role === 'teacher' && !inTeacherGroup && segments[0] !== undefined) {
        router.replace('/(teacher)');
      } else if (role === 'student' && !inStudentGroup && segments[0] !== undefined) {
        router.replace('/(student)');
      }
    }
  }, [isReady, isAuthenticated, role, segments]);

  return isReady;
}

export default function RootLayout() {
  const setOnline = useAppStore((s) => s.setOnline);
  const isReady = useProtectedRoute();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, [setOnline]);

  // Show loading while checking auth
  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F9FAFB' },
        }}
      />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
});
