import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassAttendance,
  getStudentAttendance,
  submitAttendance,
} from '@/services/attendance.service';
import type { AttendanceStatus, SubmitAttendancePayload } from '@/types/attendance.types';

/**
 * Hook for class attendance on a specific date.
 * Returns existing records (if already submitted) + submit mutation.
 */
export function useClassAttendance(classId: string | undefined, date: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: () => getClassAttendance(classId!, date),
    enabled: !!classId && !!date,
  });

  const mutation = useMutation({
    mutationFn: (records: Record<string, AttendanceStatus>) =>
      submitAttendance({ classId: classId!, date, records }),
    onSuccess: () => {
      // Refetch to get the locked records
      queryClient.invalidateQueries({ queryKey: ['attendance', classId, date] });
    },
  });

  const alreadySubmitted = (query.data?.items?.length ?? 0) > 0 &&
    query.data?.items.some((r) => r.sessionLocked);

  return {
    records: query.data?.items ?? [],
    isLoading: query.isLoading,
    alreadySubmitted,
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
    submitSuccess: mutation.isSuccess,
    refetch: query.refetch,
  };
}

/**
 * Hook for student's own attendance history.
 */
export function useStudentAttendance(studentId: string | undefined) {
  return useQuery({
    queryKey: ['studentAttendance', studentId],
    queryFn: () => getStudentAttendance(studentId!),
    enabled: !!studentId,
  });
}
