import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '@/services/user.service';
import { listClasses } from '@/services/class.service';
import { getClassSubjects } from '@/services/assignment.service';
import { SUBJECT_LABELS, type Subject } from '@/constants/subjects';
import { SubjectPill } from '@/components/ui/SubjectPill';
import { COLORS } from '@/constants/colors';
import type { CreateStudentPayload } from '@/types/user.types';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  rollNo: z.string().min(1, 'Roll number is required'),
  parentPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateStudentScreen() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', rollNo: '', parentPhone: '' },
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses(),
  });

  // Fetch subjects that have a teacher assigned in the selected class
  const classSubjectsQuery = useQuery({
    queryKey: ['classSubjects', selectedClassId],
    queryFn: () => getClassSubjects(selectedClassId),
    enabled: !!selectedClassId,
  });

  const availableSubjects = useMemo(() => {
    if (!classSubjectsQuery.data?.items) return [];
    return classSubjectsQuery.data.items.map((item) => item.subject as Subject);
  }, [classSubjectsQuery.data]);

  const mutation = useMutation({
    mutationFn: (data: CreateStudentPayload) => createStudent(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert(
        'Student Created',
        `${result.message}\n\nTemporary password: ${result.tempPassword}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to create student');
    },
  });

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const selectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjects([]); // Reset subjects when class changes
  };

  const onSubmit = (data: FormData) => {
    if (!selectedClassId) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    mutation.mutate({
      ...data,
      classId: selectedClassId,
      subjects: selectedSubjects,
    });
  };

  const classes = classesQuery.data?.items || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>New Student</Text>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full name"
              placeholderTextColor={COLORS.text.tertiary}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email *</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="student@example.com"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Roll Number */}
      <View style={styles.field}>
        <Text style={styles.label}>Roll Number *</Text>
        <Controller
          control={control}
          name="rollNo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.rollNo && styles.inputError]}
              placeholder="e.g. 01"
              placeholderTextColor={COLORS.text.tertiary}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.rollNo && <Text style={styles.error}>{errors.rollNo.message}</Text>}
      </View>

      {/* Parent Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Parent Phone</Text>
        <Controller
          control={control}
          name="parentPhone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Class Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.classId}
              style={[styles.chip, selectedClassId === cls.classId && styles.chipActive]}
              onPress={() => selectClass(cls.classId)}
            >
              <Text style={[
                styles.chipText,
                selectedClassId === cls.classId && styles.chipTextActive,
              ]}>
                {cls.name} {cls.section}
              </Text>
            </TouchableOpacity>
          ))}
          {classes.length === 0 && (
            <Text style={styles.hint}>No classes created yet</Text>
          )}
        </ScrollView>
      </View>

      {/* Subject Enrollment */}
      {selectedClassId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Subject Enrollment
            {availableSubjects.length > 0 && (
              <Text style={styles.subCount}> ({selectedSubjects.length} selected)</Text>
            )}
          </Text>

          {classSubjectsQuery.isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary[600]} />
          ) : availableSubjects.length === 0 ? (
            <View style={styles.noSubjects}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.warning.main} />
              <Text style={styles.noSubjectsText}>
                No teachers assigned to this class yet. Assign teachers first.
              </Text>
            </View>
          ) : (
            <View style={styles.subjectGrid}>
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subjectChip, isSelected && styles.subjectChipActive]}
                    onPress={() => toggleSubject(sub)}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary[600]} />
                    )}
                    <Text style={[
                      styles.subjectChipText,
                      isSelected && styles.subjectChipTextActive,
                    ]}>
                      {SUBJECT_LABELS[sub]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Selected subjects as pills */}
          {selectedSubjects.length > 0 && (
            <View style={styles.pillRow}>
              {selectedSubjects.map((sub) => (
                <SubjectPill key={sub} subject={sub} size="sm" />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, mutation.isPending && styles.submitDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={mutation.isPending}
        activeOpacity={0.8}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Create Student</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: COLORS.text.primary, marginBottom: 20 },
  field: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  input: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  inputError: { borderColor: COLORS.error.main },
  error: { fontSize: 12, color: COLORS.error.main },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 10 },
  subCount: { fontSize: 14, fontWeight: '500', color: COLORS.text.secondary },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    marginRight: 8,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: COLORS.primary[600] },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.text.secondary },
  chipTextActive: { color: '#FFFFFF' },
  hint: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subjectChipActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  subjectChipText: { fontSize: 13, fontWeight: '500', color: COLORS.text.secondary },
  subjectChipTextActive: { color: COLORS.primary[700] },
  noSubjects: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warning.light,
    padding: 12,
    borderRadius: 10,
  },
  noSubjectsText: { flex: 1, fontSize: 13, color: COLORS.warning.dark },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  submitBtn: {
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
